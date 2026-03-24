# SlateCamp Developer Hub — Comprehensive Implementation Plan

**Version:** 1.0  
**Date:** March 25, 2026  
**Status:** Ready for Execution  
**Estimated Duration:** 6 Phases · ~4–5 Working Days  

---

## Executive Summary

This document is the single source of truth for building the improved `/developer` route inside SlateCamp's Next.js application. It synthesizes three inputs: the Master Context Prompt (technical spec), the UX Research Blueprint (30+ design system analysis), and the Previous UI Prototype (visual reference). Every task in this plan has explicit acceptance criteria, file paths, component APIs, data contracts, and verification steps. Nothing is left ambiguous.

The improved Developer Hub has three pillars:

1. **Design System Hub** — A living, domain-organized component catalog with live previews, props tables, copyable code, and variant grids.
2. **System Status Dashboard** — A real-time (or realistically mocked) view of database health, API latency, edge functions, and infrastructure.
3. **Developer Tools** — Command palette search, keyboard shortcuts, and power-user navigation.

---

## Non-Negotiable Constraints

These constraints are enforced at every phase. Violating any of them is a build-breaking mistake. Every code review checkpoint must verify all of these.

### Tech Stack

| Layer | Technology | Rule |
|---|---|---|
| Framework | Next.js 14+ App Router | NOT Pages Router. Every route lives under `src/app/`. |
| Language | TypeScript strict mode | No `any`. No `@ts-ignore`. No `@ts-expect-error`. |
| Components | React Server Components by default | `'use client'` only when hooks, browser APIs, event handlers, or Zustand are used. |
| Styling | Tailwind CSS | Class order: Layout → Spacing → Sizing → Typography → Colors → Borders → Effects → State. |
| UI Library | Shadcn UI | Install via `npx shadcn-ui add [component]`. Never `npm install` shadcn packages. Components live in `src/components/ui/`. |
| Exports | Named exports everywhere | Only `page.tsx` and `layout.tsx` use default exports. |
| Imports | Absolute `@/` paths | Never `../../`. |
| Naming | PascalCase components, camelCase utils | Types in `src/types/[domain].ts` or co-located as `[Component]Props`. |

### Typography Tokens

| Element | Font | Tailwind Class |
|---|---|---|
| Section heading | Syne 800 | `font-display font-extrabold text-xl` |
| Card title | Inter 500 | `font-sans font-medium text-sm` |
| Body text | Inter 400 | `font-sans text-sm` |
| Eyebrow / label | DM Mono 500 | `font-mono font-medium text-xs uppercase tracking-widest` |
| Stat / number | DM Mono 500 | `font-mono font-medium tabular-nums` |
| Code reference | DM Mono 400 | `font-mono text-xs text-muted-foreground` |

### Color Tokens

| Token | Hex | Usage |
|---|---|---|
| `primary` | `#1B3FC4` | Primary actions, active states, key accents |
| `signal-green` | `#1B7A3C` | Operational / healthy status |
| `signal-gold` | `#F5A623` | Degraded / warning status |
| `signal-red` | `#E63329` | Outage / error status |
| `cream` | `#F2F0EB` | Page backgrounds |
| `warm-white` | `#F8F7F5` | Card backgrounds |
| `navy` | `#0F1F5C` | Top bar background |

### Anti-Patterns (NEVER)

- No `select('*')` in Supabase queries
- No inline components inside `page.tsx` or `layout.tsx`
- No barrel files (`index.ts`) mixing Server and Client components
- No `console.log` in committed code
- No full-page loading spinners — always skeleton loaders
- No decorative animations — motion must communicate state change
- No emoji in functional UI
- No color-only status indicators — always pair with text label + icon

---

## Target File Structure

This is the complete directory tree after all phases are done. Phase boundaries are annotated.

```
src/
├── app/
│   └── developer/
│       ├── layout.tsx                              # Phase 1 — Root layout (top bar + sidebar + content)
│       ├── page.tsx                                # Phase 1 — Homepage (section cards + status summary + changelog)
│       ├── loading.tsx                             # Phase 5 — Skeleton loader for homepage
│       ├── not-found.tsx                           # Phase 5 — 404 for invalid routes
│       │
│       ├── design-system/
│       │   ├── page.tsx                            # Phase 3a — Design system overview
│       │   ├── wiki/
│       │   │   └── [component]/
│       │   │       └── page.tsx                    # Phase 3a (WikiCard), 3b (remaining)
│       │   ├── questions/
│       │   │   └── [component]/
│       │   │       └── page.tsx                    # Phase 3a (QuestionCard), 3b (remaining)
│       │   ├── testing-path/
│       │   │   └── [component]/
│       │   │       └── page.tsx                    # Phase 3a (ReadinessRing), 3b (remaining)
│       │   └── shared/
│       │       └── [component]/
│       │           └── page.tsx                    # Phase 3a (Button), 3b (remaining)
│       │
│       └── status/
│           ├── page.tsx                            # Phase 4 — Status overview (global banner + KPI cards)
│           ├── database/
│           │   └── page.tsx                        # Phase 4 — Database status details
│           └── infrastructure/
│               └── page.tsx                        # Phase 4 — Infrastructure status details
│
├── components/
│   └── developer/
│       ├── Sidebar.tsx                             # Phase 1 — 'use client', search + collapsible groups
│       ├── SidebarNav.tsx                          # Phase 1 — Navigation items, active state
│       ├── TopBar.tsx                              # Phase 1 — Navy bar with brand, env badge, search trigger
│       ├── Breadcrumbs.tsx                         # Phase 1 — 'use client', reads URL segments
│       ├── CommandPalette.tsx                      # Phase 5 — ⌘K command palette (cmdk + fuse.js)
│       │
│       ├── ComponentShowcase.tsx                   # Phase 2 — Generic 3-tab layout (Preview | Props | Code)
│       ├── PreviewArea.tsx                         # Phase 2 — 'use client', bordered container + light/dark toggle
│       ├── PropsTable.tsx                          # Phase 2 — Table: Name, Type, Default, Required, Description
│       ├── CodeBlock.tsx                           # Phase 2 — 'use client', Shiki syntax highlighting + copy
│       ├── VariantsGrid.tsx                        # Phase 3b — Matrix of variant × size combinations
│       │
│       ├── StatusBanner.tsx                        # Phase 4 — Global "All Systems Operational" banner
│       ├── StatusBadge.tsx                         # Phase 4 — Colored dot + icon + text label
│       ├── StatusKPICard.tsx                       # Phase 4 — Individual metric card
│       ├── UptimeBar.tsx                           # Phase 4 — 90-day uptime visualization
│       ├── ConnectionPoolCard.tsx                  # Phase 4 — Active/idle/max connections
│       ├── TableRowCountsTable.tsx                 # Phase 4 — Sortable table of Supabase tables
│       ├── MigrationsListCard.tsx                  # Phase 4 — Recent migrations with status
│       ├── APILatencyCard.tsx                      # Phase 4 — Average response time display
│       ├── EdgeFunctionsCard.tsx                   # Phase 4 — Edge function list with invocation times
│       └── DeploymentCard.tsx                      # Phase 4 — Last deployment info
│
├── lib/
│   ├── developer/
│   │   ├── componentRegistry.ts                   # Phase 2 — Central registry of all component metadata
│   │   ├── searchIndex.ts                         # Phase 5 — Fuse.js search configuration
│   │   └── navigation.ts                          # Phase 1 — Sidebar navigation tree data
│   └── mocks/
│       ├── status.ts                              # Phase 4 — Mock database + infrastructure metrics
│       └── components.ts                          # Phase 3a — Mock data for component previews
│
└── types/
    └── developer.ts                                # Phase 2 — All type definitions
```

