import { NextResponse } from "next/server"
import { kv } from "@vercel/kv"

// Cache TTL in seconds (5 minutes)
const CACHE_TTL = 300
// Stale-while-revalidate window in seconds (30 seconds)
const SWR_WINDOW = 30

// Simple in-memory cache for local development
const memoryCache = new Map<string, { data: any; timestamp: number }>()

// Helper function to determine if we can use Vercel KV
async function canUseVercelKV() {
  try {
    // Try to access KV to check if it's properly configured
    await kv.ping()
    return true
  } catch {
    return false
  }
}

// Helper function to get cache data
async function getCacheData(key: string) {
  try {
    // Try Vercel KV first
    if (await canUseVercelKV()) {
      return await kv.get<{ data: any; timestamp: number }>(key)
    }
    // Fall back to memory cache
    return memoryCache.get(key)
  } catch {
    // If anything goes wrong, fall back to memory cache
    return memoryCache.get(key)
  }
}

// Helper function to set cache data
async function setCacheData(key: string, value: { data: any; timestamp: number }, ttl: number) {
  try {
    // Try Vercel KV first
    if (await canUseVercelKV()) {
      await kv.set(key, value, { ex: ttl })
    }
    // Fall back to memory cache
    memoryCache.set(key, value)
  } catch {
    // If anything goes wrong, fall back to memory cache
    memoryCache.set(key, value)
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = await params.id
    const url = new URL(request.url)
    const noCache = url.searchParams.get("no_cache") === "true"

    // Create a cache key for this press release
    const cacheKey = `press-release:${id}`

    // Try to get data from cache first (unless no_cache is true)
    let data
    let isStale = false
    if (!noCache) {
      const cacheData = await getCacheData(cacheKey)
      
      if (cacheData) {
        const age = Math.floor((Date.now() - cacheData.timestamp) / 1000)
        isStale = age >= CACHE_TTL
        
        // Use cached data if within TTL or within SWR window
        if (!isStale || age < CACHE_TTL + SWR_WINDOW) {
          data = cacheData.data
          
          // If stale, trigger background revalidation
          if (isStale) {
            revalidateData(cacheKey, id).catch(console.error)
          }
        }
      }
    }

    // If we don't have usable cached data, fetch from RTL API
    if (!data) {
      const response = await fetch(`https://www.rtl.nl/data/press-releases/${id}`, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        cache: "no-store",
      })

      if (!response.ok) {
        if (response.status === 404) {
          return NextResponse.json({ error: "Press release not found" }, { status: 404 })
        }
        throw new Error(`RTL API returned status: ${response.status}`)
      }

      data = await response.json()

      // Cache the fresh data (unless no_cache is true)
      if (!noCache) {
        await setCacheData(cacheKey, {
          data,
          timestamp: Date.now()
        }, CACHE_TTL + SWR_WINDOW)
      }
    }

    // Return the data with appropriate cache headers
    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Cache-Control": isStale ? "no-cache" : `max-age=${CACHE_TTL}, stale-while-revalidate=${SWR_WINDOW}`,
        "X-Cache": data ? (isStale ? "STALE" : "HIT") : "MISS",
      },
    })
  } catch (error) {
    console.error("Error in press-release API route:", error)
    return NextResponse.json({ error: "Failed to fetch press release" }, { status: 500 })
  }
}

// Helper function to revalidate data in the background
async function revalidateData(cacheKey: string, id: string) {
  try {
    const response = await fetch(`https://www.rtl.nl/data/press-releases/${id}`, {
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

    // Store the fresh data with a new timestamp
    await setCacheData(cacheKey, {
      data: freshData,
      timestamp: Date.now()
    }, CACHE_TTL + SWR_WINDOW)
  } catch (error) {
    console.error("Failed to revalidate data:", error)
  }
}
