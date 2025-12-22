import { describe, it, expect } from 'vitest'
import {
  normalizeInstagramUrl,
  extractInstagramUrls,
  INSTAGRAM_HOSTS,
  INSTAGRAM_PATH_TYPES,
} from '../instagram-url-utils'

describe('INSTAGRAM_HOSTS', () => {
  it('should contain instagram.com and instagr.am', () => {
    expect(INSTAGRAM_HOSTS.has('instagram.com')).toBe(true)
    expect(INSTAGRAM_HOSTS.has('instagr.am')).toBe(true)
  })
})

describe('INSTAGRAM_PATH_TYPES', () => {
  it('should contain p, reel, reels, and tv', () => {
    expect(INSTAGRAM_PATH_TYPES.has('p')).toBe(true)
    expect(INSTAGRAM_PATH_TYPES.has('reel')).toBe(true)
    expect(INSTAGRAM_PATH_TYPES.has('reels')).toBe(true)
    expect(INSTAGRAM_PATH_TYPES.has('tv')).toBe(true)
  })
})

describe('normalizeInstagramUrl', () => {
  it('should handle www.instagram.com/p/SHORTCODE/', () => {
    expect(normalizeInstagramUrl('https://www.instagram.com/p/ABC123/')).toBe(
      'https://www.instagram.com/p/ABC123/'
    )
  })

  it('should handle instagram.com without www', () => {
    expect(normalizeInstagramUrl('https://instagram.com/p/ABC123/')).toBe(
      'https://www.instagram.com/p/ABC123/'
    )
  })

  it('should handle instagr.am domain', () => {
    expect(normalizeInstagramUrl('https://instagr.am/p/ABC123/')).toBe(
      'https://www.instagram.com/p/ABC123/'
    )
  })

  it('should handle URLs without protocol', () => {
    expect(normalizeInstagramUrl('www.instagram.com/p/ABC123/')).toBe(
      'https://www.instagram.com/p/ABC123/'
    )
    expect(normalizeInstagramUrl('instagram.com/p/ABC123/')).toBe(
      'https://www.instagram.com/p/ABC123/'
    )
  })

  it('should handle reel URLs', () => {
    expect(normalizeInstagramUrl('https://www.instagram.com/reel/XYZ789/')).toBe(
      'https://www.instagram.com/reel/XYZ789/'
    )
  })

  it('should normalize reels to reel', () => {
    expect(normalizeInstagramUrl('https://www.instagram.com/reels/XYZ789/')).toBe(
      'https://www.instagram.com/reel/XYZ789/'
    )
  })

  it('should handle share/p/ URLs', () => {
    expect(normalizeInstagramUrl('https://www.instagram.com/share/p/ABC123/')).toBe(
      'https://www.instagram.com/p/ABC123/'
    )
  })

  it('should handle share/reel/ URLs', () => {
    expect(normalizeInstagramUrl('https://www.instagram.com/share/reel/XYZ789/')).toBe(
      'https://www.instagram.com/reel/XYZ789/'
    )
  })

  it('should handle tv URLs', () => {
    expect(normalizeInstagramUrl('https://www.instagram.com/tv/VIDEO123/')).toBe(
      'https://www.instagram.com/tv/VIDEO123/'
    )
  })

  it('should return null for non-Instagram URLs', () => {
    expect(normalizeInstagramUrl('https://example.com/p/ABC123/')).toBeNull()
    expect(normalizeInstagramUrl('https://twitter.com/user/status/123')).toBeNull()
    expect(normalizeInstagramUrl('not a url')).toBeNull()
  })

  it('should return null for Instagram profile URLs (not posts)', () => {
    expect(normalizeInstagramUrl('https://www.instagram.com/username/')).toBeNull()
  })

  it('should return null for URLs with insufficient path parts', () => {
    expect(normalizeInstagramUrl('https://www.instagram.com/p/')).toBeNull()
    expect(normalizeInstagramUrl('https://www.instagram.com/')).toBeNull()
  })

  it('should return null for share URLs with insufficient parts', () => {
    expect(normalizeInstagramUrl('https://www.instagram.com/share/p/')).toBeNull()
    expect(normalizeInstagramUrl('https://www.instagram.com/share/')).toBeNull()
  })

  it('should handle URLs with query params and hash', () => {
    expect(
      normalizeInstagramUrl('https://www.instagram.com/p/ABC123/?igsh=xxx#section')
    ).toBe('https://www.instagram.com/p/ABC123/')
  })
})

describe('extractInstagramUrls', () => {
  it('should extract single URL from text', () => {
    const text = 'Check this out: https://www.instagram.com/p/ABC123/'
    expect(extractInstagramUrls(text)).toEqual(['https://www.instagram.com/p/ABC123/'])
  })

  it('should extract multiple URLs from text', () => {
    const text = `
      First post: https://www.instagram.com/p/ABC123/
      Second post: https://www.instagram.com/reel/XYZ789/
    `
    const urls = extractInstagramUrls(text)
    expect(urls).toHaveLength(2)
    expect(urls).toContain('https://www.instagram.com/p/ABC123/')
    expect(urls).toContain('https://www.instagram.com/reel/XYZ789/')
  })

  it('should deduplicate URLs', () => {
    const text = `
      https://www.instagram.com/p/ABC123/
      Same again: https://www.instagram.com/p/ABC123/
    `
    expect(extractInstagramUrls(text)).toEqual(['https://www.instagram.com/p/ABC123/'])
  })

  it('should clean trailing punctuation', () => {
    const text = 'Check this (https://www.instagram.com/p/ABC123/).'
    expect(extractInstagramUrls(text)).toEqual(['https://www.instagram.com/p/ABC123/'])
  })

  it('should handle URLs ending with various punctuation', () => {
    expect(extractInstagramUrls('url: https://www.instagram.com/p/ABC/,')).toEqual([
      'https://www.instagram.com/p/ABC/',
    ])
    expect(extractInstagramUrls('url: https://www.instagram.com/p/ABC/;')).toEqual([
      'https://www.instagram.com/p/ABC/',
    ])
    expect(extractInstagramUrls("url: https://www.instagram.com/p/ABC/'")).toEqual([
      'https://www.instagram.com/p/ABC/',
    ])
  })

  it('should return empty array for text without Instagram URLs', () => {
    expect(extractInstagramUrls('Just some text')).toEqual([])
    expect(extractInstagramUrls('https://example.com')).toEqual([])
  })

  it('should ignore non-post Instagram URLs', () => {
    const text = 'Profile: https://www.instagram.com/username/ Post: https://www.instagram.com/p/ABC/'
    expect(extractInstagramUrls(text)).toEqual(['https://www.instagram.com/p/ABC/'])
  })
})
