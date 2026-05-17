# Current State

**Last Updated:** 2026-05-05
**Current source:**
- `.ai/02_audits/code-quality/CODEBASE_AUDIT_REPORT_2026_05_05.md`
- `.ai/02_audits/supabase/SCHEMA_SOURCE_OF_TRUTH_REMEDIATION_2026_05_05.md`
- `.ai/02_audits/supabase/SUPABASE_VERIFICATION_TARGET_MIGRATION_REPLAY_TYPE_REGENERATION_REPORT_2026_05_05.md`

## Current status as of 2026-05-05

SlateCamp is a large Next.js App Router codebase for LEA/ALE preparation in pre-launch MVP hardening.

- **Production-ready:** No.
- **App-layer beta candidate / validation-ready:** Yes.
- **Active blocker:** Supabase release verification and generated type reconciliation.
- **Payment:** intentionally deferred; not a blocker for the current launch.
- **Live AI chatbot/provider:** intentionally deferred; not a blocker for the current launch.

The application-layer P0 remediation is validated. The full validation gate passes:

- `git diff --check`
- `bun run type-check`
- `bun test src/`
- `bun run test:dom`
- `bun run lint`
- `bun audit`
- `bun run build`
- `bun run check:entitlements`
- `bun run test:e2e:prod`

## P0 remediation completed and validated

- Production debug/test page routes removed from `src/app/`:
  - `/debug-supabase`
  - `/debug-cache-bypass`
  - `/debug-check`
  - `/debug-mdx`
  - `/debug-mdx-detailed`
  - `/test-media`
- Cron authentication now fails closed through `src/lib/api/cron-auth.ts` when `CRON_SECRET` is missing, empty, wrong, or null-like.
- PayRex SDK / vulnerable axios path was removed from the active production dependency graph while payment remains deferred.
- Production guardrails now disable developer portal/user/tier bypasses in production through `src/lib/env/production-guardrails.ts`.
- Static stale app DB references were corrected or quarantined:
  - `taxonomy_nodes`
  - `srs_queue`
  - `exam_profiles`
  - `subjects`
  - `review_sessions`
  - `cage_verifications`
  - `teach_back_responses`
- `supabase/migrations/rollback_lea_to_ale.sql` was moved to `.ai/09_archive/store/DB_ROLLBACKS/2026-05-05/` so migration tooling will not treat it as a forward migration.
- AI audit database view/function exposure has a forward hardening migration: `supabase/migrations/20260505145349_restrict_ai_audit_admin_access.sql`.

## Current production blockers

1. Safe non-production Supabase verification target is unavailable.
2. Docker was unavailable in the last verification environment.
3. `supabase/config.toml` is missing.
4. The 101 active migrations have not been replay-verified locally or in staging.
5. AI audit restriction migration has not been DB-verified:
   - `supabase/migrations/20260505145349_restrict_ai_audit_admin_access.sql`
6. `src/types/supabase.ts` remains stale relative to newer AI audit views/RPC.
7. Actual production/staging deployment environment values were not platform-verified.
8. Broad `.ai`/docs diff requires human semantic review before commit/release.

Important warning: `bunx supabase migration list` reached an unclear remote/cached context in the latest attempt. That context must not be treated as staging verification, must not receive migrations, and must not be used for type regeneration.

## Not blockers for current launch

- Payment provider launch.
- PayRex checkout/webhook live verification.
- Live AI chatbot/provider launch.
- PayRex/OpenAI/Anthropic env vars:
  - `PAYREX_SECRET_KEY`
  - `PAYREX_WEBHOOK_SECRET`
  - `AI_PROVIDER`
  - `OPENAI_API_KEY`
  - `ANTHROPIC_API_KEY`

These remain future roadmap items unless a future PR deliberately reintroduces paid/live-AI behavior or UI/docs claim those features are live.

## Active source-of-truth references

- Full audit: `.ai/02_audits/CODEBASE_AUDIT_REPORT_2026_05_05.md`
- Schema remediation/static review: `.ai/02_audits/SCHEMA_SOURCE_OF_TRUTH_REMEDIATION_2026_05_05.md`
- Supabase verification attempt: `.ai/02_audits/SUPABASE_VERIFICATION_TARGET_MIGRATION_REPLAY_TYPE_REGENERATION_REPORT_2026_05_05.md`
- Supabase verification runbook: `.ai/00_system/SUPABASE_VERIFICATION_RUNBOOK.md`
- Active roadmap: `.ai/01_roadmap/current-phase.md`

## Content and curriculum state

- Fact-checking pass: COMPLETE for 567/567 articles (`.ai/14_fact_checking/`).
- Content optimization pass: local pass is documented as complete in `.ai/15_content_optimization/`; live push and duplicate-question handling remain gated work.
- `sources.json` completeness and answer-choice quality checks remain curriculum/content QA concerns, not app-security P0s.
