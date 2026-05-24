# Supabase Advisor Inventory and Safe Remediation — 2026-05-24

## Remote advisor baseline

- Command: `bunx supabase db advisors --linked --output json`
- Total findings: 183
- Levels: {'ERROR': 1, 'WARN': 182}
- Categories: {'SECURITY': 49, 'PERFORMANCE': 134}

## Findings by lint

- auth_rls_initplan: 79
- multiple_permissive_policies: 53
- authenticated_security_definer_function_executable: 24
- anon_security_definer_function_executable: 23
- duplicate_index: 2
- rls_disabled_in_public: 1
- auth_leaked_password_protection: 1

## Local remediation prepared

- Migration: `supabase/migrations/20260524000000_resolve_supabase_advisor_safe_subset.sql`
- Fixes the safe subset:
  - enables RLS on `public.user_question_states` and restores owner/service-role policies
  - revokes PUBLIC/anon execute defaults for 23 flagged SECURITY DEFINER functions while preserving authenticated/service_role execution
  - recreates 79 RLS policies with `(select auth.uid())`, `(select auth.role())`, `(select auth.jwt())`, and `(select current_setting(...))` initplan wrappers
  - drops two exact duplicate indexes

## Not automatically fixed in this migration

- `authenticated_security_definer_function_executable` (24): these require product-aware RPC exposure decisions. Several are actively used by server actions/RPC paths; blindly revoking authenticated execute would break quiz/SRS/admin flows.
- `multiple_permissive_policies` (53): requires policy-by-policy consolidation to preserve admin/service/learner semantics. Safe but needs a dedicated second migration and authenticated regression tests.
- `auth_leaked_password_protection` (1): hosted Auth dashboard/API setting, not a SQL migration finding.

## Validation performed

- `bunx supabase db lint --linked`: PASS, no schema errors found.
- `bunx supabase migration list --linked`: local and remote histories matched through `20260517043338`; no drift detected.
- `bunx supabase db push --dry-run --linked`: PASS; would push only `20260524000000_resolve_supabase_advisor_safe_subset.sql`.
- Rollback smoke on linked remote: PASS; executed the migration body with final `ROLLBACK` instead of `COMMIT`, no persistent mutation.

## Local blockers

- `bunx supabase status` failed because Docker is not running; local reset/lint replay was not possible in this shell.
- Remote DB was not mutated by this inventory/prep pass.

## Evidence files

- `.ai/tmp/supabase-advisors-20260524/advisors.parsed.json`
- `.ai/tmp/supabase-advisors-20260524/functions.json`
- `.ai/tmp/supabase-advisors-20260524/policies.json`
