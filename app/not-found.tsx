import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-[70vh] py-16 text-center">
      <div className="space-y-6 max-w-md">
        <h1 className="text-6xl font-bold">404</h1>
        <h2 className="text-2xl font-semibold">Pagina niet gevonden</h2>
        <p className="text-muted-foreground">
          De pagina die je zoekt bestaat niet of is verplaatst. Ga terug naar de homepage om persberichten te bekijken.
        </p>
        <Button asChild className="mt-4">
          <Link href="/" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Terug naar persberichten
          </Link>
        </Button>
      </div>
    </div>
  )
}
