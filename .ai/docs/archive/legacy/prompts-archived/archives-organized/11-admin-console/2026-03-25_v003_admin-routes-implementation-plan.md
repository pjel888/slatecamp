# SlateCamp /Admin Routes — Definitive Implementation Plan

> **Give this file to Claude Code at the project root.**
> **Also give it:** `ADMIN-UX-RESEARCH-IMPROVEMENT-PLAN.md` (the UX spec with wireframes)
>
> **Executor:** Claude Code, Cursor, or any AI agent with filesystem access
> **Source:** Admin Audit V2 (2026-03-24), Admin UX Research Plan v1.0 (2026-03-25), Admin Audit Prompt v3
> **Scope:** All 21 routes under `/admin` — zero build errors, zero 404s, zero broken features, zero native dialogs
> **Estimated effort:** 12–18 developer-days across 6 phases
> **Date:** March 25, 2026

---

## ROLE & CONSTRAINTS

You are SlateCamp's Codebase Steward executing an admin console remediation. You follow the **Slatecamp design system**, the **Zero-Behavior-Change Rule** on existing working features, and the **Admin Cognitive Load Heuristics** (zero-click triage, calm urgency, one action principle, dead end elimination, information density, bulk action, error recovery).

### Hard Rules

1. **Read before writing.** Open every file fully before modifying it. Never edit from memory.
2. **One phase at a time.** Complete a phase, run `bun run build`, confirm zero errors, then proceed.
3. **Server Actions for ALL mutations.** No browser Supabase client writes. Every mutation: `canManageContent()` → Zod validate → `createAdminClient()` → mutation → `revalidatePath()`.
4. **Dialogs, not alerts.** Zero `window.alert()`, `window.confirm()`, `window.prompt()` when done.
5. **Design tokens only.** No `zinc-*`, no hardcoded hex outside CSS variables, no `text-[9px]` on readable text, no `rounded-xl` on non-modal elements.
6. **Absolute imports only.** All imports use `@/` — never relative paths.
7. **Commit after each numbered task.** Format: `fix(admin): <desc>` or `feat(admin): <desc>`.

### Design System Quick Reference

```
Admin Chrome (identity only — NOT for action buttons):
  Topbar:         #6B1A1A
  Nav accent:     #B91C1C
  Active bg:      #FEF2F2

Action Buttons:   Cobalt Blue #1B3FC4 (same as student-facing)
Success:          #1B7A3C / #2D9F6F
Warning:          #D4951A / amber-50
Error:            #D64545 — FUNCTIONAL ERRORS ONLY (forms, system alerts)
                  NEVER for low scores, content gaps, or status

Page background:  #F8F7F5 (--sc-warm-white)
Card background:  #FFFFFF
Card border:      border border-border rounded-xl p-4
Card shadow:      shadow-sm on hover only

Typography:
  DM Mono 500:    labels, eyebrows, numbers, codes, stats
  Eyebrow:        DM Mono, 11px MINIMUM, uppercase, tracking-widest
  Inter:          body text, UI text
  Syne 800:       section headings (font-display)
  Numbers:        ALWAYS font-mono font-medium tabular-nums

Score color logic: ≥70% emerald, 40-69% neutral, <40% neutral with label — NEVER red
Min font size:    11px — NOTHING below this on readable text
Min touch target: 44×44px on all interactive elements
```

---

## COMPLETE ROUTE REGISTRY

Every route that must exist, build without errors, and function correctly when this plan is complete.

| # | Route | Current Status | Phase | Primary Work |
|---|-------|---------------|-------|-------------|
| 1 | `/admin` | Functional (design debt) | P5 | Replace zinc-* with design tokens |
| 2 | `/admin/dashboard` | Functional (no triage) | P3 | Add NeedsAttentionCard, fix stat typography |
| 3 | `/admin/questions` | Functional (no bulk) | P3 | Add bulk actions, quality indicators |
| 4 | `/admin/questions/new` | **BROKEN** | P1 | Fix 5→4 options, add preview, replace alerts |
| 5 | `/admin/questions/[id]` | **BROKEN** | P1 | Same as above |
| 6 | `/admin/questions/import` | Functional (auth gap) | P1 | Add page-level auth guard |
| 7 | `/admin/questions/analytics` | ✅ Solid | — | No work needed |
| 8 | `/admin/articles` | Functional (no quality cols) | P3 | Add question count, coverage health columns |
| 9 | `/admin/articles/new` | Partial (preview gap) | P2 | Use WikiArticleRenderer for preview |
| 10 | `/admin/articles/[id]` | Partial (preview gap) | P2 | Same + metadata panel refactor |
| 11 | `/admin/wiki/*` | ✅ Redirects correctly | — | No work needed |
| 12 | `/admin/taxonomy` | Functional (native alert) | P1 | Replace alert with Dialog, route writes through Server Action |
| 13 | `/admin/taxonomy/coverage` | Functional (slow query) | P4 | Optimize with aggregate query |
| 14 | `/admin/assets` | **BROKEN** (dead links) | P2 | Fix AssetList links to point to working routes |
| 15 | `/admin/assets/new` | **MISSING** (404) | P2 | Create page with AssetUploadForm |
| 16 | `/admin/assets/[id]` | **MISSING** (404) | P2 | Create page with AssetDetailView |
| 17 | `/admin/reviews` | **BROKEN** (wrong columns) | P1 | Fix query columns, build full review UX |
| 18 | `/admin/pipeline` | ✅ Good | — | No work needed |
| 19 | `/admin/search` | Partial (no debounce) | P2 | Add debounce, fix error swallowing |
| 20 | `/admin/audit` | ✅ Solid | — | No work needed |
| 21 | `/admin/activity` | Partial (inline query) | P2 | Extract query, fix select('*') |
| 22 | `/admin/settings` | ✅ Solid | — | No work needed |

