# Safe Update Rules

## Article update rules

Only update `wiki_articles.content` after:

```text
candidate.md composed
candidate.md diffed
current Supabase content hash matches original hash
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

Bulk push should not be implemented in MVP. If added later, require:

```text
--apply
--all
--confirm <exact phrase>
```

## Conflict handling

If stale:

```text
write conflict-report.json
abort
```
