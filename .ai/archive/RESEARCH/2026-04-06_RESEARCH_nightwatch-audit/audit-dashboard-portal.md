# MASTER ARCHITECTURE BLUEPRINT: DASHBOARD PORTAL
**Status:** UNIFIED (Panopticon V8)

## 1. Executive Vulnerability Summary
1. **CRITICAL: Cascading Fetch Failure:** The root dashboard (`page.tsx`) uses `Promise.all` for 7+ parallel data fetches (Hero stats, Heatmap, Streak, Activity, etc.). If any single query fails, the entire dashboard crashes with no fallback.
2. **HIGH: Context Prop Drilling & Hydration Shift:** Dashboard Layout mounts 5 separate context providers (`Tier`, `Discipline`, `ActiveSession`, `Note`, `Breadcrumb`). If a sub-route (e.g., `/dashboard/3d-lab`) bypasses the main layout, critical session and capability state is lost, causing silent UI failures.
3. **MEDIUM: 3D Lab Dependency Bloat:** 3D Lab components (`@react-three/fiber`, `Three.js`) are not dynamically imported at the dashboard route level, potentially adding ~500KB of unoptimized JS to the main dashboard bundle for all users.

## 2. Exhaustive System Inventory

### 2.1 Route Registry (`src/app/dashboard/`)
- **Core:** `/dashboard` (landing), `/dashboard/testing` (quiz hub).
- **Sub-Portals:**
    - `/dashboard/3d-lab`: R3F module gallery + viewport.
    - `/dashboard/analytics`: Recharts-based performance tracking.
    - `/dashboard/wiki`: MDX-based knowledge base.
    - `/dashboard/notes`: Tiptap-based user notes.
    - `/dashboard/settings`: Account/Discipline configuration.
- **Dynamic Routing:** `session/[sessionId]`, `simulation/[sessionId]`, `wiki/[slug]`, `3d-lab/[moduleId]`.

### 2.2 Dashboard Component Tree
```
DashboardPage (Server Component)
├── SharedPageLayout (wrapper)
│   └── DashboardAnalyticsSync (client)
├── HeroCommandBarServer (Suspense)
│   └── ReadinessScoreRing (SVG)
│   └── HeatmapSection (TaxonomyHeatmap grid)
├── Content Grid (grid-cols-1 md:grid-cols-4)
│   ├── ReviewCalendarServer (lg:col-span-3)
│   ├── ActivityFeedServer (lg:row-span-2)
│   ├── DailyWikiServer
│   ├── SubjectMasteryServer (Mastery bars)
│   └── BloomTrackerServer (Cognitive level)
```

## 3. Data Flow & Exact Payloads

### 3.1 Parallel Data Fetching (`page.tsx` lines 73-79)
```typescript
const [user, dashboardData, heatmapData, activityData, streakData] = await Promise.all([
  getUser(),
  getDashboardData(),    // Total sessions, average score, readiness
  getHeatmapData(),      // Mastery % per taxonomy node
  getActivityData(),     // Recent interactions
  getStreakData()        // Study streak + lock state
])
```

### 3.2 3D Lab State Shape (`useLabStore`)
```typescript
interface LabStore {
  activeModuleId: string | null;
  camera: { position: [number, number, number] };
  exploreMode: 'guided' | 'free';
  visitedNodes: string[];
  answeredNodes: string[];
}
```

## 4. Extreme Edge-Case & Concurrency Vulnerabilities
- **Concurrency: Parallel Fetch Collision:** Using `Promise.all` means if `getStreakData` times out, the user sees a full-page error instead of just a missing streak ribbon.
- **Idempotency: Analytics Sync Duplicate:** `DashboardAnalyticsSync` is a client component that fires events on mount. If a user has multiple dashboard tabs open, duplicate analytics events (session views) are fired, inflating metrics.
- **Hydration: Skeleton Layout Shift:** Each dashboard component has its own skeleton (e.g., `HeatmapSectionSkeleton`). If these are not precisely matched to the final rendered height, a severe Layout Shift (CLS) occurs upon hydration, potentially displacing clickable elements.
- **3D Viewport Context Loss:** If a user switches tabs while a 3D module is loading, the WebGL context may be lost or initialized with incorrect dimensions, leading to a blank canvas.

## 5. The Unified Resolution Blueprint

### 5.1 Resilience & Performance
1. **Independent Suspense Boundaries:** Replace page-level `Promise.all` with per-section `<Suspense>` wrappers. Each section component handles its own data fetch.
2. **Dynamic Imports:** Use `dynamic(() => import('./3DLab'), { ssr: false })` to isolate 3D dependencies from the main bundle.
3. **Centralized Data Hook:** Refactor fetches into a single `getDashboardData()` server action that uses `Promise.allSettled` to prevent single-query crashes.

### 5.2 UI/UX Standardization
1. **Unified Skeleton Library:** Create a shared `DashboardSkeleton` that composes section skeletons to ensure consistent layout during load.
2. **Context Stability:** Move all 5 dashboard providers into a single `DashboardProviderShell` to ensure they are always mounted together.
3. **Visibility API Guard:** Use `document.visibilityState` check in `DashboardAnalyticsSync` to prevent duplicate tracking from background tabs.
