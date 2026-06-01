import { describe, it, expect } from 'vitest'
import { berechneB, berechneT, berechne } from './calc'

describe('berechneB — Breiten-Faktor', () => {
  it('gibt 0 wenn Breite gleich Standard', () => {
    expect(berechneB(15, 15, 15)).toBe(0)
  })
  it('gibt 0 wenn Breite kleiner als Standard', () => {
    expect(berechneB(10, 15, 15)).toBe(0)
  })
  it('gibt 1 für genau eine Einheit über Standard', () => {
    expect(berechneB(30, 15, 15)).toBe(1)  // (30-15)/15 = 1
  })
  it('ceiling: 1cm über Einheitsgrenze → Faktor 2', () => {
    expect(berechneB(31, 15, 15)).toBe(2)  // ceil(16/15) = 2
  })
  it('gibt 2 für zwei Einheiten über Standard', () => {
    expect(berechneB(45, 15, 15)).toBe(2)  // (45-15)/15 = 2
  })
  it('respektiert andere Einheitsgröße', () => {
    expect(berechneB(40, 15, 10)).toBe(3)  // ceil((40-15)/10) = 3
  })
})

describe('berechneT — Tiefen-Faktor', () => {
  it('gibt 0 wenn Tiefe gleich Standard', () => {
    expect(berechneT(45, 45, 15, 0)).toBe(0)
  })
  it('gibt 0 wenn Tiefe kleiner als Standard', () => {
    expect(berechneT(30, 45, 15, 0)).toBe(0)
  })
  it('B-Faktor wird NICHT addiert wenn raw_T = 0', () => {
    expect(berechneT(45, 45, 15, 1)).toBe(0)  // B=1 aber Tiefe=Standard → T=0
  })
  it('addiert B-Faktor wenn raw_T >= 1', () => {
    expect(berechneT(60, 45, 15, 1)).toBe(2)  // raw_T=1, B=1 → 1+1=2
  })
  it('ceiling: 1cm über Standard → raw_T = 1', () => {
    expect(berechneT(46, 45, 15, 0)).toBe(1)  // ceil(1/15)=1
  })
  it('kein B-Faktor wenn B=0 und raw_T>=1', () => {
    expect(berechneT(60, 45, 15, 0)).toBe(1)  // raw_T=1, B=0 → 1
  })
  it('B=2, raw_T=2 → T=4', () => {
    expect(berechneT(75, 45, 15, 2)).toBe(4)
  })
})

describe('berechne — Kombiniert', () => {
  it('Standardmaß → B:0 T:0', () => {
    const cfg = { std_breite: 15, std_tiefe: 45, b_einheit: 15, t_einheit: 15 }
    expect(berechne(15, 45, cfg)).toEqual({ b_faktor: 0, t_faktor: 0 })
  })
  it('30x60 mit Standard-Config → B:1 T:2', () => {
    const cfg = { std_breite: 15, std_tiefe: 45, b_einheit: 15, t_einheit: 15 }
    expect(berechne(30, 60, cfg)).toEqual({ b_faktor: 1, t_faktor: 2 })
  })
  it('45x75 → B:2 T:4', () => {
    const cfg = { std_breite: 15, std_tiefe: 45, b_einheit: 15, t_einheit: 15 }
    expect(berechne(45, 75, cfg)).toEqual({ b_faktor: 2, t_faktor: 4 })
  })
  it('30x45 → B:1 T:0 (nur Breite größer)', () => {
    const cfg = { std_breite: 15, std_tiefe: 45, b_einheit: 15, t_einheit: 15 }
    expect(berechne(30, 45, cfg)).toEqual({ b_faktor: 1, t_faktor: 0 })
  })
})