**Routes requiring zero work:** `/admin/questions/analytics`, `/admin/wiki/*`, `/admin/pipeline`, `/admin/audit`, `/admin/settings` — 5 routes confirmed clean.

---

## PHASE 0 — RECONNAISSANCE (30 minutes, no code changes)

Before writing a single line of code, read the codebase to confirm ground truth. The audit data is from 2026-03-24 — verify nothing has changed.

### 0.1 — Confirm admin directory structure

```bash
find src/app/admin -type f -name "*.tsx" | sort
```

Map every `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`. Count routes.

### 0.2 — Confirm admin component inventory

```bash
find src/components/admin -type f -name "*.tsx" | sort
```

Read every file. Note line counts, `'use client'` status, and imports.

### 0.3 — Confirm server actions

```bash
find src/lib/actions/admin -type f -name "*.ts" | sort
```

Read every file. Note function signatures, auth checks, Zod usage.

### 0.4 — Confirm query layer

```bash
find src/lib/queries/admin -type f -name "*.ts" | sort 2>/dev/null
find src/lib/queries -type f -name "*admin*" | sort 2>/dev/null
```

### 0.5 — Confirm shared components available

```bash
ls src/components/ui/dialog.tsx       # Must exist for Dialog replacement
ls src/components/ui/checkbox.tsx     # Must exist for bulk select
ls src/components/shared/data-table.tsx
ls src/components/shared/empty-state.tsx  # Or similar
```

If `dialog.tsx` or `checkbox.tsx` don't exist, install them first:
```bash
bunx --bun shadcn@latest add dialog
bunx --bun shadcn@latest add checkbox
```

### 0.6 — Confirm existing bugs

```bash
# SMEReviewQueue wrong columns
grep -n "author_id\|submitted_at" src/components/admin/SMEReviewQueue.tsx

# QuestionEditor 5 options
grep -n "options\|Option E\|option_e" src/components/admin/QuestionEditor.tsx

# Native dialogs
grep -rn "window\.confirm\|window\.alert\|window\.prompt\| confirm(" src/components/admin/ --include="*.tsx"

# Client-side direct writes
grep -rn "supabase\.from.*\.insert\|supabase\.from.*\.update\|supabase\.from.*\.delete\|supabase\.from.*\.upsert" src/components/admin/ --include="*.tsx"

# select('*')
grep -rn "select\('\*'\)" src/app/admin/ --include="*.tsx"

# text-[9px]
grep -rn "text-\[9px\]" src/components/admin/ src/components/portal/ --include="*.tsx"
```

Document findings. Proceed to Phase 1.

---

## PHASE 1 — CRITICAL BLOCKERS (1–2 days)

Everything in Phase 1 is either broken-in-production or a security risk. **Nothing else starts until Phase 1 passes `bun run build` with zero errors.**

---

### 1.1 — Fix SMEReviewQueue Column Names

**ICE Score: 90.0** — Highest priority in entire admin console.
**File:** `src/components/admin/SMEReviewQueue.tsx`
**Time:** 15–30 minutes

**What's broken:** The review queue queries columns that don't exist in the database: `id`, `author_id`, `submitted_at`. The query silently returns zero rows. The review queue has been empty since it was built. Articles submitted for review are invisible to reviewers. The content pipeline is broken.

**Action:**

1. Open `src/components/admin/SMEReviewQueue.tsx`
2. Find the Supabase query (approx line 34)
3. Fix column names:

```tsx
// BEFORE — columns that DON'T EXIST
.select('id, title, author_id, submitted_at')

// AFTER — actual database columns
.select('article_id, title, status, updated_at')
```

4. Add status filter if not present:
```tsx
.eq('status', 'pending_review')  // or 'review' — check actual enum values
```

5. Update ALL references in the component's JSX:
   - `item.id` → `item.article_id`
   - `item.author_id` → remove (or query a join if author info is needed)
   - `item.submitted_at` → `item.updated_at`

6. Verify by checking the actual table schema:
```bash
grep -rn "wiki_articles\|articles" src/lib/ --include="*.ts" | head -20
```

**Verify:** `bun run build` → zero errors. Navigate to `/admin/reviews` — should now show actual pending articles.

**Commit:** `fix(admin): correct SMEReviewQueue column names — queue was silently empty`

---

### 1.2 — Fix QuestionEditor 5-Option Bug

**ICE Score: 40.0**
**File:** `src/components/admin/QuestionEditor.tsx`
**Time:** 30 minutes

**What's broken:** QuestionEditor initializes with 5 empty options (A–E). The `createQuestion` server action validates `options.length !== 4` and rejects. Questions created through the admin UI silently fail to save.

**Action:**

1. Open `src/components/admin/QuestionEditor.tsx`
2. Find the initial state for options:

```tsx
// BEFORE
const [options, setOptions] = useState(['', '', '', '', ''])
// or
initialValues: { options: ['', '', '', '', ''] }

// AFTER
const [options, setOptions] = useState(['', '', '', ''])
```

3. Remove the 5th option field from the JSX render (delete Option E input + label)
4. Update option labels throughout: A–E → A–D
5. If there's a dynamic "add option" button, cap at 4
6. Verify `correctAnswer` validates against index 0–3 (not 0–4)
7. Check the server action to confirm the validation rule:

```bash
grep -n "options\.length\|options.length" src/lib/actions/admin/questions.ts
```

