import {
  app,
  BrowserWindow,
  ipcMain,
  net,
  session,
  type ClientRequestConstructorOptions,
} from 'electron'
import { join } from 'path'

interface InstagramMediaItem {
  displayUrl: string
  videoUrl?: string
  typename: string
  imageBase64?: string | null
  videoBase64?: string | null
}

interface InstagramPostData {
  shortcode: string
  displayUrl: string
  videoUrl?: string
  caption: string
  username: string
  displayName?: string
  profilePicUrl: string
  timestamp: number
  typename: string
  media: InstagramMediaItem[]
}

const INSTAGRAM_PATH_TYPES = new Set(['p', 'reel', 'reels', 'tv'])
const INSTAGRAM_USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:120.0) Gecko/20100101 Firefox/120.0'
const INSTAGRAM_APP_USER_AGENT = 'Instagram 289.0.0.0.0 Android'
const MAX_REDIRECTS = 5
const MAX_MEDIA_BASE64 = 10
const MAX_VIDEO_BASE64 = 2
const MAX_VIDEO_BYTES = 20 * 1024 * 1024
const INSTAGRAM_SESSION_PARTITION = 'persist:instagram'
const INSTAGRAM_LOGIN_URL = 'https://www.instagram.com/accounts/login/'

type NetRequestOptions = Pick<
  ClientRequestConstructorOptions,
  'headers' | 'origin' | 'referrerPolicy' | 'session' | 'useSessionCookies'
>

let instagramLoginPromise: Promise<boolean> | null = null

function getInstagramSession() {
  return session.fromPartition(INSTAGRAM_SESSION_PARTITION)
}

async function isInstagramLoggedIn(): Promise<boolean> {
  const instagramSession = getInstagramSession()
  const cookies = await instagramSession.cookies.get({
    url: 'https://www.instagram.com',
    name: 'sessionid',
  })
  return cookies.some((cookie) => Boolean(cookie.value))
}

async function ensureInstagramLogin(): Promise<boolean> {
  if (instagramLoginPromise) return instagramLoginPromise
  if (await isInstagramLoggedIn()) return true

  console.info('[instagram] ensureLogin: opening login window')
  instagramLoginPromise = new Promise((resolve) => {
    const instagramSession = getInstagramSession()
    const loginWindow = new BrowserWindow({
      width: 480,
      height: 720,
      title: 'Instagram Login',
      webPreferences: {
        session: instagramSession,
        nodeIntegration: false,
        contextIsolation: true,
      },
    })

    let resolved = false
    const finish = (result: boolean) => {
      if (resolved) return
      resolved = true
      instagramLoginPromise = null
      clearInterval(interval)
      clearTimeout(timeout)
      console.info('[instagram] ensureLogin: finished', { result })
      if (!loginWindow.isDestroyed()) {
        loginWindow.close()
      }
      resolve(result)
    }

    const checkLoggedIn = async () => {
      if (await isInstagramLoggedIn()) {
        finish(true)
      }
    }

    const interval = setInterval(() => {
      void checkLoggedIn()
    }, 1000)

    const timeout = setTimeout(() => {
      console.warn('[instagram] ensureLogin: timeout')
      finish(false)
    }, 2 * 60 * 1000)

    loginWindow.on('closed', () => {
      console.warn('[instagram] ensureLogin: window closed')
      finish(false)
    })

    loginWindow.webContents.on('did-navigate', () => {
      void checkLoggedIn()
    })

    loginWindow.webContents.on('did-navigate-in-page', () => {
      void checkLoggedIn()
    })

    void loginWindow.loadURL(INSTAGRAM_LOGIN_URL)
  })

  return instagramLoginPromise
}

