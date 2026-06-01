# Grubenberechnung Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tauri 2 Desktop-App für Tiefbau-Grubenfaktor-Berechnung mit SQLite-Datenbank und Keygen.sh Online-Lizenzierung.

**Architecture:** React-Frontend kommuniziert mit SQLite über `tauri-plugin-sql` direkt aus dem Browser-Context. Rust-Backend stellt zwei Commands bereit: Hardware-Fingerprint-Generierung und Keygen.sh-Lizenzvalidierung via HTTP. Die Faktor-Berechnungslogik lebt als pure TypeScript-Funktionen und ist vollständig mit Vitest getestet.

**Tech Stack:** Tauri 2, React 18, TypeScript, Tailwind CSS, shadcn/ui, tauri-plugin-sql (SQLite), reqwest (Rust HTTP), Vitest

---

## Keygen.sh IDs (eingebaut)

```
ACCOUNT_ID = a5a099da-5c45-43f3-a25e-39a91ec97a06
PRODUCT_ID = 6f85fd5b-01f7-490c-8b51-c8666fc24a9e
POLICY_ID  = 5094cdf4-df33-44d1-ac4e-f038792c3db0
```

---

## File Map

```
grubenberechnung/
├── src-tauri/
│   ├── Cargo.toml                 # Rust deps: tauri, tauri-plugin-sql, reqwest, serde, uuid
│   ├── tauri.conf.json            # App-Name, Icons, Window-Config
│   └── src/
│       ├── main.rs                # Tauri App entry, plugin registration
│       ├── lib.rs                 # Tauri commands: get_fingerprint, validate_license, check_license_online
│       └── db.rs                 # DB migration SQL constants
├── src/
│   ├── main.tsx                   # React entry
│   ├── App.tsx                    # Root: License gate → Main app
│   ├── types/
│   │   └── index.ts              # Auftrag, Berechnung, Einstellungen, LizenzStatus
│   ├── lib/
│   │   ├── calc.ts               # berechneB(), berechneT(), berechne() — pure functions
│   │   ├── calc.test.ts          # Vitest tests für calc.ts
│   │   ├── db.ts                 # SQL wrapper: alle DB-Operationen
│   │   └── license.ts            # Lizenzstatus lesen/schreiben (lokale DB)
│   ├── hooks/
│   │   ├── useEinstellungen.ts   # Settings laden/speichern
│   │   ├── useAuftraege.ts       # Aufträge CRUD
│   │   └── useBerechnungen.ts    # Berechnungen CRUD
│   ├── components/
│   │   ├── Layout.tsx            # Sidebar + Detail Shell
│   │   ├── Sidebar.tsx           # Auftragsliste + Neuer-Auftrag-Button
│   │   ├── AuftragModal.tsx      # Dialog: Neuen Auftrag anlegen
│   │   ├── AuftragDetail.tsx     # Rechte Seite: Header + Berechnungsliste
│   │   ├── BerechnungRow.tsx     # Eine Zeile: Maße + Faktor-Chips
│   │   ├── BerechnungForm.tsx    # Eingabe + Live-Vorschau
│   │   ├── EinstellungenView.tsx # Settings-Screen (4 Felder + Formel)
│   │   └── LizenzView.tsx        # Erster-Start Aktivierungsscreen
│   └── index.css                 # Tailwind + CSS-Variablen für Dark-Theme
├── package.json
├── vite.config.ts
└── tailwind.config.ts
```

---

## Task 1: Projektsetup — Tauri 2 + React + TypeScript

**Files:**
- Create: `package.json`, `vite.config.ts`, `src-tauri/Cargo.toml`, `src-tauri/tauri.conf.json`

- [ ] **Schritt 1: Voraussetzungen prüfen**

```bash
node --version   # >= 18
rustc --version  # >= 1.70
cargo --version
```

Falls Rust fehlt: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`

- [ ] **Schritt 2: Tauri 2 Projekt erstellen**

```bash
cd /Users/timteufl/Documents/GitHub/Grubenberechnung
npm create tauri-app@latest . -- --template react-ts --manager npm
```

Bei der Abfrage nach Projekt-Identifier: `com.grubenberechnung.app`

- [ ] **Schritt 3: Frontend-Abhängigkeiten installieren**

```bash
npm install
npm install tailwindcss @tailwindcss/vite clsx tailwind-merge
npm install lucide-react
npm install @tauri-apps/plugin-sql @tauri-apps/api
npm install -D vitest @vitest/ui jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom
```

- [ ] **Schritt 4: shadcn/ui initialisieren**

```bash
npx shadcn@latest init
```

Beim Dialog:
- Style: `Default`
- Base color: `Slate`
- CSS variables: `yes`

```bash
npx shadcn@latest add button input label dialog separator badge scroll-area
```

- [ ] **Schritt 5: Tailwind konfigurieren**

Ersetze `tailwind.config.ts` komplett:

```typescript
import type { Config } from 'tailwindcss'

export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background:  '#0a0f1e',
        sidebar:     '#080d1a',
        card:        '#080d1a',
        border:      '#0d1830',
        foreground:  '#e2e8f0',
        muted:       '#94a3b8',
        'muted-foreground': '#475569',
        accent:      '#3b82f6',
        'accent-hover': '#2563eb',
        'accent-dim':   '#1e3a5f',
        'accent-light': '#60a5fa',
        success:     '#22c55e',
        'success-dim': '#0d2418',
        destructive: '#ef4444',
      },
      borderRadius: { DEFAULT: '0.5rem' },
    },
  },
  plugins: [],
} satisfies Config
```

- [ ] **Schritt 6: Globales CSS setzen**

Ersetze `src/index.css`:

```css
@import "tailwindcss";

:root {
  color-scheme: dark;
}

* {
  box-sizing: border-box;
}

body {
  background: #0a0f1e;
  color: #e2e8f0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  margin: 0;
  overflow: hidden;
}

::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #1e2a40; border-radius: 2px; }

input[type=number]::-webkit-inner-spin-button { opacity: 1; }
```

- [ ] **Schritt 7: vite.config.ts anpassen**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  clearScreen: false,
  server: { port: 1420, strictPort: true },
  envPrefix: ['VITE_', 'TAURI_'],
  build: { target: ['es2021', 'chrome100', 'safari13'], minify: !process.env.TAURI_DEBUG },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
  },
})
```

- [ ] **Schritt 8: Test-Setup Datei erstellen**

Erstelle `src/test-setup.ts`:
```typescript
import '@testing-library/jest-dom'
```

- [ ] **Schritt 9: tauri-plugin-sql zu Rust hinzufügen**

In `src-tauri/Cargo.toml` unter `[dependencies]` ergänzen:

```toml
tauri-plugin-sql = { version = "2", features = ["sqlite"] }
serde = { version = "1", features = ["derive"] }
serde_json = "1"
reqwest = { version = "0.12", features = ["json", "rustls-tls"], default-features = false }
uuid = { version = "1", features = ["v4"] }
tokio = { version = "1", features = ["full"] }
```

- [ ] **Schritt 10: Commit**

