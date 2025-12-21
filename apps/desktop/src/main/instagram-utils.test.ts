import { describe, it, expect } from 'vitest'
import {
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
} from './instagram-utils'

describe('parseInstagramUrl', () => {
  it('should parse standard post URL', () => {
    const result = parseInstagramUrl('https://www.instagram.com/p/ABC123/')
    expect(result).toEqual({
      shortcode: 'ABC123',
      postUrl: 'https://www.instagram.com/p/ABC123/',
    })
  })

  it('should parse reel URL', () => {
    const result = parseInstagramUrl('https://www.instagram.com/reel/XYZ789/')
    expect(result).toEqual({
      shortcode: 'XYZ789',
      postUrl: 'https://www.instagram.com/reel/XYZ789/',
    })
  })

  it('should normalize reels to reel', () => {
    const result = parseInstagramUrl('https://www.instagram.com/reels/ABC123/')
    expect(result).toEqual({
      shortcode: 'ABC123',
      postUrl: 'https://www.instagram.com/reel/ABC123/',
    })
  })

  it('should parse tv URL', () => {
    const result = parseInstagramUrl('https://www.instagram.com/tv/DEF456/')
    expect(result).toEqual({
      shortcode: 'DEF456',
      postUrl: 'https://www.instagram.com/tv/DEF456/',
    })
  })

  it('should parse share URL', () => {
    const result = parseInstagramUrl('https://www.instagram.com/share/p/ABC123/')
    expect(result).toEqual({
      shortcode: 'ABC123',
      postUrl: 'https://www.instagram.com/p/ABC123/',
    })
  })

  it('should parse share reel URL', () => {
    const result = parseInstagramUrl('https://www.instagram.com/share/reel/XYZ789/')
    expect(result).toEqual({
      shortcode: 'XYZ789',
      postUrl: 'https://www.instagram.com/reel/XYZ789/',
    })
  })

  it('should handle instagr.am domain', () => {
    const result = parseInstagramUrl('https://instagr.am/p/ABC123/')
    expect(result).toEqual({
      shortcode: 'ABC123',
      postUrl: 'https://www.instagram.com/p/ABC123/',
    })
  })

  it('should handle URL with query parameters', () => {
    const result = parseInstagramUrl(
      'https://www.instagram.com/p/ABC123/?igsh=xxx&utm_source=test'
    )
    expect(result).toEqual({
      shortcode: 'ABC123',
      postUrl: 'https://www.instagram.com/p/ABC123/',
    })
  })

  it('should return null for invalid domain', () => {
    expect(parseInstagramUrl('https://facebook.com/p/ABC123/')).toBeNull()
  })

  it('should return null for invalid path type', () => {
    expect(parseInstagramUrl('https://www.instagram.com/stories/ABC123/')).toBeNull()
  })

  it('should return null for user profile URL', () => {
    expect(parseInstagramUrl('https://www.instagram.com/username/')).toBeNull()
  })

  it('should return null for invalid URL', () => {
    expect(parseInstagramUrl('not-a-url')).toBeNull()
  })
})

describe('decodeInstagramShortcode', () => {
  it('should decode shortcode to media ID', () => {
    // Known shortcode -> ID mappings
    expect(decodeInstagramShortcode('B')).toBe('1')
    expect(decodeInstagramShortcode('C')).toBe('2')
    expect(decodeInstagramShortcode('BA')).toBe('64')
  })

  it('should handle complex shortcodes', () => {
    const result = decodeInstagramShortcode('DDpnPNqyQlr')
    expect(result).not.toBeNull()
    expect(typeof result).toBe('string')
    expect(Number(result)).toBeGreaterThan(0)
  })

  it('should return null for invalid characters', () => {
    expect(decodeInstagramShortcode('ABC!@#')).toBeNull()
  })
})

describe('decodeHtmlEntities', () => {
  it('should decode hex entities', () => {
    expect(decodeHtmlEntities('&#x26;')).toBe('&')
    expect(decodeHtmlEntities('&#x3C;')).toBe('<')
  })

  it('should decode decimal entities', () => {
    expect(decodeHtmlEntities('&#38;')).toBe('&')
    expect(decodeHtmlEntities('&#60;')).toBe('<')
  })

  it('should decode named entities', () => {
    expect(decodeHtmlEntities('&amp;')).toBe('&')
    expect(decodeHtmlEntities('&quot;')).toBe('"')
    expect(decodeHtmlEntities('&#39;')).toBe("'")
    expect(decodeHtmlEntities('&lt;')).toBe('<')
    expect(decodeHtmlEntities('&gt;')).toBe('>')
  })

  it('should decode mixed entities', () => {
    expect(decodeHtmlEntities('Tom &amp; Jerry &lt;3')).toBe('Tom & Jerry <3')
  })

  it('should handle emoji codes', () => {
    expect(decodeHtmlEntities('&#x1F600;')).toBe('\u{1F600}')
  })
})

