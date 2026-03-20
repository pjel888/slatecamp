---
phase: 01-route-foundation
plan: 01
subsystem: ui
tags: [routes, sidebar, navigation, next.js-app-router]

# Dependency graph
requires: []
provides:
  - "ROUTES.REVIEW constant and /dashboard/review route (renamed from Testing)"
  - "ROUTES.CAMPTRAILS constant and /dashboard/camptrails stub page"
  - "CampTrails sidebar/navbar entry with Path icon"
  - "Zero remaining references to /dashboard/testing or ROUTES.TESTING"
affects: [02-nav-grouping, 03-visual-refinement]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Server Component stub pages for coming-soon features"
    - "Campfire design system tokens applied to stub page"
    - "DASHBOARD_ROUTES as single source of truth for sidebar + navbar + page titles"

key-files:
  created:
    - src/app/dashboard/camptrails/page.tsx
  modified:
    - src/lib/constants/routes.ts
    - src/lib/routes.ts
    - src/components/shared/Sidebar.tsx
    - src/components/shared/Navbar.tsx
    - src/app/dashboard/review/ (renamed from testing/)

key-decisions:
  - "CampTrails positioned before Review in DASHBOARD_ROUTES to match planned PRACTICE group order"
  - "CampTrails stub is a Server Component with no client interactivity"

patterns-established:
  - "Coming Soon badge pattern: rounded-md bg-zinc-500/10 px-1.5 py-0.5 text-[11px] font-medium text-zinc-500"
  - "Stub page layout: centered card with icon circle, heading, badge, description"

requirements-completed: [NAV-06, NAV-07]

# Metrics
duration: 6min
completed: 2026-03-20
---

# Phase 01 Plan 01: Route Foundation Summary

**Renamed /dashboard/testing to /dashboard/review across 33 files and added CampTrails nav entry with coming-soon stub page**

## Performance

- **Duration:** 6 min
- **Started:** 2026-03-20T16:17:02Z
- **Completed:** 2026-03-20T16:23:05Z
- **Tasks:** 2
- **Files modified:** 37

## Accomplishments
- Renamed every reference to "Testing" route to "Review" across the entire codebase (33 files, including route constants, sidebar, action files, dashboard components, test file)
- Added CampTrails route constant, sidebar entry, and navbar entry with Path icon positioned before Review
- Created CampTrails coming-soon stub page as a Server Component following Campfire design system tokens
- Build passes cleanly with zero regressions

## Task Commits

Each task was committed atomically:

1. **Task 1: Rename Testing to Review across entire codebase** - `5da4c8e` (feat)
2. **Task 2: Add CampTrails nav link and stub page** - `d027c40` (feat)

## Files Created/Modified
- `src/lib/constants/routes.ts` - Removed TESTING constant, added CAMPTRAILS constant
- `src/lib/routes.ts` - Updated DASHBOARD_ROUTES: Testing->Review, added CampTrails with Path icon
- `src/components/shared/Sidebar.tsx` - ROUTES.TESTING -> ROUTES.REVIEW in handleConfirmLeave
- `src/components/shared/Navbar.tsx` - Added CampTrails to NAV_ITEMS with Path icon
- `src/app/dashboard/review/` - Renamed from testing/ (5 files: page, layout, loading, error, CampDashboard)
- `src/app/dashboard/review/error.tsx` - Renamed component TestingError->ReviewError, updated text
- `src/app/dashboard/3d-lab/_components/PostModuleCTA.tsx` - ROUTES.TESTING -> ROUTES.REVIEW
- `src/app/dashboard/camptrails/page.tsx` - New Server Component stub page
- 25 additional files with /dashboard/testing -> /dashboard/review string replacement (dashboard components, action files, wiki pages, trail views, proof simulation pages)

## Decisions Made
- CampTrails positioned before Review in DASHBOARD_ROUTES array to match planned PRACTICE group ordering
- CampTrails stub uses Server Component (no 'use client') since it has no interactive state
- Coming Soon badge follows existing ModuleGallery.tsx pattern for consistency

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Cleared stale .next build cache**
- **Found during:** Overall verification (build step)
- **Issue:** Stale .next/dev/types/app/dashboard/testing/ cache files referenced the old directory path, causing TypeScript compilation to fail
- **Fix:** Removed .next directory to force fresh build
- **Files modified:** .next/ (build cache, not committed)
- **Verification:** Build passes cleanly after cache clear
- **Committed in:** N/A (build cache is gitignored)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Cache clear was necessary for build to succeed. No scope creep.

## Issues Encountered
None beyond the build cache issue documented above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All route naming is finalized, ready for Phase 02 nav grouping
- CampTrails stub is in place for future feature implementation
- DASHBOARD_ROUTES serves as the single source of truth for sidebar items

## Self-Check: PASSED

All created files verified on disk. All commit hashes found in git log.

---
*Phase: 01-route-foundation*
*Completed: 2026-03-20*
