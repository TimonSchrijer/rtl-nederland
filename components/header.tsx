"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RTLLogo } from "@/components/rtl-logo"
import { useLogo } from "@/contexts/logo-context"
import { cn } from "@/lib/utils"
import { ErrorBoundary } from "@/components/error-boundary"

// Update the navItems array to remove "Werken bij"
const navItems = [{ label: "Persberichten", href: "/", active: true }]

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { colorScheme } = useLogo()

  // Fallback logo component in case the main logo fails
  const FallbackLogo = () => <RTLLogo className="h-8 w-auto" colorScheme="default" />

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        {/* Mobile view: Three-column layout with menu button, centered logo, and empty space */}
        <div className="flex w-full items-center justify-between md:justify-start md:gap-10">
          {/* Left column: Menu button on mobile, hidden on desktop */}
          <div className="flex md:hidden">
            {navItems.length > 1 && (
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(true)}>
                <Menu className="h-6 w-6" />
                <span className="sr-only">Menu openen</span>
              </Button>
            )}
          </div>

          {/* Center column: Logo centered on mobile, left-aligned on desktop */}
          <div className="flex justify-center md:justify-start flex-grow md:flex-grow-0">
            <Link href="/" className="flex items-center">
              <ErrorBoundary fallback={<FallbackLogo />}>
                <RTLLogo className="h-8 w-auto" colorScheme={colorScheme} />
              </ErrorBoundary>
            </Link>
          </div>

          {/* Right column: Empty on mobile, navigation on desktop */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-rtl-primary",
                  item.active ? "text-rtl-primary" : "text-foreground",
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-background md:hidden">
            <div className="container flex h-16 items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                <ErrorBoundary fallback={<FallbackLogo />}>
                  <RTLLogo className="h-8 w-auto" colorScheme={colorScheme} />
                </ErrorBoundary>
              </Link>

              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                <X className="h-6 w-6" />
                <span className="sr-only">Menu sluiten</span>
              </Button>
            </div>

            <nav className="container grid gap-6 py-6">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "text-lg font-medium transition-colors hover:text-rtl-primary",
                    item.active ? "text-rtl-primary" : "text-foreground",
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
