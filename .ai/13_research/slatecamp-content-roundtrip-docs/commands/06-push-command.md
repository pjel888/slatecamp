# Push Command Spec

## Dry-run default

```bash
bun run content-audit:push:dry-run -- --article-id <article_id>
```

This should:

```text
- compose candidate if needed
- generate diff if needed
- fetch current Supabase row
- run stale check
- print what would change
- write push-report.json and push-result.json
- not update Supabase
```

## Apply

```bash
bun run content-audit:push:apply -- --article-id <article_id>
```

This should update Supabase only if:

```text
candidate.md exists or can be safely auto-composed
candidate hash differs from original hash
current Supabase hash equals original hash
no unresolved parser errors
no unresolved placeholder errors
no UI block preservation failures
explicit --apply passed
```

## Bulk apply

```bash
bun run content-audit:push:apply -- --all-safe --confirm "APPLY ALL SAFE CONTENT AUDIT PUSHES"
```

The exact confirmation phrase is required before bulk apply can proceed.

## Push result

Write both:

```text
push-report.json
push-result.json
```

Include:

```text
article_id
slug
attempted_at
dry_run
apply
remote_hash_before
original_hash
candidate_hash
stale_check_passed
pushed
blockers
warnings
updated_rows_count
updated_at_after if available
```
