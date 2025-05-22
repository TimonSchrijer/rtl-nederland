"use client"

import { createContext, useContext, useState, useRef, type ReactNode } from "react"
import { type RTLColorScheme, DEFAULT_COLOR_SCHEME, RTL_COLORS } from "@/components/rtl-logo"
import { extractDominantColors, findClosestRTLColor, getHarmonizedColorScheme } from "@/lib/color-utils"

interface LogoContextType {
  colorScheme: RTLColorScheme
  setColorScheme: (scheme: RTLColorScheme) => void
  updateColorsFromImage: (imageUrl: string) => Promise<void>
  resetColorScheme: () => void
}

const LogoContext = createContext<LogoContextType | undefined>(undefined)

// Add this function at the top of the file, after the imports
function hexToHSL(hex: string): { h: number; s: number; l: number } {
  // Remove the # if present
  hex = hex.replace(/^#/, "")

  // Parse the hex values
  const r = Number.parseInt(hex.substring(0, 2), 16) / 255
  const g = Number.parseInt(hex.substring(2, 4), 16) / 255
  const b = Number.parseInt(hex.substring(4, 6), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }

    h = h * 60
  }

  return { h, s: s * 100, l: l * 100 }
}

// Function to calculate relative luminance for WCAG contrast
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Convert HSL to RGB for contrast calculations
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number, k = (n + h / 30) % 12) => l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
  return [
    Math.round(f(0) * 255),
    Math.round(f(8) * 255),
    Math.round(f(4) * 255)
  ];
}

// Calculate contrast ratio between two colors
function getContrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function hasGoodContrast(hsl: { h: number; s: number; l: number }, backgroundColor: { h: number; s: number; l: number }): boolean {
  // Convert both colors to RGB
  const [r1, g1, b1] = hslToRgb(hsl.h, hsl.s, hsl.l);
  const [r2, g2, b2] = hslToRgb(backgroundColor.h, backgroundColor.s, backgroundColor.l);

  // Calculate luminance
  const l1 = getLuminance(r1, g1, b1);
  const l2 = getLuminance(r2, g2, b2);

  // Get contrast ratio
  const ratio = getContrastRatio(l1, l2);

  // WCAG AA requires 4.5:1 for normal text
  return ratio >= 4.5;
}

function adjustColorForContrast(hsl: { h: number; s: number; l: number }): { h: number; s: number; l: number } {
  const backgroundColor = { h: 0, s: 0, l: 100 }; // White background
  const color = { ...hsl };

  // If the color doesn't have good contrast, adjust it
  if (!hasGoodContrast(color, backgroundColor)) {
    // Try darkening the color first
    while (color.l > 20 && !hasGoodContrast(color, backgroundColor)) {
      color.l -= 5;
    }

    // If darkening didn't work, try a different hue for problematic colors
    if (!hasGoodContrast(color, backgroundColor)) {
      // Yellow and light colors are often problematic
      // Convert them to a more accessible color
      if ((color.h >= 50 && color.h <= 70) || color.l > 80) {
        color.h = 210; // Convert to blue
        color.s = 100;
        color.l = 45;
      }
    }
  }

  return color;
}

function isGrayscale(hsl: { h: number; s: number; l: number }): boolean {
  // A color is considered grayscale if:
  // 1. It has very low saturation (less than 15%)
  // 2. Or if it's very dark (less than 15% lightness)
  // 3. Or if it's very light (more than 85% lightness)
  return hsl.s < 15 || hsl.l < 15 || hsl.l > 85
}

function calculateColorVibrancy(hsl: { h: number; s: number; l: number }): number {
  // Return -1 for grayscale colors to exclude them from selection
  if (isGrayscale(hsl)) {
    return -1;
  }

  // Check contrast with white background
  const backgroundColor = { h: 0, s: 0, l: 100 };
  if (!hasGoodContrast(hsl, backgroundColor)) {
    return -1; // Exclude colors with poor contrast
  }

  // Higher score means more vibrant
  const saturationScore = hsl.s * 2;
  const lightnessScore = 100 - Math.abs(50 - hsl.l) * 1.5;
  return saturationScore + lightnessScore;
}

