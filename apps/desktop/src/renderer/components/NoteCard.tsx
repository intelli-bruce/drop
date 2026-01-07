import { useRef, useCallback, forwardRef, useImperativeHandle, useState, memo, useMemo } from 'react'
import { LexicalEditor, LexicalEditorHandle } from './LexicalEditor'
import { AttachmentList } from './AttachmentList'
import { LinkPreviews } from './LinkPreviews'
import { LinkedBooks } from './LinkedBooks'
import { TagList } from './TagList'
import { TagInput, TagInputHandle } from './TagInput'
import { LockedNoteOverlay } from './LockedNoteOverlay'
import { PinDialog, type PinDialogMode } from './PinDialog'
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

export const NoteCard = memo(
  forwardRef<NoteCardHandle, Props>(
    ({ note, isFocused, depth = 0, viewMode = 'active', onEscapeFromNormal, onReply }, ref) => {
      const editorRef = useRef<LexicalEditorHandle>(null)
      const tagInputRef = useRef<TagInputHandle>(null)
      const [showPinDialog, setShowPinDialog] = useState(false)
      const [pinDialogMode, setPinDialogMode] = useState<PinDialogMode>('setup')
      const [isExpanded, setIsExpanded] = useState(false)
      const [isEditing, setIsEditing] = useState(false)

      // 콘텐츠가 truncation이 필요한지 판단 (5줄 이상 또는 200자 이상)
      const isTruncatable = useMemo(() => {
        const lineCount = (note.content.match(/\n/g) || []).length + 1
        return lineCount > 5 || note.content.length > 200
      }, [note.content])

      // 축소 상태: truncatable이고, 확장되지 않았고, 편집 중이 아닐 때
      const isCollapsed = isTruncatable && !isExpanded && !isEditing

      const {
        updateNote,
        updateNotePriority,
        deleteNote,
        addAttachment,
        removeAttachment,
        temporarilyUnlockedNoteIds,
        temporarilyUnlockNote,
        permanentlyUnlockNote,
        lockNote,
        archiveNote,
        unarchiveNote,
        restoreNote,
        permanentlyDeleteNote,
        togglePinNote,
      } = useNotesStore()
      const hasPin = useProfileStore((s) => s.hasPin)

      // DB에서 잠금 상태이고 + 일시 해제되지 않은 경우에만 잠김
      const isLocked = note.isLocked && !temporarilyUnlockedNoteIds.has(note.id)

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

      // 헤더의 잠금 버튼 클릭: 잠금 설정 또는 완전 해제
      const handleLockToggle = () => {
        if (!note.isLocked && !hasPin) {
          // PIN이 없으면 먼저 설정하도록 유도
          setPinDialogMode('setup')
          setShowPinDialog(true)
          return
        }
        // 잠금 해제하려면 PIN 확인 필요 (완전 해제)
        if (note.isLocked) {
          setPinDialogMode('unlock-permanent')
          setShowPinDialog(true)
          return
        }
        // 잠금 설정 (이미 PIN이 있는 경우)
        lockNote(note.id)
      }

      // 일시 해제 버튼 클릭
      const handleTemporaryUnlock = () => {
        setPinDialogMode('unlock-temp')
        setShowPinDialog(true)
      }

      // 완전 해제 버튼 클릭
      const handlePermanentUnlock = () => {
        setPinDialogMode('unlock-permanent')
        setShowPinDialog(true)
      }

      const handlePinSuccess = () => {
        setShowPinDialog(false)
        switch (pinDialogMode) {
          case 'setup':
            lockNote(note.id)
            break
          case 'unlock-temp':
            temporarilyUnlockNote(note.id)
            break
          case 'unlock-permanent':
            permanentlyUnlockNote(note.id)
            break
        }
      }

      const handlePriorityClick = () => {
        const nextPriority = (note.priority + 1) % 4
        updateNotePriority(note.id, nextPriority)
      }

      const getPriorityLabel = (priority: number) => {
        switch (priority) {
          case 1:
            return { symbol: '!', className: 'priority-low' }
          case 2:
            return { symbol: '!!', className: 'priority-medium' }
          case 3:
            return { symbol: '!!!', className: 'priority-high' }
          default:
            return { symbol: '·', className: 'priority-none' }
        }
      }

      const priorityInfo = getPriorityLabel(note.priority)

      const cardClassName = [
          'note-card',
          isFocused && 'focused',
          isDragOver && 'drag-over',
          depth > 0 && 'note-card-reply',
          isLocked && 'locked',
          isCollapsed && 'collapsed',
          isTruncatable && 'truncatable',
        ]
          .filter(Boolean)
          .join(' ')

      return (
        <>
          <div
            className={cardClassName}
            style={indentStyle}
            data-note-id={note.id}
            onDragOver={isLocked ? undefined : handleDragOver}
            onDragLeave={isLocked ? undefined : handleDragLeave}
            onDrop={isLocked ? undefined : handleDrop}
          >
            <div className="note-card-header">
              <span className="note-id">#{note.displayId}</span>
              <span className="note-time">{formatRelativeTime(note.createdAt)}</span>
              {viewMode === 'active' && (
                <button
                  className={`priority-btn ${priorityInfo.className}`}
                  onClick={handlePriorityClick}
                  title={`Priority: ${note.priority}/3 (click to cycle)`}
                >
                  {priorityInfo.symbol}
                </button>
              )}
              <div className="note-card-actions">
                {viewMode === 'active' && (
                  <>
                    <button
                      className={`pin-btn ${note.isPinned ? 'pinned' : ''}`}
                      onClick={() => togglePinNote(note.id)}
                      title={note.isPinned ? '고정 해제 (p)' : '상단 고정 (p)'}
                    >
                      {note.isPinned ? '📌' : '📍'}
                    </button>
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
                        if (
                          window.confirm('이 노트를 영구 삭제하시겠습니까? 복원할 수 없습니다.')
                        ) {
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
              <LockedNoteOverlay
                onTemporaryUnlock={handleTemporaryUnlock}
                onPermanentUnlock={handlePermanentUnlock}
              />
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
                    onFocus={() => setIsEditing(true)}
                    onBlur={() => setIsEditing(false)}
                  />
                </div>
                {isTruncatable && (
                  <button
                    className="note-expand-btn"
                    onClick={() => setIsExpanded(!isExpanded)}
                  >
                    {isExpanded ? '접기 ▲' : '더보기 ▼'}
                  </button>
                )}
                <AttachmentList
                  attachments={note.attachments}
                  onRemove={handleRemoveAttachment}
                  maxVisible={isCollapsed ? 3 : undefined}
                  onShowMore={() => setIsExpanded(true)}
                />
                <LinkPreviews
                  content={note.content}
                  attachments={note.attachments}
                  maxVisible={isCollapsed ? 2 : undefined}
                  onShowMore={() => setIsExpanded(true)}
                />
                <LinkedBooks noteId={note.id} books={note.linkedBooks} />
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
              onSuccess={handlePinSuccess}
              onCancel={() => setShowPinDialog(false)}
            />
          )}
        </>
      )
    }
  )
)

NoteCard.displayName = 'NoteCard'
