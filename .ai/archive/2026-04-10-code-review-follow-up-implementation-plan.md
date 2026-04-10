# 2026-04-10 Code Review Follow-up Implementation Plan

## Source
- Review target: commit `1bf4b7ef` on `main`
- Trigger: `$code-review` follow-up request, then `$ralplan` review/improvement pass
- Desired outcome: a stronger execution plan that closes the review findings without introducing new camera-state regressions

---

## RALPLAN-DR Summary

### Principles
1. **Preserve the user mental model, not just the underlying math.** Perspective and Iso are technically projection/orientation combinations, but users experience them as named camera outcomes.
2. **Separate persistent selection state from one-shot camera commands.** Highlight state, re-triggerability, and animation triggers should not compete for the same field.
3. **Normalize camera semantics at one boundary.** Toolbar clicks, keyboard shortcuts, context menu actions, and any future command-palette actions should flow through the same canonical preset vocabulary.
4. **Fix the minimum viable surface area first.** Solve the blocking bugs in a small patch; explicitly defer broader camera-system cleanup unless needed for correctness.
5. **Verification must cover both interaction paths and state paths.** Test reduced-motion vs animated snapping, sticky vs transient actions, manual-orbit clearing behavior, and command replay.

### Decision Drivers
1. **SketchUp-aligned UX expectation:** the UI should coordinate projection mode and camera orientation for named view actions.
2. **Regression avoidance:** current camera state mixes trigger semantics and active-selection semantics, which is the root of the preset/highlight bug.
3. **Small, reviewable diff:** prefer an approach that fixes the current bug cluster without forcing a whole-camera-system rewrite.

### Viable Options

#### Option A - Preset-centric camera actions with separate trigger vs selection state **(recommended)**
- Treat **Persp** and **Iso** as real named camera presets.
- Keep projection mapping inside the snap bridge.
- Split persistent selected preset state from transient snap-request state.
- Add an explicit replayable command token so the same preset can be fired repeatedly without destabilizing highlight state.
- **Pros:** matches user expectation, fixes the active-state bug cleanly, supports same-button retriggering, keeps logic coherent.
- **Cons:** requires a small store-shape refactor and careful migration of all callers.

#### Option B - Keep current store shape, but make the bridge react to `projectionMode` changes too
- Leave buttons partly as toggles.
- Add bridge logic that infers camera orientation when projection mode changes.
- **Pros:** smaller API surface change.
- **Cons:** more implicit behavior, harder to reason about, weaker alignment with toolbar semantics, still leaves selection/trigger coupling fragile.

#### Option C - Full camera orchestration unification across all 3D Lab scenes
- Introduce a shared camera controller abstraction used by `SceneConfig`, `DevControlsCanvas`, shortcuts, and shell UI.
- **Pros:** best long-term architecture.
- **Cons:** too large for the current follow-up patch, higher regression risk, unnecessary for closing the reviewed issues.

### Chosen Direction
Adopt **Option A**.

### Why Chosen
- It directly matches the SketchUp-style UX the user described.
- It solves the hidden state-model problem behind issue #4 instead of patching symptoms.
- It keeps the implementation small enough to fit a single focused bug-fix pass.

### Consequences
- The plan must explicitly add a small store/state-model refactor step before UI tweaks.
- The implementation must normalize `iso` aliases and distinguish persistent presets from action-style commands like reset/zoom.
- Reduced-motion and animated snap paths must share the same semantic outcomes.

---

## ADR

### Decision
Implement a **preset-centric camera interaction model** for the 3D Lab follow-up patch:
- **Perspective** and **Iso** will be named camera outcomes, not projection-only toggles.
- The system will use **separate state for persistent selected preset vs transient snap request**.
- Projection mode will remain technically separate, but named presets will set the expected projection implicitly.
- Transient commands will use a replayable command identity so the same command can fire twice without depending on `null -> value -> null` cycles.

### Drivers
- SketchUp-aligned UX expectation
- Need for stable active-state rendering
- Need to preserve same-button retriggering
- Desire to keep the patch bounded and reviewable

### Alternatives Considered
- Projection-reactive bridge only
- Full camera-system rewrite

