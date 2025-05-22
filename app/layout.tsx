import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { ErrorBoundary } from "@/components/error-boundary"

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
  fallback: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
  adjustFontFallback: true
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ffffff'
}

export const metadata: Metadata = {
  title: "RTL Nederland - Persberichten",
  description: "De nieuwste persberichten van RTL Nederland, het grootste entertainmentbedrijf van Nederland",
  generator: 'v0.dev',
  icons: {
    icon: [
      { url: '/rtl-nederland-press.png', sizes: 'any' }
    ],
    shortcut: '/rtl-nederland-press.png',
    apple: '/rtl-nederland-press.png',
  },
  manifest: '/manifest.json'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="nl" suppressHydrationWarning>
      <head />
      <body className={inter.className}>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <ErrorBoundary>
              <Header />
            </ErrorBoundary>
            <main className="flex-1">{children}</main>
            <ErrorBoundary>
              <Footer />
            </ErrorBoundary>
          </div>
        </Providers>
      </body>
    </html>
  )
}
