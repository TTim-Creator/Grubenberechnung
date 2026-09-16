import { useEffect, useState } from 'react'
import { Sidebar } from './Sidebar'
import { AuftragDetail } from './AuftragDetail'
import { AuftragModal } from './AuftragModal'
import { EinstellungenView } from './EinstellungenView'
import { Button } from './ui/button'
import { useAuftraege } from '@/hooks/useAuftraege'
import { useBerechnungen } from '@/hooks/useBerechnungen'
import { useEinstellungen } from '@/hooks/useEinstellungen'
import { pruefeUpdate, type UpdateInfo } from '@/lib/updater'

export function Layout() {
  const { auftraege, neuerAuftrag, loescheAuftrag } = useAuftraege()
  const { einstellungen, speichern } = useEinstellungen()
  const [aktiveAuftragId, setAktiveAuftragId] = useState<number | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [update, setUpdate] = useState<UpdateInfo | null>(null)
  const [updateLaeuft, setUpdateLaeuft] = useState(false)

  useEffect(() => {
    pruefeUpdate().then(setUpdate)
  }, [])

  const handleUpdate = async () => {
    if (!update) return
    setUpdateLaeuft(true)
    try {
      await update.installiere()
    } catch (e) {
      console.error('Update fehlgeschlagen:', e)
      setUpdateLaeuft(false)
    }
  }

  const { berechnungen, addBerechnung, loescheBerechnung, benenneBerechnung } = useBerechnungen(aktiveAuftragId)

  const aktiveAuftrag = auftraege.find(a => a.id === aktiveAuftragId) ?? null

  const handleNewAuftrag = async (name: string, adresse: string) => {
    const a = await neuerAuftrag(name, adresse)
    setAktiveAuftragId(a.id)
  }

  return (
    <div className="flex h-screen flex-col bg-background overflow-hidden">
      {update && (
        <div className="flex items-center justify-between gap-3 border-b bg-muted px-4 py-2 text-sm">
          <span>
            Version {update.version} ist verfügbar.
          </span>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handleUpdate} disabled={updateLaeuft}>
              {updateLaeuft ? 'Wird installiert…' : 'Jetzt aktualisieren'}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setUpdate(null)} disabled={updateLaeuft}>
              Später
            </Button>
          </div>
        </div>
      )}
      <div className="flex flex-1 overflow-hidden">
      <Sidebar
        auftraege={auftraege}
        aktiveId={aktiveAuftragId}
        firmenName={einstellungen.firmen_name ?? ''}
        onSelect={id => { setAktiveAuftragId(id); setShowSettings(false) }}
        onNew={() => setModalOpen(true)}
        onDelete={async id => {
          await loescheAuftrag(id)
          if (aktiveAuftragId === id) setAktiveAuftragId(null)
        }}
        onSettings={() => setShowSettings(true)}
      />

      {showSettings ? (
        <EinstellungenView
          einstellungen={einstellungen}
          onSave={speichern}
          onBack={() => setShowSettings(false)}
        />
      ) : (
        <AuftragDetail
          auftrag={aktiveAuftrag}
          berechnungen={berechnungen}
          einstellungen={einstellungen}
          onAddBerechnung={addBerechnung}
          onDeleteBerechnung={loescheBerechnung}
          onRenameBerechnung={benenneBerechnung}
        />
      )}

      <AuftragModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleNewAuftrag}
      />
      </div>
    </div>
  )
}
