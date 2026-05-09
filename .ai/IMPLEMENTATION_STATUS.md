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
| Authentication & onboarding | Implemented | `src/app/(auth)/login/`, `register/`, `forgot-password/`, `onboarding/`; `src/auth/callback/route.ts`; `src/lib/supabase/middleware.ts`; Supabase Auth integration | Demo mode redirects auth pages to dashboard | Keep; verify demo mode and live auth paths |
| Student dashboard hub | Implemented | `src/app/dashboard/page.tsx`; `src/components/dashboard/` (HeroCommandBar, HeatmapSection, etc.); `src/lib/actions/dashboard-page.ts` | Authenticated study home with progress, readiness, quick actions | Keep and protect |
| Quiz engine v2 | Implemented | `src/app/dashboard/quiz/` (hub, setup, session, results, review); `src/components/quiz-v2/`; `src/stores/useQuizStore.ts`; `src/lib/actions/quiz-v2/` | Large Zustand client store; mode-based setup (focused/endurance/article); slide-to-start/submit UX | Complexity risk in client store; consider splitting |
| Legacy quiz/drills redirects | Implemented (redirect-only) | `src/app/quiz/` (redirect wrappers); `src/app/dashboard/drills/`; `next.config.ts` redirects | `/quiz/*` → `/dashboard/quiz/*`; `/dashboard/drills` → `/dashboard/quiz` | Do not add new feature work to legacy paths |
| Wiki learning system | Implemented | `src/app/dashboard/wiki/`; `src/components/wiki/`; `src/lib/actions/wiki-actions.ts`, `wiki-reads.ts`, `wiki-interactions.ts` | Article search/rendering, taxonomy resolution, reads, bookmarks, highlights, feedback, embedded interactions | Keep and protect |
| Camp Trails | Implemented | `src/app/dashboard/camptrails/`; `src/lib/actions/trails.ts`; `src/lib/queries/trails.ts`; 7 trail-related DB tables | Published trails, enrollment, day/step progress, completions | Keep but review for simplification |
| 3D Lab | Implemented | `src/app/dashboard/3d-lab/`; `src/features/3d-lab/` (64 dirs, 556 files); `src/components/r3f/`; React Three Fiber + drei + Three.js | Performance-sensitive; dedicated test and perf scripts; module registry, hotspots, camera controls | Keep; performance remains an ongoing concern |
| Area C design practice | Implemented | `src/app/dashboard/area-c/` (6 routes); `src/lib/actions/design-problems.ts`; 7 design_* DB tables | Design problems, scenarios, quizzes, calculator | Hide from main nav but keep accessible |
| Assessment diagnostic | Implemented | `src/app/dashboard/assessment/page.tsx`; `src/lib/actions/assessment.ts`; `anon_diagnostic_sessions` table | Pre-assessment and diagnostic quiz flow | Keep and protect |
| Readiness & analytics | Implemented | `src/app/dashboard/analytics/` (2 routes); `src/lib/actions/analytics.ts`; `src/lib/actions/mastery-actions.ts`; `readiness_score_snapshots` table | Readiness trajectory, heatmaps, pacing, stamina, mastery, memory health | Keep; core differentiator |
| SRS & focus review | Implemented | `src/app/dashboard/flash/`, `/cram-card/`; `src/lib/srs/`; `src/lib/focus-review/generate-queue.ts`; `/api/cron/focus-review-scan` | Spaced repetition, flash cards, focus review queue generation | Keep but simplify |
| Notes workspace | Implemented | `src/app/dashboard/notes/`; `src/lib/actions/notes-actions.ts`; `src/hooks/useNoteEditor.ts`; TipTap editor | Rich text notes with folders, topic linking | Keep and protect |
| Notifications & preferences | Implemented | `src/app/dashboard/notifications/`; `src/lib/actions/notifications.ts`; 3 notification DB tables | Notification listing, mark read, preferences, triggers | Hide from nav but keep accessible |
| Settings & account | Partially Implemented | `src/app/dashboard/settings/`; `src/lib/actions/profile.ts` | Account settings functional; billing deferred | Keep settings; billing is deferred post-launch |
| Admin portal | Implemented | `src/app/admin/` (38+ routes); `src/components/admin/`; `src/lib/actions/admin/` (22+ files) | Knowledge/content editor, questions, taxonomy, pipeline, reviews, assets, search, audit, settings, 3D models | Keep and protect; middleware-enforced permissions |
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
| Error handling | Implemented | 7 error boundaries across route groups; loading states on 92+ routes | Broad coverage |
| Caching/revalidation | Partially Implemented | `src/lib/actions/cache-tags.ts`; `revalidatePath` in selected actions | Not comprehensive |
| Monitoring/observability | Partially Implemented | Developer portal status pages; `analytics_events` table | No external monitoring integration verified |

---

## Test Coverage Summary

| Test Type | Count | Evidence | Status |
|---|---|---|---|
| Unit/integration (Bun) | ~81 test files | `src/**/*.test.ts*`; 623 passing as of 2026-04-29 | Good coverage in critical areas |
| E2E (Playwright) | 13 spec files | `e2e/*.spec.ts` + `e2e/support/` | Covers auth, quiz, wiki, 3D Lab, admin, portals |
| Performance (Playwright) | 2 spec files | `.ai/00_performance/playwright/` | 3D Lab focused |
| Storybook | 106 story files | `find . -name '*.stories.tsx'` | Component-level visual testing |
| Visual regression | 1 spec file | `e2e/visual-login.spec.ts` | Login page only |

---

## Summary Statistics

| Metric | Count | Source |
|---|---|---|
| Page routes | ~105 (varies by counting method) | `find src/app -name "page.tsx"` |
| Route handlers | 11 | `find src/app -name "route.ts" -o -name "route.tsx"` |
| Layouts | 15 | README.md audit |
| Error boundaries | 7 | README.md audit |
| Loading states | 92+ | README.md audit |
| Server action files | 160 | `src/lib/actions/` |
| Component files | 667+ | `src/components/` |
| Feature modules | 556 files | `src/features/` |
| Database tables | 76 | `DATABASE_SCHEMA.sql` |
| Migrations | 92 | `supabase/migrations/` |
| Features (documented) | 27 | `.ai/features.md` |
| IP-relevant items | 16 | `.ai/ip-inventory.md` |
