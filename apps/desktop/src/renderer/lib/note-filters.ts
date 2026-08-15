// 활성 노트 목록에 걸리는 필터들의 순수 규칙.
//
// NoteFeed 안에 useMemo로 흩어져 있던 판정을 한곳으로 모은 것이다.
// 렌더링을 거치지 않고 테스트할 수 있어야 필터가 하나 늘 때마다
// 조합(태그 × 카테고리)을 눈으로 확인하는 일을 그만둘 수 있다.

export type CategoryFilter = 'all' | 'link' | 'media' | 'files' | null

/** 필터가 실제로 들여다보는 필드만 요구한다 — 테스트가 Note 전체를 만들 필요가 없게 */
export interface FilterableNote {
  tags: Array<{ name: string }>
  hasLink: boolean
  hasMedia: boolean
  hasFiles: boolean
}

export interface NoteFilterOptions {
  /** 이 이름의 태그가 붙은 노트만 */
  filterTag: string | null
  /** 링크·미디어·파일 중 하나만 (null·'all'은 전체) */
  categoryFilter: CategoryFilter
}

function matchesCategory(note: FilterableNote, categoryFilter: CategoryFilter): boolean {
  if (categoryFilter === 'link') return note.hasLink
  if (categoryFilter === 'media') return note.hasMedia
  if (categoryFilter === 'files') return note.hasFiles
  return true
}

function matchesTag(note: FilterableNote, filterTag: string | null): boolean {
  if (!filterTag) return true
  return note.tags.some((t) => t.name === filterTag)
}

/**
 * 활성 노트 목록에 필터를 모두 적용한다 (AND).
 *
 * 원래 순서를 유지한다 — 정렬·그룹화는 피드가 따로 한다.
 */
export function applyNoteFilters<T extends FilterableNote>(
  notes: T[],
  { filterTag, categoryFilter }: NoteFilterOptions
): T[] {
  return notes.filter((note) => matchesTag(note, filterTag) && matchesCategory(note, categoryFilter))
}
