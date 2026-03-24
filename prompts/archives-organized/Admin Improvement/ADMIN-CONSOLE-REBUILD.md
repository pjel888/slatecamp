# SlateCamp Admin Console — Complete Rebuild Plan

> Give this file to Claude Code alongside:
> - `ADMIN-CONSOLE-PROTOTYPE.html` — Visual prototype
> - `CODEBASE-AUDIT-2026-03-24.md` — Codebase ground truth
> - `ADMIN-AUDIT-REPORT.md` — Admin-specific audit
>
> Read ALL files before writing any code.

---

## Context

SlateCamp's admin console at `/admin` currently has 13 routes managing questions, wiki articles, taxonomy, 3D assets, audit logs, and SME reviews. The UI was built piecemeal — each page has its own styling, layout patterns, and component choices. We're rebuilding it into a unified, professional content management system that shares the same architectural DNA as the `/developer` portal but with its own visual identity.

**What exists (preserve all functionality):**
- Admin login (Google OAuth)
- Dashboard with stats
- Question CRUD (list, create, edit, import)
- Wiki article CRUD (list, create, edit) — including MDX editor with CodeMirror + live preview
- Article CRUD (separate from wiki — list, create, edit)
- Taxonomy tree editor
- 3D asset manager
- Audit log viewer (super_admin only)
- SME review queue

**What we're adding (innovations):**
- Content Health Dashboard — visual overview of verification status across all content
- Question Quality Analytics — difficulty distribution, discrimination stats, coverage gaps
- Taxonomy Coverage Heatmap — which nodes have content, which are empty
- Bulk Operations — mass status changes, mass taxonomy reassignment
- Publishing Pipeline — draft → review → published workflow with approval queue
- Activity Feed — real-time log of who changed what, filterable by content type
- Content Search — global search across questions, articles, and taxonomy
- Quick Actions Command Palette — ⌘K to jump to any content item

---

## Visual Identity — Admin vs Developer Portal

Both portals share the same layout DNA (topbar + sidebar + main + optional TOC), the same shared components from `src/components/ui/` and `src/components/shared/`, and the same typography (Syne/DM Mono/Inter). The difference is the accent color:

| Element | Developer Portal | Admin Console |
|---------|-----------------|---------------|
| Topbar background | Navy `#0F1F5C` | Deep Red `#6B1A1A` |
| Topbar badge | "Developer Portal" | "Admin Console" |
| Active nav indicator | `border-left: primary (#1B3FC4)` | `border-left: admin-red (#B91C1C)` |
| Active nav background | `primary-light (#EEF2FC)` | `red-light (#FEF2F2)` |
| Active nav text | `primary (#1B3FC4)` | `admin-red (#B91C1C)` |
| Environment badge | Green (development) | Role badge (super_admin / content_admin / sme_reviewer) |
| Primary action buttons | Cobalt Blue `#1B3FC4` | Keep Cobalt Blue — red buttons feel destructive |

**Important:** The admin primary action color stays Cobalt Blue. Red is only for the topbar and navigation accent — using red for "Save" buttons would make them feel dangerous. The red identity is in the chrome, not the actions.

### Admin-Specific CSS Variables

Add these to the admin layout (scoped, not global):
```css
--admin-accent: #B91C1C;
--admin-accent-light: #FEF2F2;
--admin-accent-hover: #991B1B;
--admin-topbar: #6B1A1A;
--admin-topbar-border: rgba(255,255,255,0.06);
```

---

## Shared Portal Components

Before building the admin console, extract these from the developer portal into truly shared components that both portals use:

### Move to `src/components/portal/`

| Component | Currently In | Shared Between |
|-----------|-------------|---------------|
| `PortalTopbar` | `src/components/developer/` | Admin + Developer |
| `PortalSidebar` | `src/components/developer/` | Admin + Developer |
| `PortalBreadcrumb` | uses `src/components/shared/breadcrumb` | Already shared |
| `CodeBlock` | `src/components/developer/` | Admin (MDX editor) + Developer |
| `StickyTOC` | `src/components/developer/` | Admin (long pages) + Developer |