```bash
git add -A
git commit -m "chore: project setup Tauri 2 + React + shadcn/ui + Vitest"
```

---

## Task 2: TypeScript-Typen

**Files:**
- Create: `src/types/index.ts`

- [ ] **Schritt 1: Typdatei erstellen**

Erstelle `src/types/index.ts`:

```typescript
export interface Einstellungen {
  id: number
  std_breite: number   // cm, Standard-Breite der Referenzgrube
  std_tiefe: number    // cm, Standard-Tiefe der Referenzgrube
  b_einheit: number    // cm, Stufengröße für B-Faktor
  t_einheit: number    // cm, Stufengröße für T-Faktor
}

export interface Auftrag {
  id: number
  name: string
  adresse: string
  erstellt_am: string  // ISO 8601
}

export interface Berechnung {
  id: number
  auftrag_id: number
  breite: number       // cm
  tiefe: number        // cm
  b_faktor: number
  t_faktor: number
  erstellt_am: string
}

export type LizenzStatus = 'inaktiv' | 'aktiv' | 'widerrufen'

export interface LizenzRecord {
  id: number
  lizenz_key: string | null
  maschinen_id: string | null
  aktiviert_am: string | null
  letzter_check: string | null
  status: LizenzStatus
}

export interface BerechnungsEingabe {
  breite: number
  tiefe: number
}

export interface BerechnungsErgebnis {
  b_faktor: number
  t_faktor: number
}
```

- [ ] **Schritt 2: Commit**

```bash
git add src/types/index.ts
git commit -m "feat: TypeScript types for all domain entities"
```

---

## Task 3: Berechnungslogik (TDD)

**Files:**
- Create: `src/lib/calc.ts`
- Create: `src/lib/calc.test.ts`

- [ ] **Schritt 1: Failing Tests schreiben**

Erstelle `src/lib/calc.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { berechneB, berechneT, berechne } from './calc'

describe('berechneB — Breiten-Faktor', () => {
  it('gibt 0 wenn Breite gleich Standard', () => {
    expect(berechneB(15, 15, 15)).toBe(0)
  })
  it('gibt 0 wenn Breite kleiner als Standard', () => {
    expect(berechneB(10, 15, 15)).toBe(0)
  })
  it('gibt 1 für genau eine Einheit über Standard', () => {
    expect(berechneB(30, 15, 15)).toBe(1)  // (30-15)/15 = 1
  })
  it('ceiling: 1cm über Einheitsgrenze → Faktor 2', () => {
    expect(berechneB(31, 15, 15)).toBe(2)  // ceil(16/15) = 2
  })
  it('gibt 2 für zwei Einheiten über Standard', () => {
    expect(berechneB(45, 15, 15)).toBe(2)  // (45-15)/15 = 2
  })
  it('respektiert andere Einheitsgröße', () => {
    expect(berechneB(40, 15, 10)).toBe(3)  // ceil((40-15)/10) = 3
  })
})

describe('berechneT — Tiefen-Faktor', () => {
  it('gibt 0 wenn Tiefe gleich Standard', () => {
    expect(berechneT(45, 45, 15, 0)).toBe(0)
  })
  it('gibt 0 wenn Tiefe kleiner als Standard', () => {
    expect(berechneT(30, 45, 15, 0)).toBe(0)
  })
  it('B-Faktor wird NICHT addiert wenn raw_T = 0', () => {
    expect(berechneT(45, 45, 15, 1)).toBe(0)  // B=1 aber Tiefe=Standard → T=0
  })
  it('addiert B-Faktor wenn raw_T >= 1', () => {
    expect(berechneT(60, 45, 15, 1)).toBe(2)  // raw_T=1, B=1 → 1+1=2
  })
  it('ceiling: 1cm über Standard → raw_T = 1', () => {
    expect(berechneT(46, 45, 15, 0)).toBe(1)  // ceil(1/15)=1
  })
  it('kein B-Faktor wenn B=0 und raw_T>=1', () => {
    expect(berechneT(60, 45, 15, 0)).toBe(1)  // raw_T=1, B=0 → 1
  })
  it('B=2, raw_T=2 → T=4', () => {
    expect(berechneT(75, 45, 15, 2)).toBe(4)
  })
})

describe('berechne — Kombiniert', () => {
  it('Standardmaß → B:0 T:0', () => {
    const cfg = { std_breite: 15, std_tiefe: 45, b_einheit: 15, t_einheit: 15 }
    expect(berechne(15, 45, cfg)).toEqual({ b_faktor: 0, t_faktor: 0 })
  })
  it('30x60 mit Standard-Config → B:1 T:2', () => {
    const cfg = { std_breite: 15, std_tiefe: 45, b_einheit: 15, t_einheit: 15 }
    expect(berechne(30, 60, cfg)).toEqual({ b_faktor: 1, t_faktor: 2 })
  })
  it('45x75 → B:2 T:4', () => {
    const cfg = { std_breite: 15, std_tiefe: 45, b_einheit: 15, t_einheit: 15 }
    expect(berechne(45, 75, cfg)).toEqual({ b_faktor: 2, t_faktor: 4 })
  })
  it('30x45 → B:1 T:0 (nur Breite größer)', () => {
    const cfg = { std_breite: 15, std_tiefe: 45, b_einheit: 15, t_einheit: 15 }
    expect(berechne(30, 45, cfg)).toEqual({ b_faktor: 1, t_faktor: 0 })
  })
})
```

- [ ] **Schritt 2: Tests laufen lassen — müssen SCHEITERN**

```bash
npm run test -- src/lib/calc.test.ts
```

Erwartete Ausgabe: `Cannot find module './calc'`

- [ ] **Schritt 3: Implementierung schreiben**

Erstelle `src/lib/calc.ts`:

```typescript
import type { BerechnungsErgebnis, Einstellungen } from '@/types'

/** Breiten-Faktor: jede angefangene Einheit über Standard = +1 */
export function berechneB(breite: number, stdBreite: number, bEinheit: number): number {
  if (breite <= stdBreite) return 0
  return Math.ceil((breite - stdBreite) / bEinheit)
}

/**
 * Tiefen-Faktor: B-Faktor wird nur addiert wenn raw_T >= 1.
 * Ist die Tiefe ≤ Standard, bleibt T-Faktor = 0 unabhängig von B.
 */
export function berechneT(
  tiefe: number,
  stdTiefe: number,
  tEinheit: number,
  bFaktor: number,
): number {
  if (tiefe <= stdTiefe) return 0
  const rawT = Math.ceil((tiefe - stdTiefe) / tEinheit)
  return rawT + bFaktor
}

/** Kombinierte Berechnung beider Faktoren */
export function berechne(
  breite: number,
  tiefe: number,
  cfg: Pick<Einstellungen, 'std_breite' | 'std_tiefe' | 'b_einheit' | 't_einheit'>,
): BerechnungsErgebnis {
  const b_faktor = berechneB(breite, cfg.std_breite, cfg.b_einheit)
  const t_faktor = berechneT(tiefe, cfg.std_tiefe, cfg.t_einheit, b_faktor)
  return { b_faktor, t_faktor }
}
```

