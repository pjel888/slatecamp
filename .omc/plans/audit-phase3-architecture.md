# Phase 3: Architecture Anti-Pattern Audit

**Date:** 2026-03-25
**Codebase:** SlateCamp — 1,101 source files (692 .tsx + 409 .ts), ~31,500 LOC
**Stack:** Next.js 16.1.6, React 19.2.4, Supabase, Tailwind 4, Zustand

---

## Scorecard

| # | Category | Score | Finding Count | Key Details |
|---|----------|-------|--------------|-------------|
| 1 | Client vs Server Components | **CRITICAL** | 106 suspects | 56% client ratio (target <40%); 106 files have `'use client'` with no client-side justification |
| 2 | Inline Components in Route Files | **NEEDS_WORK** | 21 files | 1,142-line page.tsx in developer portal; 5 files with 3+ definitions |
| 3 | Data Fetching Architecture | **CRITICAL** | 40+ page files | Direct Supabase calls in 40+ page.tsx files instead of query layer |
| 4 | Overfetching (select *) | **CRITICAL** | 47 locations | 47 `select('*')` calls across actions, queries, and page files |
| 5 | Waterfall Data Fetching | **CRITICAL** | 22 pages | 22 page.tsx files with sequential awaits and no Promise.all |
| 6 | State Management | **CLEAN** | 0 issues | 5 Zustand stores (domain-scoped), 10 Contexts (domain-scoped), no Redux/Jotai/Recoil |
| 7 | Import Hygiene | **CLEAN** | 0 issues | 87% absolute imports (1,733 @/ vs 267 ../); 20 barrel files; 0 deep relative imports |
| 8 | Prop Drilling | **NEEDS_WORK** | 15 components | 3 components with 20+ props; worst offender: PacingInsights (55 props) |
| 9 | Multi-Portal Architecture | **CLEAN** | 0 inconsistencies | Admin, CEO, Developer all use shared PortalLayout; Dashboard uses its own Sidebar shell (justified) |
| 10 | Query Layer Discipline | **NEEDS_WORK** | 7 component violations | 7 components import supabase directly; 2 call supabase methods (auth.signOut) |
| 11 | IRT/SRS Engine Isolation | **CLEAN** | 0 leaks | IRT in `src/lib/srs/irt.ts`, SRS in `src/lib/srs/`, readiness in `src/lib/readiness/`; no calculation logic in components |
| 12 | R3F Component Architecture | **CLEAN** | 0 issues | All 3D scenes lazy-loaded via `next/dynamic`; Canvas wrapped with Suspense; `frameloop="demand"` for zero-waste rendering |

**Overall Architecture Health: 5 CLEAN / 3 NEEDS_WORK / 4 CRITICAL**

---

## Category Details

### 1. Client vs Server Component Analysis

**Score: CRITICAL**

- **Total .tsx files:** 692
- **Files with `'use client'`:** 387 (55.9%)
- **Target:** <40% client
- **Overshoot:** +15.9 percentage points

**106 suspect files** have `'use client'` but use none of: `useState`, `useEffect`, `useRef`, `useCallback`, `useMemo`, `useReducer`, `onClick`, `onChange`, `onSubmit`, `onKeyDown`, `onMouseEnter`, `onMouseLeave`, `onFocus`, `onBlur`, `window.`, `document.`, `navigator.`.

**Worst offender categories:**

