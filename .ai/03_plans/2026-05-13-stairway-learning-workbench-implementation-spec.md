# Stairway Learning Workbench — Implementation Specification

Date: 2026-05-13
Status: implementation-ready planning, no code changes yet
Depends on: `2026-05-13-stairway-configurator-3d-learning-ux-research-plan.md`
Target route: `/dashboard/3d-lab/stairway-configurator`

## 1. Product decision

Build a dedicated Stairway Learning Workbench inside the existing 3D Lab shell. Do not keep the route on the generic parametric two-sidebar experience.

Preserve:
- live geometry updates from sliders/toggles;
- live violation/compliance updates;
- parallel law evaluation;
- 3D viewport as the learning anchor;
- current computation and geometry modules unless a later code audit proves a specific defect.

Change:
- information architecture;
- panel layout;
- control grouping;
- compliance presentation;
- click inspection location;
- learning mode sequencing.

## 2. Non-negotiable implementation constraints

1. Keep `ViewportShell` as the page container.
2. Keep `CanvasWrapper` and `ParametricSceneRenderer` for rendering the stair geometry.
3. Add a stairway-specific path in `useTemplateContent.tsx`, similar to the existing `site-development-controls` and `unified-wall-configurator` special paths.
4. Do not create a separate 3D Lab page shell.
5. Do not add more stairway-specific UI to `ParametricSceneRenderer.tsx`.
6. Do not move legal/compliance logic into React panel components.
7. Do not introduce source-backed claims until source metadata is complete.
8. Do not present international/IBC/ADA/comfort values as Philippine legal requirements.

## 3. Target desktop layout

Use `ViewportShell` with a stairway-specific `shellConfig`:

```ts
shellConfig: {
  ...shellConfig,
  leftSidebar: {
    width: 400,
    title: 'Stairway Workbench',
    mobileTabLabel: 'Controls',
  },
  rightSidebar: {
    width: 400,
    title: 'Diagnosis',
    mobileTabLabel: 'Inspect',
  },
  statusBar: true,
}
```

Initial target widths:
- left sidebar: 400px
- right sidebar: 400px
- collapse handles unchanged
- viewport fills remaining width

Fallback if 400/400 leaves viewport too narrow on common laptop widths:
- left: 380px
- right: 380px

Do not reduce below 360px unless the right panel becomes a bottom inspector.

## 4. Target mobile layout

Use existing `ViewportShell` mobile bottom sheet behavior. Do not invent a new mobile shell.

Mobile tabs:
1. `Inspect`
2. `Controls`
3. `Compliance`
4. `Source`

Phase 1 can ship with two tabs only if needed:
1. `Inspect`
2. `Controls`

Acceptance:
- model remains touchable;
- bottom sheet does not permanently hide the stair;
- every current control remains reachable;
- compliance is reachable in no more than two taps from the viewport.

## 5. Component map

Create these components under:

`src/features/3d-lab/components/stairway/`

### Phase 1 required

1. `StairwayWorkbenchLeftPanel.tsx`
   - owns scenario and control grouping.
   - may internally reuse `GenericControlPanel` at first, but should not show all groups equally.

2. `StairwayWorkbenchRightPanel.tsx`
   - reads `params` from the module store.
   - computes `computeStairState(params)`.
   - shows overall status, active laws, selected element summary, critical issues.

3. `StairwayStatusBar.tsx`
   - compact status for riser, tread, width, handrail, headroom, vertical rise/egress.

4. `StairwayLawChips.tsx`
   - stable visual chips for PD 1096, BP 220, BP 344, RA 9514.

5. `StairwayDimensionCard.tsx`
   - one card per dimension.
   - shows current value, status, applicable law rows, correction hint.

### Phase 2 required

6. `StairwayModeTabs.tsx`
   - Learn / Diagnose / Compare / Sandbox / Challenge.

7. `StairwayFixCard.tsx`
   - fix-oriented violation card.

8. `StairwaySelectedElementInspector.tsx`
   - replaces viewport popover behavior in the right panel.

9. `StairwayLearningPrompt.tsx`
   - stage-specific instruction/checkpoint text.

10. `stairway-panel-model.ts`
   - pure adapter functions that transform `ComputedStairState` into panel-friendly data.
   - no React imports.

## 6. `useTemplateContent.tsx` branch

Add before the standard parametric path:

