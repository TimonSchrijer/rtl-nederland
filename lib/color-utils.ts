// Function to extract dominant colors from an image URL using Canvas API
export async function extractDominantColors(imageUrl: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    try {
      // Create an image element to load the image
      const img = new Image()
      img.crossOrigin = "anonymous" // Prevent CORS issues

      img.onload = () => {
        try {
          // Create a canvas to draw the image
          const canvas = document.createElement("canvas")
          // Scale down the image for faster processing
          const maxSize = 100
          const scale = Math.min(maxSize / img.width, maxSize / img.height)
          const width = Math.floor(img.width * scale)
          const height = Math.floor(img.height * scale)

          canvas.width = width
          canvas.height = height

          // Draw the image on the canvas
          const ctx = canvas.getContext("2d")
          if (!ctx) {
            throw new Error("Could not get canvas context")
          }

          ctx.drawImage(img, 0, 0, width, height)

          // Get the image data
          const imageData = ctx.getImageData(0, 0, width, height)
          const pixels = imageData.data

          // Create a color map to count occurrences of each color
          const colorMap: Record<string, number> = {}

          // Sample pixels (skip some pixels for performance)
          const sampleStep = 5
          for (let i = 0; i < pixels.length; i += sampleStep * 4) {
            const r = pixels[i]
            const g = pixels[i + 1]
            const b = pixels[i + 2]
            const a = pixels[i + 3]

            // Skip transparent pixels
            if (a < 128) continue

            // Skip very dark and very light pixels
            const brightness = (r + g + b) / 3
            if (brightness < 20 || brightness > 235) continue

            // Quantize colors to reduce the number of unique colors
            const quantizedR = Math.round(r / 16) * 16
            const quantizedG = Math.round(g / 16) * 16
            const quantizedB = Math.round(b / 16) * 16

            const colorKey = `#${quantizedR.toString(16).padStart(2, "0")}${quantizedG.toString(16).padStart(2, "0")}${quantizedB.toString(16).padStart(2, "0")}`

            colorMap[colorKey] = (colorMap[colorKey] || 0) + 1
          }

          // Sort colors by frequency
          const sortedColors = Object.entries(colorMap)
            .sort((a, b) => b[1] - a[1])
            .map(([color]) => color)

          // Filter out similar colors (keep colors that are distinct enough)
          const distinctColors: string[] = []
          for (const color of sortedColors) {
            if (distinctColors.length >= 3) break

            // Check if this color is distinct from already selected colors
            const isDistinct = distinctColors.every((existingColor) => {
              return !areColorsSimilar(color, existingColor)
            })

            if (isDistinct) {
              distinctColors.push(color)
            }
          }

          // If we don't have enough distinct colors, add more from the sorted list
          while (distinctColors.length < 3 && sortedColors.length > distinctColors.length) {
            const nextColor = sortedColors[distinctColors.length]
            if (!distinctColors.includes(nextColor)) {
              distinctColors.push(nextColor)
            }
          }

          // If we still don't have 3 colors, generate additional ones
          while (distinctColors.length < 3) {
            if (distinctColors.length === 0) {
              // Default RTL colors if we couldn't extract any
              distinctColors.push("#0975F3")
              distinctColors.push("#16B8FE")
              distinctColors.push("#FE9726")
            } else if (distinctColors.length === 1) {
              // Generate complementary color
              const hsl = hexToHSL(distinctColors[0])
              const complementary = hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l)
              distinctColors.push(complementary)

              // Generate a third color (triadic)
              const triadic = hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l)
              distinctColors.push(triadic)
            } else if (distinctColors.length === 2) {
              // Generate a third color that's distinct from the first two
              const hsl1 = hexToHSL(distinctColors[0])
              const hsl2 = hexToHSL(distinctColors[1])
              const averageHue = (hsl1.h + hsl2.h) / 2
              const thirdHue = (averageHue + 120) % 360
              const thirdColor = hslToHex(thirdHue, Math.max(hsl1.s, hsl2.s), Math.max(hsl1.l, hsl2.l))
              distinctColors.push(thirdColor)
            }
          }

          resolve(distinctColors)
        } catch (error) {
          console.error("Error processing image data:", error)
          // Return default colors on error
          resolve(["#0975F3", "#16B8FE", "#FE9726"])
        }
      }

      img.onerror = () => {
        console.error("Error loading image:", imageUrl)
        // Return default colors on error
        resolve(["#0975F3", "#16B8FE", "#FE9726"])
      }

      // Start loading the image
      img.src = imageUrl
    } catch (error) {
      console.error("Error in extractDominantColors:", error)
      // Return default colors on error
      resolve(["#0975F3", "#16B8FE", "#FE9726"])
    }
  })
}

