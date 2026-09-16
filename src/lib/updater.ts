import { check } from '@tauri-apps/plugin-updater'
import { relaunch } from '@tauri-apps/plugin-process'

export interface UpdateInfo {
  version: string
  installiere: () => Promise<void>
}

/**
 * Prüft beim App-Start auf eine neue Version (GitHub Releases / latest.json).
 * Gibt null zurück wenn keine Version verfügbar ist oder die Prüfung fehlschlägt
 * (z. B. offline) — die App startet dann normal.
 */
export async function pruefeUpdate(): Promise<UpdateInfo | null> {
  try {
    const update = await check()
    if (!update) return null
    return {
      version: update.version,
      installiere: async () => {
        await update.downloadAndInstall()
        await relaunch()
      },
    }
  } catch (e) {
    console.error('Update-Prüfung fehlgeschlagen:', e)
    return null
  }
}
