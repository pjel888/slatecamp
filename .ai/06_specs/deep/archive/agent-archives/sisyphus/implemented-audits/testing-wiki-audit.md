# Route Audit: /dashboard/testing & /dashboard/wiki

> **Consolidated Audit:** Merged from `testing-wiki-audit.md` + `wiki-audit.md`
> **Last updated:** 2026-04-04
> **Status:** Comprehensive audit — all UX paths, components, data flows, issues mapped.
> **Related:** `.sisyphus/plans/design-system-cleanup.md`, `.sisyphus/audits/quiz-testing-audit.md`

---

# PART 1: /dashboard/testing — Complete Route Audit

## Route Tree

```
/dashboard/testing/
├── layout.tsx                     — metadata ("Review & Testing | SlateCamp")
├── loading.tsx                    — skeleton
├── page.tsx                       — ReviewHub (server RSC, streams via Suspense)
│
├── camp/setup/page.tsx            — CampSetup (fetches completedSessionCount)
├── chill/setup/page.tsx           — ChillSetup (auth only)
├── storm/setup/page.tsx           — StormSetup (auth only)
├── focus-review/setup/page.tsx    — FocusReviewSetup (fetches weakNodes: mastery < 0.4)
├── custom/setup/page.tsx          — CustomSetup (auth only)
├── subject/setup/page.tsx         — SubjectSetup (fetches per-subject mastery)
├── endurance/setup/page.tsx       — EnduranceSetup (fetches last 5 extended_practice sessions)
│
├── session/[sessionId]/
│   ├── page.tsx                   — LEGACY v1 redirect → /quiz/[mode]/session/[id]
│   └── debrief/page.tsx           — DebriefLayout (completed sessions, simulation cold-delivery check)
│
└── simulation/
    ├── briefing/page.tsx          — Gate: readiness >= 65; SimulationBriefing
    └── [sessionId]/results/page.tsx — Cold-delivery results (24h window)
```

**Actual session engine lives at `/quiz/[mode]/session/[sessionId]/`** (separate route tree):
```
/quiz/[mode]/
├── setup/page.tsx                 — Unified setup for all modes
└── session/[sessionId]/
    ├── page.tsx                   — QuizShell (v2 session engine)
    └── results/page.tsx           — ResultsDashboard (v2 results)
        └── review/page.tsx        — Question review
```

Valid modes: `camp`, `chill`, `subject`, `focused`, `custom`, `storm`, `fullexam`, `extended`

## Zone Architecture

### Zone 01 — Foundations (Free)
| Mode | Route | Description |
|------|-------|-------------|
| **Camp** | `/quiz/camp/setup` | Guided study, instant feedback, no timer |
| **Chill** | `/quiz/chill/setup` | Relaxed, skippable, open-ended, End Session always visible |

### Zone 02 — Deliberate Practice (Pro)
| Mode | Route | Description |
|------|-------|-------------|
| **Subject** | `/quiz/subject/setup` | Single ALE subject deep-dive |
| **Focus Review** | `/quiz/focused/setup` | Targets weakest nodes (mastery < 40%) |
| **Custom** | `/quiz/custom/setup` | Full topic/difficulty/count control |

### Zone 03 — Exam Readiness (Pro)
| Mode | Route | Description |
|------|-------|-------------|
| **Storm** | `/quiz/storm/setup` | Timed, no feedback during, 1 min/question bar |
| **Full Exam Simulation** | `/quiz/fullexam/setup` | 200 questions, 24h cold delivery, gated at readiness >= 65 |
| **Endurance** | `/dashboard/area-c/design-quiz` | Routes OUTSIDE quiz engine to separate long-format picker |

## Complete UX Journey

### 1. Hub Page (`/dashboard/testing`)

**Data fetched** (9 parallel Supabase queries): `user_subscriptions`, `quiz_sessions`, `user_global_stats`, `blindspot_queues`, `profiles`, `user_node_mastery`, + 3 SR action calls.

**Sections rendered (in order):**
1. `DoseBanner` — daily pacing guidance
2. `WelcomeCard` (first time) OR `SmartSuggestionCard` (returning users)
3. `ZoneSection` x3 — mode cards with stats, Pro badges, simulation gate
4. `SRSection` — Successive Relearning (active/due cycles, spacing progress)
5. `SessionsTable` — all past sessions history

**SmartSuggestion priority engine** (client-side):
1. Pending blindspot queue → "Start Focus Review"
2. Exam in <= 30 days → Storm (<=7d) or Camp (>7d)
3. Weakest subject → Subject Mode
4. 48h+ absent → Camp Mode

### 2. Setup Flow

Each mode has a setup page. User configures:
- **Camp**: question count pills + ConfidenceCheck + FocusSelector
- **Storm**: question count pills + time estimate display
- **Chill**: minimal config
- **Focus Review**: shows top 5 weak nodes with mastery%, 12q fixed
- **Custom**: full topic/difficulty/count control
- **Subject**: subject picker + question count
- **Endurance**: extended practice config
- **Simulation Briefing**: gate check (readiness >= 65), consent flow

All call `startSession()` server action → `selectQuestionsWithInterleaving()` → insert to `quiz_sessions` → `router.push(ROUTES.QUIZ_V2_SESSION(mode, sessionId))`

### 3. Session Experience (`/quiz/[mode]/session/[sessionId]`)

**QuizShell (v2) renders:**
- Progress bar (top)
- Header: question counter + SaveIndicator + Flag + Navigator + Exit
- Question display with answer options
- Mode-specific behaviors:
  - **Camp**: select → Submit → see correctness + confidence + error tags → Next
  - **Storm**: select → Confirm → auto-advance (no correctness shown) → timer bar
  - **Chill**: select → Submit or Skip → End Session button always visible
- `StormTimerBar`: depletes over session, triggers `ConfirmSubmitSheet` on expire
- `NavigatorOverlay`: jump to any question
- `ConfirmSubmitSheet`: answered/unanswered/flagged counts + confirm or exit
- Auto-save every 10s to Supabase via `saveTestingInteraction()`
- LocalStorage backup per session key
- Keyboard: ArrowRight (advance if submitted), ArrowLeft (back)

**Questions fetched** in batches of 80 (handles 200-question fullexam). Correct answers stripped for client via `stripQuestionForClient()`.

**Completion**: `completeTestingSession()` → `recomputeAndSaveReadinessScore()` → `recordMastery()` → `updateSrsSchedule()` → `revalidatePath()`

### 4. Results/Debrief

**Two parallel debrief systems exist:**

| System | Route | Component | Features |
|--------|-------|-----------|----------|
| **v2 Results** | `/quiz/[mode]/session/[id]/results` | `ResultsDashboard` | Stamina blocks, confidence matrix, prediction scores, recommendations, "Practice Missed" shortcut |
| **Legacy Debrief** | `/dashboard/testing/session/[id]/debrief` | `DebriefLayout` | ScoreHero, ReadinessDelta, NodeMasteryStrip, QuestionReviewStrip, CalibrationReveal, BlockAccuracyChart |

**Simulation cold delivery**: `/dashboard/testing/simulation/[id]/results` — shows countdown if < 24h since completion, reveals full results after 24h window.

### 5. Review Flow

From `SessionsTable` on hub → click any past session → debrief page.
From `ResultsDashboard` → "Review Questions" inline review → per-question rationale display.
"Practice Missed" shortcut → `/quiz/focused/setup?source=missed&sessionId={id}`

## Key Components

| Component | File | Purpose |
|-----------|------|---------|
| `ReviewHub` | `components/testing/hub/ReviewHub.tsx` | Hub page orchestrator |
| `ModeCard` | `components/testing/hub/ModeCard.tsx` | Mode selection card with stats |
| `SessionsTable` | `components/testing/hub/SessionsTable.tsx` | Past sessions table |
| `QuizShell` | `components/quiz-v2/QuizShell.tsx` | v2 session engine |
| `ResultsDashboard` | `components/quiz-v2/results/ResultsDashboard.tsx` | v2 results |
| `DebriefLayout` | `components/testing/debrief/DebriefLayout.tsx` | Legacy debrief |
| `SetupPageClient` | `app/quiz/[mode]/setup/client.tsx` | Unified setup UI |

## Stores & State

| Store | Purpose |
|-------|---------|
| `useQuizStore` | Session state, current question, answers, flags, timer |
| `useQuizV2Store` (if exists) | v2 quiz state |

## Issues Found

1. **Dual routing**: Legacy `/dashboard/testing/*/setup` + new `/quiz/[mode]/setup` both exist. `ModeCard.href` points to `/quiz/` but `ROUTES.TESTING_SETUP` still points to dashboard
2. **Dual debrief**: `DebriefLayout` (legacy) vs `ResultsDashboard` (v2) — both active
3. **`SessionShell` is dead** (see dead code audit) but `QuizShell` is alive
4. **Endurance mode routes outside quiz engine** to `/dashboard/area-c/design-quiz`
5. **Legacy session redirect**: `/dashboard/testing/session/[id]/page.tsx` just redirects to quiz engine
6. **14 dead testing components** in hub/ and session/ directories (see Part A of cleanup plan)

## Happy Paths

