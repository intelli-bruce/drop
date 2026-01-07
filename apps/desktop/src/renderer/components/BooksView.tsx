import { useEffect, useMemo } from 'react'
import { useNotesStore } from '../stores/notes'
import { supabase } from '../lib/supabase'
import type { Book, ReadingStatus } from '@drop/shared'

const STATUS_LABELS: Record<ReadingStatus, string> = {
  to_read: '읽을 예정',
  reading: '읽는 중',
  completed: '완독',
}

const STATUS_COLORS: Record<ReadingStatus, string> = {
  to_read: '#6b7280', // gray
  reading: '#3b82f6', // blue
  completed: '#10b981', // green
}

interface BookCardProps {
  book: Book
  onClick: () => void
}

function BookCard({ book, onClick }: BookCardProps) {
  const coverUrl = book.coverStoragePath
    ? supabase.storage.from('attachments').getPublicUrl(book.coverStoragePath).data.publicUrl
    : book.coverUrl

  return (
    <div className="book-card" onClick={onClick}>
      <div className="book-card-cover">
        {coverUrl ? (
          <img src={coverUrl} alt={book.title} />
        ) : (
          <div className="book-card-cover-placeholder">📚</div>
        )}
      </div>
      <div className="book-card-info">
        <h3 className="book-card-title">{book.title}</h3>
        <p className="book-card-author">{book.author}</p>
        <span
          className="book-card-status"
          style={{ backgroundColor: STATUS_COLORS[book.readingStatus] }}
        >
          {STATUS_LABELS[book.readingStatus]}
        </span>
        {book.rating && (
          <span className="book-card-rating">
            {'★'.repeat(book.rating)}
            {'☆'.repeat(5 - book.rating)}
          </span>
        )}
      </div>
    </div>
  )
}

export function BooksView() {
  const {
    books,
    isBooksLoading,
    bookFilter,
    loadBooks,
    setBookFilter,
    selectBook,
    openBookSearch,
  } = useNotesStore()

  useEffect(() => {
    loadBooks()
  }, [loadBooks])

  const filteredBooks = useMemo(() => {
    if (bookFilter === 'all') return books
    return books.filter((b) => b.readingStatus === bookFilter)
  }, [books, bookFilter])

  const counts = useMemo(() => {
    return {
      all: books.length,
      to_read: books.filter((b) => b.readingStatus === 'to_read').length,
      reading: books.filter((b) => b.readingStatus === 'reading').length,
      completed: books.filter((b) => b.readingStatus === 'completed').length,
    }
  }, [books])

  return (
    <div className="books-view">
      <div className="books-header">
        <h1 className="books-title">내 서재</h1>
        <button className="books-add-button" onClick={openBookSearch}>
          + 책 추가
        </button>
      </div>

      <div className="books-filter">
        <button
          className={`books-filter-btn ${bookFilter === 'all' ? 'active' : ''}`}
          onClick={() => setBookFilter('all')}
        >
          전체 ({counts.all})
        </button>
        <button
          className={`books-filter-btn ${bookFilter === 'to_read' ? 'active' : ''}`}
          onClick={() => setBookFilter('to_read')}
        >
          읽을 예정 ({counts.to_read})
        </button>
        <button
          className={`books-filter-btn ${bookFilter === 'reading' ? 'active' : ''}`}
          onClick={() => setBookFilter('reading')}
        >
          읽는 중 ({counts.reading})
        </button>
        <button
          className={`books-filter-btn ${bookFilter === 'completed' ? 'active' : ''}`}
          onClick={() => setBookFilter('completed')}
        >
          완독 ({counts.completed})
        </button>
      </div>

      {isBooksLoading ? (
        <div className="books-loading">불러오는 중...</div>
      ) : filteredBooks.length === 0 ? (
        <div className="books-empty">
          {bookFilter === 'all' ? (
            <>
              <p>아직 책이 없습니다</p>
              <button className="books-empty-add" onClick={openBookSearch}>
                첫 번째 책 추가하기
              </button>
            </>
          ) : (
            <p>'{STATUS_LABELS[bookFilter as ReadingStatus]}' 상태의 책이 없습니다</p>
          )}
        </div>
      ) : (
        <div className="books-grid">
          {filteredBooks.map((book) => (
            <BookCard key={book.id} book={book} onClick={() => selectBook(book.id)} />
          ))}
        </div>
      )}
    </div>
  )
}
