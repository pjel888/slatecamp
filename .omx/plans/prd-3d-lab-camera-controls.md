# PRD — 3D Lab camera controls emergency fix

## Problem
3D Lab camera controls are undermining core learning: pan feels constrained, named views can frame incorrectly, and the user needs explicit zoom controls and Zoom Extents that frame only the virtual lesson model.

## Acceptance criteria
1. Pan mode uses deterministic camera/target translation instead of relying on OrbitControls target-distance behavior.
2. Pan gestures keep working outside the canvas after pointer-down capture.
3. Toolbar exposes Zoom In, Zoom Out, Zoom Extents, and a direct zoom slider.
4. Slider changes issue camera commands and preserve current named view/projection state.
5. Zoom Extents computes bounds from visible lesson geometry while excluding grid, ground, helpers, cameras, and lights.
6. Named orthographic/isometric view fits remain module-aware and avoid excessive distance/clipping.
7. Site development layer panel and Context Buildings layer remain available.
8. Verification passes: focused tests, controls audit, typecheck, eslint, diff check.

## Non-goals
- No new dependency.
- No broad redesign of all 3D Lab templates.
- No modification of unrelated landing/marketing dirty work.
