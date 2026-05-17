# Stairway Learning Workbench — UX Wireflows and Interaction States

Date: 2026-05-13
Status: planning specification
Purpose: define exactly how the learner moves through the redesigned workbench before code begins.

## 1. UX north star

The learner should always know four things:

1. What stair scenario am I designing?
2. Which law set is active?
3. Which dimension currently matters most?
4. What is the smallest correction that fixes the problem?

If the interface cannot answer those four questions within the first screen, it is not ready.

## 2. First-load wireflow

### Screen state

- Mode: Sandbox or Learn Preview, depending on final product choice.
- Viewport: compliant straight-run stair, calm view, no large overlays.
- Left panel: Scenario and Core Geometry open.
- Right panel: Overall diagnosis, selected element placeholder, critical fixes.
- Status bar: riser/tread/width/handrail/headroom statuses.

### First-load copy

Left panel helper:

“Start with the project condition. Stair dimensions are not judged in isolation; PD 1096, BP 220, BP 344, and RA 9514 can apply differently depending on the route and occupancy.”

Right panel placeholder:

“Adjust a core dimension or select a stair element. The diagnosis panel will show which law is affected and what correction is needed.”

## 3. Primary interaction flow: changing a dimension

Example: learner adjusts `riserHeight`.

1. Slider changes value.
2. Geometry updates immediately.
3. `computeStairState(params)` recomputes.
4. Status bar riser chip updates.
5. Right panel “Critical fixes” updates.
6. Riser dimension card updates.
7. If crossing pass/fail threshold, show short delta message.

Delta message examples:

- “Riser height crossed the active exit-stair limit.”
- “This change moved the stair outside the comfort band.”
- “The stair still passes PD 1096, but fails the stricter active RA 9514 check.”

Do not show confetti, animation noise, or modal interruptions.

## 4. Primary interaction flow: toggling a law condition

Example: learner toggles `Required Exit Stair?`.

1. Active law chips update.
2. RA 9514 chip becomes active.
3. Previously passing dimensions may become failing.
4. Right panel shows “law activated” delta.
5. Dimension cards show which requirements changed.

Copy:

“Required Exit Stair activated RA 9514 life-safety checks. The same geometry may now fail stricter exit-stair limits.”

## 5. Primary interaction flow: selecting geometry

Example: learner clicks a tread.

Phase 1:
- existing popover may remain temporarily.

Final target:
- selected element id updates shell/store state;
- right panel selected inspector scrolls or highlights;
- viewport highlights selected tread/riser/handrail subtly;
- no large persistent card covers the model.

Selected inspector content:

- element name: “Tread”
- dimension: “Tread Depth”
- current: e.g. “250 mm”
- law rows:
  - PD 1096: pass/fail
  - BP 220: pass/fail when applicable
  - RA 9514: pass/fail when applicable
  - BP 344: not applicable unless accessible route affects related element
- teaching note: “Tread depth controls foot placement and trip risk. In exams, check whether the problem asks for ordinary stairs, accessible routes, or required exits.”

## 6. Right panel states

### State A: no issue

Title:
“Passing under active checks”

Message:
“This configuration currently passes the active legal checks. Review comfort and source notes before treating it as final.”

Shown cards:
- all dimension cards compact, green/neutral;
- no critical fix card;
- source drawer still collapsed.

### State B: one legal issue

Title:
“1 issue needs correction”

Message:
“Fix the failing dimension before moving to exam transfer.”

Critical fix card:
- dimension
- current value
- requirement
- law chip
- fix suggestion

### State C: multiple legal issues

Title:
“Multiple issues need correction”

Sort:
- life safety first;
- accessibility second;
- baseline building code third;
- contextual housing fourth;
- comfort/comparison later.

### State D: cross-law conflict

Title:
“Cross-law conflict”

Message:
“This is not solved by averaging the values. Confirm the project classification and which law actually governs the stair.”

Show:
- conflict explanation;
- affected dimension;
- active conditions causing the conflict.

### State E: comfort warning only

Title:
“Legally passing, comfort warning”

Message:
“This may pass the active legal checks, but the riser/tread relationship is outside the comfort band. Treat this as design guidance, not a Philippine legal violation.”

## 7. Left panel states

### Normal state

- Scenario open.
- Core Geometry open.
- all else collapsed.

### Advanced opened

When a learner opens a collapsed advanced group, preserve its open state for the session.

Do not auto-scroll the panel unexpectedly.

### Mode-constrained state

In Learn/Diagnose/Challenge modes, some controls may be locked.

Locked control behavior:
- visible but disabled only when it helps teaching;
- otherwise hidden behind “Available in Sandbox.”

Copy:
“Locked for this guided step. Switch to Sandbox to freely adjust this value.”

## 8. Mode wireflows

### Learn mode

Flow:
1. scenario overview;
2. dimension anatomy;
3. threshold explanation;
4. mini-checkpoint.

Interaction:
- one concept active at a time;
- next/back controls;
- right panel shows explanation, not full raw compliance list.

### Diagnose mode

Flow:
1. load flawed preset;
2. learner selects suspected failing element;
3. learner chooses likely law/dimension;
4. panel reveals result;
5. fix suggestion appears.

### Compare mode

Flow:
1. same geometry shown under Scenario A;
2. switch to Scenario B;
3. active law chips change;
4. panel highlights what changed;
5. learner answers “which condition changed the result?”

### Sandbox mode

Flow:
1. all controls available;
2. learner explores freely;
3. panel gives live diagnosis;
4. reset and deliberate-error presets available.

### Challenge mode

Flow:
1. scenario prompt;
2. hints hidden;
3. learner identifies violation, law, correction;
4. answer checked;
5. explanation links back to source/citation when audited.

## 9. Responsive behavior

### Desktop wide

- left/right panels visible by default;
- viewport central;
- both sidebars collapsible.

### Desktop narrow / 13-inch laptop

- default widths may reduce to 380/380;
- right panel can default collapsed if viewport becomes unusable, but status bar must remain visible;
- critical fix summary must still be reachable immediately.

### Tablet

- keep one sidebar at a time if grid becomes cramped;
- prefer bottom sheet tabs rather than two persistent rails.

### Mobile

- viewport first;
- bottom sheet tabs;
- no long source text in default tab;
- touch targets at least 44px.

## 10. Visual hierarchy rules

- The 3D stair is the hero.
- Law colors identify law chips and status dots; they should not flood card backgrounds.
- Use red only for active legal failures, not ordinary labels.
- Use blue for accessibility identity, not generic information.
- Use amber for contextual warnings/conflicts.
- Use green sparingly for pass summary.

## 11. Accessibility and keyboard rules

- Mode tabs need keyboard navigation.
- Accordion sections must be buttons with clear labels and `aria-expanded`.
- Sliders must keep labels, units, min/max, and current values accessible.
- Critical fixes should use text and icons/color, not color alone.
- Right-panel updates should not steal focus on every slider change.
- Challenge answers need standard button/choice controls, not drag-only submission.

## 12. UX blockers before implementation is considered “great”

Do not call the implementation great if:

- first load still exposes every advanced control equally;
- right panel is still a flat list of violations only;
- source/citation text crowds the viewport;
- legal and comfort warnings look identical;
- the generic renderer still owns stairway-specific UI after the migration phase;
- mobile users cannot inspect compliance without losing the model;
- learners can play with sliders but never answer an exam-style question.
