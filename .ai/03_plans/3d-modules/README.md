# SlateCamp 3D Modules Planning Hub

Purpose: maintain one planning entrypoint for upcoming 3D Lab modules before implementation starts.

Status rules:
- `IDEA` = requested but not scoped.
- `RESEARCH` = source inventory and standards comparison in progress.
- `PLANNING` = PRD/readiness/audit docs drafted.
- `DOC_READY` = planning pack is complete enough to guide implementation, but code may still be blocked by named gates.
- `CODE_NO_GO` = code should not start until the named pre-code gates are resolved, even if the documentation pack is otherwise ready.
- `SOURCE_LOCATOR_READY` = every code/legal value has raw source path, hash, section/page locator, and extracted quote.
- `CONDITIONAL_GO` = can start hidden QA implementation only; learner release still requires SME/source release gates.
- `NO_GO` = implementation should not start.
- `BUILT_QA` = hidden/dashboard QA implementation exists but source/compliance is fail-closed.
- `LEARNER_READY` = source-approved, tested, reviewed, and release-gated.

Master rule: Blender/Three.js geometry is never the legal truth. Source cards, formula tests, and SME review define truth.

Shared asset-generation rule: for exact/source-backed geometry, prefer `text-to-cad`/parametric CAD and preserve auditable STEP + inspect facts before web GLB export. Hyper3D/Rodin, Pixal3D, and TRELLIS.2 may only provide provenance-gated visual candidates. See `.ai/03_plans/2026-05-21--article-3d-generation-toolchain/README.md`.

## Module matrix

| Module ID | Working title | Category | Current status | Primary law/source families | Planning folder | Implementation posture |
|---|---|---|---|---|---|---|
| `parking-lot-requirements` | Parking Lot Requirements Compliance Tool | Site Development / Accessibility / Building Code | PLANNING | PD 1096, BP 344, BP 220, PD 957, RA 9514, LGU ordinances, international parking geometry references | `.ai/03_plans/3d-modules/parking-lot-requirements/` | No code yet. Hidden QA only after source locator gate. |
| `stairway-code-compliance` | Stairway Code Compliance | Vertical Circulation | BUILT_QA / active improvement | PD 1096, BP 220, BP 344, RA 9514 | `.ai/03_plans/stairway-code-compliance-model-upgrade/` and existing code docs | Existing module; use as pattern, not as source authority. |
| `lighting-room-simulator` | Lighting Room Simulator | Electrical / Illumination | CONDITIONAL_GO | DOE Energy Code, Philippine Green Building Code, RA 9514 Fire Code, PD 1096 Rule VIII, PEC deferred until primary locator, pedagogical lamp efficacy references | `.ai/03_plans/3d-modules/lighting-room-simulator/` | Hidden QA implementation may start with fail-closed source labels. Learner release remains blocked until SME approval; do not show PEC as a source-backed card until a primary locator is added. |
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
13. `12-learner-ux-blueprint.md` — learner personas, first-run journey, mobile IA, and feedback copy.
14. `13-implementation-handoff-spec.md` — later build contract with file ownership and acceptance criteria.
15. Optional bridge specs for non-standard modules, such as renderer architecture or formula contracts.

## Shared acceptance criteria for all compliance modules

- Fail closed when source cards are pending.
- Show `CALCULATION OK`, `FORMULA ISSUE`, or `REVIEW` during source-pending QA; never show `COMPLIANT` or `VIOLATION` as source-backed labels until approved.
- Use destructive red only for source-approved functional non-compliance or true system errors. Source-pending review states use warning/neutral styling.
- Keep sidebars compact and low-scroll on 13-inch MacBook-class displays.
- Keep legal/code explanations in DOM panels, not only inside the canvas.
- Maintain stable preset IDs before any Wiki/Quiz deep links are created.
- Require independent review before implementation handoff.
- For modules whose learning mechanism depends on live lighting, simulation, animation, physics, or custom renderer behavior, add an architecture bridge before code starts. Do not assume the generic parametric geometry renderer can carry those behaviors.
