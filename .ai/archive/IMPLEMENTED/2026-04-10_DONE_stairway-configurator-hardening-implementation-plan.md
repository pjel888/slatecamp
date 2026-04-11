# 2026-04-10 Stairway Configurator Hardening Implementation Plan

## Source and Intent
- Source prompt reviewed: `C:/Users/Philip Lewis/Desktop/slatecamp/.ai/prompts/stairway-configurator-fix.md`
- Planning mode: `$ralplan`
- Planning posture: the prompt is treated as a **guide**, not the source of truth
- Desired outcome: a codebase-grounded implementation plan that fixes the stairway configurator comprehensively, while explicitly guarding against regressions in other active 3D modules, especially **Site Development Controls**

## Brownfield Review Summary

### What I reviewed
- Stairway core:
  - `src/features/3d-lab/config/modules/08-vertical/stairway-types.ts`
  - `src/features/3d-lab/config/modules/08-vertical/stairway-computation.ts`
  - `src/features/3d-lab/config/modules/08-vertical/stairway-configurator.ts`
  - `src/features/3d-lab/config/modules/08-vertical/stairway-geometry-l-shape.ts`
  - `src/features/3d-lab/config/modules/08-vertical/stairway-geometry-u-shape.ts`
  - `src/features/3d-lab/config/modules/08-vertical/stairway-egress.ts`
  - `src/features/3d-lab/config/modules/08-vertical/stairway-click-targets.ts`
  - `src/features/3d-lab/config/modules/08-vertical/stairway-nosing.ts`
  - `src/features/3d-lab/config/modules/08-vertical/stairway-computation.test.ts`
- Stairway UI surfaces:
  - `src/features/3d-lab/components/stairway/ClickInspectPopover.tsx`
  - `src/features/3d-lab/components/stairway/ComparisonPanel.tsx`
  - `src/features/3d-lab/components/stairway/EgressCalculatorPanel.tsx`
  - `src/features/3d-lab/components/stairway/HandrailDetailPanel.tsx`
  - `src/features/3d-lab/components/stairway/NosingDetailPanel.tsx`
- Shared 3D infrastructure / cross-module impact surface:
  - `src/features/3d-lab/templates/ParametricScene.tsx`
  - `src/features/3d-lab/templates/ParametricSceneRenderer.tsx`
  - `src/features/3d-lab/components/CanvasWrapper.tsx`
  - `src/features/3d-lab/components/rendering/SceneConfig.tsx`
  - `src/features/3d-lab/components/ModuleViewer.tsx`
  - `src/features/3d-lab/components/LabViewport.tsx`
  - `src/features/3d-lab/DevControlsModule/dashboard/SharedToolbarBridge.tsx`
  - `src/features/3d-lab/types/templates.ts`

### Prompt-to-code calibration

#### Verified directly in code
1. **Compliance truth is duplicated** between `computeStairState()` and `stairway-configurator.ts` violation rules.
2. **Handrail logic is inconsistent**: `computeHandrailCompliance()` enforces BP 344 exactness while `resolveHandrailColor()` ignores BP 344.
3. **International comparison is oversimplified**: `computeInternationalDeltas()` uses a residential/BP220 shortcut rather than the active scenario’s strictest Philippine baseline.
4. **U-shape landing placement is incorrect**: `landingCenterX / 2` is present.
5. **Landing depth logic is suspicious**: L/U builders use `Math.min(sW, LANDING_MIN_DEPTH_MM / 1000)`.
6. **Evacuation dots are nondeterministic**: `Math.random()` is used, while tolerance mode is seeded.
7. **Detail-mode UI is ahead of implementation**: `riserUndercut`, `contrastStripWidth`, `wallClearance`, and `handrailProfile` are surfaced in UI but not fully represented in geometry.
8. **Click-target coverage is incomplete** relative to generated geometry IDs.
9. **Tests are too narrow**: they focus on computation and egress but not geometry correctness, interaction coverage, or determinism.

