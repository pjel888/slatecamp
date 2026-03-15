# PLAN: Phase 4 Admin & Content Operations

## 📍 Objective
Build "The Control Room" — an internal admin dashboard so the team can upload, manage, and quality-control all platform content without touching the codebase.

---

## 🎯 Success Criteria
- [ ] Role-based access enforced at RLS + middleware level
- [ ] Question Manager with CSV/JSON bulk import (strict validation)
- [ ] Wiki Content Manager with TipTap editor and side panel
- [ ] 3D Asset Manager with metadata tagging
- [ ] Taxonomy Editor (visual tree management)
- [ ] Audit logging for all admin actions
- [ ] SME Review Queue with workflow states

---

## 🏔️ Decisions (from CONTEXT.md)

### Admin Auth
- Role Storage: Database table (`user_roles`)
- Sub-roles: `super_admin`, `content_admin`, `sme_reviewer`
- Primary Gate: RLS (database-level enforcement)
- Mutability: Mutable via UI

### Bulk Import
- Formats: CSV + JSON
- Validation: Strict (all-or-nothing)
- CSV Structure: Denormalized columns

### Wiki Editor
- Component: Separate from student WikiRichEditor
- Taxonomy Tagging: Side panel
- Content States: draft → pending_review → published → archived

### Audit
- Events: CREATE, UPDATE, DELETE, PUBLISH, VIEW, EXPORT
- Diff Storage: Hybrid (JSONB for content, normalized for metadata)
- Retention: Forever

### SME Workflow
- States: draft → pending_review → changes_requested → approved → published
- Notifications: In-app only (bell icon)

---

## 🛠️ Implementation Steps

### Wave 1: Admin Foundation

#### Task 1.1: Create user_roles table and RLS policies
- [ ] Create migration: `supabase/migrations/004_add_user_roles.sql`
- [ ] Table: id, user_id (FK auth.users), role, created_at, created_by
- [ ] RLS: enable, SELECT policy for own roles
- [ ] Helper function: `has_admin_role()` for RLS policies
- [ ] Apply RLS to: questions, wiki_articles, taxonomy_tree, 3d_assets

#### Task 1.2: Extend is-admin.ts with role functions
- [ ] Create `src/lib/admin/roles.ts`
- [ ] UserRole type: 'super_admin' | 'content_admin' | 'sme_reviewer'
- [ ] Functions: getUserRole, isAdmin, isSuperAdmin, canManageContent, canReviewContent

