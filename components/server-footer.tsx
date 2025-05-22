import Link from "next/link"
import { RTLLogo } from "@/components/rtl-logo"

export default function ServerFooter() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-12">
        <div className="flex flex-col items-center text-center md:items-start md:text-left gap-6">
          <Link href="/" className="flex items-center gap-2">
            <RTLLogo className="h-8 w-auto" colorScheme="default" />
          </Link>
          <p className="text-sm text-muted-foreground max-w-md">
            RTL Nederland is het grootste entertainmentbedrijf van Nederland en bereikt dagelijks miljoenen mensen met
            content via televisie, online video platforms en radio.
          </p>

          <div className="mt-4 border-t pt-6 w-full flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} RTL Nederland. Alle rechten voorbehouden.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
