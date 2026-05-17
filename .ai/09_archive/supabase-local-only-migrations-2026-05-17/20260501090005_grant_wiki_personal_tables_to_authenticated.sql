-- Ensure authenticated learners can use their own wiki personalization rows.
-- RLS remains owner-scoped; this migration restores the table privileges that
-- PostgREST needs before evaluating those policies.

BEGIN;

ALTER TABLE public.wiki_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wiki_article_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wiki_article_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wiki_highlights ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, DELETE ON TABLE public.wiki_bookmarks TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.wiki_article_reads TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.wiki_article_feedback TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.wiki_highlights TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.wiki_bookmarks TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.wiki_article_reads TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.wiki_article_feedback TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.wiki_highlights TO service_role;

DROP POLICY IF EXISTS "Learners can read their own wiki bookmarks" ON public.wiki_bookmarks;
CREATE POLICY "Learners can read their own wiki bookmarks"
  ON public.wiki_bookmarks
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Learners can create their own wiki bookmarks" ON public.wiki_bookmarks;
CREATE POLICY "Learners can create their own wiki bookmarks"
  ON public.wiki_bookmarks
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Learners can delete their own wiki bookmarks" ON public.wiki_bookmarks;
CREATE POLICY "Learners can delete their own wiki bookmarks"
  ON public.wiki_bookmarks
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Learners can read their own article reads" ON public.wiki_article_reads;
CREATE POLICY "Learners can read their own article reads"
  ON public.wiki_article_reads
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Learners can create their own article reads" ON public.wiki_article_reads;
CREATE POLICY "Learners can create their own article reads"
  ON public.wiki_article_reads
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Learners can update their own article reads" ON public.wiki_article_reads;
CREATE POLICY "Learners can update their own article reads"
  ON public.wiki_article_reads
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Learners can read their own wiki feedback" ON public.wiki_article_feedback;
CREATE POLICY "Learners can read their own wiki feedback"
  ON public.wiki_article_feedback
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Learners can create their own wiki feedback" ON public.wiki_article_feedback;
CREATE POLICY "Learners can create their own wiki feedback"
  ON public.wiki_article_feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Learners can update their own wiki feedback" ON public.wiki_article_feedback;
CREATE POLICY "Learners can update their own wiki feedback"
  ON public.wiki_article_feedback
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Learners can read their own wiki highlights" ON public.wiki_highlights;
CREATE POLICY "Learners can read their own wiki highlights"
  ON public.wiki_highlights
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Learners can create their own wiki highlights" ON public.wiki_highlights;
CREATE POLICY "Learners can create their own wiki highlights"
  ON public.wiki_highlights
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Learners can update their own wiki highlights" ON public.wiki_highlights;
CREATE POLICY "Learners can update their own wiki highlights"
  ON public.wiki_highlights
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Learners can delete their own wiki highlights" ON public.wiki_highlights;
CREATE POLICY "Learners can delete their own wiki highlights"
  ON public.wiki_highlights
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

COMMIT;