- [ ] **Schritt 4: Tests laufen lassen — müssen BESTEHEN**

```bash
npm run test -- src/lib/calc.test.ts
```

Erwartete Ausgabe: `13 passed`

- [ ] **Schritt 5: Commit**

```bash
git add src/lib/calc.ts src/lib/calc.test.ts
git commit -m "feat: core calculation logic with full test coverage"
```

---

## Task 4: SQLite Datenbank — Schema + Migration

**Files:**
- Create: `src-tauri/src/db.rs`
- Create: `src-tauri/src/commands.rs`
- Modify: `src-tauri/src/main.rs`

- [ ] **Schritt 1: db.rs mit Migrations-SQL erstellen**

Erstelle `src-tauri/src/db.rs`:

```rust
pub const MIGRATION_V1: &str = r#"
CREATE TABLE IF NOT EXISTS einstellungen (
  id         INTEGER PRIMARY KEY DEFAULT 1,
  std_breite INTEGER NOT NULL DEFAULT 15,
  std_tiefe  INTEGER NOT NULL DEFAULT 45,
  b_einheit  INTEGER NOT NULL DEFAULT 15,
  t_einheit  INTEGER NOT NULL DEFAULT 15
);

INSERT OR IGNORE INTO einstellungen (id) VALUES (1);

CREATE TABLE IF NOT EXISTS auftraege (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  adresse     TEXT NOT NULL DEFAULT '',
  erstellt_am TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS berechnungen (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  auftrag_id  INTEGER NOT NULL REFERENCES auftraege(id) ON DELETE CASCADE,
  breite      INTEGER NOT NULL,
  tiefe       INTEGER NOT NULL,
  b_faktor    INTEGER NOT NULL,
  t_faktor    INTEGER NOT NULL,
  erstellt_am TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS lizenz (
  id            INTEGER PRIMARY KEY DEFAULT 1,
  lizenz_key    TEXT,
  maschinen_id  TEXT,
  aktiviert_am  TEXT,
  letzter_check TEXT,
  status        TEXT NOT NULL DEFAULT 'inaktiv'
);

INSERT OR IGNORE INTO lizenz (id) VALUES (1);
"#;
```

- [ ] **Schritt 2: commands.rs — Rust Commands für Fingerprint und Lizenz**

Erstelle `src-tauri/src/commands.rs`:

```rust
use serde::{Deserialize, Serialize};
use tauri::command;

const KEYGEN_ACCOUNT: &str = "a5a099da-5c45-43f3-a25e-39a91ec97a06";

#[derive(Serialize, Deserialize, Debug)]
pub struct LizenzValidierungErgebnis {
    pub gueltig: bool,
    pub lizenz_id: Option<String>,
    pub fehler: Option<String>,
}

/// Generiert einen Hardware-Fingerprint (SHA256 von Hostname + Plattform)
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

/// Validiert einen Lizenzschlüssel online gegen Keygen.sh und bindet ihn an diese Maschine
#[command]
pub async fn validate_license_online(
    lizenz_key: String,
    fingerprint: String,
) -> Result<LizenzValidierungErgebnis, String> {
    let client = reqwest::Client::new();

    // Schritt 1: Lizenz validieren
    let validate_url = format!(
        "https://api.keygen.sh/v1/accounts/{}/licenses/actions/validate-key",
        KEYGEN_ACCOUNT
    );

    #[derive(Serialize)]
    struct ValidateBody {
        meta: ValidateMeta,
    }
    #[derive(Serialize)]
    struct ValidateMeta {
        key: String,
        scope: ValidateScope,
    }
    #[derive(Serialize)]
    struct ValidateScope {
        fingerprint: String,
    }

    let body = ValidateBody {
        meta: ValidateMeta {
            key: lizenz_key.clone(),
            scope: ValidateScope { fingerprint: fingerprint.clone() },
        },
    };

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
    let lizenz_id = json["data"]["id"].as_str().map(|s| s.to_string());

    if !valid {
        let code = json["meta"]["code"].as_str().unwrap_or("INVALID");
        return Ok(LizenzValidierungErgebnis {
            gueltig: false,
            lizenz_id: None,
            fehler: Some(format!("Lizenz ungültig: {}", code)),
        });
    }

    // Schritt 2: Maschine aktivieren (Lizenz an diesen Rechner binden)
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

    let _ = client
        .post(&activate_url)
        .header("Content-Type", "application/vnd.api+json")
        .header("Accept", "application/vnd.api+json")
        .header("Authorization", format!("License {}", lizenz_key))
        .json(&activate_body)
        .send()
        .await;
    // Aktivierungsfehler ignorieren (z.B. bereits aktiviert) — Validierung war erfolgreich

    Ok(LizenzValidierungErgebnis {
        gueltig: true,
        lizenz_id: json["data"]["id"].as_str().map(|s| s.to_string()),
        fehler: None,
    })
}

/// Prüft die gespeicherte Lizenz still im Hintergrund (alle 30 Tage)
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
```

- [ ] **Schritt 3: Hostname-Crate hinzufügen**

In `src-tauri/Cargo.toml` unter `[dependencies]` ergänzen:
```toml
hostname = "0.3"
```

- [ ] **Schritt 4: main.rs aktualisieren**

Ersetze `src-tauri/src/main.rs` komplett:

```rust
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod db;

use commands::{check_license_background, get_fingerprint, validate_license_online};
use tauri_plugin_sql::{Migration, MigrationKind};

fn main() {
    tauri::Builder::default()
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations(
                    "sqlite:grubenberechnung.db",
                    vec![Migration {
                        version: 1,
                        description: "initial schema",
                        sql: db::MIGRATION_V1,
                        kind: MigrationKind::Up,
                    }],
                )
                .build(),
        )
        .invoke_handler(tauri::generate_handler![
            get_fingerprint,
            validate_license_online,
            check_license_background,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

- [ ] **Schritt 5: Rust kompilieren — muss erfolgreich sein**

```bash
cd src-tauri && cargo build 2>&1 | tail -20
```

Erwartete Ausgabe: `Finished dev [unoptimized + debuginfo]`

Bei Fehlern: Cargo.toml-Versionen prüfen und ggf. anpassen.

- [ ] **Schritt 6: Commit**

```bash
git add src-tauri/
git commit -m "feat: SQLite migrations, hardware fingerprint and Keygen.sh license commands"
```

---

## Task 5: DB-Layer (TypeScript)

**Files:**
- Create: `src/lib/db.ts`
- Create: `src/lib/license.ts`

- [ ] **Schritt 1: db.ts — SQL-Wrapper für alle Operationen**

Erstelle `src/lib/db.ts`:

```typescript
import Database from '@tauri-apps/plugin-sql'
import type { Auftrag, Berechnung, Einstellungen, LizenzRecord } from '@/types'

let db: Database | null = null

async function getDb(): Promise<Database> {
  if (!db) db = await Database.load('sqlite:grubenberechnung.db')
  return db
}

// ── Einstellungen ────────────────────────────────────────────────────────────

