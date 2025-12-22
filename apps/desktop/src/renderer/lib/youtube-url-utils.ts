export const YOUTUBE_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'youtu.be',
  'youtube-nocookie.com',
  'www.youtube-nocookie.com',
])

/**
 * Extract YouTube video ID from various URL formats
 * Returns null if not a valid YouTube video URL
 */
export function extractYouTubeVideoId(raw: string): string | null {
  try {
    const url = new URL(raw.startsWith('http') ? raw : `https://${raw}`)
    const hostname = url.hostname.replace(/^www\./, '').replace(/^m\./, '')

    // youtu.be short URLs
    if (hostname === 'youtu.be') {
      const videoId = url.pathname.slice(1).split('/')[0]
      if (videoId && /^[A-Za-z0-9_-]{11}$/.test(videoId)) {
        return videoId
      }
      return null
    }

    // youtube.com or youtube-nocookie.com
    if (!hostname.includes('youtube')) return null

    // /watch?v=VIDEO_ID
    if (url.pathname === '/watch') {
      const videoId = url.searchParams.get('v')
      if (videoId && /^[A-Za-z0-9_-]{11}$/.test(videoId)) {
        return videoId
      }
      return null
    }

    // /embed/VIDEO_ID or /v/VIDEO_ID
    const embedMatch = url.pathname.match(/^\/(?:embed|v)\/([A-Za-z0-9_-]{11})/)
    if (embedMatch) {
      return embedMatch[1]
    }

    // /shorts/VIDEO_ID
    const shortsMatch = url.pathname.match(/^\/shorts\/([A-Za-z0-9_-]{11})/)
    if (shortsMatch) {
      return shortsMatch[1]
    }

    // /live/VIDEO_ID
    const liveMatch = url.pathname.match(/^\/live\/([A-Za-z0-9_-]{11})/)
    if (liveMatch) {
      return liveMatch[1]
    }

    return null
  } catch {
    return null
  }
}

/**
 * Normalize a YouTube URL to a canonical format
 * Returns null if not a valid YouTube video URL
 */
export function normalizeYouTubeUrl(raw: string): string | null {
  const videoId = extractYouTubeVideoId(raw)
  if (!videoId) return null
  return `https://www.youtube.com/watch?v=${videoId}`
}

/**
 * Extract YouTube URLs from text
 * Returns deduplicated, normalized URLs
 */
export function extractYouTubeUrls(text: string): string[] {
  const urlMatches =
    text.match(/https?:\/\/[^\s]+/g) ??
    text.match(/(?:www\.)?(?:youtube\.com|youtu\.be)\/[^\s]+/g) ??
    []
  const urls: string[] = []

  for (const match of urlMatches) {
    // Remove trailing punctuation
    const cleaned = match.replace(/[)\]}>,.;'"]+$/g, '')
    const normalized = normalizeYouTubeUrl(cleaned)
    if (normalized) urls.push(normalized)
  }

  return Array.from(new Set(urls))
}
