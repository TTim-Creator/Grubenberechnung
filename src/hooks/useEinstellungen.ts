import { useState, useEffect, useCallback } from 'react'
import type { Einstellungen } from '@/types'
import { loadEinstellungen, saveEinstellungen } from '@/lib/db'

const DEFAULT: Einstellungen = {
  id: 1, std_breite: 15, std_tiefe: 45, b_einheit: 15, t_einheit: 15,
  akzent_farbe: '#3b82f6', firmen_name: '',
}

export function useEinstellungen() {
  const [einstellungen, setEinstellungen] = useState<Einstellungen>(DEFAULT)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEinstellungen()
      .then(setEinstellungen)
      .finally(() => setLoading(false))
  }, [])

  const speichern = useCallback(async (data: Omit<Einstellungen, 'id'>) => {
    await saveEinstellungen(data)
    setEinstellungen({ id: 1, ...data })
  }, [])

  return { einstellungen, loading, speichern }
}
