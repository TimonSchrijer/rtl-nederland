"use client"

import type React from "react"
import Image from "next/image"
import { useState } from "react"
import { ImageOff } from "lucide-react"
import { FallbackImageSVG } from "@/components/fallback-image-svg"

interface SafeImageProps {
  src: string
  alt: string
  className?: string
  fallbackSrc?: string
  fallbackComponent?: React.ReactNode
  priority?: boolean
  sizes?: string
  onError?: () => void
}

// Helper function to extract YouTube video ID from various formats
function getYouTubeId(url: string): string | null {
  if (!url) return null
  
  // Skip if the URL is already a YouTube thumbnail
  if (url.includes('/vi/') && url.includes('.jpg')) {
    return null
  }
  
  // Handle various YouTube URL formats
  const patterns = [
    /(?:youtu\.be\/|youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i, // Standard URLs
    /^[a-zA-Z0-9_-]{11}$/, // Direct video ID
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) {
      const potentialId = match[1] || match[0]
      // Validate the ID is exactly 11 characters and doesn't contain file extensions
      if (potentialId.length === 11 && !potentialId.includes('.')) {
        return potentialId
      }
    }
  }
  
  return null
}

// Helper function to clean Prismic image URLs and handle YouTube thumbnails
function cleanPrismicUrl(url: string): string {
  // Skip processing if URL is empty or is a blob URL
  if (!url || url.startsWith('blob:')) return ""

  // Handle YouTube thumbnail URLs
  if (url.includes('youtube.com/vi/')) {
    // Only process if it's not already a specific quality thumbnail
    if (!url.endsWith('.jpg')) {
      const videoId = url.split('/vi/')[1]?.split('/')[0]
      // Validate that we have a proper video ID (11 characters)
      if (videoId && videoId.length === 11 && !videoId.includes('.')) {
        return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
      }
    }
    return url // Return the URL as is if it's already a thumbnail
  }
  
  // Handle Prismic image URLs with parameters
  if (url.includes('?')) {
    const [baseUrl, params] = url.split('?')
    const searchParams = new URLSearchParams(params)
    
    // Keep only the essential parameters
    const newParams = new URLSearchParams()
    
    // Keep rect parameters if they exist
    const rect = searchParams.get('rect')
    if (rect) {
      newParams.set('rect', rect)
    }
    
    // Keep width and height if they exist
    const width = searchParams.get('w')
    const height = searchParams.get('h')
    if (width) newParams.set('w', width)
    if (height) newParams.set('h', height)
    
    // Always add auto=format,compress for optimization
    newParams.set('auto', 'format,compress')
    
    // Rebuild the URL with the cleaned parameters
    url = `${baseUrl}?${newParams.toString()}`
  } else if (url.includes('prismic.io')) {
    // If it's a Prismic URL without parameters, add auto=format,compress
    url = `${url}?auto=format,compress`
  }
  
  // Ensure the URL uses HTTPS
  if (url.startsWith('http:')) {
    url = url.replace('http:', 'https:')
  }
  
  return url
}

// Helper function to get YouTube thumbnail URL with quality fallback
function getYouTubeThumbnailWithQuality(videoId: string, quality: string): string {
  if (!videoId) return ""
  return `https://img.youtube.com/vi/${videoId}/${quality}`
}

export function SafeImage({
  src,
  alt,
  className = "",
  fallbackSrc = "/rtl-fallback-image.png",
  fallbackComponent,
  priority = false,
  sizes = "(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw",
  onError,
}: SafeImageProps) {
  const [errorLevel, setErrorLevel] = useState<0 | 1 | 2>(0)
  const [currentQualityIndex, setCurrentQualityIndex] = useState(0)
  const [loaded, setLoaded] = useState(false)

  // YouTube thumbnail quality options in order of preference
  const YOUTUBE_QUALITIES = [
    'maxresdefault.jpg',  // HD quality (1920x1080)
    'sddefault.jpg',      // SD quality (640x480)
    'hqdefault.jpg',      // High quality (480x360)
    'mqdefault.jpg',      // Medium quality (320x180)
    'default.jpg'         // Default quality (120x90)
  ]

  // If no src is provided, show fallback immediately
  if (!src) {
    return fallbackComponent ? (
      <div className={className}>{fallbackComponent}</div>
    ) : (
      <div className={`${className} relative overflow-hidden`}>
        <FallbackImageSVG className={className} />
        <div className="absolute inset-0 bg-black/5 flex items-center justify-center">
          <div className="bg-white/80 p-2 rounded-full">
            <ImageOff className="h-6 w-6 text-muted-foreground" />
          </div>
        </div>
      </div>
    )
  }

  // Try to get YouTube ID if it's a YouTube URL
  const youtubeId = getYouTubeId(src)
  
  // Clean the image URLs
  const cleanedSrc = youtubeId 
    ? getYouTubeThumbnailWithQuality(youtubeId, YOUTUBE_QUALITIES[currentQualityIndex])
    : cleanPrismicUrl(src)
  const cleanedFallbackSrc = cleanPrismicUrl(fallbackSrc)

  // Determine if we should use unoptimized mode
  const shouldUseUnoptimized = (url: string) => {
    return url.startsWith('data:') || 
           url.startsWith('/') || 
           url.includes('prismic.io') ||
           url.includes('youtube.com')
  }

  // Handle image loading error
  const handlePrimaryError = () => {
    if (youtubeId) {
      // If it's a YouTube thumbnail, try the next quality level
      const nextQualityIndex = currentQualityIndex + 1
      
      if (nextQualityIndex < YOUTUBE_QUALITIES.length) {
        setCurrentQualityIndex(nextQualityIndex)
        setLoaded(false)
        return
      }
    }
    
    console.warn(`Primary image failed to load: ${cleanedSrc}`)
    setErrorLevel(1)
    setLoaded(true)
    onError?.()
  }

  // Handle fallback image loading error
  const handleFallbackError = () => {
    console.error(`Fallback image also failed to load: ${cleanedFallbackSrc}`)
    setErrorLevel(2)
    setLoaded(true)
    onError?.()
  }

  // Handle image loading success
  const handleLoad = () => {
    setLoaded(true)
  }

  // If we have a custom fallback component and there's a primary error, use it
  if (errorLevel === 1 && fallbackComponent) {
    return <div className={className}>{fallbackComponent}</div>
  }

  // If there's a primary error but no custom fallback component, use the fallback image
  if (errorLevel === 1) {
    return (
      <div className={`${className} relative overflow-hidden`}>
        <Image
          src={cleanedFallbackSrc}
          alt={alt}
          className="object-cover"
          fill
          unoptimized={shouldUseUnoptimized(cleanedFallbackSrc)}
          onError={handleFallbackError}
          onLoad={handleLoad}
          priority={priority}
          sizes={sizes}
        />
      </div>
    )
  }

  // If both primary and fallback images failed, show error state
  if (errorLevel === 2) {
    return (
      <div className={`${className} relative overflow-hidden`}>
        <FallbackImageSVG className={className} />
        <div className="absolute inset-0 bg-black/5 flex items-center justify-center">
          <div className="bg-white/80 p-2 rounded-full">
            <ImageOff className="h-6 w-6 text-muted-foreground" />
          </div>
        </div>
      </div>
    )
  }

  // Primary image
  return (
    <div className={`${className} relative overflow-hidden`}>
      <Image
        src={cleanedSrc}
        alt={alt}
        className="object-cover"
        fill
        unoptimized={shouldUseUnoptimized(cleanedSrc)}
        onError={handlePrimaryError}
        onLoad={handleLoad}
        priority={priority}
        sizes={sizes}
      />
    </div>
  )
}