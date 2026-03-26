# Phase 5: Performance & Bundle Audit

**Date:** 2026-03-25
**Codebase:** SlateCamp (Next.js 16.1.6, React 19.2.4, Tailwind CSS 4)
**Scope:** Render waterfalls, bundle bloat, missing optimizations, performance issues

---

## Performance Scorecard

| Category | Score | Key Finding |
|----------|-------|-------------|
| Image optimization | **CLEAN** | Only 7 images in `public/`, largest 20KB. Zero `next/image` usage but also zero raw `<img>` tags (1 total in AssetList). Not image-heavy. |
| Code splitting | **NEEDS_WORK** | 10 `next/dynamic` imports vs 371 client components (2.7%). Heavy deps like Three.js, TipTap loaded statically in some paths. |
| Suspense coverage | **CLEAN** | 15 files use `<Suspense>`. Analytics page is exemplary (8 independent Suspense boundaries). CEO dashboard also well-structured. |
| Loading state coverage | **CLEAN** | 87 loading.tsx for 105 page.tsx (83%). 18 pages missing loading.tsx are mostly static/lightweight (about, contact, pricing, tools). |
| Data fetching efficiency | **NEEDS_WORK** | Testing hub has 7 sequential awaits with no `Promise.all`. Several other pages have 3-6 sequential awaits. |
| Bundle hygiene | **NEEDS_WORK** | 4 font families loaded globally. Dual icon libraries (Phosphor 108 files + Lucide 45 files). `@shadergradient/react` pulls in Three.js for a single gradient component. |
| Console pollution | **CLEAN** | 108 console statements across 56 files. Heaviest: `lib/actions/wiki-actions.ts` (10), `lib/actions/testing.ts` (8). Most are in server actions (acceptable for debugging). |
| Font loading | **NEEDS_WORK** | 4 font families loaded in root layout (Inter, Syne, DM_Mono, GeistSans). All use `display: 'swap'` (good). But 4 fonts = 4 network requests on first load. |
| 3D/R3F performance | **CLEAN** | CanvasWrapper uses `frameloop="demand"` + `dpr={[1, 1.5]}` (excellent). LabViewport uses `next/dynamic` with `ssr: false` for all scene components. Workspace has Suspense + error boundary. |
| Quiz session performance | **CLEAN** | Auto-save uses 10-second `setInterval` (mandated). Timer uses `setInterval` (appropriate for 1s ticks). LocalStorage fallback for offline. `beforeunload` handler for safety. |
| Chart/analytics performance | **CLEAN** | Analytics page uses per-section Suspense with skeletons. ReadinessSection uses `next/dynamic` for chart component. Each section fetches data independently. |
| Wiki widget performance | **CLEAN** | Widget registry uses per-widget dynamic `import()`. `detectWidgets()` scans content strings, loads only needed widgets via `Promise.all`. |

---

## 1. Next.js Configuration Analysis

**File:** `next.config.ts`

### What's configured:
- `images.remotePatterns` for Supabase and Google (correct)
- `experimental.serverActions.bodySizeLimit: '4mb'`
- `serverExternalPackages: ['payrex-node']`
- `turbopack.root: __dirname`
- `allowedDevOrigins` for localhost

### What's missing:
- **No bundle analyzer configured** -- no `@next/bundle-analyzer` in devDependencies or config
- **No `output` setting** -- not configured for standalone/export
- **No `compress` setting** -- relying on defaults
- **No `images.formats`** -- not enabling AVIF alongside WebP
- **No `modularizeImports`** -- could help with Phosphor/Lucide icon tree-shaking

---

## 2. Image Optimization

| Metric | Value |
|--------|-------|
| `next/image` imports | **0** |
| Raw `<img>` tags | **1** (in `AssetList.tsx` -- admin-only, acceptable) |
| Images in `public/` | **7 files** |
| Largest image | `noise.png` at 20KB |

**Assessment:** The app is not image-heavy. Images appear to be served from Supabase storage (remote patterns configured). The single `<img>` tag is in an admin asset preview -- low priority.

---

## 3. Code Splitting / Dynamic Imports

### Dynamic imports found (10 files):

