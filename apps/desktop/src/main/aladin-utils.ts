/**
 * 알라딘 Open API 유틸리티
 *
 * API 문서: https://docs.google.com/document/d/1mX-WxuoGs8Hy-QalhHcvuV17n50uGI2Sg_GHofgiePE
 * TTBKey 발급: https://www.aladin.co.kr/ttb/wblog_manage.aspx
 */

import { net } from 'electron'
import type { AladinSearchResult, AladinBookDetail } from '@drop/shared'

// 알라딘 API 엔드포인트
const ALADIN_API_BASE = 'http://www.aladin.co.kr/ttb/api'
const ALADIN_SEARCH_URL = `${ALADIN_API_BASE}/ItemSearch.aspx`
const ALADIN_LOOKUP_URL = `${ALADIN_API_BASE}/ItemLookUp.aspx`

// API 버전 (최신: 20131101)
const API_VERSION = '20131101'

// 캐시 설정
const BOOK_CACHE_TTL = 60 * 60 * 1000 // 1시간
const bookCache = new Map<string, { data: AladinBookDetail; timestamp: number }>()

// 환경변수에서 TTBKey 가져오기
function getTTBKey(): string {
  const key = process.env.ALADIN_TTB_KEY
  if (!key) {
    console.warn('[Aladin] ALADIN_TTB_KEY 환경변수가 설정되지 않았습니다.')
    return ''
  }
  return key
}

/**
 * 알라딘 URL에서 ItemId 추출
 */
export function parseAladinUrl(inputUrl: string): { itemId: string } | null {
  try {
    const url = new URL(inputUrl)
    const hostname = url.hostname.replace(/^www\./, '')

    if (hostname !== 'aladin.co.kr') return null

    // /shop/wproduct.aspx?ItemId=123456 형식
    if (url.pathname.includes('/shop/wproduct.aspx')) {
      const itemId = url.searchParams.get('ItemId')
      if (itemId) {
        return { itemId }
      }
    }

    return null
  } catch {
    return null
  }
}

/**
 * Electron net을 사용한 HTTP GET 요청
 */
async function fetchJson<T>(url: string): Promise<T | null> {
  return new Promise((resolve) => {
    const request = net.request({
      url,
      method: 'GET',
    })

    let data = ''

    request.on('response', (response) => {
      if (response.statusCode !== 200) {
        console.error(`[Aladin] HTTP Error: ${response.statusCode}`)
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
          console.error('[Aladin] JSON 파싱 실패:', e)
          resolve(null)
        }
      })

      response.on('error', (error) => {
        console.error('[Aladin] Response error:', error)
        resolve(null)
      })
    })

    request.on('error', (error) => {
      console.error('[Aladin] Request error:', error)
      resolve(null)
    })

    request.end()
  })
}

/**
 * 이미지 다운로드 (Buffer 반환)
 */
export async function downloadCover(coverUrl: string): Promise<Buffer | null> {
  return new Promise((resolve) => {
    // HTTPS로 변환
    const url = coverUrl.replace(/^http:/, 'https:')

    const request = net.request({
      url,
      method: 'GET',
    })

    const chunks: Buffer[] = []

    request.on('response', (response) => {
      if (response.statusCode !== 200) {
        console.error(`[Aladin] Cover download error: ${response.statusCode}`)
        resolve(null)
        return
      }

      response.on('data', (chunk) => {
        chunks.push(chunk)
      })

      response.on('end', () => {
        resolve(Buffer.concat(chunks))
      })

      response.on('error', (error) => {
        console.error('[Aladin] Cover download error:', error)
        resolve(null)
      })
    })

    request.on('error', (error) => {
      console.error('[Aladin] Cover request error:', error)
      resolve(null)
    })

    request.end()
  })
}

// 알라딘 API 응답 타입 (내부용)
interface AladinApiResponse {
  version: string
  title: string
  link: string
  pubDate: string
  totalResults: number
  startIndex: number
  itemsPerPage: number
  query?: string
  searchCategoryId?: number
  searchCategoryName?: string
  item: AladinApiItem[]
}

interface AladinApiItem {
  itemId: number
  title: string
  author: string
  publisher: string
  pubDate: string
  description: string
  isbn: string
  isbn13: string
  cover: string
  priceStandard: number
  priceSales: number
  mallType: string
  link: string
  adult?: boolean
  stockStatus?: string
  categoryId?: number
  categoryName?: string
  customerReviewRank?: number
  bestRank?: number
  bestDuration?: string
  seriesInfo?: {
    seriesId: number
    seriesName: string
    seriesLink: string
  }
  subInfo?: {
    itemPage?: number
    subTitle?: string
    originalTitle?: string
    packing?: {
      styleDesc?: string
      weight?: number
      sizeDepth?: number
      sizeHeight?: number
      sizeWidth?: number
    }
    toc?: string
    fulldescription?: string // API 응답에서는 소문자
  }
}

/**
 * API 응답 아이템을 AladinSearchResult로 변환
 */
function mapApiItemToSearchResult(item: AladinApiItem): AladinSearchResult {
  return {
    itemId: item.itemId,
    title: item.title,
    author: item.author,
    publisher: item.publisher,
    pubDate: item.pubDate,
    description: item.description,
    isbn: item.isbn,
    isbn13: item.isbn13,
    cover: item.cover,
    priceStandard: item.priceStandard,
    priceSales: item.priceSales,
    mallType: item.mallType,
    link: item.link,
    adult: item.adult,
    stockStatus: item.stockStatus,
    categoryId: item.categoryId,
    categoryName: item.categoryName,
  }
}

