# Test Spec — 3D Lab Camera Controls Fix

## Static/code verification
- Targeted unit tests for camera preset/store behavior.
- Targeted tests for SceneConfig camera/control behavior if feasible under existing test setup.
- ESLint on all changed 3D Lab camera/control files.
- Repo type-check.
- 3D controls audit script.
- git diff whitespace check.

## Manual/browser expectations
- Dragging in pan mode repeatedly should keep moving the model view; it must not snap back to the scene origin.
- Shift+left drag in orbit mode should temporarily pan.
- Zoom-to-fit should center and frame the visible model.
- Standard/iso views should remain orthographic where intended.
- Floating camera toolbar should sit above the bottom footer/status bar.
