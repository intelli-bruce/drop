-- Notes table
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  source TEXT NOT NULL CHECK (source IN ('mobile', 'desktop', 'web')),
  is_deleted BOOLEAN DEFAULT false
);

-- Attachments table
CREATE TABLE attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('image', 'audio', 'video', 'file')),
  storage_path TEXT NOT NULL,  -- Supabase Storage path
  filename TEXT,
  mime_type TEXT,
  size INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tags table
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Note-Tags junction table
CREATE TABLE note_tags (
  note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (note_id, tag_id)
);

-- Indexes
CREATE INDEX idx_attachments_note_id ON attachments(note_id);
CREATE INDEX idx_notes_created_at ON notes(created_at DESC);
CREATE INDEX idx_notes_is_deleted ON notes(is_deleted);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Enable Row Level Security
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_tags ENABLE ROW LEVEL SECURITY;

-- For now, allow all operations (adjust later for auth)
CREATE POLICY "Allow all on notes" ON notes FOR ALL USING (true);
CREATE POLICY "Allow all on attachments" ON attachments FOR ALL USING (true);
CREATE POLICY "Allow all on tags" ON tags FOR ALL USING (true);
CREATE POLICY "Allow all on note_tags" ON note_tags FOR ALL USING (true);

-- Storage bucket for attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('attachments', 'attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policy (allow all for now)
CREATE POLICY "Allow all on attachments bucket"
ON storage.objects FOR ALL
USING (bucket_id = 'attachments');
