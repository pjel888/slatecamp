# Phase 1: Route Foundation - Research

**Researched:** 2026-03-21
**Domain:** Next.js App Router routing, sidebar navigation configuration, route constants
**Confidence:** HIGH

## Summary

Phase 1 is a foundational rename-and-add operation. The codebase has a clean, centralized routing architecture with two source-of-truth files: `src/lib/routes.ts` (DASHBOARD_ROUTES array driving sidebar and page titles) and `src/lib/constants/routes.ts` (ROUTES constant object used for navigation throughout). Renaming "Testing" to "Review" requires changes in both files plus a directory rename (`src/app/dashboard/testing/` to `src/app/dashboard/review/`) and updating ~29 files containing hardcoded `/dashboard/testing` strings. Adding CampTrails requires a new entry in DASHBOARD_ROUTES, a new ROUTES constant, and a new stub page directory.

The most significant finding is the split between the ROUTES constant and hardcoded path strings. While `ROUTES.TESTING` appears in only 2 files (Sidebar.tsx and PostModuleCTA.tsx), the hardcoded string `/dashboard/testing` appears in 27 files across actions, components, and pages. The rename must address both. Additionally, the Navbar component (`src/components/shared/Navbar.tsx`) already uses `ROUTES.REVIEW` (pointing to `/dashboard/review`), which currently exists in the ROUTES constant alongside `ROUTES.TESTING` -- this is a pre-existing inconsistency that this phase will resolve.

The Phosphor `Path` icon is confirmed available in the installed `@phosphor-icons/react@2.1.10` package (verified via ESM import). No test framework is formally installed (no jest/vitest in devDependencies), though `.test.ts` files exist in the codebase -- one of which (`dashboard-page.test.ts`) contains a hardcoded `/dashboard/testing` reference that must also be updated.

**Primary recommendation:** Execute as two sequential tasks: (1) full "testing to review" rename across all files + directory, (2) add CampTrails route entry + stub page. This ordering prevents any intermediate broken state.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions
- Full rename: sidebar label, URL path (/dashboard/testing -> /dashboard/review), directory (src/app/dashboard/testing/ -> src/app/dashboard/review/), route constant (ROUTES.TESTING -> ROUTES.REVIEW), page title
- No redirect from old /dashboard/testing path -- app is early enough, no bookmarks to protect
- Page title changes from "Testing" to "Review" (browser tab + navbar)
- Full route constant cleanup: rename all references from "testing" to "review" throughout the codebase, including REVIEW_EXITED and any other leftover testing references
- Icon: Path (Phosphor) -- directly maps to "trails" and journeys
- Position: CampTrails first within PRACTICE group (before Review) -- follows study flow (learn paths -> then test)
- Route path: /dashboard/camptrails
- Route constant: ROUTES.CAMPTRAILS
- Coming soon card with feature name + "Coming Soon" badge
- Include brief description: teases what CampTrails will be (curated learning paths)
- Follow Campfire design system and voice guide for copy

### Claude's Discretion
- Exact copy for the coming soon description (within Campfire voice guide)
- Internal component naming conventions for the stub page
- Whether to create a dedicated layout.tsx for camptrails or use the dashboard default

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| NAV-06 | "Testing" renamed to "Review" in sidebar label | DASHBOARD_ROUTES array in `src/lib/routes.ts` controls sidebar labels; ROUTES constant in `src/lib/constants/routes.ts` used for navigation; 27 files contain hardcoded `/dashboard/testing` strings; directory rename from `testing/` to `review/` needed |
| NAV-07 | CampTrails nav link added (route stub at /dashboard/camptrails) | Add entry to DASHBOARD_ROUTES array; add ROUTES.CAMPTRAILS constant; create `src/app/dashboard/camptrails/` directory with page.tsx (stub); Path icon confirmed available in @phosphor-icons/react@2.1.10 |

</phase_requirements>

## Standard Stack

### Core (Already Installed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js (App Router) | 15.x | Route-based pages under `src/app/dashboard/` | Project framework -- file-based routing |
| @phosphor-icons/react | 2.1.10 | Icon library for sidebar navigation items | Already used throughout sidebar; `Path` icon verified available |
| Tailwind CSS | 4.x | Styling for stub page and badges | Project design system |

