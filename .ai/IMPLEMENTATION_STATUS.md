# Implementation Status

**Last audit:** 2026-05-09
**Methodology:** Evidence-based review of source files, routes, components, server actions, database schema, and tests against documented features.
**Source of truth:** README.md (audited 2026-04-29), actual source files in `src/`, `DATABASE_SCHEMA.sql`, `supabase/migrations/`

> **Statuses:** Implemented | Partially Implemented | Not Implemented | Obsolete | Unknown
> **Evidence must include file paths.** Features are only marked "Implemented" with clear code evidence.

---

## Core Product Features

| Area / Feature | Status | Evidence | Notes | Recommended Action |
|---|---|---|---|---|
| Public marketing landing | Implemented | `src/app/page.tsx`, `src/components/landing/`, `src/components/marketing/` (20+ component files); routes: `/`, `/about`, `/contact`, `/pricing`, `/try` | Active refactoring of landing components in working tree (2026-05-08) | Complete landing page refactoring; verify all sections render |
| Authentication & onboarding | Implemented | `src/app/(auth)/login/`, `register/`, `forgot-password/`, `onboarding/`; `src/app/auth/callback/route.ts`; `src/lib/supabase/middleware.ts`; Supabase Auth integration | Demo mode redirects auth pages to dashboard | Keep; verify demo mode and live auth paths |
| Student dashboard hub | Implemented | `src/app/dashboard/page.tsx`; `src/components/dashboard/` (HeroCommandBar, HeatmapSection, etc.); `src/lib/actions/dashboard-page.ts` | Authenticated study home with progress, readiness, quick actions | Keep and protect |
| Quiz engine v2 | Implemented | `src/stores/useQuizStore.ts` (833 lines, already refactored to sliced architecture per Phase 2 comment); `src/lib/actions/quiz-v2/` (28 files); `src/components/quiz-v2/` (30+ components) | Sliced state pattern: FeedbackState, SettingsState, UIState, etc.; uses persist + subscribeWithSelector middleware. Tests pass (741/0) | Previously flagged as complexity risk; sliced architecture mitigates this |
| Wiki learning system | Implemented | `wiki-actions.ts` (662 lines), `wiki-reads.ts` (60 lines), `wiki-interactions.ts` (120 lines); `src/components/wiki/` component tree | 842 total lines of action code across 3 files | Keep and protect |
| 3D Lab | Implemented | `src/features/3d-lab/` (520 TypeScript/TSX files); React Three Fiber + drei + Three.js | Massive feature module; performance-sensitive | Keep; performance remains ongoing concern |
| Camp Trails | Implemented | `trails.ts` (583 lines actions), `trails.ts` (381 lines queries); 964 total lines | Structured multi-day learning paths | Keep but review for simplification |
| SRS & focus review | Implemented | `src/lib/srs/` (7 files, 521 total lines); `srs-review.ts` (47 lines); `focus-review/generate-queue.ts` (175 lines) | SM-2 algorithm, IRT estimation, retention modeling | Keep but simplify |
| Admin portal | Implemented | `src/lib/actions/admin/` (24 files); `src/app/admin/` (38+ routes); `src/lib/admin/roles.ts` (116 lines, some deprecated wrappers) | `getUserRole()` and `isAdmin()` marked deprecated; prefer `resolveCurrentUserRole()` | Migrate callers to entitlements API |
| Developer portal | Implemented | `src/app/developer/` (11 routes); `src/lib/developer/access.ts`; `src/lib/actions/dev/` | API reference, architecture docs, status, console, logs, DB viewer, test data | Hide behind internal-only access |
| CEO portal | Implemented | `src/app/(protected)/ceo/` (5 routes); `src/lib/actions/ceo/`; `src/lib/queries/ceo/`; 4 ceo_* tables | Owner analytics, financials, insights, team, permission audit | Gated by CEO/owner entitlement |
| Tools & calculators | Implemented | `src/app/tools/` (7 routes); `src/app/calculators/_lib/`; `src/components/calculators/`; `src/lib/lot-geometry/` | CHB, drywall, flooring, paint, floor tiles, wall paint calculators; lot plotter | Keep `/tools` as canonical; `/calculators` redirects only |
| Professional/results-day/exam outcome | Implemented | `src/app/dashboard/professional/`, `/results-day/`, `/exam-outcome/`, `/score-reveal/`; `src/lib/actions/professional-mode.ts` | Professional mode switching, results-day banner, exam outcome self-report | Hide from nav but keep accessible |
| Study pods/social proof | Implemented | `src/app/dashboard/pods/`; `src/lib/actions/pods.ts`, `social-proof.ts`; `study_pods`, `pod_members` tables | Pod create/join/leave; topic daily-studier social proof | Hide from nav; defer for launch |
| Daily dose / DAE / studio modes | Partially Implemented | `src/app/dashboard/dae-mode/`, `/studio/`; `src/lib/actions/dae-mode.ts`, `studio-mode.ts`, `daily-dose/` | Specialized study modes; not fully verified in UI | Needs founder decision on launch inclusion |
| Code updates | Implemented | `src/app/dashboard/code-updates/`; `src/lib/actions/code-updates.ts` | LEA/code update records | Keep |

---

## Deferred / Not Yet Implemented

