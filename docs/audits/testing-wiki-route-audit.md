# Route Audit: /dashboard/testing & /dashboard/wiki

> Companion to `docs/plans/design-system-cleanup.md`. These audits document every UX path, feature, and component for the two largest user-facing routes.

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

## How to Resume

```
@docs/plans/design-system-cleanup.md Execute the design system cleanup plan starting from Pass 0
@docs/audits/testing-wiki-route-audit.md Reference for route architecture
```
