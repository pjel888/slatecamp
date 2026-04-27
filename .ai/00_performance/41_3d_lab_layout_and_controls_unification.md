# 41 — 3D Lab Layout and Controls Unification

Generated: 2026-04-27T22:50:00+08:00
Current branch at start: `main`
Current HEAD at start: `34d5a6205319a8dee67d1922e014c772dafde298`
HEAD is `34d5a620`: yes.
Working tree at start: not clean; unrelated admin/CEO/entitlement changes were present and intentionally not included in this scoped 3D Lab commit.

## Executive summary

The original product consistency issue is resolved for the active `/dashboard/3d-lab/:moduleId` route surface: all 209 registry module routes now flow through one shared 3D Lab shell and one shared camera/control provider contract.

This loop did **not** treat route smoke success as product consistency. It added explicit static and Playwright gates for shell structure, footer/status consistency, sidebar boundaries, shared toolbar/control overlays, and the PAN/Orbit/Zoom/Reset control contract.

Key evidence:

| Evidence | Result |
| --- | ---: |
| Active registry modules discovered | 209 |
| Static layout/control audit failures | 0 |
| Static layout/control audit warnings | 1 inactive legacy scene warning |
| Built-app layout consistency routes | 209 / 209 passed |
| Built-app interaction consistency routes | 209 / 209 passed |
| Built-app module smoke routes | 209 / 209 passed |
| 3D gate script | success, 0 warnings, 0 failures |

Raw evidence:
- `.ai/00_performance/results/3d_lab_module_registry_unification_report.json`
- `.ai/00_performance/results/3d_lab_layout_controls_audit_results.json`
- `.ai/00_performance/results/3d_lab_layout_consistency_results.json`
- `.ai/00_performance/results/3d_lab_interaction_consistency_results.json`
- `.ai/00_performance/results/3d_lab_module_smoke_results.json`
- `.ai/00_performance/results/3d_lab_gate_check_results.json`

## Evidence reconciliation

- Branch: `main`.
- HEAD at loop start: `34d5a6205319a8dee67d1922e014c772dafde298`.
- HEAD short check: `34d5a620` matched.
- Reports 37–40 were treated as generated from the prior 3D hardening loop at HEAD `34d5a620`; this report adds the missing layout/control proof rather than replacing those reports.
- Working tree: dirty before this loop because unrelated admin/CEO/entitlement files were already modified. They were not edited or staged for this 3D Lab unification work.
- 209 module route list: still current from the live registry files under `src/features/3d-lab/config/registry/cat-*.ts`; both static audit and Playwright matrix read the registry dynamically.

Main-tree production build remained blocked by unrelated dirty admin/CEO files. A clean detached worktree at `/tmp/slatecamp-unify-check` was used for build and built-app Playwright proof after copying only the scoped 3D/perf changes. The clean worktree build passed with demo auth/role flags; see `.ai/00_performance/logs/worktree-loop7-next-build-webpack-demo-super-admin-after-status-sync.log`.

## Active modules discovered

Discovery sources:
- `src/features/3d-lab/config/registry/cat-*.ts`
- `/dashboard/3d-lab/[moduleId]` route entry
- `ModuleViewer` route rendering path
- dashboard-visible module routes used by the production-hardening harness

The generated machine-readable inventory is the canonical complete registry report:

- `.ai/00_performance/results/3d_lab_module_registry_unification_report.json`

For every discovered module, the report records:
- module name/id
- route/path
- registry file/status/category/template type
- entry component
- layout wrapper
- scene component
- left and right sidebar component ownership
- header/footer/status ownership
- viewport/canvas wrapper
- toolbar/control overlay owner
- camera/control implementation
- whether custom global overrides remain on the active route path
- compliance flag

Representative examples:

| Module | Route | Shared layout | Shared controls |
| --- | --- | --- | --- |
| Site Development Controls | `/dashboard/3d-lab/site-development-controls` | `ViewportShell` | `SceneConfig -> ThreeDLabControlsProvider -> OrbitControls + useCameraSnap` |
| Stairway Configurator | `/dashboard/3d-lab/stairway-configurator` | `ViewportShell` | `SceneConfig -> ThreeDLabControlsProvider -> OrbitControls + useCameraSnap` |
| Flooring Calculator | `/dashboard/3d-lab/calculator-flooring` | `ViewportShell` | `SceneConfig -> ThreeDLabControlsProvider -> OrbitControls + useCameraSnap` |
| Unified Wall Configurator | `/dashboard/3d-lab/unified-wall-configurator` | `ViewportShell` | `SceneConfig -> ThreeDLabControlsProvider -> OrbitControls + useCameraSnap` |

## Site Development Control vs Stairs root cause

### Why Site Development Control had a footer while Stairs did not