#### Additional codebase findings not fully emphasized in the prompt
1. **Turning-flight split is unsafe**: `risersBeforeTurn` is parsed directly and is not clamped against `numRisers`, so invalid split states are possible.
2. **Tolerance mode only partially propagates**: straight-stair treads/risers use per-step deviations, but top landing / aggregate handrail math still use nominal rise assumptions.
3. **ComparisonPanel is weaker than the engine**: it is not showing the real active Philippine law context cleanly, and its comparison semantics are simplistic.
4. **The stairway module is template-driven**, but Site Development Controls is bespoke. That means most stairway fixes can and should stay local.
5. **There is a live-path vs orphaned-component split**: the repo contains stairway-specific panels/components, but the current runtime still flows through `useTemplateContent.tsx` with `GenericControlPanel` and `ComplianceReportPanel`. Any plan that assumes those stairway-specific components are live must be treated as a separate integration decision.

#### Prompt guidance that should be adapted rather than adopted blindly
1. **Landing minimum depth** should not be promoted into Philippine compliance truth unless legal provenance is explicit. The current constant is labeled as an IBC-based reference and is marked unverified.
2. **Shared framework changes** should be minimized. The prompt suggests new types and validators; that is reasonable, but they should begin as stairway-local or optional extensions, not a cross-module rewrite.

---

## RALPLAN-DR Summary

### Principles
1. **One rule truth per dimension.** Geometry, colors, overlays, click inspect, reports, and teaching panels must derive from one canonical computation source, not parallel threshold branches.
2. **Topology before polish.** Join contracts and geometry correctness come before richer overlays or UI refinements.
3. **Keep shared infrastructure stable unless a shared bug is proven.** Stairway hardening should stay stairway-local whenever possible to protect Site Development Controls and other active modules.
4. **No UI affordance should claim more than the geometry or computation actually implements.** If a control is not truly wired, either wire it or explicitly degrade/hide it.
5. **Every geometry rule change must be verifiable.** The module needs geometry and interaction regression coverage, not just arithmetic tests.

### Decision Drivers
1. **Trustworthiness of a compliance visualizer.** Rule drift between engine, scene, and UI is more dangerous than a purely visual bug.
2. **Containment of regression risk.** The stairway module shares shell-level infrastructure with other 3D modules, but most defects are module-local and should be fixed there.
3. **Execution viability.** The work needs to be staged so correctness hardening lands before broad refactors or optional UX expansions.

### Viable Options

#### Option A — Targeted bug patch only
Fix the obvious geometry and compliance mismatches called out in the prompt, add a few tests, and stop.
- **Pros:** smallest immediate diff.
- **Cons:** leaves the duplicated-rule architecture intact, so new drift bugs remain likely.

#### Option B — Stairway-local hardening pass with canonical UI/compliance adapters, join contracts, and geometry validation **(recommended)**
Keep the work primarily inside `stairway-*` files and stairway UI components, add local abstractions where needed, and avoid destabilizing shared template infrastructure.
- **Pros:** solves the underlying drift problem without rewriting the entire 3D module system.
- **Cons:** larger than a hotfix and requires a careful phased rollout.

#### Option C — Shared parametric-scene framework refactor
Move rule status normalization and geometry validation into shared `ParametricScene` / template infrastructure for all modules.
- **Pros:** strongest long-term architecture.
- **Cons:** too broad, too risky for the current goal, and unnecessarily increases impact on Site Development Controls and other active modules.

### Chosen Direction
Adopt **Option B**.

### Why Chosen
- It addresses the verified stairway defects at the right level of abstraction.
- It keeps most changes local to the stairway module.
- It still allows a later extraction into shared infrastructure if the local hardening proves the model useful.

---

## ADR

### Decision
Perform a **stairway-local hardening pass** built around two core contracts:
1. a **canonical stairway compliance/view-model layer** derived from `computeStairState()` for scene/UI consumption
2. a **geometry join/validation layer** for straight, L-shape, and U-shape builders

### Alternatives Considered
- patch only the visible defects
- refactor the shared parametric-scene framework across all modules

### Why This ADR Matters
The current defects are not isolated. They cluster around two failure modes:
- duplicated legal/compliance logic in multiple layers
- geometry placed by loosely related formulas rather than explicit join contracts

### Consequences
- The plan should prioritize canonical adapters and geometry contracts before cosmetic cleanup.
- Shared infrastructure should only be touched when required for safe stairway-local integration.
- The final implementation should preserve the existing `ParametricSceneConfig` surface unless an additive extension is clearly safer.