**Verify:** `bun run build`. Create a test question at `/admin/questions/new` — should save without error. Edit existing question at `/admin/questions/[id]` — should save.

**Commit:** `fix(admin): QuestionEditor now initializes 4 options matching server validation`

---

### 1.3 — Replace All 6 Native alert/confirm/prompt with Dialogs

**ICE Score: 35.0**
**Time:** 3–4 hours

**What's broken:** 6 native browser dialogs bypass keyboard navigation, screen readers, and design system styling. The `prompt()` for rejection reason gives reviewers a single-line unstyled input for what should be detailed editorial feedback.

**Inventory — verify each by reading the file:**

| File | Call | Purpose | Replacement |
|------|------|---------|-------------|
| `QuestionEditor.tsx` | `confirm()` | Delete question | `DeleteConfirmDialog` |
| `QuestionEditor.tsx` | `alert()` | Save error | Inline error state or toast |
| `QuestionEditor.tsx` | `alert()` | Import success | Inline success state or toast |
| `TaxonomyEditor.tsx` | `alert()` | Node delete | `DeleteConfirmDialog` |
| `SMEReviewQueue.tsx` | `confirm()` | Approve article | `ApproveDialog` |
| `SMEReviewQueue.tsx` | `prompt()` | Rejection reason | `RequestChangesDialog` |

**Build 3 reusable Dialog components:**

**1.3a — Create `src/components/admin/DeleteConfirmDialog.tsx`**

```tsx
'use client'

import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface DeleteConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  title: string           // e.g. "Delete question"
  description: string     // e.g. "This action cannot be undone."
  itemName?: string       // e.g. "What is the minimum corridor width..."
  loading?: boolean
}

export function DeleteConfirmDialog({
  open, onOpenChange, onConfirm, title, description, itemName, loading
}: DeleteConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {itemName && (
              <span className="block font-medium text-foreground mb-1">
                {itemName}
              </span>
            )}
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

**1.3b — Create `src/components/admin/ApproveDialog.tsx`**

```tsx
'use client'

// Same Dialog pattern
// Body: "Approve '{articleTitle}' for publication? This will make it visible to students."
// Buttons: [Cancel] ghost + [Approve & Publish] default (cobalt)
```

**1.3c — Create `src/components/admin/RequestChangesDialog.tsx`**

```tsx
'use client'

import { Textarea } from '@/components/ui/textarea'

// Props: open, onOpenChange, onSubmit(reason: string), articleTitle
// Body: Textarea (min 8 rows, placeholder "Describe the changes needed...")
//        Character count indicator below textarea
// Buttons: [Cancel] ghost + [Submit Feedback] default (cobalt)
// Validation: reason must be non-empty before submit is enabled
// On submit: call onSubmit(reason), then close dialog
```

**Then replace each native dialog call:**

For `window.confirm()`:
```tsx
// BEFORE
if (window.confirm('Delete this question?')) { deleteQuestion(id) }

// AFTER
const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

// In handler:
setPendingDeleteId(id)
setDeleteDialogOpen(true)

// In JSX:
<DeleteConfirmDialog
  open={deleteDialogOpen}
  onOpenChange={setDeleteDialogOpen}
  onConfirm={() => { deleteQuestion(pendingDeleteId!); setDeleteDialogOpen(false) }}
  title="Delete question"
  description="This action cannot be undone. The question will be permanently removed."
  itemName={getQuestionStem(pendingDeleteId)}
/>
```

For `window.alert()` (errors):
```tsx
// BEFORE
window.alert('Error saving question')

// AFTER
const [error, setError] = useState<string | null>(null)
// ... in catch: setError('Failed to save question. Please try again.')
// ... in JSX:
{error && (
  <div className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
    {error}
  </div>
)}
```

For `window.alert()` (success):
```tsx
// BEFORE
window.alert('Questions imported successfully')

// AFTER
const [success, setSuccess] = useState<string | null>(null)
// ... in JSX:
{success && (
  <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
    {success}
  </div>
)}
```

For `window.prompt()`:
```tsx
// BEFORE
const reason = window.prompt('Reason for requesting changes:')
if (reason) { requestChanges(id, reason) }

// AFTER
<RequestChangesDialog
  open={changesDialogOpen}
  onOpenChange={setChangesDialogOpen}
  onSubmit={(reason) => { requestChanges(selectedArticleId!, reason); setChangesDialogOpen(false) }}
  articleTitle={selectedArticle?.title || ''}
/>
```

**Verify:**
```bash
bun run build
grep -rn "window\.confirm\|window\.alert\|window\.prompt\| confirm(" src/components/admin/ --include="*.tsx"
# Expected: 0 results
```

**Commit:** `fix(admin): replace all 6 native alert/confirm/prompt with Dialog components`

---

### 1.4 — Route Client-Side Mutations Through Server Actions

**ICE Score: 36.0 (Security)**
**Time:** 4–6 hours per component (12–18 hours total, parallelizable)

**What's broken:** `QuestionEditor`, `TaxonomyEditor`, and `AssetUploader` use the browser Supabase client to write directly to tables. This bypasses: (1) server-side auth re-verification, (2) Zod input validation, (3) audit log creation. RLS is the only protection — insufficient for defense-in-depth.

**Action for each component:**

**1.4a — QuestionEditor → Server Actions**

1. Read `src/lib/actions/admin/questions.ts` — check if `createQuestion` and `updateQuestion` already exist
2. If they exist: wire QuestionEditor to call these instead of direct Supabase writes
3. If `updateQuestion` is missing, create it following the existing `createQuestion` pattern:

```tsx
// src/lib/actions/admin/questions.ts
'use server'

