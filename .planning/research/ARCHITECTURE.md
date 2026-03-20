# Architecture Patterns: Dashboard Overlay Sidebar

**Domain:** Professional dashboard sidebar (overlay expand, icon rail, grouped nav, account popover)
**Researched:** 2026-03-20

## Recommended Architecture

### The Two-Layer Model: Rail + Overlay Panel

The core architectural insight is that the sidebar is not one component with two visual states -- it is **two co-existing layers** that share a navigation data source.

**Layer 1: The Rail** -- Always visible, fixed position, icon-only vertical strip (72px wide). This is permanently mounted in the document flow alongside the main content area. It never moves, never animates, never causes layout shift.

**Layer 2: The Overlay Panel** -- Conditionally rendered on top of the rail and the content area. Uses `position: fixed` with a semi-transparent backdrop. Slides in from the left via `transform: translateX()` for GPU-accelerated animation. Dismissed by clicking outside (backdrop), pressing Escape, or clicking the collapse toggle.

This is the pattern GitHub uses: the rail is always there, the expanded sidebar floats over content. Supabase uses a similar concept with a slightly different visual treatment (no backdrop, but the panel still overlays content rather than pushing it).

```
COLLAPSED STATE (default):                 EXPANDED STATE (overlay):

+--------+---------------------------+    +--------+---------------------------+
|  Rail  |     Main Content          |    |  Rail  |     Main Content          |
| (72px) |                           |    | (72px) |     (dimmed backdrop)     |
|        |                           |    |  +-----|-----+                     |
| [logo] |                           |    |  | Overlay   |                     |
| [dash] |                           |    |  | Panel     |                     |
| [wiki] |                           |    |  | (260px)   |                     |
| [revw] |                           |    |  |           |                     |
| [note] |                           |    |  | Grouped   |                     |
| [3dlab]|                           |    |  | Nav Links |                     |
| [anly] |                           |    |  |           |                     |
|        |                           |    |  |           |                     |
| [upgrd]|                           |    |  | [CTA]     |                     |
| [acct] |                           |    |  | [account] |                     |
+--------+---------------------------+    +--+-----------+--------------------+
```

### Why This Architecture Over Push-Aside

The current SlateCamp sidebar uses `transition-[width]` on an `<aside>` in a flex container. When it expands from 72px to 260px, the main content reflows. This causes:

1. **Layout shift** -- content jumps, charts resize, text reflows
2. **Poor animation** -- width transitions are not GPU-composited, causing jank
3. **Cognitive disruption** -- the user's reading position changes

The overlay model avoids all three. The rail stays at 72px permanently. The expanded panel is an independent fixed-position layer. Zero layout shift. GPU-composited transforms. Content stays exactly where it is.

## Component Tree

```
DashboardLayout (server component, src/app/dashboard/layout.tsx)
  |
  +-- SidebarProvider (client component -- manages expanded/collapsed state)
  |     |
  |     +-- SidebarRail (always visible, 72px, in document flow)
  |     |     +-- SidebarRailLogo
  |     |     +-- SidebarRailNav (icon-only nav items with tooltips)
  |     |     +-- SidebarRailFooter (collapsed account trigger + upgrade icon)
  |     |
  |     +-- SidebarOverlay (portal or fixed-position layer, conditionally visible)
  |           +-- SidebarBackdrop (click-to-dismiss semi-transparent overlay)
  |           +-- SidebarPanel (the actual expanded sidebar panel)
  |                 +-- SidebarHeader (logo + user profile + collapse toggle)
  |                 +-- SidebarContent (scrollable area)
  |                 |     +-- SidebarNavGroup label="standalone"
  |                 |     |     +-- SidebarNavItem (Dashboard)
  |                 |     +-- SidebarNavGroup label="LEARN"
  |                 |     |     +-- SidebarNavItem (Wiki)
  |                 |     |     +-- SidebarNavItem (Notes)
  |                 |     |     +-- SidebarNavItem (3D Lab)
  |                 |     +-- SidebarNavGroup label="PRACTICE"
  |                 |     |     +-- SidebarNavItem (CampTrails)
  |                 |     |     +-- SidebarNavItem (Review)
  |                 |     +-- SidebarNavGroup label="DATA"
  |                 |           +-- SidebarNavItem (Analytics)
  |                 +-- SidebarFooter
  |                       +-- SidebarUpgradeCTA (freemium ad/upgrade card)
  |                       +-- SidebarAccountMenu (popover trigger + menu)
  |
  +-- <div> Main content area (flex-1, unchanged, no width dependency on sidebar state)
        +-- Navbar
        +-- DashboardHeader
        +-- main (children)
```