| File | What's dynamically imported |
|------|-----------------------------|
| `components/admin/AdminMDXEditorLoader.tsx` | AdminMDXEditor (ssr: false) |
| `components/notes/NotesShell.tsx` | Notes editor component |
| `components/notes/QuickCaptureDrawer.tsx` | Capture drawer |
| `components/analytics/StaminaSection.tsx` | Chart component |
| `components/analytics/PacingQuadrantSection.tsx` | Chart component |
| `components/analytics/RadarSection.tsx` | Chart component |
| `components/analytics/ReadinessSection.tsx` | ReadinessTrajectory chart |
| `components/3d/Workspace.tsx` | (has `dynamic` import but also static Canvas import) |
| `app/dashboard/3d-lab/_components/LabViewport.tsx` | 7 scene components (all ssr: false) |
| `developer/design-system/widgets/_widget-previews.tsx` | Widget previews |

### React.lazy usage: **0**

### Ratio: 10 dynamic imports / 371 client components = **2.7%**

### Components that SHOULD be dynamically imported but are NOT:

1. **`components/3d/Workspace.tsx`** -- Imports `Canvas` from `@react-three/fiber` statically at top level. While LabViewport loads Workspace via `next/dynamic`, the Workspace file itself eagerly imports `Canvas`, `OrbitControls`, `Html`, `Float`, `ContactShadows`, `Environment` from drei, `GLTFLoader` from three, and `framer-motion`. If any code path imports Workspace directly, the entire Three.js bundle loads.

2. **`components/notes/NotesEditor.tsx`** and **`components/notes/NoteEditor.tsx`** -- Import 10+ TipTap extensions statically. TipTap's starter-kit + 10 extensions is ~150KB+ minified. The NotesShell does lazy-load via `next/dynamic`, but the editor file itself is not split.

3. **`components/dashboard/GradientImage.tsx`** -- Imports `@shadergradient/react` which bundles its own Three.js renderer. This component appears to be used on the dashboard but is not dynamically imported. `@shadergradient/react` is estimated at ~200KB+ because it includes a full Three.js shader pipeline.

4. **`components/ceo/ExpenseBreakdownChart.tsx`** and **`components/ceo/DepartmentCostChart.tsx`** -- Import `recharts` statically (PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer). These are only used on CEO pages but not lazy-loaded.

5. **`app/dashboard/3d-lab/_scenes/NBCPEnvelope/NBCPEnvelope.tsx`** -- Imports `Canvas` from `@react-three/fiber` directly (a third file importing Canvas besides Workspace and CanvasWrapper).

---

## 4. Suspense Boundaries

### Usage (15 files):

| File | Purpose |
|------|---------|
| `app/page.tsx` | Landing page sections |
| `app/dashboard/page.tsx` | HeatmapSection |
| `app/dashboard/analytics/page.tsx` | **8 independent Suspense boundaries** (exemplary) |
| `app/dashboard/testing/page.tsx` | ReviewHub wrapper |
| `app/dashboard/wiki/layout.tsx` | Wiki layout |
| `app/dashboard/wiki/[slug]/page.tsx` | WikiHeader |
| `app/dashboard/layout.tsx` | Dashboard layout |
| `app/(protected)/ceo/page.tsx` | **4 Suspense boundaries** (well-structured) |
| `app/(auth)/login/login-form.tsx` | Login form |
| `components/wiki/WikiArticle.tsx` | Article content |
| `components/wiki/WikiLayoutContent.tsx` | Wiki layout content |
| `components/3d/Workspace.tsx` | 3D scene + loading overlay |
| `app/dashboard/3d-lab/_components/CanvasWrapper.tsx` | Canvas inner content |
| `app/dashboard/3d-lab/_scenes/NBCPEnvelope/NBCPEnvelope.tsx` | NBCP scene |
| `app/dashboard/AGENTS.md` | Documentation reference only |

### Missing Suspense for data-heavy pages:
- `app/dashboard/testing/session/[sessionId]/debrief/page.tsx` -- 6 sequential awaits, no Suspense
- `app/dashboard/score-reveal/page.tsx` -- 6 sequential awaits, no Suspense
- `app/dashboard/welcome-pro/page.tsx` -- 5 sequential awaits, no Suspense

---

## 5. Loading State Coverage

| Metric | Value |
|--------|-------|
| `page.tsx` files | 105 |
| `loading.tsx` files | 87 |
| Coverage | **83%** |
| Skeleton usage in loading files | 494 occurrences across 66 files |