import { canManageContent } from '@/lib/auth/permissions'
import { createAdminClient } from '@/lib/supabase/admin'  // or createClient from server
import { questionSchema } from '@/lib/validations/question' // or inline Zod schema
import { revalidatePath } from 'next/cache'

export async function updateQuestion(id: string, data: unknown) {
  await canManageContent() // throws if unauthorized
  const validated = questionSchema.parse(data)
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('questions')
    .update(validated)
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/questions')
  revalidatePath(`/admin/questions/${id}`)
  return { success: true }
}
```

4. In QuestionEditor, replace every direct `supabase.from('questions').insert/update/delete` with the Server Action import

**1.4b — TaxonomyEditor → Server Actions**

1. Create `src/lib/actions/admin/taxonomy.ts` if it doesn't exist:

```tsx
'use server'

export async function createTaxonomyNode(data: unknown) {
  await canManageContent()
  const validated = taxonomyNodeSchema.parse(data)
  // ... insert with createAdminClient()
  revalidatePath('/admin/taxonomy')
  return { success: true }
}

export async function updateTaxonomyNode(id: string, data: unknown) { /* same pattern */ }
export async function deleteTaxonomyNode(id: string) { /* same pattern */ }
export async function moveTaxonomyNode(id: string, newParentId: string) { /* same pattern */ }
```

2. Wire TaxonomyEditor to use these actions

**1.4c — AssetUploader → Server Actions**

1. Create `src/lib/actions/admin/assets.ts`:

```tsx
'use server'

export async function uploadAsset(formData: FormData) {
  await canManageContent()
  // Extract file from FormData
  // Upload to Supabase Storage
  // Insert metadata row
  revalidatePath('/admin/assets')
  return { success: true }
}

export async function updateAssetMetadata(id: string, data: unknown) { /* ... */ }
export async function deleteAsset(id: string) { /* ... */ }
```

**Verify per component:**
```bash
bun run build
# Should have zero direct browser client mutation calls:
grep -rn "\.insert\|\.update\|\.delete\|\.upsert" src/components/admin/QuestionEditor.tsx | grep -v "import\|//"
grep -rn "\.insert\|\.update\|\.delete\|\.upsert" src/components/admin/TaxonomyEditor.tsx | grep -v "import\|//"
grep -rn "\.insert\|\.update\|\.delete\|\.upsert" src/components/admin/AssetUploader.tsx | grep -v "import\|//"
```

**Commit:** `fix(admin): route all client mutations through Server Actions with auth + audit`

---

### 1.5 — Add Page-Level Auth Guards

**ICE Score: 7.2**
**Time:** 30 minutes

**What's broken:** `/admin/questions/new` and `/admin/questions/import` rely solely on layout-level auth. A direct URL access could bypass if Next.js layout caching behaves unexpectedly.

**Action:**

For each file — `src/app/admin/questions/new/page.tsx` and `src/app/admin/questions/import/page.tsx`:

```tsx
import { canManageContent } from '@/lib/auth/permissions'
import { redirect } from 'next/navigation'

export default async function Page() {
  const hasAccess = await canManageContent()
  if (!hasAccess) redirect('/admin')

  return (
    // ... existing page content
  )
}
```

**Verify:** `bun run build`

**Commit:** `fix(admin): add page-level auth guards to question write routes`

---

### PHASE 1 GATE

```bash
bun run build                    # MUST pass — zero errors

# All critical bugs fixed:
grep -rn "window\.confirm\|window\.alert\|window\.prompt" src/components/admin/ --include="*.tsx"
# Expected: 0

grep -rn "'id, title, author_id, submitted_at'" src/ --include="*.tsx"
# Expected: 0

# Manual tests:
# 1. /admin/reviews — shows actual pending articles (not empty)
# 2. /admin/questions/new — saves with 4 options
# 3. Delete a question — Dialog appears, not browser alert
# 4. Request changes on a review — Dialog with Textarea appears
```

**Do NOT proceed to Phase 2 until every check passes.**

---

## PHASE 2 — FIX BROKEN ROUTES & DATA LAYER (2–3 days)

Phase 2 eliminates every 404, every silently-broken feature, and every data layer violation.

---

### 2.1 — Create Missing Asset Management Routes

**Time:** 1 day

**What's broken:** `AssetList` component contains links to `/admin/assets/new` and `/admin/assets/[id]` — neither page exists. Both return 404. The entire asset management workflow beyond listing is non-functional.

**2.1a — Create `src/app/admin/assets/new/page.tsx`**

```tsx
import { Metadata } from 'next'
import { canManageContent } from '@/lib/auth/permissions'
import { redirect } from 'next/navigation'
import { AssetUploadForm } from '@/components/admin/AssetUploadForm'

export const metadata: Metadata = {
  title: 'Upload Asset | SlateCamp Admin',
}

export default async function AssetNewPage() {
  const hasAccess = await canManageContent()
  if (!hasAccess) redirect('/admin')

  return <AssetUploadForm />
}
```

**2.1b — Create `src/components/admin/AssetUploadForm.tsx`**

```tsx
'use client'

// Form fields (from UX plan wireframe):
// - Name: text input (required)
// - Description: textarea
// - File: file picker accepting .glb, .gltf, .fbx
// - Linked taxonomy node: TaxonomyPicker component (if available, otherwise Select)
// - Model phase: Select with options [Guided, Faded, Sandbox, Challenge]
// - Thumbnail: auto-generate or manual upload
//
// Buttons: [Cancel → /admin/assets] + [Upload Asset → uploadAsset Server Action]
// On success: redirect to /admin/assets/[newId] or /admin/assets
// On error: inline error message below form
```

**2.1c — Create `src/app/admin/assets/[id]/page.tsx`**

```tsx
import { Metadata } from 'next'
import { canManageContent } from '@/lib/auth/permissions'
import { redirect, notFound } from 'next/navigation'
import { AssetDetailView } from '@/components/admin/AssetDetailView'
// import query function to get asset by id

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  return { title: 'Asset Detail | SlateCamp Admin' }
}

