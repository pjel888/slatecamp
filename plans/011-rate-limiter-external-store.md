# Plan 011 — Externalize in-memory rate limiter to Upstash with in-memory fallback

> Audit: 2026-07-20, commit `064e3a43a`. Category: security. Severity: MEDIUM. Effort: M. Risk: low.
> **Status: ✅ APPLIED.** Vetted against live code: `src/lib/rate-limit.ts:14` used module-local `Map`; only limiter on the 5 AI routes.

## Why this mattered

The in-memory rate limiter is the only limiter on the AI routes (cost-bearing endpoints). On Vercel each invocation may run on a fresh instance — the effective per-user limit was `MAX_REQUESTS × instance_count` per minute instead of 10. Combined with the no-cap issue (Plan 010), a single authenticated user could drive unbounded provider spend. The file itself already said "for production: replace with Vercel KV or Redis."

## What was changed

Rewrote `src/lib/rate-limit.ts`:
- `checkRateLimit(key)` is now **async** (was sync) — Redis is async; the in-memory path is also async for a uniform contract.
- Backend selection: when `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` are set, uses Upstash Redis via dynamic `import('@upstash/redis')` so the package is an OPTIONAL peer dependency (no hard dep in package.json — production deployments provision Upstash and `bun add @upstash/redis` at that point; the dynamic import is wrapped in try/catch so a missing package degrades gracefully to in-memory).
- Redis path uses atomic INCR + EXPIRE; per-key TTL gives `retryAfter`.
- Otherwise (local dev, tests, preview without Redis): falls back to the in-memory `Map` with identical semantics.
- Redis errors are caught and logged — the call degrades to in-memory rather than 500-ing.
- Cap configurable via `AI_RATE_LIMIT_PER_MINUTE` (default 10).

Updated all 6 callers to `await checkRateLimit(...)`:
- `src/app/api/ai/{embed,study-agent,generate-questions,tutor,socratic}/route.ts`
- `src/lib/actions/dev/test-data.ts` (two call sites — discovered during type-check)

Updated `src/lib/rate-limit.test.ts` (9 tests) to `await` — tests exercise the in-memory fallback (no Upstash env in test runner).

Added env vars to `.env.vercel.example`: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `AI_RATE_LIMIT_PER_MINUTE=10`.

## Verification

- `bun test src/lib/rate-limit.test.ts` — 9 pass / 0 fail.
- `bun run type-check` — exit 0 (uses `// @ts-expect-error` on the dynamic import since `@upstash/redis` isn't installed in dev).
- `bun run lint` — exit 0.

## Maintenance note

The sync→async migration was the riskiest part — every caller had to add `await`. Grep `checkRateLimit` before changing the signature again.
