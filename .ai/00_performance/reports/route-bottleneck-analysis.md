# Route Bottleneck Analysis

Date: 2026-05-04
Branch: codebase-modernization-batch1-2

---

## 1. /dashboard/analytics — 44s p95

### Route Files

| File | Type | Notes |
|------|------|-------|
| `src/app/dashboard/analytics/page.tsx` | Server Component | 26 section children, `force-dynamic` |
| `src/app/dashboard/analytics/layout.tsx` | Server Component | Wraps children in `SharedPageLayout` + `AnalyticsTabNav` |
| `src/app/dashboard/analytics/loading.tsx` | Server Component | Skeleton placeholders |
| `src/app/dashboard/analytics/error.tsx` | Client Component | Error boundary with retry |

### Parent Layout (shared by analytics and 3d-lab)

`src/app/dashboard/layout.tsx` → `DashboardLayoutContent` (`src/components/dashboard/DashboardLayoutContent.tsx`) performs on every request:
- `createClient()` + `getUser()` → Supabase auth check
- `bootstrapUser(user.id)` — mutates the database
- 4 parallel queries: `user_subscriptions`, `user_global_stats` (with `disciplines(*)` join), `profiles`, `getCachedDisciplines()`
- `getViewerEntitlements([devToolbar])` — 4 more Supabase queries + role resolution
- Onboarding guard redirect
- Wraps in 6 context providers: `EntitlementProvider`, `TierProvider`, `DisciplineProvider`, `ActiveSessionProvider`, `NoteContextProvider`, `SidebarProvider`

### Primary Bottleneck: 26 Independent Async Data Fetchers

The analytics page renders 26 section components. Every single one follows the same pattern:

```tsx
// Pattern used by all 26 sections
export const XxxSection = async () => {
  const result = await getXxxData()  // creates client, calls getUser(), queries DB
  if (result.error) throw new Error(result.error)
  const Chart = dynamic(() => import('@/components/analytics/XxxChart').then(m => m.XxxChart))
  return <Chart data={result.data} />
}
```

Each section:
1. Creates a new Supabase client via `createClient()` — reads cookies
2. Calls `getUser()` → `getUserIfPresent()` — React.cache deduplicates within the same request, but each section creates its own client
3. Makes 1-4 Supabase queries, many hitting the same tables

### Count of Database Round-Trips

| Table | Sections Querying It |
|-------|---------------------|
| `user_global_stats` | ReadinessSection, ExamCountdownSection, PacingQuadrantSection, PacingInsightsSection, TimelineHeatmapSection, ExamOutcomeSection, AccuracyBySubjectSection, SimulationTrajectorySection, ProgressCardSection (~9) |
| `user_interactions` | PacingQuadrantSection, StaminaSection, TimelineHeatmapSection, AccuracyBySubjectSection, TimeSpentDistributionSection, ConfidenceCalibrationSection, StudyStreakCalendarSection, SessionHistorySection, PacingInsightsSection (~9) |
| `user_node_mastery` | WeakestTopicsSection, MemorySection, DifficultyMasterySection, CalibrationScoreSection (~4) |
| `readiness_score_snapshots` | ReadinessSection (2 queries: snapshots + stats) |
| `taxonomy_tree` | PacingQuadrantSection, TimelineHeatmapSection, AccuracyBySubjectSection, PacingInsightsSection, WeakestTopicsSection, MemorySection (~6, via `fetchTaxonomyNodeMap`) |
| `quiz_sessions` | StaminaSection, SessionHistorySection (~2) |
| `feature_flags` | (none directly, but DashboardLayoutContent queries this) |

**Estimated total: 40+ Supabase queries for a single cold page load.**

### Specific Problematic Queries

1. **`getPacingQuadrantData`** (line 197-249 in `analytics.ts`): Scans ALL `user_interactions` for the user with `time_spent_ms > 0` — no LIMIT clause. A power user with thousands of interactions triggers a full table scan, then processes in-memory.

2. **`getTimelineHeatmapData`** (line 443-554 in `analytics.ts`): Fetches 12 weeks of `user_interactions` (no LIMIT), plus `fetchTaxonomyNodeMap` for the entire discipline taxonomy. Does client-side week-bucketing in JavaScript.

3. **`getAccuracyBySubjectInternal`** (line 62-112 in `analytics-data.ts`): Fetches 90 days of interactions with `.limit(10000)`, plus `fetchTaxonomyNodeMap`.

4. **`fetchTaxonomyNodeMap`** — Used by 6+ sections. Despite `React.cache`, each section creates a fresh Supabase client, so cache misses because `cache()` keys on arguments (different client references). The function queries all non-deprecated taxonomy nodes for the discipline — potentially hundreds of rows.

