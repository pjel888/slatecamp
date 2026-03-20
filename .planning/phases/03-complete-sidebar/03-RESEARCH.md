# Phase 3: Complete Sidebar - Research

**Researched:** 2026-03-21
**Domain:** Overlay sidebar architecture, user profile, freemium CTA, accessibility, visual density
**Confidence:** HIGH

## Summary

Phase 3 converts the existing monolithic 458-line `Sidebar.tsx` (push-model, width-transition) into a professional two-layer system: a 72px icon rail permanently in document flow, and a fixed-position overlay panel that floats above content with a dismissible backdrop. This phase also adds the user profile display at the top, a freemium CTA card above the footer, simplifies the footer to just a Settings link (removing ThemeToggle and the account popover concept), and brings visual density to Supabase/GitHub standards with full WCAG accessibility.

The project already has every library needed -- Framer Motion 12.35.2 for AnimatePresence, @base-ui/react 1.2.0 for Tooltip/Avatar/Button, Phosphor Icons, and the full Campfire design token set in globals.css. Zero new packages are required.

The critical user decisions override two requirements from REQUIREMENTS.md: ACC-02/ACC-03 (no account popover -- settings is a page, not a popover) and the CTA is a feature teaser card (not just an upgrade button). The ThemeToggle is removed from the sidebar entirely and belongs in the Settings page.

**Primary recommendation:** Build the SidebarProvider + SidebarRail first (establishing the 72px fixed-width rail), then layer the SidebarOverlay on top. The overlay is a sibling to the rail using `position: fixed`, animated with Framer Motion's AnimatePresence. Main content gets the `inert` attribute when overlay is open. Footer is just SidebarNavItem for Settings -- no popover, no dropdown, no ThemeToggle.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Collapsed: 72px icon rail permanently in document flow
- Expanded: fixed-position overlay on top of content -- zero layout shift
- Backdrop: medium opacity (25-30%), visually dims content behind overlay
- Dismiss: click outside, Escape key, route change all collapse the overlay
- Toggle button accessible in both states
- NO account popover -- account settings has its own page
- Bottom of sidebar: just the Settings nav link (gear icon + "Settings" label)
- Theme toggle REMOVED from sidebar entirely -- it lives inside the Settings page
- Remove ThemeToggle component import and rendering from Sidebar.tsx
- Avatar + display name + tier badge shown below logo area
- Collapsed: avatar only; Expanded: avatar + name + tier badge
- Tier badge shows: free, pro, max, institutional, educational, corporate
- Feature teaser card: small card listing 2-3 pro features + upgrade button
- Positioned above the Settings link at bottom
- Visible only for free-tier users; paid users see clean sidebar
- Collapsed state: small sparkle/upgrade icon; expanded: full card
- Future-ready slot for partner ads
- Nav labels: 13px, tight leading
- Group headers: 11px uppercase, tracking-wider, Ink Tertiary
- Compact padding: py-[5px] on nav items, space-y-px between items
- All transitions max 300ms, ease-out
- prefers-reduced-motion: instant state changes, no animation
- Tooltips on all collapsed rail icons
- Z-index scale: rail < backdrop < overlay < tooltips < dialogs
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

