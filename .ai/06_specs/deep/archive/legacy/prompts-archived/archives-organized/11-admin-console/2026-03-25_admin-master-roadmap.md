# SlateCamp Admin Console — Master Execution Roadmap

> **Version:** 3.0 — Consolidated from 8 planning documents
> **Date:** 2026-03-25
> **Scope:** Complete UX/UI overhaul of all `/admin` routes including the Unified Content Editor
> **Target:** Claude Code execution — paste this file as the single source of truth

---

## How This Document Works

This is the **only roadmap you need.** It consolidates and supersedes:

| Document | What it contributed | Status |
|---|---|---|
| `ADMIN-CONSOLE-AUDIT-V2.md` | Ground truth: 19 routes, 10 components, 7 portal components, 11 queries, 6 server actions, all bugs | Absorbed into Phases 0–1 |
| `ADMIN-CONSOLE-BUILD.md` | Security hardening, MDX editor build, question manager | Absorbed into Phases 0–4 |
| `ADMIN-CONSOLE-REBUILD.md` | 10-phase rebuild: layout, dashboard, questions, articles, taxonomy, quality, activity, settings | Absorbed into Phases 2–7 |
| `ADMIN-CONSOLE-PROTOTYPE.html` | Visual prototype: red topbar, dashboard, tables, coverage, pipeline | Referenced throughout as visual target |
| `UNIFIED-CONTENT-EDITOR.md` | Data model, query logic, save behavior, 7 implementation phases | Absorbed into Phase 8 |
| `UNIFIED-CONTENT-EDITOR-UX-PLAN.md` | 650-line UX spec: every component, state, edge case, keyboard shortcut | Absorbed into Phase 8 (UX plan is law) |
| `ADMIN-CONSOLE-PROMPT.md` | Claude Code execution prompt for admin rebuild | Superseded by this document |
| `UNIFIED-EDITOR-PROMPT-V2.md` | Claude Code execution prompt for unified editor | Superseded by this document |
| Document 1 (Zustand split-pane) | Earlier iteration proposing Zustand state management | Superseded by React Context dirty state approach |

**Conflict resolution rule:** When any source document contradicts another, the UX plan (`UNIFIED-CONTENT-EDITOR-UX-PLAN.md`) wins for unified editor decisions, and the audit (`ADMIN-CONSOLE-AUDIT-V2.md`) wins for current-state facts.

---

## Architecture At A Glance

```
/admin                            LOGIN (public, no chrome)
/admin/dashboard                  COMMAND CENTER (stats, health, activity, quick actions)
/admin/questions                  QUESTION BANK (list, create, edit, import, analytics)
/admin/articles                   ARTICLE LIBRARY (list, create, MDX editor)
/admin/content/[id]               UNIFIED EDITOR ★ (article + questions side-by-side)
/admin/content/new                UNIFIED EDITOR — new article
/admin/taxonomy                   TAXONOMY (tree editor, coverage heatmap)
/admin/assets                     3D ASSETS (upload, list)
/admin/reviews                    SME REVIEW QUEUE
/admin/pipeline                   PUBLISHING PIPELINE (kanban: draft → review → published)
/admin/search                     CROSS-CONTENT SEARCH
/admin/audit                      AUDIT LOG (super_admin)
/admin/activity                   ACTIVITY FEED
/admin/settings                   ROLE MANAGEMENT (super_admin)
```

**22 unique routes** (19 existing + 3 new). The Unified Content Editor at `/admin/content/[id]` is the flagship innovation — a new route, not a replacement for `/admin/articles/[id]`.

---

## Visual Identity

Both admin and developer portals share the same layout DNA. The difference is accent color.

| Element | Admin Console | Developer Portal |
|---|---|---|
| Topbar background | `#6B1A1A` (deep red) | `#0F1F5C` (navy) |
| Nav active indicator | `border-left: #B91C1C` | `border-left: #1B3FC4` |
| Nav active background | `#FEF2F2` (red-light) | `#EEF2FC` (primary-light) |
| Primary ACTION buttons | **Cobalt Blue `#1B3FC4`** | Cobalt Blue `#1B3FC4` |

**Red is chrome, not action.** Using red for "Save" buttons would feel destructive. The admin identity lives in the topbar and sidebar accents.

### Admin CSS Variables (scoped to admin layout)

```css
--admin-accent: #B91C1C;
--admin-accent-light: #FEF2F2;
--admin-accent-hover: #991B1B;
--admin-topbar: #6B1A1A;
--admin-topbar-border: rgba(255,255,255,0.06);
```

---

## The 10-Phase Execution Plan

### Dependency Graph

```
Phase 0 ─── Security Hardening (no UI, backend only)
    │
Phase 1 ─── Bug Fixes & Design Debt (audit resolution)
    │
Phase 2 ─── Portal Shell & Layout (PortalLayout, AdminShell, nav)
    │
    ├── Phase 3 ─── Dashboard Rebuild
    │
    ├── Phase 4 ─── Questions Management Upgrade
    │       │
    │       └── Phase 5 ─── Article Management Upgrade
    │               │
    │               └── Phase 8 ─── Unified Content Editor ★ (7 sub-phases)
    │
    ├── Phase 6 ─── Taxonomy & Assets
    │
    └── Phase 7 ─── Quality, Activity, Settings
            │
            Phase 9 ─── Command Palette & Final Polish
```

