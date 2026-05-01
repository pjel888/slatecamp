# Acceptance Criteria

## Export

- [ ] Command exports all `wiki_articles` or a selected article.
- [ ] Each article has `original.md` exactly matching Supabase `content`.
- [ ] Each article has `article-metadata.json`.
- [ ] Linked questions are exported via `questions.article_id`.
- [ ] Sources are exported via `wiki_article_sources.article_id`.
- [ ] Taxonomy is exported via `wiki_article_taxonomy` and `taxonomy_tree`.
- [ ] Manifest is written.
- [ ] Hashes are computed.

## Normalization

- [ ] Custom UI blocks are detected.
- [ ] Custom UI blocks are preserved in `ui-blocks.json`.
- [ ] `normalized.md` contains placeholders.
- [ ] Unknown blocks are preserved, not deleted.
- [ ] Parser warnings/errors are written.

## Component inventory

- [ ] Actual `.tsx`/`.jsx` files are scanned.
- [ ] Component inventory is generated.
- [ ] Article component usage is generated.
- [ ] Unknown article components are reported.
- [ ] Unused likely article components are reported if possible.

## Compose/diff

- [ ] `candidate.md` can be generated.
- [ ] UI placeholders are restored to exact raw blocks.
- [ ] Diff report is generated.
- [ ] Placeholder mismatch aborts safely.

## Push

- [ ] Push defaults to dry-run.
- [ ] Push requires `--apply` to mutate Supabase.
- [ ] Push stale-checks current Supabase content hash.
- [ ] Push aborts on stale content.
- [ ] Push writes result/conflict report.

## Safety

- [ ] No AI APIs are called.
- [ ] No automatic fact-checking is added.
- [ ] No article/question is overwritten during export/normalize/diff.
- [ ] All scripts pass typecheck/lint according to repo conventions.
