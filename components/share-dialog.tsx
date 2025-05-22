"use client"

import type React from "react"

import { useState } from "react"
import { Copy, Facebook, Linkedin, Mail, Share2, Twitter } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

interface ShareDialogProps {
  title: string
  description?: string
  url?: string
  className?: string
  children?: React.ReactNode
  variant?: "button" | "icon" | "icon-label"
  size?: "default" | "sm" | "lg" | "icon"
}

export function ShareDialog({
  title,
  description,
  url,
  className,
  children,
  variant = "button",
  size = "default",
}: ShareDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Use the current URL if none is provided
  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "")

  // Check if the Web Share API is available AND we're on a mobile device
  const isMobileDevice = typeof window !== "undefined" && /Mobi|Android/i.test(navigator.userAgent)
  const isWebShareSupported = typeof navigator !== "undefined" && !!navigator.share && isMobileDevice

  // Use the Web Share API if available on mobile, otherwise open the dialog
  const handleShare = async () => {
    if (isWebShareSupported) {
      try {
        await navigator.share({
          title: title,
          text: description || title,
          url: shareUrl,
        })
        // Successfully shared
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          // User canceled share operation, no need to show dialog
          setIsOpen(true)
        }
      }
    } else {
      // Web Share API not supported or not on mobile, show our custom dialog
      setIsOpen(true)
    }
  }

  // Handle copy to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl)
    toast({
      title: "Link gekopieerd",
      description: "De link is gekopieerd naar je klembord",
    })
    setIsOpen(false)
  }

  // Share on social media platforms
  const shareOnTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`,
      "_blank",
      "noopener,noreferrer",
    )
    setIsOpen(false)
  }

  const shareOnFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      "_blank",
      "noopener,noreferrer",
    )
    setIsOpen(false)
  }

  const shareOnLinkedIn = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      "_blank",
      "noopener,noreferrer",
    )
    setIsOpen(false)
  }

  const shareViaEmail = () => {
    window.open(
      `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${description || title}\n\n${shareUrl}`)}`,
      "_blank",
      "noopener,noreferrer",
    )
    setIsOpen(false)
  }

  // Determine which component to render based on device
  // On mobile with Web Share API, render a simple button
  // On desktop or without Web Share API, render a dialog
  if (isWebShareSupported && !isOpen) {
    // Render a button that uses the Web Share API
    if (children) {
      return (
        <div onClick={handleShare} className={className}>
          {children}
        </div>
      )
    }

    if (variant === "icon") {
      return (
        <Button variant="ghost" size="icon" onClick={handleShare} className={className} aria-label="Delen">
          <Share2 className="h-4 w-4" />
        </Button>
      )
    }

    if (variant === "icon-label") {
      return (
        <Button variant="ghost" size={size} onClick={handleShare} className={cn("gap-2", className)}>
          <Share2 className="h-4 w-4" />
          Delen
        </Button>
      )
    }

    return (
      <Button variant="ghost" size={size} onClick={handleShare} className={cn("gap-2", className)}>
        <Share2 className="h-4 w-4" />
        Delen
      </Button>
    )
  }

  // For desktop or fallback, render a dialog
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children ? (
          <div onClick={() => setIsOpen(true)} className={className}>
            {children}
          </div>
        ) : variant === "icon" ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)} className={className} aria-label="Delen">
                  <Share2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Deel dit artikel</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : variant === "icon-label" ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size={size} 
                  onClick={() => setIsOpen(true)} 
                  className={cn(
                    "gap-2 transition-all duration-300 ease-in-out",
                    "hover:scale-105",
                    className
                  )}
                >
                  <Share2 className="h-4 w-4" />
                  Delen
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Deel dit artikel via sociale media of kopieer de link</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size={size} 
                  onClick={() => setIsOpen(true)} 
                  className={cn(
                    "gap-2 transition-all duration-300 ease-in-out",
                    "hover:scale-105",
                    className
                  )}
                >
                  <Share2 className="h-4 w-4" />
                  Delen
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Deel dit artikel via sociale media of kopieer de link</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Deel dit artikel</DialogTitle>
          <DialogDescription>Deel dit artikel via sociale media of kopieer de link</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="flex items-center justify-between">
            <div className="grid flex-1 gap-2 overflow-hidden">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium line-clamp-2">{title}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="truncate max-w-[250px] sm:max-w-[350px]">{shareUrl}</span>
              </div>
            </div>
            <Button variant="outline" size="sm" className="px-3 ml-2 shrink-0" onClick={copyToClipboard}>
              <span className="sr-only">Kopieer</span>
              <Copy className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="flex-1 gap-2" onClick={shareOnTwitter}>
              <Twitter className="h-4 w-4" />
              <span className="truncate">Twitter</span>
            </Button>
            <Button variant="outline" size="sm" className="flex-1 gap-2" onClick={shareOnFacebook}>
              <Facebook className="h-4 w-4" />
              <span className="truncate">Facebook</span>
            </Button>
            <Button variant="outline" size="sm" className="flex-1 gap-2" onClick={shareOnLinkedIn}>
              <Linkedin className="h-4 w-4" />
              <span className="truncate">LinkedIn</span>
            </Button>
            <Button variant="outline" size="sm" className="flex-1 gap-2" onClick={shareViaEmail}>
              <Mail className="h-4 w-4" />
              <span className="truncate">E-mail</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Compact version for inline use
