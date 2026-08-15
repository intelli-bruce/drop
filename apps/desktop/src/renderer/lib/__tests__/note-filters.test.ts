import { describe, it, expect } from 'vitest'
import { applyNoteFilters, type FilterableNote } from '../note-filters'

interface TestNote extends FilterableNote {
  id: string
}

function note(id: string, overrides: Partial<TestNote> = {}): TestNote {
  return {
    id,
    tags: [],
    hasLink: false,
    hasMedia: false,
    hasFiles: false,
    ...overrides,
  }
}

const ids = (notes: TestNote[]) => notes.map((n) => n.id)

describe('applyNoteFilters', () => {
  it('필터가 없으면 원래 목록을 순서 그대로 돌려준다', () => {
    const notes = [note('a'), note('b'), note('c')]

    const result = applyNoteFilters(notes, { filterTag: null, categoryFilter: null })

    expect(ids(result)).toEqual(['a', 'b', 'c'])
  })

  it("categoryFilter가 'all'이면 아무것도 걸러내지 않는다", () => {
    const notes = [note('a'), note('b', { hasLink: true })]

    const result = applyNoteFilters(notes, { filterTag: null, categoryFilter: 'all' })

    expect(ids(result)).toEqual(['a', 'b'])
  })

  it('filterTag가 있으면 그 태그가 붙은 노트만 남긴다', () => {
    const notes = [
      note('a', { tags: [{ name: 'work' }] }),
      note('b', { tags: [{ name: 'home' }] }),
      note('c'),
    ]

    const result = applyNoteFilters(notes, { filterTag: 'work', categoryFilter: null })

    expect(ids(result)).toEqual(['a'])
  })

  it.each([
    ['link' as const, 'hasLink' as const],
    ['media' as const, 'hasMedia' as const],
    ['files' as const, 'hasFiles' as const],
  ])('categoryFilter %s는 %s인 노트만 남긴다', (categoryFilter, flag) => {
    const notes = [note('yes', { [flag]: true }), note('no')]

    const result = applyNoteFilters(notes, { filterTag: null, categoryFilter })

    expect(ids(result)).toEqual(['yes'])
  })

  it('태그와 카테고리를 함께 만족하는 노트만 남긴다', () => {
    const notes = [
      note('both', { tags: [{ name: 'work' }], hasLink: true }),
      note('tag-only', { tags: [{ name: 'work' }] }),
      note('link-only', { hasLink: true }),
    ]

    const result = applyNoteFilters(notes, { filterTag: 'work', categoryFilter: 'link' })

    expect(ids(result)).toEqual(['both'])
  })

  it('원본 배열을 건드리지 않는다', () => {
    const notes = [note('a', { hasLink: true }), note('b')]

    applyNoteFilters(notes, { filterTag: null, categoryFilter: 'link' })

    expect(ids(notes)).toEqual(['a', 'b'])
  })
})