| Path | Flow | Expected Outcome |
|------|------|-----------------|
| First-time Camp session | Hub → Camp ModeCard → Setup (count pills) → Start → 10 questions → Submit each → Results | Score + readiness delta + recommendations |
| Storm timed practice | Hub → Storm ModeCard → Setup → Start → Answer under time pressure → Timer expires or complete → Results | Score without per-question feedback, timer stats |
| Focus Review weak areas | Hub → SmartSuggestion "Focus Review" → Auto-configured 12q from weak nodes → Complete → Results | Targeted remediation, mastery improvement |
| Full Exam Simulation | Hub → Simulation (gated >= 65) → Briefing → Consent → 200q → Complete → Wait 24h → Cold-delivered results | Realistic exam simulation with delayed feedback |
| Review past session | Hub → SessionsTable → Click row → Debrief page | Full score breakdown, question review, retry option |

## Edge Cases

| Case | Behavior |
|------|----------|
| Readiness < 65 + click Simulation | Server redirect back to hub (gate enforced server-side) |
| No questions match filter | Empty state in setup ("No questions available for this configuration") |
| Session interrupted (browser close) | Auto-save every 10s + localStorage backup; resume on next visit |
| 200-question fullexam fetch | Batched in chunks of 80 to avoid timeout |
| Mode not in valid list | Quiz page shows 404 |

---

# PART 2: /dashboard/wiki — Complete Route Audit

## Route Tree

```
/dashboard/wiki/
├── layout.tsx         — WikiLayoutContent (3-pane shell, discipline contexts)
├── loading.tsx        — 3-pane skeleton (left sidebar + center + right sidebar)
├── page.tsx           — Welcome/index page (static marketing copy)
├── AGENTS.md          — Agent instructions
│
└── [slug]/
    ├── page.tsx       — Article detail (async Server Component, ~244 LOC)
    └── loading.tsx    — Article skeleton
```

## Three-Pane Architecture

```
┌─────────────────┬──────────────────────────┬─────────────────┐
│  LEFT SIDEBAR   │      CENTER PANE         │  RIGHT SIDEBAR  │
│                 │                          │                 │
│  WikiSidebar    │  WikiHeader              │  WikiQuizButton │
│  ├── Syllabus   │  WikiReadingProgress     │  Study in Notes │
│  │   tree       │  WrongAnswerBanner?      │  Related Topics │
│  │   (search)   │  WikiArticleHero         │  Feedback       │
│  └── Laws &     │  WikiArticle (MDX body)  │  Sources        │
│      Codes tree │  TeachBackPrompt?        │  Table of       │
│                 │  Prev/Next footer        │  Contents       │
│  Mobile: Sheet  │                          │  Mobile: Sheet  │
└─────────────────┴──────────────────────────┴─────────────────┘
```

**Layout data flow:**
1. `WikiLayoutContent` (server) fetches user + `user_global_stats` (discipline)
2. Wraps in `WikiDisciplineProvider` + `WikiNavigationProvider`
3. `WikiSidebarLoader` streams taxonomy tree via Suspense
4. `WikiContentShell` (client) shows skeleton during transitions

## Article Page — Data Fetching

All server-side via `Promise.all` (no waterfalls):

| Data | Source | Cache |
|------|--------|-------|
| Article + Node | `getCachedArticleAndNode(slug)` | `unstable_cache`, hourly revalidation |
| EI prompts | `getEIPromptsForArticle(article_id)` | Fresh |
| EI responses | `getUserEIResponsesForArticle(article_id)` | Fresh (user-specific) |
| Sources | `getArticleSources(article_id)` | Fresh |
| Teach-back criteria | `getTeachBackCriteria(node_id)` | Fresh |
| Related topics | Inline query (sibling nodes, max 3) | Fresh |
| Breadcrumbs | `getBreadcrumbTrail(node_id)` | Fresh |

**Special query params:**
- `?minimal=true` — strips header, right sidebar, prev/next footer (embedded/print mode)
- `?from=wrong-answer&topic=X` — shows `WrongAnswerBanner` at top

**Taxonomy-only fallback**: If node exists but no article published → simplified view with `WikiItemRenderer` + "Practice this Topic" CTA.

## MDX Rendering Pipeline

1. `stripLegacyEITags` — removes old `[EI]...[/EI]` tags
2. Strip HTML comments
3. `convertExpressionPropsToStrings` — bracket-counting parser for JSX prop conversion
4. `injectEIPrompts` — inserts `<EIPrompt idx={N} />` after matching headings
5. `resolveWidgets` — scans for widget names, dynamically imports only referenced ones
6. `compileMDX` from `next-mdx-remote/rsc` with `remarkGfm`
7. Fallback to plain text on compile error

## MDX Component Palette

### Prose Overrides
`h2`, `h3` (auto-ID for anchors), `table`, `thead`, `th`, `td`, `pre`, `code`

### Callout Blocks
`Note`, `Warn`/`Warning`, `Tip`, `Example`, `Callout`, `WikiCalloutBox`, `LawCallout`, `ExamTip`

### Exam-Focused
`WikiExamTable`, `WikiChangedPill`, `WikiPartHeader`, `WikiMistakeCard`, `WikiMistakeList`

### Interactive Learning Blocks
| Block | Persistence | Description |
|-------|-------------|-------------|
| `InlineQuiz` | Local state only | Self-contained MCQ — select → immediate reveal |
| `ElaborativeInterrogation` / `EIPrompt` | DB-persisted | "Think About It" — MCQ or open-ended, shows previous answer date |
| `RevealBlock` | No persistence | Drag-slider to un-blur content, keyboard accessible |
| `TeachBackPrompt` | DB-persisted | Write explanation → AI gap analysis → revision cycle |
| `WikiQuizModal` | DB-persisted | Multi-question quiz from article's node, gated feedback (2s delay) |
| `FormulaBlock` | N/A | Dark-themed formula renderer |
| `KeyValues` | N/A | Key-value pair display |
| `ComparisonTable` | N/A | Side-by-side comparison |

### Dynamic Widgets (Lazy-Loaded)

**BP-344 (Accessibility):** `DoorConfigurator`, `CorridorVisualizer`, `CubicleChecker`, `GrabBarExplainer`, `RecallDrill`, `AccessibilityChangesTable`

**DSGN-013 (Furniture/Equipment):** `BedroomPlanView`, `BedSizeComparator`, `WorkstationCalculator`, `DimensionDrill`, `BodyDimensionExplorer`, `ReachEnvelopeDiagram`, `BodyDimensionDrill`, `DHRatioExplorer`, `ProportionComparator`, `SpatialQualityDrill`

**3D:** `Lab3DWidget` (R3F 3D spatial model)

**2D:** `PHBuildingSetbacks` (setback illustration)

Widget registry: `src/components/wiki/widgets/registry.ts`

## Navigation

**Sidebar**: `TaxonomyTree` component with client-side filter (inline search when > 10 nodes). Two sections: Syllabus + Laws & Codes.

**Navigation transitions**: `useWikiNavigation().navigate(href)` wraps `router.push` in `startTransition` — `WikiContentShell` shows skeleton during transition.

**Mobile**: Left sidebar via Sheet drawer (below `md`), right sidebar via Sheet drawer (below `lg`).

## Right Sidebar Features

1. **"Review this Topic"** → lazy-loads `WikiQuizModal` (portal)
2. **"Study in Notes"** → `addWikiBookmark(articleId)` + toast
3. **Related Topics** → up to 3 sibling taxonomy nodes
4. **Feedback** → thumbs up/down (local state only — NOT persisted)
5. **Share** → copy article URL to clipboard
6. **Sources** → citation popover
7. **Table of Contents** → anchor links to h2/h3, scroll-aware active state

## Hidden Features

| Feature | Component | Description |
|---------|-----------|-------------|
| **Text Selection** | `WikiTextSelection` | Popover on text highlight: Highlight (stub), Copy, Add to Notes |
| **Read Tracking** | `WikiReadTracker` | Invisible — records `read_pct` + `time_spent_ms` on mount/scroll |
| **Reading Progress** | `WikiReadingProgress` | Thin progress bar tracking scroll depth |
| **Note Anchoring** | `WikiNoteAnchor` | Sets NoteContext for article-scoped notes |
| **Search Highlighting** | `WikiHighlighter` | Highlights search terms (trigger mechanism not surfaced in wiki UI) |

## Search

| Type | Implementation | Status |
|------|----------------|--------|
| Sidebar filter | `TaxonomyTree` with inline input | Client-side, filters already-fetched nodes |
| Full-text search | `searchWiki()` / `searchWikiPaginated()` in `lib/actions/wiki.ts` | **Functions exist but NO search UI in wiki route** |
| AI Tutor RAG | `searchWiki()` used by `/api/ai/tutor/route.ts` | Active via AI tutor |

## Complete UX Journey

```
1. ENTRY
   → /dashboard/wiki (direct nav or sidebar)
   → /dashboard/wiki/[slug] (direct link, wrong-answer redirect, AI tutor link)

2. LANDING
   → Welcome card: "Select a topic from the taxonomy tree"
   → Left sidebar streams taxonomy tree via Suspense

3. BROWSE
   → Expand category → sub-category → leaf node → click
   → WikiContentShell shows skeleton during transition
   → Article page streams in

4. READ ARTICLE
   → WikiArticleHero: subject badge, difficulty badge, read time, title
   → WikiArticle body (MDX): prose + callouts + formulas + tables
   → Interactive blocks inline: InlineQuiz, EIPrompt, RevealBlock
   → TeachBackPrompt after article (if criteria exist)
   → WikiReadTracker silently records progress

5. INTERACT
   → InlineQuiz: select answer → immediate feedback (local only)
   → EIPrompt: answer → saved to DB → "You answered this on [date]"
   → RevealBlock: drag slider to reveal → keyboard accessible
   → TeachBackPrompt: write 20+ words → AI evaluates → revision cycle
   → Text selection: highlight → Copy / Add to Notes
   → WikiQuizModal: multi-question quiz with 2s feedback gate

6. RIGHT SIDEBAR
   → "Review this Topic" → WikiQuizModal
   → "Study in Notes" → bookmark
   → Related Topics → navigate to sibling articles
   → Table of Contents → scroll to section

7. CONNECTION TO QUIZ ENGINE
   → "Practice this Topic" CTA → /quiz/subject/setup or /quiz/camp/setup
   → WikiQuizModal → inline quiz session
   → Wrong-answer redirect: quiz → /dashboard/wiki/[slug]?from=wrong-answer
```

