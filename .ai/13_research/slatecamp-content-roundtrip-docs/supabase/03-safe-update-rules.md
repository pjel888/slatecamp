# Safe Update Rules

## Article update rules

Only update `wiki_articles.content` after:

```text
candidate.md composed
candidate.md diffed
current Supabase content hash matches original hash
candidate hash differs from original hash
--apply passed
```

Recommended update fields:

```text
content
updated_at
updated_by if available
updated_note
```

## Question update rules

Do not update questions as part of article push.

Question updates require separate explicit command and stale check per question.

## No bulk blind push

Bulk push is guarded by all of the same per-article checks and requires an exact confirmation phrase:

```bash
bun run content-audit:push:apply -- --all-safe --confirm "APPLY ALL SAFE CONTENT AUDIT PUSHES"
```

Without that exact confirmation, `--all-safe --apply` aborts before fetching or mutating rows.

## Conflict handling

If stale:

```text
write conflict-report.json
abort
```

Push also writes both `push-report.json` and `push-result.json` for compatibility with older docs.
