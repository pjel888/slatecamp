# 30 — Dashboard Metric Reconciliation

Generated: 2026-04-27T02:14:57.748Z

## Verdict
The dashboard metric mismatch is scope, not math.

## Source values
| Scope | Source | Before | After | Delta |
| --- | --- | ---: | ---: | ---: |
| Overall frontend summary cold p95 | `dashboard_remediation_frontend_comparison.json.summary.coldP95Ms` | 25158 ms | 16961 ms | -8197 ms (-32.58%) |
| Targeted `/dashboard` route cold p95 | `dashboard_remediation_frontend_comparison.json.routes["/dashboard"].coldP95Ms` | 15046 ms | 3925 ms | -11121 ms (-73.92%) |

## Explanation
- `20_dashboard_remediation.md` uses the route-scoped `/dashboard` comparison: 15046 ms → 3925 ms.
- `14_bottlenecks_ranked.md` previously used the top-level aggregate frontend summary: 25158 ms → 16961 ms.
- Both values are emitted by `scripts/compare-performance.mjs`: one aggregate across measured routes and one for the target route.

## Canonical wording
Use the targeted route number for dashboard remediation claims:

> `/dashboard` cold p95 improved from 15046 ms to 3925 ms (-73.92%). Overall measured-route cold p95 improved from 25158 ms to 16961 ms (-32.58%).

## Updated summary rule
- Route-specific remediation reports should quote `routes[route]` values.
- CI/global budget summaries should quote top-level `summary` values and label them as aggregate.
