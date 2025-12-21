ALTER TABLE attachments
  ADD COLUMN original_url TEXT,
  ADD COLUMN author_name TEXT,
  ADD COLUMN author_url TEXT,
  ADD COLUMN caption TEXT;

ALTER TABLE attachments
  DROP CONSTRAINT IF EXISTS attachments_type_check;

ALTER TABLE attachments
  ADD CONSTRAINT attachments_type_check
  CHECK (type IN ('image', 'audio', 'video', 'file', 'instagram'));
