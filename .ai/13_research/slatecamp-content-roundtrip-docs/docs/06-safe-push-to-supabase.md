# Safe Push to Supabase

The local round-trip system can push approved edits back to Supabase, but only through a safe, explicit process.

## Push inputs

For articles:

```text
original.md
normalized.md
ui-blocks.json
candidate.md
article-metadata.json
```

For questions:

```text
linked-questions.json
question edit files if created
question diff report
```

## Required push steps

```text
1. Compose candidate.md from normalized.md + ui-blocks.json.
2. Generate diff: original.md vs candidate.md.
3. Fetch current wiki_articles.content from Supabase.
4. Hash current content.
5. Compare current hash with article-metadata.original_content_hash.
6. If hash mismatch, abort and create conflict report.
7. If hash matches and --apply is not passed, print dry-run only.
8. If hash matches and --apply is passed, update Supabase.
9. Record sync result in sync-state.json and optional audit table.
```

## Default must be dry-run

The command should default to no mutation:

```bash
bun run content-audit:push:dry-run -- --article-id <article_id>
```

To mutate:

```bash
bun run content-audit:push:apply -- --article-id <article_id>
```

## Article update

Update only:

```text
wiki_articles.content
wiki_articles.updated_at
wiki_articles.updated_by if available
wiki_articles.updated_note if useful
```

Do not touch unrelated fields unless the repo already has a content update convention.

## Question update

Question updates must be separate and explicit.

Do not update questions just because an article changed.

Use separate commands such as:

```bash
bun run content-audit:push-question:apply -- --question-id <question_id>
```

## Conflict behavior

If Supabase current content differs from exported original:

```text
- abort
- write conflict-report.json
- do not push
- require re-export or manual merge
```

## Why stale-check matters

Without stale checks, local edits can overwrite changes made from the admin UI or other scripts after export.