export default async function AssetDetailPage({ params }: { params: { id: string } }) {
  const hasAccess = await canManageContent()
  if (!hasAccess) redirect('/admin')

  // Fetch asset data
  const asset = await getAsset(params.id)
  if (!asset) notFound()

  return <AssetDetailView asset={asset} />
}
```

**2.1d — Create `src/components/admin/AssetDetailView.tsx`**

```tsx
'use client'

// Layout (from UX plan wireframe):
// - Asset name + DM Mono eyebrow "3D ASSET"
// - File info: filename, size, upload date
// - Linked taxonomy node with link to /admin/taxonomy
// - "Used in" section: trail steps and wiki articles referencing this asset
// - 3D model preview placeholder (or actual Three.js viewer if available)
//
// Actions: [Edit metadata → inline form] [Replace file → file picker] [Delete → DeleteConfirmDialog]
```

**2.1e — Fix AssetList dead links**

Open `src/components/admin/AssetList.tsx`. Verify links point to `/admin/assets/new` and `/admin/assets/${id}`. If using hardcoded paths, ensure they match.

**Verify:**
```bash
bun run build
# /admin/assets — "Upload" button navigates without 404
# /admin/assets/[any-existing-id] — loads without 404
```

**Commit:** `feat(admin): create asset management routes — /assets/new and /assets/[id]`

---

### 2.2 — Fix Article Editor Preview Tab

**Time:** 4 hours

**What's broken:** The Preview tab renders MDX through a standalone processor instead of `WikiArticleRenderer` — the student-facing component. SMEs can't see what students actually see.

**Action:**

1. Find the article editor component:
```bash
grep -rn "WikiArticleRenderer\|PreviewTab\|preview.*tab" src/app/admin/articles/ src/components/admin/ --include="*.tsx" -l
```

2. In the Preview tab, replace the standalone MDX renderer with:

```tsx
import { WikiArticleRenderer } from '@/components/wiki/WikiArticleRenderer'

// In the Preview tab content:
<div className="space-y-4">
  <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
    Student View — exactly what students see
  </div>
  <WikiArticleRenderer
    content={articleContent}
    isPreview={true}
  />
</div>
```

3. Apply the same fix to `/admin/articles/new` if it has a preview tab

**Verify:** `bun run build`. Open article editor → Preview tab → should render identically to student wiki.

**Commit:** `fix(admin): article preview now uses WikiArticleRenderer for student-view parity`

---

### 2.3 — Fix Search Page — Debounce + Error Handling

**Time:** 1–2 hours

**What's broken:** No debounce. Every keystroke fires 3 Supabase queries (questions + articles + taxonomy). Empty `catch {}` block silently swallows errors — users see blank results with no explanation.

**Action:**

1. Open `src/app/admin/search/page.tsx`

2. Add debounce:

```tsx
// Option A: useDeferredValue
import { useDeferredValue } from 'react'
const deferredQuery = useDeferredValue(searchQuery)

useEffect(() => {
  if (deferredQuery.length < 2) return
  performSearch(deferredQuery)
}, [deferredQuery])

// Option B: setTimeout with cleanup
useEffect(() => {
  if (query.length < 2) { setResults([]); return }
  const timer = setTimeout(() => performSearch(query), 300)
  return () => clearTimeout(timer)
}, [query])
```

3. Fix empty catch block:

```tsx
// BEFORE
catch {}

// AFTER
catch (error) {
  console.error('Admin search error:', error)
  setSearchError('Search failed — please try again.')
}
```

4. Add error display:

```tsx
{searchError && (
  <div className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive mt-2">
    {searchError}
  </div>
)}
```

5. If the page has `'use client'` directly on it, extract to `SearchClient.tsx` and make the page a Server Component with metadata.

**Verify:**
```bash
bun run build
grep -rn "catch {}" src/app/admin/ --include="*.tsx"
# Expected: 0
```

**Commit:** `fix(admin): add 300ms debounce to search, surface errors to user`

---

### 2.4 — Fix Activity Page — Extract Inline Query

**Time:** 1 hour

**What's broken:** Direct inline Supabase call with `select('*')` in the page file. Should be in a query file with explicit columns.

**Action:**

1. Create `src/lib/queries/admin/activity-queries.ts`:

```tsx
import { createClient } from '@/lib/supabase/server'