function parseInstagramUrl(inputUrl: string): { shortcode: string; postUrl: string } | null {
  try {
    const url = new URL(inputUrl)
    const hostname = url.hostname.replace(/^www\./, '')
    if (hostname !== 'instagram.com' && hostname !== 'instagr.am') return null

    const parts = url.pathname.split('/').filter(Boolean)
    let type = parts[0]
    let shortcode = parts[1]

    if (type === 'share') {
      if (parts.length < 3) return null
      type = parts[1]
      shortcode = parts[2]
    }

    if (!type || !shortcode || !INSTAGRAM_PATH_TYPES.has(type)) return null
    const normalizedType = type === 'reels' ? 'reel' : type

    return {
      shortcode,
      postUrl: `https://www.instagram.com/${normalizedType}/${shortcode}/`,
    }
  } catch {
    return null
  }
}

const SHORTCODE_ALPHABET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'

function decodeInstagramShortcode(shortcode: string): string | null {
  let id = 0n
  for (const char of shortcode) {
    const index = SHORTCODE_ALPHABET.indexOf(char)
    if (index === -1) return null
    id = id * 64n + BigInt(index)
  }
  return id.toString()
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
      const codePoint = Number.parseInt(hex, 16)
      if (Number.isNaN(codePoint)) return _
      return String.fromCodePoint(codePoint)
    })
    .replace(/&#(\d+);/g, (_, num) => {
      const codePoint = Number.parseInt(num, 10)
      if (Number.isNaN(codePoint)) return _
      return String.fromCodePoint(codePoint)
    })
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
}

function extractMetaContent(html: string, property: string): string | null {
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`, 'i'),
  ]

  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (match && match[1]) return match[1]
  }

  return null
}

function extractMetaName(html: string, name: string): string | null {
  const patterns = [
    new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${name}["']`, 'i'),
  ]

  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (match && match[1]) return match[1]
  }

  return null
}

function extractJsonLdPayloads(html: string): unknown[] {
  const pattern = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  const payloads: unknown[] = []

  let match: RegExpExecArray | null = null
  while ((match = pattern.exec(html))) {
    const raw = match[1]?.trim()
    if (!raw) continue
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        payloads.push(...parsed)
      } else {
        payloads.push(parsed)
      }
    } catch {
      continue
    }
  }

  return payloads
}

function collectJsonLdObjects(value: unknown, result: Record<string, unknown>[] = []): Record<
  string,
  unknown
>[] {
  if (!value) return result
  if (Array.isArray(value)) {
    for (const item of value) collectJsonLdObjects(item, result)
    return result
  }
  if (typeof value === 'object') {
    result.push(value as Record<string, unknown>)
    for (const entry of Object.values(value as Record<string, unknown>)) {
      collectJsonLdObjects(entry, result)
    }
  }
  return result
}

function pickStringField(
  record: Record<string, unknown>,
  keys: string[]
): string | null {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'string' && value.trim()) {
      return value
    }
  }
  return null
}

function extractCaptionFromJsonLd(payloads: unknown[]): string {
  const objects = collectJsonLdObjects(payloads)
  const allowedTypes = new Set([
    'ImageObject',
    'VideoObject',
    'SocialMediaPosting',
    'Article',
    'NewsArticle',
  ])

  for (const obj of objects) {
    const typeValue = obj['@type']
    if (typeof typeValue === 'string' && !allowedTypes.has(typeValue)) {
      continue
    }
    const caption = pickStringField(obj, ['caption', 'articleBody', 'description'])
    if (caption) return decodeHtmlEntities(caption)
  }

  const fallback = findValueByKey(payloads, ['caption', 'articleBody', 'description'])
  if (typeof fallback === 'string') return decodeHtmlEntities(fallback)

  return ''
}

function extractAuthorFromJsonLd(payloads: unknown[]): string {
  const objects = collectJsonLdObjects(payloads)
  const stripAt = (value: string) => value.trim().replace(/^@/, '')

  for (const obj of objects) {
    const author = obj.author
    if (!author) continue
    if (typeof author === 'string' && author.trim()) return stripAt(author)
    if (Array.isArray(author)) {
      for (const item of author) {
        if (typeof item === 'string' && item.trim()) return stripAt(item)
        if (item && typeof item === 'object') {
          const name = pickStringField(item as Record<string, unknown>, ['name', 'alternateName'])
          if (name) return stripAt(name)
        }
      }
    }
    if (typeof author === 'object') {
      const name = pickStringField(author as Record<string, unknown>, ['name', 'alternateName'])
      if (name) return stripAt(name)
    }
  }

  return ''
}

