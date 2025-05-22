"use client"

import { type ReactNode } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { LogoProvider } from "@/contexts/logo-context"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      forcedTheme="light"
      disableTransitionOnChange
      enableSystem={false}
      themes={['light']}
    >
      <LogoProvider>
        {children}
      </LogoProvider>
    </ThemeProvider>
  )
} 