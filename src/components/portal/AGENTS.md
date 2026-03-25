<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-25 -->

# portal

## Purpose

Shared portal shell components used by the admin, CEO, and developer portals. Provides a consistent layout pattern (topbar + sidebar + content area) with configurable accent colors, nav groups, and optional right rail. Each portal passes its own config to these generic shell components rather than building bespoke layouts.

## Key Files

| File | Description |
|------|-------------|
| `PortalLayout.tsx` | Main layout shell: composes PortalTopbar, PortalSidebar, MobileNav, and content area with optional right rail. Accepts `portalLabel`, `topbarBg`, `accentColor`, `accentLightColor`, `navItems` props. Server component. |
| `PortalSidebar.tsx` | Left sidebar with grouped nav items, collapsible sections, search filter, pathname-based active state, badge counts. Accepts accent color props for portal-specific theming. `'use client'` |
| `PortalTopbar.tsx` | Top navigation bar with portal label, accent background, optional right content slot, optional search component, and back navigation link. |
| `MobileNav.tsx` | Mobile-responsive navigation drawer for small viewports. Renders nav items in a sheet overlay. `'use client'` |
| `CommandPalette.tsx` | Cmd+K command palette for portal-wide search. Uses Fuse.js for fuzzy matching, recent pages from localStorage, component registry search. `'use client'` |
| `CodeBlock.tsx` | Syntax-highlighted code block with copy button. Used in developer portal documentation. |
| `CopyButton.tsx` | Clipboard copy button with visual feedback (checkmark on success). `'use client'` |
| `StickyTOC.tsx` | Sticky table of contents sidebar. Tracks scroll position, highlights active heading. `'use client'` |
| `index.ts` | Barrel exports for all components and their prop types. |

## Subdirectories

None. All portal components are flat in `src/components/portal/`.

## For AI Agents

### Working In This Directory

1. **Portal pattern.** Each portal (admin, CEO, developer) uses `PortalLayout` as its shell. Portal-specific config (colors, nav items, label) is passed as props from the portal's `layout.tsx`. Do NOT hardcode portal-specific values in these components.

2. **Accent color props.** `accentColor` and `accentLightColor` are CSS color strings (e.g., `'#1B3FC4'`, `'#EEF2FC'`). They are applied inline via `style` props for portal-specific theming. Each portal defines its own accent pair.

3. **NavGroup structure.** Navigation is defined as `NavGroup[]` where each group has a `label` and `items: NavItem[]`. Each NavItem has `label`, `href`, optional `icon`, optional `children`, and optional `badge` count. This structure is consistent across all portals.

4. **Lucide icons.** Unlike the main dashboard sidebar (which uses Phosphor), the portal sidebar uses Lucide icons (`lucide-react`). This is intentional for the portal context.

5. **Type exports.** The `index.ts` barrel exports both components and their prop types. When consuming from outside, import from `@/components/portal`.

### Common Patterns

**Portal layout usage in a portal's layout.tsx:**
```tsx
import { PortalLayout } from '@/components/portal'

const AdminLayout = ({ children }) => (
  <PortalLayout
    portalLabel="Admin"
    topbarBg="bg-[#1A2332]"
    accentColor="#1B3FC4"
    accentLightColor="#EEF2FC"
    navItems={ADMIN_NAV_GROUPS}
    backHref="/dashboard"
    backLabel="Dashboard"
  >
    {children}
  </PortalLayout>
)
```

## Dependencies

### Internal

| Module | Purpose |
|--------|---------|
| `@/lib/utils` | cn() for class merging |
| `@/components/ui/command` | CommandDialog, CommandInput, CommandList for CommandPalette |
| `@/components/ui/badge` | Badge for nav item counts |
| `@/lib/developer/componentRegistry` | Component registry for CommandPalette search |

### External

| Package | Usage | Version |
|---------|-------|---------|
| **react** | Hooks: useState, useEffect, useCallback, useMemo | ^19.2.4 |
| **next/link** | Client-side navigation | 16.1.6 |
| **next/navigation** | usePathname, useRouter | 16.1.6 |
| **lucide-react** | Icons: Search, Clock, ChevronLeft | ^0.577.0 |
| **fuse.js** | Fuzzy search in CommandPalette | latest |

<!-- MANUAL: -->