```tsx
if (cfg.id === 'stairway-configurator') {
  return {
    shellConfig: {
      ...shellConfig,
      leftSidebar: { width: 400, title: 'Stairway Workbench', mobileTabLabel: 'Controls' },
      rightSidebar: { width: 400, title: 'Diagnosis', mobileTabLabel: 'Inspect' },
      statusBar: true,
    },
    capabilities,
    content: {
      canvasContent: canvasWrapper(
        <ParametricSceneRenderer
          config={cfg}
          useStore={useStore}
          hideOverlays
        />,
      ),
      leftSidebarContent: <StairwayWorkbenchLeftPanel config={cfg} useStore={useStore} />,
      rightSidebarContent: <StairwayWorkbenchRightPanel config={cfg} useStore={useStore} />,
      statusBarContent: <StairwayStatusBar useStore={useStore} />,
    },
  }
}
```

Phase 1 may keep `ClickInspectPopover` temporarily. Phase 3 must remove it from the generic renderer.

## 7. Left panel exact structure

### Corrected default first-load state: zero decision fatigue

The default left sidebar must not ask the learner to choose a stair type, scenario, law set, project type, accessibility condition, occupancy condition, or egress condition.

The module owns the initial instructional context. The learner should see a fixed context label, then manipulate only the dimensions needed to understand cause and effect.

Open by default:
1. Fixed lesson/context label, e.g. `Standard straight stair · baseline compliance selected`.
2. Core dimension controls only.

Visible controls only:
- `riserHeight`
- `treadDepth`
- `stairWidth`
- `handrailHeight`

Visible actions only:
- `Safe preset` / reset to baseline
- `More` / `Study cases` modal trigger

Do not show in the default sidebar:
- `projectType`
- `isAccessibleRoute`
- `isExitStair`
- `isHighOccupancy`
- `stairType`
- `turnDirection`
- `risersBeforeTurn`
- `headroom`
- `numRisers`
- `primaryUsers`
- `floorArea`
- `occupancyType`
- law-set selectors
- scenario dropdowns
- active law maps that require interpretation before manipulation
- explanatory teaching paragraphs

### Where removed controls go

Stair type, required-exit status, BP 220 housing, accessibility, occupancy, headroom, number of risers, landings, egress calculators, detail studies, and comparison tools remain available, but not as default sidebar decisions.

Place them in:
- guided lesson cards;
- click-triggered modals;
- explicit challenge prompts;
- later advanced study flows;
- internal presets selected by the lesson.

### Default sidebar content order

1. Context card: one fixed sentence, no dropdown.
2. Riser height slider.
3. Tread depth slider.
4. Stair width slider.
5. Handrail height slider.
6. Safe preset button.
7. More / Study cases button.

### Right panel responsibility

The right panel must preserve the existing compliance-report model and redesign it, not replace it.

Default right panel content:
- four visible law categories: RA 9514, BP 344, PD 1096, BP 220;
- compact status badge per law category;
- compact per-dimension checks inside each law category/card;
- active violations highlighted in-place inside the relevant law card;
- conflict/violation summary behavior preserved from the current module;
- click-to-open modals for source detail, explanation, and correction guidance.

The learner changes dimensions on the left and reads consequences inside the existing four-law right-sidebar structure. The learner does not configure the legal universe before learning.

Default: collapsed.

## 8. Right panel exact structure

### Block 1: Overall diagnosis

Shows:
- status: `Passing`, `Needs Attention`, or `Conflict`
- active issue count
- active conflict count
- active law chips
- short learner message

Message examples:
- Passing: “This stair currently satisfies the active legal checks. Review the comfort and source notes before treating it as final.”
- Needs attention: “One or more active dimensions fail the selected scenario. Fix the highest-severity issue first.”
- Conflict: “Two or more laws give different constraints. Identify which project condition controls the design.”

### Block 2: Selected element

If no selection:
- “Select a tread, riser, handrail, width marker, or headroom plane to inspect the rule behind it.”

If selected:
- element name
- measured value
- dimension type
- law rows
- correction hint

### Block 3: Critical fixes

Sort order:
1. RA 9514 legal failures
2. BP 344 legal failures
3. PD 1096 legal failures
4. BP 220 contextual failures
5. cross-law conflicts
6. comfort/comparison warnings

Each fix card includes:
- dimension
- current value
- requirement/range
- law chip
- short reason
- suggested action
- source status label: `source audit pending`, `verified`, `comparison-only`, or `unverified`

### Block 4: Dimension cards

Always visible but compact/collapsible:
- Riser Height
- Tread Depth
- Clear Width
- Handrail Height
- Headroom
- Vertical Rise / Landing
- Egress Capacity

### Block 5: Source / citation drawer

Default collapsed.

Phase 1 label:
- “Source audit pending. Values are code-constant-backed but not yet shown as source-backed in this panel.”

Do not show fake source quotes.

## 9. Status bar contents

Desktop status bar should show compact chips:

- `Riser: pass/fail`
- `Tread: pass/fail`
- `Width: pass/fail`
- `Handrail: pass/fail`
- `Headroom: pass/fail`
- `Conflicts: N`

