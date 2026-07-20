# Plan 001 — SRS `repetitions` reconstruction defeats spaced repetition

> Audit: 2026-07-20, commit `064e3a43a`. Category: correctness. Severity: CRITICAL. Effort: S. Risk: medium.
> **Status: ✅ APPLIED.** Vetted against live code: `src/lib/srs/update.ts:43-66`, `src/lib/srs/sm2.ts:7-31`.

## Why this mattered

The SM-2 progression is `repetitions=0 → 1 day`, `=1 → 6 days`, `≥2 → interval × EF`. But `updateSrsSchedule` reconstructed `repetitions` from the current interval (`<= 1 ? 0 : <= 6 ? 1 : 2`) instead of reading the column — so any topic that landed on `interval=1` (first review or after a `quality<3` reset) could never advance past the 1-day branch. Spaced repetition was defeated for every topic a learner had ever gotten wrong. This fired on every quiz answer.

## What was changed

In `src/lib/srs/update.ts`:
- `select(...)` now includes `repetitions` alongside `review_interval_days, ease_factor`.
- `repetitions` is read directly from the row (`mastery?.repetitions ?? 0`) instead of reconstructed.
- The update payload includes `repetitions: result.repetitions` so the algorithm output persists.
- Added a backfill-implication comment (no migration required; rows self-correct on next review).

In `src/lib/srs/update.test.ts`:
- Mocks now capture `lastSelectColumns` and `lastUpdatePayload` so tests can assert on the read/write shape.
- Added a `repetitions persistence (Plan 001)` describe block with 3 regression tests: column is selected, value is persisted, value is not reconstructed from interval.

## Verification

- `bun test src/lib/srs/` — 30 pass / 0 fail (was 27 before).
- `bun run type-check` — exit 0.
- `bun run lint` — exit 0.
- `repetitions` column confirmed present: migration `20260517043338_fix_supabase_lint_rpc_contracts.sql:21`, supabase types `src/types/supabase.ts:3331`.

## Risk note

Forward-only fix. Existing rows whose stored `repetitions` doesn't match their true review history self-correct on the next review — no backfill migration required, but expect a one-time scheduling shift for previously-stuck topics.
