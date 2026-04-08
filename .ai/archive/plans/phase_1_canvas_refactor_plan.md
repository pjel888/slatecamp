# Phase 1: Fix CanvasWrapper + SceneConfig — Implementation Plan

**Status:** IN PROGRESS
**Date:** 2026-04-08
**Findings:** F-01, F-06, F-13, F-15

---

## Objective

Extract hardcoded camera/controls/lighting/scene-base config from `LabViewportFrame.tsx` into a new `SceneConfig.tsx` component. Fix the 15 dead props in `CanvasWrapper.tsx` by replacing them with a single `sceneConfig` prop. Add `PerformanceMonitor` to `LabViewportFrame.tsx`. Delete dead re-export files.

## Audit Summary

### Current State

**CanvasWrapper.tsx** accepts 15 props (`minPolarAngle`, `maxPolarAngle`, `cameraPosition`, `cameraFov`, `showGround`, `minDistance`, `maxDistance`, `orthographic`, `cameraZoom`, `flat`, `disableLighting`, `disableSceneBase`, `disableShadows`, `clearColor`, `glConfig`) but destructures ONLY `children`. All 15 props are **dead code**.

**LabViewportFrame.tsx** hardcodes:
- Camera: `position: [6, 6, 6]`, `fov: 35`
- OrbitControls: `minPolarAngle: 0`, `maxPolarAngle: Math.PI / 1.75`, `minDistance: 3`, `maxDistance: Infinity`
- StudioLighting (always on)
- SceneBase with `showGround` (always on)
- No PerformanceMonitor

**10 consumers** still pass dead props thinking they work.

### Design Decision: Imperative Camera via useEffect

SceneConfig uses `useEffect` to set camera position/fov imperatively on the Canvas's existing PerspectiveCamera, rather than rendering a declarative `<PerspectiveCamera>` component. This prevents OrbitControls from fighting with declarative position props on re-renders.

Exception: Orthographic mode renders `<OrthographicCamera makeDefault>` since it requires a different camera type.

### Known Limitations (Deferred)

- `disableShadows` — Canvas-level prop, cannot be configured from inside. Deferred to Phase 4.
- `glConfig` — Canvas-level prop. Current default `{ antialias: true, alpha: false, stencil: false, depth: true }` stays.
- Calculator orthographic shadow behavior unchanged from current (dead) state.

---

## Changes

### CREATE: `src/features/3d-lab/components/rendering/SceneConfig.tsx`
- `SceneConfigProps` interface (13 configurable properties)
- `CameraSetup` — imperative camera position/fov via useEffect
- `SceneOverrides` — clearColor and flat tone mapping
- `SceneConfig` — orchestrates camera, OrbitControls, StudioLighting, SceneBase

### MODIFY: `src/features/3d-lab/components/CanvasWrapper.tsx`
- Remove 15 dead props from `CanvasWrapperProps`
- Add `sceneConfig?: SceneConfigProps` (defaults to `{}`)
- Render `<SceneConfig {...sceneConfig} />` inside `<SceneTunnel.In>`

### MODIFY: `src/features/3d-lab/components/shell/LabViewportFrame.tsx`
- Remove imports: OrbitControls, StudioLighting, SceneBase
- Remove hardcoded OrbitControls, StudioLighting, SceneBase JSX
- Add `PerformanceMonitor` with `flipflops={3}` and DPR management
- Keep Canvas `camera` prop as fallback matching SceneConfig defaults

### MODIFY: 10 template consumers
Replace dead props with `sceneConfig={{ ... }}`:
1. `ParametricScene.tsx` — camera, controls, showGround
2. `ExplodedAssembly.tsx` — camera, controls, showGround
3. `CutawaySection.tsx` — camera, controls
4. `AnimatedSequence.tsx` — camera, controls, showGround
5. `FloorPlanWalkthrough.tsx` — camera, controls, showGround
6. `WallConfiguratorTemplate.tsx` — camera, controls, showGround
7. `CalculatorTemplate.tsx` — camera, controls, orthographic, flat, disableLighting, disableSceneBase, clearColor
8. `NBCPEnvelope.tsx` — add `sceneConfig={{}}` (uses defaults, own camera/controls override via makeDefault)
9. `ClassicalOrders.tsx` — camera, controls, showGround
10. `FARPlayground.tsx` — camera, controls, showGround

### DELETE:
- `src/features/3d-lab/components/templates/CanvasWrapper.tsx` (dead re-export, zero imports)
- `src/features/3d-lab/components/templates/GlobalCanvasPortal.tsx` (dead re-export, zero imports)

---

## Verification (Phase 1 Gate)

- [ ] `bun run type-check` passes
- [ ] `bun run build` passes
- [ ] DevControls untouched: `git diff --name-only -- src/features/3d-lab/DevControlsModule/` → empty
- [ ] Identity lock: `git diff --name-only -- src/components/quiz-v2/SlideToSubmit.tsx ...` → empty
- [ ] Module configs untouched: `git diff --name-only -- src/features/3d-lab/config/` → empty
- [ ] `CanvasWrapperProps` has ONLY `children` + `sceneConfig`
- [ ] Re-export files deleted
- [ ] PerformanceMonitor mounted in LabViewportFrame
