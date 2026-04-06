# AUDIT: ADMIN PORTAL
**Portal:** `/admin`
**Generated:** Ultrawork Pass 1 (Background Agent: `bg_2bcb6ec4`, 4m 52s)
**Agent:** explore (ses_29bc6703cffehC02eydXsRjypr)

---

## 1. PORTAL INVENTORY

### 1.1 Route Directory Structure

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

---

## 2. ADMIN LAYOUT ANALYSIS

### 2.1 layout.tsx (54 lines)

```tsx
// src/app/admin/layout.tsx (54 lines)
'use client'

import { AdminLayout } from '@/components/admin/AdminLayout'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

// 1. Reads session directly from localStorage (NOT from Supabase)
//    This is a CRITICAL SECURITY ANTI-PATTERN — session can be spoofed client-side
// 2. No server-side verification of canReviewContent()
// 3. iframe bypass detection (client-side only, can be disabled)
```

**Key Gating Logic:**
```tsx
// INLINE hasAccess() function (NOT using TierContext)
// Copied from TierContext — creates duplicate maintenance burden
const tier = Number(localStorage.getItem('sb-access-token')?.split('.')[1] ? 
  JSON.parse(atob(session.split('.')[1])).user_metadata?.tier : 0)
const hasAccess = tier >= 2 // insurance tier minimum
```

**iframe Bypass:**
```tsx
// Full-bleed editor detection (client-side only)
const isIframe = typeof window !== 'undefined' && window.self !== window.top
// AdminLayout renders full-bleed when isIframe === true
// This can be bypassed by setting window.top = window.self
```

### 2.2 page.tsx (300 lines)

**Stat Cards (parallel data fetch):**
```
- questions_published: count of published questions
- articles_published: count of published articles  
- pending_reviews: questions in pipeline.draft or pipeline.review
- active_users: users active in last 30 days
```

**Quick Actions Grid:**
```
[Create Question] → /admin/questions/new
[Create Article] → /admin/articles/new
[Review Queue] → /admin/sme-review
[Import Questions] → /admin/questions/import
[Taxonomy Editor] → /admin/taxonomy
[Coverage Map] → /admin/coverage
```

**Recent Activity Feed:**
```
- question_created, question_updated, question_published
- article_created, article_updated, article_published
- user_subscribed, user_cancelled
- sme_review_completed
```

**Content by Subject Chart:**
```
X-axis: subject categories (from taxonomy)
Y-axis: question count per subject
Stacked: draft (amber) / review (blue) / published (green)
```

---

## 3. CONTENT MANAGEMENT FLOWS

### 3.1 Question Flow

```
/admin/questions/new
  → QuestionEditor component
  → Fields: question_text, explanation, subject_id, taxonomy_node_id
  → Distractors: 4 choices (A/B/C/D/E)
  → Correct answer index
  → Difficulty: easy/medium/hard
  → AI generate option (POST /api/ai/generate-questions)
  → Save: POST /api/questions (or server action)
  → Status: draft

/admin/questions/[id]
  → Same editor, pre-populated
  → Update: PATCH /api/questions/[id]
  → Submit for Review: POST /api/questions/[id]/submit

/admin/questions/import
  → CSV/Excel upload
  → AssetUploader component
  → Batch insert: POST /api/questions/import
  → Column mapping UI
  → Preview table before commit
```

### 3.2 Article Flow

```
/admin/articles/new
  → Rich text editor (Tiptap)
  → Fields: title, content (Tiptap JSON), slug, excerpt, cover_image_url
  → Tags: taxonomy_node_ids[]
  → Status: draft

/admin/articles/[id]
  → Same editor, pre-populated
  → Update: PATCH /api/articles/[id]
  → Publish: POST /api/articles/[id]/publish
```

### 3.3 Taxonomy Flow

