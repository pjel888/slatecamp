# Unified Content Editor — UX Implementation Plan

> **Feature:** `/admin/content/[article_id]` — Side-by-side Article + Questions Editor
> **Document type:** UX Implementation Plan (admin tool)
> **Status:** Ready for Claude Code implementation
> **Viewport target:** 1440px desktop. No mobile support in v1.

---

## The Problem This Solves

Before designing anything, be precise about the cognitive failures the current system produces and what the unified editor must cure.

**Failure 1 — Content drift.** An SME fixes a fact in an article ("PRBoA has 5 members, not 3") and saves. They forget two quiz questions still say 3 members. Students read the correct article, answer the wrong question "correctly," and their rationale confirms their error. The platform undermines its own credibility. This is the most serious failure mode.

**Failure 2 — Editing blind.** When an SME opens a question editor to write a rationale, they cannot see the article the question is testing. The rationale gets written from memory — different terminology, different section citation, slightly different framing than the article. The student experiences whiplash.

**Failure 3 — Coverage blindness.** An article can have 8 sections and 40 paragraphs. The SME cannot see which sections have questions and which are untested. They don't know if "Structural Systems" is covered by 12 questions or zero.

The unified editor solves all three by making article and questions **co-present** — not linked, not tabbed, simultaneously visible and simultaneously editable.

---

## The User

This is an **admin tool for SME content authors**, not a student interface.

- Thinks in **topics** ("I'm working on Roman Architecture") — the article and its questions are two expressions of the same topic
- Has **deep domain knowledge** but zero patience for workflow friction
- Edits in **bursts**: 30–90 minute sessions where they read the article, improve it, update questions, write rationales, check citations
- **Desktop only.** 1440px minimum. No mobile layout in v1.

The editor's job: reduce context-switching to zero. The SME should never navigate away, never open a second tab.

---

## Layout Architecture

### Three-Column Layout (non-negotiable)

```
┌──────────────────────────────────────────────────────────────────────┐
│  CONTENT BAR (sticky, full width, 64px tall)                         │
├────────────┬─────────────────────────────┬───────────────────────────┤
│            │                             │                           │
│  OUTLINE   │  ARTICLE PANEL             │  QUESTIONS PANEL          │
│  200px     │  ~55% of remaining width   │  ~45% of remaining width  │
│  fixed     │                             │                           │
│            │  ┌─ Tabs ───────────────┐  │  ┌─ Tabs ─────────────┐  │
│  Headings  │  │ Editor│Preview│Diff  │  │  │Questions│EI Prompts│  │
│  from MDX  │  └──────────────────────┘  │  └────────────────────┘  │
│            │                             │                           │
│  Click →   │  AdminMDXEditor            │  Scrollable question      │
│  scroll    │  (REUSED, not rebuilt)     │  list — collapsed /       │
│  to pos    │                             │  expanded inline          │
│            │                             │                           │
│  ────────  │  Article Metadata          │  + Add Question           │
│            │  (collapsed by default)    │  at bottom                │
│  EI counts │                             │                           │
│            │                             │                           │
└────────────┴─────────────────────────────┴───────────────────────────┘
```

**Why 55/45 split:** At 1440px with 200px outline + gutters, the remaining ~1180px gives ~650px article / ~530px questions. Both panels are functional. 50/50 makes both uncomfortably narrow for a real editing session.

**Why not tabs (article | questions):** Tabs destroy co-presence, which is the entire point of this interface. Three columns is non-negotiable.

**Why outline is fixed 200px:** It's small and high-value. Collapsing it adds toggle complexity with no proportional benefit. SMEs can resize their browser if they need more article width.

---

## Component 1: Content Bar

Always visible. Sticky. The editorial control panel.

### Anatomy

```
← Back to Articles    [Article title — editable inline]    ALE-HIST-001-06

Draft ▾    Intermediate ▾    12 questions    ● Unsaved changes

                                        [Discard]    [Save All — ⌘S]
```

### Field specs

**← Back to Articles**
Plain text link to `/admin/articles`. Does NOT trigger save. If unsaved changes exist, fires a browser confirmation dialog (`beforeunload`). User must explicitly choose to discard.

**Title input**
Inline editable. `Inter 500 16px`. Renders as styled text at rest; shows subtle underline border on focus. Not a visible form field until clicked. Marks `articleDirty = true` on change.

