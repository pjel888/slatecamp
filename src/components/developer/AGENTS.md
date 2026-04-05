<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-25 -->

# developer

## Purpose

UI components for the SlateCamp Developer Portal -- an internal documentation and design system reference hub. Provides component page layouts (preview + props table + code), system status monitoring, breadcrumb navigation, and KPI displays. Uses the PortalLayout shell from `@/components/portal`.

## Key Files

| File | Description |
|------|-------------|
| `ComponentPageLayout.tsx` | Main layout for individual component documentation pages. Three-tab interface: Preview, Props (table), Code (snippet). Shows title, description, domain badge, status badge, import path, file path. `'use client'` |
| `PreviewArea.tsx` | Sandboxed preview container for rendering component demos with consistent padding and background. |
| `DocSection.tsx` | Reusable documentation section with title and content area. Used for grouping related docs. |
| `Breadcrumbs.tsx` | Breadcrumb navigation trail for developer portal pages. |
| `StatusBanner.tsx` | Full-width system health banner. Computes worst-case status from array of service statuses (operational/degraded/outage). Color-coded: green/amber/red. Server component. |
| `StatusBadge.tsx` | Individual service status indicator badge with color and icon. |
| `StatusKPICard.tsx` | Key performance indicator card for system metrics (uptime, response time, error rate). |
| `UptimeBar.tsx` | Visual uptime history bar showing operational periods vs. incidents over time. |

## Subdirectories

None. All developer components are flat in `src/components/developer/`.

## For AI Agents

### Working In This Directory

1. **Developer types from `@/types/developer`.** Types like `PropsTableEntry`, `ServiceStatus` are defined in `@/types/developer`. Do NOT duplicate.

2. **Component registry.** ComponentPageLayout works with the component registry from `@/lib/developer/componentRegistry` for metadata (domain labels, component listings, status).

3. **Portal shell.** The developer portal uses `PortalLayout` from `@/components/portal` in its layout.tsx. These components render inside that shell.

4. **Shared documentation primitives.** ComponentPageLayout imports CopyButton from `@/components/portal`, CodeBlock from `@/components/shared/CodeBlock`, and PropTable from `@/components/developer/PropTable`. Check these paths before modifying.

5. **Status computation.** StatusBanner uses a `computeWorstStatus()` function to derive overall system health from individual service statuses. The priority order is: outage > degraded > operational.

6. **Lucide icons.** Developer portal components use Lucide icons (Check, AlertTriangle, X) rather than Phosphor.

## Dependencies

### Internal

| Module | Purpose |
|--------|---------|
| `@/types/developer` | PropsTableEntry, ServiceStatus types |
| `@/lib/developer/componentRegistry` | Component metadata and domain labels |
| `@/components/portal` | CopyButton for import-path actions |
| `@/components/shared/CodeBlock` | Shared code snippet renderer |
| `@/components/developer/PropTable` | Props table renderer |
| `@/components/ui/badge` | Badge for status and domain indicators |
| `@/lib/utils` | cn() for class merging |

### External

| Package | Usage | Version |
|---------|-------|---------|
| **react** | Hooks: useState | ^19.2.4 |
| **lucide-react** | Icons: Check, AlertTriangle, X | ^0.577.0 |

<!-- MANUAL: -->