## Happy Paths

| Path | Flow | Expected Outcome |
|------|------|-----------------|
| Browse and read article | Wiki landing → expand tree → click article → scroll through | Read tracking recorded, progress bar fills |
| Answer EI prompt | Read article → encounter EI block → select answer | Answer saved, "You answered this" badge on revisit |
| Take article quiz | Read article → "Review this Topic" → WikiQuizModal → answer 5q | Score + passing/building/needs-review label |
| Teach-back exercise | Read article → TeachBackPrompt → write explanation → submit | AI evaluates, shows gaps, revision prompt |
| Quick recall via RevealBlock | Read article → encounter RevealBlock → drag to reveal | Active recall reinforcement |
| Navigate from wrong answer | Get question wrong in quiz → click "Study" → wiki article with banner | Targeted remediation reading |
| Add to notes | Read article → select text → "Add to Notes" | Note drawer opens with pre-filled text |

## Issues Found

1. **No wiki search UI** — `searchWiki()` functions exist but have no connected search interface in the wiki route. Only sidebar taxonomy filter exists.
2. **Prev/Next footer is a stub** — renders static placeholder text, not wired to actual sibling navigation.
3. **Highlight action is a stub** — `WikiTextSelection` highlight button has no DB persistence.
4. **Feedback not persisted** — thumbs up/down is local state only, no server action.
5. **`wiki/Tabs.tsx`** uses deprecated color tokens (see cleanup plan Part B3).

## Key Components

| Component | File | Purpose |
|-----------|------|---------|
| `WikiLayoutContent` | `components/wiki/WikiLayoutContent.tsx` | 3-pane shell, data fetching |
| `WikiSidebar` | `components/wiki/WikiSidebar.tsx` | Taxonomy tree navigation |
| `WikiArticle` | `components/wiki/WikiArticle.tsx` | MDX rendering pipeline |
| `WikiQuizModal` | `components/wiki/WikiQuizModal.tsx` | Article quiz overlay |
| `TeachBackPrompt` | `components/wiki/TeachBackPrompt.tsx` | AI-evaluated teach-back |
| `ElaborativeInterrogation` | `components/wiki/ElaborativeInterrogation.tsx` | Think-about-it blocks |
| `WikiReadTracker` | `components/wiki/WikiReadTracker.tsx` | Silent read analytics |
| `WikiTextSelection` | `components/wiki/WikiTextSelection.tsx` | Selection popover |
| `TaxonomyTree` | `components/shared/taxonomy-tree.tsx` | Shared tree component |

---

# Cross-Route Findings

## Shared Components Between Routes

| Component | Used By Testing | Used By Wiki | Shared? |
|-----------|----------------|--------------|---------|
| `TaxonomyTree` | FocusReviewSetup, SubjectSetup | WikiSidebar | Yes (`shared/`) |
| `ScoreDisplay` | ReviewHub, ModeCard | Not directly | Yes (`shared/`) |
| `DataTable` | SessionsTable | Not directly | Yes (`shared/`) |
| `Badge` | Mode badges, session status | Subject/difficulty badges | Yes (`ui/`) |
| `Card` | ModeCard, stat cards | Not directly | Yes (`ui/`) |
| `Dialog` | ConfirmSubmitSheet | WikiQuizModal | Partial (quiz modals bypass it) |

## Data Flow Connections

```
Testing → Wiki: Wrong-answer redirect sends user to wiki article
Wiki → Testing: "Practice this Topic" CTA routes to /quiz/*/setup
Both share: taxonomy_tree table, user_node_mastery table, quiz_sessions table
```

---

# Consolidated Audit Complete

**Last updated:** 2026-04-04
**Status:** Single consolidated file with all wiki and testing audit content
**Codebase verified:** ✅ 5 wiki routes, 78 wiki components, 5 wiki action files
/dashboard/wiki/
├── layout.tsx         — WikiLayoutContent (3-pane shell, discipline contexts)
├── loading.tsx        — 3-pane skeleton (left sidebar + center + right sidebar)
├── page.tsx           — Welcome/index page (static marketing copy, client component)
├── AGENTS.md          — Agent instructions for this route
│
└── [slug]/
    ├── page.tsx       — Article detail (async Server Component, ~244 LOC)
    └── loading.tsx    — Article skeleton (center-pane only)
