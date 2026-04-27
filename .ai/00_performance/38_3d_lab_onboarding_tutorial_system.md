# 38 — 3D Lab Onboarding and Tutorial System

Generated: 2026-04-27T12:14:23Z

## Problem
The 3D Lab had multiple independent first-run/tutorial surfaces that could overlap: global orientation, module context, viewport controls tooltip, and DevControls' special tour.

## Implemented system
New coordinator: `src/features/3d-lab/components/onboarding/state.ts`

It defines versioned storage keys, legacy key compatibility, one overlay priority order, and a runtime telemetry surface (`window.__slatecamp3dLabOnboarding`).

Overlay priority:
1. Global orientation.
2. Module context card.
3. Viewport tooltip.
4. Module-specific tours only after global orientation **and** module context completion.

## Code changes
- `ModuleViewer` owns one `activeOnboardingOverlay` state instead of separate onboarding/context booleans.
- `OnboardingFlow` and `ModuleContextCard` persist through the coordinator and no longer independently decide whether to render.
- `ViewportShell` accepts `suppressFirstTimeTooltip` so the viewport tooltip is hidden while a higher-priority tutorial surface is active.
- `FirstTimeTooltip` uses the coordinator keys and can be disabled by the shell.
- DevControls tour initialization now requires both global 3D onboarding and `site-development-controls` module context completion.
- `TourOverlay` exposes `data-testid="3dlab-devcontrols-tour-overlay"` for measurable gate checks.

## Measurement
Command:

```bash
bun run perf:3d:onboarding
```

Raw result: `.ai/00_performance/results/3d_lab_onboarding_overlay_results.json`

| Scenario | Global dialog | Module card | Viewport tooltip | DevControls tour | Active surfaces |
| --- | ---: | ---: | ---: | ---: | ---: |
| First run on `site-development-controls` | 1 | 0 | 0 | 0 | 1 |
| After skipping global orientation | 0 | 1 | 0 | 0 | 1 |
| Return visit with global complete but module context pending | 0 | 1 | 0 | 0 | 1 |

Result: **passed**. No measured first-run/return-visit state displayed more than one active tutorial surface.

## Regression test
Unit test added:

```bash
bun test src/features/3d-lab/components/onboarding/state.test.ts
```

Result: 4 tests passed.

## UX rule going forward
A 3D tutorial surface must register with the coordinator or be explicitly module-local and suppressed until global + module context onboarding are complete. New overlays must expose a stable `data-testid` so Playwright can count active tutorial surfaces.
