export interface PressRelease {
  id: number | string
  title: string
  date: string
  formattedDate?: string | null
  category?: string
  excerpt?: string
  content: string
  image?: string
  // Additional fields that might be in the actual API
  slug?: string
  author?: string
  tags?: string[]
  url?: string
  publishedAt?: string
  updatedAt?: string
  thumbnail?: string
  // Date posted field with formatted and unix timestamp
  datePosted?: {
    formatted: string
    unix: number
  }
  media?: {
    url: string
    type: string
    alt?: string
  }[]
  // RTL Nederland specific image structure
  mainImage?: {
    label?: string
    small?: string
    landscape?: string
    portrait?: string
    medium16x9?: string
    article1920x1080?: string
    article960x540?: string
    article480x270?: string
  }
  // Video-related fields
  mainVideo?: string
  video?:
    | string
    | {
        url?: string
        src?: string
        embed?: string
        youtube?: string
        title?: string
        type?: string
      }
  videoId?: string | null
  videoTitle?: string | null
  showImageWithVideo?: boolean
  // Store original data for debugging
  _original?: any
  releaseDate: any | null
}