export function ShareButton({
  title,
  description,
  url,
  className,
}: {
  title: string
  description?: string
  url?: string
  className?: string
}) {
  const [isOpen, setIsOpen] = useState(false)

  // Use the current URL if none is provided
  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "")

  // Check if the Web Share API is available AND we're on a mobile device
  const isMobileDevice = typeof window !== "undefined" && /Mobi|Android/i.test(navigator.userAgent)
  const isWebShareSupported = typeof navigator !== "undefined" && !!navigator.share && isMobileDevice

  // Use the Web Share API if available on mobile, otherwise open the popover
  const handleShare = async () => {
    if (isWebShareSupported) {
      try {
        await navigator.share({
          title: title,
          text: description || title,
          url: shareUrl,
        })
      } catch (error) {
        // User canceled or share failed
        console.log("Share canceled or failed")
      }
    } else {
      setIsOpen(!isOpen)
    }
  }

  // Handle copy to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl)
    toast({
      title: "Link gekopieerd",
      description: "De link is gekopieerd naar je klembord",
    })
    setIsOpen(false)
  }

  // If Web Share API is supported, use a simple button
  if (isWebShareSupported) {
    return (
      <Button variant="ghost" size="sm" onClick={handleShare} className={cn("gap-2", className)}>
        <Share2 className="h-4 w-4" />
        Delen
      </Button>
    )
  }

  // Otherwise use a popover for a more compact experience
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className={cn("gap-2", className)}>
          <Share2 className="h-4 w-4" />
          Delen
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 max-w-[calc(100vw-2rem)]" align="end">
        <div className="flex flex-col gap-2">
          <div className="text-sm font-medium truncate">{title}</div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full h-8 w-8"
              onClick={() => {
                window.open(
                  `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`,
                  "_blank",
                  "noopener,noreferrer",
                )
                setIsOpen(false)
              }}
            >
              <Twitter className="h-4 w-4" />
              <span className="sr-only">Delen op Twitter</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full h-8 w-8"
              onClick={() => {
                window.open(
                  `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
                  "_blank",
                  "noopener,noreferrer",
                )
                setIsOpen(false)
              }}
            >
              <Facebook className="h-4 w-4" />
              <span className="sr-only">Delen op Facebook</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full h-8 w-8"
              onClick={() => {
                window.open(
                  `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
                  "_blank",
                  "noopener,noreferrer",
                )
                setIsOpen(false)
              }}
            >
              <Linkedin className="h-4 w-4" />
              <span className="sr-only">Delen op LinkedIn</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full h-8 w-8"
              onClick={() => {
                window.open(
                  `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${description || title}\n\n${shareUrl}`)}`,
                  "_blank",
                  "noopener,noreferrer",
                )
                setIsOpen(false)
              }}
            >
              <Mail className="h-4 w-4" />
              <span className="sr-only">Delen via e-mail</span>
            </Button>
            <Button variant="outline" size="icon" className="rounded-full h-8 w-8 ml-auto" onClick={copyToClipboard}>
              <Copy className="h-4 w-4" />
              <span className="sr-only">Kopieer link</span>
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
