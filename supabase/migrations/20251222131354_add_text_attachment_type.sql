-- Add 'text' to attachment type check constraint
ALTER TABLE attachments
  DROP CONSTRAINT IF EXISTS attachments_type_check;

ALTER TABLE attachments
  ADD CONSTRAINT attachments_type_check
  CHECK (type IN ('image', 'audio', 'video', 'file', 'text', 'instagram'));
