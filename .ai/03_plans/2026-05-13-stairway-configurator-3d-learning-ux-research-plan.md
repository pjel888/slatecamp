# Stairway Configurator 3D Learning UX Research + Improvement Plan

Date: 2026-05-13
Route: `http://localhost:3000/dashboard/3d-lab/stairway-configurator`
Status: Planning / research complete, no implementation yet
Branch inspected: `3dlab-gray-viewport-bg`
Primary user concern: the current UI/UX is cramped, visually weak, and over-dependent on narrow sidebars even though the core compliance-feedback idea is valuable.

---

## 1. Executive Decision

The Stairway Configurator should stop behaving like a generic parametric demo and become a dedicated 3D learning workbench for stair-code reasoning.

The strongest current feature should be preserved:

- when learners adjust riser height, tread depth, stair width, handrail height, headroom, accessibility, exit-stair status, occupancy, and related inputs, the module immediately shows compliance consequences.

The weak part is not the computation idea. The weak part is the interface architecture:

- too many unrelated controls are stacked in a 320px left sidebar;
- compliance and source/legal feedback compete inside a 300–340px right sidebar;
- the learner has no clear path from scenario → geometry adjustment → violation diagnosis → code reasoning → exam transfer;
- the page feels like a configuration form beside a model, not a premium 3D learning module.

Recommended direction:

1. Add a stairway-specific layout path in the 3D Lab shell.
2. Replace the generic left/right sidebar experience with a wider, staged learning workbench.
3. Keep the 3D viewport dominant and calm.
4. Turn compliance into fix-oriented, dimension-based learning cards.
5. Sequence the module into Learn, Diagnose, Compare, Sandbox, and Challenge/Exam Transfer modes.
6. Treat legal/code facts as source-audited claims tied to `vitruvius-connection/001_Raw-Source-Layer` before calling them source-backed.

---

## 2. Evidence Inspected

### Live code and UI architecture

- `src/features/3d-lab/hooks/useTemplateContent.tsx`
  - Generic parametric path currently uses:
    - `GenericControlPanel` in the left sidebar.
    - `ComplianceReportPanel` or `SourceCompliancePanel` in the right sidebar.
    - `leftSidebar: { width: 320 }`.
    - `rightSidebar: { width: 300 }` or `{ width: 340 }` when source-backed compliance exists.
  - Existing special paths already exist for modules that need custom panels:
    - `site-development-controls`
    - `unified-wall-configurator`

- `src/features/3d-lab/components/shell/ViewportShell.tsx`
  - Desktop layout is CSS grid:
    - left sidebar
    - left collapse handle
    - viewport
    - right collapse handle
    - right sidebar
  - Mobile layout uses bottom-sheet tabs generated from sidebar slot content.
  - This is the correct container to preserve.

- `src/features/3d-lab/templates/ParametricSceneRenderer.tsx`
  - Builds geometry from `config.geometry(params)`.
  - Computes active violations from `config.violations`.
  - Currently includes a stairway-specific `ClickInspectPopover` when `config.id === 'stairway-configurator'`.
  - This is a boundary smell: the generic renderer knows about one specific module.

- `src/features/3d-lab/components/stairway/ClickInspectPopover.tsx`
  - Shows selected stair element, current value, and law-by-law pass/fail.
  - Useful idea, but should become a panel/inspector behavior rather than a fixed viewport popover.

- `src/features/3d-lab/config/modules/08-vertical/stairway-configurator.ts`
  - Large module config with many parameter groups:
    - Project Classification
    - Stair Geometry
    - Learning Overlays
    - Nosing Detail
    - Handrail Detail
    - User Safety
    - Material
    - Egress Calculator
  - This volume exceeds what a generic 320px sidebar can teach cleanly.

- `src/features/3d-lab/config/modules/08-vertical/stairway-computation.ts`
  - Good separation exists: pure computation engine produces derived metrics and per-law compliance.

- `src/features/3d-lab/config/modules/08-vertical/stairway-constants.ts`
  - Contains Philippine code constants, comfort constants, egress constants, and several explicitly unverified international/IBC/ADA comparison items.

