# Test Spec — 3D Lab camera controls emergency fix

## Unit coverage
- Camera command helpers preserve selected views for zoom commands and include direct zoom-set behavior.
- Viewport shell store updates camera command ids for repeated zoom/slider actions.
- Existing Dev Controls store tests continue to cover restored layers.

## Static/audit coverage
- 3D controls audit must assert:
  - no declarative OrbitControls target reset fighting manual controls,
  - capture-phase custom pan override with ownerDocument pointermove handling,
  - pan target radius guard,
  - model-only zoom extents exclusion flags / fit resolver,
  - zoom slider control in camera toolbar,
  - restored site-development layers panel and Context Buildings toggle.

## Type/style coverage
- bun run type-check
- bunx tsc --noEmit --project tsconfig.json
- eslint on changed camera/audit files
- git diff --check

## Runtime caveat
If local browser/auth state prevents interactive E2E, do not claim browser proof; rely on focused tests + static audit and state the caveat.
