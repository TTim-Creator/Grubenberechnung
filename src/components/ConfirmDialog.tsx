import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'

interface Props {
  open: boolean
  titel: string
  beschreibung: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({ open, titel, beschreibung, onConfirm, onCancel }: Props) {
  return (
    <Dialog open={open} onOpenChange={v => !v && onCancel()}>
      <DialogContent className="bg-[#080d1a] border-[#1e2a40] text-foreground max-w-xs">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Trash2 size={16} className="text-destructive" />
            {titel}
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-[#94a3b8] py-1">{beschreibung}</p>
        <DialogFooter className="gap-2">
          <Button
            variant="ghost"
            onClick={onCancel}
            className="text-muted-foreground hover:text-foreground"
          >
            Abbrechen
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-red-900/40 hover:bg-red-900/60 text-red-400 border border-red-900/60"
          >
            Löschen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
