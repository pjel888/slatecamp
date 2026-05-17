# Supabase Migration History Reconciliation — 2026-05-17

## Decision

Use a non-Docker, remote-history-aligned reconciliation. Do not require local Supabase containers for this lane.

## Starting state

`bunx supabase migration list --linked` showed severe lineage drift:

- matched local/remote versions: 6
- local-only versions: 96
- remote-only versions: 214
- local migration files in `supabase/migrations`: 102
- unique local version prefixes: 57

`bunx supabase db push --dry-run --linked` was blocked because the remote migration history contained versions missing from the local migrations directory.

## Reconciliation applied locally

1. Preserved current remote history locally by creating empty placeholder migration files for the 214 remote-only versions.
2. Archived 95 legacy local-only migration files out of `supabase/migrations` into:
   - `.ai/09_archive/supabase-local-only-migrations-2026-05-17/`
3. Kept the new forward migration in the active migrations directory:
   - `supabase/migrations/20260517043338_fix_supabase_lint_rpc_contracts.sql`
4. Captured machine-readable evidence in:
   - `.ai/02_audits/supabase-migration-history-reconciliation-2026-05-17.json`

## After state

`bunx supabase migration list --linked` now reports:

- matched local/remote versions: 220
- local-only versions: 1
- remote-only versions: 0

The only local-only version is the intended forward migration:

- `20260517043338_fix_supabase_lint_rpc_contracts.sql`

`bunx supabase db push --dry-run --linked` now succeeds and reports it would push only:

- `20260517043338_fix_supabase_lint_rpc_contracts.sql`

## Safety notes

- No Docker was used.
- No remote database mutation was performed during this reconciliation.
- No broad `supabase migration repair` was used.
- Original local-only migration SQL was not deleted; it was moved into the archive folder for traceability.
- Placeholder migrations are intentionally empty because their effects already exist in the remote migration history and the original granular SQL files are unavailable in the repository.

## Remaining Supabase warning state

Remote database lint still reports 4 function errors until the new forward migration is applied to the linked Supabase project:

- `public.get_review_deck`
- `public.get_fallback_questions`
- `public.get_unseen_questions`
- `public.search_wiki_articles_hybrid`

The migration history blocker is now cleared at dry-run level, so applying the single forward migration can be reviewed separately.
