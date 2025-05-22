export function FallbackImageSVG({ className = "h-full w-full" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center bg-muted/20 ${className}`}>
      <svg
        width="200"
        height="100"
        viewBox="0 0 200 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="max-w-full max-h-full p-4"
      >
        <rect x="0" y="0" width="66.67" height="100" fill="#0975F3" />
        <rect x="66.67" y="0" width="66.67" height="100" fill="#16B8FE" />
        <rect x="133.34" y="0" width="66.67" height="100" fill="#FE9726" />
        <path
          d="M20 30h18c5 0 8 2 8 7s-2 6-6 7l8 8h-7l-8-8h-8v8h-5V30zm17 10c3 0 4-1 4-3s-1-3-4-3h-12v6h12z"
          fill="white"
        />
        <path d="M100 40h-12v-5h30v5h-12v18h-6V40z" fill="white" />
        <path d="M160 30h5v18h20v5h-25V30z" fill="white" />
      </svg>
    </div>
  )
}
