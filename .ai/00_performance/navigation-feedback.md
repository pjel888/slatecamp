# Navigation Feedback System

**Date:** 2026-05-04
**Status:** Implemented — integrates with sidebar, mobile drawer, and any link via `useNavigationPending`

## Overview

SlateCamp now has a centralized navigation pending system that provides immediate visual feedback when a user clicks a page-changing link (sidebar routes, dashboard navigation). The system is built on a Zustand store with a convenience React hook, and requires no rewrite of the existing sidebar/layout architecture.

## Architecture

### Store: `src/stores/useNavigationPendingStore.ts`

Pure Zustand store with no React context overhead. Exposes:

```
NavigationPendingState:
  pendingHref: string | null
  pendingId: string | null
  startedAt: number | null
  label: string | null

NavigationPendingActions:
  startNavigation(href, options?)
  finishNavigation()
  isPendingHref(href)  => boolean
  isNavigating()        => boolean
```

The store is accessible outside React hooks via `useNavigationPendingStore.getState()`.

### Hook: `src/hooks/useNavigationPending.ts`

Wraps the store with:
- **Pathname change detection** — automatically clears pending state when `usePathname` changes (navigation completed by the App Router)
- **Fallback timeout** — clears pending state after 10 seconds (`NAVIGATION_TIMEOUT_MS`) as a safety net
- **No-op guard** — if the clicked href matches the current route, the navigation is not started
- **`cursor-progress` body class** — added while navigating, removed on completion or error
- **Cleanup on unmount** — clears timeout and body class

### Type: `NavigationPendingInfo` (in `src/components/sidebar/types.ts`)

Interface for passing navigation pending state as a prop:
```
NavigationPendingInfo:
  isNavigating: boolean
  pendingHref: string | null
  pendingId: string | null
  isPendingHref(href): boolean
  startNavigation(href, options?)
  finishNavigation()
```

## Integration Points

### SidebarNavItem (`src/components/sidebar/SidebarNavItem.tsx`)
- Accepts optional `navigationPending?: NavigationPendingInfo` prop
- When `isPendingHref(href) === true`:
  - Icon is replaced with an inline CSS spinner (`animate-spin`)
  - Text gets a subtle highlight (`bg-primary-50/60`)
  - `cursor-progress` is applied to the link
  - `aria-busy="true"` is set
  - Screen readers get a hidden "Loading {label}…" announcement
- When `isNavigating === true` AND item is NOT the pending item:
  - `pointer-events-none`, `opacity-40`, `cursor-progress`
  - `aria-disabled="true"` is set
  - Click handler prevents navigation with `e.preventDefault()`
- The clicked link starts navigation via `navigationPending.startNavigation(href, { id })` on click

### MobileNavItem (`src/components/sidebar/MobileDrawer.tsx`)
- Same behavior as SidebarNavItem but for the mobile drawer

### Sidebar (`src/components/sidebar/Sidebar.tsx`)
- Calls `useNavigationPending()` hook
- Passes `navigationPending` to every `SidebarNavItem` instance

### MobileDrawer (`src/components/sidebar/MobileDrawer.tsx`)
- Calls `useNavigationPending()` hook
- Passes `navigationPending` to every `MobileNavItem` instance

## CSS

### `cursor-progress` (`src/app/globals.css`)
```
.cursor-progress,
.cursor-progress * {
  cursor: progress !important;
}
```
Applied to `document.body` during navigation. Also applied to disabled nav items so cursor feedback is visible on hover.

## Accessibility

| State | Attribute |
|---|---|
| Active route | `aria-current="page"` |
| Pending item | `aria-busy="true"` |
| Disabled item | `aria-disabled="true"` |
| Loading announcement | `<span class="sr-only" role="status" aria-live="polite">` |
| Reduced motion | Spinner has `motion-reduce:animate-none` |

## Safety Mechanisms

1. Pathname change → clears pending state (normal navigation)
2. 10s fallback timeout → clears pending state if navigation never completes
3. Same-href guard → does not start if href === current pathname
4. Unmount cleanup → clears timeout and body class
5. `e.preventDefault()` on disabled links → prevents phantom navigations

## What It Covers

- Sidebar route links (desktop)
- Mobile drawer navigation links
- Any component using `useNavigationPending()` + `NavigationPendingInfo`

## What It Does NOT Cover

- Dropdown toggles, tabs, accordions, modal buttons, filters — these trigger local state changes, not page navigation
- The existing `NavigationProgress` top bar continues working independently
- The existing `GlobalLoadingOverlay` (frosted-glass modal) is separate and unaffected

## Tests

- `src/stores/useNavigationPendingStore.test.ts` — 11 tests covering all store actions and edge cases
- Run with: `bun test src/stores/useNavigationPendingStore.test.ts`
