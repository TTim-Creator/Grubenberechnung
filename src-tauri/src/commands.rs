use serde::{Deserialize, Serialize};
use tauri::command;

const KEYGEN_ACCOUNT: &str = "a5a099da-5c45-43f3-a25e-39a91ec97a06";

#[derive(Serialize, Deserialize, Debug)]
pub struct LizenzValidierungErgebnis {
    pub gueltig: bool,
    pub lizenz_id: Option<String>,
    pub fehler: Option<String>,
}

/// Generiert einen Hardware-Fingerprint
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

/// Validiert einen Lizenzschlüssel online gegen Keygen.sh
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
        return Ok(LizenzValidierungErgebnis {
            gueltig: false,
            lizenz_id: None,
            fehler: Some(msg),
        });
    }

    let valid = json["meta"]["valid"].as_bool().unwrap_or(false);
    let code = json["meta"]["code"].as_str().unwrap_or("INVALID");
    let lizenz_id = json["data"]["id"].as_str().map(|s| s.to_string());

    // NO_MACHINE = Schlüssel korrekt, aber noch keine Maschine registriert → aktivieren
    let needs_activation = !valid && code == "NO_MACHINE";

    if !valid && !needs_activation {
        return Ok(LizenzValidierungErgebnis {
            gueltig: false,
            lizenz_id: None,
            fehler: Some(format!("Lizenz ungültig: {}", code)),
        });
    }

    // Maschine aktivieren (beim ersten Mal oder wenn NO_MACHINE)
    let activate_url = format!(
        "https://api.keygen.sh/v1/accounts/{}/machines",
        KEYGEN_ACCOUNT
    );

    let activate_body = serde_json::json!({
        "data": {
            "type": "machines",
            "attributes": { "fingerprint": fingerprint, "name": "Grubenberechnung PC" },
            "relationships": {
                "license": { "data": { "type": "licenses", "id": lizenz_id } }
            }
        }
    });

    let activate_resp = client
        .post(&activate_url)
        .header("Content-Type", "application/vnd.api+json")
        .header("Accept", "application/vnd.api+json")
        .header("Authorization", format!("License {}", lizenz_key))
        .json(&activate_body)
        .send()
        .await;

    if needs_activation {
        // Nach Maschinenaktivierung: prüfen ob erfolgreich
        match activate_resp {
            Ok(r) if r.status().is_success() => {}
            Ok(r) => {
                let err_json: serde_json::Value = r.json().await.unwrap_or_default();
                let msg = err_json["errors"][0]["detail"]
                    .as_str()
                    .unwrap_or("Aktivierung fehlgeschlagen")
                    .to_string();
                return Ok(LizenzValidierungErgebnis {
                    gueltig: false,
                    lizenz_id: None,
                    fehler: Some(msg),
                });
            }
            Err(e) => {
                return Ok(LizenzValidierungErgebnis {
                    gueltig: false,
                    lizenz_id: None,
                    fehler: Some(format!("Netzwerkfehler: {}", e)),
                });
            }
        }
    }

    Ok(LizenzValidierungErgebnis {
        gueltig: true,
        lizenz_id: json["data"]["id"].as_str().map(|s| s.to_string()),
        fehler: None,
    })
}

/// Stille Hintergrundprüfung alle 30 Tage
#[command]
pub async fn check_license_background(lizenz_key: String) -> bool {
    let client = reqwest::Client::new();
    let url = format!(
        "https://api.keygen.sh/v1/accounts/{}/licenses/actions/validate-key",
        KEYGEN_ACCOUNT
    );
    let body = serde_json::json!({ "meta": { "key": lizenz_key } });
    match client
        .post(&url)
        .header("Content-Type", "application/vnd.api+json")
        .json(&body)
        .send()
        .await
    {
        Ok(resp) => {
            if let Ok(json) = resp.json::<serde_json::Value>().await {
                return json["meta"]["valid"].as_bool().unwrap_or(false);
            }
            false
        }
        Err(_) => true, // Kein Internet → als gültig behandeln
    }
}
