-- Drop existing "Allow all" policies
DROP POLICY IF EXISTS "Allow all on notes" ON notes;
DROP POLICY IF EXISTS "Allow all on attachments" ON attachments;
DROP POLICY IF EXISTS "Allow all on tags" ON tags;
DROP POLICY IF EXISTS "Allow all on note_tags" ON note_tags;
DROP POLICY IF EXISTS "Allow all on attachments bucket" ON storage.objects;

-- Notes: Users can only access their own notes
CREATE POLICY "notes_select_own" ON notes FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "notes_insert_own" ON notes FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "notes_update_own" ON notes FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "notes_delete_own" ON notes FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Attachments: Access through notes ownership
CREATE POLICY "attachments_select_own" ON attachments FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM notes WHERE notes.id = attachments.note_id AND notes.user_id = auth.uid()));

CREATE POLICY "attachments_insert_own" ON attachments FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM notes WHERE notes.id = attachments.note_id AND notes.user_id = auth.uid()));

CREATE POLICY "attachments_update_own" ON attachments FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM notes WHERE notes.id = attachments.note_id AND notes.user_id = auth.uid()));

CREATE POLICY "attachments_delete_own" ON attachments FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM notes WHERE notes.id = attachments.note_id AND notes.user_id = auth.uid()));

-- Tags: Users can only access their own tags
CREATE POLICY "tags_select_own" ON tags FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "tags_insert_own" ON tags FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "tags_update_own" ON tags FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "tags_delete_own" ON tags FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Note_tags: Access through notes ownership
CREATE POLICY "note_tags_select_own" ON note_tags FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM notes WHERE notes.id = note_tags.note_id AND notes.user_id = auth.uid()));

CREATE POLICY "note_tags_insert_own" ON note_tags FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM notes WHERE notes.id = note_tags.note_id AND notes.user_id = auth.uid()));

CREATE POLICY "note_tags_delete_own" ON note_tags FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM notes WHERE notes.id = note_tags.note_id AND notes.user_id = auth.uid()));

-- Storage: Users can only access their own folder (structure: {user_id}/{note_id}/{filename})
CREATE POLICY "storage_select_own" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'attachments' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "storage_insert_own" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'attachments' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "storage_update_own" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'attachments' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "storage_delete_own" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'attachments' AND (storage.foldername(name))[1] = auth.uid()::text);