5. **`getStaminaCurveData`** — Two parallel queries (`quiz_sessions` + `user_interactions`) both unfiltered by date, potentially scanning the user's entire history.

### Repeated Auth Overhead

Each of the 26 sections calls `getUser()` which internally calls `getUserIfPresent()`. Even though `getUserIfPresent` is wrapped in `React.cache`, the cache key is the function itself — and since each section creates a fresh `createClient()`, the `getUser()` call resolves to `supabase.auth.getUser()` which is a network call. The caching may not deduplicate across different client instances.

### Client-Side Hydration

Each section uses `next/dynamic` to lazy-load the visualization component (e.g., `ReadinessTrajectory`, `PacingQuadrant`, `StaminaCurve`, etc.). These are client components that render charts (likely Recharts or similar). With 26 dynamically imported chart components, the client receives ~26 separate JS chunks that need to be fetched, parsed, and hydrated.

### Additional Overhead

- `AnalyticsTabNav` is a client component using `usePathname()`
- `SharedPageLayout` renders `DottedGridOverlay` (CSS radial-gradient background)
- Each section is wrapped in `<AnalyticsChartContainer>` which adds `<Suspense>` + `<AnalyticsErrorBoundary>` — 26 Suspense boundaries and 26 error boundaries
- `force-dynamic` on page.tsx (line 29) prevents any static generation or ISR caching

### Summary: /dashboard/analytics

| Factor | Severity | Impact |
|--------|----------|--------|
| 26 independent async data fetchers | CRITICAL | N+1 query problem on steroids; 40+ DB round-trips |
| Repeated `user_interactions` full scans | CRITICAL | No LIMIT on several queries scanning entire history |
| `fetchTaxonomyNodeMap` called 6+ times | HIGH | Same taxonomy data fetched repeatedly |
| `getUser()` called 26 times | MEDIUM | React.cache may not dedupe across different clients |
| 26 dynamic chart imports | MEDIUM | Large JS payload with 26 separate chart chunks |
| `force-dynamic` | LOW | Prevents any caching |
| Parent layout overhead | MEDIUM | DashboardLayoutContent adds ~8 queries + 6 context providers |

---

## 2. /pricing — 46s p95

### Route Files

| File | Type | Notes |
|------|------|-------|
| `src/app/pricing/page.tsx` | Server Component | Orchestrator, no 'use client' |
| `src/app/pricing/pricing-content.tsx` | Client Component | 'use client', tracks analytics event |
| `src/app/pricing/loading.tsx` | Server Component | Simple skeleton |

### Primary Bottleneck: Triple Google Font Instantiation + SSR Auth

#### 1. Three Separate `Instrument_Serif` Font Instances

The `Instrument_Serif` Google Font is instantiated **three separate times** across the pricing route:

- `pricing-content.tsx` line 18-23: Creates `serif` instance
- `PricingCard.tsx` line 7-12: Creates a second `serif` instance
- `MarketingFooter.tsx` line 6-11: Creates a third `serif` instance

Each `Instrument_Serif({ weight: '400', subsets: ['latin'], style: ['normal', 'italic'], display: 'swap' })` call generates a separate Google Fonts CSS request and downloads the font files independently. This means 3 separate CSS files, 3 separate font downloads, and 3 separate `@font-face` declarations for the same font.

This is NOT deduplicated by Next.js because each `next/font/google` call in a separate module generates its own CSS.

#### 2. Server-Side Auth in MarketingNav

`MarketingNav` is an async server component that calls:
```tsx
const { data: { user } } = await getUserIfPresent()
```

This creates a Supabase client, reads cookies via `await cookies()`, and calls `supabase.auth.getUser()` — a network request to Supabase on every cold page load. This blocks the entire page render because `MarketingNav` is rendered synchronously in `page.tsx` (not in a Suspense boundary).

#### 3. No Suspense or Code Splitting

The pricing page has NO Suspense boundaries for any of its marketing sections:
- `FaqSection` — client component with `Accordion` UI
- `FinalCtaSection` — client component with `ScrollReveal` motion animations
- `PricingContent` — client component with `Tabs` UI and analytics tracking

Everything is rendered eagerly. On a cold load, the server must resolve `MarketingNav` (the only async component), then ship the entire page HTML + all client component JS in one payload.

#### 4. Heavy Icon Imports

- `PricingCard.tsx` imports `CheckCircle` and `XCircle` from `@phosphor-icons/react/dist/ssr`
- `FinalCtaSection.tsx` imports `ScrollReveal` from `@/components/motion/ScrollReveal`
- `SCIcon` wrapper from `@/components/graphics/icons/Icon`

Each phosphor SSR icon is a full SVG React component bundled into the page.

