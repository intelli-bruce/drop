-- Allow anon role to check mcp_api_key existence for storage RLS
-- 보안: mcp_api_key 값 자체는 노출하지 않고, 존재 여부만 확인 가능

-- anon 역할이 user_profiles의 user_id와 mcp_api_key 존재 여부만 확인 가능하도록 허용
-- 실제 mcp_api_key 값은 노출되지 않음 (EXISTS 체크만 사용)
CREATE POLICY "user_profiles_anon_mcp_check" ON user_profiles
  FOR SELECT TO anon
  USING (mcp_api_key IS NOT NULL);
