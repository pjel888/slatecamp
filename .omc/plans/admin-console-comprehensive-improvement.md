# Admin Console Comprehensive Improvement Plan

**Created:** 2026-03-25
**Scope:** Full UX/UI overhaul of all `/admin` routes — bugs, security, WYSIWYG previews, polish
**Authority:** ADMIN-MASTER-ROADMAP.md (phases), ADMIN-CONSOLE-UX-IMPROVEMENT-PLAN.md (specs), ADMIN-CONSOLE-PROTOTYPE-V2.html (visual reference)
**Codebase State:** 26 pages, 31+ server actions, 20 components already exist. This is enhancement, not greenfield.

---

## Executive Summary

The admin console has a mature foundation (unified editor, pipeline, coverage map, audit log all exist). The work is:
1. **Fix critical bugs** that break core workflows (5-option editor, broken review queue)
2. **Harden security** (4 components write directly to Supabase bypassing server actions)
3. **Add WYSIWYG previews** (article + question editors lack student-view rendering)
4. **Polish every page** to match the V2 prototype (design tokens, interactions, empty states)
5. **Bulletproof every feature path** (error boundaries, loading states, keyboard shortcuts, edge cases)

---

## Phase 0: Security Hardening (BLOCKER — No UI Changes)

**Goal:** Fix every security issue before touching UI. Zero visual changes.

### 0.1 — Route client-side mutations through server actions

| Component | File | Current | Fix |
|-----------|------|---------|-----|
| QuestionEditor | `src/components/admin/QuestionEditor.tsx` | `.insert()/.update()` via browser client | Use existing `createQuestion` + create `updateQuestion` server action |
| TaxonomyEditor | `src/components/admin/TaxonomyEditor.tsx` | `.update()/.insert()/.delete()` via browser | Create `updateTaxonomyNode`, `createTaxonomyNode`, `deleteTaxonomyNode` in `src/lib/actions/admin/taxonomy.ts` |
| AssetUploader | `src/components/admin/AssetUploader.tsx` | `.insert()` into `models_3d` + storage via browser | Create `createAsset`, `uploadAssetFile` in `src/lib/actions/admin/assets.ts` |
| SMEReviewQueue | `src/components/admin/SMEReviewQueue.tsx` | `.update()` on `wiki_articles` via browser | Create `updateArticleReviewStatus` in `src/lib/actions/admin/wiki.ts` |

**Every new server action must:**
- Start with `canManageContent()` auth check
- Validate input with Zod schema
- Use `createAdminClient()` (service role)
- Populate `updated_by` with authenticated user ID

### 0.2 — Add page-level auth guards

Missing on `/admin/questions/new`, `/admin/questions/[id]`, `/admin/questions/import`. Add:
```typescript
if (!(await canManageContent())) redirect('/admin/dashboard')
```

### 0.3 — Fix `assignRole`/`revokeRole` client type

`src/lib/actions/admin/roles.ts` uses `createClient()` (user session). Fix to `createAdminClient()`.

### 0.4 — Add Zod validation to wiki server actions

`updateWikiArticle` and `createWikiArticle` in `src/lib/actions/admin/wiki.ts` lack validation. Add `WikiArticleSchema`.

### 0.5 — Create `updateQuestion` server action

Verify if exists in `src/lib/actions/admin/questions.ts`. If not, create following `createQuestion` pattern. Phase 8 unified editor depends on this.

### 0.6 — Fix option count: 4, not 5

`QuestionEditor` initializes with 5 options; `createQuestion` validates 4. Standardize on 4 (A/B/C/D).

### 0.7 — Attribution columns migration

```sql
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);
ALTER TABLE public.wiki_articles ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);
ALTER TABLE public.wiki_articles ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);
ALTER TABLE public.models_3d ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);
ALTER TABLE public.models_3d ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);
```

### 0.8 — Fix SMEReviewQueue column references

