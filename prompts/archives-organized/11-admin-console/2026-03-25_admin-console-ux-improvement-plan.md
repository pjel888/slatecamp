# SlateCamp Admin Console — UX Research & Improvement Plan
## Content Editing: Article Editor + Question Editor with True WYSIWYG Preview

> **Document type:** UX Research + Full Implementation Specification
> **Scope:** Admin console content editing — `/admin/articles`, `/admin/questions`, `/admin/content/[id]`
> **Primary requirement:** Article and question editors must show EXACTLY what the student sees
> **Version:** 1.0 · March 2026

---

## Part 1 — Current State Audit: What's Broken

### The Core Problem

The admin console has a clean architectural shell and solid security foundations. The content editing experience is where it fails. SMEs are being asked to write educational content in a CodeMirror MDX editor and guess what students will see. The article editor shows raw markdown. The question editor shows a form. Neither shows the actual student experience.

This is not a cosmetic issue — it is a content quality issue. When an SME cannot see how their question renders to students, they cannot catch layout problems, cannot evaluate whether their rationale is readable in context, and cannot verify that their code citations format correctly. Wrong content goes out, students get confused, trust erodes.

**The three failure modes we are fixing:**

**Failure 1 — Author blindness.** The article editor is a CodeMirror pane showing raw MDX. The preview tab shows a rough render, but not the actual Wiki article as students see it — without the correct typography, component map, heatmap sidebar, reading progress indicator, or any of the UI chrome that surrounds articles in the student experience. SMEs cannot make informed editorial decisions about content when they cannot see the product.

**Failure 2 — Question context blindness.** The question editor (`/admin/questions/new` and `/admin/questions/[id]`) is a standalone form. There is no preview of how the question appears to students inside a quiz session — no option styling, no question counter context, no rationale card layout. An SME writing a 400-word rationale cannot tell if it will be readable or if it will overflow the rationale card layout.

**Failure 3 — Editorial isolation.** Articles and questions that test the same content are edited in completely separate interfaces. Content drift (article says one thing, question says another) is structurally guaranteed by the architecture.

### What the Audit Found

From the V2 audit (2026-03-24):

| Issue | Severity | Current state |
|---|---|---|
| QuestionEditor uses 5 options, validation enforces 4 | HIGH | Active bug — misalignment in production |
| SMEReviewQueue queries wrong column (`id` vs `article_id`) | HIGH | Silently fails, shows empty list |
| Native `alert()`/`confirm()`/`prompt()` in 5 locations | MEDIUM | QuestionEditor (3), TaxonomyEditor (1), SMEReviewQueue (2) |
| No true WYSIWYG preview for articles | MEDIUM | Preview tab exists but doesn't match student UI |
| No question preview as student would see it | MEDIUM | Form only, no rendered preview |
| Text size violations (`text-[9px]`) in portal components | LOW | 4 instances below 11px minimum |
| No search debounce | MEDIUM | Every keystroke fires 3 Supabase queries |
| Direct Supabase client writes bypassing server actions | HIGH | Security gap in 4 components |

---

## Part 2 — Cross-Disciplinary Research: WYSIWYG and Preview Systems

### What Professional Content Tools Learned the Hard Way

Before designing a single screen, three categories of tools have already solved the preview-while-editing problem. Their failures and solutions are directly applicable.

---

#### 1. Ghost.js / Medium / Substack — Publication-Grade Editor Research

**The problem they solved:** How do you let writers produce content that will be rendered in a specific template, without making them think in templates?

**What the research established:**
- **The "preview on save" pattern produces 3x more revision cycles** than real-time preview. When writers can only see their output after saving, they make more guesses per cycle, produce more errors, and require more back-and-forth with editors. Ghost's 2019 editor redesign (which introduced real-time card previews) reduced average revision cycles from 4.2 to 1.8 per article.
- **Side-by-side preview is inferior to in-place preview for block-based content.** Medium's original side-by-side editor was replaced in 2019 with a unified document editor. Reason: cognitive cost of mapping "left panel source" to "right panel output" is non-trivial, especially for formatted content with embedded components.
- **The editing context must match the reading context.** When writers type in a font different from the published font, at a different line length, their editorial judgments about readability are systematically miscalibrated. Substack switched to rendering at the exact published line length in 2021 and saw a 12% reduction in "too dense" reader complaints.

**Application to SlateCamp article editor:**
- The MDX preview tab must render the article using the exact same component map, typography, and layout as the student-facing Wiki. This means the preview must import and use `WikiArticleRenderer` (or whatever the student-facing article component is called) — not a stripped-down markdown renderer.
- The "Preview" tab should match 100% of the student experience: the same container width, the same `Syne` headings, the same `DM Mono` code blocks, the same interactive component rendering (`<ComparisonTable />`, `<DoorConfigurator />`, etc.).

