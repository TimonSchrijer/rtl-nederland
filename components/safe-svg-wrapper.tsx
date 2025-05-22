"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { processSvgChildren } from "@/lib/svg-utils"

interface SafeSvgWrapperProps {
  children: React.ReactNode
}

export function SafeSvgWrapper({ children }: SafeSvgWrapperProps) {
  const [processedChildren, setProcessedChildren] = useState<React.ReactNode>(children)

  useEffect(() => {
    // Process children on the client side to fix SVG attributes
    setProcessedChildren(processSvgChildren(children))
  }, [children])

  return <>{processedChildren}</>
}
