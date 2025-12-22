import {
  app,
  BrowserWindow,
  ipcMain,
  net,
  session,
  type ClientRequestConstructorOptions,
} from 'electron'
import { join } from 'path'
import {
  type InstagramMediaItem,
  type InstagramPostData,
  parseInstagramUrl,
  decodeInstagramShortcode,
  decodeHtmlEntities,
  extractMetaContent,
  extractMetaName,
  extractJsonLdPayloads,
  extractCaptionFromJsonLd,
  extractAuthorFromJsonLd,
  extractHandleFromText,
  cleanInstagramCaption,
  extractJsonAfterMarker,
  extractJsonFromScript,
  findShortcodeMedia,
  normalizeTypename,
  pickBestImageUrl,
  pickBestVideoUrl,
  normalizeMediaNode,
  collectMediaItems,
  extractCaption,
  type ImageCandidate,
  type VideoCandidate,
} from './instagram-utils'
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
    console.info('[instagram] mediaRecord keys:', Object.keys(mediaRecord))
    console.info('[instagram] edge_sidecar_to_children:', mediaRecord.edge_sidecar_to_children)
    console.info('[instagram] carousel_media:', mediaRecord.carousel_media)
    console.info('[instagram] children:', mediaRecord.children)
    console.info('[instagram] __typename:', mediaRecord.__typename)
    console.info('[instagram] media_type:', mediaRecord.media_type)
    const mediaItems = collectMediaItems(mediaRecord)
    console.info('[instagram] collected mediaItems:', mediaItems.length, mediaItems)
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

  if (!metaImage && !metaTitle && !metaDesc) {
    console.warn('[instagram] no JSON payload and no HTML meta tags found')
    return null
  }

  console.warn('[instagram] falling back to HTML meta tags (only first image will be available)')
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
  console.info('[instagram] trying JSON endpoints:', urls)
  for (const url of urls) {
    const useAppUa = url.includes('/api/v1/')
    console.info('[instagram] fetching:', url)
    const payload = await fetchJson(
      url,
      parsed.postUrl,
      useAppUa ? INSTAGRAM_APP_USER_AGENT : undefined
    )
    if (!payload) {
      console.info('[instagram] no payload from:', url)
      continue
    }
    console.info('[instagram] payload received, keys:', Object.keys(payload as Record<string, unknown>))
    const found = findShortcodeMedia(payload)
    if (found) {
      console.info('[instagram] found shortcode_media in payload')
      return [payload]
    }
    console.info('[instagram] no shortcode_media found in payload')
  }
  console.warn('[instagram] no valid JSON payload found from any endpoint')
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
