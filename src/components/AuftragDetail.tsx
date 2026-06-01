import type { Auftrag, Berechnung, Einstellungen } from '@/types'
import { BerechnungRow } from './BerechnungRow'
import { BerechnungForm } from './BerechnungForm'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Props {
  auftrag: Auftrag | null
  berechnungen: Berechnung[]
  einstellungen: Einstellungen
  onAddBerechnung: (b: number, t: number, bf: number, tf: number) => void
  onDeleteBerechnung: (id: number) => void
}

export function AuftragDetail({
  auftrag, berechnungen, einstellungen, onAddBerechnung, onDeleteBerechnung,
}: Props) {
  if (!auftrag) {
    return (
      <div className="flex-1 flex items-center justify-center text-[#334155] text-sm">
        Wähle einen Auftrag aus der Liste
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 bg-[#0a0f1e] min-h-0">
      <div className="flex items-start justify-between px-5 py-4 border-b border-[#0d1830]">
        <div>
          <div className="text-base font-semibold text-foreground">{auftrag.name}</div>
          <div className="text-xs text-[#334155] mt-0.5">
            {new Date(auftrag.erstellt_am).toLocaleDateString('de-DE')}
            {auftrag.adresse && ` · ${auftrag.adresse}`}
          </div>
        </div>
        <span className="bg-[#0f2240] text-accent text-[10px] px-2.5 py-1 rounded-full border border-[#1e3a5f]">
          {berechnungen.length} Berechnung{berechnungen.length !== 1 ? 'en' : ''}
        </span>
      </div>

      <div className="flex items-center justify-between px-5 py-2 border-b border-[#0d1830]">
        <span className="text-[10px] font-semibold text-accent-light uppercase tracking-wide">Berechnungen</span>
        <span className="text-[9px] text-[#334155]">
          Std: B={einstellungen.std_breite}cm T={einstellungen.std_tiefe}cm | B-Einh: {einstellungen.b_einheit}cm | T-Einh: {einstellungen.t_einheit}cm
        </span>
      </div>

      <ScrollArea className="flex-1 px-5 py-3">
        {berechnungen.length === 0 ? (
          <div className="text-center text-xs text-[#334155] mt-8">
            Noch keine Berechnungen.<br />Füge eine unten hinzu.
          </div>
        ) : (
          <div className="space-y-2">
            {berechnungen.map((b, i) => (
              <BerechnungRow
                key={b.id}
                berechnung={b}
                index={i + 1}
                onDelete={onDeleteBerechnung}
              />
            ))}
          </div>
        )}
      </ScrollArea>

      <BerechnungForm einstellungen={einstellungen} onAdd={onAddBerechnung} />
    </div>
  )
}