### Pages WITHOUT loading.tsx (18):

| Path | Risk |
|------|------|
| `app/page.tsx` (root) | LOW -- landing page, mostly static |
| `app/about/page.tsx` | LOW -- static |
| `app/contact/page.tsx` | LOW -- static |
| `app/pricing/page.tsx` | LOW -- static |
| `app/try/page.tsx` | LOW -- static |
| `app/tools/page.tsx` | LOW -- index |
| `app/tools/lot-plotter/page.tsx` | LOW -- client tool |
| `app/tools/wall-paint-calculator/page.tsx` | LOW -- client tool |
| `app/admin/page.tsx` | LOW -- redirect |
| `app/admin/login/page.tsx` | LOW -- simple form |
| `app/(protected)/ceo/financials/page.tsx` | **MEDIUM** -- fetches financial data |
| `app/(protected)/ceo/insights/page.tsx` | **MEDIUM** -- fetches insights data |
| `app/(protected)/ceo/team/page.tsx` | **MEDIUM** -- fetches team data |
| `app/dashboard/camptrails/[slug]/day/[dayNumber]/complete/page.tsx` | MEDIUM |
| `app/dashboard/testing/simulation/[sessionId]/results/page.tsx` | **HIGH** -- 6 sequential awaits |
| `app/dashboard/trails/[slug]/day/[dayNumber]/page.tsx` | MEDIUM |
| `app/developer/design-system/content-blocks/page.tsx` | LOW |
| `app/developer/design-system/widgets/page.tsx` | LOW |

---

## 6. Render Waterfall Detection

### CRITICAL: Pages with sequential awaits and NO Promise.all

| Page | Sequential Awaits | Has Promise.all | Risk |
|------|-------------------|-----------------|------|
| **`dashboard/testing/page.tsx`** | **8** | NO | **CRITICAL** -- 7 separate Supabase queries run one after another |
| **`dashboard/testing/session/[sessionId]/debrief/page.tsx`** | **6** | NO | **CRITICAL** -- fetches session, interactions, snapshots, mastery sequentially |
| **`dashboard/score-reveal/page.tsx`** | **6** | NO | **HIGH** -- getUser, getResults, checkAccess, createClient, stats, recommendTrail |
| **`dashboard/testing/session/[sessionId]/page.tsx`** | **6** | NO | **HIGH** -- params, createClient, getUser, session, questions, interactions |
| **`dashboard/welcome-pro/page.tsx`** | **5** | NO | **HIGH** -- getUser, isPaidUser, createClient, stats, masteryNodes |
| **`dashboard/assessment/page.tsx`** | **4** | NO | **MEDIUM** -- getUser, hasCompleted, createClient+stats, getQuestions |
| **`(protected)/ceo/financials/page.tsx`** | **3** | NO | **MEDIUM** -- verifyCeoAccess, entries, cashEntry |
| **`dashboard/testing/simulation/[sessionId]/results/page.tsx`** | **6** | NO | **HIGH** -- params, createClient, getUser, session, stats, interactions |
| **`(auth)/onboarding/page.tsx`** | **7** | NO | **MEDIUM** -- sequential auth + data fetches |

### GOOD: Pages with Promise.all (11 files):

- `dashboard/wiki/[slug]/page.tsx` -- 5-way `Promise.all` for secondary data (well done)
- `dashboard/notes/page.tsx` -- `Promise.all` for notes + folders
- `(protected)/ceo/page.tsx` -- async server components with Suspense (correct pattern)
- `admin/content/[id]/page.tsx` -- two rounds of `Promise.all`
- `admin/page.tsx` -- `Promise.all` for dashboard data
- `dashboard/camptrails/` pages -- `Promise.all` for trail data

---

## 7. Console Statement Pollution

| Metric | Value |
|--------|-------|
| Total console statements | **108** |
| Files with console statements | **56** |

### Top offenders:

| File | Count | Type |
|------|-------|------|
| `lib/actions/wiki-actions.ts` | 10 | Server action error logging |
| `lib/actions/testing.ts` | 8 | Server action error logging |
| `lib/actions/streak.ts` | 5 | Server action error logging |
| `lib/actions/wiki.ts` | 5 | Server action error logging |
| `lib/supabase/bootstrap.ts` | 4 | Bootstrap debugging |
| `lib/srs/update.test.ts` | 4 | Test file (acceptable) |
| `lib/actions/analytics.ts` | 3 | Error logging |
| `lib/actions/quiz.ts` | 3 | Error logging |
| `lib/actions/wiki-bookmarks.ts` | 3 | Error logging |
| `lib/actions/admin/coverage.ts` | 3 | Error logging |
| `lib/actions/admin/content.ts` | 3 | Error logging |

