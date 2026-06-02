#!/usr/bin/env bash
# Grubenberechnung — Direktstart per Doppelklick
# Diesen Befehl einmalig im Terminal ausführen um die Datei startbar zu machen:
# chmod +x "Grubenberechnung Starten.command"

# Zum Projektordner wechseln
cd "$(dirname "$0")"

# Rust/Cargo Pfad setzen
export PATH="$HOME/.cargo/bin:$PATH"

# Prüfen ob Node-Module vorhanden
if [ ! -d "node_modules" ]; then
  echo "⏳ Erste Einrichtung — installiere Abhängigkeiten..."
  npm install
fi

echo "🚀 Grubenberechnung wird gestartet..."
npm run tauri dev