### Component Boundaries

| Component | Responsibility | Communicates With | Client/Server |
|-----------|---------------|-------------------|---------------|
| **SidebarProvider** | Holds `expanded` state, persists to localStorage, provides context | SidebarRail, SidebarOverlay | Client |
| **SidebarRail** | Always-visible icon rail, 72px fixed column | SidebarProvider (reads state, triggers expand) | Client |
| **SidebarRailLogo** | Renders logomark in collapsed state | None (presentational) | Client |
| **SidebarRailNav** | Maps nav config to icon-only buttons with tooltips | SidebarProvider (expand on hover/click) | Client |
| **SidebarRailFooter** | Account avatar icon + upgrade indicator at bottom of rail | SidebarAccountMenu (triggers popover) | Client |
| **SidebarOverlay** | Fixed-position container, renders backdrop + panel | SidebarProvider (reads expanded state) | Client |
| **SidebarBackdrop** | Semi-transparent click-to-dismiss layer | SidebarProvider (sets expanded=false on click) | Client |
| **SidebarPanel** | The 260px expanded sidebar panel itself | Contains Header, Content, Footer | Client |
| **SidebarHeader** | Logo (full), user profile display, collapse toggle | SidebarProvider (collapse toggle) | Client |
| **SidebarContent** | Scrollable container for nav groups | None (structural) | Client |
| **SidebarNavGroup** | Labeled section (LEARN, PRACTICE, DATA) | None (structural) | Client |
| **SidebarNavItem** | Individual nav link with icon, label, active state | ActiveSessionContext (leave-session guard) | Client |
| **SidebarFooter** | Bottom-pinned area for CTA and account menu | None (structural) | Client |
| **SidebarUpgradeCTA** | Freemium upgrade card or partner ad slot | TierContext (reads tier) | Client |
| **SidebarAccountMenu** | Popover with avatar, settings, theme toggle, logout | Uses existing Popover or DropdownMenu primitives | Client |

## State Management

### State Shape

```typescript
interface SidebarState {
  expanded: boolean       // Is the overlay panel visible?
}
```

That is the only state the sidebar system manages. One boolean. This simplicity is intentional and follows what shadcn/ui's sidebar, GitHub, and Supabase all converge on.

### State Flow

```
                    SidebarProvider (React Context)
                    |  expanded: boolean
                    |  setExpanded: (v: boolean) => void
                    |  toggle: () => void
                    |
         +----------+----------+
         |                     |
    SidebarRail           SidebarOverlay
    (reads expanded,      (reads expanded,
     calls toggle)         calls setExpanded(false))
```

### State Persistence

Use `localStorage` (not cookies) because:

1. The current codebase already uses localStorage for sidebar state (`cerebro_sidebar_collapsed`)
2. This is a client-only concern -- the server does not need to know sidebar state
3. Cookie-based persistence (as shadcn/ui attempts) has documented bugs with hydration timing
4. localStorage reads are synchronous and avoid flash-of-wrong-state

```typescript
// Inside SidebarProvider
const STORAGE_KEY = 'slatecamp_sidebar_expanded'

const [expanded, setExpanded] = useState(() => {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(STORAGE_KEY) === 'true'
})

useEffect(() => {
  localStorage.setItem(STORAGE_KEY, String(expanded))
}, [expanded])
```

Default state is **collapsed** (rail-only). Rationale: professional users want maximum content space by default. Expanding is an intentional action.

### Other State Dependencies (Consumed, Not Owned)

| Context | What Sidebar Reads | Why |
|---------|-------------------|-----|
| `ActiveSessionContext` | `activeSession` mode | To trigger leave-session confirmation dialog before navigation |
| `TierContext` | `tier`, `effectiveTier` | To conditionally show upgrade CTA |
| Pathname (`usePathname`) | Current route | To highlight active nav item |

The sidebar does NOT own any of these. It only consumes them. This keeps the sidebar a pure presentation/navigation concern.

### Popover State (Account Menu)

