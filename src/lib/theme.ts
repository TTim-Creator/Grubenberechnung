import { AKZENT_PRESETS } from '@/types'

export function applyAkzentFarbe(farbe: string) {
  const preset = AKZENT_PRESETS.find(p => p.main === farbe) ?? AKZENT_PRESETS[0]
  const r = document.documentElement
  r.style.setProperty('--app-accent',          preset.main)
  r.style.setProperty('--app-accent-light',    preset.light)
  r.style.setProperty('--app-accent-lighter',  preset.lighter)
  r.style.setProperty('--app-accent-dim',      preset.dim)
  r.style.setProperty('--app-accent-dim-hover',   preset.dimHover)
  r.style.setProperty('--app-accent-dim-border',  preset.dimBorder)
  r.style.setProperty('--app-accent-dark',     preset.dark)
}
