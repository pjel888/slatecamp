# Phase 1: Infrastructure Audit -- SlateCamp Codebase

**Date:** 2026-03-25
**Auditor:** Claude Opus 4.6 (automated)
**Scope:** Hard infrastructure data -- numbers, file paths, concrete evidence. Code is source of truth.

---

## 1. Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.1.6 |
| React | React + React DOM | 19.2.4 |
| Language | TypeScript | 5.9.3 |
| Styling | Tailwind CSS 4 (CSS-first config) | 4.2.2 |
| UI Primitives | shadcn/ui + @base-ui/react | shadcn 4.1.0, shadcn-ui 0.9.5 |
| State Management | Zustand | 5.0.12 |
| Database | Supabase (PostgreSQL) | @supabase/supabase-js 2.100.0 |
| Auth | Supabase SSR | @supabase/ssr 0.9.0 |
| 3D/Spatial | React Three Fiber + Three.js | R3F 9.5.0, Three 0.183.2 |
| Animation | Framer Motion | 12.38.0 |
| Rich Text Editor | TipTap | 3.20.4 (13 extension packages) |
| Charts | Recharts | 3.8.0 |
| AI | Anthropic SDK | 0.78.0 |
| Payments | LemonSqueezy + PayRex | LemonSqueezy 20.4.1, PayRex 1.7.3 |
| Package Manager | Bun | bun.lock present |
| Deployment | Vercel | vercel.json with 2 crons |
| Bundler | Turbopack (default dev) | Built into Next.js 16 |
| Linting | ESLint 9 | eslint-config-next 16.1.6 |
| Icons | Lucide React + Phosphor Icons | lucide 0.577.0, phosphor 2.1.10 |

### TypeScript Configuration

- `strict: false` -- strictness is OFF
- `noImplicitAny: false`
- `strictNullChecks: false`
- Path alias: `@/*` maps to `./src/*`
- Target: ES2017

### Next.js Configuration

- Server Actions body size limit: 4MB
- Turbopack enabled with `root: __dirname`
- Remote image patterns: `*.supabase.co`, `lh3.googleusercontent.com`
- `serverExternalPackages`: `payrex-node`
- No custom webpack config
- Middleware at project root (`middleware.ts`)

### ESLint Configuration

- Extends: `eslint-config-next/core-web-vitals` + `/typescript`
- Custom rules: no browser dialogs (`alert`/`confirm`/`prompt`), warn on hardcoded hex in Tailwind classes, warn on unused `@next/next/no-img-element`

---

## 2. Dependency Health

### Counts

| Category | Count |
|----------|-------|
| Production dependencies | 56 |
| Dev dependencies | 8 |
| Total | 64 |

### Flagged Issues

| Issue | Details | Severity |
|-------|---------|----------|
| Duplicate icon libraries | Both `lucide-react` (0.577.0) AND `@phosphor-icons/react` (2.1.10) | Medium -- bundle bloat, inconsistent icon style |
| Duplicate DOMPurify | Both `dompurify` (3.3.3) AND `isomorphic-dompurify` (3.6.0) | Medium -- `isomorphic-dompurify` wraps `dompurify`, pick one |
| Duplicate shadcn packages | Both `shadcn` (4.1.0) AND `shadcn-ui` (0.9.5) | Low -- `shadcn-ui` is the old package name, likely vestigial |
| @types in prod deps | `@types/dompurify` and `@types/papaparse` in `dependencies` instead of `devDependencies` | Low -- doesn't affect runtime but pollutes prod dep tree |
| TipTap extension sprawl | 13 separate TipTap packages | Low -- working as designed, but large surface |

### Heavy Dependencies Check

| Package | Status |
|---------|--------|
| moment | NOT present (good) |
| lodash (full) | NOT present (good) |
| axios | NOT present (good) |
| jquery | NOT present (good) |

### Notable Dependencies