| Category | Count | Examples |
|----------|-------|---------|
| UI primitives (shadcn) | 11 | `button.tsx`, `tabs.tsx`, `popover.tsx`, `select.tsx`, `tooltip.tsx`, `dropdown-menu.tsx`, `command.tsx`, `icon-button.tsx`, `mode-button.tsx`, `close-button.tsx`, `badge.tsx` |
| Marketing/landing | 10 | `HeroSection.tsx`, `PricingCard.tsx`, `ComparisonSection.tsx`, `MarketingFooter.tsx`, `SocialProofBar.tsx`, `WikiSection.tsx`, etc. |
| Analytics charts | 7 | `ReadinessTrajectory.tsx`, `StaminaCurve.tsx`, `PacingQuadrant.tsx`, `MemoryHealthMap.tsx`, `PacingInsights.tsx`, `ChartCoachingAnnotation.tsx`, `AnalyticsSummaryBar.tsx` |
| CEO dashboard charts | 8 | `RevenueChart.tsx`, `RunwayGauge.tsx`, `ChurnRiskBars.tsx`, `ExpenseBreakdownChart.tsx`, `RevenueExpenseChart.tsx`, `CohortRetentionTable.tsx`, `DepartmentCostChart.tsx`, `TimeToValueFunnel.tsx` |
| Testing debrief | 6 | `BlockAccuracyChart.tsx`, `CalibrationReveal.tsx`, `NodeMasteryStrip.tsx`, `ScoreHero.tsx`, `PressureGapCard.tsx`, `ReadinessDelta.tsx` |
| Portal shells | 3 | `CeoShell.tsx`, `AdminShell.tsx`, `DevPortalShell.tsx` |
| Dashboard display-only | 10 | `FeatureDiscoveryRow.tsx`, `GradientImage.tsx`, `HeatmapGrid.tsx`, `HeatmapLegend.tsx`, `QuizFooterNav.tsx`, `RichInfoPopover.tsx`, `StreakRibbon.tsx`, `SubjectFloorAlert.tsx`, `SubjectRadarChart.tsx`, `TopicBreakdown.tsx` |
| Wiki display-only | 5 | `FormulaBlock.tsx`, `KeyValues.tsx`, `WikiArticleHeader.tsx`, `WikiContentShell.tsx`, `WikiMistakeList.tsx` |
| Misc | 46 | Hooks (`useFeatureFlag.ts`, `useUserRole.ts`), dev tools, motion wrappers, etc. |

**Note:** Many of these likely have `'use client'` because they import from a barrel that re-exports client components, or because a parent component is client and the directive was added defensively. The shadcn primitives (button, tabs, popover, etc.) may legitimately need `'use client'` due to underlying Radix/headless UI event handlers that our grep did not detect (e.g., `onPointerDown` from Radix internals). Actual removable directives are estimated at **~60-70 files**.

---

### 2. Inline Components in Routing Files

**Score: NEEDS_WORK**

21 routing files contain more than 1 component/function definition:

| File | Definitions | LOC | Severity |
|------|------------|-----|----------|
| `src/app/developer/components/page.tsx` | 12 | 1,142 | **CRITICAL** — entire component library rendered in one page file |
| `src/app/admin/activity/page.tsx` | 5 | 155 | Medium |
| `src/app/admin/questions/analytics/page.tsx` | 4 | — | Medium |
| `src/app/dashboard/wiki/[slug]/page.tsx` | 4 | — | Medium |
| `src/app/developer/architecture/page.tsx` | 3 | — | Low |
| `src/app/dashboard/layout.tsx` | 3 | 159 | OK — `DashboardLayoutContent` + `DashboardLayout` + Suspense wrapper is a valid pattern |
| `src/app/dashboard/testing/session/[sessionId]/debrief/page.tsx` | 3 | 94 | Low |
| Remaining 14 files | 2 each | — | Low |

---

### 3. Data Fetching Architecture

**Score: CRITICAL**

Direct Supabase calls are spread across the codebase instead of being isolated in the query layer:

| Location | Count | Expected |
|----------|-------|----------|
| `src/app/` page.tsx / route files | 40+ files | Should call `src/lib/queries/` or `src/lib/actions/` |
| `src/components/` | 7 files import supabase | Should be zero (except auth signout) |
| `src/lib/queries/` | 5 files | Good — but far too few; most queries live in page.tsx |
| `src/lib/actions/` | 60 files | Good — but mixed with queries |

**Pattern violations in page.tsx files (sample):**

- `src/app/dashboard/testing/page.tsx` — 8 sequential Supabase queries inline (subscription, sessions, stats, blindspot, profile, weakNodes)
- `src/app/dashboard/testing/session/[sessionId]/debrief/page.tsx` — 7 sequential queries inline
- `src/app/dashboard/score-reveal/page.tsx` — 6 sequential calls
- `src/app/(auth)/onboarding/page.tsx` — 10 sequential calls including a server action defined inline
- `src/app/dashboard/layout.tsx` — 4 queries inline (subscription, stats, disciplines + feature flags)

