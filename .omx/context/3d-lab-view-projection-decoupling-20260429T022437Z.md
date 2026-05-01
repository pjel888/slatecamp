# 3D Lab view/projection decoupling Ralph context — 20260429T022437Z

## Task statement
Fix edge cases where changing named views (NE/NW/SE/SW/etc.) resets zoom/pan/model position and forces orthographic/isometric projection.

## Desired outcome
- View buttons change camera direction/orientation only.
- Existing pan target/model position is preserved when changing views.
- Existing zoom level/distance is preserved when changing views.
- Projection mode is independent: the same view direction can be used in perspective or orthographic/isometric mode.
- Zoom Extents remains the explicit command for refitting the whole visible lesson model.

## Known facts/evidence
- Current store derives projection from selected view preset, so non-perspective view commands force orthographic.
- Current useCameraSnap fitted view logic recenters on visible scene bounds and can overwrite user pan/zoom.
- Previous pass added continuous zoom slider, custom pan, and model-only zoom extents.

## Constraints
- Preserve unrelated dirty landing/marketing work.
- Use Bun for verification.
- No new dependencies.
- Keep source changes focused on shared 3D Lab camera controls.

## Likely touchpoints
- src/features/3d-lab/utils/camera-presets.ts
- src/features/3d-lab/stores/useViewportShellStore.ts
- src/features/3d-lab/hooks/useCameraSnap.ts
- src/features/3d-lab/components/shell/CameraNavigationBar.tsx
- related tests/audit
