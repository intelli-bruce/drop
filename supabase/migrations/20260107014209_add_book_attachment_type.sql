-- Migration: add_book_attachment_type
-- Description: attachments 테이블에 'book' 타입 추가 및 ISBN 검색 인덱스

-- 1. 기존 type 체크 제약조건 삭제 (존재하는 경우)
ALTER TABLE attachments
  DROP CONSTRAINT IF EXISTS attachments_type_check;

-- 2. 새로운 type 체크 제약조건 추가 ('book' 포함)
ALTER TABLE attachments
  ADD CONSTRAINT attachments_type_check
  CHECK (type IN ('image', 'audio', 'video', 'file', 'text', 'instagram', 'youtube', 'book'));

-- 3. ISBN 검색 최적화를 위한 GIN 인덱스 추가
-- metadata->>'isbn13' 으로 책 검색 시 성능 향상
CREATE INDEX IF NOT EXISTS idx_attachments_metadata_isbn13
  ON attachments USING gin ((metadata->'isbn13'));

-- 4. 책 타입 첨부파일만 조회하는 부분 인덱스
CREATE INDEX IF NOT EXISTS idx_attachments_book_type
  ON attachments (note_id, created_at DESC)
  WHERE type = 'book';

COMMENT ON CONSTRAINT attachments_type_check ON attachments IS
  'Allowed attachment types: image, audio, video, file, text, instagram, youtube, book';
