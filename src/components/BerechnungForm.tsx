import { useState } from 'react'
import type { Einstellungen } from '@/types'
import { berechne } from '@/lib/calc'
import { Plus, Check, X } from 'lucide-react'

interface Props {
  einstellungen: Einstellungen
  onAdd: (breite: number, tiefe: number, bFaktor: number, tFaktor: number, bezeichnung: string) => void
}

export function BerechnungForm({ einstellungen, onAdd }: Props) {
  const [breite, setBreite] = useState('')
  const [tiefe, setTiefe] = useState('')
  const [bezeichnung, setBezeichnung] = useState('')
  const [bestaetigen, setBestaetigen] = useState(false)

  const bVal = parseInt(breite) || 0
  const tVal = parseInt(tiefe) || 0
  const { b_faktor, t_faktor } = bVal > 0 && tVal > 0
    ? berechne(bVal, tVal, einstellungen)
    : { b_faktor: 0, t_faktor: 0 }

  const canCalculate = bVal > 0 && tVal > 0

  const handleBerechnen = () => {
    if (!canCalculate) return
    setBestaetigen(true)
  }

  const handleBestaetigen = () => {
    onAdd(bVal, tVal, b_faktor, t_faktor, bezeichnung)
    setBreite('')
    setTiefe('')
    setBezeichnung('')
    setBestaetigen(false)
  }

  const handleAbbrechen = () => {
    setBestaetigen(false)
    setBezeichnung('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !bestaetigen) handleBerechnen()
  }

  if (bestaetigen) {
    return (
      <div className="border-t border-[#0d1830] bg-[#080d1a] px-5 py-3">
        <div className="text-[9px] uppercase tracking-widest text-[#334155] mb-2">
          Berechnung bestätigen
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Ergebnis-Anzeige */}
          <div className="bg-[var(--app-accent-dark)] border border-[var(--app-accent-dim)] rounded-md px-4 py-2 flex gap-4">
            <div className="text-center">
              <div className="text-[9px] text-[#475569] mb-0.5">Breite × Tiefe</div>
              <div className="text-xs font-medium text-foreground">{bVal} × {tVal} cm</div>
            </div>
            <div className="text-[var(--app-accent-dim)] self-center">·</div>
            <div className="flex gap-3">
              <div className="text-center">
                <div className="text-[9px] text-[#475569] mb-0.5">B-Faktor</div>
                <div className="text-base font-bold text-accent">{b_faktor}</div>
              </div>
              <div className="text-center">
                <div className="text-[9px] text-[#475569] mb-0.5">T-Faktor</div>
                <div className="text-base font-bold text-accent-light">{t_faktor}</div>
              </div>
            </div>
          </div>

          {/* Optionale Bezeichnung */}
          <div className="flex flex-col gap-1 flex-1 min-w-[140px]">
            <label className="text-[10px] text-muted-foreground uppercase tracking-wide">
              Bezeichnung <span className="text-[#334155] normal-case">(optional)</span>
            </label>
            <input
              type="text"
              value={bezeichnung}
              onChange={e => setBezeichnung(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleBestaetigen()}
              placeholder="z.B. Hausanschluss Nord"
              autoFocus
              className="bg-[#0a0f1e] border border-[#1e2a40] rounded-md px-3 py-2 text-sm text-foreground outline-none focus:border-accent transition-colors"
            />
          </div>

          {/* Aktions-Buttons */}
          <div className="flex gap-2 self-end">
            <button
              onClick={handleAbbrechen}
              className="flex items-center gap-1 text-[#475569] hover:text-muted-foreground border border-[#1e2a40] rounded-md px-3 py-2 text-xs transition-colors"
            >
              <X size={13} /> Zurück
            </button>
            <button
              onClick={handleBestaetigen}
              className="flex items-center gap-1.5 bg-[var(--app-accent-dim)] hover:bg-[var(--app-accent-dim-hover)] text-accent border border-[var(--app-accent-dim-border)] rounded-md px-4 py-2 text-xs font-semibold transition-colors"
            >
              <Check size={13} /> Speichern
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="border-t border-[#0d1830] bg-[#080d1a] px-5 py-3">
      <div className="text-[9px] uppercase tracking-widest text-[#334155] mb-2">
        Neue Berechnung
      </div>
      <div className="flex items-end gap-2 flex-wrap">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-muted-foreground uppercase tracking-wide">Breite</label>
          <div className="relative">
            <input
              type="number"
              min="1"
              value={breite}
              onChange={e => setBreite(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="0"
              className="bg-[#0a0f1e] border border-[#1e2a40] rounded-md px-3 py-2 pr-8 text-sm text-foreground w-24 outline-none focus:border-accent transition-colors"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-[#334155]">cm</span>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-muted-foreground uppercase tracking-wide">Tiefe</label>
          <div className="relative">
            <input
              type="number"
              min="1"
              value={tiefe}
              onChange={e => setTiefe(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="0"
              className="bg-[#0a0f1e] border border-[#1e2a40] rounded-md px-3 py-2 pr-8 text-sm text-foreground w-24 outline-none focus:border-accent transition-colors"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-[#334155]">cm</span>
          </div>
        </div>

        {canCalculate && (
          <div className="bg-[var(--app-accent-dark)] border border-[var(--app-accent-dim)] rounded-md px-3 py-2 min-w-[110px]">
            <div className="text-[9px] text-[#334155] mb-1 uppercase">Vorschau</div>
            <div className="flex gap-3">
              <div>
                <span className="text-base font-bold text-accent">B: {b_faktor}</span>
                <div className="text-[9px] text-[#475569]">Breite</div>
              </div>
              <div className="text-[var(--app-accent-dim)] self-center">|</div>
              <div>
                <span className="text-base font-bold text-accent-light">T: {t_faktor}</span>
                <div className="text-[9px] text-[#475569]">Tiefe</div>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleBerechnen}
          disabled={!canCalculate}
          className="flex items-center gap-1.5 bg-[var(--app-accent-dim)] hover:bg-[var(--app-accent-dim-hover)] disabled:opacity-40 disabled:cursor-not-allowed text-accent border border-[var(--app-accent-dim-border)] rounded-md px-4 py-2 text-xs font-semibold transition-colors"
        >
          <Plus size={14} />
          Hinzufügen
        </button>
      </div>
    </div>
  )
}
