# 3D Lab Legacy Shim Cleanup Context

## Task statement
Proceed with the next planned `.ai` cleanup sequence after quiz/tools consolidation, excluding payment and AI work for later.

## Desired outcome
Implement the next non-payment/non-AI cleanup item from `.ai`: L2-3DLAB-004 / CLN-006 — retire 3D Lab legacy shims and stale route docs where safe, with blast-radius analysis, docs updates, and tests.

## Known facts/evidence
- `.ai/03_plans/legacy-removal-plan.md` sequence step 6: retire 3D-lab legacy shims and stale route docs.
- `.ai/10_state/cleanup-findings-register.md` CLN-006 is open and points to 3D Lab migration shims, legacy stores, stale route docs.
- Current repo has large dirty tree from prior quiz/tools work; do not overwrite unrelated changes.
- Team tmux runtime unavailable in native Codex session; direct Ralph execution required.

## Constraints
- Use Bun.
- Run GitNexus impact before editing symbols where possible.
- Update `.ai` docs when structure/workflow changes.
- Do not do payment or AI provider work in this pass.
- Preserve MVP velocity; no backwards compatibility burden unless currently needed.

## Unknowns/open questions
- Which 3D Lab shims still have live imports?
- Which route-level docs remain stale/current after previous cleanup?
- Which validation commands are sufficient for this slice?

## Likely codebase touchpoints
- `src/features/3d-lab/**`
- `src/app/dashboard/3d-lab/**`
- `.ai/03_plans/*`, `.ai/10_state/*`, `.ai/features.md`, `.ai/testing.md`
- 3D Lab tests and route/build checks
