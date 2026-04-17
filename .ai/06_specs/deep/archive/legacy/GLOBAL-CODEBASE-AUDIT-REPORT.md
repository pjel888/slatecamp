# GLOBAL CODEBASE AUDIT REPORT

## SlateCamp -- 2026-03-25

> Live note as of 2026-04-05: this report is a historical audit snapshot. For current design tokens, typography, and implementation details, use `CLAUDE.md`, `src/app/globals.css`, and `src/app/layout.tsx`.

---

### 1. EXECUTIVE SUMMARY

SlateCamp is a discipline-agnostic professional licensure exam preparation platform built by a solo developer over 18 days (273 commits since 2026-03-07). The product delivers a genuinely differentiated learning engine -- IRT-based adaptive mastery, 7 testing modes, anti-inflation readiness scoring, interactive 3D spatial widgets, and a comprehensive wiki with embedded pedagogy -- wrapped in a modern Next.js 16 / React 19 / Supabase stack. The core learning experience is strong (88% competitive score), the admin tooling is mature (92%), and the CEO analytics dashboard is fully operational (85%). However, three systemic issues must be addressed before the product can charge money or scale: (1) the spaced repetition system is disconnected from the primary testing flow, silently disabling the core learning loop; (2) payment buttons on the upgrade page are non-functional, blocking all revenue; and (3) security headers are completely absent from the production configuration, leaving the application vulnerable to clickjacking and XSS.

**Overall Health Grade: B-**

The codebase demonstrates exceptional velocity and architectural ambition from a solo developer, with several production-quality subsystems (analytics Suspense architecture, wiki widget lazy-loading, 3D Lab demand rendering). The grade is held back by zero functional test coverage, TypeScript strict mode disabled, the SRS/IRT disconnection, and 2,576 hardcoded hex colors bypassing the design token system.

#### Summary Scorecard

| Dimension              | Grade | Status     | Key Finding                                                                          |
| ---------------------- | ----- | ---------- | ------------------------------------------------------------------------------------ |
| Infrastructure & Stack | A-    | CLEAN      | Modern stack (Next.js 16, React 19, TS 5.9, Tailwind 4), proper env separation       |
| Feature Completeness   | B+    | CLEAN      | 105 pages, 7 testing modes, 4 portals, 212 server actions                            |
| Architecture           | C+    | NEEDS_WORK | 22 waterfall pages, no query abstraction layer, 56% client component ratio           |
| Security               | C     | NEEDS_WORK | No security headers, XSS in question-card, unauthenticated debug route               |
| Performance            | B     | NEEDS_WORK | Good Suspense/loading coverage, but 9 critical waterfalls and ~200KB shader gradient |
| Code Quality           | D+    | CRITICAL   | strict: false, 1.2% test coverage, 79% of actions lack error handling                |
| Design System          | C-    | CRITICAL   | 2,576 hardcoded hex colors, dual icon libraries, 92% card component bypass           |
| Pedagogical Engine     | B     | NEEDS_WORK | IRT/SM-2 math correct but SRS disconnected from primary testing flow                 |
| Dead Code & Waste      | C+    | NEEDS_WORK | 9 orphan components, 8 unused deps, 78 dead exports, 3 duplicate route trees         |

---

### 2. TECH STACK & INFRASTRUCTURE

#### Stack Overview

| Layer           | Technology                   | Version                  | Assessment                          |
| --------------- | ---------------------------- | ------------------------ | ----------------------------------- |
| Framework       | Next.js (App Router)         | 16.1.6                   | Current                             |
| React           | React + React DOM            | 19.2.4                   | Current                             |
| Language        | TypeScript                   | 5.9.3                    | Current, but strict: false          |
| Styling         | Tailwind CSS 4 (CSS-first)   | 4.2.2                    | Current                             |
| UI Primitives   | shadcn/ui + @base-ui/react   | 4.1.0 / 0.9.5            | Current                             |
| State           | Zustand                      | 5.0.12                   | Clean, 5 stores                     |
| Database        | Supabase (PostgreSQL)        | 2.100.0                  | Current                             |
| Auth            | Supabase SSR                 | 0.9.0                    | Current                             |
| 3D/Spatial      | React Three Fiber + Three.js | R3F 9.5.0, Three 0.183.2 | Current                             |
| Animation       | Framer Motion                | 12.38.0                  | Current                             |
| Rich Text       | TipTap                       | 3.20.4 (13 extensions)   | Current                             |
| Charts          | Recharts                     | 3.8.0                    | Current                             |
| AI              | Anthropic SDK                | 0.78.0                   | Current                             |
| Payments        | LemonSqueezy + PayRex              | 20.4.1 / 1.7.3           | Current but non-functional          |
| Package Manager | Bun                          | bun.lock present         | Current                             |
| Deployment      | Vercel                       | 2 cron jobs configured   | Current                             |
| Icons           | Lucide + Phosphor            | 0.577.0 / 2.1.10         | Dual library -- needs consolidation |

#### Dependency Health

- **56 production + 8 dev dependencies** (64 total)
- **3 duplicate packages:** `dompurify` / `isomorphic-dompurify`, `shadcn` / `shadcn-ui`, `lucide-react` / `@phosphor-icons/react`
- **No bloat dependencies:** No moment.js, lodash, axios, or jQuery detected
- **8 unused packages safe to remove:** `camera-controls`, `katex`, `next-devtools-mcp`, `pdf-parse`, `react-markdown`, `rehype-katex`, `remark-math`, `shadcn-ui`, `three-stdlib`
- **Misplaced dependencies:** `@types/dompurify` and `@types/papaparse` in production deps (should be devDependencies); `supabase` CLI in production deps

#### Environment Variable Hygiene

- **19 unique env vars** (6 `NEXT_PUBLIC_*`, 11 server-only secrets, 2 config flags)
- `.env.example` exists with all variables documented
- `.env.local` correctly gitignored
- No secrets in `NEXT_PUBLIC_*` variables
- LemonSqueezy publishable key correctly uses `NEXT_PUBLIC_` prefix
- **Assessment: CLEAN**

#### Database Schema

| Metric                  | Value                                              |
| ----------------------- | -------------------------------------------------- |
| Tables                  | 51 (50 with RLS, 1 intentionally excluded)         |
| Migrations              | 38 (mixed naming: sequential + date-prefixed)      |
| RLS Policies            | 89+                                                |
| Schema file             | `DATABASE_SCHEMA.sql` (1,947 lines)                |
| Missing from schema doc | `user_roles`, `audit_logs`, `profiles.role` column |

---

### 3. GIT ARCHAEOLOGY & SHIPPING VELOCITY

#### Commit Velocity

| Week            | Commits | Daily Avg | Trend               |
| --------------- | ------- | --------- | ------------------- |
| W10 (Mar 2-8)   | 8       | 1.1/day   | Project inception   |
| W11 (Mar 9-15)  | 63      | 9.0/day   | Heavy buildout      |
| W12 (Mar 16-22) | 153     | 21.9/day  | Peak velocity       |
| W13 (Mar 23-25) | 49      | 16.3/day  | Current (3 days in) |

