import { NextResponse } from "next/server"
import { kv } from "@vercel/kv"

// Cache TTL in seconds (1 minute)
const CACHE_TTL = 60

export async function GET(request: Request) {
  try {
    // Get query parameters from the request URL
    const url = new URL(request.url)
    const offset = url.searchParams.get("offset") || "0"
    const limit = url.searchParams.get("limit") || "20"
    const noCache = url.searchParams.get("no_cache") === "true"

    // Create a cache key based on the request parameters
    const cacheKey = `press-releases:${offset}:${limit}`

    // Try to get data from cache first (unless no_cache is true)
    let data
    if (!noCache) {
      try {
        data = await kv.get(cacheKey)

        // If we have cached data, return it immediately with stale-while-revalidate
        if (data) {
          // Start background revalidation
          revalidateData(cacheKey, offset, limit).catch(console.error)

          return NextResponse.json(data, {
            status: 200,
            headers: {
              "Cache-Control": "no-cache, no-store, must-revalidate",
              "Pragma": "no-cache",
              "Expires": "0",
              "X-Cache": "HIT",
            },
          })
        }
      } catch (cacheError) {
        console.warn("Failed to get from cache:", cacheError)
      }
    }

    // If we don't have cached data or no_cache is true, fetch from RTL API
    const response = await fetch(`https://www.rtl.nl/data/press-releases?offset=${offset}&limit=${limit}`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`RTL API returned status: ${response.status}`)
    }

    data = await response.json()

    // Cache the response (unless no_cache is true)
    if (!noCache) {
      try {
        await kv.set(cacheKey, data, { ex: CACHE_TTL })
      } catch (cacheError) {
        console.warn("Failed to store in cache:", cacheError)
      }
    }

    // Return the data with appropriate cache headers
    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
        "X-Cache": "MISS",
      },
    })
  } catch (error) {
    console.error("Error in press-releases API route:", error)
    return NextResponse.json({ error: "Failed to fetch press releases" }, { status: 500 })
  }
}

// Helper function to revalidate data in the background
async function revalidateData(cacheKey: string, offset: string, limit: string) {
  try {
    // Fetch fresh data from RTL API
    const response = await fetch(`https://www.rtl.nl/data/press-releases?offset=${offset}&limit=${limit}`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`RTL API returned status: ${response.status}`)
    }

    const freshData = await response.json()

    // Update the cache with fresh data
    await kv.set(cacheKey, freshData, { ex: CACHE_TTL })
  } catch (error) {
    console.error("Failed to revalidate data:", error)
  }
}