### Deferred Ideas (OUT OF SCOPE)
None -- this is the final phase
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| OVR-01 | Collapsed state is a 72px icon-only rail permanently in document flow | Two-layer rail+overlay architecture pattern; rail is always `w-[72px] shrink-0` in flex |
| OVR-02 | Expanded state renders as fixed-position overlay (no content push/shift) | Fixed-position overlay with `translateX` animation; content never references sidebar width |
| OVR-03 | Subtle backdrop scrim behind expanded overlay | Framer Motion `motion.div` backdrop with `bg-black/25` opacity fade |
| OVR-04 | Click outside overlay to collapse | Backdrop sibling element with `onMouseDown` handler to avoid event bubbling |
| OVR-05 | Escape key collapses overlay | `useEffect` keydown listener on `Escape`; also handled by focus trap |
| OVR-06 | Auto-collapse on navigation (route change) | `usePathname()` effect sets expanded=false on change |
| OVR-07 | Collapse/expand toggle button accessible in both states | Button with `aria-expanded`, rendered in both rail and panel header |
| ACC-01 | Avatar + display name + tier badge shown at top of sidebar (below logo) | Existing Avatar, TierBadge components; collapsed=avatar only, expanded=full profile |
| ACC-02 | ~~Account popover at bottom~~ **OVERRIDDEN: Settings is a page link, not popover** | Footer is just SidebarNavItem pointing to ROUTES.SETTINGS -- no popover needed |
| ACC-03 | ~~Account popover uses DropdownMenu~~ **OVERRIDDEN: No popover** | Removed entirely per user decision |
| ACC-04 | Tier badge displays current plan | Existing TierBadge component + useTier() context |
| FRM-01 | Upgrade CTA card pinned above Settings link (freemium users only) | Feature teaser card with 2-3 pro benefits + upgrade button; collapsed=sparkle icon |
| FRM-02 | Ad/partner slot in same position (future-ready, not implemented yet) | CTA component architecture supports swapping content; slot-based design |
| VIS-01 | Text sizes reduced to professional density (13px labels, 11px group headers) | Already using `text-[13px]` for nav items; group headers need `text-[11px] uppercase tracking-wider` |
| VIS-02 | Spacing tightened -- compact padding matching GitHub/Supabase density | `py-[5px]` on nav items, `space-y-px` between items (already in current code) |
| VIS-03 | Smooth transitions max 300ms (Campfire design system) | 200ms ease-out for overlay slide, 150ms for backdrop fade, 150ms for hover states |
| VIS-04 | Respects prefers-reduced-motion | Framer Motion `useReducedMotion()` hook; `motion-reduce:transition-none` Tailwind class |
| VIS-05 | Tooltips on collapsed rail icons | Existing Tooltip pattern with `side="right"` and `sideOffset={12}` |
| VIS-06 | Z-index scale established (rail, overlay, backdrop, tooltips, dialogs) | Documented scale: rail=10, backdrop=39, overlay=40, tooltips=50, dialogs=100 |
| A11-01 | Focus trapped within overlay when expanded | `inert` attribute on main content + manual focus management on open/close |
| A11-02 | Focus returns to toggle button on collapse | `useRef` on toggle button; restore focus in collapse handler |
| A11-03 | `aria-expanded` on toggle, proper landmark roles | `aria-expanded={expanded}` on toggle; `<nav aria-label="Main navigation">` |
| A11-04 | Main content marked `inert` when overlay is open | `inert` attribute on content div in layout.tsx; toggled via SidebarProvider context |
| A11-05 | Full keyboard navigation within sidebar sections | Tab order through nav items; arrow key support within groups |
</phase_requirements>

## Standard Stack

### Core (Existing -- Zero New Installs)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Framer Motion | 12.35.2 | AnimatePresence for overlay enter/exit, backdrop fade, useReducedMotion | Already used in Omnibar, AITutorDrawer, ConfirmSubmitSheet -- established pattern |
| @base-ui/react | 1.2.0 | Tooltip (rail icons), Avatar (profile), Button (toggle, CTA) | Project standard UI primitives; all shadcn/ui wrappers use this |
| @phosphor-icons/react | 2.1.10 | All sidebar icons via SCIcon wrapper | Project standard icon library |
| next-themes | 0.4.6 | Theme detection (NOT in sidebar -- in Settings page) | Already installed; ThemeToggle component exists |
| Tailwind CSS | 4.2.1 | All styling, transitions, responsive utilities | Project standard; Campfire tokens defined in globals.css |

