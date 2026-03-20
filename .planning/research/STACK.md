# Technology Stack: Sidebar Redesign

**Project:** SlateCamp Dashboard Sidebar Redesign
**Researched:** 2026-03-20
**Overall Confidence:** HIGH -- All recommendations use components already installed and verified in the codebase.

## Approach Decision: Custom Build vs. shadcn/ui Sidebar Component

**Recommendation: Custom build using existing primitives. Do NOT install the shadcn/ui Sidebar component.**

**Rationale:**

1. The shadcn/ui `Sidebar` component is a heavy, opinionated abstraction (SidebarProvider, SidebarInset, SidebarContent, SidebarGroup, SidebarMenu, SidebarMenuItem, etc.) designed for greenfield projects. It brings its own context provider, mobile drawer behavior (using Sheet), and layout assumptions that conflict with SlateCamp's existing `dashboard/layout.tsx` flex architecture.

2. SlateCamp already has a working 424-line sidebar with established patterns for route management (SIDEBAR_NAVIGATION), active session protection (leave-session dialog), icon system (SCIcon + Phosphor), and localStorage collapse persistence. Ripping this out for a different abstraction adds risk with no benefit.

3. The project already has every primitive needed: `Popover` (Base UI), `Tooltip` (Base UI), `Avatar` (Base UI), `Button` (Base UI), `Separator` (Base UI), `ScrollArea` (Base UI), `DropdownMenu` / `Menu` (Base UI), `Sheet` / `Dialog` (Base UI), and `Dialog` (Base UI). All are `@base-ui/react` 1.2.0 wrappers -- no Radix dependency needed.

4. The overlay expand behavior (sidebar stays fixed, overlays content, does not push layout) is a CSS positioning concern, not a component library concern. Tailwind CSS 4 handles this with `fixed`/`absolute` positioning and `transition-[width]`.

## Recommended Stack (Existing -- No New Installs)

### Core Components from shadcn/ui (Base UI wrappers)

| Component | File | Purpose in Sidebar | Why |
|-----------|------|-------------------|-----|
| **Popover** | `src/components/ui/popover.tsx` | Account settings menu at bottom (GitHub-style) | Already uses `@base-ui/react/popover` with Portal, Positioner, Popup. Supports `side="right"`, `sideOffset`, `align` props. Perfect for a bottom-anchored account popover that opens to the right of the collapsed rail. |
| **Tooltip** | `src/components/ui/tooltip.tsx` | Icon tooltips in collapsed state | Already used in current sidebar for collapsed nav items. No changes needed. |
| **Avatar** | `src/components/ui/avatar.tsx` | User profile display | Already used in current sidebar. Has `size` variants (sm, default, lg). |
| **Button** | `src/components/ui/button.tsx` | Collapse toggle, upgrade CTA | Already used. Has `ghost`, `outline`, `warmCta` variants. |
| **Separator** | `src/components/ui/separator.tsx` | Visual dividers between nav groups | Uses `@base-ui/react/separator`. Supports `orientation="horizontal"`. |
| **ScrollArea** | `src/components/ui/scroll-area.tsx` | Scrollable nav content when items overflow | Uses `@base-ui/react/scroll-area`. Already styled with thin scrollbar. |
| **DropdownMenu** | `src/components/ui/dropdown-menu.tsx` | Alternative to Popover for account menu (structured menu items) | Uses `@base-ui/react/menu`. Has `DropdownMenuGroup`, `DropdownMenuLabel`, `DropdownMenuSeparator`, `DropdownMenuItem`. Better than Popover when you need keyboard-navigable menu items (arrow keys, typeahead). |

### Supporting Libraries (Already Installed)

| Library | Version | Purpose in Sidebar | When to Use |
|---------|---------|-------------------|-------------|
| **Framer Motion** | 12.35.2 | Smooth expand/collapse animations, backdrop fade | Use `AnimatePresence` + `motion.div` for the overlay backdrop fade and sidebar slide-in. Preferred over CSS-only transitions for coordinated enter/exit animations. Already used in `Omnibar.tsx`. |
| **Phosphor Icons** | `@phosphor-icons/react` | All sidebar icons | Already the primary icon library. Use through `SCIcon` wrapper for consistent sizing (18px at `size="sm"`). |
| **class-variance-authority** | installed | Variant-based styling for nav items | Use `cva` if sidebar items need multiple visual variants (default, active, disabled, grouped). |
| **tailwind-merge + clsx** | installed | `cn()` utility | Always use `cn()` for conditional class composition. Never raw template literals. |
| **next-themes** | installed | Theme toggle in account popover | Already used by `ThemeToggle` component. Move into the account popover. |