### Follow-ups (not required for this patch)
- extracting geometry validation into a shared parametric-scene capability if multiple modules need it
- revisiting international reference data with SME validation
- auditing other parametric modules for duplicated truth patterns once stairway hardening lands

---

## Cross-Module Impact Analysis

## What is stairway-local and should remain stairway-local
These fixes should stay inside the stairway module unless a compelling shared need emerges:
- compliance adapter/view-model types for stair-specific dimensions
- geometry join contracts for stair flights and landings
- stairway geometry validator
- click-target coverage for stairway IDs
- deterministic evacuation dot generation for stairway only
- detail-view wiring for stairway-only controls
- stairway-specific tests

**Primary files:**
- `stairway-types.ts`
- `stairway-computation.ts`
- `stairway-configurator.ts`
- `stairway-geometry-l-shape.ts`
- `stairway-geometry-u-shape.ts`
- `stairway-egress.ts`
- `stairway-click-targets.ts`
- `stairway-nosing.ts`
- `components/stairway/*`

## What is shared and therefore high-risk
Changes here could affect **all template-driven modules** and, indirectly, Site Development Controls through shell behavior/state:
- `src/features/3d-lab/types/templates.ts`
- `src/features/3d-lab/templates/ParametricScene.tsx`
- `src/features/3d-lab/templates/ParametricSceneRenderer.tsx`
- `src/features/3d-lab/components/CanvasWrapper.tsx`
- `src/features/3d-lab/components/rendering/SceneConfig.tsx`
- `src/features/3d-lab/components/shell/ViewportShell.tsx`
- `src/features/3d-lab/stores/useViewportShellStore.ts`

## Site Development Controls impact
### Current architecture facts
- Stairway uses **template-driven parametric rendering**.
- Site Development Controls uses **`DevControlsModule`**, a bespoke canvas/rendering path.
- Both share shell-level primitives like `ViewportShell` and some viewport state, but they do **not** share stairway computation or geometry builders.
- The repo already contains stairway-specific UI components (`ComparisonPanel`, `EgressCalculatorPanel`, `ClickInspectPopover`, detail panels), but the **live stairway runtime still flows through the generic template path** in `useTemplateContent.tsx`.

### Planning implication
The implementation plan should **avoid shared viewport/camera/store changes** unless a stairway defect is conclusively rooted there. Doing so keeps risk to Site Development Controls low.

If shared types or template surfaces must be touched, the changes should be **additive and optional only**. Do not break the current ParametricSceneConfig, ViolationRule[], or generic panel contracts in the same pass unless the plan explicitly promotes that into a separate, justified workstream.

### Safe rule
If a proposed stair fix requires editing:
- `CanvasWrapper`
- `SceneConfig`
- `ViewportShell`
- `useViewportShellStore`
- `CameraNavigationBar`

then the plan must treat that as a separate cross-module workstream with explicit regression testing against Site Development Controls.

### Additional guardrail
Do **not** convert Stairway Configurator into a bespoke non-template module in this patch. That would expand the blast radius from stairway-local correctness work into layout/runtime integration work and make Site Development Controls regression risk harder to reason about.

### Expected impact level by area
- **Stairway-only computation/geometry/UI files:** low risk to Site Development Controls
- **Shared template types with additive optional fields only:** low to medium risk
- **Shared rendering/store/shell changes:** medium to high risk and should be avoided unless necessary

---

## Hidden Edge Cases the Final Plan Must Cover

1. **Invalid turn splits**
   - `risersBeforeTurn` must be clamped or validated so both flights remain valid.
   - The plan must define minimum risers per flight and what the UI does when the current split becomes invalid.

2. **Tolerance mode aggregate drift**
   - If step heights vary, top landing height, stringer/rail endpoints, and any aggregate annotations must remain consistent with the actual generated stair.

3. **Landing semantics vs legal provenance**
   - The plan must distinguish between:
     - Philippine compliance truth,
     - international reference geometry,
     - purely visual join depth needed to keep geometry sane.
   - Do not silently convert an unverified IBC landing constant into a Philippine compliance rule.

4. **Straight, L, and U builders must share the same topology contract**
   - If straight-run joins are fixed but turning builders keep center-based heuristics, the module remains inconsistent.

