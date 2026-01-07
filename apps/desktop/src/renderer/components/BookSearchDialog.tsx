/// <reference path="../../preload/index.d.ts" />
import { useEffect, useRef, useState, useCallback } from 'react'
import { useNotesStore } from '../stores/notes'
import type { AladinSearchResult } from '@drop/shared'

export function BookSearchDialog() {
  const {
    isBookSearchOpen,
    closeBookSearch,
    bookSearchResults,
    isSearchingBooks,
    searchBooks,
    createNoteWithBook,
    selectedNoteId,
    addBookToNote,
  } = useNotesStore()

  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // 검색어 입력 디바운스
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  const handleQueryChange = (value: string) => {
    setQuery(value)
    setSelectedIndex(0)

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      searchBooks(value)
    }, 300)
  }

  // 다이얼로그가 열릴 때 포커스
  useEffect(() => {
    if (isBookSearchOpen) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => {
        inputRef.current?.focus()
      }, 0)
    }
  }, [isBookSearchOpen])

  // 선택된 항목이 보이도록 스크롤
  useEffect(() => {
    if (listRef.current && bookSearchResults.length > 0) {
      const selectedElement = listRef.current.children[selectedIndex] as HTMLElement
      selectedElement?.scrollIntoView({ block: 'nearest' })
    }
  }, [selectedIndex, bookSearchResults.length])

  const handleSelect = useCallback(
    async (book: AladinSearchResult) => {
      closeBookSearch()

      if (selectedNoteId) {
        // 선택된 노트가 있으면 해당 노트에 책 추가
        await addBookToNote(selectedNoteId, book.isbn13)
      } else {
        // 없으면 새 노트 생성하고 책 추가
        await createNoteWithBook(book.isbn13)
      }
    },
    [selectedNoteId, addBookToNote, createNoteWithBook, closeBookSearch]
  )

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prev) =>
          prev < bookSearchResults.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev))
        break
      case 'Enter':
        e.preventDefault()
        if (bookSearchResults[selectedIndex]) {
          handleSelect(bookSearchResults[selectedIndex])
        }
        break
      case 'Escape':
        e.preventDefault()
        closeBookSearch()
        break
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price)
  }

  if (!isBookSearchOpen) return null

  return (
    <div className="book-search-overlay" onClick={closeBookSearch}>
      <div className="book-search-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="book-search-header">
          <span className="book-search-title">📚 책 검색</span>
          <button className="book-search-close" onClick={closeBookSearch}>
            ×
          </button>
        </div>

        <div className="book-search-input-wrapper">
          <span className="book-search-input-icon">🔍</span>
          <input
            ref={inputRef}
            type="text"
            className="book-search-input"
            placeholder="검색어 또는 ISBN 입력..."
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {isSearchingBooks && <span className="book-search-spinner" />}
        </div>

        <div className="book-search-results" ref={listRef}>
          {bookSearchResults.length === 0 && query && !isSearchingBooks ? (
            <div className="book-search-empty">
              검색 결과가 없습니다
            </div>
          ) : (
            bookSearchResults.map((book, index) => (
              <div
                key={book.itemId}
                className={`book-search-item ${index === selectedIndex ? 'selected' : ''}`}
                onClick={() => handleSelect(book)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="book-search-item-cover">
                  {book.cover ? (
                    <img src={book.cover} alt={book.title} />
                  ) : (
                    <div className="book-search-item-cover-placeholder">📚</div>
                  )}
                </div>
                <div className="book-search-item-info">
                  <p className="book-search-item-title">{book.title}</p>
                  <span className="book-search-item-meta">
                    {book.author} | {book.publisher} | {book.pubDate?.substring(0, 4)}
                  </span>
                  <span className="book-search-item-price">
                    {book.priceSales !== book.priceStandard && (
                      <span className="book-search-item-price-original">
                        ₩{formatPrice(book.priceStandard)}
                      </span>
                    )}
                    <span className="book-search-item-price-sale">
                      ₩{formatPrice(book.priceSales)}
                    </span>
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="book-search-footer">
          <span className="book-search-hints">
            ↑↓ 이동 · Enter 선택 · Esc 닫기
          </span>
          <span className="book-search-credit">
            도서 DB 제공 : 알라딘 인터넷서점
          </span>
        </div>
      </div>
    </div>
  )
}