### Strongest Steelman Antithesis
A critic of the chosen approach would argue that the bug is being over-architected: the current problem could be solved with a smaller change by leaving the store shape alone, teaching the bridge to react to projection changes, and accepting that toolbar highlighting is a lightweight affordance rather than a durable camera contract. That path minimizes state churn and may reduce regression risk in a shared shell used across multiple 3D Lab scenes.

### Synthesis / Refinement
The best synthesis is to keep the architectural separation, but limit it to the minimum state contract needed for this bug cluster:
- do **not** rewrite the whole camera system,
- do introduce **persistent selected preset** and **transient command** as distinct concepts,
- do keep the canonical preset vocabulary small and explicit,
- do defer broader unification of all camera orchestration until after this patch lands cleanly.

### Why This ADR Matters
Without this separation, the implementation will keep fighting the same contradiction:
- the UI wants persistent camera-state feedback,
- the bridge wants to clear state so the same action can be triggered again.

### Follow-ups (not required for this patch)
- Two-point perspective support for stronger SketchUp parity
- User preference for default iso corner (`iso-ne` vs another canonical iso)
- Shared camera-controller abstraction for all 3D Lab scenes
- Focused pd1096 regression coverage for new `setbackOverrides` logic introduced in the reviewed commit

---

## Scope Guard

### In scope for this patch
1. Remove transient `.tmp-comment-checker` artifacts and add ignore protection.
2. Fix BHL meter display accuracy.
3. Make **Persp** and **Iso** behave as coordinated camera outcomes.
4. Fix persistent active-state feedback for left/right/rear and other named presets.
5. Normalize related shortcut/snap entry points so they remain behaviorally consistent.
6. Define explicit semantics for transient commands (`reset`, `zoom-to-fit`, `zoom-in`, `zoom-out`) versus sticky selected views.

### Explicitly out of scope
- Full redesign of all 3D Lab camera behaviors
- Two-point perspective support
- Command palette feature expansion beyond consistency checks
- Converting left/right/rear into orthographic elevations unless product explicitly decides to do so now
- Full shared-camera abstraction rollout across every scene template

---

## Hidden Edge Cases the Original Plan Was Missing

1. **Same-button retriggering vs sticky active state**
   - Current logic clears `activeCameraPreset` to allow re-clicking the same button.
   - If the plan makes presets sticky for highlighting without introducing a separate trigger channel, same-button re-triggering will break.
   - The implementation plan must solve this with separate persistent-selection and transient-command state.

2. **Alias normalization (`iso` vs `iso-ne`)**
   - Keyboard shortcut `3` currently calls `snapToPreset('iso')`.
   - Toolbar uses `iso-ne`, `iso-nw`, `iso-se`, `iso-sw`, and a distinct `iso` concept.
   - The plan should specify one canonical internal representation and one normalization boundary.

3. **Transient commands vs persistent presets**
   - `reset`, `zoom-in`, `zoom-out`, and likely `zoom-to-fit` should not remain highlighted like a selected named view.
   - The plan should explicitly distinguish them from `perspective`, `top`, `front`, `left`, `right`, `rear`, and iso presets.

4. **Reduced-motion path parity**
   - The bridge has separate instant-snap and animated-snap paths.
   - The plan must require that both paths set the same final projection mode, selected preset state, and `manualOrbit` behavior.

5. **Manual orbit clearing semantics**
   - The plan should specify exactly when a named preset is considered invalidated.
   - Recommendation: clear sticky preset highlighting on real user orbit, not on pan, not on zoom.

6. **Cross-entry-point consistency**
   - Toolbar, keyboard shortcuts, context menu, and any future command palette hook should all route through the same camera command surface.
   - If only the toolbar is fixed, shortcuts can still produce stale or inconsistent behavior.

7. **DevControls vs shared 3D Lab divergence**
   - `DevControlsCanvas.tsx` and `SceneConfig.tsx` now contain similar but not identical orbit/control logic.
   - The plan should explicitly say whether this patch updates both or limits the behavior change to DevControls while auditing the shared path for regressions.

8. **BHL label when floor height changes under a custom override**
   - The label fix must cover both computed BHL and custom override BHL while the user edits floor height.
   - The plan should state this explicitly.

9. **`.gitignore` gap**
   - The current `.gitignore` does not ignore `.tmp-comment-checker/`.
   - This should be explicit, not optional.

