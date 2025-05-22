"use client"

import { useState, useEffect } from "react"
import { useInView } from "react-intersection-observer"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { getPressReleases } from "@/lib/api"
import type { PressRelease } from "@/lib/types"
import { ErrorModal } from "@/components/error-modal"
import { CacheStatus } from "@/components/cache-status"
import { PressReleaseCard } from "@/components/press-release-card"
import { useLogo } from "@/contexts/logo-context"

interface PressReleaseGridProps {
  initialPressReleases: PressRelease[]
  highlightedPressReleaseId?: number | string // Add prop for the highlighted press release ID
  disableColorUpdate?: boolean
}

export function PressReleaseGrid({
  initialPressReleases,
  highlightedPressReleaseId,
  disableColorUpdate = false,
}: PressReleaseGridProps) {
  // Filter out the highlighted press release from the initial data
  const filteredInitialReleases = highlightedPressReleaseId
    ? initialPressReleases.filter((release) => release.id !== highlightedPressReleaseId)
    : initialPressReleases

  const [pressReleases, setPressReleases] = useState<PressRelease[]>(filteredInitialReleases)
  const [filteredReleases, setFilteredReleases] = useState<PressRelease[]>(filteredInitialReleases)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState(false)
  const [errorMessage, setErrorMessage] = useState(
    "We kunnen momenteel geen persberichten laden. Probeer het later opnieuw.",
  )
  const [ref, inView] = useInView()
  const { resetColorScheme } = useLogo()

  // Helper function to safely get category as string
  const getCategoryString = (category: any): string => {
    if (typeof category === "string") return category
    if (typeof category === "object" && category !== null) {
      // If category is an object, try to get a string property
      if (typeof category.name === "string") return category.name
      if (typeof category.title === "string") return category.title
      if (typeof category.label === "string") return category.label
      if (typeof category.value === "string") return category.value
      // If it has a toString method that's not the default Object.toString
      if (typeof category.toString === "function" && category.toString !== Object.prototype.toString) {
        return category.toString()
      }
    }
    // Convert to string as fallback
    return String(category || "")
  }

  // Extract unique categories from press releases
  const uniqueCategories = Array.from(
    new Set(
      pressReleases.map((release) => (release.category ? getCategoryString(release.category) : null)).filter(Boolean),
    ),
  )

  const categories = [
    { value: "all", label: "Alle categorieën" },
    ...uniqueCategories.map((category) => ({
      value: typeof category === "string" ? category.toLowerCase() : "",
      label: category || "Geen categorie",
    })),
  ]

  // Filter press releases based on search query and category
  useEffect(() => {
    let filtered = pressReleases

    if (searchQuery) {
      filtered = filtered.filter(
        (release) =>
          release.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (release.excerpt && release.excerpt.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((release) => {
        if (!release.category) return false
        const releaseCategory = getCategoryString(release.category)
        return releaseCategory.toLowerCase() === categoryFilter.toLowerCase()
      })
    }

    setFilteredReleases(filtered)
  }, [searchQuery, categoryFilter, pressReleases])

  // Load more press releases when scrolling to the bottom
  useEffect(() => {
    if (inView && hasMore && !loading) {
      loadMorePressReleases()
    }
  }, [inView])

  const loadMorePressReleases = async () => {
    if (loading || !hasMore) return

    setLoading(true)
    setError(false)
    const nextPage = page + 1
    const offset = nextPage * 20

    try {
      const newReleases = await getPressReleases(offset, 20)

      if (newReleases.length === 0) {
        setHasMore(false)
      } else {
        // Filter out the highlighted press release from new releases as well
        const filteredNewReleases = highlightedPressReleaseId
          ? newReleases.filter((release) => release.id !== highlightedPressReleaseId)
          : newReleases

        setPressReleases((prev) => [...prev, ...filteredNewReleases])
        setPage(nextPage)
      }
    } catch (err) {
      console.error("Failed to load more press releases:", err)
      setError(true)
      if (err instanceof Error) {
        setErrorMessage(`Kan geen persberichten laden: ${err.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const clearFilters = () => {
    setSearchQuery("")
    setCategoryFilter("all")
    if (!disableColorUpdate) {
      resetColorScheme()
    }
  }

  const handleRetry = () => {
    loadMorePressReleases()
  }

  const handleCloseError = () => {
    setError(false)
  }

  const handleRefresh = async () => {
    setLoading(true)
    setError(false)
    try {
      const newReleases = await getPressReleases(0, 20, true) // Force refresh
      setPressReleases(newReleases)
      setPage(1)
      setHasMore(true)
    } catch (err) {
      console.error("Failed to refresh press releases:", err)
      setError(true)
      if (err instanceof Error) {
        setErrorMessage(`Kan geen persberichten laden: ${err.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="container">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
            <h2 className="text-3xl font-bold">Persberichten</h2>
            <CacheStatus onRefresh={handleRefresh} />
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Zoek persberichten..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Categorie" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(searchQuery || categoryFilter !== "all") && (
              <Button variant="outline" size="icon" onClick={clearFilters}>
                <X className="h-4 w-4" />
                <span className="sr-only">Filters wissen</span>
              </Button>
            )}
          </div>
        </div>

        {filteredReleases.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <h3 className="text-xl font-medium">Geen persberichten gevonden</h3>
            <p className="text-muted-foreground mt-2">Pas je zoekopdracht of filters aan</p>
            <Button variant="outline" className="mt-4" onClick={clearFilters}>
              Filters wissen
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReleases.map((release, index) => (
              <PressReleaseCard
                key={release.id}
                pressRelease={release}
                index={index}
                isActive={index % 2 !== 0}
                disableColorUpdate={disableColorUpdate}
              />
            ))}
          </div>
        )}

        {hasMore && (
          <div ref={ref} className="flex justify-center py-8">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                {[...Array(3)].map((_, i) => (
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
            ) : (
              <Button variant="outline" onClick={loadMorePressReleases}>
                Meer laden
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Error Modal */}
      <ErrorModal
        isOpen={error}
        onClose={handleCloseError}
        onRetry={handleRetry}
        title="Kan persberichten niet laden"
        description={errorMessage}
      />
    </section>
  )
}
