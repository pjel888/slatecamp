# 05 — Playwright E2E Performance

Generated: 2026-04-27T02:09:50.810Z

## User-flow timing proxy results
| Flow | Status | Duration ms | Blocker/error |
| --- | --- | ---: | --- |
| user flows | blocked | n/a | PERF_USER_FLOWS=false |

## Auth flow status
- Demo auth enabled: yes
- If demo auth is disabled and no test credentials are present, login/signup measurements are intentionally blocked to avoid storing secrets.

## Raw evidence
- Raw flow JSON: `.ai/00_performance/results/frontend_user_flows_results.json`
- Playwright spec: `.ai/00_performance/playwright/perf.spec.ts`

## Notes
- This test suite is intended for repeatable local/CI trend measurement, not one-off visual correctness.
- Existing functional E2E specs remain under `e2e/`; this performance spec stores its outputs under `.ai/00_performance`.