10. **Reset vs selected-view semantics**
    - `reset` is a transient command, but its final camera outcome is a canonical perspective working view.
    - The plan should explicitly decide whether the resulting sticky selected preset becomes `perspective` while the Reset button itself remains non-sticky.

11. **Zoom commands vs selected-view semantics**
    - `zoom-to-fit`, `zoom-in`, and `zoom-out` are commands, not named views.
    - The plan should specify whether they preserve the currently selected named view when they do not change orientation.

12. **Animation interruption / latest-command wins**
    - The plan should define what happens if a second snap command fires while a previous snap animation is still running.
    - Recommendation: latest command wins, in-flight animation is cancelled or superseded, and manual orbit should also cancel any in-flight snap.

---

## Revised Execution Plan

## Phase 0 - Preflight decisions and state-model contract

### Goal
Lock the minimum camera-state contract before changing UI handlers.

### Files to inspect before editing
- `src/features/3d-lab/stores/useViewportShellStore.ts`
- `src/features/3d-lab/components/shell/CameraNavigationBar.tsx`
- `src/features/3d-lab/DevControlsModule/canvas/DevControlsCanvas.tsx`
- `src/features/3d-lab/components/rendering/SceneConfig.tsx`
- `src/features/3d-lab/hooks/useViewportShortcuts.ts`
- `src/features/3d-lab/components/shell/ViewportContextMenu.tsx`
- `src/features/3d-lab/hooks/useCameraSnap.ts`

### Plan decisions to document before coding
1. **Canonical persistent preset IDs**
   - `perspective`, `top`, `front`, `left`, `right`, `rear`, `iso-ne`, `iso-nw`, `iso-se`, `iso-sw`
2. **Canonical transient commands**
   - `reset`, `zoom-to-fit`, `zoom-in`, `zoom-out`
3. **Alias normalization**
   - map `iso` -> canonical default iso preset (`iso-ne` unless product chooses another)
4. **Projection policy**
   - `perspective` => perspective
   - canonical iso preset => orthographic
   - `top/front` => orthographic and should not regress
   - `left/right/rear` => perspective for this patch unless product explicitly re-decides
5. **Command/result semantics**
   - `reset` is a transient command whose resulting selected preset becomes `perspective`
   - `zoom-to-fit`, `zoom-in`, and `zoom-out` preserve the currently selected named view when they only change framing and not orientation
6. **Animation interruption policy**
   - latest camera command wins
   - a new snap or a real user orbit cancels any in-flight animation
7. **State ownership**
   - selected preset state is authoritative for sticky highlighting
   - transient command state is authoritative for replayable execution

### Default if no further product decision arrives
- Ship this patch with:
  - `perspective` => perspective
  - `iso-*`, `top`, `front` => orthographic
  - `left`, `right`, `rear` => perspective
- Treat that as the implementation default rather than leaving view semantics open-ended during execution.

### Acceptance criteria
- The revised plan names the state separation explicitly.
- The revised plan avoids ambiguous "just keep the active preset around" language.
- The revised plan is explicit about reset/zoom result semantics.

---

## Phase 1 - Remove transient review-tool artifacts

### Files
- `.tmp-comment-checker/comment-checker.zip`
- `.tmp-comment-checker/extract/comment-checker.exe`
- `.tmp-comment-checker/extract/README.md`
- `.tmp-comment-checker/extract/LICENSE`
- `.gitignore`

### Changes
- Delete the committed `.tmp-comment-checker/` payload.
- Add an explicit `.tmp-comment-checker/` ignore rule.
- Confirm there are no references to the tool in product code.

### Acceptance criteria
- `git ls-files .tmp-comment-checker` returns nothing.
- `.gitignore` prevents future accidental tracking.

### Verification
- `git ls-files .tmp-comment-checker`
- `rg -n ".tmp-comment-checker|comment-checker" .`

---

## Phase 2 - Fix BHL display accuracy

### Files
- `src/features/3d-lab/DevControlsModule/dashboard/splits/BhlControls.tsx`
- `src/features/3d-lab/DevControlsModule/stores/useDevControlsStore.ts`

