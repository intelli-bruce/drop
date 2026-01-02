ALTER TABLE notes
  ADD COLUMN IF NOT EXISTS priority SMALLINT NOT NULL DEFAULT 0
  CHECK (priority >= 0 AND priority <= 3);

CREATE INDEX IF NOT EXISTS idx_notes_priority ON notes(priority) WHERE priority > 0;