The account menu popover manages its own open/closed state internally via the existing `Popover` or `DropdownMenu` primitive from `@base-ui/react`. No additional state management needed -- these components handle open state, click-outside dismissal, Escape key, and focus trapping out of the box.

## Layout Integration

### Current Layout (What Changes)

```tsx
// Current: src/app/dashboard/layout.tsx
<div className="flex h-screen overflow-hidden">
  <Sidebar />                    {/* <-- currently in document flow, width changes */}
  <div className="flex flex-1">  {/* <-- currently flexes around sidebar width */}
    <Navbar />
    <DashboardHeader />
    <main>{children}</main>
  </div>
</div>
```

### New Layout (Minimal Changes)

```tsx
// New: src/app/dashboard/layout.tsx
<SidebarProvider>
  <div className="flex h-screen overflow-hidden">
    <SidebarRail />                {/* Fixed 72px, always in document flow */}
    <SidebarOverlay />             {/* position: fixed, outside document flow */}
    <div className="flex flex-1 flex-col overflow-hidden border-l border-border">
      <Navbar />
      <DashboardHeader />
      <main>{children}</main>
    </div>
  </div>
</SidebarProvider>
```

Key layout changes:
1. `SidebarProvider` wraps the entire dashboard layout (inside existing context providers)
2. `SidebarRail` replaces the old `<Sidebar>` element -- same position, but permanently 72px
3. `SidebarOverlay` is a new sibling -- fixed position, does not participate in flex layout
4. The main content `div` no longer depends on sidebar width -- it always takes `flex-1` of `(100vw - 72px)`

### CSS Architecture for the Overlay

```css
/* SidebarRail -- always visible, in flex flow */
.sidebar-rail {
  width: 72px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  /* No position: fixed -- stays in normal document flow */
}

/* SidebarOverlay container -- fixed, covers entire viewport */
.sidebar-overlay {
  position: fixed;
  inset: 0;
  z-index: 40;
  /* Only rendered when expanded=true */
}

/* SidebarBackdrop -- click-to-dismiss layer */
.sidebar-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.15);
  /* Subtle, not aggressive -- Campfire warmth */
}

/* SidebarPanel -- the actual expanded content */
.sidebar-panel {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 260px;
  background: white;
  display: flex;
  flex-direction: column;
  transform: translateX(0);
  /* Slides in from left via translateX(-100%) -> translateX(0) */
  transition: transform 200ms ease-out;
  /* 200ms, not 300ms -- overlay appearance should feel snappy */
}
```

### Animation Strategy

Use `transform: translateX()` for the panel slide, NOT `width` or `left` transitions.

- `translateX` is GPU-composited (no layout recalculation)
- The backdrop fades in via `opacity: 0 -> 0.15` simultaneously
- Total duration: 200ms ease-out (enter), 150ms ease-in (exit)
- Respect `prefers-reduced-motion`: skip transform animation, use instant opacity toggle

For mount/unmount, use conditional rendering with CSS transitions, not `display: none`. Pattern:

```tsx
// Simplified conceptual pattern
{expanded && (
  <div className="fixed inset-0 z-40">
    <div className="absolute inset-0 bg-black/15 animate-in fade-in duration-200"
         onClick={() => setExpanded(false)} />
    <div className="absolute inset-y-0 left-0 w-[260px] bg-white shadow-md
                    animate-in slide-in-from-left duration-200">
      {/* Panel content */}
    </div>
  </div>
)}
```

## Patterns to Follow

### Pattern 1: Config-Driven Navigation

**What:** Navigation items defined as a typed data structure, not inline JSX. The existing `SIDEBAR_NAVIGATION` and `DASHBOARD_ROUTES` in `src/lib/routes.ts` already follow this pattern. Extend it with group information.

**When:** Always. The nav config is the single source of truth.

**Example:**