**Why this matters:** No query reuse, no caching layer, no type safety at the boundary. Every page re-implements the same auth + data pattern. Changing a table name requires finding every page.tsx that references it.

---

### 4. Overfetching Detection

**Score: CRITICAL**

**47 `select('*')` calls** found across the codebase:

| Location | Count | Worst Files |
|----------|-------|-------------|
| `src/lib/actions/trails.ts` | 6 | Lines 28, 45, 165, 329, 339, 520 |
| `src/lib/actions/wiki-actions.ts` | 10 | Lines 70, 135, 159, 243, 341, 349, 359, 386, 416, 428, 458 |
| `src/lib/actions/quiz.ts` | 4 | Lines 33, 46, 67, 198 |
| `src/lib/queries/trails.ts` | 5 | Lines 32, 48, 120, 149, 277, 286 |
| `src/app/` page files | 7 | onboarding, debrief, session, logs, layout, simulation results |
| `src/lib/actions/notes-actions.ts` | 2 | Lines 59, 74 |
| `src/lib/actions/testing.ts` | 2 | Lines 393, 430 |
| Other (audit, blindspot, user-stats, etc.) | 11 | Various |

Every `select('*')` fetches all columns including potentially large text fields, metadata, and audit columns that the UI never renders.

---

### 5. Waterfall vs Parallel Data Fetching

**Score: CRITICAL**

**22 page.tsx files** execute multiple sequential `await` calls with no `Promise.all` or `Promise.allSettled`:

| File | Sequential Awaits | Impact |
|------|------------------|--------|
| `src/app/(auth)/onboarding/page.tsx` | **10** | Severe — every await blocks the next |
| `src/app/dashboard/testing/page.tsx` | **8** | Severe — 8 independent queries run sequentially |
| `src/app/dashboard/testing/session/[sessionId]/debrief/page.tsx` | **7** | High |
| `src/app/dashboard/testing/session/[sessionId]/page.tsx` | **6** | High |
| `src/app/dashboard/testing/simulation/[sessionId]/results/page.tsx` | **6** | High |
| `src/app/dashboard/score-reveal/page.tsx` | **6** | High |
| `src/app/dashboard/assessment/page.tsx` | **5** | Medium |
| `src/app/dashboard/welcome-pro/page.tsx` | **5** | Medium |
| `src/app/(protected)/ceo/financials/page.tsx` | **4** | Medium |
| 13 more files | 3 each | Low-Medium |

**Estimated latency waste:** If each Supabase query takes ~50ms, the testing page alone wastes ~350ms (8 queries * 50ms sequential vs ~50ms parallel). The onboarding page wastes ~450ms.

---

### 6. State Management Audit

**Score: CLEAN**

**Zustand Stores (5):**
- `src/app/dashboard/3d-lab/_stores/labStore.ts` — 3D Lab global state
- `src/app/dashboard/3d-lab/_stores/nbcpStore.ts` — NBCP module state
- `src/app/dashboard/3d-lab/_stores/createModuleStore.ts` — Factory for per-module stores
- `src/stores/dev-store.ts` — Dev toolbar state
- `src/stores/useLabStore.ts` — Lab analytics store

**React Contexts (10):**
- `DirtyStateContext` — Admin editor dirty tracking
- `SidebarContext` — Sidebar open/closed state
- `AccordionContext` — UI accordion state
- `AlertDialogCloseContext` — Dialog close callback
- `WikiDisciplineContext` — Wiki article discipline data
- `WikiNavigationContext` — Wiki navigation state
- `ActiveSessionContext` — Active quiz session
- `BreadcrumbContext` — Breadcrumb navigation
- `DisciplineContext` — User's selected discipline
- `NoteContext` — Notes editor state
- `TierContext` — User subscription tier

All stores and contexts are domain-scoped. No monolithic state. No Redux/Jotai/Recoil detected.

---

### 7. Import Hygiene

**Score: CLEAN**

