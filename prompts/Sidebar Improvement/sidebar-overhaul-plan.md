# SlateCamp Sidebar Overhaul — Comprehensive Implementation Plan

> **Codename:** Sidebar v2 — "The Quiet Navigation"
> **Governing Principle:** Dieter Rams — "Good design is as little design as possible."
> **Reference Aesthetic:** GitHub sidebar · Supabase dashboard nav · Claude conversation panel
> **Status:** Planning → Ready for implementation

---

## Table of Contents

1. [Problem Statement & Motivation](#1-problem-statement--motivation)
2. [Design Philosophy & Constraints](#2-design-philosophy--constraints)
3. [Information Architecture](#3-information-architecture)
4. [Visual Design Specification](#4-visual-design-specification)
5. [Component Architecture](#5-component-architecture)
6. [State Machine & Behavior Model](#6-state-machine--behavior-model)
7. [Spatial Geometry Contract](#7-spatial-geometry-contract)
8. [Overlay System & Layout Integration](#8-overlay-system--layout-integration)
9. [Animation & Motion Specification](#9-animation--motion-specification)
10. [Responsive & Mobile Behavior](#10-responsive--mobile-behavior)
11. [Accessibility Requirements](#11-accessibility-requirements)
12. [Dark Mode Specification](#12-dark-mode-specification)
13. [Keyboard Navigation & Shortcuts](#13-keyboard-navigation--shortcuts)
14. [Design Token & Tailwind Config Changes](#14-design-token--tailwind-config-changes)
15. [Implementation Steps (Ordered)](#15-implementation-steps-ordered)
16. [Testing Checklist](#16-testing-checklist)
17. [The Prompt (Copy/Paste Ready)](#17-the-prompt-copypaste-ready)

---

## 1. Problem Statement & Motivation

### What's Wrong

The current sidebar suffers from three compounding problems:

1. **Visual immaturity.** Oversized icons, heavy color fills, bubbly rounded corners, and playful proportions communicate "toy app" rather than "professional mastery engine." SlateCamp's users are adult architecture professionals preparing for the most important exam of their careers. The navigation should reflect that gravity.

2. **Spatial inefficiency.** The sidebar consumes too much horizontal real estate in its expanded state, and when it collapses, it causes a jarring layout reflow — the main content area resizes, triggering Cumulative Layout Shift (CLS). This violates the user's spatial memory: icons move, cards reflow, and the user must re-orient themselves after every toggle.

3. **Behavioral mismatch.** The sidebar treats all navigation items equally. There is no hierarchy, no contextual awareness, and no progressive disclosure. A student looking for their Camp Trail and an admin checking settings are given the same visual weight.

### What Success Looks Like

After this overhaul, the sidebar should:

- Feel like it belongs in GitHub, Supabase, or Linear — calm, precise, dense where needed
- Expand as an overlay without disturbing a single pixel of the main content area
- Keep all icon positions mathematically locked between collapsed and expanded states
- Respect the SlateCamp design system (Rams Standard, brand colors, typography)
- Be fully keyboard-navigable and screen-reader accessible
- Perform well on mid-range Android devices (the median SlateCamp user's hardware)

---

## 2. Design Philosophy & Constraints

### The Rams Standard Applied to Navigation

The sidebar is infrastructure, not content. It should disappear into muscle memory:

- **Invisible when working.** The collapsed state is the default. The student's focus belongs on quizzes, the heatmap, and the wiki — not on navigation chrome.
- **Instantly available when needed.** Hover or click expands the sidebar within 200ms. The user never waits.
- **Honest about hierarchy.** Primary destinations (Dashboard, Map, Trail) are visually dominant. Secondary items (Settings, Help) are visually recessive. The sidebar tells you what matters most.

### Hard Constraints (Non-Negotiable)

| # | Constraint | Rationale |
|---|-----------|-----------|
| C1 | Icons must not move between collapsed/expanded states | Preserves spatial memory, prevents CLS |
| C2 | Expanded sidebar must overlay, never push content | Main content layout is sacred — no reflow |
| C3 | No font below 11px for readable text | WCAG 2.1 AA compliance. 8–9px permitted ONLY for eyebrow labels, tertiary badges, keyboard shortcut hints |
| C4 | One primary action color only (Cobalt `#1B3FC4`) | SlateCamp design system rule — no mixing action colors |
| C5 | No gamification elements in navigation | No badges, streaks, XP counters, or notification dots that create anxiety |
| C6 | Must work on 360px-wide Android screens | Median SlateCamp user is on Realme/Samsung A series |
| C7 | Dark mode parity from day one | Students study late at night — dark mode is not optional |
| C8 | All transitions ≤ 200ms | Anything slower feels laggy on mid-range devices |

### Soft Constraints (Strong Preferences)

| # | Preference | Notes |
|---|-----------|-------|
| S1 | Collapse on outside click or Escape key | Standard overlay dismissal pattern |
| S2 | Persist collapsed/expanded preference per session | `sessionStorage` or Zustand store |
| S3 | Show active route with left border accent, not background fill | Matches GitHub's pattern, avoids heavy color blocks |
| S4 | Tooltip on hover in collapsed state (icon-only mode) | So users know what each icon does without expanding |

---

## 3. Information Architecture

### Navigation Hierarchy

The sidebar contains exactly these items, in this order. No more, no fewer:

```
─── PRIMARY (the study loop) ───────────────────────
  🏠  Dashboard        /dashboard
  📊  Map              /map
  🏕  Trail            /trail
  📝  Notes            /notes
  📚  Wiki             /wiki

─── SECONDARY (tools) ─────────────────────────────
  🧪  3D Lab           /3d-lab
  🔥  Campfire         /campfire

─── TERTIARY (system) ─────────────────────────────
  ⚙️  Settings         /settings
  ❓  Help & Feedback  /help

─── FOOTER ────────────────────────────────────────
  👤  Profile avatar + name (expanded only)
  🔄  Collapse toggle
```

### Hierarchy Rules

1. **Primary items** get 100% opacity icons, `text-foreground` labels, and the active route indicator.
2. **Secondary items** get 70% opacity icons, `text-muted-foreground` labels. They are separated from primary by a `1px` divider line.
3. **Tertiary items** get 60% opacity icons, `text-muted-foreground` labels. Pinned to the bottom of the sidebar, separated by auto-margin spacing.
4. **The collapse toggle** is always the last element, pinned to the absolute bottom.

### Grouping & Dividers

```
[Primary group]
── 1px divider (border-border, opacity-50) ──
[Secondary group]
── flex-grow spacer ──
[Tertiary group]
── 1px divider ──
[Profile + Collapse toggle]
```

---

## 4. Visual Design Specification

### Reference Analysis

What we're borrowing from each reference:

| Source | What We Take | What We Reject |
|--------|-------------|----------------|
| **GitHub** | Left-border active indicator, muted icon style, compact vertical rhythm, monochrome palette | The heavy top navigation bar, nested flyout menus |
| **Supabase** | Overlay expansion pattern, subtle backdrop shadow, tight 12px padding, section dividers | The green brand color (we use Cobalt), icon-heavy density |
| **Claude** | Clean negative space, conversation-panel-style overlay, graceful expand/collapse, warm neutrals | The right-side panel orientation (ours is left) |
| **Linear** | Keyboard-shortcut badges next to items, ultra-minimal icon set, collapsed tooltip pattern | The command-palette-driven navigation (too complex for our users) |

### Collapsed State (Default)

```
┌──────┐
│      │
│  🏠  │  ← 20×20 icon, centered in 48×48 hit area
│      │
│  📊  │
│      │
│  🏕  │
│      │
│  📝  │
│      │
│  📚  │
│      │
│ ─── │  ← 1px divider, 8px horizontal margin
│      │
│  🧪  │
│      │
│  🔥  │
│      │
│      │  ← flex-grow spacer
│      │
│  ⚙️  │
│      │
│  ❓  │
│      │
│ ─── │
│      │
│  👤  │  ← avatar, 28×28, rounded-full
│      │
│  ◀▶  │  ← collapse/expand toggle, 16×16
│      │
└──────┘

Width: 64px
Padding: 8px horizontal
Icon size: 20×20 (Lucide icons, strokeWidth 1.75)
Hit area: 48×48 per item (touch-target compliant)
Vertical gap: 4px between items
```

### Expanded State (Overlay)

```
┌─────────────────────────┐
│                         │
│  🏠  Dashboard     ⌘1  │  ← icon (locked x,y) + label + shortcut badge
│                         │
│  📊  Map           ⌘2  │
│                         │
│  🏕  Trail         ⌘3  │
│                         │
│  📝  Notes         ⌘4  │
│                         │
│  📚  Wiki          ⌘5  │
│                         │
│ ────────────────────── │
│                         │
│  🧪  3D Lab             │
│                         │
│  🔥  Campfire           │
│                         │
│                         │  ← flex-grow spacer
│                         │
│  ⚙️  Settings           │
│                         │
│  ❓  Help & Feedback    │
│                         │
│ ────────────────────── │
│                         │
│  👤  Philip Gonzales    │  ← avatar + name + "Pro" badge
│      philip@email.com   │  ← email, text-muted-foreground
│                         │
│  ◀▶  Collapse      ⌘B  │
│                         │
└─────────────────────────┘

Width: 240px
Icon column: fixed at x=20px (center of 48px hit area) — SAME as collapsed
Label: starts at x=52px, font-sans text-sm text-foreground
Shortcut badge: right-aligned, font-mono text-[9px] text-muted-foreground
                bg-muted rounded-sm px-1.5 py-0.5
```

### Active Route Indicator

The currently active route is indicated by:

1. **Left border accent:** 3px solid Cobalt Blue (`#1B3FC4`) on the left edge of the nav item
2. **Icon fill:** Icon changes from `text-muted-foreground` (default) to `text-foreground` (active)
3. **Label weight:** Changes from `font-normal` to `font-medium` (expanded state only)
4. **Background:** Extremely subtle — `bg-muted/50` (50% opacity of muted background)

What we do NOT do:
- No full-width background color fill (too heavy)
- No icon color change to brand blue (icons stay monochrome)
- No bold or animated underlines

### Hover State

```css
/* Nav item hover */
background: var(--muted);       /* bg-muted — very subtle */
border-radius: 6px;             /* rounded-md */
transition: background 150ms;
```

No color changes on icons. No scale transforms. No shadow additions. Just a quiet background shift.

---

## 5. Component Architecture

### File Structure

```
src/
  components/
    sidebar/
      Sidebar.tsx              ← Main component (client component)
      SidebarNav.tsx           ← Navigation list (server-compatible, receives items as props)
      SidebarNavItem.tsx       ← Individual nav item (client — uses pathname)
      SidebarProfile.tsx       ← Profile section at bottom (client — user data)
      SidebarToggle.tsx        ← Collapse/expand button
      SidebarTooltip.tsx       ← Tooltip wrapper for collapsed state
      sidebar-constants.ts     ← Navigation items, dimensions, keyboard shortcuts
      use-sidebar.ts           ← Custom hook: state management, keyboard listeners
  types/
    sidebar.ts                 ← TypeScript interfaces
```

### Component Boundary Decisions

| Component | Directive | Rationale |
|-----------|-----------|-----------|
| `Sidebar.tsx` | `'use client'` | Uses `useState`, keyboard event listeners, `usePathname` |
| `SidebarNav.tsx` | None needed | Receives nav items as props, renders `SidebarNavItem` children |
| `SidebarNavItem.tsx` | `'use client'` | Uses `usePathname` for active state, click handlers |
| `SidebarProfile.tsx` | `'use client'` | Displays user data from Zustand or session |
| `SidebarToggle.tsx` | `'use client'` | Click handler to toggle expansion |
| `SidebarTooltip.tsx` | `'use client'` | Uses Shadcn Tooltip (requires client) |
| `sidebar-constants.ts` | N/A (data file) | Pure data — nav items, dimensions |
| `use-sidebar.ts` | N/A (hook) | `useState`, `useEffect`, keyboard listeners |

### TypeScript Interfaces

```typescript
// types/sidebar.ts

export interface NavItem {
  id: string
  label: string
  href: string
  icon: LucideIcon        // Lucide React icon component
  group: 'primary' | 'secondary' | 'tertiary'
  shortcut?: string       // e.g., '⌘1' — displayed as badge
}

export interface SidebarState {
  isExpanded: boolean
  toggle: () => void
  collapse: () => void
  expand: () => void
}

export interface SidebarDimensions {
  collapsedWidth: number   // 64px
  expandedWidth: number    // 240px
  iconSize: number         // 20px
  hitArea: number          // 48px
  iconCenterX: number      // 20px from left edge (centers icon in 48px area with 8px padding)
  labelStartX: number      // 52px from left edge
  verticalGap: number      // 4px between items
  padding: number          // 8px horizontal
}
```

---

## 6. State Machine & Behavior Model

### States

The sidebar has exactly two visual states:

```
┌──────────┐    hover/click/⌘B    ┌──────────┐
│COLLAPSED │ ──────────────────→ │ EXPANDED │
│  (64px)  │ ←────────────────── │ (240px)  │
└──────────┘    click-outside/    └──────────┘
                Escape/⌘B/
                nav item click
```

### Trigger Matrix

| Action | From Collapsed | From Expanded |
|--------|---------------|---------------|
| Click toggle button | → Expand | → Collapse |
| Press `⌘B` / `Ctrl+B` | → Expand | → Collapse |
| Click a nav item | Navigate (stay collapsed) | Navigate + Collapse |
| Click outside sidebar | No-op | → Collapse |
| Press `Escape` | No-op | → Collapse |
| Hover over collapsed sidebar | Show tooltip on hovered item | N/A (already expanded) |
| Resize window below 768px | Force collapse, disable expand | Force collapse, disable expand |

### State Persistence

- Store `isExpanded` in a Zustand store (not `localStorage` — per the design system, this is session-level state)
- On page navigation, the sidebar collapses automatically (expanded is contextual, not persistent)
- On mobile (<768px), the sidebar is always collapsed. The expand trigger opens a full-screen drawer instead (see Section 10)

---

## 7. Spatial Geometry Contract

This is the most critical section. The icon positions must be pixel-identical between states.

### The Math

```
COLLAPSED STATE:
  Sidebar width = 64px
  Horizontal padding = 8px each side
  Available icon width = 64 - 8 - 8 = 48px
  Icon size = 20px
  Icon center X = 8 (padding) + 24 (half of 48) = 32px from sidebar left edge
  Icon actual left = 32 - 10 = 22px from sidebar left edge

EXPANDED STATE:
  Sidebar width = 240px
  Horizontal padding = 8px each side
  Icon column width = 48px (same as collapsed available width)
  Icon center X = 8 (padding) + 24 (half of 48) = 32px from sidebar left edge  ← IDENTICAL
  Icon actual left = 32 - 10 = 22px from sidebar left edge  ← IDENTICAL
  Label starts at = 8 (padding) + 48 (icon column) + 4 (gap) = 60px from left edge
```

### Implementation Strategy

The icon is placed using fixed positioning within its row:

```tsx
{/* Each nav item row */}
<div className="relative flex items-center h-12 px-2">
  {/* Icon container — ALWAYS at the same position */}
  <div className="flex-shrink-0 flex items-center justify-center w-12 h-12">
    <Icon className="w-5 h-5" />
  </div>

  {/* Label — only visible when expanded, clips otherwise */}
  <span className={cn(
    "ml-1 text-sm whitespace-nowrap overflow-hidden transition-opacity duration-200",
    isExpanded ? "opacity-100" : "opacity-0 w-0"
  )}>
    {label}
  </span>
</div>
```

The key insight: the icon container has a fixed width (`w-12` = 48px) and is `flex-shrink-0`. It never compresses or moves regardless of the sidebar width. The label appears to the right and fades in/out without affecting the icon's position.

### Verification Test

After implementation, run this visual regression check:

1. Open DevTools
2. In collapsed state, note the `getBoundingClientRect()` of any icon element
3. Expand the sidebar
4. Re-check `getBoundingClientRect()` of the same icon
5. `top`, `left`, `width`, and `height` must be **identical** (±0px)

---

## 8. Overlay System & Layout Integration

### The Overlay Architecture

The sidebar expanded state is an overlay. It does NOT participate in the document flow of the main content area.

```
┌────────────────────────────────────────────────┐
│ Root Layout                                     │
│                                                 │
│  ┌──────┐  ┌──────────────────────────────────┐ │
│  │Side- │  │ Main Content Area                │ │
│  │bar   │  │                                  │ │
│  │(64px)│  │ margin-left: 64px (ALWAYS)       │ │
│  │      │  │ This NEVER changes.              │ │
│  │ position: fixed                            │ │
│  │ left: 0                                    │ │
│  │ top: 0                                     │ │
│  │ height: 100vh                              │ │
│  │ width: 64px → 240px (on expand)            │ │
│  │ z-index: 40                                │ │
│  │      │  │                                  │ │
│  └──────┘  └──────────────────────────────────┘ │
│                                                 │
│  ┌─────────────────────────────────────────────┐│
│  │ Backdrop (when expanded)                    ││
│  │ position: fixed, inset: 0                   ││
│  │ z-index: 30                                 ││
│  │ bg-black/5 (light) or bg-black/20 (dark)    ││
│  │ backdrop-blur-[1px] (very subtle)           ││
│  │ click → collapse sidebar                    ││
│  └─────────────────────────────────────────────┘│
└────────────────────────────────────────────────┘
```

### Layout.tsx Integration

```tsx
// app/layout.tsx (simplified)

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Sidebar />
        <main className="ml-16"> {/* ml-16 = 64px. NEVER CHANGES. */}
          {children}
        </main>
      </body>
    </html>
  )
}
```

### Critical Rules

1. The `<main>` element has a **permanent** `margin-left: 64px` (the collapsed sidebar width). This margin does not animate, toggle, or change under any circumstance.
2. The sidebar uses `position: fixed` so it is removed from document flow entirely.
3. When expanded, the sidebar's width animates from `64px` to `240px`. The extra `176px` overlaps the main content — it does not push it.
4. A backdrop overlay (`z-index: 30`) appears behind the expanded sidebar (`z-index: 40`) but above the main content (`z-index: auto`). Clicking the backdrop collapses the sidebar.
5. The backdrop uses minimal visual treatment: `bg-black/5` with `backdrop-blur-[1px]`. Enough to signal "overlay mode" without darkening the content aggressively.

---

## 9. Animation & Motion Specification

### Allowed Animations

Per the SlateCamp design system, animation is only permitted when it communicates something the static state cannot.

| Animation | Duration | Easing | Justification |
|-----------|----------|--------|---------------|
| Sidebar width expand | 200ms | `ease-out` | Communicates state change, matches user's click/hover intent |
| Sidebar width collapse | 150ms | `ease-in` | Slightly faster collapse feels snappier |
| Label opacity fade-in | 200ms | `ease-out` | Prevents jarring text pop-in |
| Label opacity fade-out | 100ms | `ease-in` | Labels should vanish quickly so icons feel stable |
| Backdrop opacity in | 200ms | `ease-out` | Smooth overlay appearance |
| Backdrop opacity out | 150ms | `ease-in` | Clean dismissal |
| Active indicator left-border | 150ms | `ease-out` | Smooth route change feedback |
| Tooltip appearance | 100ms delay + 150ms fade | `ease-out` | Standard tooltip behavior |

### Forbidden Animations

- Icon position changes (icons are spatially locked — Constraint C1)
- Icon scale/bounce on hover
- Sidebar slide-in from off-screen (it's always present, just narrow)
- Content area shift or resize
- Any animation > 200ms

### CSS Implementation

```css
/* Sidebar container */
.sidebar {
  transition: width 200ms ease-out;
}

/* When collapsing (use JS to toggle this class) */
.sidebar--collapsing {
  transition: width 150ms ease-in;
}

/* Nav item labels */
.sidebar__label {
  transition: opacity 200ms ease-out;
}

/* Backdrop */
.sidebar__backdrop {
  transition: opacity 200ms ease-out;
}
```

Use Tailwind equivalents:
```
transition-[width] duration-200 ease-out
transition-opacity duration-200 ease-out
```

---

## 10. Responsive & Mobile Behavior

### Breakpoint Strategy

| Breakpoint | Sidebar Behavior |
|-----------|-----------------|
| ≥1024px (lg) | Full sidebar — collapsed default, expand on hover/click, overlay pattern |
| 768–1023px (md) | Collapsed sidebar only — expand opens overlay, no hover-expand |
| <768px (sm/base) | No visible sidebar — hamburger icon in top bar, expand opens full-screen drawer |

### Mobile Drawer (< 768px)

On mobile, the sidebar transforms into a full-screen navigation drawer:

```
┌──────────────────────────┐
│  ✕  SlateCamp             │  ← Close button + logo
│                           │
│  🏠  Dashboard            │
│  📊  Map                  │
│  🏕  Trail                │
│  📝  Notes                │
│  📚  Wiki                 │
│                           │
│  ─────────────────────── │
│                           │
│  🧪  3D Lab               │
│  🔥  Campfire             │
│                           │
│                           │
│  ⚙️  Settings             │
│  ❓  Help & Feedback      │
│                           │
│  ─────────────────────── │
│                           │
│  👤  Philip Gonzales      │
│      Pro · philip@email   │
│                           │
└──────────────────────────┘

Width: 100vw
Height: 100vh
z-index: 50
Background: bg-background (opaque)
Entry: slide-in from left, 250ms ease-out
Exit: slide-out to left, 200ms ease-in
```

### Touch Target Compliance

All interactive elements in the sidebar must meet the 44×44px minimum touch target:

- Nav items: `h-12` (48px) — ✅ compliant
- Collapse toggle: `w-12 h-12` (48px) — ✅ compliant
- Profile section: `h-14` (56px) — ✅ compliant

---

## 11. Accessibility Requirements

### WCAG 2.1 AA Compliance

| Requirement | Implementation |
|------------|----------------|
| **Landmark role** | `<nav aria-label="Main navigation">` on the sidebar |
| **Current page** | `aria-current="page"` on the active nav item |
| **Expand/collapse** | `aria-expanded="true/false"` on the toggle button |
| **Labels on icons** | `aria-label="Dashboard"` on each nav item (critical in collapsed state) |
| **Backdrop dismiss** | `aria-label="Close navigation"` on backdrop overlay |
| **Focus trap** | When expanded as overlay, focus is trapped within sidebar until dismissed |
| **Focus return** | On collapse, focus returns to the toggle button that triggered expansion |
| **Contrast** | All text meets 4.5:1 against its background. Icons meet 3:1. |
| **Reduced motion** | Respect `prefers-reduced-motion`: skip all transitions, use instant state changes |
| **Screen reader** | Sidebar state change announced via `aria-live="polite"` region |

### Focus Order

```
Tab order (collapsed): Toggle → Nav items top to bottom → Profile
Tab order (expanded): Same, but labels are also visible
Shift+Tab: Reverse order
Escape: Collapse sidebar, return focus to toggle
```

---

## 12. Dark Mode Specification

The sidebar must work in both light and dark themes using CSS variables:

### Light Mode

```
Background:      bg-background       (#FFFFFF or --background)
Border (right):  border-r border-border  (1px, subtle gray)
Icon default:    text-muted-foreground
Icon active:     text-foreground
Label text:      text-foreground (primary) / text-muted-foreground (secondary/tertiary)
Active bg:       bg-muted/50
Hover bg:        bg-muted
Divider:         border-border opacity-50
Backdrop:        bg-black/5 backdrop-blur-[1px]
```

### Dark Mode

```
Background:      dark:bg-background    (dark surface — from CSS variable)
Border (right):  dark:border-border    (subtle light border on dark)
Icon default:    dark:text-muted-foreground
Icon active:     dark:text-foreground
Label text:      Same semantic tokens — they auto-adjust
Active bg:       dark:bg-muted/50
Hover bg:        dark:bg-muted
Divider:         dark:border-border dark:opacity-30
Backdrop:        dark:bg-black/20 dark:backdrop-blur-[2px]
```

### Rule

**Never hardcode colors.** All sidebar colors must use Tailwind's semantic tokens (`text-foreground`, `bg-muted`, `border-border`) which automatically adjust for dark mode via CSS variables defined in `globals.css`.

---

## 13. Keyboard Navigation & Shortcuts

### Global Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘B` / `Ctrl+B` | Toggle sidebar expand/collapse |
| `⌘1` through `⌘5` | Navigate to primary items (Dashboard, Map, Trail, Notes, Wiki) |
| `Escape` | Collapse sidebar if expanded |

### Within Sidebar

| Key | Action |
|-----|--------|
| `Tab` | Move focus to next nav item |
| `Shift+Tab` | Move focus to previous nav item |
| `Enter` / `Space` | Activate focused nav item |
| `Home` | Focus first nav item |
| `End` | Focus last nav item |
| `Arrow Down` | Move focus to next nav item |
| `Arrow Up` | Move focus to previous nav item |

### Shortcut Badge Display

In expanded state, primary nav items show their keyboard shortcut as a right-aligned badge:

```tsx
<span className="font-mono text-[9px] text-muted-foreground bg-muted rounded-sm px-1.5 py-0.5">
  ⌘1
</span>
```

This is one of the only permitted uses of the sub-11px font size — it's non-essential metadata that aids power users without cluttering the interface for beginners.

---

## 14. Design Token & Tailwind Config Changes

### New Tailwind Utilities Needed

```typescript
// tailwind.config.ts — additions to theme.extend

{
  width: {
    'sidebar-collapsed': '64px',
    'sidebar-expanded': '240px',
  },
  spacing: {
    'sidebar': '64px',  // For main content margin-left
  },
  zIndex: {
    'sidebar-backdrop': '30',
    'sidebar': '40',
    'sidebar-mobile': '50',
  },
  transitionDuration: {
    '150': '150ms',
    '200': '200ms',
  },
}
```

### No New Colors Required

The sidebar uses only existing design system colors:
- `primary` (#1B3FC4) — active route left border only
- `foreground` / `muted-foreground` — icon and text states
- `background` / `muted` — surface and hover states
- `border` — right edge border and dividers

If you're tempted to add a new color, the design is wrong. Revisit.

---

## 15. Implementation Steps (Ordered)

Execute these steps in exact order. Each step must be complete and tested before moving to the next.

### Step 1: Constants & Types (5 min)

Create `sidebar-constants.ts` and `types/sidebar.ts`. Define the navigation items array, dimension constants, and TypeScript interfaces. No UI code yet — just data.

**Verification:** TypeScript compiles with no errors.

### Step 2: Tailwind Config Update (5 min)

Add the sidebar-specific spacing, width, and z-index tokens to `tailwind.config.ts`.

**Verification:** `npx tailwind --help` runs without config errors.

### Step 3: Custom Hook — `use-sidebar.ts` (15 min)

Build the `useSidebar` hook with:
- `isExpanded` state (boolean)
- `toggle`, `collapse`, `expand` functions
- `useEffect` for keyboard listener (`⌘B`, `Escape`)
- `useEffect` for click-outside detection
- Respect `prefers-reduced-motion`

**Verification:** Hook works in isolation (test with a minimal component that logs state changes).

### Step 4: SidebarNavItem Component (15 min)

Build the individual nav item with:
- Locked icon positioning (the flex-shrink-0 pattern from Section 7)
- Active route detection via `usePathname()`
- Left-border active indicator
- Hover state
- Tooltip in collapsed mode (using Shadcn Tooltip)
- `aria-current="page"` when active
- Keyboard shortcut badge (expanded mode only)

**Verification:** Render a single nav item in both collapsed and expanded modes. Measure icon position with `getBoundingClientRect()` — must be identical.

### Step 5: Sidebar Container Component (20 min)

Build `Sidebar.tsx`:
- Fixed positioning, full height
- Width transition between collapsed/expanded
- Right border
- Flex column layout with proper group spacing
- Backdrop overlay element (conditional render when expanded)
- Focus trap when expanded
- `aria-label`, `aria-expanded` attributes

**Verification:** Sidebar renders, expands/collapses. Backdrop appears. Click outside collapses. Escape collapses. Icons don't move.

### Step 6: Profile Section (10 min)

Build `SidebarProfile.tsx`:
- User avatar (28×28, rounded-full)
- Name and email (expanded only)
- "Pro" badge if applicable
- Collapse toggle button

**Verification:** Profile renders in both states. Avatar stays positioned correctly.

### Step 7: Layout Integration (10 min)

Update `app/layout.tsx`:
- Add `<Sidebar />` before `<main>`
- Add permanent `ml-16` (64px) to `<main>`
- Ensure z-index context is correct

**Verification:** Navigate between pages. Main content never shifts. Sidebar persists across routes.

### Step 8: Mobile Drawer Variant (20 min)

Build the mobile drawer behavior:
- Hamburger trigger in top bar (< 768px)
- Full-screen slide-in drawer
- Same nav items, different layout
- Touch-friendly spacing

**Verification:** Resize to mobile. Hamburger appears. Drawer opens/closes. Nav works.

### Step 9: Dark Mode Pass (10 min)

Toggle dark mode. Verify every element uses semantic tokens. Fix any hardcoded colors.

**Verification:** Full visual review in both light and dark modes.

### Step 10: Accessibility Audit (15 min)

- Tab through every element in both states
- Test with screen reader (VoiceOver or NVDA)
- Verify `aria-*` attributes
- Test `prefers-reduced-motion`
- Verify contrast ratios with DevTools

**Verification:** Zero accessibility violations in automated audit (axe-core). Manual screen reader test passes.

### Step 11: Performance Check (10 min)

- Verify no layout shift (CLS = 0 during toggle)
- Check paint/composite layers (sidebar animation should be GPU-composited)
- Test on throttled CPU (4x slowdown) — transitions must still feel smooth
- Bundle size: sidebar code should add < 5KB gzipped

**Verification:** Lighthouse performance score unaffected. No CLS registered.

---

## 16. Testing Checklist

### Functional Tests

- [ ] Sidebar renders in collapsed state by default
- [ ] Clicking toggle expands sidebar to 240px
- [ ] Clicking toggle again collapses to 64px
- [ ] `⌘B` / `Ctrl+B` toggles sidebar
- [ ] `Escape` collapses expanded sidebar
- [ ] Clicking backdrop collapses sidebar
- [ ] Clicking a nav item navigates and collapses
- [ ] Active route shows left-border indicator
- [ ] Active route icon is `text-foreground`, others are `text-muted-foreground`
- [ ] Tooltips appear on hover in collapsed state
- [ ] Keyboard shortcuts (`⌘1` through `⌘5`) navigate correctly
- [ ] Tab key moves focus through nav items in correct order
- [ ] Sidebar state does not persist across page reloads (session-level only)

### Visual Regression Tests

- [ ] Icon positions identical in collapsed and expanded (pixel-level check)
- [ ] Main content `margin-left` is 64px in both states
- [ ] Main content does not shift, resize, or reflow on toggle
- [ ] Backdrop overlay appears/disappears cleanly
- [ ] Dark mode: all elements use correct semantic tokens
- [ ] No horizontal scrollbar appears when sidebar expands
- [ ] Divider lines are visible but subtle in both themes

### Responsive Tests

- [ ] ≥1024px: Full sidebar behavior
- [ ] 768–1023px: Collapsed only, overlay expand
- [ ] <768px: Sidebar hidden, hamburger trigger, full-screen drawer
- [ ] 360px width: drawer renders without overflow

### Accessibility Tests

- [ ] `aria-label` on `<nav>` element
- [ ] `aria-current="page"` on active route
- [ ] `aria-expanded` on toggle button
- [ ] Focus trap works in expanded overlay
- [ ] Focus returns to toggle on collapse
- [ ] Screen reader announces sidebar state changes
- [ ] `prefers-reduced-motion` disables all transitions
- [ ] All contrast ratios ≥ 4.5:1 (text) / 3:1 (icons)

### Performance Tests

- [ ] CLS = 0 on sidebar toggle
- [ ] Transition feels smooth at 4x CPU throttle
- [ ] No layout thrashing in Performance DevTools
- [ ] Bundle addition < 5KB gzipped

---

## 17. The Prompt (Copy/Paste Ready)

Below is the refined, production-grade prompt to give to your AI coding assistant. It incorporates everything from this plan.

---

````markdown
# SIDEBAR OVERHAUL — IMPLEMENTATION PROMPT

## YOUR ROLE

You are a Principal React/Next.js Engineer implementing a sidebar navigation
overhaul for SlateCamp, an EdTech platform. You write production-grade TypeScript
with zero shortcuts. You follow the constraints below as absolute requirements,
not suggestions. Output only code and brief architectural notes — no filler.

## CONTEXT

SlateCamp is a Next.js App Router application using:
- TypeScript (strict mode)
- Tailwind CSS with custom design tokens
- Shadcn UI (copy-paste components in `src/components/ui/`)
- Lucide React for icons (20×20, strokeWidth 1.75)
- Zustand for client state (optional — useState is acceptable for sidebar)

The current sidebar is visually immature and causes layout reflow when toggling.
We are replacing it with a developer-centric sidebar inspired by GitHub (left-border
active indicator), Supabase (overlay expansion), and Claude (clean negative space).

## HARD CONSTRAINTS — VIOLATING THESE IS A BUILD FAILURE

C1. **Spatial Lock:** The x,y coordinates and dimensions of every navigation icon
    MUST be pixel-identical between collapsed (64px) and expanded (240px) states.
    Icons are placed in a `flex-shrink-0 w-12 h-12` container. The label appears
    beside it and fades in/out. The icon container never moves.

C2. **Overlay Only:** The expanded sidebar overlays the main content. The main
    content area has a permanent `margin-left: 64px` that NEVER changes. The
    sidebar uses `position: fixed` with `z-index: 40`. A backdrop (`z-index: 30`,
    `bg-black/5`, `backdrop-blur-[1px]`) appears behind the expanded sidebar.

C3. **No Font Below 11px for Readable Text:** 8–9px is permitted ONLY for:
    keyboard shortcut badges (`⌘1`), eyebrow labels in `font-mono uppercase
    tracking-widest`. All nav labels, profile text, and tooltips must be ≥11px.

C4. **Semantic Colors Only:** Use Tailwind semantic tokens (`text-foreground`,
    `bg-muted`, `border-border`, `text-muted-foreground`, `bg-background`). Never
    hardcode hex values in className. Brand blue for active indicator only:
    `border-l-primary` (3px left border).

C5. **WCAG 2.1 AA:** `aria-label` on `<nav>`, `aria-current="page"` on active
    item, `aria-expanded` on toggle, focus trap in expanded state, focus return
    on collapse. Respect `prefers-reduced-motion`.

C6. **Transitions ≤ 200ms:** Expand = 200ms ease-out. Collapse = 150ms ease-in.
    Label fade = 200ms opacity. No transform animations on icons. Ever.

## NAVIGATION ITEMS

```typescript
const NAV_ITEMS = [
  // Primary group
  { id: 'dashboard', label: 'Dashboard',  href: '/dashboard', icon: Home,     group: 'primary', shortcut: '⌘1' },
  { id: 'map',       label: 'Map',        href: '/map',       icon: Map,      group: 'primary', shortcut: '⌘2' },
  { id: 'trail',     label: 'Trail',      href: '/trail',     icon: Compass,  group: 'primary', shortcut: '⌘3' },
  { id: 'notes',     label: 'Notes',      href: '/notes',     icon: StickyNote, group: 'primary', shortcut: '⌘4' },
  { id: 'wiki',      label: 'Wiki',       href: '/wiki',      icon: BookOpen, group: 'primary', shortcut: '⌘5' },
  // Secondary group
  { id: '3d-lab',    label: '3D Lab',     href: '/3d-lab',    icon: Box,      group: 'secondary' },
  { id: 'campfire',  label: 'Campfire',   href: '/campfire',  icon: Flame,    group: 'secondary' },
  // Tertiary group
  { id: 'settings',  label: 'Settings',   href: '/settings',  icon: Settings, group: 'tertiary' },
  { id: 'help',      label: 'Help',       href: '/help',      icon: HelpCircle, group: 'tertiary' },
]
```

## VISUAL SPEC SUMMARY

**Collapsed (default):** 64px wide, `position: fixed`, full viewport height,
`border-r border-border`, icons centered in 48×48 hit areas, 4px vertical gap,
tooltips on hover.

**Expanded (overlay):** 240px wide, same fixed position, labels fade in at
`opacity-100`, keyboard shortcut badges right-aligned (`font-mono text-[9px]
bg-muted rounded-sm px-1.5 py-0.5`), profile section at bottom with avatar +
name + email.

**Active route:** 3px `border-l-primary` left border, icon `text-foreground`,
label `font-medium`, row `bg-muted/50`.

**Hover:** `bg-muted rounded-md`, 150ms transition.

**Groups:** Primary → divider → Secondary → flex-grow spacer → Tertiary →
divider → Profile + Toggle.

## EXECUTION STEPS

Output these in order. Each step must be complete, tested code.

### STEP 1: Types & Constants
File: `src/types/sidebar.ts` and `src/components/sidebar/sidebar-constants.ts`
- TypeScript interfaces for NavItem, SidebarDimensions
- Navigation items array (exactly as specified above)
- Dimension constants object

### STEP 2: Custom Hook
File: `src/components/sidebar/use-sidebar.ts`
- `useSidebar()` hook returning `{ isExpanded, toggle, collapse, expand }`
- Keyboard listener for ⌘B/Ctrl+B toggle, Escape to collapse
- Click-outside detection (ref-based)
- `prefers-reduced-motion` detection

### STEP 3: SidebarNavItem Component
File: `src/components/sidebar/SidebarNavItem.tsx`
- `'use client'` directive
- Uses `usePathname()` for active detection
- Locked icon position (flex-shrink-0 w-12 pattern)
- Conditional label render with opacity transition
- Active state: left border + foreground icon + medium weight label + muted bg
- Hover state: bg-muted rounded-md
- Tooltip wrapper for collapsed state (Shadcn Tooltip)
- Keyboard shortcut badge (expanded only)
- `aria-current="page"` when active

### STEP 4: Sidebar Container
File: `src/components/sidebar/Sidebar.tsx`
- `'use client'` directive
- Fixed positioning, full height, border-right
- Width transitions between 64px and 240px
- Renders nav items grouped by `group` field with dividers
- Backdrop overlay (conditional, z-30, click to collapse)
- Profile section at bottom (avatar, name, email — expanded only)
- Collapse toggle button (always visible)
- `<nav aria-label="Main navigation">` wrapper
- `aria-expanded` on container or toggle
- Focus trap when expanded (basic: tabindex management)

### STEP 5: Layout Integration
File: Show the exact changes to `app/layout.tsx`
- `<Sidebar />` rendered before `<main>`
- `<main className="ml-16">` with permanent 64px margin
- Confirm z-index layering is correct

### STEP 6: Mobile Variant (< 768px)
- Sidebar hidden on mobile (rendered but `hidden lg:flex`)
- Hamburger button in a top bar component
- Full-screen drawer on mobile with slide-in animation
- Same nav items, touch-friendly 48px rows

Execute all six steps now.
````

---

## Appendix: What This Plan Fixed vs. the Original Prompt

| Original Weakness | This Plan's Fix |
|-------------------|-----------------|
| No navigation hierarchy — treated all items equally | Three-tier hierarchy (primary/secondary/tertiary) with visual differentiation |
| Vague "GitHub/Supabase/Claude" reference | Specific extraction: what we borrow from each and what we reject |
| 8px font rule was too permissive | Raised floor to 11px for readable text, 8–9px only for metadata badges |
| No mobile strategy | Full responsive spec: collapsed-only (tablet), drawer (mobile) |
| No accessibility spec | Complete WCAG 2.1 AA requirements with specific `aria-*` attributes |
| No dark mode consideration | Full dark mode token mapping |
| No keyboard navigation | Global shortcuts (`⌘B`, `⌘1-5`) + full tab/arrow navigation |
| No state machine — just "expanded/collapsed" | Full trigger matrix: what causes each transition |
| No spatial math proof | Exact pixel calculations proving icons don't move |
| Execution steps were too coarse (3 steps) | 11 granular steps with verification criteria |
| No testing checklist | 30+ checkbox items across functional, visual, responsive, a11y, and performance |
| No animation budget or forbidden list | Specific duration/easing per animation + explicit list of what's forbidden |
| No performance criteria | CLS=0 target, <5KB bundle, 4x CPU throttle smoothness |
