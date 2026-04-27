# 39 — 3D Lab Module Smoke and Mobile WebGL Pass

Generated: 2026-04-27T12:14:23Z

## Full module smoke matrix
Command:

```bash
bun run perf:3d:smoke
```

Raw result: `.ai/00_performance/results/3d_lab_module_smoke_results.json`

Result summary:
- Modules/routes measured: **209**
- Successful measurements: **209**
- Failed measurements: **0**
- Critical console/runtime errors: **0**
- p50 route duration: **1273.43 ms**
- p95 route duration: **1571.69 ms**
- max route duration: **1866.65 ms**
- p50 transfer: **1939 B**
- p95 transfer: **4804 B**
- max transfer: **1051213 B**

Slowest measured module routes:

| Module | Duration | Transfer | Resource count | Canvas count |
| --- | ---: | ---: | ---: | ---: |
| `column-construction-sequence` | 1866.65 ms | 2483 B | 54 | 2 |
| `unified-wall-configurator` | 1787.76 ms | 15353 B | 55 | 2 |
| `smoke-control-systems` | 1706.60 ms | 2055 B | 54 | 2 |
| `egress-simulation` | 1702.19 ms | 2515 B | 54 | 2 |
| `quantity-takeoff-room` | 1695.44 ms | 1674 B | 54 | 2 |
| `project-delivery-methods` | 1694.01 ms | 2179 B | 54 | 2 |

## Mobile/mid-range emulation pass
Command:

```bash
bun run perf:3d:mobile
```

Raw result: `.ai/00_performance/results/3d_lab_mobile_webgl_results.json`

This is a Playwright Pixel 7 emulation pass, not a physical Android GPU profile.

| Route | Duration | Transfer | WebGL support | Canvas count | Critical errors |
| --- | ---: | ---: | --- | ---: | ---: |
| `/dashboard/3d-lab` | 1195.49 ms | 710225 B | true | 0 | 0 |
| `/dashboard/3d-lab/accessible-bathing` | 1337.04 ms | 372708 B | true | 2 | 0 |
| `/dashboard/3d-lab/accessible-corridor-widths` | 1465.30 ms | 15762 B | true | 2 | 0 |
| `/dashboard/3d-lab/accessible-counter-heights` | 1517.61 ms | 1883 B | true | 2 | 0 |

## Fallback pass
Command:

```bash
bun run perf:3d:fallbacks
```

Raw result: `.ai/00_performance/results/3d_lab_fallback_results.json`

| Fallback | Observed signal |
| --- | --- |
| Unsupported WebGL | `3dlab-webgl-unavailable` visible |
| Context loss | `3dlab-webgl-recovery` visible after synthetic context loss |
| Slow scene | `3dlab-slow-scene-notice` visible with test-only scene-ready hold |

## Console/runtime policy
Raw result: `.ai/00_performance/results/3d_lab_console_policy_results.json`

Latest module smoke console policy summary:
- Total measurements: **209**
- Measurements with critical errors: **0**
- Critical errors: **0**

## Interpretation
The full module matrix now has a concrete smoke ledger. It proves that every parsed 3D module route loads in the built demo-auth app without login redirects, navigation failures, unsupported WebGL fallback, or critical console/runtime errors in the local Chromium runner.

It does **not** prove real-device FPS, thermal behavior, GPU memory, or slow-network asset behavior. Those require physical-device or BrowserStack-style device profiling.
