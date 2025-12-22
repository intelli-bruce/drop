import { useRef, useState, useCallback, useEffect, ClipboardEvent } from 'react'
import { useNotesStore } from '../stores/notes'
import { NoteCard, NoteCardHandle } from './NoteCard'
import { TagDialog } from './TagDialog'
import { isCreateNoteShortcut } from '../shortcuts/noteGlobal'
import { resolveNoteFeedShortcut } from '../shortcuts/noteFeed'
import { isOpenTagListShortcut } from '../shortcuts/tagList'
import { isTextInputTarget, getClosestNoteId } from '../lib/dom-utils'
import { extractInstagramUrls } from '../lib/instagram-url-utils'
import { useDragAndDrop } from '../hooks'

export function NoteFeed() {
  const {
    notes,
    createNote,
    deleteNote,
    addAttachment,
    updateNote,
    createNoteWithInstagram,
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
  const flatNotes = filterTag
    ? notes.filter((note) => note.tags.some((t) => t.name === filterTag))
    : notes

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

  const groupByDate = (notes: typeof flatNotes) => {
    const groups: { date: string; notes: typeof flatNotes }[] = []
    const map: Record<string, typeof flatNotes> = {}

    for (const note of notes) {
      const date = new Date(note.createdAt).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
      if (!map[date]) {
        map[date] = []
        groups.push({ date, notes: map[date] })
      }
      map[date].push(note)
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
      const noteId = flatNotes[focusedIndex].id
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
      const fallbackNoteId = focusedIndex !== null ? flatNotes[focusedIndex]?.id : null
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
        const note = flatNotes[focusedIndex]
        if (note) {
          cardRefs.current.get(note.id)?.focus()
          setFocusedIndex(null)
        }
        return
      }

      if (action === 'deleteFocused') {
        if (focusedIndex === null) return
        e.preventDefault()
        const note = flatNotes[focusedIndex]
        if (note && window.confirm('이 노트를 삭제하시겠습니까?')) {
          deleteNote(note.id)
          if (flatNotes.length > 1) {
            const nextIndex = focusedIndex >= flatNotes.length - 1 ? focusedIndex - 1 : focusedIndex
            setFocusedIndex(nextIndex)
          } else {
            setFocusedIndex(null)
          }
        }
      }
    }

    window.addEventListener('keydown', handleGlobalNavigation)
    return () => window.removeEventListener('keydown', handleGlobalNavigation)
  }, [focusedIndex, flatNotes, deleteNote])

  // 피드에서 붙여넣기 -> 새 노트 생성
  const handlePaste = useCallback(
    async (e: ClipboardEvent) => {
      console.info('[paste] start', {
        hasClipboard: Boolean(e.clipboardData),
        activeElement: document.activeElement?.tagName,
      })
      const items = e.clipboardData?.items
      if (!items) {
        console.warn('[paste] no clipboard items')
        return
      }

      // 파일/이미지 처리
      for (const item of items) {
        if (item.kind === 'file') {
          const file = item.getAsFile()
          if (!file) continue

          e.preventDefault()
          console.info('[paste] file detected', {
            name: file.name,
            type: file.type,
            size: file.size,
          })
          await createNoteWithFile(file)
          return
        }
      }

      // 텍스트 처리 - 새 노트 본문으로
      const text = e.clipboardData?.getData('text/plain')
      if (text) {
        e.preventDefault()
        console.info('[paste] text detected', { length: text.length })
        console.info('[paste] text contains instagram', {
          hasInstagram: text.includes('instagram.com') || text.includes('instagr.am'),
        })

        const instagramUrls = extractInstagramUrls(text)
        if (instagramUrls.length > 0) {
          console.info('[paste] instagram urls', instagramUrls)
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

        console.info('[paste] plain text -> create note')
        const note = await createNote()
        await updateNote(note.id, text)
        setTimeout(() => {
          cardRefs.current.get(note.id)?.focus()
        }, 50)
      }
    },
    [createNote, createNoteWithFile, createNoteWithInstagram, updateNote]
  )

  // 태그 다이얼로그에 전달할 현재 노트의 태그 목록 (필터링되지 않은 전체 notes에서 검색)
  const tagDialogNote = tagDialogNoteId ? notes.find((n) => n.id === tagDialogNoteId) : null
  const tagDialogExistingTags = tagDialogNote?.tags.map((t) => t.name) ?? []

  return (
    <div
      ref={feedRef}
      className={`feed ${isDragOver ? 'drag-over' : ''}`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
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
        {grouped.map(({ date, notes: dateNotes }) => (
          <div key={date} className="date-group">
            <div className="date-label">{date}</div>
            {dateNotes.map((note) => {
              const globalIndex = flatNotes.findIndex((n) => n.id === note.id)
              return (
                <div
                  key={note.id}
                  ref={(el) => {
                    if (el) cardElementRefs.current.set(note.id, el)
                    else cardElementRefs.current.delete(note.id)
                  }}
                >
                  <NoteCard
                    ref={(handle) => setCardRef(note.id, handle)}
                    note={note}
                    isFocused={focusedIndex === globalIndex}
                    onEscapeFromNormal={() => handleEscapeFromNormal(globalIndex)}
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
