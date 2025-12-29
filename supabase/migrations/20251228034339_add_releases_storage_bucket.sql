-- Storage bucket for app releases (DMG, IPA, etc.)
INSERT INTO storage.buckets (id, name, public)
VALUES ('releases', 'releases', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to releases
CREATE POLICY "Allow public read on releases bucket"
ON storage.objects FOR SELECT
USING (bucket_id = 'releases');

-- Only service role can upload (via CI/CD)
CREATE POLICY "Allow service role upload on releases bucket"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'releases'
  AND auth.role() = 'service_role'
);

-- Only service role can delete
CREATE POLICY "Allow service role delete on releases bucket"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'releases'
  AND auth.role() = 'service_role'
);