### Supporting (Already Installed)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| class-variance-authority | installed | Variant-based styling for nav items | If SidebarNavItem needs `rail` vs `expanded` variants |
| tailwind-merge + clsx | installed | `cn()` utility | All conditional class composition |
| next/navigation | 16.1.6 | usePathname for active route + auto-collapse on nav | Route detection, auto-close overlay |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Framer Motion AnimatePresence | CSS-only transitions | CSS cannot animate mount/unmount of conditionally rendered elements; AnimatePresence handles this. FM already installed and established. |
| Custom focus trap | focus-trap-react library | `inert` attribute on main content is simpler and more correct. No new dependency needed. Browser support is universal in 2026. |
| React Portal for overlay | Sibling in same tree | Portals break context inheritance (TierContext, ActiveSessionContext). Fixed positioning achieves the same visual stacking without losing context. |

**Installation:**
```bash
# Nothing to install. Zero new packages.
```

## Architecture Patterns

### Recommended Component Structure

```
src/components/sidebar/
  index.ts                    # Public exports
  SidebarProvider.tsx          # Context (expanded state, localStorage, toggle, inert management)
  SidebarRail.tsx              # 72px icon rail (always visible, in document flow)
  SidebarOverlay.tsx           # AnimatePresence wrapper: backdrop + panel
  SidebarPanel.tsx             # 260px expanded panel content layout
  SidebarNavGroup.tsx          # Labeled nav section (LEARN, PRACTICE, DATA)
  SidebarNavItem.tsx           # Individual nav link (shared rail + expanded variants)
  SidebarHeader.tsx            # Logo + user profile + collapse toggle (in panel)
  SidebarFooter.tsx            # CTA card + Settings link (in panel)
  SidebarUserProfile.tsx       # Avatar + name + tier badge display
  SidebarUpgradeCTA.tsx        # Freemium feature teaser card
```

### Pattern 1: Two-Layer Rail + Overlay (Core Architecture)

**What:** The sidebar is two co-existing layers that share a navigation data source. The rail is always in document flow at 72px. The overlay is a fixed-position layer that appears on top of everything.

**When to use:** Always -- this is the foundational pattern.

**Layout structure:**

```tsx
// src/app/dashboard/layout.tsx
<SidebarProvider>
  <div className="flex h-screen overflow-hidden">
    <SidebarRail />              {/* Always 72px, in flex flow */}
    <div
      className="flex flex-1 flex-col overflow-hidden border-l border-border"
      ref={contentRef}           {/* For inert attribute */}
    >
      <Navbar />
      <DashboardHeader />
      <main>{children}</main>
    </div>
    <SidebarOverlay />           {/* position: fixed, outside flex flow */}
  </div>
</SidebarProvider>
```

**Key CSS for the overlay:**

```css
/* Backdrop -- sibling to panel, not parent */
.sidebar-backdrop {
  position: fixed;
  inset: 0;
  z-index: 39;
  background: rgba(0, 0, 0, 0.25);  /* 25% opacity per user decision */
}

/* Panel -- anchored to rail edge */
.sidebar-panel {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 260px;
  z-index: 40;
  background: var(--sidebar);
}
```

### Pattern 2: SidebarProvider Context

**What:** Single context providing expanded state, toggle function, and content ref for inert management.

**Interface:**

```typescript
interface SidebarContextValue {
  expanded: boolean
  setExpanded: (v: boolean) => void
  toggle: () => void
  contentRef: React.RefObject<HTMLDivElement>
}
```

**State persistence:** localStorage with key `slatecamp_sidebar_expanded`. Default to `false` (collapsed). Read synchronously in useState initializer to avoid hydration flash.

**Auto-collapse on route change:**

```typescript
const pathname = usePathname()
useEffect(() => {
  setExpanded(false)
}, [pathname])
```

**Inert management:** When expanded changes, toggle `inert` attribute on contentRef.current:

```typescript
useEffect(() => {
  const el = contentRef.current
  if (!el) return
  if (expanded) {
    el.setAttribute('inert', '')
  } else {
    el.removeAttribute('inert')
  }
}, [expanded])
```

