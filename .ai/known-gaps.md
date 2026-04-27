# Known Gaps

**Last Updated:** 2026-04-27

This document tracks incomplete areas, inconsistencies, risks, and open questions in SlateCamp.

## Incomplete Areas

### Environment
- **No committed `.env.example`:** Environment setup is inferred from code and local practice. New developers must manually reconstruct `.env.local`.
- **Stale env variables:** PostHog, Resend, Stripe, and Google Cloud variables exist in `.env.local` but have no implementing code.
- **LemonSqueezy SDK missing:** The `@lemonsqueezy/lemonsqueezy.js` package is in `package.json` but `src/lib/lemonsqueezy/config.ts` returns `null` with a warning. The checkout path is effectively stubbed.

### Documentation
- **Schema snapshot lag:** `DATABASE_SCHEMA.sql` is the strongest schema authority but may not reflect the latest RLS/authz migrations (April 2026 fixes).
- **Documentation drift risk:** With 122 `AGENTS.md` files and a large `.ai/` corpus, stale instructions are a material engineering risk.
- **Deep reference overlap:** `.ai/06_specs/deep/` contains historical material that may present stale content as authoritative.

### Code Quality
- **TypeScript strict mode off:** `strict: false`, `noImplicitAny: false`, `strictNullChecks: false` reduce type safety.
- **ESLint hooks rules disabled:** `react-hooks/exhaustive-deps`, `rules-of-hooks`, and related rules are off, increasing risk of stale closures and effect bugs.
- **Monolithic client stores:** `useQuizStore.ts` is ~29 KB, concentrating significant client-side business logic in one file.
- **Client/server boundary drift:** 677 files use `"use client"`. Some may be candidates for server migration to reduce bundle size.

### Testing
- **No aggregated unit-test script:** Unit tests must be run individually or by directory. There is no `npm test` equivalent.
- **No coverage tooling:** No Istanbul, c8, or similar coverage reports are generated.
- **CEO portal untested:** No automated tests found for CEO surfaces.
- **Cron job logic untested:** Cron routes have no dedicated test coverage.

### Build & Tooling
- **Bun install reliability:** Manifest resolution failures have been reported in clean environments.
- **Build stability:** Historical `ENOENT: .next/required-server-files.json` failures during `bun run build`.
- **No deploy workflow:** Vercel auto-deploys are inferred but not explicitly documented in repository CI.

## Inconsistencies

### Payment provider reality vs documentation
- Docs and env suggest three payment providers (PayRex, LemonSqueezy, Stripe), but only PayRex is fully implemented.
- LemonSqueezy webhooks exist but the checkout SDK path is stubbed.
- Stripe has no code at all.

### Analytics reality vs env
- PostHog env vars exist but no SDK is installed and no analytics events are sent to PostHog.
- Only internal `analytics_events` table logging is implemented.

### Bun-first docs vs lockfile reality
- Documentation claims Bun is the sole package manager, but `package-lock.json` may also exist (not verified in this audit).

## Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| `DEV_FORCE_USER_ID` leaked to production | **Critical** | Ensure `DISABLE_DEV_FORCE_USER_ID` is set in all production and CI environments |
| RLS policy gaps | **High** | Verify latest migrations against `DATABASE_SCHEMA.sql`; audit `wiki_article_sources` and other recently fixed tables |
| Documentation drift | **High** | Update `AGENTS.md` and `.ai/` docs with every structural change |
| Build failures | **Medium** | Monitor `bun run build` in CI; clean `.next/` before releases |
| Payment webhook idempotency gaps | **Medium** | `processed_webhook_events` table exists but verify edge cases (duplicate events across providers) |
| 3D Lab performance | **Medium** | Large bundle and runtime memory footprint; monitor on mid-range Android |
| TypeScript strictness off | **Medium** | Acceptable for pre-launch MVP velocity but should be enabled post-launch |
| Client-heavy bundle | **Medium** | 677 client components may inflate bundle size; audit with `next-bundle-analyzer` |

## Questions for Maintainers

1. **Stripe, PostHog, Resend, Google Cloud:** Are these planned integrations, or should their env vars be removed?
2. **LemonSqueezy:** Is the stubbed SDK path intentional (temporary) or should LemonSqueezy be fully removed?
3. **Bun install failures:** Are these environment-specific, or is there a reproducible bug in the lockfile/manifest?
4. **`DATABASE_SCHEMA.sql` vs migrations:** What is the update cadence for the schema snapshot? Should it be regenerated as part of CI?
5. **CEO portal:** Who uses it, and what is the acceptance criteria for launch readiness?
6. **Cron jobs:** Are they actively monitored? What happens if `focus-review-scan` or `compute-signals` fails silently?
7. **AI feature usage:** Are the AI routes (`api/ai/*`) actively used in production, or are they experimental?

## Suggested Follow-Up Tasks

### Documentation
- [ ] Create a committed `.env.example`
- [ ] Regenerate `DATABASE_SCHEMA.sql` to include latest RLS/authz changes
- [ ] Audit `.ai/06_specs/deep/` for stale authoritative content and mark superseded docs
- [ ] Add a documentation freshness check to CI

### Engineering
- [ ] Investigate and fix Bun install reliability issues
- [ ] Resolve `ENOENT: .next/required-server-files.json` build failures
- [ ] Add aggregated unit-test script or document the recommended test command pattern
- [ ] Add coverage tooling (c8 or similar)
- [ ] Evaluate enabling TypeScript `strict: true` in a phased approach
- [ ] Audit 677 client components for server-migration candidates
- [ ] Split `useQuizStore.ts` into smaller focused stores

### Operations
- [ ] Set up external error monitoring (Sentry is mentioned in a TODO comment)
- [ ] Confirm `DISABLE_DEV_FORCE_USER_ID` is set in all production/CI environments
- [ ] Implement cron job failure alerting
- [ ] Decide on analytics strategy: commit to PostHog or remove env vars

## Evidence

- `.env.local` (variable names only)
- `DATABASE_SCHEMA.sql`
- `supabase/migrations/` (April 2026 RLS fixes)
- `src/lib/lemonsqueezy/config.ts`
- `src/lib/ai/provider.ts`
- `src/stores/useQuizStore.ts`
- `tsconfig.json`
- `eslint.config.mjs`
- `package.json`
- `src/lib/srs/update.ts` (Sentry TODO comment)
- `.github/workflows/storybook.yml`
