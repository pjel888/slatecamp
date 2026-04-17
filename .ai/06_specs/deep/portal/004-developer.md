# Developer Portal

**Analysis Date:** 2026-04-06

## Overview

The Developer Portal is the internal destination for operational docs, architecture guides, API reference material, status dashboards, and engineering tools.

- Route: `/developer`
- Access: authenticated user or `ALLOW_DEV_PORTAL_BYPASS=true`
- Source: `src/app/developer/AGENTS.md`

Reusable component documentation does not live here. The canonical reusable component docs surface is Storybook.

## Live Route Surface

The current `src/app/developer` tree contains `11` `page.tsx` routes across:

- `/developer`
- `/developer/api-reference`
- `/developer/architecture`
- `/developer/status`
- `/developer/status/database`
- `/developer/status/infrastructure`
- `/developer/tools`
- `/developer/tools/console`
- `/developer/tools/db`
- `/developer/tools/logs`
- `/developer/tools/test-data`

The `src/app/developer/components/` directory is only legacy empty route residue and should not be revived as a second component-library destination.

## Portal Ownership

- Storybook owns reusable component docs.
- `/developer` owns operational docs, architecture guides, and API reference pages.
- System status and developer tooling stay in `/developer`.

## Portal Shell

`src/app/developer/layout.tsx` wraps the route tree in `DevPortalShell`, which in turn uses the shared `PortalLayout` pattern with developer-specific branding and navigation.

## Home Page

`src/app/developer/page.tsx` is the landing page for:

- API reference access
- system status entry points
- developer tool entry points
- platform metrics
- recent changelog visibility

It now reuses shared primitives such as `SectionHeader`, `ActionCard`, `StatCard`, `Badge`, and `Card`.

## Status Surface

`/developer/status` and its child routes provide operational visibility for:

- database health
- infrastructure health
- top-level status summaries

The database and infrastructure routes now reuse shared `DataTable` and `EmptyState` primitives rather than duplicated developer-only wrappers.

## Tools Surface

`/developer/tools` and its child routes provide engineering workflows for:

- console access
- database inspection
- logs
- test data generation

## Supporting Modules

Key internal dependencies for the portal include:

- `@/components/portal`
- `@/components/shared/action-card`
- `@/components/shared/data-table`
- `@/components/shared/empty-state`
- `@/components/shared/section-header`
- `@/lib/constants/routes`
- `@/lib/developer/changelog`

## Governance Notes

- Do not add new reusable component docs under `/developer`.
- If a change is about component API documentation, add or update Storybook instead.
- If a change is about architecture, operations, status, or API contracts, keep it under `/developer`.

---

*Developer portal ownership reference: 2026-04-06*
