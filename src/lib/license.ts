import { invoke } from '@tauri-apps/api/core'
import type { LizenzRecord, LizenzStatus } from '@/types'
import { loadLizenz, saveLizenz } from './db'

export async function getLizenzStatus(): Promise<LizenzRecord> {
  return loadLizenz()
}

export async function aktiviereLizenz(key: string): Promise<{ ok: boolean; fehler?: string }> {
  try {
    const fingerprint: string = await invoke('get_fingerprint')
    const result: { gueltig: boolean; fehler?: string } = await invoke(
      'validate_license_online',
      { lizenzKey: key, fingerprint },
    )

    if (!result.gueltig) {
      return { ok: false, fehler: result.fehler ?? 'Ungültiger Lizenzschlüssel' }
    }

    await saveLizenz({
      lizenz_key: key,
      maschinen_id: fingerprint,
      aktiviert_am: new Date().toISOString(),
      letzter_check: new Date().toISOString(),
      status: 'aktiv' as LizenzStatus,
    })

    return { ok: true }
  } catch (e) {
    return { ok: false, fehler: String(e) }
  }
}

/** Stille Hintergrundprüfung — maximal alle 30 Tage */
export async function hintergrundCheck(): Promise<void> {
  const lizenz = await loadLizenz()
  if (lizenz.status !== 'aktiv' || !lizenz.lizenz_key || !lizenz.letzter_check) return

  const dreissigTageMs = 30 * 24 * 60 * 60 * 1000
  const letzterCheck = new Date(lizenz.letzter_check).getTime()
  if (Date.now() - letzterCheck < dreissigTageMs) return

  try {
    const gueltig: boolean = await invoke('check_license_background', {
      lizenzKey: lizenz.lizenz_key,
    })
    await saveLizenz({
      letzter_check: new Date().toISOString(),
      status: gueltig ? 'aktiv' : 'widerrufen',
    })
  } catch {
    // Kein Internet → Status beibehalten
  }
}
