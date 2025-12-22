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
  depth?: number
  onEscapeFromNormal: () => void
  onReply?: (noteId: string) => void
}

export interface NoteCardHandle {
  focus: () => void
  openTagList: () => void
}

export const NoteCard = forwardRef<NoteCardHandle, Props>(
  ({ note, isFocused, depth = 0, onEscapeFromNormal, onReply }, ref) => {
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
        // 동일한 content면 업데이트 스킵 (초기 렌더링 시 불필요한 호출 방지)
        if (content === note.content) return
        updateNote(note.id, content)
      },
      [note.id, note.content, updateNote]
    )

    const handleRemoveAttachment = useCallback(
      (attachmentId: string) => {
        removeAttachment(note.id, attachmentId)
      },
      [note.id, removeAttachment]
    )

    const indentStyle = depth > 0 ? { marginLeft: `${depth * 24}px` } : undefined

    return (
      <div
        className={`note-card ${isFocused ? 'focused' : ''} ${isDragOver ? 'drag-over' : ''} ${depth > 0 ? 'note-card-reply' : ''}`}
        style={indentStyle}
        data-note-id={note.id}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="note-card-header">
          <span className="note-time">{formatRelativeTime(note.createdAt)}</span>
          <div className="note-card-actions">
            {onReply && (
              <button
                className="reply-btn"
                onClick={() => onReply(note.id)}
                title="답글"
              >
                ↩
              </button>
            )}
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
