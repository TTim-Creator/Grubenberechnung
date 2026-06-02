pub const MIGRATION_V2: &str = r#"
ALTER TABLE einstellungen ADD COLUMN akzent_farbe TEXT NOT NULL DEFAULT '#3b82f6';
ALTER TABLE einstellungen ADD COLUMN firmen_name TEXT NOT NULL DEFAULT '';
"#;

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
