# Phase 1: Route Foundation - Context

**Gathered:** 2026-03-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Rename "Testing" to "Review" across the entire codebase (sidebar label, URL path, directory, route constants, page title) and add a CampTrails nav link with route stub page. No structural sidebar changes — just route/label foundation work.

</domain>

<decisions>
## Implementation Decisions

### Review Rename Scope
- Full rename: sidebar label, URL path (/dashboard/testing → /dashboard/review), directory (src/app/dashboard/testing/ → src/app/dashboard/review/), route constant (ROUTES.TESTING → ROUTES.REVIEW), page title
- No redirect from old /dashboard/testing path — app is early enough, no bookmarks to protect
- Page title changes from "Testing" to "Review" (browser tab + navbar)
- Full route constant cleanup: rename all references from "testing" to "review" throughout the codebase, including REVIEW_EXITED and any other leftover testing references

### CampTrails Nav Configuration
- Icon: Path (Phosphor) — directly maps to "trails" and journeys
- Position: CampTrails first within PRACTICE group (before Review) — follows study flow (learn paths → then test)
- Route path: /dashboard/camptrails
- Route constant: ROUTES.CAMPTRAILS

### CampTrails Stub Page
- Coming soon card with feature name + "Coming Soon" badge
- Include brief description: teases what CampTrails will be (curated learning paths)
- Follow Campfire design system and voice guide for copy

### Claude's Discretion
- Exact copy for the coming soon description (within Campfire voice guide)
- Internal component naming conventions for the stub page
- Whether to create a dedicated layout.tsx for camptrails or use the dashboard default

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Route Configuration
- `src/lib/routes.ts` — DASHBOARD_ROUTES array and SIDEBAR_NAVIGATION derivation (source of truth for sidebar nav)
- `src/lib/constants/routes.ts` — ROUTES constant object (used across the entire codebase for navigation)

### Sidebar Component
- `src/components/shared/Sidebar.tsx` — Current sidebar implementation (references SIDEBAR_NAVIGATION and ROUTES)

### Dashboard Layout
- `src/app/dashboard/layout.tsx` — Dashboard layout that renders the Sidebar component

### Testing Route (to be renamed)
- `src/app/dashboard/testing/` — Directory to be renamed to review/ (contains page.tsx, layout.tsx, loading.tsx, error.tsx, CampDashboard.tsx)

### Design System
- `CLAUDE.md` — Campfire design system tokens, voice guide, engagement policy

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `DASHBOARD_ROUTES` array in `src/lib/routes.ts` — single source of truth for all sidebar nav items, titles, and icons
- `SIDEBAR_NAVIGATION` derived from DASHBOARD_ROUTES — changing the source array automatically updates the sidebar
- Phosphor Icons library already installed — `Path` icon available via `@phosphor-icons/react`
- `SCIcon` component in `src/components/graphics/icons/Icon.tsx` — standard icon wrapper used throughout sidebar

### Established Patterns
- Route config pattern: add entry to DASHBOARD_ROUTES → automatically appears in sidebar and page title mapping
- Route constants: all navigation uses ROUTES.* constants, never hardcoded strings
- Page structure: each route has a directory under `src/app/dashboard/` with page.tsx, layout.tsx, loading.tsx, error.tsx

### Integration Points
- `src/lib/routes.ts` DASHBOARD_ROUTES array — add CampTrails entry here
- `src/lib/constants/routes.ts` ROUTES object — add CAMPTRAILS, rename TESTING → REVIEW
- `src/app/dashboard/` — create camptrails/ directory with stub page
- `src/app/dashboard/testing/` — rename to review/
- All files importing ROUTES.TESTING — need find-replace to ROUTES.REVIEW

</code_context>

<specifics>
## Specific Ideas

- User explicitly wants CampTrails described as "learning paths" — curated sequences guiding users through topics
- "Review" was chosen over "Testing" because it better describes what users do (reviewing questions, not being tested)
- Path icon chosen because it directly maps to "trails" and journey metaphor

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-route-foundation*
*Context gathered: 2026-03-20*