```typescript
// src/lib/routes.ts (extended)
export interface SidebarNavGroup {
  id: string
  label: string | null  // null for standalone items (Dashboard)
  items: SidebarNavItem[]
}

export const SIDEBAR_NAV_GROUPS: SidebarNavGroup[] = [
  {
    id: 'standalone',
    label: null,
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: SquaresFour },
    ],
  },
  {
    id: 'learn',
    label: 'LEARN',
    items: [
      { href: '/dashboard/wiki', label: 'Wiki', icon: Globe },
      { href: '/dashboard/notes', label: 'Notes', icon: FileText },
      { href: '/dashboard/3d-lab', label: '3D Lab', icon: Cube },
    ],
  },
  {
    id: 'practice',
    label: 'PRACTICE',
    items: [
      { href: '/dashboard/camptrails', label: 'CampTrails', icon: Path },
      { href: '/dashboard/testing', label: 'Review', icon: Brain },
    ],
  },
  {
    id: 'data',
    label: 'DATA',
    items: [
      { href: '/dashboard/analytics', label: 'Analytics', icon: ChartBar },
    ],
  },
]
```

### Pattern 2: Shared Nav Item Component

**What:** Both the rail and the expanded panel render from the same nav config, but use different visual presentations. The `SidebarNavItem` is a single component that adapts its rendering based on a `variant` prop or context.

**When:** For every nav link.

**Example:**

```typescript
interface SidebarNavItemProps {
  href: string
  label: string
  icon: PhosphorIcon
  isActive: boolean
  variant: 'rail' | 'expanded'
  onBeforeNavigate: (e: React.MouseEvent<HTMLAnchorElement>) => void
}
```

In **rail** variant: renders icon-only with tooltip. In **expanded** variant: renders icon + label with active indicator.

### Pattern 3: Popover-Based Account Menu

**What:** The account menu at the bottom of the sidebar uses the existing `Popover` component from `@base-ui/react` (already in the project). Trigger is the avatar button. Content appears above the trigger (side="top") and contains: user name/email, settings link, theme toggle, logout button.

**When:** For the account/settings section at the bottom of both rail and expanded panel.

**Why Popover over DropdownMenu:** The account menu contains interactive elements (theme toggle switch) that are not simple menu items. Popover supports arbitrary content; DropdownMenu is for action lists. However, if the menu only contains navigation links, `DropdownMenu` is the more semantically correct choice.

**Recommendation:** Use `DropdownMenu` because the account menu items are navigational actions (settings, logout) plus a theme toggle, which can be a `DropdownMenuCheckboxItem`. This gives proper keyboard navigation and ARIA roles for free.

### Pattern 4: Leave-Session Guard at Nav Item Level

**What:** The existing `handleNavClick` pattern from the current sidebar must be preserved. Each `SidebarNavItem` checks the `ActiveSessionContext` before navigating. If a quiz/review session is active, it intercepts the click and shows a confirmation dialog.

**When:** On every nav item click.

**Architectural note:** The confirmation dialog should live in the `SidebarProvider`, not inside individual nav items. Nav items call a `guardedNavigate(href)` function from context; the provider manages the dialog state.

## Anti-Patterns to Avoid

### Anti-Pattern 1: Sidebar Width in CSS Variables for Content

**What:** Exposing sidebar width as a CSS variable that the main content area reads for layout calculations.

**Why bad:** Creates an invisible coupling between sidebar and content. With the overlay model, content width should never depend on sidebar state. The rail is always 72px; the overlay is an independent layer.

**Instead:** Content area uses `flex-1` and never references sidebar dimensions.

### Anti-Pattern 2: Portal for Sidebar Overlay

**What:** Rendering the overlay panel through React Portal to `document.body`.

**Why bad:** Portals break context inheritance. The sidebar needs access to `ActiveSessionContext`, `TierContext`, and the `SidebarProvider` context. Portaling it out of the tree loses all of these unless you re-provide them.

**Instead:** Render the overlay as a sibling within the same provider tree, using `position: fixed` for visual stacking. The `Popover` inside the account menu can use its own portal (it already does via `@base-ui/react`), but the sidebar panel itself should not.

### Anti-Pattern 3: Animating Width for Expand/Collapse

**What:** Using `transition-[width]` or `transition: width` to animate between 72px and 260px.

**Why bad:** Width changes trigger layout recalculation on every animation frame. Causes jank, reflows content, and is not GPU-composited. This is what the current sidebar does and it is the root cause of the layout shift problem.

**Instead:** The rail is always 72px. The overlay panel uses `transform: translateX()` for GPU-composited sliding.

### Anti-Pattern 4: Single Monolithic Sidebar Component

**What:** One 400+ line component file handling both collapsed and expanded states with conditional rendering everywhere.