- **Absolute `@/` imports:** 1,733 (86.7%)
- **Relative `../` imports:** 267 (13.3%)
- **Deep relative imports (3+ levels):** 0
- **Barrel index files:** 20

The 267 relative imports are all same-directory or one-level-up references within co-located feature folders (e.g., 3D Lab `_components/` importing from `_stores/`). This is acceptable and conventional.

---

### 8. Prop Drilling Detection

**Score: NEEDS_WORK**

**15 components** with Props interfaces exceeding 6 properties. Top offenders:

| Component | Props Count | File |
|-----------|------------|------|
| `PacingInsights` | **55** | `src/components/analytics/PacingInsights.tsx` |
| `FloatingPanel` | **43** | `src/components/shared/floating-panel.tsx` |
| `DataTable` | **30** | `src/components/shared/data-table.tsx` |
| `QuestionCard` | **26** | `src/components/shared/question-card.tsx` |
| `TestingHub` | **20** | `src/components/dashboard/TestingHub.tsx` |
| `SaveAllBar` | **19** | `src/components/admin/unified-editor/SaveAllBar.tsx` |
| `StaminaCurve` | **19** | `src/components/analytics/StaminaCurve.tsx` |
| `ElaborativeInterrogation` | **17** | `src/components/wiki/ElaborativeInterrogation.tsx` |
| `TreeContent` | **17** | `src/components/shared/taxonomy-picker.tsx` |
| `NotesEditor` | **16** | `src/components/notes/NotesEditor.tsx` |
| `QuizDrawers` | **16** | `src/components/dashboard/QuizDrawers.tsx` |
| `ArticlePanel` | **16** | `src/components/admin/unified-editor/ArticlePanel.tsx` |
| `TransitionLink` | **15** | `src/components/shared/TransitionLink.tsx` |
| `QuizActionButtons` | **15** | `src/components/dashboard/QuizActionButtons.tsx` |
| `TaxonomyTree` | **14** | `src/components/shared/taxonomy-tree.tsx` |

`PacingInsights` with 55 props is an extreme outlier — this component should receive a data object, not individual props.

---

### 9. Multi-Portal Architecture Consistency

**Score: CLEAN**

All three sub-portals (Admin, CEO, Developer) use the shared `PortalLayout` component from `src/components/portal/PortalLayout.tsx`:

| Portal | Shell Component | Uses PortalLayout | Auth Pattern |
|--------|----------------|-------------------|--------------|
| Admin | `AdminShell` | Yes | `getUser()` + `canReviewContent()` + `getUserRole()` |
| CEO | `CeoShell` | Yes | `supabase.auth.getUser()` + profile role check |
| Developer | `DevPortalShell` | Yes | `getUserRole()` + env bypass |
| Dashboard | Custom Sidebar | No (justified) | `getUser()` + `bootstrapUser()` |

**Minor inconsistency:** CEO layout uses raw `supabase.auth.getUser()` while Admin and Developer use the `getUser()` wrapper from `@/lib/supabase/server`. This is a trivial fix but shows inconsistent auth patterns.

The Dashboard portal correctly uses its own shell (Sidebar + Navbar + context providers) since it has different UX requirements (sidebar navigation, dev toolbar, multi-context providers).

---

### 10. Query Layer Discipline

**Score: NEEDS_WORK**

**Query layer inventory:**
- `src/lib/queries/` — 5 files (trails.ts, ceo/auth.ts, ceo/financial-queries.ts, ceo/team-queries.ts, ceo/user-queries.ts)
- `src/lib/actions/` — 60 files (server actions + queries mixed together)

**Violations — Components importing Supabase directly:**

| File | Usage | Severity |
|------|-------|----------|
| `src/components/admin/SMEReviewQueue.tsx` | Supabase import | Medium |
| `src/components/auth/SignOutButton.tsx` | `supabase.auth.signOut()` | Low (auth action is acceptable) |
| `src/components/landing/LandingPageContent.tsx` | Supabase import | Medium |
| `src/components/marketing/MarketingNav.tsx` | Supabase import | Medium |
| `src/components/shared/LogoutButton.tsx` | `supabase.auth.signOut()` | Low (auth action is acceptable) |
| `src/components/shared/Omnibar.tsx` | Supabase import | Medium |
| `src/components/wiki/WikiLayoutContent.tsx` | Supabase import | Medium |

