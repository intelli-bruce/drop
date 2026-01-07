import { useEffect, useState, useCallback } from 'react'
import { useNotesStore } from './stores/notes'
import { useAuthStore } from './stores/auth'
import { useProfileStore } from './stores/profile'
import { NoteFeed } from './components/NoteFeed'
import { AuthScreen } from './components/AuthScreen'
import { QuickCapture } from './components/QuickCapture'
import { UserMenu } from './components/UserMenu'
import { BookSearchDialog } from './components/BookSearchDialog'
import { BooksView } from './components/BooksView'
import { BookDetail } from './components/BookDetail'
import { isTextInputTarget, getClosestNoteId } from './lib/dom-utils'

const isLocal = import.meta.env.VITE_SUPABASE_URL?.includes('127.0.0.1')
const envLabel = isLocal ? 'LOCAL' : 'REMOTE'

type MainTab = 'notes' | 'books'

function App() {
  const {
    loadNotes,
    loadTags,
    subscribeToChanges,
    createNote,
    openBookSearch,
    openBookSearchForLinking,
    selectedBookId,
    selectedNoteId,
  } = useNotesStore()
  const { user, isAuthLoading, initializeAuth } = useAuthStore()
  const loadProfile = useProfileStore((s) => s.loadProfile)
  const [route, setRoute] = useState(() => window.location.hash.replace('#', '') || 'main')
  const [activeTab, setActiveTab] = useState<MainTab>('notes')

  // 단축키: Cmd+Shift+B (책 검색), Cmd+B (노트에 책 연결)
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Cmd+Shift+B: 책 검색 (서재에 추가)
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'b') {
        e.preventDefault()
        openBookSearch()
        return
      }

      // Cmd+B: 노트에 책 연결
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key.toLowerCase() === 'b') {
        e.preventDefault()

        // 1. 노트 편집 중이면 해당 노트의 ID 가져오기
        if (isTextInputTarget(document.activeElement)) {
          const noteId = getClosestNoteId(document.activeElement)
          if (noteId) {
            openBookSearchForLinking(noteId)
            return
          }
        }

        // 2. 피드에서 노트가 선택되어 있으면 해당 노트에 연결
        if (selectedNoteId) {
          openBookSearchForLinking(selectedNoteId)
          return
        }
      }
    },
    [openBookSearch, openBookSearchForLinking, selectedNoteId]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Handle hash-based routing
  useEffect(() => {
    const handleHashChange = () => {
      setRoute(window.location.hash.replace('#', '') || 'main')
    }
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  // Listen for quick capture note creation from main process
  useEffect(() => {
    if (!user) return
    const unsubscribe = window.api.quickCapture.onNoteCreated((content) => {
      createNote(content)
    })
    return () => {
      unsubscribe()
    }
  }, [user, createNote])

  // Listen for refresh event from QuickCapture (파일/이미지/특수URL 직접 저장 후)
  useEffect(() => {
    if (!user) return
    const unsubscribe = window.api.quickCapture.onRefresh(() => {
      // QuickCapture에서 직접 저장했으므로 노트 목록 새로고침
      loadNotes()
    })
    return () => {
      unsubscribe()
    }
  }, [user, loadNotes])

  // Initialize auth on mount
  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  // Load data when authenticated
  useEffect(() => {
    if (!user) return

    loadNotes()
    loadTags()
    loadProfile()

    // Realtime 구독 시작
    const unsubscribe = subscribeToChanges()

    return () => {
      unsubscribe()
    }
  }, [user, loadNotes, loadTags, loadProfile, subscribeToChanges])

  // Quick Capture route - minimal UI, separate window
  if (route === 'quick-capture') {
    return <QuickCapture />
  }

  // Show loading state while checking auth
  if (isAuthLoading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: '#1a1a1a',
          color: '#888',
        }}
      >
        Loading...
      </div>
    )
  }

  // Show auth screen if not logged in
  if (!user) {
    return <AuthScreen />
  }

  return (
    <div className="app">
      <div className="app-header">
        <div className="app-tabs">
          <button
            className={`app-tab ${activeTab === 'notes' ? 'active' : ''}`}
            onClick={() => setActiveTab('notes')}
          >
            노트
          </button>
          <button
            className={`app-tab ${activeTab === 'books' ? 'active' : ''}`}
            onClick={() => setActiveTab('books')}
          >
            서재
          </button>
        </div>
        <div className="app-header-right">
          {import.meta.env.DEV && (
            <div
              style={{
                padding: '4px 8px',
                borderRadius: 4,
                fontSize: 11,
                fontWeight: 600,
                color: '#fff',
                backgroundColor: isLocal ? '#10b981' : '#f59e0b',
                opacity: 0.9,
              }}
            >
              {envLabel}
            </div>
          )}
          <UserMenu />
        </div>
      </div>

      <div className="app-content">
        {activeTab === 'notes' ? <NoteFeed /> : <BooksView />}
      </div>

      <BookSearchDialog />
      {selectedBookId && <BookDetail />}
    </div>
  )
}

export default App