#### Task 1.3: Add admin middleware protection
- [ ] Extend `src/middleware.ts`
- [ ] Pattern: /admin/* routes
- [ ] Check user role, redirect non-admins

#### Task 1.4: Create AdminLayout component
- [ ] Create `src/components/shared/AdminLayout.tsx`
- [ ] Sidebar: Dashboard, Questions, Wiki, 3D Assets, Taxonomy, Audit Log
- [ ] Create `/admin/page.tsx` dashboard

---

### Wave 2: Content Managers (Questions + Wiki)

#### Task 2.1: Question import schemas and parser
- [ ] Create `src/lib/import/question-schema.ts` (Zod)
- [ ] Create `src/lib/import/question-importer.ts` (papaparse)
- [ ] parseCSV: denormalized columns
- [ ] parseJSON: nested options array
- [ ] Strict validation: reject entire batch on any error

#### Task 2.2: QuestionImporter UI
- [ ] Create `src/components/admin/QuestionImporter.tsx`
- [ ] Drag-drop file upload
- [ ] Format toggle: CSV / JSON
- [ ] Template download buttons
- [ ] Validation results display

#### Task 2.3: QuestionList and QuestionEditor
- [ ] Create `src/components/admin/QuestionList.tsx`
- [ ] Create `src/components/admin/QuestionEditor.tsx`
- [ ] Create `/admin/questions/page.tsx`
- [ ] Create `/admin/questions/[id]/page.tsx`
- [ ] Create `/admin/questions/import/page.tsx`

#### Task 2.4: Wiki content status columns
- [ ] Migration: `supabase/migrations/005_add_wiki_content_status.sql`
- [ ] Columns: status, reviewed_by, reviewed_at, reviewer_comments
- [ ] Index on status

#### Task 2.5: Wiki server actions
- [ ] Create `src/lib/wiki/wiki-actions.ts`
- [ ] Functions: createArticle, updateArticle, deleteArticle, publishArticle
- [ ] Workflow: submitForReview, approveArticle, requestChanges

#### Task 2.6: AdminWikiEditor component
- [ ] Create `src/components/admin/AdminWikiEditor.tsx`
- [ ] TipTap with StarterKit, Placeholder
- [ ] Side panel: discipline selector, taxonomy picker, status dropdown
- [ ] Auto-save: debounced 30 seconds

#### Task 2.7: WikiArticleList and pages
- [ ] Create `src/components/admin/WikiArticleList.tsx`
- [ ] Create `/admin/wiki/page.tsx`
- [ ] Create `/admin/wiki/[id]/page.tsx`
- [ ] Create `/admin/wiki/new/page.tsx`

---

### Wave 3: Assets + Taxonomy + Audit

#### Task 3.1: 3D asset status columns
- [ ] Migration: `supabase/migrations/006_add_3d_asset_status.sql`
- [ ] Columns: status, metadata (JSONB), reviewed_by, reviewed_at

#### Task 3.2: AssetUploader component
- [ ] Create `src/components/admin/AssetUploader.tsx`
- [ ] Accept: .glb, .gltf (max 50MB)
- [ ] Metadata form: name, system, layer, discipline, tags

#### Task 3.3: AssetList and pages
- [ ] Create `src/components/admin/AssetList.tsx`
- [ ] Create `/admin/assets/page.tsx`
- [ ] Filters: system, layer, status

#### Task 3.4: TaxonomyEditor component
- [ ] Create `src/components/admin/TaxonomyEditor.tsx`
- [ ] Tree view: discipline → subject → topic
- [ ] Add/Edit/Delete nodes
- [ ] Create `/admin/taxonomy/page.tsx`

#### Task 3.5: Audit logs table and triggers
- [ ] Migration: `supabase/migrations/007_add_audit_logs.sql`
- [ ] Table: audit_logs with metadata, content_snapshot
- [ ] Triggers: audit_trigger_function() on questions, wiki_articles, 3d_assets

#### Task 3.6: Audit query helpers
- [ ] Create `src/lib/audit/audit-queries.ts`
- [ ] Functions: getAuditLogs, getAuditLogsByTable, getAuditLogsByActor

#### Task 3.7: Content workflow state machine
- [ ] Create `src/lib/workflow/content-workflow.ts`
- [ ] States: draft, pending_review, changes_requested, approved, published
- [ ] Transitions with role checks

#### Task 3.8: AuditLogViewer component
- [ ] Create `src/components/admin/AuditLogViewer.tsx`
- [ ] Table with filters, expand for diff
- [ ] Create `/admin/audit/page.tsx` (super_admin only)

#### Task 3.9: SME Review Queue and Notifications
- [ ] Create `src/components/shared/NotificationBell.tsx`
- [ ] Create `src/components/admin/SMEReviewQueue.tsx`
- [ ] Create `/admin/reviews/page.tsx`

---

## 📁 Files to Create/Modify

### New Files
- `supabase/migrations/004_add_user_roles.sql`
- `supabase/migrations/005_add_wiki_content_status.sql`
- `supabase/migrations/006_add_3d_asset_status.sql`
- `supabase/migrations/007_add_audit_logs.sql`
- `src/lib/admin/roles.ts`
- `src/lib/admin/permissions.ts`
- `src/lib/import/question-schema.ts`
- `src/lib/import/question-importer.ts`
- `src/lib/wiki/wiki-actions.ts`
- `src/lib/audit/audit-queries.ts`
- `src/lib/workflow/content-workflow.ts`
- `src/components/shared/AdminLayout.tsx`
- `src/components/admin/QuestionImporter.tsx`
- `src/components/admin/QuestionList.tsx`
- `src/components/admin/QuestionEditor.tsx`
- `src/components/admin/AdminWikiEditor.tsx`
- `src/components/admin/WikiArticleList.tsx`
- `src/components/admin/AssetUploader.tsx`
- `src/components/admin/AssetList.tsx`
- `src/components/admin/TaxonomyEditor.tsx`
- `src/components/admin/AuditLogViewer.tsx`
- `src/components/admin/SMEReviewQueue.tsx`
- `src/components/shared/NotificationBell.tsx`
- `src/app/admin/page.tsx`
- `src/app/admin/questions/page.tsx`
- `src/app/admin/questions/[id]/page.tsx`
- `src/app/admin/questions/import/page.tsx`
- `src/app/admin/wiki/page.tsx`
- `src/app/admin/wiki/[id]/page.tsx`
- `src/app/admin/wiki/new/page.tsx`
- `src/app/admin/assets/page.tsx`
- `src/app/admin/taxonomy/page.tsx`
- `src/app/admin/audit/page.tsx`
- `src/app/admin/reviews/page.tsx`

### Modified Files
- `src/lib/admin/is-admin.ts` (extend)
- `src/middleware.ts` (add admin protection)

---

## ✅ Verification

- [ ] user_roles table exists with RLS
- [ ] Role functions correctly identify user roles
- [ ] Middleware redirects non-admins from /admin/*
- [ ] Admin dashboard loads
- [ ] CSV import parses denormalized columns
- [ ] JSON import parses nested options
- [ ] Invalid imports rejected with errors
- [ ] QuestionList shows all questions with filters
- [ ] QuestionEditor creates/updates questions
- [ ] wiki_articles has status workflow columns
- [ ] AdminWikiEditor has side panel
- [ ] Auto-save works every 30 seconds
- [ ] 3d_assets supports status and metadata
- [ ] TaxonomyEditor manages tree hierarchy
- [ ] Audit triggers fire on content changes
- [ ] AuditLogViewer shows admin actions
- [ ] SMEReviewQueue shows pending content
- [ ] NotificationBell shows unread count

---

## 🎯 Requirements Mapped

| ID | Requirement |
|----|-------------|
| REQ-4.1 | Admin role-based access with user_roles table |
| REQ-4.2 | Bulk CSV/JSON import for questions |
| REQ-4.3 | Admin wiki editor with TipTap |
| REQ-4.4 | Audit logging for all admin operations |
| REQ-4.5 | SME review workflow with state machine |
