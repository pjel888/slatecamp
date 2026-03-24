# SlateCamp Unified Content Editor — Article + Questions Side-by-Side

> A dedicated editing workspace where you see and edit an article and all its related questions simultaneously. No more switching between pages, no more content drift.

---

## The Problem

Right now, editing an article and editing its questions are two separate workflows in two separate admin pages. You edit the article at `/admin/articles/[id]`, then navigate to `/admin/questions`, filter by topic, find the relevant questions, and edit them one by one. This creates three failure modes:

1. **Content drift** — You update a fact in the article (e.g., PRBoA has 5 members, not 3) but forget to update the question that still says 3 members. Students read the correct article, then answer the wrong question "correctly."

2. **Context loss** — When editing a question, you can't see the article it's testing. You don't know if the rationale matches what the article says. You're editing blind.

3. **Coverage blindness** — You can't see which parts of the article have questions and which don't. The article might have 8 sections but questions only test 2 of them.

## The Solution

A unified editing workspace at `/admin/content/[article_id]` that shows everything in one view:

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Content Bar: Article title · ale_id badge · Status toggle · Save All · ⌘S  │
├──────────┬───────────────────────────────┬───────────────────────────────────┤
│          │                               │                                   │
│ Outline  │  Article Panel                │  Questions Panel                  │
│ (left)   │  (center, ~55%)              │  (right, ~45%)                   │
│          │                               │                                   │
│ Headings │  ┌─ Tabs ──────────────────┐ │  ┌─ Tabs ──────────────────────┐ │
│ from     │  │ Editor │ Preview │ Diff │ │  │ Questions │ EI Prompts │ +  │ │
│ article  │  └────────────────────────┘ │  └───────────────────────────────┘ │
│          │                               │                                   │
│ Click to │  CodeMirror MDX editor        │  Scrollable list of questions     │
│ scroll   │  with component toolbar       │  Each expandable inline           │
│ to       │  (same as current editor)     │  Full edit: stem, choices,        │
│ section  │                               │  rationale, citation, difficulty, │
│          │                               │  context, etc.                    │
│ ──────── │                               │                                   │
│          │                               │  + Add Question button            │
│ Questions│                               │  at bottom                        │
│ per      │                               │                                   │
│ section  │                               │                                   │
│ count    │                               │                                   │
│          │                               │                                   │
└──────────┴───────────────────────────────┴───────────────────────────────────┘
```

---

## Data Model

### How articles and questions connect

```sql
-- An article links to taxonomy nodes
wiki_article_taxonomy: article_id → node_id (can be multiple)

-- Questions link to the same taxonomy nodes
questions: topic_id → node_id

-- So for article X, its related questions are:
SELECT q.*
FROM questions q
JOIN wiki_article_taxonomy wat ON q.topic_id = wat.node_id
WHERE wat.article_id = :article_id
ORDER BY q.created_at DESC;

-- Plus the article has its own EI prompts (embedded questions):
SELECT *
FROM wiki_ei_prompts
WHERE article_id = :article_id
ORDER BY sort_order;
```

### The article object (10 fields)

```
article_id        UUID
title             TEXT
slug              TEXT (unique)
content           TEXT (MDX markdown)
status            TEXT ('draft' | 'review' | 'published')
ale_tests_you     TEXT (hero metadata)
updated_note      TEXT (hero metadata)
subject_label     TEXT (hero metadata)
difficulty_label  TEXT ('Foundational' | 'Intermediate' | 'Advanced')
reviewed_by       UUID
reviewer_comments TEXT
created_at / updated_at TIMESTAMPTZ
```

### The question object (17 fields)

```
question_id           UUID
topic_id              UUID → taxonomy_tree.node_id
text                  TEXT (the question stem)
options               JSONB (array of {id, text} objects)
correct_option_id     TEXT (id of the correct option)
rationale             TEXT (why the correct answer is correct)
explanation           TEXT (extended explanation)
code_citation         TEXT (e.g., "PD 1096 Section 401")
difficulty            NUMERIC (0.0 - 1.0)
difficulty_rating     NUMERIC (IRT-computed)
discrimination_rating NUMERIC (IRT-computed)
prompt_image_url      TEXT (optional image)
model_id              TEXT (AI model that generated it, if any)
is_assessment         BOOLEAN (diagnostic-only question)
application_context   TEXT (real-world scenario category)
practice_context      TEXT[] (array of practice tags)
created_at / updated_at TIMESTAMPTZ
```

### The EI prompt object (12 fields)

```
prompt_id             UUID
article_id            UUID → wiki_articles
node_id               UUID → taxonomy_tree (optional)
insert_after_heading  TEXT (which heading to place it after)
prompt_text           TEXT (the question)
reveal_text           TEXT (the answer)
options               JSONB (array for MCQ-type prompts)
sort_order            SMALLINT
is_active             BOOLEAN
status                TEXT ('draft' | 'review' | 'published' | 'archived')
reviewed_by / reviewed_at / reviewer_notes
created_at / updated_at
```

---

## Detailed UI Specification

### Top: Content Bar (sticky, always visible)

```
┌─────────────────────────────────────────────────────────────────────┐
│ ← Back to Articles    [Title Input: editable]    ALE-HIST-001-06   │
│                                                                     │
│ Status: [Draft ▾]  Difficulty: [Intermediate ▾]  Questions: 12     │
│                                                                     │
│ [Discard Changes]                                [Save All — ⌘S]   │
└─────────────────────────────────────────────────────────────────────┘
```

- Title: editable inline text input (Inter 500 16px)
- ale_id: DM Mono badge from the primary taxonomy node
- Status: dropdown (draft/review/published) — updates article status
- Difficulty: dropdown (Foundational/Intermediate/Advanced)
- Questions count: live count badge showing total related questions
- Save All: one button saves article changes AND any modified questions in a single action
- ⌘S keyboard shortcut bound to Save All
- Discard Changes: reverts all unsaved changes (both article and questions)
- Unsaved indicator: show a dot or "Unsaved changes" text when anything has been modified

### Left: Outline Panel (180px, sticky)

Parsed from the article's MDX content in real-time:

```
OUTLINE
─────────────────
## Key Innovations         3q
## Notable Structures      5q
  ### The Colosseum        2q
  ### The Pantheon         2q
  ### Basilica             1q
