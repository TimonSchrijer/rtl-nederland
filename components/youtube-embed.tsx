"use client"

import { useState } from "react"
import { Play } from "lucide-react"

interface YouTubeEmbedProps {
  videoId: string
  title?: string
  className?: string
  aspectRatio?: "16:9" | "4:3" | "1:1"
  autoplay?: boolean
}

export function YouTubeEmbed({
  videoId,
  title = "YouTube video",
  className = "",
  aspectRatio = "16:9",
  autoplay = false,
}: YouTubeEmbedProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  // Calculate padding based on aspect ratio
  const getPaddingBottom = () => {
    switch (aspectRatio) {
      case "4:3":
        return "75%"
      case "1:1":
        return "100%"
      case "16:9":
      default:
        return "56.25%"
    }
  }

  // Handle click on the thumbnail to load and play the video
  const handleThumbnailClick = () => {
    setIsPlaying(true)
  }

  // Handle iframe load event
  const handleIframeLoad = () => {
    setIsLoaded(true)
  }

  return (
    <div
      className={`relative w-full overflow-hidden rounded-lg ${className}`}
      style={{ paddingBottom: getPaddingBottom() }}
    >
      {!isPlaying ? (
        // Show thumbnail with play button until clicked
        <div
          className="absolute inset-0 cursor-pointer bg-black"
          onClick={handleThumbnailClick}
          role="button"
          aria-label={`Play ${title}`}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              handleThumbnailClick()
            }
          }}
        >
          {/* YouTube thumbnail */}
          <img
            src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
            alt={`Thumbnail for ${title}`}
            className="absolute inset-0 h-full w-full object-cover"
            onError={(e) => {
              // Fallback to medium quality if maxresdefault is not available
              ;(e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
            }}
          />

          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rtl-primary/90 text-white transition-transform hover:scale-110">
              <Play className="h-8 w-8" fill="white" />
            </div>
          </div>

          {/* Video title overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <p className="text-sm font-medium text-white md:text-base">{title}</p>
          </div>
        </div>
      ) : (
        // Show iframe when play is clicked
        <>
          {!isLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-rtl-primary border-t-transparent"></div>
            </div>
          )}
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}&rel=0`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0"
            onLoad={handleIframeLoad}
          ></iframe>
        </>
      )}
    </div>
  )
}
