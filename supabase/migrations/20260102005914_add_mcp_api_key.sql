-- MCP API Key 인증 시스템
-- refresh_token 기반 인증의 문제점(1회용 토큰 rotation)을 해결하기 위해
-- 영구적인 API key 방식으로 변경

-- 1. user_profiles에 mcp_api_key 컬럼 추가
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS mcp_api_key TEXT UNIQUE;

-- 2. mcp_api_key 인덱스 추가 (조회 성능)
CREATE INDEX IF NOT EXISTS idx_user_profiles_mcp_api_key 
  ON user_profiles(mcp_api_key) 
  WHERE mcp_api_key IS NOT NULL;

-- 3. API key 생성 함수 (12자 랜덤 문자열)
CREATE OR REPLACE FUNCTION generate_mcp_api_key()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_key TEXT;
  key_exists BOOLEAN;
BEGIN
  -- 사용자 인증 확인
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  LOOP
    -- 12자 랜덤 키 생성 (Base62: a-z, 0-9)
    new_key := encode(gen_random_bytes(9), 'base64');
    new_key := replace(replace(replace(new_key, '+', ''), '/', ''), '=', '');
    new_key := left(new_key, 12);
    
    -- 중복 체크
    SELECT EXISTS(
      SELECT 1 FROM user_profiles WHERE mcp_api_key = new_key
    ) INTO key_exists;
    
    EXIT WHEN NOT key_exists;
  END LOOP;

  -- user_profiles가 없으면 생성, 있으면 업데이트
  INSERT INTO user_profiles (user_id, mcp_api_key)
  VALUES (auth.uid(), new_key)
  ON CONFLICT (user_id) 
  DO UPDATE SET mcp_api_key = new_key, updated_at = now();

  RETURN new_key;
END;
$$;

-- 4. 현재 API key 조회 함수 (없으면 자동 생성)
CREATE OR REPLACE FUNCTION get_mcp_api_key()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_key TEXT;
BEGIN
  -- 사용자 인증 확인
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- 기존 키 조회
  SELECT mcp_api_key INTO current_key
  FROM user_profiles
  WHERE user_id = auth.uid();

  -- 키가 없으면 새로 생성
  IF current_key IS NULL THEN
    current_key := generate_mcp_api_key();
  END IF;

  RETURN current_key;
END;
$$;