## Construction Methods    2q
## Legacy                  2q

─────────────────
EI PROMPTS (4)
  After "Key Innovations"
  After "The Colosseum"
  After "The Pantheon"
  After "Legacy"
```

For each heading:
- Click → scrolls the article editor to that heading
- Show question count badge (how many questions reference content in this section)
- EI prompts section shows where embedded prompts are inserted

The question count per section is approximate — based on keyword matching between question stems and section content. This is a UX hint, not a guarantee.

### Center: Article Panel (~55% width)

Three sub-tabs:

**Editor tab:** CodeMirror MDX editor with the component insertion toolbar (same as current `/admin/articles/[id]` editor). All the same features: syntax highlighting, line numbers, line wrapping, insert templates for all 30+ MDX components.

**Preview tab:** Live preview using `evaluate()` from `@mdx-js/mdx` with `baseMdxComponents`. Shows exactly what the student sees. Debounced 300ms. Error boundary so bad MDX doesn't crash the workspace.

**Diff tab:** Shows what changed since last save. Green for additions, red for deletions. Use a simple text diff (not full git diff — just line-by-line comparison of saved vs current content).

### Right: Questions Panel (~45% width)

Two sub-tabs:

**Questions tab:** All questions linked to this article's taxonomy nodes.

Each question is a collapsible card:

**Collapsed state (default — shows key info in one row):**
```
┌─────────────────────────────────────────────────────────────┐
│ ▶  Which Roman structure featured the system of superimpo...│
│    [0.5 ▪▪▪▪▪░░░░░]  [PD 1096]  ✓ Has rationale          │
└─────────────────────────────────────────────────────────────┘
```
- Stem truncated to ~80 chars
- Difficulty bar (visual 0-1)
- Code citation badge (if present)
- Indicators: has rationale ✓, has explanation ✓, has image ✓
- Click to expand

**Expanded state (full inline editor):**
```
┌─────────────────────────────────────────────────────────────┐
│ ▼  Question Editor                          [Delete] [Save] │
│                                                              │
│ Stem                                                         │
│ ┌──────────────────────────────────────────────────────────┐│
│ │ Which Roman structure featured the system of             ││
│ │ superimposed orders on its exterior facade?              ││
│ └──────────────────────────────────────────────────────────┘│
│                                                              │
│ Choices                              Correct                 │
│ ┌─ A ──────────────────────────────┐  ○                     │
│ │ Pantheon                         │                         │
│ ├─ B ──────────────────────────────┤  ●                     │
│ │ Colosseum                        │                         │
│ ├─ C ──────────────────────────────┤  ○                     │
│ │ Basilica of Maxentius            │                         │
│ ├─ D ──────────────────────────────┤  ○                     │
│ │ Forum of Trajan                  │                         │
│ └──────────────────────────────────┘                         │
│                                                              │
│ Rationale                                                    │
│ ┌──────────────────────────────────────────────────────────┐│
│ │ The Colosseum is the canonical example of the Roman      ││
│ │ system of superimposed orders on its four-story exterior.││
│ └──────────────────────────────────────────────────────────┘│
│                                                              │
│ ┌─ Details (collapsible) ──────────────────────────────────┐│
│ │ Explanation    [textarea]                                 ││
│ │ Code Citation  [PD 1096 Section 401    ]                 ││
│ │ Difficulty     [0.5 ═══════●═══════════]                 ││
│ │ App Context    [Historical identification]               ││
│ │ Practice Ctx   [roman] [classical] [+]                   ││
│ │ Assessment     [ ] Is diagnostic question                ││
│ │ Image URL      [                       ]                 ││
│ └──────────────────────────────────────────────────────────┘│
│                                                              │
│ ┌─ Metadata (read-only) ──────────────────────────────────┐│
│ │ ID: abc123  Created: Mar 20  Updated: Mar 24            ││
│ │ Topic: ALE-HIST-001-06  IRT Diff: 0.48  Disc: 0.62     ││
│ └──────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

