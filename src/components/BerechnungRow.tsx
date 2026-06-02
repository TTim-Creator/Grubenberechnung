import { useState } from 'react'
import type { Berechnung } from '@/types'
import { X, Pencil, Check } from 'lucide-react'
import { ConfirmDialog } from './ConfirmDialog'

interface Props {
  berechnung: Berechnung
  index: number
  onDelete: (id: number) => void
  onRename: (id: number, name: string) => void
}

export function BerechnungRow({ berechnung, index, onDelete, onRename }: Props) {
  const b0 = berechnung.b_faktor === 0
  const t0 = berechnung.t_faktor === 0
  const [editMode, setEditMode] = useState(false)
  const [editValue, setEditValue] = useState(berechnung.bezeichnung)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const handleSave = () => {
    onRename(berechnung.id, editValue)
    setEditMode(false)
  }

  return (
    <div className="flex items-center gap-3 bg-[#080d1a] border border-[#0d1830] rounded-lg px-4 py-3 hover:border-[#1e2a40] transition-colors group">
      <div className="w-6 h-6 rounded-full bg-[var(--app-accent-dark)] flex items-center justify-center text-[10px] font-semibold text-accent flex-shrink-0">
        {index}
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-foreground">
          {berechnung.breite} cm × {berechnung.tiefe} cm
        </div>
        <div className="text-[9px] text-[#334155]">
          {new Date(berechnung.erstellt_am.length === 10
            ? parseInt(berechnung.erstellt_am) * 1000
            : berechnung.erstellt_am
          ).toLocaleString('de-DE', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' })}
        </div>
        {editMode ? (
          <div className="flex items-center gap-1.5 mt-1">
            <input
              autoFocus
              type="text"
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setEditMode(false) }}
              placeholder="Bezeichnung…"
              className="bg-[#0a0f1e] border border-[var(--app-accent-dim)] rounded px-2 py-0.5 text-xs text-foreground outline-none flex-1 min-w-0"
            />
            <button onClick={handleSave} className="text-accent hover:text-accent-light p-0.5">
              <Check size={12} />
            </button>
            <button onClick={() => setEditMode(false)} className="text-[#475569] hover:text-muted-foreground p-0.5">
              <X size={12} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1 mt-0.5">
            {berechnung.bezeichnung ? (
              <span className="text-[10px] text-accent-light truncate">{berechnung.bezeichnung}</span>
            ) : (
              <span className="text-[10px] text-[#334155]">Breite × Tiefe</span>
            )}
            <button
              onClick={() => { setEditValue(berechnung.bezeichnung); setEditMode(true) }}
              className="opacity-0 group-hover:opacity-100 text-[#334155] hover:text-muted-foreground transition-all p-0.5 flex-shrink-0"
              title="Bezeichnung bearbeiten"
            >
              <Pencil size={10} />
            </button>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
          b0 ? 'bg-[#0d1f0d] text-success border-[#14532d]' : 'bg-[var(--app-accent-dark)] text-accent border-[var(--app-accent-dim)]'
        }`}>
          B: {berechnung.b_faktor}
        </span>
        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
          t0 ? 'bg-[#0d1f0d] text-success border-[#14532d]' : 'bg-[var(--app-accent-dark)] text-accent-light border-[var(--app-accent-dim)]'
        }`}>
          T: {berechnung.t_faktor}
        </span>
      </div>

      <button
        onClick={() => setConfirmOpen(true)}
        className="text-[#1e2a40] hover:text-destructive transition-colors opacity-0 group-hover:opacity-100 p-1 flex-shrink-0"
      >
        <X size={14} />
      </button>

      <ConfirmDialog
        open={confirmOpen}
        titel="Berechnung löschen?"
        beschreibung={`${berechnung.breite} × ${berechnung.tiefe} cm${berechnung.bezeichnung ? ` — "${berechnung.bezeichnung}"` : ''} wird unwiderruflich gelöscht.`}
        onConfirm={() => { setConfirmOpen(false); onDelete(berechnung.id) }}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  )
}