---

## Phase 1: Architecture, Routing & Navigation Shell

**Objective:** Build the outer frame — layout, routing, sidebar, top bar, breadcrumbs. No component content. Just the shell that everything else snaps into.

**Duration:** ~4–6 hours

### Task 1.1: Navigation Data Structure

**File:** `src/lib/developer/navigation.ts`

Define the sidebar navigation tree as a typed constant. This is the single source of truth for all sidebar rendering and breadcrumb generation.

```typescript
export interface NavItem {
  label: string
  href: string
  icon?: string          // Lucide icon name
  badge?: 'stable' | 'beta' | 'deprecated' | 'new'
}

export interface NavGroup {
  label: string
  id: string
  items: NavItem[]
  defaultOpen?: boolean
}

export const SIDEBAR_NAVIGATION: NavGroup[] = [
  {
    label: 'Portal',
    id: 'portal',
    defaultOpen: true,
    items: [
      { label: 'Overview', href: '/developer', icon: 'LayoutGrid' },
    ],
  },
  {
    label: 'Design System',
    id: 'design-system',
    defaultOpen: true,
    items: [
      { label: 'Overview', href: '/developer/design-system', icon: 'Palette' },
    ],
  },
  {
    label: 'Wiki Article',
    id: 'wiki',
    items: [
      { label: 'WikiCard', href: '/developer/design-system/wiki/wiki-card' },
      { label: 'ArticleRenderer', href: '/developer/design-system/wiki/article-renderer' },
      { label: 'TableOfContents', href: '/developer/design-system/wiki/table-of-contents' },
      { label: 'BreadcrumbNav', href: '/developer/design-system/wiki/breadcrumb-nav' },
      { label: 'TagBadge', href: '/developer/design-system/wiki/tag-badge' },
    ],
  },
  {
    label: 'Question & Q&A',
    id: 'questions',
    items: [
      { label: 'QuestionCard', href: '/developer/design-system/questions/question-card' },
      { label: 'AnswerOption', href: '/developer/design-system/questions/answer-option' },
      { label: 'RationalePanel', href: '/developer/design-system/questions/rationale-panel' },
      { label: 'DifficultyBadge', href: '/developer/design-system/questions/difficulty-badge' },
      { label: 'SessionTimer', href: '/developer/design-system/questions/session-timer' },
    ],
  },
  {
    label: 'Review & Testing Path',
    id: 'testing-path',
    items: [
      { label: 'ReadinessRing', href: '/developer/design-system/testing-path/readiness-ring' },
      { label: 'MasteryBar', href: '/developer/design-system/testing-path/mastery-bar' },
      { label: 'HeatmapGrid', href: '/developer/design-system/testing-path/heatmap-grid' },
      { label: 'TrailProgressCard', href: '/developer/design-system/testing-path/trail-progress-card' },
      { label: 'SubjectPill', href: '/developer/design-system/testing-path/subject-pill' },
    ],
  },
  {
    label: 'System / Shared',
    id: 'shared',
    items: [
      { label: 'Button', href: '/developer/design-system/shared/button' },
      { label: 'Badge', href: '/developer/design-system/shared/badge' },
      { label: 'Card', href: '/developer/design-system/shared/card' },
      { label: 'Tooltip', href: '/developer/design-system/shared/tooltip' },
      { label: 'Skeleton', href: '/developer/design-system/shared/skeleton' },
      { label: 'EmptyState', href: '/developer/design-system/shared/empty-state' },
    ],
  },
  {
    label: 'Status',
    id: 'status',
    items: [
      { label: 'Overview', href: '/developer/status', icon: 'Activity' },
      { label: 'Database', href: '/developer/status/database', icon: 'Database' },
      { label: 'Infrastructure', href: '/developer/status/infrastructure', icon: 'Server' },
    ],
  },
]
```

**Acceptance Criteria:**
- [ ] Type exports are clean — no `any`, no implicit types
- [ ] Every `href` corresponds to a real route segment in the file structure
- [ ] Navigation data is importable from both Server and Client components

---

### Task 1.2: Root Layout

**File:** `src/app/developer/layout.tsx`

This is the root layout for all `/developer/*` routes. It renders the top bar, sidebar, and content area.

**Requirements:**
- Renders `<TopBar />` as a sticky header (navy background, 48px height)
- Renders `<Sidebar />` as a persistent left rail (220px width, sticky below top bar)
- Renders `{children}` in a scrollable main content area (max-width 960px)
- Wraps children in `<Suspense>` with skeleton fallback
- Uses default export (exception to named export rule for layouts)
- Is a Server Component — no `'use client'`

**Visual Reference (from prototype HTML):**
```
┌─────────────────────────────────────────────────┐
│  SlateCamp │ Developer Portal │ dev  ... ⌘K     │  ← TopBar (48px, navy, sticky)
├──────┬──────────────────────────────────────────┤
│      │                                          │
│ Side │  Breadcrumbs                             │
│ bar  │  Page Eyebrow                            │
│      │  Page Title                              │
│ 220  │  Page Content                            │
│ px   │                                          │
│      │                        max-width: 960px  │
│      │                                          │
└──────┴──────────────────────────────────────────┘
```

**Acceptance Criteria:**
- [ ] `npm run build` passes
- [ ] Navigating to `/developer` renders the layout shell
- [ ] Top bar is sticky at `top: 0`, sidebar is sticky at `top: 48px`
- [ ] Main content scrolls independently of sidebar
- [ ] No `'use client'` directive on this file
- [ ] Suspense boundary renders a skeleton, not a spinner

---

### Task 1.3: Top Bar Component

**File:** `src/components/developer/TopBar.tsx`

**Requirements:**
- Height: 48px, background: `navy` (`#0F1F5C`), sticky top
- Left side: "SlateCamp" brand text (Syne 800, 14px, white) → "Developer Portal" badge (DM Mono 9px, uppercase, bordered) → separator → environment badge ("development" in green pill)
- Right side: Search trigger button (styled as input, displays "Search docs... ⌘K") → "Back to Dashboard" link
- Search trigger is a button (not a real input) — clicking it opens the Command Palette (Phase 5)
- For Phase 1, the search trigger is non-functional — it just renders the visual

**Acceptance Criteria:**
- [ ] Matches the prototype's visual density exactly
- [ ] Text hierarchy: brand > badge > env — all visually distinct
- [ ] `⌘K` keyboard shortcut text is visible
- [ ] Server Component (no `'use client'`) — the click handler will be added in Phase 5

---

### Task 1.4: Sidebar Component

**File:** `src/components/developer/Sidebar.tsx`  
**Directive:** `'use client'` (required: `useState`, `usePathname`, keyboard listeners)

**Requirements:**
- Width: 220px, white background, right border, sticky below top bar
- Search input at top: real `<input>`, filters the navigation list client-side as you type
- Navigation groups from `SIDEBAR_NAVIGATION` data
- Each group is collapsible (click the group label to toggle) — uses `useState` per group
- Group labels: DM Mono 9px, uppercase, tracking wide, muted color
- Nav items: 12px, secondary text color, 2px left border (transparent default, primary when active)
- Active item detection via `usePathname()` — matches current URL to `href`
- Keyboard shortcut: pressing `/` or `⌘+K` focuses the search input (Phase 1 just focuses; Phase 5 opens palette)
- Sub-items (components within a domain) are indented 24px with 11px font
- Custom scrollbar styling (3px width, thin thumb)