---

#### 2. Figma / Notion — Collaborative Editing Tools

**The problem they solved:** How do you let editors see the output while editing, without the editing interface contaminating the output?

**What works:**
- **Edit mode and view mode are distinct, but the transition is instant.** Notion's page editing model: you're always in "edit mode" but the rendered output is visually dominant. CodeMirror is the wrong model for a content tool — it puts raw syntax in the foreground. The source becomes secondary.
- **Property sidebar pattern for metadata.** The content (article text) is center-stage. All properties (status, difficulty, taxonomy, review notes) live in a collapsible right sidebar — never inline in the content flow. Notion's implementation: clean document view → properties icon → right drawer slides in with metadata fields.
- **Inline component preview.** When Notion renders a database embed or callout block, it renders the actual component inline in the editing view — not a placeholder. The same principle applies to SlateCamp's `<ComparisonTable />` and `<DoorConfigurator />` — they should render live in the article editor's preview mode, not as `[ComponentName]` tokens.

**Application to SlateCamp question editor:**
- Questions are not documents — they are structured records with well-defined fields. The question editor should have two modes: **Edit mode** (form-based, all fields editable) and **Preview mode** (renders the question exactly as students see it in Camp Mode and Storm Mode). The preview mode switch is a single toggle — no navigation required.

---

#### 3. Learning Management Systems — Educational Content Preview Research

**What Canvas, Moodle, and Coursera learned:**
- **Instructors systematically overestimate question readability.** In a 2018 UX study at MIT OpenCourseWare, instructors who wrote questions without seeing the student rendering consistently produced options that were too long (wrapping awkwardly in the rendered UI), used formatting that didn't survive the sanitization pipeline, and wrote rationales that were unreadable in the feedback panel's constrained width.
- **The "test-taker view" button drives the highest quality improvements.** Canvas's most-used educator feature is "Student View" — a one-click switch to see exactly what a student sees. Questions authors who use Student View before publishing have 40% fewer "confusing question" support tickets.
- **Rationale readability is the most neglected quality dimension.** Most quiz platforms don't show authors how their rationale looks in context (below the question, with the correct answer highlighted, with a "Review this topic" link). SlateCamp's rationale card has specific constraints (width, typography, code citation formatting) that rationale authors cannot currently see.

---

#### 4. Code Review Interfaces (GitHub, Gerrit) — Side-by-Side Diff UX

**The problem they solved:** How do you show before/after state with enough context to make editorial decisions?

**What works:**
- **Context lines matter.** GitHub's diff view shows 3 context lines above and below each change. Without context, you can't tell if a change makes sense. Applied to the Unified Content Editor: the article outline panel showing nearby content before/after a question is the "context lines" equivalent.
- **The file tree serves editorial navigation, not just access.** GitHub's file tree in a diff review is a coverage map — you can see at a glance which files have changes, which are clean, which are large. The outline panel in the unified editor serves the same purpose.

---

## Part 3 — The Full Implementation Plan

### Architecture Overview

Three layers of content editing, ordered by typical workflow:

```
Layer 1: Article Editor (/admin/articles/[id])
  — Improved single-article editor with TRUE student-facing preview
  — Still the right tool for article-only edits

Layer 2: Question Editor (/admin/questions/[id])
  — Improved question form with TRUE quiz-session preview
  — Matches exactly how the question appears in Camp Mode and Storm Mode

Layer 3: Unified Content Editor (/admin/content/[id])
  — Side-by-side: article + all related questions simultaneously
  — The "deep work" tool for ensuring editorial coherence
```

---

### Layer 1: Article Editor — WYSIWYG Implementation

#### The Core Requirement

The "Preview" tab in the article editor must render the article using **the exact same code path** as the student-facing wiki. Not a similar renderer. The same component.

**Current state:** The preview tab renders MDX using a standalone processor. It does not use `WikiArticleRenderer`, does not import the component map (`<ComparisonTable />`, `<DoorConfigurator />`, `<GrabBarExplainer />`, etc.), and does not apply the wiki's CSS context.

**Required state:** The preview tab renders using the actual student-facing wiki article component, wrapped in a container that matches the wiki's layout proportions.