describe('extractMetaContent', () => {
  it('should extract og:image', () => {
    const html = '<meta property="og:image" content="https://example.com/image.jpg">'
    expect(extractMetaContent(html, 'og:image')).toBe('https://example.com/image.jpg')
  })

  it('should extract with reversed attribute order', () => {
    const html = '<meta content="https://example.com/image.jpg" property="og:image">'
    expect(extractMetaContent(html, 'og:image')).toBe('https://example.com/image.jpg')
  })

  it('should return null when not found', () => {
    const html = '<meta property="og:title" content="Title">'
    expect(extractMetaContent(html, 'og:image')).toBeNull()
  })
})

describe('extractMetaName', () => {
  it('should extract twitter:image', () => {
    const html = '<meta name="twitter:image" content="https://example.com/image.jpg">'
    expect(extractMetaName(html, 'twitter:image')).toBe('https://example.com/image.jpg')
  })

  it('should extract description', () => {
    const html = '<meta name="description" content="This is a description">'
    expect(extractMetaName(html, 'description')).toBe('This is a description')
  })
})

describe('extractJsonLdPayloads', () => {
  it('should extract single JSON-LD object', () => {
    const html = `
      <script type="application/ld+json">{"@type": "ImageObject", "caption": "Test"}</script>
    `
    const payloads = extractJsonLdPayloads(html)
    expect(payloads).toHaveLength(1)
    expect(payloads[0]).toEqual({ '@type': 'ImageObject', caption: 'Test' })
  })

  it('should extract multiple JSON-LD objects', () => {
    const html = `
      <script type="application/ld+json">{"@type": "ImageObject"}</script>
      <script type="application/ld+json">{"@type": "Person"}</script>
    `
    const payloads = extractJsonLdPayloads(html)
    expect(payloads).toHaveLength(2)
  })

  it('should handle array in JSON-LD', () => {
    const html = `
      <script type="application/ld+json">[{"@type": "A"}, {"@type": "B"}]</script>
    `
    const payloads = extractJsonLdPayloads(html)
    expect(payloads).toHaveLength(2)
  })

  it('should skip invalid JSON', () => {
    const html = `
      <script type="application/ld+json">not valid json</script>
    `
    const payloads = extractJsonLdPayloads(html)
    expect(payloads).toHaveLength(0)
  })
})

describe('extractCaptionFromJsonLd', () => {
  it('should extract caption from ImageObject', () => {
    const payloads = [{ '@type': 'ImageObject', caption: 'Hello world' }]
    expect(extractCaptionFromJsonLd(payloads)).toBe('Hello world')
  })

  it('should extract articleBody as fallback', () => {
    const payloads = [{ '@type': 'Article', articleBody: 'Article content' }]
    expect(extractCaptionFromJsonLd(payloads)).toBe('Article content')
  })

  it('should decode HTML entities', () => {
    const payloads = [{ '@type': 'ImageObject', caption: 'Tom &amp; Jerry' }]
    expect(extractCaptionFromJsonLd(payloads)).toBe('Tom & Jerry')
  })
})

describe('extractAuthorFromJsonLd', () => {
  it('should extract author string', () => {
    const payloads = [{ author: 'username' }]
    expect(extractAuthorFromJsonLd(payloads)).toBe('username')
  })

  it('should extract author name object', () => {
    const payloads = [{ author: { name: 'username' } }]
    expect(extractAuthorFromJsonLd(payloads)).toBe('username')
  })

  it('should strip @ prefix', () => {
    const payloads = [{ author: '@username' }]
    expect(extractAuthorFromJsonLd(payloads)).toBe('username')
  })

  it('should handle author array', () => {
    const payloads = [{ author: [{ name: 'first_user' }, { name: 'second_user' }] }]
    expect(extractAuthorFromJsonLd(payloads)).toBe('first_user')
  })
})