**Search Filtering Logic:**
1. User types in the search input
2. Filter `SIDEBAR_NAVIGATION` items where `item.label` includes the search string (case-insensitive)
3. Groups with no matching items are hidden
4. Matching text within labels is not highlighted (keep it simple — highlighting comes in Phase 5 with Fuse.js)

**Acceptance Criteria:**
- [ ] Groups expand/collapse on click
- [ ] Search input filters items as you type — instant, no debounce needed
- [ ] Active link has blue left border + blue text + light blue background
- [ ] Pressing `/` key focuses the search input
- [ ] `⌘+K` focuses the search input
- [ ] Empty search shows all items
- [ ] Groups with zero matches are hidden during search
- [ ] Scrollbar is custom-styled (3px, subtle)
- [ ] `'use client'` is present

---

### Task 1.5: Breadcrumbs Component

**File:** `src/components/developer/Breadcrumbs.tsx`  
**Directive:** `'use client'` (uses `usePathname`)

**Requirements:**
- Reads the current URL path via `usePathname()`
- Splits the path into segments, maps each to a human-readable label
- Renders as: `Developer Portal` → `[Section]` → `[Page]`
- Separators: `/` character, 9px, border color
- All segments except the last are clickable links
- Last segment is non-clickable, bold, foreground color
- Handles dynamic segments (e.g., `/developer/design-system/wiki/wiki-card` → `Developer Portal / Wiki / WikiCard`)

**Segment-to-Label Mapping:**
```
developer         → "Developer Portal"
design-system     → "Design System"
wiki              → "Wiki"
questions         → "Questions"
testing-path      → "Testing Path"
shared            → "Shared"
status            → "Status"
database          → "Database"
infrastructure    → "Infrastructure"
[component-slug]  → PascalCase(slug) (e.g., "wiki-card" → "WikiCard")
```

**Acceptance Criteria:**
- [ ] Breadcrumbs update on every route change
- [ ] Dynamic segments are correctly converted to PascalCase
- [ ] All intermediate segments are clickable
- [ ] Last segment is styled as current (non-clickable, bold)
- [ ] Renders correctly for all nesting depths (1 to 4 segments)

---

### Task 1.6: Homepage

**File:** `src/app/developer/page.tsx`

**Requirements:**
- Page eyebrow: "Internal Docs & Tools" (DM Mono)
- Page title: "Developer Portal" (Syne 800, 20px)
- Description: one-liner about what the portal contains
- Three section cards in a 3-column grid:
  - **Design System** — icon, title, description, links to `/developer/design-system`
  - **System Status** — icon, title, description, links to `/developer/status`
  - **Component Library** — icon, title, description, total component count
- Each card follows the standard Card Pattern from the master prompt
- Cards are interactive (hover state: primary border hint + shadow)
- Below the grid: a compact "System Health Summary" bar showing Database ✅ | API ✅ | Storage ✅ (mock data, green badges with text)

**Acceptance Criteria:**
- [ ] Three cards render in a responsive 3-column grid
- [ ] Cards have hover state (border color shift + shadow)
- [ ] Cards use the exact Card Pattern with eyebrow + title + description
- [ ] System health summary shows text + color (never color alone)
- [ ] All typography follows the token system
- [ ] Server Component — no `'use client'`

---

### Phase 1 Verification Checklist

Run these checks after Phase 1 is complete, before moving to Phase 2:

- [ ] `npm run build` passes with zero errors and zero warnings
- [ ] `npm run lint` passes
- [ ] Navigating to `/developer` renders the full layout shell
- [ ] Sidebar groups expand and collapse
- [ ] Search input filters sidebar items
- [ ] Clicking a sidebar link navigates to the correct URL
- [ ] Active sidebar link is visually highlighted
- [ ] Breadcrumbs reflect the current URL path
- [ ] Top bar is sticky, sidebar is sticky
- [ ] All components use named exports (except `layout.tsx` and `page.tsx`)
- [ ] All imports use `@/` absolute paths
- [ ] `'use client'` is only present on Sidebar and Breadcrumbs
- [ ] No `console.log` statements
- [ ] No `any` types

**STOP. Review Phase 1 output. Fix any issues before proceeding.**

---

## Phase 2: Component Page Template & Search Infrastructure

**Objective:** Build the reusable component page template that every design system entry will use. This is the scaffold — not the content.

**Duration:** ~4–6 hours

### Task 2.1: Type Definitions

**File:** `src/types/developer.ts`

```typescript
export interface PropsTableEntry {
  name: string
  type: string                    // Actual TypeScript type string
  defaultValue: string | null     // null = no default
  required: boolean
  description: string
}

export interface ComponentPageData {
  slug: string                    // URL segment: "wiki-card"
  title: string                   // Display name: "WikiCard"
  description: string             // One-line summary
  domain: 'wiki' | 'questions' | 'testing-path' | 'shared'
  status: 'stable' | 'beta' | 'deprecated'
  importPath: string              // "@/components/wiki/WikiCard"
  filePath: string                // "src/components/wiki/WikiCard.tsx"
  propsTable: PropsTableEntry[]
  codeSnippet: string             // Minimal usage code
  lastUpdated?: string            // ISO date string
  tags?: string[]                 // For search cross-referencing
}

export interface SearchItem {
  id: string
  name: string
  description: string
  type: 'component' | 'page' | 'status'
  domain: string
  status: 'stable' | 'beta' | 'deprecated'
  tags: string[]
  keywords: string[]
  path: string
}

export interface StatusMetric {
  label: string
  value: string | number
  status: 'operational' | 'degraded' | 'outage'
  unit?: string
}

export interface DatabaseStatus {
  connections: { active: number; idle: number; max: number }
  tables: Array<{ name: string; rowCount: number; size: string }>
  migrations: Array<{ id: string; name: string; timestamp: string; status: 'applied' | 'failed' | 'pending' }>
}

export interface InfrastructureStatus {
  apiLatency: { p50: number; p95: number; p99: number; unit: 'ms' }
  edgeFunctions: Array<{ name: string; status: 'operational' | 'degraded' | 'outage'; lastInvocation: string }>
  deployment: { timestamp: string; status: 'success' | 'failed'; commit: string; duration: string }
}
```

**Acceptance Criteria:**
- [ ] All types are exported with named exports
- [ ] No `any` types, no optional properties without explicit `?`
- [ ] Types match the exact shape the mock data and real APIs will use
- [ ] `ComponentPageData` covers every field needed by `ComponentShowcase`

---

### Task 2.2: Component Registry

**File:** `src/lib/developer/componentRegistry.ts`

A central registry mapping every component slug to its `ComponentPageData`. This is the single source of truth for the sidebar, search, and component pages.

**Requirements:**
- Export a `Map<string, ComponentPageData>` or a typed object
- Include a `getComponentBySlug(domain: string, slug: string): ComponentPageData | null` function
- Include a `getComponentsByDomain(domain: string): ComponentPageData[]` function
- Include a `getAllComponents(): ComponentPageData[]` function
- Populated with placeholder entries for Phase 2 (real data in Phase 3)