`SMEReviewQueue.tsx` queries `.select('id, title, author_id, submitted_at')` — none exist. Fix to `article_id, title, status, updated_at`.

**Acceptance:** `bun run build` passes. Zero client-side Supabase writes remain in admin components.

---

## Phase 1: Bug Fixes & Design System Debt

**Goal:** Resolve every non-security issue from audit. Clean slate before feature work.

### 1.1 — Replace native `alert()`/`confirm()`/`prompt()` (5 locations)

| Component | Count | Replacement |
|-----------|-------|-------------|
| QuestionEditor.tsx | 3 | Dialog from `src/components/ui/dialog.tsx` |
| TaxonomyEditor.tsx | 1 | Dialog with "Keep editing" / "Delete" actions |
| SMEReviewQueue.tsx | 2 | Dialog + Textarea for reviewer comments |

### 1.2 — Fix `text-[9px]` violations (4 files)

Change to `text-[11px]` in: PortalTopbar.tsx, StickyTOC.tsx, CopyButton.tsx, CodeBlock.tsx

### 1.3 — Fix `rounded-xl` in loading skeletons (3 files)

Change to `rounded-md` in: taxonomy/loading.tsx, reviews/loading.tsx, assets/loading.tsx

### 1.4 — Add 300ms search debounce

`src/app/admin/search/page.tsx` fires on every keystroke. Use `useDeferredValue` or setTimeout debounce.

### 1.5 — Fix search error swallowing

`src/app/admin/search/page.tsx:84` has empty `catch {}`. Add error state and display.

### 1.6 — Fix dead asset links

`AssetList` links to `/admin/assets/new` and `/admin/assets/[id]` — neither exists. Create stub routes or handle inline.

### 1.7 — Add missing metadata exports

Add `export const metadata` to: `questions/new`, `questions/[id]`, `questions/import`, `articles/new`, `articles/[id]`, `search`.

### 1.8 — Fix AdminMDXEditor useEffect dependency

Add `slugManuallyEdited` to dependency array.

### 1.9 — Optimize coverage data query

`src/lib/actions/admin/coverage.ts` fetches all question rows to count per topic. Use group-by query.

### 1.10 — Move activity page inline query

`src/app/admin/activity/page.tsx` has direct Supabase query. Move to `src/lib/actions/admin/activity.ts`.

### 1.11 — Update login page colors

Replace `zinc-*` classes with Slatecamp tokens (`bg-[#F8F7F5]`, `text-[#1A1A1A]`).

### 1.12 — Remove unused WikiEditor component

Verify `src/components/admin/WikiEditor.tsx` is not imported, then delete.

**Acceptance:** `bun run build` passes. Zero audit issues remain.

---

## Phase 2: Portal Shell & Navigation Polish

**Goal:** Verify shared portal architecture, fix mobile nav, align sidebar to prototype.

### 2.1 — Verify shared portal components are prop-configurable

Check `src/components/portal/`: PortalLayout, PortalTopbar, PortalSidebar, CommandPalette. Ensure admin passes:
- `topbarBg="#6B1A1A"`, `accentColor="#B91C1C"`, `accentLightColor="#FEF2F2"`

### 2.2 — Align admin nav structure to prototype

Verify sidebar matches the 6-group structure from prototype:
- Overview: Dashboard
- Content: Questions, Articles, Content Editor
- Structure: Taxonomy (+ Coverage Map sub-item), 3D Assets
- Quality: Review Queue (alert badge), Pipeline, Content Search, Quality Analytics
- Activity: Audit Log, Activity Feed
- Admin: Settings

### 2.3 — Add mobile hamburger menu

Currently sidebar is `hidden lg:block` with no mobile alternative. Add slide-in drawer for `<lg` screens.

### 2.4 — Verify login bypass

`/admin` login page renders without portal chrome. Confirm `x-pathname` header mechanism works.

### 2.5 — Admin CSS variables

Ensure scoped variables exist in admin layout:
```css
--admin-accent: #B91C1C;
--admin-accent-light: #FEF2F2;
--admin-topbar: #6B1A1A;
```

