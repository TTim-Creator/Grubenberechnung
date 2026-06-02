import { useState } from 'react'
import { aktiviereLizenz } from '@/lib/license'

interface Props {
  onAktiviert: () => void
}

export function LizenzView({ onAktiviert }: Props) {
  const [key, setKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [fehler, setFehler] = useState<string | null>(null)

  const handleAktivieren = async () => {
    if (!key.trim()) return
    setLoading(true)
    setFehler(null)
    const result = await aktiviereLizenz(key.trim())
    setLoading(false)
    if (result.ok) {
      onAktiviert()
    } else {
      setFehler(result.fehler ?? 'Aktivierung fehlgeschlagen')
    }
  }

  return (
    <div className="flex h-screen bg-background items-center justify-center">
      <div className="bg-[#080d1a] border border-[#1e2a40] rounded-xl p-8 w-full max-w-sm shadow-2xl">
        <div className="text-center mb-6">
          <div className="text-3xl mb-2">⛏</div>
          <h1 className="text-lg font-semibold text-foreground">Grubenberechnung</h1>
          <p className="text-xs text-muted-foreground mt-1">Bitte aktiviere deine Lizenz</p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-[10px] uppercase tracking-widest text-[#475569] block mb-1.5">
              Lizenzschlüssel
            </label>
            <input
              type="text"
              value={key}
              onChange={e => setKey(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAktivieren()}
              placeholder="XXXX-XXXX-XXXX-XXXX"
              className="w-full bg-[#0a0f1e] border border-[#1e2a40] rounded-md px-3 py-2.5 text-sm text-foreground outline-none focus:border-accent transition-colors font-mono"
              autoFocus
            />
          </div>

          {fehler && (
            <div className="bg-[#1a0a0a] border border-[#4b1111] rounded-md px-3 py-2 text-xs text-[#f87171]">
              {fehler}
            </div>
          )}

          <button
            onClick={handleAktivieren}
            disabled={!key.trim() || loading}
            className="w-full bg-[var(--app-accent-dim)] hover:bg-[var(--app-accent-dim-hover)] disabled:opacity-50 disabled:cursor-not-allowed text-accent border border-[var(--app-accent-dim-border)] rounded-md py-2.5 text-sm font-semibold transition-colors"
          >
            {loading ? 'Wird aktiviert…' : 'Aktivieren'}
          </button>
        </div>

        <p className="text-[10px] text-center text-[#334155] mt-5">
          Die Lizenz wird einmalig online validiert und<br />
          an diesen Computer gebunden.
        </p>
      </div>
    </div>
  )
}
