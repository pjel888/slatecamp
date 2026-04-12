# Wiki Feature Specification

**Last Updated:** 2026-04-12
**Status:** Active — Codebase Source of Truth
**Version:** 3.0 (Post-Deep Audit Refinement)
**Audit Source:** `.ai/plans/2026-04-12_wiki-route-deep-audit.md`

> This document is the authoritative specification for SlateCamp's Wiki knowledge base feature.
> Every claim is derived from and verified against the live codebase as of 2026-04-12.

---

## 1. Product Intent & Principles

### Purpose
The SlateCamp Wiki is an MDX-powered knowledge base that serves as the authoritative content layer for the Architecture Licensure Exam (LEA). It provides 500+ articles organized by the LEA taxonomy, with interactive learning blocks, inline quizzes, elaborative interrogation prompts, and teach-back exercises embedded directly in the reading flow.

### Governing Principles
1.  **Taxonomy-first organization** — Every article maps to the LEA curriculum via the `taxonomy_tree` + `wiki_article_taxonomy` junction.
2.  **Server-first rendering** — Article content is compiled server-side via `next-mdx-remote/rsc`. The article page (`[slug]/page.tsx`) is an async Server Component.
3.  **On-demand widget loading** — Heavy interactive widgets are lazy-loaded based on string detection in article content.
4.  **Pedagogical integration** — Articles include elaborative interrogation (EI) prompts, reveal blocks, and teach-back prompts that connect to the SRS and mastery systems.
5.  **Growth-framed interactions** — Interactive surfaces (bookmarks, highlights, feedback) are designed to support long-term retention without generic gamification.

---

## 2. Route & File Architecture

### App Routes
| Path | Type | Responsibility |
|------|------|----------------|
| `/dashboard/wiki` | Client | Landing page with hero icon + feature grid. |
| `/dashboard/wiki/[slug]` | Server (Async) | Main article renderer. Fetches all article-node data. |
| `/dashboard/wiki/layout.tsx` | Server | Wraps `WikiLayoutContent` in Suspense. |
| `/dashboard/wiki/loading.tsx` | Client | Top-level loading skeleton. |

### Component Hierarchy
```
src/components/wiki/
├── article/
│   ├── WikiArticle.tsx           # Orchestrates MDX compilation + widget resolution
│   ├── WikiArticleHero.tsx       # Subject/Difficulty/Read-time banner
│   └── WikiItemRenderer.tsx      # Renders JSONB-driven wiki items
├── blocks/                       # 27+ MDX-injectable blocks (Callout, Reveal, etc.)
├── navigation/                   # Sidebar, Header, ToC, Breadcrumbs
├── quiz/                         # WikiQuizModal, WikiQuizButton
├── shared/                       # Highlighting, Selection, Read Tracking
└── widgets/                      # Lazy-loaded interactive tools (BP 344, DSGN-013)
```

---

## 3. MDX Rendering Pipeline

### The 7-Stage Pipeline
**Source:** `src/components/wiki/article/WikiArticle.tsx`

1.  **Raw content** → Fetched from `wiki_articles.content`.
2.  **Newline fix** → `content.replace(/\\n/g, '\n')`.
3.  **Legacy cleanup** → Strips `[EI]` blocks and HTML comments.
4.  **EI injection** → `injectEIPrompts()` inserts `<EIPrompt>` components after headings found in `wiki_ei_prompts`.
5.  **Sanitization** → `sanitizeMDX()` fixes backslash escaping in attributes and raw `<` characters.
6.  **Widget Resolution** → `resolveWidgets()` scans for registered tags (e.g., `<DoorConfigurator`) and performs dynamic `import()`.
7.  **MDX compile** → `compileMDX` from `next-mdx-remote/rsc` with `remark-gfm` and shared component map.

### Custom Component Map (WIKI_COMPONENTS)
The wiki supports 50+ custom tags. Key categories:
*   **HTML Overrides:** `h2` (auto-ID), `h3`, `table` (Flowbite-styled), `thead`, `th`, `td`, `pre` (`WikiPre`), `code`.
*   **Callouts:** `Note`, `Warn`, `Tip`, `Example`, `Callout`, `AlertBox`, `ExamTip`, `AuthorityContent`.
*   **Interactive:** `ElaborativeInterrogation`, `EIPrompt`, `InlineQuiz`, `RevealBlock`, `Mermaid`.
*   **Structure:** `KeyValues`, `FormulaBlock`, `WikiTabs`, `WikiAccordion`, `SubjectSnapshot`, `ProcessFlow`.
*   **Stubs:** `SPP206RefServices`, `SPP207RefServices` (No-op stubs for inlined tags).
*   **Safety:** `GenericBlock` (Prevents crashes from unrecognized tag names).

---

## 4. Widget System

### Registry & Detection
**Source:** `src/components/wiki/widgets/registry.ts`
The registry uses a string-based detection (`content.includes('<WidgetName')`) to avoid full AST parsing before component resolution.

### Registered Widgets (Verified Inventory)
| Domain | Widgets |
|--------|---------|
| **BP 344** | `AccessibilityChangesTable`, `DoorConfigurator`, `CorridorVisualizer`, `CubicleChecker`, `GrabBarExplainer`, `RecallDrill` |
| **DSGN-013** | `BedroomPlanView`, `BedSizeComparator`, `WorkstationCalculator`, `DimensionDrill`, `BodyDimensionExplorer`, `ReachEnvelopeDiagram`, `BodyDimensionDrill`, `DHRatioExplorer`, `ProportionComparator`, `SpatialQualityDrill` |
| **3D Lab** | `Lab3DWidget` |
| **Illustrations** | `PHBuildingSetbacks` |