**Red is chrome (topbar/nav), NOT action buttons. "Save" buttons stay Cobalt Blue #1B3FC4.**

**Acceptance:** Every existing admin page renders correctly in verified layout. Mobile nav functional.

---

## Phase 3: Dashboard Command Center

**Goal:** Transform dashboard into correction-priority command center per prototype.

### 3.1 — Content health stats (4 cards)

Total Questions, Total Articles, Published count, Draft count. Monthly trend indicators.

### 3.2 — Content by subject breakdown

Query `taxonomy_tree` level 1 → count articles + questions per subject. Horizontal bars or stacked cards.

### 3.3 — Recent activity feed

Last 20 from `audit_logs`. Action badges: CREATE=green, UPDATE=blue, DELETE=red. Relative timestamps.

### 3.4 — Quick actions grid

Cards: Create Question, Create Article, **Open Content Editor**, Import Questions, Review Queue, Taxonomy Editor.

### 3.5 — Coverage alert (INNOVATION)

Prominent alert card: highest `exam_frequency` node with zero questions. Direct "Create content" link.

**Acceptance:** Dashboard loads with real data. All quick action links navigate correctly. Coverage alert shows accurate gap.

---

## Phase 4: Questions Management Upgrade

**Goal:** Rebuild questions list, editor with WYSIWYG preview, quality analytics.

### 4.1 — Questions list with DataTable

Columns: stem (80 chars), topic (ale_id badge), difficulty (visual bar), citation (badge), quality badges (✓/✗ rationale, ✓/✗ citation), updated_at.
Filters: taxonomy node, difficulty range, has-citation.
Bulk select + bulk delete. 50 per page.

**New component:** `QuestionQualityBadges.tsx` — ✓ checkmark (emerald) for present, ✗ (warm red) for missing.

### 4.2 — Question editor WYSIWYG preview (CRITICAL)

**Two-panel layout:**
- LEFT (50%): Editor form — stem, 4 options (A-D) with radio, rationale, collapsible Details + Metadata
- RIGHT (50%): Sticky preview panel with Camp Mode / Storm Mode toggle

**New components to build:**
| Component | File | Purpose |
|-----------|------|---------|
| QuestionPreviewPanel | `src/components/admin/QuestionPreviewPanel.tsx` | Camp/Storm toggle + "STUDENT VIEW" watermark |
| CampModeQuestionPreview | `src/components/admin/preview/CampModePreview.tsx` | Progress bar, stem, 4 interactive options, rationale card, citation badge |
| StormModeQuestionPreview | `src/components/admin/preview/StormModePreview.tsx` | Timer bar, stem, 4 options, no rationale, prev/submit nav |

**Acceptance criteria:**
- Exactly 4 option fields (A, B, C, D)
- Camp Mode preview matches student quiz UI exactly (reuse actual quiz components)
- Storm Mode preview matches student quiz UI exactly
- Both previews update with 150ms debounce as SME types
- Difficulty slider shows context: "At this difficulty, students answer correctly ~42% of the time"
- "STUDENT VIEW" watermark visible
- Clicking options in preview shows correct/incorrect state
- No save required for preview updates

### 4.3 — Question import improvements

Keep existing `QuestionImporter`. Add validation preview table, duplicate detection.

### 4.4 — Quality analytics page

Difficulty distribution histogram, coverage gaps (nodes with <5 Qs by exam_frequency), missing rationale/citation counts.

### 4.5 — "View in context" action

Per question → links to `/admin/content/[article_id]` for the article linked to question's topic via `wiki_article_taxonomy`.

**Acceptance:** All question CRUD works through server actions. Preview matches student experience. Quality analytics shows real data.

---

## Phase 5: Article Management Upgrade

**Goal:** Rebuild articles list, add WYSIWYG preview using WikiArticleRenderer.

### 5.1 — Articles list redesign