const INSTAGRAM_HANDLE_PATTERN = /^[A-Za-z0-9._]{1,30}$/

function extractHandleFromText(text: string): string | null {
  if (!text) return null
  const cleaned = decodeHtmlEntities(text).trim()
  if (!cleaned) return null

  if (INSTAGRAM_HANDLE_PATTERN.test(cleaned)) return cleaned

  const onInstagramMatch = cleaned.match(/-\\s*([A-Za-z0-9._]{1,30})\\s+on\\s+Instagram/i)
  if (onInstagramMatch?.[1]) return onInstagramMatch[1]

  const atMatch = cleaned.match(/@([A-Za-z0-9._]{1,30})/)
  if (atMatch?.[1]) return atMatch[1]

  const tokens = cleaned.split(/\s+/)
  for (const token of tokens) {
    const normalized = token.replace(/[^A-Za-z0-9._]/g, '')
    if (INSTAGRAM_HANDLE_PATTERN.test(normalized)) return normalized
  }

  return null
}

function cleanInstagramCaption(text: string): string {
  const trimmed = decodeHtmlEntities(text).trim()
  if (!trimmed) return ''

  const likesPrefix = /^\d[\d,\.Kk]*\s+likes?,\s+\d[\d,\.Kk]*\s+comments?\s+-\s+/i
  if (likesPrefix.test(trimmed)) {
    const quoted = trimmed.match(/:\s*["“]([\s\S]*)["”]\.?$/)
    if (quoted?.[1]) return quoted[1].trim()

    const withoutPrefix = trimmed.replace(likesPrefix, '')
    const tail = withoutPrefix.replace(/^[^:]*:\s*/i, '')
    return tail.replace(/^["“]|["”]$/g, '').trim()
  }

  if (/on Instagram/i.test(trimmed)) {
    const quoted = trimmed.match(/:\s*["“]([\s\S]*)["”]\.?$/)
    if (quoted?.[1]) return quoted[1].trim()
  }

  return trimmed
}

function extractJsonAfterMarker(html: string, marker: string): unknown | null {
  const markerIndex = html.indexOf(marker)
  if (markerIndex === -1) return null

  const startIndex = html.indexOf('{', markerIndex)
  if (startIndex === -1) return null

  let depth = 0
  let inString = false
  let escapeNext = false

  for (let i = startIndex; i < html.length; i += 1) {
    const char = html[i]

    if (inString) {
      if (escapeNext) {
        escapeNext = false
        continue
      }
      if (char === '\\') {
        escapeNext = true
        continue
      }
      if (char === '"') {
        inString = false
      }
      continue
    }

    if (char === '"') {
      inString = true
      continue
    }

    if (char === '{') {
      depth += 1
    } else if (char === '}') {
      depth -= 1
      if (depth === 0) {
        const jsonText = html.slice(startIndex, i + 1)
        try {
          return JSON.parse(jsonText)
        } catch {
          return null
        }
      }
    }
  }

  return null
}

function extractJsonFromScript(html: string, id: string): unknown | null {
  const pattern = new RegExp(
    `<script[^>]+id=["']${id}["'][^>]*>([\\s\\S]*?)<\\/script>`,
    'i'
  )
  const match = html.match(pattern)
  if (!match || !match[1]) return null

  try {
    return JSON.parse(match[1])
  } catch {
    return null
  }
}

function getValueAtPath(value: unknown, path: Array<string | number>): unknown | null {
  let current: unknown = value

  for (const segment of path) {
    if (current === null || current === undefined) return null
    if (typeof segment === 'number') {
      if (!Array.isArray(current)) return null
      current = current[segment]
      continue
    }
    if (typeof current !== 'object') return null
    current = (current as Record<string, unknown>)[segment]
  }

  return current ?? null
}

