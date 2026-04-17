# Dashboard Overview

**Analysis Date:** 2026-04-06

## Portal Purpose

The Dashboard portal is the primary student-facing interface for SlateCamp. All routes require an active Supabase session. The layout bootstraps the user, fetches subscription tier, global stats, and disciplines, then wraps the UI with 5 context providers.

**Source:** `src/app/dashboard/AGENTS.md`

## Layout Architecture

```
Dashboard Layout
├── TierProvider          # Subscription tier (free/camp/insurance/institutional)
├── DisciplineProvider    # Selected discipline context
├── ActiveSessionProvider # Current quiz session
├── NoteContextProvider   # Note editing state
├── SidebarProvider       # Sidebar visibility
└── DevToolbar            # Admin/demo only
```

**Source:** `src/app/dashboard/layout.tsx`, `src/lib/context/`

## Hero Dashboard Page

`src/app/dashboard/page.tsx` renders the main study hub:

```typescript
// Async server component with Suspense boundaries
// Sections:
// 1. HeroCommandBar — Readiness Score + quick actions
// 2. HeatmapSection — Taxonomy color-coded grid
// 3. SubjectMasteryCard[] — Per-subject performance
// 4. ActivityFeed — Recent study events
// 5. StreakRibbon — Consistency tracking
// 6. SrsReviewWidget — Upcoming reviews
// 7. OnboardingStateCard — First-time user
```

**Source:** `src/app/dashboard/page.tsx`

## Data Fetching

Server-side data fetching via:
```typescript
// src/lib/actions/dashboard-page.ts
getHeroStats()         // Readiness Score, streak, review count
getHeatmapData()       // Taxonomy node colors
getActivityFeed()      // Recent sessions, reviews
getSubjectMastery()    // Per-subject performance
getStreakInfo()        // Current and longest streak
```

**Source:** `src/lib/actions/dashboard-page.ts`

## Navigation

Sidebar navigation (v2 unified):
- Collapsed: 52px
- Expanded: 216px
- Mobile: drawer overlay
- Groups: learn, practice, data

**Source:** `src/components/sidebar/` (13 files), `src/lib/sidebar-constants.ts`

## Testing Modes Access

| Mode | Route | Tier Required |
|------|-------|---------------|
| Camp | `/dashboard/review` | camp+ |
| Storm | `/dashboard/testing/storm` | camp+ |
| Chill | `/dashboard/testing/chill` | camp+ |
| Custom | `/dashboard/testing/custom` | camp+ |
| Focus Review | `/dashboard/focus-review` | camp+ |
| Simulation | `/dashboard/proof-simulation` | camp+ |
| Endurance | `/dashboard/testing/endurance` | camp+ |

**Source:** `src/app/dashboard/AGENTS.md`

---

*Dashboard overview: 2026-04-06*
