# SlateCamp Full-Spectrum Codebase & Business Audit Plan

**Date:** 2026-03-25
**Scope:** Full spectrum — business preparedness, shipping quality, feature completeness, improvement opportunities
**Output:** `GLOBAL-CODEBASE-AUDIT-REPORT.md` in project root

---

## Plan Overview

11 phases (10 original + 1 SlateCamp-specific), adapted to SlateCamp's stack, design system, and pedagogical engine. Each phase produces hard numbers, file paths, and scorecards — no vibes.

### What This Audit Will Answer
1. **What features are missing?** Gap analysis against PRDs and market expectations
2. **What existing features need improvement?** Completeness scoring per feature
3. **What's the shipping quality?** Campfire design system compliance, UX polish, error/loading coverage
4. **Is the architecture sound?** Server/client boundaries, data fetching, state management
5. **Is it secure?** RLS, auth gates, input validation, env var hygiene
6. **Is it performant?** Bundle size, render waterfalls, R3F 60fps compliance
7. **Is the pedagogical engine correct?** IRT calculations, SRS logic, testing mode rules
8. **Is it business-ready?** Monetization, onboarding, investor-grade code quality
9. **What's the priority roadmap?** Tiered action items ordered by impact x effort

---

## Phase 1: Infrastructure & Git Archaeology
**Goal:** Understand what SlateCamp IS — stack, velocity, churn, scale.

### Data Collection
- Directory structure (3 levels, ignore node_modules/.next/.git)
- Tech stack fingerprint: package.json, tsconfig.json, next.config.ts, tailwind.config.ts
- Dependency audit: all deps + devDeps, flag outdated/vulnerable
- Git velocity: commits/week over last 3 months, trend analysis
- Churn hotspots: top 30 most-changed files (last 3 months)
- File counts by type (.ts, .tsx, .css, .test.*, .spec.*)
- Environment variable surface: all process.env references, .env.example existence
- Documentation inventory: README, CLAUDE.md, .claude/docs/ coverage

### SlateCamp Adaptations
- Check Bun lockfile existence and consistency
- Check .claude/docs/ structure against PRD completeness
- Check DATABASE_SCHEMA.sql freshness vs migrations
- Verify Supabase project config files

### Output
| Section | What to Report |
|---------|---------------|
| Tech Stack | Next.js version, React, Tailwind 4, Supabase, R3F, Zustand, shadcn/ui, Bun |
| Dependency Health | Total deps, vulnerable/outdated, unnecessary |
| Git Velocity | Commits/week trend, acceleration/deceleration |
| Churn Hotspots | Top 10 most-changed files with risk assessment |
| Codebase Scale | Total files, approximate LOC, test coverage ratio |
| Env Var Surface | Count, secret separation, NEXT_PUBLIC_ exposure |
| Documentation | PRD coverage, architecture docs, onboarding docs |
| First Impression | 3-sentence CTO gut check |

---

## Phase 2: Feature Roster & Completeness Audit
**Goal:** Map every user-facing feature. Score completeness. Identify gaps.

### Data Collection
- Full route map: all page.tsx, layout.tsx, route.ts, loading.tsx, error.tsx, not-found.tsx
- Middleware analysis: auth gates, role-based routing
- Server Actions inventory: all 'use server' files
- API route handlers: all routes in src/app/api/
- Read core page files for each portal (Admin, CEO, Developer, Dashboard)
- Cross-reference against PRDs in .claude/docs/03-PRDs/

### SlateCamp Adaptations
- **Portal-by-portal feature audit:**
  - Dashboard (student): Wiki, Testing, Notes, Analytics, Assessment, 3D Lab, Trails
  - Admin: Content editor, Questions, Articles, Taxonomy, Pipeline, Assets, Audit log
  - CEO: Financials, Insights, Team
  - Developer: API reference, Architecture, Design system
- **Testing mode completeness:** Camp, Storm, Chill, Focus Review (Blindspot) — each must have distinct UX, timer behavior, scoring
- **Marketing pages:** Landing, Pricing, About, Contact, Try — conversion funnel completeness
- **Onboarding flow:** Registration -> first quiz -> aha moment path
- **Feature gap analysis against exam prep market:**
  - Spaced repetition with SRS
  - Performance analytics with IRT
  - AI-powered explanations
  - Progress tracking with Readiness Score
  - Study scheduling / pacing
  - Social/collaborative features
  - Mobile experience
  - Offline mode

### Output
| Feature | Route(s) | Portal | Category | Completeness | Missing States | Notes |
|---------|----------|--------|----------|-------------|----------------|-------|