**Assessment:** Most console statements are in server actions for error logging. This is acceptable for development but should be replaced with a structured logger (e.g., `pino`) before production. Client-side console pollution is minimal.

---

## 8. Heavy Dependency Analysis

### Bundle Impact Estimate (Top 10)

| Dependency | Est. Size (min+gz) | Usage | Tree-Shakeable | Notes |
|------------|-------------------|-------|----------------|-------|
| `three` + `@react-three/fiber` + `@react-three/drei` | ~180KB | 17 files (3D lab only) | Partially | drei imports are granular (good). Canvas imported in 3 files. |
| `@shadergradient/react` | ~200KB+ | **1 file** (`GradientImage.tsx`) | NO | Bundles its own Three.js shader pipeline. Extreme cost for one gradient. |
| `@tiptap/*` (12 packages) | ~150KB | 2 files (notes editors) | Partially | 12 TipTap packages for notes. Loaded via NotesShell dynamic import (mitigated). |
| `recharts` | ~90KB | 3 files (CEO charts + AGENTS.md ref) | Partially | Only used in CEO dashboard. Not dynamically imported. |
| `framer-motion` | ~60KB | 13 files | YES | Used for animations. Imports are per-module (motion, AnimatePresence). |
| `@phosphor-icons/react` | ~40KB | 108 files | YES | Tree-shakeable, individual icon imports. |
| `next-mdx-remote` | ~30KB | 1 file (WikiArticle) | N/A | Server-only RSC rendering. No client bundle impact. |
| `katex` + `rehype-katex` + `remark-math` | ~25KB | 0 direct imports (used via MDX pipeline) | N/A | Only loaded when MDX articles contain math. |
| `lucide-react` | ~20KB | 45 files | YES | Tree-shakeable. But redundant with Phosphor icons. |
| `date-fns` | ~10KB | Used via imports | YES | Tree-shakeable, only pulls used functions. |

### Bloat Risks:

1. **`@shadergradient/react`** (est. ~200KB+) is used in exactly **1 component** (`GradientImage.tsx`) which renders a decorative gradient on the dashboard. This single dependency likely adds more to the bundle than all of framer-motion. It should either be dynamically imported or replaced with a CSS gradient.

2. **Dual icon libraries:** Phosphor Icons (108 imports) and Lucide React (45 imports). Both are tree-shakeable, but having two icon libraries means:
   - Two separate icon rendering engines in the bundle
   - Cognitive overhead for developers choosing which to use
   - Estimated combined cost: ~60KB

3. **4 font families in root layout:** Inter, Syne, DM_Mono, GeistSans. All loaded globally via `next/font/google`. GeistSans is imported from the `geist` package (only used in root layout for the CSS variable). Each font adds a network request and layout shift risk.

### Dependencies NOT found (good):
- No `moment.js` -- uses `date-fns` instead
- No `lodash` -- no lodash imports at all
- No `axios` -- uses native fetch
- No `jquery`
- No `chart.js` -- uses `recharts` only

---

## 9. Font Loading

| Font | Source | Weights | Used In |
|------|--------|---------|---------|
| Inter | `next/font/google` | Default (variable) | Body text (`--font-inter`) |
| Syne | `next/font/google` | 400, 700, 800 | Headlines (`--font-syne`) |
| DM_Mono | `next/font/google` | 400, 500 (normal + italic) | Monospace (`--font-dm-mono`) |
| GeistSans | `geist` npm package | Variable | CSS variable only (`--font-geist-sans`) |

**Issues:**
- All 4 fonts use `display: 'swap'` (correct for preventing FOIT)
- `GeistSans` is loaded from an npm package, not `next/font/google` -- different loading mechanism
- 4 fonts = 4 font files to download on first visit
- DM_Mono loads 4 variants (400 normal, 400 italic, 500 normal, 500 italic) -- likely only 400 normal is commonly used

---

## 10. Quiz Session Performance