**ALE ID badge**
`DM Mono` badge. Pulled from the primary taxonomy node's `ale_id`. Not editable from the content bar. If no taxonomy node is linked: amber "No topic linked" warning badge.

**Status dropdown**
Draft / Review / Published. Existing `Select` component. Visual differentiation: Draft (neutral) / Review (amber) / Published (green). Prevents accidental publishing. Marks `articleDirty = true`.

**Difficulty dropdown**
Foundational / Intermediate / Advanced. Same `Select` component. Marks `articleDirty = true`.

**Questions count badge**
Live count of all related questions across all linked taxonomy nodes. Read-only. Gray — informational only. Updates when questions are added or deleted in-session.

**Unsaved indicator**
Filled amber dot (●) + "Unsaved changes" text. Appears the moment any item is modified (article, any question, any EI prompt). Disappears only after successful Save All. **This is the most important feedback signal in the interface — never hide it, never make it subtle.**

**Discard Changes button**
Ghost/outline button. Click triggers a confirmation dialog: *"Discard all unsaved changes? This will revert the article and all modified questions to their last saved state."* Two actions: "Keep editing" (primary, default) / "Discard" (destructive, red). Dialog is required — this is a high-consequence action.

**Save All button**
Primary blue. Always visible. Shows spinner during save. Post-save: "Saved ✓" for 1.5 seconds, then reverts to "Save All". On partial failure: "Saved with errors" in amber + a persistent error panel below the bar (details below).

**⌘S shortcut**
Globally bound via `useEffect`. Fires the same handler as Save All. Works regardless of which panel has focus. `event.preventDefault()` prevents browser's native "Save Page" dialog.

### Unsaved state — all four surfaces

This is the most critical UX problem. An SME who edits 8 questions and closes the tab has lost significant work.

| Surface | Treatment |
|---|---|
| Content bar | Amber dot ● + "Unsaved changes" text |
| Individual question cards | Small amber dot in top-right corner of modified cards |
| Individual EI prompt cards | Same amber dot |
| Browser tab title | Prefix with "● " — e.g., "● Roman Architecture \| SlateCamp Admin" |
| Tab close / navigation | `beforeunload` browser native dialog |

**What NOT to do:** Auto-save to `localStorage`. This creates false safety (data exists only in that browser) and causes confusion when the SME opens the page on a different machine. Auto-save must save to the database or not at all. The optional 60-second auto-save described in the spec must write to Supabase directly.

---

## Component 2: Outline Panel

Dual purpose: **navigation tool** (click to jump to section) and **coverage map** (see where the article has no questions).

### Anatomy

```
OUTLINE
─────────────────────
§ Key Innovations          3q
§ Notable Structures       5q
    § The Colosseum        2q
    § The Pantheon         2q
    § Basilica             1q
§ Construction Methods     2q
§ Legacy                   0q  ← amber

─────────────────────
EI PROMPTS
  § After "Key Innovations"
  § After "The Colosseum"
  + Add prompt
```

### Parsing logic

Parsed from article MDX content in real-time with a 300ms debounce (prevents flicker on every keypress).

```typescript
const headingRegex = /^(#{2,3})\s+(.+)$/gm
// Output: { level: 2 | 3, text: string, position: number }[]
```

Does NOT parse: H1 (article title), H4+, MDX component names, content inside code blocks.

### Click-to-scroll

Click a heading → CodeMirror editor scrolls to that heading's position in the document. Implementation: find character offset of the heading in the document string → `view.dispatch({ effects: EditorView.scrollIntoView(position) })`. This scrolls the **editor**, not the page.

### Question count badges

The `3q` badges are a **keyword heuristic** — sections are split by heading and matched against question stems. Not semantic, not precise. Badge shows a tooltip on hover: *"Approximate — based on keyword matching."*

**Sections with 0q are highlighted in amber**, not red. It's an opportunity signal, not an error.

### EI prompts section

Below the headings outline. Lists active EI prompts by their `insert_after_heading` value. Clicking an EI prompt entry:
1. Switches the questions panel to the EI Prompts tab
2. Highlights/scrolls to that specific prompt

"+ Add prompt" link opens a new prompt creation form in the EI Prompts tab.

---