#### 5. No Data Fetching (Minimal Server Work)

Ironically, the pricing page does very little server-side work (just the `MarketingNav` auth check). The 46s p95 suggests the issue might be:
- Cold-start latency affecting the entire app (Vercel/Next.js cold boot)
- The Supabase auth call in `MarketingNav` timing out or being slow
- Font loading cascade delaying LCP/TTFB

### Summary: /pricing

| Factor | Severity | Impact |
|--------|----------|--------|
| Triple `Instrument_Serif` font instantiation | CRITICAL | 3 separate Google Fonts requests, blocks rendering |
| `MarketingNav` SSR auth call | HIGH | Blocks entire page; cold Supabase call adds latency |
| No Suspense boundaries | MEDIUM | All sections render synchronously; no streaming |
| No code splitting for marketing components | MEDIUM | Full JS payload for FaqSection, FinalCtaSection, PricingContent |
| Phosphor SSR icons | LOW | Adds to JS bundle size |

---

## 3. /dashboard/3d-lab — 38s p95

### Route Files

| File | Type | Notes |
|------|------|-------|
| `src/app/dashboard/3d-lab/page.tsx` | Async Server Component | Auth gate + Suspense wrapper |
| `src/app/dashboard/3d-lab/layout.tsx` | Client Component | Minimal wrapper, no canvas |
| `src/app/dashboard/3d-lab/loading.tsx` | Server Component | Simple skeleton |
| `src/app/dashboard/3d-lab/error.tsx` | (not shown) | Error boundary |
| `src/app/dashboard/3d-lab/[moduleId]/page.tsx` | Async Server Component | Module detail (entitlement check + ModuleViewer) |

### Primary Bottleneck: Entitlement Check + Massive Module Registry

#### 1. `getViewerEntitlements()` — 4 Parallel Supabase Queries

The 3D Lab index page calls `getViewerEntitlements([threeDLabFull])` which runs:

```tsx
// From get-viewer-entitlements.ts
const [profileResult, roleRowsResult, subscriptionResult, featureFlagsResult] =
  await Promise.all([
    supabase.from('profiles').select('role').eq('id', user.id).maybeSingle(),
    supabase.from('user_roles').select('role').eq('user_id', user.id).order('created_at'),
    supabase.from('user_subscriptions').select('tier, status').eq('user_id', user.id).maybeSingle(),
    supabase.from('feature_flags').select('key, enabled, target_tier'),
  ])
```

Plus `resolveDevOverrides()`, `normalizeTierValue()`, `normalizeFeatureFlagRecord()`, and `evaluateFeatureAccess()`. All of this happens before the page can render anything.

**This same check happens AGAIN in the parent `DashboardLayoutContent`** (line 86: `getViewerEntitlements([ENTITLEMENT_FEATURE_KEYS.devToolbar])`). While `React.cache` deduplicates these, the first caller still incurs the full cost.

For the `[moduleId]` detail page, the same `getViewerEntitlements([threeDLabFull])` call is repeated.

#### 2. `ALL_MODULES` — 2,218 Lines of Synchronously Imported Data

`LabBrowser` imports `ALL_MODULES` from `@/features/3d-lab/config/registry`, which merges 16 category files:

```
cat-01.ts through cat-16.ts = 2,218 total lines
```

Each module entry is a metadata object (id, title, templateType, subject, categoryId, launchPhase, status, description). All 2,218 lines are imported synchronously and bundled into the client-side JS. `LabBrowser` is a client component, so this entire registry is sent to the browser.

`LabBrowser` also imports:
- `ASSET_TAXONOMY` — 16 category definitions
- `DASHBOARD_VISIBLE_IDS` — filter set
- `CategoryGrid`, `ModuleList`, `ModuleCard` — client UI components

#### 3. Module Detail: Dynamic Import of 3D Configs

On `[moduleId]/page.tsx`, after the entitlement check passes, `ModuleViewer` performs:
```tsx
importModuleConfig(modelId)
// → import(`@/features/3d-lab/config/modules/${folder}/${moduleId}`)
```

This dynamically imports a module config file containing 3D model URLs (`modelUrl`, `modelSizeMB`), camera positions, hotspots, questions, and template parameters. These config files can be large and the dynamic import adds latency on first load.

#### 4. WebGL/Three.js Initialization

`ModuleViewer` renders `LabViewport` inside `LabViewportFrame`, which initializes a Three.js WebGL canvas. The `LabViewport` component (not fully shown but referenced) handles 3D model loading, camera controls, and hotspot interactions. Three.js is a large library (~500KB+ gzipped), and WebGL context initialization is expensive on cold starts.

#### 5. Telemetry and Stores