### Existing archived planning

- `.ai/09_archive/store/MODULES/3D/Stairway-Configurator/V2/stairway-configurator-ux-implementation-plan.md`
- `.ai/09_archive/store/MODULES/3D/Stairway-Configurator/V2/stairway-configurator-technical-implementation-plan.md`

Key archived principles that remain correct:

- computation and geometry should stay separated;
- laws must evaluate in parallel, never be merged or averaged;
- every number must trace to a code citation;
- progressive disclosure must govern information density;
- mobile performance remains a first-class constraint;
- geometry instructions should remain serializable;
- the module should teach cross-law conflict, not hide it.

### Source-law folders inspected / located

Primary legal/code source truth must come from `vitruvius-connection/001_Raw-Source-Layer`, especially:

- PD 1096:
  - `vitruvius-connection/001_Raw-Source-Layer/001-Laws/PD-1096/PD 1096 RIRR 2004 - Revised IRR (DPWH Official).pdf`
  - `vitruvius-connection/001_Raw-Source-Layer/001-Laws/PD-1096/PD 1096 IRR - Full Implementing Rules and Regulations.pdf`
  - `vitruvius-connection/001_Raw-Source-Layer/001-Laws/PD-1096/PD 1096 IRR - Rules 7 and 8 Light Ventilation and Development Controls.pdf`

- BP 344:
  - `vitruvius-connection/001_Raw-Source-Layer/001-Laws/BP-344/2024 Revised Implementing Rules and Regulations Batas Pambansa Blg. 344 _ National Council on Disability Affairs.pdf`
  - `vitruvius-connection/001_Raw-Source-Layer/001-Laws/BP-344/BP-344 IRR Accessibility Law DPWH.pdf`

- RA 9514:
  - `vitruvius-connection/001_Raw-Source-Layer/001-Laws/RA-9514/RA9514-RIRR-rev-2019.pdf`

- BP 220:
  - `vitruvius-connection/001_Raw-Source-Layer/001-Laws/BP-220/Revised_IRR_BP220_2008.pdf`

Source policy for this plan:

- `001_Raw-Source-Layer` is the authority.
- `002_Raw-Conversion-Layer` can support extraction/search.
- `003_Canonical-Knowledge-Layer` is useful for discovery, but is not legal authority by itself.
- International/IBC/ADA values in the current constants file must remain comparison-only or unverified unless audited against a source decision.

---

## 3. Current Problem Diagnosis

### 3.1 UI problem

The current page likely feels cramped because the module content is much larger than the shell pattern it uses.

A generic parametric module can survive with:

- a 320px control sidebar;
- a 300px compliance sidebar;
- all parameters stacked by group;
- a generic violation report.

The stairway module cannot. It is already a multi-law legal reasoning simulator, a 3D geometry model, an egress calculator, a material/safety scenario explorer, and a learner assessment surface.

Trying to squeeze all of that into two skinny sidebars makes the product feel cheap and cognitively heavy.

### 3.2 UX problem

The learner currently lacks a clear job-to-be-done path.

A better path is:

1. choose a real project scenario;
2. understand which laws are active;
3. manipulate the primary dimensions;
4. see immediate visual and legal consequences;
5. inspect the affected stair element;
6. understand the source/citation;
7. fix the violation;
8. answer an exam-style check.

The current generic panel layout exposes too many controls before the learner understands why they matter.

### 3.3 Pedagogy problem

The current interaction risks becoming slider-play instead of exam preparation.

Learners should not only learn that a value turns red. They should learn:

- what exactly is being measured;
- what law is active;
- why a scenario triggers that law;
- whether a result is a legal violation, a comfort warning, or an international comparison note;
- how to correct the design with the smallest change;
- how this would appear in an ALE question.

### 3.4 Architecture problem

The current renderer includes stairway-specific UI:

- `ParametricSceneRenderer.tsx` imports and renders `ClickInspectPopover` only for `stairway-configurator`.

