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
  main: string       // --app-accent
  light: string      // --app-accent-light
  lighter: string    // --app-accent-lighter (active item text)
  dim: string        // --app-accent-dim (button/chip backgrounds)
  dimHover: string   // --app-accent-dim-hover
  dimBorder: string  // --app-accent-dim-border
  dark: string       // --app-accent-dark (badge/chip dark bg)
}

export const AKZENT_PRESETS: AkzentPreset[] = [
  { name: 'Stahl-Blau', main: '#3b82f6', light: '#60a5fa', lighter: '#93c5fd', dim: '#1e3a5f', dimHover: '#243f6a', dimBorder: '#2d4f7c', dark: '#0f2240' },
  { name: 'Violett',    main: '#8b5cf6', light: '#a78bfa', lighter: '#c4b5fd', dim: '#2d1b69', dimHover: '#3b2182', dimBorder: '#4c1d95', dark: '#1e1246' },
  { name: 'Grün',       main: '#10b981', light: '#34d399', lighter: '#6ee7b7', dim: '#064e3b', dimHover: '#065f46', dimBorder: '#047857', dark: '#022c22' },
  { name: 'Amber',      main: '#f59e0b', light: '#fbbf24', lighter: '#fcd34d', dim: '#451a03', dimHover: '#78350f', dimBorder: '#92400e', dark: '#1c0a00' },
  { name: 'Rot',        main: '#ef4444', light: '#f87171', lighter: '#fca5a5', dim: '#7f1d1d', dimHover: '#991b1b', dimBorder: '#b91c1c', dark: '#450a0a' },
  { name: 'Cyan',       main: '#06b6d4', light: '#22d3ee', lighter: '#67e8f9', dim: '#083344', dimHover: '#0c4a6e', dimBorder: '#0e7490', dark: '#042f3d' },
  { name: 'Grau',       main: '#94a3b8', light: '#cbd5e1', lighter: '#e2e8f0', dim: '#1e2a3a', dimHover: '#243040', dimBorder: '#2d3a4a', dark: '#111827' },
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
