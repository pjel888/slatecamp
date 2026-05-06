# Formal Supabase Rebaseline Design

This design does not pretend the old migration lineage exists. The current repository cannot recover 214 remote-only migration-history entries as original SQL files.

## Required conclusions

- Broad `supabase migration repair --status reverted` on 214 remote-only rows is unsafe unless separate schema proof establishes those migration effects are absent or intentionally replaced.
- `supabase db pull` can capture current remote schema shape into a local migration, but it does not restore granular historical lineage.
- Production apply must not proceed until rebaseline is tested on local/staging/preview.
- Admin audit schema must first be validated against local/staging/preview.

## Safe path

1. Preserve current evidence and backups.
2. Create staging/preview branch or separate staging project.
3. Snapshot remote schema shape without repairing production history.
4. Apply additive admin audit schema to staging only.
5. Apply admin sync payloads to staging only.
6. Validate readback and rollback.
7. Only then design a production cutover/rebaseline.
