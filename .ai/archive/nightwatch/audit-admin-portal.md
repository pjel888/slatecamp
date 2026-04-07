# MASTER ARCHITECTURE BLUEPRINT: ADMIN PORTAL
**Status:** UNIFIED (Panopticon V8)

## 1. Executive Vulnerability Summary
1. **CRITICAL: Client-Side Session Spoofing (Hydration Vulnerability):** `AdminLayout` and `TierContext` read `localStorage` directly for tier gating (tier >= 2). This allows trivial bypass via browser console (`localStorage.setItem('sb-access-token', ...)`), leading to unauthorized access to the entire admin suite.
2. **HIGH: Missing API Authorization (Idempotency/Security):** 13 of 18 admin API routes (including question/article CRUD) lack role-based checks. Server Actions for content updates lack idempotency keys, making the system vulnerable to double-click submission races and duplicate content creation.
3. **MEDIUM: Pipeline State Machine Fragility:** Transitions (draft → review → published) are implicit and unenforced at the database level. Combined with Zustand `persist` race conditions in multi-tab sessions, a user can bypass the SME review queue.

## 2. Exhaustive System Inventory

### 2.1 Route Directory Structure (`src/app/admin/`)
```
src/app/admin/
├── layout.tsx                          # AdminLayout wrapper, canReviewContent() gating
├── page.tsx                            # 300-line admin dashboard (quick actions, stats, recent activity)
├── articles/
│   ├── page.tsx                        # Articles list view
│   ├── [id]/
│   │   └── page.tsx                    # Single article editor
│   └── new/
│       └── page.tsx                    # New article creation
├── questions/
│   ├── page.tsx                        # Questions list
│   ├── [id]/
│   │   └── page.tsx                    # Single question editor
│   ├── new/
│   │   └── page.tsx                    # New question creation
│   └── import/
│       └── page.tsx                    # Bulk import page
├── taxonomy/
│   ├── page.tsx                        # Taxonomy tree editor
│   └── [nodeId]/
│       └── page.tsx                    # Node detail/editor
├── pipeline/
│   ├── page.tsx                        # Content pipeline (draft → review → published)
│   ├── [id]/
│   │   └── page.tsx                    # Pipeline item detail
│   └── queue/
│       └── page.tsx                    # SME review queue
├── sme-review/
│   └── page.tsx                        # SME review interface
├── sme-queue/
│   └── page.tsx                        # SME queue (alias/route to pipeline)
├── coverage/
│   └── page.tsx                        # Content coverage map
├── assets/
│   ├── page.tsx                        # Asset library
│   └── upload/
│       └── page.tsx                    # Upload interface
├── users/
│   ├── page.tsx                        # User management
│   └── [id]/
│       └── page.tsx                    # User detail/edit
├── subscriptions/
│   ├── page.tsx                        # Subscription management
│   └── [id]/
│       └── page.tsx                    # Subscription detail
├── analytics/
│   ├── page.tsx                        # Admin analytics
│   └── [report]/
│       └── page.tsx                    # Specific report views
├── settings/
│   └── page.tsx                        # Admin settings
├── changelog/
│   └── page.tsx                        # Changelog management
└── audit-log/
    └── page.tsx                        # Audit trail

22 subdirectories, 27 total pages
```

### 2.2 Layout & Page Analysis
- **layout.tsx (54 lines):** Reads session directly from `localStorage` (SECURITY ANTI-PATTERN). Copied `hasAccess` logic from `TierContext`.
- **page.tsx (300 lines):** Parallel data fetch for `questions_published`, `articles_published`, `pending_reviews`, `active_users`.
- **Recent Activity Feed:** Tracks `question_created`, `article_created`, `user_subscribed`, `sme_review_completed`.

### 2.3 Component Inventory

