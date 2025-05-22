"use client"

import type React from "react"

import { useState } from "react"
import { ImageOff } from "lucide-react"
import { FallbackImageSVG } from "@/components/fallback-image-svg"

interface SafeImageProps {
  src: string
  alt: string
  className?: string
  fallbackSrc?: string
  fallbackComponent?: React.ReactNode
}

export function SafeImage({
  src,
  alt,
  className = "",
  fallbackSrc = "/rtl-fallback-image.png",
  fallbackComponent,
}: SafeImageProps) {
  const [errorLevel, setErrorLevel] = useState<0 | 1 | 2>(0)
  // 0 = no error, 1 = primary image error, 2 = fallback image error
  const [loaded, setLoaded] = useState(false)

  // Handle image loading error
  const handlePrimaryError = () => {
    console.warn(`Primary image failed to load: ${src}`)
    setErrorLevel(1)
    setLoaded(true)
  }

  // Handle fallback image loading error
  const handleFallbackError = () => {
    console.error(`Fallback image also failed to load: ${fallbackSrc}`)
    setErrorLevel(2)
    setLoaded(true)
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
        <img
          src={fallbackSrc || "/placeholder.svg"}
          alt={alt}
          className="w-full h-full object-cover"
          onError={handleFallbackError}
          onLoad={handleLoad}
        />
        {/* Add a subtle overlay to indicate this is a fallback */}
        <div className="absolute inset-0 bg-black/5 flex items-center justify-center">
          <div className="bg-white/80 p-2 rounded-full">
            <ImageOff className="h-6 w-6 text-muted-foreground" />
          </div>
        </div>
      </div>
    )
  }

  // If even the fallback image failed, use the SVG fallback
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

  // Default case: try to load the original image
  return (
    <div className={`${className} relative`}>
      {/* Show skeleton while loading */}
      {!loaded && (
        <div className="absolute inset-0 bg-muted animate-pulse rounded-md flex items-center justify-center">
          <span className="sr-only">Loading image...</span>
        </div>
      )}
      <img
        src={src || "/placeholder.svg"}
        alt={alt}
        className={`w-full h-full object-cover ${loaded ? "opacity-100" : "opacity-0"} transition-opacity duration-300`}
        onError={handlePrimaryError}
        onLoad={handleLoad}
      />
    </div>
  )
}
