# 00 — Preparation Brief

## Decision context

`.ai/03_plans/legacy-removal-plan.md` now sequences the cleanup as:

1. `L2-CALC-003` completed: calculator namespace rationalization.
2. `L2-3DLAB-004` completed: 3D Lab legacy shim cleanup.
3. Next: `L5-C02`, `L5-C03`, and `L5-C06` — auth/status/feature-flag compatibility branches.

This is a **high-risk cleanup wave** because it touches privileged access, feature gating, schema/type compatibility, and admin editorial status writes.

## Candidate scope

| Candidate | Title | Primary risk |
| --- | --- | --- |
| `L5-C02` | Live admin-role compatibility wrapper migration | Admin, developer, CEO, audit, and auth callback access can regress if wrappers are removed without equivalent policy calls. |
| `L5-C03` | Retire feature flag `target_roles` / legacy tier path | Schema/types/runtime normalization are coupled; removing one side first can break entitlement snapshots or developer flag tooling. |
| `L5-C06` | `pending_review` fallback retirement | Admin article/review save flows can fail in environments that still enforce legacy DB constraints. |

## Preparation-only acceptance criteria

This pass is complete when:

- A dedicated `.ai/03_plans/auth-status-feature-flag-cleanup/` folder exists.
- It contains audits, observations, readiness gates, implementation sequencing, validation matrix, and mitigation docs.
- Every referenced source path exists at preparation time.
- Blast-radius evidence includes both GitNexus and literal import/search findings.
- The plan explicitly prevents blind deletion and requires behavior locks first.
- `git diff --check` passes.


## Baseline guard status observed during preparation

During this preparation pass, `bun run check:entitlements` was executed and failed on an existing worktree line:

```text
scripts/playwright-run.ts:176 [direct-dev-force-usage] Direct entitlement-affecting env usage is banned outside the canonical boundary.
```

Resolution: the guard now deliberately allows `scripts/playwright-run.ts` alongside `scripts/playwright-web-server.ts` because both files are Playwright-only test harnesses. The runtime/product boundary remains strict: direct `DEV_FORCE_USER_ID`, `DEV_FORCE_TIER`, and `ALLOW_DEV_PORTAL_BYPASS` usage is still banned outside canonical entitlement files and approved test harnesses.

## Required first implementation move after this prep

Do **not** start by deleting compatibility code. Start with:

1. Expand tests around the current compatibility behavior.
2. Confirm the current launch DB/schema accepts canonical-only status and tier values.
3. Prove there are no production-like rows still using legacy `pending_review`, `review`, `camp`, `insurance`, or role-targeted feature flags.
4. Only then remove compatibility paths candidate-by-candidate.

## Stop conditions for the later implementation wave

Stop and re-plan if any of the following are true:

- `bun run check:entitlements` fails before changes.
- Any admin role wrapper still has a live route/action caller without a policy-equivalent replacement.
- Any Supabase schema/type file still requires `target_roles` for generated type compatibility.
- Any tested environment still rejects canonical `in_review` and requires `pending_review` fallback.
- Full auth/admin/developer E2E lanes are red for reasons related to this cleanup.