**Why bad:** The current `Sidebar.tsx` is 424 lines because it handles both states in a single component. Every piece of UI has `collapsed ? ... : ...` ternaries. Hard to reason about, hard to test, hard to modify.

**Instead:** Split into Rail and Panel as separate components. Each has a single, clear visual responsibility. Shared logic (nav config, active route detection, session guard) lives in the provider or hooks.

## File Structure

```
src/components/sidebar/
  index.ts                    // Public exports
  SidebarProvider.tsx          // Context provider (expanded state + localStorage + leave guard)
  SidebarRail.tsx              // 72px icon rail (always visible)
  SidebarOverlay.tsx           // Fixed overlay container (backdrop + panel)
  SidebarPanel.tsx             // 260px expanded panel content
  SidebarNavGroup.tsx          // Labeled nav section
  SidebarNavItem.tsx           // Individual nav link (shared between rail and panel)
  SidebarHeader.tsx            // Logo + profile + collapse toggle (in panel)
  SidebarFooter.tsx            // Upgrade CTA + account menu area (in panel)
  SidebarAccountMenu.tsx       // Popover/dropdown with settings, theme, logout
  SidebarUpgradeCTA.tsx        // Freemium upgrade card
```

Total: 11 files. Each is focused and under 100 lines. The current monolith is 424 lines in one file.

## Data Flow

### Navigation Click Flow

```
User clicks nav item (rail or panel)
  |
  v
SidebarNavItem.onBeforeNavigate()
  |
  +-- ActiveSessionContext.activeSession is null?
  |     YES --> TransitionLink proceeds with navigation
  |     NO  --> preventDefault(), show leave-session dialog
  |
  +-- (If in expanded panel) SidebarProvider.setExpanded(false)
       |
       v
       Overlay panel closes, navigation proceeds
```

### Expand/Collapse Flow

```
User clicks expand trigger (rail toggle button, or rail nav item)
  |
  v
SidebarProvider.setExpanded(true)
  |
  +-- localStorage.setItem('slatecamp_sidebar_expanded', 'true')
  +-- SidebarOverlay renders (backdrop + panel)
  +-- Panel slides in via translateX animation (200ms)

User clicks backdrop / Escape / collapse toggle
  |
  v
SidebarProvider.setExpanded(false)
  |
  +-- localStorage.setItem('slatecamp_sidebar_expanded', 'false')
  +-- Panel slides out (150ms), then unmounts
```

### Account Menu Flow

```
User clicks avatar in SidebarRailFooter or SidebarFooter
  |
  v
DropdownMenu opens (managed by @base-ui/react internally)
  |
  +-- Shows: user name, settings link, theme toggle, logout
  +-- Click outside or Escape dismisses
  +-- Settings click --> navigates (with session guard)
  +-- Logout click --> calls signOut server action
```

## Suggested Build Order

Build in this order because each step depends on the one before it.

### Phase 1: Foundation (build first)

1. **Navigation config** -- Extend `src/lib/routes.ts` with `SIDEBAR_NAV_GROUPS` structure. No UI changes yet. This is pure data.
2. **SidebarProvider** -- Create context with `expanded` state, localStorage persistence, toggle function. Wire it into `dashboard/layout.tsx` wrapping the existing content.
3. **SidebarNavItem** -- Extract and refactor from current `SidebarItem`. Support `variant: 'rail' | 'expanded'`. Preserve leave-session guard logic via `onBeforeNavigate`.

### Phase 2: Rail (replaces current collapsed state)

4. **SidebarRail** -- Build the 72px always-visible rail. Compose from `SidebarRailLogo`, `SidebarRailNav` (using `SidebarNavItem` variant="rail"), and `SidebarRailFooter`. Wire into layout replacing the old `<Sidebar>`.
5. **Verify** -- At this point the collapsed sidebar experience should work identically to the current one, but with the new component structure.

### Phase 3: Overlay Panel (the new expanded state)

6. **SidebarOverlay + SidebarBackdrop** -- Fixed overlay container with click-to-dismiss backdrop. Conditional rendering based on `expanded` state from provider.
7. **SidebarPanel + SidebarHeader** -- The 260px panel with logo, user profile, and collapse toggle.
8. **SidebarNavGroup** -- Grouped navigation sections rendering from `SIDEBAR_NAV_GROUPS` config.
9. **SidebarContent** -- Scrollable wrapper composing nav groups.

