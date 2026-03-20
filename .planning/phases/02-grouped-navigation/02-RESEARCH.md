# Phase 2: Grouped Navigation - Research

**Researched:** 2026-03-21
**Domain:** Sidebar navigation grouping, route configuration data modeling, React component composition
**Confidence:** HIGH

## Summary

Phase 2 transforms the current flat sidebar navigation list into labeled sections (LEARN, PRACTICE, DATA) with Dashboard as a standalone top item and Settings pinned to the bottom. The work is purely organizational -- no overlay behavior, no layout width changes, no new pages. The existing `SidebarItem` component, `ICON_BOX` alignment constant, and opacity-based collapse/expand transitions are all reusable as-is.

The core technical challenge is extending the route configuration data model to carry group metadata while preserving the existing `STATIC_PAGE_TITLES` and `getPageTitle()` contracts. The rendering change in `Sidebar.tsx` replaces a single `.map()` with a grouped iteration that inserts section labels between groups. Group labels must participate in the existing opacity transition so they fade with the text on collapse.

**Primary recommendation:** Extend `RouteConfig` with an optional `group` field, derive `GROUPED_NAVIGATION` from `DASHBOARD_ROUTES`, and replace the flat `.map()` in Sidebar.tsx with a grouped render function. Keep `SidebarItem` unchanged.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Group label styling: Sentence case ("Learn", "Practice", "Data"), 11px font, Ink Tertiary (#8896A7), left-aligned flush with icon column
- Labels hidden when sidebar is collapsed, visible when expanded
- Dashboard sits at the top above all groups with a thin border-b separator between Dashboard and first group label
- Same SidebarItem component for Dashboard -- position + separator communicates hierarchy, not a different component
- Group composition: LEARN (Wiki, Notes, 3D Lab), PRACTICE (CampTrails, Review), DATA (Analytics)
- Group order: LEARN -> PRACTICE -> DATA
- Settings removed from grouped navigation, pinned to sidebar bottom as a standalone full nav item (icon + "Settings" label)
- Settings bottom placement is transitional -- Phase 7 replaces it with account popover

### Claude's Discretion
- Exact spacing between groups (within Campfire constraints)
- Whether to add a subtle separator between groups or rely on label + whitespace alone
- Route config data structure for groups (extend RouteConfig with group field vs separate config)
- Transition animation for group labels appearing/disappearing on collapse/expand

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| NAV-01 | Navigation items grouped into labeled sections (LEARN, PRACTICE, DATA) | Route config group field + grouped rendering logic in Sidebar.tsx |
| NAV-02 | Dashboard rendered as standalone top-level item (category-level visual weight) | Dashboard extracted before groups, thin border-b separator below it |
| NAV-03 | LEARN group contains: Wiki, Notes, 3D Lab | Group field values in DASHBOARD_ROUTES entries |
| NAV-04 | PRACTICE group contains: CampTrails, Review | Group field values in DASHBOARD_ROUTES entries |
| NAV-05 | DATA group contains: Analytics | Group field value in DASHBOARD_ROUTES entry |
| NAV-08 | Group labels hidden when collapsed, visible when expanded | Opacity transition pattern already established for nav text (lines 128-133 of Sidebar.tsx) |
| NAV-09 | Active route indicator maintained across all states | Existing isActive logic preserved; SidebarItem unchanged; Settings bottom item uses same pattern |
</phase_requirements>

## Standard Stack

### Core (Already Installed -- No New Dependencies)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.x | Component rendering | Project core framework |
| Next.js (App Router) | 15.x | Routing, pathname access via `usePathname` | Project core framework |
| Tailwind CSS | 4.x | Utility-first styling, group labels, spacing | Project styling layer |
| @phosphor-icons/react | 2.1.10 | Icon set (GearSix for Settings) | Already used for all nav icons |
| @base-ui/react | 1.2.0 | Separator primitive (via shadcn Separator) | Already installed, separator component exists |

### Supporting (Already Available)

| Library | Purpose | When to Use |
|---------|---------|-------------|
| `cn()` from `@/lib/utils` | Conditional class merging | All className composition |
| `SCIcon` from `@/components/graphics/icons/Icon` | Standardized icon wrapper | Icon rendering in SidebarItem |
| `Tooltip` from `@/components/ui/tooltip` | Collapsed-state tooltips | Tooltips on collapsed nav items |
| `Separator` from `@/components/ui/separator` | Semantic horizontal rule | Optionally between Dashboard and first group |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Extending RouteConfig with `group` field | Separate NAVIGATION_GROUPS config object | Separate config means two sources of truth; extending RouteConfig keeps single source |
| Inline border-b div for separator | shadcn Separator component | Separator adds semantic `<hr>` and ARIA role, but a simple `border-b` div matches existing sidebar pattern. Either works. |
| Typed union for group names | String literal field | Typed union (`'learn' \| 'practice' \| 'data'`) catches typos at compile time -- use this |

**Installation:** None required. All dependencies already installed.

## Architecture Patterns

### Recommended Data Model Change

```
src/lib/routes.ts (modified)
  - RouteConfig gains optional `group` field
  - New NavigationGroup type and GROUP_CONFIG constant
  - SIDEBAR_NAVIGATION remains for backward compat
  - New GROUPED_NAVIGATION derived constant

src/components/shared/Sidebar.tsx (modified)
  - Dashboard extracted as standalone item above groups
  - Flat .map() replaced with grouped rendering
  - Settings extracted and pinned to bottom
  - Group labels with collapse-aware opacity
  - No new files created -- modifications only
```

### Pattern 1: Group Metadata on RouteConfig

**What:** Add an optional `group` field to each `RouteConfig` entry. Dashboard and Settings have no group (standalone items). Define group display config (label, order) separately.

**When to use:** When grouping is a property of each route, not a separate concept.

**Example:**

```typescript
// Type-safe group identifiers
type NavGroup = 'learn' | 'practice' | 'data'

interface RouteConfig {
  path: string
  title: string
  sidebarLabel?: string
  icon?: PhosphorIcon
  sidebar?: boolean
  group?: NavGroup  // NEW -- undefined means standalone
}

// Group display configuration
interface NavGroupConfig {
  key: NavGroup
  label: string     // Sentence case per user decision
  order: number
}

const NAV_GROUPS: NavGroupConfig[] = [
  { key: 'learn', label: 'Learn', order: 1 },
  { key: 'practice', label: 'Practice', order: 2 },
  { key: 'data', label: 'Data', order: 3 },
]
```

**Why this over a separate mapping:** The route entry is the single source of truth. Adding group metadata to it means you cannot accidentally assign a route to a group that does not have a matching entry in DASHBOARD_ROUTES. TypeScript catches mismatches.

### Pattern 2: Grouped Navigation Derivation

**What:** Derive a grouped structure from the flat `DASHBOARD_ROUTES` array for the sidebar to consume.

**Example:**

```typescript
interface GroupedNavigation {
  dashboard: SidebarNavItem        // Standalone top item
  groups: {
    config: NavGroupConfig
    items: SidebarNavItem[]
  }[]
  settings: SidebarNavItem         // Standalone bottom item
}

const deriveGroupedNavigation = (): GroupedNavigation => {
  const routes = DASHBOARD_ROUTES.filter((r) => r.sidebar !== false)

  const dashboard = routes.find((r) => r.path === '/dashboard')!
  const settings = routes.find((r) => r.path === '/dashboard/settings')!
  const grouped = routes.filter((r) => r.group != null)

  const groups = NAV_GROUPS.map((config) => ({
    config,
    items: grouped
      .filter((r) => r.group === config.key)
      .map((r) => ({
        href: r.path,
        label: r.sidebarLabel ?? r.title,
        icon: r.icon,
      })),
  })).filter((g) => g.items.length > 0)

  return {
    dashboard: { href: dashboard.path, label: dashboard.sidebarLabel ?? dashboard.title, icon: dashboard.icon },
    groups,
    settings: { href: settings.path, label: 'Settings', icon: settings.icon },
  }
}

export const GROUPED_NAVIGATION = deriveGroupedNavigation()
```

### Pattern 3: Grouped Rendering in Sidebar

**What:** Replace the flat `SIDEBAR_NAVIGATION.map()` with structured rendering of dashboard + groups + admin.

**Key constraints:**
- Dashboard renders above groups with a border-b separator
- Group labels use opacity transition matching existing text fade pattern
- Settings renders pinned to sidebar bottom (outside the scrollable nav)
- Admin "Dev Settings" renders after groups but before settings
- Active state logic stays identical

### Anti-Patterns to Avoid

- **Separate navigation config file:** Do not create a new file for group definitions. Keep it in `routes.ts` where all route config lives. One source of truth.
- **Different component for Dashboard:** User explicitly decided Dashboard uses the same `SidebarItem` component. Position + separator conveys hierarchy, not a different component.
- **Collapsible/accordion groups:** This is NOT collapsible sections. Groups are always expanded. Do not add collapse-per-group behavior.
- **Group labels as interactive elements:** Group labels are purely visual organizers. They must not be clickable, focusable, or have hover states.
- **Wrapping each group in a container with visible borders:** The user wants GitHub/Supabase subtlety. Labels + whitespace, not boxed sections.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Semantic separator | Custom div with role="separator" | shadcn `<Separator />` or simple `border-b` div (matching existing pattern) | Existing pattern in Sidebar.tsx uses `border-b border-border` divs (lines 257, 302, 361, 378) |
| Tooltip on collapsed items | Custom tooltip positioning | Existing `<Tooltip>` + `<TooltipContent side="right">` wrapping pattern | Already implemented in SidebarItem -- reuse same pattern for Settings |
| Class merging | String concatenation | `cn()` from `@/lib/utils` | Project standard, handles conditional classes safely |
| Active route detection | Custom route matching | Existing `pathname === href \|\| (href !== '/dashboard' && pathname.startsWith(href))` pattern | Already correct and handles nested routes |

**Key insight:** This phase requires zero new components and zero new dependencies. It is a refactoring of data structure and rendering logic within existing files.

## Common Pitfalls

### Pitfall 1: Breaking STATIC_PAGE_TITLES Contract
**What goes wrong:** Adding `group` to RouteConfig or filtering routes differently could break `STATIC_PAGE_TITLES` or `getPageTitle()` which both derive from `DASHBOARD_ROUTES`.
**Why it happens:** `STATIC_PAGE_TITLES` uses `Object.fromEntries(DASHBOARD_ROUTES.map(...))` -- it maps ALL routes regardless of sidebar/group status. If you move routes out of the array or change the shape, page titles break silently.
**How to avoid:** Only ADD the optional `group` field. Do not restructure the array or filter it differently for title derivation. `STATIC_PAGE_TITLES` and `getPageTitle()` remain untouched.
**Warning signs:** Dashboard header showing "Overview" instead of the correct page title.

### Pitfall 2: Settings Label Mismatch
**What goes wrong:** The current `DASHBOARD_ROUTES` entry for settings has `title: 'Account Settings'`. The user wants the bottom-pinned item to show "Settings" (shorter label).
**Why it happens:** The page title should remain "Account Settings" for the browser tab / navbar, but the sidebar label should be "Settings".
**How to avoid:** Use the `sidebarLabel` field on the RouteConfig entry: `sidebarLabel: 'Settings'` while keeping `title: 'Account Settings'`. The grouped navigation derivation already uses `sidebarLabel ?? title`.
**Warning signs:** Bottom settings item showing "Account Settings" instead of "Settings", or page title showing just "Settings".

### Pitfall 3: Collapse Transition Mismatch for Group Labels
**What goes wrong:** Group labels snap in/out instead of fading like nav item text.
**Why it happens:** Forgetting to apply the same opacity transition pattern used by nav item text.
**How to avoid:** Group labels must use the identical transition: `transition-opacity duration-300` with `collapsed ? 'opacity-0' : 'opacity-100'`. This matches lines 129-132 of Sidebar.tsx.
**Warning signs:** Visual jarring when collapsing -- text fades but labels snap.

### Pitfall 4: Group Labels Taking Space When Collapsed
**What goes wrong:** Even with opacity-0, group labels still occupy vertical space in collapsed mode, creating unexplained gaps between icon rows.
**Why it happens:** Opacity hides visually but the element still takes layout space.
**How to avoid:** When collapsed, group labels should have `h-0 overflow-hidden opacity-0` to fully collapse, or use conditional rendering (`!collapsed && <label>`). Choose the approach that provides smooth transition -- conditional rendering with a height transition works well.
**Warning signs:** Collapsed sidebar has uneven spacing between icons that doesn't match the expanded layout.

### Pitfall 5: Admin Dev Settings Position After Groups
**What goes wrong:** The admin "Dev Settings" link (lines 359-373 of Sidebar.tsx) currently renders after the nav items with a border-t separator. After grouping, it needs to render after all groups but still within the scrollable nav area, not in the pinned bottom.
**Why it happens:** Restructuring the nav section without accounting for the conditional admin link.
**How to avoid:** Keep the admin link inside the `<nav>` element, after the last group, before the closing `</nav>`. Maintain the existing border-t separator above it.
**Warning signs:** Dev Settings appearing below Settings in the footer, or disappearing entirely.

### Pitfall 6: Dashboard Active State on Nested Routes
**What goes wrong:** Dashboard shows as active when on `/dashboard/wiki` or other nested routes.
**Why it happens:** Using `pathname.startsWith('/dashboard')` without the exact-match guard.
**How to avoid:** The existing logic already handles this correctly: `pathname === href` for Dashboard (exact match only, because the `href !== '/dashboard'` guard prevents startsWith matching for the dashboard route). Do not change this logic.
**Warning signs:** Dashboard highlight staying on when navigating to sub-pages.

## Code Examples

### Example 1: Extended RouteConfig with Group Metadata

```typescript
// src/lib/routes.ts -- additions

type NavGroup = 'learn' | 'practice' | 'data'

interface NavGroupConfig {
  key: NavGroup
  label: string
  order: number
}

export const NAV_GROUPS: NavGroupConfig[] = [
  { key: 'learn', label: 'Learn', order: 1 },
  { key: 'practice', label: 'Practice', order: 2 },
  { key: 'data', label: 'Data', order: 3 },
]

export interface RouteConfig {
  path: string
  title: string
  sidebarLabel?: string
  icon?: PhosphorIcon
  sidebar?: boolean
  group?: NavGroup           // NEW
}

// Updated DASHBOARD_ROUTES entries (order within array doesn't change):
// Dashboard: no group (standalone top)
// Wiki: group: 'learn'
// CampTrails: group: 'practice'
// Review: group: 'practice'
// Notes: group: 'learn'
// 3D Lab: group: 'learn'
// Analytics: group: 'data'
// Settings: no group (standalone bottom), add sidebarLabel: 'Settings'
```

### Example 2: Group Label Component (inline, not extracted)

```tsx
// Inside Sidebar.tsx -- group label rendering
// Left-aligned flush with icon column via matching px-2 and ICON_BOX width

<div className={cn(
  'flex items-center px-2 pt-4 pb-1',
  'transition-[opacity,height] duration-300',
  collapsed ? 'h-0 overflow-hidden opacity-0' : 'opacity-100',
)}>
  <div className={ICON_BOX} /> {/* Spacer matching icon column width */}
  <span className="text-[11px] font-medium text-[#8896A7] uppercase tracking-wide">
    {/* Wait -- user said sentence case, NOT uppercase */}
  </span>
</div>

// CORRECTED per user decision (sentence case, not uppercase):
<span className="text-[11px] font-medium text-[#8896A7]">
  {group.label}  {/* "Learn", "Practice", "Data" */}
</span>
```

**IMPORTANT:** User explicitly decided sentence case ("Learn", not "LEARN"). Do not add `uppercase` or `tracking-wide` to the label. The group labels in this document use ALL CAPS only for identification; the rendered labels must be sentence case.

### Example 3: Dashboard Separator

```tsx
// After Dashboard SidebarItem, before first group
<div className="mx-2 border-b border-border" />
```

This matches the existing separator pattern used throughout the sidebar (see lines 257, 302, 361, 378 of current Sidebar.tsx).

### Example 4: Settings Pinned to Bottom

```tsx
// Settings goes OUTSIDE the scrollable <nav> area, in a bottom-pinned section
// Similar to the existing footer area pattern

<div className="border-t border-border px-3 py-2">
  <SidebarItem
    href={GROUPED_NAVIGATION.settings.href}
    label={GROUPED_NAVIGATION.settings.label}
    icon={GROUPED_NAVIGATION.settings.icon}
    isActive={pathname === GROUPED_NAVIGATION.settings.href ||
              pathname.startsWith(GROUPED_NAVIGATION.settings.href)}
    collapsed={collapsed}
    onBeforeNavigate={(e) => handleNavClick(e, GROUPED_NAVIGATION.settings.href)}
  />
</div>
```

### Example 5: Group Label Left Alignment

The user specified group labels should be "flush with icon column (same left edge as nav items, not indented)." The current nav items use:
- Container: `px-2` (8px each side)
- Icon box: `ICON_BOX` = 32px wide flex container

To align the label text with the icon, the group label should NOT include the ICON_BOX spacer. Instead, it should just use the same `px-2` so the text starts at the same left edge as the icon box:

```tsx
<div className="px-2 pt-4 pb-1">
  <span className="text-[11px] font-medium text-[#8896A7]">
    {group.label}
  </span>
</div>
```

This positions the label text at the same horizontal position as the left edge of the icon boxes in nav items.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Flat nav list | Grouped with section labels | Industry standard (GitHub, Supabase, Vercel, Linear) | Professional information architecture |
| All items in scrollable area | Standalone items pinned top/bottom | Standard dashboard pattern | Dashboard and settings always accessible |

**Industry references:** GitHub's sidebar groups repos under section headers. Supabase groups nav under "Develop", "Manage", etc. Linear uses "Workspace" and "Teams" groupings. All use subtle text labels (not boxed sections) as dividers.

## Open Questions

1. **Group label left alignment interpretation**
   - What we know: User said "flush with icon column (same left edge as nav items, not indented)"
   - What's unclear: Does this mean the label text starts at the left edge of the icon box (px-2), or at the left edge of the icon itself (px-2 + icon centering offset)?
   - Recommendation: Align with `px-2` so the label text left edge matches the icon box left edge. This is how GitHub and Supabase do it. If the user wants the text further left or right, it is a single padding adjustment.

2. **Spacing between groups (Claude's Discretion)**
   - What we know: Campfire system has no explicit "group gap" token. Current nav items use `space-y-1` (4px gap).
   - Recommendation: Use `pt-4` (16px) on group labels to create visual breathing room between sections. The `pb-1` (4px) below the label keeps items tight to their header. This matches GitHub/Supabase density.

3. **Separator between groups (Claude's Discretion)**
   - What we know: User wants GitHub/Supabase subtlety
   - Recommendation: Rely on label + whitespace alone (no separator lines between groups). The Dashboard separator is locked. Inter-group separators would add visual noise. GitHub and Supabase use whitespace, not lines, between sections.

4. **Group label collapse transition (Claude's Discretion)**
   - What we know: Must not snap; existing text uses `transition-opacity duration-300`
   - Recommendation: Use conditional rendering (`!collapsed && label`) rather than opacity+height transition. The nav item text already handles its own opacity fade. Group labels can simply mount/unmount with the expanded state. This is simpler and avoids the "invisible element taking space" problem. If smoother animation is desired, use `transition-[opacity,max-height] duration-300` with `max-h-0 overflow-hidden opacity-0` when collapsed.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | bun:test (built-in) |
| Config file | none -- uses bun:test defaults |
| Quick run command | `bun test src/lib/routes.ts --bail` |
| Full suite command | `bun test` |

### Phase Requirements -> Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| NAV-01 | GROUPED_NAVIGATION contains 3 groups with correct keys | unit | `bun test src/lib/routes.test.ts -t "groups"` | No -- Wave 0 |
| NAV-02 | Dashboard is standalone (no group), separate from groups | unit | `bun test src/lib/routes.test.ts -t "dashboard"` | No -- Wave 0 |
| NAV-03 | LEARN group contains Wiki, Notes, 3D Lab (3 items) | unit | `bun test src/lib/routes.test.ts -t "learn"` | No -- Wave 0 |
| NAV-04 | PRACTICE group contains CampTrails, Review (2 items, in order) | unit | `bun test src/lib/routes.test.ts -t "practice"` | No -- Wave 0 |
| NAV-05 | DATA group contains Analytics (1 item) | unit | `bun test src/lib/routes.test.ts -t "data"` | No -- Wave 0 |
| NAV-08 | Group labels hidden when collapsed | manual-only | Visual verification in browser | N/A -- CSS behavior, not unit-testable |
| NAV-09 | Active route indicator works for all items | unit | `bun test src/lib/routes.test.ts -t "active"` | No -- Wave 0 |

### Sampling Rate
- **Per task commit:** `bun test src/lib/routes.test.ts --bail`
- **Per wave merge:** `bun test`
- **Phase gate:** Full suite green before verification

### Wave 0 Gaps
- [ ] `src/lib/routes.test.ts` -- covers NAV-01 through NAV-05 and NAV-09 (group structure, membership, order, standalone items)
- [ ] Verify `STATIC_PAGE_TITLES` and `getPageTitle()` remain unchanged after RouteConfig extension (regression test)

## Sources

### Primary (HIGH confidence)
- `src/lib/routes.ts` -- current RouteConfig interface, DASHBOARD_ROUTES array, SIDEBAR_NAVIGATION derivation (read directly)
- `src/components/shared/Sidebar.tsx` -- current sidebar rendering, SidebarItem component, collapse transition patterns (read directly)
- `src/lib/constants/routes.ts` -- ROUTES constant object (read directly)
- `src/components/ui/separator.tsx` -- existing Separator component using @base-ui/react (read directly)
- `CLAUDE.md` -- Campfire design system tokens, typography minimum 11px, transition maximum 300ms (read directly)
- `.planning/phases/02-grouped-navigation/02-CONTEXT.md` -- all user decisions (read directly)

### Secondary (MEDIUM confidence)
- GitHub, Supabase, Linear sidebar patterns -- referenced as design benchmarks from direct product usage knowledge
- Phosphor Icons library -- GearSix icon already used for Settings in current DASHBOARD_ROUTES

### Tertiary (LOW confidence)
- None -- all findings verified from source code

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- zero new dependencies, all verified from package.json and existing imports
- Architecture: HIGH -- data model extension is a minimal addition to existing RouteConfig; rendering change is contained to one component
- Pitfalls: HIGH -- all identified from reading actual source code and tracing data flow through routes.ts -> Sidebar.tsx
- Validation: MEDIUM -- bun:test exists in project but no existing tests for routes.ts; Wave 0 gap identified

**Research date:** 2026-03-21
**Valid until:** 2026-04-21 (stable domain, no external dependency changes expected)
