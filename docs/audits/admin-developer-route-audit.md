# Route Audit: /admin & /developer

> Companion to `docs/plans/design-system-cleanup.md` and `docs/audits/testing-wiki-route-audit.md`.

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
|------|------------|
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
┌──────────────┬──────────────────────┬──────────────────┐
│   Outline    │   Article MDX Editor │  Questions +     │
│   Panel      │   (metadata, body,   │  EI Prompts      │
│   (headings  │    taxonomy links)   │  (CRUD inline)   │
│   + questions│                      │                  │
│   list)      │                      │                  │
└──────────────┴──────────────────────┴──────────────────┘
              SaveAllBar (batched parallel saves)
```

- `DirtyStateProvider` tracks: articleDirty, questionsDirty Map, eiPromptsDirty Map
- Save triggered by custom DOM event `unified-editor:save`
- Concurrent-edit conflict detection via `getArticleUpdatedAt` comparison
- `beforeunload` guard prevents accidental data loss

**Question Editor** — 60/40 split:
- Left: question form (stem, options, rationale, difficulty, taxonomy)
- Right: article reference pane (renders article content for context)

### 4. Publishing Workflow
```
draft → [editor saves] → review → [SME reviews at /admin/reviews] → published
```
Pipeline page (`/admin/pipeline`) visualizes as 3-column Kanban.

### 5. Taxonomy Management
- Tree editor: discipline → subject → topic CRUD
- Coverage heatmap: color-coded grid by question count per node

### 6. Admin Tools
- **Search**: Full-text search across all content
- **Asset Manager**: 3D model upload + listing
- **Model Registry**: Read-only 3D model registry viewer
- **Audit Log**: Full audit trail (super_admin only)
- **Activity Feed**: Recent CREATE/UPDATE/DELETE events
- **Settings**: Role assignment/revocation (super_admin only)
- **Preview**: Student-view article preview via `admin_draft_previews` table

## Key Components

| Component | File | Purpose |
|-----------|------|---------|
| `AdminShell` | `app/admin/_components/AdminShell.tsx` | Layout wrapper with nav + CommandPalette |
| `UnifiedContentEditor` | `components/admin/unified-editor/UnifiedContentEditor.tsx` | Three-panel article editor |
| `SaveAllBar` | `components/admin/unified-editor/SaveAllBar.tsx` | Batched parallel save with conflict detection |
| `DirtyStateProvider` | `components/admin/unified-editor/DirtyStateProvider.tsx` | Tracks unsaved changes |
| `ContentEditorIndex` | `components/admin/unified-editor/ContentEditorIndex.tsx` | Browse articles/questions |
| `TaxonomyEditor` | (inline in page.tsx) | Tree CRUD |
| `SMEReviewQueue` | (inline in page.tsx) | Approval workflow |

## Supabase Tables

`questions`, `wiki_articles`, `wiki_article_taxonomy`, `taxonomy_tree`, `audit_logs`, `user_roles`, `models_3d`, `admin_draft_previews`, `ei_prompts`, `feature_flags`

## Issues Found

1. **Double redirect on login**: `/admin/login` → `/admin/dashboard` → `/admin`. One hop unnecessary.
   - Files: `admin/login/page.tsx:22`, `admin/dashboard/page.tsx`

2. **Coverage map links break**: CoverageCell links to `/admin/content?node=<id>`, but `/admin/content` redirects to `/admin/knowledge` **dropping the query param**.
   - File: `admin/taxonomy/coverage/page.tsx:148`

3. **`dangerouslySetInnerHTML` on raw article content** in question editor — no sanitization.
   - Files: `admin/knowledge/questions/[id]/page.tsx:70`, `admin/knowledge/questions/new/page.tsx:66`

4. **Partial-save dirty state bug**: When article save succeeds but question saves fail, `articleDirty` is NOT reset. On retry, article saved unnecessarily twice.
   - File: `components/admin/unified-editor/SaveAllBar.tsx:347-350`

5. **12+ orphaned redirect stubs**: `/admin/articles/`, `/admin/questions/`, `/admin/content/` are pure redirects — nav doesn't link to them, only reachable via bookmarks/typed URLs.

6. **`knowledge/analytics/page.tsx` possibly a stub** — listed in nav but unverified content.

7. **10 dead admin components** identified in previous dead code audit (AdminMDXEditor, ApproveDialog, ArticlePreviewTab, ArticlePropertiesPanel, ComponentToolbar, QuestionPreviewPanel, RequestChangesDialog, CampModePreview, StormModePreview, AdminMDXEditorLoader).

8. **No cleanup for `admin_draft_previews`** — no TTL/cron to purge stale preview records.

## Happy Paths

| Path | Flow |
|------|------|
| Create new article | Dashboard → Quick Action "New Article" → UnifiedContentEditor → write MDX + add questions + EI prompts → Save All → Pipeline shows "Draft" |
| Edit existing article | Knowledge → click article row → UnifiedContentEditor → edit → Save All |
| Add questions to article | Knowledge/[id] → Questions panel → "Add Question" → fill form → Save All (batched) |
| Bulk import questions | Knowledge → Import → upload CSV/JSON → map columns → import |
| Review content | Reviews → SMEReviewQueue → click item → review → approve/request changes |
| Check coverage gaps | Taxonomy → Coverage → see heatmap → click low-coverage cell → navigate to content |
| Manage roles | Settings (super_admin) → assign/revoke roles |
| Preview article | Knowledge/[id] → "Preview" → `/admin/preview/[previewId]` (student view) |

---

# PART 2: /developer — Complete Route Audit

## Route Tree

```
/developer
├── layout.tsx                  — Role gate + env detection
├── page.tsx                    — Portal home (stats, health, quick actions, changelog)
├── error.tsx                   — Error boundary
├── not-found.tsx               — 404 page
│
├── design-system/
│   ├── page.tsx                — Domain overview grid (6 domains)
│   ├── wiki/[component]/page.tsx
│   ├── content-blocks/
│   │   ├── page.tsx            — Domain index
│   │   └── [component]/page.tsx
│   ├── questions/[component]/page.tsx
│   ├── shared/[component]/page.tsx
│   ├── testing-path/[component]/page.tsx
│   └── widgets/
│       ├── page.tsx            — Domain index
│       └── [component]/page.tsx
│
├── components/page.tsx         — LEGACY Component Library (renders ComponentShowcase monolith)
│
├── api-reference/page.tsx      — API docs (payment endpoints, webhooks)
├── architecture/page.tsx       — 5-tab architecture reference
│
├── status/
│   ├── page.tsx                — Status overview (MOCK DATA — not live)
│   ├── database/page.tsx
│   └── infrastructure/page.tsx
│
└── tools/
    ├── page.tsx                — Dev tools hub (4 cards)
    ├── console/page.tsx        — Feature flags + impersonation (LIVE Supabase)
    ├── db/page.tsx             — Database browser
    ├── logs/page.tsx           — Audit logs
    └── test-data/page.tsx      — Test data generator
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
- **Only consumer:** `/developer/components/page.tsx`
- Live-renders ~30+ UI primitives (Button, Badge, Card, Skeleton, Dialog, QuestionCard, DataTable, etc.)
- Being replaced by per-domain detail pages + Storybook

