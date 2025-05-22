import React from "react"

// This function processes SVG props to ensure all boolean attributes are converted to strings
export function processSvgProps(props: Record<string, any>): Record<string, any> {
  const processedProps: Record<string, any> = {}

  for (const [key, value] of Object.entries(props)) {
    // Convert boolean values to strings for non-boolean SVG attributes
    if (key === "fill" || key === "stroke" || key === "visibility") {
      if (typeof value === "boolean") {
        processedProps[key] = value.toString()
      } else {
        processedProps[key] = value
      }
    } else {
      processedProps[key] = value
    }
  }

  return processedProps
}

// A wrapper component for SVG elements that ensures proper attribute handling
export function SafeSvg({ children, ...props }: React.SVGProps<SVGSVGElement> & { children?: React.ReactNode }) {
  const safeProps = processSvgProps(props)

  return <svg {...safeProps}>{children}</svg>
}

// Process React children to fix SVG attributes recursively
export function processSvgChildren(children: React.ReactNode): React.ReactNode {
  return React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) {
      return child
    }

    // Check if this is an SVG element
    const isSvgElement =
      typeof child.type === "string" &&
      (child.type === "svg" ||
        child.type === "path" ||
        child.type === "circle" ||
        child.type === "rect" ||
        child.type === "line" ||
        child.type === "polygon" ||
        child.type === "polyline" ||
        child.type === "ellipse")

    if (isSvgElement) {
      // Process props for SVG elements
      const processedProps = processSvgProps(child.props)

      // Recursively process children
      if (child.props.children) {
        return React.cloneElement(child, processedProps, processSvgChildren(child.props.children))
      }

      return React.cloneElement(child, processedProps)
    }

    // For non-SVG elements, just process their children
    if (child.props.children) {
      return React.cloneElement(child, child.props, processSvgChildren(child.props.children))
    }

    return child
  })
}