### Pattern 3: AnimatePresence Overlay (Established Codebase Pattern)

**What:** Use Framer Motion's AnimatePresence for coordinated enter/exit of backdrop + panel.

**Source:** Matches existing patterns in ConfirmSubmitSheet.tsx (z-[60] backdrop + z-[70] dialog).

```tsx
<AnimatePresence>
  {expanded && (
    <>
      {/* Backdrop -- sibling, not parent */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 z-[39] bg-black/25"
        onMouseDown={() => setExpanded(false)}
        aria-hidden
      />
      {/* Panel */}
      <motion.aside
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -20, opacity: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="fixed inset-y-0 left-0 z-[40] w-[260px] bg-sidebar border-r border-sidebar-border shadow-md"
        role="dialog"
        aria-label="Navigation sidebar"
      >
        {/* Panel content */}
      </motion.aside>
    </>
  )}
</AnimatePresence>
```

**Reduced motion handling:**

```tsx
const prefersReducedMotion = useReducedMotion()
const panelTransition = prefersReducedMotion
  ? { duration: 0 }
  : { duration: 0.2, ease: 'easeOut' }
```

### Pattern 4: Shared SidebarNavItem with Variant

**What:** A single nav item component that renders differently in rail vs panel contexts.

```typescript
interface SidebarNavItemProps {
  href: string
  label: string
  icon?: PhosphorIcon
  isActive: boolean
  variant: 'rail' | 'expanded'
  onBeforeNavigate: (e: React.MouseEvent<HTMLAnchorElement>) => void
}
```

- **Rail variant:** Icon-only with Tooltip wrapper. Same 32px icon box + 20px padding alignment.
- **Expanded variant:** Icon + label with active indicator. Full text visible.

The existing `ICON_BOX` constant (`flex h-8 w-8 shrink-0 items-center justify-center`) and `ICON_SIZE` must be preserved exactly -- icons stay pixel-perfect between states.

### Pattern 5: Freemium CTA Card (Feature Teaser)

**What:** A compact card above the Settings link that teases 2-3 pro features.

**Collapsed state:** Small sparkle icon in rail footer area (Sparkle from Phosphor Icons).
**Expanded state:** Full card with:
- Heading: "Unlock more" or similar growth-framed text (Campfire voice)
- 2-3 benefit items (short, specific: "Unlimited practice sessions", "AI tutor feedback", "Advanced analytics")
- Upgrade button using existing Button `warmCta` or `outline` variant
- Max height ~80px to avoid viewport squeeze

**Visibility:** Only for free-tier users. Check via `useTier()` context:

```typescript
const { effectiveTier } = useTier()
const showCTA = effectiveTier === 'free'
```

### Anti-Patterns to Avoid

- **Animating width for expand/collapse:** The current code uses `transition-[width]` which triggers layout recalculation on every frame. Use `position: fixed` + `transform: translateX` instead. Never transition width.
- **Portal for sidebar overlay:** Portals break context inheritance. The sidebar needs TierContext, ActiveSessionContext, SidebarProvider. Keep it in the same React tree with `position: fixed`.
- **Single monolithic component:** The current 458-line file handles both states with ternaries everywhere. Split into Rail + Panel with shared data.
- **Backdrop as parent of panel:** Event bubbling causes clicks inside the panel to dismiss the sidebar. Backdrop and panel must be siblings.
- **Group labels with opacity:0 when collapsed:** Invisible labels intercept mouse events. Use conditional rendering or `pointer-events-none` instead.
- **ThemeToggle in sidebar:** User explicitly removed this. It belongs in the Settings page only.
- **Account popover/dropdown:** User explicitly removed this. Settings is a page link, not a popover trigger.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Overlay enter/exit animation | Custom CSS transition with display toggling | Framer Motion AnimatePresence | Cannot animate mount/unmount of conditionally rendered elements with CSS alone. AnimatePresence is already the project pattern. |
| Focus containment | Custom focus-trap loop with focusable element queries | `inert` attribute on main content | `inert` removes all descendants from tab order and a11y tree in one declaration. Universal browser support in 2026. Simpler and more correct. |
| Tooltip positioning | Manual absolute positioning | Existing Tooltip component (@base-ui/react) | Already handles portal rendering, collision detection, arrow positioning. Used extensively in current sidebar. |
| Active route detection | Custom pathname matching | Existing pattern from Sidebar.tsx lines 344-345 | `pathname === href \|\| (href !== '/dashboard' && pathname.startsWith(href))` already works. Copy it. |
| Leave-session guard | New dialog system | Existing Dialog + ActiveSessionContext pattern | The current handleNavClick + leaveDialogOpen + Dialog pattern at lines 184-455 is proven. Extract it into SidebarProvider. |
| User tier detection | Direct Supabase query | useTier() context from TierProvider | Already wraps the dashboard layout. Provides effectiveTier with dev mode overrides. |

