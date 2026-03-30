-- Enable the "vector" extension
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- Add embedding column to wiki_articles
ALTER TABLE wiki_articles ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- Create a HNSW index for faster similarity search
-- m=16, ef_construction=64 are good defaults for this size
CREATE INDEX IF NOT EXISTS idx_wiki_articles_embedding ON wiki_articles USING hnsw (embedding vector_cosine_ops);

-- Helper function for similarity search
CREATE OR REPLACE FUNCTION match_wiki_articles (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  article_id uuid,
  title text,
  slug text,
  content text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    wiki_articles.article_id,
    wiki_articles.title,
    wiki_articles.slug,
    wiki_articles.content,
    1 - (wiki_articles.embedding <=> query_embedding) AS similarity
  FROM wiki_articles
  WHERE 1 - (wiki_articles.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;
