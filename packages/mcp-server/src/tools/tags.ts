import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { getSupabase } from '../supabase.js'

/**
 * 태그 관련 Tools 등록
 */
export function registerTagsTools(server: McpServer) {
  // list_tags - 모든 태그 목록
  server.tool(
    'list_tags',
    'List all tags with note counts',
    {
      limit: z.number().min(1).max(100).default(50).describe('Number of tags to return'),
    },
    async ({ limit }) => {
      try {
        const supabase = await getSupabase()

        const { data, error } = await supabase
          .from('tags')
          .select(
            `
            id,
            name,
            note_tags(count)
          `
          )
          .limit(limit)

        if (error) {
          return {
            content: [{ type: 'text' as const, text: `Error: ${error.message}` }],
            isError: true,
          }
        }

        const tags = data?.map((tag) => ({
          id: tag.id,
          name: tag.name,
          noteCount: (tag.note_tags as unknown as { count: number }[])?.[0]?.count || 0,
        }))

        // 노트 수 기준으로 정렬
        tags?.sort((a, b) => b.noteCount - a.noteCount)

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ tags, total: tags?.length || 0 }, null, 2),
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

  // get_notes_by_tag - 특정 태그의 노트 조회
  server.tool(
    'get_notes_by_tag',
    'Get all notes with a specific tag',
    {
      tagName: z.string().describe('The tag name'),
      limit: z.number().min(1).max(100).default(50).describe('Number of notes to return'),
    },
    async ({ tagName, limit }) => {
      try {
        const supabase = await getSupabase()

        // 태그 ID 조회
        const { data: tag, error: tagError } = await supabase
          .from('tags')
          .select('id')
          .eq('name', tagName)
          .single()

        if (tagError || !tag) {
          return {
            content: [{ type: 'text' as const, text: `Tag "${tagName}" not found` }],
            isError: true,
          }
        }

        // 해당 태그의 노트 조회
        const { data, error } = await supabase
          .from('note_tags')
          .select(
            `
            notes(
              id,
              content,
              created_at,
              has_link,
              has_media,
              has_files
            )
          `
          )
          .eq('tag_id', tag.id)
          .limit(limit)

        if (error) {
          return {
            content: [{ type: 'text' as const, text: `Error: ${error.message}` }],
            isError: true,
          }
        }

        const notes = data
          ?.map((nt) => nt.notes)
          .filter(Boolean)
          .filter(
            (note): note is NonNullable<typeof note> =>
              note !== null && !(note as { deleted_at?: string }).deleted_at
          )

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(
                {
                  tagName,
                  notes,
                  total: notes?.length || 0,
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

  // add_tags_to_note - 노트에 태그 추가
  server.tool(
    'add_tags_to_note',
    'Add tags to a note',
    {
      noteId: z.string().uuid().describe('The UUID of the note'),
      tagNames: z.array(z.string()).describe('Tag names to add'),
    },
    async ({ noteId, tagNames }) => {
      try {
        const supabase = await getSupabase()

        const addedTags: string[] = []

        for (const tagName of tagNames) {
          // 태그 upsert
          const { data: tag, error: tagError } = await supabase
            .from('tags')
            .upsert({ name: tagName }, { onConflict: 'name,user_id' })
            .select()
            .single()

          if (tagError || !tag) continue

          // note_tags 연결
          const { error } = await supabase
            .from('note_tags')
            .upsert({ note_id: noteId, tag_id: tag.id }, { onConflict: 'note_id,tag_id' })

          if (!error) {
            addedTags.push(tagName)
          }
        }

        return {
          content: [
            {
              type: 'text' as const,
              text: `Added tags to note ${noteId}: ${addedTags.join(', ')}`,
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

  // remove_tags_from_note - 노트에서 태그 제거
  server.tool(
    'remove_tags_from_note',
    'Remove tags from a note',
    {
      noteId: z.string().uuid().describe('The UUID of the note'),
      tagNames: z.array(z.string()).describe('Tag names to remove'),
    },
    async ({ noteId, tagNames }) => {
      try {
        const supabase = await getSupabase()

        const removedTags: string[] = []

        for (const tagName of tagNames) {
          // 태그 ID 조회
          const { data: tag } = await supabase
            .from('tags')
            .select('id')
            .eq('name', tagName)
            .single()

          if (!tag) continue

          // note_tags 삭제
          const { error } = await supabase
            .from('note_tags')
            .delete()
            .eq('note_id', noteId)
            .eq('tag_id', tag.id)

          if (!error) {
            removedTags.push(tagName)
          }
        }

        return {
          content: [
            {
              type: 'text' as const,
              text: `Removed tags from note ${noteId}: ${removedTags.join(', ')}`,
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