// Helper function to check if two colors are similar
function areColorsSimilar(color1: string, color2: string, threshold = 0.25): boolean {
  const hsl1 = hexToHSL(color1)
  const hsl2 = hexToHSL(color2)

  // Calculate color distance (simplified)
  const hueDiff = Math.min(Math.abs(hsl1.h - hsl2.h), 360 - Math.abs(hsl1.h - hsl2.h)) / 180
  const satDiff = Math.abs(hsl1.s - hsl2.s)
  const lightDiff = Math.abs(hsl1.l - hsl2.l)

  // Combined difference (weighted)
  const totalDiff = hueDiff * 0.5 + satDiff * 0.25 + lightDiff * 0.25

  return totalDiff < threshold
}

// Convert hex color to HSL
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

  return { h, s, l }
}

// Convert HSL to hex
function hslToHex(h: number, s: number, l: number): string {
  h = h % 360

  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2

  let r = 0
  let g = 0
  let b = 0

  if (h >= 0 && h < 60) {
    r = c
    g = x
    b = 0
  } else if (h >= 60 && h < 120) {
    r = x
    g = c
    b = 0
  } else if (h >= 120 && h < 180) {
    r = 0
    g = c
    b = x
  } else if (h >= 180 && h < 240) {
    r = 0
    g = x
    b = c
  } else if (h >= 240 && h < 300) {
    r = x
    g = 0
    b = c
  } else {
    r = c
    g = 0
    b = x
  }

  r = Math.round((r + m) * 255)
  g = Math.round((g + m) * 255)
  b = Math.round((b + m) * 255)

  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`
}

// Find the closest RTL color to a given hex color
export function findClosestRTLColor(hexColor: string, rtlColors: Record<string, string>): string {
  try {
    // Convert the input color to HSL for better comparison
    const inputHSL = hexToHSL(hexColor)

    let closestColor = Object.keys(rtlColors)[0]
    let smallestDistance = Number.MAX_VALUE

    // Find the RTL color with the smallest distance to the input color
    for (const [colorName, colorHex] of Object.entries(rtlColors)) {
      const rtlHSL = hexToHSL(colorHex)

      // Calculate color distance in HSL space (weighted)
      const hueDiff = Math.min(Math.abs(inputHSL.h - rtlHSL.h), 360 - Math.abs(inputHSL.h - rtlHSL.h)) / 180
      const satDiff = Math.abs(inputHSL.s - rtlHSL.s)
      const lightDiff = Math.abs(inputHSL.l - rtlHSL.l)

      // Combined difference (weighted to prioritize hue)
      const distance = hueDiff * 0.6 + satDiff * 0.2 + lightDiff * 0.2

      if (distance < smallestDistance) {
        smallestDistance = distance
        closestColor = colorName
      }
    }

    return closestColor
  } catch (error) {
    console.error("Error finding closest RTL color:", error)
    return Object.keys(rtlColors)[0] // Return first color as fallback
  }
}

// Get a harmonized color scheme based on a dominant color
export function getHarmonizedColorScheme(dominantColor: string, rtlColors: Record<string, string>): string[] {
  try {
    // Convert the dominant color to HSL
    const hsl = hexToHSL(dominantColor)

    // Create a triadic color scheme
    const color2Hue = (hsl.h + 120) % 360
    const color3Hue = (hsl.h + 240) % 360

    // Convert back to hex
    const color2 = hslToHex(color2Hue, hsl.s, hsl.l)
    const color3 = hslToHex(color3Hue, hsl.s, hsl.l)

    // Find the closest RTL colors
    const rtlColor1 = findClosestRTLColor(dominantColor, rtlColors)
    const rtlColor2 = findClosestRTLColor(color2, rtlColors)
    const rtlColor3 = findClosestRTLColor(color3, rtlColors)

    // Ensure all three colors are different
    if (rtlColor1 === rtlColor2 || rtlColor1 === rtlColor3 || rtlColor2 === rtlColor3) {
      // If we have duplicates, try a different approach
      const colorKeys = Object.keys(rtlColors)
      const shuffled = [...colorKeys].sort(() => Math.random() - 0.5)
      return Array.from(new Set([rtlColor1, ...shuffled])).slice(0, 3)
    }

    return [rtlColor1, rtlColor2, rtlColor3]
  } catch (error) {
    console.error("Error creating harmonized color scheme:", error)
    // Return default colors on error
    return ["darkBlue", "lightBlue", "orange"]
  }
}