### CSS Tokens (Already Defined in globals.css)

| Token | Variable | Value (Light) | Use For |
|-------|----------|---------------|---------|
| Sidebar background | `--sidebar` | `#ffffff` | `bg-sidebar` |
| Sidebar text | `--sidebar-foreground` | `#1A2332` | `text-sidebar-foreground` |
| Sidebar primary | `--sidebar-primary` | `#1B3FC4` | Active item text/indicator |
| Sidebar accent | `--sidebar-accent` | `#EEF2FC` | Active item background, hover |
| Sidebar border | `--sidebar-border` | `#D4DAE3` | Section dividers |
| Transition fast | `--transition-fast` | `100ms ease-out` | Hover states |
| Transition normal | `--transition-normal` | `150ms ease-out` | Default transitions |
| Transition slow | `--transition-slow` | `200ms ease-out` | Expand/collapse |

## Component-Specific Patterns

### 1. Overlay Sidebar (The Core Pattern)

**Use: Tailwind CSS 4 positioning + Framer Motion**

The current sidebar uses `transition-[width]` with `w-[72px]` / `w-[260px]` inside a flex layout, which **pushes** content. The redesign needs an overlay that **does not** shift content.

**Architecture:**

```
Collapsed state: <aside> at fixed width (72px), static in flex layout
Expanded state:  <aside> at fixed width (72px) stays + overlay panel appears on top
```

**Two-layer approach:**

- **Layer 1 (Rail):** Always-visible 72px collapsed rail. Position: static within the flex container (same as current). Shows: logo, icon nav items, collapse toggle, avatar button.
- **Layer 2 (Overlay panel):** Conditionally rendered 260px panel. Position: `fixed left-[72px] top-0 h-full` (anchored to the right edge of the rail). Shows: full nav labels, group headers, user profile, upgrade CTA, account popover. Rendered via `AnimatePresence` for enter/exit animations.
- **Layer 3 (Backdrop):** Semi-transparent backdrop behind the overlay. `fixed inset-0 z-30 bg-black/5`. Click to dismiss.

**Why NOT use Sheet:** The Sheet component is designed for off-screen drawers (slides from edge). The sidebar overlay needs to be anchored to the rail, not to the viewport edge. Sheet also brings its own backdrop management that would conflict.

**Tailwind classes for the overlay panel:**

```
fixed left-[72px] top-0 h-full w-[188px] z-40
bg-sidebar border-r border-sidebar-border shadow-md
```

**Why `w-[188px]`:** Rail (72px) + panel (188px) = 260px total, matching the current expanded width. The content area sees the rail at 72px and never shifts.

### 2. Account Settings Popover (GitHub-style Bottom Menu)

**Use: DropdownMenu, NOT Popover**

**Rationale:** The account menu at the bottom contains actionable items (Settings link, Theme toggle, Logout button). `DropdownMenu` (Base UI `Menu`) provides:
- Full keyboard navigation (arrow keys between items)
- Typeahead search
- Proper `role="menu"` / `role="menuitem"` semantics
- Focus management (returns focus to trigger on close)

`Popover` is for informational/form content, not action menus. Using Popover here would require manually re-implementing all the accessibility that Menu provides for free.

**Positioning:**

```tsx
<DropdownMenuContent
  side="right"      // Opens to the right of the trigger
  sideOffset={8}    // 8px gap from trigger
  align="end"       // Aligns to bottom edge of trigger
  alignOffset={0}
/>
```

When sidebar is expanded (overlay visible), position `side="top"` instead so it opens above the trigger within the overlay panel.

### 3. Navigation Groups (LEARN, PRACTICE, DATA)

**Use: Semantic HTML + Tailwind spacing. No component needed.**

Group labels are purely visual separators. They do not need Radix/Base UI primitives.