### Changes
- Remove the hardcoded `* 3` meter display path.
- Use `useDevControlsStore().result.bhlStoreys` as the authoritative current BHL storey source for display and warning semantics.
- Derive displayed meters from the current `useDevControlsStore().building.floorHeight`, not from a hardcoded multiplier.
- Keep `bhlOverride` as the user-input override source, but let the rendered "current BHL" path flow through the recomputed store result rather than re-deriving the governing value locally in `BhlControls`.
- Make one current BHL calculation path the truth source for displayed meters, warning logic, and override-state styling.
- Ensure label output reflects the active storey value plus the current floor height.
- Cover both computed and custom override display states without splitting display math from warning math.
- Preserve existing rounding/formatting behavior unless a formatting mismatch is part of the bug.
- Keep warning/override styling intact.

### Acceptance criteria
- The displayed meter value changes immediately when floor height changes.
- Presets with non-3.0m floor height display correct BHL meters.
- `result.bhlStoreys` remains the authoritative current-storey source in the display path.
- Display value, warnings, and override styling all derive from the same current BHL value.
- No hardcoded `* 3` remains in this path.

### Verification
- Manual QA with at least:
  - default preset (`3.0m`)
  - `C-1 Commercial` preset (`3.5m`)
  - custom BHL override while changing floor height
- `bun run type-check`

---

## Phase 3 - Refactor camera store semantics before UI behavior changes

### Files
- `src/features/3d-lab/stores/useViewportShellStore.ts`

### Goal
Separate:
1. **persistent selected camera preset** (for highlighting / current named view)
2. **transient camera command** (for triggering snaps and same-button replays)
3. **command identity / replay token** so the same command can fire twice without mutating the selected preset away from the user-visible current view

### Changes
- Introduce explicit terminology in the plan and implementation.
- Keep the trigger channel replayable.
- Preserve named-view highlighting until a real invalidation event occurs.
- Ensure action-style commands do not pretend to be sticky selected views.
- Use an explicit replayable command shape instead of relying on `null -> preset -> null` cycles as the only trigger mechanism.

### Recommended minimum contract
The patch does not need a full camera rewrite, but it should converge on a shape equivalent to:
- `selectedPresetId` -> persistent named view for highlighting/state
- `cameraCommand` -> transient replayable request with a unique command id/token

This keeps handoff concrete while still allowing implementation flexibility.

### Canonical command contract
The plan should stop at semantic requirements, but those requirements should be explicit enough that all callers converge on the same behavior.

Minimum semantic shape:
- `selectedPresetId`: `perspective | top | front | left | right | rear | iso-ne | iso-nw | iso-se | iso-sw | null`
- `cameraCommand.type`: `snap-to-preset | reset | zoom-to-fit | zoom-in | zoom-out`
- `cameraCommand.id`: unique replay token so the same command can be issued twice
- `cameraCommand.presetId`: canonical preset only, present only for `snap-to-preset`
- `cameraCommand.source`: `toolbar | shortcut | context-menu | command-palette`

The implementation does not need to match these field names exactly, but it must preserve these semantics exactly.

### Source-of-truth ownership
- UI surfaces dispatch commands only.
- Alias normalization happens before the command reaches the execution boundary.
- The snap bridge is the semantic boundary that resolves a command into final projection, final camera orientation, final selected preset, and `manualOrbit` clearing.
- UI components must not infer or persist final selected-preset state on their own after dispatch.

### Command outcome semantics
- `snap-to-preset(perspective)` => canonical perspective projection, canonical perspective working orientation, `manualOrbit` cleared, resulting `selectedPresetId = perspective`
- `snap-to-preset(iso-*)` => orthographic projection, requested canonical iso orientation, `manualOrbit` cleared, resulting `selectedPresetId = requested iso-*`
- `snap-to-preset(top|front)` => preserve current intended orthographic behavior, `manualOrbit` cleared, resulting `selectedPresetId = requested preset`
- `snap-to-preset(left|right|rear)` => preserve current intended perspective behavior for this patch, `manualOrbit` cleared, resulting `selectedPresetId = requested preset`
- `reset` => canonical perspective projection, canonical perspective orientation, canonical target, canonical framing/distance, `manualOrbit` cleared, resulting `selectedPresetId = perspective`
- `zoom-to-fit`, `zoom-in`, `zoom-out` => transient framing commands only; they must not become sticky selected views and must preserve the current selected preset when orientation is unchanged

