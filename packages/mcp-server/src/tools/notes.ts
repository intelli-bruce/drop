import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { getSupabase, getUserId } from '../supabase.js'

/**
 * 노트 관련 Tools 등록
 */
export function registerNotesTools(server: McpServer) {
  // list_notes - 노트 목록 조회
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
        const supabase = await getSupabase()

        let query = supabase
          .from('notes')
          .select(
            `
            id,
            content,
            source,
            parent_id,
            is_locked,
            has_link,
            has_media,
            has_files,
            created_at,
            updated_at,
            deleted_at,
            archived_at,
            attachments(count),
            note_tags(count)
          `,
            { count: 'exact' }
          )
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1)

        if (!includeDeleted) {
          query = query.is('deleted_at', null)
        }
        if (!includeArchived) {
          query = query.is('archived_at', null)
        }

        const { data, error, count } = await query

        if (error) {
          return {
            content: [{ type: 'text' as const, text: `Error: ${error.message}` }],
            isError: true,
          }
        }

        const notes = data?.map((note) => ({
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
          attachmentCount: (note.attachments as unknown as { count: number }[])?.[0]?.count || 0,
          tagCount: (note.note_tags as unknown as { count: number }[])?.[0]?.count || 0,
        }))

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(
                {
                  notes,
                  total: count,
                  hasMore: offset + limit < (count || 0),
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

  // get_note - 단일 노트 상세 조회
  server.tool(
    'get_note',
    'Get a single note with its tags and attachments',
    {
      noteId: z.string().uuid().describe('The UUID of the note'),
    },
    async ({ noteId }) => {
      try {
        const supabase = await getSupabase()

        const { data: note, error } = await supabase
          .from('notes')
          .select(
            `
            *,
            attachments(*),
            note_tags(
              tags(id, name)
            )
          `
          )
          .eq('id', noteId)
          .single()

        if (error) {
          return {
            content: [{ type: 'text' as const, text: `Error: ${error.message}` }],
            isError: true,
          }
        }

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
          tags: note.note_tags?.map((nt: { tags: { id: string; name: string } }) => nt.tags) || [],
          attachments:
            note.attachments?.map(
              (a: {
                id: string
                type: string
                filename: string | null
                mime_type: string | null
                size: number | null
                original_url: string | null
              }) => ({
                id: a.id,
                type: a.type,
                filename: a.filename,
                mimeType: a.mime_type,
                size: a.size,
                originalUrl: a.original_url,
              })
            ) || [],
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

  // create_note - 새 노트 생성
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
        const supabase = await getSupabase()
        const userId = await getUserId()

        // 노트 생성
        const { data: note, error } = await supabase
          .from('notes')
          .insert({
            content,
            parent_id: parentId || null,
            source: 'mcp',
            user_id: userId,
          })
          .select()
          .single()

        if (error) {
          return {
            content: [{ type: 'text' as const, text: `Error: ${error.message}` }],
            isError: true,
          }
        }

        // 태그 추가
        if (tagNames && tagNames.length > 0) {
          for (const tagName of tagNames) {
            // 태그 upsert
            const { data: tag } = await supabase
              .from('tags')
              .upsert({ name: tagName, user_id: userId }, { onConflict: 'name,user_id' })
              .select()
              .single()

            if (tag) {
              await supabase.from('note_tags').insert({
                note_id: note.id,
                tag_id: tag.id,
              })
            }
          }
        }

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(
                {
                  id: note.id,
                  content: note.content,
                  createdAt: note.created_at,
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

  // update_note - 노트 수정
  server.tool(
    'update_note',
    'Update an existing note',
    {
      noteId: z.string().uuid().describe('The UUID of the note'),
      content: z.string().describe('The new content'),
    },
    async ({ noteId, content }) => {
      try {
        const supabase = await getSupabase()

        const { data: note, error } = await supabase
          .from('notes')
          .update({ content, updated_at: new Date().toISOString() })
          .eq('id', noteId)
          .select()
          .single()

        if (error) {
          return {
            content: [{ type: 'text' as const, text: `Error: ${error.message}` }],
            isError: true,
          }
        }

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(
                {
                  id: note.id,
                  content: note.content,
                  updatedAt: note.updated_at,
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

  // delete_note - 소프트 삭제
  server.tool(
    'delete_note',
    'Soft-delete a note (move to trash)',
    {
      noteId: z.string().uuid().describe('The UUID of the note'),
    },
    async ({ noteId }) => {
      try {
        const supabase = await getSupabase()

        const { error } = await supabase
          .from('notes')
          .update({
            deleted_at: new Date().toISOString(),
            is_deleted: true,
          })
          .eq('id', noteId)

        if (error) {
          return {
            content: [{ type: 'text' as const, text: `Error: ${error.message}` }],
            isError: true,
          }
        }

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

  // archive_note - 보관
  server.tool(
    'archive_note',
    'Archive a note',
    {
      noteId: z.string().uuid().describe('The UUID of the note'),
    },
    async ({ noteId }) => {
      try {
        const supabase = await getSupabase()

        const { error } = await supabase
          .from('notes')
          .update({ archived_at: new Date().toISOString() })
          .eq('id', noteId)

        if (error) {
          return {
            content: [{ type: 'text' as const, text: `Error: ${error.message}` }],
            isError: true,
          }
        }

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
