#!/usr/bin/env bash
set -e

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║   Grubenberechnung — Installer Build     ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# Rust-Pfad
export PATH="$HOME/.cargo/bin:$PATH"

echo "▶ Frontend bauen..."
npm run build

echo "▶ Tauri Installer erstellen (kann 5–10 Minuten dauern)..."
npm run tauri build

echo ""
echo "✅ Fertig! Installer-Dateien:"
echo ""

if [[ "$OSTYPE" == "darwin"* ]]; then
  echo "  📦 macOS (.dmg — zum Installieren öffnen):"
  find src-tauri/target/release/bundle/dmg -name "*.dmg" 2>/dev/null | while read f; do
    echo "     $f"
    open "$(dirname "$f")" 2>/dev/null || true
  done
  echo ""
  echo "  📱 macOS (.app — direkt startbar):"
  find src-tauri/target/release/bundle/macos -name "*.app" 2>/dev/null | while read f; do
    echo "     $f"
  done
else
  echo "  📦 Windows (.msi — Installer):"
  find src-tauri/target/release/bundle/msi -name "*.msi" 2>/dev/null | while read f; do
    echo "     $f"
  done
  echo ""
  echo "  📦 Windows (.exe — NSIS Installer):"
  find src-tauri/target/release/bundle/nsis -name "*.exe" 2>/dev/null | while read f; do
    echo "     $f"
  done
fi

echo ""
echo "  Den Installer auf dem Zielrechner ausführen → fertig installiert."
echo ""
