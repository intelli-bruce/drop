import { useState, useCallback, useRef, useEffect, KeyboardEvent } from 'react'
import { useNotesStore } from '../stores/notes'

interface Props {
  noteId: string
  existingTagNames: string[]
  onClose: () => void
}

export function TagDialog({ noteId, existingTagNames, onClose }: Props) {
  const { allTags, addTagToNote } = useNotesStore()
  const [inputValue, setInputValue] = useState('')
  const [focusedIndex, setFocusedIndex] = useState(0) // 키보드 네비게이션용
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null) // 마우스 호버용
  const [addedTags, setAddedTags] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const excludedTags = [...existingTagNames, ...addedTags]
  const availableTags = allTags.filter((tag) => !excludedTags.includes(tag.name))
  const filteredTags = inputValue
    ? availableTags.filter((tag) => tag.name.toLowerCase().includes(inputValue.toLowerCase()))
    : availableTags

  // 입력값이 기존 태그와 정확히 일치하지 않으면 "새로 만들기" 옵션 표시
  const trimmedInput = inputValue.trim()
  const exactMatch = allTags.some((tag) => tag.name.toLowerCase() === trimmedInput.toLowerCase())
  const showCreateOption = trimmedInput && !exactMatch

  const totalItems = filteredTags.length + (showCreateOption ? 1 : 0)

  // 키보드 포커스된 항목으로 스크롤
  useEffect(() => {
    if (listRef.current) {
      const focusedEl = listRef.current.querySelector('.tag-dialog-item.focused')
      focusedEl?.scrollIntoView({ block: 'nearest' })
    }
  }, [focusedIndex])

  // 자동 포커스
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSelect = useCallback(
    (tagName: string) => {
      const trimmed = tagName.trim()
      if (trimmed) {
        addTagToNote(noteId, trimmed)
        setAddedTags((prev) => [...prev, trimmed.toLowerCase()])
        setInputValue('')
        setFocusedIndex(0)
        setHoveredIndex(null)
      }
    },
    [noteId, addTagToNote]
  )

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }

      if (e.key === 'ArrowDown' || e.key === 'j' || e.key === 'ㅓ') {
        // j/ㅓ는 입력 중일 때는 문자 입력으로 처리
        if ((e.key === 'j' || e.key === 'ㅓ') && inputValue) return
        e.preventDefault()
        setFocusedIndex((prev) => Math.min(prev + 1, totalItems - 1))
        setHoveredIndex(null) // 키보드 사용 시 마우스 호버 상태 초기화
        return
      }

      if (e.key === 'ArrowUp' || e.key === 'k' || e.key === 'ㅏ') {
        // k/ㅏ는 입력 중일 때는 문자 입력으로 처리
        if ((e.key === 'k' || e.key === 'ㅏ') && inputValue) return
        e.preventDefault()
        setFocusedIndex((prev) => Math.max(prev - 1, 0))
        setHoveredIndex(null) // 키보드 사용 시 마우스 호버 상태 초기화
        return
      }

      if (e.key === 'Enter') {
        e.preventDefault()
        if (totalItems === 0) return

        // "새로 만들기" 옵션이 선택된 경우
        if (showCreateOption && focusedIndex === filteredTags.length) {
          handleSelect(trimmedInput)
          return
        }

        // 기존 태그 선택
        if (filteredTags[focusedIndex]) {
          handleSelect(filteredTags[focusedIndex].name)
        }
      }
    },
    [totalItems, focusedIndex, filteredTags, showCreateOption, trimmedInput, handleSelect, onClose]
  )

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose()
      }
    },
    [onClose]
  )

  return (
    <div className="tag-dialog-backdrop" onClick={handleBackdropClick}>
      <div className="tag-dialog">
        {addedTags.length > 0 && (
          <div className="tag-dialog-added">
            {addedTags.map((name) => (
              <span key={name} className="tag-dialog-added-tag">
                #{name}
              </span>
            ))}
          </div>
        )}
        <input
          ref={inputRef}
          type="text"
          className="tag-dialog-input"
          placeholder="태그 검색 또는 생성..."
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value)
            setFocusedIndex(0)
            setHoveredIndex(null)
          }}
          onKeyDown={handleKeyDown}
        />
        <div
          ref={listRef}
          className="tag-dialog-list"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {filteredTags.map((tag, index) => (
            <div
              key={tag.id}
              className={`tag-dialog-item ${index === focusedIndex ? 'focused' : ''} ${index === hoveredIndex ? 'hovered' : ''}`}
              onClick={() => handleSelect(tag.name)}
              onMouseEnter={() => setHoveredIndex(index)}
            >
              <span className="tag-dialog-hash">#</span>
              <span className="tag-dialog-name">{tag.name}</span>
            </div>
          ))}
          {showCreateOption && (
            <div
              className={`tag-dialog-item tag-dialog-create ${focusedIndex === filteredTags.length ? 'focused' : ''} ${hoveredIndex === filteredTags.length ? 'hovered' : ''}`}
              onClick={() => handleSelect(trimmedInput)}
              onMouseEnter={() => setHoveredIndex(filteredTags.length)}
            >
              <span className="tag-dialog-create-icon">+</span>
              <span className="tag-dialog-create-text">
                "<strong>{trimmedInput}</strong>" 태그 만들기
              </span>
            </div>
          )}
          {totalItems === 0 && !showCreateOption && (
            <div className="tag-dialog-empty">태그가 없습니다</div>
          )}
        </div>
      </div>
    </div>
  )
}
