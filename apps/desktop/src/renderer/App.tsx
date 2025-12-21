import { useEffect } from 'react'
import { useNotesStore } from './stores/notes'
import { NoteFeed } from './components/NoteFeed'

function App() {
  const { loadNotes } = useNotesStore()

  useEffect(() => {
    loadNotes()
  }, [loadNotes])

  return (
    <div className="app">
      <NoteFeed />
    </div>
  )
}

export default App
