// 일반 URL 감지 정규식 (http/https)
const URL_REGEX = /https?:\/\/[^\s<>"{}|\\^`[\]]+/gi

/**
 * 텍스트에서 URL 존재 여부 감지
 */
export function hasUrlInText(text: string): boolean {
  if (!text) return false
  return URL_REGEX.test(text)
}

/**
 * 텍스트에서 모든 URL 추출
 */
export function extractUrls(text: string): string[] {
  if (!text) return []
  const matches = text.match(URL_REGEX)
  return matches ? Array.from(new Set(matches)) : []
}
