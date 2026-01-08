/**
 * 통합 책 검색 서비스
 *
 * 여러 API를 병렬로 호출하고 결과를 병합합니다.
 * - 알라딘: 국내 도서 메인
 * - 네이버: 국내 도서 보완
 * - 카카오: 국내 도서 보완
 * - Google Books: 해외 도서
 */

import type { BookSearchResult, BookSearchResponse, BookSearchSource } from '@drop/shared'

import { searchBooks as searchAladinBooks } from './aladin-utils'
import { searchNaverBooks, isNaverApiAvailable } from './naver-books-utils'
import { searchKakaoBooks, isKakaoApiAvailable } from './kakao-books-utils'
import { searchGoogleBooks } from './google-books-utils'

// 알라딘 결과를 BookSearchResult로 변환
import type { AladinSearchResult } from '@drop/shared'

function mapAladinToSearchResult(item: AladinSearchResult): BookSearchResult {
  return {
    isbn13: item.isbn13,
    isbn10: item.isbn,
    title: item.title,
    author: item.author,
    publisher: item.publisher,
    pubDate: item.pubDate,
    description: item.description,
    thumbnail: item.cover,
    cover: item.cover,
    source: 'aladin',
    sourceId: String(item.itemId),
    link: item.link,
    priceStandard: item.priceStandard,
    priceSales: item.priceSales,
    category: item.categoryName,
  }
}

/**
 * ISBN 정규화 (하이픈 제거, 공백 제거)
 */
function normalizeIsbn(isbn: string): string {
  return isbn.replace(/[-\s]/g, '')
}

/**
 * 검색어가 ISBN인지 확인
 */
function isIsbnQuery(query: string): boolean {
  const normalized = normalizeIsbn(query)
  // ISBN-10 또는 ISBN-13
  return /^\d{10}$/.test(normalized) || /^\d{13}$/.test(normalized)
}

/**
 * 중복 제거 및 결과 병합
 * ISBN13을 기준으로 중복 제거, 우선순위: aladin > naver > kakao > google
 */
function mergeResults(allResults: BookSearchResult[]): BookSearchResult[] {
  const seen = new Map<string, BookSearchResult>()
  const priorityOrder: BookSearchSource[] = ['aladin', 'naver', 'kakao', 'google']

  for (const result of allResults) {
    const isbn = normalizeIsbn(result.isbn13)
    const existing = seen.get(isbn)

    if (!existing) {
      seen.set(isbn, result)
    } else {
      // 우선순위 비교: 더 높은 우선순위면 교체
      const existingPriority = priorityOrder.indexOf(existing.source)
      const newPriority = priorityOrder.indexOf(result.source)

      if (newPriority < existingPriority) {
        // 기존 데이터에서 누락된 필드만 보완
        const merged: BookSearchResult = {
          ...result,
          description: result.description || existing.description,
          thumbnail: result.thumbnail || existing.thumbnail,
          cover: result.cover || existing.cover,
        }
        seen.set(isbn, merged)
      } else {
        // 기존 데이터에 누락된 필드 보완
        if (!existing.description && result.description) {
          existing.description = result.description
        }
        if (!existing.thumbnail && result.thumbnail) {
          existing.thumbnail = result.thumbnail
        }
        if (!existing.cover && result.cover) {
          existing.cover = result.cover
        }
      }
    }
  }

  return Array.from(seen.values())
}

export interface SearchOptions {
  /** 사용할 API 소스 (기본: 모두) */
  sources?: BookSearchSource[]
  /** 결과 수 제한 (기본: 30) */
  limit?: number
  /** 페이지 번호 (기본: 1) */
  page?: number
  /** 한국어 검색 최적화 (기본: true) */
  preferKorean?: boolean
}

/**
 * 통합 책 검색
 *
 * @param query 검색어 (제목, 저자, ISBN)
 * @param options 검색 옵션
 */