5. **Scene/UI drift after adapter changes**
   - `ParametricSceneRenderer`, `ClickInspectPopover`, `ComparisonPanel`, and `ComplianceReportPanel` all consume different shapes of information today.
   - The plan must define exactly which layer owns the final UI-facing status model.

6. **Determinism parity**
   - Tolerance mode is seeded; evacuation mode is not.
   - If randomness is preserved anywhere, the plan must say why and how it is tested.

7. **Interaction coverage parity**
   - Every meaningful stair geometry ID should either be mapped in `stairway-click-targets.ts` or explicitly marked non-interactive.

8. **Feature honesty for detail views**
   - If `riserUndercut`, `contrastStripWidth`, `wallClearance`, or `handrailProfile` remain only partially implemented, the plan must choose one:
     - fully wire them, or
     - downgrade/hide the unsupported controls temporarily.

9. **Comparison panel semantics**
   - The international comparison view should show the active Philippine baseline, not a simplification that contradicts the main compliance engine.
   - The panel’s per-dimension “current” mapping should be audited, especially for vertical rise.

10. **Egress semantics wording**
   - The plan must clarify whether “counts as exit” and “passes exit stair geometry” are intentionally different concepts or should be unified.

---

## Detailed Implementation Plan

## Phase 0 — Confirm scope boundaries and explicit invariants

### Goal
Convert the prompt from guidance into a codebase-grounded contract before writing implementation PRD tasks.

### Deliverables
- Explicit list of stairway-local files to change
- Explicit list of shared files to avoid unless justified
- Explicit invariants for:
  - single-source compliance truth
  - valid turn split rules
  - deterministic overlays
  - geometry join correctness
  - feature honesty for detail modes

### Acceptance criteria
- The team agrees that the first pass is **stairway-local hardening**, not shared 3D framework refactor.
- The plan names the guardrails that protect Site Development Controls.

---

## Phase 1 — Unify rule truth into a stairway-local UI/compliance adapter

### Goal
Remove duplicated threshold reasoning from scene/UI layers.

### Files
- `src/features/3d-lab/config/modules/08-vertical/stairway-types.ts`
- `src/features/3d-lab/config/modules/08-vertical/stairway-computation.ts`
- `src/features/3d-lab/config/modules/08-vertical/stairway-configurator.ts`
- `src/features/3d-lab/components/stairway/ClickInspectPopover.tsx`
- `src/features/3d-lab/components/stairway/ComparisonPanel.tsx`
- `src/features/3d-lab/components/stairway/ComplianceLawCard.tsx` / report surfaces as needed

### Changes
- Add a normalized, stairway-local UI-facing status layer derived from ComplianceResult and ComputedStairState.
- Use that layer as the canonical source, then project it into the current shared `ViolationRule` / annotation-based runtime where needed instead of rewriting the shared template framework first.
- Centralize severity/law-priority resolution there instead of keeping independent threshold/color logic in multiple places.
- Replace direct threshold expressions in `stairway-configurator.ts` wherever possible with adapter-driven scene status.
- Make `resolveHandrailColor()` depend on the same effective law result used by `computeHandrailCompliance()`.
- Expand international comparison logic so the Philippine baseline is derived from active scenario inputs, not just isBP220.
- Preserve compatibility with the live generic template path: in this pass, prefer synthesizing stairway-local UI/report data from canonical computation state rather than rewriting shared template contracts globally.
- Add an explicit decision note on whether the currently orphaned stairway-specific components stay deferred or become part of a later dedicated stairway runtime path; do not mix that runtime-path decision into this hardening pass by accident.
- Audit `ComparisonPanel` mapping for `verticalRise` and other dimension keys.

### Specific issues closed in this phase
- duplicated compliance truth
- BP 344 handrail-color mismatch
- oversimplified PH baseline in comparisons
- comparison panel drift

### Acceptance criteria
- No primary stair law threshold is duplicated in both computation and scene config for the same purpose.
- Handrail failure under BP 344 is reflected consistently in computation, scene color, and inspect/report UI.
- International comparison uses scenario-aware Philippine baselines.

### Verification
- targeted unit tests for handrail color/status consistency
- targeted unit tests for international delta baseline selection
- manual inspect of click popover + comparison panel for an accessible stair and an exit stair

---

## Phase 2 — Sanitize stair split inputs and derived geometry contracts

