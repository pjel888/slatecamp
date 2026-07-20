# Plan 009 — Constant-time cron secret comparison

> Audit: 2026-07-20, commit `064e3a43a`. Category: security. Severity: LOW. Effort: S. Risk: low.
> **Status: ✅ APPLIED.** Vetted against live code: `src/lib/api/cron-auth.ts:46` used `!==`.

## Why this mattered

`verifyCronRequest` compared the bearer token with `!==` (string inequality), which is not constant-time. Practical exploitability is low (network jitter dominates), but the fix is one line and removes the finding entirely.

## What was changed

In `src/lib/api/cron-auth.ts`:
- Added `import { timingSafeEqual } from 'crypto'`.
- Added a `constantTimeEquals(a, b)` helper. Length mismatch short-circuits BEFORE the timing-safe call (because `timingSafeEqual` throws `RangeError` on unequal `Buffer` lengths).
- The `verifyCronRequest` comparison now uses `constantTimeEquals(authHeader, expectedHeader)`.
- The empty-secret case (`CRON_SECRET` unset) still fails closed for every request — preserved.

## Verification

- `bun test src/lib/api/cron-auth.test.ts` — existing tests pass with the new comparison primitive (5 tests including wrong-header, malformed bearer, exact-match, missing/empty secret).
- `bun run type-check` — exit 0.
- `bun run lint` — exit 0.

## Maintenance note

Any new shared-secret comparison should use the same primitive. With one site, inlining is fine; extract a shared helper if a second site appears.