function findMostVibrantColor(colors: { h: number; s: number; l: number }[]): { h: number; s: number; l: number } {
  // Filter out grayscale and low-contrast colors first
  const accessibleColors = colors.filter(color => !isGrayscale(color) && hasGoodContrast(color, { h: 0, s: 0, l: 100 }));

  // If we have accessible colors, choose from them
  if (accessibleColors.length > 0) {
    return accessibleColors.reduce((mostVibrant, current) => {
      const currentVibrancy = calculateColorVibrancy(current);
      const mostVibrantScore = calculateColorVibrancy(mostVibrant);
      return currentVibrancy > mostVibrantScore ? current : mostVibrant;
    });
  }

  // Default to an accessible blue
  return {
    h: 210,
    s: 100,
    l: 45
  };
}

function adjustColorForLinks(hsl: { h: number; s: number; l: number }): { h: number; s: number; l: number } {
  // First ensure the color meets contrast requirements
  const accessibleColor = adjustColorForContrast(hsl);
  
  // Then adjust for vibrancy while maintaining contrast
  return {
    h: accessibleColor.h,
    s: Math.max(accessibleColor.s, 85),
    l: Math.max(40, Math.min(accessibleColor.l, 60))
  };
}

function adjustColorForLinkHover(hsl: { h: number; s: number; l: number }): { h: number; s: number; l: number } {
  return {
    h: hsl.h,
    s: Math.min(hsl.s + 15, 100), // Increase saturation more
    l: Math.max(30, hsl.l - 10) // Make slightly darker on hover
  }
}

