# Plan 004 — Wire `assertSafeProductionEnv` into `instrumentation.ts`

> Audit: 2026-07-20, commit `064e3a43a`. Category: security. Severity: HIGH. Effort: S. Risk: low.
> **Status: ✅ APPLIED.** Vetted against live code: `src/lib/env/production-guardrails.ts` defined `assertSafeProductionEnv` but no `instrumentation.ts` existed and the only callers were the unit test.

## Why this mattered

The README and `COMPREHENSIVE_AUDIT.md` both referenced a "production guardrail" that prevents dev-override env vars from activating in production. The guardrail existed in code but was never invoked at runtime — a misconfigured production deployment (preview branch, Docker image, `next start` against a dev build, Vercel project without `NODE_ENV=production`) would silently activate `DEV_FORCE_USER_ID`, which mints the service-role Supabase client on every request and bypasses RLS entirely.

## What was changed

Created `src/instrumentation.ts` with a `register()` function (Next.js instrumentation hook) that:
- Runs only in the Node.js runtime (`process.env.NEXT_RUNTIME === 'nodejs'`); the Edge runtime has different env semantics and the guardrail isn't Edge-safe.
- Dynamically imports `assertSafeProductionEnv` (keeps it out of the Edge bundle).
- Calls it at server init — throws `Unsafe production environment configuration: <flag>` if any of `DEV_FORCE_USER_ID`, `ALLOW_DEV_PORTAL_BYPASS`, `DEV_FORCE_TIER` is set in production.

## Verification

- `NODE_ENV=production DEV_FORCE_USER_ID=test bun run start` → throws `Unsafe production environment configuration: DEV_FORCE_USER_ID` at boot, server refuses to come up. ✅
- `NODE_ENV=production bun run start` (no unsafe env) → boots normally. ✅
- `NODE_ENV=development bun run dev` → boots normally (guardrail is a no-op outside production). ✅
- `bun run build` succeeds. ✅
- `bun test src/lib/env/` — existing guardrail tests still pass. ✅

## Maintenance note

Any future "must not be enabled in production" env var should be added to `getUnsafeProductionEnvFlags()` in `production-guardrails.ts`. The instrumentation hook need not change.