### Supporting (Already Installed)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| shadcn/ui | latest | UI primitives (Badge component for "Coming Soon") | Stub page badge |
| SCIcon | N/A (internal) | Phosphor icon wrapper with standardized sizing | All icon rendering in sidebar |

### Alternatives Considered

None -- this phase uses only existing project infrastructure. No new dependencies needed.

## Architecture Patterns

### Route Configuration Flow (Existing Pattern)

```
src/lib/constants/routes.ts    -> ROUTES.REVIEW, ROUTES.CAMPTRAILS (used in navigation/redirects)
src/lib/routes.ts              -> DASHBOARD_ROUTES array (drives sidebar + page titles)
                                   -> SIDEBAR_NAVIGATION (auto-derived, drives Sidebar.tsx)
                                   -> STATIC_PAGE_TITLES (auto-derived, drives Navbar title)
src/app/dashboard/review/      -> page.tsx, layout.tsx, loading.tsx, error.tsx
src/app/dashboard/camptrails/  -> page.tsx (stub)
```

### Pattern 1: Adding a Route to the Sidebar
**What:** Add an entry to the DASHBOARD_ROUTES array in `src/lib/routes.ts`
**When to use:** Any time a new sidebar item is needed
**Example:**
```typescript
// src/lib/routes.ts -- existing pattern from the codebase
import { Path } from '@phosphor-icons/react'

// Add to DASHBOARD_ROUTES array:
{
  path: '/dashboard/camptrails',
  title: 'CampTrails',
  icon: Path,
},
```
The `SIDEBAR_NAVIGATION` array is automatically derived from `DASHBOARD_ROUTES`, so adding an entry here automatically adds the sidebar link. Order in the array determines sidebar order.

### Pattern 2: Route Constants
**What:** All navigation paths use `ROUTES.*` constants, never hardcoded strings
**When to use:** All href attributes, router.push calls, revalidatePath calls
**Example:**
```typescript
// src/lib/constants/routes.ts -- existing pattern
export const ROUTES = {
  // ...
  CAMPTRAILS: "/dashboard/camptrails",
  REVIEW: "/dashboard/review",       // was TESTING
  REVIEW_EXITED: "/dashboard/review?exited=1", // was using TESTING path
  // ...
} as const;
```

### Pattern 3: Dashboard Page Structure
**What:** Each route directory follows a standard file convention
**When to use:** Creating any new dashboard page
**Example structure:**
```
src/app/dashboard/camptrails/
  page.tsx       # Server Component (required)
  layout.tsx     # Optional -- SharedPageLayout wrapper (existing pattern)
```

### Pattern 4: Coming Soon Stub (Existing Pattern)
**What:** A simple card with feature name, "Coming Soon" badge, and description
**When to use:** New features not yet implemented
**Reference:** `src/app/dashboard/3d-lab/_components/ModuleGallery.tsx` lines 48-50 for badge styling:
```typescript
<span className="rounded-md bg-zinc-500/10 px-1.5 py-0.5 text-[11px] font-medium text-zinc-500">
  Coming Soon
</span>
```

### Anti-Patterns to Avoid
- **Hardcoded path strings in new code:** Always use ROUTES.CAMPTRAILS, ROUTES.REVIEW constants. The 27 files with hardcoded `/dashboard/testing` are technical debt being cleaned up.
- **Adding 'use client' to the stub page:** The CampTrails stub page has no interactive state -- keep it as a Server Component per project skill (enforce-server-components).
- **Complex stub page:** This is a placeholder. One card, one badge, one sentence. No interactivity, no data fetching.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Sidebar navigation | Manual link list | DASHBOARD_ROUTES array in routes.ts | Single source of truth; SIDEBAR_NAVIGATION auto-derives |
| Icon rendering | Raw Phosphor components | SCIcon wrapper component | Standardized sizing, weight, accessibility |
| Page layout | Custom wrapper div | SharedPageLayout component | Consistent dashboard page structure |
| Coming Soon badge | Custom styled span | Existing pattern from ModuleGallery or shadcn Badge | Visual consistency |

## Common Pitfalls

### Pitfall 1: Missing Hardcoded String References
**What goes wrong:** Renaming ROUTES.TESTING but forgetting the 27 files with hardcoded `/dashboard/testing` strings, leaving broken links.
**Why it happens:** ROUTES.TESTING is only used in 2 files; the vast majority of references are hardcoded strings scattered across actions, components, and pages.
**How to avoid:** After rename, run a full grep for `/dashboard/testing` and `ROUTES.TESTING` -- both must return zero results.
**Warning signs:** Any remaining `/dashboard/testing` string anywhere in `src/`.

