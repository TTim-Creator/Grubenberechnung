# Grubenberechnung — Design Spec v1.0

**Datum**: 2026-06-02  
**Status**: Genehmigt  
**Branche**: Tiefbau / Baugruben

---

## 1. Ziel

Desktop-Applikation zur schnellen Berechnung von Grubenfaktoren im Tiefbau.
Der Nutzer gibt Breite und Tiefe einer Grube ein und erhält sofort die normierten
Breiten- und Tiefenfaktoren — basierend auf konfigurierbaren Standardmaßen.

---

## 2. Plattform & Stack

| Komponente | Technologie |
|------------|-------------|
| Desktop-Framework | Tauri 2 |
| Frontend | React 18 + TypeScript |
| UI-Komponenten | shadcn/ui (Dark Mode) |
| Datenbank | SQLite via `tauri-plugin-sql` |
| Lizenzierung | Keygen.sh (Online-Aktivierung) |
| Build-Ziele | macOS (.app), Windows (.exe / .msi) |

Start: Doppelklick auf App-Datei — kein Browser, kein Server, keine Abhängigkeiten.

---

## 3. Berechnungslogik

### Formeln

```
B-Faktor = Breite > Std-Breite
           ? ⌈(Breite − Std-Breite) / B-Einheit⌉
           : 0

raw_T    = Tiefe > Std-Tiefe
           ? ⌈(Tiefe − Std-Tiefe) / T-Einheit⌉
           : 0

T-Faktor = raw_T > 0
           ? raw_T + B-Faktor
           : 0
```

**Schlüsselregel**: Der B-Faktor wird dem T-Faktor **nur** addiert, wenn `raw_T ≥ 1`.
Ist die Tiefe ≤ Standard-Tiefe, bleibt T-Faktor = 0 — unabhängig vom B-Faktor.

**Ceiling-Funktion**: Jede angefangene Einheit zählt als vollständiger Faktor.
Beispiel: 16 cm bei Einheit 15 cm → ⌈16/15⌉ = 2.

### Standard-Konfiguration (Werkseinstellungen)

| Parameter | Standardwert | Beschreibung |
|-----------|-------------|--------------|
| Standard-Breite | 15 cm | Breite der Referenzgrube |
| Standard-Tiefe | 45 cm | Tiefe der Referenzgrube |
| Breiten-Faktor-Einheit | 15 cm | Stufengröße für B-Faktor |
| Tiefen-Faktor-Einheit | 15 cm | Stufengröße für T-Faktor |

### Berechnungsbeispiele

| Breite | Tiefe | B-Faktor | raw_T | T-Faktor |
|--------|-------|----------|-------|----------|
| 15 cm  | 45 cm | 0 | 0 | 0 |
| 30 cm  | 45 cm | 1 | 0 | 0 (kein T → kein B-Aufschlag) |
| 30 cm  | 60 cm | 1 | 1 | 2 (1 + B:1) |
| 45 cm  | 75 cm | 2 | 2 | 4 (2 + B:2) |
| 16 cm  | 46 cm | 1 | 1 | 2 (Ceiling: 16→2, 46→1) |
| 15 cm  | 60 cm | 0 | 1 | 1 (kein B-Aufschlag da B=0) |

---

## 4. Datenmodell (SQLite)

```sql
-- Einstellungen (singleton, immer genau 1 Zeile)
CREATE TABLE einstellungen (
  id           INTEGER PRIMARY KEY DEFAULT 1,
  std_breite   INTEGER NOT NULL DEFAULT 15,
  std_tiefe    INTEGER NOT NULL DEFAULT 45,
  b_einheit    INTEGER NOT NULL DEFAULT 15,
  t_einheit    INTEGER NOT NULL DEFAULT 15
);

-- Aufträge
CREATE TABLE auftraege (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  name         TEXT NOT NULL,
  adresse      TEXT,
  erstellt_am  TEXT NOT NULL  -- ISO 8601
);

-- Berechnungen
CREATE TABLE berechnungen (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  auftrag_id   INTEGER NOT NULL REFERENCES auftraege(id) ON DELETE CASCADE,
  breite       INTEGER NOT NULL,  -- cm
  tiefe        INTEGER NOT NULL,  -- cm
  b_faktor     INTEGER NOT NULL,
  t_faktor     INTEGER NOT NULL,
  erstellt_am  TEXT NOT NULL
);

-- Lizenzstatus (singleton)
CREATE TABLE lizenz (
  id              INTEGER PRIMARY KEY DEFAULT 1,
  lizenz_key      TEXT,
  maschinen_id    TEXT,
  aktiviert_am    TEXT,
  letzter_check   TEXT,
  status          TEXT DEFAULT 'inaktiv'  -- 'inaktiv' | 'aktiv' | 'widerrufen'
);
```

---

## 5. UI-Architektur

### Layout: Sidebar + Detail (2-Spalten)