```

No nested dynamic segments, no catch-all, no parallel routes, no intercepting routes.

---

## 2. Three-Pane Architecture

```
┌──────────────────┬────────────────────────────────┬──────────────────┐
│   LEFT SIDEBAR   │         CENTER PANE            │  RIGHT SIDEBAR   │
│   (280px fixed)  │      (flex-1, scrollable)      │  (240px fixed)   │
│                  │                                │                  │
│  WikiSidebar     │  WikiHeader                    │  WikiQuizButton  │
│  ├── Syllabus    │    └── WikiHeaderClient        │  Study in Notes  │
│  │   tree        │        ├── Back arrow          │  Related Topics  │
│  │   (search     │        ├── Breadcrumbs         │  Feedback ↑↓     │
│  │    filter)    │        ├── WikiBookmarks       │  Share (copy)    │
│  └── Laws &      │        └── Mobile nav triggers │  Sources         │
│      Codes tree  │  WikiReadingProgress (bar)     │  Table of        │
│                  │  WrongAnswerBanner? (cond.)    │  Contents        │
│  Mobile: Sheet   │  WikiArticleHero               │                  │
│  drawer (< md)   │  WikiArticle (MDX body)        │  Mobile: Sheet   │
│                  │  TeachBackPrompt? (cond.)      │  drawer (< lg)   │
│                  │  Prev/Next footer (STUB)       │                  │
└──────────────────┴────────────────────────────────┴──────────────────┘
```

### Layout Data Flow

1. `WikiLayoutContent` (async Server Component) fetches user + `user_global_stats` (discipline ID + name)
2. Wraps in two React Contexts:
   - `WikiDisciplineProvider` — provides `disciplineId`, `disciplineName`
   - `WikiNavigationProvider` — provides `isPending`, `navigate(href)`
3. `WikiSidebarLoader` (server) streams taxonomy tree via own `<Suspense>` boundary
4. `WikiContentShell` (client) reads `useWikiNavigation().isPending` — shows `ArticleSkeleton` during transitions

**No discipline fallback:** If user has no `disciplineId`, renders empty sidebar with "Go to Settings" prompt.

---

## 3. Article Page — Data Fetching

All server-side via `Promise.all` (zero waterfalls):

| Data | Function | Source Table | Cache |
|------|----------|-------------|-------|
| Article + Node | `getCachedArticleAndNode(slug)` | `wiki_articles` + `taxonomy_tree` | `unstable_cache`, hourly revalidation |
| EI prompts | `getEIPromptsForArticle(article_id)` | `ei_prompts` | Fresh |
| EI responses | `getUserEIResponsesForArticle(article_id)` | `ei_responses` | Fresh (user-specific) |
| Sources | `getArticleSources(article_id)` | `wiki_article_sources` | Fresh |
| Teach-back criteria | `getTeachBackCriteria(node_id)` | (server action) | Fresh |
| Related topics | Inline query (sibling nodes, max 3) | `taxonomy_tree` | Fresh |
| Breadcrumbs | `getBreadcrumbTrail(node_id)` | `taxonomy_tree` | Fresh (inside WikiHeader) |

### Special Query Parameters

| Param | Effect |
|-------|--------|
| `?minimal=true` | Strips header, right sidebar, prev/next footer — for embedded/print views |
| `?from=wrong-answer&topic=X` | Shows `WrongAnswerBanner` at top of article |

### Taxonomy-Only Fallback

If `node` exists but `article` is null (topic in taxonomy but no published article):
- Renders simplified view: `WikiHeader` + raw `wiki_items` array via `WikiItemRenderer`
- Shows "Practice this Topic" CTA → `/quiz/subject/setup`

---

## 4. MDX Rendering Pipeline

**Component:** `WikiArticle` (`src/components/wiki/WikiArticle.tsx`) — async Server Component

### Processing Steps (in order)

```
1. stripLegacyEITags(content)        — removes old [EI]...[/EI] markdown tags
2. Strip HTML comments (<!--...-->)
3. convertExpressionPropsToStrings() — bracket-counting parser: prop={[...]} → prop="[...]"
4. injectEIPrompts()                 — inserts <EIPrompt idx={N} /> after matching headings
5. resolveWidgets(processedContent)  — scans for <WidgetName patterns, dynamic imports
6. compileMDX() from next-mdx-remote/rsc + remarkGfm
7. Fallback: plain text on compile error (handles tags like <1st>)
```

### MDX Component Palette

#### Prose Overrides
`h2` (auto-ID for anchors), `h3` (auto-ID), `table`, `thead`, `th`, `td`, `pre`, `code`

#### Callout Blocks (8 variants)
| Component | Purpose | Visual |
|-----------|---------|--------|
| `Note` | Informational callout | Blue left border |
| `Warn` / `Warning` | Warning callout | Amber left border |
| `Tip` | Helpful tip | Green left border |
| `Example` | Example callout | Gray left border |
| `Callout` | Generic callout | Configurable |
| `WikiCalloutBox` | Wiki-specific callout | Campfire styled |
| `LawCallout` | Legal citation | Law code reference |
| `ExamTip` | Exam strategy tip | Camp Cobalt accent |

#### Exam-Focused Blocks
| Component | Purpose |
|-----------|---------|
| `WikiExamTable` | Styled exam reference table |
| `WikiChangedPill` | "Recently changed" indicator |
| `WikiPartHeader` | Section divider with part number |
| `WikiMistakeCard` | Single common mistake pattern |
| `WikiMistakeList` | List of common mistakes |

#### Interactive Learning Blocks (6 types)

| Block | File | Persistence | Mechanic |
|-------|------|-------------|----------|
| **InlineQuiz** | `wiki/InlineQuiz.tsx` | Local state only | Self-contained MCQ: select → immediate reveal of correct/incorrect + rationale. No DB write. One-shot per page load. |
| **ElaborativeInterrogation** | `wiki/ElaborativeInterrogation.tsx` | DB-persisted (`ei_responses`) | "Think About It" block. Two modes: MCQ (options array) or open-ended (textarea). Shows "You answered this on [date]" badge. `trackEvent('ei_prompt_answered')`. Reveal text after answer. DOMPurify sanitized. |
| **RevealBlock** | `wiki/RevealBlock.tsx` | No persistence | Drag-slider to progressively un-blur content (`@use-gesture/react`). Quick-toggle Show/Hide. Keyboard: arrow keys, Home, End. |
| **TeachBackPrompt** | `wiki/TeachBackPrompt.tsx` | DB-persisted | Rendered AFTER article body (not in MDX). Only if `getTeachBackCriteria(node_id)` returns criteria. Phase machine: `prompt → submitting → result → revising → done`. AI evaluates → returns `correct_points`, `gaps`, `factual_errors`, `revision_prompt`. Min 20 words. |
| **WikiQuizModal** | `wiki/WikiQuizModal.tsx` | DB-persisted | Lazy-loaded portal. Fetches `getWikiQuizQuestions(nodeId, articleSlug)`. States: `loading → question → feedback → results` (or `empty`). **Gated feedback**: 2-second countdown before "Next" active (forces reading rationale). SlideToSubmit for answer. Progress dots (green correct / amber incorrect). Results: fraction + percentage + "Passing/Building/Needs review". Full a11y: focus trap, Escape, body scroll lock, `aria-modal`. |
| **FormulaBlock** | `wiki/FormulaBlock.tsx` | N/A | Dark-themed formula renderer with variable/operator/operand structure |

#### Content Organization Blocks
`Tabs`/`Tab`, `Accordion`/`AccordionItem`, `KeyValues`, `ComparisonTable`, `SubjectSnapshot`, `ProcessFlow`

#### Citations
`WikiReference` — wiki-to-wiki reference with hover summary popover

#### Dynamic Widgets (Lazy-Loaded via Registry)

**Registry:** `src/components/wiki/widgets/registry.ts`

**BP-344 (Accessibility Standards — 6 widgets):**
| Widget | Purpose |
|--------|---------|
| `AccessibilityChangesTable` | 2024 vs 2013 IRR comparison |
| `DoorConfigurator` | Door compliance configurator |
| `CorridorVisualizer` | Corridor width visualization |
| `CubicleChecker` | Toilet cubicle compliance checker |
| `GrabBarExplainer` | Grab bar reference points diagram |
| `RecallDrill` | Flashcard retrieval practice |

**DSGN-013 (Furniture/Equipment — 10 widgets):**
| Widget | Purpose |
|--------|---------|
| `BedroomPlanView` | SVG bedroom plan with clearance zones |
| `BedSizeComparator` | Bed size comparison with room planning |
| `WorkstationCalculator` | Office floor area calculator |
| `DimensionDrill` | Flashcard drill for dimensions |
| `BodyDimensionExplorer` | Anthropometric data explorer |
| `ReachEnvelopeDiagram` | Reach envelope zones |
| `BodyDimensionDrill` | Anthropometric flashcards |
| `DHRatioExplorer` | Depth-to-height ratio explorer |
| `ProportionComparator` | Room proportion comparison |
| `SpatialQualityDrill` | Spatial quality flashcards |

**3D:** `Lab3DWidget` — R3F 3D spatial model
**2D:** `PHBuildingSetbacks` — Property line setback illustration

---

## 5. Sidebar Navigation

### Taxonomy Tree

**Component:** `TaxonomyTree` (`src/components/shared/taxonomy-tree.tsx`) — shared component

Two sections in wiki sidebar:
1. **Syllabus** — main ALE taxonomy (8 root categories), `showSearch={true}`
2. **Laws & Codes** — separate law taxonomy tree, `showSearch={false}`

**Search:** Inline filter input appears when tree has > 10 nodes. Client-side filtering of already-fetched nodes (not a Supabase query).

**Data:** `getTaxonomyTree(disciplineId)` + `getLawsTaxonomyTree(disciplineId)` fetched in parallel by `WikiSidebarLoader`.

**Active state:** Current slug derived from `usePathname()` — highlights current article.

### Navigation Transitions

```
Click sidebar link
  → useWikiNavigation().navigate(href)
  → wraps router.push in startTransition
  → WikiContentShell detects isPending=true
  → Shows ArticleSkeleton
  → Article page streams in
  → isPending=false, skeleton replaced with content
```

### Mobile Adaptation
- **Below `md`**: Left sidebar hidden; Sheet drawer triggered from hamburger in WikiHeaderClient
- **Below `lg`**: Right sidebar hidden; Sheet drawer triggered from list-bullets button in WikiHeaderClient

---

## 6. Right Sidebar — `WikiRightSidebar`

Fixed order, strict hierarchy:

| # | Feature | Component | Behavior |
|---|---------|-----------|----------|
| 1 | "Review this Topic" | `WikiQuizButton` → `WikiQuizModal` (lazy) | Opens quiz overlay (portal to document.body) |
| 2 | "Study in Notes" | Button | `addWikiBookmark(articleId)` + toast notification |
| 3 | Related Topics | `WikiRelatedPopover` | Up to 3 sibling taxonomy nodes, click to navigate |
| 4 | Feedback | Thumbs up/down toggle | **Local state only — NOT persisted to DB** |
| 5 | Share | Button | Copies article URL to clipboard |
| 6 | Sources | `WikiSourcesPopover` | Article citations |
| 7 | Table of Contents | `WikiTableOfContents` | Anchor links to h2/h3, scroll-aware active state via `scrollContainerId` |

---

## 7. Hidden Features

| Feature | Component | File | Behavior |
|---------|-----------|------|----------|
| **Text Selection Popover** | `WikiTextSelection` | `wiki/WikiTextSelection.tsx` | Appears on text highlight within `#wiki-center-pane`. Actions: Highlight (STUB — no DB persist), Copy, Add to Notes (opens note drawer via `useNoteContext().openDrawer` with pre-filled text) |
| **Read Tracking** | `WikiReadTracker` | `wiki/WikiReadTracker.tsx` | Invisible component mounted on every article. `recordArticleRead` on mount; `updateReadProgress` on scroll/visibility-change/unmount. Tracks `read_pct` (max scroll depth) and `time_spent_ms`. |
| **Reading Progress** | `WikiReadingProgress` | `wiki/WikiReadingProgress.tsx` | Thin progress bar tracking scroll depth in `#wiki-center-pane`. Visual only. |
| **Note Anchoring** | `WikiNoteAnchor` | `wiki/WikiNoteAnchor.tsx` | Sets NoteContext for article-scoped notes |
| **Search Highlighting** | `WikiHighlighter` | `wiki/WikiHighlighter.tsx` | Highlights search terms in article content. **Trigger mechanism not surfaced in wiki UI** — no in-route search passes terms to it. |

---

## 8. Search

| Type | Implementation | Status |
|------|----------------|--------|
| **Sidebar filter** | `TaxonomyTree` inline input | Active — client-side, filters already-fetched nodes |
| **Full-text search** | `searchWiki()` / `searchWikiPaginated()` in `lib/actions/wiki.ts` | **Functions exist but NO search UI in wiki route** |
| **AI Tutor RAG** | `searchWiki()` used by `/api/ai/tutor/route.ts` | Active — used for AI context retrieval |
| **Validation schema** | `wikiSearchSchema` in `lib/validations/index.ts:56` | Exists — Zod schema ready |

**Gap:** Full-text search backend is built and validated but has no connected UI in the wiki route. The sidebar only does client-side taxonomy filtering.

---

## 9. Complete UX Journey

