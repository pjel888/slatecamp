# Route Audit: /admin & /developer

> Companion to `.sisyphus/plans/design-system-cleanup.md` and `.sisyphus/audits/testing-wiki-route-audit.md`.

---

# PART 1: /admin — Complete Route Audit

## Route Tree

```
/admin
├── layout.tsx              — Auth gate (session + role check)
├── page.tsx                — Dashboard (stat cards, coverage alert, quick actions, activity)
├── error.tsx               — Error boundary
├── login/page.tsx          — Google OAuth sign-in
├── dashboard/page.tsx      — REDIRECT STUB → /admin
│
├── knowledge/              — PRIMARY content management hub
│   ├── page.tsx            — ContentEditorIndex (articles view)
│   ├── new/page.tsx        — UnifiedContentEditor (blank article)
│   ├── [id]/page.tsx       — UnifiedContentEditor (full article + questions + EI)
│   ├── questions/
│   │   ├── page.tsx        — ContentEditorIndex (questions view)
│   │   ├── new/page.tsx    — QuestionEditor (60/40 split)
│   │   └── [id]/page.tsx   — QuestionEditor (edit mode)
│   ├── import/page.tsx     — QuestionImporter (bulk CSV/JSON)
│   └── analytics/page.tsx  — Quality analytics (possibly stub)
│
├── taxonomy/
│   ├── page.tsx            — TaxonomyEditor (discipline → subject → topic tree)
│   └── coverage/page.tsx   — Coverage heatmap (color-coded by question count)
│
├── assets/
│   ├── page.tsx            — 3D Asset Manager
│   └── [id]/page.tsx       — Asset detail
│
├── 3d-models/
│   └── page.tsx            — ModelRegistryPage (read-only registry)
│
├── reviews/page.tsx        — SMEReviewQueue (approval queue)
├── pipeline/page.tsx       — Kanban: Draft → Review → Published
├── search/page.tsx         — Full-text content search
├── audit/page.tsx          — AuditLogViewer (super_admin only)
├── activity/page.tsx       — Pulse Feed (50 recent audit_logs)
├── settings/page.tsx       — Role management (super_admin only)
├── preview/[previewId]/page.tsx — Student-view article preview
│
└── REDIRECT STUBS (12+ files, legacy URLs):
    ├── articles/           → /admin/knowledge
    ├── questions/          → /admin/knowledge/questions
    └── content/            → /admin/knowledge
```

## Role Hierarchy

| Role | Permissions |
|------|-------------|
| `sme_reviewer` | View admin, review queue — read-only |
| `content_admin` | Full content CRUD (articles, questions, EI prompts, assets) |
| `super_admin` | Everything + user role management + audit log |

## Complete UX Journey

### 1. Auth Flow
```
/admin/login → Google OAuth → Supabase auth → /auth/callback?next=/admin/dashboard
→ /admin/dashboard (stub) → redirect → /admin (real dashboard)
```

### 2. Dashboard (`/admin`)
- Total articles/questions/assets stat cards
- Critical coverage gap alert (subjects with < 5 questions)
- Quick actions: New Article, New Question, Review Queue, Coverage Map
- Recent activity feed (last 10 audit_log entries)

### 3. Content Authoring (`/admin/knowledge`)

**Unified Content Editor** — three-panel layout:
```

/admin/knowledge/new or /admin/knowledge/[id]
├── Left Panel (280px)     — Article metadata, taxonomy, publish settings
│   ├── Title input
│   ├── Discipline/Subject/Topic selector
│   ├── Article type dropdown (Overview/Mastery)
│   ├── Tags input
│   ├── Publish status toggle
│   └── EI prompt editor (optional)
├── Center Panel (flex)    — Rich text editor (TipTap)
│   ├── Toolbar (headings, bold, italic, lists, links, images, code)
│   └── Content area (MDX rendering)
└── Right Panel (320px)    — Associated questions + EI preview
    ├── Questions tab (list, add, edit, delete)
    └── EI Preview tab (live prompt preview)
```

### 4. Taxonomy Management (`/admin/taxonomy`)

**Taxonomy Editor** — Drag-and-drop tree:
```
Discipline (e.g., "Architectural Design")
└── Subject (e.g., "Building Materials")
    └── Topic (e.g., "Concrete")
```

- Add/edit/delete nodes
- Drag to reorder
- Color-coded by coverage (red <5, yellow 5-20, green >20)

### 5. SME Review (`/admin/reviews`)

**Review Queue** — Pipeline view:
| Column | Contents |
|--------|----------|
| Pending | Questions awaiting review |
| In Review | Assigned to SME |
| Approved | Ready for publish |
| Rejected | Needs revision |

### 6. Coverage Map (`/admin/taxonomy/coverage`)

**Heatmap** — Subject × Question count:
- Color gradient: Red (0-4), Orange (5-19), Green (20+)
- Click to drill into subject → topics → questions
- Export to CSV

### 7. Asset Management (`/admin/assets`)

**3D Asset Manager** — Grid view:
- Upload 3D models (GLB/GLTF)
- Preview canvas
- Metadata: name, category, polygon count, file size
- Usage tracking (which articles use this asset)

### 8. Pipeline (`/admin/pipeline`)

**Kanban** — Content lifecycle:
```
Draft → In Review → Approved → Published
```

- Drag cards between columns
- Assign to SME
- Add notes
- Filter by discipline

---

# PART 2: /developer — Complete Route Audit

## Route Tree

