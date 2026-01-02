ALTER TABLE tags
  ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMPTZ DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_tags_last_used ON tags(last_used_at DESC);
