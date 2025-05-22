"use client"

import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { RTLLogo } from "@/components/rtl-logo"

interface ErrorModalProps {
  isOpen: boolean
  onClose: () => void
  onRetry: () => void
  title?: string
  description?: string
}

export function ErrorModal({
  isOpen,
  onClose,
  onRetry,
  title = "Verbindingsfout",
  description = "We hebben problemen met het verbinden met onze servers. Dit kan komen door een tijdelijk netwerkprobleem of serveronderhoud.",
}: ErrorModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-col items-center text-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-4">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <DialogTitle className="text-xl">{title}</DialogTitle>
          <DialogDescription className="mt-2">{description}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-4">
          <RTLLogo className="h-8 w-auto mb-4 opacity-70" />
          <p className="text-sm text-muted-foreground text-center">
            Probeer het over enkele momenten opnieuw. Als het probleem aanhoudt, neem dan contact op met ons
            supportteam.
          </p>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} className="sm:flex-1">
            Sluiten
          </Button>
          <Button onClick={onRetry} className="sm:flex-1">
            Opnieuw proberen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
