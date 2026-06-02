import type { Auftrag } from '@/types'
import { Plus, Settings, Trash2 } from 'lucide-react'

interface Props {
  auftraege: Auftrag[]
  aktiveId: number | null
  firmenName: string
  onSelect: (id: number) => void
  onNew: () => void
  onDelete: (id: number) => void
  onSettings: () => void
}

export function Sidebar({ auftraege, aktiveId, firmenName, onSelect, onNew, onDelete, onSettings }: Props) {
  return (
    <div className="w-[220px] flex-shrink-0 bg-[#080d1a] border-r border-[#0d1830] flex flex-col">
      {/* App-Titel + Firmenname */}
      <div className="px-3 pt-3 pb-2 border-b border-[#0d1830]">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">⛏</span>
          <span className="text-xs font-semibold text-foreground">Grubenberechnung</span>
        </div>
        {firmenName && (
          <div className="text-[10px] text-accent mt-0.5 truncate">{firmenName}</div>
        )}
      </div>
      <div className="p-3 border-b border-[#0d1830]">
        <div className="text-[9px] uppercase tracking-widest text-[#334155] mb-2.5">Aufträge</div>
        <button
          onClick={onNew}
          className="w-full flex items-center gap-2 bg-[#1e3a5f] hover:bg-[#243f6a] text-accent border border-[#2d4f7c] rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
        >
          <Plus size={13} /> Neuer Auftrag
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-1.5">
        {auftraege.length === 0 && (
          <div className="text-center text-xs text-[#334155] mt-8 px-4">
            Noch keine Aufträge.<br />Erstelle deinen ersten.
          </div>
        )}
        {auftraege.map(a => (
          <div
            key={a.id}
            onClick={() => onSelect(a.id)}
            className={`group flex items-center rounded-md px-2.5 py-2 mb-0.5 cursor-pointer transition-colors ${
              aktiveId === a.id
                ? 'bg-[#0f2240] border-l-[3px] border-accent pl-[7px]'
                : 'hover:bg-[#0d1830]'
            }`}
          >
            <div className="flex-1 min-w-0">
              <div className={`text-xs font-medium truncate ${aktiveId === a.id ? 'text-[#93c5fd]' : 'text-foreground'}`}>
                {a.name}
              </div>
              <div className="text-[10px] text-[#334155] mt-0.5 truncate">
                {new Date(a.erstellt_am).toLocaleDateString('de-DE')}
              </div>
            </div>
            <button
              onClick={e => { e.stopPropagation(); onDelete(a.id) }}
              className="opacity-0 group-hover:opacity-100 text-[#334155] hover:text-destructive p-1 transition-all"
            >
              <Trash2 size={11} />
            </button>
          </div>
        ))}
      </div>

      <div className="p-2 border-t border-[#0d1830]">
        <button
          onClick={onSettings}
          className="w-full flex items-center gap-2 text-[#475569] hover:text-muted-foreground hover:bg-[#0d1830] rounded-md px-3 py-2 text-xs transition-colors"
        >
          <Settings size={13} /> Einstellungen
        </button>
      </div>
    </div>
  )
}