- `useLabTelemetry({ moduleSlug: modelId })` — fires analytics on module view
- `useLabStore` (Zustand) — manages 3D lab session state
- `useTemplateContent(modelId, config)` — resolves template-driven content

#### 6. Parent Layout Shared Overhead

The 3D Lab routes inherit `DashboardLayoutContent` which, even for lab paths (`isLabPath`), still:
- Creates Supabase client + calls `getUser()`
- Calls `bootstrapUser(user.id)` (database mutation)
- Calls `getViewerEntitlements([devToolbar])` (4 Supabase queries)
- Renders `DevToolbar` and `DevKeyboardProvider` if dev mode

However, lab paths skip: subscription query, global stats query, profiles query, disciplines query, onboarding guard, sidebar, navbar, and context providers. This is a significant optimization but the entitlement check + bootstrap remain.

### Summary: /dashboard/3d-lab

| Factor | Severity | Impact |
|--------|----------|--------|
| `getViewerEntitlements` (4 parallel DB queries) | CRITICAL | Blocks page render; runs on both index and detail |
| Parent layout entitlement check (duplicated) | HIGH | Same 4 queries run in parent layout |
| `ALL_MODULES` 2,218-line registry in client bundle | HIGH | Large synchronous import; all modules sent to browser |
| Dynamic import of 3D module configs | MEDIUM | Adds latency on first module detail load |
| Three.js / WebGL initialization | MEDIUM | Large library + expensive GPU context creation |
| `bootstrapUser()` on every request | MEDIUM | Database write on every cold page load |
| `useLabTelemetry` + `useLabStore` | LOW | Client-side analytics + state management |

---

## Cross-Route Patterns and Systemic Issues

### 1. Per-Component Supabase Client Creation

The analytics route's 26 sections each create their own `createClient()` → reads `cookies()` → creates a `createServerClient` from `@supabase/ssr`. This pattern means even `React.cache`-wrapped helpers like `getUserIfPresent` and `fetchTaxonomyNodeMap` can't fully deduplicate because they receive different Supabase client instances.

### 2. Repeated `getUser()` Calls

Across all three routes, `getUser()` is called multiple times per request:
- DashboardLayoutContent calls it once
- Each analytics section calls it once (26 times for analytics)
- 3D Lab page calls it via `getViewerEntitlements`
- Pricing calls it via `MarketingNav`

While `React.cache` partially mitigates this, different Supabase client instances may result in cache misses.

### 3. No Data Dependency Graph / No Batching

The analytics page makes no attempt to batch queries. There's no single "analytics page data" endpoint — instead, 26 separate sections each fetch independently. This is architecturally clean but catastrophically slow.

### 4. Missing Suspense Boundaries at Strategic Levels

- `/pricing` has NO Suspense boundaries at all
- `/dashboard/analytics` has Suspense at the individual chart level (26 boundaries) but the initial server render still waits for all 26 data fetchers
- `/dashboard/3d-lab` has one Suspense for `LabBrowser` but the entitlement check blocks before reaching it

### 5. No `loading.tsx` Streaming for Data-Fetching Routes

The analytics `loading.tsx` provides skeleton UI, but since the page component is a server component returning 26 async children, Next.js waits for ALL of them to resolve before sending any HTML. Streaming would require wrapping each section in its own Suspense boundary (which `AnalyticsChartContainer` does), but the initial TTFB is still high because the page component itself must render first.

---

## Recommendations (Non-Refactoring Analysis Only)

*Note: Per task instructions, no files are modified. These are observations only.*

### /dashboard/analytics
1. Create a single "analytics page data" server action that fetches all section data in one call with batched queries
2. Add `LIMIT` to all `user_interactions` queries that currently scan unlimited rows
3. Use a shared Supabase client instance across all sections (session-level singleton)
4. Consider wrapping groups of sections in fewer, coarser Suspense boundaries
5. Remove `force-dynamic` and use ISR with appropriate revalidation

### /pricing
1. Create a shared `Instrument_Serif` font instance in a layout or shared module
2. Wrap `MarketingNav` in a Suspense boundary so the auth call doesn't block the page
3. Lazy-load `FaqSection`, `FinalCtaSection`, and `PricingCard` with `next/dynamic`
4. Consider making `pricing-content.tsx` a server component (it tracks analytics in `useEffect` but that could be moved)

### /dashboard/3d-lab
1. Split `ALL_MODULES` into lazy-loaded chunks per category
2. Cache the entitlement check result more aggressively (currently only `React.cache` per-request)
3. Remove `bootstrapUser()` from the hot path or make it a no-op when user is already bootstrapped
4. Preload module configs for visible/featured modules
5. Use `next/dynamic` with `ssr: false` for Three.js components to avoid server-side WebGL overhead
