# Ralph context — auth/status/feature-flag cleanup implementation

## Task statement
Implement the approved high-risk auth/status/feature-flag cleanup package for SlateCamp, continuously and without further approval, while preserving privileged access behavior and updating `.ai` docs.

## Desired outcome
Proceed through the safe sequence from `.ai/03_plans/auth-status-feature-flag-cleanup/`: Gate 1 baseline, Phase 0 behavior locks, then candidate cleanup for `L5-C02`, `L5-C03`, and `L5-C06` only when each readiness gate is satisfied.

## Known facts/evidence
- `bun run check:entitlements` was previously red due `scripts/playwright-run.ts` direct `DEV_FORCE_USER_ID`; it is now green after narrowly allowlisting the Playwright real-DB harness.
- Existing plan package explicitly says do not start with deletion; begin with behavior locks and data/readiness proof.
- Payment and AI cleanup are deferred.
- Team/tmux runtime is not available in this native Codex session; execute directly under Ralph/Ultrawork.
- Worktree already contains many unrelated dirty files. Do not reset, stash, or broaden changes unnecessarily.

## Constraints
- Use Bun.
- Read in-scope AGENTS and source before edits.
- Read `DATABASE_SCHEMA.sql` before database-related work.
- Run GitNexus impact before editing symbols where possible.
- Keep edits focused and reversible.
- Do not remove compatibility code until behavior is locked and gate evidence is green.

## Unknowns/open questions to discover locally
- Whether full Gate 1 baseline is currently green.
- Whether current schema/data evidence is sufficient to retire `target_roles` runtime reads or `pending_review` write fallback.
- Which deprecated admin wrappers are still used by route/layout code and can be migrated without behavior change.

## Likely codebase touchpoints
- `src/lib/admin/roles.ts`, `src/lib/admin/roles.test.ts`
- `src/lib/entitlements/resolve-role.ts`, `src/lib/entitlements/policy.ts`, entitlement tests
- `src/lib/entitlements/get-viewer-entitlements.ts`, `normalize-feature-flag.ts`, tests
- `src/lib/admin/editor-workflow.ts`, `src/lib/actions/admin/pipeline.ts`, related tests
- `src/app/admin/layout.tsx`, `src/app/admin/page.tsx`, `src/app/developer/layout.tsx`, CEO/access helpers if present
- `.ai/03_plans/auth-status-feature-flag-cleanup/` and cleanup status docs
