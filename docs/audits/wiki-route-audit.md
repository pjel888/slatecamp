# /dashboard/wiki — Complete Route Audit

> **Last updated:** 2026-04-02
> **Status:** Comprehensive audit — all UX paths, components, data flows, issues mapped.
> **Related:** `docs/plans/design-system-cleanup.md`, `docs/audits/testing-route-audit.md`

---

## 1. Route Tree

```
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
│  │    filter)    │        ├── WikiBookmarks        │  Share (copy)    │
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

## 10. Key Components

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

---

## 13. Happy Paths

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

## 14. Edge Cases

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

## 15. Issues Found

| # | Issue | Severity | Details |
|---|-------|----------|---------|
| 1 | **No wiki search UI** | High | `searchWiki()` + `searchWikiPaginated()` + `wikiSearchSchema` exist but have NO connected search interface in the wiki route. Only sidebar taxonomy filter exists. |
| 2 | **Prev/Next footer is a stub** | Medium | Renders static placeholder text ("← Previous topic" / "Next topic →") — not wired to actual sibling navigation. Needs sibling query on `taxonomy_tree` ordered by `sort_order`. |
| 3 | **Highlight action is a stub** | Low | `WikiTextSelection` highlight button has no DB persistence — no table/action exists for highlights. |
| 4 | **Feedback not persisted** | Medium | Thumbs up/down in right sidebar is local state only — no server action, no DB table. User feedback is lost on page reload. |
| 5 | **`wiki/Tabs.tsx` uses deprecated tokens** | Low | Uses `camp-cobalt` and `#E0DED8` hardcoded instead of design tokens. `WikiTabs.tsx` is the corrected version. (See cleanup plan Part B3) |
| 6 | **`WikiHighlighter` trigger disconnected** | Low | Component exists but no in-route mechanism passes search terms to it. Only useful if full-text search UI is added. |
| 7 | **76 wiki components in flat directory** | Medium | `src/components/wiki/` has 76 files with no subdirectory organization. Candidate for restructuring into `wiki/article/`, `wiki/blocks/`, `wiki/widgets/`, `wiki/navigation/`. |

---

## 16. Recommendations

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

---

## 17. Cross-Route Connections

```
Testing → Wiki:
  Wrong-answer redirect sends user to /dashboard/wiki/[slug]?from=wrong-answer&topic=X

Wiki → Testing:
  "Practice this Topic" CTA → /quiz/subject/setup or /quiz/camp/setup
  WikiQuizModal → inline quiz session (separate from main quiz engine)

Shared infrastructure:
  taxonomy_tree table (both routes)
  TaxonomyTree component (wiki sidebar + testing setup pickers)
  user_node_mastery table (testing writes, wiki reads for teach-back)
  questions table (testing sessions + wiki quiz modal)
```
