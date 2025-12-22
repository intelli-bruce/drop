import { useRef, useState, useCallback, useEffect } from 'react'
import { useNotesStore } from '../stores/notes'
import { NoteCard, NoteCardHandle } from './NoteCard'
import { TagDialog } from './TagDialog'
import { isCreateNoteShortcut } from '../shortcuts/noteGlobal'
import { resolveNoteFeedShortcut } from '../shortcuts/noteFeed'
import { isOpenTagListShortcut } from '../shortcuts/tagList'
import { isTextInputTarget, getClosestNoteId } from '../lib/dom-utils'
import { extractInstagramUrls } from '../lib/instagram-url-utils'
import { extractYouTubeUrls } from '../lib/youtube-url-utils'
import { useDragAndDrop } from '../hooks'

// 큰 텍스트 임계값 (둘 다 충족해야 텍스트 첨부파일로 처리)
const LARGE_TEXT_THRESHOLD_LINES = 20
const LARGE_TEXT_THRESHOLD_CHARS = 1000

export function NoteFeed() {
  const {
    notes,
    createNote,
    deleteNote,
    addAttachment,
    createNoteWithInstagram,
    createNoteWithYouTube,
    filterTag,
    setFilterTag,
  } = useNotesStore()
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null)
  const [tagDialogNoteId, setTagDialogNoteId] = useState<string | null>(null)
  const cardRefs = useRef<Map<string, NoteCardHandle>>(new Map())
  const feedRef = useRef<HTMLDivElement>(null)

  // 새 노트 생성 + 첨부물 추가 헬퍼 (useDragAndDrop에서 사용하기 위해 먼저 정의)
  const createNoteWithFile = useCallback(
    async (file: File) => {
      const note = await createNote()
      await addAttachment(note.id, file)
      setTimeout(() => {
        cardRefs.current.get(note.id)?.focus()
      }, 50)
    },
    [createNote, addAttachment]
  )

  const { isDragOver, handleDragOver, handleDragLeave, handleDrop } = useDragAndDrop({
    onDrop: async (files) => {
      for (const file of files) {
        await createNoteWithFile(file)
      }
    },
  })

  // 태그 필터링 적용
  const filteredNotes = filterTag
    ? notes.filter((note) => note.tags.some((t) => t.name === filterTag))
    : notes

  // 루트 노트만 추출 (parentId가 null인 노트)
  const rootNotes = filteredNotes.filter((note) => note.parentId === null)

  // 자식 노트 맵 생성
  const childrenMap = new Map<string, typeof filteredNotes>()
  for (const note of filteredNotes) {
    if (note.parentId) {
      const children = childrenMap.get(note.parentId) || []
      children.push(note)
      childrenMap.set(note.parentId, children)
    }
  }

  // 노트와 자식들을 평탄화 (depth 포함)
  const flattenWithDepth = (
    noteList: typeof filteredNotes,
    depth: number
  ): Array<{ note: typeof filteredNotes[0]; depth: number }> => {
    const result: Array<{ note: typeof filteredNotes[0]; depth: number }> = []
    for (const note of noteList) {
      result.push({ note, depth })
      const children = childrenMap.get(note.id) || []
      // 자식은 생성일 기준 오름차순 (오래된 것 먼저)
      const sortedChildren = [...children].sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
      )
      result.push(...flattenWithDepth(sortedChildren, depth + 1))
    }
    return result
  }

  const flatNotes = flattenWithDepth(rootNotes, 0)

  // 답글 생성
  const handleReply = useCallback(
    async (parentId: string) => {
      const note = await createNote('', parentId)
      setTimeout(() => {
        cardRefs.current.get(note.id)?.focus()
      }, 50)
    },
    [createNote]
  )

  const handleEscapeFromNormal = useCallback((index: number) => {
    setFocusedIndex(index)
    feedRef.current?.focus()
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // 텍스트 입력 영역에서 버블링된 이벤트 무시
      if (isTextInputTarget(e.target)) return

      // Escape로 포커스 해제 (피드에 직접 포커스가 있을 때만)
      if (e.key === 'Escape') {
        e.preventDefault()
        setFocusedIndex(null)
      }
    },
    []
  )

  const groupByDate = (items: typeof flatNotes) => {
    const groups: { date: string; items: typeof flatNotes }[] = []
    const map: Record<string, typeof flatNotes> = {}

    for (const item of items) {
      const date = new Date(item.note.createdAt).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
      if (!map[date]) {
        map[date] = []
        groups.push({ date, items: map[date] })
      }
      map[date].push(item)
    }
    return groups
  }

  const grouped = groupByDate(flatNotes)

  const cardElementRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  const setCardRef = (id: string, handle: NoteCardHandle | null) => {
    if (handle) {
      cardRefs.current.set(id, handle)
    } else {
      cardRefs.current.delete(id)
    }
  }

  // 포커스된 카드로 스크롤
  useEffect(() => {
    if (focusedIndex !== null && flatNotes[focusedIndex]) {
      const noteId = flatNotes[focusedIndex].note.id
      const element = cardElementRefs.current.get(noteId)
      element?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [focusedIndex, flatNotes])

  // 새 노트 생성 후 해당 노트 편집 모드로
  const handleCreateNote = useCallback(async () => {
    const note = await createNote()
    setTimeout(() => {
      cardRefs.current.get(note.id)?.focus()
    }, 50)
  }, [createNote])

  // Cmd+N 단축키로 새 노트 생성
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (!isCreateNoteShortcut(e)) return
      e.preventDefault()
      handleCreateNote()
    }

    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [handleCreateNote])

  // Cmd+Shift+T 단축키로 태그 다이얼로그 열기
  useEffect(() => {
    const handleTagListKeyDown = (e: KeyboardEvent) => {
      if (!isOpenTagListShortcut(e)) return
      const fallbackNoteId = focusedIndex !== null ? flatNotes[focusedIndex]?.note.id : null
      const noteId = getClosestNoteId(document.activeElement) ?? fallbackNoteId
      if (!noteId) return
      e.preventDefault()
      e.stopPropagation()
      setTagDialogNoteId(noteId)
    }

    window.addEventListener('keydown', handleTagListKeyDown)
    return () => window.removeEventListener('keydown', handleTagListKeyDown)
  }, [flatNotes, focusedIndex])

  // 초기 포커스
  useEffect(() => {
    feedRef.current?.focus()
  }, [])

  // 글로벌 j/k 네비게이션
  useEffect(() => {
    const handleGlobalNavigation = (e: KeyboardEvent) => {
      if (flatNotes.length === 0) return
      if (isTextInputTarget(e.target)) return

      const action = resolveNoteFeedShortcut(e as unknown as React.KeyboardEvent)
      if (!action) return

      if (action === 'focusNext') {
        e.preventDefault()
        if (focusedIndex === null) {
          setFocusedIndex(0)
        } else {
          const nextIndex = Math.min(focusedIndex + 1, flatNotes.length - 1)
          setFocusedIndex(nextIndex)
        }
        feedRef.current?.focus()
        return
      }

      if (action === 'focusPrev') {
        e.preventDefault()
        if (focusedIndex === null) {
          setFocusedIndex(flatNotes.length - 1)
        } else {
          const prevIndex = Math.max(focusedIndex - 1, 0)
          setFocusedIndex(prevIndex)
        }
        feedRef.current?.focus()
        return
      }

      if (action === 'openFocused') {
        if (focusedIndex === null) return
        e.preventDefault()
        const item = flatNotes[focusedIndex]
        if (item) {
          cardRefs.current.get(item.note.id)?.focus()
          setFocusedIndex(null)
        }
        return
      }

      if (action === 'deleteFocused') {
        if (focusedIndex === null) return
        e.preventDefault()
        const item = flatNotes[focusedIndex]
        if (item && window.confirm('이 노트를 삭제하시겠습니까?')) {
          deleteNote(item.note.id)
          if (flatNotes.length > 1) {
            const nextIndex = focusedIndex >= flatNotes.length - 1 ? focusedIndex - 1 : focusedIndex
            setFocusedIndex(nextIndex)
          } else {
            setFocusedIndex(null)
          }
        }
        return
      }

      if (action === 'replyToFocused') {
        if (focusedIndex === null) return
        e.preventDefault()
        const item = flatNotes[focusedIndex]
        if (item) {
          handleReply(item.note.id)
          setFocusedIndex(null)
        }
      }
    }

    window.addEventListener('keydown', handleGlobalNavigation)
    return () => window.removeEventListener('keydown', handleGlobalNavigation)
  }, [focusedIndex, flatNotes, deleteNote, handleReply])

  // 글로벌 붙여넣기 -> 새 노트 생성 (에디터에 포커스 없을 때)
  useEffect(() => {
    const handlePaste = async (e: globalThis.ClipboardEvent) => {
      // 에디터에 포커스가 있으면 무시 (에디터가 직접 처리)
      if (isTextInputTarget(document.activeElement)) return

      const items = e.clipboardData?.items
      if (!items) return

      // 파일/이미지 처리
      for (const item of items) {
        if (item.kind === 'file') {
          const file = item.getAsFile()
          if (!file) continue

          e.preventDefault()
          await createNoteWithFile(file)
          return
        }
      }

      // 텍스트 처리
      const text = e.clipboardData?.getData('text/plain')
      if (text) {
        e.preventDefault()

        // Instagram URL 처리
        const instagramUrls = extractInstagramUrls(text)
        if (instagramUrls.length > 0) {
          for (const url of instagramUrls) {
            const note = await createNoteWithInstagram(url)
            if (note) {
              setTimeout(() => {
                cardRefs.current.get(note.id)?.focus()
              }, 50)
            }
          }
          return
        }

        // YouTube URL 처리
        const youtubeUrls = extractYouTubeUrls(text)
        if (youtubeUrls.length > 0) {
          for (const url of youtubeUrls) {
            const note = await createNoteWithYouTube(url)
            if (note) {
              setTimeout(() => {
                cardRefs.current.get(note.id)?.focus()
              }, 50)
            }
          }
          return
        }

        // 큰 텍스트는 텍스트 첨부파일로 처리 (둘 다 충족해야 함)
        const lineCount = text.split('\n').length
        const isLargeText =
          lineCount >= LARGE_TEXT_THRESHOLD_LINES && text.length >= LARGE_TEXT_THRESHOLD_CHARS

        if (isLargeText) {
          const firstLine = text.split('\n')[0].slice(0, 50)
          const title = firstLine || `붙여넣기 (${lineCount}줄)`
          const textFile = new File([text], `${title}.txt`, { type: 'text/plain' })
          await createNoteWithFile(textFile)
        } else {
          // 짧은 텍스트는 노트 본문으로
          const note = await createNote(text)
          setTimeout(() => {
            cardRefs.current.get(note.id)?.focus()
          }, 50)
        }
      }
    }

    document.addEventListener('paste', handlePaste)
    return () => document.removeEventListener('paste', handlePaste)
  }, [createNote, createNoteWithFile, createNoteWithInstagram, createNoteWithYouTube])

  // 태그 다이얼로그에 전달할 현재 노트의 태그 목록 (필터링되지 않은 전체 notes에서 검색)
  const tagDialogNote = tagDialogNoteId ? notes.find((n) => n.id === tagDialogNoteId) : null
  const tagDialogExistingTags = tagDialogNote?.tags.map((t) => t.name) ?? []

  return (
    <div
      ref={feedRef}
      className={`feed ${isDragOver ? 'drag-over' : ''}`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {tagDialogNoteId && (
        <TagDialog
          noteId={tagDialogNoteId}
          existingTagNames={tagDialogExistingTags}
          onClose={() => setTagDialogNoteId(null)}
        />
      )}
      <div className="feed-header">
        {filterTag && (
          <div className="filter-indicator">
            <span>#{filterTag}</span>
            <button onClick={() => setFilterTag(null)}>&times;</button>
          </div>
        )}
      </div>
      <div className="feed-content">
        {grouped.map(({ date, items }) => (
          <div key={date} className="date-group">
            <div className="date-label">{date}</div>
            {items.map((item) => {
              const globalIndex = flatNotes.findIndex((n) => n.note.id === item.note.id)
              return (
                <div
                  key={item.note.id}
                  ref={(el) => {
                    if (el) cardElementRefs.current.set(item.note.id, el)
                    else cardElementRefs.current.delete(item.note.id)
                  }}
                >
                  <NoteCard
                    ref={(handle) => setCardRef(item.note.id, handle)}
                    note={item.note}
                    depth={item.depth}
                    isFocused={focusedIndex === globalIndex}
                    onEscapeFromNormal={() => handleEscapeFromNormal(globalIndex)}
                    onReply={handleReply}
                  />
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
