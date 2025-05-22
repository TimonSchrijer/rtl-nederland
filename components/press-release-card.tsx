"use client"
import { Calendar, Tag } from "lucide-react"
import Link from "next/link"
import { formatDate, isValidDate } from "@/lib/utils"
import type { PressRelease } from "@/lib/types"
import { useLogo } from "@/contexts/logo-context"
import { useRef } from "react"
import { SafeImage } from "@/components/safe-image"
import { getCategoryString } from "@/lib/api"

interface PressReleaseCardProps {
  pressRelease: PressRelease
  isActive?: boolean
  index?: number // Add index prop to only update colors for certain cards
  disableColorUpdate?: boolean
}

export function PressReleaseCard({
  pressRelease,
  isActive = false,
  index = 0,
  disableColorUpdate = false,
}: PressReleaseCardProps) {
  const { updateColorsFromImage } = useLogo()
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)
  const hasUpdatedColors = useRef<boolean>(false)

  // Update logo colors when this card is hovered, but only for certain cards
  // and with debounce to prevent too many updates
  const handleMouseEnter = () => {
    // Skip color updates if disabled
    if (disableColorUpdate) return

    // Only update colors for the first card in each row (0, 3, 6, etc.)
    if (!isActive && index % 3 === 0) {
      // Clear any existing timer
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }

      // Set a new timer to debounce the color update
      debounceTimer.current = setTimeout(() => {
        try {
          // Get the best quality image available
          const imageUrl =
            pressRelease.mainImage?.landscape ||
            pressRelease.mainImage?.medium16x9 ||
            pressRelease.mainImage?.article960x540 ||
            pressRelease.mainImage?.small ||
            pressRelease.image ||
            "/rtl-nederland-press.png"

          if (imageUrl && !hasUpdatedColors.current) {
            hasUpdatedColors.current = true
            updateColorsFromImage(imageUrl).catch((error) => {
              console.error("Failed to update colors from card image:", error)
              hasUpdatedColors.current = false
            })
          }
        } catch (error) {
          console.error("Error in card hover color update:", error)
          hasUpdatedColors.current = false
        }
      }, 300) // 300ms debounce
    }
  }

  // Get the image URL with fallbacks
  const imageUrl =
    pressRelease.mainImage?.landscape ||
    pressRelease.mainImage?.medium16x9 ||
    pressRelease.mainImage?.article960x540 ||
    pressRelease.mainImage?.small ||
    pressRelease.image ||
    "/rtl-nederland-press.png"

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

  // Get category string using the shared helper function
  const category = getCategoryString(pressRelease.category)

  return (
    <Link
      href={`/press-release/${pressRelease.id}`}
      className="group flex flex-col overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md"
      onMouseEnter={handleMouseEnter}
      scroll={true} // Ensure the page scrolls to top when navigating
    >
      <div className="relative h-48 w-full overflow-hidden">
        <SafeImage
          src={imageUrl}
          alt={pressRelease.title}
          className="w-full h-full transition-transform duration-300 group-hover:scale-105"
          fallbackSrc="/rtl-fallback-image.png"
        />
        {pressRelease.mainImage?.label && (
          <div className="absolute bottom-0 right-0 bg-black/70 text-white text-xs px-2 py-1">
            {pressRelease.mainImage.label}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{displayDate}</span>
          </div>
          {category && (
            <div
              className="flex items-center gap-1 cursor-pointer hover:text-rtl-primary"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                // Normalize the category string and properly encode it
                const normalizedCategory = getCategoryString(pressRelease.category).trim()
                window.location.href = `/tag/${encodeURIComponent(normalizedCategory)}`
              }}
            >
              <Tag className="h-3 w-3" />
              <span className="underline-offset-2 hover:underline">{category}</span>
            </div>
          )}
        </div>

        <h3 className="line-clamp-2 text-lg font-semibold group-hover:text-rtl-primary transition-colors">
          {pressRelease.title}
        </h3>

        <p className="line-clamp-3 text-sm text-muted-foreground">{pressRelease.excerpt}</p>
      </div>
    </Link>
  )
}
