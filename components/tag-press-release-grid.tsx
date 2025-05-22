"use client"

import { useState, useEffect, useRef } from "react"
import { useInView } from "react-intersection-observer"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { getPressReleases } from "@/lib/api"
import type { PressRelease } from "@/lib/types"
import { PressReleaseCard } from "@/components/press-release-card"
import { normalizeCategoryString } from "@/lib/api"

interface TagPressReleaseGridProps {
  tag: string
  initialPressReleases?: PressRelease[]
}

export function TagPressReleaseGrid({ tag, initialPressReleases = [] }: TagPressReleaseGridProps) {
  const [pressReleases, setPressReleases] = useState<PressRelease[]>(initialPressReleases)
  const [loading, setLoading] = useState(initialPressReleases.length === 0)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [ref, inView] = useInView()
  const initialLoadComplete = useRef(initialPressReleases.length > 0)
  const normalizedTag = normalizeCategoryString(tag)
  const consecutiveEmptyLoads = useRef(0)
  const maxConsecutiveEmptyLoads = 5 // Stop after 5 consecutive empty loads

  const fetchPressReleases = async (pageNum = 1, append = false) => {
    if (pageNum === 1) {
      setLoading(true)
    } else {
      setLoadingMore(true)
    }

    try {
      // Calculate offset based on page number
      const offset = (pageNum - 1) * 20

      // Get press releases for this page
      const allReleases = await getPressReleases(offset, 20)

      // Filter by tag (exact match, case-insensitive)
      const filteredReleases = allReleases.filter((release) => {
        const releaseCategory = normalizeCategoryString(release.category)
        return releaseCategory === normalizedTag
      })

      // If we got fewer filtered results than expected, we might need to load more
      // to get a full page of tag-filtered results
      if (filteredReleases.length === 0 && allReleases.length > 0 && hasMore) {
        // Increment the consecutive empty loads counter
        consecutiveEmptyLoads.current += 1

        // If we've had too many consecutive empty loads, stop trying
        if (consecutiveEmptyLoads.current >= maxConsecutiveEmptyLoads) {
          setHasMore(false)
          setLoading(false)
          setLoadingMore(false)
          return
        }

        // We got some releases but none matched our tag, try the next page
        if (!append) {
          // For initial load, continue searching
          setPage(pageNum + 1)
          setLoading(false)
          setLoadingMore(true)
          await fetchPressReleases(pageNum + 1, false)
          return
        } else {
          // For "load more", try the next page
          setPage(pageNum + 1)
          setLoadingMore(true) // Keep loading state active
          await fetchPressReleases(pageNum + 1, true)
          return
        }
      }

      // If we found matching releases, reset the consecutive empty loads counter
      if (filteredReleases.length > 0) {
        consecutiveEmptyLoads.current = 0
      }

      // Update state based on whether we're appending or replacing
      if (append) {
        setPressReleases((prev) => [...prev, ...filteredReleases])
      } else {
        setPressReleases(filteredReleases)
        initialLoadComplete.current = true
      }

      // Check if we have more to load
      if (allReleases.length < 20) {
        setHasMore(false)
      }

      // Update page number
      setPage(pageNum)
    } catch (err) {
      console.error("Failed to fetch press releases for tag:", err)
      // On error, assume there might be more to load but stop the current attempt
      setHasMore(true)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  // Initial load if we don't have initial press releases
  useEffect(() => {
    if (initialPressReleases.length === 0) {
      fetchPressReleases(1, false)
    }
  }, [tag])

  // Load more when scrolling to the bottom
  useEffect(() => {
    if (inView && !loading && !loadingMore && hasMore && initialLoadComplete.current) {
      fetchPressReleases(page + 1, true)
    }
  }, [inView, loading, loadingMore, hasMore])

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchPressReleases(page + 1, true)
    }
  }

  if (loading) {
    return (
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
    )
  }

  if (pressReleases.length === 0) {
    return null // Let the parent component handle the empty state
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pressReleases.map((release, index) => (
          <PressReleaseCard
            key={`${release.id}-${release.publishedAt || release.date || index}`}
            pressRelease={release}
            index={index}
            disableColorUpdate={true}
          />
        ))}
      </div>

      {/* Load more section - only show if hasMore is true */}
      {hasMore && (
        <div ref={ref} className="flex justify-center py-8">
          {loadingMore ? (
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
            <Button variant="outline" onClick={handleLoadMore}>
              Meer laden
            </Button>
          )}
        </div>
      )}
    </>
  )
}