**Structural issue:** The `src/lib/queries/` directory has only 5 files. The vast majority of data fetching happens inline in page.tsx files or in the actions directory. There is no clear separation between "read queries" and "write actions" — they are mixed in `src/lib/actions/`.

---

### 11. IRT/SRS Engine Isolation

**Score: CLEAN**

Calculation logic is properly isolated:

| Module | Location | Files |
|--------|----------|-------|
| IRT (Item Response Theory) | `src/lib/srs/irt.ts` | Core 2PL model + test file |
| SM-2 (Spaced Repetition) | `src/lib/srs/sm2.ts` | SM-2 algorithm + test file |
| SRS Update | `src/lib/srs/update.ts` | Mastery update logic + test file |
| Retention | `src/lib/srs/retention.ts` | Retention curve calculations |
| Readiness Velocity | `src/lib/readiness/velocity.ts` | Score trajectory |
| Readiness Churn | `src/lib/readiness/churn.ts` | Churn risk calculations |

No IRT/SRS calculation functions were found in `src/components/`. The grep for `irt`, `theta`, `discrimination`, `logistic`, `mastery.*calc` in components returned only `DirtyState` tracking (false positive). Clean separation.

---

### 12. R3F Component Architecture

**Score: CLEAN**

The 3D Lab is well-architected:

- **Lazy loading:** All scene components use `next/dynamic` with `{ ssr: false }` in `src/app/dashboard/3d-lab/_components/LabViewport.tsx` (8 dynamic imports)
- **Canvas isolation:** Shared `CanvasWrapper` component wraps all scenes with consistent config
- **Performance:** `frameloop="demand"` with Zustand invalidation bridge = zero-waste rendering (no continuous 60fps loop)
- **Suspense:** Canvas children wrapped in `<Suspense fallback={null}>`
- **DPR capped:** `dpr={[1, 1.5]}` prevents retina overdraw
- **Module registry:** 170+ 3D modules configured declaratively in `_config/modules/`
- **Store pattern:** Factory `createModuleStore.ts` generates per-module Zustand stores

---

## Top 10 Architectural Bottlenecks

Ordered by estimated engineering cost if left unfixed.

### 1. CRITICAL: Waterfall Data Fetching in Testing Pages
- **File:** `src/app/dashboard/testing/page.tsx` (8 sequential awaits)
- **File:** `src/app/(auth)/onboarding/page.tsx` (10 sequential awaits)
- **File:** `src/app/dashboard/testing/session/[sessionId]/debrief/page.tsx` (7 sequential awaits)
- **Impact:** ~350-500ms wasted per page load. These are high-traffic pages (testing hub, debrief, onboarding).
- **Fix:** Wrap independent queries in `Promise.all()`. Estimated effort: 2-3 hours for all 22 files.

### 2. CRITICAL: No Query Abstraction Layer
- **Pattern:** 40+ page.tsx files contain inline Supabase queries
- **Impact:** Zero query reuse; changing a table name or adding a filter requires editing 40+ files. No caching, no type boundary.
- **Fix:** Create `src/lib/queries/` modules per domain (testing, dashboard, assessment, wiki, etc.) and move all inline queries there. Estimated effort: 8-12 hours.

### 3. CRITICAL: 47 select('*') Overfetching Calls
- **Worst files:** `src/lib/actions/wiki-actions.ts` (10 occurrences), `src/lib/actions/trails.ts` (6), `src/lib/queries/trails.ts` (5)
- **Impact:** Fetches all columns including large text/JSON fields that the UI never renders. Increases Supabase egress costs, slows down queries, and transfers sensitive columns unnecessarily.
- **Fix:** Replace each `select('*')` with explicit column lists. Estimated effort: 4-6 hours.

