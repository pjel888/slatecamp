-- Step 1.2: Composite index for node_id + is_primary lookups
-- Used by resolveArticleAndNode Path 2 (wiki-actions.ts:402-407)
CREATE INDEX IF NOT EXISTS idx_wiki_article_taxonomy_node_primary
  ON wiki_article_taxonomy(node_id, is_primary);

-- Step 1.3: Composite index for article_id + is_primary lookups
-- Used by resolveArticleAndNode Path 1 (wiki-actions.ts:362-366)
CREATE INDEX IF NOT EXISTS idx_wiki_article_taxonomy_article_primary
  ON wiki_article_taxonomy(article_id, is_primary);