```tsx
// Group label when expanded
<div className="px-3 py-1.5">
  <span className="text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
    Learn
  </span>
</div>

// Group label when collapsed: hidden (SR-only)
<span className="sr-only">Learn</span>
```

Use `Separator` between groups for visual clarity in the collapsed rail.

### 4. Collapse/Expand Toggle

**Use: Button (ghost variant) + SCIcon (SidebarSimple)**

Preserve the current pattern. The toggle button lives at the top of the rail. When clicked:
- **Collapsed -> Expanded:** Show the overlay panel + backdrop via `AnimatePresence`
- **Expanded -> Collapsed:** Remove overlay panel + backdrop

State management: `useState` with `localStorage` persistence (existing pattern). No Zustand needed -- this is purely local UI state.

### 5. Freemium Ad/Upgrade CTA

**Use: Card-like div with Button (warmCta variant)**

Positioned above the account menu trigger in the expanded overlay. Hidden when collapsed (no room in 72px rail). Use `cn()` with conditional opacity for smooth appear/disappear.

### 6. Smooth Transitions

**Use: Framer Motion for overlay + CSS transitions for everything else**

| Element | Mechanism | Duration | Easing |
|---------|-----------|----------|--------|
| Overlay panel enter | `motion.div` + `animate={{ x: 0 }}` from `initial={{ x: -20 }}` | 200ms | `ease-out` |
| Overlay panel exit | `exit={{ x: -20, opacity: 0 }}` | 150ms | `ease-in` |
| Backdrop enter/exit | `motion.div` + `animate={{ opacity: 1 }}` | 150ms | `ease-out` |
| Nav item hover | CSS `transition-colors duration-150` | 150ms | `ease-out` |
| Active indicator | CSS `transition-all duration-200` | 200ms | `ease-out` |
| Icon weight change | Phosphor `weight` prop (no transition needed) | instant | -- |

**Reduced motion:** Wrap Framer Motion values in a check:

```tsx
const prefersReducedMotion = useReducedMotion() // from framer-motion
const animationProps = prefersReducedMotion
  ? { initial: false, animate: { opacity: 1 }, exit: { opacity: 0 } }
  : { initial: { x: -20, opacity: 0 }, animate: { x: 0, opacity: 1 }, exit: { x: -20, opacity: 0 } }
```

**Max 300ms:** All transitions respect the Campfire design system ceiling. No `duration-500` or higher.

## Alternatives Considered

| Category | Recommended | Alternative | Why Not Alternative |
|----------|-------------|-------------|-------------------|
| Sidebar framework | Custom build with existing primitives | shadcn/ui Sidebar component | Heavy abstraction, brings SidebarProvider/SidebarInset layout assumptions, conflicts with existing flex layout. Would require rearchitecting dashboard layout. |
| Account menu | DropdownMenu (Base UI Menu) | Popover (Base UI Popover) | Popover lacks keyboard menu navigation, typeahead, and menu ARIA roles. Would need manual a11y work. |
| Overlay animation | Framer Motion | CSS-only transitions | CSS cannot animate enter/exit of conditionally rendered elements (no `AnimatePresence` equivalent). Framer Motion is already installed and used. |
| Overlay mechanism | Fixed positioning + backdrop | Sheet component (left side) | Sheet assumes off-screen drawer from viewport edge. Sidebar overlay must anchor to the 72px rail edge, not viewport. Sheet's backdrop handling would also conflict. |
| State management | useState + localStorage | Zustand store | Overkill for boolean collapse state. No other component needs sidebar state. If that changes in future (e.g., mobile sidebar), extract to Zustand then. |
| Icon library | Phosphor Icons (existing) | Lucide React (also installed) | Phosphor is the primary icon library per stack docs. Lucide is secondary. Mixing would create inconsistency. |
| Group labels | Plain HTML spans | NavigationMenu (Radix) | NavigationMenu is designed for horizontal nav bars with dropdown submenus, not vertical grouped lists. Wrong tool for the job. |

## What NOT to Install

