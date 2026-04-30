# Auth / Status / Feature-Flag Compatibility Cleanup Preparation

**Created:** 2026-04-30
**Mode:** implementation in progress — started after preparation gate
**Linked sequence:** `.ai/03_plans/legacy-removal-plan.md` step 7
**Linked candidates:** `L5-C02`, `L5-C03`, `L5-C06`
**Deferred by user:** payment and AI cleanup

## Purpose

This folder is the pre-implementation planning package for the next high-risk cleanup wave after:

1. `/tools` / `/calculators` namespace rationalization (`L2-CALC-003`), and
2. 3D Lab legacy shim cleanup (`L2-3DLAB-004`).

The next planned wave touches auth, privileged admin access, feature flags, schema/types, and admin editorial status compatibility. It must not start with deletion. It starts with behavior locks, blast-radius confirmation, and phased implementation plans.

## Included artifacts

| File | Role |
| --- | --- |
| `00-preparation-brief.md` | Executive summary, scope boundaries, acceptance criteria, and recommended next action. |
| `01-blast-radius-audit.md` | Evidence-backed surface map and blast-radius findings for `L5-C02`, `L5-C03`, `L5-C06`. |
| `02-current-state-observations.md` | What current code/tests/schema say today, including compatibility behavior that is still live. |
| `03-readiness-gates.md` | Required gates before implementation is allowed. |
| `04-implementation-sequence.md` | Safe phased implementation sequence with stop/go points. |
| `05-test-validation-matrix.md` | Tests/E2E/manual checks required before, during, and after cleanup. |
| `06-risk-mitigation.md` | Failure modes, containment, rollback, and observability plan. |
| `07-implementation-progress.md` | Implementation evidence, completed runtime cleanup, and remaining schema/data gates. |

## Non-goals for this preparation pass

- No database migration changes in the first implementation pass.
- No RLS/policy edits in the first implementation pass.
- No payment or AI cleanup.
- No payment or AI cleanup.

## One-line recommendation

Schema/type cleanup is now in progress after launch-database readiness was proven. Keep using `bun run check:auth-cleanup-readiness` as the repeatable launch DB readiness gate before finalizing or committing any auth/status/feature-flag cleanup changes.
