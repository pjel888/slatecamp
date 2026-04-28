# UX/UI Audit

**Last Updated:** 2026-04-28

## Heuristic Review

### 1. Visibility of System Status

| Issue | Location | Severity | Evidence |
|-------|----------|----------|----------|
| Uptime bars repeat current status instead of showing real history | `/developer/status` | Low | `src/app/developer/status/page.tsx:127` |
| Test data generation shows only text message, no progress indicator | `/developer/tools/test-data` | Low | `src/app/developer/tools/test-data/test-data-client.tsx` |
| Console system info updates only on page load | `/developer/tools/console` | Low | `src/app/developer/tools/console/page.tsx` |

### 2. Match Between System and Real-World Developer Language

| Issue | Location | Severity | Evidence |
|-------|----------|----------|----------|
| Architecture page uses static data that may drift from live code | `/developer/architecture` | Low | `src/lib/developer/architecture-data.ts` |
| API reference server actions table lists generic function signatures | `/developer/api-reference` | Low | `src/lib/developer/api-reference-data.ts` |

### 3. User Control and Freedom

| Issue | Location | Severity | Evidence |
|-------|----------|----------|----------|
| Test data generation has no confirmation or undo | `/developer/tools/test-data` | Medium | `src/app/developer/tools/test-data/test-data-client.tsx` |
| EndpointCard expansion cannot be closed with Escape key | `/developer/api-reference` | Medium | `src/app/developer/_components/EndpointCard.tsx` |

### 4. Consistency and Standards

| Issue | Location | Severity | Evidence |
|-------|----------|----------|----------|
| TestDataClient uses raw `<button>` instead of design system Button | `/developer/tools/test-data` | Low | `src/app/developer/tools/test-data/test-data-client.tsx:67` |
| Status pages use `SectionHeader level="page"` which renders `h2`, not `h1` | All status pages | Medium | Multiple files |
| DevPortalSearch uses custom styled button instead of design system | `/developer` | Low | `src/app/developer/_components/DevPortalSearch.tsx` |

### 5. Error Prevention

| Issue | Location | Severity | Evidence |
|-------|----------|----------|----------|
| Test data generator creates real DB rows without confirmation | `/developer/tools/test-data` | Medium | `src/lib/actions/dev/test-data.ts` |
| No rate limiting on test data generation | `/developer/tools/test-data` | Medium | `src/lib/actions/dev/test-data.ts` |

### 6. Recognition Rather Than Recall

| Issue | Location | Severity | Evidence |
|-------|----------|----------|----------|
| Sidebar navigation is clear and persistent | All pages | Good | `src/app/developer/_components/DevPortalShell.tsx` |
| Command palette search available | All pages | Good | `src/app/developer/_components/DevPortalSearch.tsx` |

### 7. Flexibility and Efficiency

| Issue | Location | Severity | Evidence |
|-------|----------|----------|----------|
| Command palette provides keyboard shortcut (⌘K) | All pages | Good | `src/app/developer/_components/DevPortalSearch.tsx` |
| DataTable supports sort and search on DB browser and logs | `/developer/tools/db`, `/developer/tools/logs` | Good | `src/components/shared/data-table.tsx` |

### 8. Minimalism

| Issue | Location | Severity | Evidence |
|-------|----------|----------|----------|
| Overview page has many sections but clear hierarchy | `/developer` | Low | `src/app/developer/page.tsx` |
| API reference tabs prevent overwhelming single page | `/developer/api-reference` | Good | `src/app/developer/api-reference/page.tsx` |

### 9. Error Diagnosis and Recovery

| Issue | Location | Severity | Evidence |
|-------|----------|----------|----------|
| Error boundary shows digest ID and retry button | All pages | Good | `src/app/developer/error.tsx` |
| Logs page gracefully handles audit log unavailability | `/developer/tools/logs` | Good | `src/app/developer/tools/logs/page.tsx` |
| Test data error messages are generic | `/developer/tools/test-data` | Low | `src/app/developer/tools/test-data/test-data-client.tsx` |

### 10. Help and Documentation

| Issue | Location | Severity | Evidence |
|-------|----------|----------|----------|
| SurfaceTruthNotice documents data provenance | Status pages | Good | `src/components/developer/SurfaceTruthNotice.tsx` |
| Architecture page serves as self-documentation | `/developer/architecture` | Good | `src/app/developer/architecture/page.tsx` |

## Navigation Clarity

- **Sidebar:** 5 groups (Portal, Documentation, Status, Tools) with clear labels and icons
- **Breadcrumbs:** Present on nested routes (status/*, tools/*)
- **Back to Dashboard:** Available via PortalLayout

## Responsive Behavior

- **Grid layouts:** Use `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` and similar responsive patterns
- **DataTable:** Responsive with hidden columns on smaller screens
- **No mobile-specific issues identified** beyond standard data table behavior

## Visual Consistency

- **Typography:** Consistent use of `font-[family-name:var(--font-dm-mono)]` for technical text
- **Color:** Status colors (emerald/amber/red) used consistently across StatusBadge, StatusBanner, UptimeBar
- **Spacing:** Card-based layout with consistent gap-3/gap-4 spacing

## Recommended Fixes

1. **Add confirmation dialog to test data generation** (P1)
2. **Fix EndpointCard keyboard accessibility** (P1)
3. **Replace raw buttons with design system Button** (P2)
4. **Ensure h1 heading on every page** (P2)
5. **Add Escape key handling to EndpointCard** (P2)
