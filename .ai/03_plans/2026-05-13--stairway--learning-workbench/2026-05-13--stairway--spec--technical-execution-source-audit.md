# Stairway Learning Workbench — Technical Execution, Testing, and Source Audit Specification

Date: 2026-05-13
Status: planning specification
Purpose: give builder and reviewer agents a safe execution protocol.

## 1. Execution principle

Build the workbench in isolated, reversible slices. Do not rewrite computation, geometry, or source/legal constants during the UI redesign unless a test or source audit proves a specific defect.

## 2. Required branch/worktree discipline

Before implementation:

1. Check `git status --short`.
2. Do not overwrite unrelated dirty work.
3. If the worktree contains unrelated modified files, create an isolated branch or worktree for the implementation.
4. Commit only the stairway workbench changes in logical batches.

Current observed state during planning:
- branch: `3dlab-gray-viewport-bg`
- unrelated content-audit export files are modified/untracked.
- planning files under `.ai/03_plans` are new.

Implementation should avoid touching `.ai/content-audit-export/**`.

## 3. Build phases

### Phase A: Layout specialization

Files likely touched:
- `src/features/3d-lab/hooks/useTemplateContent.tsx`
- new files under `src/features/3d-lab/components/stairway/`

Allowed changes:
- add stairway branch;
- add panel skeletons;
- add status bar;
- widen sidebars.

Disallowed:
- computation rewrite;
- legal constants changes;
- sourceTruth claims;
- deleting existing controls.

### Phase B: Panel data adapter

Files likely touched:
- `src/features/3d-lab/components/stairway/stairway-panel-model.ts`
- `StairwayWorkbenchRightPanel.tsx`

Rules:
- adapter functions must be pure;
- adapter reads `ComputedStairState` and violation rules, but does not duplicate legal checks;
- panel cards consume adapter output.

### Phase C: Selected element migration

Files likely touched:
- `ParametricSceneRenderer.tsx`
- `useViewportShellStore` or a store-adjacent selection bridge
- `StairwaySelectedElementInspector.tsx`

Rules:
- renderer may emit generic selected element id;
- renderer must not import stairway UI;
- stairway panel handles interpretation.

### Phase D: Learning modes

Files likely touched:
- `StairwayModeTabs.tsx`
- `stairway-learning-stages.ts`
- left/right panel components

Rules:
- phase behavior should be data-driven where practical;
- Sandbox must preserve full control;
- Challenge mode must not depend on source-backed quotes until source audit is complete.

### Phase E: Source-backed layer

Files likely touched later:
- source metadata file, e.g. `stairway-source-truth.ts`
- `stairway-configurator.ts` only to attach approved `sourceTruth`
- right panel source drawer

Rules:
- no partial source-backed claim;
- gate must fail closed;
- every legal threshold needs source locator.

## 4. Testing protocol

### Always run after Phase A/B

```bash
bun test src/features/3d-lab/config/modules/08-vertical/stairway-computation.test.ts
bun test src/features/3d-lab/config/modules/08-vertical/stairway-geometry.test.ts
bun test src/features/3d-lab/config/modules/08-vertical/stairway-click-targets.test.ts
bun run type-check
bun run lint
```

### Add tests during implementation

1. Renderer boundary test
   - Assert `ParametricSceneRenderer.tsx` does not import `ClickInspectPopover` after Phase C.

2. Panel adapter tests
   - Given representative params, adapter returns expected active law chips and issue counts.

3. Critical fix sorting test
   - RA 9514 > BP 344 > PD 1096 > BP 220 > comfort/comparison.

4. Source status test
   - unverified/comparison values never appear as Philippine legal requirements.

5. Mobile tab smoke test
   - stairway controls/diagnosis appear as mobile tabs through `ViewportShell`.

## 5. Browser QA probes

Manual route:

`http://localhost:3000/dashboard/3d-lab/stairway-configurator`

Probe 1: shell structure

