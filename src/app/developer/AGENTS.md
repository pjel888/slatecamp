<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-25 | Updated: 2026-03-25 -->

# developer

## Purpose

Internal Developer Portal for the SlateCamp engineering team. Provides documentation, API reference, architecture guides, a live design system catalog with component previews, system status monitoring, and developer tools (feature flags, user impersonation, test data generation, console, logs). Access requires authentication or the `ALLOW_DEV_PORTAL_BYPASS` environment variable. Uses its own `DevPortalShell` layout with portal-specific navigation.

## Key Files

| File | Description |
|------|-------------|
| `layout.tsx` | Portal layout -- verifies auth (or bypass env var), determines environment (development/staging/production), wraps children in `DevPortalShell` |
| `page.tsx` | Portal home -- section cards (Design System, System Status, Dev Tools), system health status dots, quick actions, platform metrics (50 tables, 11 API routes, 247 components, 89 RLS policies), tech stack table, recent changelog |
| `error.tsx` | Error boundary for developer portal |
| `loading.tsx` | Skeleton loading state |
| `not-found.tsx` | 404 page for developer portal |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `_components/` | 10 shared components: ComponentShowcase (84K), CopyButton, DevBadge, DevPortalSearch, DevPortalShell, DevPortalSidebar, EndpointCard, PropTable, TableOfContents |
| `api-reference/` | API reference page -- documents all API endpoints with request/response schemas |
| `architecture/` | Architecture overview page -- system diagrams, data flow, component relationships |
| `components/` | Component documentation page (49K) -- full inventory of all platform components |
| `design-system/` | Live design system catalog with domain-organized previews |
| `design-system/content-blocks/` | Content block component previews with `[component]` dynamic route |
| `design-system/questions/` | Question component previews with `[component]` dynamic route |
| `design-system/shared/` | Shared component previews with `[component]` dynamic route |
| `design-system/testing-path/` | Testing path component previews with `[component]` dynamic route |
| `design-system/widgets/` | Widget component previews with `[component]` dynamic route |
| `design-system/wiki/` | Wiki component previews with `[component]` dynamic route |
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
- **Design system catalog:** The design system section uses domain-organized categories (content-blocks, questions, shared, testing-path, widgets, wiki), each with a `[component]` dynamic route for individual component preview pages. Preview data comes from `_previews.tsx` files in each category directory.
- **Component registry:** `@/lib/developer/componentRegistry` provides `getAllComponents()` for the component count and catalog data.
- **Changelog:** `@/lib/developer/changelog` exports `CHANGELOG` array for the recent changes section.
- **Shell pattern:** `DevPortalShell` uses `PortalLayout` from `@/components/portal` with Developer-specific branding and navigation from `@/config/portals`.
- **This is an internal tool** -- it is not user-facing. Design patterns can be more functional/utilitarian than the student-facing dashboard.
- **Large files:** `ComponentShowcase.tsx` (84K) and `components/page.tsx` (49K) are intentionally large as they document the entire component library.

### Testing Requirements

- Verify auth bypass works with `ALLOW_DEV_PORTAL_BYPASS=true`
- Confirm design system component previews render correctly for each category
- Test API reference endpoint documentation accuracy
- Verify system status page shows real health data
- Test dev tools (console, DB inspector, test data generation, log viewer)
- Confirm environment badge shows correct environment

### Common Patterns

- **Dynamic component routes:** `design-system/[category]/[component]/page.tsx` pattern for individual component docs
- **Preview files:** `_previews.tsx` or `_widget-previews.tsx` files export preview configurations for design system categories
- **Status dots:** Color-coded operational/degraded indicators (`bg-emerald-500` / `bg-amber-500`)
- **Monospace for data:** Tech stack versions, metrics, and code use `font-[family-name:var(--font-dm-mono)]`

## Dependencies

### Internal

| Module | Purpose |
|--------|---------|
| `@/components/portal` | `PortalLayout` for developer portal shell |
| `@/config/portals` | Portal configuration (colors, navigation) |
| `@/lib/admin/roles` | `getUserRole` for access control |
| `@/lib/constants/routes` | `ROUTES.DASHBOARD` for redirect |
| `@/lib/developer/changelog` | `CHANGELOG` array for recent changes |
| `@/lib/developer/componentRegistry` | `getAllComponents()` for component catalog |
| `@/components/shared/stat-card` | Metric display cards |
| `@/components/ui/card` | Card component with `variant="interactive"` |
| `@/components/ui/badge` | Status and count badges |

### External

| Package | Purpose |
|---------|---------|
| `lucide-react` | Icons (Palette, Activity, Wrench, Database, etc.) |

<!-- MANUAL: -->
