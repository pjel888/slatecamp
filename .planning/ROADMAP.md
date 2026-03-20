# Roadmap: SlateCamp Dashboard Sidebar Redesign

## Overview

Transform the current sidebar into a professional, GitHub/Supabase-quality navigation system with overlay expand, grouped nav, account popover, freemium CTA, and polished density.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Route Foundation** - Rename Testing to Review, add CampTrails route stub and nav link ✓ 2026-03-20
- [x] **Phase 2: Grouped Navigation** - Organize nav items into labeled LEARN, PRACTICE, DATA sections with Dashboard standalone ✓ 2026-03-20
- [ ] **Phase 3: Complete Sidebar** - Overlay expand, user profile, freemium CTA, visual polish, accessibility

## Phase Details

### Phase 1: Route Foundation
**Goal**: Users see "Review" instead of "Testing" and can navigate to CampTrails
**Depends on**: Nothing (first phase)
**Requirements**: NAV-06, NAV-07
**Success Criteria** (what must be TRUE):
  1. Sidebar displays "Review" where it previously said "Testing" and the route works
  2. CampTrails appears in the sidebar and navigates to /dashboard/camptrails (stub page renders)
  3. All existing sidebar links continue to work without regression
**Plans**: 1 plan

Plans:
- [x] 01-01-PLAN.md -- Rename Testing to Review across codebase + add CampTrails nav link and stub page

### Phase 2: Grouped Navigation
**Goal**: Users see navigation organized into clear sections that communicate information architecture
**Depends on**: Phase 1
**Requirements**: NAV-01, NAV-02, NAV-03, NAV-04, NAV-05, NAV-08, NAV-09
**Success Criteria** (what must be TRUE):
  1. Dashboard link renders at the top as a standalone item with category-level visual weight
  2. Navigation items are visually grouped under LEARN (Wiki, Notes, 3D Lab), PRACTICE (CampTrails, Review), and DATA (Analytics) labels
  3. Group labels are visible when sidebar is expanded and hidden when collapsed
  4. Active route highlighting works correctly for all items including Dashboard and items within groups
**Plans**: 2 plans

Plans:
- [x] 02-01-PLAN.md -- Extend RouteConfig with group metadata, derive GROUPED_NAVIGATION, TDD with unit tests
- [x] 02-02-PLAN.md -- Replace flat sidebar rendering with grouped sections, pin Settings to bottom, visual checkpoint

### Phase 3: Complete Sidebar
**Goal**: The sidebar is a fully professional, overlay-based navigation system with user profile, Settings page link, freemium CTA, Supabase-level density, and full accessibility
**Depends on**: Phase 2
**Requirements**: OVR-01, OVR-02, OVR-03, OVR-04, OVR-05, OVR-06, OVR-07, ACC-01, ACC-02, ACC-03, ACC-04, FRM-01, FRM-02, VIS-01, VIS-02, VIS-03, VIS-04, VIS-05, VIS-06, A11-01, A11-02, A11-03, A11-04, A11-05
**Success Criteria** (what must be TRUE):
  1. Collapsed sidebar is a polished 72px icon rail in document flow
  2. Expanded sidebar opens as a fixed-position overlay -- zero layout shift in main content
  3. Subtle backdrop scrim behind overlay, click-outside/Escape/route-change to dismiss
  4. User avatar + name + tier badge displayed at top of sidebar
  5. Bottom area: Settings page link (NO popover, NO ThemeToggle)
  6. Freemium CTA card above Settings link (free users only), future ad slot ready
  7. Professional density: 13px nav labels, 11px group headers, tight spacing matching Supabase
  8. All transitions max 300ms, respects prefers-reduced-motion
  9. Tooltips on collapsed rail icons
  10. Z-index scale for rail, overlay, backdrop, tooltips, dialogs
  11. Focus trap in overlay, focus return on collapse, aria-expanded, inert on main content
  12. Full keyboard navigation within sidebar
**Plans**: 5 plans

Plans:
- [ ] 03-01-PLAN.md -- SidebarProvider context, shared types, z-index scale (foundation)
- [ ] 03-02-PLAN.md -- SidebarNavItem, SidebarNavGroup, SidebarRail (72px icon rail)
- [ ] 03-03-PLAN.md -- SidebarOverlay with AnimatePresence, SidebarPanel, SidebarHeader
- [ ] 03-04-PLAN.md -- SidebarUserProfile, SidebarUpgradeCTA, SidebarFooter
- [ ] 03-05-PLAN.md -- Layout wiring, SidebarShell, ThemeToggle migration to Settings page

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Route Foundation | 1/1 | Complete | 2026-03-20 |
| 2. Grouped Navigation | 2/2 | Complete | 2026-03-20 |
| 3. Complete Sidebar | 0/5 | Not started | - |
