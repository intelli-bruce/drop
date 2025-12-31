-- Add soft-delete and archive columns to notes table

-- Add deleted_at and archived_at columns
ALTER TABLE notes
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

-- Migrate existing is_deleted = true notes to use deleted_at
UPDATE notes SET deleted_at = updated_at WHERE is_deleted = true AND deleted_at IS NULL;

-- Create partial indexes for efficient filtering
CREATE INDEX IF NOT EXISTS idx_notes_deleted_at ON notes(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_notes_archived_at ON notes(archived_at) WHERE archived_at IS NOT NULL;

-- Index for active notes (not deleted, not archived)
CREATE INDEX IF NOT EXISTS idx_notes_active ON notes(created_at DESC)
  WHERE deleted_at IS NULL AND archived_at IS NULL;
