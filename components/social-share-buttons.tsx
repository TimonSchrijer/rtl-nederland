"use client"

import { Facebook, Linkedin, Twitter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { SafeSvgWrapper } from "@/components/safe-svg-wrapper"

export function SocialShareButtons({ title }: { title: string }) {
  const shareUrl = typeof window !== "undefined" ? window.location.href : ""

  const shareOnTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`,
      "_blank",
    )
  }

  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank")
  }

  const shareOnLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, "_blank")
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl)
    toast({
      title: "Link gekopieerd",
      description: "De link is gekopieerd naar je klembord",
    })
  }

  return (
    <div className="flex items-center gap-2">
      <SafeSvgWrapper>
        <Button variant="outline" size="icon" className="rounded-full h-8 w-8" onClick={shareOnTwitter}>
          <Twitter className="h-4 w-4" />
          <span className="sr-only">Delen op Twitter</span>
        </Button>
        <Button variant="outline" size="icon" className="rounded-full h-8 w-8" onClick={shareOnFacebook}>
          <Facebook className="h-4 w-4" />
          <span className="sr-only">Delen op Facebook</span>
        </Button>
        <Button variant="outline" size="icon" className="rounded-full h-8 w-8" onClick={shareOnLinkedIn}>
          <Linkedin className="h-4 w-4" />
          <span className="sr-only">Delen op LinkedIn</span>
        </Button>
      </SafeSvgWrapper>
    </div>
  )
}