describe('extractHandleFromText', () => {
  it('should extract @mention', () => {
    expect(extractHandleFromText('Photo by @username')).toBe('username')
  })

  it('should return valid handle directly', () => {
    expect(extractHandleFromText('username123')).toBe('username123')
  })

  it('should handle dots and underscores', () => {
    expect(extractHandleFromText('user.name_123')).toBe('user.name_123')
  })

  it('should return null for empty string', () => {
    expect(extractHandleFromText('')).toBeNull()
  })
})

describe('cleanInstagramCaption', () => {
  it('should return plain caption unchanged', () => {
    expect(cleanInstagramCaption('Hello world')).toBe('Hello world')
  })

  it('should remove likes/comments prefix', () => {
    const text = '1,234 likes, 56 comments - username: "Actual caption"'
    expect(cleanInstagramCaption(text)).toBe('Actual caption')
  })

  it('should decode HTML entities', () => {
    expect(cleanInstagramCaption('Tom &amp; Jerry')).toBe('Tom & Jerry')
  })

  it('should extract quoted caption from "on Instagram" pattern', () => {
    const text = 'username on Instagram: "My caption here"'
    expect(cleanInstagramCaption(text)).toBe('My caption here')
  })
})

describe('extractJsonAfterMarker', () => {
  it('should extract JSON after window._sharedData', () => {
    const html = 'window._sharedData = {"key": "value"};'
    const result = extractJsonAfterMarker(html, 'window._sharedData')
    expect(result).toEqual({ key: 'value' })
  })

  it('should handle nested objects', () => {
    const html = 'window._sharedData = {"a": {"b": {"c": 1}}};'
    const result = extractJsonAfterMarker(html, 'window._sharedData')
    expect(result).toEqual({ a: { b: { c: 1 } } })
  })

  it('should return null when marker not found', () => {
    const html = 'some other content'
    expect(extractJsonAfterMarker(html, 'window._sharedData')).toBeNull()
  })
})

describe('extractJsonFromScript', () => {
  it('should extract JSON from script with id', () => {
    const html = '<script id="__NEXT_DATA__">{"props": {"pageProps": {}}}</script>'
    const result = extractJsonFromScript(html, '__NEXT_DATA__')
    expect(result).toEqual({ props: { pageProps: {} } })
  })

  it('should return null when script not found', () => {
    const html = '<script id="other">{"key": "value"}</script>'
    expect(extractJsonFromScript(html, '__NEXT_DATA__')).toBeNull()
  })
})

describe('findShortcodeMedia', () => {
  it('should find media in graphql path', () => {
    const payload = {
      graphql: {
        shortcode_media: { id: '123', display_url: 'https://example.com/image.jpg' },
      },
    }
    expect(findShortcodeMedia(payload)).toEqual({
      id: '123',
      display_url: 'https://example.com/image.jpg',
    })
  })

  it('should find media in data path', () => {
    const payload = {
      data: {
        shortcode_media: { id: '456' },
      },
    }
    expect(findShortcodeMedia(payload)).toEqual({ id: '456' })
  })

  it('should find xdt_shortcode_media', () => {
    const payload = {
      data: {
        xdt_shortcode_media: { id: '789' },
      },
    }
    expect(findShortcodeMedia(payload)).toEqual({ id: '789' })
  })

  it('should find first item in items array', () => {
    const payload = {
      items: [{ id: 'first' }, { id: 'second' }],
    }
    expect(findShortcodeMedia(payload)).toEqual({ id: 'first' })
  })

  it('should return null for empty payload', () => {
    expect(findShortcodeMedia(null)).toBeNull()
    expect(findShortcodeMedia({})).toBeNull()
  })
})

describe('normalizeTypename', () => {
  it('should return __typename if present', () => {
    expect(normalizeTypename({ __typename: 'GraphImage' })).toBe('GraphImage')
    expect(normalizeTypename({ __typename: 'GraphVideo' })).toBe('GraphVideo')
  })

  it('should map media_type 2 to GraphVideo', () => {
    expect(normalizeTypename({ media_type: 2 })).toBe('GraphVideo')
  })

  it('should map media_type 8 to GraphSidecar', () => {
    expect(normalizeTypename({ media_type: 8 })).toBe('GraphSidecar')
  })

  it('should detect video by is_video flag', () => {
    expect(normalizeTypename({ is_video: true })).toBe('GraphVideo')
  })

  it('should default to GraphImage', () => {
    expect(normalizeTypename({})).toBe('GraphImage')
    expect(normalizeTypename(null)).toBe('GraphImage')
  })
})

