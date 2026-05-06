# Final Rollback Instructions

Use `.ai/20_content_publish/rollback/rollback-manifest.generated.json` and the article backup JSON listed there. PATCH each affected `wiki_articles` row by exact `article_id` with the backed-up `content`, then read back and verify the backup content hash.