Avoid long text. The status bar is orientation, not instruction.

## 10. Mode definitions

Phase 1 should not expose mode tabs in the default interface unless they are visually quiet and do not add choices. If modes exist, they should be entered through guided lesson cards or explicit Study Cases modals, not through a permanent left-sidebar decision system.

### Learn

Visible controls:
- the same four core dimensions only;
- fixed lesson context selected by the module.

Behavior:
- guided prompt may appear as a viewport callout or modal, not as sidebar clutter;
- advanced controls hidden from default sidebar;
- threshold/citation detail opens after click.

### Diagnose

Visible controls:
- the same four core dimensions only.

Behavior:
- deliberate flawed preset is loaded by the lesson;
- learner identifies failing dimension through the right panel;
- right panel reveals diagnosis.

### Compare

Visible controls:
- no default sidebar scenario toggles.

Behavior:
- comparison is launched from Study Cases modal;
- the app swaps fixed presets and explains why the active law condition changes;
- do not ask the learner to configure the law condition manually at first load.

### Sandbox

Visible controls:
- still start with four core dimensions;
- advanced controls are reachable through More, not permanently visible.

Behavior:
- immediate compliance feedback;
- reset to compliant;
- make-one-violation preset.

### Challenge

Visible controls:
- hidden or limited hints;
- fixed challenge prompt displayed outside the left control stack;
- answer/check button.

Behavior:
- learner identifies dimension, law, and correction;
- exam transfer question appears.

## 11. First implementation slice

Implement only this first:

1. `useTemplateContent.tsx` stairway branch.
2. `StairwayWorkbenchLeftPanel` with zero-decision default controls only: riser height, tread depth, stair width, handrail height.
3. `StairwayWorkbenchRightPanel` / redesigned `ComplianceReportPanel` preserving the existing four-law category model from `ComplianceReportPanel`: RA 9514, BP 344, PD 1096, BP 220.
4. `StairwayStatusBar` compact dimension statuses if it does not add clutter.
5. No permanent scenario/stair-type dropdowns in sidebars.
6. Preserve existing canvas and all parameter behavior.
7. Put advanced/project/scenario controls behind More / Study Cases modal.
8. Leave `ClickInspectPopover` temporarily if needed.
9. No sourceTruth yet.
10. No full mode logic yet.
11. No challenge/question engine yet.

## 12. Acceptance criteria for first implementation slice

Functional:
- route loads at `/dashboard/3d-lab/stairway-configurator`;
- 3D stair renders;
- four default sliders update geometry: riser height, tread depth, stair width, handrail height;
- violations still update when values change;
- right sidebar preserves the existing four-law category content: RA 9514, BP 344, PD 1096, BP 220;
- violations appear inside the relevant law category/card or existing compact violation summary behavior;
- project type/accessibility/exit/stair-type controls are not visible as default sidebar decisions;
- advanced and scenario controls remain reachable only through a More / Study Cases modal or later guided flow;
- mobile bottom sheet preserves the same zero-decision default hierarchy.

Architecture:
- no legal/computation logic duplicated in React panels;
- `computeStairState(params)` remains source of computed truth;
- `stairway-configurator.ts` remains declarative config, not React UI;
- `ViewportShell` remains shell owner;
- no new full-page shell is introduced.

UX:
- first load shows fixed context + four core dimension controls only;
- no stair-type/scenario dropdown appears in either sidebar by default;
- right panel leads with diagnosis and critical fixes;
- viewport remains visually dominant;
- no persistent large explanatory overlays block the stair.

Safety:
- no new source-backed claims;
- no unverified international values presented as Philippine law;
- legal vs comfort vs comparison warning types are distinct.

## 13. Validation commands after first slice

Run:

```bash
bun test src/features/3d-lab/config/modules/08-vertical/stairway-computation.test.ts
bun test src/features/3d-lab/config/modules/08-vertical/stairway-geometry.test.ts
bun test src/features/3d-lab/config/modules/08-vertical/stairway-click-targets.test.ts
bun run type-check
bun run lint
```

Browser smoke:

- open `/dashboard/3d-lab/stairway-configurator`;
- change `riserHeight` across a known failing threshold;
- change `stairWidth` below a known requirement;
- toggle `isAccessibleRoute`;
- toggle `isExitStair`;
- verify right panel and status bar update;
- verify advanced sections collapse/expand;
- verify mobile bottom sheet tabs.

## 14. Builder rules

A builder agent must not improvise beyond this spec in Phase 1.

If uncertain:
- prefer smaller panel skeletons over a full redesign;
- preserve existing behavior over polish;
- document gaps rather than inventing new legal/citation content;
- do not rewrite computation or geometry.
