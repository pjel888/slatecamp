-- ============================================================================
-- Add article_id foreign key to questions table
-- Enables direct article-question relational linking with ON DELETE CASCADE
-- ============================================================================

-- Add article_id column as optional foreign key to wiki_articles
ALTER TABLE public.questions 
ADD COLUMN IF NOT EXISTS article_id UUID REFERENCES public.wiki_articles(article_id) ON DELETE CASCADE;

-- Create index for efficient lookups by article_id
CREATE INDEX IF NOT EXISTS idx_questions_article_id ON public.questions(article_id);

-- Add comment for documentation
COMMENT ON COLUMN public.questions.article_id IS 'Optional direct link to parent article. When set, question is directly associated with this article. Deleted via CASCADE when article is deleted.';
