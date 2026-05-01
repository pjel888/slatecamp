# Sidebar Navigation Polish Context Snapshot

## Task statement
Improve the main application sidebar navigation UI without changing SlateCamp visual identity. Remove Drills and 3D Lab sub-items from the main sidebar, lock icon x-position across expanded/collapsed states, remove jitter/layout shift, normalize spacing/dividers, preserve font/icon sizes and brand style, and verify accessibility basics.

## Desired outcome
- Main sidebar contains only top-level navigation rows.
- Icons remain at identical horizontal positions in expanded and collapsed desktop states.
- Expanded mode shows icon + label; collapsed mode shows icon-only rows with tooltips/accessibility labels.
- Spacing, row heights, divider insets, header/footer alignment, and active/hover/focus states are visually consistent.
- Existing routes and navigation behavior remain intact.

## Known facts/evidence
- Main desktop sidebar implementation is in src/components/sidebar/Sidebar.tsx, SidebarNavItem.tsx, SidebarHeader.tsx, SidebarFooter.tsx, sidebar-constants.ts, and types.ts.
- Current constants define collapsed width 52, expanded width 256, padding 6, nav item height 32, and a 40px icon slot.
- Current nav config includes children under 3d-lab and testing (Drills), and SidebarNavItem renders those children only when expanded.
- Current desktop nav shell already uses semantic nav aria-label Main navigation and aria-current page on active primary links.
- Mobile drawer currently renders primary items only from groups and does not render children.

## Constraints
- Preserve SlateCamp design tokens, visual identity, font sizes, icon sizes, icon set, and App Router patterns.
- Use Bun for validation scripts.
- Do not touch unrelated pre-existing work in the dirty tree.
- Shared sidebar UI has broad blast radius; keep changes focused.
- GitNexus MCP tools were not exposed by tool discovery; use available repo/code inspection plus validation instead.

## Unknowns/open questions
- Whether there are existing visual test routes or Storybook stories for this sidebar; inspect package scripts and current tests before choosing verification.
- Whether the app can run locally in this environment for screenshot checks.

## Likely codebase touchpoints
- src/components/sidebar/types.ts
- src/components/sidebar/sidebar-constants.ts
- src/components/sidebar/Sidebar.tsx
- src/components/sidebar/SidebarNavItem.tsx
- src/components/sidebar/SidebarHeader.tsx
- src/components/sidebar/SidebarFooter.tsx