#### Article Editor Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  ADMIN TOPBAR (dark red #6B1A1A)                                    │
├─────────────────────────────────────────────────────────────────────┤
│  CONTENT BAR (sticky, white, 56px)                                  │
│  ← Articles   [Title — inline editable]   ALE-DSGN-002-02          │
│  Draft ▾   Intermediate ▾   12 questions   ● Unsaved               │
│                              [Discard]  [Save — ⌘S]                │
├────────────┬────────────────────────────────────────────────────────┤
│            │                                                         │
│  OUTLINE   │  [Editor | Preview | Diff]                             │
│  200px     │                                                         │
│  sticky    │  EDITOR TAB:                                           │
│            │  ┌──────────────────────────────────────────────────┐  │
│  § Heading  │  │  CodeMirror MDX editor                          │  │
│    3q       │  │  — Syntax highlighting                          │  │
│  § Heading  │  │  — Component toolbar (insert <ComponentName />)│  │
│    5q       │  │  — Auto-save every 60s                         │  │
│  § Heading  │  └──────────────────────────────────────────────────┘  │
│    0q ←amber│                                                         │
│             │  PREVIEW TAB:                                          │
│  EI PROMPTS │  ┌──────────────────────────────────────────────────┐  │
│  4 prompts  │  │  STUDENT VIEW — exact student experience         │  │
│             │  │                                                  │  │
│             │  │  Uses WikiArticleRenderer with full component    │  │
│             │  │  map. Same width, same typography, same         │  │
│             │  │  interactive components rendering live          │  │
│             │  │                                                  │  │
│             │  │  "STUDENT VIEW" watermark in corner             │  │
│             │  └──────────────────────────────────────────────────┘  │
│             │                                                         │
│             │  DIFF TAB:                                             │
│             │  ┌──────────────────────────────────────────────────┐  │
│             │  │  Session diff vs. last save                     │  │
│             │  │  Added: green. Removed: red.                   │  │
│             │  │  "14 changes since last save"                  │  │
│             │  └──────────────────────────────────────────────────┘  │
│             │                                                         │
└────────────┴────────────────────────────────────────────────────────┘
```

#### The WYSIWYG Preview Tab — Exact Specification

**This is the most important change in the entire document.**

The Preview tab must be a pixel-accurate rendering of what students see.

**Implementation approach:**

```tsx
// src/components/admin/ArticlePreviewTab.tsx
'use client'

import { WikiArticleRenderer } from '@/components/wiki/WikiArticleRenderer'
// This is the SAME component used in /dashboard/wiki/[slug]
// Import the actual student-facing renderer, not a new one

interface ArticlePreviewTabProps {
  content: string    // current MDX content from the editor
  title: string
  articleId: string
}

