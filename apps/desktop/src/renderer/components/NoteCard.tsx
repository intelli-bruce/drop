import { useRef, useCallback, forwardRef, useImperativeHandle, useState, DragEvent } from 'react'
import { LexicalEditor, LexicalEditorHandle } from './LexicalEditor'
import { AttachmentList } from './AttachmentList'
import { useNotesStore } from '../stores/notes'
import type { Note, CreateAttachmentInput } from '@throw/shared'

interface Props {
  note: Note
  isFocused: boolean
  onEscapeFromNormal: () => void
}

export interface NoteCardHandle {
  focus: () => void
}

export const NoteCard = forwardRef<NoteCardHandle, Props>(
  ({ note, isFocused, onEscapeFromNormal }, ref) => {
    const editorRef = useRef<LexicalEditorHandle>(null)
    const [isDragOver, setIsDragOver] = useState(false)
    const { updateNote, deleteNote, addAttachment, removeAttachment } = useNotesStore()

    useImperativeHandle(ref, () => ({
      focus: () => editorRef.current?.focus(),
    }))

    const handleChange = useCallback(
      (content: string) => {
        updateNote(note.id, content)
      },
      [note.id, updateNote]
    )

    const handleAddAttachment = useCallback(
      (input: CreateAttachmentInput) => {
        addAttachment(note.id, input)
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
          const reader = new FileReader()
          reader.onload = () => {
            const base64 = reader.result as string

            if (file.type.startsWith('image/')) {
              handleAddAttachment({
                type: 'image',
                data: base64,
                title: file.name,
                mimeType: file.type,
                size: file.size,
              })
            } else {
              handleAddAttachment({
                type: 'file',
                data: base64,
                title: file.name,
                mimeType: file.type,
                size: file.size,
              })
            }
          }
          reader.readAsDataURL(file)
        })
      },
      [handleAddAttachment]
    )

    const formatTime = (date: Date) => {
      return new Intl.DateTimeFormat('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(date))
    }

    return (
      <div
        className={`note-card ${isFocused ? 'focused' : ''} ${isDragOver ? 'drag-over' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="note-card-header">
          <span className="note-time">{formatTime(note.createdAt)}</span>
          <button className="delete-btn" onClick={() => deleteNote(note.id)}>
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
            onAddAttachment={handleAddAttachment}
          />
        </div>
        <AttachmentList
          attachments={note.attachments}
          onRemove={handleRemoveAttachment}
        />
      </div>
    )
  }
)

NoteCard.displayName = 'NoteCard'
