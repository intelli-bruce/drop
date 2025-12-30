import { useEffect, useState } from 'react'
import { useNotesStore } from './stores/notes'
import { useAuthStore } from './stores/auth'
import { NoteFeed } from './components/NoteFeed'
import { AuthScreen } from './components/AuthScreen'
import { QuickCapture } from './components/QuickCapture'
import { UserMenu } from './components/UserMenu'

const isLocal = import.meta.env.VITE_SUPABASE_URL?.includes('127.0.0.1')
const envLabel = isLocal ? 'LOCAL' : 'REMOTE'

function App() {
  const { loadNotes, loadTags, subscribeToChanges, createNote } = useNotesStore()
  const { user, isAuthLoading, initializeAuth } = useAuthStore()
  const [route, setRoute] = useState(() => window.location.hash.replace('#', '') || 'main')

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

    // Realtime 구독 시작
    const unsubscribe = subscribeToChanges()

    return () => {
      unsubscribe()
    }
  }, [user, loadNotes, loadTags, subscribeToChanges])

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
      <div
        style={{
          position: 'fixed',
          top: 12,
          right: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          zIndex: 10000,
          WebkitAppRegion: 'no-drag',
          pointerEvents: 'auto',
        } as React.CSSProperties}
      >
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
      <NoteFeed />
    </div>
  )
}

export default App
