# 26 — CI History and Comparison

Generated: 2026-04-27T00:27:10Z

## What was added
- `scripts/compare-performance.mjs` compares two `frontend_navigation_results.json`-style files.
- `package.json` now exposes `bun run perf:compare`.
- The first comparison artifact was written to `results/dev_vs_built_frontend_comparison.json`.

## Current comparison command
```bash
bun run perf:compare -- --base=.ai/00_performance/results/dev_server_frontend_baseline_before_built_app.json --candidate=.ai/00_performance/results/built_app_frontend_baseline.json --out=.ai/00_performance/results/dev_vs_built_frontend_comparison.json
```

## Result snapshot policy
Recommended folder shape:

```text
.ai/00_performance/results/history/
  2026-04-27-local-dev/
    frontend_navigation_results.json
    frontend_user_flows_results.json
    build_startup_results.json
    supabase_query_inventory.json
    component_hotspot_inventory.json
    baseline_summary.json
  2026-04-27-built-public/
    ...
```

Each snapshot should include:
- commit hash,
- branch,
- run mode (`dev-server`, `built-public`, `built-authenticated`, `staging`, `ci`),
- environment summary without secret values,
- raw JSON outputs,
- command logs.

## Proposed CI lanes

| Lane | Frequency | Commands | Gate mode |
| --- | --- | --- | --- |
| Static perf smoke | PR | `bun run perf:inventory && bun run perf:supabase && bun run perf:hotspots && bun run perf:summary` | warning-only |
| Build budget | PR or nightly | `bun run perf:build && bun run perf:summary` | warning-only until 3 stable baselines |
| Built public nav | nightly | `PLAYWRIGHT_USE_BUILT_APP=true PERF_USER_FLOWS=false bun run perf:frontend` | warning-only |
| Authenticated route perf | nightly after fixtures | `PLAYWRIGHT_USE_BUILT_APP=true PERF_AUTH_MODE=credentials bun run perf:frontend` | warning-only, then budgeted |
| API/provider mock perf | PR after script exists | mocked POST/provider benchmark | warning-only |
| Supabase live read timing | manual/staging | allowlisted read-only query benchmark | never on PR by default |

## Initial budgets
Do not hard-fail yet. Use warning thresholds until at least three comparable baselines exist.

| Surface | Current comparable baseline | Warning | Failure later |
| --- | ---: | ---: | ---: |
| `/dashboard` dev cold p95 after remediation | 3925 ms | +20% | +35% after 3 baselines |
| `/dashboard/3d-lab` hub raw chunk bytes after direct imports | 2120.8 KiB | +10% | +20% after metadata split |
| Select-star candidates | 9 | any increase in app runtime files | any high-traffic increase |
| Build p95 | current `build_startup_results.json` | +15% | +30% after 3 CI runs |
| Built public cold p95 | 1440 ms | +20% | +35% after 3 CI runs |

## Comparison script notes
- A negative delta means candidate is faster/smaller/lower.
- Auth-gated route comparisons must inspect `finalUrl`; redirect timings are not equivalent to authenticated screen timings.
- The script is intentionally JSON-only so future CI can post-process without scraping Markdown.

## Remaining automation work
1. Add a snapshot writer that copies current result files into `results/history/<timestamp>-<mode>/`.
2. Add route-specific budgets for `/`, `/dashboard`, `/dashboard/wiki`, `/dashboard/analytics`, `/dashboard/3d-lab`, `/admin`, and quiz flows.
3. Add API/provider mock benchmark output to the same comparison schema.
4. Add a warning-only GitHub Actions lane after the repo has agreed on runner variance and fixture mode.
