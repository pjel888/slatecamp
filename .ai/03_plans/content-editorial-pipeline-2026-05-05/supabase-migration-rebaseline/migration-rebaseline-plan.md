# Supabase Migration Rebaseline Plan

Status: PLAN_ONLY_NO_LIVE_MUTATION

## Current lineage evidence

- Remote-only versions: 214
- Local-only versions: 96
- Migration repair safe now: false

## Safe path

1. Capture a database backup outside this script.
2. Recover original granular migration files if available.
3. If unrecoverable, create a formal baseline branch with a remote schema snapshot, then verify object-by-object.
4. Only after object verification may a database owner decide whether metadata repair is appropriate.

## Explicit non-actions

- Do not mark 214 remote-only versions reverted.
- Do not mark 96 local-only versions applied.
- Do not direct-apply admin schema to live production while db push --dry-run fails.