### Goal
Make stair topology valid before building geometry.

### Files
- `src/features/3d-lab/config/modules/08-vertical/stairway-types.ts`
- `src/features/3d-lab/config/modules/08-vertical/stairway-computation.ts`
- optionally new local file: `src/features/3d-lab/config/modules/08-vertical/stairway-geometry-contracts.ts`
- `src/features/3d-lab/config/modules/08-vertical/stairway-configurator.ts`
- `src/features/3d-lab/config/modules/08-vertical/stairway-geometry-l-shape.ts`
- `src/features/3d-lab/config/modules/08-vertical/stairway-geometry-u-shape.ts`

### Changes
- Clamp or validate `risersBeforeTurn` against `numRisers`.
- Define a local stair geometry contract for:
  - flight 1
  - landing(s)
  - flight 2
  - join planes / boundaries
- Explicitly distinguish:
  - actual stair total height/run used by geometry,
  - nominal values used for pedagogical overlays when needed.
- Ensure tolerance-mode geometry can still reconcile top-of-stair and landing endpoints.

### Recommended invariant
Every turning stair must guarantee:
- both flights have valid riser counts,
- join planes are explicit,
- landings are placed from edges/contracts, not midpoint convenience math.

### Acceptance criteria
- Invalid `risersBeforeTurn` input cannot create negative or degenerate second flights.
- Geometry builders consume a normalized split contract, not raw uncontrolled UI values.

### Verification
- unit tests for stair split normalization
- tests for L-shape and U-shape valid flight counts after edge-case parameter changes

---

## Phase 3 — Rebuild straight-run joins and endpoint-derived rail placement

### Goal
Fix the visible straight-stair geometry errors first.

### Files
- `src/features/3d-lab/config/modules/08-vertical/stairway-configurator.ts`
- optionally local helper file for join-plane math

### Changes
- Replace center-based bottom/top landing placement with edge/join-plane placement.
- Rebuild primary straight handrails from explicit start/end path endpoints instead of aggregate center formulas.
- Ensure top landing, base landing, riser/tread assembly, and handrails meet by boundary contract rather than overlapping convenience boxes.
- Reconcile tolerance-mode vertical accumulation with top landing / handrail endpoint logic.

### Specific issues closed in this phase
- straight stair endpoint clashes
- handrail endpoint overrun
- nominal-rise mismatch under tolerance mode

### Acceptance criteria
- Bottom landing does not overlap first tread/riser volume beyond allowed epsilon.
- Top landing does not overlap the final stair volume beyond allowed epsilon.
- Handrails terminate at valid path endpoints without obvious endpoint collisions.

### Verification
- straight-run geometry validation test
- manual visual QA with detail/overlay modes on and off

---

## Phase 4 — Rebuild L-shape and U-shape landing/flight joins from contracts

### Goal
Bring turning stair geometry up to the same contract-driven standard.

### Files
- `src/features/3d-lab/config/modules/08-vertical/stairway-geometry-l-shape.ts`
- `src/features/3d-lab/config/modules/08-vertical/stairway-geometry-u-shape.ts`
- optional shared local helper: `stairway-geometry-contracts.ts`

### Changes
- Fix U-shape landing center placement (`landingCenterX / 2`).
- Replace ad hoc landing placement formulas with boundary-derived placement.
- Decide and document landing-depth handling explicitly:
  - if it is a visual/topological minimum only, rename it clearly,
  - if it is treated as a reference requirement, isolate it from Philippine compliance truth.
- Review top landing dimensions in L/U builders, not just intermediate landing placement.
- Review outer and interior rail segments so they follow the new join contracts.

### Specific issues closed in this phase
- U-shape landing mis-centering
- ambiguous landing-depth semantics
- L/U join instability

### Acceptance criteria
- Intermediate landing placement is mathematically centered and topologically consistent.
- Turning builders no longer depend on independent center-based heuristics.
- L/U handrail runs remain visually and topologically coherent through the turn.

### Verification
- geometry tests for L-shape and U-shape joins
- manual visual QA for both turn types with multiple split positions

---

## Phase 5 — Add stairway-local geometry validation and deterministic overlays

### Goal
Catch overlap and nondeterminism problems automatically.