```
1. ENTRY POINTS
   → /dashboard/wiki              (direct nav or sidebar link)
   → /dashboard/wiki/[slug]       (direct link, quiz wrong-answer redirect, AI tutor link)
   → ?from=wrong-answer&topic=X   (from quiz engine after wrong answer → WrongAnswerBanner)
   → ?minimal=true                (embedded/print mode — strips chrome)

2. LANDING (/dashboard/wiki)
   → Welcome card: "Select a topic from the taxonomy tree on the left"
   → Left sidebar streams taxonomy tree via Suspense
   → User browses tree: expand category → sub-category → leaf node → click

3. SIDEBAR NAVIGATION
   → Click triggers WikiNavigationContext.navigate(href)
   → React startTransition wraps router.push
   → WikiContentShell shows ArticleSkeleton during transition
   → Article page streams in; skeleton replaced

4. ARTICLE PAGE RENDER
   → WikiHeader: breadcrumb trail + back arrow + bookmarks + mobile nav triggers
   → WikiReadingProgress: thin progress bar starts tracking scroll
   → WikiReadTracker: invisible — records read on mount
   → WrongAnswerBanner: conditional (if ?from=wrong-answer)
   → WikiArticleHero: subject badge, difficulty badge, read time, title, updated note, "ALE tests you" banner
   → WikiArticle body (server-side MDX compilation):
       ├── Plain prose paragraphs with auto-linked headings
       ├── Callout blocks (Note, Tip, Warn, ExamTip, LawCallout, etc.)
       ├── Tables (GFM), code blocks (syntax highlighted)
       ├── FormulaBlock (mathematical formulas)
       ├── KeyValues, ComparisonTable, ProcessFlow
       ├── InlineQuiz (quick MCQ, local state only)
       ├── ElaborativeInterrogation (think-about-it, DB-persisted)
       ├── RevealBlock (drag-to-reveal active recall)
       ├── Accordion/Tabs (content organization)
       ├── WikiReference (hover-preview links to other articles)
       └── Dynamic widgets: DoorConfigurator, CorridorVisualizer, Lab3DWidget, etc.
   → TeachBackPrompt (after article body, if criteria exist)
   → Prev/Next footer (STUB — static placeholder text, not wired)

5. INTERACTIVE ENGAGEMENT
   → InlineQuiz: select answer → immediate feedback (local only)
   → EIPrompt: answer → saved to DB → "You answered this on [date]"
   → RevealBlock: drag slider to reveal → keyboard accessible
   → TeachBackPrompt: write 20+ words → AI evaluates → shows gaps → revision
   → Text selection: highlight text → Copy / Add to Notes
   → WikiQuizModal: multi-question quiz with 2s feedback gate → score

6. RIGHT SIDEBAR ACTIONS
   → "Review this Topic" → WikiQuizModal (lazy portal)
   → "Study in Notes" → bookmark + toast
   → Related Topics → navigate to sibling articles
   → Feedback → thumbs up/down (LOCAL ONLY — not persisted)
   → Share → copy URL to clipboard
   → Sources → citation popover
   → Table of Contents → scroll-to anchor links (scroll-aware active state)

7. CONNECTION TO QUIZ ENGINE
   → "Practice this Topic" CTA → /quiz/subject/setup or /quiz/camp/setup
   → WikiQuizModal → inline quiz session (DB-persisted)
   → Wrong-answer redirect: quiz → /dashboard/wiki/[slug]?from=wrong-answer&topic=X
```

---

## 10. Key Components (Detailed)

| Component | File | Purpose |
|-----------|------|---------|
| `WikiLayoutContent` | `components/wiki/WikiLayoutContent.tsx` | 3-pane shell, server data fetching, context providers |
| `WikiSidebar` | `components/wiki/WikiSidebar.tsx` | Taxonomy tree navigation (client) |
| `WikiSidebarLoader` | `components/wiki/WikiSidebarLoader.tsx` | Server data fetch for sidebar |
| `WikiContentShell` | `components/wiki/WikiContentShell.tsx` | Transition skeleton handler (client) |
| `WikiHeader` | `components/wiki/WikiHeader.tsx` | Breadcrumbs fetch (server) |
| `WikiHeaderClient` | `components/wiki/WikiHeaderClient.tsx` | Header UI (client) |
| `WikiArticleHero` | `components/wiki/WikiArticleHero.tsx` | Article metadata display |
| `WikiArticle` | `components/wiki/WikiArticle.tsx` | MDX rendering pipeline (server) |
| `WikiRightSidebar` | `components/wiki/WikiRightSidebar.tsx` | Right sidebar actions |
| `WikiQuizButton` | `components/wiki/WikiQuizButton.tsx` | Quiz trigger button |
| `WikiQuizModal` | `components/wiki/WikiQuizModal.tsx` | Article quiz overlay (lazy portal) |
| `TeachBackPrompt` | `components/wiki/TeachBackPrompt.tsx` | AI-evaluated teach-back exercise |
| `ElaborativeInterrogation` | `components/wiki/ElaborativeInterrogation.tsx` | Think-about-it blocks (DB-persisted) |
| `InlineQuiz` | `components/wiki/InlineQuiz.tsx` | Embedded MCQ (local state) |
| `RevealBlock` | `components/wiki/RevealBlock.tsx` | Drag-to-reveal active recall |
| `WikiReadTracker` | `components/wiki/WikiReadTracker.tsx` | Silent read analytics |
| `WikiTextSelection` | `components/wiki/WikiTextSelection.tsx` | Selection popover (highlight/copy/notes) |
| `WikiReadingProgress` | `components/wiki/WikiReadingProgress.tsx` | Scroll progress bar |
| `WikiTableOfContents` | `components/wiki/WikiTableOfContents.tsx` | Anchor-linked TOC |
| `TaxonomyTree` | `components/shared/taxonomy-tree.tsx` | Shared tree component (also used by testing setup) |

**Verified Component Count:** 78 wiki components in `src/components/wiki/`

---

## 11. Supabase Tables

| Table | Used For |
|-------|---------|
| `wiki_articles` | Article content, slug, metadata |
| `taxonomy_tree` | Topic hierarchy, breadcrumbs, siblings |
| `ei_prompts` | Elaborative interrogation questions (linked by article_id) |
| `ei_responses` | User's EI answers (linked by user + prompt) |
| `wiki_article_sources` | Article citations |
| `wiki_reads` / `wiki_article_reads` | Read tracking (progress, time spent) |
| `user_global_stats` | User discipline for taxonomy scoping |

---

## 12. Server Actions

| Action | File | Purpose |
|--------|------|---------|
| `getCachedArticleAndNode` | `lib/actions/wiki.ts` | Cached article + node fetch |
| `getEIPromptsForArticle` | `lib/actions/wiki.ts` | EI prompts for article |
| `getUserEIResponsesForArticle` | `lib/actions/wiki.ts` | User's EI answers |
| `submitEIResponse` | `lib/actions/wiki.ts` | Persist EI answer |
| `getArticleSources` | `lib/actions/wiki.ts` | Article citations |
| `getTeachBackCriteria` | `lib/actions/wiki.ts` | Check if teach-back available |
| `submitTeachBack` | `lib/actions/wiki.ts` | Submit teach-back for AI evaluation |
| `recordArticleRead` | `lib/actions/wiki.ts` | Record article read on mount |
| `updateReadProgress` | `lib/actions/wiki.ts` | Update read progress (scroll %, time) |
| `addWikiBookmark` | `lib/actions/wiki.ts` | Bookmark article to notes |
| `getWikiQuizQuestions` | `lib/actions/wiki.ts` | Fetch quiz questions for article |
| `submitWikiQuizAnswer` | `lib/actions/wiki.ts` | Submit quiz answer |
| `endWikiQuizSession` | `lib/actions/wiki.ts` | Complete wiki quiz session |
| `searchWiki` | `lib/actions/wiki.ts` | Full-text search (ilike fallback) |
| `searchWikiPaginated` | `lib/actions/wiki.ts` | Paginated search RPC |
| `getTaxonomyTree` | `lib/actions/wiki.ts` | Syllabus taxonomy tree |
| `getLawsTaxonomyTree` | `lib/actions/wiki.ts` | Laws taxonomy tree |
| `getBreadcrumbTrail` | `lib/actions/wiki.ts` | Breadcrumb path |
| `trackEvent` | `lib/actions/analytics.ts` | EI prompt analytics |

**Verified Actions:** 19 wiki-related server actions across 5 files in `src/lib/actions/`

---

## 13. Happy Paths (Expanded)

| # | Path | Flow | Expected Outcome |
|---|------|------|-----------------|
| 1 | Browse and read article | Wiki landing → expand tree → click article → scroll through | Read tracking recorded, progress bar fills, time tracked |
| 2 | Answer EI prompt | Read article → encounter EI block → select answer | Answer saved to DB, "You answered this on [date]" badge on revisit |
| 3 | Take article quiz | Read article → "Review this Topic" → WikiQuizModal → answer 5q | Score + passing/building/needs-review label |
| 4 | Teach-back exercise | Read article → TeachBackPrompt → write 20+ word explanation → submit | AI evaluates: correct_points, gaps, factual_errors, revision_prompt |
| 5 | Quick recall via RevealBlock | Read article → encounter RevealBlock → drag slider to reveal | Active recall reinforcement, no persistence |
| 6 | Navigate from wrong answer | Get question wrong in quiz → click "Study" → wiki article with WrongAnswerBanner | Targeted remediation reading |
| 7 | Add to notes | Read article → select text → "Add to Notes" | Note drawer opens with pre-filled selected text |
| 8 | Bookmark article | Read article → "Study in Notes" button | `addWikiBookmark(articleId)` + toast confirmation |
| 9 | Browse related topics | Read article → Related Topics in right sidebar → click sibling | Navigate to related article |
| 10 | Mobile reading | Open wiki on phone → hamburger → Sheet drawer sidebar → select topic | Full article reading with mobile-adapted layout |

