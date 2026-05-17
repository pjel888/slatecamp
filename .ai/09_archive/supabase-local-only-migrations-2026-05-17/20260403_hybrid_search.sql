-- Add Full-Text Search column and index to wiki_articles
ALTER TABLE wiki_articles ADD COLUMN IF NOT EXISTS fts tsvector GENERATED ALWAYS AS (
  setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(content, '')), 'B')
) STORED;

CREATE INDEX IF NOT EXISTS idx_wiki_articles_fts ON wiki_articles USING GIN (fts);

-- Hybrid search function (Keyword + Semantic)
CREATE OR REPLACE FUNCTION search_wiki_articles_hybrid(
  query_text text,
  query_embedding vector(1536),
  match_count int DEFAULT 10,
  fts_weight float DEFAULT 1.0,
  semantic_weight float DEFAULT 1.0
)
RETURNS TABLE (
  article_id uuid,
  title text,
  slug text,
  snippet text,
  rank float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH fts_results AS (
    SELECT
      wa.article_id,
      ts_rank(wa.fts, websearch_to_tsquery('english', query_text)) as fts_rank,
      ts_headline('english', wa.content, websearch_to_tsquery('english', query_text), 'MaxWords=25, MinWords=15, ShortWord=3, HighlightAll=FALSE, StartSel="<mark>", StopSel="</mark>"') as fts_snippet
    FROM wiki_articles wa
    WHERE wa.fts @@ websearch_to_tsquery('english', query_text)
    LIMIT match_count * 2
  ),
  semantic_results AS (
    SELECT
      wa.article_id,
      1 - (wa.embedding <=> query_embedding) as semantic_similarity
    FROM wiki_articles wa
    WHERE wa.embedding IS NOT NULL
    ORDER BY wa.embedding <=> query_embedding
    LIMIT match_count * 2
  )
  SELECT
    wa.article_id,
    wa.title,
    wa.slug,
    COALESCE(fr.fts_snippet, substring(wa.content from 1 for 150) || '...') as snippet,
    (COALESCE(fr.fts_rank, 0) * fts_weight + COALESCE(sr.semantic_similarity, 0) * semantic_weight) as rank
  FROM wiki_articles wa
  LEFT JOIN fts_results fr ON wa.article_id = fr.article_id
  LEFT JOIN semantic_results sr ON wa.article_id = sr.article_id
  WHERE fr.article_id IS NOT NULL OR sr.article_id IS NOT NULL
  ORDER BY rank DESC
  LIMIT match_count;
END;
$$;