This violates the preferred component boundary:

- renderers should render geometry;
- shell slots should hold panels;
- stairway-specific React UI should live under `components/stairway/*` and be slotted through `useTemplateContent.tsx`.

---

## 4. LLM Council Synthesis

A three-part council was assembled for this planning pass:

1. UX/UI council
2. Pedagogy/curriculum council
3. Technical architecture council

### Consensus points

All three council views converge on the same recommendation:

- do not fix this with small padding or typography tweaks;
- create a stairway-specific learning workbench while preserving the shared `ViewportShell` architecture;
- preserve immediate violation feedback;
- collapse advanced controls by default;
- move from raw violations to dimension-based fix cards;
- use modes or stages to reduce cognitive load;
- keep source/legal verification as a separate disciplined phase.

### Council disagreement / tradeoff

There are two viable layout strategies:

1. Wider left and right sidebars inside the current shell.
2. Canvas-first layout with a bottom inspector instead of a persistent right sidebar.

Recommended initial implementation:

- use a stairway-specific shell path with wider, better-structured sidebars first;
- reserve bottom inspector as a later responsive/mobile enhancement if horizontal crampedness remains.

Reason:

- `ViewportShell` already supports left/right slots and mobile bottom-sheet tabs;
- the fastest high-confidence path is to specialize the sidebars without replacing the shell.

---

## 5. Target Product Experience

The target experience should feel like an interactive code reasoning studio.

A learner opens the page and sees:

1. a calm, large stair model;
2. a short scenario card;
3. active law chips;
4. a small set of high-impact controls;
5. a compliance health summary;
6. source/citation detail only on demand.

The module should not first show every possible slider, material, egress, tolerance, international, and detail control.

### Desired learner impression

“This is teaching me how stair-code decisions work.”

Not:

“This is a dense form attached to a 3D object.”

---

## 6. Proposed Information Architecture

### 6.1 Desktop layout: Stairway Learning Workbench

Keep `ViewportShell`, but add a `stairway-configurator` special path in `useTemplateContent.tsx`.

Recommended desktop layout:

- Header:
  - title
  - short learning goal
  - active mode: Learn / Diagnose / Compare / Sandbox / Challenge

- Center:
  - large 3D viewport
  - existing shared toolbar
  - camera navigation
  - small model-linked highlights only
  - avoid persistent large labels over the model

- Left panel, corrected no-decision-fatigue direction:
  - no scenario/stair-type dropdown in the default sidebar
  - fixed module scenario displayed as context, not chosen before learning
  - primary dimensions only: riser, tread, stair width, handrail height
  - any law/scenario comparison belongs in a modal, guided lesson, or later challenge state
  - advanced groups collapsed outside the sidebar

- Right panel, recommended width: 380–420px
  - overall compliance status
  - selected element inspector
  - critical fixes
  - dimension cards
  - law comparison
  - source detail collapsed

- Bottom/status strip:
  - compact status for riser, tread, width, handrail, headroom, egress
  - issue count / conflict count

### 6.2 Mobile layout

Use the existing `ViewportShell` bottom-sheet tab system.

Recommended mobile tabs:

1. Inspect
2. Controls
3. Compliance
4. Source / Quiz

The viewport should remain touch-first and not be covered permanently by source/legal content.

---

## 7. Proposed Panel Hierarchy

### 7.1 Left panel: controls as learning flow

Default open sections:

1. Scenario
   - Project Type
   - Part of Accessible Route?
   - Required Exit Stair?
   - Occupant Load > 50?
   - active law chips

2. Core Geometry
   - Clear Width
   - Riser Height
   - Tread Depth
   - Handrail Height
   - Headroom
   - Number of Risers

Collapsed by default:

3. Shape
   - Stair Type
   - Turn Direction
   - Risers Before Turn

4. Detail Studies
   - Nosing Detail
   - Handrail Detail
   - Materials

5. Advanced / Simulation
   - Egress Calculator
   - Evacuation Simulation
   - Tolerance Mode
   - International Comparison
   - Historical Context