---

## 5. Data Flow & Network Requests

### Server Action Matrix
| Action | Source File | Tables Touched | Write/Read |
|--------|-------------|----------------|------------|
| `resolveArticleAndNode` | `wiki-actions.ts` | `wiki_articles`, `taxonomy_tree` | Read (RPC) |
| `getTaxonomyTree` | `wiki-actions.ts` | `taxonomy_tree`, `wiki_article_taxonomy` | Read |
| `recordArticleRead` | `wiki-reads.ts` | `wiki_article_reads` | Write |
| `updateReadProgress` | `wiki-reads.ts` | `wiki_article_reads` | Write |
| `addWikiBookmark` | `wiki-bookmarks.ts` | `wiki_bookmarks` | Write (Upsert) |
| `addWikiHighlight` | `wiki-interactions.ts` | `wiki_highlights` | Write |
| `submitArticleFeedback`| `wiki-interactions.ts` | `wiki_article_feedback` | Write |
| `getWikiQuizQuestions` | `wiki-quiz.ts` | `questions`, `quiz_sessions` | Write/Read |

### Caching Strategy
*   **Global Data:** `disciplines` cached hourly via `unstable_cache`.
*   **Taxonomy:** Scoped by discipline, 2h TTL, tag-revalidated on `taxonomy` tag.
*   **Articles:** Per-slug cache via `unstable_cache` with `wiki` tag.
*   **Request-Level:** `memoizedResolveArticleAndNode` uses React `cache()` to prevent duplicate fetches within a single render pass.

---

## 6. Database & Schema Dependencies

### Critical Tables
*   **`wiki_articles`**: MDX content, status, LEA metadata, FTS vector.
*   **`taxonomy_tree`**: Structural hierarchy (Level 1-3).
*   **`wiki_article_taxonomy`**: Junction table with `is_primary` flag.
*   **`wiki_bookmarks`**: User-article associations.
*   **`wiki_article_reads`**: Tracking `read_pct` and `time_spent_ms`.
*   **`wiki_highlights`**: User text highlights (Confirmed present in types, missing from `DATABASE_SCHEMA.sql`). `NEEDS SYNC`.
*   **`wiki_ei_prompts`**: DB-driven inline questions.

### RPC Functions
*   `get_article_with_node(p_slug)`: Single-roundtrip resolution.
*   `search_wiki_articles_pure(query_text)`: FTS-based search with `ts_rank`.

---

## 7. Search Architecture

1.  **Global Wiki Search:** Uses `searchWikiArticles` action. Triggers RPC `search_wiki_articles_pure` with `ilike` fallback for resilience.
2.  **Sidebar Filtering:** Client-side filter in `TaxonomyTree.tsx` using `deferredQuery` for performance. Matches against node names, LEA IDs, and article titles.
3.  **URL Highlighting:** `WikiHighlighter.tsx` polls for content via `requestAnimationFrame` and highlights terms passed in `?highlight=` query param.

---

## 8. Quiz & Mastery Integration

### Article-to-Quiz Flow
*   **Selection:** Fetches 5 questions from the current topic (expanding non-leaf parents to children). Excludes questions correctly answered in the last 7 days.
*   **Session:** Creates a `quiz_sessions` record with `mode: 'article_review'`.
*   **Scoring:** Updates `user_node_mastery` with a **lighter alpha (0.15)** compared to standard sessions (0.30).
*   **UX:** 2-second rationale gate enforced before advancing. Uses `SlideToSubmit` interaction.

### EI & Teach-Back
*   **EI:** User responses stored in `wiki_ei_responses`. Supports MCQ and free-text.
*   **Teach-Back:** AI evaluation of free-text summaries. Appears at the bottom of articles based on `teachBackCriteria`.

---

## 9. Failure Handling & Resilience

| Layer | Strategy |
|-------|----------|
| **MDX Compile** | Catch-block renders raw content in amber `<pre>` box. |
| **Supabase Gateway** | `withRetry` helper handles 502/503/504 errors with exponential backoff. |
| **Missing Article** | `notFound()` triggered if slug resolution fails. |
| **Sidebar Load** | `WikiSidebarSkeleton` (pulse) shown during streaming. |
| **RPC Failure** | Automatic fallback to sequential sequential SQL queries in `resolveArticleAndNode`. |

---

## 10. Technical Debt & Constraints

### High Risk
*   **Duplication:** `src/lib/actions/wiki.ts` is a legacy duplicate of `wiki-actions.ts`.
*   **Schema Drift:** `wiki_highlights` missing from `DATABASE_SCHEMA.sql`.
*   **Testing:** Zero test coverage for user interactions or MDX pipeline.

### Known Gaps
*   **No offline handling:** Feature requires active connection for all interactions.
*   **Silent action failures:** Server actions return booleans; UI lacks robust retry states.
*   **No Skip Link:** Sidebar/ToC navigation lacks "Skip to Content" for screen readers.
*   **Dead Infrastructure:** `embedding` column on `wiki_articles` is unused.

---
*End of Specification*