Categories: Core Value Driver, Activation/Onboarding, Retention/Engagement, Monetization, Supporting System, Incomplete/Orphaned

Also report: route coverage gaps (loading/error/not-found), unused API routes, middleware auth coverage

---

## Phase 3: Architecture Deep Dive
**Goal:** Find architectural anti-patterns that cost engineering hours.

### Data Collection
- Client vs Server component ratio (target: <40% client)
- Suspect client components (use client but no hooks/events/browser APIs)
- Inline component definitions in page/layout files
- Data fetching patterns: direct Supabase calls vs query layer discipline
- select('*') queries (overfetching)
- Parallel vs waterfall data fetching in pages
- State management audit: Zustand stores, React Context usage
- Import hygiene: barrel files, relative vs absolute imports
- Prop drilling detection: interfaces with >6 props

### SlateCamp Adaptations
- **Multi-portal PortalLayout consistency:** Do all 4 portals use the same shell pattern?
- **Query layer discipline:** Are Supabase calls isolated in src/lib/queries/ and src/lib/actions/, or leaking into components?
- **IRT/SRS engine isolation:** Is calculation logic separated from UI?
- **R3F component architecture:** Are 3D scenes properly isolated with Suspense boundaries?
- **Zustand store fragmentation:** How many stores? Are they domain-scoped?

### Output
Score each category (pass/needs-work/critical) with finding counts and file paths.
Top 5 Architectural Bottlenecks with exact locations.

---

## Phase 4: Database & Security Audit
**Goal:** Find data leaks, missing RLS, unindexed queries, auth vulnerabilities.

### Data Collection
- Schema analysis from DATABASE_SCHEMA.sql (1,947 lines)
- Migration files in supabase/migrations/
- RLS policy coverage: every table with user data must have RLS
- Supabase client setup: server vs browser client separation
- Auth pattern: getUser/getSession usage, middleware enforcement
- Service role key isolation (must be server-only)
- Unscoped queries (missing user_id filters)
- Input validation: Zod schemas in src/lib/validations/
- NEXT_PUBLIC_ variable exposure audit
- Error handling in server actions: try/catch coverage
- Soft delete compliance

### SlateCamp Adaptations
- **Quiz response data integrity:** Are answers, scores, and mastery calculations tamper-proof?
- **Admin role separation:** Can non-admins access admin actions?
- **CEO dashboard data isolation:** Financial data access control
- **Payment webhook security:** Stripe/PayRex signature verification
- **AI Tutor prompt injection:** Can users manipulate AI responses?
- **Wiki content XSS:** User-generated or admin-generated content sanitization

### Output
Security Scorecard with pass/needs-work/critical per vector.
Critical Security Findings with file:line and recommended fix.

---

## Phase 5: Performance Audit
**Goal:** Render waterfalls, bundle bloat, missing optimizations.

### Data Collection
- next.config.ts analysis (bundle, webpack, turbopack settings)
- Image optimization: next/image usage vs raw <img>
- Dynamic imports / code splitting usage
- Suspense boundary count vs page route count
- Loading state coverage (loading.tsx ratio)
- Skeleton component inventory
- Sequential await waterfalls in page components
- console.log pollution count
- Heavy dependency check (moment, lodash, axios, d3, chart.js)
- Font loading strategy (next/font)

### SlateCamp Adaptations
- **R3F/Three.js performance:**
  - Are 3D scenes lazy-loaded / code-split?
  - Suspense boundaries around Canvas components?
  - 60fps target verification approach
  - Three.js bundle impact (typically 500KB+)
- **Quiz session performance:**
  - Auto-save every 10 seconds — is this debounced properly?
  - Timer accuracy under load
  - Large question set rendering (virtualization?)
- **Wiki article rendering:**
  - MDX/rich content rendering performance
  - Widget lazy loading (dsgn013 widgets are heavy)
- **Analytics dashboard:**
  - Chart rendering performance
  - Data fetching strategy for heatmaps, trajectories

### Output
Performance Scorecard with scoring per category.
Top 5 Performance Bottlenecks with impact estimates.

---

## Phase 6: TypeScript & Code Quality
**Goal:** Type safety, code hygiene, maintainability debt.

### Data Collection
- tsconfig.json strictness settings
- `any` type count and locations
- @ts-ignore / @ts-expect-error / @ts-nocheck count
- Missing return types on exported functions
- Props interface coverage vs component count
- Relative imports (../.. vs @/)
- Naming consistency across components and utilities
- TODO/FIXME/HACK/TEMP comment inventory
- Duplicate utility functions
- Test file count and coverage tool configuration
- ESLint configuration analysis

