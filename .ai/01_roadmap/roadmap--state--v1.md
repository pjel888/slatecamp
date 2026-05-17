# Roadmap

**Last updated:** 2026-05-09
**Based on:** Codebase audit of 2026-05-09, existing plans in `.ai/01_roadmap/`, `.ai/03_plans/`, and README.md

---

## Current State

SlateCamp is a **pre-launch MVP** with broad implemented functionality. All 27 documented features have code evidence. The app has been through a Plan B pre-launch cleanup (2026-04-29) that removed legacy compatibility paths, consolidated duplicate route families, and established a payment-free/live-AI-free launch stance.

**Active work in progress:** Landing page refactoring (uncommitted changes in working tree), landing platform positioning (messaging gate finalized 2026-05-07).

---

## Completed / No Longer Roadmap Items

| Item | When Completed | Notes |
|------|---------------|-------|
| Plan B pre-launch cleanup | 2026-04-29 | Legacy routes removed, docs consolidated, payments/AI deferred |
| Quiz v2 migration (drills → quiz) | 2026-04-29 | `/dashboard/quiz` is canonical; legacy redirects preserved |
| Tools/calculators consolidation | 2026-04-29 | `/tools` canonical; `/calculators` redirects |
| LemonSqueezy runtime removal | 2026-04-29 | Runtime code, webhooks, dependency removed |
| Debug route removal | 2026-05-05 | `/debug-*` routes removed |
| Cron fail-closed auth | 2026-05-05 | `src/lib/api/cron-auth.ts` implemented |
| Production guardrails for dev bypasses | 2026-05-05 | `src/lib/env/production-guardrails.ts` |
| Landing messaging gate | 2026-05-07 | `.ai/03_plans/2026-05-07-landing-page-final-messaging-gate.md` |
| Rollback SQL archived | 2026-05-05 | Moved from active migrations to `.ai/09_archive/` |
| Stale DB reference cleanup | 2026-05-05 | Known stale objects quarantined |

---

## Now (Immediate Priorities — P0/P1)

### N-1: Complete Supabase Verification and Release Governance

**Goal:** Make the app safe for beta and production review by verifying the database layer.
**Why it matters:** This is the current documented launch blocker.
**Acceptance criteria:**
- [ ] Safe Supabase verification target created/restored
- [ ] `supabase/config.toml` added/restored for local Supabase workflow
- [ ] All 101 active migrations replayed on verified target
- [ ] AI audit access-control migration verified (`20260505145349_restrict_ai_audit_admin_access.sql`)
- [ ] Supabase types regenerated from verified schema (`src/types/supabase.ts`)
- [ ] Full validation gate re-run after type regeneration
**Related files:** `supabase/migrations/`, `supabase/config.toml`, `src/types/supabase.ts`, `DATABASE_SCHEMA.sql`
**Dependencies:** Local Supabase CLI, verified migration target
**Risk level:** High — production blocker

### N-2: Complete Landing Page Refactoring

**Goal:** Ship the revised landing page with platform positioning finalized 2026-05-07.
**Why it matters:** Landing page is the public acquisition surface; current working tree has uncommitted changes.
**Acceptance criteria:**
- [ ] Four public pillars clearly presented: Knowledge Resources, Quizzes, 3D Lab, Free Tools
- [ ] "Get Your Free Readiness Score" CTA preserved as LEA pathway
- [ ] Broader CTAs for knowledge resources and free tools
- [ ] University/educator-compatible positioning
- [ ] Legal-safe educational resource boundaries
- [ ] All landing sections render correctly
- [ ] Review-center complementarity messaging included
**Related files:** `src/app/page.tsx`, `src/components/landing/`, `src/components/marketing/`
**Dependencies:** Messaging gate finalized (✅), design decisions
**Risk level:** Medium

### N-3: Verify Production/Staging Deployment Environment

**Goal:** Confirm deployment targets are safe and configured correctly.
**Why it matters:** Cannot launch without verified deployment environment.
**Acceptance criteria:**
- [ ] Production environment variables verified (names only, not values)
- [ ] Staging environment available for pre-release testing
- [ ] Environment-specific feature flags confirmed
- [ ] Cron endpoints configured with `CRON_SECRET`
**Related files:** `.env.local`, environment variable documentation
**Dependencies:** Access to deployment platform
**Risk level:** High — launch blocker

---

## Next (Important — P1/P2)

### NX-1: Database Cleanup

