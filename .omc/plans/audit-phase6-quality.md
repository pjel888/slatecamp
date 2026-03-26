# Phase 6: Code Quality & Technical Debt Audit

**Date:** 2026-03-25
**Codebase:** 964 source files (excluding tests/declarations) | ~141k lines

---

## Code Quality Scorecard

| Metric | Value | Grade | Notes |
|---|---|---|---|
| **TypeScript Strict Mode** | OFF (`strict: false`, `noImplicitAny: false`, `strictNullChecks: false`) | F | All three safety nets disabled |
| **`any` type usage** | 156 occurrences across 58 files | D | ~6% of source files use `any` escape hatches |
| **`@ts-ignore` / `@ts-expect-error`** | 3 total (all `@ts-expect-error` with comments) | A | Minimal and well-documented |
| **Test coverage** | 12 test files / 964 source files (1.2%) | F | Near-zero coverage |
| **Test runner** | Bun test (no vitest/jest installed) | C | Bun test works but no CI integration evident |
| **ESLint config** | Active with custom rules | B | Enforces unused-var warnings, no-restricted-globals, hex-color linting |
| **Relative import depth** | 205 occurrences of `../../+` imports | C+ | Path alias `@/*` exists but not universally used — 3d-lab configs are the bulk (180+) |
| **Console statements** | 96 across 47 files | D | Scattered debug logging left in production code |
| **Error handling (actions)** | 12 `catch` blocks across 56 action files (21%) | D | 79% of server actions have no error handling |
| **`"use server"` directives** | Only 4 of 56 action files | F | 93% of action files missing the directive |
| **Props interfaces** | 15 typed Props interfaces for ~350+ components | F | <5% of components have typed props |
| **TODO/FIXME inventory** | 8 items (see below) | B | Low count, mostly extraction notes |
| **Largest file** | `supabase.ts` 2,611 lines (generated types) | C | 5 files over 1,000 lines (see below) |

---

## TODO / FIXME Inventory

| # | File | Line | Comment |
|---|---|---|---|
| 1 | `src/lib/lab-analytics.ts` | 39 | `TODO: Replace with actual analytics endpoint` |
| 2 | `src/lib/srs/update.ts` | 73 | `TODO Phase 5: Add Sentry.captureException(err)` |
| 3 | `src/components/landing/LandingPageContent.tsx` | 60 | `TODO: evaluate SectionHeader migration` |
| 4 | `src/components/marketing/AnalyticsSection.tsx` | 146 | `TODO: evaluate SectionHeader migration` |
| 5 | `src/components/marketing/FeatureSectionLayout.tsx` | 69 | `TODO: evaluate SectionHeader migration` |
| 6 | `src/components/dashboard/ResultsSummary.tsx` | 161 | `TODO: extract CalibrationSection` |
| 7 | `src/components/dashboard/ResultsSummary.tsx` | 245 | `TODO: extract ErrorPatternSection` |
| 8 | `src/components/dashboard/QuizRenderer.tsx` | 598 | `TODO: extract NoQuestionsLoaded fallback` |

---

## Top 10 Largest Files (Non-Generated)

| # | File | Lines |
|---|---|---|
| 1 | `src/app/dashboard/developer/design-system/page.tsx` | 2,282 |
| 2 | `src/app/dashboard/developer/design-system/_components/DesignSystemPageClient.tsx` | 2,122 |
| 3 | `src/app/developer/_components/ComponentShowcase.tsx` | 1,969 |
| 4 | `src/app/dashboard/3d-lab/_config/moduleRegistry.ts` | 1,741 |
| 5 | `src/components/admin/unified-editor/QuestionsPanel.tsx` | 1,446 |
| 6 | `src/lib/actions/testing.ts` | 1,174 |
| 7 | `src/app/developer/components/page.tsx` | 1,142 |
| 8 | `src/app/developer/api-reference/page.tsx` | 890 |
| 9 | `src/types/app.ts` | 885 |
| 10 | `src/components/dashboard/QuizRenderer.tsx` | 860 |

---

## Test File Inventory (All 12)

