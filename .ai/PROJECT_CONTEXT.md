# Project Context

**Last updated:** 2026-05-09
**Purpose:** Operational context for developers and AI agents. Not marketing copy.

---

## What Is This Project?

**SlateCamp** is a Next.js App Router web application for Philippine Licensure Examination for Architects (LEA) preparation. It combines public marketing, authenticated student study workflows, admin-managed content operations, developer tooling, and owner/CEO operational dashboards into a single application.

## Who Is It For?

- **Primary users:** Architecture graduates preparing for the Philippine LEA (board exam)
- **Secondary users:** Architecture students (college-level), review centers, universities
- **Internal users:** Content operators, subject matter experts, developers, company leadership

## What Problem Does It Solve?

LEA candidates need structured, comprehensive exam preparation across multiple subjects. Traditional review centers are expensive and location-bound. SlateCamp provides a digital alternative with practice testing, interactive 3D learning, taxonomy-linked reference material, spaced repetition, readiness analytics, and study trails — all in one platform.

## Major Product Areas

1. **Public Acquisition Funnel:** Landing page, about, contact, pricing, try/pre-assessment
2. **Authentication & Onboarding:** Supabase Auth, registration, onboarding profile, comp exam
3. **Core Learner Loop:**
   - Dashboard (study home with progress/readiness)
   - Quiz engine v2 (configurable practice, sessions, results, review)
   - Wiki (taxonomy-linked article system with search, bookmarks, highlights)
   - Camp Trails (structured multi-day learning paths)
   - 3D Lab (interactive R3F/WebGL architectural visualization)
   - Readiness analytics (heatmaps, pacing, stamina, mastery tracking)
   - SRS/Flash cards (spaced repetition)
   - Focus review (weak-node queue generation)
   - Notes workspace (rich text editor linked to topics)
   - Area C design practice (design problems and scenarios)
4. **Internal Operations:**
   - Admin portal (content/question/taxonomy editing, reviews, pipeline, assets, audit)
   - Developer portal (API reference, status, console, logs, DB viewer)
   - CEO portal (analytics, financials, team, permission audit)
5. **Public Utility Tools:** Construction calculators (CHB, drywall, flooring, paint), lot plotter

## Current Development Stage

**Pre-launch MVP.** The app has broad implemented functionality across all product areas. It is a beta candidate / validation-ready but not production-ready. The current launch stance is **payment-free and live-AI-provider-free**. Payments (PayRex) and live AI (OpenAI/Anthropic) are deferred post-launch work.

**Production blockers:** Supabase verification and release governance (schema verification, migration replay, type regeneration, env review).

## What Has Already Been Built

See `10_state/implementation-status--state--v2.md` for the full evidence-based inventory. Broadly:

- ✅ All 27 documented features have implementation evidence
- ✅ 128 page routes, 12 API route handlers
- ✅ 76 database tables across 9 domain families
- ✅ 101 database migrations
- ✅ 150 server action files
- ✅ 652 component files
- ✅ 88 unit/integration test files, 13 Playwright E2E specs, 113 Storybook stories
- ✅ Plan B pre-launch cleanup completed (legacy paths removed, docs consolidated)

## What Is Still Missing

See `01_roadmap/roadmap--state--v1.md` for prioritized items. Key gaps:

- [ ] Supabase verification target and migration replay
- [ ] Regenerated Supabase types from verified schema
- [ ] Production/staging deployment environment verification
- [ ] Landing page refactoring completion (active in working tree)
- [ ] Full release validation matrix run
- [ ] DB cleanup (LemonSqueezy columns, stale schema objects)
- [ ] Payment provider live verification (deferred)
- [ ] Live AI provider verification (deferred)

## Most Important Constraints

1. **Do NOT modify `.env` or expose secrets** — environment variables are documented by name only
2. **Payment-free launch** — `NEXT_PUBLIC_PAYMENTS_ENABLED=false` must remain
3. **Live-AI-free launch** — quiz AI helper UI is disabled; no live provider calls in launch UX
4. **Pre-launch MVP** — focus on the core learner loop; no scope creep
5. **Codebase is source of truth** — every claim must be backed by file paths
6. **Use Bun** for package/script execution (not npm/yarn)
7. **No destructive operations** without explicit approval (no `rm -rf`, force push, destructive migrations)
8. **Never commit secrets, `.env` files, or production credentials**

## What Future Agents Should Understand

1. **This is a large, mature codebase** — not a greenfield project. There are 128 routes, 652 components, 76 tables. Changes have blast radius.
2. **The new `.ai/` docs are the canonical entry point** — start with `PROJECT_CONTEXT.md` and follow the reading order in `.ai/README.md`. The root `README.md` is comprehensive but may have stale counts; use it for feature descriptions and route tables, but trust `.ai/` docs for current counts.
3. **The `.ai/` folder is the operational intelligence layer** — numbered folders preserve history; root-level `.ai/` files are current-state docs.
4. **Server-first but client-heavy** — Next.js App Router with Server Components by default, but many surfaces are client components (3D, quiz timers, rich editors).
5. **Supabase is the backbone** — auth, database, RLS, migrations all go through Supabase.
6. **Quiz v2 is complex** — a large Zustand store (`useQuizStore.ts`) with modes, confidence scoring, pause/resume/skip, and review flows.
7. **3D Lab is performance-sensitive** — React Three Fiber with dedicated test and performance scripts.
8. **Landing page is being refactored** — the working tree has uncommitted changes to landing components.
9. **Documentation reflects the files present on disk** — broad `.ai`/docs diffs require human semantic review before commit/release.
10. **Before editing any function/class, run blast-radius analysis** using GitNexus, code-review-graph, and ChunkHound (per root `AGENTS.md`).
