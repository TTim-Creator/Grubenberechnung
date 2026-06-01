import { useState } from 'react'
import type { Einstellungen } from '@/types'
import { ArrowLeft, Save } from 'lucide-react'

interface Props {
  einstellungen: Einstellungen
  onSave: (data: Omit<Einstellungen, 'id'>) => void
  onBack: () => void
}

function SettingRow({
  label, desc, value, onChange,
}: {
  label: string; desc: string; value: number; onChange: (v: number) => void
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-sm text-foreground">{label}</div>
        <div className="text-[10px] text-[#334155] mt-0.5">{desc}</div>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min="1"
          value={value}
          onChange={e => onChange(parseInt(e.target.value) || 1)}
          className="bg-[#0a0f1e] border border-[#1e2a40] rounded-md px-2 py-1.5 text-sm text-foreground w-16 text-right outline-none focus:border-accent"
        />
        <span className="text-xs text-muted-foreground">cm</span>
      </div>
    </div>
  )
}

export function EinstellungenView({ einstellungen, onSave, onBack }: Props) {
  const [form, setForm] = useState({ ...einstellungen })

  const set = (key: keyof typeof form) => (v: number) =>
    setForm(prev => ({ ...prev, [key]: v }))

  return (
    <div className="flex flex-col flex-1 bg-[#0a0f1e]">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#0d1830]">
        <div>
          <div className="text-base font-semibold text-foreground">⚙ Einstellungen</div>
          <div className="text-xs text-[#334155] mt-0.5">Standard-Werte und Faktor-Einheiten</div>
        </div>
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground bg-[#0f2240] border border-[#1e3a5f] rounded-md px-3 py-1.5 transition-colors"
        >
          <ArrowLeft size={12} /> Zurück
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        <div className="bg-[#080d1a] border border-[#0d1830] rounded-lg p-4 space-y-4">
          <div className="text-[10px] uppercase tracking-widest text-accent mb-2">📐 Standardgrube</div>
          <SettingRow label="Standard-Breite" desc="Breite der Referenzgrube (Basis für B-Faktor)" value={form.std_breite} onChange={set('std_breite')} />
          <SettingRow label="Standard-Tiefe" desc="Tiefe der Referenzgrube (Basis für T-Faktor)" value={form.std_tiefe} onChange={set('std_tiefe')} />
        </div>

        <div className="bg-[#080d1a] border border-[#0d1830] rounded-lg p-4 space-y-4">
          <div className="text-[10px] uppercase tracking-widest text-accent mb-2">🔢 Faktor-Einheiten</div>
          <SettingRow label="Breiten-Faktor-Einheit" desc="Jede angefangene Einheit = +1 B-Faktor" value={form.b_einheit} onChange={set('b_einheit')} />
          <SettingRow label="Tiefen-Faktor-Einheit" desc="Jede angefangene Einheit = +1 T-Faktor (roh)" value={form.t_einheit} onChange={set('t_einheit')} />

          <div className="bg-[#0a0f1e] border border-[#0d1830] rounded-md p-3 mt-2">
            <div className="text-[9px] text-[#334155] uppercase tracking-wide mb-2">Aktuelle Formel</div>
            <div className="text-xs text-accent-light font-mono leading-7">
              B-Faktor = ⌈ (Breite − {form.std_breite}) / {form.b_einheit} ⌉<br />
              T-Faktor = ⌈ (Tiefe − {form.std_tiefe}) / {form.t_einheit} ⌉ + B (wenn T-roh ≥ 1)
            </div>
          </div>
        </div>

        <button
          onClick={() => { onSave({ std_breite: form.std_breite, std_tiefe: form.std_tiefe, b_einheit: form.b_einheit, t_einheit: form.t_einheit }); onBack() }}
          className="flex items-center gap-2 bg-[#1e3a5f] hover:bg-[#243f6a] text-accent border border-[#2d4f7c] rounded-md px-5 py-2 text-sm font-semibold transition-colors"
        >
          <Save size={14} /> Speichern
        </button>
      </div>
    </div>
  )
}