function findValueByKey(
  value: unknown,
  keys: string[],
  depth = 0,
  maxDepth = 6
): unknown | null {
  if (value === null || value === undefined || depth > maxDepth) return null

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findValueByKey(item, keys, depth + 1, maxDepth)
      if (found) return found
    }
    return null
  }

  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>
    for (const key of keys) {
      if (key in obj) return obj[key]
    }
    for (const item of Object.values(obj)) {
      const found = findValueByKey(item, keys, depth + 1, maxDepth)
      if (found) return found
    }
  }

  return null
}

function findShortcodeMedia(payload: unknown): unknown | null {
  if (!payload) return null

  const candidates: Array<Array<string | number>> = [
    ['entry_data', 'PostPage', 0, 'graphql', 'shortcode_media'],
    ['graphql', 'shortcode_media'],
    ['data', 'shortcode_media'],
    ['data', 'xdt_shortcode_media'],
    ['props', 'pageProps', 'graphql', 'shortcode_media'],
    ['props', 'pageProps', 'data', 'shortcode_media'],
    ['props', 'pageProps', 'data', 'xdt_shortcode_media'],
  ]

  for (const path of candidates) {
    const found = getValueAtPath(payload, path)
    if (found) return found
  }

  const byKey = findValueByKey(payload, ['shortcode_media', 'xdt_shortcode_media'])
  if (byKey) return byKey

  const items = findValueByKey(payload, ['items'])
  if (Array.isArray(items) && items[0]) return items[0]

  return null
}

function normalizeTypename(node: Record<string, unknown> | null): string {
  if (node && typeof node.__typename === 'string') return node.__typename
  if (node && typeof node.media_type === 'number') {
    if (node.media_type === 2) return 'GraphVideo'
    if (node.media_type === 8) return 'GraphSidecar'
  }
  if (node && node.is_video) return 'GraphVideo'
  return 'GraphImage'
}

type ImageCandidate = {
  src?: string
  url?: string
  width?: number
  height?: number
}

function pickBestImageUrl(candidates?: ImageCandidate[] | null): string | null {
  if (!Array.isArray(candidates) || candidates.length === 0) return null

  let best: { url: string; area: number } | null = null
  for (const candidate of candidates) {
    const url = candidate?.src ?? candidate?.url
    if (!url) continue
    const width = typeof candidate.width === 'number' ? candidate.width : 0
    const height = typeof candidate.height === 'number' ? candidate.height : 0
    const area = width && height ? width * height : 0
    if (!best || area > best.area) {
      best = { url, area }
    }
  }

  if (best?.url) return best.url
  const fallback = candidates[candidates.length - 1]
  return (fallback?.src ?? fallback?.url) || null
}

type VideoCandidate = {
  url?: string
  width?: number
  height?: number
}

function pickBestVideoUrl(candidates?: VideoCandidate[] | null): string | null {
  if (!Array.isArray(candidates) || candidates.length === 0) return null

  let best: { url: string; area: number } | null = null
  for (const candidate of candidates) {
    const url = candidate?.url
    if (!url) continue
    const width = typeof candidate.width === 'number' ? candidate.width : 0
    const height = typeof candidate.height === 'number' ? candidate.height : 0
    const area = width && height ? width * height : 0
    if (!best || area > best.area) {
      best = { url, area }
    }
  }

  if (best?.url) return best.url
  const fallback = candidates[candidates.length - 1]
  return fallback?.url || null
}

function normalizeMediaNode(node: Record<string, unknown> | null): InstagramMediaItem | null {
  if (!node) return null

  const displayUrl =
    (node.display_url as string | undefined) ||
    (node.displayUrl as string | undefined) ||
    pickBestImageUrl(node.display_resources as ImageCandidate[] | undefined) ||
    pickBestImageUrl(
      (node.image_versions2 as { candidates?: ImageCandidate[] } | undefined)?.candidates
    ) ||
    pickBestImageUrl(node.candidates as ImageCandidate[] | undefined) ||
    (node.thumbnail_src as string | undefined) ||
    ''

  if (!displayUrl) return null

  const videoUrl =
    (node.video_url as string | undefined) ||
    (node.videoUrl as string | undefined) ||
    pickBestVideoUrl(node.video_versions as VideoCandidate[] | undefined)

  return {
    displayUrl,
    videoUrl,
    typename: normalizeTypename(node),
  }
}

