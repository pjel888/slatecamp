# 32 — Next Regression Gates Update

Generated: 2026-04-27T04:03:39Z

## Can `/dashboard/3d-lab` rejoin the full frontend suite?
Yes, for **warning-only measurement**. The full local dev suite completed with exit 0, and `/dashboard/3d-lab` was measured as authenticated demo content.

It should **not** become a hard gate yet because the full dev-server run still emitted memory-threshold restart warnings.

## Current 3D gate evidence
| Lane | Result | Evidence |
| --- | --- | --- |
| Dev isolated 3D | Pass, warning-only | Cold p95 23,240 ms; max RSS 1925.6 MiB; no memory warnings. |
| Analytics → 3D route sequence | Pass, warning-only | Max RSS 2142.2 MiB; no memory warnings. |
| Dashboard → Wiki → Analytics → 3D sequence | Pass, warning-only | Max RSS 2395.7 MiB; no memory warnings. |
| Full local dev suite | Pass but not hard-gate ready | 15 passed; max RSS 2476.2 MiB; memory warning observed. |
| Built-app authenticated 3D | Pass, gate candidate | Cold p95 1,556 ms; warm p95 1,356 ms; max RSS 211.7 MiB; no memory warning; no login redirect. |

## Recommended budgets
| Budget | Current evidence | Warning threshold | Hard failure status |
| --- | ---: | ---: | --- |
| 3D dev isolated cold p95 | 23,240 ms | +20% after 3 comparable isolated baselines | warning-only; noisy dev compile waits |
| 3D dev isolated server RSS | 1925.6 MiB | > 2.25 GiB or any memory warning | warning-only |
| Full local dev memory warnings | 2 | any memory warning | not hard-gate ready |
| Built auth 3D cold p95 | 1,556 ms | > 2,000 ms after 3 comparable baselines | candidate |
| Built auth 3D server RSS | 211.7 MiB | > 300 MiB after 3 comparable baselines | candidate |
| Built auth 3D content signal | authenticated content | login redirect or locked/upgrade copy | candidate hard assertion after repeat history |
| Registry direct config imports | 0 | any increase above 0 | candidate hard static gate after review |

## Current comparable baselines
- Local dev broad baseline: 2 accepted full-suite passes after 3D remediation, both with memory warning.
- 3D route-isolated dev: 2+ comparable route-isolated runs after split/profiler.
- Built public redirect: prior baseline exists but is no longer equivalent to authenticated content.
- Built authenticated 3D: 1 comparable baseline; needs at least 2 more before hard gate.

## Gate recommendations
1. Keep full `bun run perf:frontend` warning-only until it passes three times without memory-threshold restarts on the same runner.
2. Use `PERF_ROUTE_FILTER=/dashboard/3d-lab PERF_USER_FLOWS=false bun run perf:frontend` as the near-term dev 3D route lane.
3. Prefer `bun run perf:build:demo-auth` + built-auth 3D route perf for production-like 3D gating.
4. Keep static registry guard as a hard-gate candidate: category registry files must not import full module config/viewer/R3F code again.
5. Keep built-app public nav warning-only because protected routes can be login redirects unless demo-auth build is used.

## Evidence reports
- `.ai/00_performance/34_dev_server_memory_profile.md`
- `.ai/00_performance/35_authenticated_built_app_3d_timing.md`
- `.ai/00_performance/36_3d_hard_gate_decision.md`


## 2026-04-27 production-hardening update

New active warning-gate commands:

```bash
bun run perf:3d:built-auth-repeat
bun run perf:3d:onboarding
bun run perf:3d:mobile
bun run perf:3d:smoke
bun run perf:3d:gates
```

New local evidence:
- Built-auth 3D repeat: 3/3 passes, cold p95 spread 4.16%, warm p95 spread 2.48%, no route errors.
- Module smoke: 209/209 routes successful, 0 critical console/runtime errors.
- Mobile WebGL emulation: 4/4 routes successful in Pixel 7 emulation, WebGL supported, 0 critical errors.
- Onboarding: first-run global orientation and post-skip module card each measured as exactly one active tutorial surface.
- Gate check: `bun run perf:3d:gates` returned success=true with no warnings/failures in warning mode.

CI update:
- `.github/workflows/3d-performance-warning.yml` now runs these lanes as a warning-only workflow on 3D/performance-harness changes and manual dispatch.
- Hard gates remain disabled until at least three comparable CI-runner baselines exist and real device/staging auth gaps are resolved or accepted as separate launch blockers.