## What Stays vs What Gets Deprecated

| Item | Status | Reason |
|------|--------|--------|
| `/developer/components/page.tsx` | **DEPRECATED** | Replaced by Storybook |
| `ComponentShowcase.tsx` (1,969 LOC) | **DEPRECATED** | Only consumer is deprecated page |
| "Component Library" nav entry | **DEPRECATED** | Remove from DevPortalShell + DevPortalSidebar |
| `/developer/design-system/*` | **STAYS** (or migrates to Storybook) | Per-component detail pages |
| `/developer/api-reference` | **STAYS** | API documentation |
| `/developer/architecture` | **STAYS** | Architecture reference |
| `/developer/status/*` | **STAYS** | Health monitoring (note: mock data) |
| `/developer/tools/*` | **STAYS** | All 4 dev tools |
| `componentRegistry.ts` | **STAYS** | Search index + metadata source |
| `DevPortalSearch` + `CommandPalette` | **STAYS** | Cmd+K search |

## Issues Found

1. **ComponentShowcase.tsx is 1,969 lines** — monolith only consumed by one page being deprecated.

2. **Portal home stats are hardcoded**: "247 Components" (line 59) should use `getAllComponents().length` (currently 129). "50 tables", "26K LOC" also stale.

3. **Status dashboard uses mock data** (`@/lib/mocks/status`) — shows "live-looking" KPIs that are static.

4. **36 orphaned registry entries** — 6 domains registered in `componentRegistry.ts` but have no design-system detail pages.

5. **`DevPortalSidebar.tsx` appears superseded** by `DevPortalShell.tsx`'s nav — potential dead code.

6. **`CodeBlock.tsx` duplication** — exists in both `_components/CodeBlock.tsx` and `components/portal/CodeBlock.tsx`.

7. **CHANGELOG is hardcoded** in `src/lib/developer/changelog.ts` (8 entries) — not derived from git.

## Happy Paths

| Path | Flow |
|------|------|
| Browse design system | Portal home → "Design System" card → domain grid → click domain → component detail (Preview/Props/Code tabs) |
| Search for component | Cmd+K → type name → fuzzy match → click result → component detail page |
| Check API docs | Portal home → API Reference → tabbed endpoint cards with cURL examples |
| View architecture | Portal home → Architecture → 5 tabs (Tech Stack, Database, Auth, Data Flow, Deployment) |
| Check system status | Portal home → Status → KPI cards + 30-day uptime bars (NOTE: mock data) |
| Toggle feature flags | Portal home → Tools → Console → toggle feature flags (live Supabase) |
| Generate test data | Portal home → Tools → Test Data → generate mock sessions |

---

# Cross-Route Findings: Admin ↔ Developer

| Issue | Details |
|-------|---------|
| **Shared CommandPalette** | Both admin (`AdminShell`) and developer (`DevPortalShell`) use `CommandPalette` from `@/components/portal` — same base component, different search data |
| **Shared PortalLayout** | Both use `PortalLayout` from `@/components/portal` — good reuse |
| **Admin 3D Models → Developer Architecture** | Admin's model registry imports from `3d-lab/_config/` (boundary violation noted in cleanup plan Part D) |
| **Feature flags** | Console tool in `/developer/tools/console` reads `feature_flags` table; Admin's API route at `/api/admin/flags` also manages flags |
| **Audit logs** | Admin has both `/admin/audit` (super_admin, full viewer) and `/admin/activity` (all admins, feed view). Developer has `/developer/tools/logs` (audit logs). Three views of same data. |

---

## How to Resume

```
@docs/plans/design-system-cleanup.md Execute the cleanup plan
@docs/audits/testing-wiki-route-audit.md Testing + Wiki route reference
@docs/audits/admin-developer-route-audit.md Admin + Developer route reference
```
