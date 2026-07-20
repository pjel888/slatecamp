# Plan 014 — Batch the cron `compute-signals` N+1 queries

> Audit: 2026-07-20, commit `064e3a43a`. Category: performance. Severity: HIGH. Effort: M. Risk: low.
> **Status: ✅ APPLIED.** Vetted against live code: `src/app/api/cron/compute-signals/route.ts:43-119` sequential `for (const userId of userIds)` loop with 5 queries per user.

## Why this mattered

The cron fired 5 sequential queries × N active users per invocation (5×N round-trips, linear in user count). At ~1k active users that's ~5k sequential queries inside one Vercel function — risk of timeout, Postgres connection churn. None of the queries needed to be per-user; they're all aggregatable.

## What was changed

Rewrote `src/app/api/cron/compute-signals/route.ts` to issue a fixed number of batched `.in('user_id', userIds)` queries regardless of user count:
1. ONE `user_global_stats` query → current score per user.
2. ONE `readiness_score_snapshots` query (ordered `user_id asc, computed_at desc`) → dedupe client-side to most-recent-at-or-before-7-days-ago per user.
3. ONE `quiz_sessions` query for the last 7 days → count client-side per user.
4. ONE `quiz_sessions` query for the most-recent session per user (ordered `user_id asc, started_at desc`) → dedupe client-side.
5. Compute `velocity`, `churn_risk_score`, `days_since_last_session` per user — math byte-identical to the per-user version.
6. ONE batched `upsert` of all rows.

The PostgREST group-by limitation is noted in a comment — at very high user counts (>50k) the right move is a Postgres RPC; for MVP scale the single batched upsert is correct.

## Verification

- `bun run type-check` — exit 0.
- `bun run lint` — exit 0.
- Manual (requires DB): the resulting `user_computed_signals` rows match the per-user version for the same user set (same velocity, churn_risk, days_since_last_session, sessions_last_7d).

## Maintenance note

When `user_computed_signals` grows new columns, add them to the upsert payload here. If a new per-user metric requires a query not aggregatable in batch, add a Postgres RPC rather than a per-user loop.
