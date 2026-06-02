#!/usr/bin/env bash
# ╔══════════════════════════════════════════════════════╗
# ║  Grubenberechnung — Release für Mac + Windows        ║
# ║  Startet automatischen Build auf GitHub              ║
# ╚══════════════════════════════════════════════════════╝
set -e

VERSION=${1:-"v1.0.0"}

echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║  Release $VERSION wird erstellt...              ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""

# Prüfen ob Git Remote gesetzt ist
if ! git remote get-url origin &>/dev/null; then
  echo "❌ Kein GitHub Remote gesetzt."
  echo ""
  echo "Einmalig ausführen:"
  echo "  git remote add origin https://github.com/DEIN-USERNAME/grubenberechnung.git"
  echo "  git push -u origin main"
  echo ""
  exit 1
fi

# Sicherstellen dass alles committed ist
if [ -n "$(git status --porcelain)" ]; then
  echo "⏳ Änderungen werden committed..."
  git add -A
  git commit -m "chore: release $VERSION"
fi

# Tag erstellen und pushen → startet GitHub Actions Build
git tag -a "$VERSION" -m "Release $VERSION"
git push origin main
git push origin "$VERSION"

echo ""
echo "✅ Release $VERSION gestartet!"
echo ""
echo "GitHub baut jetzt automatisch:"
echo "  📦 macOS .dmg (Apple Silicon + Intel)"
echo "  📦 Windows .msi Installer"
echo ""
echo "Download in ca. 10 Minuten unter:"
REMOTE=$(git remote get-url origin | sed 's/\.git$//' | sed 's/git@github.com:/https:\/\/github.com\//')
echo "  $REMOTE/releases"
echo ""
open "$REMOTE/releases" 2>/dev/null || true
