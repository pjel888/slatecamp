# Schema Source-of-Truth Remediation Note

Date: 2026-05-05
Source audit: `.ai/02_audits/CODEBASE_AUDIT_REPORT_2026_05_05.md`
Remediation scope: non-destructive inventory only; no remote migrations applied and no database reset performed.

## Current schema sources

| File/source | Current state | Recommendation |
| --- | --- | --- |
| `supabase/migrations/` | Forward migration chronology. A new forward migration was added for AI audit access restrictions. The non-forward rollback script was moved out. | Treat as the deployable migration history. Do not place rollback/manual repair SQL here. |
| `DATABASE_SCHEMA.sql` | Large root snapshot, but the 2026-05-05 audit found it stale/incomplete relative to newer migrations/app references. | Keep as reference only until regenerated from the target database after migration reconciliation. |
| `src/types/supabase.ts` | Generated Supabase types exist, but drift is confirmed: newer AI audit views/RPC are absent from generated types. Known stale app references were corrected/quarantined in the 2026-05-05 Supabase verification sprint. | Regenerate from the verified target schema after DB reconciliation; do not hand-edit. |
| `schema.sql` | Empty file. | Mark stale/non-authoritative; remove or archive in a later cleanup after human approval. |
| `db-spec.json` | Large PostgREST API spec snapshot; may not match migrations/current app. | Treat as generated reference only; regenerate or archive after source-of-truth decision. |

## Suspicious app/schema references checked

| Name | Migration presence | Type/schema presence | App references | Finding |
| --- | ---: | --- | ---: | --- |
| `taxonomy_nodes` | 0 migration hits | absent from `DATABASE_SCHEMA.sql`, `db-spec.json`, and `src/types/supabase.ts` | formerly `src/lib/actions/quiz-v2/get-confidence-matrix.ts` | Fixed 2026-05-05: active query now uses `taxonomy_tree`, which exists in generated types. |
| `srs_queue` | 0 migration hits | absent from `DATABASE_SCHEMA.sql`, `db-spec.json`, and `src/types/supabase.ts` | formerly `src/lib/actions/srs-dashboard.ts`, developer DB viewer fallback | Fixed 2026-05-05: SRS dashboard query now uses `user_srs_cards` scoped to the authenticated user; developer DB viewer fallback was updated to current table names. |
| `exam_profiles` | 0 migration hits | absent from `DATABASE_SCHEMA.sql`, `db-spec.json`, and `src/types/supabase.ts` | formerly developer test-data action/tests and DB viewer fallback | Quarantined 2026-05-05: developer test-session generation is disabled with an explicit message until rebuilt for `quiz_sessions`/taxonomy; DB viewer fallback no longer lists this stale table. |
| `subjects` | 0 `CREATE TABLE` hits; only generic/content mentions | absent as a table from `DATABASE_SCHEMA.sql` and `src/types/supabase.ts`; `db-spec.json` contains string mentions but not reliable table authority | formerly developer test-data action and many non-DB UI/domain uses of the word subjects | Quarantined 2026-05-05 for developer tooling. Generic UI/domain uses of "subjects" are not schema evidence. |
| `review_sessions` | 0 migration hits | absent from `DATABASE_SCHEMA.sql`, `db-spec.json`, and `src/types/supabase.ts` | formerly developer/test-data tooling; `daily-mission.ts` comment only says legacy table was replaced | Quarantined 2026-05-05: stale developer generator no longer inserts into `review_sessions`; active daily mission code uses `quiz_sessions`. |
| `cage_verifications` | 0 migration hits | absent from `DATABASE_SCHEMA.sql`, `db-spec.json`, and `src/types/supabase.ts` | formerly `src/lib/queries/ceo/analytics/get-cage-quality.ts` | Quarantined 2026-05-05: CEO CAGE quality query now returns an explicit empty-state result rather than querying a missing table or synthesizing misleading metrics. |
| `teach_back_responses` | 0 migration hits | absent from `DATABASE_SCHEMA.sql`, `db-spec.json`, and `src/types/supabase.ts` | formerly `src/lib/queries/ceo/analytics/get-engagement-depth.ts` | Quarantined 2026-05-05: engagement-depth analytics exclude deferred teach-back responses until a forward migration/source exists. |

## Safe change completed

Moved `supabase/migrations/rollback_lea_to_ale.sql` to:

`.ai/09_archive/store/DB_ROLLBACKS/2026-05-05/rollback_lea_to_ale.sql`

Reason: rollback/manual repair SQL must not live in the active migration directory. The archived copy is historical only and must not be applied without explicit human approval and a backup/restore plan.

## Recommended source of truth

Production DB work should use this hierarchy until a formal schema reconciliation sprint is completed:

1. `supabase/migrations/` for forward deployable changes.
2. The actual linked Supabase project schema, inspected with Supabase CLI/MCP in read-only mode.
3. Regenerated `src/types/supabase.ts` from that verified schema.
4. A regenerated `DATABASE_SCHEMA.sql` snapshot after migration reconciliation.

Do not use `schema.sql` or `db-spec.json` as authoritative production schema sources.

## Verification checklist before production DB operations

- Run a dry local Supabase migration replay against a fresh database.
- Generate fresh types from the replayed/local target schema.
- Compare table/view/RPC names used by `src/**/*.ts(x)` against generated types.
- Confirm no active app code reintroduced direct `.from()` calls to stale objects: `taxonomy_nodes`, `srs_queue`, `exam_profiles`, `subjects`, `review_sessions`, `cage_verifications`, and `teach_back_responses`.
- Regenerate `DATABASE_SCHEMA.sql` only after the deployable migration history is confirmed.

## Latest status — 2026-05-05 Supabase verification attempt

Static stale DB reference cleanup is complete. No active `.from()` calls remain in `src` for the known stale objects:

- `taxonomy_nodes`
- `srs_queue`
- `exam_profiles`
- `subjects`
- `review_sessions`
- `cage_verifications`
- `teach_back_responses`

`src/types/supabase.ts` still has confirmed drift:

- Missing newer AI audit views/RPC:
  - `ai_audit_article_overview`
  - `ai_audit_question_overview`
  - `ai_audit_design_scenario_question_overview`
  - `ai_audit_all_question_overview`
  - `ai_audit_dashboard_summary`
  - `ai_audit_finding_overview`
  - `seed_ai_audit_status_cache`
- Present current known-good objects:
  - `taxonomy_tree`
  - `user_srs_cards`
  - `quiz_sessions`

Current source-of-truth stance:

- `supabase/migrations/` remains the deployable source-of-truth candidate, but only after replay verification.
- `DATABASE_SCHEMA.sql`, `schema.sql`, and `db-spec.json` are not production authority right now.
- `schema.sql` is empty and non-authoritative.
- `db-spec.json` is a generated/reference artifact only until regenerated from a verified target.
- `DATABASE_SCHEMA.sql` is a snapshot/reference only until regenerated after migration reconciliation.

Open blockers:

- No safe DB verification target was available in the latest environment: Docker was unavailable and `supabase/config.toml` was absent.
- `supabase/seed.sql` is absent; this appears intentional or currently undocumented and should be clarified during local verification setup.
- `bunx supabase migration list` reached an unclear remote/cached context. That context must not be treated as staging verification, must not receive migrations, and must not be used for type generation.
- Migration replay remains a production blocker.
- AI audit access-control DB verification remains a production blocker.
- Supabase type regeneration remains a production blocker.
- Do not hand-edit generated database types. Regenerate `src/types/supabase.ts` only from a verified local/staging schema.