Phases 3–7 can be parallelized after Phase 2. Phase 8 depends on Phases 4 and 5 (needs working question and article server actions). Phase 9 is always last.

---

## PHASE 0: Security Hardening

**Goal:** Fix every security issue from the audit before touching any UI. Zero UI changes in this phase.

**Why first:** Client-side mutations bypass server actions in 4 components. Until this is fixed, every new UI feature built on top of broken server actions will need rework.

### 0.1 — Route client-side mutations through server actions

The largest security gap. Four components write directly via browser `createClient()`:

| Component | Current Pattern | Fix |
|---|---|---|
| `QuestionEditor.tsx` | `.insert()` / `.update()` via browser client | Call `createQuestion` / new `updateQuestion` server action |
| `TaxonomyEditor.tsx` | `.update()` / `.insert()` / `.delete()` via browser client | Create `updateTaxonomyNode` / `createTaxonomyNode` / `deleteTaxonomyNode` server actions |
| `AssetUploader.tsx` | `.insert()` into `models_3d` + storage upload via browser client | Create `createAsset` / `uploadAssetFile` server actions |
| `SMEReviewQueue.tsx` | `.update()` on `wiki_articles` via browser client | Create `updateArticleReviewStatus` server action |

Every new server action must:
1. Start with `canManageContent()` auth check
2. Validate input with Zod schema
3. Use `createAdminClient()` (service role) for the database write
4. Populate `updated_by` with authenticated user ID

### 0.2 — Add page-level auth guards to question write routes

Currently missing on `/admin/questions/new`, `/admin/questions/[id]`, `/admin/questions/import`. An `sme_reviewer` can access these pages (should only review, not create/edit).

```typescript
// Add to each page.tsx:
if (!(await canManageContent())) redirect('/admin/dashboard')
```

### 0.3 — Fix `assignRole` / `revokeRole` client type

`src/lib/actions/admin/roles.ts` uses `createClient()` (user session) instead of `createAdminClient()` for role management. Fix to use service role client.

### 0.4 — Add input validation to wiki server actions

`updateWikiArticle` and `createWikiArticle` lack Zod validation. Add schemas:

```typescript
const WikiArticleSchema = z.object({
  title: z.string().min(1).max(500),
  content: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
  status: z.enum(['draft', 'review', 'published']).optional(),
  difficulty_label: z.enum(['Foundational', 'Intermediate', 'Advanced']).optional(),
  // ... remaining fields
})
```

### 0.5 — Create `updateQuestion` server action

Check if `updateQuestion(id, data)` exists in `src/lib/actions/admin/questions.ts`. If not, create it following the `createQuestion` pattern. The Unified Content Editor (Phase 8) depends on this.

### 0.6 — Align option count: 4, not 5

`QuestionEditor` initializes with 5 options but `createQuestion` validates exactly 4. Standardize on **4 options (A/B/C/D)** everywhere:
- Update `QuestionEditor.tsx` default state to 4 options
- Keep `createQuestion` validation at 4
- New `updateQuestion` validates 4

### 0.7 — Attribution columns migration

```sql
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);
ALTER TABLE public.wiki_articles ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);
ALTER TABLE public.wiki_articles ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);
ALTER TABLE public.models_3d ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);
ALTER TABLE public.models_3d ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);
```

Update all server actions to populate these on insert/update.

### 0.8 — Fix SMEReviewQueue column references

`SMEReviewQueue.tsx:34` queries `.select('id, title, author_id, submitted_at')` but actual columns are `article_id`, `title`, `status`, `updated_at`. Fix the select statement.

**`bun run build` — confirm zero errors before Phase 1.**

---

## PHASE 1: Bug Fixes & Design System Debt

**Goal:** Resolve every non-security issue from the audit. Clean slate before layout work.

### 1.1 — Replace native `alert()` / `confirm()` / `prompt()` (5 locations)

| Component | Line | Current | Replacement |
|---|---|---|---|
| `QuestionEditor.tsx` | 3 instances | `alert()` for errors | Toast notification or Dialog |
| `TaxonomyEditor.tsx` | 1 instance | `confirm()` for delete | Dialog with "Keep editing" / "Delete" actions |
| `SMEReviewQueue.tsx` | 2 + 1 instances | `alert()` + `prompt()` for comments | Dialog with textarea input |

Use existing `Dialog` component from `src/components/ui/`.

### 1.2 — Fix `text-[9px]` violations (4 portal components)

Increase to `text-[11px]` in:
- `PortalTopbar.tsx:37`
- `StickyTOC.tsx:44`
- `CopyButton.tsx:26`
- `CodeBlock.tsx:28`

### 1.3 — Fix `rounded-xl` in loading skeletons (3 files)

Change to `rounded-md` in:
- `taxonomy/loading.tsx`
- `reviews/loading.tsx`
- `assets/loading.tsx`

### 1.4 — Add search debounce (content search page)

`src/app/admin/search/page.tsx:45` fires queries on every keystroke. Add 300ms debounce.

### 1.5 — Fix search error swallowing

`src/app/admin/search/page.tsx:84` has empty `catch { }`. Add error state and display.