**273 commits in 18 days from a single developer.** Sharply accelerating trend (W12 was 2.4x W11). Commit messages follow conventional commit format with scoped prefixes (`feat()`, `fix()`, `refactor()`, `chore()`, `revert()`).

#### Churn Hotspot Analysis

| Rank | File                                        | Changes | Risk                                                |
| ---- | ------------------------------------------- | ------- | --------------------------------------------------- |
| 1    | `src/components/shared/Sidebar.tsx`         | 34      | HIGH -- core navigation, API unstable               |
| 2    | `src/app/globals.css`                       | 32      | MEDIUM -- design token migration expected           |
| 3    | `src/app/dashboard/page.tsx`                | 29      | HIGH -- main entry, frequent restructuring          |
| 4    | `src/app/dashboard/layout.tsx`              | 27      | HIGH -- layout architecture still settling          |
| 5    | `src/components/marketing/HeroSection.tsx`  | 22      | LOW -- marketing iteration                          |
| 6    | `src/components/dashboard/QuizRenderer.tsx` | 22      | HIGH -- core product, fragile                       |
| 7    | `src/types/app.ts` (885 lines)              | 18      | HIGH -- type definitions changing = API instability |

**Pattern:** 5 of the top 15 most-changed files are core product files with HIGH churn risk. Layout and navigation architecture has not settled (Sidebar: 34 changes, dashboard layout: 27, SharedPageLayout: 15). This is the signature of a project still searching for its structural patterns.

#### Shipping Pattern Narrative

This is a solo developer operating at extreme velocity -- 15 commits/day average, peaking at 22/day during W12. The commit history shows a builder who ships features end-to-end (routes, components, server actions, types) rather than leaving stubs. The risk is not abandonment but accumulated fragility: at this pace, there is no time for testing, refactoring, or hardening. The codebase is a fast-growing tree that has not been pruned.

---

### 4. FEATURE ROSTER & BUSINESS ALIGNMENT

#### Feature Table by Portal

**Dashboard Portal (Student-Facing) -- 33 pages**

| Feature                        | Completeness | Category                              |
| ------------------------------ | ------------ | ------------------------------------- |
| Wiki Browser + Articles        | 90-95%       | Core Value Driver                     |
| Testing Hub (7 modes)          | 85-95%       | Core Value Driver                     |
| Analytics (8 visualizations)   | 95%          | Core Value Driver                     |
| Notes (CRUD + folders)         | 85%          | Retention/Engagement                  |
| 3D Lab                         | 80%          | Core Value Driver                     |
| Camp Trails (structured study) | 85%          | Core Value Driver                     |
| Assessment + Score Reveal      | 90%          | Activation/Onboarding                 |
| Settings                       | 50%          | Supporting (billing, profile missing) |
| Upgrade Page                   | 60%          | Monetization (buttons non-functional) |

**Admin Portal -- 27 pages**

| Feature                             | Completeness | Category          |
| ----------------------------------- | ------------ | ----------------- |
| Articles CRUD                       | 95%          | Core Value Driver |
| Questions CRUD + Import + Analytics | 95%          | Core Value Driver |
| Taxonomy Editor + Coverage Map      | 90%          | Core Value Driver |
| Unified Content Editor              | 90%          | Core Value Driver |
| Publishing Pipeline                 | 85%          | Supporting System |
| SME Review Queue                    | 85%          | Supporting System |
| 3D Asset Manager                    | 80%          | Supporting System |
| Global Search                       | 80%          | Supporting System |
| Roles, Activity, Audit              | 75-85%       | Supporting System |

**CEO Portal -- 4 pages**

| Feature                             | Completeness | Category                               |
| ----------------------------------- | ------------ | -------------------------------------- |
| Command Center (MRR, ARR, runway)   | 90%          | Supporting System                      |
| Financials (P&L, expenses, runway)  | 90%          | Supporting System                      |
| Behavioral Insights (cohort, churn) | 90%          | Supporting System                      |
| Team Management                     | 75%          | Supporting (add member non-functional) |

**Developer Portal -- 21 pages**

| Feature                       | Completeness | Category               |
| ----------------------------- | ------------ | ---------------------- |
| Design System Catalog         | 90%          | Supporting System      |
| API Reference                 | 85%          | Supporting System      |
| Architecture Docs             | 85%          | Supporting System      |
| Dev Tools (console, DB, logs) | 80%          | Supporting System      |
| Status Dashboard              | 70%          | Supporting (mock data) |

#### Feature Gap Matrix vs Exam Prep Market

| Feature                | Market Expectation               | SlateCamp Status                                        | Score |
| ---------------------- | -------------------------------- | ------------------------------------------------------- | ----- |
| Question Bank          | Large, categorized, searchable   | Full CRUD, taxonomy-mapped, import, analytics           | 90%   |
| Adaptive Learning      | AI-powered difficulty adjustment | IRT 2PL implemented but orphaned from primary flow      | 85%   |
| Progress Analytics     | Detailed dashboard               | 8 visualization types, readiness trajectory             | 95%   |
| Study Scheduling       | Study plan + pacing              | Camp Trails with daily prescriptions                    | 80%   |
| Mobile Experience      | Responsive or PWA                | Responsive Tailwind, mobile drawer, no PWA              | 60%   |
| Collaborative Features | Study groups, forums             | None                                                    | 0%    |
| Content Library        | Comprehensive reference          | Wiki with taxonomy, widgets, 3D models, citations       | 95%   |
| Practice Exams         | Realistic simulations            | Full exam sim with readiness gate + 24h delivery        | 85%   |
| AI Tutor               | Contextual explanations          | Implemented, temp=0, citations (not clickable)          | 75%   |
| Offline Mode           | Study without internet           | None (no service worker, no PWA)                        | 0%    |
| Spaced Repetition      | SRS scheduling                   | SM-2 implemented but disconnected from new testing flow | 70%   |
| Payment/Subscription   | Seamless billing                 | Routes exist, buttons non-functional                    | 55%   |
| Onboarding             | Smooth first experience          | Try-before-signup, 4-step funnel, score reveal          | 85%   |

#### Competitive Score Breakdown

| Category                      | Score   |
| ----------------------------- | ------- |
| Core Learning Experience      | 88%     |
| Content Quality Tools (Admin) | 92%     |
| Business Intelligence (CEO)   | 85%     |
| Marketing/Acquisition         | 55%     |
| Monetization                  | 45%     |
| Social/Collaborative          | 0%      |
| **Weighted Average**          | **72%** |

---

### 5. ARCHITECTURE REVIEW

#### Architecture Scorecard

| Category                    | Score      | Finding                                                          |
| --------------------------- | ---------- | ---------------------------------------------------------------- |
| Client vs Server Components | CRITICAL   | 56% client ratio (target <40%); 106 suspect `'use client'` files |
| Data Fetching Architecture  | CRITICAL   | 40+ page.tsx files with inline Supabase queries, no query layer  |
| Overfetching                | CRITICAL   | 47 `select('*')` calls across actions and queries                |
| Waterfall Data Fetching     | CRITICAL   | 22 pages with sequential awaits, no Promise.all                  |
| State Management            | CLEAN      | 5 Zustand stores, 10 Contexts, all domain-scoped                 |
| Import Hygiene              | CLEAN      | 87% absolute imports, zero deep relative imports                 |
| IRT/SRS Engine Isolation    | CLEAN      | Pure functions in `src/lib/srs/`, no leaks into components       |
| R3F Architecture            | CLEAN      | Lazy-loaded, demand rendering, DPR capped                        |
| Multi-Portal Consistency    | CLEAN      | Admin, CEO, Developer share PortalLayout                         |
| Query Layer Discipline      | NEEDS_WORK | 5 files in `src/lib/queries/` vs 40+ inline in pages             |
| Prop Drilling               | NEEDS_WORK | PacingInsights has 55 props                                      |

