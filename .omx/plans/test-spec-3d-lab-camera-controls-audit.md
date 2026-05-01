# Test Spec: 3D Lab Camera Controls Stability

## Static/unit coverage
- `camera-presets.test.ts`: projection command classification, default view preset, selected-view preservation, manual-orbit clearing rules.
- `useViewportShellStore.test.ts`: default SE+fit state, projection toggle preserves selected view, zoom commands preserve selected view/manual state, named views preserve projection.
- Audit script checks source-level invariants for projection decoupling, default SE+fit, zoom-to-fit model-only bounds, toolbar slider, and pan override.

## Runtime/browser coverage
- Launch a representative 3D module (`/dashboard/3d-lab/stairway-configurator` or equivalent).
- Confirm initial toolbar state: SE active, perspective active, slider present.
- Capture camera position/zoom before and after clicking `Iso`; assert subject remains in view and no massive distance jump occurs.
- Click `Persp` after `Iso`; assert view selection remains SE and subject remains framed.
- Click a named view; assert projection active button is unchanged.
- Use Fit; assert controls target and distance/zoom frame visible model, not grid.

## Verification commands
- `bun test src/features/3d-lab/utils/camera-presets.test.ts src/features/3d-lab/stores/useViewportShellStore.test.ts src/features/3d-lab/DevControlsModule/stores/useDevControlsStore.test.ts`
- `bun run perf:3d:controls-audit`
- `bun test src/features/3d-lab`
- `bun run type-check && bunx tsc --noEmit --project tsconfig.json`
- Targeted ESLint on changed camera/audit files
- `git diff --check`
