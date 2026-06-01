export interface Einstellungen {
  id: number
  std_breite: number   // cm, Standard-Breite der Referenzgrube
  std_tiefe: number    // cm, Standard-Tiefe der Referenzgrube
  b_einheit: number    // cm, Stufengröße für B-Faktor
  t_einheit: number    // cm, Stufengröße für T-Faktor
}

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