`PortalTopbar` and `PortalSidebar` should accept props for accent color, badge text, and nav items — making them reusable across both portals without duplication.

```typescript
interface PortalTopbarProps {
  brandText?: string           // "SlateCamp" (default)
  portalLabel: string          // "Admin Console" or "Developer Portal"
  accentColor: string          // CSS variable or hex
  topbarBg: string             // background color
  rightContent?: React.ReactNode // role badge, env badge, etc.
}

interface PortalSidebarProps {
  navItems: NavGroup[]
  accentColor: string
  accentLightColor: string
}
```

---

## Navigation Structure

```
Admin Console
├── Dashboard                    /admin/dashboard
│   ├── Content Health
│   ├── Recent Activity
│   └── Quick Stats
├── Content                      
│   ├── Questions                /admin/questions
│   │   ├── All Questions        /admin/questions
│   │   ├── Create New           /admin/questions/new
│   │   ├── Import               /admin/questions/import
│   │   └── Quality Analytics    /admin/questions/analytics    ← NEW
│   ├── Articles                 /admin/articles
│   │   ├── All Articles         /admin/articles
│   │   ├── Create New           /admin/articles/new
│   │   └── MDX Editor           /admin/articles/[id]
│   └── Wiki (Legacy)            /admin/wiki                   ← Keep for backward compat
├── Structure
│   ├── Taxonomy                 /admin/taxonomy
│   │   ├── Tree Editor          /admin/taxonomy
│   │   └── Coverage Map         /admin/taxonomy/coverage      ← NEW
│   └── 3D Assets                /admin/assets
├── Quality
│   ├── Review Queue             /admin/reviews
│   ├── Publishing Pipeline      /admin/pipeline               ← NEW
│   └── Content Search           /admin/search                 ← NEW
├── Activity
│   ├── Audit Log                /admin/audit
│   └── Activity Feed            /admin/activity               ← NEW
└── Settings                     /admin/settings               ← NEW
    └── User Roles               /admin/settings/roles         ← NEW (super_admin only)
```

---

## Execution Plan

Execute phases in exact order. `bun run build` after each phase.

---

### PHASE 1: Shared Portal Components

Before touching the admin console, extract the developer portal's layout components into shared portal components.

#### 1.1 Create `src/components/portal/PortalTopbar.tsx`

Refactor the developer portal's topbar into a configurable component:
- Accept `portalLabel`, `topbarBg`, `accentColor` as props
- Accept `rightContent` slot for portal-specific elements (env badge, role badge)
- Keep the brand name "SlateCamp", search input, and "Back to Dashboard" link
- Search input uses ⌘K shortcut

#### 1.2 Create `src/components/portal/PortalSidebar.tsx`

Refactor the developer portal's sidebar into a configurable component:
- Accept `navItems` as structured data (groups with items, sub-items)
- Accept `accentColor` and `accentLightColor` for active state styling
- Active route detection via `usePathname()`
- Collapsible sections, mobile hamburger
- Same typography: DM Mono group labels, Inter 12px items

#### 1.3 Create `src/components/portal/PortalLayout.tsx`

A wrapper that composes topbar + sidebar + main content area:
```typescript
interface PortalLayoutProps {
  portalLabel: string
  topbarBg: string
  accentColor: string
  accentLightColor: string
  navItems: NavGroup[]
  rightContent?: React.ReactNode
  children: React.ReactNode
}
```

#### 1.4 Move `CodeBlock` and `StickyTOC`

Move from `src/components/developer/` to `src/components/portal/`. Update all developer portal imports.

#### 1.5 Update Developer Portal

Refactor `/developer/layout.tsx` to use the new `PortalLayout` component. Verify the developer portal still works identically.