export async function getRecentActivity(limit = 50) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('audit_log')
    .select('id, action, user_id, target_type, target_id, created_at, metadata')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) return { data: null, error: error.message }
  return { data, error: null }
}
```

2. Update `src/app/admin/activity/page.tsx` to import from query file

**Verify:**
```bash
bun run build
grep -rn "select\('\*'\)" src/app/admin/ --include="*.tsx"
# Expected: 0
```

**Commit:** `fix(admin): extract activity query to query layer, replace select('*')`

---

### 2.5 — Add Missing Metadata Exports

**Time:** 30 minutes

Add `metadata` export to every admin page that's missing one:

| Page File | Title |
|-----------|-------|
| `admin/questions/new/page.tsx` | `Create Question \| SlateCamp Admin` |
| `admin/questions/[id]/page.tsx` | `Edit Question \| SlateCamp Admin` |
| `admin/questions/import/page.tsx` | `Import Questions \| SlateCamp Admin` |
| `admin/articles/new/page.tsx` | `Create Article \| SlateCamp Admin` |
| `admin/articles/[id]/page.tsx` | `Edit Article \| SlateCamp Admin` |
| `admin/search/page.tsx` | `Search \| SlateCamp Admin` |
| `admin/activity/page.tsx` | `Activity \| SlateCamp Admin` |
| `admin/assets/new/page.tsx` | `Upload Asset \| SlateCamp Admin` (added in 2.1) |
| `admin/assets/[id]/page.tsx` | `Asset Detail \| SlateCamp Admin` (added in 2.1) |

**Commit:** `fix(admin): add missing metadata exports to all admin pages`

---

### 2.6 — Remove Dead Code: WikiEditor.tsx

**Time:** 15 minutes

```bash
grep -rn "WikiEditor" src/ --include="*.tsx" --include="*.ts"
```

If zero imports: delete `src/components/admin/WikiEditor.tsx`.

**Commit:** `chore(admin): remove unused WikiEditor.tsx`

---

### PHASE 2 GATE

```bash
bun run build                    # MUST pass

# No 404s:
# /admin/assets/new → loads upload form
# /admin/assets/[id] → loads detail view (or notFound)

# No data violations:
grep -rn "select\('\*'\)" src/app/admin/ --include="*.tsx"       # Expected: 0
grep -rn "catch {}" src/app/admin/ --include="*.tsx"              # Expected: 0
grep -rn "WikiEditor" src/ --include="*.tsx"                      # Expected: 0
```

---

## PHASE 3 — OPERATIONAL EFFICIENCY (3–5 days)

Phase 3 transforms the admin console from "pages that work" into "an operations center that makes admins fast."

---

### 3.1 — Dashboard: NeedsAttentionCard (Zero-Click Triage)

**Time:** 4 hours

**Create `src/components/admin/NeedsAttentionCard.tsx`:**

A Server Component that queries:
1. `COUNT(*) FROM wiki_articles WHERE status = 'pending_review'` → pending reviews
2. `COUNT(*) FROM questions WHERE rationale IS NULL` → missing rationales
3. `COUNT(*) FROM pipeline_items WHERE status = 'blocked'` → pipeline blocks (if table exists)

Renders at TOP of dashboard, before stats grid:

```tsx
// DM Mono eyebrow: "NEEDS ATTENTION"
// Each item: bullet + count + description + link
// ● 4 articles pending review     [Review queue →]
// ● 2 questions missing rationale  [Filter in questions →]
// ● 0 pipeline blocks              All clear
//
// If ALL counts are zero:
// "All clear — nothing needs immediate attention." (text-muted-foreground, calm)
```

Place in dashboard page above the stats grid.

**Commit:** `feat(admin): add NeedsAttentionCard for zero-click triage on dashboard`

---

### 3.2 — Sidebar Nav Badges

**Time:** 2 hours

Add server-rendered badge counts to sidebar navigation items:

```tsx
// Reviews nav item:
<NavItem href="/admin/reviews" badge={pendingReviewCount}>
  Reviews
</NavItem>

// Badge rendering:
{badge > 0 && (
  <span className="ml-auto inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 font-mono text-[11px] font-medium text-amber-800 tabular-nums">
    {badge > 99 ? '99+' : badge}
  </span>
)}
```

Badges only render when count > 0. Max display: 99+. Counts fetched server-side in the layout.

**Commit:** `feat(admin): add queue count badges to sidebar navigation`

---

### 3.3 — Question Editor: WYSIWYG Preview Panel

**Time:** 1–2 days

**Create `src/components/admin/QuestionPreviewPanel.tsx`:**

```tsx
'use client'

// Props: stem, options, correctAnswer, rationale, codeCitation, difficulty
// Two tab modes: Camp Mode (with rationale visible) and Storm Mode (stripped)
// Uses actual quiz session question component for rendering fidelity
// Live updates as editor fields change

// Layout in QuestionEditor:
// ┌─────────────────────────┬──────────────────────────┐
// │  EDITOR (left 50%)      │  PREVIEW (right 50%)     │
// │  All form fields        │  [Camp Mode] [Storm Mode] │
// │                         │  Actual student rendering  │
// └─────────────────────────┴──────────────────────────┘
// Below 1024px: stack vertically
```

Integrate into QuestionEditor as a split-pane layout using CSS Grid.

**Commit:** `feat(admin): add WYSIWYG preview panel to question editor (Camp + Storm modes)`

---

### 3.4 — Bulk Actions for DataTables

**Time:** 1 day

**Create `src/components/admin/BulkActionBar.tsx`:**

```tsx
'use client'