export function LogoProvider({ children }: { children: ReactNode }) {
  const [colorScheme, setColorSchemeState] = useState<RTLColorScheme>(DEFAULT_COLOR_SCHEME)
  const lastUpdateTime = useRef<number>(0)
  const updateThrottleMs = 1000 // Only allow updates every 1 second
  const lastImageUrl = useRef<string | null>(null)

  // Update the setColorScheme function in the LogoProvider component to also update CSS variables
  const setColorScheme = (scheme: RTLColorScheme) => {
    // Update the state
    setColorSchemeState(scheme)

    // Update CSS variables for the entire page
    if (typeof document !== "undefined") {
      const root = document.documentElement

      // Get the actual color values
      const leftColor = RTL_COLORS[scheme.left]
      const middleColor = RTL_COLORS[scheme.middle]
      const rightColor = RTL_COLORS[scheme.right]

      // Convert hex colors to HSL
      const leftHSL = hexToHSL(leftColor)
      const middleHSL = hexToHSL(middleColor)
      const rightHSL = hexToHSL(rightColor)

      // Find the most vibrant color for links
      const mostVibrantHSL = findMostVibrantColor([leftHSL, middleHSL, rightHSL])
      
      // Create link colors based on the most vibrant color
      const linkHSL = adjustColorForLinks(mostVibrantHSL)
      const linkHoverHSL = adjustColorForLinkHover(linkHSL)

      // Set the primary colors
      root.style.setProperty("--rtl-primary", `${leftHSL.h} ${leftHSL.s}% ${leftHSL.l}%`)
      root.style.setProperty("--rtl-secondary", `${middleHSL.h} ${middleHSL.s}% ${middleHSL.l}%`)
      root.style.setProperty("--rtl-tertiary", `${rightHSL.h} ${rightHSL.s}% ${rightHSL.l}%`)

      // Set link colors
      root.style.setProperty("--rtl-link", `${linkHSL.h} ${linkHSL.s}% ${linkHSL.l}%`)
      root.style.setProperty("--rtl-link-hover", `${linkHoverHSL.h} ${linkHoverHSL.s}% ${linkHoverHSL.l}%`)

      // Set foreground colors
      root.style.setProperty("--rtl-primary-foreground", "0 0% 100%")
      root.style.setProperty("--rtl-secondary-foreground", "0 0% 100%")
      root.style.setProperty("--rtl-tertiary-foreground", "0 0% 100%")
    }
  }

  // Update the resetColorScheme function to reset CSS variables
  const resetColorScheme = () => {
    setColorScheme(DEFAULT_COLOR_SCHEME)
  }

  // Ensure the colors are distinct
  const ensureDistinctColors = (scheme: RTLColorScheme): RTLColorScheme => {
    if (scheme.left !== scheme.middle && scheme.left !== scheme.right && scheme.middle !== scheme.right) {
      return scheme
    }

    const colorKeys = Object.keys(RTL_COLORS) as Array<keyof typeof RTL_COLORS>
    const newScheme = { ...scheme }

    // If left and middle are the same, change middle
    if (newScheme.left === newScheme.middle) {
      const options = colorKeys.filter((color) => color !== newScheme.left && color !== newScheme.right)
      if (options.length > 0) {
        newScheme.middle = options[Math.floor(Math.random() * options.length)]
      }
    }

    // If left and right are the same, change right
    if (newScheme.left === newScheme.right) {
      const options = colorKeys.filter((color) => color !== newScheme.left && color !== newScheme.middle)
      if (options.length > 0) {
        newScheme.right = options[Math.floor(Math.random() * options.length)]
      }
    }

    // If middle and right are the same, change right
    if (newScheme.middle === newScheme.right) {
      const options = colorKeys.filter((color) => color !== newScheme.left && color !== newScheme.middle)
      if (options.length > 0) {
        newScheme.right = options[Math.floor(Math.random() * options.length)]
      }
    }

    return newScheme
  }

  const updateColorsFromImage = async (imageUrl: string) => {
    // Throttle updates to prevent too many in a short time
    const now = Date.now()
    if (now - lastUpdateTime.current < updateThrottleMs) {
      return
    }

    // Skip if it's the same image we just processed
    if (imageUrl === lastImageUrl.current) {
      return
    }

    lastUpdateTime.current = now
    lastImageUrl.current = imageUrl

    try {
      if (!imageUrl) {
        return
      }

      // Extract dominant colors from the image using our improved function
      const dominantColors = await extractDominantColors(imageUrl)

      if (!dominantColors || !Array.isArray(dominantColors) || dominantColors.length === 0) {
        return
      }

      let newColorScheme: RTLColorScheme

      if (dominantColors.length >= 3) {
        // Find the closest RTL colors to the dominant colors
        const leftColor = findClosestRTLColor(dominantColors[0], RTL_COLORS) as keyof typeof RTL_COLORS
        const middleColor = findClosestRTLColor(dominantColors[1], RTL_COLORS) as keyof typeof RTL_COLORS
        const rightColor = findClosestRTLColor(dominantColors[2], RTL_COLORS) as keyof typeof RTL_COLORS

        // Create the new color scheme
        newColorScheme = {
          left: leftColor,
          middle: middleColor,
          right: rightColor,
        }
      } else if (dominantColors.length > 0) {
        // If we only have one dominant color, create a harmonized scheme
        const harmonizedScheme = getHarmonizedColorScheme(dominantColors[0], RTL_COLORS)

        newColorScheme = {
          left: harmonizedScheme[0] as keyof typeof RTL_COLORS,
          middle: harmonizedScheme[1] as keyof typeof RTL_COLORS,
          right: harmonizedScheme[2] as keyof typeof RTL_COLORS,
        }
      } else {
        // Fallback to default if no colors were extracted
        return
      }

      // Ensure the new color scheme has distinct colors
      const distinctScheme = ensureDistinctColors(newColorScheme)

      // Update the color scheme
      setColorScheme(distinctScheme)

      // Log the color scheme for debugging
      console.log("Updated logo colors based on image:", distinctScheme)
    } catch (error) {
      console.error("Error updating colors from image:", error)
    }
  }

  return (
    <LogoContext.Provider value={{ colorScheme, setColorScheme, updateColorsFromImage, resetColorScheme }}>
      {children}
    </LogoContext.Provider>
  )
}

export function useLogo() {
  const context = useContext(LogoContext)
  if (context === undefined) {
    throw new Error("useLogo must be used within a LogoProvider")
  }
  return context
}
