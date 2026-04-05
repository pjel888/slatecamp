# Dashboard Portal

**Analysis Date:** 2026-04-06

## Overview

The Dashboard is the main student-facing portal under `/dashboard`. It provides the authenticated study interface with sidebar navigation, Readiness Score display, heatmap visualization, and access to all learning features.

**Route:** `/dashboard`
**Source:** `src/app/dashboard/AGENTS.md`, `src/app/dashboard/`

## Page Count

33 pages across subdirectories.

## Root Files

| File | Purpose |
|------|---------|
| `page.tsx` | Hero command bar + heatmap + subject mastery + activity feed |
| `layout.tsx` | Bootstrap user, fetch tier/stats/disciplines, context providers |
| `loading.tsx` | Page-level skeleton |
| `error.tsx` | Error boundary |
| `not-found.tsx` | 404 page |

**Source:** `src/app/dashboard/AGENTS.md`

## Layout Bootstrap

The root `layout.tsx` performs critical initialization:
1. Fetch user session via `getUser()`
2. Bootstrap user profile on first login (creates `profiles`, `global_stats`)
3. Fetch subscription tier
4. Fetch global stats
5. Fetch disciplines
6. Wrap in providers: `TierProvider`, `DisciplineProvider`, `ActiveSessionProvider`, `NoteContextProvider`, `SidebarProvider`

```typescript
// src/app/dashboard/layout.tsx
// TierProvider — subscription tier context
// DisciplineProvider — selected discipline context
// ActiveSessionProvider — current quiz session context
// NoteContextProvider — note editing context
// SidebarProvider — sidebar state
```

**Source:** `src/app/dashboard/layout.tsx`, `src/lib/context/`

## Dashboard Hero

`page.tsx` renders the main dashboard with:
- **HeroCommandBar** — Readiness Score, quick actions
- **HeatmapSection** — Taxonomy heatmap with color-coded nodes
- **SubjectMasteryCard** — Per-subject performance cards
- **ActivityFeed** — Recent study activity
- **StreakRibbon** — Current streak display
- **SrsReviewWidget** — Upcoming SRS reviews
- **OnboardingStateCard** — First-time user guidance

**Source:** `src/app/dashboard/page.tsx`, `src/components/dashboard/`

## Context Providers

| Provider | Purpose | Location |
|----------|---------|----------|
| `TierProvider` | User subscription tier (free/camp/insurance/institutional) | `src/lib/context/` |
| `DisciplineProvider` | Selected discipline context | `src/lib/context/` |
| `ActiveSessionProvider` | Current quiz session state | `src/lib/context/` |
| `NoteContextProvider` | Note editing context | `src/lib/context/` |
| `SidebarProvider` | Sidebar open/closed state | `src/lib/context/` |

**Source:** `src/lib/context/`, `src/app/dashboard/layout.tsx`

## Sidebar Navigation

Unified v2 sidebar with:
- 52px collapsed / 216px expanded
- Mobile drawer pattern
- Nav groups: learn (Wiki, Notes, 3D Lab), practice (CampTrails, Review), data (Analytics)

**Source:** `src/components/sidebar/` (13 files), `src/lib/sidebar-constants.ts`

## Feature Access by Tier

| Feature | Free | Camp | Insurance | Institutional |
|---------|------|------|-----------|---------------|
| Wiki (free articles) | ✓ | ✓ | ✓ | ✓ |
| Wiki (all articles) | — | ✓ | ✓ | ✓ |
| Camp quiz mode | — | ✓ | ✓ | ✓ |
| Storm/Chill/Custom | — | ✓ | ✓ | ✓ |
| Focus Review | — | ✓ | ✓ | ✓ |
| Simulation | — | ✓ | ✓ | ✓ |
| 3D Lab | — | ✓ | ✓ | ✓ |
| Camp Trails | — | ✓ | ✓ | ✓ |
| Analytics | Basic | Full | Full | Full |

**Source:** `src/lib/paywall/`, `src/lib/admin/feature-flags.ts`

## DevToolbar

Admin/demo users see a `DevToolbar` with:
- Feature flag overrides
- User impersonation
- System info display
- Debug keyboard shortcuts

```typescript
// Show only if isAdmin or isDemoMode
{isAdmin || isDemoMode() && <DevToolbar />}
```

**Source:** `src/components/dev/`, `src/app/dashboard/layout.tsx`

## Subdirectories

| Directory | Pages | Purpose |
|----------|-------|---------|
| `3d-lab/` | Module gallery + active lab | 3D spatial learning |
| `analytics/` | Performance charts | Student analytics |
| `area-c/` | Design quiz area | Architecture design challenges |
| `assessment/` | Mode selection hub | Entry to quiz protocols |
| `camptrails/` | Active trail management | Trail progress tracking |
| `focus-review/` | Focus Review mode | Targeted weak area practice |
| `notes/` | Note list + editor | Note-taking |
| `proof-simulation/` | Full exam simulation | Proctored exam practice |
| `review/` | Camp mode dashboard | Primary quiz interface |
| `score-reveal/` | Post-assessment score | Initial readiness reveal |
| `settings/` | User preferences | Account + discipline settings |
| `testing/` | 7-mode testing hub | Storm, Chill, Custom, Endurance, Subject |
| `trails/` | Trail library + detail | Browse and enroll trails |
| `upgrade/` | Tier upgrade entry | Free → Pro conversion |
| `welcome-pro/` | New Pro welcome | Onboarding for new subscribers |
| `wiki/` | Article browser + detail | Knowledge base |

**Source:** `src/app/dashboard/AGENTS.md`

---

*Dashboard portal: 2026-04-06*