## Common Pitfalls

### Pitfall 1: Layout Shift When Switching from Push to Overlay
**What goes wrong:** Content area reflows because the sidebar rail width changes between states, or the overlay still participates in the flex layout.
**Why it happens:** Developers keep width transitions or make the overlay part of the flex container.
**How to avoid:** Rail is always `w-[72px] shrink-0` in the flex container. Overlay uses `position: fixed` and is completely outside the flex layout. Content always takes `flex-1` of `(100vw - 72px)`.
**Warning signs:** Main content text reflows when toggling sidebar. DevTools Performance shows "Layout" events during animation.

### Pitfall 2: Hydration Mismatch on Sidebar State
**What goes wrong:** Server renders collapsed, client reads localStorage and flashes to expanded (or vice versa).
**Why it happens:** localStorage is not available during SSR. useState initializer runs differently on server vs client.
**How to avoid:** Default to `false` (collapsed) in both SSR and client. The overlay model makes this less jarring -- collapsed is the default visual state. If the user previously had it expanded, the overlay simply does not appear until they click the toggle. No layout shift because the rail is always 72px.
**Warning signs:** Sidebar visibly changes state 100-300ms after page load.

### Pitfall 3: Focus Not Managed on Overlay Open/Close
**What goes wrong:** Keyboard users Tab into dimmed main content behind the overlay. Focus does not return to toggle on close.
**Why it happens:** `inert` attribute not applied, or focus restoration not implemented.
**How to avoid:** Apply `inert` on main content div when overlay opens. On open, focus the first focusable element in the panel. On close, restore focus to the toggle button via useRef. Add Escape key handler.
**Warning signs:** Tab moves focus to elements behind the backdrop.

### Pitfall 4: Backdrop Click Bubbling Closes Sidebar on Every Click
**What goes wrong:** Clicking inside the sidebar panel also triggers the backdrop's close handler.
**Why it happens:** Backdrop is a parent element and clicks bubble up from children.
**How to avoid:** Backdrop and panel are sibling elements within AnimatePresence, not parent-child. Use `onMouseDown` on backdrop instead of `onClick` to avoid drag-release edge cases.
**Warning signs:** Sidebar closes when clicking any item inside it.

### Pitfall 5: Z-Index Wars Between Overlay, Tooltips, and Dialogs
**What goes wrong:** Rail tooltips appear behind the overlay backdrop. Leave-session Dialog renders behind the overlay.
**Why it happens:** Uncoordinated z-index values across different floating elements.
**How to avoid:** Establish and document a z-index scale. All floating elements reference this scale.
**Warning signs:** Any floating element appearing behind another.

### Pitfall 6: CTA Card Squeezing Navigation on Short Viewports
**What goes wrong:** The feature teaser card takes vertical space, pushing nav items below the fold on laptops.
**Why it happens:** Card height not constrained, no viewport-aware hiding.
**How to avoid:** CTA card max-height ~80px. Nav area is scrollable (overflow-y-auto). CTA and Settings link are pinned outside the scrollable area. Consider hiding CTA on viewports < 700px.
**Warning signs:** Nav items require scrolling to reach on standard laptop screens.

