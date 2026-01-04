-- Fix storage RLS for MCP uploads
-- MCP 서버는 anon key를 사용하므로 authenticated가 아닌 anon 역할로 접근
-- user_profiles.mcp_api_key를 통해 유효한 API key를 가진 사용자의 폴더에만 업로드 허용

-- 기존 정책은 유지 (authenticated 사용자용)

-- anon 사용자가 유효한 MCP API key의 user_id 폴더에 업로드 가능하도록 허용
-- 폴더 구조: {user_id}/{note_id}/{filename}
CREATE POLICY "storage_insert_mcp" ON storage.objects FOR INSERT TO anon
  WITH CHECK (
    bucket_id = 'attachments'
    AND EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id::text = (storage.foldername(name))[1]
      AND mcp_api_key IS NOT NULL
    )
  );

-- anon 사용자가 유효한 MCP API key의 user_id 폴더에서 읽기 가능
CREATE POLICY "storage_select_mcp" ON storage.objects FOR SELECT TO anon
  USING (
    bucket_id = 'attachments'
    AND EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id::text = (storage.foldername(name))[1]
      AND mcp_api_key IS NOT NULL
    )
  );

-- anon 사용자가 유효한 MCP API key의 user_id 폴더에서 삭제 가능
CREATE POLICY "storage_delete_mcp" ON storage.objects FOR DELETE TO anon
  USING (
    bucket_id = 'attachments'
    AND EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id::text = (storage.foldername(name))[1]
      AND mcp_api_key IS NOT NULL
    )
  );
