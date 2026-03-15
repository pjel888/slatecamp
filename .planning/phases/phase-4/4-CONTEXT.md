# CONTEXT: Phase 4 Admin & Content Operations

## Overview
Phase 4 builds "The Control Room" — an internal admin dashboard for content management without touching the codebase.

---

## Decisions

### 1. Admin Auth Architecture

| Decision | Value |
|----------|-------|
| Role Storage | Database table (`user_roles`) |
| Primary Gate | RLS (database-level enforcement) |
| Sub-roles | `super_admin`, `content_admin`, `sme_reviewer` |
| Mutability | Mutable via UI (super_admin can grant/revoke) |

**Implementation:**
- Create `user_roles` table with columns: `user_id`, `role`, `created_at`, `created_by`
- Add RLS policies for admin-only tables (`questions`, `wiki_articles`, `taxonomy_tree`, `3d_assets`)
- Extend existing `isAdmin.ts` to query `user_roles` table

---

### 2. Bulk Import Strategy

| Decision | Value |
|----------|-------|
| Formats | Both CSV and JSON |
| Validation | Strict (all or nothing - reject entire batch on any error) |
| CSV Structure | Denormalized columns (option_a, option_b, option_c, option_d, option_e) |

**CSV Schema:**
```
taxonomy_node_id, question_text, option_a, option_b, option_c, option_d, option_e, correct_answer, rationale, difficulty (1-5)
```

**JSON Schema:**
```json
{
  "questions": [
    {
      "taxonomy_node_id": "uuid",
      "question_text": "string",
      "options": ["a", "b", "c", "d", "e"],
      "correct_answer": "b",
      "rationale": "string",
      "difficulty": 3
    }
  ]
}
```

---

### 3. Wiki Content Manager

| Decision | Value |
|----------|-------|
| Component | Separate from student `WikiRichEditor` |
| Taxonomy Tagging | Side panel (not inline toolbar or modal) |
| Content States | draft → pending_review → published → archived |

**Implementation:**
- New `AdminWikiEditor.tsx` component with side panel for metadata
- Side panel includes: discipline selector, taxonomy tree picker, status dropdown, author field
- Draft state auto-saves every 30 seconds
- Published articles are visible to students; drafts are admin-only

---

### 4. Audit Log Schema

| Decision | Value |
|----------|-------|
| Events | CREATE, UPDATE, DELETE, PUBLISH, VIEW, EXPORT |
| Diff Storage | Hybrid (JSON for content, normalized for metadata) |
| Retention | Forever |

**Table: `audit_logs`**
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id),
  event_type VARCHAR(20) NOT NULL, -- CREATE, UPDATE, DELETE, PUBLISH, VIEW, EXPORT
  table_name VARCHAR(50) NOT NULL,
  record_id UUID NOT NULL,
  metadata JSONB, -- normalized fields: old_value, new_value, changed_fields[]
  content_snapshot JSONB, -- full record before/after for content fields
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**RLS:** Read-only for super_admin; no write access for other roles (inserts via trigger).

---

### 5. SME Review Queue

| Decision | Value |
|----------|-------|
| Workflow States | draft → pending_review → changes_requested → approved → published |
| Notifications | In-app only (bell icon) |
| Rejection Comments | Optional |

**Implementation:**
- `changes_requested` state includes `reviewer_comments` field
- In-app notification: bell icon shows count badge; dropdown lists pending items
- SMEs can filter by: assigned content, recent activity, status

---

## Code Context

### Existing Assets
- `src/lib/admin/is-admin.ts` — needs extension to check `user_roles` table
- `src/components/wiki/WikiRichEditor.tsx` — reference for TipTap config (don't reuse directly)
- `src/components/notes/NotesEditor.tsx` — TipTap patterns

### New Components Needed
- `src/components/admin/AdminWikiEditor.tsx`
- `src/components/admin/QuestionImporter.tsx`
- `src/components/admin/AuditLogViewer.tsx`
- `src/components/admin/SMEReviewQueue.tsx`

### Database Tables
- `user_roles` — new
- `audit_logs` — new (or extend existing if present)
- Update: `wiki_articles` (add `status`, `reviewed_by`, `reviewed_at`)
- Update: `questions` (add `status`, `reviewed_by`)

### Integration Points
- `middleware.ts` — add admin route protection
- `src/lib/supabase/admin.ts` — add role check functions

---

## Deferred Ideas (Out of Scope for Phase 4)
- Email notifications for SMEs
- Bulk export functionality
- Content versioning/rollback UI
- AI-assisted content suggestions

These can be addressed in Phase 5 or as future enhancements.