### Files
- new local file: `src/features/3d-lab/config/modules/08-vertical/stairway-geometry-validator.ts`
- `src/features/3d-lab/config/modules/08-vertical/stairway-types.ts` (if local types needed)
- `src/features/3d-lab/config/modules/08-vertical/stairway-configurator.ts`
- optional local RNG helper if extracted

### Changes
- Add a stairway-local geometry validator for generated `GeometryInstruction[]`.
- Start with stair-primitive-aware contract checks and conservative overlap checks for the actual generated boxes/cylinders/landings before considering any generic OBB/mesh validation abstraction.
- Start with dev/test-time validation; do not change shared renderer behavior globally.
- Add a local deterministic RNG path for evacuation dot generation.
- Define validator policies for:
  - structural vs structural touch
  - structural vs handrail collision
  - overlay elements allowed to intersect intentionally

### Acceptance criteria
- Stairway geometry can be validated without changing `CanvasWrapper`, `ParametricSceneRenderer`, or Dev Controls rendering flow.
- Evacuation overlay becomes reproducible for the same inputs.

### Verification
- geometry validator tests
- deterministic overlay test for evac dots
- dev-mode validation smoke pass on straight/L/U presets

---

## Phase 6 — Align interaction coverage and detail-mode honesty

### Goal
Make inspectability and detail controls truthful.

### Files
- `src/features/3d-lab/config/modules/08-vertical/stairway-click-targets.ts`
- `src/features/3d-lab/components/stairway/ClickInspectPopover.tsx`
- `src/features/3d-lab/config/modules/08-vertical/stairway-configurator.ts`
- `src/features/3d-lab/config/modules/08-vertical/stairway-nosing.ts`
- `src/features/3d-lab/components/stairway/HandrailDetailPanel.tsx`
- `src/features/3d-lab/components/stairway/NosingDetailPanel.tsx`

### Changes
- Audit every generated stairway geometry ID and classify it as:
  - inspectable,
  - intentionally non-interactive,
  - debug-only.
- Expand click-target registry for meaningful missing IDs or rename IDs to fit existing patterns.
- Decide per detail control:
  - fully wire it into geometry, or
  - hide/disable/de-scope it for now.
- Prioritize wiring for controls already sold to the user as active detail behavior.

### Acceptance criteria
- Click inspect covers every meaningful stair geometry artifact or there is an explicit exclusion list.
- Detail panels no longer imply geometry fidelity that does not exist.

### Verification
- click-target coverage test
- manual QA of detail-mode panels and popovers

---

## Phase 7 — Align egress semantics and stairway overlays

### Goal
Make egress outputs use one computation path and one wording model.

### Files
- `src/features/3d-lab/config/modules/08-vertical/stairway-egress.ts`
- `src/features/3d-lab/config/modules/08-vertical/stairway-configurator.ts`
- `src/features/3d-lab/components/stairway/EgressCalculatorPanel.tsx`
- `src/features/3d-lab/config/modules/08-vertical/stairway-computation.test.ts` or new dedicated egress tests

### Changes
- Remove the duplicate occupant-load calculation from `stairway-configurator.ts` evacuation visualization path.
- Reuse `computeEgressRequirements()` or a shared helper extracted from it.
- Clarify or rename `stairCountsAsExit` if it represents a narrower concept than full exit-stair compliance.
- Decide whether width-per-exit should be pedagogical (`providedExits`) or normative (`effectiveRequiredExits`), and expose both if needed.

### Acceptance criteria
- Evacuation overlay and egress panel derive from the same occupant-load logic.
- Wording clearly distinguishes capacity qualification from full stair compliance if both concepts remain.

### Verification
- egress unit tests
- manual QA on providedExits < requiredExits scenarios

---

## Phase 8 — Test expansion and regression hardening

### Goal
Add the coverage currently missing for a compliance visualizer.

### Test files to add or expand
- `src/features/3d-lab/config/modules/08-vertical/stairway-computation.test.ts`
- new: `src/features/3d-lab/config/modules/08-vertical/stairway-geometry.test.ts`
- new: `src/features/3d-lab/config/modules/08-vertical/stairway-click-targets.test.ts`
- new: `src/features/3d-lab/config/modules/08-vertical/stairway-egress.test.ts`
- optionally local validator tests split by straight / turning stairs

