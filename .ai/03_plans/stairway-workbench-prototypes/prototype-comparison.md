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

`variant-g-existing-law-categories-relayout.html` is superseded by the next correction because it still implied fixed quadrant/check slots.

## Correction after Philip review 5 — law cards with scalable violation pills

Philip clarified the final right-sidebar pattern:

- remove Safe Preset and Study Cases from the left sidebar for now;
- keep the four visible laws on the right: RA 9514, BP 344, PD 1096, BP 220;
- do not use fixed quadrants/check boxes that imply each law only has four violations;
- research and respect the existing violation model;
- use compact violation/check pills inside each law card;
- clicking a pill opens a modal showing all violations/checks for that law, source status, affected dimension, and correction guidance.

Research from current `stairway-configurator.ts` confirms more than four possible checks overall: PD 1096 alone has riser, tread, headroom, vertical rise, width, and handrail-range checks; RA 9514 has riser, width, tread, and vertical rise; BP 220 has riser, tread, and width; BP 344 has width and handrail overlay; there are also cross-law conflicts, comfort, uniformity, nosing, and handrail-detail checks.

Prototype:

- `variant-h-law-cards-violation-pills.html`

## Correction after Philip review 6 — compact board-vital left sidebar

Philip accepted the right sidebar direction for now and asked what else belongs in the left sidebar after examining the live page.

Live browser inspection of `/dashboard/3d-lab/stairway-configurator` at 1440×820 after skipping orientation showed the current left sidebar has a 639px visible scrollport and about 3032px of scroll height. It mixes presets, project classification, stair type/turning, all geometry, overlays, nosing, handrail details, materials, user safety, and egress calculator controls.

New primary prototype:

- `variant-i-compact-left-board-vital-controls.html`

Variant I keeps the Variant H right-sidebar law-card/pill direction, but improves the left sidebar. The recommended default controls are exactly six board-vital controls:

1. riser height;
2. tread depth;
3. clear stair width;
4. headroom clearance;
5. risers in flight / number of risers, because it drives total vertical rise between landings;
6. handrail height.

Read-only derived metrics can appear below the controls because they teach without adding choices:
- 2R + T comfort value;
- pitch angle;
- total vertical rise;
- total run.

Still excluded from first load:
- Safe Preset;
- Study Cases;
- scenario/stair-type dropdowns;
- project type / occupancy type / accessible route / exit stair toggles;
- nosing, material, detailed handrail profile, and egress calculator controls.

## Correction after Philip review 7 — categorized left sidebar

Philip clarified that the left sidebar should not be a flat control list and should not have explanatory header copy. Remove `Inputs`, `Default context is fixed`, and the risers-in-flight control for now.

New primary prototype:

- `variant-j-categorized-left-sidebar.html`

Corrected left sidebar structure:

1. `Stair information` card at the top, read-only only:
   - stair/step count;
   - total height / total rise;
   - total run / depth;
   - `2R + T` comfort value;
   - pitch angle;
   - width.
2. `Step body` card:
   - riser height;
   - tread depth;
   - clear stair width.
3. `Headroom clearance` standalone card.
4. `Handrail height` standalone card.

## UX verdict

The corrected direction is: left sidebar starts with compact information, then grouped low-decision controls: stair body, headroom, and handrail. The right sidebar preserves the existing four-law compliance report content and redesigns it into scalable law cards with compact violation/check pills. Violations appear as pills inside the relevant law card; clicking a pill opens a modal with the full law-specific violation/check list. Do not use fixed quadrants.

## Non-negotiables for production

- Viewport remains dominant.
- Left panel contains only essential sliders/inputs.
- Default left panel structure: top `Stair information` read-only card, `Step body` card with riser height/tread depth/clear stair width, standalone `Headroom clearance` card, standalone `Handrail height` card.
- Show read-only derived metrics only in the information card: stair count, total height/rise, total run/depth, 2R+T, pitch angle, width.
- Do not include risers-in-flight as a default control for now.
- No stair-type, scenario, law-set, project-type, occupancy, egress, or accessibility dropdown appears in the default left sidebar.
- The module selects the default instructional context; learners change dimensions, not the legal universe.
- No long teaching copy in left sidebar.
- Avoid sidebar scrolling at desktop/laptop heights.
- Advanced controls open in modal/popover.
- Right panel shows the existing four-law compliance report content by default: RA 9514, BP 344, PD 1096, BP 220.
- Right panel uses scalable law cards with flexible violation/check pills, not fixed quadrants or fixed check slots.
- Active violations update as pills inside the relevant law category/card.
- Clicking a violation/check pill opens a detail modal listing all checks/violations for that law, active failure state, source/citation status, affected parameter, and correction guidance.
- Source-audit-pending is visible but compact.
- Legal, comfort, and comparison states are visually distinct.