Row structure per prototype:
```
ALE-DSGN-002-02          ● Published      8q  ■■■■■■■■░░ 82%
Doors, Corridors & Washrooms (BP 344)
Updated 2 days ago · Last reviewed by Maria Santos
[Edit Article]  [Edit with Questions →]  [Preview ↗]  [⋯ more]
```

**New elements:** Question count badge, coverage health bar, "Preview ↗" (student wiki), "Edit with Questions →" (unified editor).
Status filter tabs: `All (47) | Draft (12) | Review (8) | Published (27)`

### 5.2 — Article editor WYSIWYG preview (CRITICAL)

**Two-panel layout:**
- LEFT (65%): Content bar (sticky) + Tabs [Editor | Preview — Student View | Diff] + CodeMirror
- RIGHT (35%): Properties sidebar (taxonomy, metadata, reviewer info, linked questions)

**New components:**
| Component | File | Purpose |
|-----------|------|---------|
| ArticlePreviewTab | `src/components/admin/ArticlePreviewTab.tsx` | Renders via WikiArticleRenderer with `isPreview={true}` |
| ArticlePropertiesPanel | `src/components/admin/ArticlePropertiesPanel.tsx` | Right sidebar: taxonomy, metadata, reviewer, linked Qs |
| ComponentToolbar | `src/components/admin/ComponentToolbar.tsx` | Insert MDX components at cursor |

**ArticlePreviewTab implementation:**
- Import exact `WikiArticleRenderer` from student wiki (`src/components/wiki/`)
- Add `isPreview` prop to WikiArticleRenderer if not exists (hides nav, analytics, CTAs)
- "STUDENT VIEW" watermark at top
- Preview updates live with 500ms debounce (no save required)
- Must render: ComparisonTable, Configurator, Visualizer, all custom MDX components
- Must match: Syne 700 for H2/H3, Inter for body, DM Mono for code, `max-w-[720px]`

**WikiArticleRenderer `isPreview` mode changes:**
- Hides "Practice this topic" CTA
- Hides heatmap sidebar
- Hides navigation previous/next links
- Disables analytics
- Does NOT change typography, layout, colors, or component behavior

### 5.3 — Verify wiki redirect routes

All `/admin/wiki/*` → `/admin/articles/*` redirects still function.

**Acceptance:** Article preview uses exact WikiArticleRenderer. Properties panel collapses. Component toolbar inserts MDX tags. All existing article CRUD preserved.

---

## Phase 6: Taxonomy & Assets

**Goal:** Polish taxonomy editor, enhance coverage heatmap, fix asset dead links.

### 6.1 — Taxonomy tree editor

Wrap existing TaxonomyEditor in new layout (now uses server actions from Phase 0).

### 6.2 — Coverage heatmap enhancement

Visual grid per prototype:
- **Green:** ≥10 questions + published article
- **Amber:** 1–9 questions OR draft article only
- **Gray:** 0 questions, no article
- **Red outline:** High exam_frequency + gray (critical gap)

Click cell → node details + "Edit All" link to Unified Editor.

### 6.3 — Fix 3D assets

Fix dead links from Phase 1. Verify AssetUploader and AssetList use server actions from Phase 0.

**Acceptance:** Coverage heatmap shows accurate data. Critical gaps highlighted with red outline. Asset pages functional.

---

## Phase 7: Quality, Activity, Settings

**Goal:** Polish review queue, pipeline kanban, search, audit, activity, settings.

### 7.1 — Publishing pipeline kanban

Three columns: Draft → In Review → Published. Cards: title, ale_id, word count. Status transitions via server action. Verify `wiki_articles.status` supports `'review'` value.

### 7.2 — SME review queue fix + redesign

**Bug fix (from Phase 0):** Column references fixed.

**New components:**
| Component | Purpose |
|-----------|---------|
| ApproveDialog | Confirmation dialog → changes status to `published` |
| RequestChangesDialog | Dialog + Textarea for reviewer notes → saves to `reviewer_comments`, status to `draft` |