```
/developer
├── layout.tsx                — Role gate (developer_only role required)
├── page.tsx                  — Portal home (hero + stats + quick actions)
├── error.tsx                 — Error boundary
├── not-found.tsx             — 404 page
│
├── design-system/
│   ├── page.tsx              — Domain overview grid (6 domains)
│   ├── wiki/[component]/page.tsx
│   ├── content-blocks/
│   │   ├── page.tsx          — Domain index
│   │   └── [component]/page.tsx
│   ├── questions/[component]/page.tsx
│   ├── shared/[component]/page.tsx
│   ├── testing-path/[component]/page.tsx
│   └── widgets/
│       ├── page.tsx          — Domain index
│       └── [component]/page.tsx
│
├── components/page.tsx       — LEGACY Component Library (renders ComponentShowcase monolith)
│
├── api-reference/page.tsx    — API docs (payment endpoints, webhooks)
├── architecture/page.tsx       — 5-tab architecture reference
│
├── status/
│   ├── page.tsx              — Status overview (MOCK DATA — not live)
│   ├── database/page.tsx
│   └── infrastructure/page.tsx
│
└── tools/
    ├── page.tsx              — Dev tools hub (4 cards)
    ├── console/page.tsx      — Feature flags + impersonation (LIVE Supabase)
    ├── db/page.tsx           — Database browser
    ├── logs/page.tsx         — Audit logs
    └── test-data/page.tsx    — Test data generator
```

## Portal Architecture

```
layout.tsx (role gate)
  └── DevPortalShell
       ├── PortalLayout (shared shell from @/components/portal)
       │    └── devNavItems (5 groups: Portal, Design System, Documentation, Status, Tools)
       └── DevPortalSearch → CommandPalette (Cmd+K, fuzzy search 129 components + 15 static pages)
```

## Portal Home Sections

1. Hero (title + description)
2. Section cards grid (Design System, System Status, Dev Tools) — live component count from `getAllComponents()`
3. System Health bar (Database, API, Auth, Cache — **hardcoded**, Cache shows "degraded")
4. Quick Actions (4 shortcuts)
5. Platform Metrics (6 stat cards — **all hardcoded**: "50 tables", "247 components", etc.)
6. Tech Stack table (10 rows, **hardcoded versions**)
7. Recent Changes from CHANGELOG (last 5 entries)

## Component Registry

**File:** `src/lib/developer/componentRegistry.ts`
**Total registered: 129 components** across 12 domains

| Domain | Registered | Has Detail Pages | Status |
|--------|-----------|-----------------|--------|
| `wiki` | 7 | Yes | Active |
| `content-blocks` | 13 | Yes | Active |
| `questions` | 5 | Yes | Active |
| `testing-path` | 6 | Yes | Active |
| `shared` | 8 | Yes | Active |
| `widgets` | 17 | Yes | Active |
| `notifications` | 5 | **No** | Orphaned in registry |
| `quiz-v2` | 13 | **No** | Orphaned in registry |
| `dashboard` | 7 | **No** | Orphaned in registry |
| `analytics` | 6 | **No** | Orphaned in registry |
| `trails` | 3 | **No** | Orphaned in registry |
| `flash` | 2 | **No** | Orphaned in registry |

**36 components registered but unreachable** via design-system pages (6 orphaned domains).

## ComponentShowcase.tsx (Being Deprecated)

- **File:** `src/app/developer/_components/ComponentShowcase.tsx`
- **Size:** 1,969 lines / 84.6 KB
- **Status:** Being replaced by `/developer/design-system/[domain]/[component]` pages
- **Migration:** Each domain now has dedicated index + detail pages; ComponentShowcase renders per-domain grids

## Dev Tools Live Integration

### 1. Console (`/developer/tools/console`)
- **Feature Flags:** Toggle features via `feature_flags` table
- **User Impersonation:** Enter user ID → session swap for testing
- **Auth:** Live Supabase connection

### 2. Database Browser (`/developer/tools/db`)
- **Tables:** Dropdown to select table
- **Data:** Paginated rows (50 per page)
- **Filters:** Column-based filtering
- **Export:** CSV download

### 3. Test Data Generator (`/developer/tools/test-data`)
- **Users:** Generate N test users
- **Sessions:** Generate N quiz sessions
- **Questions:** Generate N test questions per subject

---

# PART 3: Issues & Recommendations

## Admin Issues

1. **Dashboard stat cards** — Query runs on every page load, no caching
2. **Coverage alert** — Triggers on any subject <5 questions, noisy
3. **UnifiedContentEditor** — No autosave, risk of data loss
4. **Taxonomy drag-drop** — No optimistic updates, feels laggy
5. **Asset upload** — No progress indicator for large files
6. **Pipeline** — No filtering by discipline/date/assignee

## Developer Issues

1. **Portal home metrics** — All hardcoded, need live queries
2. **System health** — Mock data, not connected to real monitoring
3. **ComponentShowcase** — 1,969-line monolith, should be removed
4. **Component registry** — 36 orphaned entries, need cleanup
5. **Status dashboard** — Not connected to real status (mock)
6. **Design system pages** — No search within domain

## Recommendations

### High Priority

1. **Replace hardcoded metrics** with live Supabase queries
2. **Remove ComponentShowcase.tsx** — Fully migrate to design-system pages
3. **Add autosave** to UnifiedContentEditor (10-second interval)
4. **Connect status dashboard** to real monitoring endpoints
5. **Clean orphaned registry entries** — Remove 36 unreachable components

### Medium Priority

1. **Add search** to design-system domain pages
2. **Optimize dashboard queries** with 60-second cache
3. **Add filtering** to pipeline (discipline, date, assignee)
4. **Add upload progress** indicator for assets
5. **Implement optimistic updates** for taxonomy drag-drop

### Low Priority

1. **Add CSV export** to coverage map
2. **Add bulk actions** to SME review queue
3. **Add keyboard shortcuts** to content editor
4. **Add version history** for articles (audit log)