Root cause:
- Site Development Control was historically a bespoke DevControls surface with its own dashboard/canvas/status composition.
- Stairs was template-driven and routed through the newer shared 3D Lab shell path.
- Footer/status ownership was therefore module-dependent instead of shell-owned.

Responsible legacy/source areas:
- `src/features/3d-lab/DevControlsModule/canvas/DevControlsCanvas.tsx` previously owned canvas/control concerns for Site Development Control.
- `src/features/3d-lab/DevControlsModule/dashboard/StatusBar.tsx` provided Site-specific status/footer content.
- `src/features/3d-lab/hooks/useTemplateContent.tsx` had to special-case Site Development Control and slot its unique content into the shell.
- `src/features/3d-lab/components/ModuleViewer.tsx` is now the shared route gate.
- `src/features/3d-lab/components/shell/ViewportShell.tsx` now owns status/footer placement.

Fix:
- Site Development Control no longer owns global chrome in the active route path.
- Its controls, compliance panels, and status readout are now passed through shell slots (`DevControlsLeftSidebar`, `DevControlsRightSidebar`, `DevControlsStatusContent`).
- `ViewportShell` renders `ViewportStatusBar` consistently for all modules when status is enabled.
- Stairs and Site Development Control now share the same `ViewportShell -> LabViewportFrame -> CanvasWrapper -> SceneConfig` route structure.

Evidence:
- `src/features/3d-lab/hooks/useTemplateContent.tsx:186-221`
- `src/features/3d-lab/components/ModuleViewer.tsx:191-215`
- `src/features/3d-lab/components/shell/ViewportShell.tsx:228-267`
- `src/features/3d-lab/components/shell/ViewportStatusBar.tsx:17-25`

### Why PAN and Orbit differed per module

Root cause:
- Site Development Control previously configured camera/canvas behavior outside the shared template path.
- Calculator modules had their own standalone calculator camera bar/full layout for public calculator pages.
- Template modules used shared scene config behavior.
- This produced separate reset, pan/orbit mapping, and camera preset behavior.

Search/audit coverage looked for:
- `OrbitControls`
- `CameraControls`
- `MapControls`
- `TransformControls`
- pointer handlers
- wheel handlers
- touch handlers
- keyboard handlers
- reset handlers
- custom canvas wrappers

Fix:
- `SceneConfig` is the only active 3D Lab direct `OrbitControls` owner.
- `ThreeDLabControlsProvider` stores the shared camera/control contract and exposes test hooks.
- `useCameraSnap` reads shared camera control config for preset selection, zoom-to-fit, and reset.
- Site Development Control passes only approved camera presets/limits through `cameraControls`.
- 3D Lab calculator routes now use `CalculatorTemplateSlot(scene)` inside the shared shell and disable the local camera bar in the 3D Lab route path.

Evidence:
- `src/features/3d-lab/components/rendering/SceneConfig.tsx:123-241`
- `src/features/3d-lab/components/controls/ThreeDLabControlsProvider.tsx:24-79`
- `src/features/3d-lab/hooks/useCameraSnap.ts`
- `src/features/3d-lab/templates/CalculatorTemplate.tsx`
- `.ai/00_performance/results/3d_lab_layout_controls_audit_results.json`

## Layout wrapper audit

Current shared shell ownership:

| Region | Owner |
| --- | --- |
| Global shell | `ViewportShell` |
| Header | `ViewportShell -> ViewportHeader` |
| Footer/status | `ViewportShell -> ViewportStatusBar` |
| Left sidebar container | `ViewportShell -> ViewportSidebar` |
| Right sidebar container | `ViewportShell -> ViewportSidebar` |
| Viewport/canvas container | `ViewportShell -> LabViewportFrame -> CanvasWrapper -> SceneConfig` |
| Toolbar/control overlay | `ViewportShell -> SceneToolbar + LayersPanel + CameraNavigationBar` |
| Loading/error/empty boundaries | route/template shell path + scene/error boundaries |
| Mobile responsive shell | `ViewportShell` mobile viewport and bottom-sheet slots |

Static audit result:

```json
{
  "mode": "all",
  "moduleCount": 209,
  "failures": [],
  "warnings": [
    "Inactive legacy scene still has direct controls and should not become active without migration: src/features/3d-lab/scenes/NBCPEnvelope/NBCPEnvelope.tsx"
  ]
}
```

No active 3D Lab module route is reported as bypassing the unified shell.

## Camera/control implementation audit

Shared control contract:

