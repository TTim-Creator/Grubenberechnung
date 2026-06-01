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