- `geist` font package present but CLAUDE.md specifies Inter via `next/font/google` -- potential dead dep
- `next-devtools-mcp` in prod deps -- should be devDependencies or removed in production
- `supabase` CLI (2.83.0) in prod deps -- typically a dev tool
- `rough-notation` -- niche animation library, check if actively used

---

## 3. Git Velocity

### Timeline

- **Repository age:** 18 days (first commit: 2026-03-07)
- **Total commits (all time):** 273
- **All 273 commits fall within the last 3 months** (repo is less than 3 months old)

### Weekly Distribution

| Week | Commits | Notes |
|------|---------|-------|
| W10 (Mar 2-8) | 8 | Project inception |
| W11 (Mar 9-15) | 63 | Heavy buildout |
| W12 (Mar 16-22) | 153 | Peak velocity -- massive feature sprint |
| W13 (Mar 23-25) | 49 | Current week (3 days in) |

### Trend

**Sharply accelerating.** W12 was 2.4x W11, and W13 is on pace to match W12 (49 commits in 3 days = ~16.3/day vs W12's ~21.9/day).

### Authors

| Author | Identity |
|--------|----------|
| philipjonlewis | Primary |
| pjel888 | Same person (secondary email) |

**Single developer project.** No external contributors.

### Shipping Pattern (last 40 commits)

Conventional commit style with scoped prefixes:
- `feat()` -- new features (dominant)
- `fix()` -- bug fixes
- `refactor()` -- structural changes
- `chore()` -- maintenance
- `revert()` -- rollbacks

Recent focus areas: portal unification, design system, developer tools, testing audit, admin overhaul, sidebar v2.

---

## 4. Churn Hotspots

### Top 15 Most-Changed Files (last 3 months = all time)

| Rank | File | Changes | Risk Assessment |
|------|------|---------|----------------|
| 1 | `src/components/shared/Sidebar.tsx` | 34 | HIGH -- core navigation, high churn = unstable API |
| 2 | `src/app/globals.css` (928 lines) | 32 | MEDIUM -- design token changes expected during rebrand |
| 3 | `src/app/dashboard/page.tsx` | 29 | HIGH -- main dashboard entry, frequent restructuring |
| 4 | `src/app/dashboard/layout.tsx` | 27 | HIGH -- layout architecture still settling |
| 5 | `src/components/marketing/HeroSection.tsx` | 22 | LOW -- marketing iteration, not core product |
| 6 | `src/components/dashboard/QuizRenderer.tsx` | 22 | HIGH -- core product component, high churn = fragile |
| 7 | `src/components/wiki/WikiSidebar.tsx` | 20 | MEDIUM -- wiki navigation |
| 8 | `src/app/page.tsx` | 20 | LOW -- landing page, expected churn |
| 9 | `src/types/app.ts` (885 lines) | 18 | HIGH -- type definitions changing = API instability |
| 10 | `src/components/wiki/WikiArticle.tsx` | 18 | MEDIUM -- core content display |
| 11 | `src/components/marketing/MarketingNav.tsx` | 18 | LOW -- marketing |
| 12 | `src/app/(auth)/onboarding/page.tsx` | 18 | MEDIUM -- auth flow |
| 13 | `src/app/dashboard/wiki/[slug]/page.tsx` | 17 | MEDIUM -- wiki route |
| 14 | `src/components/notes/NotesShell.tsx` | 15 | MEDIUM -- notes feature |
| 15 | `src/components/layouts/SharedPageLayout.tsx` | 15 | HIGH -- shared layout, high churn = pattern not settled |

### Risk Summary

- 5 of top 15 are core product files with HIGH churn risk (Sidebar, Dashboard page/layout, QuizRenderer, types/app.ts)
- Layout/navigation architecture is still in flux (Sidebar: 34 changes, dashboard layout: 27, SharedPageLayout: 15)
- Marketing files have high churn but low risk (expected iteration)

---

## 5. Codebase Scale

### File Counts

| Type | Count |
|------|-------|
| `.ts` files (non-declaration) | 407 |
| `.tsx` files | 692 |
| `.css` files | 3 |
| Test files (`.test.*`, `.spec.*`) | 12 |
| **Total files in src/** | **1,152** |

### Lines of Code

| Metric | Value |
|--------|-------|
| Total TS/TSX lines | ~31,500 |
| Largest file | `src/types/supabase.ts` (2,611 lines -- generated types) |
| 2nd largest | `src/app/dashboard/developer/design-system/page.tsx` (2,282 lines) |
| 3rd largest | `src/app/dashboard/developer/design-system/_components/DesignSystemPageClient.tsx` (2,122 lines) |

### Component Architecture

| Metric | Count |
|--------|-------|
| `'use client'` files | 387 |
| `'use server'` files | 59 |
| Server Components (no directive) | ~253 (inferred) |
| UI primitives (`src/components/ui/`) | 42 components |
| Custom hooks (`src/hooks/`) | 12 |
| Zustand stores | 2 (`dev-store.ts`, `useLabStore.ts`) |
| Route handlers (`src/app/api/**/route.ts`) | 11 |
| Server action files (`src/lib/actions/`) | 59 |

### Test Coverage

| Metric | Value |
|--------|-------|
| Test files | 12 |
| Test framework | None detected in devDependencies (no jest, vitest, playwright, cypress) |
| Test ratio | 12 tests / 1,152 files = **1.04%** |
| Coverage tool | None configured |

**Critical finding:** No test runner is installed. The 12 test files exist but there is no `test` script in package.json and no test framework in devDependencies. These tests are likely non-functional.

### Directory Structure (depth 3)

```
src/
  app/                    -- Next.js App Router pages
    (auth)/               -- Auth route group (login, register, onboarding, forgot-password)
    (protected)/ceo/      -- CEO dashboard (protected route group)
    admin/                -- Admin console (12 sub-routes)
    api/                  -- Route handlers (admin, ai, cron, payments, webhooks)
    dashboard/            -- Main user dashboard (12 sub-routes)
    developer/            -- Developer portal (6 sub-routes)
    about/, contact/, pricing/, tools/, try/  -- Marketing/public pages
  components/
    3d/, 3d-lab/          -- Three.js components
    admin/                -- Admin UI (unified-editor, settings, preview)
    analytics/            -- Analytics visualizations
    assessment/           -- Assessment quiz flow
    auth/                 -- Auth components
    ceo/                  -- CEO dashboard components
    dashboard/            -- Dashboard widgets (heatmap, results)
    dev/                  -- Developer tools
    developer/            -- Developer portal components
    graphics/             -- Icons, visual tokens
    interactive-illustrations/  -- 2D educational widgets
    landing/, marketing/  -- Marketing components
    layouts/              -- Shared page layouts
    motion/               -- Animation components
    notes/                -- Notes editor
    portal/               -- Portal sidebar/layout
    quiz/                 -- Quiz UI (AI tutor, question stem)
    settings/             -- User settings
    shared/               -- Shared components (data-table, stat-card, etc.)
    sidebar/              -- Sidebar navigation
    testing/              -- Testing mode components (debrief, hub, session, setup)
    tools/                -- Calculator tools
    trails/               -- Camp trails
    ui/                   -- UI primitive library (42 components)
    wiki/                 -- Wiki article components + widgets
  config/                 -- App configuration
  data/seed/              -- Seed data
  hooks/                  -- Custom hooks (notes, quiz)
  lib/                    -- Business logic
    actions/              -- Server actions (admin, ceo, dev)
    ai/, audio/, audit/   -- Domain modules
    blindspot/, endurance/, proof-simulation/  -- Testing algorithms
    constants/, context/, demo/  -- Shared utilities
    import/, mocks/       -- Data import and mocks
    notes/, outcomes/, payments/  -- Feature modules
    payrex/, paywall/, lemonsqueezy/   -- Payment providers
    queries/              -- Database queries
    readiness/, signals/, srs/   -- Learning science (IRT, SRS)
    supabase/             -- Supabase client/server/middleware
    utils/, validations/, wiki/, workflow/  -- Utilities
  stores/                 -- Zustand stores (2 files)
  types/                  -- TypeScript type definitions
```

---

## 6. Environment Variable Surface

### Total Variables Referenced

| Category | Count | Variables |
|----------|-------|-----------|
| `NEXT_PUBLIC_*` (client-exposed) | 6 | `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `APP_URL`, `DEMO_MODE`, `ENABLE_DEMO_MODE`, `LEMONSQUEEZY_PUBLISHABLE_KEY` |
| Server-only secrets | 11 | `SUPABASE_SERVICE_ROLE_KEY`, `LEMONSQUEEZY_API_KEY`, `LEMONSQUEEZY_WEBHOOK_SECRET`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `PAYREX_SECRET_KEY`, `PAYREX_WEBHOOK_SECRET`, `CRON_SECRET`, `ADMIN_EMAILS`, `AI_PROVIDER`, `PAYMENT_PROVIDER` |
| Standard | 1 | `NODE_ENV` |
| Config flags | 1 | `ALLOW_DEV_PORTAL_BYPASS` |
| **Total unique** | **19** | |

### Secret Separation

- `.env.example` exists (good)
- `.env.local` exists (not committed -- good, in .gitignore)
- No sensitive keys in `NEXT_PUBLIC_*` variables (Supabase anon key is designed to be public)
- LemonSqueezy publishable key correctly uses `NEXT_PUBLIC_` prefix

### Files Referencing process.env

29 files total. Concentrated in:
- `src/lib/supabase/` (4 files) -- expected
- `src/app/api/` (5 files) -- expected for route handlers
- `src/lib/lemonsqueezy/`, `src/lib/payrex/` -- payment config
- `src/lib/ai/` -- AI provider config

### Client Exposure Risk

**LOW.** Only `NEXT_PUBLIC_SUPABASE_ANON_KEY` appears in a `'use client'` file (`LogoutButton.tsx`), and Supabase anon keys are designed for client use. LemonSqueezy publishable key is also safe for client exposure by design.

---

## 7. Documentation

### Inventory

| Document | Status | Notes |
|----------|--------|-------|
| `README.md` | Exists (42 lines) | Outdated -- references "zinc-first neutral palette" and "Dieter Rams" aesthetic, but codebase has moved to Slatecamp design system |
| `CLAUDE.md` | Exists | User says outdated but it defines Campfire design tokens and voice guide. Mostly aligned with code. |
| `.claude/docs/` | 12 files | Full PRD library (Discovery through Marketing, 10 numbered phases + Platform Overview) |
| `.claude/agents/` | 17 agent files | Specialized agent personas (db-architect, quiz-engineer, security-auditor, etc.) |
| `.claude/skills/` | 5+ skill files | Coding constraints (enforce-server-components, clean-code, etc.) |
| `.planning/` | Exists | Contains PROJECT.md, REQUIREMENTS.md, ROADMAP.md, STATE.md, phases/, research/ -- user says outdated |
| `CONTRIBUTING.md` | **Missing** | No contributor guidelines |
| `CHANGELOG.md` | **Missing** | No changelog (git log is the only history) |
| `LICENSE` | **Missing** | No license file |
| `vercel.json` | Exists | 2 cron jobs defined |
| `DATABASE_SCHEMA.sql` | Exists (1,947 lines) | Full schema reference |

### Staleness Flags

- README.md references Dieter Rams aesthetic, codebase uses Campfire
- .planning/ directory acknowledged outdated by user
- CLAUDE.md design tokens appear to match current `globals.css` usage

---

## 8. Database

### Schema

| Metric | Value |
|--------|-------|
| Schema file | `DATABASE_SCHEMA.sql` |
| Schema size | 1,947 lines (104 KB) |
| Tables defined | 51 |
| Last modified | 2026-03-21 |

### Migrations

| Metric | Value |
|--------|-------|
| Migration files | 38 |
| Naming convention | Mixed -- early ones use sequential numbers (004-039), recent ones use date prefix (20250315, 20260320-20260325) |
| Latest migration | `20260325_ceo_dashboard.sql` (today) |
| Earliest migration | `004_add_user_roles.sql` (no 001-003, likely pre-existing) |

### Notable Migration Gaps

- Numbers 001-003 missing (likely part of initial setup not tracked)
- Jump from 039 to 20250315 (naming convention change)
- 7 migrations created on 2026-03-21 alone (heavy schema day)
- 6 migrations created on 2026-03-24/25 (active schema evolution)

---

## 9. Bun Configuration

| Item | Status |
|------|--------|
| Lock file | `bun.lock` (text format) present |
| `bun.lockb` (binary) | Not present |
| Scripts using bun | `db:seed` uses `bun scripts/seed.ts` |
| Dev script | Custom `node scripts/dev.js` (not direct bun) |
| Build/start | Standard `next build` / `next start` |

---

## 10. Cron Jobs (Vercel)

| Cron | Schedule | Path |
|------|----------|------|
| Blindspot scan | Daily at 16:00 UTC | `/api/cron/blindspot-scan` |
| Compute signals | Daily at 16:30 UTC | `/api/cron/compute-signals` |

---

## 11. Largest Files (potential refactoring candidates)

| File | Lines | Notes |
|------|-------|-------|
| `src/types/supabase.ts` | 2,611 | Generated types -- expected |
| `src/app/dashboard/developer/design-system/page.tsx` | 2,282 | Should be split into components |
| `src/app/dashboard/developer/design-system/_components/DesignSystemPageClient.tsx` | 2,122 | Very large client component |
| `src/app/developer/_components/ComponentShowcase.tsx` | 1,969 | Should be split |
| `src/app/dashboard/3d-lab/_config/moduleRegistry.ts` | 1,741 | Config file -- may be acceptable |
| `src/components/admin/unified-editor/QuestionsPanel.tsx` | 1,446 | Complex editor panel |
| `src/lib/actions/testing.ts` | 1,174 | Server actions file |
| `src/app/developer/components/page.tsx` | 1,142 | Should use components |
| `src/types/app.ts` | 885 | Type definitions -- high churn |

---

## 12. Summary Table

| Dimension | Value | Health |
|-----------|-------|--------|
| **Framework** | Next.js 16.1.6 / React 19.2.4 / TS 5.9.3 | Current |
| **Total Dependencies** | 64 (56 prod + 8 dev) | Moderate -- 3 duplicates flagged |
| **Codebase Size** | 1,152 files / ~31,500 LOC | Medium-sized |
| **Client/Server Split** | 387 client / 59 server / ~253 RSC | Client-heavy |
| **Test Coverage** | 12 test files, no test runner installed | Critical gap |
| **Git Velocity** | 273 commits in 18 days (~15/day) | Very high (solo dev) |
| **Authors** | 1 | Solo project |
| **Churn Risk** | Sidebar (34), globals.css (32), dashboard (29) | Layout architecture unsettled |
| **DB Tables** | 51 tables, 38 migrations | Active evolution |
| **Env Vars** | 19 unique, proper secret separation | Clean |
| **Documentation** | PRDs exist, README outdated, no LICENSE/CONTRIBUTING/CHANGELOG | Partial |
| **TypeScript Strictness** | `strict: false`, `noImplicitAny: false`, `strictNullChecks: false` | Permissive |

---

## 13. First Impression (CTO Gut Check)

This is a solo-developer product moving at exceptional velocity (273 commits in 18 days) through an aggressive feature buildout and design system migration. The tech stack choices are modern and well-aligned (Next.js 16, React 19, Tailwind 4, Supabase), but the project carries three significant structural debts: (1) zero functional test infrastructure despite 12 orphaned test files and no test runner installed, (2) TypeScript running with all strictness flags disabled, meaning type safety is largely advisory, and (3) layout/navigation architecture still visibly unstable with the Sidebar component alone touching 34 commits. The codebase is at a critical inflection point -- it needs to shift from "ship features" to "harden foundations" before the accumulated velocity becomes accumulated fragility.