### Invalidation and supersession rules
- Sticky named-view highlighting clears only on meaningful user-driven orbit rotation.
- It does not clear on pan, zoom, or programmatic framing changes.
- It does not clear during an in-flight snap animation unless the user interrupts with real orbit input.
- The implementation must use a small rotation threshold so pointer jitter or control noise does not clear the selection.
- Latest command wins: stale animation completion must not write final state after a newer command has superseded it.

### Why this phase must come before toolbar edits
If toolbar behavior is changed first, the system still lacks a clean place to store:
- active selected view,
- one-shot action intent,
- alias normalization,
- same-button replay semantics,
- reset/zoom result semantics.

### Acceptance criteria
- The plan documents how same-button replay still works.
- The plan documents which state is authoritative for highlighting.
- The plan documents which state is authoritative for one-shot command dispatch.

---

## Phase 4 - Make Perspective and Iso real coordinated camera outcomes

### Primary files
- `src/features/3d-lab/components/shell/CameraNavigationBar.tsx`
- `src/features/3d-lab/DevControlsModule/canvas/DevControlsCanvas.tsx`
- `src/features/3d-lab/stores/useViewportShellStore.ts`

### Changes

#### 4A. Toolbar behavior
- `Persp` dispatches a real snap command for the canonical perspective preset.
- `Iso` dispatches a real snap command for the canonical iso preset.
- These are no longer projection-only toggles.

#### 4B. Snap bridge behavior
- The bridge owns preset -> projection mapping.
- The bridge owns command -> final-state mapping as well; callers must not reconstruct the resulting selected preset themselves.
- Named presets set both orientation and projection expectations where the product expects a composite outcome.
- Reduced-motion and animated paths end in the same state.

#### 4C. Preset lifecycle
- Named preset selection clears `manualOrbit`.
- Manual orbit invalidates sticky preset highlighting.
- Panning alone should not invalidate sticky preset highlighting.
- Orbit invalidation should require real user rotation past a small threshold, not incidental pointer jitter.
- `reset` should finish in the existing canonical perspective reset baseline even though Reset itself is not a sticky view button.
- `reset` should also normalize target/framing, not just projection and orientation.
- `zoom-to-fit`, `zoom-in`, and `zoom-out` should not overwrite the selected named view when they do not change orientation.

### Acceptance criteria
- Clicking **Persp** from top/rear/left returns to a usable perspective working view.
- Clicking **Iso** from a random orientation lands in a canonical iso orientation and orthographic projection.
- Same-button re-click still works.
- If a second snap is issued during animation, the latest command wins cleanly.

### Shared-path decision gate
- Preferred: normalize both the DevControls bridge and the shared `useCameraSnap` path when the semantic change is genuinely shared and the diff stays low risk.
- If shared-path regression risk becomes non-trivial, land the behavior fix first in the reviewed failing surface (`DevControlsCanvas.tsx`) and restrict the shared path to trivial alias/contract cleanup or audit-only confirmation.
- Do not half-apply semantic changes silently across `DevControlsCanvas.tsx` and `useCameraSnap.ts`; if only one path is changed, document the follow-up explicitly in execution notes.

---

## Phase 5 - Normalize all camera entry points

### Files
- `src/features/3d-lab/hooks/useViewportShortcuts.ts`
- `src/features/3d-lab/components/shell/ViewportContextMenu.tsx`
- `src/features/3d-lab/hooks/useCameraSnap.ts`
- `src/features/3d-lab/components/shell/CommandPalette.tsx` (audit only unless fixing is trivial)

### Changes
- Route keyboard shortcut `3` through the same canonical Iso behavior as the toolbar.
- Confirm `reset` and `zoom-to-fit` semantics remain consistent.
- Audit context menu for camera behavior consistency.
- Audit command-palette defaults so the documented actions do not drift further from actual behavior.
- Normalize all entry points against the same command/result contract rather than letting shortcuts keep bespoke alias behavior.
- No downstream camera executor should receive raw aliases like `iso`; aliases must be normalized before entering the execution boundary.

### Acceptance criteria
- Toolbar and shortcut flows produce the same camera outcome.
- No leftover `iso` alias branch causes divergent behavior.