The expanded editor has three collapsible sections:
1. **Core** (always visible): Stem, 4 choices with radio for correct, rationale
2. **Details** (collapsed by default): Explanation, code citation, difficulty slider, application_context, practice_context tags, is_assessment checkbox, image URL
3. **Metadata** (collapsed by default, read-only): question_id, created_at, updated_at, topic ale_id, IRT difficulty_rating, discrimination_rating

**Ordering:** Questions are sorted by created_at DESC (newest first). Optionally, group by section relevance if we can match question stems to article headings.

**Add Question button:** At the bottom of the questions list. Creates a new question pre-filled with:
- `topic_id` set to the article's primary taxonomy node
- Empty stem, 4 empty choice slots, empty rationale
- Default difficulty 0.5

**EI Prompts tab:** All elaborative interrogation prompts for this article.

Each EI prompt is a card showing:
- `insert_after_heading` (which section it appears after)
- `prompt_text` (the question)
- `reveal_text` (the answer)
- `options` (if MCQ-type)
- `status` badge
- Edit inline / Delete

Add EI Prompt button at the bottom. New prompt pre-fills `article_id`.

---

## Save Behavior

### Save All (⌘S)

One button to rule them all. When clicked:

1. Collect all modified items (article content, article metadata, each modified question, each modified EI prompt)
2. Show a brief summary: "Saving 1 article + 3 questions + 1 EI prompt"
3. Execute server actions in parallel:
   - `updateWikiArticle(article_id, { title, content, status, difficulty_label, ... })`
   - For each modified question: `updateQuestion(question_id, { text, options, correct_option_id, rationale, ... })`
   - For each new question: `createQuestion({ topic_id, text, options, ... })`
   - For each deleted question: `deleteQuestion(question_id)`
   - For each modified EI prompt: update via server action
4. Show success toast: "All changes saved"
5. If any individual save fails, show which item failed and keep the others saved

### Dirty State Tracking

Track modifications at the item level:
- `articleDirty: boolean` — article content or metadata changed
- `questionsDirty: Map<question_id, boolean>` — per-question dirty tracking
- `eiPromptsDirty: Map<prompt_id, boolean>` — per-prompt dirty tracking
- `newQuestions: QuestionDraft[]` — unsaved new questions
- `deletedQuestions: Set<question_id>` — questions marked for deletion

Show unsaved changes indicator in the content bar. Warn on navigation away (beforeunload).

### Auto-save (optional)

Auto-save draft every 60 seconds if any item is dirty. Save to the database directly (not localStorage). Show a subtle "Auto-saved" indicator.

---

## Data Fetching

### Server Component (page.tsx)

```typescript
// /admin/content/[id]/page.tsx
export default async function UnifiedEditorPage({ params }: { params: { id: string } }) {
  if (!(await canManageContent())) redirect('/admin')

  const article = await getArticle(params.id)
  if (!article) notFound()

  // Get taxonomy nodes for this article
  const taxonomyLinks = await getArticleTaxonomyNodes(article.article_id)
  const nodeIds = taxonomyLinks.map(l => l.node_id)

  // Get all questions for these nodes
  const questions = await getQuestionsByNodeIds(nodeIds)

  // Get EI prompts for this article
  const eiPrompts = await getEIPromptsForArticle(article.article_id)

  // Get taxonomy node info for display
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

### New Query Functions Needed

```typescript
// Get all taxonomy nodes linked to an article
async function getArticleTaxonomyNodes(articleId: string)
  // SELECT node_id, is_primary FROM wiki_article_taxonomy WHERE article_id = :articleId

// Get questions by multiple node IDs
async function getQuestionsByNodeIds(nodeIds: string[])
  // SELECT * FROM questions WHERE topic_id = ANY(:nodeIds) ORDER BY created_at DESC

