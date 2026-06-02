import { AKZENT_PRESETS } from '@/types'

export function applyAkzentFarbe(farbe: string) {
  const preset = AKZENT_PRESETS.find(p => p.main === farbe) ?? AKZENT_PRESETS[0]
  document.documentElement.style.setProperty('--app-accent', preset.main)
  document.documentElement.style.setProperty('--app-accent-light', preset.light)
  document.documentElement.style.setProperty('--app-accent-dim', preset.dim)
}
