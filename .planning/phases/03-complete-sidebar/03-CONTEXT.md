# Phase 3: Complete Sidebar - Context

**Gathered:** 2026-03-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the complete professional sidebar: overlay expand model, user profile display, account bottom link (NOT popover), freemium CTA card, Supabase-level visual density, and full accessibility. This is the final phase.

</domain>

<decisions>
## Implementation Decisions

### Overlay Architecture
- Collapsed: 72px icon rail permanently in document flow
- Expanded: fixed-position overlay on top of content — zero layout shift
- Backdrop: medium opacity (25-30%), visually dims content behind overlay
- Dismiss: click outside, Escape key, route change all collapse the overlay
- Toggle button accessible in both states

### Sidebar Bottom Area
- NO account popover — account settings has its own page
- Bottom of sidebar: just the Settings nav link (gear icon + "Settings" label)
- Theme toggle REMOVED from sidebar entirely — it lives inside the Settings page
- Remove ThemeToggle component import and rendering from Sidebar.tsx

### User Profile Display (top of sidebar)
- Avatar + display name + tier badge shown below logo area
- Collapsed: avatar only
- Expanded: avatar + name + tier badge
- Tier badge shows: free, pro, max, institutional, educational, corporate

### Freemium CTA Card
- Feature teaser card: small card listing 2-3 pro features + upgrade button
- Positioned above the Settings link at bottom
- Visible only for free-tier users; paid users see clean sidebar
- Collapsed state: small sparkle/upgrade icon; expanded: full card
- Future-ready slot for partner ads

### Visual Density (Supabase-level)
- Nav labels: 13px, tight leading
- Group headers: 11px uppercase, tracking-wider, Ink Tertiary
- Compact padding: py-[5px] on nav items, space-y-px between items
- All transitions max 300ms, ease-out
- prefers-reduced-motion: instant state changes, no animation
- Tooltips on all collapsed rail icons
- Z-index scale: rail < backdrop < overlay < tooltips < dialogs

### Accessibility
- Focus trapped within overlay when expanded
- Focus returns to toggle button on collapse
- aria-expanded on toggle button
- nav landmark role on sidebar
- Main content marked inert when overlay is open
- Full keyboard navigation (Tab + arrow keys) within sidebar

### Claude's Discretion
- Exact z-index values for the scale
- AnimatePresence vs CSS-only for overlay enter/exit
- Exact CTA card copy (follow Campfire voice: growth-framed, no "dominate/conquer")
- Whether to use Framer Motion or pure CSS for backdrop fade

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Route Configuration
- `src/lib/routes.ts` — GROUPED_NAVIGATION, RouteConfig with group field, NAV_GROUPS
- `src/lib/constants/routes.ts` — ROUTES constants

### Sidebar Component
- `src/components/shared/Sidebar.tsx` — Current sidebar (grouped nav, needs overlay conversion)

### Dashboard Layout
- `src/app/dashboard/layout.tsx` — Sidebar is a flex child; needs to stay in flow for rail, overlay escapes flow

### Design System
- `CLAUDE.md` — Campfire tokens, shadows, radii, transitions, voice guide

### Research (project-level)
- `.planning/research/ARCHITECTURE.md` — Two-layer rail + overlay architecture pattern
- `.planning/research/PITFALLS.md` — Focus management, z-index, hydration pitfalls
- `.planning/research/STACK.md` — Use DropdownMenu for menus, no new libraries

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `GROUPED_NAVIGATION` — already structured with dashboard/groups/settings
- `SidebarItem` — renders individual nav links, works for both rail and overlay
- `Avatar`, `AvatarFallback`, `AvatarImage` — already imported in Sidebar.tsx
- `TierBadge` component — already imported, displays user tier
- `ThemeToggle` — currently in sidebar footer, needs to be REMOVED (moves to settings page)
- Framer Motion 12.35 installed — available for AnimatePresence overlay transitions

### Established Patterns
- Icon alignment: 32px box + 20px left padding = centered in 72px rail (DO NOT CHANGE)
- Opacity fade for text on collapse/expand
- Fixed h-8 group spacers for icon position stability
- localStorage for collapse state persistence

### Integration Points
- `src/app/dashboard/layout.tsx` line 100: `border-l border-border` on content div — may need adjustment for overlay model
- `src/components/shared/Sidebar.tsx` — main file to rewrite
- Remove ThemeToggle from sidebar, ensure it exists in settings page

</code_context>

<specifics>
## Specific Ideas

- User explicitly referenced GitHub and Supabase as quality targets
- NO popover for account — user was emphatic that account settings is a page, not a popover
- Theme toggle does NOT belong in the sidebar — it belongs in the Settings page
- CTA should tease pro features (not just a button)
- Collapsed CTA shows a small icon (sparkle/upgrade), expanded shows full card

</specifics>

<deferred>
## Deferred Ideas

None — this is the final phase

</deferred>

---

*Phase: 03-complete-sidebar*
*Context gathered: 2026-03-20*
