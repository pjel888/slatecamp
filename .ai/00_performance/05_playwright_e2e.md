# 05 — Playwright E2E Performance

Generated: 2026-04-27T02:37:08.393Z

## User-flow timing proxy results
| Flow | Status | Duration ms | Blocker/error |
| --- | --- | ---: | --- |
| open app to first visible UI | measured | 6562 |  |
| open app to first visible UI | measured | 273 |  |
| open app to first visible UI | measured | 296 |  |
| login entry to authenticated dashboard (demo auth) | measured | 17552 |  |
| dashboard primary data visible (demo auth) | measured | 473 |  |
| wiki search/filter proxy (demo auth) | failed | 25334 | No textbox/search input found on /dashboard/wiki |
| login entry to authenticated dashboard (demo auth) | measured | 2187 |  |
| dashboard primary data visible (demo auth) | measured | 525 |  |
| wiki search/filter proxy (demo auth) | failed | 298 | No textbox/search input found on /dashboard/wiki |
| login entry to authenticated dashboard (demo auth) | measured | 1263 |  |
| dashboard primary data visible (demo auth) | measured | 342 |  |
| wiki search/filter proxy (demo auth) | failed | 246 | No textbox/search input found on /dashboard/wiki |

## Auth flow status
- Demo auth enabled: yes
- If demo auth is disabled and no test credentials are present, login/signup measurements are intentionally blocked to avoid storing secrets.

## Raw evidence
- Raw flow JSON: `.ai/00_performance/results/frontend_user_flows_results.json`
- Playwright spec: `.ai/00_performance/playwright/perf.spec.ts`

## Notes
- This test suite is intended for repeatable local/CI trend measurement, not one-off visual correctness.
- Existing functional E2E specs remain under `e2e/`; this performance spec stores its outputs under `.ai/00_performance`.
