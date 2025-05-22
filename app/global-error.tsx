"use client"

import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="nl">
      <body>
        <div className="container flex flex-col items-center justify-center min-h-screen py-16 text-center">
          <div className="space-y-6 max-w-md">
            <h1 className="text-4xl font-bold">Er is iets misgegaan</h1>
            <p className="text-muted-foreground">
              Er is een onverwachte fout opgetreden. Probeer de pagina opnieuw te laden of ga terug naar de homepage.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => reset()} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Probeer opnieuw
              </Button>
              <Button variant="outline" onClick={() => (window.location.href = "/")}>
                Terug naar homepage
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