-- 5. API key로 user_id 조회 함수 (MCP 서버용, anon key로 호출 가능)
CREATE OR REPLACE FUNCTION get_user_id_by_mcp_key(api_key TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  found_user_id UUID;
BEGIN
  SELECT user_id INTO found_user_id
  FROM user_profiles
  WHERE mcp_api_key = api_key;

  RETURN found_user_id;
END;
$$;

-- 6. API key 재생성 함수
CREATE OR REPLACE FUNCTION regenerate_mcp_api_key()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  RETURN generate_mcp_api_key();
END;
$$;

-- ============================================
-- MCP Data Access Functions (SECURITY DEFINER)
-- ============================================

-- Helper: Validate API key and return user_id (raises exception if invalid)
CREATE OR REPLACE FUNCTION mcp_validate_key(api_key TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  uid UUID;
BEGIN
  SELECT user_id INTO uid FROM user_profiles WHERE mcp_api_key = api_key;
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Invalid API key';
  END IF;
  RETURN uid;
END;
$$;

-- MCP: List notes
CREATE OR REPLACE FUNCTION mcp_list_notes(
  api_key TEXT,
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0,
  p_include_deleted BOOLEAN DEFAULT false,
  p_include_archived BOOLEAN DEFAULT false
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  uid UUID;
  result JSON;
BEGIN
  uid := mcp_validate_key(api_key);
  
  SELECT json_build_object(
    'notes', COALESCE(json_agg(row_to_json(n.*) ORDER BY n.created_at DESC), '[]'::json),
    'total', (SELECT COUNT(*) FROM notes 
              WHERE user_id = uid 
              AND (p_include_deleted OR deleted_at IS NULL)
              AND (p_include_archived OR archived_at IS NULL))
  ) INTO result
  FROM (
    SELECT id, content, source, parent_id, is_locked, has_link, has_media, has_files,
           created_at, updated_at, deleted_at, archived_at
    FROM notes
    WHERE user_id = uid
      AND (p_include_deleted OR deleted_at IS NULL)
      AND (p_include_archived OR archived_at IS NULL)
    ORDER BY created_at DESC
    LIMIT p_limit OFFSET p_offset
  ) n;
  
  RETURN result;
END;
$$;

-- MCP: Get single note with tags and attachments
CREATE OR REPLACE FUNCTION mcp_get_note(api_key TEXT, p_note_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  uid UUID;
  result JSON;
BEGIN
  uid := mcp_validate_key(api_key);
  
  SELECT json_build_object(
    'id', n.id,
    'content', n.content,
    'source', n.source,
    'parent_id', n.parent_id,
    'is_locked', n.is_locked,
    'has_link', n.has_link,
    'has_media', n.has_media,
    'has_files', n.has_files,
    'created_at', n.created_at,
    'updated_at', n.updated_at,
    'deleted_at', n.deleted_at,
    'archived_at', n.archived_at,
    'tags', COALESCE((
      SELECT json_agg(json_build_object('id', t.id, 'name', t.name))
      FROM note_tags nt JOIN tags t ON nt.tag_id = t.id
      WHERE nt.note_id = n.id
    ), '[]'::json),
    'attachments', COALESCE((
      SELECT json_agg(json_build_object(
        'id', a.id, 'type', a.type, 'filename', a.filename,
        'mime_type', a.mime_type, 'size', a.size, 'storage_path', a.storage_path
      ))
      FROM attachments a WHERE a.note_id = n.id
    ), '[]'::json)
  ) INTO result
  FROM notes n
  WHERE n.id = p_note_id AND n.user_id = uid;
  
  IF result IS NULL THEN
    RAISE EXCEPTION 'Note not found';
  END IF;
  
  RETURN result;
END;
$$;

-- MCP: Create note
CREATE OR REPLACE FUNCTION mcp_create_note(
  api_key TEXT,
  p_content TEXT,
  p_parent_id UUID DEFAULT NULL,
  p_tag_names TEXT[] DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  uid UUID;
  new_note_id UUID;
  tag_name TEXT;
  tag_id UUID;
BEGIN
  uid := mcp_validate_key(api_key);
  
  INSERT INTO notes (content, parent_id, source, user_id)
  VALUES (p_content, p_parent_id, 'mcp', uid)
  RETURNING id INTO new_note_id;
  
  IF p_tag_names IS NOT NULL THEN
    FOREACH tag_name IN ARRAY p_tag_names LOOP
      INSERT INTO tags (name, user_id) VALUES (tag_name, uid)
      ON CONFLICT (name, user_id) DO UPDATE SET name = EXCLUDED.name
      RETURNING id INTO tag_id;
      
      INSERT INTO note_tags (note_id, tag_id) VALUES (new_note_id, tag_id)
      ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;
  
  RETURN mcp_get_note(api_key, new_note_id);
END;
$$;

-- MCP: Update note
CREATE OR REPLACE FUNCTION mcp_update_note(api_key TEXT, p_note_id UUID, p_content TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  uid UUID;
BEGIN
  uid := mcp_validate_key(api_key);
  
  UPDATE notes SET content = p_content, updated_at = now()
  WHERE id = p_note_id AND user_id = uid;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Note not found';
  END IF;
  
  RETURN mcp_get_note(api_key, p_note_id);
END;
$$;

-- MCP: Delete note (soft)
CREATE OR REPLACE FUNCTION mcp_delete_note(api_key TEXT, p_note_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  uid UUID;
BEGIN
  uid := mcp_validate_key(api_key);
  
  UPDATE notes SET deleted_at = now() WHERE id = p_note_id AND user_id = uid;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Note not found';
  END IF;
  
  RETURN json_build_object('success', true, 'note_id', p_note_id);
END;
$$;

-- MCP: Archive note
CREATE OR REPLACE FUNCTION mcp_archive_note(api_key TEXT, p_note_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  uid UUID;
BEGIN
  uid := mcp_validate_key(api_key);
  
  UPDATE notes SET archived_at = now() WHERE id = p_note_id AND user_id = uid;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Note not found';
  END IF;
  
  RETURN json_build_object('success', true, 'note_id', p_note_id);
END;
$$;

-- MCP: List tags
CREATE OR REPLACE FUNCTION mcp_list_tags(api_key TEXT, p_limit INT DEFAULT 50)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  uid UUID;
BEGIN
  uid := mcp_validate_key(api_key);
  
  RETURN (
    SELECT json_build_object('tags', COALESCE(json_agg(t ORDER BY note_count DESC), '[]'::json))
    FROM (
      SELECT t.id, t.name, COUNT(nt.note_id) as note_count
      FROM tags t
      LEFT JOIN note_tags nt ON t.id = nt.tag_id
      LEFT JOIN notes n ON nt.note_id = n.id AND n.deleted_at IS NULL
      WHERE t.user_id = uid
      GROUP BY t.id, t.name
      LIMIT p_limit
    ) t
  );
END;
$$;

-- MCP: Get notes by tag
CREATE OR REPLACE FUNCTION mcp_get_notes_by_tag(api_key TEXT, p_tag_name TEXT, p_limit INT DEFAULT 50)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  uid UUID;
  tid UUID;
BEGIN
  uid := mcp_validate_key(api_key);
  
  SELECT id INTO tid FROM tags WHERE name = p_tag_name AND user_id = uid;
  IF tid IS NULL THEN
    RAISE EXCEPTION 'Tag not found';
  END IF;
  
  RETURN (
    SELECT json_build_object(
      'tag_name', p_tag_name,
      'notes', COALESCE(json_agg(row_to_json(n.*) ORDER BY n.created_at DESC), '[]'::json)
    )
    FROM (
      SELECT n.id, n.content, n.created_at, n.has_link, n.has_media, n.has_files
      FROM notes n
      JOIN note_tags nt ON n.id = nt.note_id
      WHERE nt.tag_id = tid AND n.user_id = uid AND n.deleted_at IS NULL
      LIMIT p_limit
    ) n
  );
END;
$$;

-- MCP: Add tags to note
CREATE OR REPLACE FUNCTION mcp_add_tags_to_note(api_key TEXT, p_note_id UUID, p_tag_names TEXT[])
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  uid UUID;
  tag_name TEXT;
  tag_id UUID;
  added TEXT[] := '{}';
BEGIN
  uid := mcp_validate_key(api_key);
  
  IF NOT EXISTS (SELECT 1 FROM notes WHERE id = p_note_id AND user_id = uid) THEN
    RAISE EXCEPTION 'Note not found';
  END IF;
  
  FOREACH tag_name IN ARRAY p_tag_names LOOP
    INSERT INTO tags (name, user_id) VALUES (tag_name, uid)
    ON CONFLICT (name, user_id) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO tag_id;
    
    INSERT INTO note_tags (note_id, tag_id) VALUES (p_note_id, tag_id)
    ON CONFLICT DO NOTHING;
    
    added := array_append(added, tag_name);
  END LOOP;
  
  RETURN json_build_object('success', true, 'added_tags', added);
END;
$$;

-- MCP: Remove tags from note
CREATE OR REPLACE FUNCTION mcp_remove_tags_from_note(api_key TEXT, p_note_id UUID, p_tag_names TEXT[])
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  uid UUID;
  tag_name TEXT;
  removed TEXT[] := '{}';
BEGIN
  uid := mcp_validate_key(api_key);
  
  FOREACH tag_name IN ARRAY p_tag_names LOOP
    DELETE FROM note_tags
    WHERE note_id = p_note_id
      AND tag_id = (SELECT id FROM tags WHERE name = tag_name AND user_id = uid);
    
    IF FOUND THEN
      removed := array_append(removed, tag_name);
    END IF;
  END LOOP;
  
  RETURN json_build_object('success', true, 'removed_tags', removed);
END;
$$;

-- MCP: Search notes
CREATE OR REPLACE FUNCTION mcp_search_notes(
  api_key TEXT,
  p_query TEXT,
  p_tag_names TEXT[] DEFAULT NULL,
  p_category TEXT DEFAULT 'all',
  p_limit INT DEFAULT 20
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  uid UUID;
BEGIN
  uid := mcp_validate_key(api_key);
  
  RETURN (
    SELECT json_build_object('notes', COALESCE(json_agg(row_to_json(n.*)), '[]'::json))
    FROM (
      SELECT DISTINCT n.id, n.content, n.created_at, n.has_link, n.has_media, n.has_files
      FROM notes n
      LEFT JOIN note_tags nt ON n.id = nt.note_id
      LEFT JOIN tags t ON nt.tag_id = t.id
      WHERE n.user_id = uid
        AND n.deleted_at IS NULL
        AND n.content ILIKE '%' || p_query || '%'
        AND (p_category = 'all' 
             OR (p_category = 'links' AND n.has_link)
             OR (p_category = 'media' AND n.has_media)
             OR (p_category = 'files' AND n.has_files))
        AND (p_tag_names IS NULL OR t.name = ANY(p_tag_names))
      ORDER BY n.created_at DESC
      LIMIT p_limit
    ) n
  );
END;
$$;

-- MCP: Search by date range
CREATE OR REPLACE FUNCTION mcp_search_by_date_range(
  api_key TEXT,
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ,
  p_limit INT DEFAULT 50
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  uid UUID;
BEGIN
  uid := mcp_validate_key(api_key);
  
  RETURN (
    SELECT json_build_object('notes', COALESCE(json_agg(row_to_json(n.*) ORDER BY n.created_at DESC), '[]'::json))
    FROM (
      SELECT id, content, created_at, has_link, has_media, has_files
      FROM notes
      WHERE user_id = uid
        AND deleted_at IS NULL
        AND created_at >= p_start_date
        AND created_at <= p_end_date
      LIMIT p_limit
    ) n
  );
END;
$$;

-- MCP: List attachments for a note
CREATE OR REPLACE FUNCTION mcp_list_attachments(api_key TEXT, p_note_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  uid UUID;
BEGIN
  uid := mcp_validate_key(api_key);
  
  IF NOT EXISTS (SELECT 1 FROM notes WHERE id = p_note_id AND user_id = uid) THEN
    RAISE EXCEPTION 'Note not found';
  END IF;
  
  RETURN (
    SELECT json_build_object('attachments', COALESCE(json_agg(row_to_json(a.*)), '[]'::json))
    FROM (
      SELECT id, type, filename, mime_type, size, storage_path, created_at
      FROM attachments
      WHERE note_id = p_note_id
      ORDER BY created_at
    ) a
  );
END;
$$;

-- MCP: Create attachment record
CREATE OR REPLACE FUNCTION mcp_create_attachment(
  api_key TEXT,
  p_note_id UUID,
  p_type TEXT,
  p_storage_path TEXT,
  p_filename TEXT,
  p_mime_type TEXT,
  p_size INT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  uid UUID;
  new_id UUID;
  update_field TEXT;
BEGIN
  uid := mcp_validate_key(api_key);
  
  IF NOT EXISTS (SELECT 1 FROM notes WHERE id = p_note_id AND user_id = uid) THEN
    RAISE EXCEPTION 'Note not found';
  END IF;
  
  INSERT INTO attachments (note_id, type, storage_path, filename, mime_type, size)
  VALUES (p_note_id, p_type, p_storage_path, p_filename, p_mime_type, p_size)
  RETURNING id INTO new_id;
  
  IF p_type IN ('image', 'video', 'audio') THEN
    UPDATE notes SET has_media = true, updated_at = now() WHERE id = p_note_id;
  ELSE
    UPDATE notes SET has_files = true, updated_at = now() WHERE id = p_note_id;
  END IF;
  
  RETURN json_build_object('id', new_id, 'storage_path', p_storage_path);
END;
$$;

-- MCP: Get attachment for deletion
CREATE OR REPLACE FUNCTION mcp_get_attachment(api_key TEXT, p_attachment_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  uid UUID;
  result JSON;
BEGIN
  uid := mcp_validate_key(api_key);
  
  SELECT json_build_object('id', a.id, 'storage_path', a.storage_path, 'note_id', a.note_id)
  INTO result
  FROM attachments a
  JOIN notes n ON a.note_id = n.id
  WHERE a.id = p_attachment_id AND n.user_id = uid;
  
  IF result IS NULL THEN
    RAISE EXCEPTION 'Attachment not found';
  END IF;
  
  RETURN result;
END;
$$;

-- MCP: Delete attachment record
CREATE OR REPLACE FUNCTION mcp_delete_attachment(api_key TEXT, p_attachment_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  uid UUID;
  att_note_id UUID;
  att_storage_path TEXT;
BEGIN
  uid := mcp_validate_key(api_key);
  
  SELECT a.note_id, a.storage_path INTO att_note_id, att_storage_path
  FROM attachments a
  JOIN notes n ON a.note_id = n.id
  WHERE a.id = p_attachment_id AND n.user_id = uid;
  
  IF att_note_id IS NULL THEN
    RAISE EXCEPTION 'Attachment not found';
  END IF;
  
  DELETE FROM attachments WHERE id = p_attachment_id;
  
  RETURN json_build_object('success', true, 'storage_path', att_storage_path);
END;
$$;