function collectMediaItems(media: Record<string, unknown> | null): InstagramMediaItem[] {
  if (!media) return []

  const edges = (
    media.edge_sidecar_to_children as
      | { edges?: Array<{ node?: Record<string, unknown> }> }
      | undefined
  )?.edges

  if (Array.isArray(edges) && edges.length > 0) {
    return edges
      .map((edge) => normalizeMediaNode(edge.node ?? null))
      .filter((item): item is InstagramMediaItem => Boolean(item))
  }

  const carouselMedia = media.carousel_media as Array<Record<string, unknown>> | undefined
  if (Array.isArray(carouselMedia) && carouselMedia.length > 0) {
    return carouselMedia
      .map((item) => normalizeMediaNode(item))
      .filter((item): item is InstagramMediaItem => Boolean(item))
  }

  const childMedia = (media.children as { data?: Array<Record<string, unknown>> } | undefined)?.data
  if (Array.isArray(childMedia) && childMedia.length > 0) {
    return childMedia
      .map((item) => normalizeMediaNode(item))
      .filter((item): item is InstagramMediaItem => Boolean(item))
  }

  const single = normalizeMediaNode(media)
  return single ? [single] : []
}

function extractCaption(media: Record<string, unknown> | null): string {
  if (!media) return ''

  const edges = (
    media.edge_media_to_caption as { edges?: Array<{ node?: { text?: string } }> } | undefined
  )?.edges
  if (Array.isArray(edges) && edges.length > 0) {
    const text = edges[0]?.node?.text
    if (text) return decodeHtmlEntities(text)
  }

  const caption = media.caption as { text?: string } | string | undefined
  if (typeof caption === 'string') return decodeHtmlEntities(caption)
  if (caption && typeof caption.text === 'string') return decodeHtmlEntities(caption.text)

  return ''
}