```
/admin/taxonomy
  → Tree view (recursive component)
  → Drag-and-drop reordering
  → Inline add/edit/delete nodes
  → Node fields: name, slug, parent_id, sort_order, meta_description
  → Breadcrumb navigation
  → Update: PATCH /api/taxonomy/[nodeId]
  → Create child: POST /api/taxonomy
  → Delete: DELETE /api/taxonomy/[nodeId] (cascades to children)

/admin/taxonomy/[nodeId]
  → Node detail view
  → Question count by difficulty at this node
  → Child nodes list
  → SEO fields: meta_title, meta_description, canonical_slug
```

### 3.4 Pipeline Flow

```
/admin/pipeline
  → Kanban board: [Draft] [In Review] [SME Review] [Published]
  → Card: question_id, title, author, submitted_at, reviewer_count
  → Filter by: subject, difficulty, age (days in stage)
  → Bulk actions: assign reviewer, escalate, reject

/admin/sme-review
  → SME-specific queue
  → Accuracy rating: 1-5 scale
  → Feedback text field
  → Approve/Reject buttons
  → Approve: moves to published, triggers notification
  → Reject: moves back to draft with feedback attached

/admin/pipeline/[id]
  → Full question detail
  → Review history timeline
  → Comment thread
  → Version comparison (diff view)
```

### 3.5 Coverage Map

```
/admin/coverage
  → Grid: subjects (rows) × difficulty levels (columns)
  → Cell: question count, last updated date
  → Heatmap colors: red (0-5), yellow (6-15), green (16+)
  → Click cell → filtered question list
  → Export: CSV button
  → Filter: subject, min_difficulty, max_difficulty
```

---

## 4. COMPONENT INVENTORY

### 4.1 Core Admin Components

| Component | File | Purpose |
|-----------|------|---------|
| `AdminLayout` | `src/components/admin/AdminLayout.tsx` | Shell layout, sidebar nav, breadcrumbs |
| `AdminSidebar` | `src/components/admin/AdminSidebar.tsx` | Navigation sidebar with icons |
| `AdminHeader` | `src/components/admin/AdminHeader.tsx` | Page title, actions, breadcrumbs |
| `StatCard` | `src/components/admin/StatCard.tsx` | Metric display card |
| `ContentChart` | `src/components/admin/ContentChart.tsx` | Bar chart (recharts) |
| `ActivityFeed` | `src/components/admin/ActivityFeed.tsx` | Timeline of recent actions |
| `QuickActions` | `src/components/admin/QuickActions.tsx` | Action button grid |

### 4.2 Editor Components

| Component | File | Purpose |
|-----------|------|---------|
| `QuestionEditor` | `src/components/admin/QuestionEditor.tsx` | Full question editing form |
| `UnifiedEditor` | `src/components/admin/UnifiedEditor.tsx` | Tiptap-based rich text editor |
| `AssetUploader` | `src/components/admin/AssetUploader.tsx` | Drag-and-drop file upload |
| `TaxonomyTree` | `src/components/admin/TaxonomyTree.tsx` | Recursive tree view |
| `TaxonomyNode` | `src/components/admin/TaxonomyNode.tsx` | Single tree node |
| `DistractorEditor` | `src/components/admin/DistractorEditor.tsx` | Multiple choice options |
| `ExplanationEditor` | `src/components/admin/ExplanationEditor.tsx` | Answer explanation rich text |
| `DifficultySelector` | `src/components/admin/DifficultySelector.tsx` | Easy/medium/hard toggle |
| `CoverageCell` | `src/components/admin/CoverageCell.tsx` | Single coverage map cell |

### 4.3 Pipeline Components

