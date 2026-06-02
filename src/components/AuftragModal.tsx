import { useState } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Props {
  open: boolean
  onClose: () => void
  onConfirm: (name: string, adresse: string) => void
}

export function AuftragModal({ open, onClose, onConfirm }: Props) {
  const [name, setName] = useState('')
  const [adresse, setAdresse] = useState('')

  const handleConfirm = () => {
    if (!name.trim()) return
    onConfirm(name.trim(), adresse.trim())
    setName('')
    setAdresse('')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="bg-[#080d1a] border-[#1e2a40] text-foreground max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-foreground">Neuer Auftrag</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-muted text-xs uppercase tracking-wide">Name *</Label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleConfirm()}
              placeholder="z.B. Baustelle Nord"
              className="bg-[#0a0f1e] border-[#1e2a40] text-foreground focus:border-accent"
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-muted text-xs uppercase tracking-wide">Adresse</Label>
            <Input
              value={adresse}
              onChange={e => setAdresse(e.target.value)}
              placeholder="z.B. Nordring 14, München"
              className="bg-[#0a0f1e] border-[#1e2a40] text-foreground focus:border-accent"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} className="text-muted-foreground">
            Abbrechen
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!name.trim()}
            className="bg-[var(--app-accent-dim)] hover:bg-[var(--app-accent-dim-hover)] text-accent border border-[var(--app-accent-dim-border)]"
          >
            Erstellen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