**File:** `src/hooks/quiz/useQuizPersistence.ts`

| Feature | Implementation | Assessment |
|---------|---------------|------------|
| Auto-save interval | `setInterval` at 10,000ms | CLEAN -- mandated by CLAUDE.md |
| LocalStorage fallback | Sync write on every interval + `beforeunload` | CLEAN |
| Online/offline detection | `window.addEventListener('online'/'offline')` | CLEAN |
| Offline queue | `pendingInteractions` ref with flush-on-reconnect | CLEAN |
| DB write | Server action `updateQuizSession` inside interval | CLEAN -- only updates `current_question_index` |

**File:** `src/hooks/quiz/useQuizTimer.ts`

| Feature | Implementation | Assessment |
|---------|---------------|------------|
| Countdown timer | `setInterval` at 1000ms | CLEAN -- appropriate for 1s ticks |
| Dwell timer | Separate `setInterval` with cleanup | CLEAN |
| Question timing | `Date.now()` ref-based (no interval) | CLEAN -- zero overhead |
| Pace calculation | `useMemo` derived from countdown + index | CLEAN |

**Missing:** No list virtualization for large question sets. If a session has 100+ questions, the QuestionMap component renders all dots/items. Consider `@tanstack/react-virtual` for the question navigator.

---

## 11. Wiki Article Performance

| Feature | Implementation | Assessment |
|---------|---------------|------------|
| MDX rendering | `next-mdx-remote/rsc` (server-side) | CLEAN -- no client bundle for MDX parsing |
| Widget loading | Registry with `detectWidgets()` + per-widget `import()` | **EXCELLENT** -- only loads widgets present in content |
| Widget resolution | `Promise.all` for all detected widgets | CLEAN -- parallel loading |
| Content caching | Relies on Next.js server component caching | CLEAN |
| Data fetching | `Promise.all` for 5 parallel fetches | CLEAN |

The wiki widget system is one of the best-architected parts of the codebase.

---

## 12. Analytics Dashboard Performance

**File:** `src/app/dashboard/analytics/page.tsx`

| Feature | Implementation | Assessment |
|---------|---------------|------------|
| Chart components | 4 of 5 sections use `next/dynamic` | CLEAN |
| Data fetching | Each section is an async server component | **EXCELLENT** -- independent streaming |
| Suspense | 8 independent Suspense boundaries with ChartSkeleton | **EXCELLENT** |
| Skeleton coverage | Custom `ChartSkeleton` with configurable height | CLEAN |

This is the gold standard for how data-heavy pages should be structured.

---

## 13. Tailwind CSS Configuration

**File:** `tailwind.config.ts`

```
content: [
  './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
  './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  './src/app/**/*.{js,ts,jsx,tsx,mdx}',
]
```

**Assessment:** Content paths are correctly configured. Tailwind v4 handles purging automatically via the CSS-first config. The `@tailwindcss/typography` plugin is included. No unused CSS risk detected.

**Note:** Tailwind v4 uses CSS-first config (`@theme` in `globals.css`), making the `tailwind.config.ts` file partially redundant. The content paths are still needed for class detection.

---

## Top 5 Performance Bottlenecks

### 1. CRITICAL: Testing Hub Waterfall (7 sequential DB queries)

**File:** `src/app/dashboard/testing/page.tsx`
**Impact:** Every visit to the testing hub runs 7 Supabase queries sequentially: user auth, subscription tier, sessions (limit 200), global stats, blindspot queues, profile, and weak nodes. Estimated penalty: 700-1400ms of sequential network time.

**Fix:** Wrap the 5 independent queries (subscription, sessions, stats, blindspot, profile + weakNodes) in a single `Promise.all`:
```typescript
const [subscription, sessions, stats, blindspotQueues, profile, weakNodes] = await Promise.all([
  supabase.from('user_subscriptions')...,
  supabase.from('quiz_sessions')...,
  supabase.from('user_global_stats')...,
  supabase.from('blindspot_queues')...,
  supabase.from('profiles')...,
  supabase.from('user_node_mastery')...,
])
```

### 2. HIGH: `@shadergradient/react` for a single decorative gradient

**File:** `src/components/dashboard/GradientImage.tsx`
**Impact:** This npm package bundles a full Three.js WebGL shader pipeline (~200KB+) to render a single decorative gradient on what appears to be the dashboard. The component creates a `ShaderGradientCanvas` (a full WebGL context) for aesthetics.