/**
 * API 응답 아이템을 AladinBookDetail로 변환
 */
function mapApiItemToBookDetail(item: AladinApiItem): AladinBookDetail {
  return {
    ...mapApiItemToSearchResult(item),
    customerReviewRank: item.customerReviewRank,
    bestRank: item.bestRank,
    bestDuration: item.bestDuration,
    seriesInfo: item.seriesInfo,
    toc: item.subInfo?.toc,
    fullDescription: item.subInfo?.fulldescription,
    packing: item.subInfo?.packing,
    subInfo: item.subInfo
      ? {
          itemPage: item.subInfo.itemPage,
          subTitle: item.subInfo.subTitle,
          originalTitle: item.subInfo.originalTitle,
        }
      : undefined,
  }
}

/**
 * 책 검색 (ItemSearch API)
 *
 * @param query 검색어 (제목, 저자, ISBN 등)
 * @param page 페이지 번호 (1부터 시작)
 * @param maxResults 페이지당 결과 수 (기본 10, 최대 50)
 */
export async function searchBooks(
  query: string,
  page = 1,
  maxResults = 20
): Promise<AladinSearchResult[]> {
  const ttbKey = getTTBKey()
  if (!ttbKey) {
    console.error('[Aladin] TTBKey가 없어 검색을 수행할 수 없습니다.')
    return []
  }

  const params = new URLSearchParams({
    ttbkey: ttbKey,
    Query: query,
    QueryType: 'Keyword', // 제목+저자 검색
    SearchTarget: 'Book', // 도서만
    start: String(page),
    MaxResults: String(Math.min(maxResults, 50)),
    Sort: 'Accuracy', // 관련도순
    Cover: 'Big', // 큰 표지 (200px)
    output: 'js', // JSON 형식
    Version: API_VERSION,
    outofStockfilter: '1', // 품절 제외
  })

  const url = `${ALADIN_SEARCH_URL}?${params.toString()}`
  console.log('[Aladin] 검색 요청:', query)

  const response = await fetchJson<AladinApiResponse>(url)

  if (!response || !response.item) {
    console.log('[Aladin] 검색 결과 없음')
    return []
  }

  console.log(`[Aladin] 검색 결과: ${response.totalResults}건`)
  return response.item.map(mapApiItemToSearchResult)
}

/**
 * ISBN으로 책 상세 정보 조회 (ItemLookUp API)
 *
 * @param isbn13 13자리 ISBN
 */
export async function getBookByIsbn(isbn13: string): Promise<AladinBookDetail | null> {
  // 캐시 확인
  const cached = bookCache.get(isbn13)
  if (cached && Date.now() - cached.timestamp < BOOK_CACHE_TTL) {
    console.log('[Aladin] 캐시 히트:', isbn13)
    return cached.data
  }

  const ttbKey = getTTBKey()
  if (!ttbKey) {
    console.error('[Aladin] TTBKey가 없어 조회를 수행할 수 없습니다.')
    return null
  }

  const params = new URLSearchParams({
    ttbkey: ttbKey,
    ItemId: isbn13,
    ItemIdType: 'ISBN13',
    Cover: 'Big',
    output: 'js',
    Version: API_VERSION,
    // 부가정보 요청 (기본형에서 사용 가능한 것만)
    OptResult: 'ratingInfo,packing',
  })

  const url = `${ALADIN_LOOKUP_URL}?${params.toString()}`
  console.log('[Aladin] 상세 조회:', isbn13)

  const response = await fetchJson<AladinApiResponse>(url)

  if (!response || !response.item || response.item.length === 0) {
    console.log('[Aladin] 조회 결과 없음:', isbn13)
    return null
  }

  const bookDetail = mapApiItemToBookDetail(response.item[0])

  // 캐시 저장
  bookCache.set(isbn13, {
    data: bookDetail,
    timestamp: Date.now(),
  })

  return bookDetail
}

/**
 * ItemId로 책 상세 정보 조회
 *
 * @param itemId 알라딘 상품 ID
 */
export async function getBookByItemId(itemId: string): Promise<AladinBookDetail | null> {
  const ttbKey = getTTBKey()
  if (!ttbKey) {
    console.error('[Aladin] TTBKey가 없어 조회를 수행할 수 없습니다.')
    return null
  }

  const params = new URLSearchParams({
    ttbkey: ttbKey,
    ItemId: itemId,
    ItemIdType: 'ItemId',
    Cover: 'Big',
    output: 'js',
    Version: API_VERSION,
    OptResult: 'ratingInfo,packing',
  })

  const url = `${ALADIN_LOOKUP_URL}?${params.toString()}`
  console.log('[Aladin] ItemId 조회:', itemId)

  const response = await fetchJson<AladinApiResponse>(url)

  if (!response || !response.item || response.item.length === 0) {
    console.log('[Aladin] 조회 결과 없음:', itemId)
    return null
  }

  const bookDetail = mapApiItemToBookDetail(response.item[0])

  // ISBN13으로 캐시 저장
  if (bookDetail.isbn13) {
    bookCache.set(bookDetail.isbn13, {
      data: bookDetail,
      timestamp: Date.now(),
    })
  }

  return bookDetail
}

/**
 * 캐시 클리어
 */
export function clearBookCache(): void {
  bookCache.clear()
  console.log('[Aladin] 캐시 클리어됨')
}
