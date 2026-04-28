# Accessibility Audit

**Last Updated:** 2026-04-28
**Target:** WCAG 2.2 AA where practical

## Issues Found

### Semantic HTML & Headings

| Issue | Location | WCAG | Severity | Evidence |
|-------|----------|------|----------|----------|
| No `<h1>` on developer pages — `SectionHeader level="page"` renders `<h2>` | All `/developer/*` pages | 1.3.1 Info and Relationships | Medium | `src/app/developer/page.tsx`, `src/app/developer/status/page.tsx`, etc. |
| Tables in tech stack and architecture lack `<caption>` | `/developer`, `/developer/architecture` | 1.3.1 Info and Relationships | Low | `src/app/developer/page.tsx:196`, `src/app/developer/architecture/page.tsx` |

### Interactive Controls

| Issue | Location | WCAG | Severity | Evidence |
|-------|----------|------|----------|----------|
| `EndpointCard` uses `<div onClick>` — not keyboard reachable | `/developer/api-reference` | 2.1.1 Keyboard | High | `src/app/developer/_components/EndpointCard.tsx:52` |
| `EndpointCard` lacks `aria-expanded` | `/developer/api-reference` | 4.1.2 Name, Role, Value | High | `src/app/developer/_components/EndpointCard.tsx` |
| `DevPortalSearch` trigger button lacks accessible name | `/developer` | 2.4.4 Link Purpose (In Context) | Medium | `src/app/developer/_components/DevPortalSearch.tsx:13` |
| `DevPortalSearch` trigger has no visible focus indicator | `/developer` | 2.4.7 Focus Visible | Medium | `src/app/developer/_components/DevPortalSearch.tsx` |
| Test data generator uses raw `<button>` without focus styling | `/developer/tools/test-data` | 2.4.7 Focus Visible | Low | `src/app/developer/tools/test-data/test-data-client.tsx` |

### Form Labels & ARIA

| Issue | Location | WCAG | Severity | Evidence |
|-------|----------|------|----------|----------|
| `DataTable` search input may lack label association (needs verification) | `/developer/tools/db`, `/developer/tools/logs` | 3.3.2 Labels or Instructions | Low | `src/components/shared/data-table.tsx` |

### Color & Contrast

| Issue | Location | WCAG | Severity | Evidence |
|-------|----------|------|----------|----------|
| `StatusBadge` uses color + icon + text (good triple coding) | All status pages | 1.4.1 Use of Color | Good | `src/components/developer/StatusBadge.tsx` |
| `UptimeBar` uses color alone for status | `/developer/status` | 1.4.1 Use of Color | Medium | `src/components/developer/UptimeBar.tsx` |
| Connection pool bar uses color alone (with `title` only) | `/developer/status/database` | 1.4.1 Use of Color | Low | `src/app/developer/status/database/page.tsx` |

### Screen Reader Support

| Issue | Location | WCAG | Severity | Evidence |
|-------|----------|------|----------|----------|
| `UptimeBar` day segments have no `aria-label` | `/developer/status` | 1.1.1 Non-text Content | Medium | `src/components/developer/UptimeBar.tsx:30` |
| `SurfaceTruthNotice` badge is purely decorative but not marked | Status pages | 1.1.1 Non-text Content | Low | `src/components/developer/SurfaceTruthNotice.tsx` |

### Focus Management

| Issue | Location | WCAG | Severity | Evidence |
|-------|----------|------|----------|----------|
| No skip link for main content | All pages | 2.4.1 Bypass Blocks | Low | Layout has no skip nav |
| No focus return after modal/dialog (if any) | N/A | 2.4.3 Focus Order | N/A | No modals in developer surface |

## Positive Accessibility Findings

1. **StatusBadge** uses three signals (dot color + icon + text label) — excellent accessibility
2. **StatusBanner** uses icon + text + background color — good multi-modal signaling
3. **DataTable** has sortable headers with visible indicators
4. **Error boundary** provides clear message and retry action
5. **Breadcrumbs** provide clear navigation context on nested pages

## Recommended Fixes

### P1 — High Impact
1. **Make `EndpointCard` keyboard accessible** — change `<div onClick>` to `<button>` or add `role="button"`, `tabIndex={0}`, `onKeyDown` handler, and `aria-expanded`
2. **Add `aria-label` to `DevPortalSearch` trigger** — e.g., "Open search command palette"
3. **Ensure every page has an `<h1>`** — change `SectionHeader level="page"` to render `h1` or add hidden `h1`

### P2 — Medium Impact
4. **Add `aria-label` to `UptimeBar` day segments** — e.g., "Operational on 2026-04-28"
5. **Add visible focus indicator to `DevPortalSearch` trigger**
6. **Add `aria-label` to connection pool bar segments**

### P3 — Low Impact
7. **Add skip link to layout**
8. **Add `<caption>` to data tables**
9. **Replace raw buttons with design system Button for consistent focus states**

## Test Methods

| Test | Method | Coverage |
|------|--------|----------|
| Keyboard navigation | Manual tab-through | All interactive elements |
| Screen reader headings | NVDA/VoiceOver rotor | Heading hierarchy |
| Color contrast | axe DevTools | Text against backgrounds |
| ARIA validation | axe DevTools | Roles, states, properties |