---

## 14. Edge Cases (Expanded)

| Case | Behavior |
|------|----------|
| No discipline set | Empty sidebar with "Go to Settings" prompt |
| Topic exists but no article | Taxonomy-only fallback: WikiItemRenderer + "Practice this Topic" CTA |
| MDX compilation error | Graceful fallback to plain text rendering |
| No EI prompts for article | EI blocks simply don't render |
| No teach-back criteria | TeachBackPrompt doesn't render |
| No quiz questions for node | WikiQuizModal shows `empty` state |
| WikiHighlighter with no search terms | Renders children unchanged (no-op) |
| Text selection < 3 chars | Selection popover doesn't appear |
| Teach-back < 20 words | Validation prevents submission |
| Quiz feedback 2s gate | "Next" button disabled for 2 seconds (forces reading rationale) |

---

## 15. Issues Found (Consolidated)

| # | Issue | Severity | Details |
|---|-------|----------|---------|
| 1 | **No wiki search UI** | High | `searchWiki()` + `searchWikiPaginated()` + `wikiSearchSchema` exist but have NO connected search interface in the wiki route. Only sidebar taxonomy filter exists. |
| 2 | **Prev/Next footer is a stub** | Medium | Renders static placeholder text ("← Previous topic" / "Next topic →") — not wired to actual sibling navigation. Needs sibling query on `taxonomy_tree` ordered by `sort_order`. |
| 3 | **Highlight action is a stub** | Low | `WikiTextSelection` highlight button has no DB persistence — no table/action exists for highlights. |
| 4 | **Feedback not persisted** | Medium | Thumbs up/down in right sidebar is local state only — no server action, no DB table. User feedback is lost on page reload. |
| 5 | **`wiki/Tabs.tsx` uses deprecated tokens** | Low | Uses `camp-cobalt` and `#E0DED8` hardcoded instead of design tokens. `WikiTabs.tsx` is the corrected version. (See cleanup plan Part B3) |
| 6 | **`WikiHighlighter` trigger disconnected** | Low | Component exists but no in-route mechanism passes search terms to it. Only useful if full-text search UI is added. |
| 7 | **76 wiki components in flat directory** | Medium | `src/components/wiki/` has 76 files with no subdirectory organization. Candidate for restructuring into `wiki/article/`, `wiki/blocks/`, `wiki/widgets/`, `wiki/navigation/`. |

**Testing-Specific Issues:**
| # | Issue | Severity | Details |
|---|-------|----------|---------|
| 8 | **Dual routing** | High | Legacy `/dashboard/testing/*/setup` + new `/quiz/[mode]/setup` both exist. `ModeCard.href` points to `/quiz/` but `ROUTES.TESTING_SETUP` still points to dashboard |
| 9 | **Dual debrief** | Medium | `DebriefLayout` (legacy) vs `ResultsDashboard` (v2) — both active |
| 10 | **`SessionShell` is dead** | Low | (see dead code audit) but `QuizShell` is alive |
| 11 | **Endurance mode routes outside quiz engine** | Low | Routes to `/dashboard/area-c/design-quiz` |

---

## 16. Recommendations

### Wiki Recommendations
1. **Add wiki search UI**: Wire `searchWiki()` to a search component in the wiki route. Options: integrate with existing Omnibar (Cmd+K), or add inline search in sidebar above taxonomy tree.
2. **Wire prev/next footer**: Query sibling nodes from `taxonomy_tree` ordered by `sort_order` and populate the footer links.
3. **Persist feedback**: Add `wiki_article_feedback` table + `submitArticleFeedback` server action for thumbs up/down.
4. **Implement highlight persistence**: Add `wiki_highlights` table + server action for text highlighting.
5. **Delete `wiki/Tabs.tsx`**: Point consumers to `wiki/WikiTabs.tsx` (corrected tokens). Plan migration to shadcn `ui/tabs.tsx`.
6. **Organize wiki components**: Split 76 flat files into subdirectories:
   - `wiki/article/` — ArticleHero, Article, ArticleRenderer
   - `wiki/blocks/` — InlineQuiz, EI, RevealBlock, FormulaBlock, callouts
   - `wiki/widgets/` — already exists (registry + BP-344 + DSGN-013)
   - `wiki/navigation/` — Sidebar, Header, Breadcrumbs, TOC, ReadingProgress
   - `wiki/quiz/` — QuizButton, QuizModal
   - `wiki/shared/` — TextSelection, ReadTracker, Highlighter, NoteAnchor

### Testing Recommendations
1. **Consolidate routing**: Deprecate `/dashboard/testing/*/setup` routes, point all ModeCards to `/quiz/[mode]/setup`
2. **Single debrief system**: Deprecate `DebriefLayout`, migrate to `ResultsDashboard`
3. **Remove dead code**: Delete `SessionShell` and 14 dead testing components

---

## 17. Cross-Route Connections (Comprehensive)

```
Testing → Wiki:
  Wrong-answer redirect sends user to /dashboard/wiki/[slug]?from=wrong-answer&topic=X
  "Practice this Topic" CTA in taxonomy-only fallback → /quiz/subject/setup

Wiki → Testing:
  "Practice this Topic" CTA → /quiz/subject/setup or /quiz/camp/setup
  WikiQuizModal → inline quiz session (separate from main quiz engine)

Shared infrastructure:
  taxonomy_tree table (both routes)
  TaxonomyTree component (wiki sidebar + testing setup pickers)
  user_node_mastery table (testing writes, wiki reads for teach-back)
  questions table (testing sessions + wiki quiz modal)
  ei_prompts / ei_responses (wiki EI blocks)
```

---

## 18. Codebase Verification (2026-04-04)

| Metric | Value | Verified |
|--------|-------|----------|
| Wiki route files | 5 | ✅ |
| Wiki components | 78 | ✅ |
| Wiki server actions | 19 (across 5 files) | ✅ |
| Quiz mode definitions | 8 | ✅ |
| Quiz-v2 components | 59 | ✅ |
| Quiz-v2 server actions | 19 | ✅ |
| useQuizStore lines | 1005 | ✅ |
| Testing modes config | 170 lines | ✅ |

**Files verified:**
- `src/app/dashboard/wiki/` — 5 route files
- `src/components/wiki/` — 78 components
- `src/lib/actions/wiki.ts`, `wiki-actions.ts`, `wiki-quiz.ts`, `wiki-reads.ts`, `wiki-bookmarks.ts` — 19 actions
- `src/lib/constants/testing-modes.ts` — 8 modes defined
- `src/stores/useQuizStore.ts` — 1005 lines

---

# PART 3: Enhanced Wiki Audit (2026-04-04 Update)

## 1. Complete Widget Registry Details

**Registry File:** `src/components/wiki/widgets/registry.ts` (116 lines)

The widget registry uses lazy-loading to only load widgets that are actually referenced in MDX content. This keeps server-side rendering efficient even with 500+ potential widgets.

### BP-344: Accessibility Standards (6 widgets)

| Widget | File | Lazy Import Path | Purpose |
|--------|------|------------------|---------|
| `AccessibilityChangesTable` | `widgets/bp344/ComparisonTable.tsx` | `./bp344/ComparisonTable` | 2024 vs 2013 IRR comparison |
| `DoorConfigurator` | `widgets/bp344/DoorConfigurator.tsx` | `./bp344/DoorConfigurator` | Door compliance configurator |
| `CorridorVisualizer` | `widgets/bp344/CorridorVisualizer.tsx` | `./bp344/CorridorVisualizer` | Corridor width visualization |
| `CubicleChecker` | `widgets/bp344/CubicleChecker.tsx` | `./bp344/CubicleChecker` | Toilet cubicle compliance checker |
| `GrabBarExplainer` | `widgets/bp344/GrabBarExplainer.tsx` | `./bp344/GrabBarExplainer` | Grab bar reference points |
| `RecallDrill` | `widgets/bp344/RecallDrill.tsx` | `./bp344/RecallDrill` | Flashcard retrieval practice |

### DSGN-013: Furniture & Equipment Clearances (10 widgets)

| Widget | File | Lazy Import Path | Purpose |
|--------|------|------------------|---------|
| `BedroomPlanView` | `widgets/dsgn013/BedroomPlanView.tsx` | `./dsgn013/BedroomPlanView` | SVG bedroom plan with clearance zones |
| `BedSizeComparator` | `widgets/dsgn013/BedSizeComparator.tsx` | `./dsgn013/BedSizeComparator` | Bed size comparison with room planning |
| `WorkstationCalculator` | `widgets/dsgn013/WorkstationCalculator.tsx` | `./dsgn013/WorkstationCalculator` | Office floor area calculator |
| `DimensionDrill` | `widgets/dsgn013/DimensionDrill.tsx` | `./dsgn013/DimensionDrill` | Flashcard drill for dimensions |
| `BodyDimensionExplorer` | `widgets/dsgn013/BodyDimensionExplorer.tsx` | `./dsgn013/BodyDimensionExplorer` | Anthropometric data explorer |
| `ReachEnvelopeDiagram` | `widgets/dsgn013/ReachEnvelopeDiagram.tsx` | `./dsgn013/ReachEnvelopeDiagram` | Reach envelope zones |
| `BodyDimensionDrill` | `widgets/dsgn013/BodyDimensionDrill.tsx` | `./dsgn013/BodyDimensionDrill` | Anthropometric flashcards |
| `DHRatioExplorer` | `widgets/dsgn013/DHRatioExplorer.tsx` | `./dsgn013/DHRatioExplorer` | Depth-to-height ratio explorer |
| `ProportionComparator` | `widgets/dsgn013/ProportionComparator.tsx` | `./dsgn013/ProportionComparator` | Room proportion comparison |
| `SpatialQualityDrill` | `widgets/dsgn013/SpatialQualityDrill.tsx` | `./dsgn013/SpatialQualityDrill` | Spatial quality flashcards |

