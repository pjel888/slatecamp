# Reconciliation Strategy

Status: SAFE_RECONCILIATION_BLOCKED

## Chosen path

No live migration-history mutation will be performed in this run.

## Why

The mismatch is not a small missing-file problem. It is a migration-lineage mismatch:

- 214 remote-only migration-history versions
- 96 local-only migration versions
- 0 restorable exact-version migration files found in Git history
- remote admin AI audit schema absent

The Supabase CLI's suggested repair would mark 214 remote history rows as reverted. That would be an unsafe history rewrite without proof that the corresponding schema effects are absent.

## Actions considered

1. Restore missing migration files from Git history
   - Result: unavailable; no matching files found.

2. Use `supabase db pull`
   - Safer than repair for schema capture, but not sufficient to reconcile migration history.
   - Also risks producing a broad snapshot migration unrelated to the original granular history.

3. Use `supabase migration repair`
   - Rejected as unsafe/speculative for this mismatch scale.

4. Direct-apply admin audit schema migration
   - Technically possible with `supabase db query --linked --file`, but rejected because the user's own gate requires migration-history reconciliation and clean dry-run before live admin schema/apply.

## Safe stopping point

Stop before DB mutation. Commit evidence, diagnosis, and reports only.

## Required future database-owner path

- Find/export the original granular migration files matching the 214 remote-only versions, or
- create a deliberate baseline/rebaseline procedure with backup and DB owner approval, then
- rerun `supabase migration list --linked`, `supabase db push --dry-run`, and admin schema probe.
