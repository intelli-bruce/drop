import { describe, it, expect } from 'vitest'
import { fileFromDataUrl, extensionFromMime, normalizeExternalUrl } from '../file-utils'

describe('fileFromDataUrl', () => {
  it('should parse valid base64 PNG data URL', () => {
    // 1x1 transparent PNG
    const dataUrl =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
    const file = fileFromDataUrl(dataUrl, 'test.png')

    expect(file).not.toBeNull()
    expect(file!.name).toBe('test.png')
    expect(file!.type).toBe('image/png')
    expect(file!.size).toBeGreaterThan(0)
  })

  it('should parse valid base64 JPEG data URL', () => {
    // Minimal JPEG
    const dataUrl =
      'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AVN//2Q=='
    const file = fileFromDataUrl(dataUrl, 'photo.jpg')

    expect(file).not.toBeNull()
    expect(file!.name).toBe('photo.jpg')
    expect(file!.type).toBe('image/jpeg')
  })

  it('should return null for invalid data URL format', () => {
    expect(fileFromDataUrl('not a data url', 'test.png')).toBeNull()
    expect(fileFromDataUrl('data:image/png;invalid', 'test.png')).toBeNull()
    expect(fileFromDataUrl('', 'test.png')).toBeNull()
  })

  it('should handle video MIME types', () => {
    // Minimal MP4 (just headers, won't play but valid for testing)
    const dataUrl = 'data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDE='
    const file = fileFromDataUrl(dataUrl, 'video.mp4')

    expect(file).not.toBeNull()
    expect(file!.type).toBe('video/mp4')
  })

  it('should handle audio MIME types', () => {
    // Valid base64 for audio/mpeg (minimal content)
    const dataUrl = 'data:audio/mpeg;base64,SGVsbG8gV29ybGQ='
    const file = fileFromDataUrl(dataUrl, 'audio.mp3')

    expect(file).not.toBeNull()
    expect(file!.type).toBe('audio/mpeg')
  })
})

describe('extensionFromMime', () => {
  it('should convert image/jpeg to jpg', () => {
    expect(extensionFromMime('image/jpeg')).toBe('jpg')
  })

  it('should convert image/png to png', () => {
    expect(extensionFromMime('image/png')).toBe('png')
  })

  it('should convert video/mp4 to mp4', () => {
    expect(extensionFromMime('video/mp4')).toBe('mp4')
  })

  it('should convert audio/mpeg to mpeg', () => {
    expect(extensionFromMime('audio/mpeg')).toBe('mpeg')
  })

  it('should return bin for unknown or malformed types', () => {
    expect(extensionFromMime('unknown')).toBe('bin')
    expect(extensionFromMime('')).toBe('bin')
  })

  it('should handle webp, gif, and other image types', () => {
    expect(extensionFromMime('image/webp')).toBe('webp')
    expect(extensionFromMime('image/gif')).toBe('gif')
    expect(extensionFromMime('image/svg+xml')).toBe('svg+xml')
  })
})

describe('normalizeExternalUrl', () => {
  it('should remove hash from URL', () => {
    expect(normalizeExternalUrl('https://example.com/page#section')).toBe(
      'https://example.com/page'
    )
  })

  it('should remove search params from URL', () => {
    expect(normalizeExternalUrl('https://example.com/page?foo=bar&baz=qux')).toBe(
      'https://example.com/page'
    )
  })

  it('should remove both hash and search params', () => {
    expect(normalizeExternalUrl('https://example.com/page?foo=bar#section')).toBe(
      'https://example.com/page'
    )
  })

  it('should preserve path', () => {
    expect(normalizeExternalUrl('https://example.com/path/to/resource')).toBe(
      'https://example.com/path/to/resource'
    )
  })

  it('should return original value for invalid URLs', () => {
    expect(normalizeExternalUrl('not a url')).toBe('not a url')
    expect(normalizeExternalUrl('')).toBe('')
    expect(normalizeExternalUrl('just-text')).toBe('just-text')
  })

  it('should handle URLs with trailing slash', () => {
    expect(normalizeExternalUrl('https://example.com/page/?query=1')).toBe(
      'https://example.com/page/'
    )
  })
})