Rationale:

- scenario and core geometry teach the main ALE concepts;
- detail and simulation controls are valuable, but should not dominate first load.

### 7.2 Right panel: feedback as diagnosis

Recommended order:

1. Overall status
   - Passing / Needs attention / Conflict
   - number of active issues
   - number of active cross-law conflicts

2. Selected element inspector
   - shows when learner clicks a tread, riser, handrail, width plane, or headroom plane
   - current value
   - relevant laws
   - pass/fail per law
   - short “why this matters” explanation

3. Critical fixes
   - highest-severity issues first
   - current value
   - required threshold/range
   - smallest correction suggestion
   - law/citation chip

4. Dimension cards
   - Riser
   - Tread
   - Width
   - Handrail
   - Headroom
   - Vertical rise / landing
   - Egress

5. Law comparison
   - PD 1096
   - BP 220
   - BP 344
   - RA 9514
   - comparison-only international references, if enabled

6. Source detail
   - collapsed by default
   - quote/page/citation only after source audit is complete

7. Checkpoint question
   - “Which law controls this failure?”
   - “What single dimensional correction fixes it?”

---

## 8. Learning Model

The module should use a staged learning sequence.

### Stage 1: Learn

Goal:

- teach the anatomy of stair dimensions.

UX:

- start with a compliant baseline stair;
- lock most controls;
- highlight one dimension at a time;
- show one code idea at a time;
- ask one quick recall question after each concept.

Learning method:

- worked examples;
- cognitive load reduction;
- dual coding: dimension in 3D + law/citation in text.

### Stage 2: Diagnose

Goal:

- train learners to notice violations and explain why they occur.

UX:

- present a deliberately flawed stair;
- ask the learner to identify the failing element before revealing the threshold;
- then reveal compliance feedback and source/citation.

Learning method:

- productive failure;
- error-based learning.

### Stage 3: Compare

Goal:

- teach conditional application of laws.

UX:

- same geometry, different scenario toggles;
- show how a stair can pass under one law/context and fail under another;
- emphasize active-law triggers.

Example comparisons:

- residential vs commercial;
- ordinary stair vs required exit stair;
- ordinary circulation vs accessible route;
- BP 220 housing vs general residential;
- comfort-passing but legally failing;
- legally passing but comfort-warning.

Learning method:

- contrasting cases;
- discrimination practice.

### Stage 4: Sandbox

Goal:

- allow free exploration after the learner has a mental model.

UX:

- all controls available;
- instant compliance feedback preserved;
- reset to compliant;
- make-one-violation preset;
- ghost compliant stair overlay;
- delta feedback after changes.

Learning method:

- self-explanation;
- causal exploration.

### Stage 5: Challenge / Exam Transfer

Goal:

- move from 3D support to ALE-style reasoning.

UX:

- hide hints/thresholds at first;
- learner identifies violation, controlling law, and correction;
- ask final exam-style question;
- fade from 3D model → 2D diagram → text-only question.

Learning method:

- retrieval practice;
- transfer;
- scaffolding/fading.

---

## 9. Code-Fact and Legal Accuracy Rules

This module must distinguish among:

1. Philippine legal requirement
2. Philippine legal conflict/overlap
3. ergonomic comfort guidance
4. construction tolerance guidance
5. international comparison
6. unverified comparison/reference item

Rules:

- A legal violation shown to students must be traceable to a raw source or approved source metadata.
- Comfort formulas such as Blondel must not be phrased as Philippine law.
- International values must not be shown as governing Philippine requirements.
- Unverified constants already marked in code must stay out of learner-facing authoritative explanations until audited.
- Parallel law evaluation must be preserved; never average or merge PD 1096, BP 220, BP 344, and RA 9514 into one blended requirement.

Source-backed readiness requirement:

Before enabling `SourceCompliancePanel`-style “source-backed” status for this module, every displayed legal threshold needs:

- source law;
- section/rule citation;
- exact quote or source excerpt;
- page locator;
- extraction note;
- human approval / audit status;
- source rule id that maps to the UI violation.