| Library | Why NOT |
|---------|---------|
| **Headless UI** (`@headlessui/react`) | Duplicates what Base UI already provides. SlateCamp is standardized on `@base-ui/react`. |
| **Radix UI primitives** (individual packages) | SlateCamp migrated to `@base-ui/react` (the successor). All shadcn/ui components already use Base UI. Adding Radix would create two parallel primitive systems. |
| **react-sidebar** / **react-pro-sidebar** | Third-party sidebar libraries add opinionated structure. The requirement is a custom professional design (GitHub/Supabase-style), not a generic sidebar. |
| **@floating-ui/react** (directly) | Base UI already wraps Floating UI internally. Using it directly would bypass Base UI's accessibility layer. |
| **Additional animation libraries** (react-spring, auto-animate) | Framer Motion 12.35 is already installed and sufficient. |

## Layout Architecture Change

The key change is in `src/app/dashboard/layout.tsx`. Currently:

```tsx
// CURRENT: Sidebar pushes content
<div className="flex h-screen overflow-hidden">
  <Sidebar />  {/* w-[72px] or w-[260px], causes layout shift */}
  <div className="flex flex-1 flex-col overflow-hidden border-l">
    {/* content */}
  </div>
</div>
```

**After redesign:**

```tsx
// NEW: Rail is static, overlay floats above
<div className="flex h-screen overflow-hidden">
  <SidebarRail />  {/* Always w-[72px], never changes width */}
  <div className="flex flex-1 flex-col overflow-hidden border-l">
    {/* content -- never shifts */}
  </div>
  <SidebarOverlay />  {/* fixed positioned, renders via portal or at root */}
</div>
```

The `SidebarOverlay` is conditionally rendered (via `AnimatePresence`) and positioned with `fixed left-[72px] top-0 h-full`. The content area always sees a 72px sidebar -- zero layout shift.

## File Structure Recommendation

```
src/components/sidebar/
  SidebarRail.tsx          -- 72px collapsed rail (always visible)
  SidebarOverlay.tsx       -- Expanded overlay panel + backdrop
  SidebarNavGroup.tsx      -- Grouped nav items (LEARN, PRACTICE, DATA)
  SidebarNavItem.tsx       -- Individual nav link (extracted from current)
  SidebarAccountMenu.tsx   -- Bottom account DropdownMenu
  SidebarUpgradeCTA.tsx    -- Freemium ad/upgrade card
  SidebarUserProfile.tsx   -- Avatar + name + tier display
  sidebar-constants.ts     -- Navigation groups config, widths
  use-sidebar-state.ts     -- useState + localStorage hook (extracted)
```

This is a clean decomposition of the current monolithic 424-line `Sidebar.tsx` into focused, testable modules.

## Installation

No new packages needed. Zero `npm install` or `bun add` commands.

```bash
# Nothing to install. All dependencies are already in place:
# - @base-ui/react@1.2.0 (Popover, Menu, Tooltip, Avatar, etc.)
# - framer-motion@12.35.2 (AnimatePresence, motion)
# - @phosphor-icons/react (all icons)
# - tailwindcss@4.2.1 (all utility classes)
# - class-variance-authority (variant styling)
# - tailwind-merge + clsx (cn utility)
```

## Sources

- SlateCamp codebase: `src/components/shared/Sidebar.tsx` (current implementation, 424 lines)
- SlateCamp codebase: `src/app/dashboard/layout.tsx` (flex layout architecture)
- SlateCamp codebase: `src/components/ui/popover.tsx` (Base UI Popover wrapper)
- SlateCamp codebase: `src/components/ui/dropdown-menu.tsx` (Base UI Menu wrapper)
- SlateCamp codebase: `src/components/ui/sheet.tsx` (Base UI Dialog wrapper -- evaluated and rejected for overlay)
- SlateCamp codebase: `src/app/globals.css` (sidebar CSS tokens, transition tokens, reduced motion patterns)
- [shadcn/ui Sidebar docs](https://ui.shadcn.com/docs/components/radix/sidebar) -- evaluated and rejected for this project (MEDIUM confidence)
- [Base UI Popover docs](https://base-ui.com/react/components/popover) -- Positioner/Popup/Portal API (MEDIUM confidence -- web search, not fetched)
- [Base UI Menu docs](https://base-ui.com/react/components/menu) -- Menu keyboard navigation (MEDIUM confidence)
- [shadcn/ui changelog](https://ui.shadcn.com/docs/changelog) -- Base UI variant availability confirmed (MEDIUM confidence)
