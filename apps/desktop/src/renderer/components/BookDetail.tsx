import { useNotesStore } from '../stores/notes'
import { supabase } from '../lib/supabase'
import type { ReadingStatus, Note } from '@drop/shared'

const STATUS_LABELS: Record<ReadingStatus, string> = {
  to_read: '읽을 예정',
  reading: '읽는 중',
  completed: '완독',
}

interface NotePreviewProps {
  note: Note
  onClick: () => void
}

function NotePreview({ note, onClick }: NotePreviewProps) {
  const preview = note.content.slice(0, 100) + (note.content.length > 100 ? '...' : '')

  return (
    <div className="book-note-preview" onClick={onClick}>
      <p className="book-note-preview-content">{preview || '(내용 없음)'}</p>
      <span className="book-note-preview-date">
        {note.createdAt.toLocaleDateString('ko-KR')}
      </span>
    </div>
  )
}

export function BookDetail() {
  const {
    selectedBookWithNotes,
    selectBook,
    updateBookStatus,
    deleteBook,
    selectNote,
  } = useNotesStore()

  if (!selectedBookWithNotes) return null

  const book = selectedBookWithNotes
  const coverUrl = book.coverStoragePath
    ? supabase.storage.from('attachments').getPublicUrl(book.coverStoragePath).data.publicUrl
    : book.coverUrl

  const handleStatusChange = (status: ReadingStatus) => {
    updateBookStatus(book.id, status)
  }

  const handleRatingChange = (rating: number) => {
    updateBookStatus(book.id, 'completed', { rating })
  }

  const handleDelete = () => {
    if (window.confirm('이 책을 삭제하시겠습니까? 연결된 노트는 삭제되지 않습니다.')) {
      deleteBook(book.id)
      selectBook(null)
    }
  }

  const handleNoteClick = (noteId: string) => {
    // 노트를 선택하고 노트 탭으로 이동
    selectNote(noteId)
    selectBook(null) // 책 상세 닫기
  }

  return (
    <div className="book-detail-overlay" onClick={() => selectBook(null)}>
      <div className="book-detail" onClick={(e) => e.stopPropagation()}>
        <button className="book-detail-close" onClick={() => selectBook(null)}>
          ×
        </button>

        <div className="book-detail-header">
          <div className="book-detail-cover">
            {coverUrl ? (
              <img src={coverUrl} alt={book.title} />
            ) : (
              <div className="book-detail-cover-placeholder">📚</div>
            )}
          </div>
          <div className="book-detail-info">
            <h1 className="book-detail-title">{book.title}</h1>
            <p className="book-detail-author">{book.author}</p>
            {book.publisher && (
              <p className="book-detail-publisher">
                {book.publisher}
                {book.pubDate && ` · ${book.pubDate.substring(0, 4)}`}
              </p>
            )}

            <div className="book-detail-status">
              <label>읽기 상태</label>
              <div className="book-detail-status-buttons">
                {(['to_read', 'reading', 'completed'] as ReadingStatus[]).map((status) => (
                  <button
                    key={status}
                    className={`book-detail-status-btn ${book.readingStatus === status ? 'active' : ''}`}
                    onClick={() => handleStatusChange(status)}
                  >
                    {STATUS_LABELS[status]}
                  </button>
                ))}
              </div>
            </div>

            {book.readingStatus === 'completed' && (
              <div className="book-detail-rating">
                <label>평점</label>
                <div className="book-detail-rating-stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      className={`book-detail-star ${book.rating && book.rating >= star ? 'filled' : ''}`}
                      onClick={() => handleRatingChange(star)}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
            )}

            {book.startedAt && (
              <p className="book-detail-date">
                시작일: {book.startedAt.toLocaleDateString('ko-KR')}
              </p>
            )}
            {book.finishedAt && (
              <p className="book-detail-date">
                완독일: {book.finishedAt.toLocaleDateString('ko-KR')}
              </p>
            )}
          </div>
        </div>

        {book.description && (
          <div className="book-detail-description">
            <h2>책 소개</h2>
            <p>{book.description}</p>
          </div>
        )}

        <div className="book-detail-notes">
          <h2>관련 노트 ({book.notes.length})</h2>
          {book.notes.length === 0 ? (
            <p className="book-detail-notes-empty">
              아직 이 책에 대한 노트가 없습니다.
              <br />
              노트를 작성하고 이 책과 연결해보세요.
            </p>
          ) : (
            <div className="book-detail-notes-list">
              {book.notes.map((note) => (
                <NotePreview
                  key={note.id}
                  note={note}
                  onClick={() => handleNoteClick(note.id)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="book-detail-actions">
          <button className="book-detail-delete" onClick={handleDelete}>
            책 삭제
          </button>
        </div>
      </div>
    </div>
  )
}
