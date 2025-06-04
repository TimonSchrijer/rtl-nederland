import type { PressRelease } from "./types"

// Cache for client-side requests
const clientCache = new Map<string, { data: PressRelease[]; timestamp: number }>()
const CLIENT_CACHE_TTL = 60 * 1000 // 1 minute in milliseconds

// Fetch press releases from our API route that proxies to RTL Nederland API
export async function getPressReleases(offset = 0, limit = 20, forceRefresh = false): Promise<PressRelease[]> {
  try {
    // Check client-side cache first (unless forceRefresh is true)
    const cacheKey = `press-releases:${offset}:${limit}`
    const cachedData = clientCache.get(cacheKey)
    const now = Date.now()

    if (!forceRefresh && cachedData && now - cachedData.timestamp < CLIENT_CACHE_TTL) {
      // Remove noisy console.log
      return cachedData.data
    }

    // Add a timeout to the fetch request
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout

    // Use our internal API route instead of directly calling the RTL API
    const response = await fetch(
      `/api/press-releases?offset=${offset}&limit=${limit}${forceRefresh ? "&no_cache=true" : ""}`,
      {
        signal: controller.signal,
        cache: forceRefresh ? "no-store" : "default", // Only bypass cache when forcing refresh
        next: { revalidate: 0 }, // Don't cache this request in Next.js since we're handling caching in the API route
      }
    )

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`API returned error status: ${response.status}`)
    }

    const data = await response.json()

    // Check if data has the expected structure
    let formattedData: PressRelease[] = []
    if (data && Array.isArray(data)) {
      formattedData = data.map(formatPressRelease) // If data is already an array
    } else if (data && data.items && Array.isArray(data.items)) {
      formattedData = data.items.map(formatPressRelease) // If data has an items array
    } else {
      // If we got an empty or unexpected response, return an empty array
      // This helps the UI determine we've reached the end of data
      return []
    }

    // Only store in client-side cache if not forcing refresh
    if (!forceRefresh) {
      clientCache.set(cacheKey, { data: formattedData, timestamp: now })
    }

    return formattedData
  } catch (error) {
    console.error("Error fetching press releases:", error)
    throw error // Re-throw the error to be handled by the component
  }
}

// Cache for individual press releases
const pressReleaseCache = new Map<string, { data: PressRelease; timestamp: number }>()

