"use client"

import { useState } from "react"
import { Play } from "lucide-react"
import { SafeImage } from "@/components/safe-image"
import { motion, AnimatePresence } from "framer-motion"

interface VideoHeroImageProps {
  imageUrl: string
  imageAlt: string
  videoId: string
  videoTitle?: string
  className?: string
}

export function VideoHeroImage({
  imageUrl,
  imageAlt,
  videoId,
  videoTitle = "YouTube video",
  className = "",
}: VideoHeroImageProps) {
  const [showVideo, setShowVideo] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const handleImageClick = () => {
    setShowVideo(true)
  }

  return (
    <div
      className={`relative w-full h-full overflow-hidden rounded-xl ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence mode="wait">
        {!showVideo ? (
          <motion.div
            key="image"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative w-full h-full cursor-pointer"
            onClick={handleImageClick}
          >
            <div
              className="w-full h-full transition-transform duration-700 ease-in-out"
              style={{ transform: isHovered ? "scale(1.05)" : "scale(1)" }}
            >
              <SafeImage
                src={imageUrl}
                alt={imageAlt}
                className="w-full h-full object-cover"
                fallbackSrc="/rtl-fallback-image.png"
              />
            </div>

            {/* Gradient overlay for better contrast */}
            <div
              className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent transition-opacity duration-500 ease-in-out"
              style={{ opacity: isHovered ? 0.6 : 0.4 }}
            ></div>

            {/* Play button overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="flex h-24 w-24 items-center justify-center rounded-full bg-rtl-primary/90 text-white transition-all duration-500"
                style={{
                  transform: isHovered ? "scale(1.15)" : "scale(1)",
                  boxShadow: isHovered ? "0 0 30px rgba(254, 151, 38, 0.5)" : "none",
                }}
              >
                <Play className="h-12 w-12" fill="white" />
              </div>
            </div>

            {/* Video title overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
              <p
                className="text-lg font-medium text-white md:text-xl transition-transform duration-500 ease-in-out"
                style={{ transform: isHovered ? "translateY(-5px)" : "translateY(0)" }}
              >
                {videoTitle}
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div key="video" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
              title={videoTitle}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 h-full w-full border-0 rounded-xl"
            ></iframe>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