### SlateCamp Adaptations
- **IRT type safety:** Are theta, discrimination, difficulty parameters typed (not `any`)?
- **Supabase generated types:** Is src/types/supabase.ts up to date with DATABASE_SCHEMA.sql?
- **Testing types:** Does src/types/testing.ts cover all quiz modes and session states?
- **Action return types:** Do server actions have typed responses (not `any`)?
- **12 test files for 1,152 source files** — identify critical untested paths

### Output
Code Quality Scorecard with counts vs targets.
Critical untested code paths list.

---

## Phase 7: UX, UI & Campfire Design System Audit
**Goal:** Visual consistency, Campfire compliance, accessibility, cognitive load.

### Data Collection
- shadcn/ui component inventory
- Button/Card/Modal variant count (should be centralized)
- Hardcoded hex colors vs Campfire design tokens
- Empty state coverage across all features
- Error state coverage across all features
- Loading/skeleton component coverage
- ARIA attribute count, alt text coverage
- Dark mode utility count (should be minimal — SlateCamp is light-mode)
- Responsive breakpoint coverage
- Font usage consistency (Inter only)

### SlateCamp-Specific Campfire Compliance Checks
- **Color tokens:** Every color must map to Campfire palette (Camp Cobalt, Camp Orange, Emerald, Warm Red, Amber, etc.)
- **Typography:** Minimum 11px text. No monospace on labels/categories (only code/data values/Readiness Score)
- **Shadows:** Cards at rest = shadow-none, hover = shadow-sm. No shadow-xl/2xl on non-modals
- **Border radii:** Cards = rounded-md, Buttons/inputs = rounded-sm, Modals = rounded-lg. No rounded-xl/2xl/3xl
- **Transitions:** Max 300ms. No duration-500/700/1000. No bounce/spring easing (except framer-motion structural)
- **prefers-reduced-motion:** All decorative animations must be suppressible
- **Voice compliance:** No "drill/grind/weakness/gap/dominate/conquer" language. Growth-framed copy
- **Three-Part Engagement Test:** Any gamification must pass: improves learning? respectful? maps to pedagogy?
- **Font check:** Only Inter loaded via next/font/google. No Arial, Roboto, system fonts

### Output
Design System Health Scorecard per dimension.
Campfire Violation Inventory with file:line and fix.
Voice Guide Violation List.

---

## Phase 8: Pedagogical Engine Audit (SlateCamp-Specific)
**Goal:** Verify correctness of the learning engine — IRT, SRS, testing modes, mastery calculations.

### Data Collection
- Read IRT calculation logic in src/lib/ (theta, 2PL model)
- Read SRS/spaced repetition logic in src/lib/srs/
- Read Readiness Score computation in src/lib/readiness/
- Read testing mode behaviors: Camp, Storm, Chill, Focus Review
- Read blindspot/focus review logic in src/lib/blindspot/
- Read mastery action logic in src/lib/actions/mastery-actions.ts
- Read session management in src/components/testing/session/
- Cross-reference against Testing & Quizzing PRD in .claude/docs/03-PRDs/

### Verification Points
- **IRT 2PL Model:** Is theta correctly computed using discrimination (a) and difficulty (b) parameters?
- **SRS Intervals:** Do review intervals follow evidence-based spacing (not arbitrary)?
- **Testing Modes:**
  - Camp: Untimed, unlimited attempts, learning-focused
  - Storm: Timed, pressure simulation, exam-like
  - Chill: Relaxed, self-paced, low-pressure
  - Focus Review (Blindspot): Targets weak areas identified by mastery scores
- **Mastery Calculation:** Based on IRT theta, not raw percentage correct?
- **Auto-save:** Every 10 seconds during sessions, state persists across page refreshes?
- **AI Tutor:** Temperature 0.0, mandatory citation badges linking to Wiki paragraphs?
- **Taxonomy Heatmap:** Correctly maps mastery levels to visual indicators?
- **Readiness Score:** Single composite score reflecting exam readiness?

### Output
Pedagogical Correctness Scorecard.
List of deviations from PRD specs.
Recommendations for pedagogical improvements.

---

## Phase 9: Dead Code & Dependency Waste
**Goal:** Find every file, export, dependency, and route costing maintenance with zero value.

### Data Collection
- Orphan component detection (components not imported anywhere)
- Unused dependencies (deps not referenced in src/)
- Unused exports from src/lib/
- Empty or near-empty files (<5 lines)
- Commented-out code blocks
- Orphaned route pages (routes with no navigation path)
- Unused type definitions