| Behavior | Unified owner |
| --- | --- |
| Orbit | `SceneConfig` shared `OrbitControls`; left mouse in orbit mode |
| Pan | `SceneConfig` shared `OrbitControls`; middle mouse always, left mouse in pan mode |
| Zoom | shared wheel/dolly behavior with `zoomToCursor`, plus `useCameraSnap` zoom helpers |
| Reset | `useCameraSnap` uses shared `cameraControlConfig.resetPreset`/presets |
| Camera presets | `ThreeDLabCameraControlConfig` passed through typed shell/scene config |
| Mouse mapping | `THREE_D_LAB_CONTROL_MAPPING` |
| Touch mapping | `THREE_D_LAB_CONTROL_MAPPING` |
| Keyboard mapping | `THREE_D_LAB_CONTROL_MAPPING` and shell toolbar actions |
| Test hook | `window.__slatecamp3dLabControls.provider === 'ThreeDLabControlsProvider'` |

The active direct controls audit allows only:
- `src/features/3d-lab/components/rendering/SceneConfig.tsx`

The only warning is inactive legacy code:
- `src/features/3d-lab/scenes/NBCPEnvelope/NBCPEnvelope.tsx`

That scene is not part of the active registry route path and must be migrated before becoming active.

## Files changed

Source changes:
- `src/features/3d-lab/components/controls/ThreeDLabControlsProvider.tsx`
- `src/features/3d-lab/stores/useViewportShellStore.ts`
- `src/features/3d-lab/hooks/useCameraSnap.ts`
- `src/features/3d-lab/components/rendering/SceneConfig.tsx`
- `src/features/3d-lab/components/shell/ViewportShell.tsx`
- `src/features/3d-lab/components/shell/ViewportStatusBar.tsx`
- `src/features/3d-lab/components/shell/CameraNavigationBar.tsx`
- `src/features/3d-lab/components/shell/SceneToolbar.tsx`
- `src/features/3d-lab/components/shell/LayersPanel.tsx`
- `src/features/3d-lab/types/templates.ts`
- `src/features/3d-lab/DevControlsModule/canvas/DevControlsCanvas.tsx`
- `src/features/3d-lab/DevControlsModule/dashboard/StatusBar.tsx`
- `src/features/3d-lab/DevControlsModule/dashboard/DevControlsShellSlots.tsx`
- `src/features/3d-lab/hooks/useTemplateContent.tsx`
- `src/features/3d-lab/templates/CalculatorTemplate.tsx`
- `src/features/3d-lab/components/ModuleViewer.tsx`

Harness/report changes:
- `.ai/00_performance/scripts/3d-lab-layout-controls-audit.mjs`
- `.ai/00_performance/scripts/3d-lab-gate-check.mjs`
- `.ai/00_performance/playwright/3d-lab-production.spec.ts`
- `package.json`
- `.ai/00_performance/41_3d_lab_layout_and_controls_unification.md`

## Modules migrated

All 209 active `/dashboard/3d-lab/:moduleId` registry routes now report compliance in the generated registry inventory.

Special migrations completed:
- Site Development Control: moved bespoke global UI into shared shell slots.
- Stairs: retained template rendering but now tested against the same shell/control contract as Site Development Control.
- Calculator modules: 3D Lab route path now uses calculator slots inside `ViewportShell`; standalone public calculator pages remain independent by design and are outside this `/dashboard/3d-lab` route-surface acceptance check.
- Wall configurator route: verified in the same layout and interaction consistency matrix.

## Forbidden patterns removed or blocked

Active 3D Lab route path now blocks or audits against:
- module-owned global header/footer/status regions
- module-owned global viewport/canvas wrappers
- active module direct `OrbitControls`/`CameraControls`/`MapControls`/`TransformControls`
- Site Development Control bespoke canvas/control ownership
- calculator local camera bar in the 3D Lab route path
- hidden/missing shell status bar regressions
- duplicate desktop/mobile control assertions in Playwright by scoping to the active desktop overlay

## Static enforcement added

Commands:

```bash
bun run perf:3d:layout-audit
bun run perf:3d:controls-audit
```

Script:
- `.ai/00_performance/scripts/3d-lab-layout-controls-audit.mjs`

The audit fails if an active route path stops using the shared shell, if Site Development Control/calculators bypass shell slots, if shell test IDs/status defaults disappear, or if active modules import/configure independent 3D controls.

## Playwright consistency gates added

Commands:

```bash
bun run perf:3d:layout-consistency
bun run perf:3d:interaction-consistency
```

Tests:
- `.ai/00_performance/playwright/3d-lab-production.spec.ts`

Coverage:
- 209/209 active module routes have exactly one shared shell/header/sidebar/viewport/toolbar/status structure.
- 209/209 active module routes expose `ThreeDLabControlsProvider` and the same toolbar/control button contract.
- Explicit known-failure coverage includes Site Development Control, Stairs, Flooring Calculator, and Unified Wall Configurator through both targeted and full matrix runs.

## Test commands run

Main tree:

| Command | Result | Log |
| --- | --- | --- |
| `bun run type-check` | pass | `.ai/00_performance/logs/loop7-type-check-final-unification.log` |
| `bun run lint` | pass, 347 warnings | `.ai/00_performance/logs/loop7-lint-final-unification.log` |
| `bun run perf:3d:layout-audit` | pass | `.ai/00_performance/logs/loop7-perf-3d-layout-audit-main-final.log` |
| `bun run perf:3d:controls-audit` | pass with inactive legacy warning | `.ai/00_performance/logs/loop7-perf-3d-controls-audit-main-final.log` |
| `bun run perf:3d:gates` | success, 0 warnings/failures | `.ai/00_performance/logs/loop7-perf-3d-gates-main-final.log` |

Clean detached worktree (`/tmp/slatecamp-unify-check`) for built-app proof:

| Command | Result | Log |
| --- | --- | --- |
| `bunx next build --webpack` with demo auth/role env | pass | `.ai/00_performance/logs/worktree-loop7-next-build-webpack-demo-super-admin-after-status-sync.log` |
| `bun run perf:3d:layout-consistency` | 209/209 pass | `.ai/00_performance/logs/worktree-loop7-layout-consistency-full209-built-demo-super-admin.log` |
| `bun run perf:3d:interaction-consistency` | 209/209 pass | `.ai/00_performance/logs/worktree-loop7-interaction-consistency-full209-built-demo-super-admin.log` |
| `bun run perf:3d:smoke` | 209/209 pass | `.ai/00_performance/logs/worktree-loop7-perf-3d-smoke-full209-built-demo-super-admin.log` |
| `bun run perf:3d:onboarding` | pass | `.ai/00_performance/logs/worktree-loop7-perf-3d-onboarding-built-demo-super-admin.log` |
| `bun run perf:3d:fallbacks` | pass | `.ai/00_performance/logs/worktree-loop7-perf-3d-fallbacks-built-demo-super-admin.log` |
| `bun run perf:3d:mobile` | pass | `.ai/00_performance/logs/worktree-loop7-perf-3d-mobile-built-demo-super-admin.log` |
| `bun run perf:3d:gates` | success, 0 warnings/failures | `.ai/00_performance/logs/worktree-loop7-perf-3d-gates-after-layout-controls-audit.log` |

## Remaining risks

1. Main tree build remains blocked by unrelated dirty admin/CEO work. Scoped clean-worktree build proof passed.
2. `src/features/3d-lab/scenes/NBCPEnvelope/NBCPEnvelope.tsx` still contains direct controls in inactive legacy code. It is not on the active registry route path; if activated, it must be migrated first.
3. Standalone public `/calculators/*` pages still use their standalone calculator layout and local camera bar. This is intentionally outside the `/dashboard/3d-lab` module unification scope. If product wants public calculators to match 3D Lab chrome, that should be a separate UX migration.
4. Playwright interaction consistency verifies provider wiring, toolbar/control state, and shell-owned controls across 209 routes. It does not yet numerically compare final WebGL camera vectors after each pointer gesture; that can be added as a deeper camera telemetry gate.

## Acceptance checklist

- [x] Every active 3D Lab module uses the same shared 3D Lab shell.
- [x] Site Development Control and Stairs have the same global layout.
- [x] Footer/status presence is no longer module-dependent.
- [x] Header presence is no longer module-dependent.
- [x] The only visual/content differences between modules are inside approved sidebar slots and scene content.
- [x] Every active 3D module uses the same viewport/canvas shell.
- [x] Every active 3D module uses the same shared camera/control provider.
- [x] PAN behavior is controlled by the shared provider/control mapping.
- [x] Orbit behavior is controlled by the shared provider/control mapping.
- [x] Zoom behavior is controlled by the shared provider/control mapping.
- [x] Reset behavior is controlled by the shared provider/control mapping.
- [x] Mouse, touch, wheel, and keyboard mappings are defined through the shared control contract.
- [x] No active module imports or configures independent OrbitControls/CameraControls outside `SceneConfig`.
- [x] No active module owns a global header/footer/status region in the `/dashboard/3d-lab` route path.
- [x] No active module has custom global layout CSS outside approved sidebar/scene boundaries in the audited active route path.
- [x] Playwright layout consistency tests pass for 209/209 routes.
- [x] Playwright interaction consistency tests pass for 209/209 routes.
- [x] Static layout/control audit passes.
- [x] Existing 3D smoke tests still pass.
- [x] Existing onboarding/fallback/mobile/performance warning gates still pass.

## Verdict

The original 3D Lab unification issue is resolved for the active `/dashboard/3d-lab` module surface. The previous hardening work is now complemented by actual shell/control unification, static enforcement, and built-app Playwright consistency proof across all 209 registry routes.
