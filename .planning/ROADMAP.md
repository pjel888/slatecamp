# Roadmap: SlateCamp Dashboard Sidebar Redesign

## Overview

Transform the current amateur push-model sidebar into a professional, GitHub/Supabase-quality navigation system. The work progresses from foundational route changes through structural reorganization, overlay architecture, user-facing features (profile, account, monetization), visual refinement, and accessibility hardening. Each phase delivers a verifiable capability that builds on the previous.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Route Foundation** - Rename Testing to Review, add CampTrails route stub and nav link
- [ ] **Phase 2: Grouped Navigation** - Organize nav items into labeled LEARN, PRACTICE, DATA sections with Dashboard standalone
- [ ] **Phase 3: Collapsed Rail** - Build the polished 72px icon-only rail as the permanent in-flow sidebar state
- [ ] **Phase 4: Overlay Expand** - Convert expanded sidebar from push model to fixed-position overlay with backdrop
- [ ] **Phase 5: Overlay Interactions** - Wire click-outside, Escape key, and auto-collapse on navigation
- [ ] **Phase 6: User Profile Display** - Avatar, display name, and tier badge at the top of the sidebar
- [ ] **Phase 7: Account Popover** - Bottom account popover with settings link, theme toggle, and logout
- [ ] **Phase 8: Freemium CTA** - Upgrade card pinned above account popover for free-tier users, future ad slot
- [ ] **Phase 9: Visual Polish** - Professional density (typography, spacing), transitions, z-index scale, tooltips
- [ ] **Phase 10: Accessibility** - Focus trap, focus return, aria attributes, inert content, full keyboard navigation

## Phase Details

### Phase 1: Route Foundation
**Goal**: Users see "Review" instead of "Testing" and can navigate to CampTrails
**Depends on**: Nothing (first phase)
**Requirements**: NAV-06, NAV-07
**Success Criteria** (what must be TRUE):
  1. Sidebar displays "Review" where it previously said "Testing" and the route works
  2. CampTrails appears in the sidebar and navigates to /dashboard/camptrails (stub page renders)
  3. All existing sidebar links continue to work without regression
**Plans**: TBD

Plans:
- [ ] 01-01: TBD
- [ ] 01-02: TBD

### Phase 2: Grouped Navigation
**Goal**: Users see navigation organized into clear sections that communicate information architecture
**Depends on**: Phase 1
**Requirements**: NAV-01, NAV-02, NAV-03, NAV-04, NAV-05, NAV-08, NAV-09
**Success Criteria** (what must be TRUE):
  1. Dashboard link renders at the top as a standalone item with category-level visual weight
  2. Navigation items are visually grouped under LEARN (Wiki, Notes, 3D Lab), PRACTICE (CampTrails, Review), and DATA (Analytics) labels
  3. Group labels are visible when sidebar is expanded and hidden when collapsed
  4. Active route highlighting works correctly for all items including Dashboard and items within groups
**Plans**: TBD

Plans:
- [ ] 02-01: TBD
- [ ] 02-02: TBD

### Phase 3: Collapsed Rail
**Goal**: The collapsed sidebar is a polished, permanent icon rail that feels intentional rather than an afterthought
**Depends on**: Phase 2
**Requirements**: OVR-01, OVR-07
**Success Criteria** (what must be TRUE):
  1. Collapsed sidebar renders as a 72px-wide vertical icon rail that stays in normal document flow
  2. A clearly accessible toggle button exists to switch between collapsed and expanded states
  3. The rail feels finished: icons are centered, spacing is even, visual weight is balanced
**Plans**: TBD

Plans:
- [ ] 03-01: TBD

### Phase 4: Overlay Expand
**Goal**: Expanded sidebar opens as an overlay without pushing or shifting main content
**Depends on**: Phase 3
**Requirements**: OVR-02, OVR-03
**Success Criteria** (what must be TRUE):
  1. Expanding the sidebar does not cause any layout shift in the main content area
  2. Expanded sidebar renders as a fixed-position overlay on top of the page content
  3. A subtle backdrop scrim is visible behind the overlay, dimming the content area
  4. The main content remains fully visible (scrolled position, state) underneath the overlay
**Plans**: TBD

Plans:
- [ ] 04-01: TBD