---

## Phase 6 - Restore stable active-state feedback for named views

### Files
- `src/features/3d-lab/components/shell/CameraNavigationBar.tsx`
- `src/features/3d-lab/DevControlsModule/canvas/DevControlsCanvas.tsx`
- `src/features/3d-lab/stores/useViewportShellStore.ts`

### Changes
- Use the canonical persistent selected-preset state for button highlighting.
- Ensure `left`, `right`, and `rear` can stay active after snapping.
- Ensure transient commands like reset/zoom do not stay highlighted.
- Ensure manual orbit clears named-view highlight consistently.

### Acceptance criteria
- `left/right/rear` stay highlighted after selection.
- `manualOrbit` clears named-view highlight.
- `persp` and `iso` highlight correctly after the refactor.
- `reset` flashes as an action but leaves `perspective` as the resulting selected view.
- `zoom` commands do not incorrectly become sticky highlighted actions.

---

## Pre-mortem (4 scenarios)

### Scenario 1 - Same-button replay silently breaks
**Failure mode:** after making selected presets sticky, clicking the same button twice no longer triggers a new snap.
- **Mitigation:** make replay semantics explicit in the state model; do not rely on a single nullable preset field.

### Scenario 2 - Toolbar is fixed but shortcuts remain inconsistent
**Failure mode:** clicking toolbar **Iso** does one thing, pressing `3` does another.
- **Mitigation:** normalize all camera entry points in the same patch.

### Scenario 3 - Reduced-motion users see different semantics from animated users
**Failure mode:** instant-snap path does not update highlight/projection/manualOrbit the same way animated path does.
- **Mitigation:** verify both paths explicitly in the plan and QA checklist.

### Scenario 4 - Reset/zoom commands corrupt selected-view state
**Failure mode:** a transient command like `reset` or `zoom-to-fit` clears or overwrites the wrong sticky selected preset, making the toolbar look wrong after a valid camera action.
- **Mitigation:** define command/result semantics explicitly before implementation and test them in manual QA.

---

## Other Opportunities Worth Capturing

### Good candidates for later follow-up
1. **Two-point perspective support** for stronger SketchUp parity.
2. **Default iso corner preference** if users care about NE vs NW vs SE vs SW as the canonical Iso button result.
3. **Shared camera orchestration abstraction** to reduce duplication between `SceneConfig.tsx` and `DevControlsCanvas.tsx`.
4. **Command palette wiring audit** because the default action list currently looks documentation-like and may drift from real camera behavior.
5. **Focused regression tests for new `setbackOverrides` paths** in `src/lib/pd1096`, since the original reviewed commit expanded computation behavior without dedicated override-specific coverage.

### Not recommended in this patch
- Broad camera-system cleanup beyond what is necessary to fix state semantics and entry-point consistency.

---

## Verification Plan

### Required
- `bun run type-check`
- `bun test src/lib/pd1096/__tests__/computationEngine.test.ts`

### Strongly recommended
- `bun run lint`

### Manual QA checklist
In `/dashboard/3d-lab` and `/test-3d` where applicable:
- Click **Persp** from top/front/rear/random orbit -> lands in canonical perspective working view.
- Click **Iso** from random orbit -> lands in canonical iso orientation and orthographic projection.
- Press keyboard shortcut `3` -> same result as clicking **Iso**.
- Click **Top** / **Front** -> current intended behavior remains stable in this patch.
- Click **Left**, **Right**, **Rear** -> corresponding button remains active until real orbit.
- Pan only -> sticky named-view highlight remains.
- Orbit manually -> sticky named-view highlight clears.
- Trigger **Reset** -> camera resets, Reset flashes as an action, and the resulting selected named view is `perspective`.
- Trigger **Zoom to Fit** -> view fits correctly, Zoom to Fit does not become a sticky selected view, and the prior named view selection is preserved when orientation is unchanged.
- Enable reduced motion and repeat at least **Persp**, **Iso**, and **Left**.
- Issue a second snap while the first is animating -> latest command wins without leaving stale highlight state behind.
- Adjust floor height -> BHL meter label updates correctly for both computed and custom BHL states.