---

## 10. Technical Architecture Plan

### 10.1 Keep

Keep these systems:

- `ViewportShell`
- `CanvasWrapper`
- `ParametricSceneRenderer` for geometry rendering
- `computeStairState()` as the computation source
- `GeometryInstruction` pattern
- existing stairway geometry builders
- existing per-law violation rules
- existing tests for computation, geometry, and click targets

### 10.2 Change

Add a stairway-specific branch in:

- `src/features/3d-lab/hooks/useTemplateContent.tsx`

Pattern should follow existing special paths for:

- `site-development-controls`
- `unified-wall-configurator`

Proposed new components:

- `src/features/3d-lab/components/stairway/StairwayLeftPanel.tsx`
- `src/features/3d-lab/components/stairway/StairwayRightPanel.tsx`
- `src/features/3d-lab/components/stairway/StairwayStatusBar.tsx`
- `src/features/3d-lab/components/stairway/StairwayModeTabs.tsx`
- `src/features/3d-lab/components/stairway/StairwayDimensionCard.tsx`
- `src/features/3d-lab/components/stairway/StairwayLawChips.tsx`
- `src/features/3d-lab/components/stairway/StairwayFixSuggestion.tsx`

Possible data adapter files:

- `src/features/3d-lab/components/stairway/stairway-panel-model.ts`
- `src/features/3d-lab/components/stairway/stairway-learning-stages.ts`

### 10.3 Remove / refactor later

Eventually remove stairway-specific UI from:

- `src/features/3d-lab/templates/ParametricSceneRenderer.tsx`

Current issue:

- `ParametricSceneRenderer` imports `ClickInspectPopover` and conditionally renders it only for `stairway-configurator`.

Better approach:

- generic renderer emits/selects clicked element ids;
- stairway right panel reacts to selected element;
- inspection detail appears in the panel, not as a viewport card.

### 10.4 Selection state options

Preferred:

- use existing `useViewportShellStore` selected element state if sufficient;
- right panel reads selected element id and uses `matchClickTarget()` + `computeStairState()`.

Avoid:

- storing inspection state inside geometry instructions;
- adding stairway-specific state to the generic renderer;
- putting React UI logic inside `stairway-configurator.ts`.

---

## 11. UI Design Direction

### 11.1 Visual tone

The module should look like a premium study/workbench environment:

- calm neutral canvas;
- strong but restrained law color chips;
- high-contrast selected element highlight;
- fewer red/yellow alerts at once;
- no cluttered labels covering the model;
- readable panel cards with whitespace.

### 11.2 Law color usage

Use law colors as identity markers, not full-card backgrounds:

- RA 9514: critical life-safety / evacuation red
- BP 344: accessibility blue
- PD 1096: baseline code slate
- BP 220: contextual housing amber
- pass: green only for summary/status, not everything

### 11.3 Fix-oriented violation cards

Replace raw violation lists with cards like:

- Dimension: Riser Height
- Current: 185 mm
- Requirement: max 180 mm for active RA 9514 exit stair check
- Status: Fails
- Fix: lower riser height to 180 mm or less, or re-check whether this stair is actually a required exit stair
- Why: required exit stairs use stricter life-safety limits
- Source: collapsed citation/quote

### 11.4 Delta feedback

After a learner changes a value, show concise cause/effect:

- “Turning on Required Exit Stair activated RA 9514 checks.”
- “Riser +10 mm changed RA 9514 from pass to fail.”
- “Accessible Route activated BP 344 width/handrail expectations.”
- “Your stair is legally passing but outside the comfort band.”

This is the core teaching upgrade.

---

## 12. Implementation Phases

### Phase 0 — Research freeze and source audit preparation

Purpose:

- freeze what we know before code changes.

Tasks:

- keep this plan in `.ai/03_plans`;
- inventory stairway constants and map them to raw-source PDFs;
- mark which constants are source-audited, conversion-supported, comparison-only, or unverified.

Deliverables:

- this plan;
- future source audit table.

Acceptance:

- no learner-facing source-backed claim is made until source audit is complete.

### Phase 1 — Stairway-specific shell path

Purpose:

- stop using the cramped generic parametric sidebars for this module.

Tasks:

- add a `cfg.id === 'stairway-configurator'` special path in `useTemplateContent.tsx`;
- set wider sidebars;
- slot stairway-specific panels;
- preserve existing canvas renderer and parameter behavior;
- preserve right-side violation feedback.

Initial widths:

- left: 400px
- right: 400px

Acceptance:

- viewport remains central and usable;
- all current controls remain reachable;
- right panel still updates when dimensions change;
- mobile still receives bottom-sheet tabs.

### Phase 2 — Left panel information architecture

Purpose:

- reduce first-load overwhelm.

Tasks:

- create `StairwayLeftPanel`;
- group controls into Scenario, Core Geometry, Shape, Detail Studies, Advanced/Simulation;
- collapse advanced groups by default;
- show active law chips near scenario controls;
- preserve all current parameters.

Acceptance:

- first view shows scenario + core geometry only;
- advanced controls are still accessible;
- no parameter is removed;
- keyboard/touch controls remain usable.

### Phase 3 — Right panel as diagnosis engine

Purpose:

- turn violations into teaching.

Tasks:

- create `StairwayRightPanel`;
- read `computeStairState(params)`;
- show overall status;
- show selected element inspector;
- show critical fixes;
- group issues by dimension;
- distinguish legal violation, comfort warning, comparison-only note, and unverified/non-authoritative note.

Acceptance:

- learner can answer: “what failed, why, which law, what fix?”;
- compliance updates immediately when sliders/toggles change;
- cross-law conflicts remain visible;
- right panel does not become a raw law dump.

### Phase 4 — Move inspection out of the viewport

Purpose:

- restore renderer boundary and reduce viewport clutter.

Tasks:

- stop rendering `ClickInspectPopover` from `ParametricSceneRenderer.tsx`;
- use selected element state to drive the right panel;
- keep click-to-inspect behavior;
- optionally keep a tiny non-blocking selected-element badge, but no large fixed card over the model.

Acceptance:

- clicking a tread/riser/handrail updates the right inspector;
- generic renderer no longer imports stairway-specific UI;
- existing click-target tests still pass or are updated for panel inspection.

### Phase 5 — Learning modes

Purpose:

- make this an actual learning module, not just a configurator.

Tasks:

- add mode tabs:
  - Learn
  - Diagnose
  - Compare
  - Sandbox
  - Challenge
- define stage-specific visible controls and hints;
- add deliberate violation presets;
- add checkpoint prompts.

Acceptance:

- Learn mode is guided and not overwhelming;
- Sandbox mode preserves full control;
- Challenge mode can hide hints and require learner response;
- mode changes do not corrupt parameter state.

### Phase 6 — Source-backed legal/citation layer

Purpose:

- make legal claims auditable.

Tasks:

- map constants to source excerpts from `vitruvius-connection/001_Raw-Source-Layer`;
- add source metadata only after verification;
- consider adding `sourceTruth` to the stairway config;
- wire source cards into the right panel or `SourceCompliancePanel` only when ready.

Acceptance:

- every authoritative learner-facing legal threshold has source metadata;
- source-backed status fails closed if incomplete;
- international/unverified values cannot appear as Philippine legal rules.

### Phase 7 — Exam transfer and retrieval

Purpose:

- connect 3D learning to ALE performance.

Tasks:

- add challenge prompts;
- add 2D diagram transfer step;
- add text-only LEA-style questions;
- route missed concepts to focus review/SRS if available;
- add misconception feedback.

Acceptance:

- learner can solve without the 3D visual support;
- feedback includes law, reasoning, and correction;
- challenge items distinguish legal requirement from comfort/comparison guidance.

---

## 13. Validation Plan

### Existing tests to run after implementation work

