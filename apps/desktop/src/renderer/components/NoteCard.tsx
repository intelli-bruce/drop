import { useRef, useCallback, forwardRef, useImperativeHandle, useState, DragEvent } from 'react'
import { LexicalEditor, LexicalEditorHandle } from './LexicalEditor'
import { AttachmentList } from './AttachmentList'
import { TagList } from './TagList'
import { TagInput, TagInputHandle } from './TagInput'
import { useNotesStore } from '../stores/notes'
import type { Note } from '@throw/shared'

interface Props {
  note: Note
  isFocused: boolean
  onEscapeFromNormal: () => void
}

export interface NoteCardHandle {
  focus: () => void
  openTagList: () => void
}

export const NoteCard = forwardRef<NoteCardHandle, Props>(
  ({ note, isFocused, onEscapeFromNormal }, ref) => {
    const editorRef = useRef<LexicalEditorHandle>(null)
    const tagInputRef = useRef<TagInputHandle>(null)
    const [isDragOver, setIsDragOver] = useState(false)
    const { updateNote, deleteNote, addAttachment, removeAttachment } = useNotesStore()

    useImperativeHandle(ref, () => ({
      focus: () => editorRef.current?.focus(),
      openTagList: () => tagInputRef.current?.openList(),
    }))

    const handleChange = useCallback(
      (content: string) => {
        updateNote(note.id, content)
      },
      [note.id, updateNote]
    )

    const handleAddFile = useCallback(
      (file: File) => {
        addAttachment(note.id, file)
      },
      [note.id, addAttachment]
    )

    const handleRemoveAttachment = useCallback(
      (attachmentId: string) => {
        removeAttachment(note.id, attachmentId)
      },
      [note.id, removeAttachment]
    )

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
      (e: DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragOver(false)

        const files = Array.from(e.dataTransfer.files)
        files.forEach((file) => {
          handleAddFile(file)
        })
      },
      [handleAddFile]
    )

    const formatTime = (date: Date) => {
      const now = new Date()
      const target = new Date(date)
      const diffMs = now.getTime() - target.getTime()
      const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

      if (diffMs < 0) {
        return new Intl.DateTimeFormat('ko-KR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
          timeZone: localTimeZone,
        }).format(target)
      }

      if (diffMs < 60_000) {
        const seconds = Math.max(1, Math.floor(diffMs / 1000))
        return `${seconds}초전`
      }

      if (diffMs < 60 * 60_000) {
        const minutes = Math.max(1, Math.floor(diffMs / 60_000))
        return `${minutes}분전`
      }

      // 로컬 타임존 기준으로 날짜 비교
      const getLocalDateParts = (d: Date) => {
        const formatter = new Intl.DateTimeFormat('en-CA', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          timeZone: localTimeZone,
        })
        return formatter.format(d)
      }

      const timeOnly = new Intl.DateTimeFormat('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: localTimeZone,
      }).format(target)

      if (getLocalDateParts(target) === getLocalDateParts(now)) {
        return `오늘 ${timeOnly}`
      }

      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      if (getLocalDateParts(target) === getLocalDateParts(yesterday)) {
        return `어제 ${timeOnly}`
      }

      return new Intl.DateTimeFormat('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: localTimeZone,
      }).format(target)
    }

    return (
      <div
        className={`note-card ${isFocused ? 'focused' : ''} ${isDragOver ? 'drag-over' : ''}`}
        data-note-id={note.id}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="note-card-header">
          <span className="note-time">{formatTime(note.createdAt)}</span>
          <button
            className="delete-btn"
            onClick={() => {
              if (window.confirm('이 노트를 삭제하시겠습니까?')) {
                deleteNote(note.id)
              }
            }}
          >
            ×
          </button>
        </div>
        <div className="note-editor">
          <LexicalEditor
            key={note.id}
            ref={editorRef}
            initialContent={note.content}
            onChange={handleChange}
            onEscape={onEscapeFromNormal}
            onAddFile={handleAddFile}
          />
        </div>
        <AttachmentList attachments={note.attachments} onRemove={handleRemoveAttachment} />
        <div className="note-tags-section">
          <TagList noteId={note.id} tags={note.tags} />
          <TagInput
            ref={tagInputRef}
            noteId={note.id}
            existingTagNames={note.tags.map((t) => t.name)}
          />
        </div>
      </div>
    )
  }
)

NoteCard.displayName = 'NoteCard'