export async function searchBooksUnified(
  query: string,
  options: SearchOptions = {}
): Promise<BookSearchResponse> {
  const {
    sources = ['aladin', 'naver', 'kakao', 'google'],
    limit = 30,
    page = 1,
    preferKorean = true,
  } = options

  const trimmedQuery = query.trim()
  if (!trimmedQuery) {
    return { results: [], sources: [], totalCount: 0 }
  }

  const isIsbn = isIsbnQuery(trimmedQuery)
  const sourceResults: { source: BookSearchSource; count: number; error?: string }[] = []
  const allResults: BookSearchResult[] = []

  // 병렬로 API 호출
  const searchPromises: Promise<void>[] = []

  // 알라딘 검색
  if (sources.includes('aladin')) {
    searchPromises.push(
      (async () => {
        try {
          const results = await searchAladinBooks(trimmedQuery, page, limit)
          const mapped = results.map(mapAladinToSearchResult)
          allResults.push(...mapped)
          sourceResults.push({ source: 'aladin', count: mapped.length })
        } catch (e) {
          console.error('[BookSearch] 알라딘 검색 실패:', e)
          sourceResults.push({
            source: 'aladin',
            count: 0,
            error: e instanceof Error ? e.message : 'Unknown error',
          })
        }
      })()
    )
  }

  // 네이버 검색
  if (sources.includes('naver') && isNaverApiAvailable()) {
    searchPromises.push(
      (async () => {
        try {
          const start = (page - 1) * limit + 1
          const results = await searchNaverBooks(trimmedQuery, start, limit)
          allResults.push(...results)
          sourceResults.push({ source: 'naver', count: results.length })
        } catch (e) {
          console.error('[BookSearch] 네이버 검색 실패:', e)
          sourceResults.push({
            source: 'naver',
            count: 0,
            error: e instanceof Error ? e.message : 'Unknown error',
          })
        }
      })()
    )
  }

  // 카카오 검색
  if (sources.includes('kakao') && isKakaoApiAvailable()) {
    searchPromises.push(
      (async () => {
        try {
          const results = await searchKakaoBooks(trimmedQuery, page, limit)
          allResults.push(...results)
          sourceResults.push({ source: 'kakao', count: results.length })
        } catch (e) {
          console.error('[BookSearch] 카카오 검색 실패:', e)
          sourceResults.push({
            source: 'kakao',
            count: 0,
            error: e instanceof Error ? e.message : 'Unknown error',
          })
        }
      })()
    )
  }

  // Google Books 검색 (해외 도서 또는 ISBN 검색)
  if (sources.includes('google')) {
    searchPromises.push(
      (async () => {
        try {
          // ISBN 검색이거나 한국어 선호가 아닐 때만 Google 검색
          // 한국어 선호 + 일반 검색이면 Google은 보조로만 사용
          const shouldSearch = isIsbn || !preferKorean

          if (shouldSearch) {
            const startIndex = (page - 1) * limit
            const results = await searchGoogleBooks(trimmedQuery, startIndex, limit)
            allResults.push(...results)
            sourceResults.push({ source: 'google', count: results.length })
          } else {
            // 한국어 검색 시에도 국내 API에서 결과가 적으면 Google 검색
            // 다른 검색 완료 후 판단 (아래에서 처리)
            sourceResults.push({ source: 'google', count: 0 })
          }
        } catch (e) {
          console.error('[BookSearch] Google Books 검색 실패:', e)
          sourceResults.push({
            source: 'google',
            count: 0,
            error: e instanceof Error ? e.message : 'Unknown error',
          })
        }
      })()
    )
  }

  // 모든 검색 완료 대기
  await Promise.all(searchPromises)

  // 한국어 선호 + 일반 검색에서 결과가 적으면 Google 추가 검색
  if (preferKorean && !isIsbn && sources.includes('google')) {
    const koResults = allResults.filter((r) => r.source !== 'google')
    if (koResults.length < 5) {
      try {
        const startIndex = (page - 1) * limit
        const googleResults = await searchGoogleBooks(trimmedQuery, startIndex, limit)
        allResults.push(...googleResults)

        // Google 소스 결과 업데이트
        const googleSource = sourceResults.find((s) => s.source === 'google')
        if (googleSource) {
          googleSource.count = googleResults.length
        }
      } catch (e) {
        console.error('[BookSearch] Google Books 추가 검색 실패:', e)
      }
    }
  }

  // 중복 제거 및 병합
  const mergedResults = mergeResults(allResults)

  // 결과 수 제한
  const limitedResults = mergedResults.slice(0, limit)

  console.log(`[BookSearch] 통합 검색 완료: ${limitedResults.length}건 (중복 제거 전: ${allResults.length}건)`)

  return {
    results: limitedResults,
    sources: sourceResults,
    totalCount: mergedResults.length,
  }
}

/**
 * 사용 가능한 API 소스 목록
 */
export function getAvailableSources(): BookSearchSource[] {
  const sources: BookSearchSource[] = ['aladin'] // 알라딘은 항상 기본

  if (isNaverApiAvailable()) {
    sources.push('naver')
  }

  if (isKakaoApiAvailable()) {
    sources.push('kakao')
  }

  sources.push('google') // Google은 API 키 없이도 동작

  return sources
}
