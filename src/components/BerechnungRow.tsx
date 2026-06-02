import type { Berechnung } from '@/types'
import { X } from 'lucide-react'

interface Props {
  berechnung: Berechnung
  index: number
  onDelete: (id: number) => void
}

export function BerechnungRow({ berechnung, index, onDelete }: Props) {
  const b0 = berechnung.b_faktor === 0
  const t0 = berechnung.t_faktor === 0

  return (
    <div className="flex items-center gap-3 bg-[#080d1a] border border-[#0d1830] rounded-lg px-4 py-3 hover:border-[#1e2a40] transition-colors group">
      <div className="w-6 h-6 rounded-full bg-[var(--app-accent-dark)] flex items-center justify-center text-[10px] font-semibold text-accent flex-shrink-0">
        {index}
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium text-foreground">
          {berechnung.breite} cm × {berechnung.tiefe} cm
        </div>
        <div className="text-[10px] text-[#334155] mt-0.5">Breite × Tiefe</div>
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
        onClick={() => onDelete(berechnung.id)}
        className="text-[#1e2a40] hover:text-destructive transition-colors opacity-0 group-hover:opacity-100 p-1"
      >
        <X size={14} />
      </button>
    </div>
  )
}