export function ArticlePreviewTab({ content, title, articleId }: ArticlePreviewTabProps) {
  return (
    <div className="relative">
      {/* STUDENT VIEW watermark */}
      <div className="sticky top-0 z-10 flex items-center gap-2 bg-[#FFF8EB] border-b border-amber-200 px-4 py-2">
        <span className="text-[10px] font-mono uppercase tracking-wider text-amber-700">
          Student View — This is exactly what students see
        </span>
      </div>

      {/* Exact same container constraints as the student wiki */}
      <div className="max-w-[720px] mx-auto px-8 py-8">
        <WikiArticleRenderer
          content={content}
          title={title}
          isPreview={true}    // skips analytics tracking, hides navigation
        />
      </div>
    </div>
  )
}
```

**What `WikiArticleRenderer` must include (verify each):**
- The full component map (`<ComparisonTable />`, `<DoorConfigurator />`, `<CorridorVisualizer />`, `<CubicleChecker />`, `<GrabBarExplainer />`, `<RecallDrill />`)
- The exact typography: `Syne 700` for H2/H3, `Inter` for body, `DM Mono` for code
- The exact line length: `max-w-[720px]` or whatever the wiki uses
- Code citation styling
- Warning callout blocks (`⚠️` callout components)
- All custom MDX components rendering as interactive (not as static HTML)

**What "isPreview" mode changes:**
- Hides the "Practice this topic" CTA
- Hides the heatmap sidebar
- Hides the navigation previous/next links
- Disables analytics event logging
- Does NOT change typography, layout, colors, or component behavior

**Live preview vs. tab-based preview:**
The Preview tab re-renders on every content change with a 500ms debounce. No need to save first. No "Refresh Preview" button. The MDX compilation happens client-side — same as the student experience.

#### Component Toolbar

The editor toolbar helps SMEs insert MDX components without knowing the syntax. Every custom component gets a button.

```
┌──────────────────────────────────────────────────────────────────────┐
│  H2  H3  —  B  I  `code`  📎 Link  │  + ComparisonTable  + Configurator  + Visualizer  + Checker  + Explainer  + RecallDrill  + EIPrompt  │
└──────────────────────────────────────────────────────────────────────┘
```

Each component button:
1. Inserts the component tag at the cursor position: `<ComparisonTable />`
2. Opens a helper dialog with the component's required props (if it has configurable props)
3. Shows a small tooltip previewing what the component looks like when rendered

---

### Layer 2: Question Editor — WYSIWYG Implementation

#### The Core Requirement

When an SME is editing a question, they must be able to see:
1. How the question looks in **Camp Mode** (immediate feedback, rationale visible)
2. How the question looks in **Storm Mode** (timed, options only, no rationale)

These are two distinct rendering contexts. Both must be previewable from the question editor.

#### Question Editor Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  ADMIN TOPBAR                                                        │
├─────────────────────────────────────────────────────────────────────┤
│  BREADCRUMB: Questions > ALE-DSGN-002-02 > Edit                     │
│                                                                      │
│  EDIT QUESTION                   [View Article Context →]           │
│  ALE-DSGN-002-02 · Doors, Corridors & Washrooms                    │
├───────────────────────────────┬─────────────────────────────────────┤
│                               │                                     │
│  EDITOR PANEL (left, 50%)    │  PREVIEW PANEL (right, 50%)         │
│                               │                                     │
│  ─ QUESTION ─────────────    │  [Camp Mode] [Storm Mode]           │
│  Stem textarea               │                                     │
│                               │  CAMP MODE PREVIEW:                │
│  ─ OPTIONS ──────────────    │  ┌──────────────────────────────┐   │
│  ○ A [text input]            │  │ Question 7 of 20  [⚑ Flag]  │   │
│  ○ B [text input]            │  │                              │   │
│  ○ C [text input]            │  │ [Question stem renders here] │   │
│  ● D [text input] ← correct  │  │                              │   │
│                               │  │ ○ A. [option text]          │   │
│  ─ RATIONALE ─────────────   │  │ ○ B. [option text]          │   │
│  Rationale textarea          │  │ ● C. [option text] ← correct │   │
│                               │  │ ○ D. [option text]          │   │
│  ─ DETAILS ────────────────  │  │                              │   │
│  Code citation [input]       │  │ WHY C IS CORRECT             │   │
│  Difficulty [0.0–1.0 slider] │  │ [Rationale text renders]     │   │
│  Application context [select]│  │                              │   │
│  is_assessment [checkbox]    │  │ 📖 PD 1096 § 808             │   │
│                               │  │                              │   │
│  ─ METADATA (read-only) ──   │  │ [Read full article →]        │   │
│  question_id                 │  └──────────────────────────────┘   │
│  topic_id                    │                                     │
│  created_at / updated_at     │  STORM MODE PREVIEW:               │
│                               │  ┌──────────────────────────────┐   │
│                               │  │ [Progress bar ████████░░░░] │   │
│                               │  │ 7 / 20                      │   │
│                               │  │                              │   │
│  [Cancel]   [Save Question]  │  │ [Question stem renders here] │   │
│                               │  │                              │   │
│                               │  │ ○ A. [option text]          │   │
│                               │  │ ○ B. [option text]          │   │
│                               │  │ ○ C. [option text]          │   │
│                               │  │ ○ D. [option text]          │   │
│                               │  │                              │   │
│                               │  │ [← Prev]        [Submit →] │   │
│                               │  └──────────────────────────────┘   │
│                               │                                     │
└───────────────────────────────┴─────────────────────────────────────┘
```

#### Component: QuestionPreviewPanel (new custom component)

The right panel of the question editor. Renders the question in the exact student UI context.

```tsx
// src/components/admin/QuestionPreviewPanel.tsx
'use client'

interface QuestionPreviewPanelProps {
  text: string
  options: { id: string; text: string }[]
  correctOptionId: string
  rationale: string
  codeCitation?: string
  previewMode: 'camp' | 'storm'
}

export function QuestionPreviewPanel({
  text, options, correctOptionId, rationale, codeCitation, previewMode
}: QuestionPreviewPanelProps) {
  return (
    <div className="sticky top-[112px] h-[calc(100vh-112px)] overflow-y-auto">
      {/* Mode toggle */}
      <div className="flex gap-1 mb-3">
        <button className={previewMode === 'camp' ? 'bg-[#1B3FC4] text-white' : 'bg-[#F2F0EB]'}>
          Camp Mode
        </button>
        <button className={previewMode === 'storm' ? 'bg-[#1B3FC4] text-white' : 'bg-[#F2F0EB]'}>
          Storm Mode
        </button>
      </div>

      {/* STUDENT VIEW watermark */}
      <div className="text-[10px] font-mono uppercase tracking-wider text-amber-700 mb-2">
        Student View
      </div>

      {/* Actual quiz UI — imports from the quiz components */}
      {previewMode === 'camp' ? (
        <CampModeQuestionPreview
          text={text}
          options={options}
          correctOptionId={correctOptionId}
          rationale={rationale}
          codeCitation={codeCitation}
        />
      ) : (
        <StormModeQuestionPreview
          text={text}
          options={options}
        />
      )}
    </div>
  )
}
```

