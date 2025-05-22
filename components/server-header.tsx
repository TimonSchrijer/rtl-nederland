import Link from "next/link"
import { ServerRTLLogo } from "@/components/server-rtl-logo"

export default function ServerHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="flex w-full items-center justify-between md:justify-start md:gap-10">
          {/* Left column: Empty space on mobile */}
          <div className="flex md:hidden">
            {/* Empty space to balance the layout */}
            <div className="w-6"></div>
          </div>

          {/* Center column: Logo centered on mobile, left-aligned on desktop */}
          <div className="flex justify-center md:justify-start flex-grow md:flex-grow-0">
            <Link href="/" className="flex items-center">
              <ServerRTLLogo className="h-8 w-auto" />
            </Link>
          </div>

          {/* Right column: Empty on mobile, navigation on desktop */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium transition-colors hover:text-rtl-primary text-rtl-primary">
              Persberichten
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