"Preview Article ↗" opens student wiki URL in new tab. All actions use server actions.

### 7.3 — Content search polish

Debounced (from Phase 1). Results grouped by type (Questions, Articles, Taxonomy). Error handling (from Phase 1).

### 7.4 — Audit log enhancements

Add filters: event_type, table_name, date range. Search by actor email. Expandable rows with diff.

### 7.5 — Activity feed

Last 50 changes. Natural language: "Philip updated article 'Roman Architecture' — 2 min ago." Filter by type, by actor.

### 7.6 — Admin settings

Super_admin only. List users in `user_roles`. Add/remove roles. Show last activity per user.

**Acceptance:** Pipeline drag-to-publish works. Review queue shows real articles. Approval/rejection flows complete. Search returns accurate results.

---

## Phase 8: Unified Content Editor Polish (FLAGSHIP)

**Goal:** The unified editor already exists with 10 sub-components. Polish every interaction path to be bulletproof.

**Authority:** UX Plan IS LAW for this phase.

### What already exists (from codebase inventory):
- `UnifiedContentEditor.tsx` — Main orchestrator
- `ContentEditorIndex.tsx` — Index page
- `ContentBar.tsx` — Top bar with save/discard
- `ArticlePanel.tsx` — Article editor panel
- `QuestionsPanel.tsx` — Questions list
- `EIPromptsPanel.tsx` — EI prompts
- `OutlinePanel.tsx` — Article headings
- `SaveAllBar.tsx` — Save status
- `PanelErrorBoundary.tsx` — Error isolation
- `DirtyStateProvider.tsx` — Track unsaved changes
- `types.ts` — Shared types

### 8.1 — Verify data layer completeness

Check `src/lib/actions/admin/content.ts` has all required functions:
- `getArticleTaxonomyNodes(articleId)` ✓ exists
- `getQuestionsByNodeIds(nodeIds)` ✓ exists
- `getTaxonomyNodeInfo(nodeId)` ✓ exists
- `updateArticleFull(...)` ✓ exists
- `updateQuestion(...)` ✓ exists
- `createEIPrompt(data)` ✓ exists
- `updateEIPrompt(...)` ✓ exists
- `deleteEIPrompt(promptId)` ✓ exists

Verify each action has: auth check, Zod validation, `createAdminClient()`, proper error handling.

### 8.2 — Article panel: Add WYSIWYG preview tab

Integrate `ArticlePreviewTab` (from Phase 5) into unified editor's article panel.
Three tabs: Editor | Preview (Student View) | Diff

### 8.3 — Questions panel: Add inline Camp Mode preview

Each question card gets a preview toggle button. When active, shows `CampModeQuestionPreview` (from Phase 4) inline below the question form.

### 8.4 — Question card states (per UX plan)

**Collapsed card:**
```
● [■■■□□] difficulty   ALE-HIST-001-06   Has citation
What was the primary structural system used in Roman...    [Edit ▾]
```
- ● = amber dot when unsaved
- Difficulty bar: 5-segment (0.0-1.0)
- ALE ID badge: DM Mono
- Citation/rationale badges
- Stem: first 120 chars

**Expanded card — 3 collapsible groups:**
- CORE (always visible): stem, 4 options with radio, rationale
- DETAILS (collapsed): citation, difficulty slider, application_context, is_assessment, explanation, prompt_image_url
- METADATA (collapsed, read-only): question_id, topic_id, IRT ratings, timestamps

**Accordion behavior:** Expanding one collapses current. Alt+click for multiple.

### 8.5 — EI Prompts tab polish

Each prompt: collapsible card with `insert_after_heading` (with heading validation), `prompt_text`, `reveal_text`, `options`, `status`, `is_active`, `sort_order`.

**Heading validation:** On blur, compare against outline panel headings. ✓ green if match, ⚠️ amber with suggestion if not.

### 8.6 — Save All system verification