### 1.6 — Fix dead asset links

`AssetList` links to `/admin/assets/new` and `/admin/assets/[id]` — neither exists. Either create stub routes or remove the links and handle upload/edit inline.

### 1.7 — Add missing metadata

Add `export const metadata` to: `questions/new`, `questions/[id]`, `questions/import`, `articles/new`, `articles/[id]`, `search`.

### 1.8 — Fix AdminMDXEditor useEffect dependency

Add `slugManuallyEdited` to the dependency array at line 240.

### 1.9 — Optimize coverage data query

`src/lib/actions/admin/coverage.ts:63-64` fetches all question rows to count per topic. Use a group-by query or RPC instead.

### 1.10 — Move activity page inline query to dedicated function

`src/app/admin/activity/page.tsx:83-88` has direct Supabase query. Move to `src/lib/actions/admin/activity.ts` and select specific columns instead of `select('*')`.

### 1.11 — Update login page colors

Replace `zinc-*` Tailwind classes with Slatecamp tokens (`bg-[#F8F7F5]`, semantic text colors).

### 1.12 — Remove unused WikiEditor component

Confirm `src/components/admin/WikiEditor.tsx` is not imported anywhere, then delete it.

**`bun run build` — confirm zero errors before Phase 2.**

---

## PHASE 2: Portal Shell & Layout

**Goal:** Establish the shared portal architecture that both admin and developer portals use.

### 2.1 — Verify/create shared portal components

These should already exist in `src/components/portal/`. Verify each is configurable:

| Component | Key Props | Purpose |
|---|---|---|
| `PortalLayout.tsx` | `portalLabel`, `topbarBg`, `accentColor`, `accentLightColor`, `navItems`, `rightContent` | Wrapper composing topbar + sidebar + main |
| `PortalTopbar.tsx` | `portalLabel`, `topbarBg`, `accentColor`, `rightContent` | Sticky header with search, ⌘K trigger |
| `PortalSidebar.tsx` | `navItems`, `accentColor`, `accentLightColor` | Collapsible navigation |
| `CommandPalette.tsx` | Pages index, search callback | ⌘K quick navigation |
| `CodeBlock.tsx` | Standard | Code display |
| `StickyTOC.tsx` | Standard | Table of contents |

If any are hardcoded for one portal, refactor to accept props.

### 2.2 — Rebuild admin layout

```typescript
// src/app/admin/layout.tsx
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

### 2.3 — Admin navigation structure

```
Overview
  ├── Dashboard                /admin/dashboard
Content
  ├── Questions                /admin/questions
  │   ├── All Questions        /admin/questions
  │   ├── Create New           /admin/questions/new
  │   ├── Import               /admin/questions/import
  │   └── Quality Analytics    /admin/questions/analytics
  ├── Articles                 /admin/articles
  │   ├── All Articles         /admin/articles
  │   └── Create New           /admin/articles/new
  └── Content Editor ★         /admin/content (opens TaxonomyPicker → unified editor)
Structure
  ├── Taxonomy                 /admin/taxonomy
  │   ├── Tree Editor          /admin/taxonomy
  │   └── Coverage Map         /admin/taxonomy/coverage
  └── 3D Assets                /admin/assets
Quality
  ├── Review Queue             /admin/reviews
  ├── Publishing Pipeline      /admin/pipeline
  └── Content Search           /admin/search
Activity
  ├── Audit Log                /admin/audit
  └── Activity Feed            /admin/activity
Settings
  └── User Roles               /admin/settings