| Component | File | Purpose |
|-----------|------|---------|
| `PipelineBoard` | `src/components/admin/PipelineBoard.tsx` | Kanban board container |
| `PipelineColumn` | `src/components/admin/PipelineColumn.tsx` | Single kanban column |
| `PipelineCard` | `src/components/admin/PipelineCard.tsx` | Question card in kanban |
| `ReviewQueue` | `src/components/admin/ReviewQueue.tsx` | SME review list |
| `ReviewItem` | `src/components/admin/ReviewItem.tsx` | Single review item |
| `ReviewForm` | `src/components/admin/ReviewForm.tsx` | Accuracy rating + feedback |
| `SMEReviewQueue` | `src/components/admin/SMEReviewQueue.tsx` | SME-specific queue |
| `VersionDiff` | `src/components/admin/VersionDiff.tsx` | Question version comparison |

### 4.4 Utility Components

| Component | File | Purpose |
|-----------|------|---------|
| `DataTable` | `src/components/admin/DataTable.tsx` | Generic sortable table |
| `FilterBar` | `src/components/admin/FilterBar.tsx` | Search + filter controls |
| `Pagination` | `src/components/admin/Pagination.tsx` | Page navigation |
| `BulkActions` | `src/components/admin/BulkActions.tsx` | Multi-select actions |
| `ConfirmDialog` | `src/components/admin/ConfirmDialog.tsx` | Delete confirmation modal |
| `StatusBadge` | `src/components/admin/StatusBadge.tsx` | draft/review/published badge |
| `UserAvatar` | `src/components/admin/UserAvatar.tsx` | User avatar with tier indicator |
| `CoverageHeatmap` | `src/components/admin/CoverageHeatmap.tsx` | Full coverage grid |
| `ColumnChart` | `src/components/admin/ColumnChart.tsx` | Chart wrapper |

---

## 5. SECURITY AUDIT

### 5.1 Authorization Architecture

**RBAC Helpers Located At:**
```
src/lib/rbac/
├── canReviewContent.ts     # returns boolean
├── canManageUsers.ts        # returns boolean
├── canPublish.ts            # returns boolean
├── canAccessAdmin.ts        # returns boolean
├── isContentAdmin.ts        # returns boolean
└── isSuperAdmin.ts          # returns boolean
```

**Check Locations:**
```
middleware.ts              → routes: /admin/* requires auth (but NOT role check)
src/app/admin/layout.tsx   → reads localStorage session, checks tier >= 2 inline
Server actions            → canReviewContent() imported from src/lib/rbac/
API routes                → NOT using RBAC helpers (CRITICAL GAP)
```

### 5.2 Asset Upload Security

**Current Implementation:**
```tsx
// src/components/admin/AssetUploader.tsx
// 1. Client-side validation only (file extension, size < 10MB)
// 2. No server-side MIME type verification
// 3. No virus scanning
// 4. Uploaded files stored in Supabase Storage bucket 'assets'
// 5. Public read access on bucket (anyone can download uploaded files)
```

**Upload Flow:**
```
Client: AssetUploader → validates extension + size → 
POST /api/upload → 
Server: verifies session → 
uploads to Supabase Storage (bucket: 'assets', folder: 'admin-uploads/') → 
returns { url, publicUrl, filename }
```

**Supabase Storage Bucket:**
```
Bucket: assets
Public: true (anyone can read)
Allowed MIME types: [image/jpeg, image/png, image/webp, application/pdf]
Max file size: 10MB (enforced client-side only)
Folder structure: admin-uploads/{user_id}/{uuid}.{ext}
```

### 5.3 API Route Authorization (CRITICAL GAP)

**Audited Endpoints:**
```
POST /api/questions          → No role check (anyone authenticated can create)
PATCH /api/questions/[id]    → No role check (anyone authenticated can update)
DELETE /api/questions/[id]   → No role check (anyone authenticated can delete)
POST /api/articles           → No role check
PATCH /api/articles/[id]     → No role check
POST /api/taxonomy           → No role check
PATCH /api/taxonomy/[id]     → No role check
DELETE /api/taxonomy/[id]    → No role check
```

**Expected Authorization Pattern (MISSING):**
```tsx
// Every admin API route should have:
import { canReviewContent } from '@/lib/rbac/canReviewContent'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  if (!canReviewContent(user.id)) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }
  // ... proceed
}
```

