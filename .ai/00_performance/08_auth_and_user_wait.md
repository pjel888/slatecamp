# 08 — Auth and Perceived User Wait

Generated: 2026-04-27T04:04:04.250Z

## User-flow timing results
| Flow | Status | Duration | Blocker/error |
| --- | --- | ---: | --- |
| open app to first visible UI | measured | 21148 ms |  |
| open app to first visible UI | measured | 1282 ms |  |
| open app to first visible UI | measured | 1540 ms |  |
| login entry to authenticated dashboard (demo auth) | failed | 31218 ms | page.waitForURL: Timeout 20000ms exceeded.
=========================== logs ===========================
waiting for navigation until "load"
============================================================ |
| dashboard primary data visible (demo auth) | measured | 20368 ms |  |
| wiki search/filter proxy (demo auth) | failed | 39451 ms | No textbox/search input found on /dashboard/wiki |
| login entry to authenticated dashboard (demo auth) | measured | 13371 ms |  |
| dashboard primary data visible (demo auth) | measured | 998 ms |  |
| wiki search/filter proxy (demo auth) | failed | 6190 ms | No textbox/search input found on /dashboard/wiki |
| login entry to authenticated dashboard (demo auth) | failed | 20159 ms | page.waitForURL: Timeout 20000ms exceeded.
=========================== logs ===========================
waiting for navigation until "load"
============================================================ |
| dashboard primary data visible (demo auth) | measured | 15101 ms |  |
| wiki search/filter proxy (demo auth) | failed | 17944 ms | No textbox/search input found on /dashboard/wiki |

## Wait classification
| Wait surface | Classification | Evidence | Notes |
| --- | --- | --- | --- |
| App start to first visible UI | blocking-to-visible | Playwright user-flow proxy and route timing | Measured without real login secrets. |
| App start to authenticated state known | blocking auth/session wait | Middleware Supabase session update/getUser and dashboard user requirement | Demo auth measures route behavior; real auth latency needs test credentials. |
| App start to primary dashboard data visible | skeleton/loading + server data wait | Dashboard route/user-flow metrics and server data actions | Duplicate client analytics sync is a suspected avoidable wait. |
| Login submit to success UI | blocked/partially measured | Demo auth redirect can be measured | Real credentialed login blocked unless safe test account is supplied. |
| Signup submit to success UI | blocked | No safe signup fixture provided | Use disposable staging credentials and redact values. |
| Logout submit to logged-out UI | blocked | Not covered by current perf suite | Add safe demo-auth logout flow. |
| Route transition to usable page | loading/skeleton wait | Route loading files and Playwright timings | Add usability selectors for stricter meaningful-interaction timing. |
| Search/filter/sort to results updated | interaction wait | Wiki search proxy in demo auth | Add route-specific selectors for admin tables/wiki results. |
| Mutation to visible result/server state | blocked | Mutation endpoints/actions intentionally not called | Add non-production fixtures before measuring writes. |

## Loading-state review
- Inventory found 92 loading files.
- Loading states should be paired with data-visible budgets so they do not hide regressions.
- Admin/developer/CEO waits need safe role fixtures before full measurement.
