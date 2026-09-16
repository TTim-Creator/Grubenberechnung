use hmac::{Hmac, Mac};
use serde::{Deserialize, Serialize};
use sha2::Sha256;
use tauri::command;

type HmacSha256 = Hmac<Sha256>;

const KEYGEN_ACCOUNT: &str = "a5a099da-5c45-43f3-a25e-39a91ec97a06";

// HMAC-Secret zur Compile-Zeit aus der Umgebung (CI setzt GRUBEN_HMAC_SECRET
// aus einem GitHub Secret). Der Fallback gilt nur für lokale Dev-Builds —
// damit signierte Tokens aus Dev-Builds in Release-Builds NICHT gültig sind.
const HMAC_SECRET: &str = match option_env!("GRUBEN_HMAC_SECRET") {
    Some(s) => s,
    None => "dev-secret-nur-fuer-lokale-builds",
};

/// Offline-Gnadenfrist: solange darf die App ohne erfolgreichen
/// Online-Check weiterlaufen, sofern das lokale Token gültig ist.
const GNADENFRIST_SEK: i64 = 14 * 24 * 60 * 60; // 14 Tage

#[derive(Serialize, Deserialize, Debug)]
pub struct LizenzValidierungErgebnis {
    pub gueltig: bool,
    pub token: Option<String>, // HMAC-signiertes Token für lokale Verifikation
    pub fehler: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct StartupCheck {
    pub gueltig: bool,
    pub grund: String, // "online_ok" | "grace_period" | "online_ungueltig:*" | "token_ungueltig" | "abgelaufen" | "kein_token"
    pub neues_token: Option<String>, // gesetzt wenn das Token nach Online-OK neu signiert wurde
}

// ── HMAC-Token Generierung & Prüfung ─────────────────────────────────────────

fn hex_encode(bytes: &[u8]) -> String {
    bytes.iter().map(|b| format!("{b:02x}")).collect()
}

fn hmac_sign(data: &[u8]) -> String {
    let mut mac = HmacSha256::new_from_slice(HMAC_SECRET.as_bytes())
        .expect("HMAC akzeptiert Keys beliebiger Länge");
    mac.update(data);
    hex_encode(&mac.finalize().into_bytes())
}

pub fn erzeuge_token(lizenz_key: &str, fingerprint: &str) -> String {
    let data = format!("{lizenz_key}:{fingerprint}:GUELTIG");
    let sig = hmac_sign(data.as_bytes());
    format!(
        "GBv2:{}:{}:{}",
        &lizenz_key[..8.min(lizenz_key.len())],
        fingerprint.len(),
        sig
    )
}

pub fn verifiziere_token(token: &str, lizenz_key: &str, fingerprint: &str) -> bool {
    let expected = erzeuge_token(lizenz_key, fingerprint);
    // Constant-time Vergleich über den gesamten Token
    if token.len() != expected.len() {
        return false;
    }
    token
        .bytes()
        .zip(expected.bytes())
        .fold(0u8, |acc, (a, b)| acc | (a ^ b))
        == 0
}

// ── Hardware Fingerprint ──────────────────────────────────────────────────────

/// Hostname-basierter Fingerprint (wie vor der machine-uid-Umstellung).
/// WICHTIG: Bereits bei Keygen aktivierte Lizenzen sind an dieses Format
/// gebunden (fingerprint scope). Eine Änderung des Algorithmus macht alle
/// bestehenden Aktivierungen ungültig (FINGERPRINT_SCOPE_MISMATCH) — daher
/// NICHT ohne Migration der bereits registrierten Maschinen bei Keygen ändern.
#[command]
pub fn get_fingerprint() -> String {
    use std::collections::hash_map::DefaultHasher;
    use std::hash::{Hash, Hasher};

    let hostname = hostname::get()
        .map(|h| h.to_string_lossy().to_string())
        .unwrap_or_else(|_| "unknown".to_string());
    let platform = std::env::consts::OS.to_string();
    let arch = std::env::consts::ARCH.to_string();

    let combined = format!("{hostname}-{platform}-{arch}");
    let mut hasher = DefaultHasher::new();
    combined.hash(&mut hasher);
    let hash = hasher.finish();
    format!("{combined}-{hash:x}")
}

// ── Startup-Lizenzprüfung (Rust-seitig, nicht umgehbar durch DB-Manipulation) ─

/// Prüft die Lizenz beim App-Start. JS erhält nur das Ergebnis — nie den DB-Status direkt.
/// Ablauf:
///   1. Token-Signatur mit HMAC prüfen (schlägt fehl wenn DB manipuliert oder Secret rotiert)
///   2. Online-Check gegen Keygen (Timeout 8 Sekunden)
///   3. Online OK + Token war ungültig → Token neu signieren (Selbstheilung nach Secret-Rotation)
///   4. Offline: Gnadenfrist von 14 Tagen seit letztem Online-Check, nur bei gültigem Token
#[command]
pub async fn startup_lizenz_check(
    token: String,
    lizenz_key: String,
    fingerprint: String,
    letzter_online_check_iso: String,
) -> Result<StartupCheck, String> {
    if token.is_empty() {
        return Ok(StartupCheck {
            gueltig: false,
            grund: "kein_token".into(),
            neues_token: None,
        });
    }

    let token_ok = verifiziere_token(&token, &lizenz_key, &fingerprint);

    // Zeitdifferenz für Gnadenfrist-Logik im Offline-Fall berechnen
    let jetzt = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs() as i64;
    let letzter_check_sek = letzter_online_check_iso.parse::<i64>().unwrap_or(0);
    let delta_sek = jetzt - letzter_check_sek;

    // Online-Check durchführen (Timeout 8 Sekunden)
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(8))
        .build()
        .map_err(|e| e.to_string())?;

