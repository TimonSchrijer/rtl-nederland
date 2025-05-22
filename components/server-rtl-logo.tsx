// RTL brand color palette
export const RTL_COLORS = {
  // Primary brand colors
  orange: "#FE9726",
  lightBlue: "#16B8FE",
  darkBlue: "#0975F3",
  // Neutral colors
  black: "#000000",
  gray: "#666666",
}

// Default RTL color scheme
export const DEFAULT_COLOR_SCHEME = {
  left: "darkBlue",
  middle: "lightBlue",
  right: "orange",
}

interface ServerRTLLogoProps {
  className?: string
}

export function ServerRTLLogo({ className }: ServerRTLLogoProps) {
  // Use default colors for server rendering
  const leftColor = RTL_COLORS[DEFAULT_COLOR_SCHEME.left]
  const middleColor = RTL_COLORS[DEFAULT_COLOR_SCHEME.middle]
  const rightColor = RTL_COLORS[DEFAULT_COLOR_SCHEME.right]

  return (
    <div className={className}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 114 20" className="w-full h-full">
        <path fill={leftColor} d="M35.565 0H0v20h35.565z"></path>
        <path
          fill="#fff"
          d="M10.103 4.597h9.477c2.888 0 4.492 1.297 4.492 3.474 0 1.867-1.203 3.118-3.256 3.41l4.646 3.922h-3.566l-4.368-3.782h-4.956v3.782h-2.469zm9.154 5.001c1.527 0 2.27-.493 2.27-1.497s-.741-1.483-2.27-1.483h-6.685v2.979z"
        ></path>
        <path fill={middleColor} d="M74.681 0H39.117v20H74.68z"></path>
        <path fill="#fff" d="M55.664 6.727h-6.251v-2.13h14.972v2.13h-6.25v8.676h-2.471z"></path>
        <path fill={rightColor} d="M113.798 0H78.233v20h35.565z"></path>
        <path fill="#fff" d="M89.285 4.597h2.471v8.674h10.99v2.132h-13.46V4.597Z"></path>
      </svg>
    </div>
  )
}