## Component 3: Article Panel

**Reuses the existing `AdminMDXEditor` component without modification.** Do not fork CodeMirror. Import it. Wrap it if the column width requires adjustments.

### Tabs

**Editor (default)**
The existing AdminMDXEditor as-is. Full CodeMirror + component toolbar + syntax highlighting.

**Preview**
Rendered MDX output. Same preview renderer used in the current article editor.

**Diff (new)**
Session diff — compares `savedContent` (version on page load) vs `currentContent` (current editor state). Uses `diff` npm package. Added lines green, removed lines red. Unified diff format.

Tab label shows change count: **"Diff (14 changes)"** so the SME knows at a glance whether they've made significant edits.

### Article metadata section

Below the tabs, a collapsible "Article Metadata" section. Collapsed by default. Contains:

| Field | Input type |
|---|---|
| `ale_tests_you` | Text input — "What this tests you on" |
| `updated_note` | Text input — "What changed in the latest update" |
| `subject_label` | Text input (auto-populated from taxonomy, but editable) |
| `reviewer_comments` | Textarea |
| `reviewed_by` | Read-only display of reviewer name |

Collapsing keeps the article panel focused on what matters: the content. These fields are "About" metadata, not editorial content.

---

## Component 4: Questions Panel

The most complex component. Displays a potentially long question list in a scannable format, allows rapid in-context editing of all 17 fields, communicates dirty state per question.

### Tabs

- **Questions** (default)
- **EI Prompts**
- **+** — Not a tab, a button. Creates a new blank question inline at the top of the list and immediately expands it.

### Question list — collapsed state

Every card in collapsed state must communicate enough to be useful without expanding.

```
┌──────────────────────────────────────────────────────────┐
│ ● [■■■□□] difficulty   ALE-HIST-001-06   Has citation    │
│                                                          │
│ What was the primary structural system used in Roman     │
│ concrete vaulted construction...                  [Edit ▾]│
└──────────────────────────────────────────────────────────┘
```

**● (amber dot):** Visible only when this question has unsaved changes.

**Difficulty bar:** 5-segment visual bar representing `difficulty` value (0.0–1.0). More scannable than a number.

**ALE ID badge:** `DM Mono`, small. The taxonomy node `ale_id`.

**Citation badge:** "Has citation" (green) when `code_citation` is populated. No badge if empty. Missing citations are a quality gap.

**Question stem:** First 120 characters of `text`, truncated with ellipsis. Two lines max.

**Rationale indicator:** Small icon. Missing `rationale` = amber warning icon.

**Expand button:** "Edit ▾". Click expands the card in place. Accordion behavior — expanding one collapses the currently open question. **Exception:** Hold `Option/Alt` while clicking to open multiple simultaneously (power user mode).

### Question list — expanded state

Three collapsible field groups:

---

#### CORE — always expanded on first open

**`text` — Question stem**
Full textarea. Auto-grows with content. Label: "Question stem."

**`options` — Answer choices**
Editable list. Each option has a text input + radio button. Selected radio = `correct_option_id`. To change the correct answer: click the radio next to the correct option. Option labels (A/B/C/D) are auto-assigned by position — the SME edits text, not labels.

**`rationale` — Why the correct answer is correct**
Textarea. Character count shown: "247 characters." Amber indicator below 50 characters: *"Rationale is brief — consider expanding."*

---

#### DETAILS — collapsed by default

| Field | Input | Notes |
|---|---|---|
| `explanation` | Textarea | "Extended explanation (optional)" |
| `code_citation` | Text input | Placeholder: "BP 344 §C.6.3.a" |
| `difficulty` | Number input (0.00–1.00, step 0.05) + interactive bar | Bar and number input are linked |
| `is_assessment` | Checkbox | "Diagnostic only — exclude from practice sessions" |
| `application_context` | Text input | "Real-world scenario category" |
| `practice_context` | Tag input | Comma-separated or tag pills |
| `prompt_image_url` | Text input | Shows thumbnail preview if URL is valid |

---

#### METADATA — collapsed, read-only

| Field | Display |
|---|---|
| `question_id` | UUID, copyable |
| `topic_id` | UUID + taxonomy node name |
| `model_id` | AI model if question was AI-generated |
| `difficulty_rating` | IRT-computed. "Not yet computed" if null |
| `discrimination_rating` | Same treatment |
| `created_at / updated_at` | Timestamps |