**Goal:** Resolve known schema drift and stale artifacts.
**Why it matters:** Clean schema reduces confusion and risk for future development.
**Acceptance criteria:**
- [ ] LemonSqueezy columns removed or explicitly deferred (decision documented)
- [ ] Schema objects without snapshot coverage resolved (keep vs delete)
- [ ] `DATABASE_SCHEMA.sql` regenerated from live schema if drift confirmed
- [ ] Stale reset/seed scripts updated or archived
**Related files:** `DATABASE_SCHEMA.sql`, `supabase/migrations/`, `src/types/supabase.ts`, `src/types/app.ts`
**Risk level:** Medium

### NX-2: Route Surface Cutline Decision

**Goal:** Decide which optional/internal routes stay visible for launch.
**Why it matters:** 128 routes include CEO, developer, pods, DAE, studio, professional, results-day surfaces that may not be launch-critical.
**Acceptance criteria:**
- [ ] Founder decision on each optional surface (keep/hide/delete)
- [ ] Sidebar navigation updated to match decision
- [ ] Public navigation audit completed
**Related files:** `src/components/sidebar/sidebar-constants.ts`, route files
**Dependencies:** Product/founder decision
**Risk level:** Medium

### NX-3: Full Validation Matrix Run

**Goal:** Run complete test suite before external launch.
**Why it matters:** Current core suite passes but full matrix (`test:e2e`, `validate:release`, `perf:all`) hasn't been run.
**Acceptance criteria:**
- [ ] Full `test:e2e` suite passes
- [ ] `validate:release` passes
- [ ] `perf:all` results acceptable
- [ ] CI/staging environment configured for automated runs
**Dependencies:** CI/CD setup, staging environment
**Risk level:** Medium

### NX-4: Quiz Store Refactoring

**Goal:** Reduce complexity of the large Zustand quiz store.
**Why it matters:** `useQuizStore.ts` is a documented complexity risk; hard to test and maintain.
**Acceptance criteria:**
- [ ] Store split into focused slices (session, questions, timer, UI state)
- [ ] Existing quiz behavior preserved
- [ ] Quiz tests continue to pass
**Related files:** `src/stores/useQuizStore.ts`, `src/components/quiz-v2/`, `src/lib/actions/quiz-v2/`
**Risk level:** Medium — complex refactor with regression risk

---

## Later (Strategic — P2/P3)

### L-1: Payment Provider Launch (PayRex)

**Goal:** Enable paid subscriptions via PayRex.
**Why it matters:** Revenue generation; currently deferred.
**Acceptance criteria:**
- [ ] PayRex staging checkout verified
- [ ] Webhook handling verified end-to-end
- [ ] Subscription tiers working (pro/prime/institutional)
- [ ] `NEXT_PUBLIC_PAYMENTS_ENABLED=true` gated
**Dependencies:** PayRex account, staging environment

### L-2: Live AI Provider Launch

**Goal:** Enable AI tutor, Socratic questioning, and study agent features.
**Why it matters:** Product differentiator; currently deferred.
**Acceptance criteria:**
- [ ] OpenAI provider verified with live keys
- [ ] Anthropic provider verified for teach-back
- [ ] AI helper UI re-enabled in quiz feedback panel
- [ ] Rate limiting and cost controls in place
**Dependencies:** API keys, cost budget

### L-3: Mobile Optimization

**Goal:** Ensure good experience on mid-range Android devices common in the Philippines.
**Why it matters:** Primary user demographic uses mobile devices.
**Acceptance criteria:**
- [ ] 3D Lab runs at acceptable FPS on target devices
- [ ] Quiz UI usable on small screens
- [ ] Wiki reading experience optimized for mobile
- [ ] Bundle size optimized for slower connections

### L-4: University/Institutional Partnerships

**Goal:** Enable B2B/institutional access model.
**Why it matters:** Revenue diversification and broader reach.
**Acceptance criteria:**
- [ ] Organization management UI
- [ ] Bulk seat provisioning
- [ ] Institutional analytics dashboard
- [ ] LMS integration exploration

---

## Removed / Obsolete

| Item | Reason |
|------|--------|
| LemonSqueezy payment integration | Runtime removed in Plan B; PayRex is the single payment path |
| Legacy quiz (/quiz/* standalone routes) | Migrated to `/dashboard/quiz/*`; redirects only |
| Legacy drills (/dashboard/drills/*) | Redirects to `/dashboard/quiz` |
| Separate calculator namespace (/calculators/*) | Consolidated under `/tools/*` |
| Debug routes (/debug-*) | Removed 2026-05-05 |
| `payrex-node` / axios dependency path | Removed from active dependency graph |
| Old 3D Lab compatibility shims | Removed in Plan B cleanup |
| Legacy ALE URL redirects (`/ale-starter`, `/dashboard/wiki/ale-*`) | Preserved as permanent redirects |
