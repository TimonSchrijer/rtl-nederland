"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { ErrorModal } from "@/components/error-modal"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useLogo } from "@/contexts/logo-context"
import { DEFAULT_COLOR_SCHEME } from "@/components/rtl-logo"
import { TagPressReleaseGrid } from "@/components/tag-press-release-grid"
import { getPressReleasesByTag } from "@/lib/api"

export default function TagPage() {
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [errorMessage, setErrorMessage] = useState(
    "We hebben problemen met het ophalen van persberichten voor deze tag. Dit kan komen door een tijdelijk netwerkprobleem of serveronderhoud.",
  )
  const { setColorScheme } = useLogo()
  // Decode the tag parameter properly
  const tag = params?.tag ? decodeURIComponent(params.tag as string) : ""
  const [initialPressReleases, setInitialPressReleases] = useState([])

  // Always use default colors on the tag page
  useEffect(() => {
    // Set the logo to default colors when the page loads
    setColorScheme(DEFAULT_COLOR_SCHEME)

    // Return a cleanup function that will run when the component unmounts
    return () => {
      // No need to do anything on cleanup, as other pages will set their own colors
    }
  }, [setColorScheme])

  // Fetch initial press releases
  useEffect(() => {
    const fetchInitialPressReleases = async () => {
      if (!tag) return

      setLoading(true)
      setError(false)

      try {
        // Get initial press releases filtered by tag
        const releases = await getPressReleasesByTag(tag, 0, 20)
        setInitialPressReleases(releases)
      } catch (err) {
        console.error("Failed to fetch initial press releases for tag:", err)
        setError(true)
        if (err instanceof Error) {
          setErrorMessage(`Kan persberichten niet laden: ${err.message}`)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchInitialPressReleases()
  }, [tag])

  const handleRetry = () => {
    window.location.reload()
  }

  const handleCloseError = () => {
    setError(false)
  }

  return (
    <div className="flex flex-col gap-16 py-16">
      <div className="container">
        <Link
          href="/"
          className="inline-flex items-center gap-2 mb-8 text-rtl-secondary hover:text-rtl-secondary/80 transition-colors font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Terug naar alle persberichten
        </Link>

        <h1 className="text-3xl font-bold mb-8">
          Persberichten met tag: <span className="text-rtl-secondary">{tag}</span>
        </h1>

        {!loading && initialPressReleases.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <h3 className="text-xl font-medium">Geen persberichten gevonden voor tag: {tag}</h3>
            <p className="text-muted-foreground mt-2">Probeer een andere tag of bekijk alle persberichten</p>
            <Link
              href="/"
              className="mt-4 inline-flex items-center gap-2 text-rtl-secondary hover:text-rtl-secondary/80 transition-colors font-medium"
            >
              <ArrowLeft className="h-4 w-4" />
              Terug naar alle persberichten
            </Link>
          </div>
        ) : (
          <TagPressReleaseGrid tag={tag} initialPressReleases={initialPressReleases} />
        )}
      </div>

      {/* Error Modal */}
      <ErrorModal
        isOpen={error}
        onClose={handleCloseError}
        onRetry={handleRetry}
        title={`Kan persberichten voor tag "${tag}" niet laden`}
        description={errorMessage}
      />
    </div>
  )
}