### Minimum automated coverage additions
1. BP 344 handrail status + color consistency
2. scenario-aware international comparison baseline
3. turn-split normalization
4. straight geometry join validation
5. U-shape intermediate landing centering
6. deterministic evacuation dots
7. click-target coverage completeness
8. tolerance-mode aggregate consistency for top landing / rail endpoints

### Acceptance criteria
- Geometry and interaction regressions are no longer invisible to tests.
- The most failure-prone stairway paths have explicit regression coverage.

---

## Pre-mortem (4 scenarios)

### Scenario 1 — We fix visible geometry bugs but keep duplicated truth
**Failure mode:** colors, popovers, and compliance cards still disagree in edge cases.
- **Mitigation:** complete Phase 1 before declaring the module fixed.

### Scenario 2 — We introduce shared framework changes unnecessarily
**Failure mode:** Site Development Controls or other active modules regress because stairway hardening leaked into shared viewport/rendering infrastructure.
- **Mitigation:** keep validator/adapters stairway-local; treat any shared change as a separately justified workstream.

### Scenario 3 — Turning stairs remain unstable under odd split values
**Failure mode:** straight stairs improve, but L/U shapes still break for edge-case `risersBeforeTurn` and low `numRisers` values.
- **Mitigation:** normalize split input before geometry generation and add turning-geometry tests.

### Scenario 4 — Detail mode continues to overpromise
**Failure mode:** users can still adjust controls that do not materially alter geometry, so trust remains low even after compliance fixes.
- **Mitigation:** explicitly choose wire-or-hide for every detail-only control.

---

## Expanded Verification Plan

### Required
- `bun run type-check`
- `bun run lint`
- targeted stairway tests (existing + new local test files)

### Manual QA checklist
At minimum, verify all of the following in the live 3D Lab stairway module:
- straight stair with default values
- straight stair with tolerance mode enabled
- accessible stair with BP 344 overlay
- exit stair with RA 9514 overlay
- BP 220 housing preset
- L-shape with left and right turns
- U-shape with multiple split values
- detail modes for nosing and handrail
- comparison mode
- evacuation mode
- click inspect on treads, risers, handrails, landings, width gap, BP 344 overlays, and detail-mode geometry

### Regression checks specifically for cross-module safety
Before merge, verify that **Site Development Controls** still behaves correctly in:
- module loading
- viewport shell rendering
- scene toolbar toggles
- shared viewport state interactions
- any build/type surface affected by shared type changes

If any shared template/type file is touched, also smoke-test **one unrelated template-driven parametric module** (recommended: unified-wall-configurator) to prove the stairway hardening did not accidentally regress the generic parametric runtime.

### Recommended verification order
1. Stairway unit tests
2. Stairway geometry/interaction tests
3. `bun run type-check`
4. `bun run lint`
5. Manual stairway QA
6. Manual Site Development Controls smoke test

---

## Other Opportunities Worth Capturing

### In-scope if low-cost during hardening
- Fix stale comments like “Phase 1: always straight” in `stairway-types.ts`
- Improve ComparisonPanel messaging so it shows which Philippine law baseline is active
- Add dev-only geometry debug overlays if useful for validator triage

### Better as follow-up work
- Extract a reusable geometry validator pattern for other parametric modules
- Audit other compliance-heavy modules for duplicated truth patterns
- Revisit international constants after SME validation
- Decide whether the currently unused stairway-specific components should be formally integrated into a dedicated stairway module path or pruned/deferred to reduce drift

---

## Definition of Done
The stairway hardening effort is complete when:
- compliance, color, inspect, and scene/report layers all derive from one canonical stairway truth model,
- handrail BP 344 behavior is consistent across computation and visualization,
- straight, L, and U stair geometry are contract-driven and free of known join bugs,
- turning-flight split edge cases are normalized safely,
- deterministic overlays replace nondeterministic stairway-only randomness,
- detail-mode controls are either fully truthful or explicitly de-scoped,
- geometry, interaction, and egress regressions are covered by tests,
- the stairway module passes manual QA,
- and Site Development Controls passes a smoke regression check with no unintended impact.

---

## Available Agent Types and Suggested Execution Lanes

### Recommended roles
- `executor` — main implementation owner
- `architect` — contract review for compliance adapter + geometry topology
- `critic` — challenge hidden risk and scope creep
- `verifier` — acceptance criteria + cross-module smoke validation
- `test-engineer` — design geometry/interaction regression tests
- `build-fixer` — only if lint/type/build breakages appear