### SlateCamp Adaptations
- **Check recently deleted files from git status** (AppleCloseButton.tsx deleted, prompt files deleted)
- **CEO dashboard components** — are they all wired up or partially built?
- **Developer hub** — is it functional or placeholder?
- **3D Lab scenes** — which are active vs experimental?
- **Payment providers** — is PayRex active alongside Stripe or abandoned?
- **Demo/mock data** — should src/lib/mocks/ exist in production?

### Output
Waste Inventory table by category with counts and impact assessment.

---

## Phase 10: Business & Strategic Audit
**Goal:** Bridge code to business. Feature completeness vs market. Monetization readiness.

### Analysis Framework (Synthesis of Phases 1-9)

**Product-Market Fit:**
- Core value proposition coverage (% of codebase on learning engine vs supporting systems)
- Churn hotspots alignment with core product
- Onboarding funnel completeness (registration -> first value moment)
- Competitor feature parity (exam prep market table)

**Technical Risk:**
- Critical findings summary from security, performance, architecture phases
- Engineering-weeks estimate for remediation
- 10x user scalability assessment

**Monetization Readiness:**
- Payment system completeness (Stripe integration, subscription flows, upgrade CTAs)
- Paywall gates on premium features
- Pricing page -> checkout -> access flow
- Trial/freemium model implementation

**Feature Completeness vs Market:**
| Feature Category | SlateCamp Status | Market Expectation | Gap |
|-----------------|-----------------|-------------------|-----|
| Question Bank | ? | Large, categorized, searchable | ? |
| Adaptive Learning | IRT-based | AI-powered adaptation | ? |
| Progress Analytics | Readiness Score + Heatmap | Detailed performance dashboard | ? |
| Study Scheduling | ? | Smart pacing recommendations | ? |
| Mobile Experience | Responsive web | Native app or PWA | ? |
| Collaborative | ? | Study groups, forums | ? |
| Content Library | Wiki articles | Comprehensive reference | ? |
| Practice Exams | Testing modes | Realistic simulations | ? |
| AI Tutor | Citation-based | Contextual explanations | ? |

### Output
Narrative CTO memo with evidence from all phases.
Feature gap matrix.
Monetization readiness score.
Recommended next 3 sprints.

---

## Phase 11: Master Report Generation
**Goal:** Synthesize all findings into `GLOBAL-CODEBASE-AUDIT-REPORT.md`.

### Document Structure
1. Executive Summary (60-second brief, overall health grade A-F)
2. Tech Stack & Infrastructure
3. Git Archaeology & Shipping Velocity
4. Feature Roster & Business Alignment
5. Architecture Review
6. Database & Security Audit
7. Performance Assessment
8. Code Quality & Type Safety
9. Campfire Design System Compliance (SlateCamp-specific)
10. Pedagogical Engine Assessment (SlateCamp-specific)
11. Dead Code & Waste Inventory
12. Business & Strategic Assessment
13. The Remediation Roadmap (Tier 1/2/3)
14. Feature Implementation Backlog (prioritized)
15. Appendix (full lists)

### Quality Requirements
- Every finding has a file path or command output as evidence
- Every recommendation has a clear action verb
- Scorecards use consistent pass/needs-work/critical ratings
- Roadmap ordered by impact x effort
- Feature backlog ordered by business value
- No filler sentences

---

## Execution Strategy

### Parallelization
- Phases 1-2 run first (foundation context)
- Phases 3-6 can run as parallel agent tasks (Architecture, Security, Performance, Code Quality)
- Phase 7 (Design System) runs after phases 3-6 (needs their findings)
- Phase 8 (Pedagogical) can run in parallel with Phase 7
- Phase 9 (Dead Code) can run in parallel with Phases 7-8
- Phase 10 (Business) runs after all data phases complete
- Phase 11 (Report) runs last, synthesizing everything

### Agent Assignments
| Phase | Agent Type | Model |
|-------|-----------|-------|
| 1. Infrastructure | explore | haiku |
| 2. Features | explore + analyst | sonnet |
| 3. Architecture | architect | opus |
| 4. Security | security-auditor | opus |
| 5. Performance | executor | sonnet |
| 6. Code Quality | code-reviewer | opus |
| 7. Design System | designer | sonnet |
| 8. Pedagogical | analyst | opus |
| 9. Dead Code | explore | haiku |
| 10. Business | analyst | opus |
| 11. Report | writer + executor | sonnet |

### Estimated Scope
- **Total phases:** 11
- **Parallelizable:** Phases 3-6 (4 parallel), Phases 7-9 (3 parallel)
- **Sequential:** Phases 1-2, then parallel waves, then 10-11
- **Output:** Single comprehensive markdown report + tiered action items
