/**
 * Creates a professional PNG icon for Grubenberechnung using sharp.
 * Generates a 1024x1024 PNG that Tauri's icon tool uses to create all sizes.
 */

import sharp from 'sharp'
import { writeFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const outPath = path.join(root, 'src-tauri', 'icons', 'app-icon-source.png')

// SVG with professional dark design
const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0d1a2e"/>
      <stop offset="100%" stop-color="#070c18"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1024" height="1024" rx="200" fill="url(#bg)"/>

  <!-- Accent glow circle -->
  <circle cx="512" cy="420" r="260" fill="#3b82f6" opacity="0.07"/>

  <!-- Pickaxe handle -->
  <rect x="492" y="500" width="40" height="300" rx="20"
        fill="#1e3a5f" transform="rotate(35 512 650)"/>
  <rect x="492" y="500" width="40" height="300" rx="20"
        fill="#3b82f6" opacity="0.6" transform="rotate(35 512 650)"/>

  <!-- Pickaxe head -->
  <path d="M 180 360 L 180 290 L 780 290 L 840 360 L 780 430 L 180 430 Z"
        fill="#1e3a5f" rx="20"/>
  <path d="M 180 360 L 180 290 L 780 290 L 840 360 L 780 430 L 180 430 Z"
        fill="#3b82f6" opacity="0.9" rx="20"/>

  <!-- Left point -->
  <polygon points="180,290 100,360 180,430" fill="#60a5fa"/>

  <!-- Shine on pick -->
  <path d="M 220 305 Q 550 295 720 305" stroke="#93c5fd" stroke-width="6"
        fill="none" opacity="0.4" stroke-linecap="round"/>

  <!-- Bottom text: GB -->
  <text x="512" y="760"
        font-family="'Helvetica Neue', Arial, sans-serif"
        font-size="200"
        font-weight="900"
        fill="#3b82f6"
        text-anchor="middle"
        letter-spacing="-8">GB</text>

  <!-- Subtle bottom line -->
  <line x1="180" y1="800" x2="844" y2="800"
        stroke="#1e3a5f" stroke-width="3" opacity="0.6"/>
</svg>`)

await sharp(svg, { density: 144 })
  .resize(1024, 1024)
  .png()
  .toFile(outPath)

console.log('✓ Icon-PNG erstellt:', outPath)
console.log('')
console.log('Jetzt Tauri-Icons generieren:')
console.log('  npm run tauri icon', outPath)
