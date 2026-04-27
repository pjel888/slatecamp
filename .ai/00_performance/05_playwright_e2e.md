# 05 — Playwright E2E Performance

Generated: 2026-04-27T03:58:06.954Z

## User-flow timing proxy results
| Flow | Status | Duration ms | Blocker/error |
| --- | --- | ---: | --- |
| open app to first visible UI | measured | 21148 |  |
| open app to first visible UI | measured | 1282 |  |
| open app to first visible UI | measured | 1540 |  |
| login entry to authenticated dashboard (demo auth) | failed | 31218 | page.waitForURL: Timeout 20000ms exceeded.
=========================== logs ===========================
waiting for navigation until "load"
============================================================ |
| dashboard primary data visible (demo auth) | measured | 20368 |  |
| wiki search/filter proxy (demo auth) | failed | 39451 | No textbox/search input found on /dashboard/wiki |
| login entry to authenticated dashboard (demo auth) | measured | 13371 |  |
| dashboard primary data visible (demo auth) | measured | 998 |  |
| wiki search/filter proxy (demo auth) | failed | 6190 | No textbox/search input found on /dashboard/wiki |
| login entry to authenticated dashboard (demo auth) | failed | 20159 | page.waitForURL: Timeout 20000ms exceeded.
=========================== logs ===========================
waiting for navigation until "load"
============================================================ |
| dashboard primary data visible (demo auth) | measured | 15101 |  |
| wiki search/filter proxy (demo auth) | failed | 17944 | No textbox/search input found on /dashboard/wiki |

## Auth flow status
- Demo auth enabled: yes
- If demo auth is disabled and no test credentials are present, login/signup measurements are intentionally blocked to avoid storing secrets.

## Raw evidence
- Raw flow JSON: `.ai/00_performance/results/frontend_user_flows_results.json`
- Playwright spec: `.ai/00_performance/playwright/perf.spec.ts`

## Notes
- This test suite is intended for repeatable local/CI trend measurement, not one-off visual correctness.
- Existing functional E2E specs remain under `e2e/`; this performance spec stores its outputs under `.ai/00_performance`.