describe('pickBestImageUrl', () => {
  it('should pick highest resolution image', () => {
    const candidates = [
      { src: 'small.jpg', width: 100, height: 100 },
      { src: 'large.jpg', width: 1000, height: 1000 },
      { src: 'medium.jpg', width: 500, height: 500 },
    ]
    expect(pickBestImageUrl(candidates)).toBe('large.jpg')
  })

  it('should use url property if src not available', () => {
    const candidates = [{ url: 'image.jpg', width: 100, height: 100 }]
    expect(pickBestImageUrl(candidates)).toBe('image.jpg')
  })

  it('should pick first candidate if no dimensions (area=0)', () => {
    const candidates = [{ src: 'first.jpg' }, { src: 'last.jpg' }]
    // When area is 0 for all, first valid URL wins
    expect(pickBestImageUrl(candidates)).toBe('first.jpg')
  })

  it('should return null for empty array', () => {
    expect(pickBestImageUrl([])).toBeNull()
    expect(pickBestImageUrl(null)).toBeNull()
  })
})

describe('pickBestVideoUrl', () => {
  it('should pick highest resolution video', () => {
    const candidates = [
      { url: 'low.mp4', width: 480, height: 360 },
      { url: 'high.mp4', width: 1920, height: 1080 },
    ]
    expect(pickBestVideoUrl(candidates)).toBe('high.mp4')
  })

  it('should return null for empty array', () => {
    expect(pickBestVideoUrl([])).toBeNull()
  })
})

describe('normalizeMediaNode', () => {
  it('should extract display_url', () => {
    const node = { display_url: 'https://example.com/image.jpg' }
    const result = normalizeMediaNode(node)
    expect(result?.displayUrl).toBe('https://example.com/image.jpg')
  })

  it('should extract video_url', () => {
    const node = {
      display_url: 'https://example.com/thumb.jpg',
      video_url: 'https://example.com/video.mp4',
    }
    const result = normalizeMediaNode(node)
    expect(result?.videoUrl).toBe('https://example.com/video.mp4')
  })

  it('should use display_resources fallback', () => {
    const node = {
      display_resources: [
        { src: 'small.jpg', width: 100, height: 100 },
        { src: 'large.jpg', width: 1000, height: 1000 },
      ],
    }
    const result = normalizeMediaNode(node)
    expect(result?.displayUrl).toBe('large.jpg')
  })

  it('should return null for empty node', () => {
    expect(normalizeMediaNode(null)).toBeNull()
    expect(normalizeMediaNode({})).toBeNull()
  })
})

describe('collectMediaItems', () => {
  it('should collect from edge_sidecar_to_children', () => {
    const media = {
      edge_sidecar_to_children: {
        edges: [
          { node: { display_url: 'image1.jpg' } },
          { node: { display_url: 'image2.jpg' } },
        ],
      },
    }
    const items = collectMediaItems(media)
    expect(items).toHaveLength(2)
    expect(items[0].displayUrl).toBe('image1.jpg')
    expect(items[1].displayUrl).toBe('image2.jpg')
  })

  it('should collect from carousel_media', () => {
    const media = {
      carousel_media: [{ display_url: 'image1.jpg' }, { display_url: 'image2.jpg' }],
    }
    const items = collectMediaItems(media)
    expect(items).toHaveLength(2)
  })

  it('should return single item for non-carousel', () => {
    const media = { display_url: 'single.jpg' }
    const items = collectMediaItems(media)
    expect(items).toHaveLength(1)
    expect(items[0].displayUrl).toBe('single.jpg')
  })

  it('should return empty array for null', () => {
    expect(collectMediaItems(null)).toEqual([])
  })
})

describe('extractCaption', () => {
  it('should extract from edge_media_to_caption', () => {
    const media = {
      edge_media_to_caption: {
        edges: [{ node: { text: 'Caption text' } }],
      },
    }
    expect(extractCaption(media)).toBe('Caption text')
  })

  it('should extract from caption string', () => {
    const media = { caption: 'Direct caption' }
    expect(extractCaption(media)).toBe('Direct caption')
  })

  it('should extract from caption object', () => {
    const media = { caption: { text: 'Caption from object' } }
    expect(extractCaption(media)).toBe('Caption from object')
  })

  it('should decode HTML entities', () => {
    const media = { caption: 'Tom &amp; Jerry' }
    expect(extractCaption(media)).toBe('Tom & Jerry')
  })

  it('should return empty string for null', () => {
    expect(extractCaption(null)).toBe('')
  })
})