| Area / Feature | Status | Evidence | Notes | Recommended Action |
|---|---|---|---|---|
| Payment processing (PayRex) | Deferred | `src/lib/payments/provider.ts`; `src/lib/payrex/config.ts`; `/api/payments/checkout`; `/api/webhooks/payrex`; disabled via `NEXT_PUBLIC_PAYMENTS_ENABLED=false` | Code retained but disabled for payment-free launch | Verify before future paid launch |
| LemonSqueezy payments | Removed (runtime) / Deferred (schema) | Runtime code removed in Plan B cleanup; `lemonsqueezy_*` columns remain in schema/types | Dormant columns in `user_subscriptions` table | Decide on DB cleanup timing |
| Live AI tutor/chatbot | Deferred | `src/lib/ai/provider.ts`; `/api/ai/*` (6 endpoints); `src/components/quiz-v2/FeedbackPanel.tsx` (disabled) | Demo/canned paths work; live providers not verified | Verify providers before AI launch |
| AI question generation | Deferred | `/api/ai/generate-questions`; demo path only | Not part of current launch scope | Future AI launch work |

---

## Cross-Cutting Concerns

| Area | Status | Evidence | Notes |
|---|---|---|---|
| Authentication (Supabase) | Implemented | `middleware.ts`, `src/lib/supabase/middleware.ts`, `src/lib/entitlements/` | Session refresh, role resolution, privileged route gating |
| Authorization (RLS + entitlements) | Implemented | `src/lib/entitlements/policy.ts`, `src/lib/admin/roles.ts`, `src/lib/ceo/access.ts`, `src/lib/developer/access.ts` | Role resolution priority: dev override > user_roles > profile > app metadata > email fallbacks |
| Demo mode | Implemented | `src/lib/demo/config.ts`; `NEXT_PUBLIC_ENABLE_DEMO_MODE` | Pervasive in middleware and e2e tests |
| Feature flags | Implemented | `src/config/feature-flags.ts`; `src/lib/entitlements/dev-overrides.ts`; `/api/admin/flags` | HTTP-only cookie with one-week max age |
| Error handling | Implemented | 8 error boundaries across route groups; loading states on 104 routes | Broad coverage |
| Caching/revalidation | Partially Implemented | `src/lib/actions/cache-tags.ts`; `revalidatePath` in selected actions | Not comprehensive |
| Monitoring/observability | Partially Implemented | Developer portal status pages; `analytics_events` table | No external monitoring integration verified |

---

## Test Coverage Summary

| Test Type | Count | Evidence | Status |
|---|---|---|---|
| Unit/integration (Bun) | 88 test files, 741 tests, 0 failures | `bun test src/` (run 2026-05-09): 741 pass, 0 fail across 88 files, 5658 expect() calls | Codebase is healthy; type-check also passes |
| E2E (Playwright) | 13 spec files | `e2e/*.spec.ts` + `e2e/support/` | Covers auth, quiz, wiki, 3D Lab, admin, portals |
| Performance (Playwright) | 2 spec files | `.ai/00_performance/playwright/` | 3D Lab focused |
| Storybook | 113 story files | `find . -name '*.stories.tsx'` (verified 2026-05-09) | Component-level visual testing |
| Visual regression | 1 spec file | `e2e/visual-login.spec.ts` | Login page only |

---

## Features Discovered by Code-Intelligence (2026-05-09)

These features were found by code-review-graph community analysis but are NOT documented in README.md or existing `.ai/` files:

| Area / Feature | Status | Evidence | Notes | Recommended Action |
|---|---|---|---|---|
| Offline quiz support | Implemented (undocumented) | `src/lib/quiz/offline/db.ts` — IndexedDB via `idb`; queues pending answers, caches sessions, retry with stale cleanup | Not mentioned anywhere. code-review-graph detected community | Document; verify end-to-end |
| Rate limiting | Implemented | `src/lib/rate-limit.ts`; `src/lib/rate-limit.test.ts` (10 tests) | Used by AI endpoints. Not in architecture docs | Add to ARCHITECTURE.md |
| Area C calculator engine | Implemented | `src/lib/area-c-calculations.ts` — AMBF, TGFA, PSO, occupant load, parking, travel distance, exit width | Philippine building code calculations. Documented in routes but not as a standalone feature | Note in features |
| Wiki markdown pipeline | Implemented | `src/lib/wiki-markdown.ts` — slugify, heading ID tracking, reading time, MDX normalization, EI prompt injection | Sophisticated content rendering pipeline | Document in architecture |

---

## Summary Statistics

| Metric | Count | Source |
|---|---|---|
| Page routes | 128 | `find src/app -name "page.tsx" \| wc -l` (verified 2026-05-09) |
| Route handlers | 12 | `find src/app -name "route.ts" -o -name "route.tsx" \| wc -l` (verified 2026-05-09) |
| Layouts | 15 | `find src/app -name "layout.tsx" \| wc -l` (verified 2026-05-09) |
| Error boundaries | 8 | `find src/app -name "error.tsx" \| wc -l` (verified 2026-05-09) |
| Loading states | 104 | `find src/app -name "loading.tsx" \| wc -l` (verified 2026-05-09) |
| Server action files | 150 | `find src/lib/actions -type f \| wc -l` (verified 2026-05-09) |
| Component files | 652 | `find src/components -type f -name "*.tsx" \| wc -l` (verified 2026-05-09) |
| Feature modules | 556 files | `src/features/` |
| Database tables | 76 | `DATABASE_SCHEMA.sql` |
| Migrations | 101 | `ls supabase/migrations/*.sql \| wc -l` (verified 2026-05-09) |
| Features (documented) | 27 | `.ai/features.md` |
| IP-relevant items | 16 | `.ai/ip-inventory.md` |
| Test files | 88 | `find src -name "*.test.ts" -o -name "*.test.tsx" \| wc -l` (verified 2026-05-09) |
| Story files | 113 | `find . -name "*.stories.tsx" \| wc -l` (verified 2026-05-09) |
| Playwright E2E specs | 13 | `e2e/` directory |
