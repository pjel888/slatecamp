# Stairway Code Compliance 3D Model Upgrade Implementation Plan

> For Hermes: use subagent-driven-development if this becomes implementation. Keep compliance calculations source-backed and separate from visual ornamentation.

Goal: Upgrade `/dashboard/3d-lab/stairway-code-compliance` from a clean gray compliance blockout into a visually richer, exam-useful stair assembly with balusters, newel posts, better rail details, cleaner geometry, better materials, and no overlapping/coplananr faces.

Architecture: Keep the existing procedural/parametric model in `src/features/3d-lab/config/modules/08-vertical/stairway-code-compliance.ts` as the source of visual geometry. Add reusable geometry helpers for posts, balusters, rails, nosings, stringers, landings, and material metadata instead of one-off mesh fragments. Compliance truth remains in `stairway-computation.ts`; decorative upgrades must not change rule thresholds or violation logic.

Tech Stack: Next.js 16, React Three Fiber/Three.js, SlateCamp 3D Lab template renderer, Bun tests.

---

## Current evidence inspected

- Active module config: `src/features/3d-lab/config/modules/08-vertical/stairway-code-compliance.ts`
- Geometry validator: `src/features/3d-lab/config/modules/08-vertical/stairway-geometry-validator.ts`
- Geometry tests: `src/features/3d-lab/config/modules/08-vertical/stairway-geometry.test.ts`
- Shared renderers: `src/features/3d-lab/components/templates/GeometryMesh.tsx`, `InstancedMesh.tsx`
- Camera/shell path: `src/features/3d-lab/hooks/useTemplateContent.tsx`, `useCameraSnap.ts`
- Module registry/slug: `src/features/3d-lab/config/registry/cat-08.ts`, `module-paths.ts`

## Acceptance criteria

1. Route and title are `Stairway Code Compliance` at `/dashboard/3d-lab/stairway-code-compliance`.
2. Default view opens in a perspective NW angle that clearly shows run depth, rail side, and landing datum.
3. Passing physical assembly remains calm neutral gray unless a physical code-violating part is explicitly red.
4. Visual detail improves without hiding code overlays: balusters, newel posts, rail returns/extensions, nosing lips, stringers/skirt boards, landing edges, and subtle material variation.
5. No duplicate IDs, invalid dimensions, floating members, crossing rails, z-fighting, or opaque coplanar overlap.
6. Decorative geometry never affects fit-content framing unless intentionally part of the physical assembly.
7. Tests cover geometry contracts, route import path, module id/title, and at least one no-overlap/coplanar regression.
8. Browser QA includes default, violation, zoom-to-fit, reset, and 1440×820 screenshot pass.

---

## Phase 0 — Lock route/name/camera baseline

### Task 0.1: Verify renamed module import path

Files:
- Modify: `src/features/3d-lab/config/module-paths.test.ts`
- Verify: `src/features/3d-lab/config/registry/cat-08.ts`

Steps:
1. Assert `getModuleImportPath('stairway-code-compliance') === '08-vertical/stairway-code-compliance'`.
2. Assert `importModuleConfig('stairway-code-compliance')` returns id `stairway-code-compliance`.
3. Run: `bun test src/features/3d-lab/config/module-paths.test.ts`.

Expected: pass.

### Task 0.2: Verify default perspective-NW camera

Files:
- Modify: `src/features/3d-lab/config/modules/08-vertical/stairway-code-compliance.ts`
- Test: add or extend `src/features/3d-lab/config/modules/08-vertical/stairway-geometry.test.ts`

Steps:
1. Assert `camera.position[0] < 0`, `camera.position[2] > 0`, `camera.fov <= 35`, and `camera.resetPreset === 'perspective'`.
2. Confirm `camera.zoomToFit` uses the same NW perspective framing.
3. Run stairway tests.

Expected: pass.

---

## Phase 1 — Base geometry audit before ornamentation

### Task 1.1: Add generated geometry audit utility

Files:
- Create: `src/features/3d-lab/config/modules/08-vertical/stairway-geometry-audit.ts`
- Test: `src/features/3d-lab/config/modules/08-vertical/stairway-geometry.test.ts`

Purpose: Detect invalid/duplicate/floating/overlapping primitive instructions before adding visual detail.

Minimum checks:
- duplicate `id`
- non-finite position/args/rotation values
- zero or negative dimensions
- same material opaque boxes with identical or nearly identical coplanar faces
- rail/post endpoint mismatch above tolerance
- balusters/posts not seated on tread, landing, or rail path

Tolerance:
- position tolerance: `0.002m`
- face overlap warning tolerance: `0.003m`
- contact tolerance: `0.01m`

### Task 1.2: Capture baseline screenshot

Files:
- Save evidence under `.ai/03_plans/stairway-code-compliance-model-upgrade/evidence/`

Steps:
1. Open `/dashboard/3d-lab/stairway-code-compliance` at 1440×820.
2. Capture default passing state screenshot.
3. Capture one violation state screenshot.
4. Record visual defects before implementation.

Expected: evidence images and notes exist before adding ornamentation.

---

## Phase 2 — Reusable stair detail helpers

### Task 2.1: Add run path and edge helper functions

Files:
- Modify: `src/features/3d-lab/config/modules/08-vertical/stairway-geometry-contracts.ts`
- Modify: `src/features/3d-lab/config/modules/08-vertical/stairway-code-compliance.ts`

Add helpers to compute:
- left/right stair edge x positions from clear width
- tread front/back z positions
- top/bottom landing extents
- nosing line positions
- rail side path points

Rule: every decorative member derives from the same run contract, not repeated arithmetic.

