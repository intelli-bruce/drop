/**
 * Google Books API 유틸리티
 *
 * API 문서: https://developers.google.com/books/docs/v1/using
 * 일일 호출 한도: 1,000회 (API 키 없이), 더 높은 한도는 API 키 필요
 */

import { net } from 'electron'
import type {
  GoogleBooksSearchResponse,
  GoogleBookItem,
  BookSearchResult,
} from '@drop/shared'

const GOOGLE_BOOKS_API_URL = 'https://www.googleapis.com/books/v1/volumes'

/**
 * 환경변수에서 Google API 키 가져오기 (선택적)
 */
function getGoogleApiKey(): string | null {
  const key = process.env.GOOGLE_BOOKS_API_KEY
  if (!key) {
    console.warn('[Google Books] GOOGLE_BOOKS_API_KEY가 설정되지 않았습니다. 낮은 쿼터로 동작합니다.')
    return null
  }
  return key
}

/**
 * Google Books API 요청
 */
async function fetchGoogleApi<T>(url: string): Promise<T | null> {
  return new Promise((resolve) => {
    const request = net.request({
      url,
      method: 'GET',
    })

    let data = ''

    request.on('response', (response) => {
      if (response.statusCode !== 200) {
        console.error(`[Google Books] HTTP Error: ${response.statusCode}`)
        resolve(null)
        return
      }

      response.on('data', (chunk) => {
        data += chunk.toString()
      })

      response.on('end', () => {
        try {
          const parsed = JSON.parse(data) as T
          resolve(parsed)
        } catch (e) {
          console.error('[Google Books] JSON 파싱 실패:', e)
          resolve(null)
        }
      })

      response.on('error', (error) => {
        console.error('[Google Books] Response error:', error)
        resolve(null)
      })
    })

    request.on('error', (error) => {
      console.error('[Google Books] Request error:', error)
      resolve(null)
    })

    request.end()
  })
}

/**
 * Google Books ISBN 추출
 */
function extractGoogleIsbn(
  identifiers?: { type: string; identifier: string }[]
): { isbn10?: string; isbn13?: string } {
  if (!identifiers) return {}

  let isbn10: string | undefined
  let isbn13: string | undefined

  for (const id of identifiers) {
    if (id.type === 'ISBN_13') {
      isbn13 = id.identifier
    } else if (id.type === 'ISBN_10') {
      isbn10 = id.identifier
    }
  }

  return { isbn10, isbn13 }
}

/**
 * 이미지 URL에서 HTTPS 및 고해상도 버전 가져오기
 */
function getBestImageUrl(imageLinks?: GoogleBookItem['volumeInfo']['imageLinks']): {
  thumbnail?: string
  cover?: string
} {
  if (!imageLinks) return {}

  // 가능한 가장 큰 이미지 선택
  const cover =
    imageLinks.large ||
    imageLinks.medium ||
    imageLinks.small ||
    imageLinks.thumbnail ||
    imageLinks.smallThumbnail

  const thumbnail = imageLinks.thumbnail || imageLinks.smallThumbnail

  // HTTP를 HTTPS로 변환
  const toHttps = (url?: string) => url?.replace(/^http:/, 'https:')

  return {
    thumbnail: toHttps(thumbnail),
    cover: toHttps(cover),
  }
}

/**
 * Google Books 검색 결과를 통합 형식으로 변환
 */
function mapGoogleItemToSearchResult(item: GoogleBookItem): BookSearchResult | null {
  const { volumeInfo, saleInfo } = item
  const { isbn10, isbn13 } = extractGoogleIsbn(volumeInfo.industryIdentifiers)

  // ISBN13이 없으면 스킵
  if (!isbn13) return null

  const images = getBestImageUrl(volumeInfo.imageLinks)

  return {
    isbn13,
    isbn10,
    title: volumeInfo.title + (volumeInfo.subtitle ? `: ${volumeInfo.subtitle}` : ''),
    author: volumeInfo.authors?.join(', ') || 'Unknown',
    publisher: volumeInfo.publisher || 'Unknown',
    pubDate: volumeInfo.publishedDate, // YYYY 또는 YYYY-MM-DD
    description: volumeInfo.description,
    thumbnail: images.thumbnail,
    cover: images.cover,
    source: 'google',
    sourceId: item.id,
    link: volumeInfo.infoLink || volumeInfo.canonicalVolumeLink,
    category: volumeInfo.categories?.join(', '),
    // Google Books 가격 정보 (해당 지역 기준)
    priceStandard: saleInfo?.listPrice?.amount,
    priceSales: saleInfo?.retailPrice?.amount,
  }
}

/**
 * Google Books 검색
 *
 * @param query 검색어
 * @param startIndex 시작 인덱스 (0부터 시작)
 * @param maxResults 결과 수 (기본 20, 최대 40)
 * @param langRestrict 언어 제한 (예: 'ko', 'en')
 */
export async function searchGoogleBooks(
  query: string,
  startIndex = 0,
  maxResults = 20,
  langRestrict?: string
): Promise<BookSearchResult[]> {
  const params = new URLSearchParams({
    q: query,
    startIndex: String(startIndex),
    maxResults: String(Math.min(maxResults, 40)),
    printType: 'books',
    orderBy: 'relevance',
  })

  // 언어 제한 추가
  if (langRestrict) {
    params.set('langRestrict', langRestrict)
  }

  // API 키가 있으면 추가
  const apiKey = getGoogleApiKey()
  if (apiKey) {
    params.set('key', apiKey)
  }

  const url = `${GOOGLE_BOOKS_API_URL}?${params.toString()}`
  console.log('[Google Books] 검색 요청:', query)

  const response = await fetchGoogleApi<GoogleBooksSearchResponse>(url)

  if (!response || !response.items) {
    console.log('[Google Books] 검색 결과 없음')
    return []
  }

  console.log(`[Google Books] 검색 결과: ${response.totalItems}건 (반환: ${response.items.length}건)`)

  return response.items
    .map(mapGoogleItemToSearchResult)
    .filter((item): item is BookSearchResult => item !== null)
}

/**
 * ISBN으로 Google Books 검색
 */
export async function searchGoogleBooksByIsbn(isbn: string): Promise<BookSearchResult | null> {
  const results = await searchGoogleBooks(`isbn:${isbn}`, 0, 1)
  return results[0] || null
}

/**
 * Google Books API 사용 가능 여부 (항상 true, API 키 없이도 동작)
 */
export function isGoogleBooksApiAvailable(): boolean {
  return true
}