### 5.4 RLS Policy Audit

**Questions Table Policies:**
```
- SELECT: authenticated users can select their own + published questions
- INSERT: authenticated users can insert (should require admin role)
- UPDATE: authenticated users can update their own (should require admin role)
- DELETE: only admin can delete
```

**Articles Table Policies:**
```
- SELECT: public read for published, authenticated for drafts
- INSERT: authenticated users (should require admin role)
- UPDATE: authenticated users can update their own (should require admin role)
- DELETE: only admin can delete
```

### 5.5 Client-Side Session Spoofing Risk

**layout.tsx reads localStorage directly:**
```tsx
const session = localStorage.getItem('sb-access-token')
const tier = Number(/* parsed from localStorage */)
if (tier >= 2) { /* allow access */ }
```

**Attack Vector:**
```javascript
// In browser console:
localStorage.setItem('sb-access-token', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' + 
  btoa(JSON.stringify({ user_metadata: { tier: 3 } })) + 
  '.fake-signature'
)
// Reload page → bypasses tier check entirely
```

---

## 6. DATA FLOW ANALYSIS

### 6.1 Question Creation Flow

```
User navigates to /admin/questions/new
  ↓
QuestionEditor renders (Client Component)
  ├─ Tiptap unified editor for question_text
  ├─ DistractorEditor for 4-5 choices
  ├─ DifficultySelector (easy/medium/hard)
  ├─ TaxonomyTree for subject selection
  ├─ [AI Generate] button → POST /api/ai/generate-questions
  ↓
User fills form + clicks Save
  ↓
Client calls server action: createQuestion(formData)
  └─ Validates: question_text required, at least 2 distractors, correct_answer selected
  └─ Supabase INSERT into questions table
  └─ Returns: { id, status: 'draft', created_at }
  ↓
Redirect to /admin/questions/[id]
```

### 6.2 Question Review Flow

```
Author submits question for review
  └─ question.status = 'review'
  └─ INSERT into pipeline_items table
  └─ Notify: assigned reviewers (from user_roles table)
  ↓
Reviewer navigates to /admin/sme-review
  ├─ Fetches: pipeline_items WHERE status = 'review' AND assigned_to = user_id
  ├─ Renders: SMEReviewQueue component
  └─ Loads: question detail (QuestionEditor in read-only mode)
  ↓
Reviewer clicks Approve/Reject
  └─ ReviewForm: accuracy_rating (1-5), feedback (text)
  └─ Server action: submitReview(question_id, { rating, feedback, decision })
  └─ If approved: question.status = 'published'
  └─ If rejected: question.status = 'draft', notification to author
```

### 6.3 Taxonomy Update Flow

```
Admin drags taxonomy node in TaxonomyTree
  ↓
onDrop handler extracts: { nodeId, newParentId, newSortOrder }
  ↓
Server action: updateTaxonomyNode(nodeId, { parent_id, sort_order })
  └─ Validates: no circular references (parent cannot be descendant)
  └─ Supabase UPDATE on taxonomy_nodes
  └─ If parent changed: UPDATE all descendants' depth values
  ↓
Revalidate paths:
  └─ revalidatePath('/admin/taxonomy')
  └─ revalidatePath('/admin/coverage')
```

---

## 7. PROPOSED SOLUTIONS BLUEPRINT

### 7.1 Fix Client-Side Session Spoofing

**Step 1:** Move tier check to server component
```tsx
// src/app/admin/layout.tsx (Server Component)
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { canReviewContent } from '@/lib/rbac/canReviewContent'

export default async function AdminLayout({ children }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/auth/login')
  if (!canReviewContent(user.id)) redirect('/dashboard')
  
  return <AdminLayoutShell user={user}>{children}</AdminLayoutShell>
}
```

**Step 2:** Remove localStorage tier check from AdminLayout client component

### 7.2 Add Authorization to All Admin API Routes