### 3D and 2D Integration

| Widget | Source | Purpose |
|--------|--------|---------|
| `Lab3DWidget` | `widgets/Lab3DWidget.tsx` | R3F 3D spatial model |
| `PHBuildingSetbacks` | `interactive-illustrations/2D/SetbackIllustration` | Property line setback illustration |

### Widget Detection Mechanism

```typescript
// detectWidgets() scans MDX content for <WidgetName patterns
export const detectWidgets = (content: string): string[] =>
  Object.keys(widgetRegistry).filter((name) => content.includes(`<${name}`))

// resolveWidgets() lazy-loads only the detected widgets
export const resolveWidgets = async (content: string) => {
  const needed = detectWidgets(content)
  if (needed.length === 0) return {}
  const entries = await Promise.all(
    needed.map(async (name) => {
      const component = await widgetRegistry[name]()
      return [name, component] as const
    }),
  )
  return Object.fromEntries(entries)
}
```

---

## 2. Complete Component Inventory (78 Files)

### Layout & Shell Components (5)

| Component | File | Purpose |
|-----------|------|---------|
| `WikiLayoutContent` | `WikiLayoutContent.tsx` | 3-pane shell, server data fetching, context providers |
| `WikiContentShell` | `WikiContentShell.tsx` | Transition skeleton handler, scroll context |
| `WikiSidebarLoader` | `WikiSidebarLoader.tsx` | Server-side taxonomy tree fetch |
| `WikiSidebar` | `WikiSidebar.tsx` | Taxonomy tree navigation (client) |
| `WikiSidebarShell` | `WikiSidebarShell.tsx` | Sidebar container wrapper |

### Header Components (4)

| Component | File | Purpose |
|-----------|------|---------|
| `WikiHeader` | `WikiHeader.tsx` | Server breadcrumbs fetch |
| `WikiHeaderClient` | `WikiHeaderClient.tsx` | Mobile nav, share, bookmarks triggers |
| `WikiArticleHero` | `WikiArticleHero.tsx` | Article metadata: subject, difficulty, read time |
| `WikiArticleHeader` | `WikiArticleHeader.tsx` | Article title, publication info |

### Article & Content (6)

| Component | File | Purpose |
|-----------|------|---------|
| `WikiArticle` | `WikiArticle.tsx` | MDX rendering pipeline (server) |
| `WikiItemRenderer` | `WikiItemRenderer.tsx` | Taxonomy-only fallback renderer |
| `WikiPre` | `WikiPre.tsx` | Code block wrapper |
| `Mermaid` | `Mermaid.tsx` | Mermaid diagram rendering |
| `WrongAnswerBanner` | `WrongAnswerBanner.tsx` | Quiz wrong-answer redirect banner |
| `AuthorityContent` | `AuthorityContent.tsx` | Authority reference block |

### Right Sidebar Components (6)

| Component | File | Purpose |
|-----------|------|---------|
| `WikiRightSidebar` | `WikiRightSidebar.tsx` | Right sidebar orchestrator |
| `WikiQuizButton` | `WikiQuizButton.tsx` | "Review this Topic" trigger |
| `WikiBookmarks` | `WikiBookmarks.tsx` | Bookmark list display |
| `WikiRelatedPopover` | `WikiRelatedPopover.tsx` | Related topics popover |
| `WikiSourcesPopover` | `WikiSourcesPopover.tsx` | Citation popover |
| `WikiTableOfContents` | `WikiTableOfContents.tsx` | h2/h3 anchor TOC |

### Interactive Learning Blocks (8)

| Component | File | Persistence | Purpose |
|-----------|------|-------------|---------|
| `InlineQuiz` | `InlineQuiz.tsx` | Local only | Quick self-check MCQ |
| `ElaborativeInterrogation` | `ElaborativeInterrogation.tsx` | DB (`ei_responses`) | "Think About It" prompts |
| `RevealBlock` | `RevealBlock.tsx` | None | Drag-to-reveal active recall |
| `TeachBackPrompt` | `TeachBackPrompt.tsx` | DB | AI-evaluated explanation |
| `WikiQuizModal` | `WikiQuizModal.tsx` | DB | Multi-question article quiz |
| `FormulaBlock` | `FormulaBlock.tsx` | N/A | LaTeX math rendering |
| `PrequestionGate` | `PrequestionGate.tsx` | None | Prerequisite knowledge gate |
| `GenericBlock` | `GenericBlock.tsx` | N/A | Generic content block |

### Callout Components (8)

| Component | File | Purpose |
|-----------|------|---------|
| `Callout` | `Callout.tsx` | Generic callout |
| `WikiCallout` | `WikiCallout.tsx` | Wiki-specific callout |
| `WikiCalloutBox` | `WikiCalloutBox.tsx` | Callout container |
| `LawCallout` | `LawCallout.tsx` | Legal citation callout |
| `ExamTip` | `ExamTip.tsx` | Exam strategy tip |
| `AlertBox` | `AlertBox.tsx` | Alert notice box |
| `Tabs` | `Tabs.tsx` | Base tab component (deprecated tokens) |
| `WikiTabs` | `WikiTabs.tsx` | Wiki tab wrapper (corrected) |

### Content Organization (6)

| Component | File | Purpose |
|-----------|------|---------|
| `WikiAccordion` | `WikiAccordion.tsx` | Accordion wrapper |
| `Accordion` | `Accordion.tsx` | Base accordion |
| `KeyValues` | `KeyValues.tsx` | Key-value pair display |
| `ComparisonTable` | `ComparisonTable.tsx` | Side-by-side comparison |
| `ProcessFlow` | `ProcessFlow.tsx` | Process flow diagram |
| `SubjectSnapshot` | `SubjectSnapshot.tsx` | Subject summary |

### Exam Content Components (4)

| Component | File | Purpose |
|-----------|------|---------|
| `WikiExamTable` | `WikiExamTable.tsx` | Styled exam reference table |
| `WikiPartHeader` | `WikiPartHeader.tsx` | Section divider with part number |
| `WikiMistakeCard` | `WikiMistakeCard.tsx` | Common mistake pattern |
| `WikiMistakeList` | `WikiMistakeList.tsx` | List of common mistakes |

### Navigation & Tracking (6)

| Component | File | Purpose |
|-----------|------|---------|
| `WikiNavigationContext` | `WikiNavigationContext.tsx` | Navigation state provider |
| `WikiDisciplineContext` | `WikiDisciplineContext.tsx` | Discipline metadata provider |
| `WikiReadTracker` | `WikiReadTracker.tsx` | Silent read analytics |
| `WikiReadingProgress` | `WikiReadingProgress.tsx` | Scroll progress bar |
| `WikiTableOfContents` | `WikiTableOfContents.tsx` | TOC with scroll awareness |
| `WikiChangedPill` | `WikiChangedPill.tsx` | "Recently changed" badge |

### Text Selection & Annotations (3)

| Component | File | Purpose |
|-----------|------|---------|
| `WikiTextSelection` | `WikiTextSelection.tsx` | Text selection popover |
| `WikiHighlighter` | `WikiHighlighter.tsx` | Search term highlighting |
| `WikiNoteAnchor` | `WikiNoteAnchor.tsx` | Note anchor point |

### Reference Components (2)

| Component | File | Purpose |
|-----------|------|---------|
| `WikiReference` | `WikiReference.tsx` | Wiki-to-wiki reference |
| `WikiSourcesPopover` | `WikiSourcesPopover.tsx` | Citation popover |

### Skeleton Components (1)

| Component | File | Purpose |
|-----------|------|---------|
| `WikiSidebarSkeleton` | `WikiSidebarSkeleton.tsx` | Sidebar loading skeleton |

### Widgets (BP-344: 6)

| Component | File |
|-----------|------|
| `AccessibilityChangesTable` | `widgets/bp344/ComparisonTable.tsx` |
| `DoorConfigurator` | `widgets/bp344/DoorConfigurator.tsx` |
| `CorridorVisualizer` | `widgets/bp344/CorridorVisualizer.tsx` |
| `CubicleChecker` | `widgets/bp344/CubicleChecker.tsx` |
| `GrabBarExplainer` | `widgets/bp344/GrabBarExplainer.tsx` |
| `RecallDrill` | `widgets/bp344/RecallDrill.tsx` |

### Widgets (DSGN-013: 10)

| Component | File |
|-----------|------|
| `BedroomPlanView` | `widgets/dsgn013/BedroomPlanView.tsx` |
| `BedSizeComparator` | `widgets/dsgn013/BedSizeComparator.tsx` |
| `WorkstationCalculator` | `widgets/dsgn013/WorkstationCalculator.tsx` |
| `DimensionDrill` | `widgets/dsgn013/DimensionDrill.tsx` |
| `BodyDimensionExplorer` | `widgets/dsgn013/BodyDimensionExplorer.tsx` |
| `ReachEnvelopeDiagram` | `widgets/dsgn013/ReachEnvelopeDiagram.tsx` |
| `BodyDimensionDrill` | `widgets/dsgn013/BodyDimensionDrill.tsx` |
| `DHRatioExplorer` | `widgets/dsgn013/DHRatioExplorer.tsx` |
| `ProportionComparator` | `widgets/dsgn013/ProportionComparator.tsx` |
| `SpatialQualityDrill` | `widgets/dsgn013/SpatialQualityDrill.tsx` |

