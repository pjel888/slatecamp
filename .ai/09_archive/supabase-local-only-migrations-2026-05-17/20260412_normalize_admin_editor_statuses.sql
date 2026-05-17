-- Normalize admin editor workflow statuses to the canonical vocabulary:
-- draft, in_review, changes_requested, approved, published, archived

UPDATE public.wiki_articles
SET status = 'in_review'
WHERE status IN ('review', 'pending_review');

UPDATE public.wiki_ei_prompts
SET status = 'in_review'
WHERE status IN ('review', 'pending_review');

DO $$
DECLARE
  wiki_constraint_name text;
BEGIN
  SELECT conname
  INTO wiki_constraint_name
  FROM pg_constraint
  WHERE conrelid = 'public.wiki_articles'::regclass
    AND pg_get_constraintdef(oid) ILIKE '%status%'
  LIMIT 1;

  IF wiki_constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.wiki_articles DROP CONSTRAINT %I', wiki_constraint_name);
  END IF;
END $$;

ALTER TABLE public.wiki_articles
  ADD CONSTRAINT wiki_articles_status_check
  CHECK (status IN ('draft', 'in_review', 'changes_requested', 'approved', 'published', 'archived'));
