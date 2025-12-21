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
}

interface InstagramPostData {
  shortcode: string
  displayUrl: string
  videoUrl?: string
  caption: string
  username: string
  profilePicUrl: string
  timestamp: number
  typename: string
  media: InstagramMediaItem[]
}

const INSTAGRAM_PATH_TYPES = new Set(['p', 'reel', 'reels'])
const INSTAGRAM_USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:120.0) Gecko/20100101 Firefox/120.0'
const MAX_REDIRECTS = 5
const MAX_MEDIA_BASE64 = 10
const INSTAGRAM_SESSION_PARTITION = 'persist:instagram'
const INSTAGRAM_LOGIN_URL = 'https://www.instagram.com/accounts/login/'

type NetRequestOptions = Pick<
  ClientRequestConstructorOptions,
  'headers' | 'origin' | 'referrerPolicy' | 'session' | 'useSessionCookies'
>

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
  if (await isInstagramLoggedIn()) return true

  return new Promise((resolve) => {
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
      clearInterval(interval)
      clearTimeout(timeout)
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
      finish(false)
    }, 2 * 60 * 1000)

    loginWindow.on('closed', () => {
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
}

function parseInstagramUrl(inputUrl: string): { shortcode: string; postUrl: string } | null {
  try {
    const url = new URL(inputUrl)
    const hostname = url.hostname.replace(/^www\./, '')
    if (hostname !== 'instagram.com') return null

    const parts = url.pathname.split('/').filter(Boolean)
    const type = parts[0]
    const shortcode = parts[1]

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

function decodeHtmlEntities(value: string): string {
  return value
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

function normalizeMediaNode(node: Record<string, unknown> | null): InstagramMediaItem | null {
  if (!node) return null

  const displayUrl =
    (node.display_url as string | undefined) ||
    (node.displayUrl as string | undefined) ||
    (node.thumbnail_src as string | undefined) ||
    (node.display_resources as Array<{ src?: string }> | undefined)?.[0]?.src ||
    (node.image_versions2 as { candidates?: Array<{ url?: string }> } | undefined)?.candidates?.[0]
      ?.url ||
    (node.candidates as Array<{ url?: string }> | undefined)?.[0]?.url ||
    ''

  if (!displayUrl) return null

  const videoUrl =
    (node.video_url as string | undefined) ||
    (node.videoUrl as string | undefined) ||
    (node.video_versions as Array<{ url?: string }> | undefined)?.[0]?.url

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
    if (text) return text
  }

  const caption = media.caption as { text?: string } | string | undefined
  if (typeof caption === 'string') return caption
  if (caption && typeof caption.text === 'string') return caption.text

  return ''
}

function extractPostDataFromHtml(
  html: string,
  parsed: { shortcode: string; postUrl: string }
): InstagramPostData | null {
  const metaImageRaw =
    extractMetaContent(html, 'og:image:secure_url') ?? extractMetaContent(html, 'og:image')
  const metaTitleRaw = extractMetaContent(html, 'og:title') ?? ''
  const metaDescRaw = extractMetaContent(html, 'og:description') ?? ''

  const metaImage = metaImageRaw ? decodeHtmlEntities(metaImageRaw) : ''
  const metaTitle = decodeHtmlEntities(metaTitleRaw)
  const metaDesc = decodeHtmlEntities(metaDescRaw)

  const usernameMatch = metaTitle.match(/^([^:]+?) on Instagram/)
  const descriptionUsernameMatch = metaDesc.match(/- ([^ ]+) on Instagram/)
  const metaUsername = usernameMatch
    ? usernameMatch[1].trim()
    : descriptionUsernameMatch
    ? descriptionUsernameMatch[1].trim()
    : ''

  const payloads = [
    extractJsonAfterMarker(html, 'window._sharedData'),
    extractJsonAfterMarker(html, '__additionalDataLoaded'),
    extractJsonFromScript(html, '__NEXT_DATA__'),
  ].filter(Boolean)

  for (const payload of payloads) {
    const mediaNode = findShortcodeMedia(payload)
    if (!mediaNode || typeof mediaNode !== 'object') continue

    const mediaRecord = mediaNode as Record<string, unknown>
    const mediaItems = collectMediaItems(mediaRecord)
    const caption = extractCaption(mediaRecord) || metaDesc || metaTitle

    const username =
      (mediaRecord.owner as { username?: string } | undefined)?.username ||
      (mediaRecord.user as { username?: string } | undefined)?.username ||
      metaUsername

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
      profilePicUrl,
      timestamp,
      typename,
      media,
    }
  }

  if (!metaImage && !metaTitle && !metaDesc) return null

  const caption = metaDesc || metaTitle
  const media = metaImage ? [{ displayUrl: metaImage, typename: 'GraphImage' }] : []

  return {
    shortcode: parsed.shortcode,
    displayUrl: metaImage,
    videoUrl: undefined,
    caption,
    username: metaUsername,
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
  redirectCount = 0
): Promise<{ buffer: Buffer; headers: Record<string, string | string[] | undefined> } | null> {
  return new Promise((resolve) => {
    const request = net.request({ url, ...options })

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
        resolve(fetchBufferWithRedirect(nextUrl, options, redirectCount + 1))
        return
      }

      if (statusCode < 200 || statusCode >= 300) {
        console.error('Instagram request error:', statusCode)
        resolve(null)
        return
      }

      response.on('data', (chunk) => {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
      })

      response.on('end', () => {
        resolve({ buffer: Buffer.concat(chunks), headers: response.headers })
      })
    })

    request.on('error', (e) => {
      console.error('Instagram request error:', e)
      resolve(null)
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

async function fetchInstagramPost(postUrl: string): Promise<InstagramPostData | null> {
  const parsed = parseInstagramUrl(postUrl)
  if (!parsed) return null

  const html = await fetchHtml(parsed.postUrl)
  if (!html) return null

  return extractPostDataFromHtml(html, parsed)
}

function setupIpcHandlers(): void {
  ipcMain.handle('instagram:ensureLogin', async () => ensureInstagramLogin())

  ipcMain.handle('instagram:fetchPost', async (_event, postUrl: string) => {
    const postData = await fetchInstagramPost(postUrl)
    if (!postData) return null

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

    const media = await Promise.all(
      baseMedia.map(async (item, index) => {
        if (!item.displayUrl || index >= MAX_MEDIA_BASE64) {
          return { ...item, imageBase64: null }
        }
        const imageBase64 = await fetchImageAsBase64(item.displayUrl, postUrl)
        return { ...item, imageBase64 }
      })
    )

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
