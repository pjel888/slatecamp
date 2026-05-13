# Stairway Workbench Prototype Comparison

Date: 2026-05-13
Status: disposable prototype set

## Files

- `variant-a-instrument-panel.html`
- `variant-b-teaching-studio.html`
- `variant-c-diagnosis-first.html`

Open from repo root on macOS:

```bash
open .ai/03_plans/stairway-workbench-prototypes/variant-a-instrument-panel.html
open .ai/03_plans/stairway-workbench-prototypes/variant-b-teaching-studio.html
open .ai/03_plans/stairway-workbench-prototypes/variant-c-diagnosis-first.html
```

## Variant A — Instrument Panel Workbench

Best for Phase 1 production.

Strengths:
- Closest to current architecture.
- Keeps full controls without dumping everything at once.
- Strong diagnosis/status structure.
- Good Sandbox default.

Risks:
- Can still feel dashboard-like if overpacked.
- Needs careful card density tuning.

## Variant B — Teaching Studio

Best for Learn mode.

Strengths:
- Strong educator path.
- One concept at a time.
- Better for first-time learners and exam transfer.
- Keeps legal/source claims cautious.

Risks:
- Too guided for power users.
- Needs a clear switch into Sandbox.

## Variant C — Diagnosis First

Best for Diagnose and Challenge modes.

Strengths:
- Strongest exam-prep workflow.
- Ranked fix queue prevents violation-list overload.
- Makes scenario/law applicability central.

Risks:
- Can feel negative/error-heavy if used as the default for all users.
- Needs calm passing state to avoid alarm fatigue.

## Recommended hybrid

Use all three as mode-specific patterns:

- Sandbox: Variant A
- Learn: Variant B
- Diagnose/Challenge: Variant C
- Compare: combine Variant A shell with Variant B teaching copy and side-by-side law chips.

## Correction after Philip review

Philip rejected the first three variants as not good enough. The main issue was not just visual polish; the prototype framing was wrong.

The workbench should not initially ask Philip to choose between modes, and it should not open with violation-heavy states. The target default must be one excellent, premium, passing learner experience. Violations should appear only as a secondary explored state when the learner intentionally changes a dimension.

New corrected prototype:

- `variant-d-premium-passing-workbench.html`

This is now superseded by Philip's second correction: the sidebars should not scroll, the left sidebar should be controls only, and the right sidebar should be compact code/compliance/violation status only.

## Correction after Philip review 2 — no-scroll sidebars

Philip rejected A–D. The corrected target is:

- no sidebar scrolling as much as possible;
- left sidebar = minimal sliders/inputs only;
- right sidebar = live codes/compliance/violations only;
- details and advanced controls = click-triggered modal/popups;
- no mode forcing;
- no overdesigned teaching copy in sidebars;
- no decision fatigue.

New primary prototype:

- `variant-f-zero-decision-fatigue.html`

## Correction after Philip review 3 — remove stair-type/scenario dropdown

Philip correctly rejected the remaining dropdown because it still creates decision fatigue.

The corrected target is sharper:

- no stair-type dropdown in the default left sidebar;
- no scenario dropdown in the default left sidebar;
- no law/project/occupancy/accessibility selector before the learner understands the baseline;
- default context is selected by the module;
- left sidebar contains only the four dimension controls and minimal actions;
- law/scenario/stair-type comparison moves to guided lesson cards, challenge prompts, or modals.

New primary prototype:

- `variant-f-zero-decision-fatigue.html`

`variant-e-no-scroll-code-sidebar.html` is now superseded because it still had a scenario/stair-type dropdown.

## Correction after Philip review 4 — preserve existing right-sidebar law categories

Philip clarified that the right sidebar should use the existing compliance report content, not replace it with a generic dimension-row design.

Corrected right-sidebar target:

- show the four existing law categories by default: RA 9514, BP 344, PD 1096, BP 220;
- redesign/re-layout those law cards for density, hierarchy, and fit;
- keep violations appearing in-place inside the relevant law category/card, consistent with current behavior;
- keep the compact violation/conflict summary behavior;
- use modals for deeper explanation/source detail only.

New primary prototype:

- `variant-g-existing-law-categories-relayout.html`

`variant-f-zero-decision-fatigue.html` is now superseded for the right sidebar because it did not preserve the existing four-law compliance report model.

## UX verdict

The corrected direction is: left sidebar stays low-decision with only essential dimension controls, while the right sidebar preserves the existing four-law compliance report content and redesigns it into a cleaner no-scroll, high-hierarchy layout. Violations should update inside the existing law-category structure, not replace it.

## Non-negotiables for production

- Viewport remains dominant.
- Left panel contains only essential sliders/inputs.
- No stair-type, scenario, law-set, project-type, occupancy, egress, or accessibility dropdown appears in the default left sidebar.
- The module selects the default instructional context; learners change dimensions, not the legal universe.
- No long teaching copy in left sidebar.
- Avoid sidebar scrolling at desktop/laptop heights.
- Advanced controls open in modal/popover.
- Right panel shows the existing four-law compliance report content by default: RA 9514, BP 344, PD 1096, BP 220.
- Right panel violations update in-place inside the relevant law category/card, preserving current behavior.
- Right panel rows/cards open detail modals.
- Source-audit-pending is visible but compact.
- Legal, comfort, and comparison states are visually distinct.
