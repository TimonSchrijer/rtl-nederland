"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useLogo } from "@/contexts/logo-context"
import { RTL_COLORS, type RTLColorScheme } from "@/components/rtl-logo"

export function DynamicThemeDemo() {
  const { colorScheme, setColorScheme, resetColorScheme } = useLogo()
  const [showDemo, setShowDemo] = useState(false)

  // Predefined color schemes
  const colorSchemes = [
    {
      name: "Default",
      scheme: { left: "darkBlue", middle: "lightBlue", right: "orange" } as RTLColorScheme,
    },
    {
      name: "Red & Purple",
      scheme: { left: "red", middle: "purple", right: "pink" } as RTLColorScheme,
    },
    {
      name: "Green & Teal",
      scheme: { left: "green", middle: "teal", right: "yellow" } as RTLColorScheme,
    },
  ]

  return (
    <div className="mt-8 p-6 border rounded-lg bg-background">
      <h3 className="text-xl font-bold mb-4">Dynamic Theme Demo</h3>

      <Button variant="outline" onClick={() => setShowDemo(!showDemo)} className="mb-4">
        {showDemo ? "Hide Color Options" : "Show Color Options"}
      </Button>

      {showDemo && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {colorSchemes.map((cs) => (
              <Button
                key={cs.name}
                onClick={() => setColorScheme(cs.scheme)}
                variant="outline"
                className="flex flex-col items-center p-4 h-auto"
              >
                <span className="mb-2">{cs.name}</span>
                <div className="flex w-full h-8">
                  <div className="w-1/3 h-full" style={{ backgroundColor: RTL_COLORS[cs.scheme.left] }} />
                  <div className="w-1/3 h-full" style={{ backgroundColor: RTL_COLORS[cs.scheme.middle] }} />
                  <div className="w-1/3 h-full" style={{ backgroundColor: RTL_COLORS[cs.scheme.right] }} />
                </div>
              </Button>
            ))}
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">UI Elements with Dynamic Colors:</h4>

            <div className="flex flex-wrap gap-4">
              <Button>Primary Button</Button>
              <Button variant="outline">Outline Button</Button>
              <Button variant="ghost">Ghost Button</Button>
              <Button variant="link">Link Button</Button>
            </div>

            <div className="p-4 border rounded-lg">
              <p className="mb-2">
                Text with{" "}
                <a href="#" className="text-rtl-primary hover:underline">
                  primary link
                </a>{" "}
                and
                <a href="#" className="text-rtl-secondary hover:underline ml-1">
                  secondary link
                </a>
                .
              </p>

              <div className="flex gap-4 mt-4">
                <div className="w-16 h-16 bg-rtl-primary rounded-md"></div>
                <div className="w-16 h-16 bg-rtl-secondary rounded-md"></div>
                <div className="w-16 h-16 bg-rtl-tertiary rounded-md"></div>
              </div>
            </div>

            <Button onClick={resetColorScheme} variant="outline">
              Reset to Default Colors
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
