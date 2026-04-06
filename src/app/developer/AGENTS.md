<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-25 | Updated: 2026-04-06 -->

# developer

## Purpose

Internal Developer Portal for the SlateCamp engineering team. Provides operational docs, architecture guides, API reference, system status monitoring, and developer tools (feature flags, user impersonation, test data generation, console, logs). Reusable component documentation lives in Storybook rather than a parallel in-app component-library surface.

## Key Files

| File | Description |
|------|-------------|
| `layout.tsx` | Portal layout -- verifies auth (or bypass env var), determines environment, wraps children in `DevPortalShell` |
| `page.tsx` | Portal home -- section cards, system health status, quick actions, platform metrics, tech stack table, recent changelog |
| `error.tsx` | Error boundary for developer portal |
| `loading.tsx` | Skeleton loading state |
| `not-found.tsx` | 404 page for developer portal |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `_components/` | Shared portal shell, navigation, and search components |
| `api-reference/` | API reference page -- documents all API endpoints with request/response schemas |
| `architecture/` | Architecture overview page -- system diagrams, data flow, component relationships |
| `components/` | Legacy empty route residue -- do not revive as a second component-library destination |
| `status/` | System status overview |
| `status/database/` | Database health and metrics |
| `status/infrastructure/` | Infrastructure status monitoring |
| `tools/` | Dev tools hub page |
| `tools/console/` | Interactive console with client-side execution |
| `tools/db/` | Database inspection tool |
| `tools/logs/` | Log viewer |
| `tools/test-data/` | Test data generation tool |

## For AI Agents

### Working In This Directory

- **Access control:** Authentication is checked in `layout.tsx`. Set `ALLOW_DEV_PORTAL_BYPASS=true` in env for local development without auth.
- **Environment detection:** Layout determines `development`/`staging`/`production` based on `ALLOW_DEV_PORTAL_BYPASS` and `NEXT_PUBLIC_APP_URL`.
- **Storybook ownership:** Do not add a second component-library destination under `/developer`. Reusable component docs belong in Storybook.
- **Developer portal ownership:** Operational docs, architecture guides, and API reference pages belong under `/developer`.
- **Changelog:** `@/lib/developer/changelog` exports `CHANGELOG` for the recent changes section.
- **Shell pattern:** `DevPortalShell` uses `PortalLayout` from `@/components/portal` with Developer-specific branding and navigation.
- **Shared primitives first:** Use `SectionHeader level=\"page\"` for top-level page headers and prefer `ActionCard`, `DataTable`, and `EmptyState` before creating developer-only wrappers.
- **This is an internal tool:** Design patterns can be more functional than the student-facing dashboard as long as they stay consistent.

## Testing Requirements

- Verify auth bypass works with `ALLOW_DEV_PORTAL_BYPASS=true`
- Confirm API reference content still renders
- Verify system status pages show real health data
- Test dev tools (console, DB inspector, test data generation, log viewer)
- Confirm environment badge shows correct environment

## Dependencies

### Internal

| Module | Purpose |
|--------|---------|
| `@/components/portal` | `PortalLayout` for developer portal shell |
| `@/config/portals` | Portal configuration |
| `@/lib/admin/roles` | `getUserRole` for access control |
| `@/lib/constants/routes` | Route constants for redirects and navigation |
| `@/lib/developer/changelog` | `CHANGELOG` array for recent changes |
| `@/components/shared/stat-card` | Metric display cards |
| `@/components/ui/card` | Card component with `variant="interactive"` |
| `@/components/ui/badge` | Status and count badges |

### External

| Package | Purpose |
|---------|---------|
| `lucide-react` | Icons used in the developer portal |

<!-- MANUAL: -->