#### Server/Client Boundary Analysis

- **Total .tsx files:** 692
- **Files with `'use client'`:** 387 (55.9%)
- **Target:** <40%
- **Estimated truly removable directives:** 60-70 files (after excluding shadcn primitives needing Radix event handlers)
- **Worst offender categories:** Marketing/landing (10), CEO charts (8), analytics charts (7), testing debrief (6), portal shells (3)

#### Data Fetching Patterns

The codebase has no centralized query abstraction layer. Only 5 files exist in `src/lib/queries/`; the remaining ~40+ pages contain inline Supabase queries. This means:

- Zero query reuse across pages
- No caching layer
- No type safety at the data boundary
- Changing a table name requires editing 40+ files

#### Waterfall Pages (Top Offenders)

| Page                                                                | Sequential Awaits | Estimated Latency Waste |
| ------------------------------------------------------------------- | ----------------- | ----------------------- |
| `src/app/(auth)/onboarding/page.tsx`                                | 10                | ~500ms                  |
| `src/app/dashboard/testing/page.tsx`                                | 8                 | ~400ms                  |
| `src/app/dashboard/testing/session/[sessionId]/debrief/page.tsx`    | 7                 | ~350ms                  |
| `src/app/dashboard/testing/session/[sessionId]/page.tsx`            | 6                 | ~300ms                  |
| `src/app/dashboard/testing/simulation/[sessionId]/results/page.tsx` | 6                 | ~300ms                  |
| `src/app/dashboard/score-reveal/page.tsx`                           | 6                 | ~300ms                  |

11 pages correctly use `Promise.all` (wiki article, notes, CEO dashboard, admin content). The analytics page is the gold standard with 8 independent Suspense boundaries.

#### Top Architectural Bottlenecks

