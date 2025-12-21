import { useState, useCallback, useRef, KeyboardEvent, forwardRef, useImperativeHandle } from 'react'
import { useNotesStore } from '../stores/notes'

interface Props {
  noteId: string
  existingTagNames: string[]
}

export interface TagInputHandle {
  focus: () => void
  openList: () => void
}

export const TagInput = forwardRef<TagInputHandle, Props>(({ noteId, existingTagNames }, ref) => {
  const { allTags, addTagToNote } = useNotesStore()
  const [inputValue, setInputValue] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  // 기존 태그 제외, 입력값으로 필터링
  const suggestions = allTags
    .filter((tag) => !existingTagNames.includes(tag.name))
    .filter((tag) => tag.name.toLowerCase().includes(inputValue.toLowerCase()))
    .slice(0, 5)

  const handleSubmit = useCallback(
    (tagName: string) => {
      if (tagName.trim()) {
        addTagToNote(noteId, tagName)
        setInputValue('')
        setShowSuggestions(false)
        setSelectedIndex(0)
      }
    },
    [noteId, addTagToNote]
  )

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    openList: () => {
      setShowSuggestions(true)
      setSelectedIndex(0)
      inputRef.current?.focus()
    },
  }))

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        e.stopPropagation()
        if (showSuggestions && suggestions[selectedIndex]) {
          handleSubmit(suggestions[selectedIndex].name)
        } else if (inputValue.trim()) {
          handleSubmit(inputValue)
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => Math.min(prev + 1, suggestions.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => Math.max(prev - 1, 0))
      } else if (e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
        setShowSuggestions(false)
        inputRef.current?.blur()
      }
    },
    [inputValue, suggestions, selectedIndex, showSuggestions, handleSubmit]
  )

  return (
    <div className="tag-input-container">
      <input
        ref={inputRef}
        type="text"
        className="tag-input"
        placeholder="+ 태그"
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value)
          setShowSuggestions(true)
          setSelectedIndex(0)
        }}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
        onKeyDown={handleKeyDown}
      />
      {showSuggestions && suggestions.length > 0 && (
        <div className="tag-suggestions">
          {suggestions.map((tag, index) => (
            <div
              key={tag.id}
              className={`tag-suggestion ${index === selectedIndex ? 'selected' : ''}`}
              onMouseDown={() => handleSubmit(tag.name)}
            >
              #{tag.name}
            </div>
          ))}
        </div>
      )}
    </div>
  )
})

TagInput.displayName = 'TagInput'
