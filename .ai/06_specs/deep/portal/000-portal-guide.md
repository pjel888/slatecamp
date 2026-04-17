# Portal Architecture

**Analysis Date:** 2026-04-06

## Overview

SlateCamp has 4 distinct portals, each serving a different audience. All portals share the same codebase, Supabase database, and design system, but have isolated route groups, layouts, and authentication contexts.

**Source:** `src/app/AGENTS.md`, `src/config/portals.ts`

## Portal Summary

| Portal | Route Prefix | Audience | Pages | Auth |
|--------|-------------|----------|-------|------|
| **Dashboard** | `/dashboard` | Students | 33 | Supabase session |
| **Admin** | `/admin` | Content managers | 27 | `canReviewContent()` role |
| **CEO** | `/ceo` | Business team | 4 | `ceo` or `super_admin` role |
| **Developer** | `/developer` | Engineering team | 21 | Auth or `ALLOW_DEV_PORTAL_BYPASS` |

## Shared Infrastructure

### PortalLayout

All non-dashboard portals use `PortalLayout` from `@/components/portal`:
- Topbar with portal branding and accent color
- Sidebar navigation
- Command palette
- Code block renderer

```typescript
// src/config/portals.ts
interface PortalConfig {
  key: PortalKey;
  name: string;
  accentColor: string;
  navItems: NavItem[];
  badge?: string;
}
```

**Source:** `src/components/portal/`, `src/config/portals.ts`

### Authentication

| Portal | Auth Method |
|--------|-------------|
| Dashboard | Supabase session via middleware |
| Admin | `canReviewContent()` checks `profiles.role` |
| CEO | `assertCeoRole()` verifies `profiles.role === 'ceo' \| 'super_admin'` |
| Developer | Supabase session or `ALLOW_DEV_PORTAL_BYPASS` env var |

**Source:** `src/lib/admin/roles.ts`, `src/lib/queries/ceo/auth.ts`

## Route Structure

```
src/app/
├── dashboard/              # Student portal (33 pages)
│   ├── 3d-lab/
│   ├── analytics/
│   ├── area-c/
│   ├── assessment/
│   ├── camptrails/
│   ├── focus-review/
│   ├── notes/
│   ├── proof-simulation/
│   ├── review/
│   ├── score-reveal/
│   ├── settings/
│   ├── testing/
│   ├── trails/
│   ├── upgrade/
│   ├── welcome-pro/
│   └── wiki/
├── admin/                  # Admin portal (27 pages)
│   ├── knowledge/
│   ├── taxonomy/
│   ├── reviews/
│   ├── audit/
│   └── assets/
├── (protected)/ceo/         # CEO portal (4 pages, nested!)
│   └── [pages]
└── developer/             # Developer portal (21 pages)
    ├── api-reference/
    ├── architecture/
    ├── components/
    ├── design-system/
    ├── status/
    └── tools/
```

**Note:** CEO portal is nested under `(protected)/` route group, not a top-level `ceo/` segment.

**Source:** `src/app/AGENTS.md` (portal architecture)

## Portal-Specific Styling

Each portal has its own accent color in the `PortalLayout`:
- **Admin:** Camp Cobalt (`#1B3FC4`)
- **CEO:** Emerald (`#2D9F6F`)
- **Developer:** Camp Cobalt with developer-specific branding

**Source:** `src/config/portals.ts`, `src/components/portal/`

---

*Portal architecture: 2026-04-06*
