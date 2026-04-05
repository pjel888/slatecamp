# Developer Portal

**Analysis Date:** 2026-04-06

## Overview

Internal Developer Portal for the SlateCamp engineering team. Provides documentation, API reference, architecture guides, a live design system catalog, system status monitoring, and developer tools.

**Route:** `/developer`
**Access:** Authenticated user OR `ALLOW_DEV_PORTAL_BYPASS` env var
**Source:** `src/app/developer/AGENTS.md`

## Page Count

21 pages across api-reference, architecture, components, design-system, status, and tools directories.

## Portal Shell

Uses `DevPortalShell` which wraps `PortalLayout` with developer-specific branding:
- Environment badge (development / staging / production)
- Navigation from `@/config/portals`
- Monospace styling for data values

**Source:** `src/app/developer/layout.tsx`, `src/components/portal/`, `src/config/portals.ts`

## Access Control

```typescript
// src/app/developer/layout.tsx
// Authentication check or ALLOW_DEV_PORTAL_BYPASS env var
// Environment detection: development / staging / production
```

**Source:** `src/app/developer/layout.tsx`

## Portal Home (`/developer`)

Landing page with:
- Section cards: Design System, System Status, Dev Tools
- System health status dots
- Platform metrics: 50 tables, 11 API routes, 247 components, 89 RLS policies
- Tech stack table
- Recent changelog

**Source:** `src/app/developer/page.tsx`

## Design System Catalog

Live component previews organized by domain:

| Category | Route | Components |
|----------|-------|------------|
| content-blocks | `/developer/design-system/content-blocks/[component]` | Article layouts, callouts, tables |
| questions | `/developer/design-system/questions/[component]` | Quiz question components |
| shared | `/developer/design-system/shared/[component]` | Buttons, inputs, cards |
| testing-path | `/developer/design-system/testing-path/[component]` | Mode selection, session UI |
| widgets | `/developer/design-system/widgets/[component]` | Special widgets |
| wiki | `/developer/design-system/wiki/[component]` | Wiki-specific components |

Preview data from `_previews.tsx` or `_widget-previews.tsx` files in each category directory.

**Source:** `src/app/developer/design-system/`, `src/app/developer/_components/`

## Component Registry

`@/lib/developer/componentRegistry` exports `getAllComponents()` for catalog data:
- Component count
- Metadata per component
- Preview configurations

**Source:** `src/lib/developer/componentRegistry.ts`

## Changelog

`@/lib/developer/changelog` exports `CHANGELOG` array for recent changes display.

**Source:** `src/lib/developer/changelog.ts`

## API Reference

`/developer/api-reference/` — Documents all API endpoints with:
- Request/response schemas
- Authentication requirements
- Example payloads

**Source:** `src/app/developer/api-reference/`

## Architecture Docs

`/developer/architecture/` — System diagrams, data flow, component relationships.

**Source:** `src/app/developer/architecture/`

## System Status

| Route | Purpose |
|-------|---------|
| `/developer/status` | Overview with health indicators |
| `/developer/status/database` | Database health and metrics |
| `/developer/status/infrastructure` | Infrastructure monitoring |

**Source:** `src/app/developer/status/`

## Dev Tools

| Route | Tool |
|-------|------|
| `/developer/tools` | Hub page |
| `/developer/tools/console` | Interactive console (client-side execution) |
| `/developer/tools/db` | Database inspection |
| `/developer/tools/logs` | Log viewer |
| `/developer/tools/test-data` | Test data generation |

**Source:** `src/app/developer/tools/`

## Large Files

| File | Size | Purpose |
|------|------|---------|
| `ComponentShowcase.tsx` | 84K | Full component library preview |
| `components/page.tsx` | 49K | Component documentation page |

These are intentionally large as they document the entire component library.

**Source:** `src/app/developer/_components/ComponentShowcase.tsx`

## Shared Components

| Component | Purpose |
|-----------|---------|
| `CopyButton` | Copy-to-clipboard button |
| `DevBadge` | Environment/version badge |
| `DevPortalSearch` | Search across docs |
| `DevPortalShell` | Portal layout wrapper |
| `DevPortalSidebar` | Navigation sidebar |
| `EndpointCard` | API endpoint display |
| `PropTable` | Component props documentation |
| `TableOfContents` | Page navigation |

**Source:** `src/app/developer/_components/` (10 files)

---

*Developer portal: 2026-04-06*
