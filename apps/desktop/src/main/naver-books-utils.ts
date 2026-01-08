/**
 * 네이버 책 검색 API 유틸리티
 *
 * API 문서: https://developers.naver.com/docs/serviceapi/search/book/book.md
 * 일일 호출 한도: 25,000회
 */

import { net } from 'electron'
import type {
  NaverBookSearchResponse,
  NaverBookItem,
  BookSearchResult,
} from '@drop/shared'

const NAVER_API_URL = 'https://openapi.naver.com/v1/search/book.json'

/**
 * 환경변수에서 네이버 API 키 가져오기
 */
function getNaverCredentials(): { clientId: string; clientSecret: string } | null {
  const clientId = process.env.NAVER_CLIENT_ID
  const clientSecret = process.env.NAVER_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    console.warn('[Naver] NAVER_CLIENT_ID 또는 NAVER_CLIENT_SECRET이 설정되지 않았습니다.')
    return null
  }

  return { clientId, clientSecret }
}

/**
 * 네이버 API 요청
 */
async function fetchNaverApi<T>(url: string): Promise<T | null> {
  const credentials = getNaverCredentials()
  if (!credentials) return null

  return new Promise((resolve) => {
    const request = net.request({
      url,
      method: 'GET',
    })

    request.setHeader('X-Naver-Client-Id', credentials.clientId)
    request.setHeader('X-Naver-Client-Secret', credentials.clientSecret)

    let data = ''

    request.on('response', (response) => {
      if (response.statusCode !== 200) {
        console.error(`[Naver] HTTP Error: ${response.statusCode}`)
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
          console.error('[Naver] JSON 파싱 실패:', e)
          resolve(null)
        }
      })

      response.on('error', (error) => {
        console.error('[Naver] Response error:', error)
        resolve(null)
      })
    })

    request.on('error', (error) => {
      console.error('[Naver] Request error:', error)
      resolve(null)
    })

    request.end()
  })
}

/**
 * HTML 엔티티 디코딩
 */
function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/<b>/g, '')
    .replace(/<\/b>/g, '')
}

/**
 * 네이버 ISBN 문자열 파싱
 * 형식: "ISBN10 ISBN13" 또는 "ISBN13"
 */
function parseNaverIsbn(isbn: string): { isbn10?: string; isbn13?: string } {
  const parts = isbn.trim().split(' ')

  if (parts.length === 2) {
    // "ISBN10 ISBN13" 형식
    return {
      isbn10: parts[0].length === 10 ? parts[0] : parts[1],
      isbn13: parts[0].length === 13 ? parts[0] : parts[1],
    }
  } else if (parts.length === 1) {
    const single = parts[0]
    if (single.length === 13) {
      return { isbn13: single }
    } else if (single.length === 10) {
      return { isbn10: single }
    }
  }

  return {}
}

/**
 * 출판일 변환 (YYYYMMDD -> YYYY-MM-DD)
 */
function formatPubDate(pubdate: string): string | undefined {
  if (!pubdate || pubdate.length !== 8) return undefined

  const year = pubdate.substring(0, 4)
  const month = pubdate.substring(4, 6)
  const day = pubdate.substring(6, 8)

  return `${year}-${month}-${day}`
}

/**
 * 네이버 책 검색 결과를 통합 형식으로 변환
 */
function mapNaverItemToSearchResult(item: NaverBookItem): BookSearchResult | null {
  const { isbn10, isbn13 } = parseNaverIsbn(item.isbn)

  // ISBN13이 없으면 스킵 (통합 검색에서 중복 제거 기준)
  if (!isbn13) return null

  return {
    isbn13,
    isbn10,
    title: decodeHtmlEntities(item.title),
    author: decodeHtmlEntities(item.author),
    publisher: decodeHtmlEntities(item.publisher),
    pubDate: formatPubDate(item.pubdate),
    description: decodeHtmlEntities(item.description),
    thumbnail: item.image,
    cover: item.image,
    source: 'naver',
    link: item.link,
    priceSales: item.discount ? parseInt(item.discount, 10) : undefined,
  }
}

/**
 * 네이버 책 검색
 *
 * @param query 검색어
 * @param start 시작 위치 (1부터 시작, 기본 1)
 * @param display 한 번에 표시할 결과 수 (기본 20, 최대 100)
 */
export async function searchNaverBooks(
  query: string,
  start = 1,
  display = 20
): Promise<BookSearchResult[]> {
  const credentials = getNaverCredentials()
  if (!credentials) {
    console.log('[Naver] API 키가 없어 검색을 건너뜁니다.')
    return []
  }

  const params = new URLSearchParams({
    query,
    start: String(start),
    display: String(Math.min(display, 100)),
    sort: 'sim', // 정확도순
  })

  const url = `${NAVER_API_URL}?${params.toString()}`
  console.log('[Naver] 검색 요청:', query)

  const response = await fetchNaverApi<NaverBookSearchResponse>(url)

  if (!response || !response.items) {
    console.log('[Naver] 검색 결과 없음')
    return []
  }

  console.log(`[Naver] 검색 결과: ${response.total}건 (반환: ${response.items.length}건)`)

  return response.items
    .map(mapNaverItemToSearchResult)
    .filter((item): item is BookSearchResult => item !== null)
}

/**
 * 네이버 API 사용 가능 여부 확인
 */
export function isNaverApiAvailable(): boolean {
  return getNaverCredentials() !== null
}