```

**Innovation:** Add "Content Editor" as a first-class nav item under Content, not buried as a secondary action. This is the flagship feature — it deserves prominent placement.

### 2.4 — Preserve login bypass

`/admin` (login page) renders without portal chrome. Verify the `x-pathname` header mechanism still works.

### 2.5 — Mobile navigation (new)

Add hamburger menu for `<lg` screens. Currently sidebar is `hidden lg:block` with no mobile alternative. Implement as a slide-in drawer triggered by a hamburger icon in the topbar.

**`bun run build` — confirm every existing admin page renders correctly in the new layout.**

---

## PHASE 3: Dashboard Rebuild

**Goal:** Transform the dashboard from a stats page into a correction-priority command center.

### 3.1 — Content health stats (4 cards)

| Card | Query | Display |
|---|---|---|
| Total Questions | `COUNT(*) FROM questions` | Number + monthly trend |
| Total Articles | `COUNT(*) FROM wiki_articles` | Number + published/draft split |
| Published | `WHERE status = 'published'` | Green number |
| Draft | `WHERE status = 'draft'` | Amber number |

Below: horizontal progress bar showing published/draft ratio.

### 3.2 — Content by subject

Query `taxonomy_tree` at level 1. For each subject: count articles (via `wiki_article_taxonomy`), count questions (via `questions.topic_id`). Display as horizontal bar chart or stacked cards.

### 3.3 — Recent activity feed

Last 20 entries from `audit_logs`. Columns: timestamp (relative), actor, event type badge (CREATE=green, UPDATE=blue, DELETE=red), table, record link.

### 3.4 — Quick actions grid

Cards linking to: Create Question, Create Article, **Open Content Editor** (new), Import Questions, Review Queue, Taxonomy Editor.

### 3.5 — Coverage alert (innovation)

**New:** A single prominent alert card that shows the most critical coverage gap — the taxonomy node with the highest `exam_frequency` that has zero questions. One sentence: *"ALE-STRUCT-003-02 (Structural Systems) has high exam frequency but 0 questions."* with a direct link to create content there.

**`bun run build` — confirm zero errors.**

---

## PHASE 4: Questions Management Upgrade

### 4.1 — Questions list with DataTable

Columns: stem (truncated 80 chars), topic (ale_id badge), difficulty (visual bar), citation (badge), updated_at. Filters: taxonomy node, difficulty range, has-citation. Search: full-text on stem. Bulk select with bulk delete. 50 per page.

**Innovation:** Add a "View in context →" column action per question. This links to `/admin/content/[article_id]` for the article linked to that question's `topic_id` via `wiki_article_taxonomy`. Requires a lookup query. This is a navigation entry point for the Unified Editor.

### 4.2 — Question editor rebuild

Rebuild `QuestionEditor` to use server actions (created in Phase 0). 4 options (A/B/C/D), not 5. All fields editable. Use existing Dialog for delete confirmation. Preview using shared QuestionCard component.

### 4.3 — Question import

Keep existing `QuestionImporter`. Add: validation preview table, duplicate detection, topic resolution (ale_id → UUID).

### 4.4 — Question quality analytics

Read-only page: difficulty distribution histogram, coverage gaps (nodes with <5 questions sorted by exam_frequency), questions without rationale, questions without citation, discrimination stats.

**`bun run build` — confirm zero errors.**

---

## PHASE 5: Article Management Upgrade

### 5.1 — Articles list with DataTable

Columns: title, ale_id (via taxonomy junction), status badge, word count, updated_at. Filters: status, subject. Search: title.

**Innovation:** Add "Edit with Questions →" action per article. Links to `/admin/content/[article_id]`. This is the second navigation entry point for the Unified Editor.

### 5.2 — Article MDX editor

The existing `AdminMDXEditor` with CodeMirror + live preview. Verify it works inside the new layout. Ensure:
- Component insertion toolbar with 30+ MDX templates
- Split pane: CodeMirror left, live preview right
- Metadata bar: title, slug, status, ale_id, word count, save button
- Shared MDX components export (`src/components/wiki/mdx-components-shared.ts`)

### 5.3 — Wiki redirect routes

All `/admin/wiki/*` routes redirect to `/admin/articles/*`. Already working — verify they still function.

**`bun run build` — confirm zero errors.**

---

## PHASE 6: Taxonomy & Assets

### 6.1 — Taxonomy tree editor

Keep existing `TaxonomyEditor` (now using server actions from Phase 0). Wrap in new layout.

### 6.2 — Taxonomy coverage heatmap

Visual grid of level-1 and level-2 nodes. Each cell colored by coverage density:
- **Green:** ≥10 questions + published article
- **Amber:** 1–9 questions OR draft article only
- **Gray:** 0 questions, no article
- **Red outline:** High exam_frequency but gray (critical gap)

Click cell → node details, article count, question count, "Edit All" link to Unified Editor.

### 6.3 — 3D assets

Keep existing `AssetUploader` and `AssetList` (now using server actions from Phase 0). Fix dead links from Phase 1.

**`bun run build` — confirm zero errors.**

---

## PHASE 7: Quality, Activity, Settings

### 7.1 — Publishing pipeline (kanban)

Three columns: **Draft** → **In Review** → **Published**. Cards show: title, ale_id, author, last updated, word count. Drag between columns updates `status` via server action. Filter by subject.

Verify `wiki_articles.status` supports `'review'` value. If not, write migration to add it.

### 7.2 — Content search

Single search input, results grouped by type: Questions, Articles, Taxonomy Nodes. ilike search on relevant text fields. Debounced 300ms. Error handling (fixed from Phase 1).

### 7.3 — SME review queue

Keep existing `SMEReviewQueue` (now using server actions from Phase 0, native dialogs replaced from Phase 1). Fix column references from Phase 0.

### 7.4 — Audit log

Keep existing `AuditLogViewer`. Add filters: event_type, table_name, date range. Search by actor email. Expandable rows with `content_snapshot` diff.

### 7.5 — Activity feed

Last 50 content changes. Natural language descriptions: *"Philip updated article 'Roman Architecture' — 2 minutes ago."* Filter by content type, by actor. Polling every 30s or revalidate.

### 7.6 — Admin settings & role management

Super_admin only. List users in `user_roles`. Add role: search by email + select role + assign. Remove role: click to revoke. Show last activity per user.

**`bun run build` — confirm zero errors.**

---

## PHASE 8: Unified Content Editor ★

**This is the most important phase.** A new editing workspace at `/admin/content/[article_id]` that shows article and questions simultaneously.

**The UX Plan (`UNIFIED-CONTENT-EDITOR-UX-PLAN.md`) is law for this phase.** Every interaction, every state, every edge case is defined there. Do not deviate.

### The Problem It Solves

1. **Content drift** — SME updates a fact in the article but forgets to update related questions. Students learn the right thing, then answer the wrong thing "correctly."
2. **Editing blind** — When writing a rationale, the SME can't see the article the question tests. The rationale drifts from the article's language.
3. **Coverage blindness** — An article has 8 sections but questions only test 2. Nobody knows.

### The Data Join

Articles and questions connect through taxonomy, not a direct foreign key:

```sql
-- Article → taxonomy nodes → questions
SELECT q.*
FROM questions q
JOIN wiki_article_taxonomy wat ON q.topic_id = wat.node_id
WHERE wat.article_id = :article_id
ORDER BY q.created_at DESC;

-- Plus EI prompts (direct article_id link):
SELECT * FROM wiki_ei_prompts
WHERE article_id = :article_id ORDER BY sort_order;
```

There is NO `article_id` column on the `questions` table. Respect this relationship.

### Layout Architecture (non-negotiable)

```
┌──────────────────────────────────────────────────────────────────────┐
│  CONTENT BAR (sticky, full width, 64px)                              │
├────────────┬─────────────────────────────┬───────────────────────────┤
│ OUTLINE    │ ARTICLE PANEL               │ QUESTIONS PANEL           │
│ 200px      │ ~55% remaining              │ ~45% remaining            │
│ fixed      │                             │                           │
│            │ Tabs: Editor│Preview│Diff   │ Tabs: Questions│EI Prompts│
│ Headings   │                             │                           │
│ Click→     │ AdminMDXEditor              │ Scrollable question list  │
│ scroll     │ (REUSED, not rebuilt)       │ Collapsed / expanded      │
│            │                             │                           │
│ Question   │ Article Metadata            │ + Add Question            │
│ counts     │ (collapsed by default)     │                           │
└────────────┴─────────────────────────────┴───────────────────────────┘
```

**Why 55/45:** At 1440px with 200px outline, ~650px article / ~530px questions. Both functional. 50/50 makes both uncomfortably narrow.

**Why three columns, not tabs:** Tabs destroy co-presence, which is the entire point.

**Desktop only in v1.** 1440px minimum. Stack panels at <1280px as narrow desktop fallback.

### Sub-Phase 8.1 — Route & Data Layer

**Create route:** `/admin/content/[id]/page.tsx` (Server Component)

```typescript
export default async function UnifiedEditorPage({ params }) {
  if (!(await canManageContent())) redirect('/admin')
  const article = await getArticle(params.id)
  if (!article) notFound()

  const taxonomyLinks = await getArticleTaxonomyNodes(article.article_id)
  const nodeIds = taxonomyLinks.map(l => l.node_id)
  const questions = await getQuestionsByNodeIds(nodeIds)
  const eiPrompts = await getEIPromptsForArticle(article.article_id)
  const primaryNode = taxonomyLinks.find(l => l.is_primary)
  const nodeInfo = primaryNode ? await getTaxonomyNodeInfo(primaryNode.node_id) : null

  return (
    <UnifiedContentEditor
      article={article}
      questions={questions}
      eiPrompts={eiPrompts}
      taxonomyNode={nodeInfo}
      taxonomyLinks={taxonomyLinks}
    />
  )
}
```

**Create new server actions** in `src/lib/actions/admin/content.ts`:
- `getArticleTaxonomyNodes(articleId)` — `SELECT node_id, is_primary FROM wiki_article_taxonomy WHERE article_id = :articleId`
- `getQuestionsByNodeIds(nodeIds)` — `SELECT * FROM questions WHERE topic_id = ANY(:nodeIds) ORDER BY created_at DESC`
- `getTaxonomyNodeInfo(nodeId)` — `SELECT node_id, name, ale_id, level FROM taxonomy_tree WHERE node_id = :nodeId`

**Also create:** `/admin/content/new/page.tsx` — blank editor, no questions until first save + taxonomy link. After save: `router.replace('/admin/content/[new_id]')`.

**Create shell component:** `UnifiedContentEditor.tsx` with three-column layout at correct proportions. Use placeholder content to verify proportions at 1440px before proceeding.

### Sub-Phase 8.2 — Article Panel

**REUSE `AdminMDXEditor`.** Import from `src/components/admin/AdminMDXEditor.tsx` (or via `AdminMDXEditorLoader.tsx` for dynamic import). Do NOT fork. Do NOT rebuild CodeMirror.

Wrap in `ArticlePanel.tsx` component with three tabs:

| Tab | Content |
|---|---|
| **Editor** (default) | AdminMDXEditor as-is |
| **Preview** | Same preview renderer as current editor |
| **Diff** (new) | Session diff comparing `savedContent` vs `currentContent`. Uses `diff` npm package. Green additions, red deletions. Tab label: "Diff (14 changes)" |

Below tabs: collapsible "Article Metadata" section (collapsed by default) containing `ale_tests_you`, `updated_note`, `subject_label`, `reviewer_comments`, `reviewed_by`.

### Sub-Phase 8.3 — Questions Panel

**Highest-risk sub-phase for scope creep.** The collapsed card's information density must be meaningful at a glance.

**Collapsed question card:**
```
● [■■■□□] difficulty   ALE-HIST-001-06   Has citation
What was the primary structural system used in Roman...         [Edit ▾]
```
- ● = amber dot when question has unsaved changes
- Difficulty bar: 5-segment visual (0.0–1.0)
- ALE ID badge: DM Mono
- Citation badge: green "Has citation" when `code_citation` populated
- Missing rationale: amber warning icon
- Stem: first 120 chars truncated

**Expanded question card — 3 collapsible field groups:**

**CORE (always visible on expand):**
- `text` — Question stem textarea (auto-grow)
- `options` — 4 text inputs with radio for `correct_option_id`. Labels A/B/C/D auto-assigned
- `rationale` — Textarea. Amber indicator below 50 chars

**DETAILS (collapsed by default):**
- `explanation` — Textarea
- `code_citation` — Text input. Placeholder: "BP 344 §C.6.3.a"
- `difficulty` — Number input (0.00–1.00) + linked visual bar
- `is_assessment` — Checkbox
- `application_context` — Text input
- `practice_context` — Tag input (comma-separated pills)
- `prompt_image_url` — Text input with thumbnail preview

**METADATA (collapsed, read-only):**
- `question_id` (copyable UUID), `topic_id` + name, `model_id`, `difficulty_rating`, `discrimination_rating`, `created_at`, `updated_at`

**Accordion behavior:** Expanding one collapses the currently open question. Exception: hold `Option/Alt` while clicking to open multiple (power user).

**Group by taxonomy node** when article links to multiple nodes with ale_id headers.

**Empty state:** "No questions for this topic yet." + "Add First Question" button.

**Filter bar:** Appears automatically above 20 questions. Client-side: search by stem, toggle has-rationale/has-citation, difficulty range slider.

### Sub-Phase 8.4 — EI Prompts Tab

EI prompts are inline interactive questions embedded within article text.

Each prompt is a collapsible card. Expanded fields: `insert_after_heading` (with heading validation), `prompt_text`, `reveal_text`, `options` (toggle → option list), `status` (draft/review/published/archived), `is_active`, `sort_order` (drag handle).

**The heading validation helper is critical.** On blur: compare `insert_after_heading` against outline panel's parsed headings. Show ✓ green if found, ⚠️ amber with suggestion if not: *"No matching heading — did you mean: Key Innovations?"*

### Sub-Phase 8.5 — Save All System

**Uses `Promise.allSettled`, NOT `Promise.all`.** Individual failures must not cancel the batch.

**UX flow:**
1. Click "Save All" or ⌘S → button shows spinner + "Saving..."
2. Pre-save summary: *"Saving: 1 article + 3 questions + 1 EI prompt..."*
3. Parallel server action execution
4. **All succeeded:** "Saved ✓" for 1.5s → reset button. Clear all dirty flags. Toast: "All changes saved."
5. **Partial failure:** "Saved with errors" in amber. Persistent error panel (NOT a toast):
   ```
   ⚠️ Saved with errors
   ✓ Article saved
   ✓ 2 questions saved
   ✗ Question "What was the primary..." — Network error.
   ✓ EI Prompt saved
                                 [Retry failed items]
   ```
6. Failed items keep amber dots. Successful items clear dirty state.

**Delete UX — two-step queue:**
1. Click delete → card gets red border + "Delete on next save" + "Undo" button
2. Question remains visible but marked
3. On Save All: deletion executes
4. "Undo" cancels deletion any time before save

**Dirty State Provider** (React Context, not Zustand):

```typescript
type DirtyState = {
  articleDirty: boolean
  questionsDirty: Map<string, boolean>
  eiPromptsDirty: Map<string, boolean>
  newQuestions: QuestionDraft[]
  deletedQuestions: Set<string>
  isAnythingDirty: boolean         // computed
  dirtyCount: number               // computed
  markArticleDirty: () => void
  markQuestionDirty: (id: string) => void
  markEIPromptDirty: (id: string) => void
  addNewQuestion: (draft: QuestionDraft) => void
  queueDelete: (id: string) => void
  undoDelete: (id: string) => void
  resetAllDirty: () => void
}
```

**Unsaved state surfaces:**
| Surface | Treatment |
|---|---|
| Content bar | Amber dot ● + "Unsaved changes" text |
| Modified question cards | Small amber dot in top-right |
| Modified EI prompt cards | Same amber dot |
| Browser tab title | Prefix with "● " |
| Tab close / navigation | `beforeunload` native dialog |

### Sub-Phase 8.6 — Outline Panel

Parse headings from article MDX content in real-time (300ms debounce):

```typescript
const headingRegex = /^(#{2,3})\s+(.+)$/gm
// Output: { level: 2 | 3, text: string, position: number }[]
```

Does NOT parse: H1, H4+, MDX component names, content inside code blocks.

**Click-to-scroll:** Click heading → CodeMirror editor scrolls to that heading position via `view.dispatch({ effects: EditorView.scrollIntoView(position) })`.

**Question count badges:** `3q` per heading — keyword heuristic matching question stems against section content. Tooltip: *"Approximate — based on keyword matching."* Sections with `0q` highlighted in amber.

**EI prompts section:** Below headings. Lists active prompts by `insert_after_heading`. Click → switches questions panel to EI Prompts tab and scrolls to that prompt.

### Sub-Phase 8.7 — Polish

**Priority 1: `beforeunload` warning.** Test on every navigation path: browser back, sidebar nav, tab close, page refresh. Must fire when `isAnythingDirty` is true.

**Priority 2: Error boundaries.** Independent per panel. Article error must NOT crash questions panel:
```
⚠️ Questions panel encountered an error.
The article editor is still functional.
[Reload questions panel]
```

**Priority 3: Loading states.** Save All spinner, preview tab skeleton, new taxonomy node linked → 3 placeholder skeleton question cards.

**Priority 4: Keyboard shortcuts.**
| Shortcut | Action |
|---|---|
| ⌘S | Save All (`event.preventDefault()` to suppress browser save) |
| Escape | Close expanded question card |
| ⌘↵ | In expanded question: save this question only |
| ⌘K | Focus search/filter in questions panel |

**Priority 5: Responsive stacking at <1280px.** Stack outline on top of article, stack article on top of questions. Content bar stays fixed.

**Priority 6: Concurrent editing guard.** Compare `updated_at` on save. If server's `updated_at` is newer than page-load time, show warning before saving.

### New Files Created in Phase 8

```
src/
  app/admin/content/
    [id]/page.tsx                          Server Component, data fetching
    new/page.tsx                           New article shell
  components/admin/unified-editor/
    UnifiedContentEditor.tsx               Root client component, layout
    DirtyStateProvider.tsx                 Context provider
    ContentBar.tsx                         Sticky top bar
    OutlinePanel.tsx                       Left column
    ArticlePanel.tsx                       Center column wrapper
    QuestionsPanel.tsx                     Right column
    QuestionCard.tsx                       Collapsed + expanded states
    QuestionInlineEditor.tsx              All 17 fields, grouped
    EIPromptsPanel.tsx                    EI prompt list
    EIPromptCard.tsx                      Individual EI prompt editor
    SaveAllBar.tsx                        Save summary + error panel
    index.ts                              Re-exports
  lib/actions/admin/
    content.ts                            getArticleTaxonomyNodes,
                                          getQuestionsByNodeIds,
                                          getTaxonomyNodeInfo
```

**`bun run build` after each sub-phase.**

---

## PHASE 9: Command Palette & Final Polish

### 9.1 — Command palette enhancement

Update `CommandPalette.tsx` to index all 22 admin pages + search across questions (by stem), articles (by title), taxonomy nodes (by name/ale_id). Each result shows type badge + title. Enter to navigate.

**Innovation:** Add "recently visited" section at the top of the palette — last 5 admin pages the user accessed, for fast switching during editing sessions.

### 9.2 — Loading states for every route

Create `loading.tsx` with appropriate skeletons for every admin route (15 files). Match the page layout structure.

### 9.3 — Error boundaries

Verify `src/app/admin/error.tsx` catches and displays errors. Add sub-route error boundaries for data-heavy pages.

### 9.4 — Metadata

Verify every admin page has proper Next.js metadata export.

### 9.5 — Dark mode verification

Verify every admin page works in dark mode. Red topbar should darken appropriately.

### 9.6 — Accessibility

- Add `scope="col"` to all table headers
- Add "skip to main content" link for keyboard users
- Verify `aria-label` on all interactive elements

### 9.7 — Performance

- Optimize any remaining `select('*')` queries to select specific columns
- Verify CodeMirror is lazy-loaded with `next/dynamic` and `ssr: false`
- Add `useDebounce` on Markdown parser if typing latency drops below 60fps

**`bun run build` one final time. Confirm zero errors across all 22 routes.**

---

## Critical Rules (Apply to Every Phase)

### Components

1. **USE EXISTING COMPONENTS.** Every Button, Badge, Card, Input, Select, Dialog, Tabs, Tooltip, Skeleton, EmptyState, SectionHeader, SearchInput, DataTable, TaxonomyPicker comes from `src/components/ui/` or `src/components/shared/`. Search the directory before creating anything new.

2. **USE SHARED PORTAL COMPONENTS.** PortalLayout, PortalSidebar, PortalTopbar, CommandPalette come from `src/components/portal/`. Both admin and developer portals use them with different props.

3. **ADMIN-SPECIFIC COMPONENTS go in `src/components/admin/`.** AdminMDXEditor, QuestionImporter, TaxonomyEditor, SMEReviewQueue, and the unified editor family live here.

4. **REUSE AdminMDXEditor.** Import it. Wrap it. Do NOT fork it. Do NOT rebuild CodeMirror.

### Data

5. **READ ACTUAL SOURCE FILES for data shapes.** Check table schemas, query functions, and server action signatures before building any UI. Do not hallucinate column names.

6. **THE DATA JOIN IS THROUGH TAXONOMY.** Articles and questions connect via `wiki_article_taxonomy` → `taxonomy_tree` ← `questions`. There is NO `article_id` column on the questions table.

7. **SERVER ACTIONS FOR ALL MUTATIONS.** No client-side direct Supabase calls. Every create/update/delete goes through a server action with auth check + Zod validation.

### Design

8. **RED IS CHROME, NOT ACTION.** Admin red identity is topbar + nav accents. Primary action buttons stay Cobalt Blue. Destructive buttons use standard destructive variant.

9. **NO `alert()`, `confirm()`, `prompt()`.** Use Dialog component from `src/components/ui/`.

10. **4 OPTIONS PER QUESTION.** A/B/C/D. Not 5.

### Process

11. **`bun run build` AFTER EVERY PHASE.** Non-negotiable. Do not proceed if build fails.

12. **COMMIT AFTER EACH PHASE.** `feat: admin console phase N — [description]`

13. **PRESERVE ALL EXISTING FUNCTIONALITY.** Every current admin feature must work after the rebuild. Question editor, article editor, taxonomy editor, asset uploader, audit log, review queue — all must function identically or better.

---

## Appendix A: Component Inventory (Current State)

### Admin Components (`src/components/admin/`)

| Component | Status | Phase Where Modified |
|---|---|---|
| QuestionEditor.tsx | Active — needs server action migration | Phase 0, 4 |
| QuestionImporter.tsx | Active — keep as-is | Phase 4 |
| TaxonomyEditor.tsx | Active — needs server action migration | Phase 0, 6 |
| AssetUploader.tsx | Active — needs server action migration | Phase 0, 6 |
| AssetList.tsx | Active — fix dead links | Phase 1, 6 |
| SMEReviewQueue.tsx | Active — needs server action migration + column fix | Phase 0, 1, 7 |
| AuditLogViewer.tsx | Active — add filters | Phase 7 |
| AdminMDXEditor.tsx | Active — reuse in unified editor | Phase 5, 8 |
| AdminMDXEditorLoader.tsx | Active — dynamic loader | Phase 5, 8 |
| WikiEditor.tsx | **UNUSED — delete** | Phase 1 |

### Portal Components (`src/components/portal/`)

| Component | Status | Phase Where Modified |
|---|---|---|
| PortalLayout.tsx | Active | Phase 2 (verify) |
| PortalSidebar.tsx | Active | Phase 2 (verify) |
| PortalTopbar.tsx | Active — fix text-[9px] | Phase 1, 2 |
| CommandPalette.tsx | Active | Phase 9 (enhance) |
| CodeBlock.tsx | Active — fix text-[9px] | Phase 1 |
| CopyButton.tsx | Active — fix text-[9px] | Phase 1 |
| StickyTOC.tsx | Active — fix text-[9px] | Phase 1 |

### New Components (Phase 8)

12 new files in `src/components/admin/unified-editor/`. See Phase 8 file list.

---

## Appendix B: Server Actions Inventory

### Existing (verify before using)

| Function | File | Auth | Validation |
|---|---|---|---|
| `createQuestion` | questions.ts | `canManageContent()` | text, options (4), topic_id |
| `deleteQuestions` | questions.ts | `canManageContent()` | IDs array |
| `updateWikiArticle` | wiki.ts | `canManageContent()` | **Needs validation (Phase 0)** |
| `createWikiArticle` | wiki.ts | `canManageContent()` | **Needs validation (Phase 0)** |
| `assignRole` | roles.ts | `canManageUsers()` | UUID regex |
| `revokeRole` | roles.ts | `canManageUsers()` | roleId |

### New (create during execution)

| Function | Phase | File |
|---|---|---|
| `updateQuestion` | Phase 0 | questions.ts |
| `deleteQuestion` (single) | Phase 0 | questions.ts |
| `updateTaxonomyNode` | Phase 0 | taxonomy.ts |
| `createTaxonomyNode` | Phase 0 | taxonomy.ts |
| `deleteTaxonomyNode` | Phase 0 | taxonomy.ts |
| `createAsset` | Phase 0 | assets.ts |
| `uploadAssetFile` | Phase 0 | assets.ts |
| `updateArticleReviewStatus` | Phase 0 | wiki.ts |
| `getArticleTaxonomyNodes` | Phase 8 | content.ts |
| `getQuestionsByNodeIds` | Phase 8 | content.ts |
| `getTaxonomyNodeInfo` | Phase 8 | content.ts |

---

## Appendix C: Database Schema Quick Reference

### `wiki_articles`
`article_id` (PK), `title`, `slug`, `content`, `status` (draft/review/published), `ale_tests_you`, `updated_note`, `subject_label`, `difficulty_label`, `reviewed_by`, `reviewer_comments`, `created_at`, `updated_at`, `created_by`*, `updated_by`*

### `questions`
`question_id` (PK), `topic_id` (FK→taxonomy_tree), `text`, `options` (JSONB), `correct_option_id`, `rationale`, `explanation`, `code_citation`, `difficulty`, `difficulty_rating`, `discrimination_rating`, `prompt_image_url`, `model_id`, `is_assessment`, `application_context`, `practice_context`, `created_at`, `updated_at`, `created_by`*, `updated_by`*

### `wiki_article_taxonomy` (junction)
`article_id` (FK→wiki_articles), `node_id` (FK→taxonomy_tree), `is_primary`

### `wiki_ei_prompts`
`prompt_id` (PK), `article_id` (FK), `node_id` (FK), `insert_after_heading`, `prompt_text`, `reveal_text`, `options` (JSONB), `sort_order`, `is_active`, `status`, `reviewed_by`, `reviewed_at`, `reviewer_notes`, `created_at`, `updated_at`

### `taxonomy_tree`
`node_id` (PK), `name`, `ale_id`, `parent_id`, `level`, `sort_order`, `node_type`, `exam_frequency`, `prc_area`, `bloom_level`, `difficulty`, `is_leaf`, `description`

*\* = Added in Phase 0 migration*

---

*End of master roadmap. This single document replaces all 8 source documents for execution purposes.*

