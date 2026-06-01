import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { AuftragDetail } from './AuftragDetail'
import { AuftragModal } from './AuftragModal'
import { EinstellungenView } from './EinstellungenView'
import { useAuftraege } from '@/hooks/useAuftraege'
import { useBerechnungen } from '@/hooks/useBerechnungen'
import { useEinstellungen } from '@/hooks/useEinstellungen'

export function Layout() {
  const { auftraege, neuerAuftrag, loescheAuftrag } = useAuftraege()
  const { einstellungen, speichern } = useEinstellungen()
  const [aktiveAuftragId, setAktiveAuftragId] = useState<number | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  const { berechnungen, addBerechnung, loescheBerechnung } = useBerechnungen(aktiveAuftragId)

  const aktiveAuftrag = auftraege.find(a => a.id === aktiveAuftragId) ?? null

  const handleNewAuftrag = async (name: string, adresse: string) => {
    const a = await neuerAuftrag(name, adresse)
    setAktiveAuftragId(a.id)
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar
        auftraege={auftraege}
        aktiveId={aktiveAuftragId}
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
        />
      )}

      <AuftragModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleNewAuftrag}
      />
    </div>
  )
}
