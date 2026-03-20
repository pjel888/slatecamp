# Requirements: SlateCamp Dashboard Sidebar Redesign

**Defined:** 2026-03-20
**Core Value:** The sidebar must feel immediately professional — like a serious product built for working adults preparing for licensure exams.

## v1 Requirements

### Navigation Structure

- [ ] **NAV-01**: Navigation items grouped into labeled sections (LEARN, PRACTICE, DATA)
- [ ] **NAV-02**: Dashboard rendered as standalone top-level item (category-level visual weight)
- [ ] **NAV-03**: LEARN group contains: Wiki, Notes, 3D Lab
- [ ] **NAV-04**: PRACTICE group contains: CampTrails, Review
- [ ] **NAV-05**: DATA group contains: Analytics
- [ ] **NAV-06**: "Testing" renamed to "Review" in sidebar label
- [ ] **NAV-07**: CampTrails nav link added (route stub at /dashboard/camptrails)
- [ ] **NAV-08**: Group labels hidden when collapsed, visible when expanded
- [ ] **NAV-09**: Active route indicator maintained across all states

### Overlay Behavior

- [ ] **OVR-01**: Collapsed state is a 72px icon-only rail permanently in document flow
- [ ] **OVR-02**: Expanded state renders as fixed-position overlay (no content push/shift)
- [ ] **OVR-03**: Subtle backdrop scrim behind expanded overlay
- [ ] **OVR-04**: Click outside overlay to collapse
- [ ] **OVR-05**: Escape key collapses overlay
- [ ] **OVR-06**: Auto-collapse on navigation (route change)
- [ ] **OVR-07**: Collapse/expand toggle button accessible in both states

### User Profile & Account

- [ ] **ACC-01**: Avatar + display name + tier badge shown at top of sidebar (below logo)
- [ ] **ACC-02**: Account popover at bottom (settings link, theme toggle, logout)
- [ ] **ACC-03**: Account popover uses DropdownMenu for keyboard nav support
- [ ] **ACC-04**: Tier badge displays current plan (free, pro, max, institutional, educational, corporate)

### Freemium & Monetization

- [ ] **FRM-01**: Upgrade CTA card pinned above account popover (freemium users only)
- [ ] **FRM-02**: Ad/partner slot in same position (future-ready, not implemented yet)

### Visual Polish

- [ ] **VIS-01**: Text sizes reduced to professional density (13px labels, 11px group headers)
- [ ] **VIS-02**: Spacing tightened — compact padding matching GitHub/Supabase density
- [ ] **VIS-03**: Smooth transitions max 300ms (Campfire design system)
- [ ] **VIS-04**: Respects prefers-reduced-motion
- [ ] **VIS-05**: Tooltips on collapsed rail icons
- [ ] **VIS-06**: Z-index scale established (rail, overlay, backdrop, tooltips, dialogs)

### Accessibility

- [ ] **A11-01**: Focus trapped within overlay when expanded
- [ ] **A11-02**: Focus returns to toggle button on collapse
- [ ] **A11-03**: `aria-expanded` on toggle, proper landmark roles
- [ ] **A11-04**: Main content marked `inert` when overlay is open
- [ ] **A11-05**: Full keyboard navigation within sidebar sections

## v2 Requirements

### Enhanced Interactions

- **INT-01**: Hover-to-expand on collapsed rail (with configurable delay)
- **INT-02**: Mobile responsive sidebar (hamburger menu / Sheet-based drawer)
- **INT-03**: Sidebar search / command palette integration
- **INT-04**: Notification badges on nav items

## Out of Scope

| Feature | Reason |
|---------|--------|
| CampTrails page implementation | Only the nav link and route stub — page is a separate effort |
| Nested flyout submenus | Over-engineered for 7 routes, anti-pattern per research |
| Drag-to-reorder nav items | Complexity without value for fixed navigation structure |
| Sidebar search | cmdk command palette already handles global search |
| Mobile sidebar | Separate effort requiring different UX patterns (Sheet) |
| Notification badges | Needs notification system first (v2+) |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| NAV-01 | TBD | Pending |
| NAV-02 | TBD | Pending |
| NAV-03 | TBD | Pending |
| NAV-04 | TBD | Pending |
| NAV-05 | TBD | Pending |
| NAV-06 | TBD | Pending |
| NAV-07 | TBD | Pending |
| NAV-08 | TBD | Pending |
| NAV-09 | TBD | Pending |
| OVR-01 | TBD | Pending |
| OVR-02 | TBD | Pending |
| OVR-03 | TBD | Pending |
| OVR-04 | TBD | Pending |
| OVR-05 | TBD | Pending |
| OVR-06 | TBD | Pending |
| OVR-07 | TBD | Pending |
| ACC-01 | TBD | Pending |
| ACC-02 | TBD | Pending |
| ACC-03 | TBD | Pending |
| ACC-04 | TBD | Pending |
| FRM-01 | TBD | Pending |
| FRM-02 | TBD | Pending |
| VIS-01 | TBD | Pending |
| VIS-02 | TBD | Pending |
| VIS-03 | TBD | Pending |
| VIS-04 | TBD | Pending |
| VIS-05 | TBD | Pending |
| VIS-06 | TBD | Pending |
| A11-01 | TBD | Pending |
| A11-02 | TBD | Pending |
| A11-03 | TBD | Pending |
| A11-04 | TBD | Pending |
| A11-05 | TBD | Pending |

**Coverage:**
- v1 requirements: 33 total
- Mapped to phases: 0
- Unmapped: 33

---
*Requirements defined: 2026-03-20*
*Last updated: 2026-03-20 after initial definition*
