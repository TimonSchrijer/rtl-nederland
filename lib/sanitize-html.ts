// Simple HTML sanitizer to handle SVG fill attributes and other potential issues

// Function to preprocess content and add proper HTML markup
function preprocessContent(content: string): string {
  if (!content) return ""

  // Split content into lines
  const lines = content.split(/\r?\n/)
  let processedLines: string[] = []
  let inParagraph = false

  for (let line of lines) {
    line = line.trim()

    // Skip empty lines
    if (!line) {
      if (inParagraph) {
        processedLines.push("</p>")
        inParagraph = false
      }
      continue
    }

    // Check if line already has HTML markup
    const hasHtmlTags = /<[a-z][\s\S]*>/i.test(line)

    if (hasHtmlTags) {
      // If we were in a paragraph, close it
      if (inParagraph) {
        processedLines.push("</p>")
        inParagraph = false
      }
      processedLines.push(line)
    } else {
      // Plain text handling
      if (!inParagraph) {
        processedLines.push("<p>")
        inParagraph = true
      }
      processedLines.push(line)
    }
  }

  // Close any open paragraph
  if (inParagraph) {
    processedLines.push("</p>")
  }

  return processedLines.join("\n")
}

export function sanitizeHtml(html: string): string {
  if (!html) return ""

  // First preprocess the content
  const processedContent = preprocessContent(html)

  // Then handle SVG attributes
  return processedContent
    .replace(/(<svg[^>]*\s)fill(\s|>)/gi, '$1fill="true"$2')
    .replace(/(<[^>]+\s)fill=true(\s|>)/gi, '$1fill="true"$2')
    .replace(/(<[^>]+\s)fill=false(\s|>)/gi, '$1fill="false"$2')
    .replace(/(<[^>]+\s)fill=(\s|>)/gi, '$1fill="true"$2')
    // Handle other SVG attributes that might cause issues
    .replace(/(<[^>]+\s)stroke=true(\s|>)/gi, '$1stroke="true"$2')
    .replace(/(<[^>]+\s)stroke=false(\s|>)/gi, '$1stroke="false"$2')
    .replace(/(<[^>]+\s)stroke=(\s|>)/gi, '$1stroke="true"$2')
    .replace(/(<[^>]+\s)visibility=true(\s|>)/gi, '$1visibility="true"$2')
    .replace(/(<[^>]+\s)visibility=false(\s|>)/gi, '$1visibility="false"$2')
    .replace(/(<[^>]+\s)visibility=(\s|>)/gi, '$1visibility="true"$2')
}
