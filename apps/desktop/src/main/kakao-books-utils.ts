/**
 * 카카오 책 검색 API 유틸리티
 *
 * API 문서: https://developers.kakao.com/docs/latest/ko/daum-search/dev-guide#search-book
 * 일일 호출 한도: 무제한 (초당 10회 제한)
 */

import { net } from 'electron'
import type {
  KakaoBookSearchResponse,
  KakaoBookItem,
  BookSearchResult,
} from '@drop/shared'

const KAKAO_API_URL = 'https://dapi.kakao.com/v3/search/book'

/**
 * 환경변수에서 카카오 API 키 가져오기
 */
function getKakaoApiKey(): string | null {
  const key = process.env.KAKAO_REST_API_KEY
  if (!key) {
    console.warn('[Kakao] KAKAO_REST_API_KEY 환경변수가 설정되지 않았습니다.')
    return null
  }
  return key
}

/**
 * 카카오 API 요청
 */
async function fetchKakaoApi<T>(url: string): Promise<T | null> {
  const apiKey = getKakaoApiKey()
  if (!apiKey) return null

  return new Promise((resolve) => {
    const request = net.request({
      url,
      method: 'GET',
    })

    request.setHeader('Authorization', `KakaoAK ${apiKey}`)

    let data = ''

    request.on('response', (response) => {
      if (response.statusCode !== 200) {
        console.error(`[Kakao] HTTP Error: ${response.statusCode}`)
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
          console.error('[Kakao] JSON 파싱 실패:', e)
          resolve(null)
        }
      })

      response.on('error', (error) => {
        console.error('[Kakao] Response error:', error)
        resolve(null)
      })
    })

    request.on('error', (error) => {
      console.error('[Kakao] Request error:', error)
      resolve(null)
    })

    request.end()
  })
}

/**
 * 카카오 ISBN 문자열 파싱
 * 형식: "ISBN10 ISBN13" 또는 "ISBN13"
 */
function parseKakaoIsbn(isbn: string): { isbn10?: string; isbn13?: string } {
  const parts = isbn.trim().split(' ')

  if (parts.length === 2) {
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
 * ISO 8601 날짜를 YYYY-MM-DD로 변환
 */
function formatDatetime(datetime: string): string | undefined {
  if (!datetime) return undefined

  try {
    const date = new Date(datetime)
    return date.toISOString().split('T')[0]
  } catch {
    return undefined
  }
}

/**
 * 카카오 책 검색 결과를 통합 형식으로 변환
 */
function mapKakaoItemToSearchResult(item: KakaoBookItem): BookSearchResult | null {
  const { isbn10, isbn13 } = parseKakaoIsbn(item.isbn)

  // ISBN13이 없으면 스킵
  if (!isbn13) return null

  return {
    isbn13,
    isbn10,
    title: item.title,
    author: item.authors.join(', '),
    publisher: item.publisher,
    pubDate: formatDatetime(item.datetime),
    description: item.contents,
    thumbnail: item.thumbnail,
    cover: item.thumbnail,
    source: 'kakao',
    link: item.url,
    priceStandard: item.price > 0 ? item.price : undefined,
    priceSales: item.sale_price > 0 ? item.sale_price : undefined,
  }
}

/**
 * 카카오 책 검색
 *
 * @param query 검색어
 * @param page 페이지 번호 (1부터 시작, 기본 1)
 * @param size 한 번에 표시할 결과 수 (기본 20, 최대 50)
 */
export async function searchKakaoBooks(
  query: string,
  page = 1,
  size = 20
): Promise<BookSearchResult[]> {
  const apiKey = getKakaoApiKey()
  if (!apiKey) {
    console.log('[Kakao] API 키가 없어 검색을 건너뜁니다.')
    return []
  }

  const params = new URLSearchParams({
    query,
    page: String(page),
    size: String(Math.min(size, 50)),
    sort: 'accuracy', // 정확도순
  })

  const url = `${KAKAO_API_URL}?${params.toString()}`
  console.log('[Kakao] 검색 요청:', query)

  const response = await fetchKakaoApi<KakaoBookSearchResponse>(url)

  if (!response || !response.documents) {
    console.log('[Kakao] 검색 결과 없음')
    return []
  }

  console.log(`[Kakao] 검색 결과: ${response.meta.total_count}건 (반환: ${response.documents.length}건)`)

  return response.documents
    .map(mapKakaoItemToSearchResult)
    .filter((item): item is BookSearchResult => item !== null)
}

/**
 * 카카오 API 사용 가능 여부 확인
 */
export function isKakaoApiAvailable(): boolean {
  return getKakaoApiKey() !== null
}
