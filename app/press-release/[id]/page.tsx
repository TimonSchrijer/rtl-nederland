"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { getPressReleaseById } from "@/lib/api"
import { formatDate, isValidDate } from "@/lib/utils"
import { ArrowLeft, Calendar, ImageOff, Tag } from "lucide-react"
import Link from "next/link"
import { SocialShareButtons } from "@/components/social-share-buttons"
import { Skeleton } from "@/components/ui/skeleton"
import { ErrorModal } from "@/components/error-modal"
import { useLogo } from "@/contexts/logo-context"
import { SafeImage } from "@/components/safe-image"
import { ArticleContent } from "@/components/article-content"
import { VideoHeroImage } from "@/components/video-hero-image"
import { ShareDialog } from "@/components/share-dialog"
import type { PressRelease } from "@/lib/types"

export default function PressReleasePage() {
  const params = useParams()
  const router = useRouter()
  const [pressRelease, setPressRelease] = useState<PressRelease | null>(null)
  const [videoId, setVideoId] = useState<string | null>(null)
  const [videoTitle, setVideoTitle] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [errorMessage, setErrorMessage] = useState(
    "We hebben problemen met het ophalen van dit persbericht van RTL Nederland. Dit kan komen door een tijdelijk netwerkprobleem of serveronderhoud.",
  )
  const { updateColorsFromImage, resetColorScheme } = useLogo()

  // Scroll to top when the page loads
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [params.id])

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

  const fetchPressRelease = async () => {
    if (!params.id) return

    setLoading(true)
    setError(false)
    try {
      const data = await getPressReleaseById(params.id.toString())
      if (!data) {
        router.push("/not-found")
        return
      }
      setPressRelease(data)

      // Set video information if available
      if (data.videoId) {
        setVideoId(data.videoId)
        setVideoTitle(data.videoTitle || data.title)
      }

      // Update logo colors based on the press release image
      try {
        // Get the best available image URL for color extraction, skipping blob URLs
        const colorImageUrl = Object.entries(data.mainImage || {}).reduce((acc, [key, value]) => {
          if (acc) return acc // If we already found a valid URL, keep it
          if (!value || typeof value !== 'string') return acc // Skip if not a string
          if (value.startsWith('blob:')) return acc // Skip blob: URLs
          if (['article1920x1080', 'landscape', 'medium16x9'].includes(key)) return value
          return acc
        }, '')

        // If we have a video, use its thumbnail
        const effectiveImageUrl = data.videoId 
          ? `https://img.youtube.com/vi/${data.videoId}/maxresdefault.jpg`
          : colorImageUrl || data.image || "/rtl-nederland-press-release.png"

        if (effectiveImageUrl && !effectiveImageUrl.startsWith('blob:')) {
          await updateColorsFromImage(effectiveImageUrl)
        }
      } catch (colorError) {
        console.error("Failed to update colors from press release image:", colorError)
      }
    } catch (err) {
      console.error("Failed to fetch press release:", err)
      setError(true)
      if (err instanceof Error) {
        setErrorMessage(`Kan persbericht niet laden: ${err.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPressRelease()

    // Reset colors when leaving the page
    return () => {
      resetColorScheme()
    }
  }, [params.id])

  const handleRetry = () => {
    fetchPressRelease()
  }

  const handleCloseError = () => {
    setError(false)
  }

  if (loading) {
    return (
      <div className="container max-w-4xl py-12">
        <div className="flex items-center gap-2 mb-8">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-40" />
        </div>

        {/* 16:9 aspect ratio skeleton */}
        <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
          <Skeleton className="absolute inset-0 rounded-xl" />
        </div>

        <div className="flex flex-col gap-4 mt-8">
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>

          <Skeleton className="h-10 w-3/4" />

          <div className="py-4 border-y border-border mt-2">
            <Skeleton className="h-8 w-32" />
          </div>

          <div className="space-y-4 mt-8">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      </div>
    )
  }

  if (!pressRelease && !loading && !error) {
    return null // Let Next.js handle the not-found case
  }

  // Get the best available image URL, prioritizing video thumbnails
  const imageUrl = (() => {
    if (!pressRelease) return "/rtl-fallback-image.png"

    // If we have a video, use its thumbnail as the primary image
    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    }

    // Otherwise, try to get the best quality image from mainImage
    const mainImageUrl = Object.entries(pressRelease.mainImage || {}).reduce((acc, [key, value]) => {
      if (acc) return acc // If we already found a valid URL, keep it
      if (!value || typeof value !== 'string') return acc // Skip if not a string
      if (value.startsWith('blob:')) return acc // Skip blob: URLs
      if (['article1920x1080', 'landscape', 'medium16x9', 'article960x540'].includes(key)) return value
      return acc
    }, '')

    if (mainImageUrl) return mainImageUrl

    // If no main image, try legacy image field
    if (pressRelease.image && !pressRelease.image.startsWith('blob:')) return pressRelease.image

    // Fallback to default image
    return "/rtl-fallback-image.png"
  })()

  // Get the date to display with priority order:
  // 1. Use the formatted date from datePosted if available
  // 2. Use the pre-formatted date if available
  // 3. Format the unix timestamp from datePosted if available
  // 4. Format the date string if valid
  // 5. Fallback to "Geen datum"
  let displayDate = "Geen datum"

  if (pressRelease?.datePosted?.formatted) {
    // 1. Use the formatted date from datePosted
    displayDate = pressRelease.datePosted.formatted
  } else if (pressRelease?.formattedDate) {
    // 2. Use the pre-formatted date
    displayDate = pressRelease.formattedDate
  } else if (pressRelease?.datePosted?.unix && isValidDate(pressRelease.datePosted.unix)) {
    // 3. Format the unix timestamp from datePosted
    displayDate = formatDate(pressRelease.datePosted.unix)
  } else if (pressRelease && isValidDate(pressRelease.date)) {
    // 4. Format the date string
    displayDate = formatDate(pressRelease.date)
  }

  // Custom fallback component for the detail page image
  const detailFallbackComponent = (
    <div className="w-full h-full flex items-center justify-center bg-muted/50">
      <div className="flex flex-col items-center gap-2 text-muted-foreground">
        <ImageOff className="h-16 w-16" />
        <p className="text-lg">Afbeelding niet beschikbaar</p>
      </div>
    </div>
  )

  return (
    <>
      {pressRelease && (
        <div className="container max-w-4xl py-12">
          {/* Update the back link to use the dynamic rtl-primary color */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 mb-8 text-rtl-secondary hover:text-rtl-secondary/80 transition-colors font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Terug naar alle persberichten
          </Link>

          {/* 16:9 aspect ratio container */}
          <div className="relative w-full rounded-xl overflow-hidden mb-8" style={{ paddingBottom: "56.25%" }}>
            {videoId ? (
              <div className="absolute inset-0">
                <VideoHeroImage
                  imageUrl={imageUrl}
                  imageAlt={pressRelease.title}
                  videoId={videoId}
                  videoTitle={videoTitle || pressRelease.title}
                  className="h-full"
                />
              </div>
            ) : (
              <div className="absolute inset-0">
                <SafeImage
                  src={imageUrl}
                  alt={pressRelease.title}
                  className="w-full h-full object-cover"
                  fallbackSrc="/rtl-fallback-image.png"
                  fallbackComponent={detailFallbackComponent}
                  priority={true}
                />
                {pressRelease.mainImage?.label && (
                  <div className="absolute bottom-4 right-4 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {pressRelease.mainImage.label}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{displayDate}</span>
              </div>
              {pressRelease.category && (
                <Link
                  href={`/tag/${encodeURIComponent(getCategoryString(pressRelease.category).trim())}`}
                  className="flex items-center gap-1 text-rtl-secondary hover:text-rtl-secondary/80 transition-colors font-medium"
                >
                  <Tag className="h-4 w-4" />
                  <span className="underline-offset-2 hover:underline">{getCategoryString(pressRelease.category)}</span>
                </Link>
              )}
            </div>

            <h1 className="text-4xl font-bold">{pressRelease.title}</h1>

            <div className="flex justify-between items-center py-4 border-y border-border mt-2">
              <SocialShareButtons title={pressRelease.title} />
              <ShareDialog 
                title={pressRelease.title} 
                description={pressRelease.excerpt} 
                variant="icon-label" 
                className="bg-rtl-primary/10 hover:bg-rtl-primary/20 text-rtl-primary hover:text-rtl-primary/90 rounded-full" 
              />
            </div>

            {/* Pass video information to the ArticleContent component */}
            <ArticleContent
              content={pressRelease.content}
              className="mt-8"
              // Don't pass videoId here since we're showing it in the hero
              // videoId={videoId}
              // videoTitle={videoTitle}
            />
          </div>
        </div>
      )}

      {/* Error Modal */}
      <ErrorModal
        isOpen={error}
        onClose={handleCloseError}
        onRetry={handleRetry}
        title="Kan persbericht niet laden"
        description={errorMessage}
      />
    </>
  )
}