1. **No query abstraction layer** -- 40+ pages with inline Supabase calls (8-12 hours to fix)
2. **22 waterfall pages** -- Sequential awaits wasting 300-500ms per page load (2-3 hours to fix)
3. **47 select('\*') overfetching calls** -- Full table scans where only 3-5 columns needed (4-6 hours)
4. **106 unnecessary 'use client' directives** -- Forcing JS to ship for display-only components (4-6 hours)
5. **Mixed queries/actions in src/lib/actions/** -- No read/write separation, no caching boundary (6-8 hours)

**Estimated total remediation: 30-44 engineering hours**

---

### 6. DATABASE & SECURITY AUDIT

#### Security Scorecard

| Vector                     | Status     | Details                                                                     |
| -------------------------- | ---------- | --------------------------------------------------------------------------- |
| RLS on all user tables     | CLEAN      | 50/51 tables have RLS; `anon_diagnostic_sessions` intentionally excluded    |
| Auth on protected routes   | NEEDS_WORK | Middleware covers portals but 5 admin query functions lack server-side auth |
| Input validation           | NEEDS_WORK | 13 Zod schemas defined but most server actions accept raw args              |
| Service role key isolation | CLEAN      | Only in `src/lib/supabase/admin.ts`, never in client code                   |
| Env var hygiene            | CLEAN      | Proper `.gitignore`, no secrets in `NEXT_PUBLIC_*`                          |
| Payment security           | CLEAN      | Webhook signature verified, tier from metadata                              |
| Error handling             | NEEDS_WORK | Only 10/45 server action files have try/catch                               |

#### Critical Security Findings

**CRITICAL-001: Missing Security Headers**

- **File:** `next.config.ts`
- No `X-Frame-Options`, `Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options`, `Referrer-Policy`, or `Permissions-Policy`
- App is vulnerable to clickjacking and MIME sniffing

**CRITICAL-002: Cross-User Data Leak**

- **File:** `src/lib/actions/social-proof.ts`
- Three server actions query `user_interactions` across all users without auth check
- RLS mitigates but function design is insecure-by-default

**CRITICAL-003: Unsanitized HTML Rendering (XSS)**

- **File:** `src/components/shared/question-card.tsx` (lines 233, 243, 409)
- Three instances of `dangerouslySetInnerHTML` render database content without DOMPurify sanitization
- Stored XSS risk: malicious question content executes in every student's browser

**CRITICAL-004: Unauthenticated Debug Route**

- **File:** `src/app/api/debug-taxonomy/route.ts`
- GET endpoint exposes taxonomy structure with zero auth
- Any anonymous user can enumerate internal data structure

#### Auth Architecture

Three divergent role-check mechanisms exist:

1. **RLS policies** check `raw_app_meta_data ->> 'role' = 'admin'` (JWT metadata)
2. **Application code** checks `user_roles` table via `getUserRole()`
3. **CEO auth** checks `profiles.role` column

These three sources of role truth can diverge. A user could have a role in `user_roles` but not in JWT metadata, or vice versa.

#### Payment Security Assessment

| Check                                  | Status                                         |
| -------------------------------------- | ---------------------------------------------- |
| LemonSqueezy webhook signature verified      | YES                                            |
| PayRex webhook signature verified      | YES                                            |
| Checkout requires authentication       | YES                                            |
| Tier from webhook metadata, not client | YES                                            |
| Free tier checkout blocked             | YES                                            |
| **Payment buttons functional**         | **NO -- upgrade page buttons have no onClick** |

---

### 7. PERFORMANCE ASSESSMENT

#### Performance Scorecard

| Category                    | Score      | Key Finding                                                   |
| --------------------------- | ---------- | ------------------------------------------------------------- |
| Image optimization          | CLEAN      | 7 images in public/, largest 20KB, not image-heavy            |
| Code splitting              | NEEDS_WORK | 10 dynamic imports / 371 client components (2.7%)             |
| Suspense coverage           | CLEAN      | 15 files, analytics page exemplary (8 boundaries)             |
| Loading state coverage      | CLEAN      | 87/105 pages (83%) have loading.tsx                           |
| Data fetching efficiency    | NEEDS_WORK | 9 critical waterfall pages                                    |
| Bundle hygiene              | NEEDS_WORK | 4 fonts, dual icons, ~200KB shader gradient for 1 component   |
| 3D/R3F performance          | CLEAN      | `frameloop="demand"`, `dpr={[1,1.5]}`, all scenes lazy-loaded |
| Quiz session performance    | CLEAN      | 10s auto-save, localStorage fallback, offline queue           |
| Chart/analytics performance | CLEAN      | Per-section Suspense with independent streaming               |
| Wiki widget performance     | CLEAN      | Content-aware lazy loading via widget registry                |

#### Bundle Impact Analysis (Top 5 Concerns)

| Dependency                | Est. Size (min+gz) | Usage                        | Issue                                                           |
| ------------------------- | ------------------ | ---------------------------- | --------------------------------------------------------------- |
| `@shadergradient/react`   | ~200KB+            | 1 file (`GradientImage.tsx`) | Bundles full Three.js shader pipeline for a decorative gradient |
| `three` + R3F + drei      | ~180KB             | 17 files (3D lab only)       | Properly lazy-loaded; Canvas imported in 3 files                |
| `@tiptap/*` (12 packages) | ~150KB             | 2 files (notes editors)      | Loaded via NotesShell dynamic import (mitigated)                |
| `recharts`                | ~90KB              | 3 files (CEO charts)         | Not dynamically imported                                        |
| Dual icon libraries       | ~60KB combined     | 153 files total              | Two rendering engines, developer confusion                      |

#### What Is Done Well

1. **Analytics page** -- Gold standard Suspense architecture with 8 independent boundaries and async server components
2. **Wiki widget registry** -- Content-aware lazy loading; scans MDX, loads only needed widgets via `Promise.all`
3. **3D Lab CanvasWrapper** -- `frameloop="demand"` for zero-waste GPU rendering, DPR capped
4. **Quiz persistence** -- Offline-first with localStorage sync, server auto-save, reconnection queue
5. **Loading.tsx skeleton coverage** -- 494 Skeleton usages across 66 loading files

---

### 8. CODE QUALITY & TYPE SAFETY

#### Code Quality Scorecard

| Metric                            | Value                                                                    | Grade |
| --------------------------------- | ------------------------------------------------------------------------ | ----- |
| TypeScript Strict Mode            | OFF (`strict: false`, `noImplicitAny: false`, `strictNullChecks: false`) | F     |
| `any` type usage                  | 156 occurrences across 58 files                                          | D     |
| `@ts-ignore` / `@ts-expect-error` | 3 total (all documented)                                                 | A     |
| Test coverage                     | 12 test files / 964 source files (1.2%)                                  | F     |
| Test runner                       | Bun test (no CI integration)                                             | C     |
| ESLint config                     | Active with custom rules (hex-color lint, no-restricted-globals)         | B     |
| Error handling (actions)          | 12 catch blocks / 56 action files (21%)                                  | D     |
| `"use server"` directives         | 4 of 56 action files (7%)                                                | F     |
| Props interfaces                  | ~15 typed / ~350+ components (<5%)                                       | F     |
| TODO/FIXME count                  | 8 items                                                                  | B     |

#### TypeScript Strictness

All three safety nets are disabled in `tsconfig.json`:

- `strict: false`
- `noImplicitAny: false`
- `strictNullChecks: false`

This means null reference crashes happen at runtime, implicit `any` masks real bugs, and the type system is largely advisory. Enabling `strictNullChecks` alone would be the highest-ROI change for stability.

#### Test Coverage

12 test files exist using `bun:test`. No vitest, jest, playwright, or cypress is installed. No `test` script in `package.json`. No CI integration.

**What IS tested:** IRT algorithm (5 tests), SM-2 algorithm (6 tests), SRS update logic (15 tests), blindspot queue (12 tests), rate limiter, routes, 2 server actions, 1 component, NBCP calculator.

**What is NOT tested:** All UI components, all hooks, auth flows, admin features, wiki system, testing session logic, sidebar/navigation, notes, assessment, CEO dashboard, 3D lab (except NBCP), error boundaries, middleware, API routes, readiness score computation (330-line pure function with zero tests).

#### Error Handling Gaps

79% of server actions have no try/catch error handling. Unhandled Supabase errors propagate raw to the client. Some admin actions `throw new Error(error.message)` which leaks Supabase table names, column names, and SQL state codes.

---

### 9. Slatecamp design system COMPLIANCE

#### Design System Health Scorecard

| Dimension              | Score      | Finding                                                                    |
| ---------------------- | ---------- | -------------------------------------------------------------------------- |
| Color tokens           | CRITICAL   | 2,576 hardcoded hex colors; top 10 values account for 81%                  |
| Typography             | NEEDS_WORK | 1 violation of 11px min; 113 raw monospace labels bypass Eyebrow component |
| Shadows                | CLEAN      | 0 shadow-xl/2xl violations                                                 |
| Border radii           | CLEAN      | 2 minor rounded-xl instances (non-modal)                                   |
| Transitions            | CLEAN      | 1 duration-500 violation                                                   |
| Component consistency  | CRITICAL   | 465 ad-hoc card divs vs 37 using Card component (92% bypass)               |
| Icon consistency       | CRITICAL   | Lucide (189 files) + Phosphor (135 files) with no domain boundary          |
| Accessibility          | CRITICAL   | maximumScale:1 blocks pinch-zoom; button touch targets below 44px          |
| Voice guide            | NEEDS_WORK | "drill" in 28+ instances (component names, labels, IDs)                    |
| prefers-reduced-motion | NEEDS_WORK | 12 instances; many animated components lack support                        |

#### Hardcoded Hex Colors (2,576 total)

The design token system is defined in `globals.css` with proper CSS variables, but is massively bypassed in practice:

| Hex       | Count | Should Be                     |
| --------- | ----- | ----------------------------- |
| `#1B3FC4` | 406   | `text-primary` / `bg-primary` |
| `#D4DAE3` | 343   | `border-border`               |
| `#8896A7` | 315   | `text-muted-foreground`       |
| `#4A5568` | 223   | `text-text-secondary`         |
| `#1A2332` | 221   | `text-foreground`             |
| `#EEF2FC` | 141   | `bg-primary-50`               |
| `#D64545` | 113   | `text-destructive`            |
| `#D4951A` | 110   | `text-warning`                |
| `#1535A8` | 106   | `text-primary-700`            |
| `#2D9F6F` | 102   | `text-success`                |

Migrating just these 10 values would cover 2,080 of 2,576 instances (81%).

#### Dual Token Systems

`globals.css` defines BOTH shadcn semantic tokens (`--primary`, `--destructive`, `--success`, `--warning`) AND a parallel "Camp Standard" system (`--camp-cobalt`, `--camp-red`, `--camp-green`, `--camp-amber`) with **conflicting hex values** for red, green, and amber.

#### Accessibility Issues

1. **Zoom blocking:** `src/app/layout.tsx:51` sets `maximumScale: 1`, blocking pinch-to-zoom (WCAG 2.1 AA failure)
2. **Touch targets:** All button sizes except `xl` (48px) are below the 44px WCAG minimum. `icon-xs` is only 24px.
3. **Color contrast failures:** `#8896A7` (Ink Tertiary), `#2D9F6F` (Emerald), `#D4951A` (Amber), `#E8853A` (Camp Orange), `#D64545` (Warm Red) all fail AA contrast on white backgrounds
4. **Alt text:** Only 8 `alt=` attributes across the entire codebase

#### Voice Guide Violations

"drill" appears in 28+ instances including component filenames (`RecallDrill.tsx`, `DimensionDrill.tsx`, `SpatialQualityDrill.tsx`, `BodyDimensionDrill.tsx`), UI labels, mission IDs, and developer descriptions. Per the voice guide, "drill" should be replaced with "practice" or "review."

---

### 10. PEDAGOGICAL ENGINE ASSESSMENT

#### Pedagogical Correctness Scorecard

| Component              | Status               | Details                                                                   |
| ---------------------- | -------------------- | ------------------------------------------------------------------------- |
| IRT 2PL Model          | CORRECT              | `P(theta) = 1 / (1 + exp(-a * (theta - b)))` implemented exactly per spec |
| IRT Theta Update       | CORRECT but ORPHANED | Newton-Raphson single-step, never called in production                    |
| IRT Question Selection | CORRECT but ORPHANED | P(correct)=0.75 targeting, never called in production                     |
| SRS Scheduling (SM-2)  | CORRECT              | Standard SM-2, ease floor at 1.3, correct intervals                       |
| SRS Quality Derivation | CORRECT              | Maps correctness + time + confidence + lucky-guess to quality 0-5         |
| Camp Mode              | CORRECT              | Untimed, immediate feedback, rationale, citations                         |
| Storm Mode             | CORRECT              | Timed, deferred correctness, no rationale during session                  |
| Chill Mode             | CORRECT              | Relaxed, skip button, optional rationale peek                             |
| Focus Review           | CORRECT              | Targets weakest nodes by mastery weight                                   |
| Readiness Score        | CORRECT              | Anti-inflation 6-vector computation with PRC area weighting               |
| Auto-save              | CORRECT              | 10-second setInterval with localStorage + server sync                     |
| Session Recovery       | CORRECT              | Timer recovery, answer recovery, index persistence                        |

#### CRITICAL: SRS Disconnected from Primary Testing Flow

`saveTestingInteraction()` in `src/lib/actions/testing.ts` records interactions but **never calls** `updateSrsSchedule()` or `deriveQualityRating()`. SRS updates only occur in the older `src/lib/actions/quiz.ts` flow. Every session created through the new testing hub (Camp/Storm/Chill/Focus Review/Custom/Simulation/Endurance) will **never update SRS scheduling**. The spaced repetition system is effectively dead code for the primary user flow.

- **File with missing call:** `src/lib/actions/testing.ts:492-544`
- **File with correct pattern:** `src/lib/actions/quiz.ts:388-395`

#### CRITICAL: IRT Engine Orphaned

All three IRT functions (`probabilityCorrect`, `selectNextQuestion`, `updateTheta`) exist in `src/lib/srs/irt.ts` with passing tests but are **never called in any production code path**. Session creation uses DB-level mastery ordering (`current_mastery_weight ASC`) instead of IRT adaptive selection. User theta is never updated. The PRD mandates "All mastery calculations MUST use the Item Response Theory (IRT) 2-parameter logistic model" -- this mandate is unmet.

#### What Is Working Well

1. **Anti-inflation readiness score** -- 6-vector system (streak diminishing returns, difficulty ceiling, grey penalty, Bloom ceiling, depth weight, recency decay) prevents inflated mastery scores
2. **Mode differentiation** -- Each testing mode has genuinely distinct behavior, not just cosmetic differences
3. **Error resilience** -- SRS updates wrapped in try/catch, session state backed up to both server and localStorage
4. **PRC exam area weighting** -- Readiness score respects official area weights (A:30%, B:30%, C:40%)
5. **Blindspot queue generation** -- Well-tested (28 unit tests) targeting 3 weakest nodes + unexplored grey nodes

#### Missing Test Coverage on Core Algorithms

- `src/lib/readiness-score.ts` -- 330-line pure function marked "DO NOT MODIFY WITHOUT TESTING" has zero tests
- `src/lib/readiness/velocity.ts` -- Pure function, no tests
- `src/lib/readiness/churn.ts` -- Pure function, no tests

---

### 11. DEAD CODE & WASTE INVENTORY

#### Waste Summary

| Category                 | Count              | Estimated Lines | Cleanup Effort |
| ------------------------ | ------------------ | --------------- | -------------- |
| Orphan components        | 9                  | 1,292           | 0.5 hours      |
| Unused dependencies      | 8                  | N/A             | 0.5 hours      |
| Duplicate route trees    | 3                  | ~2,000+         | 1.5 hours      |
| Empty/stub files         | 13                 | ~30             | 0.5 hours      |
| Orphaned route constants | 10                 | ~50             | 0.5 hours      |
| Unused type definitions  | 53                 | ~400            | 1 hour         |
| Dead utility functions   | 78                 | ~1,500          | 2 hours        |
| Dev-only data in prod    | 6 files            | ~886            | 1 hour         |
| Stale documentation      | 159 files          | ~5,000+         | 1 hour         |
| Dual icon libraries      | 2 libs (192 files) | N/A             | 4-6 hours      |

**Total estimated cleanup: 12-14 hours**

#### Orphan Components (Zero Imports)

| File                                                      | Lines | Notes                                                   |
| --------------------------------------------------------- | ----- | ------------------------------------------------------- |
| `src/components/dashboard/TestingHub.tsx`                 | 301   | Superseded by `testing/hub/ReviewHub`                   |
| `src/components/marketing/FloatingTestimonialMarquee.tsx` | 288   | Unused marketing animation                              |
| `src/components/dashboard/QuizRenderer.test.tsx`          | 261   | Orphaned test file                                      |
| `src/components/dashboard/ModeIntroScreen.tsx`            | 178   | Large unused screen                                     |
| `src/components/shared/TransitionLink.tsx`                | 103   | Unused navigation component                             |
| `src/components/shared/TierBadge.tsx`                     | 77    | Unused pricing component                                |
| `src/components/dashboard/GradientImage.tsx`              | 44    | Dead visual component (also the ~200KB shader gradient) |
| `src/components/auth/SignOutButton.tsx`                   | 27    | Replaced by LogoutButton                                |
| `src/components/ceo/skeletons/TableSkeleton.tsx`          | 13    | Possibly WIP                                            |

#### Duplicate Route Trees

1. **`/dashboard/developer/*` (7 pages) vs `/developer/*` (20 pages)** -- Old tree should be deleted; `/developer/*` is canonical
2. **`/dashboard/trails/*` vs `/dashboard/camptrails/*`** -- `/trails/` is a redirect shim
3. **`/admin/wiki/*` vs `/admin/articles/*`** -- `/wiki/` is a redirect shim

#### Dead Utility Files (Entire Files Dead)

- `src/lib/demo/data.ts` -- 11 dead exports, entire file unused
- `src/lib/workflow/content-workflow.ts` -- 6 dead exports, workflow engine never integrated
- `src/lib/constants/ads.ts` -- Ad system never implemented
- `src/lib/admin/permissions.ts` -- Permission system unused
- `src/lib/wiki/wiki-actions.ts` -- Duplicate wiki actions
- `src/lib/wiki-markdown.ts` -- Markdown conversion unused

---

### 12. BUSINESS & STRATEGIC ASSESSMENT

#### CTO Memo

If I were joining SlateCamp as CTO tomorrow, here is what I would think:

The good news is substantial. This is not a prototype. In 18 days, a single developer built a learning platform with genuine pedagogical depth -- IRT-based mastery, anti-inflation readiness scoring, 7 testing modes with distinct behaviors, a wiki with interactive 3D widgets, and a comprehensive admin CMS. The tech stack choices are excellent (Next.js 16, React 19, Supabase, Tailwind 4). The architecture has several production-quality subsystems: the analytics page Suspense pattern, the wiki widget lazy-loading registry, and the 3D Lab demand rendering are all best-in-class.

The bad news is structural. TypeScript strict mode is off, meaning the type system is advisory. There are 12 test files but no test runner in CI, giving 1.2% coverage. The spaced repetition system -- the core learning loop -- is disconnected from the primary testing flow. Payment buttons do not work. Security headers are absent. And 2,576 hardcoded hex colors bypass the design token system that was carefully defined.

My first week: (1) wire SRS into the testing flow (2 hours, highest learning impact), (2) add security headers and sanitize the XSS in question-card.tsx (1 hour, highest security impact), (3) enable `strictNullChecks` (surfaces real bugs), (4) wire up payment buttons (revenue-blocking). My first month: build the query abstraction layer, fix the 22 waterfall pages, set up Vitest with CI, and start the hex-to-token migration.

The velocity is impressive but unsustainable at the current quality level. The codebase needs a 2-week hardening sprint before adding any new features.

#### Product-Market Fit Analysis

**Core Value Proposition Allocation:**

- ~55% of codebase supports the core learning engine (testing, wiki, analytics, mastery, SRS, readiness)
- ~25% supports content management (admin portal, CMS, taxonomy, pipeline)
- ~10% supports business operations (CEO dashboard, payments, auth)
- ~10% is developer tooling and marketing

The churn hotspots (Sidebar, dashboard layout, QuizRenderer) are all in the core product, which is appropriate -- the team is iterating on what matters most.

**Onboarding Flow:** Complete and well-designed. Try-before-signup pattern is strong. Time to "aha moment" (seeing your Readiness Score) is ~20-30 minutes. The funnel is: /try (5 free questions) -> /register -> /onboarding (4 fields) -> /assessment (20 questions) -> /score-reveal. The 20-question diagnostic may cause drop-off; consider allowing skip with default score.

**Competitive Position:** SlateCamp's differentiation is the pedagogical depth (IRT, anti-inflation scoring, 7 modes) combined with the visual content library (3D widgets, interactive illustrations). Most exam prep competitors offer simpler question bank + flashcard combinations. The 95% score on Progress Analytics and Content Library significantly exceeds market norms. The 0% on Collaborative Features and Offline Mode are notable gaps but not launch-blockers for the Philippine market.

#### Technical Risks to the Business

**What would concern an investor most:**

1. **Single developer, no tests** -- Bus factor of 1 with zero regression safety net. Every deploy is a prayer.
2. **SRS disconnected** -- The core learning loop (spaced repetition) is broken for all new testing sessions. Users are practicing but their review schedules are not updating. This silently degrades learning outcomes.
3. **Payment non-functional** -- Cannot generate revenue. LemonSqueezy/PayRex infrastructure exists but the upgrade page buttons have no onClick handlers.
4. **TypeScript strict off** -- Any senior engineer joining the team will immediately flag this. It signals "move fast, break things" culture.

**Engineering-weeks to remediate critical findings:**

- Security fixes (headers, XSS, debug route, auth checks): 0.5 weeks
- SRS reconnection + IRT integration: 0.5 weeks
- Payment button wiring: 0.25 weeks
- Query layer abstraction + waterfall fixes: 1.5 weeks
- TypeScript strictNullChecks enablement: 1 week
- Test infrastructure setup + priority tests: 2 weeks
- **Total for critical/high items: ~6 weeks (solo dev)**

**Scalability Assessment:**
The architecture can handle 10x users with targeted fixes. Supabase + Vercel auto-scales. The main bottlenecks are the 22 waterfall pages (each sequential await adds latency per user), the 47 `select('*')` queries (fetching full rows increases egress costs at scale), and the in-memory rate limiter (non-functional in serverless -- needs Vercel KV or Upstash Redis).

#### Monetization Readiness

**Score: 45/100**

| Requirement                  | Status                                                          |
| ---------------------------- | --------------------------------------------------------------- |
| Payment provider integration | LemonSqueezy + PayRex configured, webhook handlers working            |
| Checkout flow                | Route exists, requires auth, blocks free tier                   |
| Upgrade page                 | Built with feature comparison and pricing                       |
| Payment buttons              | NON-FUNCTIONAL -- no onClick handlers                           |
| Billing management           | Route defined (`/settings/billing`) but no page exists          |
| Subscription tracking        | `user_subscriptions` table with RLS, tier from webhook metadata |
| Paywall enforcement          | Implemented (3D Lab tier gating, locked score widget)           |
| Free/trial experience        | Try page (5 questions), assessment, limited dashboard           |

**Gap to charging:** Wire up 2 payment buttons (~2 hours), build billing settings page (~4 hours), test end-to-end checkout flow (~2 hours). The infrastructure is 90% there; the last-mile UI is missing.

#### Velocity & Shipping Health

273 commits in 18 days from a solo developer is extraordinary velocity -- approximately 1,700 lines of production code per day. The commit messages are well-structured (conventional commits with scopes), and features are shipped end-to-end rather than left as stubs.

However, this pace has costs:

- 79% of server actions have no error handling
- 93% of action files are missing `"use server"` directives
- 1.2% test coverage
- 2,576 hardcoded hex colors (tokens defined but bypassed)
- 156 explicit `any` types

This is the profile of a builder in "sprint to MVP" mode. The codebase is at the inflection point where continued feature velocity without hardening will produce compounding fragility. The About and Contact pages are "Coming Soon" stubs, but the testing engine has 7 modes -- priorities are correctly aimed at core value, not polish.

---

### 13. THE REMEDIATION ROADMAP

#### TIER 1 -- Fix This Week (Critical / Security / Revenue-Blocking)

- [ ] **Add security headers to `next.config.ts`** -- Add `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Strict-Transport-Security`, `Referrer-Policy`, `Permissions-Policy` via the `headers()` function. File: `next.config.ts`. Effort: 15 minutes.

- [ ] **Sanitize HTML in question-card.tsx** -- Add `DOMPurify.sanitize()` around all 3 `dangerouslySetInnerHTML` usages at lines 233, 243, 409. Reference implementation exists in `src/components/wiki/ElaborativeInterrogation.tsx`. File: `src/components/shared/question-card.tsx`. Effort: 15 minutes.

- [ ] **Delete or auth-gate the debug-taxonomy route** -- Either delete `src/app/api/debug-taxonomy/route.ts` entirely or add `getUser()` + admin role check. Effort: 5 minutes.

- [ ] **Wire SRS into the testing flow** -- Add `deriveQualityRating()` + `updateSrsSchedule()` call to `saveTestingInteraction()` in `src/lib/actions/testing.ts` after the upsert, matching the pattern in `src/lib/actions/quiz.ts:388-395`. Effort: 1 hour.

- [ ] **Wire up payment buttons** -- Add onClick handlers to GCash and Card buttons on `/dashboard/upgrade` that call the existing checkout route at `src/app/api/payments/checkout/route.ts`. Effort: 2 hours.

- [ ] **Add auth checks to admin read functions** -- Add `canReviewContent()` check to `getAdminStats()`, `getAdminDashboardData()`, `getContentBySubject()`, `fetchCoverageData()`, `getArticlesWithCoverage()` in `src/lib/actions/admin/dashboard.ts`, `coverage.ts`, `wiki-queries.ts`. Effort: 30 minutes.

- [ ] **Remove `maximumScale: 1`** from viewport metadata in `src/app/layout.tsx:51` -- WCAG 2.1 AA failure blocking pinch-to-zoom. Effort: 1 minute.

- [ ] **Add auth check to social-proof.ts** -- Add `getUser()` at the top of `getQuestionSocialProof()`, `getTopicDailyStudiers()`, `getTopicDailyStudiersBatch()` in `src/lib/actions/social-proof.ts`. Effort: 15 minutes.

#### TIER 2 -- Fix This Month (Architecture / Performance / Quality)

- [ ] **Build query abstraction layer** -- Create domain-scoped modules in `src/lib/queries/` (testing, dashboard, assessment, wiki, trails, analytics). Move all inline Supabase queries from page.tsx files. Files: 40+ pages, create ~8 query modules. Effort: 8-12 hours.

- [ ] **Fix waterfall data fetching** -- Wrap independent queries in `Promise.all()` across all 22 waterfall pages, starting with testing hub (8 awaits), onboarding (10 awaits), and debrief (7 awaits). Effort: 3 hours.

- [ ] **Enable `strictNullChecks` in tsconfig.json** -- Biggest type-safety gain. Will surface real bugs. Use `// @ts-expect-error` to unblock files that need migration time. File: `tsconfig.json`. Effort: 8-16 hours (depending on error count).

- [ ] **Wire IRT adaptive question selection** -- Call `selectNextQuestion()` from `src/lib/srs/irt.ts` during session creation in `src/lib/actions/testing.ts` to target P(correct)=0.75 instead of simple mastery weight ordering. Effort: 2 hours.

- [ ] **Replace select('\*') with explicit columns** -- Fix all 47 `select('*')` calls. Worst files: `src/lib/actions/wiki-actions.ts` (10), `src/lib/actions/trails.ts` (6), `src/lib/queries/trails.ts` (5). Effort: 4-6 hours.

- [ ] **Add `"use server"` to all action files** -- 52 files in `src/lib/actions/` missing the directive. Effort: 15 minutes (scriptable).

- [ ] **Resolve dual token system** -- Deprecate Camp Standard tokens (`--camp-red`, `--camp-green`, `--camp-amber`) or shadcn semantic tokens and unify to one set in `globals.css`. Effort: 2 hours.

- [ ] **Set up Vitest + CI pipeline** -- Install vitest, configure for Next.js, add `test` script to package.json, write priority tests for readiness score, server actions, and auth flow. Effort: 4 hours setup + ongoing.

- [ ] **Add error handling to server actions** -- Wrap all 44 unhandled action files with try/catch + structured error returns. Template-able. Effort: 4-6 hours.

- [ ] **Apply Zod validation to server actions** -- Import and use the 13 existing Zod schemas in `src/lib/validations/index.ts` at server action entry points. Create schemas for actions without them. Effort: 4-6 hours.

- [ ] **Replace `@shadergradient/react`** -- Component `src/components/dashboard/GradientImage.tsx` loads ~200KB for a decorative gradient. Replace with CSS gradient. Effort: 30 minutes.

- [ ] **Replace in-memory rate limiter** -- `src/lib/rate-limit.ts` is non-functional in serverless. Replace with Vercel KV or Upstash Redis. Effort: 2 hours.

- [ ] **Build `/dashboard/settings/billing` page** -- Route defined but no page exists. Users need subscription management. Effort: 4 hours.

- [ ] **Deprecate legacy readiness score** -- Remove or gate `src/lib/actions/readiness.ts` (simple formula with hardcoded `srsHealth: 50`). All consumers should read from `user_global_stats.global_readiness_score`. Effort: 1 hour.

#### TIER 3 -- Fix This Quarter (Polish / Scale / Market Parity)

- [ ] **Consolidate icon libraries** -- Pick Phosphor (135 files, primary) and migrate Lucide usages (57 files). Saves ~70KB+ and eliminates developer confusion. Effort: 4-6 hours.

- [ ] **Migrate hardcoded hex to design tokens** -- Start with top 10 values (covers 81% of 2,576 instances). Use ESLint hex-color rule to prevent regressions. Effort: 8-12 hours.

- [ ] **Delete dead code** -- Orphan components (9 files), unused deps (8 packages), dead utilities (78 exports), duplicate route trees (3 pairs), stub files (13). Effort: 12-14 hours total (see Wave 1-4 in Phase 9).

- [ ] **Migrate ad-hoc cards to Card component** -- 465 ad-hoc card divs should use the shared Card component. Effort: 8-12 hours.

- [ ] **Remove unnecessary 'use client' directives** -- ~60-70 files have `'use client'` with no client-side justification. Effort: 4-6 hours.

- [ ] **Fix color contrast failures** -- Darken Ink Tertiary (`#8896A7`), Emerald, Amber, Camp Orange for WCAG AA compliance on white. Effort: 2 hours.

- [ ] **Add mobile touch target overrides** -- Use `@media (pointer: coarse)` to ensure 44px minimum on touch devices. File: `src/components/ui/button.tsx`. Effort: 1 hour.

- [ ] **Expand responsive breakpoint coverage** -- Dashboard pages average only 3.5 breakpoints per page. Zero `2xl:` usage. Effort: 8-12 hours.

- [ ] **Add unit tests for readiness score** -- `src/lib/readiness-score.ts` is 330 lines, pure function, marked "DO NOT MODIFY WITHOUT TESTING" but has zero tests. Effort: 4 hours.

- [ ] **Make AI Tutor citations clickable** -- Convert `<span>` to `<a>` in `src/components/quiz/AITutorDrawer.tsx:169-171` linking to `ROUTES.WIKI_PAGE(context.topic_id)`. Effort: 30 minutes.

- [ ] **Rename "drill" to "practice/review"** -- 28+ instances in component names, labels, IDs. Includes renaming 4 component files. Effort: 2 hours.

- [ ] **Remove GeistSans font** -- Loaded globally for 1 component (`HeroHeadline.tsx`). Remove from `src/app/layout.tsx` and replace usage. Effort: 15 minutes.

- [ ] **Add PWA manifest** -- No service worker or offline support. Required for mobile parity. Effort: 4-8 hours.

- [ ] **Complete About and Contact pages** -- Currently "Coming Soon" stubs. Damages credibility. Effort: 2-4 hours.

- [ ] **Add `profiles.role` column to DATABASE_SCHEMA.sql** -- CEO auth depends on it but it is undocumented. Also add `user_roles` and `audit_logs` tables. Effort: 30 minutes.

---

### 14. FEATURE IMPLEMENTATION BACKLOG

Priority-ordered features needed for market competitiveness and monetization.

| Priority | Feature                                     | Effort    | Rationale                                |
| -------- | ------------------------------------------- | --------- | ---------------------------------------- |
| P0       | Wire payment buttons (upgrade page)         | 2 hours   | Revenue-blocking. Infrastructure exists. |
| P0       | Billing settings page                       | 4 hours   | Users cannot manage subscriptions        |
| P1       | Profile editing (name, avatar)              | 4 hours   | Basic user expectation                   |
| P1       | Notification preferences UI                 | 4 hours   | Backend exists (`email-preferences.ts`)  |
| P1       | Complete About page                         | 2 hours   | Credibility for paying customers         |
| P1       | Complete Contact page                       | 2 hours   | Support channel for paying customers     |
| P2       | PWA / Offline mode                          | 2-3 weeks | 0% score, mobile market expects it       |
| P2       | Full-text wiki search                       | 1 week    | No dedicated search page in dashboard    |
| P2       | Question bank search/filter in student view | 1 week    | Market expectation                       |
| P3       | Study scheduling / calendar                 | 2 weeks   | Beyond Camp Trails daily prescriptions   |
| P3       | Collaborative study groups                  | 3-4 weeks | 0% score, potential differentiator       |
| P3       | Practice exam result comparison             | 1 week    | Users want to compare attempts           |
| P3       | Export analytics data                       | 3 days    | Users want to share progress             |
| P4       | Content marketplace                         | 4-6 weeks | Routes defined but no implementation     |
| P4       | Gamification-free achievement system        | 2 weeks   | Must pass 3-part engagement test         |

---

### 15. APPENDIX

#### A. Full Orphan File List

| File                                                      | Lines |
| --------------------------------------------------------- | ----- |
| `src/components/auth/SignOutButton.tsx`                   | 27    |
| `src/components/ceo/skeletons/TableSkeleton.tsx`          | 13    |
| `src/components/dashboard/GradientImage.tsx`              | 44    |
| `src/components/dashboard/ModeIntroScreen.tsx`            | 178   |
| `src/components/dashboard/QuizRenderer.test.tsx`          | 261   |
| `src/components/dashboard/TestingHub.tsx`                 | 301   |
| `src/components/marketing/FloatingTestimonialMarquee.tsx` | 288   |
| `src/components/shared/TierBadge.tsx`                     | 77    |
| `src/components/shared/TransitionLink.tsx`                | 103   |

#### B. Full Unused Dependency List

| Package             | Verdict                                  |
| ------------------- | ---------------------------------------- |
| `camera-controls`   | Remove -- zero imports                   |
| `katex`             | Remove -- zero imports                   |
| `next-devtools-mcp` | Remove -- zero imports                   |
| `pdf-parse`         | Remove -- zero imports                   |
| `react-markdown`    | Remove -- zero imports (custom MDX used) |
| `rehype-katex`      | Remove -- zero imports                   |
| `remark-math`       | Remove -- zero imports                   |
| `shadcn-ui`         | Remove -- duplicate of `shadcn` v4.1.0   |
| `three-stdlib`      | Remove -- zero imports                   |

#### C. Full Hardcoded Hex Color Hotspot List

| Category                                      | Count              |
| --------------------------------------------- | ------------------ |
| `bg-[#...]`                                   | 834 instances      |
| `text-[#...]`                                 | 1,235 instances    |
| `border-[#...]`                               | 507 instances      |
| Inline styles (fill, stroke, backgroundColor) | ~3,043 occurrences |
| **Total Tailwind class hex**                  | **2,576**          |

**Worst directories:** `src/components/wiki/`, `src/components/testing/`, `src/components/dashboard/`, `src/components/admin/`, `src/app/(protected)/ceo/`

#### D. Full TODO/FIXME Inventory

| #   | File                                                | Line | Comment                                          |
| --- | --------------------------------------------------- | ---- | ------------------------------------------------ |
| 1   | `src/lib/lab-analytics.ts`                          | 39   | `TODO: Replace with actual analytics endpoint`   |
| 2   | `src/lib/srs/update.ts`                             | 73   | `TODO Phase 5: Add Sentry.captureException(err)` |
| 3   | `src/components/landing/LandingPageContent.tsx`     | 60   | `TODO: evaluate SectionHeader migration`         |
| 4   | `src/components/marketing/AnalyticsSection.tsx`     | 146  | `TODO: evaluate SectionHeader migration`         |
| 5   | `src/components/marketing/FeatureSectionLayout.tsx` | 69   | `TODO: evaluate SectionHeader migration`         |
| 6   | `src/components/dashboard/ResultsSummary.tsx`       | 161  | `TODO: extract CalibrationSection`               |
| 7   | `src/components/dashboard/ResultsSummary.tsx`       | 245  | `TODO: extract ErrorPatternSection`              |
| 8   | `src/components/dashboard/QuizRenderer.tsx`         | 598  | `TODO: extract NoQuestionsLoaded fallback`       |

#### E. Full Waterfall Page List

| Page                                                                | Sequential Awaits |
| ------------------------------------------------------------------- | ----------------- |
| `src/app/(auth)/onboarding/page.tsx`                                | 10                |
| `src/app/dashboard/testing/page.tsx`                                | 8                 |
| `src/app/dashboard/testing/session/[sessionId]/debrief/page.tsx`    | 7                 |
| `src/app/dashboard/testing/session/[sessionId]/page.tsx`            | 6                 |
| `src/app/dashboard/testing/simulation/[sessionId]/results/page.tsx` | 6                 |
| `src/app/dashboard/score-reveal/page.tsx`                           | 6                 |
| `src/app/dashboard/welcome-pro/page.tsx`                            | 5                 |
| `src/app/dashboard/assessment/page.tsx`                             | 4                 |
| `src/app/(protected)/ceo/financials/page.tsx`                       | 4                 |
| `src/app/dashboard/layout.tsx`                                      | 4                 |
| 12 additional pages                                                 | 3 each            |

#### F. Phase Report File Locations

| Phase                   | File                                                                |
| ----------------------- | ------------------------------------------------------------------- |
| Phase 1: Infrastructure | `D:/SlateCamp/slate-camp/.omc/plans/audit-phase1-infrastructure.md` |
| Phase 2: Features       | `D:/SlateCamp/slate-camp/.omc/plans/audit-phase2-features.md`       |
| Phase 3: Architecture   | `D:/SlateCamp/slate-camp/.omc/plans/audit-phase3-architecture.md`   |
| Phase 4: Security       | `D:/SlateCamp/slate-camp/.omc/plans/audit-phase4-security.md`       |
| Phase 5: Performance    | `D:/SlateCamp/slate-camp/.omc/plans/audit-phase5-performance.md`    |
| Phase 6: Quality        | `D:/SlateCamp/slate-camp/.omc/plans/audit-phase6-quality.md`        |
| Phase 7: Design System  | `D:/SlateCamp/slate-camp/.omc/plans/audit-phase7-design.md`         |
| Phase 8: Pedagogy       | `D:/SlateCamp/slate-camp/.omc/plans/audit-phase8-pedagogy.md`       |
| Phase 9: Dead Code      | `D:/SlateCamp/slate-camp/.omc/plans/audit-phase9-deadcode.md`       |

---

_Report generated 2026-03-25 by Claude Opus 4.6 (1M context). All findings are evidence-based from static code analysis. File paths are absolute to `D:/SlateCamp/slate-camp/`. Every finding references a specific file, line number, or data point from the 9 phase audit reports._

