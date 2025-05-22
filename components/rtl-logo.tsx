"use client"

import type React from "react"

import { useMemo, useState, useEffect, useRef } from "react"
import { SafeSvgWrapper } from "@/components/safe-svg-wrapper"

// RTL brand color palette based on https://logo-generator.rtl.de/signatur-generator
export const RTL_COLORS = {
  // Primary brand colors
  orange: "#FE9726",
  lightBlue: "#16B8FE",
  darkBlue: "#0975F3",

  // Extended palette
  red: "#E6007E",
  pink: "#FF5F9E",
  purple: "#9747FF",
  teal: "#00C1B2",
  green: "#00C389",
  yellow: "#FFED00",

  // Neutral colors
  black: "#000000",
  gray: "#666666",
}

export type RTLColorScheme = {
  left: keyof typeof RTL_COLORS
  middle: keyof typeof RTL_COLORS
  right: keyof typeof RTL_COLORS
}

// Default RTL color scheme
export const DEFAULT_COLOR_SCHEME: RTLColorScheme = {
  left: "darkBlue",
  middle: "lightBlue",
  right: "orange",
}

interface RTLLogoProps {
  className?: string
  colorScheme?: RTLColorScheme | "default" | "monochrome" | "inverted"
  monochrome?: boolean
  inverted?: boolean
  transitionDuration?: number // in milliseconds
  background?: "light" | "dark"
}

export function RTLLogo({
  className,
  colorScheme = "default",
  monochrome = false,
  inverted = false,
  transitionDuration = 500, // default transition of 500ms
  background,
}: RTLLogoProps) {
  const [hasError, setHasError] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // If there was an error, use the default color scheme
  const effectiveColorScheme = hasError ? "default" : colorScheme
  const effectiveMonochrome = hasError ? false : monochrome
  const effectiveInverted = hasError ? false : inverted

  // Determine the actual color scheme to use
  const colors = useMemo(() => {
    try {
      if (effectiveMonochrome) {
        return {
          left: "black",
          middle: "black",
          right: "black",
        } as RTLColorScheme
      }

      if (effectiveColorScheme === "monochrome") {
        return {
          left: "black",
          middle: "black",
          right: "black",
        } as RTLColorScheme
      }

      if (effectiveColorScheme === "inverted") {
        return {
          left: "gray",
          middle: "gray",
          right: "gray",
        } as RTLColorScheme
      }

      if (effectiveColorScheme === "default") {
        return DEFAULT_COLOR_SCHEME
      }

      // Validate that the color scheme has valid colors
      if (
        typeof effectiveColorScheme === "object" &&
        effectiveColorScheme.left in RTL_COLORS &&
        effectiveColorScheme.middle in RTL_COLORS &&
        effectiveColorScheme.right in RTL_COLORS
      ) {
        return effectiveColorScheme
      }

      // If we get here, there's something wrong with the color scheme
      return DEFAULT_COLOR_SCHEME
    } catch (error) {
      console.error("Error processing RTL logo colors:", error)
      setHasError(true)
      return DEFAULT_COLOR_SCHEME
    }
  }, [effectiveColorScheme, effectiveMonochrome, effectiveInverted])

  // Update CSS variables when colors change
  useEffect(() => {
    try {
      if (containerRef.current) {
        // Get the actual color values
        const leftColor = RTL_COLORS[colors.left]
        const middleColor = RTL_COLORS[colors.middle]
        const rightColor = RTL_COLORS[colors.right]

        // Set CSS variables
        containerRef.current.style.setProperty("--rtl-logo-left-color", leftColor)
        containerRef.current.style.setProperty("--rtl-logo-middle-color", middleColor)
        containerRef.current.style.setProperty("--rtl-logo-right-color", rightColor)
        containerRef.current.style.setProperty("--rtl-logo-transition-duration", `${transitionDuration}ms`)
      }
    } catch (error) {
      console.error("Error updating RTL logo CSS variables:", error)
      setHasError(true)
    }
  }, [colors, transitionDuration])

  // Render the logo with error handling
  try {
    return (
      <div
        ref={containerRef}
        className={className}
        style={
          {
            // Set initial CSS variables
            "--rtl-logo-left-color": RTL_COLORS[colors.left],
            "--rtl-logo-middle-color": RTL_COLORS[colors.middle],
            "--rtl-logo-right-color": RTL_COLORS[colors.right],
            "--rtl-logo-transition-duration": `${transitionDuration}ms`,
          } as React.CSSProperties
        }
      >
        <SafeSvgWrapper>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 114 20" className="w-full h-full">
            <path className="rtl-logo-left-block" d="M35.565 0H0v20h35.565z"></path>
            <path
              fill="#fff"
              d="M10.103 4.597h9.477c2.888 0 4.492 1.297 4.492 3.474 0 1.867-1.203 3.118-3.256 3.41l4.646 3.922h-3.566l-4.368-3.782h-4.956v3.782h-2.469zm9.154 5.001c1.527 0 2.27-.493 2.27-1.497s-.741-1.483-2.27-1.483h-6.685v2.979z"
            ></path>
            <path className="rtl-logo-middle-block" d="M74.681 0H39.117v20H74.68z"></path>
            <path fill="#fff" d="M55.664 6.727h-6.251v-2.13h14.972v2.13h-6.25v8.676h-2.471z"></path>
            <path className="rtl-logo-right-block" d="M113.798 0H78.233v20h35.565z"></path>
            <path fill="#fff" d="M89.285 4.597h2.471v8.674h10.99v2.132h-13.46V4.597Z"></path>
          </svg>
        </SafeSvgWrapper>

        {/* Add a style tag for the CSS transitions */}
        <style jsx>{`
          .rtl-logo-left-block {
            fill: var(--rtl-logo-left-color);
            transition: fill var(--rtl-logo-transition-duration) ease-in-out;
          }
          .rtl-logo-middle-block {
            fill: var(--rtl-logo-middle-color);
            transition: fill var(--rtl-logo-transition-duration) ease-in-out;
          }
          .rtl-logo-right-block {
            fill: var(--rtl-logo-right-color);
            transition: fill var(--rtl-logo-transition-duration) ease-in-out;
          }
        `}</style>
      </div>
    )
  } catch (error) {
    console.error("Error rendering RTL logo:", error)

    // Fallback to a simple text logo if SVG rendering fails
    return (
      <div className={`${className} flex items-center justify-center font-bold text-lg`}>
        <span>RTL</span>
      </div>
    )
  }
}