| Category | Component | File | Purpose |
|----------|-----------|------|---------|
| Core | `AdminLayout` | `src/components/admin/AdminLayout.tsx` | Shell layout, sidebar nav, breadcrumbs |
| Core | `AdminSidebar` | `src/components/admin/AdminSidebar.tsx` | Navigation sidebar with icons |
| Editor | `QuestionEditor` | `src/components/admin/QuestionEditor.tsx` | Full question editing form (623 lines) |
| Editor | `UnifiedEditor` | `src/components/admin/UnifiedEditor.tsx` | Tiptap-based rich text editor (412 lines) |
| Editor | `AssetUploader` | `src/components/admin/AssetUploader.tsx` | Drag-and-drop file upload |
| Editor | `TaxonomyTree` | `src/components/admin/TaxonomyTree.tsx` | Recursive tree view |
| Pipeline | `PipelineBoard` | `src/components/admin/PipelineBoard.tsx` | Kanban board container |
| Utility | `DataTable` | `src/components/admin/DataTable.tsx` | Generic sortable table (445 lines) |

## 3. Data Flow & Exact Payloads

### 3.1 Question Creation & Editor Shape
```typescript
interface QuestionEditorForm {
  questionText: string              // Tiptap JSON, max 2000 chars
  explanation: string               // Tiptap JSON, max 5000 chars
  distractors: Array<{
    id: string                     // 'A' | 'B' | 'C' | 'D' | 'E'
    text: string                   // Max 500 chars
    isCorrect: boolean
  }>
  difficulty: 'easy' | 'medium' | 'hard'
  taxonomyNodeId: string | null
  subjectId: string | null
  status: 'draft' | 'in_review' | 'sme_review' | 'published' | 'rejected'
}
```

### 3.2 Asset Upload Payload
- **Request (multipart/form-data):** `file: File` (max 10MB), `folder: string` (default: 'misc').
- **Response:**
```typescript
interface AssetUploadResponse {
  url: string                      // Supabase Storage URL
  publicUrl: string                // Public CDN URL (Bucket 'assets' is PUBLIC)
  filename: string
  size: number
  mimeType: string
}
```

### 3.3 SME Review Flow
```typescript
interface SMEReviewForm {
  questionId: string
  accuracyRating: 1 | 2 | 3 | 4 | 5
  feedback: string                  // Required if rating < 3
  recommendation: 'approve' | 'reject' | 'needs_revision'
  flaggedIssues: Array<{
    type: 'factual' | 'grammatical' | 'ambiguous' | 'out_of_scope'
    description: string
  }>
}
```

## 4. Extreme Edge-Case & Concurrency Vulnerabilities
- **Concurrency: Multi-Admin Editing:** No optimistic locking on `questions` or `taxonomy_nodes`. Concurrent edits to the same node result in "Last Write Wins," potentially overwriting hours of taxonomy structural work.
- **Idempotency: Double-Click Content Duplication:** `POST /api/questions` and `POST /api/articles` lack idempotency keys. Rapid clicks on "Save" result in duplicate entries in the database.
- **Hydration: localStorage Tier Spoofing:** `AdminLayout` and `TierContext` check `localStorage` for tiers. Attacker can set `localStorage.setItem('sb-access-token', '...tier:3...')` to bypass UI gating entirely.
- **Persistence Race Conditions:** `useQuizStore` with `persist` middleware can cause race conditions if an admin has multiple tabs open while reviewing content; state syncs across tabs may revert status changes.

## 5. The Unified Resolution Blueprint

### 5.1 Emergency Security Patch
1. **Server-Side Auth:** Move `AdminLayout` check to Server Component using `supabase.auth.getUser()`.
2. **API Hardening:** Wrap all admin routes with `requireAdmin()` check (RBAC: `admin` or `sme`).
3. **Storage Locking:** Set `assets` bucket to private and implement signed URLs.

### 5.2 Architectural Refactoring
1. **Idempotency Keys:** Generate a UUID on form initialization and pass as `X-Idempotency-Key` header.
2. **Component Atomization:** Extract `QuestionMetaForm`, `DistractorList`, and `ExplanationEditor` from `QuestionEditor`.
3. **Pipeline State Machine:** Implement a typed state machine for transitions:
```typescript
const VALID_TRANSITIONS: Record<PipelineStatus, PipelineStatus[]> = {
  draft: ['in_review'],
  in_review: ['sme_review', 'draft', 'rejected'],
  sme_review: ['published', 'draft', 'rejected'],
  published: ['draft'],
  rejected: ['draft']
}
```
4. **Optimistic Locking:** Add `version` column to `questions` and `taxonomy_nodes`. Increment on update, check version in `WHERE` clause.