### Suggested lane split if executed with `$team`
- **Lane A:** compliance truth unification + comparison/egress alignment
- **Lane B:** straight/L/U geometry contracts + validator + deterministic overlays
- **Lane C:** detail-view honesty + click-target coverage + tests + verification

### Dependency rule
Lane B and Lane C can start in parallel only after Phase 0 invariants are locked. Shared-type changes, if any, should be additive and reviewed before merge.

---

## Consensus Review Addendum

### Architect / Critic Review Outcome
- **Verdict:** APPROVE
- The chosen boundary remains correct: this should be a **stairway-local hardening pass first**, not a shared 3D framework rewrite.
- Shared shell/rendering/store edits remain exception-only and require explicit justification plus Site Development Controls regression checks.

### Strongest Steelman Antithesis
A strong counterargument is that this plan may still be too ambitious for a first repair pass: the team could patch the visible geometry defects, handrail-color mismatch, and U-shape landing bug directly, then observe whether the remaining duplicated-truth issues actually create user-facing regressions before adding join contracts, validation, or new local adapter layers. That approach would reduce near-term diff size and lower immediate regression risk.

### Tradeoff Tensions
1. **Targeted hotfix speed vs structural trustworthiness**
   - Smaller patches land faster.
   - But the stairway module already shows trust-breaking drift between computation, geometry, and teaching surfaces.
2. **Stairway-local containment vs future shared reuse**
   - Keeping validators/adapters local protects Site Development Controls now.
   - But it may defer later extraction if other parametric modules need the same pattern.
3. **Feature honesty vs feature breadth**
   - Hiding partially wired detail controls is safer.
   - Fully wiring them preserves the richer learning story, but costs more implementation and test effort.

### Synthesis
The best compromise is to keep this effort **stairway-local and structurally meaningful**:
- do enough architectural work to eliminate duplicated rule truth and geometry drift,
- avoid shared framework rewrites,
- and treat validator/debug capabilities as additive, local, and reversible.

### Suggested Reasoning Levels by Lane
- **Lane A — compliance truth + comparison/egress alignment:** high
- **Lane B — straight/L/U geometry contracts + validator + deterministic overlays:** high
- **Lane C — detail-mode honesty + click-target coverage + tests + verification:** medium to high

### Staffing Guidance — `ralph` Path
Use `ralph` if one owner should execute this hardening pass sequentially:
1. lock Phase 0 invariants,
2. land Phase 1 truth unification,
3. land Phases 2–5 topology/validator/determinism work,
4. land Phases 6–8 interaction + egress + tests,
5. run the full verification loop including Site Development Controls smoke tests.

Recommended staffing:
- `executor` as primary owner
- `architect` review before Phase 3 if the join-contract design changes materially
- `verifier` before completion

### Staffing Guidance — `team` Path
Use `team` if you want bounded parallelism after Phase 0 is approved:
- **Lane A:** compliance truth, comparison panel, egress semantics
- **Lane B:** straight/L/U geometry contracts, validator, deterministic overlays
- **Lane C:** click-target coverage, detail-mode honesty, tests, verification harness

Safe dependency order:
1. agree Phase 0 invariants,
2. start Lane A + Lane B,
3. start Lane C after the new stairway-local contracts stabilize enough for tests to target them,
4. finish with a verifier-led cross-module smoke pass.

### Launch Hints
- Sequential path: `$ralph <approved stairway hardening task>`
- Parallel path: `$team <approved stairway hardening task>` or `omx team` with this plan as the execution brief

### Concrete Team Verification Path
Whether execution runs through `ralph` or `team`, the final verification pass should prove:
1. stairway compliance truth no longer diverges between engine, scene, and inspect/report UI,
2. BP 344 handrail status and color are consistent,
3. straight, L, and U stairs pass geometry-join validation under representative presets,
4. `risersBeforeTurn` edge cases no longer create invalid turning stairs,
5. deterministic stairway overlays are reproducible,
6. click inspect coverage is complete or intentionally scoped,
7. detail-mode controls are truthful,
8. Site Development Controls still loads and behaves correctly after any shared-type touchpoint changes.