### Phase 4: Footer Components (depend on panel existing)

10. **SidebarUpgradeCTA** -- Freemium upgrade card, reads tier from `TierContext`.
11. **SidebarAccountMenu** -- DropdownMenu with avatar trigger, settings link, theme toggle, logout. Reuses existing `DropdownMenu` primitives.
12. **SidebarFooter** -- Composes CTA + account menu, pinned to bottom of panel.

### Phase 5: Polish and Cleanup

13. **Animations** -- Add `translateX` slide-in/out, backdrop fade, `prefers-reduced-motion` support.
14. **Keyboard handling** -- Escape to close overlay, focus trap within expanded panel.
15. **Delete old Sidebar.tsx** -- Remove the monolithic component once the new system is verified.
16. **Layout integration cleanup** -- Finalize `dashboard/layout.tsx` changes, remove any leftover width-transition CSS.

### Why This Order

- **Phase 1** is pure logic with no visual changes. Safe to build and test in isolation.
- **Phase 2** achieves feature parity with current collapsed state. Deploy-safe checkpoint.
- **Phase 3** adds the new overlay behavior. This is the big visual change.
- **Phase 4** adds secondary features that only make sense once the panel exists.
- **Phase 5** is refinement. The sidebar is functionally complete after Phase 4.

## Scalability Considerations

| Concern | Current (1 sidebar) | Future (nested nav, mobile) |
|---------|---------------------|-----------------------------|
| Mobile sidebar | Out of scope (per PROJECT.md) | SidebarOverlay already IS an overlay. Mobile just needs a hamburger trigger instead of the rail. Same overlay architecture works. |
| Nested sub-menus | Not needed now | SidebarNavItem can be extended with `children` prop. Rail shows top-level only; panel shows expandable sub-nav via shadcn Collapsible. |
| Multiple sidebars | Not needed | SidebarProvider supports a `side` prop (left/right). Rail + overlay model works on either side. |
| SSR/hydration | localStorage init | Default to collapsed. useEffect reads localStorage on mount. No hydration mismatch because SSR renders collapsed by default. |

## Confidence Assessment

| Aspect | Confidence | Basis |
|--------|-----------|-------|
| Two-layer Rail + Overlay model | HIGH | GitHub, Supabase, shadcn/ui all converge on this pattern. Verified via web research and existing codebase analysis. |
| Component boundaries | HIGH | Follows shadcn/ui sidebar decomposition (Provider, Rail, Content, Groups, Items, Footer). Adapted for SlateCamp's specific needs. |
| State management (single boolean + localStorage) | HIGH | Current codebase already uses this pattern. shadcn/ui uses cookies but has documented bugs; localStorage is safer. |
| CSS overlay strategy (fixed + translateX) | HIGH | Standard industry pattern. GPU-composited. No layout shift. Multiple sources confirm. |
| DropdownMenu for account menu | MEDIUM | DropdownMenu vs Popover is a judgment call. DropdownMenu gives better keyboard navigation for action lists. Both are available in the codebase. |
| Build order | HIGH | Based on dependency analysis of the component tree and existing layout.tsx structure. |

## Sources

- [shadcn/ui Sidebar documentation](https://ui.shadcn.com/docs/components/radix/sidebar) -- component decomposition, collapsible variants, rail concept
- [shadcn/ui Sidebar blocks](https://ui.shadcn.com/blocks/sidebar) -- real-world layout examples
- [Using the new Shadcn Sidebar](https://www.achromatic.dev/blog/shadcn-sidebar) -- SidebarProvider, cookie persistence, collapsible modes
- [Why Developers Love the Shadcn Sidebar Component](https://codeparrot.ai/blogs/why-developers-love-the-shadcn-sidebar-component) -- composable architecture rationale
- [shadcn/ui cookie persistence bug](https://github.com/shadcn-ui/ui/issues/8176) -- documented issue with cookie-based state persistence
- [Modern Layout Design Techniques in ReactJS (2025)](https://dev.to/er-raj-aryan/modern-layout-design-techniques-in-reactjs-2025-guide-3868) -- fixed sidebar + overlay patterns
- Existing SlateCamp codebase: `Sidebar.tsx`, `dashboard/layout.tsx`, `routes.ts`, `popover.tsx`, `dropdown-menu.tsx`
