import type { BerechnungsErgebnis, Einstellungen } from '@/types'

/** Breiten-Faktor: jede angefangene Einheit über Standard = +1 */
export function berechneB(breite: number, stdBreite: number, bEinheit: number): number {
  if (breite <= stdBreite) return 0
  return Math.ceil((breite - stdBreite) / bEinheit)
}

/**
 * Tiefen-Faktor: B-Faktor wird nur addiert wenn raw_T >= 1.
 * Ist die Tiefe ≤ Standard, bleibt T-Faktor = 0 unabhängig von B.
 */
export function berechneT(
  tiefe: number,
  stdTiefe: number,
  tEinheit: number,
  bFaktor: number,
): number {
  if (tiefe <= stdTiefe) return 0
  const rawT = Math.ceil((tiefe - stdTiefe) / tEinheit)
  return rawT + bFaktor
}

/** Kombinierte Berechnung beider Faktoren */
export function berechne(
  breite: number,
  tiefe: number,
  cfg: Pick<Einstellungen, 'std_breite' | 'std_tiefe' | 'b_einheit' | 't_einheit'>,
): BerechnungsErgebnis {
  const b_faktor = berechneB(breite, cfg.std_breite, cfg.b_einheit)
  const t_faktor = berechneT(tiefe, cfg.std_tiefe, cfg.t_einheit, b_faktor)
  return { b_faktor, t_faktor }
}