Verify existing `SaveAllBar.tsx` implements:
- `Promise.allSettled` (not `Promise.all`)
- Pre-save summary: "Saving: 1 article + 3 questions + 1 EI prompt..."
- Success: "Saved ✓" for 1.5s, clear dirty flags, toast
- Partial failure: Persistent error panel (not toast) with retry button
- Failed items keep amber dots, successful items clear

**Delete UX — two-step queue:**
- Delete click → red border + "Delete on next save" + Undo
- On Save All: deletion executes
- Undo cancels before save

### 8.7 — Dirty state verification

Verify `DirtyStateProvider.tsx` surfaces unsaved state:
- Content bar: amber dot ● + "Unsaved changes"
- Modified question cards: amber dot top-right
- Browser tab title: "● " prefix
- `beforeunload` native dialog when `isAnythingDirty`

### 8.8 — Outline panel verification

- Parses H2/H3 headings from MDX (300ms debounce)
- Click heading → CodeMirror scrolls to position
- Question count badges per heading section ("3q")
- Sections with 0q highlighted amber
- EI prompts listed below headings

### 8.9 — Keyboard shortcuts

| Shortcut | Action |
|----------|--------|
| ⌘S | Save All (preventDefault browser save) |
| Escape | Close expanded question card |
| ⌘↵ | Save single expanded question |
| ⌘K | Focus search/filter in questions panel |

### 8.10 — Error boundaries

Independent per panel. Article error must NOT crash questions panel:
```
⚠️ Questions panel encountered an error.
The article editor is still functional.
[Reload questions panel]
```

### 8.11 — Loading states

Save All spinner, preview tab skeleton, new taxonomy node → 3 placeholder skeleton cards.

### 8.12 — Responsive stacking at <1280px

Stack outline on top of article, article on top of questions. Content bar stays fixed.

### 8.13 — Concurrent editing guard

Compare `updated_at` on save. If server's `updated_at` is newer than page-load time, show warning.

**Acceptance:** Every interaction from the UX Plan works. Save All handles partial failures. Dirty state tracks across all panels. Keyboard shortcuts functional. Error boundaries isolate failures.

---

## Phase 9: Command Palette & Final Polish

### 9.1 — Command palette enhancement

Index all 22 admin pages + search questions (by stem), articles (by title), taxonomy (by name/ale_id). Add "recently visited" (last 5 pages).

### 9.2 — Loading states for every route

Verify all 26 pages have `loading.tsx` with appropriate skeletons matching page layout.

### 9.3 — Error boundaries

Verify `src/app/admin/error.tsx` catches errors. Add sub-route boundaries for data-heavy pages.

### 9.4 — Metadata

Every admin page has proper Next.js metadata export.

### 9.5 — Accessibility audit

- `scope="col"` on all table headers
- "Skip to main content" link
- `aria-label` on all interactive elements
- Color never sole indicator (always paired with text/icon)
- All text ≥11px per Slatecamp design system

### 9.6 — Performance

- Optimize remaining `select('*')` → specific columns
- Verify CodeMirror lazy-loaded with `next/dynamic` + `ssr: false`
- Verify debounce on MDX parser

**Acceptance:** `bun run build` passes. All 22 routes render. Zero accessibility violations. Zero performance regressions.

---

## Critical Rules (ALL PHASES)

1. **USE EXISTING COMPONENTS** — Button, Badge, Card, Input, Select, Dialog, Tabs, Tooltip, Skeleton, EmptyState, DataTable from `src/components/ui/` or `src/components/shared/`
2. **REUSE AdminMDXEditor** — import it, wrap it, do NOT fork or rebuild CodeMirror
3. **THE DATA JOIN IS THROUGH TAXONOMY** — articles ↔ `wiki_article_taxonomy` ↔ `taxonomy_tree` ← questions. NO `article_id` on questions table
4. **SERVER ACTIONS FOR ALL MUTATIONS** — auth check + Zod + `createAdminClient()`
5. **RED IS CHROME, NOT ACTION** — topbar/nav accents only. Action buttons stay Cobalt Blue
6. **4 OPTIONS PER QUESTION** — A/B/C/D, not 5
7. **`bun run build` AFTER EVERY PHASE** — non-negotiable
8. **COMMIT AFTER EACH PHASE** — `feat: admin console phase N — [description]`
9. **WYSIWYG MEANS SAME COMPONENT** — WikiArticleRenderer for article preview, actual quiz components for question preview
10. **"STUDENT VIEW" WATERMARK** — every preview panel must clearly label it shows student experience

