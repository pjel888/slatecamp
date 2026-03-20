# Requirements: SlateCamp Dashboard Sidebar Redesign

**Defined:** 2026-03-20
**Core Value:** The sidebar must feel immediately professional -- like a serious product built for working adults preparing for licensure exams.

## v1 Requirements

### Navigation Structure

- [x] **NAV-01**: Navigation items grouped into labeled sections (LEARN, PRACTICE, DATA)
- [x] **NAV-02**: Dashboard rendered as standalone top-level item (category-level visual weight)
- [x] **NAV-03**: LEARN group contains: Wiki, Notes, 3D Lab
- [x] **NAV-04**: PRACTICE group contains: CampTrails, Review
- [x] **NAV-05**: DATA group contains: Analytics
- [x] **NAV-06**: "Testing" renamed to "Review" in sidebar label
- [x] **NAV-07**: CampTrails nav link added (route stub at /dashboard/camptrails)
- [ ] **NAV-08**: Group labels hidden when collapsed, visible when expanded
- [ ] **NAV-09**: Active route indicator maintained across all states

### Overlay Behavior

- [x] **OVR-01**: Collapsed state is a 72px icon-only rail permanently in document flow
- [x] **OVR-02**: Expanded state renders as fixed-position overlay (no content push/shift)
- [x] **OVR-03**: Subtle backdrop scrim behind expanded overlay
- [x] **OVR-04**: Click outside overlay to collapse
- [x] **OVR-05**: Escape key collapses overlay
- [x] **OVR-06**: Auto-collapse on navigation (route change)
- [x] **OVR-07**: Collapse/expand toggle button accessible in both states

### User Profile & Account

- [x] **ACC-01**: Avatar + display name + tier badge shown at top of sidebar (below logo)
- [x] **ACC-02**: ~~Account popover at bottom~~ Settings is a plain nav link in footer (user decision: no popover, no ThemeToggle)
- [x] **ACC-03**: ~~Account popover uses DropdownMenu~~ No popover needed (user decision: Settings is a SidebarNavItem link)
- [x] **ACC-04**: Tier badge displays current plan (free, pro, max, institutional, educational, corporate)

### Freemium & Monetization

- [x] **FRM-01**: Upgrade CTA card pinned above Settings link (freemium users only)
- [x] **FRM-02**: Ad/partner slot in same position (future-ready, documented via component comment)

### Visual Polish

- [x] **VIS-01**: Text sizes reduced to professional density (13px labels, 11px group headers)
- [x] **VIS-02**: Spacing tightened -- compact padding matching GitHub/Supabase density
- [x] **VIS-03**: Smooth transitions max 300ms (Campfire design system)
- [x] **VIS-04**: Respects prefers-reduced-motion
- [x] **VIS-05**: Tooltips on collapsed rail icons
- [x] **VIS-06**: Z-index scale established (rail, overlay, backdrop, tooltips, dialogs)

### Accessibility

- [x] **A11-01**: Focus trapped within overlay when expanded
- [x] **A11-02**: Focus returns to toggle button on collapse
- [x] **A11-03**: `aria-expanded` on toggle, proper landmark roles
- [x] **A11-04**: Main content marked `inert` when overlay is open
- [x] **A11-05**: Full keyboard navigation within sidebar sections

## v2 Requirements

### Enhanced Interactions

- **INT-01**: Hover-to-expand on collapsed rail (with configurable delay)
- **INT-02**: Mobile responsive sidebar (hamburger menu / Sheet-based drawer)
- **INT-03**: Sidebar search / command palette integration
- **INT-04**: Notification badges on nav items

## Out of Scope

| Feature | Reason |
|---------|--------|
| CampTrails page implementation | Only the nav link and route stub -- page is a separate effort |
| Nested flyout submenus | Over-engineered for 7 routes, anti-pattern per research |
| Drag-to-reorder nav items | Complexity without value for fixed navigation structure |
| Sidebar search | cmdk command palette already handles global search |
| Mobile sidebar | Separate effort requiring different UX patterns (Sheet) |
| Notification badges | Needs notification system first (v2+) |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| NAV-01 | Phase 2 | Complete |
| NAV-02 | Phase 2 | Complete |
| NAV-03 | Phase 2 | Complete |
| NAV-04 | Phase 2 | Complete |
| NAV-05 | Phase 2 | Complete |
| NAV-06 | Phase 1 | Complete |
| NAV-07 | Phase 1 | Complete |
| NAV-08 | Phase 2 | Pending |
| NAV-09 | Phase 2 | Pending |
| OVR-01 | Phase 3 | Complete |
| OVR-02 | Phase 4 | Complete |
| OVR-03 | Phase 4 | Complete |
| OVR-04 | Phase 5 | Complete |
| OVR-05 | Phase 5 | Complete |
| OVR-06 | Phase 5 | Complete |
| OVR-07 | Phase 3 | Complete |
| ACC-01 | Phase 3 | Complete |
| ACC-02 | Phase 3 | Complete (overridden) |
| ACC-03 | Phase 3 | Complete (overridden) |
| ACC-04 | Phase 3 | Complete |
| FRM-01 | Phase 3 | Complete |
| FRM-02 | Phase 3 | Complete |
| VIS-01 | Phase 9 | Complete |
| VIS-02 | Phase 9 | Complete |
| VIS-03 | Phase 9 | Complete |
| VIS-04 | Phase 9 | Complete |
| VIS-05 | Phase 9 | Complete |
| VIS-06 | Phase 9 | Complete |
| A11-01 | Phase 10 | Complete |
| A11-02 | Phase 10 | Complete |
| A11-03 | Phase 10 | Complete |
| A11-04 | Phase 10 | Complete |
| A11-05 | Phase 10 | Complete |

**Coverage:**
- v1 requirements: 33 total
- Mapped to phases: 33
- Unmapped: 0

---
*Requirements defined: 2026-03-20*
*Last updated: 2026-03-20 after roadmap phase mapping*
