"use client"

import React from "react"

import { useEffect, useRef } from "react"
import { sanitizeHtml } from "@/lib/sanitize-html"
import { YouTubeEmbed } from "@/components/youtube-embed"

interface ArticleContentProps {
  content: string
  className?: string
  videoId?: string // Optional video ID if provided directly
  videoTitle?: string // Optional video title
  skipVideoRendering?: boolean // Whether to skip rendering videos in the content
}

// Function to extract YouTube video ID from various YouTube URL formats
function extractYouTubeId(url: string): string | null {
  if (!url) return null

  // Match patterns like:
  // - https://www.youtube.com/watch?v=VIDEO_ID
  // - https://youtu.be/VIDEO_ID
  // - https://www.youtube.com/embed/VIDEO_ID
  // - https://youtube.com/shorts/VIDEO_ID
  const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)

  return match && match[2].length === 11 ? match[2] : null
}

export function ArticleContent({ content, className = "", videoId: propVideoId, videoTitle, skipVideoRendering = false }: ArticleContentProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const sanitizedContent = sanitizeHtml(content)
  const [extractedVideoId, setExtractedVideoId] = React.useState<string | null>(null)
  const [extractedVideoTitle, setExtractedVideoTitle] = React.useState<string | null>(null)

  // Use the video ID from props if provided, otherwise use the extracted one
  const finalVideoId = propVideoId || extractedVideoId
  const finalVideoTitle = videoTitle || extractedVideoTitle || "YouTube video"

  // Extract YouTube video links from content
  useEffect(() => {
    if (!contentRef.current || finalVideoId || skipVideoRendering) return

    try {
      const container = contentRef.current

      // Look for YouTube links in the content
      const links = container.querySelectorAll("a")

      for (const link of links) {
        const href = link.getAttribute("href")
        if (!href) continue

        const videoId = extractYouTubeId(href)
        if (videoId) {
          setExtractedVideoId(videoId)
          setExtractedVideoTitle(link.textContent || "YouTube video")

          // Mark this link as a YouTube link
          link.classList.add("youtube-link")
          link.setAttribute("data-video-id", videoId)

          // We found a video, no need to continue
          break
        }
      }
    } catch (error) {
      console.error("Error extracting YouTube links:", error)
    }
  }, [sanitizedContent, finalVideoId, skipVideoRendering])

  // Apply additional formatting and enhancements after the content is rendered
  useEffect(() => {
    if (!contentRef.current) return

    const container = contentRef.current

    // Find all images and add responsive classes
    const images = container.querySelectorAll("img")
    images.forEach((img) => {
      img.classList.add("mx-auto", "rounded-md", "max-w-full", "h-auto")

      // Add loading="lazy" for better performance
      img.setAttribute("loading", "lazy")

      // If image doesn't have alt text, add an empty alt for accessibility
      if (!img.hasAttribute("alt")) {
        img.setAttribute("alt", "")
      }

      // Wrap image in a figure if it's not already wrapped
      if (img.parentElement?.tagName !== "FIGURE") {
        const figure = document.createElement("figure")
        img.parentNode?.insertBefore(figure, img)
        figure.appendChild(img)
      }
    })

    // Find all links and add target="_blank" for external links
    const links = container.querySelectorAll("a")
    links.forEach((link) => {
      // Skip YouTube links that we'll replace with embeds
      if (link.classList.contains("youtube-link")) return

      // Check if it's an external link
      const href = link.getAttribute("href")
      if (href && !href.startsWith("/") && !href.startsWith("#") && !href.startsWith(window.location.origin)) {
        link.setAttribute("target", "_blank")
        link.setAttribute("rel", "noopener noreferrer")

        // Add a subtle indication that this is an external link
        link.classList.add("after:content-['_↗']", "after:text-xs", "after:align-top")
      }
    })

    // Add spacing to paragraphs
    const paragraphs = container.querySelectorAll("p")
    paragraphs.forEach((p) => {
      // Only add margin if it's not inside a list item or blockquote
      if (!p.parentElement?.closest("li") && !p.parentElement?.closest("blockquote")) {
        p.classList.add(
          "my-4",
          "leading-relaxed",
          "text-base",
          "md:text-lg",
          "text-pretty",
          "break-words",
          "hyphens-auto"
        )
      }
    })

    // Add spacing to lists that don't have it
    const lists = container.querySelectorAll("ul, ol")
    lists.forEach((list) => {
      list.classList.add("my-6", "space-y-2", "list-outside", "ml-6")
      if (list.tagName === "UL") {
        list.classList.add("list-disc")
      } else {
        list.classList.add("list-decimal")
      }

      // Style list items
      const items = list.querySelectorAll("li")
      items.forEach((item) => {
        item.classList.add("text-base", "md:text-lg", "leading-relaxed")
      })
    })

    // Enhance blockquotes
    const blockquotes = container.querySelectorAll("blockquote")
    blockquotes.forEach((blockquote) => {
      blockquote.classList.add(
        "italic",
        "border-l-4",
        "border-rtl-secondary",
        "pl-6",
        "py-4",
        "my-8",
        "text-muted-foreground",
        "text-base",
        "md:text-lg",
        "leading-relaxed",
        "bg-muted/30",
        "rounded-r-lg"
      )
    })

    // Add proper heading hierarchy and styling
    const headings = container.querySelectorAll("h1, h2, h3, h4, h5, h6")
    headings.forEach((heading) => {
      heading.classList.add(
        "font-bold",
        "mt-10",
        "mb-6",
        "text-foreground",
        "tracking-tight"
      )

      // Add specific styling based on heading level
      if (heading.tagName === "H1") {
        heading.classList.add("text-4xl", "md:text-5xl", "leading-tight")
      } else if (heading.tagName === "H2") {
        heading.classList.add("text-3xl", "md:text-4xl", "leading-tight")
      } else if (heading.tagName === "H3") {
        heading.classList.add("text-2xl", "md:text-3xl", "leading-snug")
      } else if (heading.tagName === "H4") {
        heading.classList.add("text-xl", "md:text-2xl", "leading-snug")
      } else {
        heading.classList.add("text-lg", "md:text-xl", "leading-normal")
      }
    })

    // Add spacing to horizontal rules
    const hrs = container.querySelectorAll("hr")
    hrs.forEach((hr) => {
      hr.classList.add("my-8", "border-border")
    })

    // Style code blocks and inline code
    const codeBlocks = container.querySelectorAll("pre code")
    codeBlocks.forEach((code) => {
      code.parentElement?.classList.add(
        "my-6",
        "p-4",
        "bg-muted",
        "rounded-lg",
        "overflow-x-auto"
      )
      code.classList.add("text-sm", "md:text-base", "font-mono")
    })

    const inlineCode = container.querySelectorAll("code:not(pre code)")
    inlineCode.forEach((code) => {
      code.classList.add(
        "px-1.5",
        "py-0.5",
        "bg-muted",
        "rounded",
        "font-mono",
        "text-sm",
        "whitespace-nowrap"
      )
    })

    // Style tables
    const tablesToStyle = container.querySelectorAll("table")
    tablesToStyle.forEach((table) => {
      // Wrap table in a div with overflow-x-auto for mobile scrolling
      if (!table.parentElement?.classList.contains("table-wrapper")) {
        const wrapper = document.createElement("div")
        wrapper.classList.add("table-wrapper", "overflow-x-auto", "my-6")
        table.parentNode?.insertBefore(wrapper, table)
        wrapper.appendChild(table)
      }

      // Add basic styling to table
      table.classList.add(
        "w-full",
        "border-collapse",
        "text-sm",
        "md:text-base"
      )

      // Style table headers
      const headers = table.querySelectorAll("th")
      headers.forEach((th) => {
        th.classList.add(
          "border",
          "border-border",
          "bg-muted",
          "p-2",
          "text-left",
          "font-semibold"
        )
      })

      // Style table cells
      const cells = table.querySelectorAll("td")
      cells.forEach((td) => {
        td.classList.add(
          "border",
          "border-border",
          "p-2"
        )
      })
    })

    // Style definition lists
    const dls = container.querySelectorAll("dl")
    dls.forEach((dl) => {
      dl.classList.add("my-6", "space-y-4")
      
      // Style definition terms
      const dts = dl.querySelectorAll("dt")
      dts.forEach((dt) => {
        dt.classList.add("font-semibold", "text-lg")
      })
      
      // Style definition descriptions
      const dds = dl.querySelectorAll("dd")
      dds.forEach((dd) => {
        dd.classList.add("ml-4", "text-muted-foreground")
      })
    })

    // Add text selection styling
    const textElements = container.querySelectorAll("p, li, blockquote, h1, h2, h3, h4, h5, h6")
    textElements.forEach((element) => {
      element.classList.add("selection:bg-rtl-primary/20", "selection:text-foreground")
    })
  }, [sanitizedContent])

  // First, let's add a new useEffect to enhance links and buttons in the article content

  // Add this after the existing useEffect that processes YouTube links
  useEffect(() => {
    if (!contentRef.current) return

    try {
      const container = contentRef.current

      // Enhance all links to use the RTL secondary color (light blue) for better visibility
      const links = container.querySelectorAll("a:not(.youtube-link)")
      links.forEach((link) => {
        // Add RTL secondary color (light blue) and hover effects
        link.classList.add("text-rtl-secondary", "hover:text-rtl-secondary/80", "transition-colors", "font-medium")

        // Check if it's an external link
        const href = link.getAttribute("href")
        if (href && !href.startsWith("/") && !href.startsWith("#") && !href.startsWith(window.location.origin)) {
          link.setAttribute("target", "_blank")
          link.setAttribute("rel", "noopener noreferrer")
          link.classList.add("after:content-['_↗']", "after:text-xs", "after:align-top")
        }
      })

      // Enhance buttons to use RTL primary styling
      const buttons = container.querySelectorAll("button")
      buttons.forEach((button) => {
        // Add RTL primary styling to buttons
        button.classList.add(
          "bg-rtl-primary",
          "text-white",
          "hover:bg-rtl-primary/90",
          "px-4",
          "py-2",
          "rounded-md",
          "transition-colors",
        )
      })
    } catch (error) {
      console.error("Error enhancing links and buttons:", error)
    }
  }, [sanitizedContent])

  return (
    <div className={`${className}`}>
      {/* Render YouTube embed if we have a video ID and we're not skipping video rendering */}
      {finalVideoId && !skipVideoRendering && (
        <div className="mb-8">
          <YouTubeEmbed videoId={finalVideoId} title={finalVideoTitle} className="mb-2" />
          <p className="text-sm text-muted-foreground text-center">{finalVideoTitle}</p>
        </div>
      )}

      {/* Render the article content */}
      <div
        ref={contentRef}
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      />
    </div>
  )
}