### 3D Integration

| Component | File | Purpose |
|-----------|------|---------|
| `Lab3DWidget` | `widgets/Lab3DWidget.tsx` | React Three Fiber 3D scene |

---

## 3. Complete Server Actions Inventory

### wiki.ts (Core Wiki Actions)

| Action | Purpose |
|--------|---------|
| `getWikiTaxonomyTree(disciplineId)` | Fetch taxonomy tree for sidebar |
| `getWikiArticlesByNode(nodeId)` | Fetch articles for a taxonomy node |
| `getWikiArticleBySlug(slug)` | Fetch single article by slug |
| `getCachedArticleAndNode(slug)` | Cached article + node fetch |
| `getEIPromptsForArticle(article_id)` | EI prompts for article |
| `getUserEIResponsesForArticle(article_id)` | User's EI answers |
| `submitEIResponse(promptId, response)` | Persist EI answer |
| `getArticleSources(article_id)` | Article citations |
| `getTeachBackCriteria(node_id)` | Check if teach-back available |
| `submitTeachBack(text, nodeId)` | Submit teach-back for AI evaluation |
| `recordArticleRead(articleId)` | Record article read on mount |
| `updateReadProgress(articleId, progress)` | Update read progress |
| `searchWiki(query)` | Full-text search (ilike fallback) |
| `searchWikiPaginated(query, page, limit)` | Paginated search |

### wiki-actions.ts (Wiki Interaction)

| Action | Purpose |
|--------|---------|
| `trackWikiRead(articleId)` | Track article read event |
| `updateLastReadPosition(articleId, position)` | Update reading position |

### wiki-quiz.ts (Wiki Quiz)

| Action | Purpose |
|--------|---------|
| `getWikiQuizQuestions(nodeId, limit)` | Fetch quiz questions for article |
| `submitWikiQuizAnswer(sessionId, questionId, answer)` | Submit quiz answer |
| `endWikiQuizSession(sessionId)` | Complete wiki quiz session |

### wiki-reads.ts (Read Tracking)

| Action | Purpose |
|--------|---------|
| `getWikiReadHistory(userId, limit)` | User's read history |
| `markArticleAsRead(articleId)` | Mark article as read |

### wiki-bookmarks.ts (Bookmarks)

| Action | Purpose |
|--------|---------|
| `addWikiBookmark(articleId)` | Add article to bookmarks |
| `removeWikiBookmark(articleId)` | Remove bookmark |
| `getUserBookmarks()` | Get all user bookmarks |

---

## 4. Complete Supabase Tables

### Core Wiki Tables

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `wiki_articles` | Article content | id, slug, title, content, node_id, discipline_id, published_at, updated_at |
| `wiki_article_taxonomy` | Article-node mapping | article_id, node_id |
| `taxonomy_tree` | Topic hierarchy | id, ale_id, name, parent_id, level, discipline_id, sort_order |
| `wiki_article_sources` | Citations | id, article_id, source_text, source_url, order |
| `ei_prompts` | Elaborative interrogation | id, article_id, question, heading_match, options (JSON) |
| `ei_responses` | User EI answers | id, user_id, prompt_id, response, answered_at |

### Read Tracking Tables

| Table | Purpose |
|-------|---------|
| `wiki_reads` | User read records |
| `wiki_article_reads` | Per-article read progress |

### Bookmark Tables

| Table | Purpose |
|-------|---------|
| `wiki_bookmarks` | User article bookmarks |

---

## 5. MDX Processing Pipeline Details

### Step-by-Step Pipeline

```
1. stripLegacyEITags(content)
   └─ Removes old [EI]...[/EI] markdown tags

2. Strip HTML comments
   └─ Removes <!-- comments --> from content

3. convertExpressionPropsToStrings(content)
   └─ Bracket-counting parser for JSX prop conversion
   └─ prop={[...]} → prop="[...]"

4. injectEIPrompts(content, prompts)
   └─ Inserts <EIPrompt idx={N} /> after matching headings
   └─ Matches based on heading_match pattern

5. resolveWidgets(content)
   └─ Scans for <WidgetName patterns
   └─ Lazy imports only referenced widgets

6. compileMDX(content)
   └─ Uses next-mdx-remote/rsc
   └─ Applies remarkGfm for GitHub Flavored Markdown

7. Fallback: plain text
   └─ Graceful fallback on compile error
   └─ Handles edge cases like <1st> tags
```

### MDX Component Components Mapping

```typescript
// mdx-components-shared.ts provides the mapping
{
  // Prose
  h2: HeadingWithAnchor,
  h3: HeadingWithAnchor,
  table: WikiTable,
  pre: WikiPre,
  code: CodeBlock,

  // Callouts
  Note: CalloutComponent,
  Warn: CalloutComponent,
  Tip: CalloutComponent,
  Example: CalloutComponent,
  LawCallout: LawCalloutComponent,
  ExamTip: ExamTipComponent,

  // Learning blocks
  InlineQuiz: InlineQuizComponent,
  EIPrompt: ElaborativeInterrogationComponent,
  RevealBlock: RevealBlockComponent,
  TeachBackPrompt: TeachBackPromptComponent,

  // Widgets (dynamically resolved)
  ...resolvedWidgets,
}
```

---

## 6. Query Parameters Deep Dive

### Supported Query Parameters

| Param | Example | Purpose |
|-------|---------|---------|
| `minimal` | `?minimal=true` | Strips header, right sidebar, prev/next footer. For embedded/print views |
| `from` | `?from=wrong-answer` | Trigger WrongAnswerBanner at top of article |
| `topic` | `?topic=X` | Combined with from=wrong-answer for targeted remediation |

### Parameter Handling Code

```typescript
// In [slug]/page.tsx
const { searchParams } = props
const minimal = searchParams.get('minimal') === 'true'
const fromWrongAnswer = searchParams.get('from') === 'wrong-answer'
const topic = searchParams.get('topic')

// Pass to components
<WikiHeader minimal={minimal} />
{fromWrongAnswer && <WrongAnswerBanner topic={topic} />}
```

---

## 7. Context Providers Deep Dive

### WikiDisciplineContext

```typescript
interface WikiDisciplineContextValue {
  disciplineId: string
  disciplineName: string
  tree: TaxonomyNode[]  // Full taxonomy tree
}
```

**Data Source:** `user_global_stats.discipline_id` → lookup in `disciplines` table

**Fallback:** If user has no disciplineId → Empty sidebar with "Go to Settings" prompt

### WikiNavigationContext

```typescript
interface WikiNavigationContextValue {
  currentSlug: string
  isPending: boolean
  navigate: (href: string) => void
}
```

**Implementation:** Uses `useRouter` with `startTransition` for soft navigation

---

## 8. Mobile Responsive Breakpoints

| Breakpoint | Width | Left Sidebar | Right Sidebar |
|-------------|-------|--------------|---------------|
| `default` | ≥1024px | Fixed 280px | Fixed 240px |
| `lg` | 768-1023px | Sheet drawer | Sheet drawer |
| `md` | 640-767px | Sheet drawer | Hidden |
| `sm` | <640px | Sheet drawer | Hidden |

### Mobile Navigation Code

```typescript
// Left sidebar: below md
<Sheet>
  <WikiSidebar />
</Sheet>

// Right sidebar: below lg
<Sheet>
  <WikiRightSidebar />
</Sheet>
```

---

## 9. Performance Considerations

### Server-Side Rendering

- **Article page:** Async Server Component — streams in via Suspense
- **Sidebar:** Separate Suspense boundary via `WikiSidebarLoader`
- **MDX:** Compiled on server, cached with `unstable_cache` (hourly revalidation)

### Client-Side Performance

- **Widget lazy loading:** Only loaded when detected in content
- **Navigation:** `startTransition` for soft page transitions
- **Auto-save:** Not applicable (wiki is read-only, no user input)
- **Read tracking:** Debounced updates on scroll/visibility change

### Bundle Size Optimization

- **MDX components:** Lazy loaded via dynamic import
- **Widgets:** Lazy loaded via registry
- **Code splitting:** Automatic via Next.js App Router

---

## 10. Analytics & Events

### Tracked Events

| Event | Trigger | Data |
|-------|---------|------|
| `ei_prompt_answered` | User submits EI response | prompt_id, response |
| `wiki_article_read` | Article mounted | article_id, slug |
| `wiki_read_progress` | Scroll > 50% | article_id, read_pct |
| `wiki_quiz_started` | WikiQuizModal opened | node_id |
| `wiki_quiz_completed` | Quiz finished | node_id, score, total |

---

## 11. Deprecated & Known Issues

### Deprecated Components

| Component | Status | Replacement |
|-----------|--------|-------------|
| `wiki/Tabs.tsx` | Deprecated tokens | Use `wiki/WikiTabs.tsx` |

### Known Issues

1. **No wiki search UI** — Search functions exist but no connected UI
2. **Prev/Next footer stub** — Static text, not wired to sibling navigation
3. **Highlight not persisted** — No DB table for highlights
4. **Feedback not persisted** — Thumbs up/down is local state only
5. **WikiHighlighter disconnected** — No mechanism passes search terms to it

---

*End of enhanced audit — added 2026-04-04*

