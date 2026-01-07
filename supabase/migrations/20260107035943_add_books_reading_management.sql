-- 읽기 관리 시스템을 위한 books 테이블 생성
-- 책은 독립적인 엔티티로, 노트와 다대다 관계를 가짐

-- 읽기 상태 enum
CREATE TYPE reading_status AS ENUM ('to_read', 'reading', 'completed');

-- books 테이블
CREATE TABLE books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 식별자
  isbn13 TEXT NOT NULL,

  -- 기본 정보
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  publisher TEXT,
  pub_date TEXT,
  description TEXT,

  -- 이미지
  cover_storage_path TEXT,
  cover_url TEXT, -- 원본 URL 백업

  -- 읽기 상태
  reading_status reading_status NOT NULL DEFAULT 'to_read',
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,

  -- 평점 (1-5)
  rating SMALLINT CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),

  -- 메타데이터
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- 같은 사용자가 같은 ISBN의 책을 중복 추가하지 않도록
  UNIQUE (user_id, isbn13)
);

-- book_notes 관계 테이블 (다대다)
CREATE TABLE book_notes (
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (book_id, note_id)
);

-- 인덱스
CREATE INDEX idx_books_user_id ON books(user_id);
CREATE INDEX idx_books_reading_status ON books(user_id, reading_status);
CREATE INDEX idx_books_isbn13 ON books(isbn13);
CREATE INDEX idx_book_notes_book_id ON book_notes(book_id);
CREATE INDEX idx_book_notes_note_id ON book_notes(note_id);

-- RLS 활성화
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_notes ENABLE ROW LEVEL SECURITY;

-- books RLS 정책
CREATE POLICY "Users can view their own books"
  ON books FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own books"
  ON books FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own books"
  ON books FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own books"
  ON books FOR DELETE
  USING (auth.uid() = user_id);

-- book_notes RLS 정책
CREATE POLICY "Users can view their own book_notes"
  ON book_notes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM books WHERE books.id = book_notes.book_id AND books.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own book_notes"
  ON book_notes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM books WHERE books.id = book_notes.book_id AND books.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own book_notes"
  ON book_notes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM books WHERE books.id = book_notes.book_id AND books.user_id = auth.uid()
    )
  );

-- updated_at 트리거
CREATE TRIGGER set_books_updated_at
  BEFORE UPDATE ON books
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
