-- Add thread support: parent_id column for note replies
ALTER TABLE notes
  ADD COLUMN parent_id uuid REFERENCES notes(id) ON DELETE CASCADE;

-- Index for efficient child lookups
CREATE INDEX idx_notes_parent_id ON notes(parent_id) WHERE parent_id IS NOT NULL;

-- Comment for documentation
COMMENT ON COLUMN notes.parent_id IS 'Parent note ID for thread/reply support. NULL for root notes.';
