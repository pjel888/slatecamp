<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-04-02 -->

# dashboard

## Purpose

Main authenticated app area. Protected by Supabase Auth. Renders the study interface with sidebar navigation, heatmap visualization, activity feeds, subject mastery cards, and access to all features: assessment modes (Camp/Storm/Chill/Blindspot), trails, wiki, notes, 3D lab, reviews, proof simulation, and admin tools. All routes require active user session.

## Key Files

| File | Description |
|------|-------------|
| `page.tsx` | Root dashboard homepage. Renders hero command bar with Readiness Score, heatmap section, subject mastery cards, activity feed, wiki daily article, streak ribbon, SRS review widget, and onboarding state card. Async, uses Suspense. |
| `layout.tsx` | Root layout wrapper. Bootstraps user, fetches subscription tier, global stats, disciplines. Provides TierProvider, DisciplineProvider, ActiveSessionProvider, NoteContextProvider, SidebarProvider. Manages sidebar shell, navbar, breadcrumb context. Shows DevToolbar if isAdmin or isDemoMode. |
| `loading.tsx` | Page-level loading skeleton fallback. |
| `error.tsx` | Page-level error boundary handler. |
| `not-found.tsx` | 404 page for dashboard route group. |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `3d-lab/` | Spatial visualization lab using React Three Fiber + Three.js. Module gallery, scene rendering, hotspot annotations, exploded assemblies, floor plan walkthroughs, cutaway sections. Client-heavy with LabViewport, Canvas wrapper. |
| `analytics/` | Data analytics and reporting dashboard. User performance trends, session analysis. |
| `area-c/` | Design quiz area with interactive components for architecture design challenges. |
| `assessment/` | Entry point to quiz modes. Routes to Camp, Storm, Chill, or Blindspot protocols. |
| `camptrails/` | Trail management UI. View active trails, historical trail data, progress tracking. |
| `developer/` | Internal developer tools (admin-only). Console, database inspector, logs, test data seeding, design system reference, documentation. |
| `exam-outcome/` | Post-exam survey and outcome tracking. Collects user feedback after proof simulation. |
| `focus-review/` | Focus Review (formerly Blindspot) protocol. Targeted quiz on weak nodes. |
| `notes/` | User notes management and retrieval interface. CRUD operations on personal notes. |
| `proof-simulation/` | Full exam simulation mode. Timed, full-length exam-like experience. Results page at `proof-simulation/results/`. |
| `review/` | Camp mode dashboard and review interface. CampDashboard component, custom layout. |
| `score-reveal/` | Readiness Score reveal flow. Post-initial assessment, shows user their computed score. |
| `settings/` | User account settings: discipline selection, theme preferences, logout. |
| `testing/` | Testing engine hub: session setup, active session, debrief. Supports 7 modes (Camp, Storm, Chill, Custom, Focus Review, Simulation, Subject). Dynamic routes: session/[sessionId], simulation/[sessionId]. |
| `trails/` | Trail list and detail views. View active study trail, day-by-day breakdown at `trails/[slug]/` and `trails/[slug]/today/`. |
| `upgrade/` | Tier upgrade / payment entry point. Prompts free users to upgrade to Pro. |
| `welcome-pro/` | Welcome screen for new Pro subscribers. |
| `wiki/` | Wiki article browser and search. Article detail view at `wiki/[slug]/`. |

## For AI Agents

### Working In This Directory

- All routes are **Server Components by default** (async/await, Suspense boundaries).
- Authentication is enforced at the layout level via `getUser()` redirect to login.
- User data (tier, stats, disciplines) is fetched in the layout and passed via Context providers.
- Feature flags and admin tools are only shown if `isAdmin` or `isDemoMode`.
- All subdirectories inherit the dashboard layout (sidebar, navbar, breadcrumb, main content area).

### Common Patterns

- **Data fetching:** Use Server Actions (`'use server'`) from `@/lib/actions/` for mutations. Use `@/lib/supabase/server` for server-side Supabase calls.
- **State management:** Zustand stores or React Context (TierProvider, DisciplineProvider, NoteContextProvider, ActiveSessionProvider, BreadcrumbProvider).
- **UI:** SharedPageLayout wrapper, Navbar, DashboardHeader, QuickActionsBar. Cards use `rounded-md`, shadows on hover only.
- **Styling:** Tailwind CSS 4 with Campfire color tokens (Camp Cobalt #1B3FC4, Emerald #2D9F6F, Warm Red #D64545, etc.).
- **Loading:** Use `<Suspense>` with skeleton components (HeatmapSectionSkeleton, DashboardPageSkeleton, etc.).
- **Dev Tools:** Check `isDemoMode()` and `isAdmin` before rendering DevToolbar, DevKeyboardProvider.

## Dependencies

### Internal

- `@/lib/actions/dashboard-page` — fetches hero stats, heatmap data, activity feed, subject mastery, streak info.
- `@/lib/supabase/server` — `createClient()`, `getUser()`, Supabase client initialization.
- `@/lib/supabase/bootstrap` — user bootstrap on first login (creates profiles, global_stats).
- `@/lib/admin/feature-flags` — `getFeatureFlags()`, `getEffectiveTier()` for dev tools.
- `@/lib/context/*` — TierProvider, DisciplineProvider, ActiveSessionProvider, NoteContextProvider, BreadcrumbProvider.
- `@/components/dashboard/*` — HeroCommandBar, HeatmapSection, SubjectMasteryCard, StreakRibbon, SrsReviewWidget, OnboardingStateCard, etc.
- `@/components/layouts/SharedPageLayout` — wrapper for all subpages.
- `@/components/shared/*` — Navbar, DashboardHeader, QuickActionsBar, DashboardPageSkeleton.
- `@/components/dev/*` — DevToolbar, DevKeyboardProvider (admin-only).
- `@/types/app` — UserTier, UserGlobalStats, Discipline types.

<!-- MANUAL: Any local customizations or overrides should be documented here. -->
