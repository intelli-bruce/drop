import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react'
import { EditorView, basicSetup } from 'codemirror'
import { EditorState } from '@codemirror/state'
import { markdown } from '@codemirror/lang-markdown'
import { vim, getCM } from '@replit/codemirror-vim'
import { oneDark } from '@codemirror/theme-one-dark'
import { livePreview, livePreviewTheme } from '../lib/livePreview'
import { useNotesStore } from '../stores/notes'
import type { Note } from '@throw/shared'

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
    const editorRef = useRef<HTMLDivElement>(null)
    const viewRef = useRef<EditorView | null>(null)
    const noteIdRef = useRef(note.id)
    const onEscapeRef = useRef(onEscapeFromNormal)
    const { updateNote, deleteNote } = useNotesStore()

    noteIdRef.current = note.id
    onEscapeRef.current = onEscapeFromNormal

    useImperativeHandle(ref, () => ({
      focus: () => {
        viewRef.current?.focus()
      },
    }))

    useEffect(() => {
      if (!editorRef.current) return

      const state = EditorState.create({
        doc: note.content,
        extensions: [
          vim(),
          basicSetup,
          markdown(),
          livePreview,
          livePreviewTheme,
          oneDark,
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              updateNote(noteIdRef.current, update.state.doc.toString())
            }
          }),
          EditorView.theme({
            '&': { minHeight: '60px' },
            '.cm-scroller': { overflow: 'auto' },
            '.cm-line': { padding: '0 4px' },
          }),
        ],
      })

      const view = new EditorView({
        state,
        parent: editorRef.current,
      })
      viewRef.current = view

      // ESC in normal mode -> blur and notify parent
      let wasNormalMode = false

      const checkModeBeforeEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          const cm = getCM(view)
          const vimState = cm?.state?.vim
          wasNormalMode = !!(vimState && !vimState.insertMode && !vimState.visualMode)
        }
      }

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && wasNormalMode) {
          e.preventDefault()
          e.stopPropagation()
          view.contentDOM.blur()
          onEscapeRef.current()
        }
      }

      view.contentDOM.addEventListener('keydown', checkModeBeforeEsc, true)
      view.contentDOM.addEventListener('keydown', handleKeyDown)

      return () => {
        view.contentDOM.removeEventListener('keydown', checkModeBeforeEsc, true)
        view.contentDOM.removeEventListener('keydown', handleKeyDown)
        view.destroy()
        viewRef.current = null
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [note.id])

    const formatTime = (date: Date) => {
      return new Intl.DateTimeFormat('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(date))
    }

    return (
      <div className={`note-card ${isFocused ? 'focused' : ''}`}>
        <div className="note-card-header">
          <span className="note-time">{formatTime(note.createdAt)}</span>
          <button className="delete-btn" onClick={() => deleteNote(note.id)}>
            ×
          </button>
        </div>
        <div ref={editorRef} className="note-editor" />
      </div>
    )
  }
)

NoteCard.displayName = 'NoteCard'
