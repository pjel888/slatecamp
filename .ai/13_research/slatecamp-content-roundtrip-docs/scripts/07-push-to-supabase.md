# Script Spec: Push to Supabase

Suggested file:

```text
scripts/content-audit/push-to-supabase.ts
```

## Responsibilities

```text
- run compose if candidate missing/stale
- run diff
- fetch current Supabase article
- compare current hash to original hash
- dry-run by default
- apply only with explicit --apply
- update sync-state.json
```

## Update query

Use existing Supabase server-side client conventions.

Target table:

```text
wiki_articles
```

Target row:

```text
article_id = article_id
```

Target update:

```text
content = candidate.md
updated_at = now
updated_note = optional
updated_by = optional if available
```

## Abort conditions

```text
stale content
parser failed
compose failed
diff missing
unresolved placeholder
no --apply
```
