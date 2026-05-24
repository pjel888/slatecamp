# Supabase Advisor Remaining SQL Remediation — 2026-05-24

## Baseline after first safe migration

Captured with:

```bash
bunx supabase db advisors --linked --output json
```

Findings remaining before this pass: 78 WARN.

Breakdown:

- `multiple_permissive_policies`: 53
- `authenticated_security_definer_function_executable`: 24
- `auth_leaked_password_protection`: 1

## Migration created

`supabase/migrations/20260524010000_resolve_supabase_remaining_advisor_safe_subset.sql`

## SQL changes in this pass

### RLS policy consolidation

The migration consolidates duplicate permissive RLS policies by:

- Moving service-role-only policies from broad `public` role policies with `auth.role() = 'service_role'` predicates to explicit `TO service_role` policies.
- Dropping exact legacy duplicate owner policies where newer authenticated owner policies already remain.
- Splitting admin `FOR ALL` policies into DML-only policies where separate public/authenticated SELECT policies already remain.
- Combining owner/admin SELECT policies where both must remain semantically available but should execute as one permissive policy.
- Preserving public/runtime read policies for broad-read tables such as `code_updates`, `feature_flags`, taxonomy reference tables, and learner-visible source tables.

### SECURITY DEFINER authenticated EXECUTE reduction

Authenticated EXECUTE was revoked only from functions classified as maintenance/trigger/CEO-metric functions with no app callsites found outside generated specs/types/migrations:

- `compute_monthly_burn(date)`
- `compute_monthly_churn_rate()`
- `compute_mrr()`
- `compute_runway_months()`
- `refresh_ceo_materialized_views()`
- `refresh_user_question_states()`
- `log_mastery_history_on_update()`
- `refresh_user_question_stats()`
- `sync_team_member_role()`
- `update_user_question_state()`

Authenticated EXECUTE was intentionally preserved for active app-contract RPCs and policy/helper functions, including quiz/SRS/wiki/notification/adaptive/admin helpers.

## Validation before live apply

Commands run before live DB mutation:

```bash
bunx supabase db lint --linked
bunx supabase db push --dry-run --linked
bunx supabase db query --linked --file .ai/tmp/supabase-advisors-20260524-remaining/rollback-smoke.sql
```

Results:

- `db lint --linked`: PASS, no schema errors.
- `db push --dry-run --linked`: PASS, would push only `20260524010000_resolve_supabase_remaining_advisor_safe_subset.sql`.
- Rollback smoke: PASS, migration body executed inside a transaction ending with `ROLLBACK`.

## Independent review notes

A reviewer flagged possible regressions if broad SELECT/runtime policies were not present. Live `pg_policies` introspection from this pass confirms those replacement/remaining policies exist before apply, including:

- `code_updates`: `Anyone can read code updates` remains for broad SELECT.
- `feature_flags`: `feature_flags_read_runtime` remains for anon/authenticated SELECT.
- `oath_taking_schedules`: `ots_select_all` remains.
- `topic_teach_back_criteria`: `ttbc_select_all` remains.
- `wiki_ei_prompts`: `eip_select_all` remains.
- Owner duplicate tables retain newer authenticated owner policies (`readiness_score_snapshots_*`, `user_node_mastery_*`, `user_trail_*`, `war_*`, `wb_*`).

## Remaining non-SQL / deferred warnings

- `auth_leaked_password_protection`: hosted Supabase Auth dashboard setting, not SQL.
- Some authenticated SECURITY DEFINER RPC warnings may remain intentionally where authenticated execution is part of the app contract or where the function is used as an RLS helper.
