import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { readFileSync } from 'fs'
import { getSupabaseClient, callMcpRpc, getUserId } from '../supabase.js'

interface Attachment {
  id: string
  type: string
  filename: string
  mime_type: string
  size: number
  storage_path: string
  created_at: string
}

interface ListAttachmentsResult {
  attachments: Attachment[]
}

interface CreateAttachmentResult {
  id: string
  storage_path: string
}

interface DeleteAttachmentResult {
  success: boolean
  storage_path: string
}

export function registerAttachmentsTools(server: McpServer) {
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
        const supabase = getSupabaseClient()
        const userId = await getUserId()

        const detectedMimeType = mimeType || detectMimeType(filename)
        const attachmentType = getAttachmentType(detectedMimeType)

        const buffer = Buffer.from(base64Data, 'base64')
        const fileSize = buffer.length

        const ext = filename.split('.').pop() || 'bin'
        const storagePath = `${userId}/${noteId}/${Date.now()}.${ext}`

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

        const result = await callMcpRpc<CreateAttachmentResult>('mcp_create_attachment', {
          p_note_id: noteId,
          p_type: attachmentType,
          p_storage_path: storagePath,
          p_filename: filename,
          p_mime_type: detectedMimeType,
          p_size: fileSize,
        })

        const {
          data: { publicUrl },
        } = supabase.storage.from('attachments').getPublicUrl(storagePath)

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(
                {
                  id: result.id,
                  noteId,
                  type: attachmentType,
                  filename,
                  mimeType: detectedMimeType,
                  size: fileSize,
                  storagePath,
                  publicUrl,
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

  server.tool(
    'list_attachments',
    'List all attachments for a note',
    {
      noteId: z.string().uuid().describe('The UUID of the note'),
    },
    async ({ noteId }) => {
      try {
        const supabase = getSupabaseClient()
        const result = await callMcpRpc<ListAttachmentsResult>('mcp_list_attachments', {
          p_note_id: noteId,
        })

        const attachments = result.attachments.map((a) => {
          const {
            data: { publicUrl },
          } = supabase.storage.from('attachments').getPublicUrl(a.storage_path)

          return {
            id: a.id,
            type: a.type,
            filename: a.filename,
            mimeType: a.mime_type,
            size: a.size,
            publicUrl,
            createdAt: a.created_at,
          }
        })

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ attachments, total: attachments.length }, null, 2),
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

  server.tool(
    'delete_attachment',
    'Delete an attachment from a note',
    {
      attachmentId: z.string().uuid().describe('The UUID of the attachment'),
    },
    async ({ attachmentId }) => {
      try {
        const supabase = getSupabaseClient()

        const result = await callMcpRpc<DeleteAttachmentResult>('mcp_delete_attachment', {
          p_attachment_id: attachmentId,
        })

        await supabase.storage.from('attachments').remove([result.storage_path])

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

  server.tool(
    'upload_from_path',
    'Upload a local file to a note by file path',
    {
      noteId: z.string().uuid().describe('The UUID of the note to attach to'),
      filePath: z.string().describe('Absolute path to the local file'),
    },
    async ({ noteId, filePath }) => {
      try {
        const supabase = getSupabaseClient()
        const userId = await getUserId()

        const buffer = readFileSync(filePath)
        const filename = filePath.split('/').pop() || 'file'
        const mimeType = detectMimeType(filename)
        const attachmentType = getAttachmentType(mimeType)
        const fileSize = buffer.length

        const ext = filename.split('.').pop() || 'bin'
        const storagePath = `${userId}/${noteId}/${Date.now()}.${ext}`

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

        await callMcpRpc<CreateAttachmentResult>('mcp_create_attachment', {
          p_note_id: noteId,
          p_type: attachmentType,
          p_storage_path: storagePath,
          p_filename: filename,
          p_mime_type: mimeType,
          p_size: fileSize,
        })

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

function detectMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  const mimeTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    m4a: 'audio/mp4',
    ogg: 'audio/ogg',
    mp4: 'video/mp4',
    webm: 'video/webm',
    mov: 'video/quicktime',
    pdf: 'application/pdf',
    txt: 'text/plain',
    json: 'application/json',
  }
  return mimeTypes[ext] || 'application/octet-stream'
}

function getAttachmentType(mimeType: string): 'image' | 'audio' | 'video' | 'file' {
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType.startsWith('audio/')) return 'audio'
  if (mimeType.startsWith('video/')) return 'video'
  return 'file'
}
