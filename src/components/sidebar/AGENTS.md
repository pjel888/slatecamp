<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-25 -->

# sidebar

## Purpose

Fixed navigation sidebar for SlateCamp using the v2 "Quiet Navigation" architecture — a single unified element that transitions between collapsed (52px) and expanded (216px) states via CSS width transitions only. The sidebar is `position: fixed` so content never reflows; a permanent `margin-left: 52px` on `SidebarContent` keeps the layout stable at all viewport sizes. Mobile navigation is handled by a separate `MobileSidebarShell` (top bar + full-screen drawer), hidden on `lg+`.

## Key Files

| File | Purpose | Directive |
|------|---------|-----------|
| `types.ts` | Z-index scale, layout constants (52px/216px), TypeScript interfaces, icon tier system | N/A (data) |
| `sidebar-constants.ts` | Nav items config, nav groups, keyboard shortcut map | N/A (data) |
| `SidebarProvider.tsx` | React Context: expanded state, keyboard shortcuts (Cmd+B, Cmd+1-4, Escape), click-outside handler, inert management, reduced-motion support | `'use client'` |
| `Sidebar.tsx` | Unified fixed nav shell (replaces the old SidebarShell + SidebarRail + SidebarOverlay split). CSS transitions, backdrop overlay, leave-session guard | `'use client'` |
| `SidebarContent.tsx` | Main content wrapper. Permanent `margin-left: 52px` on desktop, `padding-top: 42px` on mobile | `'use client'` |
| `SidebarNavItem.tsx` | Individual nav link. Spatially locked icon in a fixed 40×32 container so icons never shift between states. Active indicator, tooltips in collapsed state, tier-based opacity | `'use client'` |
| `SidebarHeader.tsx` | Logo section: BookOpen icon + "SlateCamp" wordmark. `h-16` matches DashboardHeader height | `'use client'` |
| `SidebarFooter.tsx` | Profile row (avatar, name, Pro badge) + expand/collapse toggle (CaretDoubleRight, rotates 180° when expanded) | `'use client'` |
| `MobileTopBar.tsx` | Fixed hamburger bar for mobile (42px tall, `hidden lg:hidden` — visible only below lg breakpoint) | `'use client'` |
| `MobileDrawer.tsx` | Full-screen slide-in drawer for mobile navigation | `'use client'` |
| `MobileSidebarShell.tsx` | Coordinates MobileTopBar + MobileDrawer open/close state | `'use client'` |
| `index.ts` | Barrel exports | N/A |

## Subdirectories

None. All sidebar components are flat in `src/components/sidebar/`.

## For AI Agents

### Working In This Directory

**The v2 sidebar is a single unified element — NOT a rail+overlay split.** Do not introduce separate rail and overlay components. The single `<Sidebar>` element changes width via a CSS transition.

**Critical constraints:**
- Width: 52px collapsed / 216px expanded. These values are defined in `types.ts` and must be the single source of truth.
- The sidebar is `position: fixed`. Content offset is a permanent `margin-left: 52px` on `SidebarContent` — it does NOT change when the sidebar expands (the expanded panel overlays content, it does not push it).
- CSS transitions only. Do NOT introduce Framer Motion into the desktop sidebar.
- Keyboard shortcuts: Cmd+B toggles expand/collapse, Cmd+1-4 jump to nav sections, Escape closes. All managed in `SidebarProvider`.
- Icon spatial lock: every nav icon sits in a fixed 40×32 container (`flex-shrink-0`). Icons must be at the same x,y in both collapsed and expanded states. Never break this with flex or padding changes.
- 3-tier icon opacity: default `opacity-100`, secondary `opacity-65`, tertiary `opacity-55`.
- Icons: Phosphor (`@phosphor-icons/react`) only. Do NOT use Lucide.
- Nav config lives in `sidebar-constants.ts`. Do NOT derive nav items from `routes.ts` or any other file.
- The leave-session guard (`@/lib/context/active-session-context`) must fire before any navigation that would exit an active test session.

**Mobile (below lg breakpoint):**
- `MobileTopBar` is a 42px fixed bar that renders the hamburger.
- `MobileDrawer` is a full-screen slide-in overlay.
- `MobileSidebarShell` owns open/close state and composes the two.
- The desktop `<Sidebar>` is hidden on mobile; `MobileSidebarShell` is hidden on `lg+`.

### Layout Integration

```
dashboard/layout.tsx renders:
  <SidebarProvider>
    <Sidebar userDisplay={...} tier={...} />
    <MobileSidebarShell userDisplay={...} tier={...} />
    <SidebarContent>
      <Navbar />
      <DashboardHeader />
      <main>{children}</main>
    </SidebarContent>
  </SidebarProvider>
```

### Z-Index Scale

| Layer | Z-index |
|-------|---------|
| Backdrop | 30 |
| Sidebar | 40 |
| Mobile top bar | 45 |
| Mobile drawer | 50 |
| Tooltip | 50 |
| Dialog | 100 |

All z-index values are co-located in `types.ts`. Do not hard-code z-index values in component files.

## Dependencies

### Internal

- `@/lib/context/active-session-context` — leave-session guard before navigation
- `@/components/ui/tooltip` — shadcn Tooltip shown in collapsed state
- `@/lib/utils` — `cn()` utility for class merging

### External

- `@phosphor-icons/react` — all icons (BookOpen, CaretDoubleRight, etc.)
- `next/link` — client-side navigation
- `next/navigation` — `usePathname`, `useRouter`
- `react` — hooks, context

## Campfire Design System

### Colors & Styling

- **Sidebar background:** `bg-white` with `border-r border-[#D4DAE3]`
- **Active nav item:** `bg-[#EEF2FC] text-[#1535A8]` with left accent indicator
- **Hover nav item:** `bg-[#F8F7F5]`
- **Text (normal):** `text-[#4A5568]`
- **Text (muted):** `text-[#8896A7]`
- **Backdrop (when expanded):** semi-transparent, `z-[30]`
- **Transitions:** CSS only, max 300ms, `ease-out`. Do NOT use `duration-500` or longer.
- **Shadows:** `shadow-none` at rest; `shadow-md` on expanded drawer. Never `shadow-xl` or `shadow-2xl`.

### Typography

- Minimum text: `text-[11px]`. Never `text-[8px]`, `text-[9px]`, or `text-[10px]`.
- Nav item labels: `text-sm font-medium`
- Wordmark: `text-sm font-semibold` (visible only when expanded)
- User name: `text-sm font-medium text-[#1A2332]`
- Tier badge: `text-[11px]`
- Monospace: NOT used anywhere in the sidebar.

### Layout Constants (from `types.ts`)

| Constant | Value | Usage |
|----------|-------|-------|
| `SIDEBAR_COLLAPSED_WIDTH` | `52px` | Rail width; permanent content margin-left |
| `SIDEBAR_EXPANDED_WIDTH` | `216px` | Expanded overlay width |
| `MOBILE_TOPBAR_HEIGHT` | `42px` | Mobile top bar height; content padding-top on mobile |

<!-- MANUAL: -->