    let url = format!(
        "https://api.keygen.sh/v1/accounts/{}/licenses/actions/validate-key",
        KEYGEN_ACCOUNT
    );

    let body = serde_json::json!({
        "meta": {
            "key": lizenz_key,
            "scope": { "fingerprint": fingerprint }
        }
    });

    match client
        .post(&url)
        .header("Content-Type", "application/vnd.api+json")
        .header("Accept", "application/vnd.api+json")
        .json(&body)
        .send()
        .await
    {
        Ok(resp) => {
            let json: serde_json::Value = resp.json().await.unwrap_or_default();
            let valid = json["meta"]["valid"].as_bool().unwrap_or(false);

            if valid {
                // Selbstheilung: Server bestätigt die Lizenz — war das lokale Token
                // ungültig (z. B. nach Secret-Rotation), wird es neu signiert.
                let neues_token =
                    (!token_ok).then(|| erzeuge_token(&lizenz_key, &fingerprint));
                Ok(StartupCheck {
                    gueltig: true,
                    grund: "online_ok".into(),
                    neues_token,
                })
            } else {
                let code = json["meta"]["code"].as_str().unwrap_or("INVALID");
                Ok(StartupCheck {
                    gueltig: false,
                    grund: format!("online_ungueltig:{code}"),
                    neues_token: None,
                })
            }
        }
        Err(_) => {
            // Kein Internet: Gnadenfrist nur mit gültigem lokalen Token
            if !token_ok {
                Ok(StartupCheck {
                    gueltig: false,
                    grund: "token_ungueltig".into(), // DB manipuliert oder Secret rotiert
                    neues_token: None,
                })
            } else if delta_sek < GNADENFRIST_SEK {
                Ok(StartupCheck {
                    gueltig: true,
                    grund: "grace_period".into(),
                    neues_token: None,
                })
            } else {
                Ok(StartupCheck {
                    gueltig: false,
                    grund: "abgelaufen".into(),
                    neues_token: None,
                })
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn token_roundtrip_gueltig() {
        let token = erzeuge_token("ABCD-1234-EFGH", "gb-deadbeef");
        assert!(verifiziere_token(&token, "ABCD-1234-EFGH", "gb-deadbeef"));
    }

    #[test]
    fn token_falscher_key_ungueltig() {
        let token = erzeuge_token("ABCD-1234-EFGH", "gb-deadbeef");
        assert!(!verifiziere_token(&token, "XXXX-0000-YYYY", "gb-deadbeef"));
    }

    #[test]
    fn token_falscher_fingerprint_ungueltig() {
        let token = erzeuge_token("ABCD-1234-EFGH", "gb-deadbeef");
        assert!(!verifiziere_token(&token, "ABCD-1234-EFGH", "gb-cafebabe"));
    }

    #[test]
    fn token_manipulation_ungueltig() {
        let mut token = erzeuge_token("ABCD-1234-EFGH", "gb-deadbeef");
        let letztes = token.pop().unwrap();
        token.push(if letztes == 'a' { 'b' } else { 'a' });
        assert!(!verifiziere_token(&token, "ABCD-1234-EFGH", "gb-deadbeef"));
    }

    #[test]
    fn fingerprint_ist_stabil() {
        assert_eq!(get_fingerprint(), get_fingerprint());
    }
}

// ── Online-Aktivierung ────────────────────────────────────────────────────────

#[command]
pub async fn validate_license_online(
    lizenz_key: String,
    fingerprint: String,
) -> Result<LizenzValidierungErgebnis, String> {
    let client = reqwest::Client::new();

    let validate_url = format!(
        "https://api.keygen.sh/v1/accounts/{}/licenses/actions/validate-key",
        KEYGEN_ACCOUNT
    );

    let body = serde_json::json!({
        "meta": {
            "key": lizenz_key,
            "scope": { "fingerprint": fingerprint }
        }
    });

    let resp = client
        .post(&validate_url)
        .header("Content-Type", "application/vnd.api+json")
        .header("Accept", "application/vnd.api+json")
        .json(&body)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let status = resp.status();
    let json: serde_json::Value = resp.json().await.map_err(|e| e.to_string())?;

    if !status.is_success() {
        let msg = json["errors"][0]["detail"]
            .as_str()
            .unwrap_or("Unbekannter Fehler")
            .to_string();
        return Ok(LizenzValidierungErgebnis { gueltig: false, token: None, fehler: Some(msg) });
    }

    let valid = json["meta"]["valid"].as_bool().unwrap_or(false);
    let code = json["meta"]["code"].as_str().unwrap_or("INVALID");
    let lizenz_id = json["data"]["id"].as_str().map(|s| s.to_string());
    let needs_activation = !valid && code == "NO_MACHINE";

    if !valid && !needs_activation {
        return Ok(LizenzValidierungErgebnis {
            gueltig: false, token: None,
            fehler: Some(format!("Lizenz ungültig: {code}")),
        });
    }

    // Maschine aktivieren
    let activate_url = format!("https://api.keygen.sh/v1/accounts/{}/machines", KEYGEN_ACCOUNT);
    let activate_body = serde_json::json!({
        "data": {
            "type": "machines",
            "attributes": { "fingerprint": fingerprint, "name": "Grubenberechnung PC" },
            "relationships": { "license": { "data": { "type": "licenses", "id": lizenz_id } } }
        }
    });

    let activate_resp = client
        .post(&activate_url)
        .header("Content-Type", "application/vnd.api+json")
        .header("Accept", "application/vnd.api+json")
        .header("Authorization", format!("License {lizenz_key}"))
        .json(&activate_body)
        .send()
        .await;

    if needs_activation {
        match activate_resp {
            Ok(r) if r.status().is_success() => {}
            Ok(r) => {
                let err: serde_json::Value = r.json().await.unwrap_or_default();
                let msg = err["errors"][0]["detail"].as_str()
                    .unwrap_or("Aktivierung fehlgeschlagen").to_string();
                return Ok(LizenzValidierungErgebnis { gueltig: false, token: None, fehler: Some(msg) });
            }
            Err(e) => return Ok(LizenzValidierungErgebnis {
                gueltig: false, token: None,
                fehler: Some(format!("Netzwerkfehler: {e}")),
            }),
        }
    }

    // HMAC-Token generieren — wird in DB gespeichert statt "aktiv"
    let token = erzeuge_token(&lizenz_key, &fingerprint);

    Ok(LizenzValidierungErgebnis { gueltig: true, token: Some(token), fehler: None })
}
