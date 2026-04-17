# Data And Supabase Audit

## Scope

- `supabase/`
- `DATABASE_SCHEMA.sql`
- `src/lib/supabase/*`
- data-facing migrations and access-control surfaces

## Linked findings

- `DATA-001`
- `DATA-002`
- `SEC-003`
- `SEC-004`
- `CQ-001`

## Observed

- Migration chronology is active and extends beyond the date stamped in `DATABASE_SCHEMA.sql`
- Access-control truth currently lives more reliably in migrations than in the schema snapshot
- Admin/service-role pathways are common in runtime and operational flows

## Material findings

### `DATA-001` Anonymous source-row exposure

Observed in `supabase/migrations/20260412_fix_wiki_article_sources_rls.sql`:
- policy grants `SELECT` to `authenticated, anon`
- predicate is `USING (true)`

Impact:
- policy intent and actual exposure do not match

### `DATA-002` Schema snapshot is stale for RLS and authz governance

Observed:
- `DATABASE_SCHEMA.sql` is dated 2026-04-07
- later security-affecting migrations landed on 2026-04-11 and 2026-04-12

Impact:
- canonical schema guidance is not reliable for current access-control review

## Inferred

- Schema and policy governance need to be documented as one system rather than split between a stale snapshot and live migrations

## Unknown

- Whether production has all post-snapshot migrations applied cleanly
