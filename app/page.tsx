"use client"

import { useState, useEffect } from "react"
import { HeroSection } from "@/components/hero-section"
import { PressReleaseGrid } from "@/components/press-release-grid"
import { getPressReleases } from "@/lib/api"
import { ErrorModal } from "@/components/error-modal"
import { Skeleton } from "@/components/ui/skeleton"
import { useLogo } from "@/contexts/logo-context"
import { DEFAULT_COLOR_SCHEME } from "@/components/rtl-logo"
import { DynamicThemeDemo } from "@/components/dynamic-theme-demo"

export default function Home() {
  const [pressReleases, setPressReleases] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [errorMessage, setErrorMessage] = useState(
    "We hebben problemen met het ophalen van de nieuwste persberichten van RTL Nederland. Dit kan komen door een tijdelijk netwerkprobleem of serveronderhoud.",
  )
  const { setColorScheme } = useLogo()

  // Always use default colors on the home page
  useEffect(() => {
    // Set the logo to default colors when the home page loads
    setColorScheme(DEFAULT_COLOR_SCHEME)

    // Return a cleanup function that will run when the component unmounts
    return () => {
      // No need to do anything on cleanup, as other pages will set their own colors
    }
  }, [setColorScheme])

  const fetchPressReleases = async () => {
    setLoading(true)
    setError(false)
    try {
      const data = await getPressReleases(0, 20)
      setPressReleases(data)
    } catch (err) {
      console.error("Failed to fetch press releases:", err)
      setError(true)
      if (err instanceof Error) {
        setErrorMessage(`Kan persberichten niet laden: ${err.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPressReleases()
  }, [])

  const handleRetry = () => {
    fetchPressReleases()
  }

  const handleCloseError = () => {
    setError(false)
  }

  // Get the highlighted press release (first one in the list)
  const highlightedPressRelease = pressReleases.length > 0 ? pressReleases[0] : null
  const highlightedPressReleaseId = highlightedPressRelease ? highlightedPressRelease.id : null

  return (
    <div className="flex flex-col gap-16 pb-16">
      {loading ? (
        // Loading skeleton
        <>
          <div className="container pt-8 md:pt-12">
            <div className="w-full h-[500px] bg-muted animate-pulse rounded-xl" />
          </div>
          <div className="container">
            <Skeleton className="h-10 w-48 mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex flex-col overflow-hidden rounded-lg border shadow-sm">
                  <Skeleton className="h-48 w-full" />
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        // Content when data is loaded
        <>
          {highlightedPressRelease && <HeroSection pressRelease={highlightedPressRelease} disableColorUpdate={true} />}
          <PressReleaseGrid
            initialPressReleases={pressReleases}
            highlightedPressReleaseId={highlightedPressReleaseId}
            disableColorUpdate={true}
          />
        </>
      )}

      {/* Add the dynamic theme demo */}
      <div className="container mb-16">
        <DynamicThemeDemo />
      </div>

      {/* Error Modal */}
      <ErrorModal
        isOpen={error}
        onClose={handleCloseError}
        onRetry={handleRetry}
        title="Kan persberichten niet laden"
        description={errorMessage}
      />
    </div>
  )
}
