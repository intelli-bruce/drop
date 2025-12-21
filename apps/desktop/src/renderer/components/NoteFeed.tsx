import { useRef, useState, useCallback } from 'react'
import { useNotesStore } from '../stores/notes'
import { NoteCard, NoteCardHandle } from './NoteCard'

export function NoteFeed() {
  const { notes, createNote } = useNotesStore()
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null)
  const cardRefs = useRef<Map<string, NoteCardHandle>>(new Map())
  const feedRef = useRef<HTMLDivElement>(null)

  const flatNotes = notes

  const handleEscapeFromNormal = useCallback((index: number) => {
    setFocusedIndex(index)
    feedRef.current?.focus()
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (focusedIndex === null) return

      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault()
        const nextIndex = Math.min(focusedIndex + 1, flatNotes.length - 1)
        setFocusedIndex(nextIndex)
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault()
        const prevIndex = Math.max(focusedIndex - 1, 0)
        setFocusedIndex(prevIndex)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        const note = flatNotes[focusedIndex]
        if (note) {
          cardRefs.current.get(note.id)?.focus()
          setFocusedIndex(null)
        }
      }
    },
    [focusedIndex, flatNotes]
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

  const setCardRef = (id: string, handle: NoteCardHandle | null) => {
    if (handle) {
      cardRefs.current.set(id, handle)
    } else {
      cardRefs.current.delete(id)
    }
  }

  // 새 노트 생성 후 해당 노트 편집 모드로
  const handleCreateNote = async () => {
    const note = await createNote()
    setTimeout(() => {
      cardRefs.current.get(note.id)?.focus()
    }, 50)
  }

  return (
    <div
      ref={feedRef}
      className="feed"
      tabIndex={0}
      onKeyDown={handleKeyDown}
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
                <NoteCard
                  key={note.id}
                  ref={(handle) => setCardRef(note.id, handle)}
                  note={note}
                  isFocused={focusedIndex === globalIndex}
                  onEscapeFromNormal={() => handleEscapeFromNormal(globalIndex)}
                />
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
