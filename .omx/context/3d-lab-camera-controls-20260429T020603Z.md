# 3D Lab camera controls Ralph context — 20260429T020603Z

## Task statement
Fix the 3D Lab camera controls without stopping until verified: pan must not feel constrained, named orthographic/isometric views must avoid clipping and frame the lesson subject, site-development layers must stay restored, and the camera toolbar must not collide with the footer. New follow-up: add explicit Zoom In/Zoom Out buttons with a zoom slider and Zoom Extents that frames the virtual lesson model, not the ground grid.

## Desired outcome
- Pan mode behaves like a modeling app: click/drag can translate the camera/target freely across the canvas and continues while dragging outside the canvas.
- Orbit + modifier pan remains available.
- Zoom buttons, a direct zoom slider, and Zoom Extents are available in the shared 3D Lab camera toolbar.
- Zoom Extents computes visible lesson geometry bounds and ignores grid/ground/gizmos/scene chrome.
- Site Development Controls keeps restored layer toggles, including Context Buildings.
- Verification includes focused unit tests, controls audit, typecheck, eslint, and diff hygiene.

## Known facts/evidence
- SketchUp official help describes Pan as moving the camera vertically/horizontally, Zoom as focus/reorient, Zoom Extents as making the whole model visible and centered, and Shift+Z as a Zoom Extents shortcut.
- Durable OMX team launch is currently blocked by a dirty leader worktree with unrelated landing deletions/marketing changes; avoid stashing/committing those unrelated changes.
- Existing 3D Lab shared controls route through useViewportShellStore, CameraNavigationBar, useCameraSnap, SceneConfig, CanvasWrapper, and ThreeDLabControlsProvider.
- Current patch already replaced native OrbitControls pan gestures with a capture-phase custom pan override and restored layers panel content.

## Constraints
- Do not clobber unrelated dirty landing/marketing work.
- Use Bun for repo scripts.
- No new dependencies.
- Keep diffs small and localized to 3D Lab controls/audit where possible.
- Root AGENTS and src/features/3d-lab/AGENTS.md apply.

## Unknowns/open questions
- Full browser runtime validation may be limited by local auth/server state; static/unit/audit evidence must explicitly cover the interaction contract.

## Likely touchpoints
- src/features/3d-lab/components/rendering/SceneConfig.tsx
- src/features/3d-lab/hooks/useCameraSnap.ts
- src/features/3d-lab/components/shell/CameraNavigationBar.tsx
- src/features/3d-lab/stores/useViewportShellStore.ts/test.ts
- src/features/3d-lab/utils/camera-presets.ts/test.ts
- src/features/3d-lab/components/controls/ThreeDLabControlsProvider.tsx
- .ai/00_performance/scripts/3d-lab-layout-controls-audit.mjs
