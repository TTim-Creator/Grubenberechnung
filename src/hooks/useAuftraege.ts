import { useState, useEffect, useCallback } from 'react'
import type { Auftrag } from '@/types'
import { loadAuftraege, createAuftrag, deleteAuftrag } from '@/lib/db'

export function useAuftraege() {
  const [auftraege, setAuftraege] = useState<Auftrag[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAuftraege()
      .then(setAuftraege)
      .finally(() => setLoading(false))
  }, [])

  const neuerAuftrag = useCallback(async (name: string, adresse: string): Promise<Auftrag> => {
    const auftrag = await createAuftrag(name, adresse)
    setAuftraege(prev => [auftrag, ...prev])
    return auftrag
  }, [])

  const loescheAuftrag = useCallback(async (id: number) => {
    await deleteAuftrag(id)
    setAuftraege(prev => prev.filter(a => a.id !== id))
  }, [])

  return { auftraege, loading, neuerAuftrag, loescheAuftrag }
}
