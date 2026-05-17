# BP 344 Ramp 3D Lab Visual Rebuild Plan

> Status: planning reset after visual QA failure. Do not continue incremental patching of the current ramp scene.

## Problem Statement

The current BP 344 ramp scene is not acceptable as a teaching model.

Observed failures:
- Too many floating labels block the actual model.
- Text overlaps geometry and makes the ramp harder, not easier, to understand.
- Railings are too thin and visually ambiguous.
- Tactile warning fields are not obvious.
- The default camera/frame leaves too much clutter and not enough architectural clarity.
- The scene is trying to be a compliance panel, diagram, and model all at once.

Decision: treat the current pass as a failed prototype for visual design. Keep source-gating/compliance logic, but redesign the visual presentation from first principles.

## Goal

Create a clear BP 344 accessible-route ramp teaching scene that reads instantly as:

1. lower landing
2. sloped ramp run
3. upper landing
4. two-sided handrails
5. tactile warning fields
6. wheelchair/human scale
7. source-pending QA status

The model must be understandable before reading any text.

## Non-goals

- Do not make a public learner-ready compliance module yet.
- Do not show COMPLIANT/VIOLATION while source rules remain pending SME approval.
- Do not use dense floating labels inside the canvas.
- Do not treat Blender geometry as legal/code truth.
- Do not add more visual features until the base ramp reads correctly.

## New Visual Direction

### Primary mode: clean architectural axonometric

Default view should show a simple, unmistakable ramp:
- solid wedge body
- flat lower and upper landings
- thick continuous handrails
- clear vertical posts
- amber tactile mats at both ends
- blue walking surface
- one large green travel arrow
- wheelchair/person scale cue

Canvas labels should be nearly eliminated.

Allowed in-canvas text:
- no paragraph labels
- no long floating cards over the model
- optional small numbered markers only: 1, 2, 3, 4
- markers must sit outside or beside the model, connected with leader lines

All explanations move to the side panel.

### Secondary mode: side/elevation diagram

Add a separate diagram layer or camera preset showing:
- triangular ramp profile
- run
- rise
- 1:20 ratio

This should not compete with the axonometric model.

### Tertiary mode: plan/top view

Add a top-view preset showing:
- 1.20 m clear width
- 1.80 m landings
- tactile warning locations

Again: no floating text over the model. Use numbered callouts and side-panel explanations.

## Acceptance Criteria

Visual acceptance:
- At first glance, a reviewer can identify the object as a ramp without reading text.
- Railings read as railings: thick enough, continuous, with visible posts.
- Tactile warning fields read as amber mats with dark studs.
- Landings are visually distinct from the sloped ramp.
- The travel direction arrow is visible and not confused with the camera gizmo.
- No floating text blocks the ramp body, railings, or tactile fields.
- Default view fills the viewport with the model, not empty grid.

Teaching acceptance:
- Canvas communicates form.
- Side panel communicates rules.
- Source/compliance panel communicates source-pending status.
- The learner is not forced to parse overlapping 3D labels.

Compliance/source acceptance:
- Source gate remains SOURCE_PENDING.
- No COMPLIANT/VIOLATION labels while source approval is pending.
- Formula tests remain intact.
- Existing source-rule metadata remains intact.

## Proposed Component/Code Strategy

### 1. Disable default floating annotation overlays for this module

In `bp344-accessible-route-ramp.ts`:
- set `alwaysShowAnnotations` to false, or remove it
- set default visible annotation IDs to an empty list, or use only numbered marker IDs if supported

The right panel can still list source rules and explanations.

### 2. Replace label-heavy geometry labels

Remove or minimize `label` fields on geometry instructions for:
- ramp wedge
- walking surface
- landings
- tactile blocks
- side-profile pieces

If labels are needed, convert them to numbered IDs only, e.g. `1`, `2`, `3`, `4`.

### 3. Build a stronger low-poly ramp model

Geometry should prioritize readability:
- ramp wedge: light gray/blue solid mass
- walking surface: saturated blue plane on top
- landings: pale slab color with darker outline/edge
- tactile fields: amber mats, bigger dark studs
- railings: thicker cylinders/boxes, dark blue, continuous along both landings and slope
- posts: thicker vertical cylinders at predictable intervals
- travel arrow: large green arrow centered on the walking surface

### 4. Move explanations into panel content

Use side panel cards, not floating text:
- 1 Lower landing: 1.80 m level area
- 2 Sloped run: run/rise ratio check
- 3 Upper landing: 1.80 m level area
- 4 Handrails/tactile warnings: pending source approval

### 5. Use camera presets as teaching views

Default: axonometric, close, model-centered.
Preset buttons:
- AXON: understand the ramp form
- SIDE: run/rise slope diagram
- PLAN: clear width + landing/tactile layout

### 6. Defer Blender until the low-poly diagram passes

Blender can help later for a polished authored asset, but it will not solve the current problem by itself. The current issue is visual hierarchy and teaching design, not mesh sophistication.

Use Blender only if:
- the procedural low-poly diagram passes the visual acceptance criteria, and
- we want a cleaner authored version with named nodes, and
- a GLB manifest/node contract is prepared.

## Testing Plan

Keep existing formula/source tests.

Add/adjust visual contract tests to assert:
- no default floating annotation spam
- no long geometry labels on core parts
- handrail cylinders/posts exceed a minimum visual radius
- tactile mats and studs exist at both ends
- large travel arrow exists
- three camera presets exist: axon, side, plan/top

Browser QA required:
- load `http://localhost:3001/dashboard/3d-lab/bp344-accessible-route-ramp`
- skip orientation
- inspect default view visually
- verify no text blocks the model
- verify SOURCE PENDING remains visible
- verify console has no JS errors

## Recommended Next Implementation Sequence

1. Freeze current prototype as failed visual pass.
2. Remove floating canvas labels from default state.
3. Strengthen geometry only: wedge, landings, railings, tactile mats, travel arrow.
4. Set default camera to clean axonometric close-up.
5. Add side/profile and top/plan camera presets.
6. Browser QA screenshot after each major change.
7. Only after visual pass succeeds, re-run full gates.

## Current Verdict

Current ramp: FAIL for visual teaching quality.
Source/compliance logic: keep.
Next action: redesign visual hierarchy before touching source/compliance logic again.
