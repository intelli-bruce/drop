import { createClient } from '@supabase/supabase-js'

// 환경 변수에서 Supabase 설정 로드 (로컬 개발용)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://127.0.0.1:58321'
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'REDACTED_SUPABASE_KEY_LOCAL'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Storage 헬퍼
export async function uploadAttachment(
  file: File,
  noteId: string
): Promise<{ path: string; error: Error | null }> {
  // Get current user for storage path
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { path: '', error: new Error('User not authenticated') }
  }

  const fileExt = file.name.split('.').pop()
  // Storage path: {user_id}/{note_id}/{filename}
  const fileName = `${user.id}/${noteId}/${crypto.randomUUID()}.${fileExt}`

  const { error } = await supabase.storage.from('attachments').upload(fileName, file)

  if (error) {
    return { path: '', error }
  }

  return { path: fileName, error: null }
}

export function getAttachmentUrl(storagePath: string): string {
  const { data } = supabase.storage.from('attachments').getPublicUrl(storagePath)
  return data.publicUrl
}

export async function getSignedAttachmentUrl(
  storagePath: string,
  expiresInSeconds = 60 * 60
): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from('attachments')
    .createSignedUrl(storagePath, expiresInSeconds)

  if (error) {
    console.error('[attachments] signed url error', error)
    return null
  }

  return data?.signedUrl ?? null
}
