/**
 * Convert a base64 data URL to a File object
 */
export function fileFromDataUrl(dataUrl: string, filename: string): File | null {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/)
  if (!match) return null

  const mimeType = match[1]
  const base64Data = match[2]
  const binaryString = atob(base64Data)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i += 1) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  const blob = new Blob([bytes], { type: mimeType })

  return new File([blob], filename, { type: mimeType })
}

/**
 * Extract file extension from MIME type
 */
export function extensionFromMime(mimeType: string): string {
  const [, subtype] = mimeType.split('/')
  if (!subtype) return 'bin'
  return subtype === 'jpeg' ? 'jpg' : subtype
}

/**
 * Normalize external URL by removing hash and search params
 */
export function normalizeExternalUrl(value: string): string {
  try {
    const url = new URL(value)
    url.hash = ''
    url.search = ''
    return url.toString()
  } catch {
    return value
  }
}
