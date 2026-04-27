# 21 — Supabase Query Tightening

Generated: 2026-04-27T00:21:30.021Z

## Scope
This remediation pass did **not** blindly edit all broad-read candidates. It targeted low-risk, high-confidence query-shape improvements from the accepted audit and read-only subagent review. Live Supabase latency/EXPLAIN remains blocked without a safe read-only credentialed plan.

## Changes made

| File | Change | Expected effect |
| --- | --- | --- |
| `src/lib/actions/analytics-data.ts` | `getSessionHistory` now fetches interactions only for the 30 selected session IDs instead of every interaction for the user. | Lower row transfer and JS grouping work on analytics session history. |
| `src/lib/actions/wiki-actions.ts` | Replaced wiki/taxonomy `select("*")` calls with explicit column constants and capped article sibling reads at 100. | Removes broad row payload ambiguity on wiki/sidebar/sibling paths. |
| `src/lib/actions/quiz-v2/successive-relearning.ts` | Replaced repeated `successive_relearning_cycles.select('*')` reads/update returns with `SR_CYCLE_COLUMNS`. | Keeps SR state-machine payload to the fields required by `SRCycle`. |

## Static inventory before/after

| Metric | Before | After | Delta |
| --- | ---: | ---: | ---: |
| Select-star candidates | 19 | 9 | -10 |
| Missing-limit / broad-read candidates | 160 | 160 | 0 |
| Query blocks scanned | 536 | 538 | 2 |

Removed select-star candidates from static inventory:

| Location | Table |
| --- | --- |
| `src/lib/actions/quiz-v2/successive-relearning.ts:67` | `successive_relearning_cycles` |
| `src/lib/actions/quiz-v2/successive-relearning.ts:114` | `successive_relearning_cycles` |
| `src/lib/actions/quiz-v2/successive-relearning.ts:147` | `successive_relearning_cycles` |
| `src/lib/actions/quiz-v2/successive-relearning.ts:188` | `successive_relearning_cycles` |
| `src/lib/actions/quiz-v2/successive-relearning.ts:289` | `successive_relearning_cycles` |
| `src/lib/actions/wiki-actions.ts:96` | `wiki_article_sources` |
| `src/lib/actions/wiki-actions.ts:179` | `wiki_articles` |
| `src/lib/actions/wiki-actions.ts:284` | `wiki_articles` |
| `src/lib/actions/wiki-actions.ts:326` | `taxonomy_tree` |
| `src/lib/actions/wiki-actions.ts:524` | `taxonomy_tree` |

## Behavior and risk notes
- `getSessionHistory` behavior is intended to remain equivalent because the chart only needs interactions belonging to the selected sessions.
- Wiki article/taxonomy helpers still return the known fields consumed by current callers; this is a payload/shape tightening, not a route behavior change.
- SR cycle updates still return every field in `SRCycle`.
- Broad-read count did not move because this pass did not add potentially behavior-changing limits to admin/taxonomy/analytics all-time surfaces without fixtures/EXPLAIN evidence.

## Verification
| Command | Exit | Log |
| --- | ---: | --- |
| `bun run perf:supabase` | 0 | `.ai/00_performance/logs/remediation-perf-supabase-after-tightening.log` |
| `bun run type-check` | 0 | `.ai/00_performance/logs/remediation-type-check-after-code.log` |
| `bun run lint` | 0 | `.ai/00_performance/logs/remediation-lint-after-dashboard-supabase.log` |

## Evidence files
- Before inventory: `.ai/00_performance/results/supabase_query_tightening_before.json`
- After inventory: `.ai/00_performance/results/supabase_query_tightening_after.json`
- Before/after summary: `.ai/00_performance/results/supabase_query_tightening_before_after.json`

## Remaining high-impact query candidates
1. Dashboard Bloom tracker broad reads: needs product decision on lifetime vs recent-window stats.
2. Admin content index bulk payload: needs admin fixture and transform benchmark before limiting/search-changing edits.
3. Focus-review cron and CEO analytics scans: should move toward batched RPC/materialized views after live row-count evidence.
4. Notes initial load: likely needs pagination/search UX, not just a blind `.limit()`.
