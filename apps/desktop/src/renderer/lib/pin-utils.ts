/**
 * PIN을 SHA256으로 해시
 * Web Crypto API 사용 (브라우저/Electron 호환)
 */
export async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(pin)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

/**
 * PIN 유효성 검사 (4-6자리 숫자)
 */
export function isValidPin(pin: string): boolean {
  return /^\d{4,6}$/.test(pin)
}
