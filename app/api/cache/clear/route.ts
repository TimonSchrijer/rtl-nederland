import { NextResponse } from "next/server"
import { kv } from "@vercel/kv"
import { headers } from "next/headers"

export async function POST(request: Request) {
  try {
    // Basic security check - require an admin token
    const headersList = headers()
    const authToken = request.headers.get("x-admin-token")
    
    if (!process.env.ADMIN_TOKEN || authToken !== process.env.ADMIN_TOKEN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all keys
    const keys = await kv.keys("*")
    
    if (keys.length > 0) {
      // Delete all keys
      await Promise.all(keys.map(key => kv.del(key)))
      return NextResponse.json({ 
        message: `Successfully cleared ${keys.length} cache entries`,
        clearedKeys: keys 
      })
    }

    return NextResponse.json({ message: "No cache entries to clear" })
  } catch (error) {
    console.error("Failed to clear cache:", error)
    return NextResponse.json(
      { error: "Failed to clear cache" },
      { status: 500 }
    )
  }
} 