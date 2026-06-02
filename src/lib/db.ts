import Database from '@tauri-apps/plugin-sql'
import type { Auftrag, Berechnung, Einstellungen, LizenzRecord } from '@/types'

let db: Database | null = null

async function getDb(): Promise<Database> {
  if (!db) db = await Database.load('sqlite:grubenberechnung.db')
  return db
}

// ── Einstellungen ────────────────────────────────────────────────────────────

export async function loadEinstellungen(): Promise<Einstellungen> {
  const conn = await getDb()
  const rows = await conn.select<Einstellungen[]>('SELECT * FROM einstellungen WHERE id = 1')
  return rows[0]
}

export async function saveEinstellungen(
  data: Omit<Einstellungen, 'id'>,
): Promise<void> {
  const conn = await getDb()
  await conn.execute(
    `UPDATE einstellungen
     SET std_breite=$1, std_tiefe=$2, b_einheit=$3, t_einheit=$4,
         akzent_farbe=$5, firmen_name=$6
     WHERE id=1`,
    [data.std_breite, data.std_tiefe, data.b_einheit, data.t_einheit,
     data.akzent_farbe, data.firmen_name],
  )
}

// ── Aufträge ─────────────────────────────────────────────────────────────────

export async function loadAuftraege(): Promise<Auftrag[]> {
  const conn = await getDb()
  return conn.select<Auftrag[]>(
    'SELECT * FROM auftraege ORDER BY erstellt_am DESC',
  )
}

export async function createAuftrag(name: string, adresse: string): Promise<Auftrag> {
  const conn = await getDb()
  const now = new Date().toISOString()
  const result = await conn.execute(
    'INSERT INTO auftraege (name, adresse, erstellt_am) VALUES ($1, $2, $3)',
    [name.trim(), adresse.trim(), now],
  )
  return { id: result.lastInsertId as number, name, adresse, erstellt_am: now }
}

export async function deleteAuftrag(id: number): Promise<void> {
  const conn = await getDb()
  await conn.execute('DELETE FROM auftraege WHERE id=$1', [id])
}

// ── Berechnungen ──────────────────────────────────────────────────────────────

export async function loadBerechnungen(auftragId: number): Promise<Berechnung[]> {
  const conn = await getDb()
  return conn.select<Berechnung[]>(
    'SELECT * FROM berechnungen WHERE auftrag_id=$1 ORDER BY erstellt_am ASC',
    [auftragId],
  )
}

export async function createBerechnung(
  auftragId: number,
  breite: number,
  tiefe: number,
  bFaktor: number,
  tFaktor: number,
  bezeichnung = '',
): Promise<Berechnung> {
  const conn = await getDb()
  const now = new Date().toISOString()
  const result = await conn.execute(
    `INSERT INTO berechnungen (auftrag_id, breite, tiefe, b_faktor, t_faktor, bezeichnung, erstellt_am)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [auftragId, breite, tiefe, bFaktor, tFaktor, bezeichnung.trim(), now],
  )
  return {
    id: result.lastInsertId as number,
    auftrag_id: auftragId,
    breite, tiefe,
    b_faktor: bFaktor,
    t_faktor: tFaktor,
    bezeichnung: bezeichnung.trim(),
    erstellt_am: now,
  }
}

export async function updateBezeichnung(id: number, bezeichnung: string): Promise<void> {
  const conn = await getDb()
  await conn.execute('UPDATE berechnungen SET bezeichnung=$1 WHERE id=$2', [bezeichnung.trim(), id])
}

export async function deleteBerechnung(id: number): Promise<void> {
  const conn = await getDb()
  await conn.execute('DELETE FROM berechnungen WHERE id=$1', [id])
}

// ── Lizenz ────────────────────────────────────────────────────────────────────

export async function loadLizenz(): Promise<LizenzRecord> {
  const conn = await getDb()
  const rows = await conn.select<LizenzRecord[]>('SELECT * FROM lizenz WHERE id=1')
  return rows[0]
}

export async function saveLizenz(data: Partial<Omit<LizenzRecord, 'id'>>): Promise<void> {
  const conn = await getDb()
  const fields = Object.keys(data)
    .map((k, i) => `${k}=$${i + 1}`)
    .join(', ')
  await conn.execute(`UPDATE lizenz SET ${fields} WHERE id=1`, Object.values(data))
}

// Speichert den Unix-Timestamp des letzten Online-Checks
export async function updateLetzterOnlineCheck(): Promise<void> {
  const conn = await getDb()
  const ts = Math.floor(Date.now() / 1000).toString()
  await conn.execute(`UPDATE lizenz SET letzter_check=$1 WHERE id=1`, [ts])
}