| # | File | Tests | Runner |
|---|---|---|---|
| 1 | `src/lib/srs/irt.test.ts` | IRT algorithm (probabilityCorrect, updateTheta, selectNextQuestion) | bun:test |
| 2 | `src/lib/srs/sm2.test.ts` | SM-2 spaced repetition (calculateNextReview, getQuality) | bun:test |
| 3 | `src/lib/srs/update.test.ts` | SRS update logic with mocked Supabase | bun:test |
| 4 | `src/lib/rate-limit.test.ts` | Rate limiter (checkRateLimit) | bun:test |
| 5 | `src/lib/__tests__/routes.test.ts` | Route constants (getPageTitle, STATIC_PAGE_TITLES) | bun:test |
| 6 | `src/lib/actions/analytics.test.ts` | Analytics server actions with mocked Supabase | bun:test |
| 7 | `src/lib/actions/dashboard-page.test.ts` | Dashboard page data fetching | bun:test |
| 8 | `src/lib/actions/quiz.test.ts` | Quiz math/logic verification | bun:test |
| 9 | `src/lib/blindspot/generate-queue.test.ts` | Blindspot queue generation with mocks | bun:test |
| 10 | `src/components/dashboard/QuizRenderer.test.tsx` | QuizRenderer component (localStorage mock) | bun:test |
| 11 | `src/app/dashboard/3d-lab/_constants/nbcp.test.ts` | NBCP building code constants | bun:test |
| 12 | `src/app/dashboard/3d-lab/_utils/nbcpCalculator.test.ts` | NBCP envelope calculator | bun:test |

**What's covered:** Core algorithms (IRT, SM-2), rate limiting, route config, two server actions, one component, building code calculations.

**What's NOT covered:** All UI components, all hooks, auth flows, admin features, wiki system, testing session logic, sidebar/navigation, notes, assessment, CEO dashboard, 3D lab (except NBCP), error boundaries, middleware, API routes.

---

## Top 10 Issues (Prioritized)

### 1. CRITICAL: TypeScript Strict Mode Disabled
- **Impact:** Null reference crashes at runtime, implicit `any` masks real bugs, entire type system undermined.
- **Files:** `tsconfig.json` — `strict: false`, `noImplicitAny: false`, `strictNullChecks: false`
- **Fix:** Enable incrementally: `strictNullChecks` first (biggest safety gain), then `noImplicitAny`, then full `strict`. Use `// @ts-expect-error` to unblock files that need migration time.
- **Effort:** Large (will surface hundreds of errors), but highest-ROI change for stability.

### 2. CRITICAL: Near-Zero Test Coverage (1.2%)
- **Impact:** No regression safety net. Every deploy is manual QA or a prayer.
- **Current state:** 12 test files covering only pure-logic modules. Zero component tests, zero integration tests, zero E2E tests.
- **Fix:** Priority test targets: (1) server actions (business logic), (2) IRT/mastery calculations (correctness-critical), (3) QuizRenderer (most complex component), (4) auth flow (security-critical).
- **Effort:** Large, ongoing. Start with server action unit tests — highest value per line of test.

### 3. HIGH: 79% of Server Actions Lack Error Handling
- **Impact:** Unhandled Supabase errors silently fail, producing blank screens or stale data for users.
- **Stats:** Only 12 `catch` blocks across 56 action files. `wiki-actions.ts` has 10 catches (good); most files have zero.
- **Fix:** Wrap all server action DB calls in try/catch with structured error returns. Add Sentry integration (already a TODO).
- **Effort:** Medium. Template-able — one pattern applied to all files.

### 4. HIGH: 93% of Action Files Missing `"use server"` Directive
- **Impact:** Only 4 of 56 action files declare `"use server"`. Next.js may not treat them as server actions, causing build-time or runtime misrouting. The files likely work due to parent-level directives or co-location, but this is fragile.
- **Fix:** Add `"use server"` to the top of every file in `src/lib/actions/`.
- **Effort:** Small. Mechanical, scriptable.

### 5. HIGH: 156 Explicit `any` Types Across 58 Files
- **Impact:** Type safety holes. Top offenders: `analytics.ts` (13), `wiki-actions.ts` (12), `trails.ts` (11+6), `stats-actions.ts` (10), `assessment.ts` (8).
- **Fix:** Replace with proper types from `src/types/`. Most are Supabase query returns that should use generated types from `supabase.ts`.
- **Effort:** Medium. Start with server actions where `any` masks DB response shapes.