// Fetch a specific press release by ID
export async function getPressReleaseById(id: string, forceRefresh = false): Promise<PressRelease | null> {
  try {
    // Check client-side cache first
    const cacheKey = `press-release:${id}`
    const cachedData = pressReleaseCache.get(cacheKey)
    const now = Date.now()

    if (!forceRefresh && cachedData && now - cachedData.timestamp < CLIENT_CACHE_TTL) {
      // Remove noisy console.log
      return cachedData.data
    }

    // Add a timeout to the fetch request
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout

    // Use our internal API route instead of directly calling the RTL API
    const response = await fetch(`/api/press-releases/${id}`, {
      signal: controller.signal,
      cache: forceRefresh ? "no-store" : "default", // Only bypass cache when forcing refresh
      next: { revalidate: 0 }, // Don't cache this request in Next.js since we're handling caching in the API route
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      if (response.status === 404) {
        return null // Return null for not found
      }
      throw new Error(`API returned error status: ${response.status}`)
    }

    const data = await response.json()
    const formattedData = formatPressRelease(data)

    // Only store in client-side cache if not forcing refresh
    if (!forceRefresh) {
      pressReleaseCache.set(cacheKey, { data: formattedData, timestamp: now })
    }

    return formattedData
  } catch (error) {
    console.error(`Error fetching press release with ID ${id}:`, error)
    throw error // Re-throw the error to be handled by the component
  }
}

// Filter press releases by tag with pagination support
export async function getPressReleasesByTag(tag: string, offset = 0, limit = 20): Promise<PressRelease[]> {
  try {
    // Get a batch of press releases
    const allReleases = await getPressReleases(offset, limit)

    // Normalize the tag for comparison
    const normalizedTag = normalizeCategoryString(tag)

    // Filter by tag (exact match, case-insensitive)
    const filteredReleases = allReleases.filter((release) => {
      const releaseCategory = normalizeCategoryString(release.category)
      return releaseCategory === normalizedTag
    })

    return filteredReleases
  } catch (error) {
    console.error(`Error fetching press releases for tag ${tag}:`, error)
    throw error
  }
}

// Helper function to safely get category as string
export function getCategoryString(category: any): string {
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

// Add this new function to normalize category strings for comparison
export function normalizeCategoryString(category: any): string {
  // First get the category as a string
  const categoryString = getCategoryString(category)
  // Then normalize it: trim whitespace and convert to lowercase
  return categoryString.trim().toLowerCase()
}

// Update the getImageFromItem function to handle relative URLs and Prismic URLs
function getImageFromItem(item: any): string {
  let imageUrl = ""

  // Helper function to clean Prismic URLs
  function cleanPrismicUrl(url: string): string {
    if (!url) return ""
    
    // If it's a Prismic URL with a UUID format, transform it to the CDN URL
    if (url.includes('prismic.io') && !url.includes('images.prismic.io')) {
      // Extract the UUID and parameters
      const [baseUrl, params] = url.split('?')
      const uuid = baseUrl.split('/').pop()
      if (uuid) {
        // Construct the CDN URL
        return `https://images.prismic.io/rtlnl/${uuid}${params ? `?${params}` : ''}`
      }
    }
    return url
  }

  // Helper function to get YouTube thumbnail URL
  function getYouTubeThumbnail(videoId: string): string {
    if (!videoId) return ""
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
  }

  // First, try to get a YouTube thumbnail if there's a video
  const { videoId } = extractVideoInfo(item)
  if (videoId) {
    imageUrl = getYouTubeThumbnail(videoId)
    return imageUrl
  }

  // If no video thumbnail, check for mainImage field with various sizes
  if (item.mainImage) {
    // Use different sizes based on availability
    const mainImageUrl =
      cleanPrismicUrl(item.mainImage.landscape) ||
      cleanPrismicUrl(item.mainImage.medium16x9) ||
      cleanPrismicUrl(item.mainImage.article960x540) ||
      cleanPrismicUrl(item.mainImage.small) ||
      cleanPrismicUrl(item.mainImage.portrait) ||
      cleanPrismicUrl(item.mainImage.article480x270) ||
      cleanPrismicUrl(item.mainImage.article1920x1080)

    if (mainImageUrl) {
      imageUrl = mainImageUrl
    }
  }

  // If no mainImage, check all possible image fields
  if (!imageUrl) {
    const alternativeUrl =
      (item.image && typeof item.image === "string" && cleanPrismicUrl(item.image)) ||
      (item.thumbnail && typeof item.thumbnail === "string" && cleanPrismicUrl(item.thumbnail)) ||
      (item.featured_image && typeof item.featured_image === "string" && cleanPrismicUrl(item.featured_image)) ||
      (item.hero_image && typeof item.hero_image === "string" && cleanPrismicUrl(item.hero_image))

    if (alternativeUrl) {
      imageUrl = alternativeUrl
    }
  }

  // Ensure the URL is absolute and valid
  if (imageUrl) {
    if (!imageUrl.startsWith("http") && !imageUrl.startsWith("/")) {
      imageUrl = "/" + imageUrl
    }
    return imageUrl
  }

  // If no valid image was found, use the fallback
  return "/rtl-fallback-image.png"
}

// Function to extract YouTube video ID from various YouTube URL formats
function extractYouTubeId(url: string): string | null {
  if (!url || typeof url !== "string") return null

  // Match patterns like:
  // - https://www.youtube.com/watch?v=VIDEO_ID
  // - https://youtu.be/VIDEO_ID
  // - https://www.youtube.com/embed/VIDEO_ID
  const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)

  return match && match[2].length === 11 ? match[2] : null
}

// Function to extract video information from the press release data
function extractVideoInfo(item: any): { videoId: string | null; videoTitle: string | null } {
  if (!item) return { videoId: null, videoTitle: null }

  try {
    // Check for mainVideo field with embedded iframe
    if (item.mainVideo && typeof item.mainVideo === "string") {
      // Extract YouTube video ID from iframe src attribute
      const srcMatch = item.mainVideo.match(/src="[^"]*youtube\.com\/embed\/([^?"]+)/i)
      if (srcMatch && srcMatch[1]) {
        return {
          videoId: srcMatch[1],
          videoTitle: item.title || "YouTube video",
        }
      }
    }

    // Check if there's a dedicated video field in the API response
    if (item.video) {
      // If it's a string, try to extract a YouTube ID
      if (typeof item.video === "string") {
        const id = extractYouTubeId(item.video)
        if (id) {
          return {
            videoId: id,
            videoTitle: item.videoTitle || item.title || "YouTube video",
          }
        }
      }

      // If it's an object, check for common video URL fields
      if (typeof item.video === "object" && item.video !== null) {
        const videoUrl = item.video.url || item.video.src || item.video.embed || item.video.youtube
        if (videoUrl) {
          const id = extractYouTubeId(videoUrl)
          if (id) {
            return {
              videoId: id,
              videoTitle: item.video.title || item.videoTitle || item.title || "YouTube video",
            }
          }
        }
      }
    }

    // Check if there's a media array with videos
    if (item.media && Array.isArray(item.media)) {
      for (const mediaItem of item.media) {
        // Skip non-video media
        if (mediaItem.type !== "video" && mediaItem.type !== "youtube") continue

        const videoUrl = mediaItem.url || mediaItem.src || mediaItem.embed
        if (videoUrl) {
          const id = extractYouTubeId(videoUrl)
          if (id) {
            return {
              videoId: id,
              videoTitle: mediaItem.title || mediaItem.alt || item.title || "YouTube video",
            }
          }
        }
      }
    }

    // Check if the content contains YouTube links
    if (item.content && typeof item.content === "string") {
      // Simple regex to find YouTube links in the content
      const youtubeRegex =
        /(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/(watch\?v=|embed\/|shorts\/|v\/|u\/\w\/|watch\?.*v=)?([^#&?]*).*/g
      const matches = item.content.match(youtubeRegex)

      if (matches && matches.length > 0) {
        for (const match of matches) {
          const id = extractYouTubeId(match)
          if (id) {
            return {
              videoId: id,
              videoTitle: item.title || "YouTube video",
            }
          }
        }
      }
    }

    return { videoId: null, videoTitle: null }
  } catch (error) {
    console.error("Error extracting video info:", error)
    return { videoId: null, videoTitle: null }
  }
}

// Helper function to format and normalize press release data
function formatPressRelease(item: any): PressRelease {
  // Extract date information with priority to datePosted field
  let dateString = new Date().toISOString() // Default to current date
  let formattedDate = null

  // Check for datePosted field with formatted and unix timestamp
  if (item.datePosted) {
    if (typeof item.datePosted === "object") {
      // If datePosted has formatted and unix properties
      if (item.datePosted.formatted) {
        formattedDate = item.datePosted.formatted
      }

      if (item.datePosted.unix && typeof item.datePosted.unix === "number") {
        // Convert unix timestamp to ISO string (handle milliseconds)
        dateString = new Date(item.datePosted.unix).toISOString()
      }
    } else if (typeof item.datePosted === "string") {
      // If datePosted is a string, try to parse it
      try {
        dateString = new Date(item.datePosted).toISOString()
      } catch (e) {
        console.warn("Could not parse datePosted string:", item.datePosted)
      }
    }
  }
  // Check for releaseDate field which might be more accurate
  else if (item.releaseDate) {
    if (typeof item.releaseDate === "object") {
      // If releaseDate has formatted property
      if (item.releaseDate.formatted) {
        formattedDate = item.releaseDate.formatted
      }

      // If releaseDate has unix property
      if (item.releaseDate.unix && typeof item.releaseDate.unix === "number") {
        dateString = new Date(item.releaseDate.unix).toISOString()
      }
    } else if (typeof item.releaseDate === "string") {
      try {
        dateString = new Date(item.releaseDate).toISOString()
      } catch (e) {
        console.warn("Could not parse releaseDate string:", item.releaseDate)
      }
    }
  }
  // Fallback to date field if neither datePosted nor releaseDate is available
  else if (item.date) {
    if (typeof item.date === "object") {
      // If date has formatted property
      if (item.date.formatted) {
        formattedDate = item.date.formatted
      }

      // If date has unix property
      if (item.date.unix && typeof item.date.unix === "number") {
        dateString = new Date(item.date.unix).toISOString()
      }
    } else if (typeof item.date === "string") {
      // If date is a string, try to parse it
      try {
        dateString = new Date(item.date).toISOString()
      } catch (e) {
        console.warn("Could not parse date string:", item.date)
      }
    }
  }

  // Store the original date objects
  const datePosted = item.datePosted || null
  const releaseDate = item.releaseDate || null

  // Extract video information
  const { videoId, videoTitle } = extractVideoInfo(item)

  // Create a normalized press release object with fallbacks
  return {
    id: item.id || item.slug || Math.random().toString(36).substring(2, 9),
    title: item.title || "Untitled Press Release",
    date: dateString,
    formattedDate: formattedDate || (releaseDate?.formatted || datePosted?.formatted), // Use the most specific formatted date
    datePosted: datePosted, // Store the original datePosted object
    releaseDate: releaseDate, // Store the original releaseDate object
    content: item.content || item.body || item.description || "<p>No content available</p>",
    excerpt:
      item.excerpt ||
      item.shortDescription ||
      item.chapeau ||
      (item.content ? item.content.substring(0, 150).replace(/<[^>]*>/g, "") + "..." : ""),
    category: item.category || item.type || item.tags?.[0] || "Nieuws",
    image: getImageFromItem(item),
    // Additional fields
    publishedAt: dateString,
    thumbnail: item.thumbnail || item.featured_image || item.image,
    // Store the mainImage object for responsive images
    mainImage: item.mainImage || null,
    // Add video information
    mainVideo: item.mainVideo || null,
    video: item.video || null,
    videoId: videoId,
    videoTitle: videoTitle,
    media: item.media || null,
  }
}

// Add a new function to force refresh press releases
export async function refreshPressReleases(offset = 0, limit = 20): Promise<PressRelease[]> {
  return getPressReleases(offset, limit, true)
}
