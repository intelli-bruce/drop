import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { readFileSync } from 'fs'
import { getSupabase, getUserId } from '../supabase.js'

/**
 * 첨부파일 관련 Tools 등록
 */
export function registerAttachmentsTools(server: McpServer) {
  // upload_attachment - 첨부파일 업로드
  server.tool(
    'upload_attachment',
    'Upload an attachment (image, audio, video, file) to a note',
    {
      noteId: z.string().uuid().describe('The UUID of the note to attach to'),
      base64Data: z.string().describe('Base64 encoded file data'),
      filename: z.string().describe('Original filename with extension (e.g., "photo.jpg")'),
      mimeType: z
        .string()
        .optional()
        .describe('MIME type (e.g., "image/jpeg"). Auto-detected if not provided'),
    },
    async ({ noteId, base64Data, filename, mimeType }) => {
      try {
        const supabase = await getSupabase()
        const userId = await getUserId()

        // MIME 타입 추론
        const detectedMimeType = mimeType || detectMimeType(filename)
        const attachmentType = getAttachmentType(detectedMimeType)

        // Base64 디코딩
        const buffer = Buffer.from(base64Data, 'base64')
        const fileSize = buffer.length

        // 스토리지 경로 생성
        const ext = filename.split('.').pop() || 'bin'
        const storagePath = `${userId}/${noteId}/${Date.now()}.${ext}`

        // Supabase Storage에 업로드
        const { error: uploadError } = await supabase.storage
          .from('attachments')
          .upload(storagePath, buffer, {
            contentType: detectedMimeType,
            upsert: false,
          })

        if (uploadError) {
          return {
            content: [{ type: 'text' as const, text: `Upload error: ${uploadError.message}` }],
            isError: true,
          }
        }

        // attachments 테이블에 레코드 생성
        const { data: attachment, error: dbError } = await supabase
          .from('attachments')
          .insert({
            note_id: noteId,
            type: attachmentType,
            storage_path: storagePath,
            filename: filename,
            mime_type: detectedMimeType,
            size: fileSize,
          })
          .select()
          .single()

        if (dbError) {
          // 업로드된 파일 삭제 시도
          await supabase.storage.from('attachments').remove([storagePath])
          return {
            content: [{ type: 'text' as const, text: `Database error: ${dbError.message}` }],
            isError: true,
          }
        }

        // 노트의 has_media/has_files 플래그 업데이트
        const updateField =
          attachmentType === 'image' || attachmentType === 'video' || attachmentType === 'audio'
            ? 'has_media'
            : 'has_files'

        await supabase
          .from('notes')
          .update({ [updateField]: true, updated_at: new Date().toISOString() })
          .eq('id', noteId)

        // 공개 URL 생성
        const {
          data: { publicUrl },
        } = supabase.storage.from('attachments').getPublicUrl(storagePath)

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(
                {
                  id: attachment.id,
                  noteId: noteId,
                  type: attachmentType,
                  filename: filename,
                  mimeType: detectedMimeType,
                  size: fileSize,
                  storagePath: storagePath,
                  publicUrl: publicUrl,
                },
                null,
                2
              ),
            },
          ],
        }
      } catch (err) {
        return {
          content: [{ type: 'text' as const, text: `Error: ${(err as Error).message}` }],
          isError: true,
        }
      }
    }
  )

  // list_attachments - 노트의 첨부파일 목록
  server.tool(
    'list_attachments',
    'List all attachments for a note',
    {
      noteId: z.string().uuid().describe('The UUID of the note'),
    },
    async ({ noteId }) => {
      try {
        const supabase = await getSupabase()

        const { data: attachments, error } = await supabase
          .from('attachments')
          .select('*')
          .eq('note_id', noteId)
          .order('created_at', { ascending: true })

        if (error) {
          return {
            content: [{ type: 'text' as const, text: `Error: ${error.message}` }],
            isError: true,
          }
        }

        const result = attachments.map((a) => {
          const {
            data: { publicUrl },
          } = supabase.storage.from('attachments').getPublicUrl(a.storage_path)

          return {
            id: a.id,
            type: a.type,
            filename: a.filename,
            mimeType: a.mime_type,
            size: a.size,
            publicUrl: publicUrl,
            createdAt: a.created_at,
          }
        })

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ attachments: result, total: result.length }, null, 2),
            },
          ],
        }
      } catch (err) {
        return {
          content: [{ type: 'text' as const, text: `Error: ${(err as Error).message}` }],
          isError: true,
        }
      }
    }
  )

  // delete_attachment - 첨부파일 삭제
  server.tool(
    'delete_attachment',
    'Delete an attachment from a note',
    {
      attachmentId: z.string().uuid().describe('The UUID of the attachment'),
    },
    async ({ attachmentId }) => {
      try {
        const supabase = await getSupabase()

        // 먼저 첨부파일 정보 조회
        const { data: attachment, error: fetchError } = await supabase
          .from('attachments')
          .select('*')
          .eq('id', attachmentId)
          .single()

        if (fetchError || !attachment) {
          return {
            content: [{ type: 'text' as const, text: `Attachment not found` }],
            isError: true,
          }
        }

        // 스토리지에서 파일 삭제
        await supabase.storage.from('attachments').remove([attachment.storage_path])

        // DB 레코드 삭제
        const { error: deleteError } = await supabase
          .from('attachments')
          .delete()
          .eq('id', attachmentId)

        if (deleteError) {
          return {
            content: [{ type: 'text' as const, text: `Delete error: ${deleteError.message}` }],
            isError: true,
          }
        }

        return {
          content: [{ type: 'text' as const, text: `Attachment ${attachmentId} deleted` }],
        }
      } catch (err) {
        return {
          content: [{ type: 'text' as const, text: `Error: ${(err as Error).message}` }],
          isError: true,
        }
      }
    }
  )

  // upload_from_path - 로컬 파일 경로로 첨부파일 업로드
  server.tool(
    'upload_from_path',
    'Upload a local file to a note by file path',
    {
      noteId: z.string().uuid().describe('The UUID of the note to attach to'),
      filePath: z.string().describe('Absolute path to the local file'),
    },
    async ({ noteId, filePath }) => {
      try {
        const supabase = await getSupabase()
        const userId = await getUserId()

        // 파일 읽기
        const buffer = readFileSync(filePath)
        const filename = filePath.split('/').pop() || 'file'
        const mimeType = detectMimeType(filename)
        const attachmentType = getAttachmentType(mimeType)
        const fileSize = buffer.length

        // 스토리지 경로 생성
        const ext = filename.split('.').pop() || 'bin'
        const storagePath = `${userId}/${noteId}/${Date.now()}.${ext}`

        // Supabase Storage에 업로드
        const { error: uploadError } = await supabase.storage
          .from('attachments')
          .upload(storagePath, buffer, {
            contentType: mimeType,
            upsert: false,
          })

        if (uploadError) {
          return {
            content: [{ type: 'text' as const, text: `Upload error: ${uploadError.message}` }],
            isError: true,
          }
        }

        // attachments 테이블에 레코드 생성
        const { data: attachment, error: dbError } = await supabase
          .from('attachments')
          .insert({
            note_id: noteId,
            type: attachmentType,
            storage_path: storagePath,
            filename: filename,
            mime_type: mimeType,
            size: fileSize,
          })
          .select()
          .single()

        if (dbError) {
          await supabase.storage.from('attachments').remove([storagePath])
          return {
            content: [{ type: 'text' as const, text: `Database error: ${dbError.message}` }],
            isError: true,
          }
        }

        // 노트 플래그 업데이트
        const updateField =
          attachmentType === 'image' || attachmentType === 'video' || attachmentType === 'audio'
            ? 'has_media'
            : 'has_files'

        await supabase
          .from('notes')
          .update({ [updateField]: true, updated_at: new Date().toISOString() })
          .eq('id', noteId)

        return {
          content: [
            {
              type: 'text' as const,
              text: `Uploaded: ${filename} (${Math.round(fileSize / 1024)}KB)`,
            },
          ],
        }
      } catch (err) {
        return {
          content: [{ type: 'text' as const, text: `Error: ${(err as Error).message}` }],
          isError: true,
        }
      }
    }
  )
}

/**
 * 파일명에서 MIME 타입 추론
 */
function detectMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  const mimeTypes: Record<string, string> = {
    // 이미지
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    // 오디오
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    m4a: 'audio/mp4',
    ogg: 'audio/ogg',
    // 비디오
    mp4: 'video/mp4',
    webm: 'video/webm',
    mov: 'video/quicktime',
    // 문서
    pdf: 'application/pdf',
    txt: 'text/plain',
    json: 'application/json',
  }
  return mimeTypes[ext] || 'application/octet-stream'
}

/**
 * MIME 타입에서 첨부파일 유형 결정
 */
function getAttachmentType(mimeType: string): 'image' | 'audio' | 'video' | 'file' {
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType.startsWith('audio/')) return 'audio'
  if (mimeType.startsWith('video/')) return 'video'
  return 'file'
}
