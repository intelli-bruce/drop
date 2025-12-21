import { useEffect } from 'react'
import { useNotesStore } from './stores/notes'
import { NoteFeed } from './components/NoteFeed'

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
      <NoteFeed />
    </div>
  )
}

export default App