### Pitfall 2: ROUTES.REVIEW Already Exists
**What goes wrong:** Adding ROUTES.REVIEW without noticing it already exists at `/dashboard/review`, creating a conflict or duplication.
**Why it happens:** The ROUTES constant already has both `REVIEW: "/dashboard/review"` and `TESTING: "/dashboard/testing"` -- a pre-existing inconsistency.
**How to avoid:** Remove ROUTES.TESTING entirely. ROUTES.REVIEW already points to `/dashboard/review`. Update REVIEW_EXITED if it still points to `/dashboard/review?exited=1` (it does -- already correct).
**Warning signs:** Two constants pointing to the same path, or TESTING constant remaining.

### Pitfall 3: Sidebar Item Ordering
**What goes wrong:** CampTrails appears in the wrong position in the sidebar because array order was not set correctly.
**Why it happens:** SIDEBAR_NAVIGATION is derived directly from DASHBOARD_ROUTES array order. Position in the array = position in the sidebar.
**How to avoid:** Insert CampTrails entry in DASHBOARD_ROUTES immediately before the Review entry. The user decision is: CampTrails first in PRACTICE group, before Review.
**Warning signs:** CampTrails appearing after Review or in the wrong section.

### Pitfall 4: Sidebar.tsx handleConfirmLeave Still References ROUTES.TESTING
**What goes wrong:** The leave-session dialog redirects to the wrong path after rename.
**Why it happens:** Line 196 of Sidebar.tsx uses `${ROUTES.TESTING}?tab=review&exited=1` -- this must become `${ROUTES.REVIEW}?tab=review&exited=1` (or use ROUTES.REVIEW_EXITED if the query params match).
**How to avoid:** Check Sidebar.tsx handleConfirmLeave explicitly.
**Warning signs:** Navigating away from a quiz session redirects to a 404 instead of the Review page.

### Pitfall 5: Test File Contains Hardcoded Path
**What goes wrong:** Existing test (`dashboard-page.test.ts` line 268) asserts `href` contains `/dashboard/testing` -- this assertion will fail after the rename.
**Why it happens:** Test was written with the old path.
**How to avoid:** Update the test assertion from `/dashboard/testing` to `/dashboard/review` along with the source code change.
**Warning signs:** Test failures after rename.

### Pitfall 6: Git Directory Rename on Windows
**What goes wrong:** `git mv src/app/dashboard/testing src/app/dashboard/review` may have case-sensitivity issues on Windows.
**Why it happens:** Windows filesystem is case-insensitive; git can sometimes have issues with directory renames.
**How to avoid:** Use `git mv` for the directory rename so git tracks it as a rename rather than delete+add. Verify with `git status` after the operation.
**Warning signs:** Git showing deleted files + new untracked files instead of renamed files.

## Code Examples

### Complete DASHBOARD_ROUTES Update (routes.ts)
```typescript
// src/lib/routes.ts
import {
  Path,        // NEW: CampTrails icon
  Brain,       // Review icon (was Testing)
  // ... other existing imports
} from '@phosphor-icons/react'

export const DASHBOARD_ROUTES: RouteConfig[] = [
  { path: '/dashboard', title: 'Dashboard', icon: SquaresFour },
  { path: '/dashboard/wiki', title: 'Wiki', icon: Globe },
  // CampTrails BEFORE Review (user decision: follows study flow)
  { path: '/dashboard/camptrails', title: 'CampTrails', icon: Path },
  // Renamed from Testing to Review
  { path: '/dashboard/review', title: 'Review', icon: Brain },
  { path: '/dashboard/notes', title: 'Notes', icon: FileText },
  { path: '/dashboard/3d-lab', title: '3D Lab', icon: Cube },
  { path: '/dashboard/analytics', title: 'Analytics', icon: ChartBar },
  { path: '/dashboard/settings', title: 'Account Settings', icon: GearSix },
]
```