export async function loadEinstellungen(): Promise<Einstellungen> {
  const conn = await getDb()
  const rows = await conn.select<Einstellungen[]>('SELECT * FROM einstellungen WHERE id = 1')
  return rows[0]
}

export async function saveEinstellungen(
  data: Omit<Einstellungen, 'id'>,
): Promise<void> {
  const conn = await getDb()
  await conn.execute(
    `UPDATE einstellungen
     SET std_breite=$1, std_tiefe=$2, b_einheit=$3, t_einheit=$4
     WHERE id=1`,
    [data.std_breite, data.std_tiefe, data.b_einheit, data.t_einheit],
  )
}

// ── Aufträge ─────────────────────────────────────────────────────────────────

export async function loadAuftraege(): Promise<Auftrag[]> {
  const conn = await getDb()
  return conn.select<Auftrag[]>(
    'SELECT * FROM auftraege ORDER BY erstellt_am DESC',
  )
}

export async function createAuftrag(name: string, adresse: string): Promise<Auftrag> {
  const conn = await getDb()
  const now = new Date().toISOString()
  const result = await conn.execute(
    'INSERT INTO auftraege (name, adresse, erstellt_am) VALUES ($1, $2, $3)',
    [name.trim(), adresse.trim(), now],
  )
  return { id: result.lastInsertId as number, name, adresse, erstellt_am: now }
}

export async function deleteAuftrag(id: number): Promise<void> {
  const conn = await getDb()
  await conn.execute('DELETE FROM auftraege WHERE id=$1', [id])
}

// ── Berechnungen ──────────────────────────────────────────────────────────────

export async function loadBerechnungen(auftragId: number): Promise<Berechnung[]> {
  const conn = await getDb()
  return conn.select<Berechnung[]>(
    'SELECT * FROM berechnungen WHERE auftrag_id=$1 ORDER BY erstellt_am ASC',
    [auftragId],
  )
}

export async function createBerechnung(
  auftragId: number,
  breite: number,
  tiefe: number,
  bFaktor: number,
  tFaktor: number,
): Promise<Berechnung> {
  const conn = await getDb()
  const now = new Date().toISOString()
  const result = await conn.execute(
    `INSERT INTO berechnungen (auftrag_id, breite, tiefe, b_faktor, t_faktor, erstellt_am)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [auftragId, breite, tiefe, bFaktor, tFaktor, now],
  )
  return {
    id: result.lastInsertId as number,
    auftrag_id: auftragId,
    breite,
    tiefe,
    b_faktor: bFaktor,
    t_faktor: tFaktor,
    erstellt_am: now,
  }
}

export async function deleteBerechnung(id: number): Promise<void> {
  const conn = await getDb()
  await conn.execute('DELETE FROM berechnungen WHERE id=$1', [id])
}

// ── Lizenz ────────────────────────────────────────────────────────────────────

export async function loadLizenz(): Promise<LizenzRecord> {
  const conn = await getDb()
  const rows = await conn.select<LizenzRecord[]>('SELECT * FROM lizenz WHERE id=1')
  return rows[0]
}

export async function saveLizenz(data: Partial<Omit<LizenzRecord, 'id'>>): Promise<void> {
  const conn = await getDb()
  const fields = Object.keys(data)
    .map((k, i) => `${k}=$${i + 1}`)
    .join(', ')
  await conn.execute(`UPDATE lizenz SET ${fields} WHERE id=1`, Object.values(data))
}
```

- [ ] **Schritt 2: license.ts — Lizenzstatus-Verwaltung**

Erstelle `src/lib/license.ts`:

```typescript
import { invoke } from '@tauri-apps/api/core'
import type { LizenzRecord, LizenzStatus } from '@/types'
import { loadLizenz, saveLizenz } from './db'

export async function getLizenzStatus(): Promise<LizenzRecord> {
  return loadLizenz()
}

export async function aktiviereLizenz(key: string): Promise<{ ok: boolean; fehler?: string }> {
  try {
    const fingerprint: string = await invoke('get_fingerprint')
    const result: { gueltig: boolean; fehler?: string } = await invoke(
      'validate_license_online',
      { lizenzKey: key, fingerprint },
    )

    if (!result.gueltig) {
      return { ok: false, fehler: result.fehler ?? 'Ungültiger Lizenzschlüssel' }
    }

    await saveLizenz({
      lizenz_key: key,
      maschinen_id: fingerprint,
      aktiviert_am: new Date().toISOString(),
      letzter_check: new Date().toISOString(),
      status: 'aktiv' as LizenzStatus,
    })

    return { ok: true }
  } catch (e) {
    return { ok: false, fehler: String(e) }
  }
}

/** Stille Hintergrundprüfung — maximal alle 30 Tage */
export async function hintergrundCheck(): Promise<void> {
  const lizenz = await loadLizenz()
  if (lizenz.status !== 'aktiv' || !lizenz.lizenz_key || !lizenz.letzter_check) return

  const dreissigTageMs = 30 * 24 * 60 * 60 * 1000
  const letzterCheck = new Date(lizenz.letzter_check).getTime()
  if (Date.now() - letzterCheck < dreissigTageMs) return

  try {
    const gueltig: boolean = await invoke('check_license_background', {
      lizenzKey: lizenz.lizenz_key,
    })
    await saveLizenz({
      letzter_check: new Date().toISOString(),
      status: gueltig ? 'aktiv' : 'widerrufen',
    })
  } catch {
    // Kein Internet → Status beibehalten
  }
}
```

- [ ] **Schritt 3: Commit**

```bash
git add src/lib/db.ts src/lib/license.ts
git commit -m "feat: database layer and license management"
```

---

## Task 6: Hooks

**Files:**
- Create: `src/hooks/useEinstellungen.ts`
- Create: `src/hooks/useAuftraege.ts`
- Create: `src/hooks/useBerechnungen.ts`

- [ ] **Schritt 1: useEinstellungen.ts**

Erstelle `src/hooks/useEinstellungen.ts`:

```typescript
import { useState, useEffect, useCallback } from 'react'
import type { Einstellungen } from '@/types'
import { loadEinstellungen, saveEinstellungen } from '@/lib/db'

const DEFAULT: Einstellungen = { id: 1, std_breite: 15, std_tiefe: 45, b_einheit: 15, t_einheit: 15 }

export function useEinstellungen() {
  const [einstellungen, setEinstellungen] = useState<Einstellungen>(DEFAULT)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEinstellungen()
      .then(setEinstellungen)
      .finally(() => setLoading(false))
  }, [])

  const speichern = useCallback(async (data: Omit<Einstellungen, 'id'>) => {
    await saveEinstellungen(data)
    setEinstellungen({ id: 1, ...data })
  }, [])

  return { einstellungen, loading, speichern }
}
```

- [ ] **Schritt 2: useAuftraege.ts**

Erstelle `src/hooks/useAuftraege.ts`:

```typescript
import { useState, useEffect, useCallback } from 'react'
import type { Auftrag } from '@/types'
import { loadAuftraege, createAuftrag, deleteAuftrag } from '@/lib/db'

export function useAuftraege() {
  const [auftraege, setAuftraege] = useState<Auftrag[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAuftraege()
      .then(setAuftraege)
      .finally(() => setLoading(false))
  }, [])

  const neuerAuftrag = useCallback(async (name: string, adresse: string): Promise<Auftrag> => {
    const auftrag = await createAuftrag(name, adresse)
    setAuftraege(prev => [auftrag, ...prev])
    return auftrag
  }, [])

  const loescheAuftrag = useCallback(async (id: number) => {
    await deleteAuftrag(id)
    setAuftraege(prev => prev.filter(a => a.id !== id))
  }, [])

  return { auftraege, loading, neuerAuftrag, loescheAuftrag }
}
```

- [ ] **Schritt 3: useBerechnungen.ts**

Erstelle `src/hooks/useBerechnungen.ts`:

```typescript
import { useState, useEffect, useCallback } from 'react'
import type { Berechnung } from '@/types'
import { loadBerechnungen, createBerechnung, deleteBerechnung } from '@/lib/db'

export function useBerechnungen(auftragId: number | null) {
  const [berechnungen, setBerechnungen] = useState<Berechnung[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!auftragId) { setBerechnungen([]); return }
    setLoading(true)
    loadBerechnungen(auftragId)
      .then(setBerechnungen)
      .finally(() => setLoading(false))
  }, [auftragId])

  const addBerechnung = useCallback(async (
    breite: number, tiefe: number, bFaktor: number, tFaktor: number,
  ) => {
    if (!auftragId) return
    const b = await createBerechnung(auftragId, breite, tiefe, bFaktor, tFaktor)
    setBerechnungen(prev => [...prev, b])
  }, [auftragId])

  const loescheBerechnung = useCallback(async (id: number) => {
    await deleteBerechnung(id)
    setBerechnungen(prev => prev.filter(b => b.id !== id))
  }, [])

  return { berechnungen, loading, addBerechnung, loescheBerechnung }
}
```

- [ ] **Schritt 4: Commit**

```bash
git add src/hooks/
git commit -m "feat: React hooks for settings, orders, and calculations"
```

---

## Task 7: UI-Komponenten

**Files:**
- Create: `src/components/BerechnungRow.tsx`
- Create: `src/components/BerechnungForm.tsx`
- Create: `src/components/AuftragModal.tsx`
- Create: `src/components/EinstellungenView.tsx`

- [ ] **Schritt 1: BerechnungRow.tsx**

Erstelle `src/components/BerechnungRow.tsx`:

```tsx
import type { Berechnung } from '@/types'
import { X } from 'lucide-react'

interface Props {
  berechnung: Berechnung
  index: number
  onDelete: (id: number) => void
}

export function BerechnungRow({ berechnung, index, onDelete }: Props) {
  const b0 = berechnung.b_faktor === 0
  const t0 = berechnung.t_faktor === 0

  return (
    <div className="flex items-center gap-3 bg-[#080d1a] border border-[#0d1830] rounded-lg px-4 py-3 hover:border-[#1e2a40] transition-colors group">
      <div className="w-6 h-6 rounded-full bg-[#0f2240] flex items-center justify-center text-[10px] font-semibold text-accent flex-shrink-0">
        {index}
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium text-foreground">
          {berechnung.breite} cm × {berechnung.tiefe} cm
        </div>
        <div className="text-[10px] text-[#334155] mt-0.5">Breite × Tiefe</div>
      </div>
      <div className="flex gap-2">
        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
          b0 ? 'bg-[#0d1f0d] text-success border-[#14532d]' : 'bg-[#0f2240] text-accent border-[#1e3a5f]'
        }`}>
          B: {berechnung.b_faktor}
        </span>
        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
          t0 ? 'bg-[#0d1f0d] text-success border-[#14532d]' : 'bg-[#0f2240] text-accent-light border-[#1e3a5f]'
        }`}>
          T: {berechnung.t_faktor}
        </span>
      </div>
      <button
        onClick={() => onDelete(berechnung.id)}
        className="text-[#1e2a40] hover:text-destructive transition-colors opacity-0 group-hover:opacity-100 p-1"
      >
        <X size={14} />
      </button>
    </div>
  )
}
```

