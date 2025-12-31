-- Backfill existing notes with correct category flags

-- Update has_media: notes that have image/video/audio attachments
UPDATE notes n
SET has_media = true
WHERE EXISTS (
  SELECT 1 FROM attachments a
  WHERE a.note_id = n.id
  AND a.type IN ('image', 'video', 'audio')
)
AND has_media = false;

-- Update has_files: notes that have file/text attachments
UPDATE notes n
SET has_files = true
WHERE EXISTS (
  SELECT 1 FROM attachments a
  WHERE a.note_id = n.id
  AND a.type IN ('file', 'text')
)
AND has_files = false;

-- Update has_link: notes that have instagram/youtube attachments
UPDATE notes n
SET has_link = true
WHERE EXISTS (
  SELECT 1 FROM attachments a
  WHERE a.note_id = n.id
  AND a.type IN ('instagram', 'youtube')
)
AND has_link = false;

-- Update has_link: notes that have URLs in content
-- URL regex pattern: https?://[^\s<>"{}|\^`\[\]]+
UPDATE notes
SET has_link = true
WHERE content ~ 'https?://[^\s<>"{}|\\^`\[\]]+'
AND has_link = false;
