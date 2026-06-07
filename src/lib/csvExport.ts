import type { Auftrag, Berechnung } from '@/types'

function formatDatum(value: string): string {
  const ts = value.length <= 10 && !value.includes('-')
    ? parseInt(value) * 1000
    : value
  return new Date(ts).toLocaleString('de-DE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function escapeCsv(value: string | number): string {
  const str = String(value)
  if (str.includes(';') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export function exportAuftragAlsCsv(auftrag: Auftrag, berechnungen: Berechnung[]): void {
  const zeilen: string[] = []

  // BOM für korrekte UTF-8-Darstellung in Excel
  const bom = '﻿'

  // Auftragskopf
  zeilen.push(`Auftrag;${escapeCsv(auftrag.name)}`)
  zeilen.push(`Adresse;${escapeCsv(auftrag.adresse || '—')}`)
  zeilen.push(`Erstellt am;${escapeCsv(new Date(auftrag.erstellt_am).toLocaleDateString('de-DE'))}`)
  zeilen.push(`Anzahl Berechnungen;${berechnungen.length}`)
  zeilen.push('')

  // Tabellenheader
  zeilen.push('Nr.;Bezeichnung;Breite (cm);Tiefe (cm);B-Faktor;T-Faktor;Datum')

  // Berechnungszeilen (in Anzeigereihenfolge, also umgekehrt für älteste zuerst)
  const sortiert = [...berechnungen].reverse()
  sortiert.forEach((b, i) => {
    zeilen.push([
      i + 1,
      escapeCsv(b.bezeichnung || ''),
      b.breite,
      b.tiefe,
      b.b_faktor,
      b.t_faktor,
      escapeCsv(formatDatum(b.erstellt_am)),
    ].join(';'))
  })

  const inhalt = bom + zeilen.join('\r\n')
  const blob = new Blob([inhalt], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const dateiname = `${auftrag.name.replace(/[^a-zA-Z0-9äöüÄÖÜß\s_-]/g, '').trim()}_Berechnungen.csv`

  const link = document.createElement('a')
  link.href = url
  link.download = dateiname
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