- `bun test src/features/3d-lab/config/modules/08-vertical/stairway-computation.test.ts`
- `bun test src/features/3d-lab/config/modules/08-vertical/stairway-geometry.test.ts`
- `bun test src/features/3d-lab/config/modules/08-vertical/stairway-click-targets.test.ts`
- `bun run type-check`
- `bun run lint`

### New tests recommended

1. Generic renderer boundary test
   - `ParametricSceneRenderer.tsx` should not import stairway-specific UI.

2. Stairway shell integration test
   - `stairway-configurator` should use stairway-specific left/right panel slots.

3. Panel reactivity test
   - changing riser/tread/width/handrail/headroom updates right-panel status.

4. Selected element inspector test
   - selecting a tread/riser/handrail maps to the correct dimension card.

5. Source gate test
   - source-backed status is unavailable/incomplete unless source metadata is complete.

6. Mobile bottom-sheet test
   - controls, compliance, and inspection are accessible on mobile.

### Manual UX checks

On a 13-inch laptop viewport:

- first load is not visually overwhelming;
- viewport remains large enough to understand stair geometry;
- left panel does not require excessive scrolling before core controls;
- right panel explains the most important violation without reading a long list;
- collapse handles remain usable;
- no large persistent cards cover the 3D stair.

On mobile:

- model is still manipulable;
- bottom sheet does not permanently hide the model;
- controls and compliance are reachable with few taps.

---

## 14. Risks

### Risk 1: Over-customization

A bespoke stairway path can drift from the shared 3D Lab system.

Mitigation:

- keep `ViewportShell`, `CanvasWrapper`, and shared renderer patterns;
- only customize panel content and widths.

### Risk 2: More UI could mean more clutter

Adding learning modes and cards can worsen the page if everything shows at once.

Mitigation:

- progressive disclosure;
- collapsed advanced groups;
- one active learner task at a time.

### Risk 3: Legal/source error

A beautifully designed module with wrong code facts is dangerous.

Mitigation:

- source audit before source-backed claims;
- distinguish legal, comfort, comparison, and unverified guidance.

### Risk 4: Performance

More panels and state can cause unnecessary re-renders.

Mitigation:

- keep computation pure and memoized;
- update inspection only on click, not pointer move;
- do not put heavy DOM overlays inside the canvas.

### Risk 5: Exam transfer failure

Learners may become dependent on the 3D tool.

Mitigation:

- add fading sequence from 3D → 2D → text-only ALE-style questions.

---

## 15. Non-Goals

Do not do these in the first implementation pass:

- do not rewrite the computation engine;
- do not replace `ViewportShell`;
- do not create a separate full-screen layout outside the 3D Lab shell;
- do not merge the four Philippine laws into a single blended compliance rule;
- do not present unverified IBC/ADA/international values as Philippine requirements;
- do not add source-backed labels before the source audit is complete;
- do not move code logic into React panel components;
- do not make the viewport busier with permanent explanatory overlays.

---

## 16. Recommended Next Action

Start with Phase 1 and Phase 2 together:

1. Add a stairway-specific branch in `useTemplateContent.tsx`.
2. Create `StairwayLeftPanel` and `StairwayRightPanel` skeletons.
3. Preserve existing `GenericControlPanel` behavior internally at first, but reorganize the visible groups.
4. Make the right panel read `computeStairState(params)` and show a simple compliance summary.
5. Only after this works, migrate click inspection from viewport popover to the right panel.

This gives the fastest visible UX improvement while keeping technical risk contained.

---

## 17. Definition of Done for the Redesign Program

The redesign is successful when:

- the page no longer feels cramped on desktop;
- the 3D stair remains visually dominant;
- scenario, controls, compliance, and source/legal explanation have clear locations;
- learners can immediately see the consequences of changing stair dimensions;
- violations are explained as fixable dimension problems, not just red warnings;
- cross-law conflicts are teachable;
- source/legal claims are auditable;
- the module supports guided learning and exam transfer;
- the generic renderer is no longer polluted by stairway-specific UI;
- tests protect computation, geometry, inspection, and source-backed gating.
