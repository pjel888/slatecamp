# Admin Portal

**Analysis Date:** 2026-04-06

## Overview

The Admin portal is the content management control room for SlateCamp. It is gated by `canReviewContent()` role check and provides unified management of the entire knowledge lifecycle: wiki articles, questions, taxonomy, reviews, and system auditing.

**Route:** `/admin`
**Access:** `profiles.role === 'admin' | 'super_admin'`
**Source:** `src/app/admin/AGENTS.md`

## Page Count

27 pages across knowledge, taxonomy, reviews, audit, and assets directories.

## Architecture: Unified Knowledge Hub

The admin uses a unified content architecture under `/admin/knowledge/`:

```
admin/
├── knowledge/              # Central hub (filters articles + questions)
│   ├── [id]/              # Split-pane article editor
│   ├── questions/         # Question bank browser
│   ├── questions/[id]/   # Context-aware question editor
│   └── new/              # New article creation
├── taxonomy/             # Global taxonomy tree management
├── reviews/              # SME review queue
├── audit/                # Change history
└── assets/               # 3D asset catalog
```

**Source:** `src/app/admin/AGENTS.md`

## AdminShell

All admin routes use `AdminShell` for consistent navigation:
- Sidebar with section links
- Quick action buttons
- Breadcrumb context
- Audit trail deep links

```typescript
// src/app/admin/_components/AdminShell.tsx
// Centralized sidebar + layout for all admin routes
```

**Source:** `src/app/admin/_components/AdminShell.tsx`

## Knowledge Hub

### Article Editor (`/admin/knowledge/[id]`)

Split-pane MDX editor:
- Left pane: Article content (TipTap)
- Right pane: Linked questions + metadata
- Taxonomy assignment
- Publication status management

### Question Editor (`/admin/knowledge/questions/[id]`)

Context-aware editor:
- Loads linked source article in reference pane
- Full question metadata: difficulty, discrimination, rationale
- Option-level rationales
- Bloom's taxonomy tagging
- Code citations

### Question Bank (`/admin/knowledge/questions`)

Unified question listing:
- Taxonomy-driven browser
- Filters: status, difficulty, subject, LEA area
- Bulk actions
- Search across question text

**Source:** `src/components/admin/unified-editor/`, `src/app/admin/knowledge/`

## Taxonomy Management

`/admin/taxonomy/` — Global taxonomy tree:
- Discipline → Subject → Topic hierarchy
- LEA ID assignment
- Bloom's level tagging
- Exam frequency metadata
- Orphaned content detection (Unassigned filter)

**Source:** `src/app/admin/taxonomy/`

## SME Review Queue

`/admin/reviews/` — Content awaiting expert review:
- Articles submitted for approval
- Questions flagged for review
- Deep links to unified editors
- Approve / Request Changes / Reject actions

**Source:** `src/app/admin/reviews/`

## Audit Log

`/admin/audit/` — Change history:
- Every wiki article edit
- Question changes
- Taxonomy modifications
- User actions
- Deep links to content

**Source:** `src/app/admin/audit/`

## 3D Asset Management

`/admin/assets/` — 3D model catalog:
- GLB/GLTF file uploads
- Hotspot configuration
- Compliance rule attachment
- Model metadata

**Source:** `src/app/admin/assets/`

## Server Actions

```typescript
// src/lib/actions/admin/content.ts
// Primary server actions for unified knowledge base
// - createArticle()
// - updateArticle()
// - createQuestion()
// - updateQuestion()
// - submitForReview()
// - approveContent()
// - rejectContent()
```

**Source:** `src/lib/actions/admin/` (13 files)

## Data Revalidation

After any content mutation:
```typescript
revalidatePath('/admin/knowledge')
revalidatePath('/dashboard/wiki')
```
Cache consistency is critical for the admin portal.

**Source:** `src/app/admin/AGENTS.md`

## Legacy Routes

Deprecated routes that redirect to unified equivalents:
- `/admin/articles` → `/admin/knowledge`
- `/admin/questions` → `/admin/knowledge/questions`
- `/admin/content` → `/admin/knowledge`

---

*Admin portal: 2026-04-06*