**Acceptance Criteria:**
- [ ] `getComponentBySlug('wiki', 'wiki-card')` returns the correct entry
- [ ] `getComponentsByDomain('wiki')` returns all wiki components
- [ ] `getAllComponents()` returns every component across all domains
- [ ] Returns `null` for unknown slugs (not `undefined`, not thrown error)

---

### Task 2.3: ComponentShowcase Layout

**File:** `src/components/developer/ComponentShowcase.tsx`  
**Directive:** `'use client'` (uses `useState` for tab switching)

This is the master template for every component page.

**Props:**
```typescript
interface ComponentShowcaseProps {
  title: string
  description: string
  domain: string
  status: 'stable' | 'beta' | 'deprecated'
  importPath: string
  filePath: string
  preview: React.ReactNode
  propsTable: PropsTableEntry[]
  codeSnippet: string
  lastUpdated?: string
}
```

**Layout:**
```
┌────────────────────────────────────────────────┐
│ Breadcrumbs (rendered by layout, not here)      │
├────────────────────────────────────────────────┤
│ [Eyebrow: domain label]                        │
│ [Title] [Status Badge: stable/beta/deprecated] │
│ [Description]                                  │
│ [Import path — monospace, muted, copyable]     │
│ [File path — monospace, muted]                 │
├────────────────────────────────────────────────┤
│ ┌──────────┬──────────┬──────────┐             │
│ │ Preview  │  Props   │   Code   │  ← Tabs    │
│ └──────────┴──────────┴──────────┘             │
│                                                │
│ [Tab Content Area]                             │
│                                                │
│ Tab 1 (Preview): <PreviewArea>{preview}</…>    │
│ Tab 2 (Props): <PropsTable entries={…} />      │
│ Tab 3 (Code): <CodeBlock code={…} />           │
│                                                │
├────────────────────────────────────────────────┤
│ [Last Updated: March 20, 2026]                 │
└────────────────────────────────────────────────┘
```

**Tab Behavior:**
- Preview tab is selected by default
- Clicking a tab switches the visible content (no animation, instant switch)
- Tab state is local (`useState`), not URL-driven
- Active tab: primary color border-bottom, primary text, semibold
- Inactive tabs: muted text, hover darkens

**Acceptance Criteria:**
- [ ] Three tabs render and switch correctly
- [ ] Preview tab is default
- [ ] Status badge renders with correct color (green for stable, gold for beta, red for deprecated)
- [ ] Import path has a copy button
- [ ] File path is displayed but not copyable
- [ ] All typography follows the token system
- [ ] No page reload on tab switch

---

### Task 2.4: PreviewArea Component

**File:** `src/components/developer/PreviewArea.tsx`  
**Directive:** `'use client'` (uses `useState` for theme toggle)

**Requirements:**
- A bordered container (1px border, rounded-xl, padding 32px) with a subtle dot-grid background pattern
- Centers its `children` both horizontally and vertically
- A toolbar at the top-right with a light/dark mode toggle button
- When toggled to dark mode, the preview area background becomes dark, text becomes light — but this ONLY affects the preview area, not the rest of the page
- Use `data-theme="dark"` attribute on the preview container + Tailwind `dark:` variants, or a wrapping `div` with a class that flips CSS variables

**Dot-Grid Background Pattern:**
```css
background-image: radial-gradient(circle, #e0ded8 1px, transparent 1px);
background-size: 20px 20px;
```

**Acceptance Criteria:**
- [ ] Dot-grid pattern is visible on the preview background
- [ ] Light/dark toggle changes only the preview area
- [ ] Component inside the preview area respects the theme
- [ ] Toggle button shows sun/moon icon (from lucide-react)
- [ ] Default is light mode

---

### Task 2.5: PropsTable Component

**File:** `src/components/developer/PropsTable.tsx`  
**Directive:** Server Component (no hooks needed — pure rendering)

**Requirements:**
- Renders a table with columns: Name, Type, Default, Required, Description
- Name column: `font-mono font-medium text-xs` in primary color
- Type column: `font-mono text-xs text-muted-foreground`
- Default column: `font-mono text-xs` — shows the value or "—" for null
- Required column: green dot (`●`) for required, muted dash (`—`) for optional
- Description column: `font-sans text-xs text-muted-foreground`
- Table header: DM Mono 9px, uppercase, tracking wide, muted
- Alternating row backgrounds (optional, subtle)
- If `propsTable` has more than 5 entries, show only the first 5 with a "Show all N props" expandable button

**Acceptance Criteria:**
- [ ] Renders all columns correctly
- [ ] Monospace font on Name and Type columns
- [ ] Required indicator uses color + symbol (never color alone)
- [ ] "Show all" toggle works (this makes it `'use client'` — add directive if needed)
- [ ] Empty array renders a "No props defined" message

---

### Task 2.6: CodeBlock Component

**File:** `src/components/developer/CodeBlock.tsx`  
**Directive:** `'use client'` (clipboard API, hover state)

**Requirements:**
- Dark background (`#18181B`) even in light mode — code blocks are always dark
- Syntax highlighting using **Shiki** (install: `npm install shiki`)
  - Configure with `theme: 'github-dark'` or `'one-dark-pro'`
  - Language: `tsx` by default, configurable via prop
- Line numbers: left gutter, muted color, 3-character width
- Copy button: top-right corner, DM Mono 9px
  - Idle: "Copy" text with clipboard icon
  - On click: copies the raw code to clipboard, changes to "Copied!" with checkmark icon
  - Resets to "Copy" after 2 seconds
- Header bar: subtle top border, shows language badge (left) and copy button (right)
- Code font: DM Mono, 12px, line-height 1.6
- Horizontal scroll for long lines (no wrapping)

**Props:**
```typescript
interface CodeBlockProps {
  code: string
  language?: string        // default: 'tsx'
  showLineNumbers?: boolean // default: true
  title?: string           // optional file name label
}
```

**Acceptance Criteria:**
- [ ] Syntax highlighting renders correctly for TSX code
- [ ] Copy button copies raw code (not highlighted HTML)
- [ ] "Copied!" feedback appears for 2 seconds
- [ ] Line numbers are visible and aligned
- [ ] Long lines scroll horizontally, no wrapping
- [ ] Dark background in both light and dark page themes

---

### Task 2.7: Test Route

**File:** `src/app/developer/design-system/wiki/[component]/page.tsx`

Create a dynamic route that:
1. Reads `params.component` (the slug)
2. Looks up `ComponentPageData` from the registry via `getComponentBySlug('wiki', slug)`
3. If not found, renders `notFound()`
4. If found, renders `<ComponentShowcase>` with the data
5. For the `preview` prop, renders a placeholder `<div>` with text "Preview of [ComponentName]"

This tests the entire Phase 1 + Phase 2 integration.

**Acceptance Criteria:**
- [ ] `/developer/design-system/wiki/wiki-card` renders the showcase
- [ ] Tabs switch between Preview, Props, and Code
- [ ] Code block has working copy button
- [ ] PropsTable renders mock entries
- [ ] Breadcrumbs show: Developer Portal / Wiki / WikiCard
- [ ] Sidebar highlights the WikiCard link
- [ ] Invalid slug (e.g., `/developer/design-system/wiki/nonexistent`) shows 404

---

### Phase 2 Verification Checklist

