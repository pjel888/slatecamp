-- Backfill direct article ownership for standard questions based on the
-- primary wiki_article_taxonomy mapping of each question topic.

UPDATE public.questions q
SET article_id = wat.article_id
FROM public.wiki_article_taxonomy wat
WHERE q.article_id IS NULL
  AND wat.node_id = q.topic_id
  AND wat.is_primary = TRUE;

-- Fallback: if a topic has no explicit primary mapping, use the first linked article.
WITH fallback_mappings AS (
  SELECT DISTINCT ON (node_id)
    node_id,
    article_id
  FROM public.wiki_article_taxonomy
  ORDER BY node_id, is_primary DESC, sort_order ASC, article_id ASC
)
UPDATE public.questions q
SET article_id = fm.article_id
FROM fallback_mappings fm
WHERE q.article_id IS NULL
  AND fm.node_id = q.topic_id;