---

## Dependency Graph

```
Phase 0 (Security) ──→ Phase 1 (Bugs)
                           │
                           ▼
                      Phase 2 (Shell)
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
         Phase 3      Phase 4      Phase 6
        (Dashboard)  (Questions)  (Taxonomy)
                         │
                         ▼
                    Phase 5        Phase 7
                   (Articles)    (Quality)
                         │
                         ▼
                    Phase 8 ★
                (Unified Editor)
                         │
                         ▼
                    Phase 9
                   (Polish)
```

**Parallelization:** Phases 3, 4, 6 can run in parallel after Phase 2. Phase 7 can start after Phase 2. Phase 5 needs Phase 4 patterns. Phase 8 needs Phases 4+5 components. Phase 9 is final.

---

## Verification Strategy

After each phase:
1. `bun run build` — zero errors
2. Navigate every affected route manually
3. Test every CRUD operation (create, read, update, delete)
4. Test error states (network failure, validation failure, auth failure)
5. Test empty states (no data, no results)
6. Test edge cases (very long text, special characters, concurrent edits)
7. Verify no regressions on unmodified pages

After Phase 9 (final):
- All 22+ routes render correctly
- All server actions have auth + validation
- All previews match student experience
- All dialogs replaced (zero native alert/confirm/prompt)
- All text ≥11px
- All interactions from prototype functional
- Zero `bun run build` errors

---

## File Reference (New Components to Create)

| Component | File | Phase |
|-----------|------|-------|
| QuestionQualityBadges | `src/components/admin/QuestionQualityBadges.tsx` | 4 |
| QuestionPreviewPanel | `src/components/admin/QuestionPreviewPanel.tsx` | 4 |
| CampModeQuestionPreview | `src/components/admin/preview/CampModePreview.tsx` | 4 |
| StormModeQuestionPreview | `src/components/admin/preview/StormModePreview.tsx` | 4 |
| QuestionQuickPreview | `src/components/admin/QuestionQuickPreview.tsx` | 4 |
| ArticlePreviewTab | `src/components/admin/ArticlePreviewTab.tsx` | 5 |
| ArticlePropertiesPanel | `src/components/admin/ArticlePropertiesPanel.tsx` | 5 |
| ComponentToolbar | `src/components/admin/ComponentToolbar.tsx` | 5 |
| ApproveDialog | `src/components/admin/ApproveDialog.tsx` | 7 |
| RequestChangesDialog | `src/components/admin/RequestChangesDialog.tsx` | 7 |

## Server Actions to Create

| Function | File | Phase |
|----------|------|-------|
| `updateQuestion` | `src/lib/actions/admin/questions.ts` | 0 |
| `deleteQuestion` (single) | `src/lib/actions/admin/questions.ts` | 0 |
| `updateTaxonomyNode` | `src/lib/actions/admin/taxonomy.ts` | 0 |
| `createTaxonomyNode` | `src/lib/actions/admin/taxonomy.ts` | 0 |
| `deleteTaxonomyNode` | `src/lib/actions/admin/taxonomy.ts` | 0 |
| `createAsset` | `src/lib/actions/admin/assets.ts` | 0 |
| `uploadAssetFile` | `src/lib/actions/admin/assets.ts` | 0 |
| `updateArticleReviewStatus` | `src/lib/actions/admin/wiki.ts` | 0 |