// Get taxonomy node info (name, ale_id, parent chain)
async function getTaxonomyNodeInfo(nodeId: string)
  // SELECT node_id, name, ale_id, level, parent_id FROM taxonomy_tree WHERE node_id = :nodeId
```

---

## Route & Navigation

### New Route

```
/admin/content/[id]    — Unified editor for article + questions
```

This is a new route, NOT a replacement for `/admin/articles/[id]`. The existing article-only editor stays for simple edits. The unified editor is for deep content work.

### How to access it

1. From the article list (`/admin/articles`): add a "Edit with Questions" button or icon next to each article
2. From the question list (`/admin/questions`): when viewing a question, add a "Open in Context" link that navigates to the unified editor for the question's related article
3. From the taxonomy coverage map: click a node → see its article → "Edit All" button opens unified editor
4. From the dashboard quick actions: "Edit Content" opens a picker (TaxonomyPicker) → selects article → opens unified editor

---

## Edge Cases

### Article with no questions
Questions panel shows an empty state: "No questions for this topic yet." with an "Add First Question" button.

### Article linked to multiple taxonomy nodes
Questions panel shows questions from ALL linked nodes, grouped by node with ale_id headers:
```
ALE-HIST-001-06 — Roman Architecture (8 questions)
  [question cards...]

ALE-HIST-001-05 — Classical Greek Architecture (4 questions)
  [question cards...]
```

### Question linked to a node the article ISN'T linked to
This shouldn't happen in the unified editor since we only fetch questions for the article's nodes. But if a user navigates from a question that happens to share a topic with another article, we show only questions for the article's own nodes.

### Very long article with 50+ questions
Questions panel is independently scrollable. Add a search/filter at the top of the questions panel:
- Search by stem text
- Filter by: has rationale (yes/no), has citation (yes/no), difficulty range

### New article (no article_id yet)
The route is `/admin/content/new`. No questions or EI prompts yet — right panel shows empty states for both. After first save, the article gets an ID and the URL updates.

---

## Implementation Phases

### Phase 1: Route & Data Layer
- Create `/admin/content/[id]/page.tsx` (Server Component)
- Create new query functions: `getArticleTaxonomyNodes`, `getQuestionsByNodeIds`
- Wire up data fetching for article + questions + EI prompts
- Create `UnifiedContentEditor` client component shell

### Phase 2: Article Panel
- Reuse the existing AdminMDXEditor (CodeMirror + live preview + component toolbar)
- Add the Diff tab (simple text comparison)
- Extract the outline panel from article headings

### Phase 3: Questions Panel
- Build the collapsible question card component
- Collapsed: one-row summary with stem, difficulty bar, citation badge, indicators
- Expanded: full inline editor with core/details/metadata sections
- All 17 fields editable in the appropriate input type
- Group by taxonomy node if multiple nodes

### Phase 4: EI Prompts Tab
- Build the EI prompt inline editor
- Show insert_after_heading, prompt_text, reveal_text, options, status
- Add/edit/delete EI prompts

### Phase 5: Save All System
- Dirty state tracking (per-item)
- Save All button with parallel server action execution
- Success/failure feedback per item
- ⌘S keyboard shortcut
- Navigation warning on unsaved changes (beforeunload)

### Phase 6: Outline Panel
- Parse headings from article content in real-time
- Click-to-scroll to heading in CodeMirror editor
- Question count per section (keyword matching)
- EI prompt placement indicators

### Phase 7: Polish
- Loading states for all panels
- Error boundaries per panel (article error shouldn't crash questions)
- Responsive: stack panels vertically on <1280px
- Add "Edit with Questions" links to article list and question list pages
- Add route to admin sidebar navigation

---

## Critical Rules

1. **Use existing components.** The article editor IS the existing AdminMDXEditor. The question card uses existing Badge, Button, Input, Card components. Don't rebuild.

2. **The article and questions save independently but trigger together.** Save All calls multiple server actions in parallel. If the article save succeeds but one question fails, the article is saved and the failed question is flagged.

3. **Questions are linked through taxonomy, not directly to articles.** The query joins through `wiki_article_taxonomy` → `taxonomy_tree` ← `questions`. Respect this relationship.

4. **Every question field must be editable.** All 17 fields. The "Details" collapsible section contains the less-common fields so the UI isn't overwhelming, but they must all be there.

5. **The outline panel parses from live content.** As the user types in the editor, the outline updates. This is a regex parse of `## ` and `### ` headings, not a full MDX compile.

6. **Read the actual server actions before building save logic.** Check `src/lib/actions/admin/questions.ts` and `src/lib/actions/admin/wiki.ts` for the exact function signatures and Zod schemas. Don't hallucinate.