- [ ] **Schritt 2: BerechnungForm.tsx**

Erstelle `src/components/BerechnungForm.tsx`:

```tsx
import { useState, useEffect } from 'react'
import type { Einstellungen } from '@/types'
import { berechne } from '@/lib/calc'
import { Plus } from 'lucide-react'

interface Props {
  einstellungen: Einstellungen
  onAdd: (breite: number, tiefe: number, bFaktor: number, tFaktor: number) => void
}

export function BerechnungForm({ einstellungen, onAdd }: Props) {
  const [breite, setBreite] = useState('')
  const [tiefe, setTiefe] = useState('')

  const bVal = parseInt(breite) || 0
  const tVal = parseInt(tiefe) || 0
  const { b_faktor, t_faktor } = bVal > 0 && tVal > 0
    ? berechne(bVal, tVal, einstellungen)
    : { b_faktor: 0, t_faktor: 0 }

  const canAdd = bVal > 0 && tVal > 0

  const handleAdd = () => {
    if (!canAdd) return
    onAdd(bVal, tVal, b_faktor, t_faktor)
    setBreite('')
    setTiefe('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd()
  }

  return (
    <div className="border-t border-[#0d1830] bg-[#080d1a] px-5 py-3">
      <div className="text-[9px] uppercase tracking-widest text-[#334155] mb-2">
        Neue Berechnung
      </div>
      <div className="flex items-end gap-2 flex-wrap">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-muted-foreground uppercase tracking-wide">Breite</label>
          <div className="relative">
            <input
              type="number"
              min="1"
              value={breite}
              onChange={e => setBreite(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="0"
              className="bg-[#0a0f1e] border border-[#1e2a40] rounded-md px-3 py-2 pr-8 text-sm text-foreground w-24 outline-none focus:border-accent transition-colors"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-[#334155]">cm</span>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-muted-foreground uppercase tracking-wide">Tiefe</label>
          <div className="relative">
            <input
              type="number"
              min="1"
              value={tiefe}
              onChange={e => setTiefe(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="0"
              className="bg-[#0a0f1e] border border-[#1e2a40] rounded-md px-3 py-2 pr-8 text-sm text-foreground w-24 outline-none focus:border-accent transition-colors"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-[#334155]">cm</span>
          </div>
        </div>

        {canAdd && (
          <div className="bg-[#0f2240] border border-[#1e3a5f] rounded-md px-3 py-2 min-w-[110px]">
            <div className="text-[9px] text-[#334155] mb-1 uppercase">Vorschau</div>
            <div className="flex gap-3">
              <div>
                <span className="text-base font-bold text-accent">B: {b_faktor}</span>
                <div className="text-[9px] text-[#475569]">Breite</div>
              </div>
              <div className="text-[#1e3a5f] self-center">|</div>
              <div>
                <span className="text-base font-bold text-accent-light">T: {t_faktor}</span>
                <div className="text-[9px] text-[#475569]">Tiefe</div>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleAdd}
          disabled={!canAdd}
          className="flex items-center gap-1.5 bg-[#1e3a5f] hover:bg-[#243f6a] disabled:opacity-40 disabled:cursor-not-allowed text-accent border border-[#2d4f7c] rounded-md px-4 py-2 text-xs font-semibold transition-colors"
        >
          <Plus size={14} />
          Hinzufügen
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Schritt 3: AuftragModal.tsx**

Erstelle `src/components/AuftragModal.tsx`:

```tsx
import { useState } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Props {
  open: boolean
  onClose: () => void
  onConfirm: (name: string, adresse: string) => void
}