// Props: selectedCount, onDelete, onStatusChange(status), onExport
// Floating bar (sticky bottom): "12 items selected — [Delete] [Change Status ▾] [Export CSV]"
// Delete → DeleteConfirmDialog with count
// Status dropdown: Draft / Review / Published
```

**Add checkbox column to Questions and Articles DataTables.** Header: select-all with indeterminate. When any rows selected: render BulkActionBar.

**Create bulk Server Actions in `src/lib/actions/admin/bulk.ts`:**
- `bulkDeleteQuestions(ids: string[])`
- `bulkDeleteArticles(ids: string[])`
- `bulkUpdateStatus(table, ids, status)`
- `bulkExportCSV(table, ids)` → returns CSV string

**Commit:** `feat(admin): add bulk actions (delete, status change, export) to DataTables`

---

### 3.5 — Quality Indicators in Questions List

**Time:** 4 hours

Add columns to questions DataTable:

| Column | Display | Filter |
|--------|---------|--------|
| Rationale | ✓ (emerald) or `MISSING` (muted) | Yes |
| Citation | ✓ (emerald) or `MISSING` (muted) | Yes |
| Difficulty | ●●●○ (filled dots 1–4) | Yes |

Add filter dropdowns above DataTable. Badge styling: `font-mono text-[11px]`.

**Commit:** `feat(admin): add quality indicators and filters to questions DataTable`

---

### 3.6 — SME Review Queue: Full UX Rebuild

**Time:** 4 hours

Now that the query is fixed (Phase 1), build the proper review UX:

1. Review card layout per pending article (see wireframe in UX plan Part 8)
2. "Preview ↗" opens student wiki URL in new tab
3. "Approve ✓" → ApproveDialog → status to `published`
4. "Request Changes ✗" → RequestChangesDialog → saves notes, resets to `draft`
5. Sort controls: Oldest first (default), Newest, Priority
6. Empty state: `EmptyState` with icon + "No articles pending review." + 2 CTAs

**Commit:** `feat(admin): complete review queue with Dialog-based approve/reject + empty state`

---

### 3.7 — Articles List: Coverage Health Columns

**Time:** 2 hours

Add to articles DataTable:
- **Questions** column: count linked to article's taxonomy node
- **Coverage** badge: "Complete" or `GAPS` (muted)
- **Status** column: Published / Draft / Review — text label, not color-only

**Commit:** `feat(admin): add question count and coverage columns to articles DataTable`

---

### PHASE 3 GATE

```bash
bun run build                    # MUST pass

