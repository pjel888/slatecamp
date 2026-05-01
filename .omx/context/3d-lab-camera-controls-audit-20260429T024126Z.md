# 3D Lab Camera Controls Audit Snapshot

## Task statement
Audit the 3D Lab camera controls, plan the fix, assess readiness/blast radius, then implement fixes for recurring projection/view/fit issues.

## Desired outcome
- Default camera starts as SE view and fit-to-model.
- Switching perspective <-> isometric must not zoom the model out or cause clipping.
- Named views (NE/NW/SE/etc.) must preserve user zoom/fit intent and not incorrectly force projection changes.
- Zoom-to-fit fits visible model geometry, not grid/ground helpers.
- Pan remains unconstrained and camera toolbar stays non-overlapping.
- Tests and audit checks cover these edge cases.

## Known facts/evidence
- Prior camera work touched camera preset utilities, viewport store, useCameraSnap, CameraNavigationBar, SceneConfig, SceneBase/SceneGround, ViewportShell, template content/layers, and 3D Lab audit/playwright checks.
- Prior verification reportedly passed targeted store/preset tests, 3D Lab tests, type-check, lint, controls audit, and a local browser projection-decoupling check.
- User now reports a recurring severe bug: switching from perspective to isometric zooms out too far until camera clipping occurs.
- Latest user also wants a plan/readiness/blast-radius audit before implementation.

## Constraints
- Pre-launch MVP: prioritize correct launch behavior over backwards compatibility with broken previous iterations.
- Do not overwrite unrelated landing/marketing dirty work.
- Use Bun for tests/scripts.
- Ralph planning gate: create PRD and test-spec artifacts before implementation edits.
- Use durable OMX team runtime for `$team`; worker lanes should be audit/planning first.

## Unknowns/open questions to resolve by audit
- Whether projection toggle changes camera distance, camera.zoom, or bounds fit unexpectedly.
- Whether `zoom-to-fit` recomputes distance from a too-large scene bounding box.
- Whether orthographic zoom conversion is missing or using stale camera framing math.
- Whether configured per-module camera bounds are missing or being overridden.
- Whether default SE+fit should apply only initial load or also reset; default load is required, reset behavior should be checked.

## Likely codebase touchpoints
- `src/features/3d-lab/utils/camera-presets.ts`
- `src/features/3d-lab/stores/useViewportShellStore.ts`
- `src/features/3d-lab/hooks/useCameraSnap.ts`
- `src/features/3d-lab/components/controls/ThreeDLabControlsProvider.tsx`
- `src/features/3d-lab/components/rendering/SceneConfig.tsx`
- `src/features/3d-lab/components/shell/CameraNavigationBar.tsx`
- `src/features/3d-lab/components/shell/SceneGround.tsx`
- `src/features/3d-lab/components/rendering/SceneBase.tsx`
- `.ai/00_performance/scripts/3d-lab-layout-controls-audit.mjs`
- `.ai/00_performance/playwright/3d-lab-production.spec.ts`