```
┌─────────────────────────────────────────────────────────┐
│ ● ● ●   ⛏ Grubenberechnung                             │  ← Tauri Titlebar
├───────────────┬─────────────────────────────────────────┤
│ AUFTRÄGE      │ Baustelle Nord                          │
│               │ 02.06.2026 · Nordring 14, München       │
│ ▶ Baustelle N │─────────────────────────────────────────│
│   Projekt H   │ # │ Breite × Tiefe │ B-Faktor │ T-Faktor│
│   Müller Str  │───┼────────────────┼──────────┼─────────│
│               │ 1 │  30 ×  60 cm  │    1     │    2    │
│               │ 2 │  45 ×  75 cm  │    2     │    4    │
│               │ 3 │  15 ×  45 cm  │    0     │    0    │
│               │─────────────────────────────────────────│
│ + Neuer A.    │ [ Breite: ___ cm ] [ Tiefe: ___ cm ]    │
│               │ Vorschau: B:1  T:2   [ + Hinzufügen ]   │
│ ─────────     │                                         │
│ ⚙ Einst.     │                                         │
└───────────────┴─────────────────────────────────────────┘
```

### Screens

1. **Lizenzaktivierung** (nur beim ersten Start)
   - Eingabefeld für Lizenzcode
   - Online-Prüfung gegen Keygen.sh
   - Fehlerbehandlung (ungültig, bereits aktiviert)

2. **Hauptansicht** (Sidebar + Detail)
   - Auftragliste mit Auftrag-Name, Datum, Anzahl Berechnungen
   - Detail: Auftragskopf + scrollbare Berechnungsliste + Eingabeformular
   - Live-Faktor-Vorschau beim Tippen

3. **Neuer Auftrag** (Modal/Inline)
   - Felder: Name (Pflicht), Adresse (optional)
   - Datum wird automatisch gesetzt

4. **Einstellungen** (eigene Ansicht, via Sidebar)
   - Standard-Breite, Standard-Tiefe, B-Einheit, T-Einheit
   - Live-Formel-Anzeige passt sich bei Änderung an
   - Speichern-Button

### Design

- **Modus**: Dark Mode (ausschließlich)
- **Akzentfarbe**: Stahl-Blau `#3b82f6`
- **Hintergrund**: `#0a0f1e` (Hauptfläche), `#080d1a` (Sidebar/Karten)
- **Rahmen**: `#0d1830`
- **Text primär**: `#e2e8f0`, sekundär: `#94a3b8`, deaktiviert: `#334155`
- **B-Faktor**: `#3b82f6`, **T-Faktor**: `#60a5fa`, **Faktor 0**: `#22c55e`
- **Schrift**: System-Font (`-apple-system`, `Segoe UI`)
- **Komponenten**: shadcn/ui mit angepasstem Dark-Mode-Theme

---

## 6. Lizenzierung (Keygen.sh)

### Modell: Online-Aktivierung, lokal gecacht

```
Erster Start
  └── Lizenzaktivierungs-Screen
       └── Nutzer gibt Lizenzcode ein
            └── POST keygen.sh/v1/accounts/{id}/licenses/{key}/actions/validate
                 ├── ✅ Gültig → Maschinen-ID binden → lokal speichern → App starten
                 └── ❌ Ungültig/bereits aktiviert → Fehlermeldung

Jeder weitere Start
  └── Lokale Lizenz-DB prüfen
       ├── Status = 'aktiv' → App startet sofort (kein Internet nötig)
       └── Hintergrund (alle 30 Tage, wenn Internet vorhanden):
            ├── Online re-validieren
            ├── Kein Internet → weiter mit lokalem Status
            └── Widerrufen → Status auf 'widerrufen' setzen, Hinweis anzeigen
```

### Keygen.sh Konfiguration

- **Policy**: Max Machines = 1, Require Fingerprint Scope = true, Strict = true
- **Maschinenidentifikation**: Hardware-Fingerprint (CPU + MAC-Adresse, via Tauri)
- **Account-ID**: `a5a099da-5c45-43f3-a25e-39a91ec97a06`
- **Product-ID**: `6f85fd5b-01f7-490c-8b51-c8666fc24a9e`
- **Policy-ID**: `5094cdf4-df33-44d1-ac4e-f038792c3db0`

---

## 7. Phasen

### Phase 1 (aktuelle Implementierung)
- Lizenzaktivierung
- Auftragsmanagement (CRUD)
- Berechnungseingabe mit Live-Vorschau
- Faktoranzeige (B + T)
- Einstellungen

### Phase 2 (geplante Erweiterung)
- PDF-Export eines Auftrags (Name, Adresse, Datum, alle Berechnungen mit Faktoren)
- Excel/CSV-Export

---

## 8. Nicht in Scope (Phase 1)

- Kostenberechnung / Preise
- Materialmengen
- Netzwerk-Synchronisation
- Mehrere Nutzer / Benutzerkonten
- Drucken (→ Phase 2 via PDF)