export function AuftragModal({ open, onClose, onConfirm }: Props) {
  const [name, setName] = useState('')
  const [adresse, setAdresse] = useState('')

  const handleConfirm = () => {
    if (!name.trim()) return
    onConfirm(name.trim(), adresse.trim())
    setName('')
    setAdresse('')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="bg-[#080d1a] border-[#1e2a40] text-foreground max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-foreground">Neuer Auftrag</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-muted text-xs uppercase tracking-wide">Name *</Label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleConfirm()}
              placeholder="z.B. Baustelle Nord"
              className="bg-[#0a0f1e] border-[#1e2a40] text-foreground focus:border-accent"
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-muted text-xs uppercase tracking-wide">Adresse</Label>
            <Input
              value={adresse}
              onChange={e => setAdresse(e.target.value)}
              placeholder="z.B. Nordring 14, München"
              className="bg-[#0a0f1e] border-[#1e2a40] text-foreground focus:border-accent"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} className="text-muted-foreground">
            Abbrechen
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!name.trim()}
            className="bg-[#1e3a5f] hover:bg-[#243f6a] text-accent border border-[#2d4f7c]"
          >
            Erstellen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Schritt 4: EinstellungenView.tsx**

Erstelle `src/components/EinstellungenView.tsx`:

```tsx
import { useState } from 'react'
import type { Einstellungen } from '@/types'
import { ArrowLeft, Save } from 'lucide-react'

interface Props {
  einstellungen: Einstellungen
  onSave: (data: Omit<Einstellungen, 'id'>) => void
  onBack: () => void
}

function SettingRow({
  label, desc, value, onChange,
}: {
  label: string; desc: string; value: number; onChange: (v: number) => void
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-sm text-foreground">{label}</div>
        <div className="text-[10px] text-[#334155] mt-0.5">{desc}</div>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min="1"
          value={value}
          onChange={e => onChange(parseInt(e.target.value) || 1)}
          className="bg-[#0a0f1e] border border-[#1e2a40] rounded-md px-2 py-1.5 text-sm text-foreground w-16 text-right outline-none focus:border-accent"
        />
        <span className="text-xs text-muted-foreground">cm</span>
      </div>
    </div>
  )
}

export function EinstellungenView({ einstellungen, onSave, onBack }: Props) {
  const [form, setForm] = useState({ ...einstellungen })

  const set = (key: keyof typeof form) => (v: number) =>
    setForm(prev => ({ ...prev, [key]: v }))

  return (
    <div className="flex flex-col flex-1 bg-[#0a0f1e]">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#0d1830]">
        <div>
          <div className="text-base font-semibold text-foreground">⚙ Einstellungen</div>
          <div className="text-xs text-[#334155] mt-0.5">Standard-Werte und Faktor-Einheiten</div>
        </div>
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground bg-[#0f2240] border border-[#1e3a5f] rounded-md px-3 py-1.5 transition-colors"
        >
          <ArrowLeft size={12} /> Zurück
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        <div className="bg-[#080d1a] border border-[#0d1830] rounded-lg p-4 space-y-4">
          <div className="text-[10px] uppercase tracking-widest text-accent mb-2">📐 Standardgrube</div>
          <SettingRow label="Standard-Breite" desc="Breite der Referenzgrube (Basis für B-Faktor)" value={form.std_breite} onChange={set('std_breite')} />
          <SettingRow label="Standard-Tiefe" desc="Tiefe der Referenzgrube (Basis für T-Faktor)" value={form.std_tiefe} onChange={set('std_tiefe')} />
        </div>

        <div className="bg-[#080d1a] border border-[#0d1830] rounded-lg p-4 space-y-4">
          <div className="text-[10px] uppercase tracking-widest text-accent mb-2">🔢 Faktor-Einheiten</div>
          <SettingRow label="Breiten-Faktor-Einheit" desc="Jede angefangene Einheit = +1 B-Faktor" value={form.b_einheit} onChange={set('b_einheit')} />
          <SettingRow label="Tiefen-Faktor-Einheit" desc="Jede angefangene Einheit = +1 T-Faktor (roh)" value={form.t_einheit} onChange={set('t_einheit')} />

          <div className="bg-[#0a0f1e] border border-[#0d1830] rounded-md p-3 mt-2">
            <div className="text-[9px] text-[#334155] uppercase tracking-wide mb-2">Aktuelle Formel</div>
            <div className="text-xs text-accent-light font-mono leading-7">
              B-Faktor = ⌈ (Breite − {form.std_breite}) / {form.b_einheit} ⌉<br />
              T-Faktor = ⌈ (Tiefe − {form.std_tiefe}) / {form.t_einheit} ⌉ + B (wenn T-roh ≥ 1)
            </div>
          </div>
        </div>

        <button
          onClick={() => { onSave({ std_breite: form.std_breite, std_tiefe: form.std_tiefe, b_einheit: form.b_einheit, t_einheit: form.t_einheit }); onBack() }}
          className="flex items-center gap-2 bg-[#1e3a5f] hover:bg-[#243f6a] text-accent border border-[#2d4f7c] rounded-md px-5 py-2 text-sm font-semibold transition-colors"
        >
          <Save size={14} /> Speichern
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Schritt 5: Commit**

```bash
git add src/components/
git commit -m "feat: UI components BerechnungRow, BerechnungForm, AuftragModal, EinstellungenView"
```

---

## Task 8: Layout und Hauptansicht

**Files:**
- Create: `src/components/Sidebar.tsx`
- Create: `src/components/AuftragDetail.tsx`
- Create: `src/components/Layout.tsx`

- [ ] **Schritt 1: Sidebar.tsx**

Erstelle `src/components/Sidebar.tsx`:

```tsx
import type { Auftrag } from '@/types'
import { Plus, Settings, Trash2 } from 'lucide-react'

interface Props {
  auftraege: Auftrag[]
  aktiveId: number | null
  onSelect: (id: number) => void
  onNew: () => void
  onDelete: (id: number) => void
  onSettings: () => void
}