**Run `bun run build`. Confirm zero errors.**

---

### PHASE 2: Admin Layout Rebuild

Replace the existing admin layout with the new portal layout system.

#### 2.1 New Admin Layout — `src/app/admin/layout.tsx`

Use `PortalLayout` with admin-specific props:
```typescript
<PortalLayout
  portalLabel="Admin Console"
  topbarBg="#6B1A1A"
  accentColor="#B91C1C"
  accentLightColor="#FEF2F2"
  navItems={adminNavItems}
  rightContent={<AdminRoleBadge role={userRole} />}
>
  {children}
</PortalLayout>
```

Auth guard: same as existing — `canReviewContent()`. Bypass for `/admin` login page.

#### 2.2 AdminRoleBadge Component

Show the user's role as a colored badge in the topbar:
- `super_admin` → red badge
- `content_admin` → amber badge
- `sme_reviewer` → blue badge

#### 2.3 Admin Nav Items

```typescript
const adminNavItems: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboardIcon },
    ]
  },
  {
    label: 'Content',
    items: [
      { label: 'Questions', href: '/admin/questions', icon: HelpCircleIcon,
        children: [
          { label: 'All Questions', href: '/admin/questions' },
          { label: 'Create New', href: '/admin/questions/new' },
          { label: 'Import', href: '/admin/questions/import' },
          { label: 'Quality Analytics', href: '/admin/questions/analytics' },
        ]
      },
      { label: 'Articles', href: '/admin/articles', icon: FileTextIcon,
        children: [
          { label: 'All Articles', href: '/admin/articles' },
          { label: 'Create New', href: '/admin/articles/new' },
        ]
      },
    ]
  },
  {
    label: 'Structure',
    items: [
      { label: 'Taxonomy', href: '/admin/taxonomy', icon: GitBranchIcon,
        children: [
          { label: 'Tree Editor', href: '/admin/taxonomy' },
          { label: 'Coverage Map', href: '/admin/taxonomy/coverage' },
        ]
      },
      { label: '3D Assets', href: '/admin/assets', icon: BoxIcon },
    ]
  },
  {
    label: 'Quality',
    items: [
      { label: 'Review Queue', href: '/admin/reviews', icon: CheckSquareIcon },
      { label: 'Publishing Pipeline', href: '/admin/pipeline', icon: GitPullRequestIcon },
      { label: 'Content Search', href: '/admin/search', icon: SearchIcon },
    ]
  },
  {
    label: 'Activity',
    items: [
      { label: 'Audit Log', href: '/admin/audit', icon: ClockIcon },
      { label: 'Activity Feed', href: '/admin/activity', icon: ActivityIcon },
    ]
  },
]
```

#### 2.4 Preserve Existing Admin Login Page

`/admin/page.tsx` (login) stays as-is. The layout bypass for the login page must still work.

**Run `bun run build`. Confirm zero errors. Every existing admin page must render correctly inside the new layout.**

---

### PHASE 3: Admin Dashboard Rebuild

Replace `src/app/admin/dashboard/page.tsx` with a comprehensive command center.

#### 3.1 Content Health Overview

Top section with 4 large stat cards:

| Card | Data Source | Display |
|------|-----------|---------|
| Total Questions | `SELECT COUNT(*) FROM questions` | Number + trend badge |
| Total Articles | `SELECT COUNT(*) FROM wiki_articles` | Number + published/draft split |
| Published Articles | `WHERE status = 'published'` | Number as green |
| Draft Articles | `WHERE status = 'draft'` | Number as amber |

Below: a horizontal bar showing the published/draft ratio visually.

#### 3.2 Content by Subject

A table or card grid showing content counts per discipline/subject:
- Query `taxonomy_tree` at level 1 (subjects)
- For each: count articles (via `wiki_article_taxonomy`), count questions (via `questions.topic_id`)
- Show as a horizontal bar chart or stacked stat cards

