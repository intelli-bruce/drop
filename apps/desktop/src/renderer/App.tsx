import { useEffect } from 'react'
import { useNotesStore } from './stores/notes'
import { NoteFeed } from './components/NoteFeed'

const isLocal = import.meta.env.VITE_SUPABASE_URL?.includes('127.0.0.1')
const envLabel = isLocal ? 'LOCAL' : 'REMOTE'

function App() {
  const { loadNotes, subscribeToChanges } = useNotesStore()

  useEffect(() => {
    loadNotes()

    // Realtime 구독 시작
    const unsubscribe = subscribeToChanges()

    return () => {
      unsubscribe()
    }
  }, [loadNotes, subscribeToChanges])

  return (
    <div className="app">
      {import.meta.env.DEV && (
        <div
          style={{
            position: 'fixed',
            top: 8,
            right: 8,
            padding: '4px 8px',
            borderRadius: 4,
            fontSize: 11,
            fontWeight: 600,
            color: '#fff',
            backgroundColor: isLocal ? '#10b981' : '#f59e0b',
            zIndex: 9999,
            opacity: 0.9,
          }}
        >
          {envLabel}
        </div>
      )}
      <NoteFeed />
    </div>
  )
}

export default App
