import { useState, useEffect, useCallback } from 'react'
import type { Berechnung } from '@/types'
import { loadBerechnungen, createBerechnung, deleteBerechnung } from '@/lib/db'

export function useBerechnungen(auftragId: number | null) {
  const [berechnungen, setBerechnungen] = useState<Berechnung[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!auftragId) { setBerechnungen([]); return }
    setLoading(true)
    loadBerechnungen(auftragId)
      .then(setBerechnungen)
      .finally(() => setLoading(false))
  }, [auftragId])

  const addBerechnung = useCallback(async (
    breite: number, tiefe: number, bFaktor: number, tFaktor: number,
  ) => {
    if (!auftragId) return
    const b = await createBerechnung(auftragId, breite, tiefe, bFaktor, tFaktor)
    setBerechnungen(prev => [...prev, b])
  }, [auftragId])

  const loescheBerechnung = useCallback(async (id: number) => {
    await deleteBerechnung(id)
    setBerechnungen(prev => prev.filter(b => b.id !== id))
  }, [])

  return { berechnungen, loading, addBerechnung, loescheBerechnung }
}