### Task 2.2: Add newel posts

Files:
- Modify: `src/features/3d-lab/config/modules/08-vertical/stairway-code-compliance.ts`
- Test: `stairway-geometry.test.ts`

Geometry:
- bottom newel posts at stair foot, both sides
- top newel posts at landing transition, both sides
- optional intermediate post every 1.5–1.8m of rail run, visual only unless later source-backed
- cylindrical or square posts using existing renderer-supported primitives

Acceptance:
- posts touch tread/landing support plane
- posts do not penetrate handrail centerline incorrectly
- IDs are deterministic: `newel-bottom-left`, etc.

### Task 2.3: Add balusters

Files:
- Modify: `src/features/3d-lab/config/modules/08-vertical/stairway-code-compliance.ts`
- Test: `stairway-geometry.test.ts`

Geometry:
- regular baluster spacing along the sloped stair rail and landing guard segment
- default spacing visually around 0.12–0.15m without claiming code compliance unless source-backed
- balusters are slimmer than newels; neutral gray material
- generate as instanced cylinders or boxes where possible for performance

Acceptance:
- no baluster floats above tread/landing
- no baluster crosses rail extension geometry
- performance: use instancing if count exceeds 20.

### Task 2.4: Add stringers/skirt boards and nosing lips

Files:
- Modify: `src/features/3d-lab/config/modules/08-vertical/stairway-code-compliance.ts`
- Test: `stairway-geometry.test.ts`

Geometry:
- side stringer/skirt boards along left/right run
- slight nosing lip on each tread front edge
- landing perimeter trim

Acceptance:
- no opaque coplanar faces with tread surfaces; offset lips/trim by at least `0.005m`
- details remain subordinate to compliance overlays.

---

## Phase 3 — Material and shader polish without visual noise

### Task 3.1: Add material metadata tokens

Files:
- Modify: `src/features/3d-lab/config/modules/08-vertical/stairway-constants.ts`
- Modify: `GeometryMesh.tsx` / `InstancedMesh.tsx` only if current metadata cannot express it

Materials:
- main physical assembly: neutral gray `#6B7280`
- subtle rail/post variance: same hue, slightly different roughness/metalness if supported
- violation physical members: universal red `#DC2626`
- compliance overlays: unlit `basic`, `toneMapped=false`, `depthWrite=false`

Do not add decorative wood grain until geometry is correct. If textures are generated later, keep them low-resolution, neutral, and non-legal.

### Task 3.2: Optional procedural texture pass

Files:
- Create: `public/3d-lab/textures/stairway/` only after approval
- Document: `.ai/03_plans/stairway-code-compliance-model-upgrade/texture-notes.md`

Rules:
- generate neutral concrete/painted-metal style, not photo-real clutter
- max 1024px texture unless justified
- do not use external copyrighted assets without provenance
- verify texture path loads and does not break build.

---

## Phase 4 — Compliance visualization integration

### Task 4.1: Preserve red violation behavior

Files:
- Test: `stairway-computation.test.ts`
- Test: `stairway-geometry.test.ts`

Cases:
- shallow tread violation turns tread-related physical elements red where intended
- riser violation turns riser-related physical elements red where intended
- handrail height violation turns rail/newel/handrail elements red where intended, not unrelated treads
- headroom plane remains red overlay and excluded from fit.

### Task 4.2: Add selected-part inspection labels for new parts

Files:
- Modify: `stairway-click-targets.test.ts`
- Modify: `stairway-code-compliance.ts`

Acceptance:
- click targets exist for newel posts, baluster group, handrail, tread, riser, landings
- labels explain visual role without inventing source-backed legal claims.

---

## Phase 5 — Browser QA and performance gate

### Task 5.1: Run unit tests

Commands:
- `bun test src/features/3d-lab/config/module-paths.test.ts`
- `bun test src/features/3d-lab/config/modules/08-vertical/stairway-computation.test.ts src/features/3d-lab/config/modules/08-vertical/stairway-geometry.test.ts src/features/3d-lab/config/modules/08-vertical/stairway-click-targets.test.ts`

Expected: all pass.

### Task 5.2: Run lint on touched files

Command:
- `bunx eslint src/features/3d-lab/config/modules/08-vertical/stairway-code-compliance.ts src/features/3d-lab/config/modules/08-vertical/stairway-geometry.test.ts src/features/3d-lab/config/module-paths.test.ts`

Expected: no new errors. If repo-level pre-existing errors appear, record them separately with evidence.

### Task 5.3: Browser visual QA

Route:
- `/dashboard/3d-lab/stairway-code-compliance`

Checkpoints:
- default perspective-NW view
- zoom-to-fit still frames physical assembly, not overlays
- reset returns to perspective-NW
- violation state keeps affected physical parts red
- balusters/newels attach correctly
- no z-fighting or overlapping faces visible
- 1440×820 no-scroll sidebars remain acceptable
- console has no WebGL/runtime errors.

---

## Risks and boundaries

- Do not change legal thresholds while improving visuals.
- Do not let decorative baluster spacing imply BP 344/PD 1096 compliance unless a source-backed rule is added.
- Do not add high-cost postprocessing or heavy textures before geometry is clean.
- Avoid adding GLB/Blender asset dependency for this procedural module unless the procedural approach proves insufficient.
- Keep new geometry deterministic and testable; do not use random decorative placement.

## Recommended next implementation order

1. Finish route/title/default-camera verification.
2. Add geometry audit helper and tests.
3. Add newel posts.
4. Add balusters with instancing.
5. Add stringers/nosing/trim.
6. Add material polish.
7. Run browser QA and screenshot review.