### 4. CRITICAL: 106 Unnecessary 'use client' Directives
- **Estimated truly removable:** ~60-70 files (after excluding shadcn primitives that need Radix event handlers)
- **Impact:** Each unnecessary `'use client'` forces the component and its entire subtree to ship JS to the browser. For display-only components (charts, cards, badges), this is pure waste.
- **Fix:** Audit each suspect file; remove directive from pure display components. Estimated effort: 4-6 hours.

### 5. NEEDS_WORK: PacingInsights — 55 Props
- **File:** `src/components/analytics/PacingInsights.tsx`
- **Impact:** Unmaintainable interface; any change to the data shape requires updating the prop type, the caller, and the component. Testing is difficult.
- **Fix:** Refactor to accept 2-3 data objects instead of 55 individual props. Estimated effort: 1-2 hours.

### 6. NEEDS_WORK: 1,142-Line Developer Components Page
- **File:** `src/app/developer/components/page.tsx` (12 inline component definitions, 1,142 lines)
- **Impact:** Unmaintainable; the entire component library preview is a single file. Any change risks breaking unrelated previews.
- **Fix:** Extract each preview section into its own component in `_components/`. Estimated effort: 2-3 hours.

### 7. NEEDS_WORK: CEO Auth Pattern Inconsistency
- **File:** `src/app/(protected)/ceo/layout.tsx` line 15
- **Pattern:** Uses raw `supabase.auth.getUser()` instead of the project's `getUser()` wrapper
- **Impact:** Bypasses any auth middleware or caching that `getUser()` provides. Inconsistent with Admin and Developer portals.
- **Fix:** Replace with `getUser()` from `@/lib/supabase/server`. Estimated effort: 5 minutes.

### 8. NEEDS_WORK: Mixed Queries and Actions in src/lib/actions/
- **File:** `src/lib/actions/` (60 files)
- **Impact:** No clear read/write separation. Server Actions (mutations) are mixed with read queries. Makes it hard to apply caching (reads can be cached, writes cannot).
- **Fix:** Split into `src/lib/queries/` (reads) and `src/lib/actions/` (writes/mutations). Estimated effort: 6-8 hours.

### 9. NEEDS_WORK: Components Importing Supabase Directly
- **Files:** `SMEReviewQueue.tsx`, `LandingPageContent.tsx`, `MarketingNav.tsx`, `Omnibar.tsx`, `WikiLayoutContent.tsx`
- **Impact:** Bypasses the data access layer; makes components untestable without a Supabase connection.
- **Fix:** Move queries to server components or action layer; pass data as props. Estimated effort: 2-3 hours.

### 10. NEEDS_WORK: Dashboard Layout Waterfall
- **File:** `src/app/dashboard/layout.tsx` lines 36-62
- **Impact:** 4 sequential queries (getUser, bootstrapUser, subscription, stats, disciplines) on every dashboard navigation. The layout re-executes on every route change within `/dashboard/*`.
- **Fix:** Wrap independent queries (subscription, stats, disciplines) in `Promise.all()`. Estimated effort: 30 minutes.

---

## Estimated Remediation Effort

| Priority | Category | Estimated Hours |
|----------|----------|----------------|
| P0 | Waterfall data fetching (Promise.all) | 2-3 hours |
| P0 | Query abstraction layer | 8-12 hours |
| P1 | select('*') overfetching | 4-6 hours |
| P1 | Remove unnecessary 'use client' | 4-6 hours |
| P2 | Prop drilling refactors | 3-4 hours |
| P2 | Inline component extraction | 2-3 hours |
| P2 | Query/action separation | 6-8 hours |
| P3 | Minor consistency fixes | 1-2 hours |
| **Total** | | **30-44 hours** |

---

## What's Working Well

1. **State management** is clean — domain-scoped Zustand stores and React Contexts with no bloat.
2. **Import hygiene** is excellent — 87% absolute imports, zero deep nesting.
3. **IRT/SRS engine** is perfectly isolated from UI.
4. **3D Lab architecture** is production-quality — lazy loading, demand rendering, store factories.
5. **Portal shell pattern** is consistent across Admin, CEO, Developer — shared `PortalLayout` component.
6. **No external state libraries** beyond Zustand — no Redux, Jotai, or Recoil complexity.
