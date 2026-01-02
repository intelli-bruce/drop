import { createClient, SupabaseClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://REDACTED_SUPABASE_HOST'
const SUPABASE_ANON_KEY = 'REDACTED_SUPABASE_KEY'

const API_KEY = process.env.DROP_TOKEN

let supabaseInstance: SupabaseClient | null = null
let validatedUserId: string | null = null

function getApiKey(): string {
  if (!API_KEY) {
    throw new Error(
      'DROP_TOKEN not set.\n' +
        '1. DROP 앱 → 프로필 → Copy MCP Token\n' +
        '2. .mcp.json의 env에 DROP_TOKEN 추가'
    )
  }
  return API_KEY
}

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseInstance) {
    supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  }
  return supabaseInstance
}

export async function validateApiKey(): Promise<string> {
  if (validatedUserId) {
    return validatedUserId
  }

  const apiKey = getApiKey()
  const supabase = getSupabaseClient()

  const { data, error } = await supabase.rpc('get_user_id_by_mcp_key', {
    api_key: apiKey,
  })

  if (error || !data) {
    throw new Error(
      'Invalid API key.\n' + 'DROP 앱 → 프로필 → Copy MCP Token에서 새 키를 복사하세요.'
    )
  }

  validatedUserId = data as string
  return validatedUserId
}

export function getApiKeyForRpc(): string {
  return getApiKey()
}

export async function getUserId(): Promise<string> {
  return validateApiKey()
}

type RpcParams = Record<string, unknown>

export async function callMcpRpc<T>(functionName: string, params: RpcParams = {}): Promise<T> {
  const apiKey = getApiKey()
  const supabase = getSupabaseClient()

  const { data, error } = await supabase.rpc(functionName, {
    api_key: apiKey,
    ...params,
  })

  if (error) {
    throw new Error(error.message)
  }

  return data as T
}
