import { useState, useEffect } from 'react'
import { Layout } from './components/Layout'
import { LizenzView } from './components/LizenzView'
import { getLizenzStatus, hintergrundCheck } from './lib/license'
import { loadEinstellungen } from './lib/db'
import { AKZENT_PRESETS } from './types'

export function applyAkzentFarbe(farbe: string) {
  const preset = AKZENT_PRESETS.find(p => p.main === farbe) ?? AKZENT_PRESETS[0]
  document.documentElement.style.setProperty('--app-accent', preset.main)
  document.documentElement.style.setProperty('--app-accent-light', preset.light)
  document.documentElement.style.setProperty('--app-accent-dim', preset.dim)
}

export default function App() {
  const [lizenzStatus, setLizenzStatus] = useState<'prüfen' | 'aktiv' | 'inaktiv'>('prüfen')

  useEffect(() => {
    // Akzentfarbe so früh wie möglich laden
    loadEinstellungen().then(e => applyAkzentFarbe(e?.akzent_farbe ?? '#3b82f6')).catch(() => {})

    getLizenzStatus().then(l => {
      setLizenzStatus(l.status === 'aktiv' ? 'aktiv' : 'inaktiv')
      if (l.status === 'aktiv') {
        hintergrundCheck()
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