function extractPostDataFromHtml(
  html: string,
  parsed: { shortcode: string; postUrl: string },
  extraPayloads: unknown[] = []
): InstagramPostData | null {
  const metaImageRaw =
    extractMetaContent(html, 'og:image:secure_url') ??
    extractMetaContent(html, 'og:image') ??
    extractMetaContent(html, 'twitter:image') ??
    extractMetaName(html, 'twitter:image')
  const metaTitleRaw =
    extractMetaContent(html, 'og:title') ??
    extractMetaContent(html, 'twitter:title') ??
    extractMetaName(html, 'twitter:title') ??
    ''
  const metaDescRaw =
    extractMetaContent(html, 'og:description') ??
    extractMetaContent(html, 'twitter:description') ??
    extractMetaName(html, 'twitter:description') ??
    extractMetaName(html, 'description') ??
    ''

  const metaImage = metaImageRaw ? decodeHtmlEntities(metaImageRaw) : ''
  const metaTitle = decodeHtmlEntities(metaTitleRaw)
  const metaDesc = decodeHtmlEntities(metaDescRaw)
  const jsonLdPayloads = extractJsonLdPayloads(html)
  const jsonLdCaption = extractCaptionFromJsonLd(jsonLdPayloads)
  const jsonLdAuthor = extractAuthorFromJsonLd(jsonLdPayloads)

  const usernameMatch = metaTitle.match(/^([^:]+?) on Instagram/)
  const descriptionUsernameMatch = metaDesc.match(/- ([^ ]+) on Instagram/)
  const metaUsername = usernameMatch
    ? usernameMatch[1].trim()
    : descriptionUsernameMatch
    ? descriptionUsernameMatch[1].trim()
    : ''

  const payloads = [
    ...extraPayloads,
    extractJsonAfterMarker(html, 'window._sharedData'),
    extractJsonAfterMarker(html, '__additionalDataLoaded'),
    extractJsonFromScript(html, '__NEXT_DATA__'),
  ].filter(Boolean)

  for (const payload of payloads) {
    const mediaNode = findShortcodeMedia(payload)
    if (!mediaNode || typeof mediaNode !== 'object') continue

    const mediaRecord = mediaNode as Record<string, unknown>
    const mediaItems = collectMediaItems(mediaRecord)
    const captionCandidate = extractCaption(mediaRecord) || jsonLdCaption || metaDesc || metaTitle
    const caption = cleanInstagramCaption(captionCandidate)

    const displayName = jsonLdAuthor || metaUsername
    const username =
      (mediaRecord.owner as { username?: string } | undefined)?.username ||
      (mediaRecord.user as { username?: string } | undefined)?.username ||
      extractHandleFromText(jsonLdAuthor) ||
      extractHandleFromText(metaDesc) ||
      extractHandleFromText(metaTitle) ||
      displayName

    const profilePicUrl =
      (mediaRecord.owner as { profile_pic_url?: string } | undefined)?.profile_pic_url ||
      (mediaRecord.user as { profile_pic_url?: string } | undefined)?.profile_pic_url ||
      ''

    const timestamp =
      (mediaRecord.taken_at_timestamp as number | undefined) ??
      (mediaRecord.taken_at as number | undefined) ??
      0

    const typename = normalizeTypename(mediaRecord)
    const primary = mediaItems[0]
    const displayUrl = primary?.displayUrl || metaImage
    const videoUrl = primary?.videoUrl
    const media =
      mediaItems.length > 0
        ? mediaItems
        : displayUrl
        ? [{ displayUrl, videoUrl, typename }]
        : []

    return {
      shortcode: (mediaRecord.shortcode as string | undefined) || parsed.shortcode,
      displayUrl,
      videoUrl,
      caption,
      username,
      displayName,
      profilePicUrl,
      timestamp,
      typename,
      media,
    }
  }

  if (!metaImage && !metaTitle && !metaDesc) return null

  const captionCandidate = jsonLdCaption || metaDesc || metaTitle
  const caption = cleanInstagramCaption(captionCandidate)
  const displayName = jsonLdAuthor || metaUsername
  const media = metaImage ? [{ displayUrl: metaImage, typename: 'GraphImage' }] : []

  return {
    shortcode: parsed.shortcode,
    displayUrl: metaImage,
    videoUrl: undefined,
    caption,
    username:
      extractHandleFromText(jsonLdAuthor) ||
      extractHandleFromText(metaDesc) ||
      extractHandleFromText(metaTitle) ||
      displayName,
    displayName,
    profilePicUrl: '',
    timestamp: 0,
    typename: 'GraphImage',
    media,
  }
}

function getHeaderValue(
  headers: Record<string, string | string[] | undefined>,
  name: string
): string | undefined {
  const value = headers[name.toLowerCase()]
  if (Array.isArray(value)) return value[0]
  return value
}

async function fetchBufferWithRedirect(
  url: string,
  options: NetRequestOptions,
  redirectCount = 0,
  maxBytes?: number
): Promise<{ buffer: Buffer; headers: Record<string, string | string[] | undefined> } | null> {
  return new Promise((resolve) => {
    const request = net.request({ url, ...options })
    let settled = false

    const finish = (
      value: { buffer: Buffer; headers: Record<string, string | string[] | undefined> } | null
    ) => {
      if (settled) return
      settled = true
      resolve(value)
    }

    const chunks: Buffer[] = []

    request.on('response', (response) => {
      const statusCode = response.statusCode ?? 0
      const location = getHeaderValue(response.headers, 'location')

      if (
        statusCode >= 300 &&
        statusCode < 400 &&
        location &&
        redirectCount < MAX_REDIRECTS
      ) {
        const nextUrl = new URL(location, url).toString()
        void fetchBufferWithRedirect(nextUrl, options, redirectCount + 1, maxBytes).then(finish)
        return
      }

      if (statusCode < 200 || statusCode >= 300) {
        console.error('Instagram request error:', { statusCode, url })
        finish(null)
        return
      }

      if (maxBytes) {
        const contentLength = getHeaderValue(response.headers, 'content-length')
        if (contentLength && Number(contentLength) > maxBytes) {
          console.warn('[instagram] media too large (content-length)', {
            url,
            maxBytes,
            contentLength,
          })
          response.resume()
          finish(null)
          return
        }
      }

      let totalBytes = 0
      response.on('data', (chunk) => {
        if (settled) return
        const bufferChunk = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
        totalBytes += bufferChunk.length
        if (maxBytes && totalBytes > maxBytes) {
          console.warn('[instagram] media too large (stream)', {
            url,
            maxBytes,
            totalBytes,
          })
          request.abort()
          finish(null)
          return
        }
        chunks.push(bufferChunk)
      })

      response.on('end', () => {
        finish({ buffer: Buffer.concat(chunks), headers: response.headers })
      })
    })

    request.on('error', (e) => {
      if (settled) return
      console.error('Instagram request error:', e)
      finish(null)
    })

    request.end()
  })
}

