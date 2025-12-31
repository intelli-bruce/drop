import { useNotesStore } from '../stores/notes'
import type { NoteViewMode } from '../stores/notes'

export function ViewModeSelector() {
  const viewMode = useNotesStore((s) => s.viewMode)
  const setViewMode = useNotesStore((s) => s.setViewMode)
  const trashedNotes = useNotesStore((s) => s.trashedNotes)
  const archivedNotes = useNotesStore((s) => s.archivedNotes)

  const modes: Array<{ key: NoteViewMode; label: string; icon: string; count?: number }> = [
    { key: 'active', label: '노트', icon: '📝' },
    { key: 'archived', label: '보관함', icon: '📦', count: archivedNotes.length },
    { key: 'trash', label: '휴지통', icon: '🗑️', count: trashedNotes.length },
  ]

  return (
    <div className="view-mode-selector">
      {modes.map((m) => (
        <button
          key={m.key}
          className={`view-mode-btn ${viewMode === m.key ? 'active' : ''}`}
          onClick={() => setViewMode(m.key)}
          title={m.label}
        >
          <span className="view-mode-icon">{m.icon}</span>
          <span className="view-mode-label">{m.label}</span>
          {m.count !== undefined && m.count > 0 && (
            <span className="view-mode-count">{m.count}</span>
          )}
        </button>
      ))}
    </div>
  )
}