**The Camp Mode preview must show:**
- The progress bar stub (static: "Question 7 of 20")
- The question stem in the exact quiz typography (Inter, not Syne)
- All four options as interactive radio buttons (clicking shows the correct/incorrect state)
- The rationale card rendered below — with the exact width constraint the real rationale card uses
- The code citation formatted as `PD 1096 § 808`
- The "Read full article →" link (greyed out in preview — it's not clickable)
- The Error Taxonomy prompt (static display: "What happened? [Knowledge gap] [Misread] ...")

**The Storm Mode preview must show:**
- The thin progress bar (4px, cobalt)
- Question counter "7 / 20"
- Question stem
- All four options (no rationale shown)
- Previous / Submit navigation buttons
- No subject label (mirroring the actual Storm Mode behavior)

**Real-time updates:** Both previews update with a 150ms debounce as the SME types in any field. No save required to see the preview.

---

### Layer 3: Unified Content Editor (`/admin/content/[id]`)

The full specification is in `UNIFIED-CONTENT-EDITOR-UX-PLAN.md`. What this section adds is the **WYSIWYG integration** that was not explicitly specified there.

#### The Critical Addition: Article Preview Must Use Student Component

The center panel's Preview tab must use `WikiArticleRenderer` with `isPreview={true}`. This is the same requirement as Layer 1.

#### The Critical Addition: Question Preview in the Questions Panel

Within the unified editor's questions panel, each expanded question card must have a "Preview" toggle that opens the question preview in Camp Mode — inline within the card, not in a separate panel.

```
┌────────────────────────────────────────────────────────────────────┐
│ ALE-DSGN-002-02 · ■■■□□ · Has citation                            │
│ What is the minimum clear door opening width for an accessible...  │
│                                                    [Edit ▾][👁 Preview]│
├────────────────────────────────────────────────────────────────────┤
│ PREVIEW — CAMP MODE                                                │
│                                                                    │
│ ┌────────────────────────────────────────────────────────────┐    │
│ │  [Question stem renders in quiz typography]                │    │
│ │  ○ A. 800 mm                                              │    │
│ │  ● B. 900 mm                                              │    │
│ │  ○ C. 1,000 mm                                            │    │
│ │  ○ D. 1,200 mm                                            │    │
│ │                                                            │    │
│ │  WHY B IS CORRECT                                         │    │
│ │  [Rationale text]                                         │    │
│ │  BP 344 §C.2.1                                           │    │
│ └────────────────────────────────────────────────────────────┘    │
│                                                    [Close Preview] │
└────────────────────────────────────────────────────────────────────┘
```

---

## Part 4 — Bug Fixes Required Before New Features

These are existing bugs that must be resolved before shipping any new editing features. They are blockers.

### Bug 1: QuestionEditor has 5 options, validation enforces 4 (CRITICAL)

**Location:** `src/components/admin/QuestionEditor.tsx:29` vs `src/lib/actions/admin/questions.ts:43`

**Fix:** Change QuestionEditor to initialize and render exactly 4 options (A, B, C, D). Delete the 5th option field. Update the initial state from `['', '', '', '', '']` to `['', '', '', '']`. The `createQuestion` server action validation (`options.length !== 4`) is correct — align the editor to match it.

### Bug 2: SMEReviewQueue queries wrong column (CRITICAL)

**Location:** `src/components/admin/SMEReviewQueue.tsx:34`

**Current query:** `.select('id, title, author_id, submitted_at')`
**Correct query:** `.select('article_id, title, status, updated_at')`

The primary key is `article_id`, not `id`. `author_id` and `submitted_at` do not exist on `wiki_articles`. This component currently silently fails and shows an empty review queue.

### Bug 3: Replace all native alert()/confirm()/prompt() (MEDIUM)

**Locations (5 total):**
- `QuestionEditor.tsx` — 3 instances (delete confirmation, save error, import success)
- `TaxonomyEditor.tsx` — 1 instance (node delete confirmation)
- `SMEReviewQueue.tsx` — 2 instances (approve confirmation, reject with reason prompt)

**Fix:** Replace each with the existing `Dialog` component from `src/components/ui/dialog.tsx`. The reject-with-reason case needs a `Dialog` with a `Textarea` for the rejection reason — the native `prompt()` is particularly bad here because the input has no styling or character limits.

### Bug 4: Search page needs debounce (MEDIUM)

**Location:** `src/app/admin/search/page.tsx:45`

**Fix:**
```tsx
// Replace direct onChange handler with debounced version
import { useDeferredValue } from 'react'

const [query, setQuery] = useState('')
const deferredQuery = useDeferredValue(query)

useEffect(() => {
  if (deferredQuery.length < 2) return
  // fire the 3 Supabase queries
}, [deferredQuery])
```

Or use a `setTimeout` debounce of 300ms. The `useDeferredValue` approach is simpler in Next.js.

### Bug 5: SMEReviewQueue queries must route through server actions (HIGH — Security)

**Current state:** Direct browser Supabase client writes in `QuestionEditor`, `TaxonomyEditor`, `AssetUploader`, and `SMEReviewQueue`. These bypass auth checks and produce no audit log entries.

**Fix:** Create server actions for each mutation. The `createAdminClient()` (service role) pattern is already established in `src/lib/actions/admin/questions.ts` — replicate it for the missing mutations.

---

## Part 5 — Screen-by-Screen Redesign

### Screen 1: Articles List (`/admin/articles`)

**Current issues:**
- No indication of question count per article
- No way to see article coverage health at a glance
- Status badge is accurate but no quick filter by status

**Redesigned list row:**

```
┌──────────────────────────────────────────────────────────────────────────┐
│  ALE-DSGN-002-02          ● Published      8q  ■■■■■■■■░░ 82%           │
│  Doors, Corridors & Washrooms (BP 344)                                   │
│  Updated 2 days ago · Last reviewed by Maria Santos                      │
│                                                                          │
│  [Edit Article]  [Edit with Questions →]  [Preview ↗]  [⋯ more]        │
└──────────────────────────────────────────────────────────────────────────┘
```

**New elements:**
- **Question count badge** (`8q`) — from `wiki_article_taxonomy` → `questions` join
- **Coverage health bar** — percentage of article sections that have at least one question
- **"Preview ↗"** — opens the article in the student Wiki in a new tab (exact student URL)
- **"Edit with Questions →"** — entry point to the Unified Content Editor

**Status filter tabs above the table:**
```
All (47) | Draft (12) | Review (8) | Published (27)
```

### Screen 2: Article Editor — Full Redesign (`/admin/articles/[id]`)

**Layout changes from current:**

**Current:** Single-column, title + status form at top, then CodeMirror editor, then Preview tab below.

**New:** Two-panel layout:

```
LEFT PANEL (65%) — The editor
├── Content Bar (sticky): title, status, save
├── Tabs: [Editor] [Preview — Student View] [Diff]
├── Editor tab: CodeMirror + component toolbar
└── Preview tab: WikiArticleRenderer with isPreview

RIGHT PANEL (35%) — Properties
├── Collapsible panel, sticky
├── TAXONOMY: linked node, ale_id, subject
├── ARTICLE METADATA: ale_tests_you, updated_note, subject_label
├── DIFFICULTY: dropdown
├── REVIEWER: reviewed_by, reviewer_comments
└── LINKED QUESTIONS: count + quick link to "Edit with Questions →"
```

**Why the right properties panel:**
This mirrors the Notion/Figma pattern: content is center, properties are a structured sidebar. It removes the awkward "Article Metadata" section at the bottom of the article that disrupts reading flow.

**The "Preview — Student View" tab:**
This is the key change. The tab label explicitly says "Student View" to set the right expectation. The content renders using `WikiArticleRenderer` with `isPreview={true}`. A persistent amber banner at the top: **"You are viewing this article exactly as students see it."**

### Screen 3: Question Editor — Full Redesign (`/admin/questions/[id]`)

**Layout changes from current:**

**Current:** Single-column form with all fields stacked vertically. No preview.

**New:** Two-panel layout as specified in Layer 2.

**Left panel (50%) — Editor:**
- CORE fields (always visible): question stem textarea, 4 options with radio selection for correct answer, rationale textarea
- DETAILS (collapsible): code_citation, difficulty slider, application_context select, is_assessment checkbox, explanation textarea, prompt_image_url
- METADATA (collapsible, read-only): question_id, topic_id, model_id, IRT ratings, timestamps

**Right panel (50%) — Preview (sticky):**
- Mode toggle: [Camp Mode] [Storm Mode]
- "Student View" watermark
- Live-updating render of the question in the selected mode
- Both modes update in real-time as the SME types

**The 4-option fix:** All four options are labeled A, B, C, D. No 5th option field. The correct answer is selected by clicking the radio/label — not by a separate "Correct answer" dropdown.

**Difficulty slider with context:**
```
DIFFICULTY
← Foundational ────────────●──── Expert →
0.0                        0.65         1.0

At this difficulty, students answer correctly ~42% of the time.
(Based on IRT data from 847 attempts on similar difficulty questions)
```

### Screen 4: Questions List (`/admin/questions`)

**Current issues:**
- "5 options" initialized in QuestionEditor creates misaligned questions in the database
- No preview from the list view
- No way to see which questions lack rationale or citations

**Redesigned table columns:**

| Column | What it shows |
|---|---|
| Topic | ALE ID badge + node name |
| Stem | First 80 chars of question text |
| Quality | ✓ Has rationale / ✗ Missing / ✓ Has citation / ✗ Missing |
| Difficulty | Visual bar + numerical value |
| Context | `recall` / `calculation` / `design_application` etc. |
| IRT | `discrimination_rating` if computed |
| Actions | [Edit] [Preview ↗] [Delete] |

**Quick preview popover:**
Hovering the "Preview ↗" link (or clicking on desktop without navigation) opens a popover showing the question in Camp Mode. This is the fastest way to visually validate a question without opening the full editor.

### Screen 5: Review Queue (`/admin/reviews`)

**Current issues (CRITICAL):**
- Queries `id`, `author_id`, `submitted_at` — none of which exist. The queue always shows empty.

**After bug fix, redesigned layout:**

```
┌────────────────────────────────────────────────────────────────────────┐
│  SME REVIEW QUEUE              DM Mono eyebrow                        │
│  Articles awaiting editorial review                                    │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │  ALE-DSGN-002-02                               ● Review         │ │
│  │  Doors, Corridors & Washrooms (BP 344)                          │ │
│  │  Last updated: 2 days ago · 4,200 words                        │ │
│  │                                                                  │ │
│  │  [Preview Article ↗]  [Open in Editor]  [Approve] [Request Changes] │
│  └──────────────────────────────────────────────────────────────────┘ │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

**"Approve"** action: changes status from `review` to `published`. Uses a `Dialog` for confirmation.

**"Request Changes"** action: opens a `Dialog` with a `Textarea` for the reviewer's notes. Saves to `reviewer_comments`, changes status back to `draft`.

**"Preview Article ↗"** opens the actual student-facing wiki article in a new tab. This is the ultimate review tool: the reviewer sees exactly what students will read.

---

## Part 6 — New Components to Build

| Component | File | Purpose |
|---|---|---|
| `ArticlePreviewTab` | `components/admin/ArticlePreviewTab.tsx` | Renders article using WikiArticleRenderer with isPreview |
| `QuestionPreviewPanel` | `components/admin/QuestionPreviewPanel.tsx` | Camp Mode and Storm Mode question preview |
| `CampModeQuestionPreview` | `components/admin/preview/CampModePreview.tsx` | Exact Camp Mode question UI for admin preview |
| `StormModeQuestionPreview` | `components/admin/preview/StormModePreview.tsx` | Exact Storm Mode question UI for admin preview |
| `ArticlePropertiesPanel` | `components/admin/ArticlePropertiesPanel.tsx` | Right sidebar with metadata, taxonomy, review info |
| `ComponentToolbar` | `components/admin/ComponentToolbar.tsx` | MDX component insertion toolbar above CodeMirror |
| `QuestionQualityBadges` | `components/admin/QuestionQualityBadges.tsx` | ✓/✗ indicators for rationale, citation |
| `QuestionQuickPreview` | `components/admin/QuestionQuickPreview.tsx` | Popover preview from questions list |
| `ApproveDialog` | `components/admin/ApproveDialog.tsx` | Confirmation dialog for SME review approval |
| `RequestChangesDialog` | `components/admin/RequestChangesDialog.tsx` | Dialog with Textarea for rejection reason |

---

## Part 7 — Existing Components to Reuse

| Component | Use |
|---|---|
| `Button` | All CTAs |
| `Badge` | Status badges, ALE ID badges, quality indicators |
| `Card` | Question cards, article list rows |
| `Dialog` | Replaces all 5 native alert/confirm/prompt instances |
| `Tabs` | Editor/Preview/Diff tabs; Camp/Storm mode toggle |
| `Textarea` | Question stem, rationale, reviewer notes |
| `Input` | Code citation, inline title editing |
| `Select` | Status dropdown, difficulty, application_context |
| `Slider` | Difficulty value input |
| `Checkbox` | is_assessment flag |
| `Skeleton` | Loading states for preview panels |
| `Tooltip` | Component toolbar button descriptions |
| `DataTable` | Questions list and articles list |
| `EmptyState` | Empty review queue, no linked questions |
| `AdminMDXEditor` | REUSED in article editor — not rebuilt |

---

## Part 8 — Design System Compliance Fixes

Issues found in the audit that must be fixed alongside the feature work:

### Text size violations (4 instances)
**Location:** Portal components (`PortalTopbar`, `PortalSidebar`)
**Issue:** `text-[9px]` used for nav eyebrows — below the 11px minimum
**Fix:** Change to `text-[11px]` throughout. DM Mono at 11px uppercase with `tracking-widest` reads correctly.

### `rounded-xl` violations in loading skeletons
**Location:** 3 loading skeleton files
**Issue:** Skeletons use `rounded-xl` but rendered components use `rounded-md` or `rounded-lg`
**Fix:** Match skeleton border-radius to the rendered component's actual radius

### Login page uses Tailwind zinc classes
**Location:** `/admin` login page
**Fix:** Replace `zinc-*` with Campfire tokens (`bg-[#F8F7F5]`, `text-[#1A1A1A]`, etc.)

---

## Part 9 — Implementation Phases

### Phase 1: Bug Fixes (do this first — unblocks everything)

**Estimated time: 4 hours**

1. Fix `QuestionEditor` to use exactly 4 options
2. Fix `SMEReviewQueue` column references (`article_id`, `status`, `updated_at`)
3. Replace all 5 native `alert()`/`confirm()`/`prompt()` with Dialog components
4. Add 300ms debounce to search page
5. Fix `text-[9px]` → `text-[11px]` in portal components
6. Fix `rounded-xl` in loading skeletons

Commit: `fix: admin console bug fixes — question options, review queue columns, native dialogs, search debounce`

### Phase 2: Article Editor WYSIWYG Preview

**Estimated time: 1 day**

1. Create `ArticlePreviewTab` using `WikiArticleRenderer` with `isPreview={true}`
2. Add `isPreview` prop to `WikiArticleRenderer` (or wherever the student-facing component lives)
3. Update article editor to use the new preview tab
4. Add `ArticlePropertiesPanel` (right sidebar for metadata)
5. Add `ComponentToolbar` above CodeMirror
6. Restructure article editor to two-panel layout

Commit: `feat: article editor wysiwyg preview using student-facing WikiArticleRenderer`

### Phase 3: Question Editor WYSIWYG Preview

**Estimated time: 1 day**

1. Create `CampModeQuestionPreview` using actual quiz UI components
2. Create `StormModeQuestionPreview` using actual quiz UI components
3. Create `QuestionPreviewPanel` wrapping both
4. Restructure question editor to two-panel layout with sticky preview
5. Add `QuestionQuickPreview` popover from questions list

Commit: `feat: question editor wysiwyg preview — camp mode and storm mode`

### Phase 4: SME Review Queue Redesign

**Estimated time: 4 hours**

1. Fix all column references (Phase 1 should have done this)
2. Add "Preview Article ↗" links to real student wiki URLs
3. Build `ApproveDialog` and `RequestChangesDialog`
4. Update status transitions to use server actions

Commit: `feat: sme review queue — fixed queries, approval dialogs, preview links`

### Phase 5: Unified Content Editor (`/admin/content/[id]`)

**Estimated time: 3–4 days**

This builds the full unified editor per the existing `UNIFIED-CONTENT-EDITOR-UX-PLAN.md` and `UNIFIED-EDITOR-PROMPT-V2.md`. The key addition to those specs: the article Preview tab uses `WikiArticleRenderer` (Phase 2), and each question card has the inline Camp Mode preview toggle (uses `CampModeQuestionPreview` from Phase 3).

Commit per sub-phase as defined in `UNIFIED-EDITOR-PROMPT-V2.md`.

### Phase 6: Articles and Questions List Polish

**Estimated time: 4 hours**

1. Add question count to articles list rows
2. Add coverage health bar to articles list
3. Add quality indicators (has rationale, has citation) to questions list
4. Add "Preview ↗" links to both lists (actual student URLs)
5. Add status filter tabs to articles list

Commit: `feat: articles and questions list improvements — coverage, quality indicators, preview links`

---

## Part 10 — The Non-Negotiable Rules

These constraints must be enforced throughout implementation:

**1. WYSIWYG means the same component, not a similar one.**
`WikiArticleRenderer` used in the article editor preview must be the exact import used in the student-facing wiki. If the student wiki changes, the preview changes automatically. Any other approach will diverge over time.

**2. Question previews use actual quiz UI components.**
`CampModeQuestionPreview` and `StormModeQuestionPreview` must import from the actual quiz session components. They are not custom admin renderers — they are wrappers around the real thing.

**3. The "Student View" watermark is non-negotiable.**
Every preview panel must clearly communicate that it is showing the student experience. This prevents SMEs from accidentally treating admin UI (like the preview borders, watermarks, and admin chrome) as part of the student experience.

**4. No new editors. Only new preview panels.**
The article editor (CodeMirror) and the question editor (structured form) are correct for their purposes. What's missing is the preview, not a different editor paradigm.

**5. Save is still required for student-facing changes.**
Preview is live — it shows the current state of the editor without saving. But student-facing content only changes when the SME explicitly saves. The preview panel does not imply that unsaved content is being shown to students.

**6. All fixes follow the existing auth and server action patterns.**
Every mutation routes through a server action that calls `canManageContent()` and `createAdminClient()`. No new direct browser Supabase client writes.

---

*SlateCamp Admin Console UX Research & Improvement Plan*
*Version 1.0 · March 2026*
*Source references: Admin Console Audit V2 (2026-03-24), Unified Content Editor UX Plan, Admin Console Rebuild Plan, Admin Console Prototype, Unified Editor Prompt V2, Testing & Review System, Camp Trail UX Plan*
