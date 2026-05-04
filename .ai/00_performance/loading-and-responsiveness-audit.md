# Loading and Responsiveness Audit

**Last Updated:** 2026-05-04

## Findings
- Loading coverage exists across most route surfaces, but perceived responsiveness still depends on client-work and data-fetch density.
- Admin editors, analytics views, quiz shells, and 3D Lab modules are the most likely responsiveness chokepoints.
- `useLabTelemetry`, `useGuidedSequence`, quiz stores, and timer stores show heavy client-side orchestration.

## Practical priorities
1. audit expensive client trees on dashboard/admin/3D routes
2. audit duplicate fetches in action/query consumers
3. keep route loading coverage aligned with real async boundaries

## Navigation Feedback Coverage (2026-05-04)
Navigation pending state has been implemented as a centralized system:

### Components updated
- **`NavigationProgress`** — existing top-of-page progress bar continues working (unchanged)
- **`useNavigationPendingStore`** — new Zustand store at `src/stores/useNavigationPendingStore.ts` tracks pending navigation state
- **`useNavigationPending`** — new hook at `src/hooks/useNavigationPending.ts` wraps the store with pathname-change detection and a 10s fallback timeout
- **`SidebarNavItem`** — updated to show a spinner when its link is pending, disable other nav items during navigation
- **`MobileDrawer`** / `MobileNavItem` — same pending-state integration for mobile nav
- **`Sidebar.tsx`** — uses `useNavigationPending()` hook and passes state to all nav items
- **`MobileDrawer.tsx`** — uses `useNavigationPending()` hook and passes state to all mobile nav items

### UX behavior
- Clicked sidebar link shows an inline spinner replacing the icon
- Other sidebar links are disabled (opacity-40, pointer-events-none, aria-disabled)
- `cursor: progress` is applied to `document.body` during navigation
- Pending state clears automatically on pathname change
- 10s fallback timeout prevents stuck pending state
- `aria-disabled`, `aria-busy`, `aria-current` are used correctly
- Screen readers get a visually hidden "Loading {label}…" announcement
- Reduced motion disables the spinner animation
