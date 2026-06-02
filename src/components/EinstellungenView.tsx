import { useState } from 'react'
import type { Einstellungen } from '@/types'
import { AKZENT_PRESETS } from '@/types'
import { ArrowLeft, Save, Lock, Eye, EyeOff } from 'lucide-react'
import { applyAkzentFarbe } from '@/lib/theme'

// Passwort für Erweiterte Einstellungen (UI-Schutz)
const ERWEITERTES_PW = 'TTRRR2026!'

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
  const [pwEingabe, setPwEingabe] = useState('')
  const [pwSichtbar, setPwSichtbar] = useState(false)
  const [erweitertFreigegeben, setErweitertFreigegeben] = useState(false)
  const [pwFehler, setPwFehler] = useState(false)

  const set = (key: keyof typeof form) => (v: number) =>
    setForm(prev => ({ ...prev, [key]: v }))

  const handleFarbeWaehlen = (farbe: string) => {
    setForm(prev => ({ ...prev, akzent_farbe: farbe }))
    applyAkzentFarbe(farbe) // Live-Vorschau
  }

  const handlePwPruefen = () => {
    if (pwEingabe === ERWEITERTES_PW) {
      setErweitertFreigegeben(true)
      setPwFehler(false)
      setPwEingabe('')
    } else {
      setPwFehler(true)
    }
  }

  const handleSpeichern = () => {
    onSave({
      std_breite: form.std_breite,
      std_tiefe: form.std_tiefe,
      b_einheit: form.b_einheit,
      t_einheit: form.t_einheit,
      akzent_farbe: form.akzent_farbe,
      firmen_name: form.firmen_name,
    })
    onBack()
  }

  return (
    <div className="flex flex-col flex-1 bg-[#0a0f1e]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#0d1830]">
        <div>
          <div className="text-base font-semibold text-foreground">⚙ Einstellungen</div>
          <div className="text-xs text-[#334155] mt-0.5">Allgemein, Design und Berechnungsparameter</div>
        </div>
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground bg-[#0f2240] border border-[#1e3a5f] rounded-md px-3 py-1.5 transition-colors"
        >
          <ArrowLeft size={12} /> Zurück
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4">

        {/* ── Allgemein ── */}
        <div className="bg-[#080d1a] border border-[#0d1830] rounded-lg p-4 space-y-4">
          <div className="text-[10px] uppercase tracking-widest text-accent mb-2">🏢 Allgemein</div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-foreground">Firmenname</div>
              <div className="text-[10px] text-[#334155] mt-0.5">Erscheint im Auftragskopf</div>
            </div>
            <input
              type="text"
              value={form.firmen_name}
              onChange={e => setForm(prev => ({ ...prev, firmen_name: e.target.value }))}
              placeholder="z.B. Tiefbau GmbH"
              className="bg-[#0a0f1e] border border-[#1e2a40] rounded-md px-3 py-1.5 text-sm text-foreground w-44 outline-none focus:border-accent"
            />
          </div>
        </div>

        {/* ── Akzentfarbe ── */}
        <div className="bg-[#080d1a] border border-[#0d1830] rounded-lg p-4">
          <div className="text-[10px] uppercase tracking-widest text-accent mb-3">🎨 Akzentfarbe</div>
          <div className="flex gap-2 flex-wrap">
            {AKZENT_PRESETS.map(preset => (
              <button
                key={preset.main}
                onClick={() => handleFarbeWaehlen(preset.main)}
                title={preset.name}
                className={`w-9 h-9 rounded-full border-2 transition-all flex items-center justify-center ${
                  form.akzent_farbe === preset.main
                    ? 'border-white scale-110 shadow-lg'
                    : 'border-transparent hover:border-white/40 hover:scale-105'
                }`}
                style={{ background: preset.main }}
              >
                {form.akzent_farbe === preset.main && (
                  <span className="text-white text-xs font-bold">✓</span>
                )}
              </button>
            ))}
          </div>
          <div className="text-[10px] text-[#334155] mt-2">
            Aktiv: <span className="font-mono" style={{ color: form.akzent_farbe }}>{form.akzent_farbe}</span>
            {' — '}{AKZENT_PRESETS.find(p => p.main === form.akzent_farbe)?.name ?? 'Benutzerdefiniert'}
          </div>
        </div>

        {/* ── Standardgrube ── */}
        <div className="bg-[#080d1a] border border-[#0d1830] rounded-lg p-4 space-y-4">
          <div className="text-[10px] uppercase tracking-widest text-accent mb-2">📐 Standardgrube</div>
          <SettingRow
            label="Standard-Breite"
            desc="Breite der Referenzgrube (Basis für B-Faktor)"
            value={form.std_breite}
            onChange={set('std_breite')}
          />
          <SettingRow
            label="Standard-Tiefe"
            desc="Tiefe der Referenzgrube (Basis für T-Faktor)"
            value={form.std_tiefe}
            onChange={set('std_tiefe')}
          />
        </div>

        {/* ── Faktor-Einheiten ── */}
        <div className="bg-[#080d1a] border border-[#0d1830] rounded-lg p-4 space-y-4">
          <div className="text-[10px] uppercase tracking-widest text-accent mb-2">🔢 Faktor-Einheiten</div>
          <SettingRow
            label="Breiten-Faktor-Einheit"
            desc="Jede angefangene Einheit = +1 B-Faktor"
            value={form.b_einheit}
            onChange={set('b_einheit')}
          />
          <SettingRow
            label="Tiefen-Faktor-Einheit"
            desc="Jede angefangene Einheit = +1 T-Faktor (roh)"
            value={form.t_einheit}
            onChange={set('t_einheit')}
          />
        </div>

        {/* ── Erweiterte Einstellungen (passwortgeschützt) ── */}
        <div className="bg-[#080d1a] border border-[#0d1830] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Lock size={12} className="text-[#475569]" />
            <div className="text-[10px] uppercase tracking-widest text-[#475569]">Erweiterte Einstellungen</div>
          </div>

          {!erweitertFreigegeben ? (
            <div className="space-y-2">
              <div className="text-xs text-[#334155]">
                Formel und technische Parameter — geschützt durch Passwort.
              </div>
              <div className="flex gap-2 mt-3">
                <div className="relative flex-1">
                  <input
                    type={pwSichtbar ? 'text' : 'password'}
                    value={pwEingabe}
                    onChange={e => { setPwEingabe(e.target.value); setPwFehler(false) }}
                    onKeyDown={e => e.key === 'Enter' && handlePwPruefen()}
                    placeholder="Passwort eingeben"
                    className={`w-full bg-[#0a0f1e] border rounded-md px-3 py-2 pr-9 text-sm text-foreground outline-none transition-colors ${
                      pwFehler ? 'border-red-500/60' : 'border-[#1e2a40] focus:border-accent'
                    }`}
                  />
                  <button
                    onClick={() => setPwSichtbar(v => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[#334155] hover:text-muted-foreground"
                  >
                    {pwSichtbar ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <button
                  onClick={handlePwPruefen}
                  className="bg-[#1e2a40] hover:bg-[#1e3a5f] text-muted-foreground border border-[#1e2a40] rounded-md px-3 py-2 text-xs transition-colors"
                >
                  Entsperren
                </button>
              </div>
              {pwFehler && (
                <div className="text-xs text-red-400 mt-1">Falsches Passwort</div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-[10px] text-green-500 mb-2">
                <span>✓</span> Entsperrt
              </div>

              <div className="bg-[#0a0f1e] border border-[#0d1830] rounded-md p-3">
                <div className="text-[9px] text-[#334155] uppercase tracking-wide mb-2">Aktuelle Formel</div>
                <div className="text-xs text-accent-light font-mono leading-7">
                  B-Faktor = ⌈ (Breite − {form.std_breite}) / {form.b_einheit} ⌉<br />
                  T-Faktor = ⌈ (Tiefe − {form.std_tiefe}) / {form.t_einheit} ⌉ + B (wenn T-roh ≥ 1)
                </div>
              </div>

              <div className="text-[10px] text-[#334155] border border-[#0d1830] rounded-md p-2">
                Die Formel ändert sich automatisch wenn du Standard-Breite, Standard-Tiefe oder
                die Faktor-Einheiten oben anpasst.
              </div>

              <button
                onClick={() => setErweitertFreigegeben(false)}
                className="text-[10px] text-[#334155] hover:text-muted-foreground flex items-center gap-1 transition-colors"
              >
                <Lock size={10} /> Sperren
              </button>
            </div>
          )}
        </div>

        {/* Speichern */}
        <button
          onClick={handleSpeichern}
          className="flex items-center gap-2 bg-[#1e3a5f] hover:bg-[#243f6a] text-accent border border-[#2d4f7c] rounded-md px-5 py-2 text-sm font-semibold transition-colors"
        >
          <Save size={14} /> Speichern
        </button>
      </div>
    </div>
  )
}
