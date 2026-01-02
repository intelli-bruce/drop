import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { callMcpRpc } from '../supabase.js'

interface Note {
  id: string
  content: string
  source: string
  parent_id: string | null
  is_locked: boolean
  has_link: boolean
  has_media: boolean
  has_files: boolean
  created_at: string
  updated_at: string
  deleted_at: string | null
  archived_at: string | null
  tags?: Array<{ id: string; name: string }>
  attachments?: Array<{
    id: string
    type: string
    filename: string | null
    mime_type: string | null
    size: number | null
    storage_path: string | null
  }>
}

interface ListNotesResult {
  notes: Note[]
  total: number
}

interface SuccessResult {
  success: boolean
  note_id: string
}

export function registerNotesTools(server: McpServer) {
  server.tool(
    'list_notes',
    'List recent notes from DROP',
    {
      limit: z.number().min(1).max(100).default(20).describe('Number of notes to return'),
      offset: z.number().min(0).default(0).describe('Offset for pagination'),
      includeDeleted: z.boolean().default(false).describe('Include soft-deleted notes'),
      includeArchived: z.boolean().default(false).describe('Include archived notes'),
    },
    async ({ limit, offset, includeDeleted, includeArchived }) => {
      try {
        const result = await callMcpRpc<ListNotesResult>('mcp_list_notes', {
          p_limit: limit,
          p_offset: offset,
          p_include_deleted: includeDeleted,
          p_include_archived: includeArchived,
        })

        const notes = result.notes.map((note) => ({
          id: note.id,
          content: note.content,
          source: note.source,
          parentId: note.parent_id,
          isLocked: note.is_locked,
          hasLink: note.has_link,
          hasMedia: note.has_media,
          hasFiles: note.has_files,
          createdAt: note.created_at,
          updatedAt: note.updated_at,
          isDeleted: !!note.deleted_at,
          isArchived: !!note.archived_at,
        }))

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(
                { notes, total: result.total, hasMore: offset + limit < result.total },
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
    'get_note',
    'Get a single note with its tags and attachments',
    {
      noteId: z.string().uuid().describe('The UUID of the note'),
    },
    async ({ noteId }) => {
      try {
        const note = await callMcpRpc<Note>('mcp_get_note', { p_note_id: noteId })

        const result = {
          id: note.id,
          content: note.content,
          source: note.source,
          parentId: note.parent_id,
          isLocked: note.is_locked,
          hasLink: note.has_link,
          hasMedia: note.has_media,
          hasFiles: note.has_files,
          createdAt: note.created_at,
          updatedAt: note.updated_at,
          isDeleted: !!note.deleted_at,
          isArchived: !!note.archived_at,
          tags: note.tags || [],
          attachments:
            note.attachments?.map((a) => ({
              id: a.id,
              type: a.type,
              filename: a.filename,
              mimeType: a.mime_type,
              size: a.size,
            })) || [],
        }

        return {
          content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
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
    'create_note',
    'Create a new note',
    {
      content: z.string().describe('The content of the note'),
      parentId: z.string().uuid().optional().describe('Parent note ID for replies'),
      tagNames: z.array(z.string()).optional().describe('Tag names to attach'),
    },
    async ({ content, parentId, tagNames }) => {
      try {
        const note = await callMcpRpc<Note>('mcp_create_note', {
          p_content: content,
          p_parent_id: parentId || null,
          p_tag_names: tagNames || null,
        })

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(
                { id: note.id, content: note.content, createdAt: note.created_at },
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
    'update_note',
    'Update an existing note',
    {
      noteId: z.string().uuid().describe('The UUID of the note'),
      content: z.string().describe('The new content'),
    },
    async ({ noteId, content }) => {
      try {
        const note = await callMcpRpc<Note>('mcp_update_note', {
          p_note_id: noteId,
          p_content: content,
        })

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(
                { id: note.id, content: note.content, updatedAt: note.updated_at },
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
    'delete_note',
    'Soft-delete a note (move to trash)',
    {
      noteId: z.string().uuid().describe('The UUID of the note'),
    },
    async ({ noteId }) => {
      try {
        await callMcpRpc<SuccessResult>('mcp_delete_note', { p_note_id: noteId })
        return {
          content: [{ type: 'text' as const, text: `Note ${noteId} moved to trash` }],
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
    'archive_note',
    'Archive a note',
    {
      noteId: z.string().uuid().describe('The UUID of the note'),
    },
    async ({ noteId }) => {
      try {
        await callMcpRpc<SuccessResult>('mcp_archive_note', { p_note_id: noteId })
        return {
          content: [{ type: 'text' as const, text: `Note ${noteId} archived` }],
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