---

### Why this grouping

Core = what every SME edits every time. Immediately visible on expand.

Details = important but not touched on every edit. Collapses away so the card doesn't become a wall of form fields.

Metadata = reference/audit information. Never distracts from content work.

### Grouping by taxonomy node

If the article is linked to multiple taxonomy nodes, group questions under ale_id headers:

```
ALE-HIST-001-06 — Roman Architecture          8 questions ▾
  [question cards...]

ALE-HIST-001-05 — Classical Greek Architecture  4 questions ▾
  [question cards...]
```

Each group independently collapsible.

### Empty state

```
        No questions for this topic yet.

        This article has no linked quiz questions.
        Add the first question to start building
        exam coverage for this topic.

                [+ Add First Question]
```

### Search and filter (20+ questions)

Filter bar appears automatically when question count exceeds 20:

- **Search:** Client-side text filter on question stem. Real-time, no server call.
- **Has rationale:** Toggle — All / Has rationale / Missing rationale
- **Has citation:** Toggle — All / Has citation / Missing citation
- **Difficulty:** Range slider 0.0–1.0

All filtering is client-side. Questions are already loaded. No pagination needed in v1.

---

## Component 5: EI Prompts Tab

EI prompts are inline interactive questions embedded within article text — "check your understanding" moments while reading.

### List structure

Ordered by `sort_order`. Each prompt is a collapsible card, collapsed by default.

### Collapsed state

```
┌────────────────────────────────────────────────────────────────┐
│ After: "Key Innovations"   [Published]   [active]              │
│ What was the defining innovation of Roman concrete?...   [Edit]│
└────────────────────────────────────────────────────────────────┘
```

### Expanded state — fields

| Field | Input | Notes |
|---|---|---|
| `insert_after_heading` | Text input | Must match exact heading text from outline. Validation on blur. |
| `prompt_text` | Textarea | The question |
| `reveal_text` | Textarea | The answer (open-response prompts) |
| `options` | Toggle → option list | "Add multiple choice options" toggle |
| `status` | Dropdown | Draft / Review / Published / Archived |
| `is_active` | Toggle | "Show to students" |
| `sort_order` | Number input + drag handle | Drag-to-reorder updates sort_order for all affected |

### The heading validation helper — critical

This is the single most important UX detail in this panel. If `insert_after_heading` is "Key innovation" but the article heading is "Key Innovations," the prompt silently never appears to students.

**Validation on blur:** Compare entered text against the outline panel's parsed heading list (case-insensitive for matching, but store the exact match). Show:
- ✓ green: heading found
- ⚠️ amber: *"No matching heading found — did you mean: Key Innovations?"*

Do not wait for save to catch this error. Catch it at input blur time.

---

## Component 6: Save All System

### Save sequence — exact UX flow

1. User clicks "Save All" or presses ⌘S.

2. Button enters loading state immediately: spinner + "Saving..." Disable the button. Do not allow double-saves.

3. Show pre-save summary below the button (or top toast): *"Saving: 1 article + 3 questions + 1 EI prompt..."*

4. Execute all server actions **in parallel** using `Promise.allSettled` — not `Promise.all`. Individual failures must not cancel the batch.

5. Results:

**All succeeded:**
- Button: "Saved ✓" for 1.5 seconds → back to "Save All"
- Unsaved indicator disappears
- All dirty flags reset to false
- Success toast: "All changes saved successfully."

**Partial failure:**
- Button: "Saved with errors" in amber
- A **persistent error panel** appears below the content bar (NOT a toast — must not auto-dismiss):

```
⚠️ Saved with errors
✓ Article saved
✓ 2 questions saved
✗ Question "What was the primary structural..." — Network error. Try again.
✓ EI Prompt saved
                              [Retry failed items]
```

Failed items retain amber dots. Successfully saved items clear their dirty state. "Retry failed items" re-runs only failed saves.

**Total failure:**
- Error toast: "Save failed — check your connection and try again."
- All items retain dirty state
- `beforeunload` warning remains active

### What gets saved

