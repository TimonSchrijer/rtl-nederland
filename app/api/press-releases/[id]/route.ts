import { NextResponse } from "next/server"
import { kv } from "@vercel/kv"

// Cache TTL in seconds (1 minute)
const CACHE_TTL = 60

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const noCache = new URL(request.url).searchParams.get("no_cache") === "true"

    // Create a cache key for this press release
    const cacheKey = `press-release:${id}`

    // Try to get from cache first (unless no_cache is true)
    let pressRelease
    if (!noCache) {
      try {
        pressRelease = await kv.get(cacheKey)

        // If we have cached data, return it immediately with stale-while-revalidate
        if (pressRelease) {
          // Start background revalidation
          revalidateData(cacheKey, id).catch(console.error)

          return NextResponse.json(pressRelease, {
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

    // If not in cache or no_cache is true, try to fetch directly first
    try {
      const response = await fetch(`https://www.rtl.nl/data/press-releases/${id}`, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        cache: noCache ? "no-store" : "no-cache",
      })

      if (response.ok) {
        pressRelease = await response.json()

        // Cache the response (unless no_cache is true)
        if (!noCache) {
          try {
            await kv.set(cacheKey, pressRelease, { ex: CACHE_TTL })
          } catch (cacheError) {
            console.warn("Failed to store in cache:", cacheError)
          }
        }

        return NextResponse.json(pressRelease, {
          status: 200,
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "Expires": "0",
            "X-Cache": "MISS",
          },
        })
      }
    } catch (error) {
      console.warn("Failed to fetch press release directly:", error)
    }

    // If direct fetch fails, try to get all press releases and find the one with matching ID
    // First check if we have a cached version of all press releases
    const allReleasesCacheKey = "press-releases:0:100"
    let allReleases

    try {
      allReleases = await kv.get(allReleasesCacheKey)
      if (!allReleases) {
        // If not in cache, fetch from API
        const allReleasesResponse = await fetch(`https://www.rtl.nl/data/press-releases?offset=0&limit=100`, {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          cache: "no-store",
        })

        if (!allReleasesResponse.ok) {
          throw new Error(`RTL API returned status: ${allReleasesResponse.status}`)
        }

        allReleases = await allReleasesResponse.json()

        // Cache the all releases response
        try {
          await kv.set(allReleasesCacheKey, allReleases, { ex: CACHE_TTL })
        } catch (cacheError) {
          console.warn("Failed to store all releases in cache:", cacheError)
        }
      }
    } catch (error) {
      console.error("Error fetching all releases:", error)
      return NextResponse.json({ error: "Press release not found" }, { status: 404 })
    }

    // Find the press release in the list
    const releases = Array.isArray(allReleases) ? allReleases : allReleases.items || []
    pressRelease = releases.find((release: any) => release.id.toString() === id)

    if (!pressRelease) {
      return NextResponse.json({ error: "Press release not found" }, { status: 404 })
    }

    // Cache the individual press release
    if (!noCache) {
      try {
        await kv.set(cacheKey, pressRelease, { ex: CACHE_TTL })
      } catch (cacheError) {
        console.warn("Failed to store press release in cache:", cacheError)
      }
    }

    return NextResponse.json(pressRelease, {
      status: 200,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
        "X-Cache": "MISS",
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
    // Try direct fetch first
    const response = await fetch(`https://www.rtl.nl/data/press-releases/${id}`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    if (response.ok) {
      const freshData = await response.json()
      await kv.set(cacheKey, freshData, { ex: CACHE_TTL })
      return
    }

    // If direct fetch fails, try getting from all releases
    const allReleasesResponse = await fetch(`https://www.rtl.nl/data/press-releases?offset=0&limit=100`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    if (!allReleasesResponse.ok) {
      throw new Error(`RTL API returned status: ${allReleasesResponse.status}`)
    }

    const allReleases = await allReleasesResponse.json()
    const releases = Array.isArray(allReleases) ? allReleases : allReleases.items || []
    const pressRelease = releases.find((release: any) => release.id.toString() === id)

    if (pressRelease) {
      await kv.set(cacheKey, pressRelease, { ex: CACHE_TTL })
    }
  } catch (error) {
    console.error("Failed to revalidate data:", error)
  }
}