## Code Examples

### Z-Index Scale (Establish in globals.css or as Tailwind utilities)

```css
/* Z-index scale for sidebar system */
/* Rail: z-10 (in document flow, below everything floating) */
/* Backdrop: z-[39] (dims content, below panel) */
/* Overlay panel: z-[40] (above backdrop, above content) */
/* Tooltips: z-50 (via @base-ui Tooltip Portal -- already set) */
/* Dialogs: z-[100] (leave-session dialog, above everything) */
/* DevToolbar: z-[9999] (already set in dev-toolbar.tsx) */
```

**Recommended exact values:**

| Layer | Z-Index | Element |
|-------|---------|---------|
| Rail | 10 | SidebarRail (in flex flow, just needs to be above content for border) |
| Backdrop | 39 | Overlay backdrop scrim |
| Overlay Panel | 40 | Expanded sidebar panel |
| Tooltips | 50 | @base-ui Tooltip Portal (already z-50 in tooltip.tsx) |
| Dialogs | 100 | Leave-session Dialog, any modal |
| DevToolbar | 9999 | Already set in dev-toolbar.tsx |

### AnimatePresence with Reduced Motion (Codebase Pattern)

Source: Established pattern from ConfirmSubmitSheet.tsx, adapted for sidebar.

```tsx
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'

const SidebarOverlay = () => {
  const { expanded, setExpanded } = useSidebar()
  const prefersReducedMotion = useReducedMotion()

  const backdropVariants = prefersReducedMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0 } }
    : { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.15 } }

  const panelVariants = prefersReducedMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0 } }
    : { initial: { x: -20, opacity: 0 }, animate: { x: 0, opacity: 1 }, exit: { x: -20, opacity: 0 }, transition: { duration: 0.2, ease: 'easeOut' } }

  return (
    <AnimatePresence>
      {expanded && (
        <>
          <motion.div {...backdropVariants} className="fixed inset-0 z-[39] bg-black/25" onMouseDown={() => setExpanded(false)} aria-hidden />
          <motion.aside {...panelVariants} className="fixed inset-y-0 left-0 z-[40] w-[260px]" role="dialog" aria-label="Navigation sidebar">
            <SidebarPanel />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
```

### Inert Attribute Management

```tsx
// Inside SidebarProvider
const contentRef = useRef<HTMLDivElement>(null)

useEffect(() => {
  const el = contentRef.current
  if (!el) return
  if (expanded) {
    el.setAttribute('inert', '')
  } else {
    el.removeAttribute('inert')
  }
}, [expanded])

// In layout.tsx
<div ref={contentRef} className="flex flex-1 flex-col overflow-hidden border-l border-border">
  {/* main content */}
</div>
```

### Focus Management on Open/Close

```tsx
// Inside SidebarProvider or SidebarOverlay
const toggleRef = useRef<HTMLButtonElement>(null)

const handleClose = useCallback(() => {
  setExpanded(false)
  // Restore focus to toggle button after state update
  requestAnimationFrame(() => {
    toggleRef.current?.focus()
  })
}, [])

// On open: focus first focusable element in panel
useEffect(() => {
  if (expanded) {
    const panel = document.querySelector('[role="dialog"][aria-label="Navigation sidebar"]')
    const firstFocusable = panel?.querySelector<HTMLElement>('a, button, [tabindex]:not([tabindex="-1"])')
    firstFocusable?.focus()
  }
}, [expanded])

// Escape key handler
useEffect(() => {
  if (!expanded) return
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') handleClose()
  }
  window.addEventListener('keydown', onKey)
  return () => window.removeEventListener('keydown', onKey)
}, [expanded, handleClose])
```

### Preserving Icon Alignment (Critical)

