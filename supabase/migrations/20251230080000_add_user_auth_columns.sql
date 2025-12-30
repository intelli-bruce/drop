-- Add user_id column to notes table (nullable initially for migration)
ALTER TABLE notes ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX idx_notes_user_id ON notes(user_id);

-- Add user_id column to tags table
ALTER TABLE tags ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX idx_tags_user_id ON tags(user_id);

-- Change UNIQUE constraint on tags: name + user_id (drop old constraint first)
ALTER TABLE tags DROP CONSTRAINT tags_name_key;
ALTER TABLE tags ADD CONSTRAINT tags_name_user_unique UNIQUE (name, user_id);
