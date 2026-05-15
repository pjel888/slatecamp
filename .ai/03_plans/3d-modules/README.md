# SlateCamp 3D Modules Planning Hub

Purpose: maintain one planning entrypoint for upcoming 3D Lab modules before implementation starts.

Status rules:
- `IDEA` = requested but not scoped.
- `RESEARCH` = source inventory and standards comparison in progress.
- `PLANNING` = PRD/readiness/audit docs drafted.
- `SOURCE_LOCATOR_READY` = every code/legal value has raw source path, hash, section/page locator, and extracted quote.
- `CONDITIONAL_GO` = can start hidden QA implementation only; learner release remains blocked.
- `NO_GO` = implementation should not start.
- `BUILT_QA` = hidden/dashboard QA implementation exists but source/compliance is fail-closed.
- `LEARNER_READY` = source-approved, tested, reviewed, and release-gated.

Master rule: Blender/Three.js geometry is never the legal truth. Source cards, formula tests, and SME review define truth.

## Module matrix

| Module ID | Working title | Category | Current status | Primary law/source families | Planning folder | Implementation posture |
|---|---|---|---|---|---|---|
| `parking-lot-requirements` | Parking Lot Requirements Compliance Tool | Site Development / Accessibility / Building Code | PLANNING | PD 1096, BP 344, BP 220, PD 957, RA 9514, LGU ordinances, international parking geometry references | `.ai/03_plans/3d-modules/parking-lot-requirements/` | No code yet. Hidden QA only after source locator gate. |
| `stairway-code-compliance` | Stairway Code Compliance | Vertical Circulation | BUILT_QA / active improvement | PD 1096, BP 220, BP 344, RA 9514 | `.ai/03_plans/stairway-code-compliance-model-upgrade/` and existing code docs | Existing module; use as pattern, not as source authority. |
| TBD | Next 3D module | TBD | IDEA | TBD | TBD | Do not implement until a row and folder are created here. |

## Standard folder contract for each new 3D module

Each module folder should contain:
1. `README.md` — module overview and current verdict.
2. `01-prd.md` — product requirements document.
3. `02-source-research-plan.md` — source inventory, standards comparison, locator work.
4. `03-readiness-audit.md` — implementation readiness and blockers.
5. `04-preparation-plan.md` — step-by-step pre-implementation plan.
6. `05-source-locator-workbook.csv` — one row per legal/code claim to verify.
7. `06-formula-testcase-seeds.csv` — deterministic formula and boundary tests.
8. `07-ux-3d-authoring-brief.md` — learning model, controls, camera, visual states.
9. `08-release-gate-checklist.md` — QA/source/SME gates before dashboard/learner release.
10. `09-conflict-register.md` — conflicts, precedence, and interpretation checklist.
11. `10-source-card-schema-and-approval.md` — source card schema and approval workflow.
12. `11-mvp-v0-scope.md` — narrowed first hidden QA scope.

## Shared acceptance criteria for all compliance modules

- Fail closed when source cards are pending.
- Show `CALCULATION OK`, `FORMULA ISSUE`, or `REVIEW` during source-pending QA; never show `COMPLIANT` or `VIOLATION` as source-backed labels until approved.
- Use universal red for failing physical dimensions across DOM controls and 3D geometry.
- Keep sidebars compact and low-scroll on 13-inch MacBook-class displays.
- Keep legal/code explanations in DOM panels, not only inside the canvas.
- Maintain stable preset IDs before any Wiki/Quiz deep links are created.
- Require independent review before implementation handoff.
