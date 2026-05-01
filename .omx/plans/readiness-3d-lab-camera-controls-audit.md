# Readiness Plan: 3D Lab Camera Controls Fix

## Verdict
Ready to implement with contained 3D Lab blast radius.

## Blockers
- GitNexus MCP/CLI impact tooling unavailable; fallback blast-radius analysis is documented in `.omx/context/3d-lab-camera-controls-blast-radius-20260429T025000Z.md`.
- Existing working tree includes unrelated landing/marketing edits that must be preserved and excluded from camera verification claims.

## Required validations
- Targeted camera utility/store tests.
- 3D Lab store tests including DevControls camera replay.
- Static 3D controls audit.
- Type-check and targeted ESLint.
- Browser sanity check on one representative 3D Lab route for default SE+fit and projection toggle framing.
- `git diff --check`.

## Implementation approach
1. Add an explicit default camera-view constant (`iso-se`) and set the viewport store initial command to one `zoom-to-fit` action with selected view `iso-se`.
2. Make zoom-to-fit use the selected named view direction when the user is not in manual orbit, so default fit is SE without issuing two competing commands.
3. Preserve equivalent visual framing across perspective/orthographic camera replacement by capturing the pre-switch camera frame and applying an equivalent orthographic zoom or perspective distance after the new camera becomes default.
4. Treat reset as home: perspective projection + SE model fit.
5. Keep pan unconstrained: no world/target clamps, only pan-scale protection for collapsed camera-target distance.
