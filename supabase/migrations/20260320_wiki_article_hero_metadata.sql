-- Add metadata columns for the wiki article hero component
-- These fields power the WikiArticleHero display (spec v1)

ALTER TABLE public.wiki_articles
  ADD COLUMN IF NOT EXISTS ale_tests_you TEXT,
  ADD COLUMN IF NOT EXISTS updated_note TEXT,
  ADD COLUMN IF NOT EXISTS subject_label TEXT,
  ADD COLUMN IF NOT EXISTS difficulty_label TEXT CHECK (difficulty_label IN ('Foundational', 'Intermediate', 'Advanced'));

COMMENT ON COLUMN public.wiki_articles.ale_tests_you IS 'One-sentence ALE test statement shown in article hero banner';
COMMENT ON COLUMN public.wiki_articles.updated_note IS 'Human-readable update note, e.g. "2024 Revised IRR - Official Gazette Vol. 120 No. 28"';
COMMENT ON COLUMN public.wiki_articles.subject_label IS 'Override subject label for hero, e.g. "A3 - Accessibility Standards". Falls back to taxonomy node.';
COMMENT ON COLUMN public.wiki_articles.difficulty_label IS 'Difficulty tier: Foundational, Intermediate, or Advanced. Falls back to taxonomy node.difficulty.';
