/**
 * Generiert das finale App-Icon: Option C — Technischer Querschnitt
 * Grube von der Seite mit Maßlinien B (Breite) und T (Tiefe)
 */

import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const outPath = path.join(root, 'src-tauri', 'icons', 'app-icon-source.png')

const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0d1a2e"/>
      <stop offset="100%" stop-color="#04080f"/>
    </linearGradient>
    <linearGradient id="erde" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1a2540"/>
      <stop offset="100%" stop-color="#111827"/>
    </linearGradient>
  </defs>

  <!-- Hintergrund -->
  <rect width="1024" height="1024" rx="160" fill="url(#bg)"/>

  <!-- Subtiler Glow-Kreis hinter der Grube -->
  <circle cx="512" cy="560" r="300" fill="#3b82f6" opacity="0.04"/>

  <!-- ═══ ERDOBERFLÄCHE ═══ -->
  <!-- Erdblock links -->
  <rect x="60" y="270" width="248" height="560" rx="6" fill="url(#erde)"/>
  <!-- Erdblock rechts -->
  <rect x="716" y="270" width="248" height="560" rx="6" fill="url(#erde)"/>
  <!-- Oberflächen-Streifen (Gras-ähnlich) -->
  <rect x="60" y="270" width="248" height="20" rx="4" fill="#1e3a5f" opacity="0.8"/>
  <rect x="716" y="270" width="248" height="20" rx="4" fill="#1e3a5f" opacity="0.8"/>

  <!-- Erdstrukturen (Textur-Hinweis) -->
  <line x1="80" y1="340" x2="280" y2="340" stroke="#1e2a40" stroke-width="2" opacity="0.5"/>
  <line x1="80" y1="420" x2="280" y2="420" stroke="#1e2a40" stroke-width="2" opacity="0.5"/>
  <line x1="80" y1="500" x2="280" y2="500" stroke="#1e2a40" stroke-width="2" opacity="0.5"/>
  <line x1="80" y1="580" x2="280" y2="580" stroke="#1e2a40" stroke-width="2" opacity="0.5"/>
  <line x1="80" y1="660" x2="280" y2="660" stroke="#1e2a40" stroke-width="2" opacity="0.5"/>
  <line x1="744" y1="340" x2="944" y2="340" stroke="#1e2a40" stroke-width="2" opacity="0.5"/>
  <line x1="744" y1="420" x2="944" y2="420" stroke="#1e2a40" stroke-width="2" opacity="0.5"/>
  <line x1="744" y1="500" x2="944" y2="500" stroke="#1e2a40" stroke-width="2" opacity="0.5"/>
  <line x1="744" y1="580" x2="944" y2="580" stroke="#1e2a40" stroke-width="2" opacity="0.5"/>
  <line x1="744" y1="660" x2="944" y2="660" stroke="#1e2a40" stroke-width="2" opacity="0.5"/>

  <!-- ═══ GRUBE ═══ -->
  <!-- Grube Innenraum -->
  <path d="M 308 270 L 308 760 Q 512 820 716 760 L 716 270 Z"
        fill="#070c18"/>

  <!-- Grube Kontur — blau leuchtend -->
  <path d="M 308 270 L 308 760 Q 512 820 716 760 L 716 270"
        fill="none" stroke="#3b82f6" stroke-width="5" stroke-linejoin="round"
        stroke-linecap="round"/>

  <!-- Grube-Boden Akzent -->
  <ellipse cx="512" cy="793" rx="204" ry="22" fill="#1e3a5f" opacity="0.5"/>

  <!-- ═══ MAßLINIE TIEFE (rechts) ═══ -->
  <!-- Vertikale Linie -->
  <line x1="760" y1="270" x2="760" y2="770" stroke="#3b82f6" stroke-width="3"
        stroke-dasharray="12,7" stroke-linecap="round"/>
  <!-- Oben Pfeil -->
  <line x1="738" y1="270" x2="782" y2="270" stroke="#3b82f6" stroke-width="3.5" stroke-linecap="round"/>
  <polygon points="760,240 748,275 772,275" fill="#3b82f6"/>
  <!-- Unten Pfeil -->
  <line x1="738" y1="770" x2="782" y2="770" stroke="#60a5fa" stroke-width="3.5" stroke-linecap="round"/>
  <polygon points="760,800 748,765 772,765" fill="#60a5fa"/>
  <!-- T-Label -->
  <rect x="770" y="490" width="76" height="40" rx="8" fill="#0f2240" stroke="#1e3a5f" stroke-width="1.5"/>
  <text x="808" y="517" font-family="'Helvetica Neue', Arial, sans-serif"
        font-size="30" font-weight="800" fill="#3b82f6" text-anchor="middle">T</text>

  <!-- ═══ MAßLINIE BREITE (oben) ═══ -->
  <!-- Horizontale Linie -->
  <line x1="308" y1="180" x2="716" y2="180" stroke="#3b82f6" stroke-width="3"
        stroke-dasharray="12,7" stroke-linecap="round"/>
  <!-- Links Pfeil -->
  <line x1="308" y1="158" x2="308" y2="202" stroke="#3b82f6" stroke-width="3.5" stroke-linecap="round"/>
  <polygon points="278,180 313,168 313,192" fill="#3b82f6"/>
  <!-- Rechts Pfeil -->
  <line x1="716" y1="158" x2="716" y2="202" stroke="#60a5fa" stroke-width="3.5" stroke-linecap="round"/>
  <polygon points="746,180 711,168 711,192" fill="#60a5fa"/>
  <!-- B-Label -->
  <rect x="472" y="155" width="80" height="42" rx="8" fill="#0f2240" stroke="#1e3a5f" stroke-width="1.5"/>
  <text x="512" y="184" font-family="'Helvetica Neue', Arial, sans-serif"
        font-size="30" font-weight="800" fill="#3b82f6" text-anchor="middle">B</text>

  <!-- ═══ FAKTOR-ANZEIGE (in der Grube) ═══ -->
  <rect x="400" y="480" width="224" height="88" rx="16" fill="#0d1a2e"
        stroke="#1e3a5f" stroke-width="2"/>
  <!-- B-Faktor -->
  <text x="455" y="520" font-family="'Helvetica Neue', Arial, sans-serif"
        font-size="16" fill="#475569" font-weight="600" text-anchor="middle">B-FAK.</text>
  <text x="455" y="552" font-family="'Helvetica Neue', Arial, sans-serif"
        font-size="32" font-weight="900" fill="#3b82f6" text-anchor="middle">1</text>
  <!-- Trennstrich -->
  <line x1="512" y1="492" x2="512" y2="556" stroke="#1e3a5f" stroke-width="1.5"/>
  <!-- T-Faktor -->
  <text x="569" y="520" font-family="'Helvetica Neue', Arial, sans-serif"
        font-size="16" fill="#475569" font-weight="600" text-anchor="middle">T-FAK.</text>
  <text x="569" y="552" font-family="'Helvetica Neue', Arial, sans-serif"
        font-size="32" font-weight="900" fill="#60a5fa" text-anchor="middle">2</text>

  <!-- ═══ UNTERTITEL ═══ -->
  <text x="512" y="950" font-family="'Helvetica Neue', Arial, sans-serif"
        font-size="36" font-weight="700" fill="#1e3a5f" text-anchor="middle"
        letter-spacing="8">GRUBENBER.</text>
</svg>`)

await sharp(svg, { density: 150 })
  .resize(1024, 1024)
  .png()
  .toFile(outPath)

console.log('✓ Icon Option C gespeichert:', outPath)