# Dashboard has NeedsAttentionCard
# Sidebar has badge counts
# Question editor has split-pane preview
# DataTables have checkbox + bulk actions
# Questions list has quality indicators
# Review queue has Dialogs + empty state
# Articles list has coverage columns
```

---

## PHASE 4 — PERFORMANCE & ARCHITECTURE (1 day)

---

### 4.1 — Optimize Taxonomy Coverage Query

Replace fetch-all-then-count with database aggregate:

```sql
SELECT taxonomy_node_id, COUNT(*) as question_count
FROM questions
GROUP BY taxonomy_node_id
```

Extract to proper query function.

**Commit:** `perf(admin): optimize taxonomy coverage with database aggregate`

---

### 4.2 — Fix AdminMDXEditor useEffect Dependency

Find and fix the useEffect with missing dependencies. Add or wrap with `useCallback`.

**Commit:** `fix(admin): fix AdminMDXEditor useEffect missing dependency`

---

### 4.3 — Extract 'use client' from Page Components

```bash
grep -rn "^'use client'" src/app/admin/ --include="page.tsx"
```

For each: extract to `*Client.tsx`, make page a Server Component, add metadata, wrap with Suspense.

**Commit:** `refactor(admin): extract client logic from page components`

---

### PHASE 4 GATE

```bash
bun run build                    # MUST pass
```

---

## PHASE 5 — DESIGN SYSTEM COMPLIANCE (1 day)

---

### 5.1 — Fix text-[9px] → text-[11px]

```bash
grep -rn "text-\[9px\]" src/components/admin/ src/components/portal/ --include="*.tsx"
```

Replace every instance. Preserve visual weight with `uppercase tracking-widest font-mono`.

**Commit:** `fix(admin): enforce 11px minimum on all readable text`

---

### 5.2 — Fix rounded-xl in Loading Skeletons

Match each skeleton's border radius to its rendered component.

**Commit:** `fix(admin): match skeleton border radius to rendered components`

---

### 5.3 — Fix Login Page zinc-* → Slatecamp tokens

| Current | Replace With |
|---------|-------------|
| `bg-zinc-900` | `bg-[#1A2332]` or CSS variable |
| `text-zinc-400` | `text-[#8896A7]` |

Preserve admin red topbar `#6B1A1A`.

**Commit:** `fix(admin): replace zinc-* with Campfire design tokens on login page`

---

### 5.4 — Fix Hardcoded Hex in AdminMDXEditor

Replace hardcoded hex with CSS variables: `var(--sc-cobalt)`, `var(--sc-cream)`, etc.

**Commit:** `fix(admin): replace hardcoded hex with CSS variables in AdminMDXEditor`

---

### 5.5 — Typography: Numbers in DM Mono

Apply `font-mono font-medium tabular-nums` to all dynamic numbers: dashboard stats, sidebar badges, DataTable counts, analytics.

**Commit:** `fix(admin): apply DM Mono tabular-nums to all numeric displays`

---

### 5.6 — Accessibility Fixes

| Fix | Details |
|-----|---------|
| Icon-only buttons | `aria-label="Edit article: {title}"` |
| Table headers | `scope="col"` on all `<th>` |
| Color-only status | Pair color with text label |
| Search input | `aria-label` |
| DataTable updates | `aria-live="polite"` |
| Touch targets | 44×44px minimum |
| Form labels | Visually hidden `<label>` where placeholder-only |

**Commit:** `fix(admin): accessibility — aria-labels, scope, aria-live, touch targets`

---

### PHASE 5 GATE (FINAL)

```bash
bun run build                    # MUST pass — ZERO errors

# Typography:
grep -rn 'text-\[9px\]\|text-\[10px\]\|text-\[8px\]' src/app/admin/ src/components/admin/ src/components/portal/ --include="*.tsx"
# Expected: 0

# Native dialogs:
grep -rn "window\.confirm\|window\.alert\|window\.prompt" src/components/admin/ --include="*.tsx"
# Expected: 0

# Client mutations:
grep -rn "supabase\.from.*\.insert\|supabase\.from.*\.update\|supabase\.from.*\.delete" src/components/admin/ --include="*.tsx"
# Expected: 0

# select('*'):
grep -rn "select\('\*'\)" src/app/admin/ --include="*.tsx"
# Expected: 0

# Dead code:
grep -rn "WikiEditor" src/ --include="*.tsx"
# Expected: 0

# Color tokens:
grep -rn "zinc-" src/app/admin/ --include="*.tsx"
# Expected: 0

# Empty catch:
grep -rn "catch {}" src/app/admin/ --include="*.tsx"
# Expected: 0
```

---

## DEPENDENCY GRAPH

```
Phase 0 ─── Reconnaissance (no code changes)
    │
Phase 1 ─── Critical Blockers (HARD PREREQUISITE)
    │         ├── 1.1 SMEReviewQueue columns
    │         ├── 1.2 QuestionEditor 4 options
    │         ├── 1.3 Dialog replacements
    │         ├── 1.4 Server Actions (longest)
    │         └── 1.5 Auth guards
    │
Phase 2 ─── Fix Broken Routes + Data Layer
    │         ├── 2.1 Asset routes
    │         ├── 2.2 Article preview
    │         ├── 2.3 Search debounce
    │         ├── 2.4 Activity query
    │         ├── 2.5 Metadata
    │         └── 2.6 Dead code
    │
Phase 3 ─── Operational Efficiency
    │         ├── 3.1 Dashboard triage
    │         ├── 3.2 Sidebar badges
    │         ├── 3.3 Question preview (depends on 1.2)
    │         ├── 3.4 Bulk actions
    │         ├── 3.5 Quality indicators
    │         ├── 3.6 Review queue UX (depends on 1.1 + 1.3)
    │         └── 3.7 Articles coverage
    │
Phase 4 ─── Performance + Architecture
    │         ├── 4.1 Coverage query
    │         ├── 4.2 MDXEditor useEffect
    │         └── 4.3 Client/server extraction
    │
Phase 5 ─── Design System Compliance
              ├── 5.1 text-[9px] fix
              ├── 5.2 Skeleton radii
              ├── 5.3 Login page tokens
              ├── 5.4 MDXEditor hex
              ├── 5.5 DM Mono numbers
              └── 5.6 Accessibility
```

All sub-tasks within each phase are parallelizable.

---

## NEW FILES CREATED

### Components (8)

| File | Phase | Purpose |
|------|-------|---------|
| `src/components/admin/DeleteConfirmDialog.tsx` | P1 | Replace window.confirm for deletes |
| `src/components/admin/ApproveDialog.tsx` | P1 | Replace window.confirm for article approval |
| `src/components/admin/RequestChangesDialog.tsx` | P1 | Replace window.prompt for rejection feedback |
| `src/components/admin/AssetUploadForm.tsx` | P2 | Form for /admin/assets/new |
| `src/components/admin/AssetDetailView.tsx` | P2 | View for /admin/assets/[id] |
| `src/components/admin/NeedsAttentionCard.tsx` | P3 | Zero-click triage on dashboard |
| `src/components/admin/QuestionPreviewPanel.tsx` | P3 | Camp/Storm mode live preview |
| `src/components/admin/BulkActionBar.tsx` | P3 | Floating multi-select action bar |

### Pages (2)

| File | Phase |
|------|-------|
| `src/app/admin/assets/new/page.tsx` | P2 |
| `src/app/admin/assets/[id]/page.tsx` | P2 |

### Server Actions (3 files)

| File | Phase | Functions |
|------|-------|-----------|
| `src/lib/actions/admin/taxonomy.ts` | P1 | createNode, updateNode, deleteNode, moveNode |
| `src/lib/actions/admin/assets.ts` | P1 | uploadAsset, updateAssetMetadata, deleteAsset |
| `src/lib/actions/admin/bulk.ts` | P3 | bulkDelete*, bulkUpdateStatus, bulkExportCSV |

### Query Files (1)

| File | Phase |
|------|-------|
| `src/lib/queries/admin/activity-queries.ts` | P2 |

### Deleted (1)

| File | Reason |
|------|--------|
| `src/components/admin/WikiEditor.tsx` | Unused — AdminMDXEditor is used |

---

## TOTAL EFFORT

| Phase | Sequential | Parallelized |
|-------|-----------|-------------|
| P0 Reconnaissance | 30 min | 30 min |
| P1 Critical Blockers | 2–3 days | 1–2 days |
| P2 Broken Routes | 2–3 days | 1–2 days |
| P3 Operational Efficiency | 3–5 days | 2–3 days |
| P4 Performance | 1 day | 4 hours |
| P5 Design System | 1 day | 4 hours |
| **Total** | **10–14 days** | **5–8 days** |

---

## SUCCESS CRITERIA

When complete, ALL must be true:

1. ✅ `bun run build` passes — zero errors
2. ✅ All 22 routes load without 404
3. ✅ Review queue shows real pending articles
4. ✅ Questions save with 4 options
5. ✅ Assets can be uploaded, viewed, edited, deleted
6. ✅ Zero native browser dialogs
7. ✅ Zero client-side direct mutations
8. ✅ Zero select('*'), zero empty catch blocks
9. ✅ Zero text-[9px], zero zinc-*, zero hardcoded hex
10. ✅ Page-level auth on all write routes
11. ✅ aria-labels on icon buttons, scope on th, aria-live on dynamic content
12. ✅ Dashboard has zero-click triage card
13. ✅ Sidebar has queue count badges
14. ✅ Question editor has live preview
15. ✅ DataTables have bulk actions

---

*SlateCamp Admin Routes — Definitive Implementation Plan v1.0*
*March 25, 2026*
*Execute with Claude Code. One phase at a time. `bun run build` at every gate.*