#### 3.3 Recent Activity Feed

Last 20 entries from `audit_logs`:
- Columns: Timestamp (relative), Actor (email/name), Event (CREATE/UPDATE/DELETE badge), Table, Record link
- Use the shared `DataTable` component
- Each event type gets a colored badge: CREATE=green, UPDATE=blue, DELETE=red, PUBLISH=purple

#### 3.4 Quick Actions Grid

Cards linking to the most common admin tasks:
- Create Question → `/admin/questions/new`
- Create Article → `/admin/articles/new`
- Import Questions → `/admin/questions/import`
- Review Queue → `/admin/reviews`
- Taxonomy Editor → `/admin/taxonomy`
- Audit Log → `/admin/audit`

**Run `bun run build`. Confirm zero errors.**

---

### PHASE 4: Questions Management Upgrade

#### 4.1 Question List — `/admin/questions/page.tsx`

Rebuild using the shared `DataTable` component:
- Columns: Stem (truncated to 80 chars), Topic (ale_id badge), Difficulty (0-1 as bar), Code Citation, Updated At
- Filters: by taxonomy node (TaxonomyPicker dropdown), by difficulty range, by has-citation
- Search: full-text on question stem
- Bulk select: checkbox column, bulk actions (delete, change topic)
- Row click: navigate to edit page
- Pagination: 50 per page

#### 4.2 Question Editor — `/admin/questions/[id]/page.tsx`

Rebuild the editor with the shared component library:
- Stem: textarea with character count
- Choices: 4 input fields with radio buttons for correct answer, reorderable
- Rationale: textarea
- Code Citation: text input with LegalCitationBadge preview
- Difficulty: slider (0-1) with label (Foundational/Intermediate/Advanced/Exam-grade)
- Topic: TaxonomyPicker (dropdown variant, single select)
- Application Context: text input
- Practice Context: tag input (array of strings)
- Metadata sidebar: question_id, created_at, updated_at, created_by, updated_by
- Save (server action with Zod), Delete (with confirmation dialog)
- Preview panel: render the question using the shared QuestionCard component

#### 4.3 Question Import — `/admin/questions/import/page.tsx`

Keep existing `QuestionImporter` but wrap in the new layout. Add:
- Validation preview table before import (show parsed data, flag errors)
- Duplicate detection (highlight questions with stems matching existing)
- Topic resolution (map ale_id strings to taxonomy node UUIDs)

#### 4.4 Question Quality Analytics — `/admin/questions/analytics/page.tsx` ← NEW

A read-only analytics page:
- **Difficulty Distribution:** Histogram showing how many questions exist at each difficulty level (0.1 buckets)
- **Coverage Gaps:** Taxonomy nodes with fewer than 5 questions, sorted by exam_frequency (high-frequency gaps first)
- **Questions Without Rationale:** Count and list of questions missing the rationale field
- **Questions Without Citation:** Count and list of questions missing code_citation
- **Discrimination Stats:** If `discrimination_rating` is populated, show distribution

**Run `bun run build`. Confirm zero errors.**

---

### PHASE 5: Article Management Upgrade

#### 5.1 Article List — `/admin/articles/page.tsx`

Rebuild using `DataTable`:
- Columns: Title, ale_id (from taxonomy junction), Status (badge), Word Count (computed from content length), Updated At
- Filters: by status (published/draft), by subject (TaxonomyPicker)
- Search: by title
- Row click: navigate to editor
- New Article button

#### 5.2 Article Editor — `/admin/articles/[id]/page.tsx`

This is the MDX editor with CodeMirror + live preview (already built from the admin console build). Ensure it uses:
- The shared `CodeBlock` component from `src/components/portal/` for code snippets in the toolbar
- The component insertion toolbar with all 30+ MDX component templates
- Split pane: CodeMirror left, live preview right
- Metadata bar: title, slug, status toggle, ale_id, word count, save button
- Issues panel (if content_issues table exists)

