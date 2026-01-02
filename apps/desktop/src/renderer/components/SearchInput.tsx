import { useState, useCallback, useEffect, useRef } from 'react'
import { useNotesStore } from '../stores/notes'

export function SearchInput() {
  const [inputValue, setInputValue] = useState('')
  const setSearchQuery = useNotesStore((s) => s.setSearchQuery)
  const searchQuery = useNotesStore((s) => s.searchQuery)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setInputValue(value)

      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }

      debounceRef.current = setTimeout(() => {
        setSearchQuery(value.trim() || null)
      }, 300)
    },
    [setSearchQuery]
  )

  const handleClear = useCallback(() => {
    setInputValue('')
    setSearchQuery(null)
    inputRef.current?.focus()
  }, [setSearchQuery])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        handleClear()
      }
    },
    [handleClear]
  )

  useEffect(() => {
    if (searchQuery === null && inputValue !== '') {
      setInputValue('')
    }
  }, [searchQuery, inputValue])

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  return (
    <div className="search-input-container">
      <span className="search-input-icon">🔍</span>
      <input
        ref={inputRef}
        type="text"
        className="search-input"
        placeholder="검색..."
        value={inputValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
      {inputValue && (
        <button className="search-input-clear" onClick={handleClear} type="button">
          &times;
        </button>
      )}
    </div>
  )
}
