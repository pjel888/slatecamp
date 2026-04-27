# 40 — 3D Lab CI Gate Status

Generated: 2026-04-27T12:14:23Z

## Current status
3D Lab now has an active **warning-only** CI gate workflow:

- `.github/workflows/3d-performance-warning.yml`

The workflow runs when 3D Lab or performance-harness files change and can also be triggered manually.

## Commands behind the gate
```bash
bun run perf:3d:built-auth-repeat
bun run perf:3d:onboarding
bun run perf:3d:mobile
bun run perf:3d:smoke
bun run perf:3d:fallbacks
bun run perf:3d:gates
```

## Why warning-only
Hard failures are still intentionally disabled because:
1. The project does not yet have three stable CI-runner baselines for the new 3D warning workflow.
2. Physical mid-range Android GPU behavior has not been profiled.
3. Real staging/prod credential-submit auth timing is still blocked without safe credentials.
4. Previous full local dev-suite runs still observed Next dev-server memory-threshold warnings, even though built-app 3D evidence is stable.

## Promotion criteria for hard gates
Promote selected checks to hard failures only after all are true:
- At least three comparable CI workflow runs complete with stable built-auth cold/warm p95 values.
- Full module smoke remains 100% green with no critical console/runtime errors.
- Mobile-emulated pass remains green and a physical mid-range Android pass has been captured or explicitly accepted as a later launch-blocking item.
- Unsupported WebGL, context-loss, and slow-scene fallback checks stay green.
- Demo-auth and staging/prod-like credential auth timing are separately labeled.
- Gate thresholds are set from observed CI medians/p95, not local developer-machine timings.

## Current local gate evidence
- `bun run perf:3d:gates`: success=true, warnings=0, failures=0.
- `bun run perf:3d:built-auth-repeat`: 3/3 passes, cold p95 spread 4.16%, warm p95 spread 2.48%.
- `bun run perf:3d:smoke`: 209/209 routes successful, 0 critical errors.
- `bun run perf:3d:mobile`: 4/4 routes successful in Pixel 7 emulation, 0 critical errors.
- `bun run perf:3d:onboarding`: no measured state had more than one tutorial surface.
- `bun run perf:3d:fallbacks`: unsupported WebGL, context loss, and slow-scene fallbacks observed.

## Artifact locations
- Repeat pass: `.ai/00_performance/results/3d_lab_built_auth_repeat_results.json`
- Module smoke: `.ai/00_performance/results/3d_lab_module_smoke_results.json`
- Mobile pass: `.ai/00_performance/results/3d_lab_mobile_webgl_results.json`
- Auth timing: `.ai/00_performance/results/3d_lab_auth_timing_results.json`
- Onboarding: `.ai/00_performance/results/3d_lab_onboarding_overlay_results.json`
- Fallbacks: `.ai/00_performance/results/3d_lab_fallback_results.json`
- Gate check: `.ai/00_performance/results/3d_lab_gate_check_results.json`
