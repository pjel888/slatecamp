-- Ensure learner-facing wiki article sources are readable without exposing draft sources.
-- Previous environments can miss the anon/authenticated SELECT grant even when the
-- table and policies exist, which causes getArticleSources() to fail with
-- "permission denied for table wiki_article_sources".

BEGIN;

ALTER TABLE public.wiki_article_sources ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON TABLE public.wiki_article_sources TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.wiki_article_sources TO service_role;

DROP POLICY IF EXISTS "Anyone can read wiki_article_sources" ON public.wiki_article_sources;
DROP POLICY IF EXISTS "wiki_article_sources_select_public" ON public.wiki_article_sources;
DROP POLICY IF EXISTS "Admins can manage wiki_article_sources" ON public.wiki_article_sources;
DROP POLICY IF EXISTS "Allow public read access to wiki sources" ON public.wiki_article_sources;
DROP POLICY IF EXISTS "Published wiki article sources are publicly readable" ON public.wiki_article_sources;
CREATE POLICY "Published wiki article sources are publicly readable"
  ON public.wiki_article_sources
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.wiki_articles AS article
      WHERE article.article_id = wiki_article_sources.article_id
        AND article.status = 'published'
    )
  );

DROP POLICY IF EXISTS "Admins can manage wiki sources" ON public.wiki_article_sources;
CREATE POLICY "Admins can manage wiki sources"
  ON public.wiki_article_sources
  FOR ALL
  TO authenticated
  USING (public.has_admin_role())
  WITH CHECK (public.has_admin_role());

DROP POLICY IF EXISTS "Service role full access" ON public.wiki_article_sources;
CREATE POLICY "Service role full access"
  ON public.wiki_article_sources
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

COMMIT;