```js
(() => {
  const shell = document.querySelector('[data-testid="3dlab-shell"]')
  const left = document.querySelector('[data-testid="3dlab-shell-left-sidebar"]')
  const right = document.querySelector('[data-testid="3dlab-shell-right-sidebar"]')
  const viewport = document.querySelector('[data-testid="3dlab-shell-viewport"]')
  return {
    hasShell: !!shell,
    leftWidth: left?.getBoundingClientRect().width,
    rightWidth: right?.getBoundingClientRect().width,
    viewportWidth: viewport?.getBoundingClientRect().width,
  }
})()
```

Expected:
- shell exists;
- left/right around target width;
- viewport remains usable.

Probe 2: first-load controls

Check visually:
- Scenario open;
- Core Geometry open;
- advanced groups collapsed.

Probe 3: live compliance

Actions:
- adjust riser height;
- adjust width;
- toggle accessible route;
- toggle required exit stair.

Expected:
- status bar updates;
- right panel updates;
- geometry updates.

Probe 4: viewport clutter

Expected:
- no large permanent cards cover the stair;
- source text is not overlaid on model.

## 6. Source audit protocol

Primary source folders:

- PD 1096: `vitruvius-connection/001_Raw-Source-Layer/001-Laws/PD-1096/`
- BP 344: `vitruvius-connection/001_Raw-Source-Layer/001-Laws/BP-344/`
- RA 9514: `vitruvius-connection/001_Raw-Source-Layer/001-Laws/RA-9514/`
- BP 220: `vitruvius-connection/001_Raw-Source-Layer/001-Laws/BP-220/Revised_IRR_BP220_2008.pdf`

Required source audit table columns:

- constant name;
- current value;
- dimension;
- law;
- applicability condition;
- raw PDF path;
- page locator;
- exact excerpt;
- extraction method;
- reviewer;
- status: `verified`, `needs-review`, `comparison-only`, `unverified`, `do-not-teach`;
- learner-facing wording approved? yes/no.

Constants to audit first:

- `PD1096_MAX_RISER_HEIGHT_MM`
- `PD1096_MIN_TREAD_DEPTH_MM`
- `PD1096_MIN_HEADROOM_MM`
- `PD1096_MAX_VERTICAL_RISE_MM`
- `PD1096_MIN_WIDTH_HIGH_OCC_MM`
- `PD1096_MIN_WIDTH_COMMERCIAL_MM`
- `PD1096_MIN_WIDTH_RESIDENTIAL_MM`
- `PD1096_HANDRAIL_MIN_HEIGHT_MM`
- `PD1096_HANDRAIL_MAX_HEIGHT_MM`
- `BP220_MAX_RISER_HEIGHT_MM`
- `BP220_MIN_TREAD_DEPTH_MM`
- `BP220_MIN_WIDTH_MM`
- `BP344_MIN_ACCESSIBLE_WIDTH_MM`
- `BP344_HANDRAIL_UPPER_HEIGHT_MM`
- `BP344_HANDRAIL_LOWER_HEIGHT_MM`
- `BP344_HANDRAIL_EXTENSION_MM`
- `RA9514_MAX_RISER_HEIGHT_MM`
- `RA9514_MIN_TREAD_DEPTH_MM`
- `RA9514_MIN_WIDTH_MM`
- `RA9514_MAX_VERTICAL_RISE_MM`

Do not prioritize international/IBC/ADA comparison constants until the Philippine legal constants are verified.

## 7. Code review checklist

Reviewer must check:

- Does the route still use `ViewportShell`?
- Is `ParametricSceneRenderer` still generic?
- Are legal checks still from `computeStairState` / existing rules?
- Are all controls reachable?
- Are advanced controls collapsed by default?
- Does the right panel explain fixes, not just errors?
- Are source-backed claims absent until audit is complete?
- Does mobile still work?
- Are tests run and reported?

## 8. Stop conditions

Stop and fix before continuing if:

- route fails to load;
- geometry stops updating;
- sliders no longer affect compliance;
- legal/compliance logic is duplicated in React UI;
- implementation introduces source-backed claims without source metadata;
- viewport becomes unusably narrow;
- mobile controls disappear;
- type-check or existing stairway tests fail due to new work.
