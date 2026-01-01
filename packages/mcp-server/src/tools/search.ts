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

  // search_by_date_range - 날짜 범위 검색 (KST 기준)
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

        // KST to UTC 변환 (KST = UTC+9)
        // 날짜만 입력된 경우 (예: 2024-01-01) KST 기준으로 해석
        const toUtcStart = (dateStr: string): string => {
          if (dateStr.includes('T') || dateStr.includes('Z')) {
            return dateStr // 이미 ISO 형식이면 그대로
          }
          // KST 00:00:00 = UTC 전날 15:00:00
          const date = new Date(dateStr + 'T00:00:00+09:00')
          return date.toISOString()
        }

        const toUtcEnd = (dateStr: string): string => {
          if (dateStr.includes('T') || dateStr.includes('Z')) {
            return dateStr
          }
          // KST 23:59:59.999 = UTC 당일 14:59:59.999
          const date = new Date(dateStr + 'T23:59:59.999+09:00')
          return date.toISOString()
        }

        const utcStart = toUtcStart(startDate)
        const utcEnd = toUtcEnd(endDate)

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
          .gte('created_at', utcStart)
          .lte('created_at', utcEnd)
          .order('created_at', { ascending: false })
          .limit(limit)

        if (error) {
          return {
            content: [{ type: 'text' as const, text: `Error: ${error.message}` }],
            isError: true,
          }
        }

        // 결과의 시간을 KST로 변환
        const toKst = (utcStr: string): string => {
          const date = new Date(utcStr)
          return new Date(date.getTime() + 9 * 60 * 60 * 1000)
            .toISOString()
            .replace('Z', '+09:00')
        }

        const notesWithKst = data?.map((note) => ({
          ...note,
          created_at_kst: toKst(note.created_at),
        }))

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(
                {
                  dateRange: { start: startDate, end: endDate, timezone: 'KST' },
                  notes: notesWithKst,
                  total: notesWithKst?.length || 0,
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