```typescript
// Article
updateWikiArticle(article_id, {
  title, content, status, difficulty_label,
  ale_tests_you, updated_note, subject_label, reviewer_comments
})

// Modified questions
// For each question_id in questionsDirty where value === true:
updateQuestion(question_id, {
  text, options, correct_option_id, rationale, explanation,
  code_citation, difficulty, is_assessment,
  application_context, practice_context, prompt_image_url
})

// New questions (created this session)
// For each in newQuestions:
createQuestion({ topic_id, text, options, correct_option_id, rationale, ... })

// Deleted questions (queued this session)
// For each in deletedQuestions:
deleteQuestion(question_id)

// Modified EI prompts — same pattern as questions
```

### Delete UX — two-step queue pattern

1. SME clicks delete icon (🗑) on a question card.
2. Card animates to destructive state: red border, red background, "Delete on next save" label + "Undo" button.
3. Question remains visible but visually marked.
4. On Save All: deletion executes.
5. "Undo" button cancels deletion (removes from `deletedQuestions`) any time before save.

**Why not immediate delete with undo toast:** The database delete happens on save, not immediately. The SME must see what they're about to delete before committing.

---

## Dirty State Provider — Implementation Contract

Centralized React context wrapping the entire editor. No prop drilling.

```typescript
type DirtyState = {
  // State
  articleDirty: boolean
  questionsDirty: Map<string, boolean>    // question_id → isDirty
  eiPromptsDirty: Map<string, boolean>    // prompt_id → isDirty
  newQuestions: QuestionDraft[]
  deletedQuestions: Set<string>

  // Computed
  isAnythingDirty: boolean
  dirtyCount: number                      // total modified items

  // Actions
  markArticleDirty: () => void
  markQuestionDirty: (questionId: string) => void
  markEIPromptDirty: (promptId: string) => void
  addNewQuestion: (draft: QuestionDraft) => void
  queueDelete: (questionId: string) => void
  undoDelete: (questionId: string) => void
  resetAllDirty: () => void               // called after successful save
}
```

Anyone in the component tree calls `markArticleDirty()` or `markQuestionDirty(id)` — the content bar reflects it immediately.

---

## Keyboard Navigation

| Shortcut | Action |
|---|---|
| ⌘S | Save All |
| ⌘Z | Undo (CodeMirror handles this internally) |
| Escape | Close the currently expanded question card |
| ⌘↵ | In an expanded question: save this question only (without saving article) |
| ⌘K | Focus the search/filter input in questions panel |
| Tab | Standard tab order through fields in expanded question |

⌘S must use `event.preventDefault()` to suppress the browser's native "Save Page" dialog.

---

## Loading States

Page uses a Server Component for initial fetch — no client-side skeletons needed on first load. Loading states required for:

**Save All:** Spinner on the Save All button. Small spinner in the header of each question card currently being saved.

**Preview tab:** MDX rendering can be slow for long articles. Show skeleton or spinner inside the Preview tab until render completes.

**New taxonomy node linked:** When the SME links a new node to the article, the questions panel must fetch questions for that node. Show 3 placeholder skeleton question cards while fetching.

---

## Error Boundaries

The three panels must have **independent error boundaries**. An error in the questions panel (e.g., malformed question JSON) must not crash the article editor. The SME must still be able to save article changes.

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│   ⚠️ Questions panel encountered an error.          │
│                                                      │
│   The article editor is still functional.            │
│   [Reload questions panel]                           │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## Edge Cases

### Article with no taxonomy nodes linked
Persistent warning banner inside the article panel: *"⚠️ No taxonomy node linked — questions cannot be added until a node is linked."* with a `TaxonomyPicker` button.