async function fetchHtml(url: string): Promise<string | null> {
  const instagramSession = getInstagramSession()
  const result = await fetchBufferWithRedirect(url, {
    headers: {
      'User-Agent': INSTAGRAM_USER_AGENT,
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'identity',
    },
    session: instagramSession,
    useSessionCookies: true,
  })

  if (!result) return null
  return result.buffer.toString('utf8')
}

async function getInstagramCsrfToken(): Promise<string | undefined> {
  const instagramSession = getInstagramSession()
  const cookies = await instagramSession.cookies.get({
    url: 'https://www.instagram.com',
    name: 'csrftoken',
  })
  return cookies[0]?.value
}

function buildInstagramJsonUrl(postUrl: string): string {
  const url = new URL(postUrl)
  url.searchParams.set('__a', '1')
  url.searchParams.set('__d', 'dis')
  return url.toString()
}

function buildInstagramApiUrls(shortcode: string): string[] {
  const mediaId = decodeInstagramShortcode(shortcode)
  const urls: string[] = []
  if (mediaId) {
    urls.push(`https://i.instagram.com/api/v1/media/${mediaId}/info/`)
    urls.push(`https://www.instagram.com/api/v1/media/${mediaId}/info/`)
  }
  urls.push(`https://i.instagram.com/api/v1/media/shortcode/${shortcode}/`)
  urls.push(`https://www.instagram.com/api/v1/media/shortcode/${shortcode}/`)
  return urls
}

async function fetchJson(
  url: string,
  refererUrl?: string,
  userAgentOverride?: string
): Promise<unknown | null> {
  const instagramSession = getInstagramSession()
  const csrfToken = await getInstagramCsrfToken()
  const origin = refererUrl ? new URL(refererUrl).origin : 'https://www.instagram.com'
  const result = await fetchBufferWithRedirect(url, {
    headers: {
      'User-Agent': userAgentOverride ?? INSTAGRAM_USER_AGENT,
      Accept: 'application/json,text/plain,*/*',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'identity',
      'X-IG-App-ID': '936619743392459',
      'X-ASBD-ID': '129477',
      'X-Requested-With': 'XMLHttpRequest',
      ...(csrfToken ? { 'X-CSRFToken': csrfToken } : {}),
      ...(refererUrl ? { Referer: refererUrl } : {}),
    },
    session: instagramSession,
    useSessionCookies: true,
    origin,
    referrerPolicy: 'no-referrer',
  })

  if (!result) return null
  const text = result.buffer.toString('utf8').trim()
  if (!text) return null

  const sanitized = text.startsWith('for (;;);') ? text.slice(9) : text
  try {
    return JSON.parse(sanitized)
  } catch (error) {
    console.warn('[instagram] json parse failed', error)
    return null
  }
}

async function fetchInstagramJsonPayload(parsed: {
  shortcode: string
  postUrl: string
}): Promise<unknown[]> {
  const urls = [buildInstagramJsonUrl(parsed.postUrl), ...buildInstagramApiUrls(parsed.shortcode)]
  for (const url of urls) {
    const useAppUa = url.includes('/api/v1/')
    const payload = await fetchJson(
      url,
      parsed.postUrl,
      useAppUa ? INSTAGRAM_APP_USER_AGENT : undefined
    )
    if (!payload) continue
    if (findShortcodeMedia(payload)) return [payload]
  }
  return []
}

