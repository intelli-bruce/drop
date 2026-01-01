import { createClient, SupabaseClient, User } from '@supabase/supabase-js'

// DROP Supabase 프로젝트 설정 (고정)
const SUPABASE_URL = 'https://REDACTED_SUPABASE_HOST'
const SUPABASE_ANON_KEY = 'REDACTED_SUPABASE_KEY'

// 사용자 인증 토큰 (환경변수 필수)
const REFRESH_TOKEN = process.env.DROP_TOKEN

let supabaseInstance: SupabaseClient | null = null
let currentUser: User | null = null

/**
 * 인증된 Supabase 클라이언트 가져오기
 * refresh token으로 세션 복원
 */
export async function getSupabase(): Promise<SupabaseClient> {
  if (supabaseInstance && currentUser) {
    return supabaseInstance
  }

  if (!REFRESH_TOKEN) {
    throw new Error(
      'DROP_TOKEN not set.\n' +
        '1. DROP 앱 → 프로필 → Copy MCP Token\n' +
        '2. .mcp.json의 env에 DROP_TOKEN 추가'
    )
  }

  supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

  // Refresh token으로 세션 복원
  const { data, error } = await supabaseInstance.auth.refreshSession({
    refresh_token: REFRESH_TOKEN,
  })

  if (error || !data.session) {
    throw new Error(
      `Failed to restore session: ${error?.message || 'No session'}\n` +
        'Desktop 앱에서 새 토큰을 복사해 .mcp.json에 업데이트하세요.'
    )
  }

  currentUser = data.user

  return supabaseInstance
}

/**
 * 현재 사용자 ID 가져오기
 */
export async function getUserId(): Promise<string> {
  if (currentUser) {
    return currentUser.id
  }

  await getSupabase()

  if (!currentUser) {
    throw new Error('No authenticated user')
  }

  // TypeScript가 위의 null 체크를 인식하지 못하므로 타입 단언 사용
  return (currentUser as User).id
}

/**
 * 현재 사용자 정보 가져오기
 */
export async function getUser(): Promise<User> {
  if (currentUser) {
    return currentUser
  }

  await getSupabase()

  if (!currentUser) {
    throw new Error('No authenticated user')
  }

  return currentUser
}
