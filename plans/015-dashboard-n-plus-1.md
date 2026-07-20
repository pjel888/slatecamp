# Plan 015 — Batch the pods + social-proof N+1 dashboard queries

> Audit: 2026-07-20, commit `064e3a43a`. Category: performance. Severity: HIGH. Effort: M. Risk: low.
> **Status: ✅ APPLIED.** Vetted against live code: `src/lib/actions/pods.ts:286-312` per-member snapshot fan-out; `src/lib/actions/social-proof.ts:56-62` per-topic fan-out.

## Why this mattered

Both findings were on the dashboard hub (most-visited authenticated route). They scaled linearly with pod size and topic-card count respectively. The fix pattern already existed elsewhere in the same files (`pods.ts` builds `profileMap`/`currentScoreMap` via `.in('user_id', memberIds)`).

## What was changed — Part A: pods.ts

Replaced the per-member `Promise.all(members.map(async ...))` snapshot fan-out with:
- ONE query: `.from('readiness_score_snapshots').select('user_id, score, computed_at').in('user_id', memberIds).order('user_id', { ascending: true }).order('computed_at', { ascending: false })` — returns all snapshots for all members, newest-first per user.
- Client-side index rows by `user_id`; for each member walk that user's rows and pick the first with `computed_at <= joined_at` (same "latest at or before joined_at" semantics as the original `.lte(...).order(desc).limit(1)`).

## What was changed — Part B: social-proof.ts

Rewrote `getTopicDailyStudiersBatch(topicIds)` to issue ONE query: `.from('user_interactions').select('topic_id, user_id').in('topic_id', topicIds).gte('interaction_timestamp', oneDayAgo)` — then dedupe `(topic_id, user_id)` pairs per topic and count client-side. The previous "batch" was actually `Promise.all(topicIds.map(...))` — N parallel queries, not one. Return type (`Record<string, number>`) unchanged so callers don't change.

## Verification

- `bun run type-check` — exit 0.
- `bun run lint` — exit 0.
- Same-pattern dedupe as Plan 014 (ordering + first-row-per-key client-side).

## Maintenance note

The pattern is "fetch all candidate rows in one query, dedupe client-side." It's the same pattern `pods.ts` already uses for `profileMap`. When adding a new per-X dashboard query, default to the batched shape. For very large `topicIds`/`memberIds` (>500), chunk into batches to stay under PostgREST's URL-length limit.
