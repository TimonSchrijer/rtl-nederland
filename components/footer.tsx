"use client"

import Link from "next/link"
import { RTLLogo } from "@/components/rtl-logo"
import { ErrorBoundary } from "@/components/error-boundary"
import { useLogo } from "@/contexts/logo-context"

export default function Footer() {
  // Use the logo context to get the current color scheme
  const { colorScheme } = useLogo()

  // Fallback logo component in case the main logo fails
  const FallbackLogo = () => <RTLLogo className="h-8 w-auto" colorScheme="default" />

  return (
    <footer className="border-t bg-background">
      <div className="container py-12">
        <div className="flex flex-col items-center text-center md:items-start md:text-left gap-6">
          <Link href="/" className="flex items-center gap-2">
            <ErrorBoundary fallback={<FallbackLogo />}>
              {/* Use the current color scheme from context */}
              <RTLLogo className="h-8 w-auto" colorScheme={colorScheme} background="light" />
            </ErrorBoundary>
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
