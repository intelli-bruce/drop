/// <reference path="../../preload/index.d.ts" />
import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { useNotesStore } from '../stores/notes'
import { supabase } from '../lib/supabase'
import type { AladinSearchResult, Book } from '@drop/shared'

type SearchItem =
  | { type: 'library'; book: Book }
  | { type: 'aladin'; book: AladinSearchResult }

export function BookSearchDialog() {
  const {
    isBookSearchOpen,
    closeBookSearch,
    librarySearchResults,
    aladinSearchResults,
    isSearchingBooks,
    searchBooks,
    addBookToLibrary,
    selectBook,
  } = useNotesStore()

  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isAdding, setIsAdding] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // 검색어 입력 디바운스
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // 모든 결과를 하나의 배열로 합침 (키보드 네비게이션용)
  const allItems = useMemo<SearchItem[]>(() => {
    const items: SearchItem[] = []
    librarySearchResults.forEach((book) => items.push({ type: 'library', book }))
    aladinSearchResults.forEach((book) => items.push({ type: 'aladin', book }))
    return items
  }, [librarySearchResults, aladinSearchResults])

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
      setIsAdding(false)
      setTimeout(() => {
        inputRef.current?.focus()
      }, 0)
    }
  }, [isBookSearchOpen])

  // 선택된 항목이 보이도록 스크롤
  useEffect(() => {
    if (listRef.current && allItems.length > 0) {
      const allElements = listRef.current.querySelectorAll('.book-search-item')
      const selectedElement = allElements[selectedIndex] as HTMLElement
      selectedElement?.scrollIntoView({ block: 'nearest' })
    }
  }, [selectedIndex, allItems.length])

  // 내 서재 책 선택 시
  const handleSelectLibraryBook = useCallback(
    (book: Book) => {
      selectBook(book.id)
      closeBookSearch()
    },
    [selectBook, closeBookSearch]
  )

  // 알라딘 책 선택 시 (라이브러리에 추가)
  const handleSelectAladinBook = useCallback(
    async (book: AladinSearchResult) => {
      if (isAdding) return

      setIsAdding(true)
      try {
        const addedBook = await addBookToLibrary(book.isbn13)
        if (addedBook) {
          closeBookSearch()
        }
      } finally {
        setIsAdding(false)
      }
    },
    [addBookToLibrary, closeBookSearch, isAdding]
  )

  // 통합 선택 핸들러
  const handleSelectItem = useCallback(
    (item: SearchItem) => {
      if (item.type === 'library') {
        handleSelectLibraryBook(item.book)
      } else {
        handleSelectAladinBook(item.book)
      }
    },
    [handleSelectLibraryBook, handleSelectAladinBook]
  )

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prev) => (prev < allItems.length - 1 ? prev + 1 : prev))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev))
        break
      case 'Enter':
        e.preventDefault()
        if (allItems[selectedIndex]) {
          handleSelectItem(allItems[selectedIndex])
        }
        break
      case 'Escape':
        e.preventDefault()
        closeBookSearch()
        break
    }
  }

  // 현재 선택된 인덱스가 어느 섹션에 있는지 계산
  const getItemIndex = (sectionType: 'library' | 'aladin', indexInSection: number): number => {
    if (sectionType === 'library') {
      return indexInSection
    }
    return librarySearchResults.length + indexInSection
  }

  if (!isBookSearchOpen) return null

  const hasResults = librarySearchResults.length > 0 || aladinSearchResults.length > 0
  const noResults = query && !isSearchingBooks && !hasResults

  return (
    <div className="book-search-overlay" onClick={closeBookSearch}>
      <div className="book-search-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="book-search-header">
          <span className="book-search-title">책 검색</span>
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
            placeholder="책 제목, 저자 또는 ISBN 입력..."
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isAdding}
          />
          {(isSearchingBooks || isAdding) && <span className="book-search-spinner" />}
        </div>

        <div className="book-search-results" ref={listRef}>
          {noResults ? (
            <div className="book-search-empty">검색 결과가 없습니다</div>
          ) : (
            <>
              {/* 내 서재 섹션 */}
              {librarySearchResults.length > 0 && (
                <div className="book-search-section">
                  <div className="book-search-section-title">내 서재</div>
                  {librarySearchResults.map((book, index) => {
                    const itemIndex = getItemIndex('library', index)
                    const coverUrl = book.coverStoragePath
                      ? supabase.storage.from('attachments').getPublicUrl(book.coverStoragePath)
                          .data.publicUrl
                      : book.coverUrl

                    return (
                      <div
                        key={book.id}
                        className={`book-search-item ${itemIndex === selectedIndex ? 'selected' : ''}`}
                        onClick={() => handleSelectLibraryBook(book)}
                        onMouseEnter={() => setSelectedIndex(itemIndex)}
                      >
                        <div className="book-search-item-cover">
                          {coverUrl ? (
                            <img src={coverUrl} alt={book.title} />
                          ) : (
                            <div className="book-search-item-cover-placeholder">📚</div>
                          )}
                        </div>
                        <div className="book-search-item-info">
                          <p className="book-search-item-title">{book.title}</p>
                          <span className="book-search-item-meta">
                            {book.author}
                            {book.publisher && ` · ${book.publisher}`}
                          </span>
                          <span className="book-search-item-status">
                            {book.readingStatus === 'to_read' && '📖 읽을 예정'}
                            {book.readingStatus === 'reading' && '📚 읽는 중'}
                            {book.readingStatus === 'completed' && '✅ 완독'}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* 알라딘 검색 섹션 */}
              {aladinSearchResults.length > 0 && (
                <div className="book-search-section">
                  <div className="book-search-section-title">
                    {librarySearchResults.length > 0 ? '새 책 추가' : '검색 결과'}
                  </div>
                  {aladinSearchResults.map((book, index) => {
                    const itemIndex = getItemIndex('aladin', index)

                    return (
                      <div
                        key={book.itemId}
                        className={`book-search-item ${itemIndex === selectedIndex ? 'selected' : ''}`}
                        onClick={() => handleSelectAladinBook(book)}
                        onMouseEnter={() => setSelectedIndex(itemIndex)}
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
                            {book.author}
                            {book.publisher && ` · ${book.publisher}`}
                            {book.pubDate && ` · ${book.pubDate.substring(0, 4)}`}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </div>

        <div className="book-search-footer">
          <span className="book-search-hints">↑↓ 이동 · Enter 선택 · Esc 닫기</span>
        </div>
      </div>
    </div>
  )
}