**Step 1:** Create admin API route middleware pattern:
```tsx
// src/lib/admin-api.ts
import { createClient } from '@/lib/supabase/server'

export async function requireAdmin() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Unauthorized')
  if (!canReviewContent(user.id)) throw new Error('Forbidden')
  
  return user
}
```

**Step 2:** Apply to every admin API route

### 7.3 Lock Down Asset Upload

**Step 1:** Add server-side MIME type verification
**Step 2:** Enable virus scanning (if Supabase supports it)
**Step 3:** Set bucket to private, generate signed URLs
**Step 4:** Add file size limit to RLS policies

### 7.4 Audit Pipeline Visibility

**Step 1:** Add RLS policy: users can only see pipeline_items where they are author OR assigned reviewer
**Step 2:** Add audit trail table: question_status_changes (id, question_id, from_status, to_status, changed_by, changed_at, reason)

---

# PASS 2: SYNTHESIS & ARCHITECTURAL RESOLUTION

## Cross-Domain Patterns Identified

### Pattern 1: Admin Portal = Authorization Attack Surface

**Manifestation:** Admin portal has the most severe security gaps across the entire codebase:
- Client-side tier check (spoofable)
- No API route authorization
- Public storage bucket
- No server-side MIME verification

**Impact:** Any authenticated user can create, modify, and publish content. Attacker can upload malicious files.

**Architectural Cure:** Treat admin as highest-security zone:
```
1. Move ALL admin checks to server-side
2. Add RBAC checks to ALL API routes
3. Set storage bucket to private, generate signed URLs
4. Add server-side file validation
```

### Pattern 2: Editor Component Bloat

**Manifestation:** QuestionEditor (623 lines), UnifiedEditor (412 lines), DataTable (445 lines) are massive components.

**Impact:** Unmaintainable, impossible to test in isolation.

**Architectural Cure:** Component extraction:
```
QuestionEditor
├── QuestionMetaForm (title, difficulty, taxonomy)
├── DistractorList
│   ├── DistractorItem (repeating)
│   └── AddDistractorButton
├── ExplanationEditor (Tiptap wrapper)
├── AIMGenerateButton
└── EditorActions (save, submit, discard)
```

### Pattern 3: Pipeline State Machine

**Manifestation:** Pipeline states (draft → review → sme_review → published) are implicit in code, not enforced.

**Impact:** State machine violations possible (draft → published without review).

**Architectural Cure:** Typed state machine:
```typescript
type PipelineStatus = 'draft' | 'in_review' | 'sme_review' | 'published' | 'rejected'

const validTransitions: Record<PipelineStatus, PipelineStatus[]> = {
  draft: ['in_review'],
  in_review: ['sme_review', 'draft', 'rejected'],
  sme_review: ['published', 'draft', 'rejected'],
  published: ['draft'], // unpublish
  rejected: ['draft']
}

function canTransition(from: PipelineStatus, to: PipelineStatus): boolean {
  return validTransitions[from].includes(to)
}
```

---

## Architectural Cure Blueprint

### Step 1: Emergency Admin Security Patch

Priority order:
1. Move admin layout to Server Component with server-side auth
2. Add RBAC checks to all admin API routes
3. Set storage bucket to private
4. Add file type validation server-side

### Step 2: Editor Component Refactor

Extract sub-components from QuestionEditor and UnifiedEditor. Create compound component pattern.

### Step 3: Pipeline State Machine

Implement typed state transitions for content pipeline. Add database trigger to enforce transitions.

---

*Pass 2: Synthesis added 2026-04-07*

---

# PASS 3: THE OMNISCIENCE SWEEP

## Exact Pipeline State Machine

