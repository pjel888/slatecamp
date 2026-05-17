-- 1. Ensure Full-Text Search column and index exist
ALTER TABLE wiki_articles ADD COLUMN IF NOT EXISTS fts tsvector GENERATED ALWAYS AS (
  setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(content, '')), 'B')
) STORED;

CREATE INDEX IF NOT EXISTS idx_wiki_articles_fts ON wiki_articles USING GIN (fts);

-- 2. Create the optimized search function
CREATE OR REPLACE FUNCTION search_wiki_articles_pure(
  query_text text,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  article_id uuid,
  title text,
  slug text,
  snippet text,
  rank float4
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    wa.article_id,
    wa.title,
    wa.slug,
    -- Generate a highlighted snippet
    ts_headline('english', wa.content, websearch_to_tsquery('english', query_text), 
      'MaxWords=25, MinWords=15, StartSel="<mark>", StopSel="</mark>"') as snippet,
    -- Rank by relevance
    ts_rank(wa.fts, websearch_to_tsquery('english', query_text)) as rank
  FROM wiki_articles wa
  WHERE wa.fts @@ websearch_to_tsquery('english', query_text)
    AND wa.status = 'published' -- Only search published content
  ORDER BY rank DESC
  LIMIT match_count;
END;
$$;