### 6. MEDIUM: 5 Files Over 1,000 Lines (Excluding Generated)
- **Impact:** Hard to navigate, review, and test. `QuestionsPanel.tsx` at 1,446 lines is a maintenance burden.
- **Fix:** Extract sub-components and helper functions. The design-system pages (2,282 + 2,122 lines) are developer tools and lower priority.
- **Effort:** Medium per file. Start with `QuestionsPanel.tsx` and `testing.ts`.

### 7. MEDIUM: 96 Console Statements in Production Code
- **Impact:** Noisy browser console, potential info leakage, no structured logging.
- **Fix:** Replace with structured logger or remove. Keep `console.error` in error boundaries; remove `console.log` debug lines.
- **Effort:** Small-medium. Scriptable with ESLint `no-console` rule.

### 8. MEDIUM: Props Interfaces Nearly Absent
- **Impact:** Components accept untyped props, making refactoring dangerous and IDE support weak. Only ~15 typed Props interfaces for 350+ components.
- **Fix:** Add `interface FooProps {}` to every component. Can be automated with a codemod.
- **Effort:** Large but mechanical. Pair with strict mode enablement.

### 9. LOW: Deep Relative Imports (205 Occurrences)
- **Impact:** Fragile paths that break on file moves. Path alias `@/*` is configured but not universally used.
- **Fix:** Bulk-replace `../../` imports with `@/` equivalents. ~180 are in 3d-lab config files (all identical pattern).
- **Effort:** Small. Single regex replacement.

### 10. LOW: Missing Sentry/Observability Integration
- **Impact:** TODO in `srs/update.ts` notes Sentry is planned but not implemented. No structured error tracking in production.
- **Fix:** Install `@sentry/nextjs`, configure error boundary, add to server actions.
- **Effort:** Medium. Standard Next.js Sentry setup.

---

## ESLint Configuration Summary

**File:** `eslint.config.mjs` (flat config format)

| Rule | Setting | Purpose |
|---|---|---|
| `react-hooks/set-state-in-effect` | off | Allow setState in effects for reset/hydration patterns |
| `@typescript-eslint/no-unused-vars` | warn | Ignore `_` prefixed args/vars |
| `@next/next/no-img-element` | warn | Allow `<img>` where `next/image` impractical |
| `no-restricted-globals` | error | Ban `alert()`, `confirm()`, `prompt()` |
| `no-restricted-syntax` | warn | Flag hardcoded hex in Tailwind classes |

**Missing rules to consider:**
- `no-console` (to address 96 console statements)
- `@typescript-eslint/no-explicit-any` (to prevent new `any` additions)
- `@typescript-eslint/consistent-type-imports` (enforce type-only imports)

---

## Quick Wins (Can Be Done Today)

1. **Add `"use server"` to all action files** — 5 min, scriptable
2. **Add `no-console: warn` ESLint rule** — prevents new console statements
3. **Add `@typescript-eslint/no-explicit-any: warn`** — prevents new `any` additions
4. **Replace deep imports in 3d-lab configs** — single find-and-replace (~180 files, same pattern)
5. **Enable `strictNullChecks` in tsconfig** — biggest type-safety gain, surfaces real bugs

---

## Comparison With Previous Audit Phases

| Phase | Focus | Key Finding |
|---|---|---|
| Phase 1 (Infra) | Build, deploy, env | Bun runtime, Supabase backend, Vercel deploy |
| Phase 2 (Features) | Feature inventory | 1,152 source files, mature feature set |
| Phase 3 (Architecture) | Structure, patterns | App Router, server actions, Zustand stores |
| Phase 4 (Security) | Auth, access, secrets | RLS policies, admin auth, demo mode |
| Phase 5 (Performance) | Bundle, runtime | Image optimization, 3d-lab lazy loading |
| **Phase 6 (Quality)** | **Type safety, tests, debt** | **Strict mode OFF, 1.2% test coverage, 79% actions unhandled** |