### New article (`/admin/content/new`)
Page loads with blank CodeMirror and empty states in both panels. Taxonomy node must be linked before creating questions. After first save: route must update from `/admin/content/new` to `/admin/content/[new_article_id]` using `router.replace` (not push — so back button doesn't return to `/new`).

### Very long article (5000+ words)
Article panel independently scrolls. Outline panel handles navigation. CodeMirror handles large documents efficiently. No pagination or lazy loading needed.

### Very many questions (50+)
Questions panel independently scrolls. Filter bar appears automatically above 20 questions. Accordion behavior (one expanded at a time) prevents the panel from becoming unmanageable.

### Concurrent editing (two admins, same article)
v1: Compare `updated_at` on save. If server's `updated_at` is newer than the client's page-load time, show: *"This article was modified by another user while you were editing. Review the changes before saving."* Full merge UI is v2.

---

## Navigation Entry Points

The unified editor is a **new route, not a replacement** for `/admin/articles/[id]`.

**From `/admin/articles` list:**
Add "Edit with Questions →" link/icon button in the actions column next to each article. Existing "Edit" action stays for simple edits.

**From `/admin/questions` list:**
Add "View in context →" link on each question. Navigates to `/admin/content/[article_id]` for the article linked to that question's taxonomy node. Requires lookup: `question.topic_id` → `wiki_article_taxonomy.article_id`.

**From admin sidebar:**
Add "Content Editor" under "Articles" and "Questions". Opens a `TaxonomyPicker` modal to select which article to edit.

**Direct URL:**
`/admin/content/[article_id]` — bookmarkable, shareable between team members.

---

## Implementation Phases — UX Readiness Notes

### Phase 1 — Route & Data Layer
Build the shell with all three columns visible and properly proportioned **before** writing any real data logic. Use placeholder content (Lorem ipsum in outline, gray skeleton bars in questions panel) to verify the three-column proportion at 1440px. Wrong proportions here poison every subsequent phase.

### Phase 2 — Article Panel
The AdminMDXEditor is reused, not rebuilt. The only UX work is ensuring it fits correctly within the 55% column — no horizontal overflow, no squished toolbar. Test with a 2000-word article before moving on.

### Phase 3 — Questions Panel
Highest-risk phase for scope creep. Invest time in the collapsed card's information density — it must be meaningful at a glance. The Core/Details/Metadata grouping is non-negotiable. An expanded question must not feel like a form dump.

### Phase 4 — EI Prompts Tab
The heading validation helper (matching `insert_after_heading` against parsed headings) is the most important UX detail in this panel. Build it in Phase 4, not as a later enhancement.

### Phase 5 — Save All
Test the **partial failure path explicitly**. Create a question with invalid data (or mock a network failure for one item) and verify: error panel appears correctly, successful items clear their dirty state, failed items retain amber dots, "Retry failed items" works.

### Phase 6 — Outline Panel
Ship click-to-scroll first. Add question count badges in a second pass. The section coverage feature is nice-to-have and must not delay shipping the navigation functionality.

### Phase 7 — Polish
Two most important polish items:
1. `beforeunload` warning — test on every navigation path: browser back button, admin sidebar links, tab close, page refresh.
2. Responsive stacking at <1280px — stack outline on top of article, stack article on top of questions. Content bar stays fixed. This is a narrow desktop fallback, not a mobile layout.

---

## New Files to Create

```
src/
  app/
    admin/
      content/
        [id]/
          page.tsx                      ← Server Component, data fetching
  components/
    admin/
      unified-editor/
        UnifiedContentEditor.tsx        ← Root client component, layout
        DirtyStateProvider.tsx          ← Context provider
        ContentBar.tsx                  ← Sticky top bar
        OutlinePanel.tsx                ← Left column
        ArticlePanel.tsx                ← Center column wrapper
        QuestionsPanel.tsx              ← Right column
        QuestionCard.tsx                ← Collapsed + expanded states
        QuestionInlineEditor.tsx        ← All 17 fields, grouped
        EIPromptsPanel.tsx              ← EI prompt list
        EIPromptCard.tsx                ← Individual EI prompt editor
        SaveAllBar.tsx                  ← Save summary + error panel
        index.ts                        ← Re-exports
  lib/
    actions/
      admin/
        content.ts                      ← getArticleTaxonomyNodes,
                                           getQuestionsByNodeIds,
                                           getTaxonomyNodeInfo
```

---

## What NOT to Build

- **No rebuild of CodeMirror.** Import `AdminMDXEditor`. Wrap it. Done.
- **No custom Select, Badge, Button, Input, Dialog, Tabs, Tooltip, Skeleton, TaxonomyPicker.** Every one of these exists in `src/components/ui/`. Use them.
- **No direct article_id column on questions.** The relationship goes through `wiki_article_taxonomy` → `taxonomy_tree` ← `questions`. Read the actual schema.
- **No localStorage auto-save.** Auto-save to the database or not at all.
- **No mobile layout in v1.** Desktop only. 1440px minimum.
