-- Wiki bookmarks: persist per-user article bookmarks in the database
-- Replaces the previous localStorage-only implementation

CREATE TABLE public.wiki_bookmarks (
  bookmark_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  article_id   UUID NOT NULL REFERENCES public.wiki_articles(article_id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, article_id)
);

ALTER TABLE public.wiki_bookmarks ENABLE ROW LEVEL SECURITY;

-- RLS: users can only manage their own bookmarks
CREATE POLICY "wb_select_own" ON public.wiki_bookmarks
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "wb_insert_own" ON public.wiki_bookmarks
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "wb_delete_own" ON public.wiki_bookmarks
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_wiki_bookmarks_user ON public.wiki_bookmarks USING btree (user_id, created_at DESC);
CREATE INDEX idx_wiki_bookmarks_user_article ON public.wiki_bookmarks USING btree (user_id, article_id);
