# 25 — Cron Scaling Remediation

Generated: 2026-04-27T00:26:50Z

## Findings

### `compute-signals`
The current code fetches active users, then performs approximately five DB operations per user.

```text
round trips ≈ 1 + (5 × active_users)
```

Examples:
- 100 active users → ~501 DB round trips
- 1,000 active users → ~5,001 DB round trips
- 10,000 active users → ~50,001 DB round trips

This remains the primary cron N+1 scaling risk.

### `focus-review-scan`
This route is mostly batched, but broad `.in(user_id, eligibleUserIds)` reads can grow large. The audit also found a schema mismatch in stale-queue cleanup.

## Change made

| File | Change |
| --- | --- |
| `src/app/api/cron/focus-review-scan/route.ts` | Changed stale queue expiration filter from non-schema `created_at` to schema-backed `generated_at` in both cleanup paths. |

Schema evidence:
- `DATABASE_SCHEMA.sql` defines `focus_review_queues.generated_at` and no `created_at` column.
- `src/types/supabase.ts` also exposes `generated_at` for `focus_review_queues`.

## What remains
- `compute-signals` should move to a SQL RPC or batched app-layer query/upsert. Best SQL shape: active users CTE, joined global stats, `DISTINCT ON (user_id)` baseline snapshot, grouped sessions, bulk `INSERT ... ON CONFLICT`.
- `focus-review-scan` should chunk large `.in(...)` lists or move to an RPC that derives eligible users and inserts queues in the database.
- No cron route was executed because both routes can mutate data and require `CRON_SECRET`.

## Mock benchmark plan
Create a no-live-DB query-count benchmark with synthetic user counts (`U=10/100/1000`) and a mocked `createAdminClient().from(...)` chain. Record query count and rows materialized without calling live Supabase.

## Verification
| Command | Exit | Log |
| --- | ---: | --- |
| `bun run type-check` | 0 | `.ai/00_performance/logs/remediation-type-check-after-cron.log` |

## Blocker
A destructive/live cron benchmark is blocked until `PERF_CRON_DRY_RUN` or a local seeded Supabase fixture exists. Variable names only: `CRON_SECRET`, `PERF_CRON_DRY_RUN`.