### Phase 5: Overlay Interactions
**Goal**: Users can dismiss the overlay through natural interaction patterns they expect from professional UIs
**Depends on**: Phase 4
**Requirements**: OVR-04, OVR-05, OVR-06
**Success Criteria** (what must be TRUE):
  1. Clicking anywhere outside the expanded sidebar overlay collapses it
  2. Pressing Escape while the overlay is open collapses it
  3. Navigating to a new route (clicking a sidebar link) auto-collapses the overlay
**Plans**: TBD

Plans:
- [ ] 05-01: TBD

### Phase 6: User Profile Display
**Goal**: Users see their identity (avatar, name, plan tier) reflected in the sidebar
**Depends on**: Phase 4
**Requirements**: ACC-01, ACC-04
**Success Criteria** (what must be TRUE):
  1. User avatar (with fallback initials) and display name appear at the top of the sidebar below the logo
  2. Tier badge displays the user's current plan (free, pro, max, institutional, educational, corporate)
  3. Profile area adapts between collapsed (avatar only) and expanded (avatar + name + badge) states
**Plans**: TBD

Plans:
- [ ] 06-01: TBD

### Phase 7: Account Popover
**Goal**: Users access account actions from a professional bottom-anchored popover instead of inline nav items
**Depends on**: Phase 6
**Requirements**: ACC-02, ACC-03
**Success Criteria** (what must be TRUE):
  1. Clicking the bottom account trigger opens a popover with settings link, theme toggle, and logout
  2. Popover uses shadcn DropdownMenu for full keyboard navigation support
  3. Popover works correctly in both collapsed rail and expanded overlay states
**Plans**: TBD

Plans:
- [ ] 07-01: TBD

### Phase 8: Freemium CTA
**Goal**: Free-tier users see a non-intrusive upgrade prompt that supports monetization without disrupting navigation
**Depends on**: Phase 7
**Requirements**: FRM-01, FRM-02
**Success Criteria** (what must be TRUE):
  1. Free-tier users see an upgrade CTA card pinned directly above the account popover area
  2. Paid/upgraded users do not see the CTA card (clean sidebar)
  3. The CTA slot is structured to accommodate a future partner ad placement without code changes
**Plans**: TBD

Plans:
- [ ] 08-01: TBD

### Phase 9: Visual Polish
**Goal**: The sidebar achieves professional density and motion quality matching GitHub/Supabase reference UIs
**Depends on**: Phase 5, Phase 8
**Requirements**: VIS-01, VIS-02, VIS-03, VIS-04, VIS-05, VIS-06
**Success Criteria** (what must be TRUE):
  1. Nav labels render at 13px, group headers at 11px -- professional density, not cramped
  2. Padding and spacing match the tightness of GitHub/Supabase sidebars (compact, not airy)
  3. All sidebar transitions (expand/collapse, hover states) complete within 300ms with ease-out
  4. Users with prefers-reduced-motion see instant state changes with no animation
  5. Collapsed rail icons show tooltips on hover identifying each nav item
  6. Z-index scale is established so rail, overlay, backdrop, tooltips, and dialogs layer correctly
**Plans**: TBD

Plans:
- [ ] 09-01: TBD
- [ ] 09-02: TBD

### Phase 10: Accessibility
**Goal**: Keyboard and screen reader users can navigate the sidebar with the same effectiveness as mouse users
**Depends on**: Phase 9
**Requirements**: A11-01, A11-02, A11-03, A11-04, A11-05
**Success Criteria** (what must be TRUE):
  1. When the overlay is expanded, focus is trapped within it (Tab does not escape to content behind)
  2. When the overlay collapses, focus returns to the toggle button that opened it
  3. Toggle button has aria-expanded, sidebar uses proper nav landmark role
  4. Main content area is marked inert when overlay is open (prevents interaction behind overlay)
  5. All sidebar sections, groups, and items are navigable via Tab and arrow keys
**Plans**: TBD

Plans:
- [ ] 10-01: TBD
- [ ] 10-02: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7 -> 8 -> 9 -> 10

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Route Foundation | 0/2 | Not started | - |
| 2. Grouped Navigation | 0/2 | Not started | - |
| 3. Collapsed Rail | 0/1 | Not started | - |
| 4. Overlay Expand | 0/1 | Not started | - |
| 5. Overlay Interactions | 0/1 | Not started | - |
| 6. User Profile Display | 0/1 | Not started | - |
| 7. Account Popover | 0/1 | Not started | - |
| 8. Freemium CTA | 0/1 | Not started | - |
| 9. Visual Polish | 0/2 | Not started | - |
| 10. Accessibility | 0/2 | Not started | - |