If the MDX editor was already built, verify it works inside the new admin layout. If not, build it now following the `ADMIN-CONSOLE-BUILD.md` Phase 2 spec.

#### 5.3 Legacy Wiki Routes

`/admin/wiki` routes should redirect to `/admin/articles`. Add a redirect in `/admin/wiki/layout.tsx` or keep both paths working but pointing to the same components.

**Run `bun run build`. Confirm zero errors.**

---

### PHASE 6: Taxonomy & Assets

#### 6.1 Taxonomy Editor — `/admin/taxonomy/page.tsx`

Keep the existing `TaxonomyEditor` component (589 lines) but wrap it in the new layout. Ensure it uses shared components for any buttons, badges, and inputs.

#### 6.2 Taxonomy Coverage Map — `/admin/taxonomy/coverage/page.tsx` ← NEW

A visual heatmap showing content coverage across the taxonomy:
- Render all level-1 and level-2 nodes as a grid
- Each cell colored by content density:
  - Green: ≥10 questions + published article
  - Amber: 1-9 questions OR draft article only
  - Gray: 0 questions, no article
  - Red outline: high exam_frequency but gray (critical gap)
- Click a cell: see the node details, article count, question count, link to taxonomy editor

Data: Join `taxonomy_tree` with question counts (GROUP BY topic_id) and article presence (via `wiki_article_taxonomy`).

#### 6.3 3D Assets — `/admin/assets/page.tsx`

Keep existing `AssetUploader` and `AssetList`. Wrap in new layout with shared components.

**Run `bun run build`. Confirm zero errors.**

---

### PHASE 7: Quality & Publishing

#### 7.1 Review Queue — `/admin/reviews/page.tsx`

Keep existing `SMEReviewQueue`. Wrap in new layout.

#### 7.2 Publishing Pipeline — `/admin/pipeline/page.tsx` ← NEW

A kanban-style view of content moving through the publishing workflow:
- 3 columns: **Draft** → **In Review** → **Published**
- Cards represent articles (and optionally questions)
- Each card shows: title, ale_id, author (created_by), last updated, word count
- Drag between columns updates the `status` field via server action
- Filter by subject/discipline

This requires articles to have a `status` field with values: `draft`, `review`, `published`. The `wiki_articles` table already has a `status` field — verify it supports the `review` value. If not, write a migration to add it.

#### 7.3 Content Search — `/admin/search/page.tsx` ← NEW

Global search across all content types:
- Single search input at the top
- Results grouped by type: Questions, Articles, Taxonomy Nodes
- Questions: search `text` field (ilike)
- Articles: search `title` and `content` fields (ilike)
- Taxonomy: search `name` and `ale_id` fields (ilike)
- Each result links to its editor page
- Show result count per type as tabs

**Run `bun run build`. Confirm zero errors.**

---

### PHASE 8: Activity & Audit

#### 8.1 Audit Log — `/admin/audit/page.tsx`

Keep existing `AuditLogViewer`. Wrap in new layout. Enhance with:
- Filters: by event_type (CREATE/UPDATE/DELETE), by table_name, by date range
- Search: by actor email
- Expandable rows: show `content_snapshot` diff

#### 8.2 Activity Feed — `/admin/activity/page.tsx` ← NEW

A real-time-feeling activity feed (actually polling every 30s or using `revalidate`):
- Shows the latest 50 content changes across all tables
- Each entry: avatar/initial of actor, action description in natural language, timestamp
- Examples:
  - "Philip updated article 'Roman Architecture' — 2 minutes ago"
  - "Philip created 3 new questions in ALE-HIST-001 — 15 minutes ago"
  - "Philip published article 'PRBoA Composition' — 1 hour ago"
- Filter by: content type (questions/articles/taxonomy), by actor

**Run `bun run build`. Confirm zero errors.**

---

### PHASE 9: Settings & Roles

#### 9.1 Admin Settings — `/admin/settings/page.tsx` ← NEW

