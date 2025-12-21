import { useRef, useState, useCallback, useEffect, DragEvent, ClipboardEvent } from 'react'
import { useNotesStore } from '../stores/notes'
import { NoteCard, NoteCardHandle } from './NoteCard'

const INSTAGRAM_URL_REGEX =
  /https?:\/\/(?:www\.)?instagram\.com\/(?:p|reel|reels)\/[A-Za-z0-9_-]+\/?/g

export function NoteFeed() {
  const { notes, createNote, deleteNote, addAttachment, updateNote, createNoteWithInstagram } =
    useNotesStore()
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const cardRefs = useRef<Map<string, NoteCardHandle>>(new Map())
  const feedRef = useRef<HTMLDivElement>(null)

  const flatNotes = notes

  const handleEscapeFromNormal = useCallback((index: number) => {
    setFocusedIndex(index)
    feedRef.current?.focus()
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (flatNotes.length === 0) return

      // ESC로 포커스 해제
      if (e.key === 'Escape') {
        e.preventDefault()
        setFocusedIndex(null)
        return
      }

      // j/k 또는 방향키로 포커스 생성 및 이동
      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault()
        if (focusedIndex === null) {
          setFocusedIndex(0)
        } else {
          const nextIndex = Math.min(focusedIndex + 1, flatNotes.length - 1)
          setFocusedIndex(nextIndex)
        }
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault()
        if (focusedIndex === null) {
          setFocusedIndex(flatNotes.length - 1)
        } else {
          const prevIndex = Math.max(focusedIndex - 1, 0)
          setFocusedIndex(prevIndex)
        }
      } else if (e.key === 'Enter' && focusedIndex !== null) {
        e.preventDefault()
        const note = flatNotes[focusedIndex]
        if (note) {
          cardRefs.current.get(note.id)?.focus()
          setFocusedIndex(null)
        }
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && focusedIndex !== null) {
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
    },
    [focusedIndex, flatNotes, deleteNote]
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
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault()
        handleCreateNote()
      }
    }

    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [handleCreateNote])

  // 초기 포커스
  useEffect(() => {
    feedRef.current?.focus()
  }, [])

  // 새 노트 생성 + 첨부물 추가 헬퍼
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

  // 피드에서 붙여넣기 -> 새 노트 생성
  const handlePaste = useCallback(
    async (e: ClipboardEvent) => {
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

      // 텍스트 처리 - 새 노트 본문으로
      const text = e.clipboardData?.getData('text/plain')
      if (text) {
        e.preventDefault()

        const instagramUrls = text.match(INSTAGRAM_URL_REGEX)
        if (instagramUrls && instagramUrls.length > 0) {
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

        const note = await createNote()
        await updateNote(note.id, text)
        setTimeout(() => {
          cardRefs.current.get(note.id)?.focus()
        }, 50)
      }
    },
    [createNote, createNoteWithFile, createNoteWithInstagram, updateNote]
  )

  // 피드에 드래그 앤 드롭 -> 새 노트 생성
  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    async (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragOver(false)

      const files = Array.from(e.dataTransfer.files)
      for (const file of files) {
        await createNoteWithFile(file)
      }
    },
    [createNoteWithFile]
  )

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
      <div className="feed-header">
        <button className="new-note-btn" onClick={handleCreateNote}>
          + 새 노트
        </button>
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
