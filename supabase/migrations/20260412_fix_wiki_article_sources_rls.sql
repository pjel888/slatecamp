-- Enable RLS and set up policies for wiki_article_sources
-- This resolves the "permission denied" error in getArticleSources

ALTER TABLE public.wiki_article_sources ENABLE ROW LEVEL SECURITY;

-- 1. Public/Authenticated Read Access
-- All users (including non-logged in ones if allowed by anon) should be able to see verified sources for published articles.
-- For simplicity in the wiki, we'll allow all authenticated users to read sources.
CREATE POLICY "Allow public read access to wiki sources"
  ON public.wiki_article_sources
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- 2. Admin Management Access
-- Admins can perform all operations (INSERT, UPDATE, DELETE)
CREATE POLICY "Admins can manage wiki sources"
  ON public.wiki_article_sources
  FOR ALL
  TO authenticated
  USING (public.has_admin_role())
  WITH CHECK (public.has_admin_role());

-- 3. Service Role Access
-- Ensure service_role has full access (bypass RLS is default, but explicit is better for clarity)
ALTER TABLE public.wiki_article_sources FORCE ROW LEVEL SECURITY; -- Just to be safe
CREATE POLICY "Service role full access"
  ON public.wiki_article_sources
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Ensure grants are correct
GRANT SELECT ON public.wiki_article_sources TO authenticated, anon;
