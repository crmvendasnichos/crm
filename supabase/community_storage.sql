-- =============================================================================
-- Comunidade: bucket de fotos/vídeos
-- Rode no SQL Editor do Supabase se o post com mídia falhar.
-- =============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('community-media', 'community-media', true, 83886080)
ON CONFLICT (id) DO UPDATE
SET public = true,
    file_size_limit = COALESCE(storage.buckets.file_size_limit, 83886080);

DROP POLICY IF EXISTS "community-media public read" ON storage.objects;
CREATE POLICY "community-media public read"
ON storage.objects FOR SELECT
USING (bucket_id = 'community-media');

DROP POLICY IF EXISTS "community-media authenticated insert" ON storage.objects;
CREATE POLICY "community-media authenticated insert"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'community-media'
  AND (storage.foldername(name))[1] IN ('posts', 'profile-avatars')
  AND (storage.foldername(name))[2] = auth.uid()::text
);

DROP POLICY IF EXISTS "community-media owner delete" ON storage.objects;
CREATE POLICY "community-media owner delete"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'community-media'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- =============================================================================
-- Post com foto/vídeo (mesmo sem texto)
-- =============================================================================

ALTER TABLE public.community_posts
  ADD COLUMN IF NOT EXISTS media_url TEXT;

ALTER TABLE public.community_posts
  ADD COLUMN IF NOT EXISTS media_type TEXT;

ALTER TABLE public.community_posts
  ALTER COLUMN content DROP NOT NULL;

ALTER TABLE public.community_posts
  DROP CONSTRAINT IF EXISTS community_posts_media_type_check;

ALTER TABLE public.community_posts
  ADD CONSTRAINT community_posts_media_type_check
  CHECK (media_type IS NULL OR media_type IN ('image', 'video'));

ALTER TABLE public.community_posts
  DROP CONSTRAINT IF EXISTS community_posts_conteudo_check;

ALTER TABLE public.community_posts
  ADD CONSTRAINT community_posts_conteudo_check
  CHECK (
    NULLIF(BTRIM(COALESCE(content, '')), '') IS NOT NULL
    OR NULLIF(BTRIM(COALESCE(media_url, '')), '') IS NOT NULL
  );

GRANT SELECT, INSERT, UPDATE, DELETE ON public.community_posts TO authenticated;
GRANT ALL ON public.community_posts TO service_role;

ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS community_posts_select_all ON public.community_posts;
CREATE POLICY community_posts_select_all ON public.community_posts
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS community_posts_insert_own ON public.community_posts;
CREATE POLICY community_posts_insert_own ON public.community_posts
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS community_posts_update_own ON public.community_posts;
CREATE POLICY community_posts_update_own ON public.community_posts
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS community_posts_delete_own ON public.community_posts;
CREATE POLICY community_posts_delete_own ON public.community_posts
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());