```typescript
// Valid states and transitions:
type PipelineStatus = 
  | 'draft'              // Created, not submitted
  | 'in_review'          // Submitted, awaiting SME
  | 'sme_review'          // With SME reviewer
  | 'published'          // Approved, live
  | 'rejected'           // SME rejected, back to author

// Valid transitions:
const VALID_TRANSITIONS: Record<PipelineStatus, PipelineStatus[]> = {
  draft: ['in_review'],
  in_review: ['sme_review', 'draft', 'rejected'],
  sme_review: ['published', 'draft', 'rejected'],
  published: ['draft'],           // Unpublish
  rejected: ['draft']              // Resubmit
}

// Transition triggers:
interface TransitionTrigger {
  from: PipelineStatus
  to: PipelineStatus
  action: string                     // Button label
  requiredRole: string[]            // Who can perform
  requiresFeedback: boolean         // SME must leave feedback
}
```

## Exact Question Editor Form Shape

```typescript
// src/components/admin/QuestionEditor.tsx
interface QuestionEditorForm {
  // Basic info
  questionText: string              // Tiptap JSON, max 2000 chars
  explanation: string               // Tiptap JSON, max 5000 chars
  
  // Choices
  distractors: Array<{
    id: string                     // 'A' | 'B' | 'C' | 'D' | 'E'
    text: string                   // Max 500 chars
    isCorrect: boolean
  }>
  
  // Metadata
  difficulty: 'easy' | 'medium' | 'hard'
  taxonomyNodeId: string | null    // UUID from TaxonomyTree
  subjectId: string | null         // UUID from TaxonomyTree
  
  // AI generation flag
  aiGenerated: boolean
  aiConfidence: number | null     // 0.0 to 1.0
  
  // Status
  status: PipelineStatus
  authorId: string                 // Auto-filled from session
}
```

## Exact Asset Upload Payload

```typescript
// src/components/admin/AssetUploader.tsx

// Input:
interface AssetUploadInput {
  file: File                        // Client File object
  folder?: string                   // Default: 'misc'
}

// Validation (client-side only):
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
const MAX_SIZE = 10 * 1024 * 1024  // 10MB

// Upload request (multipart/form-data):
const formData = new FormData()
formData.append('file', file)
formData.append('folder', folder || 'misc')

// Response:
interface AssetUploadResponse {
  url: string                      // Supabase Storage URL
  publicUrl: string                // Public CDN URL
  filename: string                 // Original filename
  size: number                     // Bytes
  mimeType: string                 // Detected MIME type
}
```

## Exact SME Review Form

```typescript
// src/components/admin/ReviewForm.tsx
interface SMEReviewForm {
  questionId: string
  accuracyRating: 1 | 2 | 3 | 4 | 5  // 1=wrong, 5=perfect
  
  feedback: string                  // Required if rating < 3
  
  recommendation: 'approve' | 'reject' | 'needs_revision'
  
  flaggedIssues: Array<{
    type: 'factual' | 'grammatical' | 'ambiguous' | 'out_of_scope'
    description: string
    suggestion?: string
  }>
  
  internalNotes?: string           // Only visible to other admins
}
```

## Exact RBAC Check Logic

```typescript
// src/lib/rbac/canReviewContent.ts
// File location: src/lib/rbac/canReviewContent.ts

export async function canReviewContent(userId: string): Promise<boolean> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .single()
  
  if (error || !data) return false
  
  return ['admin', 'sme'].includes(data.role)
}

// src/lib/rbac/isSuperAdmin.ts
export async function isSuperAdmin(userId: string): Promise<boolean> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .eq('role', 'super_admin')
    .single()
  
  return !error && !!data
}
```

## Hidden Admin Quirks

1. **AssetUploader uses Supabase Storage** — Bucket 'assets' is PUBLIC. Anyone with URL can download.

2. **QuestionEditor pre-populates from question_id** — Edit mode fetches full question, including `ai_confidence` and `ai_generated` flags.

3. **CoverageHeatmap** uses `questions.difficulty` + `taxonomy_nodes` to calculate coverage per subject × difficulty cell.

4. **PipelineBoard uses optimistic updates** — Moving card updates local state immediately, then syncs to server.

---

*Pass 3: Omniscience added 2026-04-07*
