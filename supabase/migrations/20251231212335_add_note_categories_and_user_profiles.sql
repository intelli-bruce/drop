-- 노트 카테고리 분류 비트 플래그 및 잠금 기능 추가

-- notes 테이블에 카테고리 플래그와 잠금 컬럼 추가
ALTER TABLE notes
  ADD COLUMN IF NOT EXISTS has_link BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_media BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_files BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_locked BOOLEAN NOT NULL DEFAULT false;

-- 카테고리 필터링을 위한 부분 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_notes_has_link ON notes(has_link) WHERE has_link = true;
CREATE INDEX IF NOT EXISTS idx_notes_has_media ON notes(has_media) WHERE has_media = true;
CREATE INDEX IF NOT EXISTS idx_notes_has_files ON notes(has_files) WHERE has_files = true;
CREATE INDEX IF NOT EXISTS idx_notes_is_locked ON notes(is_locked) WHERE is_locked = true;

-- user_profiles 테이블 생성 (PIN 저장)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  pin_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS 활성화
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 사용자는 자신의 프로필만 접근 가능
CREATE POLICY "user_profiles_select_own" ON user_profiles FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "user_profiles_insert_own" ON user_profiles FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_profiles_update_own" ON user_profiles FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- attachments 타입 체크에 youtube 추가
ALTER TABLE attachments DROP CONSTRAINT IF EXISTS attachments_type_check;
ALTER TABLE attachments ADD CONSTRAINT attachments_type_check
  CHECK (type IN ('image', 'audio', 'video', 'file', 'text', 'instagram', 'youtube'));
