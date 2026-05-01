# PRD — 3D Lab Camera Controls Fix

## Problem
The 3D Lab camera navigation feels broken: pan behaves constrained/reset, zoom extents can leave the model too far away, camera clipping is fragile, and the floating camera toolbar overlaps the bottom footer.

## Acceptance criteria
- Pan mode and Shift+orbit pan can move freely without snapping back to the original target during drag/end rerenders.
- Camera target is initialized per scene/module but not declaratively re-applied on every React render.
- Perspective and orthographic cameras use sane near/far clipping planes for close inspection and large architectural diagrams.
- Zoom-to-fit frames actual visible scene geometry where possible instead of relying only on stale static camera presets.
- Zoom in/out does not push through the target or leave controls in an inconsistent state.
- Floating/local camera toolbar has safe bottom clearance and does not overlap the shell footer/status bar.
- Existing camera preset, projection, and shortcut tests pass; new regressions cover unconstrained pan and clipping defaults where practical.
