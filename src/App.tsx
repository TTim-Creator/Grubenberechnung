import { useState, useEffect } from 'react'
import { Layout } from './components/Layout'
import { LizenzView } from './components/LizenzView'
import { startupLizenzCheck } from './lib/license'
import { loadEinstellungen } from './lib/db'
import { applyAkzentFarbe } from './lib/theme'

export default function App() {
  const [lizenzStatus, setLizenzStatus] = useState<'prüfen' | 'aktiv' | 'inaktiv'>('prüfen')

  useEffect(() => {
    loadEinstellungen().then(e => applyAkzentFarbe(e?.akzent_farbe ?? '#3b82f6')).catch(() => {})
    startupLizenzCheck().then(status => setLizenzStatus(status))
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
