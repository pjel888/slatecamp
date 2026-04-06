<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-25 | Updated: 2026-04-06 -->

# developer

## Purpose

UI components for the SlateCamp Developer Portal. This folder now holds only the live status and breadcrumb primitives that still power `/developer/status*` and related developer pages.

## Key Files

| File | Description |
|------|-------------|
| `Breadcrumbs.tsx` | Breadcrumb navigation trail for developer portal pages |
| `StatusBanner.tsx` | Full-width system health banner that computes worst-case status from service states |
| `StatusBadge.tsx` | Individual service status indicator badge with color and icon |
| `StatusKPICard.tsx` | Key performance indicator card for system metrics |
| `UptimeBar.tsx` | Visual uptime history bar showing operational periods vs. incidents over time |

## Subdirectories

None. All live developer components are flat in `src/components/developer/`.

## For AI Agents

### Working In This Directory

1. **Developer types from `@/types/developer`.** Types like `ServiceStatus` live there. Do not duplicate them locally.
2. **Portal shell.** These components render inside the Developer Portal’s `PortalLayout`.
3. **Breadcrumb labels stay local.** `Breadcrumbs.tsx` owns its segment-to-label mapping, but it should render through the shared `@/components/shared/breadcrumb` primitive instead of maintaining parallel markup.
4. **Status computation.** `StatusBanner` derives overall health using the priority order `outage > degraded > operational`.
5. **Status icon family.** Keep the status primitives consistent with their current icon set instead of mixing in a second icon language ad hoc.

## Dependencies

### Internal

| Module | Purpose |
|--------|---------|
| `@/types/developer` | Developer status types |
| `@/components/ui/badge` | Badge for status display |
| `@/lib/utils` | `cn()` for class merging |

### External

| Package | Usage | Version |
|---------|-------|---------|
| **react** | Hooks where needed | ^19.2.4 |
| **lucide-react** | Status icons | ^0.577.0 |

<!-- MANUAL: -->
