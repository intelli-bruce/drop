-- Add pin feature to notes table
-- is_pinned: whether the note is pinned to the top
-- pinned_at: timestamp when the note was pinned (for ordering multiple pinned notes)

ALTER TABLE notes
  ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS pinned_at TIMESTAMPTZ;

-- Index for efficient pinned notes query
-- Only index pinned notes that are active (not deleted/archived)
CREATE INDEX IF NOT EXISTS idx_notes_pinned
  ON notes(is_pinned, pinned_at DESC)
  WHERE is_pinned = true AND deleted_at IS NULL AND archived_at IS NULL;

-- Comment for documentation
COMMENT ON COLUMN notes.is_pinned IS 'Whether the note is pinned to the top of the list';
COMMENT ON COLUMN notes.pinned_at IS 'Timestamp when the note was pinned, used for ordering multiple pinned notes';
