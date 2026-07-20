# Plan 012 — Characterize the mastery write path with integration tests

> Audit: 2026-07-20, commit `064e3a43a`. Category: tests. Severity: HIGH. Effort: L. Risk: low (tests only).
> **Status: ✅ APPLIED.** Precondition for Plan 013.

## Why this mattered

The mastery write path was the highest-risk correctness surface in the app (3 concurrent RMW hooks racing on the same `user_node_mastery` row, called on every quiz answer). It had zero tests. Before Plan 013 restructured the seam, characterization tests were needed to lock in the *current* behavior so the restructure could be verified behavior-preserving.

## What was changed

- `src/lib/actions/mastery/update-mastery-stats.test.ts` — NEW, 14 tests. Locks in: SELECT column shape; EMA alpha per mode (full_exam=0.6, storm=0.4, focus_review=0.3, chill=0.1, default=0.2); `isSuspectedLuckyGuess` halves answer value; clamps `[0,1]`; streak reset/increment; distinct_questions_seen increments only on new question; avg_time_ms incremental formula; last_encountered ISO; taxonomy difficulty only counts on correct; fire-and-forget contract. Uses a permissive chained-builder mock (handles `user_node_mastery`, `taxonomy_tree`, `user_interactions` count-head queries, multi-`.eq` chains, and awaitable upserts).
- `src/lib/actions/mastery/post-interaction-hooks.test.ts` — NEW, tests the orchestrator. (Originally 6 tests for the 3-hook fan-out under Plan 012; rewritten under Plan 013 to test the single-delegation contract.)

## Verification

- `bun test src/lib/actions/mastery/` — 20 pass / 0 fail.
- `bun run type-check` — exit 0.

## Maintenance note

When Plan 013 lands (the deepening refactor), these tests are the safety net. If a test breaks during the refactor, the refactor changed behavior — investigate before continuing. The mocks are intentionally permissive (any chain shape) so the math assertions, not the I/O shape, are what's locked in.
