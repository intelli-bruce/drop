import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { getSupabase } from '../supabase.js'

/**
 * 검색 관련 Tools 등록
 */
export function registerSearchTools(server: McpServer) {
  // search_notes - 텍스트 검색
  server.tool(
    'search_notes',
    'Search notes by text content',
    {
      query: z.string().describe('Search query'),
      limit: z.number().min(1).max(50).default(20).describe('Number of results'),
      category: z
        .enum(['all', 'links', 'media', 'files'])
        .default('all')
        .describe('Filter by category'),
      tagNames: z.array(z.string()).optional().describe('Filter by tag names'),
    },
    async ({ query, limit, category, tagNames }) => {
      try {
        const supabase = await getSupabase()

        // 기본 쿼리
        let dbQuery = supabase
          .from('notes')
          .select(
            `
            id,
            content,
            created_at,
            has_link,
            has_media,
            has_files,
            note_tags(
              tags(name)
            )
          `
          )
          .is('deleted_at', null)
          .is('archived_at', null)
          .ilike('content', `%${query}%`)
          .order('created_at', { ascending: false })
          .limit(limit)

        // 카테고리 필터
        if (category === 'links') {
          dbQuery = dbQuery.eq('has_link', true)
        } else if (category === 'media') {
          dbQuery = dbQuery.eq('has_media', true)
        } else if (category === 'files') {
          dbQuery = dbQuery.eq('has_files', true)
        }

        const { data, error } = await dbQuery

        if (error) {
          return {
            content: [{ type: 'text' as const, text: `Error: ${error.message}` }],
            isError: true,
          }
        }

        // 태그 이름 추출 헬퍼
        const extractTagNames = (noteTags: unknown): string[] => {
          if (!Array.isArray(noteTags)) return []
          return noteTags
            .map((nt: { tags: { name: string } | null }) => nt.tags?.name)
            .filter((name): name is string => !!name)
        }

        // 태그 필터링 (post-query)
        let filteredData = data
        if (tagNames && tagNames.length > 0) {
          filteredData = data?.filter((note) => {
            const noteTags = extractTagNames(note.note_tags)
            return tagNames.some((tag) => noteTags.includes(tag))
          })
        }

        // 검색어 하이라이트 (간단한 구현)
        const results = filteredData?.map((note) => {
          const contentLower = note.content.toLowerCase()
          const queryLower = query.toLowerCase()
          const matchIndex = contentLower.indexOf(queryLower)

          let matchedText = ''
          if (matchIndex >= 0) {
            const start = Math.max(0, matchIndex - 50)
            const end = Math.min(note.content.length, matchIndex + query.length + 50)
            matchedText =
              (start > 0 ? '...' : '') +
              note.content.slice(start, end) +
              (end < note.content.length ? '...' : '')
          }

          return {
            id: note.id,
            content: note.content,
            createdAt: note.created_at,
            matchedText,
            tags: extractTagNames(note.note_tags),
          }
        })

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(
                {
                  query,
                  notes: results,
                  total: results?.length || 0,
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

  // search_by_date_range - 날짜 범위 검색
  server.tool(
    'search_by_date_range',
    'Search notes within a date range',
    {
      startDate: z.string().describe('Start date (ISO 8601 format, e.g., 2024-01-01)'),
      endDate: z.string().describe('End date (ISO 8601 format)'),
      limit: z.number().min(1).max(100).default(50).describe('Number of results'),
    },
    async ({ startDate, endDate, limit }) => {
      try {
        const supabase = await getSupabase()

        const { data, error } = await supabase
          .from('notes')
          .select(
            `
            id,
            content,
            created_at,
            has_link,
            has_media,
            has_files
          `
          )
          .is('deleted_at', null)
          .is('archived_at', null)
          .gte('created_at', startDate)
          .lte('created_at', endDate)
          .order('created_at', { ascending: false })
          .limit(limit)

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
                  dateRange: { start: startDate, end: endDate },
                  notes: data,
                  total: data?.length || 0,
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
}
