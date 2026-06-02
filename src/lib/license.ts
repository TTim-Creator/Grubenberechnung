import { invoke } from '@tauri-apps/api/core'
import Database from '@tauri-apps/plugin-sql'
import type { LizenzStatus } from '@/types'
import { loadLizenz, saveLizenz, updateLetzterOnlineCheck } from './db'

async function getDb() {
  return Database.load('sqlite:grubenberechnung.db')
}

/**
 * Startup-Check: vollständig in Rust — JS liest DB-Status NICHT direkt.
 * Rust validiert das HMAC-Token. DB-Manipulation wird erkannt.
 */
export async function startupLizenzCheck(): Promise<'aktiv' | 'inaktiv'> {
  try {
    const lizenz = await loadLizenz()
    if (!lizenz.lizenz_key || !lizenz.maschinen_id) return 'inaktiv'

    // auth_token aus DB lesen (separat von "status")
    const db = await getDb()
    const rows = await db.select<{ auth_token: string | null }[]>(
      'SELECT auth_token FROM lizenz WHERE id=1'
    )
    const token = rows[0]?.auth_token ?? ''

    const result: { gueltig: boolean; grund: string } = await invoke('startup_lizenz_check', {
      token,
      lizenzKey: lizenz.lizenz_key,
      fingerprint: lizenz.maschinen_id,
      letzterOnlineCheckIso: lizenz.letzter_check ?? '0',
    })

    if (result.gueltig) {
      if (result.grund === 'online_ok') await updateLetzterOnlineCheck()
      return 'aktiv'
    }

    // Lizenz ungültig oder Token manipuliert
    if (result.grund.startsWith('online_ungueltig') || result.grund === 'token_ungueltig') {
      await saveLizenz({ status: 'widerrufen' as LizenzStatus })
    }
    return 'inaktiv'
  } catch {
    return 'inaktiv'
  }
}

/**
 * Aktivierung: Rust validiert online + erzeugt HMAC-Token.
 * Token wird in DB gespeichert — nicht "aktiv" als Klartext.
 */
export async function aktiviereLizenz(key: string): Promise<{ ok: boolean; fehler?: string }> {
  try {
    const fingerprint: string = await invoke('get_fingerprint')
    const result: { gueltig: boolean; token?: string; fehler?: string } = await invoke(
      'validate_license_online',
      { lizenzKey: key, fingerprint },
    )

    if (!result.gueltig) {
      return { ok: false, fehler: result.fehler ?? 'Ungültiger Lizenzschlüssel' }
    }

    const now = Math.floor(Date.now() / 1000).toString()

    await saveLizenz({
      lizenz_key: key,
      maschinen_id: fingerprint,
      aktiviert_am: now,
      letzter_check: now,
      status: 'aktiv' as LizenzStatus,
    })

    // HMAC-Token separat in auth_token Spalte speichern
    if (result.token) {
      const db = await getDb()
      await db.execute('UPDATE lizenz SET auth_token=$1 WHERE id=1', [result.token])
    }

    return { ok: true }
  } catch (e) {
    return { ok: false, fehler: String(e) }
  }
}
