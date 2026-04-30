# 03 — Readiness Gates

## Gate 0 — preparation package complete

Required before implementation:

- This folder exists and is referenced from `.ai/03_plans/README.md`.
- The team agrees this is a high-risk cleanup and not a delete-first task.
- Payment and AI cleanup remain explicitly out of scope.

## Gate 1 — baseline verification is green before edits

Run before any implementation PR:

```bash
bun run check:entitlements
bun test src/lib/entitlements/resolve-role.test.ts src/lib/entitlements/middleware-authorization.test.ts src/lib/entitlements/normalize-feature-flag.test.ts src/lib/entitlements/resolve-entitlements.test.ts src/lib/admin/roles.test.ts src/lib/actions/admin/pipeline.test.ts src/lib/admin/editor-workflow.test.ts src/lib/supabase/middleware.test.ts
bun run type-check
bun run lint
```

If any baseline command fails, fix or document the pre-existing blocker before cleanup.

Preparation evidence: `bun run check:entitlements` originally failed on `scripts/playwright-run.ts:176` because the real quiz/drills E2E lane sets `DEV_FORCE_USER_ID` directly. This was resolved by explicitly allowlisting the Playwright runner as a test harness peer of `scripts/playwright-web-server.ts`; if the guard fails again, Gate 1 is blocked until the new failure is fixed or justified with equivalent boundary rationale.

## Gate 2 — role-source behavior lock for `L5-C02`

Before changing admin role wrappers, tests must prove:

- `user_roles` wins over profile/auth metadata.
- `profiles.role` remains fallback when no `user_roles` rows exist.
- app metadata and user metadata behavior is intentionally kept or intentionally retired.
- `OWNER_EMAILS` / `ADMIN_EMAILS` fallback behavior is intentionally kept or intentionally retired.
- `DEV_FORCE_USER_ID` owner override is development-only and disabled when Playwright neutralizes local impersonation.
- `/admin`, `/developer`, and `/ceo` route gating remains least-privilege.

## Gate 3 — feature flag data readiness for `L5-C03`

Before removing runtime reads of `target_roles` or legacy tier normalization:

- Query/stub evidence must show no launch feature flag requires role targeting.
- Query/stub evidence must show `target_tier` uses canonical values only: `free`, `pro`, `prime`, `institutional`, `enterprise`.
- Tests must prove feature access decisions are identical before/after removing ignored `target_roles` reads.
- Generated types and schema snapshot must either still include `target_roles` or be regenerated in the same schema-specific phase.

## Gate 4 — status schema readiness for `L5-C06`

Before removing `pending_review` fallback:

- Current DB constraints must accept `in_review` for `wiki_articles` and `wiki_ei_prompts`.
- Current DB rows must not require `review` or `pending_review` for active admin flows.
- Admin content/pipeline/wiki tests must be rewritten to canonical-only behavior.
- Any historical `pending_review` migration references must be documented as history, not active runtime truth.

## Gate 5 — E2E and manual privileged-flow checks

Before merge of the implementation wave, verify:

- content admin can enter admin CMS and perform allowed actions.
- SME reviewer can access reviews but not create/manage content beyond their role.
- developer can access developer tooling but not admin CMS unless policy permits it.
- member cannot access `/admin`, `/developer`, or `/ceo`.
- CEO/super-admin access still works for CEO portal.
- admin article status transitions work: draft → in_review → approved → published.

## Gate 6 — release containment

Do not combine this cleanup with unrelated route, payment, AI, or UI cleanup. Ship as a contained auth/status/feature-flag wave with a rollback plan.