### Complete ROUTES Constant Update (constants/routes.ts)
```typescript
// src/lib/constants/routes.ts -- changes only
export const ROUTES = {
  // ...existing routes...
  CAMPTRAILS: "/dashboard/camptrails",    // NEW
  REVIEW: "/dashboard/review",            // KEEP (already exists)
  REVIEW_EXITED: "/dashboard/review?exited=1", // KEEP (already correct)
  // REMOVE: TESTING: "/dashboard/testing"  -- delete this line
  // ...rest unchanged...
} as const;
```

### CampTrails Stub Page (Server Component)
```typescript
// src/app/dashboard/camptrails/page.tsx
import { Path } from '@phosphor-icons/react'

const CampTrailsPage = () => {
  return (
    <div className="flex items-center justify-center min-h-[60vh] p-8">
      <div className="w-full max-w-md text-center space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#EEF2FC]">
          <Path size={32} weight="duotone" className="text-[#1B3FC4]" />
        </div>
        <h1 className="text-xl font-semibold text-[#1A2332]">CampTrails</h1>
        <span className="inline-block rounded-md bg-zinc-500/10 px-2 py-0.5 text-[11px] font-medium text-zinc-500">
          Coming Soon
        </span>
        <p className="text-sm text-[#4A5568]">
          Curated learning paths that guide you through topics step by step
          -- so you always know what to study next.
        </p>
      </div>
    </div>
  )
}

export default CampTrailsPage
```

## Complete File Impact Analysis

### Files Requiring Changes (NAV-06: Testing -> Review rename)

**Route configuration (2 files):**
1. `src/lib/constants/routes.ts` -- Remove ROUTES.TESTING line
2. `src/lib/routes.ts` -- Change path from `/dashboard/testing` to `/dashboard/review`, title from "Testing" to "Review"

**Directory rename (1 operation):**
3. `src/app/dashboard/testing/` -> `src/app/dashboard/review/` (5 files move: page.tsx, layout.tsx, loading.tsx, error.tsx, CampDashboard.tsx)

**Files with ROUTES.TESTING constant (2 files):**
4. `src/components/shared/Sidebar.tsx` -- line 196: ROUTES.TESTING -> ROUTES.REVIEW
5. `src/app/dashboard/3d-lab/_components/PostModuleCTA.tsx` -- line 39: ROUTES.TESTING -> ROUTES.REVIEW

**Files with hardcoded `/dashboard/testing` string (25 unique files):**
6. `src/app/dashboard/focus-review/page.tsx`
7. `src/app/dashboard/wiki/[slug]/page.tsx`
8. `src/components/wiki/WikiArticle.tsx`
9. `src/components/dashboard/ContinueSessionCardNew.tsx`
10. `src/components/dashboard/BlindspotQueueCardNew.tsx`
11. `src/components/dashboard/ImprovedActivityFeed.tsx`
12. `src/components/dashboard/NodeDetailSheet.tsx`
13. `src/components/dashboard/QuizRenderer.tsx`
14. `src/components/dashboard/RecentActivityCard.tsx`
15. `src/components/dashboard/ResumeSessionBanner.tsx`
16. `src/components/dashboard/SrsReviewWidget.tsx`
17. `src/components/dashboard/SubjectFloorAlert.tsx`
18. `src/components/dashboard/SubjectMasteryCard.tsx`
19. `src/components/dashboard/SubjectRadarChart.tsx`
20. `src/components/trails/TrailDailyView.tsx`
21. `src/app/dashboard/proof-simulation/page.tsx`
22. `src/app/dashboard/proof-simulation/results/page.tsx`
23. `src/lib/actions/dashboard-page.ts`
24. `src/lib/actions/dashboard.ts`
25. `src/lib/actions/session-actions.ts`
26. `src/lib/actions/sessions.ts`
27. `src/lib/actions/daily-mission.ts`
28. `src/lib/actions/quiz.ts`

**Test file (1 file):**
29. `src/lib/actions/dashboard-page.test.ts` -- line 268: assertion string update

**Internal text updates within renamed files:**
30. `error.tsx` (inside testing/ dir) -- line 24 text "return to testing", line 29 href `/dashboard/testing`, line 37 component name `TestingError`

**Total: ~30 files affected**

### Files Requiring Changes (NAV-07: CampTrails addition)

1. `src/lib/constants/routes.ts` -- Add ROUTES.CAMPTRAILS
2. `src/lib/routes.ts` -- Add entry to DASHBOARD_ROUTES array, import Path icon
3. `src/app/dashboard/camptrails/page.tsx` -- NEW file (stub)

