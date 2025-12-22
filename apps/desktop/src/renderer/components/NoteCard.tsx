import { useRef, useCallback, forwardRef, useImperativeHandle } from 'react'
import { LexicalEditor, LexicalEditorHandle } from './LexicalEditor'
import { AttachmentList } from './AttachmentList'
import { TagList } from './TagList'
import { TagInput, TagInputHandle } from './TagInput'
import { useNotesStore } from '../stores/notes'
import { formatRelativeTime } from '../lib/time-utils'
import { useDragAndDrop } from '../hooks'
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
    const { updateNote, deleteNote, addAttachment, removeAttachment } = useNotesStore()

    const handleAddFile = useCallback(
      (file: File) => {
        addAttachment(note.id, file)
      },
      [note.id, addAttachment]
    )

    const { isDragOver, handleDragOver, handleDragLeave, handleDrop } = useDragAndDrop({
      onDrop: (files) => files.forEach(handleAddFile),
    })

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

    const handleRemoveAttachment = useCallback(
      (attachmentId: string) => {
        removeAttachment(note.id, attachmentId)
      },
      [note.id, removeAttachment]
    )

    return (
      <div
        className={`note-card ${isFocused ? 'focused' : ''} ${isDragOver ? 'drag-over' : ''}`}
        data-note-id={note.id}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="note-card-header">
          <span className="note-time">{formatRelativeTime(note.createdAt)}</span>
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