- [ ] `npm run build` passes with zero errors
- [ ] Test route renders ComponentShowcase with all three tabs
- [ ] Preview area light/dark toggle works
- [ ] Code block copy button works (test in browser)
- [ ] PropsTable renders all columns with correct typography
- [ ] Types in `developer.ts` have no `any`
- [ ] ComponentRegistry functions return correct data
- [ ] All new components follow Card Pattern and Typography Tokens
- [ ] `'use client'` only on components that need it

**STOP. Review Phase 2 output. Fix any issues before proceeding.**

---

## Phase 3: Domain-Specific Component Pages

### Phase 3a: One Representative Page Per Domain (4 pages)

**Objective:** Build one complete, polished component page for each domain using real components (or realistic mock versions if the component doesn't exist yet in the codebase).

**Duration:** ~6–8 hours

---

#### Task 3a.1: WikiCard (Wiki Domain)

**Route:** `/developer/design-system/wiki/wiki-card`

**Preview Requirements:**
- Render a `WikiCard` component with realistic mock data:
  - Title: "Section 401: Minimum Corridor Width Requirements"
  - Domain tag: "PD 1096 — National Building Code"
  - Status: Published
  - Last updated: a realistic date
  - Preview text snippet from an architecture wiki article
- If `WikiCard` exists in the codebase (`src/components/wiki/WikiCard.tsx`), import and use it directly
- If it doesn't exist yet, create a mock version at `src/components/developer/mocks/MockWikiCard.tsx` with a comment: `// TODO: Replace with real component from src/components/wiki/WikiCard.tsx`

**Props Table:** Extract from the real TypeScript interface or define a realistic one:
- `title: string` — required
- `description: string` — optional
- `domain: string` — required
- `tags: string[]` — optional, default `[]`
- `status: 'published' | 'draft' | 'archived'` — default `'published'`
- `lastUpdated: string` — optional
- `href: string` — required

**Code Snippet:**
```tsx
import { WikiCard } from '@/components/wiki/WikiCard'

<WikiCard
  title="Section 401: Minimum Corridor Width"
  domain="PD 1096"
  status="published"
  tags={['egress', 'corridors']}
  href="/wiki/pd-1096/section-401"
/>
```

---

#### Task 3a.2: QuestionCard (Questions Domain)

**Route:** `/developer/design-system/questions/question-card`

**Preview Requirements:**
- Render a question card with realistic ALE exam content:
  - Question: "What is the minimum corridor width for commercial occupancies per PD 1096?"
  - 4 answer options with radio buttons (A: 1.00m, B: 1.10m, C: 1.20m, D: 1.50m)
  - Difficulty badge: "Medium"
  - Subject area: "Building Code"
- Show interactive state: clicking an answer option highlights it

**Props Table:** (at least 8 props reflecting a real quiz component)

**Code Snippet:** Minimal usage showing the component with question text + options array

---

#### Task 3a.3: ReadinessRing (Testing Path Domain)

**Route:** `/developer/design-system/testing-path/readiness-ring`

**Preview Requirements:**
- Circular progress visualization showing a readiness score (e.g., 72%)
- Animated fill on mount (CSS animation, not JS — motion communicates state change, this is allowed)
- Center text: score percentage in DM Mono
- Color: primary blue for the arc, muted for the background track
- Show two variants in the preview: one at 72% (strong), one at 38% (needs work)

**Props Table:**
- `score: number` — 0–100, required
- `size: 'sm' | 'md' | 'lg'` — default `'md'`
- `showLabel: boolean` — default `true`
- `strokeWidth: number` — default `8`

---

#### Task 3a.4: Button (System/Shared Domain)

**Route:** `/developer/design-system/shared/button`

**Preview Requirements:**
- Render ALL button variants in a grid: Primary, Secondary, Ghost, Destructive, Outline, Link
- Render ALL sizes: xs, sm, md, lg
- Render states: default, hover (show on hover), disabled, loading (with spinner)
- Use the actual Shadcn `Button` component from `src/components/ui/button.tsx`
- Group variants logically: "Visual Variants" section, "Sizes" section, "States" section

**Props Table:** Complete props from the real `ButtonProps` interface including `variant`, `size`, `disabled`, `asChild`, `children`

**Code Snippet:**
```tsx
import { Button } from '@/components/ui/button'

<Button variant="primary" size="md">
  Click me
</Button>
```

---

### Phase 3a Acceptance Criteria

- [ ] 4 component pages render correctly, one per domain
- [ ] Each page has working Preview, Props, and Code tabs
- [ ] Mock data uses realistic architecture exam content (NOT "Lorem ipsum")
- [ ] Sidebar links to all 4 pages work correctly
- [ ] Breadcrumbs update correctly on each page
- [ ] Import paths and file paths are accurate
- [ ] Status badges display correctly
- [ ] Code snippets are copyable and syntactically correct
- [ ] `npm run build` passes

**STOP. Review Phase 3a. Fix any issues before proceeding to 3b.**

---

### Phase 3b: Remaining Component Pages

**Objective:** Build pages for every remaining component in the registry.

**Duration:** ~4–6 hours

**Components to Build:**

**Wiki Domain (4 remaining):**
- `ArticleRenderer` — The MDX renderer for wiki articles
- `TableOfContents` — Auto-generated TOC from headings
- `BreadcrumbNav` — Navigation breadcrumbs for wiki
- `TagBadge` — Taxonomy tag pill (e.g., "PD 1096", "Structural")

**Questions Domain (4 remaining):**
- `AnswerOption` — Single answer choice with radio/checkbox
- `RationalePanel` — Explanation panel shown after answer submission
- `DifficultyBadge` — Color-coded difficulty indicator
- `SessionTimer` — Countdown timer for timed quiz sessions

**Testing Path Domain (4 remaining):**
- `MasteryBar` — Horizontal progress bar for mastery level
- `HeatmapGrid` — Topic mastery heatmap (grid of colored cells)
- `TrailProgressCard` — Camp Trail progress summary
- `SubjectPill` — Subject area tag (e.g., "Utilities", "Structural")

**System/Shared Domain (5 remaining):**
- `Badge` — All badge variants with Shadcn Badge
- `Card` — Card component with all variants
- `Tooltip` — Tooltip with positioning options
- `Skeleton` — Loading skeleton variants
- `EmptyState` — Empty state with icon + message + CTA

**For each component:**
1. If it exists in the codebase → import and render it directly
2. If it doesn't exist yet → create a mock version at `src/components/developer/mocks/Mock[Name].tsx`
3. Add a comment `// TODO: Replace with real component` on all mocks
4. Complete `propsTable` with realistic TypeScript types
5. Complete `codeSnippet` with runnable import + JSX

**Phase 3b Acceptance Criteria:**
- [ ] All 17 remaining component pages render
- [ ] Every page has all three tabs working
- [ ] No broken imports
- [ ] All mock components are visually representative of the real thing
- [ ] `npm run build` passes
- [ ] Sidebar shows all components and navigates correctly

---

## Phase 4: System Status Dashboards

**Objective:** Build the Database Status and Infrastructure Status pages with mock data structured to be a one-line swap for real APIs.

**Duration:** ~6–8 hours

### Task 4.1: Mock Data Layer

**File:** `src/lib/mocks/status.ts`

Every mock function must be `async`, return a typed response, and match the exact shape the real Supabase admin API or custom endpoint would return. This way, swapping in real data later requires changing only the function body — not the callers.

```typescript
export async function getDatabaseStatus(): Promise<DatabaseStatus> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 200))
  
  return {
    connections: { active: 12, idle: 8, max: 20 },
    tables: [
      { name: 'users', rowCount: 2847, size: '14.2 MB' },
      { name: 'user_interactions', rowCount: 184302, size: '892.1 MB' },
      { name: 'quiz_sessions', rowCount: 12453, size: '67.8 MB' },
      { name: 'user_node_mastery', rowCount: 89234, size: '234.5 MB' },
      { name: 'wiki_articles', rowCount: 412, size: '28.9 MB' },
      { name: 'taxonomy_nodes', rowCount: 1847, size: '8.3 MB' },
      { name: 'questions', rowCount: 6723, size: '156.2 MB' },
      { name: 'trail_enrollments', rowCount: 934, size: '4.1 MB' },
      { name: 'feature_flags', rowCount: 23, size: '0.1 MB' },
      { name: 'audit_logs', rowCount: 45678, size: '112.4 MB' },
    ],
    migrations: [
      { id: '20260318_001', name: 'add_mastery_decay_column', timestamp: '2026-03-18T14:23:00Z', status: 'applied' },
      { id: '20260315_001', name: 'create_trail_milestones_table', timestamp: '2026-03-15T09:12:00Z', status: 'applied' },
      { id: '20260312_002', name: 'add_question_difficulty_index', timestamp: '2026-03-12T16:45:00Z', status: 'applied' },
      { id: '20260312_001', name: 'update_rls_policies_quiz_sessions', timestamp: '2026-03-12T10:30:00Z', status: 'applied' },
      { id: '20260308_001', name: 'add_analytics_materialized_views', timestamp: '2026-03-08T11:00:00Z', status: 'applied' },
    ],
  }
}

export async function getInfrastructureStatus(): Promise<InfrastructureStatus> {
  await new Promise(resolve => setTimeout(resolve, 200))
  
  return {
    apiLatency: { p50: 45, p95: 189, p99: 342, unit: 'ms' },
    edgeFunctions: [
      { name: 'compute-readiness-score', status: 'operational', lastInvocation: '2026-03-25T08:14:22Z' },
      { name: 'process-quiz-submission', status: 'operational', lastInvocation: '2026-03-25T08:12:45Z' },
      { name: 'generate-study-plan', status: 'operational', lastInvocation: '2026-03-25T07:58:10Z' },
      { name: 'sync-taxonomy-cache', status: 'degraded', lastInvocation: '2026-03-25T06:00:00Z' },
      { name: 'send-notification', status: 'operational', lastInvocation: '2026-03-25T08:10:33Z' },
    ],
    deployment: {
      timestamp: '2026-03-24T22:15:00Z',
      status: 'success',
      commit: 'a3f8b2c',
      duration: '2m 34s',
    },
  }
}
```

**Acceptance Criteria:**
- [ ] Both functions are `async` and return typed responses
- [ ] Table names match SlateCamp's actual schema (or close approximation)
- [ ] Row counts and sizes are realistic
- [ ] Edge function names match real SlateCamp functions
- [ ] Migration names follow the `YYYYMMDD_NNN_description` convention
- [ ] Return types exactly match `DatabaseStatus` and `InfrastructureStatus` from `developer.ts`

---

### Task 4.2: StatusBadge Component

**File:** `src/components/developer/StatusBadge.tsx`

**Props:**
```typescript
interface StatusBadgeProps {
  status: 'operational' | 'degraded' | 'outage'
  size?: 'sm' | 'md'     // default 'md'
  showIcon?: boolean      // default true
}
```

**Renders three signals (never color alone):**

| Status | Color | Icon | Text |
|---|---|---|---|
| `operational` | `signal-green` | ✓ checkmark (lucide: `Check`) | "Operational" |
| `degraded` | `signal-gold` | ⚠ warning (lucide: `AlertTriangle`) | "Degraded" |
| `outage` | `signal-red` | ✕ error (lucide: `X`) | "Outage" |

**Visual:** Colored dot (6px circle) + icon (12px) + text label — all in a flex row.

**Acceptance Criteria:**
- [ ] Three signals: color + icon + text (meets WCAG 2.1)
- [ ] Works correctly in all three states
- [ ] `sm` variant is smaller text/icons for inline use
- [ ] Passes grayscale test (distinguishable without color via icon shape)

---

### Task 4.3: Status Overview Page

**File:** `src/app/developer/status/page.tsx`

**Layout:**
```
┌──────────────────────────────────────────────┐
│ 🟢 All Systems Operational                   │  ← Global status banner
│ Last checked: 3 seconds ago                  │
├───────────┬───────────┬───────────┬──────────┤
│ Database  │ API       │ Auth      │ Storage  │  ← KPI cards (4-col grid)
│ 🟢 12ms  │ 🟢 45ms  │ 🟢 OK    │ 28%     │
├───────────┴───────────┴───────────┴──────────┤
│ Services                                     │
│ ├ Database ─── 🟢 Operational                │  ← Service rows
│ ├ API ──────── 🟢 Operational                │
│ ├ Auth ─────── 🟢 Operational                │
│ └ Storage ──── 🟢 Operational                │
└──────────────────────────────────────────────┘
```

**Global Status Banner:**
- Auto-calculates from worst-case component: if any service is `outage`, banner is red; if any is `degraded`, banner is gold; otherwise green
- Full-width card at top
- Left: status icon + text
- Right: "Last checked: X seconds ago" (static for mock)

**KPI Cards:**
- 4-column grid
- Each card: eyebrow label, stat number (DM Mono), status badge
- Card pattern with rounded-xl borders

**Service Rows:**
- List of all services with status badge and detail link

**Acceptance Criteria:**
- [ ] Global banner reflects worst-case status
- [ ] KPI cards show correct metrics
- [ ] Service rows link to detail pages
- [ ] All status uses color + icon + text (never color alone)
- [ ] Typography follows the token system

---

### Task 4.4: Database Status Page

**File:** `src/app/developer/status/database/page.tsx`

**Sections:**

**Section 1: Connection Pool Card**
- Visual: progress bar showing `active / max` utilization
- Numbers: `12 active · 8 idle · 20 max`
- Color: green if utilization < 70%, gold if 70-90%, red if > 90%
- Text label accompanies color

**Section 2: Table Row Counts**
- Sortable table with columns: Table Name, Row Count, Size
- Table Name: `font-mono` styled
- Row Count: `font-mono tabular-nums`, right-aligned, with thousand separators
- Size: `font-mono`, right-aligned
- Default sort: by Row Count descending
- Click column header to sort (ascending/descending toggle)
- Sorting requires `'use client'` — extract to a client component

**Section 3: Recent Migrations**
- List of last 5 migrations
- Each item: migration name (mono), timestamp (relative, e.g., "7 days ago"), status badge
- Applied = green badge, Failed = red badge, Pending = gold badge

**Acceptance Criteria:**
- [ ] Connection pool renders with correct progress bar
- [ ] Table is sortable by all three columns
- [ ] Row counts have thousand separators (e.g., "184,302")
- [ ] Migrations show relative timestamps
- [ ] All data comes from `getDatabaseStatus()` mock
- [ ] Color coding always paired with text label

---

### Task 4.5: Infrastructure Status Page

**File:** `src/app/developer/status/infrastructure/page.tsx`

**Sections:**

**Section 1: API Latency Card**
- Three metrics: p50, p95, p99
- Displayed as large stat numbers (DM Mono)
- Color: green if p95 < 200ms, gold if 200-500ms, red if > 500ms
- Eyebrow: "API RESPONSE TIME"

**Section 2: Edge Functions List**
- Card per function showing: function name (mono), status badge, last invocation (relative time)
- Sorted by last invocation (most recent first)
- Grid layout: 2 columns on desktop

**Section 3: Deployment Card**
- Single card showing: commit hash (mono, abbreviated), timestamp, duration, status
- Status badge: green for success, red for failed
- "View full log" link (non-functional, placeholder)

**Acceptance Criteria:**
- [ ] API latency shows all three percentiles
- [ ] Edge functions list is sorted correctly
- [ ] Deployment card shows commit hash in monospace
- [ ] All data from `getInfrastructureStatus()` mock
- [ ] Status badges use three-signal pattern everywhere

---

### Phase 4 Verification Checklist

- [ ] `npm run build` passes
- [ ] `/developer/status` renders the overview with global banner + KPI cards
- [ ] `/developer/status/database` renders all three sections
- [ ] `/developer/status/infrastructure` renders all three sections
- [ ] Sidebar "Status" group links work correctly
- [ ] Table sorting works on the database page
- [ ] All color coding uses color + icon + text
- [ ] Mock data is realistic and matches SlateCamp's actual architecture
- [ ] Types are correct — no `any`

**STOP. Review Phase 4 output. Fix any issues before proceeding.**

---

## Phase 5: Command Palette, Polish & Error Handling

**Objective:** Add ⌘K command palette, keyboard shortcuts, loading states, error boundaries, responsive behavior, and final polish.

**Duration:** ~6–8 hours

### Task 5.1: Command Palette

**File:** `src/components/developer/CommandPalette.tsx`  
**Directive:** `'use client'`

**Dependencies:**
- `cmdk` (via shadcn: `npx shadcn-ui add command`)
- `fuse.js` (install: `npm install fuse.js`)

**Behavior:**
1. **Trigger:** `⌘+K` (Mac) or `Ctrl+K` (Windows) — or clicking the search trigger in the top bar
2. **Modal:** centered, max-width 640px, ~15vh from top, rounded-xl, shadow-2xl, backdrop blur
3. **Search input:** 48px tall, magnifying glass icon, placeholder "Search components, pages, status..."
4. **Empty state (no query):** show grouped suggestions:
   - **Recent** — last 5 visited pages (from `localStorage`)
   - **Quick Actions** — "Check System Status", "Toggle Theme"
   - **Browse** — "Design System", "Wiki", "Questions", "Testing Path", "Shared"
5. **Typing:** results filter via Fuse.js (<16ms for 60fps)
   - Results grouped by type with section headers
   - Each result: domain icon + name (matched chars bolded) + description + type badge
   - Max 8-10 visible results, scroll for more
6. **Navigation:** ↑↓ arrows, Enter to navigate, Escape to close
7. **No results:** "No results for '[query]'" + "Browse all components →" link

**Fuse.js Configuration:**
```typescript
const fuse = new Fuse(searchItems, {
  keys: [
    { name: 'name', weight: 2 },
    { name: 'tags', weight: 1.5 },
    { name: 'description', weight: 1 },
    { name: 'domain', weight: 0.5 },
  ],
  threshold: 0.3,
  includeMatches: true,
  minMatchCharLength: 2,
})
```

**Acceptance Criteria:**
- [ ] ⌘+K opens the palette from any `/developer/*` page
- [ ] Typing filters results instantly
- [ ] ↑↓ navigation works
- [ ] Enter navigates to the selected result and closes the palette
- [ ] Escape closes the palette
- [ ] Empty state shows Recent + Quick Actions + Browse
- [ ] No results state shows fallback links
- [ ] Modal has backdrop blur overlay

---

### Task 5.2: Search Index

**File:** `src/lib/developer/searchIndex.ts`

Build the `SearchItem[]` array from the component registry and static page definitions.

**Requirements:**
- Every component in the registry becomes a SearchItem
- Static pages (Overview, Status, Database, Infrastructure) also become SearchItems
- Include `keywords` for common aliases (e.g., Button → ["btn", "cta", "action"])
- Include `tags` for cross-referencing (e.g., WikiCard → ["wiki", "card", "article"])

**Acceptance Criteria:**
- [ ] All registered components are searchable
- [ ] All static pages are searchable
- [ ] Keywords enable fuzzy matching ("btn" finds "Button")
- [ ] Types are correct

---

### Task 5.3: Loading Skeletons

**Files:**
- `src/app/developer/loading.tsx`
- `src/app/developer/design-system/wiki/[component]/loading.tsx`
- `src/app/developer/status/database/loading.tsx`
- `src/app/developer/status/infrastructure/loading.tsx`

**Requirements:**
- Each `loading.tsx` renders a skeleton that matches the shape of the actual page
- Use Shadcn `Skeleton` component (`npx shadcn-ui add skeleton`)
- Homepage skeleton: 3 card-shaped skeletons in a grid
- Component page skeleton: title skeleton + tab bar + large content area skeleton
- Status page skeleton: banner skeleton + 4 KPI card skeletons + table skeleton
- Never show a full-page spinner

**Acceptance Criteria:**
- [ ] Every route segment has a `loading.tsx`
- [ ] Skeletons match the shape of the actual content
- [ ] No spinners anywhere

---

### Task 5.4: Error Boundaries

**Files:**
- `src/app/developer/error.tsx`
- `src/app/developer/not-found.tsx`

**`error.tsx` Requirements:**
- `'use client'` (required by Next.js)
- Shows: error message, "Try Again" button (calls `reset()`), link back to Developer Portal home
- Card-based layout, not a full-page error screen
- No technical details shown to user (log to console for development)

**`not-found.tsx` Requirements:**
- Shows: "Page not found" message, link to Developer Portal home, "Browse components" link
- Card-based layout matching the Rams Standard

**Acceptance Criteria:**
- [ ] Invalid routes show the not-found page
- [ ] Error boundary catches render errors
- [ ] "Try Again" button works
- [ ] Both pages match the visual language

---

### Task 5.5: Responsive Behavior

**Requirements:**
- **Desktop (≥1024px):** Sidebar visible, 220px wide. Full layout as designed.
- **Tablet (768px–1023px):** Sidebar collapses to icons only (48px wide). Hovering expands to full width with overlay.
- **Mobile (<768px):** Sidebar hidden by default. Hamburger menu button in top bar. Sidebar slides in as a drawer from the left with backdrop overlay.
- Content area max-width adjusts: 960px on desktop, full-width minus sidebar on tablet, full-width on mobile.
- Command palette is full-screen on mobile (no modal, takes over the viewport).

**Acceptance Criteria:**
- [ ] Layout is usable on all three breakpoints
- [ ] No horizontal scrolling
- [ ] Sidebar collapses/expands correctly
- [ ] Command palette adapts to mobile

---

### Task 5.6: Final Visual Audit

Walk through every page and verify:

- [ ] **Typography:** Every text element uses the correct font/weight/size from the token table
- [ ] **Colors:** Every color reference uses the defined tokens (no hardcoded hex outside tokens)
- [ ] **Card Pattern:** Every card uses `bg-card border border-border rounded-xl p-4`
- [ ] **Status Indicators:** Every status display uses color + icon + text (3 of 4 signals)
- [ ] **Code Blocks:** Dark background, syntax highlighted, copy button, line numbers
- [ ] **Spacing:** Consistent use of Tailwind spacing scale (no arbitrary values like `23px`)
- [ ] **Active States:** Sidebar, tabs, breadcrumbs all correctly indicate current page
- [ ] **Hover States:** All interactive elements have visible hover feedback
- [ ] **Focus States:** All focusable elements have visible focus outlines (accessibility)
- [ ] **Empty States:** No blank pages — every "no data" scenario has a meaningful empty state

---

### Phase 5 Verification Checklist

- [ ] `npm run build` passes with zero errors
- [ ] ⌘+K command palette opens from any page
- [ ] Search finds components by name, tag, and keyword
- [ ] Loading skeletons appear during navigation
- [ ] Error boundary renders for thrown errors
- [ ] 404 page renders for invalid routes
- [ ] Layout is responsive at all three breakpoints
- [ ] Every status indicator passes the grayscale test
- [ ] Every interactive element has hover + focus states
- [ ] No `console.log` in any file
- [ ] No `any` types in any file

---

## Phase 6: Integration Testing & Final Acceptance

**Objective:** End-to-end walkthrough of every user journey to verify nothing is broken.

**Duration:** ~2–3 hours

### Test 1: New Engineer Onboarding (TTFC < 60 seconds)

1. Navigate to `/developer`
2. See the homepage with three section cards
3. Click "Design System" card → lands on `/developer/design-system`
4. Sidebar shows all domain groups
5. Click "Wiki Article" → expand → click "WikiCard"
6. See the Preview tab with a realistic WikiCard
7. Switch to Code tab → click Copy → paste into a test file → verify it's valid JSX
8. **Total time from homepage to copied code: under 60 seconds**

### Test 2: Command Palette Navigation

1. Press `⌘+K` from any page
2. Type "button" → see Button in results
3. Press Enter → navigate to Button page
4. Press `⌘+K` again → type "readiness" → see ReadinessRing
5. Press Enter → navigate to ReadinessRing page
6. Press `⌘+K` → type "database" → see Database Status
7. Press Enter → navigate to database status page

### Test 3: Status Dashboard Walkthrough

1. Navigate to `/developer/status`
2. Global banner shows "All Systems Operational"
3. KPI cards show Database, API, Auth, Storage metrics
4. Click "Database" → navigate to database details
5. Connection pool card renders correctly
6. Table row counts are sortable (click Name header, then click Row Count header)
7. Migrations list shows 5 entries with correct status badges
8. Back to status overview → click "Infrastructure"
9. API latency shows p50/p95/p99
10. Edge functions list shows 5 functions with status badges
11. Deployment card shows last build info

### Test 4: Component Page Deep Dive

1. Navigate to `/developer/design-system/shared/button`
2. Preview tab: all variants visible in a grid
3. Switch to Props tab: complete props table with all columns
4. Switch to Code tab: syntax-highlighted code with line numbers
5. Click Copy → verify clipboard contains raw code
6. Toggle Preview area to dark mode → components re-render in dark theme
7. Navigate to breadcrumb "Shared" → see list of all shared components

### Test 5: Search and Filter

1. In sidebar, type "Card" in search input
2. Sidebar filters to: WikiCard, QuestionCard, TrailProgressCard, Card
3. Clear search → all items return
4. Type "Mastery" → only MasteryBar and related items show
5. Press `/` key → search input focuses

### Test 6: Error and Edge Cases

1. Navigate to `/developer/design-system/wiki/nonexistent` → 404 page
2. Navigate to `/developer/nonexistent-route` → 404 page
3. Rapidly switch between tabs on a component page → no flicker, no stale state
4. Resize browser from desktop → tablet → mobile → layout adapts at each breakpoint
5. On mobile, tap hamburger → sidebar drawer opens
6. Navigate via sidebar drawer → drawer closes, page loads

### Test 7: Build Verification

```bash
npm run build        # Must pass with 0 errors, 0 warnings
npm run lint         # Must pass
npm run type-check   # Must pass (if separate command exists)
```

### Test 8: Code Quality Audit

- [ ] `grep -r "console.log" src/app/developer/ src/components/developer/` → 0 results
- [ ] `grep -r "any" src/types/developer.ts` → 0 results
- [ ] `grep -r "@ts-ignore" src/app/developer/ src/components/developer/` → 0 results
- [ ] `grep -r "select\('\*'\)" src/` → 0 results in developer route
- [ ] Every `'use client'` directive is justified (component uses hooks, browser APIs, or event handlers)
- [ ] Every import uses `@/` prefix
- [ ] Every component uses named export (except page.tsx and layout.tsx)

---

## Dependency Installation Checklist

Run these before starting Phase 1:

```bash
# Shadcn components (install as needed per phase)
npx shadcn-ui add skeleton       # Phase 1 (loading states)
npx shadcn-ui add tabs           # Phase 2 (ComponentShowcase)
npx shadcn-ui add table          # Phase 2 (PropsTable)
npx shadcn-ui add badge          # Phase 2 (StatusBadge)
npx shadcn-ui add command        # Phase 5 (Command Palette — includes cmdk)
npx shadcn-ui add tooltip        # Phase 3b
npx shadcn-ui add progress       # Phase 4 (connection pool bar)
npx shadcn-ui add alert          # Phase 4 (status banner)

# NPM packages
npm install shiki                # Phase 2 (CodeBlock syntax highlighting)
npm install fuse.js              # Phase 5 (fuzzy search)
npm install lucide-react         # All phases (icons) — likely already installed
```

---

## Risk Mitigation

| Risk | Mitigation |
|---|---|
| Shiki SSR issues | Use `shiki/bundle/web` for client-side highlighting. If SSR fails, fall back to `prism-react-renderer`. |
| Component registry grows stale | Registry is a `.ts` file that fails type-check if a component's interface changes. Enforce via build. |
| Mock data diverges from real APIs | Mock functions share types with real API callers. Changing the type breaks both — forcing sync. |
| Sidebar search performance | With <100 items, string `.includes()` is sufficient. Fuse.js is only for the command palette. |
| Dynamic route catch-all conflicts | Use `[component]` dynamic segments, NOT `[...slug]` catch-alls. Each domain has its own folder. |
| `'use client'` creep | Every PR must justify `'use client'`. Extraction pattern: Server Component wrapper imports Client child. |

---

## Success Metrics

| Metric | Target | How to Measure |
|---|---|---|
| Time to First Copy (TTFC) | < 60 seconds | Manual test: homepage to copied code |
| Build pass rate | 100% | `npm run build` exits 0 |
| Type safety | Zero `any` types | `grep -r` audit |
| Status signal compliance | 3 of 4 signals on every indicator | Visual audit in grayscale mode |
| Responsive breakpoints | 3 (mobile, tablet, desktop) | Browser resize test |
| Search coverage | 100% of registered components | Cross-reference registry with search index |
| Component page coverage | 21 pages (4 domains × ~5 components + overview) | Count route files |

---

## Execution Protocol

1. **Execute one phase at a time.** Do not start Phase N+1 until Phase N passes all acceptance criteria.
2. **Run `npm run build` after every phase.** If it fails, fix before moving on.
3. **If a convention is unclear, ask — don't guess.** Wrong guesses compound across phases.
4. **Quality over speed.** A phase that takes longer but passes all criteria is better than a fast phase with tech debt.
5. **Every file must be production-grade.** No "we'll fix this later" comments (except explicit `// TODO: Replace with real component` on mock previews).