export function Sidebar({ auftraege, aktiveId, onSelect, onNew, onDelete, onSettings }: Props) {
  return (
    <div className="w-[220px] flex-shrink-0 bg-[#080d1a] border-r border-[#0d1830] flex flex-col">
      <div className="p-3 border-b border-[#0d1830]">
        <div className="text-[9px] uppercase tracking-widest text-[#334155] mb-2.5">Aufträge</div>
        <button
          onClick={onNew}
          className="w-full flex items-center gap-2 bg-[#1e3a5f] hover:bg-[#243f6a] text-accent border border-[#2d4f7c] rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
        >
          <Plus size={13} /> Neuer Auftrag
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-1.5">
        {auftraege.length === 0 && (
          <div className="text-center text-xs text-[#334155] mt-8 px-4">
            Noch keine Aufträge.<br />Erstelle deinen ersten.
          </div>
        )}
        {auftraege.map(a => (
          <div
            key={a.id}
            onClick={() => onSelect(a.id)}
            className={`group flex items-center rounded-md px-2.5 py-2 mb-0.5 cursor-pointer transition-colors ${
              aktiveId === a.id
                ? 'bg-[#0f2240] border-l-[3px] border-accent pl-[7px]'
                : 'hover:bg-[#0d1830]'
            }`}
          >
            <div className="flex-1 min-w-0">
              <div className={`text-xs font-medium truncate ${aktiveId === a.id ? 'text-[#93c5fd]' : 'text-foreground'}`}>
                {a.name}
              </div>
              <div className="text-[10px] text-[#334155] mt-0.5 truncate">
                {new Date(a.erstellt_am).toLocaleDateString('de-DE')}
              </div>
            </div>
            <button
              onClick={e => { e.stopPropagation(); onDelete(a.id) }}
              className="opacity-0 group-hover:opacity-100 text-[#334155] hover:text-destructive p-1 transition-all"
            >
              <Trash2 size={11} />
            </button>
          </div>
        ))}
      </div>

      <div className="p-2 border-t border-[#0d1830]">
        <button
          onClick={onSettings}
          className="w-full flex items-center gap-2 text-[#475569] hover:text-muted-foreground hover:bg-[#0d1830] rounded-md px-3 py-2 text-xs transition-colors"
        >
          <Settings size={13} /> Einstellungen
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Schritt 2: AuftragDetail.tsx**

Erstelle `src/components/AuftragDetail.tsx`:

```tsx
import type { Auftrag, Berechnung, Einstellungen } from '@/types'
import { BerechnungRow } from './BerechnungRow'
import { BerechnungForm } from './BerechnungForm'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Props {
  auftrag: Auftrag | null
  berechnungen: Berechnung[]
  einstellungen: Einstellungen
  onAddBerechnung: (b: number, t: number, bf: number, tf: number) => void
  onDeleteBerechnung: (id: number) => void
}

export function AuftragDetail({
  auftrag, berechnungen, einstellungen, onAddBerechnung, onDeleteBerechnung,
}: Props) {
  if (!auftrag) {
    return (
      <div className="flex-1 flex items-center justify-center text-[#334155] text-sm">
        Wähle einen Auftrag aus der Liste
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 bg-[#0a0f1e] min-h-0">
      <div className="flex items-start justify-between px-5 py-4 border-b border-[#0d1830]">
        <div>
          <div className="text-base font-semibold text-foreground">{auftrag.name}</div>
          <div className="text-xs text-[#334155] mt-0.5">
            {new Date(auftrag.erstellt_am).toLocaleDateString('de-DE')}
            {auftrag.adresse && ` · ${auftrag.adresse}`}
          </div>
        </div>
        <span className="bg-[#0f2240] text-accent text-[10px] px-2.5 py-1 rounded-full border border-[#1e3a5f]">
          {berechnungen.length} Berechnung{berechnungen.length !== 1 ? 'en' : ''}
        </span>
      </div>

      <div className="flex items-center justify-between px-5 py-2 border-b border-[#0d1830]">
        <span className="text-[10px] font-semibold text-accent-light uppercase tracking-wide">Berechnungen</span>
        <span className="text-[9px] text-[#334155]">
          Std: B={einstellungen.std_breite}cm T={einstellungen.std_tiefe}cm | B-Einh: {einstellungen.b_einheit}cm | T-Einh: {einstellungen.t_einheit}cm
        </span>
      </div>

      <ScrollArea className="flex-1 px-5 py-3">
        {berechnungen.length === 0 ? (
          <div className="text-center text-xs text-[#334155] mt-8">
            Noch keine Berechnungen.<br />Füge eine unten hinzu.
          </div>
        ) : (
          <div className="space-y-2">
            {berechnungen.map((b, i) => (
              <BerechnungRow
                key={b.id}
                berechnung={b}
                index={i + 1}
                onDelete={onDeleteBerechnung}
              />
            ))}
          </div>
        )}
      </ScrollArea>

      <BerechnungForm einstellungen={einstellungen} onAdd={onAddBerechnung} />
    </div>
  )
}
```

- [ ] **Schritt 3: Layout.tsx**

Erstelle `src/components/Layout.tsx`:

```tsx
import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { AuftragDetail } from './AuftragDetail'
import { AuftragModal } from './AuftragModal'
import { EinstellungenView } from './EinstellungenView'
import { useAuftraege } from '@/hooks/useAuftraege'
import { useBerechnungen } from '@/hooks/useBerechnungen'
import { useEinstellungen } from '@/hooks/useEinstellungen'

export function Layout() {
  const { auftraege, neuerAuftrag, loescheAuftrag } = useAuftraege()
  const { einstellungen, speichern } = useEinstellungen()
  const [aktiveAuftragId, setAktiveAuftragId] = useState<number | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  const { berechnungen, addBerechnung, loescheBerechnung } = useBerechnungen(aktiveAuftragId)

  const aktiveAuftrag = auftraege.find(a => a.id === aktiveAuftragId) ?? null

  const handleNewAuftrag = async (name: string, adresse: string) => {
    const a = await neuerAuftrag(name, adresse)
    setAktiveAuftragId(a.id)
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar
        auftraege={auftraege}
        aktiveId={aktiveAuftragId}
        onSelect={id => { setAktiveAuftragId(id); setShowSettings(false) }}
        onNew={() => setModalOpen(true)}
        onDelete={async id => {
          await loescheAuftrag(id)
          if (aktiveAuftragId === id) setAktiveAuftragId(null)
        }}
        onSettings={() => setShowSettings(true)}
      />

      {showSettings ? (
        <EinstellungenView
          einstellungen={einstellungen}
          onSave={speichern}
          onBack={() => setShowSettings(false)}
        />
      ) : (
        <AuftragDetail
          auftrag={aktiveAuftrag}
          berechnungen={berechnungen}
          einstellungen={einstellungen}
          onAddBerechnung={addBerechnung}
          onDeleteBerechnung={loescheBerechnung}
        />
      )}

      <AuftragModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleNewAuftrag}
      />
    </div>
  )
}
```

- [ ] **Schritt 4: Commit**

```bash
git add src/components/Sidebar.tsx src/components/AuftragDetail.tsx src/components/Layout.tsx
git commit -m "feat: Layout, Sidebar, AuftragDetail main UI assembled"
```

---

## Task 9: Lizenzaktivierungs-Screen

**Files:**
- Create: `src/components/LizenzView.tsx`
- Modify: `src/App.tsx`
- Modify: `src/main.tsx`

- [ ] **Schritt 1: LizenzView.tsx**

Erstelle `src/components/LizenzView.tsx`:

```tsx
import { useState } from 'react'
import { aktiviereLizenz } from '@/lib/license'

interface Props {
  onAktiviert: () => void
}

export function LizenzView({ onAktiviert }: Props) {
  const [key, setKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [fehler, setFehler] = useState<string | null>(null)

  const handleAktivieren = async () => {
    if (!key.trim()) return
    setLoading(true)
    setFehler(null)
    const result = await aktiviereLizenz(key.trim())
    setLoading(false)
    if (result.ok) {
      onAktiviert()
    } else {
      setFehler(result.fehler ?? 'Aktivierung fehlgeschlagen')
    }
  }

  return (
    <div className="flex h-screen bg-background items-center justify-center">
      <div className="bg-[#080d1a] border border-[#1e2a40] rounded-xl p-8 w-full max-w-sm shadow-2xl">
        <div className="text-center mb-6">
          <div className="text-3xl mb-2">⛏</div>
          <h1 className="text-lg font-semibold text-foreground">Grubenberechnung</h1>
          <p className="text-xs text-muted-foreground mt-1">Bitte aktiviere deine Lizenz</p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-[10px] uppercase tracking-widest text-[#475569] block mb-1.5">
              Lizenzschlüssel
            </label>
            <input
              type="text"
              value={key}
              onChange={e => setKey(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAktivieren()}
              placeholder="XXXX-XXXX-XXXX-XXXX"
              className="w-full bg-[#0a0f1e] border border-[#1e2a40] rounded-md px-3 py-2.5 text-sm text-foreground outline-none focus:border-accent transition-colors font-mono"
              autoFocus
            />
          </div>

          {fehler && (
            <div className="bg-[#1a0a0a] border border-[#4b1111] rounded-md px-3 py-2 text-xs text-[#f87171]">
              {fehler}
            </div>
          )}

          <button
            onClick={handleAktivieren}
            disabled={!key.trim() || loading}
            className="w-full bg-[#1e3a5f] hover:bg-[#243f6a] disabled:opacity-50 disabled:cursor-not-allowed text-accent border border-[#2d4f7c] rounded-md py-2.5 text-sm font-semibold transition-colors"
          >
            {loading ? 'Wird aktiviert…' : 'Aktivieren'}
          </button>
        </div>

        <p className="text-[10px] text-center text-[#334155] mt-5">
          Die Lizenz wird einmalig online validiert und<br />
          an diesen Computer gebunden.
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Schritt 2: App.tsx — Root mit Lizenz-Gate**

Ersetze `src/App.tsx`:

```tsx
import { useState, useEffect } from 'react'
import { Layout } from './components/Layout'
import { LizenzView } from './components/LizenzView'
import { getLizenzStatus, hintergrundCheck } from './lib/license'

export default function App() {
  const [lizenzStatus, setLizenzStatus] = useState<'prüfen' | 'aktiv' | 'inaktiv'>('prüfen')

  useEffect(() => {
    getLizenzStatus().then(l => {
      setLizenzStatus(l.status === 'aktiv' ? 'aktiv' : 'inaktiv')
      if (l.status === 'aktiv') {
        hintergrundCheck() // Stille Hintergrundprüfung, nicht abwarten
      }
    })
  }, [])

  if (lizenzStatus === 'prüfen') {
    return (
      <div className="flex h-screen bg-background items-center justify-center text-muted-foreground text-sm">
        Wird geladen…
      </div>
    )
  }

  if (lizenzStatus === 'inaktiv') {
    return <LizenzView onAktiviert={() => setLizenzStatus('aktiv')} />
  }

  return <Layout />
}
```

- [ ] **Schritt 3: main.tsx**

Ersetze `src/main.tsx`:

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

- [ ] **Schritt 4: Commit**

```bash
git add src/App.tsx src/main.tsx src/components/LizenzView.tsx
git commit -m "feat: license activation screen and app root with license gate"
```

---

## Task 10: Tauri Window-Konfiguration + Build

**Files:**
- Modify: `src-tauri/tauri.conf.json`

- [ ] **Schritt 1: tauri.conf.json konfigurieren**

Öffne `src-tauri/tauri.conf.json` und setze:

```json
{
  "$schema": "https://schema.tauri.app/config/2",
  "productName": "Grubenberechnung",
  "version": "1.0.0",
  "identifier": "com.grubenberechnung.app",
  "build": {
    "frontendDist": "../dist",
    "devUrl": "http://localhost:1420",
    "beforeDevCommand": "npm run dev",
    "beforeBuildCommand": "npm run build"
  },
  "app": {
    "windows": [
      {
        "title": "⛏ Grubenberechnung",
        "width": 900,
        "height": 620,
        "minWidth": 700,
        "minHeight": 500,
        "resizable": true,
        "decorations": true
      }
    ],
    "security": {
      "csp": null
    }
  },
  "bundle": {
    "active": true,
    "targets": "all",
    "icon": [
      "icons/32x32.png",
      "icons/128x128.png",
      "icons/128x128@2x.png",
      "icons/icon.icns",
      "icons/icon.ico"
    ]
  }
}
```

- [ ] **Schritt 2: Dev-Server starten und testen**

```bash
npm run tauri dev
```

Die App sollte sich öffnen. Erster Start: Lizenzaktivierungsscreen erscheint.
Testen mit einem Test-Lizenzschlüssel aus dem Keygen.sh Dashboard (Licenses → New License).

- [ ] **Schritt 3: Production Build**

```bash
npm run tauri build
```

Ausgabe:
- macOS: `src-tauri/target/release/bundle/macos/Grubenberechnung.app`
- Windows: `src-tauri/target/release/bundle/msi/Grubenberechnung_1.0.0_x64_en-US.msi`

- [ ] **Schritt 4: Finale Tests**

Manuelle Checkliste:
- [ ] Lizenzaktivierung mit gültigem Key → App öffnet sich
- [ ] Lizenzaktivierung mit ungültigem Key → Fehlermeldung
- [ ] Neuen Auftrag erstellen → erscheint in Sidebar
- [ ] Berechnung hinzufügen (30×60) → B:1 T:2
- [ ] Berechnung hinzufügen (30×45) → B:1 T:0
- [ ] Einstellungen ändern → Formel-Anzeige aktualisiert sich
- [ ] App schließen und neu starten → kein Lizenz-Dialog mehr
- [ ] Alle Aufträge und Berechnungen noch vorhanden

- [ ] **Schritt 5: Automatische Tests abschließend laufen lassen**

```bash
npm run test
```

Erwartete Ausgabe: `13 passed`

- [ ] **Schritt 6: Final-Commit**

```bash
git add -A
git commit -m "feat: production build config, window settings — v1.0.0 complete"
```

---

## Keygen.sh: Ersten Lizenzschlüssel erstellen

Nach erfolgreichem Build, im Keygen.sh Dashboard:
1. **Licenses** → **New License**
2. Policy: `Standard` auswählen
3. Submit → Lizenzschlüssel kopieren
4. In der App eingeben → Aktivierung testen

---

## Automatische Tests ausführen

```bash
npm run test           # Alle Tests
npm run test -- --ui   # Vitest UI im Browser
```