async function fetchImageAsBase64(imageUrl: string, refererUrl?: string): Promise<string | null> {
  if (!imageUrl) return null

  const instagramSession = getInstagramSession()
  const headers: Record<string, string> = {
    'User-Agent': INSTAGRAM_USER_AGENT,
    Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'identity',
  }

  const origin = refererUrl ? new URL(refererUrl).origin : undefined
  const result = await fetchBufferWithRedirect(imageUrl, {
    headers,
    session: instagramSession,
    useSessionCookies: true,
    origin,
    referrerPolicy: 'no-referrer',
  })
  if (!result) return null

  const contentType = getHeaderValue(result.headers, 'content-type')
  const mimeType = contentType || 'image/jpeg'
  const base64 = result.buffer.toString('base64')
  return `data:${mimeType};base64,${base64}`
}

async function fetchVideoAsBase64(videoUrl: string, refererUrl?: string): Promise<string | null> {
  if (!videoUrl) return null

  const instagramSession = getInstagramSession()
  const headers: Record<string, string> = {
    'User-Agent': INSTAGRAM_USER_AGENT,
    Accept: 'video/*,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'identity',
  }

  const origin = refererUrl ? new URL(refererUrl).origin : undefined
  const result = await fetchBufferWithRedirect(
    videoUrl,
    {
      headers,
      session: instagramSession,
      useSessionCookies: true,
      origin,
      referrerPolicy: 'no-referrer',
    },
    0,
    MAX_VIDEO_BYTES
  )

  if (!result) return null

  const contentType = getHeaderValue(result.headers, 'content-type')
  const mimeType = contentType || 'video/mp4'
  const base64 = result.buffer.toString('base64')
  return `data:${mimeType};base64,${base64}`
}
async function fetchInstagramPost(postUrl: string): Promise<InstagramPostData | null> {
  const parsed = parseInstagramUrl(postUrl)
  if (!parsed) return null

  const [html, jsonPayloads] = await Promise.all([
    fetchHtml(parsed.postUrl),
    fetchInstagramJsonPayload(parsed),
  ])

  if (!html && jsonPayloads.length === 0) return null

  const extraPayloads = jsonPayloads
  const htmlSource = html ?? ''
  return extractPostDataFromHtml(htmlSource, parsed, extraPayloads)
}

function setupIpcHandlers(): void {
  ipcMain.handle('instagram:ensureLogin', async () => ensureInstagramLogin())

  ipcMain.handle('instagram:fetchPost', async (_event, postUrl: string) => {
    console.info('[instagram] fetchPost start', { postUrl })
    const postData = await fetchInstagramPost(postUrl)
    if (!postData) {
      console.warn('[instagram] fetchPost: no data')
      return null
    }

    const baseMedia =
      postData.media.length > 0
        ? postData.media
        : postData.displayUrl
        ? [
            {
              displayUrl: postData.displayUrl,
              videoUrl: postData.videoUrl,
              typename: postData.typename,
            },
          ]
        : []

    const media: InstagramMediaItem[] = []
    let imageCount = 0
    let videoCount = 0

    for (const item of baseMedia) {
      let imageBase64: string | null = null
      let videoBase64: string | null = null

      if (item.displayUrl && imageCount < MAX_MEDIA_BASE64) {
        imageBase64 = await fetchImageAsBase64(item.displayUrl, postUrl)
        if (imageBase64) {
          imageCount += 1
        }
      }

      if (item.videoUrl && videoCount < MAX_VIDEO_BASE64) {
        videoBase64 = await fetchVideoAsBase64(item.videoUrl, postUrl)
        if (videoBase64) {
          videoCount += 1
        }
      }

      media.push({
        ...item,
        imageBase64,
        videoBase64,
      })
    }

    console.info('[instagram] fetchPost: done', {
      mediaCount: media.length,
      hasCaption: Boolean(postData.caption),
    })
    return {
      ...postData,
      media,
    }
  })
}

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 16, y: 16 },
  })

  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  setupIpcHandlers()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
