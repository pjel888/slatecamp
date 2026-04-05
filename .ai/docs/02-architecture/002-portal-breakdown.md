# Portal Breakdown

**Status:** Active  
**Version:** 1.0  
**Last Updated:** 2026-04-06  
**Source-of-Truth:** `src/app/*/AGENTS.md`, directory listings of each portal

---

## Dashboard Portal

**Route:** `/dashboard`  
**Pages:** 33  
**Auth:** Supabase session (required)  
**AGENTS.md:** `src/app/dashboard/AGENTS.md`

### Route Structure

```
dashboard/
├── wiki/                  # Knowledge Wiki — expert-linked articles
├── testing/              # Testing Hub — 7 quiz modes
├── analytics/            # Analytics — 8 visualizations
├── camptrails/           # Camp Trails — learning paths
├── notes/                # Notes — Tiptap rich text editor
├── 3d-lab/               # 3D Lab — spatial learning modules
├── assessment/           # Assessment — readiness benchmark
└── settings/             # User settings
```

### Key Features
- Readiness Score dashboard (IRT-based)
- Taxonomy Heatmap
- Pacing Gauge
- 7 Testing modes: Camp, Storm, Chill, Custom, Focus Review, Simulation, Endurance, Subject
- 3D spatial learning modules (React Three Fiber)
- Construction calculators: CHB, drywall, flooring, paint
- Wiki with expert-linked content
- Notes with Tiptap rich text editor

### Navigation
- Sidebar with groups: `learn` (Wiki, Notes, 3D Lab), `practice` (CampTrails, Review), `data` (Analytics)
- Route constants: `src/lib/constants/routes.ts`
- Sidebar nav: `src/lib/sidebar-constants.ts`

### Components
- 58 dashboard-specific components in `src/components/dashboard/`
- Shared sidebar/header in `src/components/dashboard/`

---

## Admin Portal

**Route:** `/admin`  
**Pages:** 27  
**Auth:** Admin role required  
**AGENTS.md:** `src/app/admin/AGENTS.md`

### Route Structure

```
admin/
├── articles/              # Wiki article CRUD
├── questions/            # Question CRUD + import
├── taxonomy/             # Taxonomy editor
├── coverage/             # Coverage map
├── publish/              # Publishing pipeline
├── reviews/              # SME review queue
├── audit-logs/           # Audit log viewer
└── assets/                # Asset uploads
```

### Key Features
- Articles CRUD (wiki content management)
- Questions CRUD with batch import
- Taxonomy editor (subject → topic → subtopic hierarchy)
- Coverage map (content coverage analysis)
- Publishing pipeline (draft → review → published)
- SME review queue (subject matter expert workflow)
- Audit logs (content change history)

### Components
- Admin-specific components in `src/components/admin/`

---

## CEO Portal

**Route:** `/ceo` (nested under `(protected)` route group)  
**Pages:** 4  
**Auth:** `ceo` or `super_admin` role required  
**AGENTS.md:** `src/app/(protected)/ceo/AGENTS.md`

### Route Structure

```
ceo/ (in src/app/(protected)/)
├── command-center/        # MRR/ARR, Command Center
├── financials/            # P&L, Financial reports
├── behavioral/            # Behavioral insights
└── team/                  # Team management
```

### Key Features
- Command Center (MRR/ARR metrics)
- Financial reports (P&L)
- Behavioral insights (user engagement patterns)
- Team management

### Note
CEO portal is nested under `(protected)` route group — route path is `src/app/(protected)/ceo/`, not `src/app/ceo/`.

---

## Developer Portal

**Route:** `/developer`  
**Pages:** 21  
**Auth:** Authenticated OR `ALLOW_DEV_PORTAL_BYPASS` env var  
**AGENTS.md:** `src/app/developer/AGENTS.md`

### Route Structure

```
developer/
├── design-system/         # Design system catalog
├── api-reference/         # API reference docs
├── architecture/         # Architecture documentation
├── tools/                 # Developer tools
├── status/                # Status dashboard
└── ...
```

### Key Features
- Design System Catalog (Campfire tokens, component inventory)
- API Reference (server actions, query modules)
- Architecture Docs
- Developer Tools
- Status Dashboard (service health, deployment status)

---

## Shared Portal Pattern

All portals (Admin, CEO, Developer) use `PortalLayout` from `@/components/portal`:

```tsx
// Each portal uses PortalLayout with its own config
import { PortalLayout } from '@/components/portal'
import { portalConfig } from '@/config/portals'

export default function AdminLayout({ children }) {
  return (
    <PortalLayout config={portalConfig.admin}>
      {children}
    </PortalLayout>
  )
}
```

Configurations centralized in `@/config/portals`.

---

## Authentication Comparison

| Portal | Session | Role Check | Bypass |
|--------|---------|-----------|--------|
| Dashboard | Supabase middleware | Session required | No |
| Admin | Supabase middleware | `admin` role | No |
| CEO | Supabase middleware | `ceo` or `super_admin` | No |
| Developer | Supabase middleware | Authenticated | `ALLOW_DEV_PORTAL_BYPASS=true` |

---

## Related Documents

- `02-architecture/001-system-architecture.md` — Overall system architecture
- `02-architecture/003-database-schema.md` — Database reference
- `02-architecture/004-api-reference.md` — API routes