**Fix options:**
- (a) Replace with a CSS gradient (`background: linear-gradient(...)` or `@property` animated gradient) -- zero JS cost
- (b) Replace with a static image or SVG gradient
- (c) At minimum, wrap in `next/dynamic` with `ssr: false` so it only loads on the client when visible

### 3. HIGH: Debrief & Score Reveal waterfalls (6 sequential awaits each)

**Files:**
- `src/app/dashboard/testing/session/[sessionId]/debrief/page.tsx` (6 awaits)
- `src/app/dashboard/score-reveal/page.tsx` (6 awaits)
- `src/app/dashboard/testing/simulation/[sessionId]/results/page.tsx` (6 awaits)

**Impact:** These are high-traffic pages (every completed quiz session visits debrief). Estimated sequential penalty: 600-1200ms.

**Fix:** Group independent fetches. For debrief, after fetching the session (required first), the interactions, snapshots, and mastery data can be fetched in parallel:
```typescript
const [interactions, snapshots] = await Promise.all([
  supabase.from('user_interactions')...,
  supabase.from('readiness_score_snapshots')...,
])
// Then mastery (depends on interactions for topicIds)
```

### 4. MEDIUM: 4 font families loaded globally

**File:** `src/app/layout.tsx`
**Impact:** 4 separate font downloads on first page load. GeistSans is loaded from npm (different loading path). DM_Mono loads 4 weight/style variants. Estimated penalty: 200-400ms first load on slow connections.

**Fix options:**
- Remove GeistSans if it's not actively used (only imported in root layout, unclear if referenced in CSS)
- Reduce DM_Mono to single weight (400 normal only)
- Consider if Syne can be deferred to pages that use it (hero headlines only)

### 5. MEDIUM: Dual icon libraries (Phosphor + Lucide)

**Files:** 108 files import Phosphor, 45 files import Lucide
**Impact:** Two separate icon rendering engines. While both tree-shake, having two means: two runtime implementations (~20KB overhead), developer confusion about which to use, inconsistent icon styling.

**Fix:** Standardize on one library. Phosphor is more widely used (108 vs 45 files). Migrate Lucide usages to Phosphor equivalents. This is a longer-term cleanup task.

---

## Summary Statistics

| Metric | Value |
|--------|-------|
| Client components (`'use client'`) | 371 `.tsx` files |
| Dynamic imports (`next/dynamic`) | 10 files |
| Code splitting ratio | 2.7% |
| Suspense boundaries | 15 files |
| Loading.tsx coverage | 87/105 (83%) |
| Console statements | 108 across 56 files |
| Sequential await waterfalls (>2) | 9 pages |
| Pages using Promise.all | 11 pages |
| Font families loaded | 4 |
| Icon libraries | 2 (Phosphor: 108 files, Lucide: 45 files) |
| Three.js Canvas instances | 3 files (Workspace, CanvasWrapper, NBCPEnvelope) |
| Widget dynamic imports (registry) | 17 widgets, all lazy-loaded |
| TipTap extensions | 12 packages, loaded in 2 editor files |

---

## Architecture Highlights (What's Done Well)

1. **Analytics page** -- Gold standard Suspense architecture. 8 independent boundaries, each with async server components and skeleton fallbacks.
2. **Wiki widget registry** -- Intelligent content-aware lazy loading. Scans MDX for widget tags, loads only what's needed via `Promise.all`.
3. **3D Lab CanvasWrapper** -- Uses `frameloop="demand"` for zero-waste GPU rendering. `dpr` capped at 1.5. All scenes dynamically imported with `ssr: false`.
4. **LabViewport routing** -- Clean module registry pattern with per-module code splitting via dynamic imports keyed by moduleId.
5. **CEO dashboard** -- Proper use of async server components wrapped in Suspense with custom skeletons.
6. **Quiz persistence** -- Robust offline-first design with LocalStorage sync, server action auto-save, and reconnection queue.
7. **No bloat dependencies** -- No moment.js, no lodash, no axios, no jQuery. Uses date-fns, native fetch, and Zod.
8. **Loading.tsx skeleton coverage** -- 494 Skeleton usages across 66 loading files. Rich, content-aware loading states.
