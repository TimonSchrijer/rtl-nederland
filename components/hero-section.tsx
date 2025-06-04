"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { ArrowRight, Calendar, ImageOff, Tag } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { formatDate, isValidDate } from "@/lib/utils"
import type { PressRelease } from "@/lib/types"
import { useLogo } from "@/contexts/logo-context"
import { SafeImage } from "@/components/safe-image"
import { useRouter } from "next/navigation"
import { normalizeCategoryString } from "@/lib/api"

interface HeroSectionProps {
  pressRelease: PressRelease
  disableColorUpdate?: boolean
}

export function HeroSection({ pressRelease, disableColorUpdate = false }: HeroSectionProps) {
  const [mounted, setMounted] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const { updateColorsFromImage } = useLogo()
  const hasUpdatedColors = useRef<boolean>(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Update logo colors based on the hero image
  useEffect(() => {
    if (mounted && pressRelease && !disableColorUpdate && !hasUpdatedColors.current) {
      try {
        // Get the best quality image available
        const imageUrl =
          pressRelease.mainImage?.article1920x1080 ||
          pressRelease.mainImage?.landscape ||
          pressRelease.mainImage?.medium16x9 ||
          pressRelease.image ||
          "/rtl-nederland-press-release.png"

        if (imageUrl) {
          // Add a small delay to prevent immediate heavy computation
          const timer = setTimeout(() => {
            hasUpdatedColors.current = true
            updateColorsFromImage(imageUrl).catch((error) => {
              console.error("Failed to update colors from hero image:", error)
              hasUpdatedColors.current = false
            })
          }, 500)

          return () => clearTimeout(timer)
        }
      } catch (error) {
        console.error("Error in hero section color update:", error)
        hasUpdatedColors.current = false
      }
    }
  }, [mounted, pressRelease, updateColorsFromImage, disableColorUpdate])

  // Handle click on the hero section
  const handleHeroClick = () => {
    router.push(`/press-release/${pressRelease.id}`)
  }

  if (!mounted) {
    return (
      <div className="w-full" style={{ paddingBottom: "56.25%" }}>
        <div className="bg-muted animate-pulse rounded-xl absolute inset-0"></div>
      </div>
    )
  }

  // Get the image URL with fallbacks
  const imageUrl =
    pressRelease.mainImage?.article1920x1080 ||
    pressRelease.mainImage?.landscape ||
    pressRelease.mainImage?.medium16x9 ||
    pressRelease.image ||
    "/rtl-nederland-press-release.png"

  // Get the date to display with priority order:
  // 1. Use the formatted date from datePosted if available
  // 2. Use the pre-formatted date if available
  // 3. Format the unix timestamp from datePosted if available
  // 4. Format the date string if valid
  // 5. Fallback to "Geen datum"
  let displayDate = "Geen datum"

  if (pressRelease.datePosted?.formatted) {
    // 1. Use the formatted date from datePosted
    displayDate = pressRelease.datePosted.formatted
  } else if (pressRelease.formattedDate) {
    // 2. Use the pre-formatted date
    displayDate = pressRelease.formattedDate
  } else if (pressRelease.datePosted?.unix && isValidDate(pressRelease.datePosted.unix)) {
    // 3. Format the unix timestamp from datePosted
    displayDate = formatDate(pressRelease.datePosted.unix)
  } else if (isValidDate(pressRelease.date)) {
    // 4. Format the date string
    displayDate = formatDate(pressRelease.date)
  }

  // Custom fallback component for the hero image
  const heroFallbackComponent = (
    <div className="w-full h-full flex items-center justify-center bg-muted/50">
      <div className="flex flex-col items-center gap-2 text-muted-foreground">
        <ImageOff className="h-12 w-12" />
        <p>Afbeelding niet beschikbaar</p>
      </div>
    </div>
  )

  return (
    <section className="pt-8 md:pt-12 md:container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-none md:rounded-xl cursor-pointer"
        onClick={handleHeroClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label={`Lees meer over: ${pressRelease.title}`}
        role="link"
      >
        {/* 16:9 aspect ratio container */}
        <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
          {/* Hero image with zoom effect */}
          <div
            className="absolute inset-0 transition-transform duration-700 ease-in-out"
            style={{ transform: isHovered ? "scale(1.05)" : "scale(1)" }}
          >
            <SafeImage
              src={imageUrl}
              alt={pressRelease.title}
              className="w-full h-full object-cover"
              fallbackSrc="/rtl-fallback-image.png"
              fallbackComponent={heroFallbackComponent}
              priority={true}
            />
          </div>

          {/* Image label if available */}
          {pressRelease.mainImage?.label && (
            <div className="absolute bottom-4 right-4 bg-black/70 text-white text-xs px-2 py-1 rounded z-10">
              {pressRelease.mainImage.label}
            </div>
          )}

          {/* Gradient overlay for text readability - make it stronger on mobile */}
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/70 to-black/30 md:from-black/80 md:via-black/40 md:to-black/10 transition-opacity duration-500 ease-in-out"
            style={{ opacity: isHovered ? 0.95 : 0.9 }}
          ></div>

          {/* Content overlay - improved for mobile */}
          <div className="absolute inset-0 flex flex-col justify-end p-3 sm:p-6 md:p-12">
            <div className="max-w-3xl">
              {/* Featured tag - hidden on mobile */}
              <div className="hidden sm:inline-flex items-center gap-1 text-xs sm:text-sm font-medium text-white bg-rtl-primary/80 px-2 sm:px-3 py-1 rounded-full w-fit mb-2 sm:mb-4">
                <span>Uitgelicht persbericht</span>
              </div>

              {/* Title - smaller on mobile, larger on desktop */}
              <h1
                className="text-2xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-2 sm:mb-4 transition-transform duration-500 ease-in-out line-clamp-4 sm:line-clamp-none"
                style={{ transform: isHovered ? "translateY(-5px)" : "translateY(0)" }}
              >
                {pressRelease.title}
              </h1>

              {/* Metadata - smaller on mobile */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-white/90 mb-1 sm:mb-4">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>{displayDate}</span>
                </div>
                {pressRelease.category && (
                  <Link
                    href={`/tag/${encodeURIComponent(normalizeCategoryString(pressRelease.category))}`}
                    className="flex items-center gap-1 hover:text-white/100 transition-colors"
                    onClick={(e) => e.stopPropagation()} // Prevent triggering the hero click
                  >
                    <Tag className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="underline-offset-2 hover:underline">
                      {normalizeCategoryString(pressRelease.category)}
                    </span>
                  </Link>
                )}
              </div>

              {/* Excerpt - hide on very small screens, fewer lines on mobile */}
              <p className="hidden xs:block text-sm sm:text-base text-white/90 line-clamp-2 sm:line-clamp-3 mb-2 sm:mb-6 max-w-2xl">
                {pressRelease.excerpt}
              </p>

              {/* CTA Button - smaller on mobile */}
              <Button
                size="sm"
                className={`w-fit group bg-rtl-primary text-white hover:bg-rtl-primary/90 transition-transform duration-500 ease-in-out ${
                  isHovered ? "translate-y(0) scale-105" : "translate-y(0)"
                }`}
                onClick={(e) => e.stopPropagation()} // Prevent double navigation
              >
                <Link href={`/press-release/${pressRelease.id}`} scroll={true} className="flex items-center">
                  <span className="text-xs sm:text-sm">Lees meer</span>
                  <ArrowRight
                    className={`ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4 transition-all duration-500 ${
                      isHovered ? "translate-x-2" : "translate-x-0"
                    }`}
                  />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
