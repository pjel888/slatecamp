# 37 — 3D Lab Production Hardening Loop

Generated: 2026-04-27T12:14:23Z
Branch: `main`
Commit: `081770758b1bfaddfdbc73ed26e7b99c383a8b50`

## Scope
This loop converted the previous warning-gate candidate into a measurable 3D production-hardening system. It does **not** claim real-device or live Supabase Auth production completeness; those remain separate staging/field validation requirements.

## What changed
- Added a dedicated built-app 3D Playwright config: `.ai/00_performance/playwright/playwright.3d.config.ts`.
- Added a 3D production hardening spec: `.ai/00_performance/playwright/3d-lab-production.spec.ts`.
- Added repeat/gate scripts:
  - `.ai/00_performance/scripts/3d-lab-built-auth-repeat.mjs`
  - `.ai/00_performance/scripts/3d-lab-gate-check.mjs`
- Added package commands:
  - `bun run perf:3d:built-auth-repeat`
  - `bun run perf:3d:auth-timing`
  - `bun run perf:3d:onboarding`
  - `bun run perf:3d:smoke`
  - `bun run perf:3d:mobile`
  - `bun run perf:3d:fallbacks`
  - `bun run perf:3d:gates`
- Added warning-only GitHub Actions gate: `.github/workflows/3d-performance-warning.yml`.

## Three comparable built-auth 3D passes
Command:

```bash
bun run perf:3d:built-auth-repeat
```

Raw result: `.ai/00_performance/results/3d_lab_built_auth_repeat_results.json`

| Metric | Pass 1 | Pass 2 | Pass 3 | Spread |
| --- | ---: | ---: | ---: | ---: |
| Cold p95 | 1499.79 ms | 1439.85 ms | 1446.49 ms | 4.16% |
| Warm p95 | 1379.42 ms | 1351.48 ms | 1346.06 ms | 2.48% |
| Error count | 0 | 0 | 0 | — |
| Median transfer | 360856.5 B | 360855.5 B | 360856.5 B | effectively stable |

Decision: **passed as warning-gate evidence**. The three built-auth passes are comparable, stable, and below the current 20% warning regression spread.

## Authenticated built-app timing
Command:

```bash
bun run perf:3d:auth-timing
```

Raw result: `.ai/00_performance/results/3d_lab_auth_timing_results.json`

Measured result:
- Route: `/dashboard/3d-lab`
- Status: `200`
- Demo-auth duration: `1193.26 ms`
- Requests: `51`
- Transfer: `710230 B`
- Login redirect: `false`
- 3D hub content signal: `true`

## Fallback hardening evidence
Command:

```bash
bun run perf:3d:fallbacks
```

Raw result: `.ai/00_performance/results/3d_lab_fallback_results.json`

Observed fallback surfaces:
- Unsupported WebGL fallback: visible (`webglUnavailableVisible=2`, supported=false in forced unsupported context).
- Context-loss recovery fallback: visible (`webglRecoveryVisible=2` after synthetic `webglcontextlost`).
- Slow-scene notice: visible (`slowSceneNoticeVisible=2` with test-only scene-ready hold and 100 ms timeout).

## Warning gate result
Command:

```bash
bun run perf:3d:gates
```

Raw result: `.ai/00_performance/results/3d_lab_gate_check_results.json`

Result: **success=true**, warning mode, **0 warnings**, **0 failures**.

## Remaining blockers
- Real staging/prod credential-submit auth timing still needs safe credentials via env names only; no secret values are stored.
- Mobile pass is Playwright Pixel 7 emulation on the CI/local host, not physical mid-range Android GPU profiling.
- Full local Next dev-suite memory-threshold warnings remain a dev-server observability issue from previous loop; built-app 3D route evidence is stable.
