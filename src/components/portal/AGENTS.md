<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-25 | Updated: 2026-04-06 -->

# portal

## Purpose

Shared portal shell components used by the admin, CEO, and developer portals. Provides a consistent layout pattern (topbar + sidebar + content area) with configurable accent colors, nav groups, and optional right rail.

## Key Files

| File | Description |
|------|-------------|
| `PortalLayout.tsx` | Main layout shell: composes PortalTopbar, PortalSidebar, MobileNav, and content area with optional right rail |
| `PortalSidebar.tsx` | Left sidebar with grouped nav items, collapsible sections, search filter, pathname-based active state, and badge counts |
| `PortalTopbar.tsx` | Top navigation bar with portal label, accent background, optional right content slot, optional search component, and back navigation link |
| `MobileNav.tsx` | Mobile-responsive navigation drawer for small viewports |
| `CommandPalette.tsx` | Cmd+K command palette for portal-wide search. Uses Fuse.js for fuzzy matching plus recent pages from localStorage |
| `CodeBlock.tsx` | Syntax-highlighted code block with copy button |
| `CopyButton.tsx` | Clipboard copy button with visual feedback |
| `StickyTOC.tsx` | Sticky table of contents sidebar. Tracks scroll position and highlights the active heading |
| `index.ts` | Barrel exports for all components and their prop types |

## Subdirectories

None. All portal components are flat in `src/components/portal/`.

## For AI Agents

### Working In This Directory

1. **Portal pattern.** Each portal uses `PortalLayout` as its shell. Portal-specific config stays in the consuming portal.
2. **Accent color props.** `accentColor` and `accentLightColor` are CSS color strings passed from the portal layer.
3. **NavGroup structure.** Navigation is defined as `NavGroup[]` with grouped `NavItem[]` entries.
4. **Lucide icons.** The portal shell uses `lucide-react` rather than the dashboard’s Phosphor set.
5. **Type exports.** Prefer importing portal components and their prop types from `@/components/portal`.

## Dependencies

### Internal

| Module | Purpose |
|--------|---------|
| `@/lib/utils` | `cn()` for class merging |
| `@/components/ui/command` | Command primitives for `CommandPalette` |
| `@/components/ui/badge` | Badge for nav item counts |

### External

| Package | Usage | Version |
|---------|-------|---------|
| **react** | Hooks used across the shell | ^19.2.4 |
| **next/link** | Client-side navigation | 16.1.6 |
| **next/navigation** | `usePathname`, `useRouter` | 16.1.6 |
| **lucide-react** | Icons used by the shell | ^0.577.0 |
| **fuse.js** | Fuzzy search in `CommandPalette` | latest |

<!-- MANUAL: -->
