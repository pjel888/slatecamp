<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-25 -->

# shared

## Purpose

Cross-cutting reusable components used throughout the app: theme provider, navigation structure (navbar, sidebar with rail+overlay pattern), header, progress tracking, info tooltips, loading states, error boundaries, data tables, section headers, stat cards, score displays, taxonomy pickers, and breadcrumbs. Most are client components; some are server-renderable.

## Key Files

| File | Description |
|------|-------------|
| `ThemeProvider.tsx` | Next-themes provider wrapper: light/dark mode with system detection. Usually in root layout. `'use client'` |
| `ThemeToggle.tsx` | Sun/Moon icon button to switch theme. Calls `setTheme()` from useTheme hook. `'use client'` |
| `Navbar.tsx` | Top navigation: logo, nav items (Dashboard, Wiki, Quiz, etc.), theme toggle, user menu. `'use client'` |
| `DashboardHeader.tsx` | Page header: breadcrumb or page title, optional action buttons. Reused across dashboard pages. |
| `NavigationProgress.tsx` | Progress bar: top-of-page loading indicator. Triggered on route changes. `'use client'` |
| `LogoutButton.tsx` | Logout action: calls Supabase signOut, redirects to /login. `'use client'` |
| `Omnibar.tsx` | Command palette: global search input (topics, questions, articles). Keyboard shortcut (Cmd+K). `'use client'` |
| `QuickActionsBar.tsx` | Floating action bar: shortcuts to common tasks. `'use client'` |
| `InfoTooltip.tsx` | Help icon + tooltip: explains UI concepts. Reusable across pages. |
| `StandardInfoPopover.tsx` | Info icon + popover (wider/taller than tooltip): detailed explanations with links. `'use client'` |
| `TierBadge.tsx` | User tier badge: Free/Pro/Enterprise. Shows next tier benefits on hover. |
| `TransitionLink.tsx` | Next Link wrapper with page transition animation. Respects prefers-reduced-motion. `'use client'` |
| `DashboardPageSkeleton.tsx` | Loading skeleton for full pages: header placeholder + grid of card skeletons. |
| `data-table.tsx` | Generic sortable, searchable, paginated data table. Supports column definitions, selection (Checkbox), search, sorting, pagination. Exports `DataTable` and `Column` type. `'use client'` |
| `section-header.tsx` | Standardized section header with eyebrow, title, subtitle, action slot. Three levels: page, section, card. |
| `stat-card.tsx` | Metric card with eyebrow label, value, trend indicator (up/down/flat), optional link. |
| `score-display.tsx` | Score rendering utilities. Exports `getScoreColorHex()` for readiness score coloring. `'use client'` |
| `taxonomy-picker.tsx` | Taxonomy node picker with tree navigation. `'use client'` |
| `taxonomy-tree.tsx` | Taxonomy tree rendering component. `'use client'` |
| `legal-citation-badge.tsx` | Citation badge linking to legal/code references. `'use client'` |
| `breadcrumb.tsx` | Breadcrumb navigation component. |
| `page-header.tsx` | Alternative page header component. |
| `sidebar-nav.tsx` | Sidebar navigation for settings/sub-pages. `'use client'` |
| `content-sidebar.tsx` | Content area sidebar for secondary navigation. `'use client'` |
| `action-card.tsx` | Action card with title, description, and CTA button. |
| `app-drawer.tsx` | Application-wide drawer component. `'use client'` |
| `empty-state.tsx` | Empty state placeholder with icon, message, and optional action. |
| `floating-panel.tsx` | Floating panel for contextual content. `'use client'` |
| `question-card.tsx` | Question display card for lists and previews. |
| `question-dot-navigator.tsx` | Dot-based question navigator for quiz progress. `'use client'` |
| `difficulty-bar.tsx` | Visual difficulty indicator bar (1-5 scale). |
| `event-badge.tsx` | Event/activity type badge. |
| `mode-button.tsx` | Test mode selection button. |
| `student-view-watermark.tsx` | Watermark overlay for student preview mode. |

## Subdirectories

None. All shared components are flat in `src/components/shared/`.

## For AI Agents

### Working In This Directory

1. **ThemeProvider setup.** All components in Navbar/Sidebar assume ThemeProvider wraps the app root. Do not add theme logic to individual components.

2. **Navigation pattern (rail + overlay).** On desktop, Navbar is horizontal, Sidebar is optional right-rail. On mobile (<md breakpoint), both collapse into sheet overlays triggered by hamburger icon. See Sidebar/Navbar for implementation.

3. **useTheme hook.** Access theme state via `const { theme, setTheme } = useTheme()`. Only available inside ThemeProvider boundary.

4. **DataTable reuse.** The `data-table.tsx` component is a generic table used by CEO TeamTable, admin audit logs, and other tabular views. Define columns via `Column<T>[]` interface. Supports sorting, search, pagination, and row selection.

5. **SectionHeader levels.** Use `level="page"` for top-level page headers, `level="section"` for content sections, `level="card"` for card-internal headers. Each level has appropriate typography sizing.

6. **Score display.** `score-display.tsx` exports `getScoreColorHex()` which is the canonical source for readiness score color thresholds. It is re-exported by `@/components/graphics/tokens.ts` for graphic contexts.

7. **No route logic inside shared components.** All navigation logic lives in ROUTES constants (@/lib/constants/routes.ts). Shared components reference these constants only.

### Common Patterns

**Data table usage:**
```tsx
import { DataTable, type Column } from '@/components/shared/data-table'

const columns: Column<MyRow>[] = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'status', header: 'Status', type: 'badge' },
  { key: 'date', header: 'Date', type: 'date', sortable: true },
]

<DataTable columns={columns} data={rows} keyField="id" />
```

**Section header usage:**
```tsx
import { SectionHeader } from '@/components/shared/section-header'

<SectionHeader
  eyebrow="Analytics"
  title="Readiness Trajectory"
  level="section"
  action={<Button size="sm">Export</Button>}
/>
```

**Stat card usage:**
```tsx
import { StatCard } from '@/components/shared/stat-card'

<StatCard
  eyebrow="Questions Answered"
  value={342}
  trend={{ direction: 'up', label: '+12 this week' }}
/>
```

## Dependencies

### Internal

| Module | Purpose |
|--------|---------|
| `@/lib/constants/routes` | ROUTES object: all route strings |
| `@/lib/context/*` | Auth context hooks, active session context |
| `@/components/ui/*` | Button, Sheet, Dialog, Tooltip, Badge, Checkbox, Input, Skeleton |
| `@/lib/utils` | cn() for conditional styling |

### External

| Package | Usage | Version |
|---------|-------|---------|
| **next-themes** | ThemeProvider, useTheme hook | ^0.4.6 |
| **next/navigation** | useRouter, usePathname for routing | 16.1.6 |
| **next/link** | Client-side navigation | 16.1.6 |
| **react** | Hooks: useState, useEffect, useMemo | ^19.2.4 |
| **lucide-react** | Icons: TrendingUp, TrendingDown, Minus, ChevronLeft, ChevronRight, ArrowUpDown | ^0.577.0 |
| **@phosphor-icons/react** | Icons: Sun, Moon, Bell, SidebarSimple, etc. | ^1.4.14 |
| **framer-motion** | Page transition animations (TransitionLink) | ^12.35.2 |

<!-- MANUAL: -->
