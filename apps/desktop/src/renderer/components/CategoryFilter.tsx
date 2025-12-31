import { useNotesStore } from '../stores/notes'

export function CategoryFilter() {
  const categoryFilter = useNotesStore((s) => s.categoryFilter)
  const setCategoryFilter = useNotesStore((s) => s.setCategoryFilter)

  const filters = [
    { key: null, label: '전체' },
    { key: 'link' as const, label: '링크', icon: '🔗' },
    { key: 'media' as const, label: '미디어', icon: '🖼' },
    { key: 'files' as const, label: '파일', icon: '📎' },
  ]

  return (
    <div className="category-filter">
      {filters.map((f) => (
        <button
          key={f.key ?? 'all'}
          className={`category-filter-btn ${categoryFilter === f.key ? 'active' : ''}`}
          onClick={() => setCategoryFilter(f.key)}
        >
          {f.icon && <span className="category-filter-icon">{f.icon}</span>}
          {f.label}
        </button>
      ))}
    </div>
  )
}
