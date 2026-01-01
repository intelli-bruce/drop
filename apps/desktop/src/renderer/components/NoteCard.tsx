import { useRef, useCallback, forwardRef, useImperativeHandle, useState, memo } from 'react'
import { LexicalEditor, LexicalEditorHandle } from './LexicalEditor'
import { AttachmentList } from './AttachmentList'
import { LinkPreviews } from './LinkPreviews'
import { TagList } from './TagList'
import { TagInput, TagInputHandle } from './TagInput'
import { LockedNoteOverlay } from './LockedNoteOverlay'
import { PinDialog } from './PinDialog'
import { useNotesStore } from '../stores/notes'
import { useProfileStore } from '../stores/profile'
import { formatRelativeTime } from '../lib/time-utils'
import { useDragAndDrop } from '../hooks'
import type { Note } from '@drop/shared'
import type { NoteViewMode } from '../stores/notes/types'

interface Props {
  note: Note
  isFocused: boolean
  depth?: number
  viewMode?: NoteViewMode
  onEscapeFromNormal: () => void
  onReply?: (noteId: string) => void
}

export interface NoteCardHandle {
  focus: () => void
  openTagList: () => void
}

export const NoteCard = memo(forwardRef<NoteCardHandle, Props>(
  ({ note, isFocused, depth = 0, viewMode = 'active', onEscapeFromNormal, onReply }, ref) => {
    const editorRef = useRef<LexicalEditorHandle>(null)
    const tagInputRef = useRef<TagInputHandle>(null)
    const [showPinDialog, setShowPinDialog] = useState(false)
    const [pinDialogMode, setPinDialogMode] = useState<'setup' | 'unlock'>('setup')

    const {
      updateNote,
      deleteNote,
      addAttachment,
      removeAttachment,
      toggleNoteLock,
      sessionUnlocked,
      archiveNote,
      unarchiveNote,
      restoreNote,
      permanentlyDeleteNote,
    } = useNotesStore()
    const hasPin = useProfileStore((s) => s.hasPin)

    const isLocked = note.isLocked && !sessionUnlocked

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

    const handleLockToggle = () => {
      if (!note.isLocked && !hasPin) {
        // PIN이 없으면 먼저 설정하도록 유도
        setPinDialogMode('setup')
        setShowPinDialog(true)
        return
      }
      // 잠금 해제하려면 PIN 확인 필요
      if (note.isLocked) {
        setPinDialogMode('unlock')
        setShowPinDialog(true)
        return
      }
      toggleNoteLock(note.id)
    }

    const handleUnlock = () => {
      setPinDialogMode('unlock')
      setShowPinDialog(true)
    }

    return (
      <>
        <div
          className={`note-card ${isFocused ? 'focused' : ''} ${isDragOver ? 'drag-over' : ''} ${depth > 0 ? 'note-card-reply' : ''} ${isLocked ? 'locked' : ''}`}
          style={indentStyle}
          data-note-id={note.id}
          onDragOver={isLocked ? undefined : handleDragOver}
          onDragLeave={isLocked ? undefined : handleDragLeave}
          onDrop={isLocked ? undefined : handleDrop}
        >
          <div className="note-card-header">
            <span className="note-time">{formatRelativeTime(note.createdAt)}</span>
            <div className="note-card-actions">
              {viewMode === 'active' && (
                <>
                  <button
                    className={`lock-btn ${note.isLocked ? 'locked' : ''}`}
                    onClick={handleLockToggle}
                    title={note.isLocked ? '잠금 해제' : '잠금'}
                  >
                    {note.isLocked ? '🔒' : '🔓'}
                  </button>
                  {onReply && !isLocked && (
                    <button className="reply-btn" onClick={() => onReply(note.id)} title="답글">
                      ↩
                    </button>
                  )}
                  {!isLocked && (
                    <button
                      className="archive-btn"
                      onClick={() => archiveNote(note.id)}
                      title="보관"
                    >
                      📦
                    </button>
                  )}
                  {!isLocked && (
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
                  )}
                </>
              )}
              {viewMode === 'archived' && (
                <>
                  <button
                    className="unarchive-btn"
                    onClick={() => unarchiveNote(note.id)}
                    title="보관 해제"
                  >
                    ↩
                  </button>
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
                </>
              )}
              {viewMode === 'trash' && (
                <>
                  <button
                    className="restore-btn"
                    onClick={() => restoreNote(note.id)}
                    title="복원"
                  >
                    ↩
                  </button>
                  <button
                    className="permanent-delete-btn"
                    onClick={() => {
                      if (window.confirm('이 노트를 영구 삭제하시겠습니까? 복원할 수 없습니다.')) {
                        permanentlyDeleteNote(note.id)
                      }
                    }}
                    title="영구 삭제"
                  >
                    🗑️
                  </button>
                </>
              )}
            </div>
          </div>
          {isLocked ? (
            <LockedNoteOverlay onUnlock={handleUnlock} />
          ) : (
            <>
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
              <LinkPreviews content={note.content} attachments={note.attachments} />
              <div className="note-tags-section">
                <TagList noteId={note.id} tags={note.tags} />
                <TagInput
                  ref={tagInputRef}
                  noteId={note.id}
                  existingTagNames={note.tags.map((t) => t.name)}
                />
              </div>
            </>
          )}
        </div>
        {showPinDialog && (
          <PinDialog
            mode={pinDialogMode}
            onSuccess={() => {
              setShowPinDialog(false)
              toggleNoteLock(note.id)
            }}
            onCancel={() => setShowPinDialog(false)}
          />
        )}
      </>
    )
  }
))

NoteCard.displayName = 'NoteCard'
