export interface Einstellungen {
  id: number
  std_breite: number   // cm, Standard-Breite der Referenzgrube
  std_tiefe: number    // cm, Standard-Tiefe der Referenzgrube
  b_einheit: number    // cm, Stufengröße für B-Faktor
  t_einheit: number    // cm, Stufengröße für T-Faktor
  akzent_farbe: string // Hex-Farbe für Akzent-Elemente
  firmen_name: string  // Firmenname für Auftragskopf
}

export interface AkzentPreset {
  name: string
  main: string
  light: string
  dim: string
}

export const AKZENT_PRESETS: AkzentPreset[] = [
  { name: 'Stahl-Blau',  main: '#3b82f6', light: '#60a5fa', dim: '#1e3a5f' },
  { name: 'Violett',     main: '#8b5cf6', light: '#a78bfa', dim: '#2d1b69' },
  { name: 'Grün',        main: '#10b981', light: '#34d399', dim: '#0d2418' },
  { name: 'Amber',       main: '#f59e0b', light: '#fbbf24', dim: '#292100' },
  { name: 'Rot',         main: '#ef4444', light: '#f87171', dim: '#3b0808' },
  { name: 'Cyan',        main: '#06b6d4', light: '#22d3ee', dim: '#083344' },
  { name: 'Grau',        main: '#94a3b8', light: '#cbd5e1', dim: '#1e2a40' },
]

export interface Auftrag {
  id: number
  name: string
  adresse: string
  erstellt_am: string  // ISO 8601
}

export interface Berechnung {
  id: number
  auftrag_id: number
  breite: number       // cm
  tiefe: number        // cm
  b_faktor: number
  t_faktor: number
  erstellt_am: string
}

export type LizenzStatus = 'inaktiv' | 'aktiv' | 'widerrufen'

export interface LizenzRecord {
  id: number
  lizenz_key: string | null
  maschinen_id: string | null
  aktiviert_am: string | null
  letzter_check: string | null
  status: LizenzStatus
}

export interface BerechnungsEingabe {
  breite: number
  tiefe: number
}

export interface BerechnungsErgebnis {
  b_faktor: number
  t_faktor: number
}