The existing 32px icon box alignment must be preserved exactly. This is the foundation of the rail's visual stability.

```typescript
// MUST be identical in both rail and expanded panel
const ICON_BOX = 'flex h-8 w-8 shrink-0 items-center justify-center'
// 32px box + 20px left padding (px-2 + gap) = 36px center = centered in 72px rail
```

### CTA Card Copy (Campfire Voice)

```tsx
// Growth-framed, no "dominate/conquer/grind" language
const CTA_BENEFITS = [
  'Unlimited practice sessions',
  'AI tutor feedback',
  'Advanced analytics',
]

// Card uses:
// - Heading: "Unlock more" or "Level up your prep"
// - Button: "See plans" (not "Upgrade now!" which is aggressive)
// - Collapsed icon: Sparkle from Phosphor
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Width-transition sidebar | Fixed rail + overlay panel | GitHub, Supabase (2024-2025) | Zero layout shift, GPU-composited animation |
| focus-trap-react library | `inert` attribute | Universal browser support 2023+ | Simpler, one attribute instead of a wrapper component |
| Cookie-based sidebar state | localStorage (SlateCamp-specific) | Project convention | Avoids shadcn/ui cookie bug (issue #8176); acceptable because default-collapsed avoids flash |
| Account popover at bottom | Settings as a page link | User decision (Phase 3) | Simpler footer, no popover z-index/focus complexity |

## Open Questions

1. **Tier badge values for CTA visibility**
   - What we know: UserTier is `"free" | "camp" | "insurance" | "institutional"`. CONTEXT.md mentions "pro, max" tiers.
   - What's unclear: The current UserTier type does not include "pro" or "max". CONTEXT.md says tier badge should show "free, pro, max, institutional, educational, corporate" but the existing type only has 4 values.
   - Recommendation: For now, CTA visibility checks `effectiveTier === 'free'` which works with existing types. The tier badge display can be extended later when new tiers are added to the type system. Do not block on this.

2. **Settings page ThemeToggle**
   - What we know: ThemeToggle is removed from sidebar and should live in the Settings page.
   - What's unclear: The current Settings page (`src/app/dashboard/settings/page.tsx`) only has DisciplineCard and LogoutCard. ThemeToggle is not there yet.
   - Recommendation: Phase 3 should add a ThemeCard or appearance section to the Settings page when removing ThemeToggle from the sidebar. Simple card with the existing ThemeToggle component.

3. **Admin/Dev Settings link in rail**
   - What we know: Current sidebar conditionally renders a "Dev Settings" link for admins (line 387-399).
   - What's unclear: Where this goes in the new rail + overlay architecture.
   - Recommendation: Keep it in the navigation area (after DATA group) with the same conditional. It appears in both rail and expanded states.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None configured (no vitest/jest config, no test script in package.json) |
| Config file | none |
| Quick run command | N/A |
| Full suite command | N/A |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| OVR-01 | Rail is 72px and in document flow | manual | Visual inspection in Chrome MCP | N/A |
| OVR-02 | Overlay does not cause layout shift | manual | Visual inspection -- content stays static when toggling | N/A |
| OVR-03 | Backdrop scrim appears at 25-30% opacity | manual | Visual inspection | N/A |
| OVR-04 | Click outside closes overlay | manual | Click backdrop, verify collapse | N/A |
| OVR-05 | Escape key closes overlay | manual | Press Escape while expanded | N/A |
| OVR-06 | Route change auto-collapses | manual | Click nav link, verify overlay closes | N/A |
| OVR-07 | Toggle button works in both states | manual | Click toggle in rail, click in panel | N/A |
| ACC-01 | Avatar + name + tier at top | manual | Visual inspection expanded state | N/A |
| ACC-04 | Tier badge displays plan | manual | Check with free and non-free tiers | N/A |
| FRM-01 | CTA card for free users only | manual | Check free tier shows card, paid tier hides it | N/A |
| VIS-01 | 13px nav labels, 11px group headers | manual | Inspect element font-size | N/A |
| VIS-03 | Transitions max 300ms | manual | DevTools animation inspection | N/A |
| VIS-04 | prefers-reduced-motion respected | manual | Enable reduced motion in OS settings, verify no animation | N/A |
| VIS-05 | Tooltips on collapsed icons | manual | Hover each rail icon | N/A |
| A11-01 | Focus trapped in overlay | manual | Tab through overlay, verify focus stays inside | N/A |
| A11-02 | Focus returns to toggle on close | manual | Open overlay, press Escape, verify focus on toggle | N/A |
| A11-03 | aria-expanded on toggle | manual | Inspect toggle button in DevTools | N/A |
| A11-04 | Main content inert when open | manual | Inspect content div for inert attribute | N/A |
| A11-05 | Keyboard nav within sidebar | manual | Tab + arrow keys through nav items | N/A |

### Sampling Rate
- **Per task commit:** `bun run type-check` (TypeScript compilation)
- **Per wave merge:** `bun run lint && bun run type-check`
- **Phase gate:** Full visual inspection per Chrome MCP + type-check green

### Wave 0 Gaps
- No test framework configured -- all sidebar requirements are UI/interaction behaviors best verified via manual Chrome MCP inspection
- `bun run type-check` is the only automated verification available
- Consider: `bun run build` as a gate to catch SSR/hydration issues

## Sources

### Primary (HIGH confidence)
- Existing codebase: `src/components/shared/Sidebar.tsx` (458 lines, current implementation)
- Existing codebase: `src/app/dashboard/layout.tsx` (layout architecture, context provider nesting)
- Existing codebase: `src/lib/routes.ts` (GROUPED_NAVIGATION, RouteConfig, NAV_GROUPS)
- Existing codebase: `src/components/ui/tooltip.tsx` (@base-ui/react Tooltip wrapper, z-50 Positioner)
- Existing codebase: `src/components/ui/dropdown-menu.tsx` (@base-ui/react Menu wrapper)
- Existing codebase: `src/lib/context/tier-context.tsx` (useTier hook, TierProvider)
- Existing codebase: `src/components/shared/TierBadge.tsx` (tier display component)
- Existing codebase: `src/components/shared/ThemeToggle.tsx` (component to remove from sidebar)
- Existing codebase: `src/components/quiz/ConfirmSubmitSheet.tsx` (AnimatePresence + backdrop pattern)
- Existing codebase: `src/app/globals.css` (sidebar tokens, transition tokens, z-index patterns)
- Project research: `.planning/research/ARCHITECTURE.md` (two-layer rail+overlay pattern, component tree)
- Project research: `.planning/research/PITFALLS.md` (14 documented pitfalls with prevention strategies)
- Project research: `.planning/research/STACK.md` (no new libraries, component mapping)

### Secondary (MEDIUM confidence)
- MDN: `inert` attribute -- universal browser support, removes from tab order and a11y tree
- MDN: `aria-expanded` -- standard ARIA attribute for toggle buttons
- Framer Motion: `AnimatePresence`, `useReducedMotion` -- API stable since v10+, verified in codebase usage

### Tertiary (LOW confidence)
- Tier badge extended values ("pro", "max", "educational", "corporate") -- not yet in UserTier type. May require type extension in future phases.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all libraries already installed and verified in codebase
- Architecture: HIGH - two-layer pattern documented in project research, matches GitHub/Supabase reference implementations
- Pitfalls: HIGH - 14 pitfalls documented in project research with prevention strategies and verified sources
- Accessibility: HIGH - `inert` attribute and focus management are well-documented standards
- CTA/Freemium: MEDIUM - CTA card copy and exact design are at Claude's discretion per CONTEXT.md
- Tier system extension: LOW - CONTEXT.md mentions tiers not in current type system

**Research date:** 2026-03-21
**Valid until:** 2026-04-21 (stable domain -- UI component architecture does not change frequently)
