-- Update MCP functions to include display_id in responses

-- MCP: List notes (add display_id)
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
    SELECT id, display_id, content, source, parent_id, is_locked, has_link, has_media, has_files,
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

-- MCP: Get single note with tags and attachments (add display_id)
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
    'display_id', n.display_id,
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

-- MCP: Get notes by tag (add display_id)
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
      SELECT n.id, n.display_id, n.content, n.created_at, n.has_link, n.has_media, n.has_files
      FROM notes n
      JOIN note_tags nt ON n.id = nt.note_id
      WHERE nt.tag_id = tid AND n.user_id = uid AND n.deleted_at IS NULL
      LIMIT p_limit
    ) n
  );
END;
$$;

-- MCP: Search notes (add display_id)
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
      SELECT DISTINCT n.id, n.display_id, n.content, n.created_at, n.has_link, n.has_media, n.has_files
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

-- MCP: Search by date range (add display_id)
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
      SELECT id, display_id, content, created_at, has_link, has_media, has_files
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