**Optionally:**
4. `src/app/dashboard/camptrails/layout.tsx` -- NEW file (SharedPageLayout wrapper, following existing pattern)
5. `src/components/shared/Navbar.tsx` -- Add CampTrails to mobile NAV_ITEMS array (for consistency)

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Hardcoded path strings everywhere | ROUTES.* constants from routes.ts | Already in place, inconsistently used | This phase cleans up the last 27 hardcoded `/dashboard/testing` strings -- ideally converting them to use ROUTES.REVIEW |

**Note:** The codebase has a pre-existing inconsistency where ROUTES.REVIEW (pointing to `/dashboard/review`) and ROUTES.TESTING (pointing to `/dashboard/testing`) both exist. The Navbar already uses ROUTES.REVIEW while the sidebar uses the DASHBOARD_ROUTES path `/dashboard/testing`. This phase resolves this inconsistency by making everything point to `/dashboard/review` and removing ROUTES.TESTING.

## Open Questions

1. **Should hardcoded strings be converted to ROUTES.* constants during this rename?**
   - What we know: 25+ files use hardcoded `/dashboard/testing` strings instead of ROUTES.TESTING
   - What's unclear: Whether to just find-replace the string or also refactor to use the constant
   - Recommendation: Find-replace the string `/dashboard/testing` to `/dashboard/review` for speed; converting all to ROUTES.REVIEW constants is a separate cleanup concern and risks scope creep. However, the planner may opt to convert them if the effort is small.

2. **Should the Navbar mobile menu get CampTrails too?**
   - What we know: Navbar has its own NAV_ITEMS array (separate from SIDEBAR_NAVIGATION) and currently does not include CampTrails
   - What's unclear: Whether NAV-07 scope includes the mobile navbar
   - Recommendation: Add CampTrails to Navbar NAV_ITEMS for consistency -- it is a one-line addition and avoids an inconsistency between desktop and mobile navigation.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | No formal test runner installed (no jest/vitest in deps) |
| Config file | None |
| Quick run command | N/A |
| Full suite command | N/A |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| NAV-06 | "Review" label in sidebar, /dashboard/review route works | smoke (manual) | `grep -r "/dashboard/testing" src/` should return 0 results | N/A |
| NAV-07 | CampTrails in sidebar, /dashboard/camptrails renders stub | smoke (manual) | Dev server navigation check | N/A |

### Sampling Rate
- **Per task commit:** `grep -r "/dashboard/testing" src/` -- must return zero results after NAV-06
- **Per wave merge:** Manual dev server verification -- navigate to /dashboard/review and /dashboard/camptrails
- **Phase gate:** `bun run build` must succeed (catches broken imports/routes)

### Wave 0 Gaps
- [ ] Update `src/lib/actions/dashboard-page.test.ts` line 268 -- assertion references `/dashboard/testing`
- No formal test framework to install (project does not use one in dependencies)

## Sources

### Primary (HIGH confidence)
- `src/lib/routes.ts` -- Directly read, verified DASHBOARD_ROUTES structure and SIDEBAR_NAVIGATION derivation
- `src/lib/constants/routes.ts` -- Directly read, verified ROUTES object including pre-existing REVIEW and TESTING entries
- `src/components/shared/Sidebar.tsx` -- Directly read, verified ROUTES.TESTING usage on line 196
- `src/components/shared/Navbar.tsx` -- Directly read, verified ROUTES.REVIEW already in use on line 35
- `src/app/dashboard/testing/` -- All 5 files directly read (page.tsx, layout.tsx, loading.tsx, error.tsx, CampDashboard.tsx)
- `@phosphor-icons/react@2.1.10` -- Path icon verified via ESM import and file listing in node_modules
- Codebase-wide grep for `/dashboard/testing` -- 27 files confirmed
- Codebase-wide grep for `ROUTES.TESTING` -- 2 files confirmed

### Secondary (MEDIUM confidence)
- Coming Soon badge pattern from `src/app/dashboard/3d-lab/_components/ModuleGallery.tsx` -- existing project pattern

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already installed and verified in project
- Architecture: HIGH -- routing patterns directly read from source code, all files enumerated
- Pitfalls: HIGH -- identified through actual grep results showing pre-existing inconsistencies and exact file counts

**Research date:** 2026-03-21
**Valid until:** 2026-04-21 (stable -- routing architecture unlikely to change in parallel)
