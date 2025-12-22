export const INSTAGRAM_HOSTS = new Set(['instagram.com', 'instagr.am'])
export const INSTAGRAM_PATH_TYPES = new Set(['p', 'reel', 'reels', 'tv'])

/**
 * Normalize an Instagram URL to a canonical format
 * Returns null if not a valid Instagram post/reel URL
 */
export function normalizeInstagramUrl(raw: string): string | null {
  try {
    const url = new URL(raw.startsWith('http') ? raw : `https://${raw}`)
    const hostname = url.hostname.replace(/^www\./, '')
    if (!INSTAGRAM_HOSTS.has(hostname)) return null

    const parts = url.pathname.split('/').filter(Boolean)
    if (parts.length < 2) return null

    let type = parts[0]
    let shortcode = parts[1]

    // Handle share URLs: /share/p/SHORTCODE/ or /share/reel/SHORTCODE/
    if (type === 'share') {
      if (parts.length < 3) return null
      type = parts[1]
      shortcode = parts[2]
    }

    // Normalize reels -> reel
    if (type === 'reels') type = 'reel'
    if (!INSTAGRAM_PATH_TYPES.has(type)) return null

    return `https://www.instagram.com/${type}/${shortcode}/`
  } catch {
    return null
  }
}

/**
 * Extract Instagram URLs from text
 * Returns deduplicated, normalized URLs
 */
export function extractInstagramUrls(text: string): string[] {
  const urlMatches =
    text.match(/https?:\/\/[^\s]+/g) ??
    text.match(/(?:www\.)?(?:instagram\.com|instagr\.am)\/[^\s]+/g) ??
    []
  const urls: string[] = []

  for (const match of urlMatches) {
    // Remove trailing punctuation
    const cleaned = match.replace(/[)\]}>,.;'"]+$/g, '')
    const normalized = normalizeInstagramUrl(cleaned)
    if (normalized) urls.push(normalized)
  }

  return Array.from(new Set(urls))
}
