# Phase 2: Grouped Navigation - Context

**Gathered:** 2026-03-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Organize the flat sidebar navigation list into labeled sections (LEARN, PRACTICE, DATA) with Dashboard as a standalone top item. Account Settings moves to a pinned bottom position. Group labels visible when expanded, hidden when collapsed. Active route indicator works across all items. No overlay/expand changes — this phase is purely organizational.

</domain>

<decisions>
## Implementation Decisions

### Group Label Styling
- Sentence case: "Learn", "Practice", "Data" (not ALL CAPS)
- Font size: 11px (minimum per Campfire design system)
- Color: Ink Tertiary (#8896A7)
- Left alignment: flush with icon column (same left edge as nav items, not indented)
- Labels hidden when sidebar is collapsed, visible when expanded

### Dashboard Standalone Treatment
- Dashboard sits at the top of the nav, above all groups
- Thin border-b separator between Dashboard and first group label (like Supabase)
- Same nav item component as other items but position + separator communicates hierarchy

### Group Composition (locked from Phase 1 + project decisions)
- LEARN: Wiki, Notes, 3D Lab
- PRACTICE: CampTrails (first), Review (second)
- DATA: Analytics
- Order of groups: LEARN → PRACTICE → DATA

### Settings Link Handling
- Remove Account Settings from the main grouped navigation
- Pin it to the bottom of the sidebar as a standalone full nav item (icon + "Settings" label)
- Same styling as other nav items, just pinned to bottom area
- This is a transitional state — Phase 7 replaces it with the account popover

### Claude's Discretion
- Exact spacing between groups (within Campfire constraints)
- Whether to add a subtle separator between groups or rely on label + whitespace alone
- Route config data structure for groups (extend RouteConfig with group field vs separate config)
- Transition animation for group labels appearing/disappearing on collapse/expand

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Route Configuration
- `src/lib/routes.ts` — DASHBOARD_ROUTES array, SIDEBAR_NAVIGATION derivation, RouteConfig interface
- `src/lib/constants/routes.ts` — ROUTES constant object

### Sidebar Component
- `src/components/shared/Sidebar.tsx` — Current sidebar with flat nav rendering loop (line 342: SIDEBAR_NAVIGATION.map)

### Design System
- `CLAUDE.md` — Campfire design system tokens, typography minimums, shadow/radius/transition rules

### Prior Phase Context
- `.planning/phases/01-route-foundation/01-CONTEXT.md` — CampTrails positioning (first in PRACTICE, before Review)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `SIDEBAR_NAVIGATION` in routes.ts — currently a flat array derived from DASHBOARD_ROUTES. Needs group metadata to support sections
- `SidebarItem` component in Sidebar.tsx — renders individual nav links with active state, tooltips, icon box. Can be reused as-is within groups
- `ICON_BOX` constant — 32px box for icon alignment, reusable for group label left-alignment

### Established Patterns
- Route config is the single source of truth — sidebar reads from it, page titles read from it
- `cn()` utility for conditional class merging
- Opacity transition for text on collapse/expand (lines 128-133 in Sidebar.tsx)

### Integration Points
- `src/lib/routes.ts` — add group metadata to RouteConfig or create GroupedRouteConfig
- `src/components/shared/Sidebar.tsx` — replace flat `SIDEBAR_NAVIGATION.map` with grouped rendering
- Admin "Dev Settings" link needs to stay after the groups (currently renders conditionally after nav)

</code_context>

<specifics>
## Specific Ideas

- User wants it to look like GitHub/Supabase — subtle section headers that create visual hierarchy without being heavy
- Settings as a full nav item at bottom is transitional — it will become a popover in Phase 7
- Group order (LEARN → PRACTICE → DATA) follows the study workflow: learn material → practice/test → review analytics

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-grouped-navigation*
*Context gathered: 2026-03-20*
