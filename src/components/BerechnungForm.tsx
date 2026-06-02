import { useState, useRef } from 'react'
import type { Einstellungen } from '@/types'
import { berechne } from '@/lib/calc'
import { Check } from 'lucide-react'

interface Props {
  einstellungen: Einstellungen
  onAdd: (breite: number, tiefe: number, bFaktor: number, tFaktor: number, bezeichnung: string) => void
}

export function BerechnungForm({ einstellungen, onAdd }: Props) {
  const [breite, setBreite] = useState('')
  const [tiefe, setTiefe] = useState('')
  const [bezeichnung, setBezeichnung] = useState('')
  const breiteRef = useRef<HTMLInputElement>(null)

  const bVal = parseInt(breite) || 0
  const tVal = parseInt(tiefe) || 0
  const { b_faktor, t_faktor } = bVal > 0 && tVal > 0
    ? berechne(bVal, tVal, einstellungen)
    : { b_faktor: 0, t_faktor: 0 }

  const canSave = bVal > 0 && tVal > 0

  const handleSpeichern = () => {
    if (!canSave) return
    onAdd(bVal, tVal, b_faktor, t_faktor, bezeichnung)
    setBreite('')
    setTiefe('')
    setBezeichnung('')
    setTimeout(() => breiteRef.current?.focus(), 50)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSpeichern()
  }

  return (
    <div className="border-t border-[#0d1830] bg-[#080d1a] px-5 py-3">
      <div className="text-[9px] uppercase tracking-widest text-[#334155] mb-2">
        Neue Berechnung
      </div>
      <div className="flex items-end gap-2 flex-wrap">

        {/* Speichern-Button LINKS */}
        <button
          onClick={handleSpeichern}
          disabled={!canSave}
          className="flex items-center gap-1.5 bg-[var(--app-accent-dim)] hover:bg-[var(--app-accent-dim-hover)] disabled:opacity-40 disabled:cursor-not-allowed text-accent border border-[var(--app-accent-dim-border)] rounded-md px-4 py-2 text-xs font-semibold transition-colors"
        >
          <Check size={13} />
          Speichern
        </button>

        {/* Breite */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-muted-foreground uppercase tracking-wide">Breite</label>
          <div className="relative">
            <input
              type="number"
              min="1"
              ref={breiteRef}
              value={breite}
              onChange={e => setBreite(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="0"
              className="bg-[#0a0f1e] border border-[#1e2a40] rounded-md px-3 py-2 pr-8 text-sm text-foreground w-24 outline-none focus:border-accent transition-colors"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-[#334155]">cm</span>
          </div>
        </div>

        {/* Tiefe */}
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

        {/* Live-Vorschau */}
        {canSave && (
          <div className="bg-[var(--app-accent-dark)] border border-[var(--app-accent-dim)] rounded-md px-3 py-2">
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

        {/* Bezeichnung — immer sichtbar */}
        <div className="flex flex-col gap-1 flex-1 min-w-[160px]">
          <label className="text-[10px] text-muted-foreground uppercase tracking-wide">
            Bezeichnung <span className="text-[#334155] normal-case">(optional)</span>
          </label>
          <input
            type="text"
            value={bezeichnung}
            onChange={e => setBezeichnung(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="z.B. Hausanschluss Nord"
            className="bg-[#0a0f1e] border border-[#1e2a40] rounded-md px-3 py-2 text-sm text-foreground outline-none focus:border-accent transition-colors"
          />
        </div>

      </div>
    </div>
  )
}
