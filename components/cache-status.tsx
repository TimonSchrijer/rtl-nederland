"use client"

import { useState, useEffect } from "react"
import { Clock, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { refreshPressReleases } from "@/lib/api"

interface CacheStatusProps {
  onRefresh?: () => void
}

export function CacheStatus({ onRefresh }: CacheStatusProps) {
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [cacheStatus, setCacheStatus] = useState<"hit" | "miss" | "unknown">("unknown")
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    // Set the initial last updated time
    setLastUpdated(new Date())

    // Check if the response had a cache header
    const checkCacheStatus = async () => {
      try {
        const response = await fetch("/api/press-releases?offset=0&limit=1", {
          method: "HEAD",
        })
        const cacheHeader = response.headers.get("X-Cache")
        if (cacheHeader) {
          setCacheStatus(cacheHeader.toLowerCase() as "hit" | "miss")
        }
      } catch (error) {
        console.error("Failed to check cache status:", error)
      }
    }

    checkCacheStatus()
  }, [])

  const handleRefresh = async () => {
    if (isRefreshing) return
    setIsRefreshing(true)
    try {
      await refreshPressReleases(0, 20)
      setLastUpdated(new Date())
      setCacheStatus("miss")
      if (onRefresh) {
        onRefresh()
      }
    } catch (error) {
      console.error("Failed to refresh press releases:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  if (!lastUpdated) return null

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Clock className="h-3 w-3" />
        <span>
          Laatst bijgewerkt: {lastUpdated.toLocaleTimeString()}
          {cacheStatus !== "unknown" && (
            <span className="ml-2">
              (Cache: <span className={cacheStatus === "hit" ? "text-green-500" : "text-yellow-500"}>{cacheStatus}</span>)
            </span>
          )}
        </span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={handleRefresh}
        disabled={isRefreshing}
      >
        <RefreshCw className={`h-3 w-3 ${isRefreshing ? "animate-spin" : ""}`} />
        <span className="sr-only">Ververs persberichten</span>
      </Button>
    </div>
  )
}