Simple settings page (super_admin only):
- User Roles Management: list all users in `user_roles` table
- Add role: select user (search by email) + select role + assign
- Remove role: click to revoke
- Show current admin users with their roles and last activity

#### 9.2 Role Management Server Actions

Create `src/lib/actions/admin/roles.ts`:
- `getAdminUsers()` — list all users with roles
- `assignRole(userId, role)` — insert into `user_roles` (canManageUsers() required)
- `revokeRole(userId, role)` — delete from `user_roles` (canManageUsers() required)

Both must be super_admin only via `canManageUsers()` check.

**Run `bun run build`. Confirm zero errors.**

---

### PHASE 10: Command Palette & Polish

#### 10.1 Command Palette (⌘K)

Create `src/components/portal/CommandPalette.tsx`:
- Triggered by ⌘K (or the search input in the topbar)
- Searches across: admin pages (by name), questions (by stem), articles (by title), taxonomy nodes (by name/ale_id)
- Each result shows: type badge, title, description
- Enter to navigate
- Use Dialog component as the shell

This component should work in both admin and developer portals.

#### 10.2 Loading States

Create `loading.tsx` for every admin route:
- `/admin/dashboard/loading.tsx`
- `/admin/questions/loading.tsx`
- `/admin/questions/[id]/loading.tsx`
- `/admin/articles/loading.tsx`
- `/admin/articles/[id]/loading.tsx`
- `/admin/taxonomy/loading.tsx`
- `/admin/taxonomy/coverage/loading.tsx`
- `/admin/assets/loading.tsx`
- `/admin/audit/loading.tsx`
- `/admin/reviews/loading.tsx`
- `/admin/pipeline/loading.tsx`
- `/admin/search/loading.tsx`
- `/admin/activity/loading.tsx`
- `/admin/settings/loading.tsx`
- `/admin/questions/analytics/loading.tsx`

#### 10.3 Error Boundaries

Create `error.tsx` at the admin layout level plus any data-heavy sub-routes.

#### 10.4 Metadata

Add proper Next.js metadata to every admin page.

#### 10.5 Dark Mode

Verify every admin page works in dark mode. The red topbar should darken appropriately.

#### 10.6 Responsive

Same as developer portal: sidebar collapses at <1024px, tables scroll horizontally, content readable at 768px+.

**Run `bun run build` one final time. Confirm zero errors.**

---

## Critical Rules

1. **Use existing components.** Every Button, Badge, Card, Input, DataTable, TaxonomyPicker, QuestionCard, ScoreDisplay, EmptyState, Skeleton, etc. must come from `src/components/ui/` or `src/components/shared/`. No new duplicates.

2. **Use shared portal components.** The topbar, sidebar, and layout shell come from `src/components/portal/`. Both admin and developer portals use the same structural components with different props.

3. **Admin-specific components go in `src/components/admin/`.** Things like `AdminMDXEditor`, `QuestionImporter`, `TaxonomyEditor`, `SMEReviewQueue` that are unique to admin stay in or move to `src/components/admin/`.

4. **Red is chrome, not action.** The admin's red identity is in the topbar and nav accents. Primary action buttons remain Cobalt Blue. Destructive buttons use the standard destructive variant (which is already red).

5. **Preserve all existing functionality.** Every current admin feature must work after the rebuild. The question editor, article editor, taxonomy editor, asset uploader, audit log, and review queue must all function identically.

6. **Server Actions for all mutations.** No client-side direct Supabase calls. Every create/update/delete goes through a server action with `canManageContent()` or `canManageUsers()` + Zod validation.

7. **Read actual source files for data shapes.** When building new pages (analytics, coverage map, pipeline, search), read the actual table schemas and existing query functions. Don't hallucinate column names.

8. **`bun run build` after every phase.** Non-negotiable.

9. **Commit after each phase.** `feat: admin console phase N — [description]`
