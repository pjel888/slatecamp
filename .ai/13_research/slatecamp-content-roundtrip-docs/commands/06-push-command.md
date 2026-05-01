# Push Command Spec

## Dry-run default

```bash
pnpm content-audit:push --article <article_id>
```

This should:

```text
- compose candidate if needed
- generate diff if needed
- fetch current Supabase row
- run stale check
- print what would change
- write push-dry-run report
- not update Supabase
```

## Apply

```bash
pnpm content-audit:push --article <article_id> --apply
```

This should update Supabase only if:

```text
candidate.md exists
candidate hash differs from original hash
current Supabase hash equals original hash
no unresolved parser errors
no unresolved placeholder errors
explicit --apply passed
```

## Push result

Write:

```text
push-result.json
```

Include:

```text
article_id
old_hash
new_hash
supabase_stale_check_passed
applied
applied_at
error if any
```