### Required automated regressions if a lightweight test surface exists
If viewport store or snap helper tests already exist in this module tree, this patch should add both of these regressions there; otherwise, add the narrowest new test surface rather than leaving them manual-only:
- same-button replay of a named preset still dispatches and resolves correctly
- raw `iso` input normalizes to the canonical internal iso preset before execution

Those two cases are central to the chosen design and should be treated as required, not optional, whenever the repo already has a low-friction place to add them.

### Still optional
- state tests for manual-orbit clearing logic
- if a lightweight BHL selector/formatter seam exists, add a regression for floor-height changes under a custom BHL override so display and warning values stay aligned
- helper tests if BHL formatting is extracted

### Optional execution aid
If camera-state debugging becomes ambiguous during implementation, temporary dev-only instrumentation is acceptable while the patch is in flight:
- latest command id/token
- selected preset
- projection mode
- `manualOrbit`
- invalidation source

Remove or disable any temporary instrumentation before completion.

---

## Risks / Watchouts
- Do not patch the toolbar alone and assume the camera model is fixed.
- Do not preserve active-state highlighting by simply stopping the bridge from clearing state; that will likely break same-button replay.
- Do not leave `iso` as an ambiguous alias in some entry points and a canonical preset in others.
- Be explicit about whether left/right/rear are perspective or orthographic in this patch.
- Keep the diff small and centered on semantics, not aesthetics.
- Do not expand this patch into toolbar redesign, animation-polish work, icon changes, or broader camera-controller cleanup.

---

## Definition of Done
This follow-up is complete when:
- `.tmp-comment-checker/` is removed and ignored,
- BHL meter output matches the real floor height,
- **Persp** and **Iso** both orient the camera and set the expected projection mode,
- sticky preset highlighting works for named views without breaking same-button retriggering,
- shortcut `3` matches toolbar **Iso** behavior,
- reduced-motion and animated paths behave the same semantically,
- no caller past the normalization boundary dispatches ambiguous alias presets,
- typecheck and pd1096 tests pass,
- manual camera-toolbar QA passes in the 3D Lab.

---

## Available Agent Types and Execution Handoff Guidance

### Recommended agent roster for this plan
- `executor` - implementation owner for the patch
- `architect` - camera-state contract review before editing store shape
- `critic` - plan-quality and edge-case challenge
- `verifier` - completion evidence and acceptance-criteria validation
- `test-engineer` - test strategy and regression coverage additions if a lightweight surface exists
- `build-fixer` - only if lint/type/build failures appear during execution
- `writer` - optional, for final documentation/changelog wording if the camera behavior is user-facing enough to note

### Suggested reasoning levels by lane
- Camera-state contract / preset lifecycle: **high**
- BHL display fix: **medium**
- Repo hygiene artifact removal: **low**
- Verification / regression sweep: **high**

### Staffing guidance - `ralph` path
Use `ralph` when one owner should execute the sequence end-to-end:
1. Remove `.tmp-comment-checker` artifacts and add ignore protection.
2. Fix BHL display accuracy.
3. Refactor camera state model.
4. Update toolbar + shortcuts + bridge semantics.
5. Run verification loop until acceptance criteria are satisfied.

Recommended lane owner:
- `executor` as primary implementer
- `verifier` pass before completion

### Staffing guidance - `team` path
Use `team` when you want bounded parallelism after the state-model contract is agreed.

Suggested team split:
- **Lane A:** repo hygiene + BHL display fix
- **Lane B:** viewport store contract + toolbar semantics + bridge behavior
- **Lane C:** verification, QA checklist execution, and regression audit of shortcuts/context menu/reduced-motion behavior

#### Safe dependency order
- Lane B should establish the state-model contract first.
- Lane A can run in parallel.
- Lane C should validate only after A+B land.

### Launch hints
- Sequential owner path: `$ralph <approved task>`
- Coordinated parallel path: `$team <approved task>` or `omx team` with the approved plan as the task brief

### Concrete team verification path
Whether using `ralph` or `team`, the verification pass should prove:
1. transient artifacts are removed and ignored,
2. BHL label accuracy is correct for variable floor heights,
3. Perspective/Iso semantics are correct from toolbar and shortcut entry points,
4. sticky named-view highlighting survives selection but clears on real orbit,
5. same-button retriggering still works,
6. reduced-motion and animated paths converge to the same semantic result.


