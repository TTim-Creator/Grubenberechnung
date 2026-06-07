import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { startupLizenzCheck } from '@/lib/license'

interface Props {
  onAktiviert: () => void
}

export function LizenzAbgelaufenView({ onAktiviert }: Props) {
  const [checking, setChecking] = useState(false)
  const [fehler, setFehler] = useState<string | null>(null)

  const handlePruefen = async () => {
    setChecking(true)
    setFehler(null)
    const status = await startupLizenzCheck()
    setChecking(false)
    if (status === 'aktiv') {
      onAktiviert()
    } else {
      setFehler('Lizenz ist weiterhin nicht aktiv.')
    }
  }

  return (
    <div className="flex h-screen bg-background items-center justify-center">
      <div className="bg-[#080d1a] border border-[#4b1111] rounded-xl p-8 w-full max-w-sm shadow-2xl">
        <div className="text-center mb-6">
          <div className="text-3xl mb-2">⛏</div>
          <h1 className="text-lg font-semibold text-foreground">Grubenberechnung</h1>
          <div className="mt-3 bg-[#1a0a0a] border border-[#4b1111] rounded-md px-4 py-3">
            <p className="text-sm font-semibold text-[#f87171]">Lizenz abgelaufen</p>
            <p className="text-xs text-[#f87171]/70 mt-1">
              Deine Lizenz ist nicht mehr aktiv oder wurde widerrufen.
            </p>
          </div>
        </div>

        <p className="text-[11px] text-center text-muted-foreground leading-relaxed">
          Bitte kontaktiere deinen Anbieter, um die Lizenz zu erneuern oder zu reaktivieren.
        </p>

        {fehler && (
          <div className="mt-3 bg-[#1a0a0a] border border-[#4b1111] rounded-md px-3 py-2 text-xs text-[#f87171] text-center">
            {fehler}
          </div>
        )}

        <button
          onClick={handlePruefen}
          disabled={checking}
          className="mt-5 w-full flex items-center justify-center gap-2 bg-[#0d1830] hover:bg-[#1e2a40] disabled:opacity-50 disabled:cursor-not-allowed text-muted-foreground border border-[#1e2a40] hover:border-[#334155] rounded-md py-2.5 text-xs font-medium transition-colors"
        >
          <RefreshCw size={13} className={checking ? 'animate-spin' : ''} />
          {checking ? 'Wird geprüft…' : 'Lizenz erneut prüfen'}
        </button>

        <p className="text-[10px] text-center text-[#334155] mt-4">
          Die Verbindung zum Lizenzserver war erfolgreich —<br />
          die Lizenz ist auf diesem System nicht mehr gültig.
        </p>
      </div>
    </div>
  )
}
