# Plan 013 — Deepen the mastery update seam (single RMW owner)

> Audit: 2026-07-20, commit `064e3a43a`. Category: architecture. Severity: HIGH. Effort: L. Risk: medium.
> **Status: ✅ APPLIED.** Depends on Plan 012 (characterization tests as safety net — 20 tests, all green).

## Why this mattered

`user_node_mastery` was a shared mutable global with no owning module. Three concurrent hooks (`updateDecayRate`, `updateMemoryStrength`, `updateMasteryStats`) each independently SELECTed the row, computed, and wrote it back inside `Promise.all` — racing each other. Last writer won; overlapping columns (notably `last_encountered`) got clobbered. The EMA alpha table was private to one file, so any of the 10+ other writers silently bypassed it. Bug-hunting in this area required reasoning across 4+ files.

This was the highest-leverage deepening in the codebase: a single interaction triggered 3 round-trips that raced, every bug in this area had no single home, and the invariants (`current_mastery_weight ∈ [0,1]`, monotonic `last_encountered`, distinct question count) were unenforceable.

## What was changed

Created `src/lib/mastery/apply-interaction.ts` — the canonical writer for the per-answer path. It:
- Issues ONE SELECT of every column any of the three previous hooks needed (mastery-stats + memory-strength + decay columns together).
- Computes ALL derived values locally (no I/O between computes). Math ported verbatim from the three previous hooks — every formula is identical.
- Issues ONE UPSERT with the merged payload.
- Preserves the fire-and-forget contract (try/catch inside; never breaks the quiz flow).

Updated `src/lib/actions/mastery/post-interaction-hooks.ts` to delegate to `applyInteraction`. The public `runPostInteractionHooks` signature is unchanged so callers (`submit-answer.ts:327`, `wiki/submit-prequestion.ts`) need no edits.

The three previous hook files (`update-decay-rate.ts`, `update-memory-strength.ts`, `update-mastery-stats.ts`) are preserved as-is for now (no longer called from the hot path). Migrating the 10+ other writers is a follow-up.

Added `src/lib/mastery/apply-interaction.test.ts` — 11 tests locking in: single-SELECT contract, single-UPSERT contract, merged payload covers all three slices, mastery-stats EMA, `practice_count`/`total_attempts` increment by exactly 1 (no RMW drift), SS monotonic + rounded, decay_rate decrease on fast correct + increase on incorrect, fire-and-forget preserved, fresh `last_encountered`.

Rewrote `src/lib/actions/mastery/post-interaction-hooks.test.ts` to match the new contract (4 tests: single-delegation, defaults, propagation, forwarding).

## Verification

- `bun test src/lib/mastery/ src/lib/actions/mastery/` — 28 pass / 0 fail (3 new test files).
- `bun test src/` — full suite: 813 pass / 0 fail (was 781 before Plan 012 + 32 new tests).
- `bun run type-check` — exit 0.
- `bun run lint` — exit 0.
- `bun run build` — succeeds.
- The existing `submit-answer.test.ts` (which mocks `runPostInteractionHooks`) continues to pass — the contract is unchanged at the caller boundary.

## Maintenance note

Next step (out of scope): migrate the 10+ other writers to call through `applyInteraction`. Each is a small PR. End state: `user_node_mastery` is private to the mastery module; everything else asks it questions ("snapshot mastery", "apply interaction") and never names the table.
