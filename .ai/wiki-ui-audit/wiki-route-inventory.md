# Wiki Route Inventory

**Generated:** 2026-05-04  
**Project:** SlateCamp (Next.js App Router, Bun)  
**Scope:** All wiki routes and components under `/dashboard/wiki`

---

## Route Map

### Route 1: `/dashboard/wiki` (Index/Landing)

| Property | Value |
|----------|-------|
| **File** | `src/app/dashboard/wiki/page.tsx` |
| **Render Type** | Client (static, no async) |
| **Data Sources** | None |
| **Loading** | Route-level `loading.tsx` — full skeleton (sidebar + content + right sidebar) |
| **Error** | ❌ **No error.tsx** — falls to dashboard/root error boundary |
| **Empty State** | Always renders — landing page IS the default state |
| **Metadata** | None |

**Behavior:** Static welcome page with BookOpen hero icon, "Knowledge Wiki" title, feature grid (Syllabus Mapped, Interactive Content), and "Select a topic from the taxonomy tree" hint. No data fetching.

**Children rendered by layout:** WikiSidebar (left) + WikiContentShell containing children (this page).

---

### Route 2: `/dashboard/wiki` (Layout — WikiLayoutContent)

| Property | Value |
|----------|-------|
| **File** | `src/app/dashboard/wiki/layout.tsx` + `WikiLayoutContent.tsx` |
| **Render Type** | Server (async) |
| **Data Sources** | `getUser()`, `user_global_stats` (current_discipline_id) |
| **Loading** | `<Suspense fallback={<WikiLoading />}>` wraps entire layout |
| **Error** | ❌ **No error.tsx** — log on stats error, continue with null discipline |

**Component Tree:**
```
WikiPageLayout (layout.tsx)
  └─ <Suspense fallback={<WikiLoading />}>
       └─ WikiLayoutContent (server)
            ├─ getUser() + stats fetch
            ├─ WikiDisciplineProvider
            │    └─ WikiNavigationProvider
            │         ├─ Skip-to-content link (a11y)
            │         ├─ WikiSidebarShell (client, resizable)
            │         │    └─ [disciplineId ? Suspense(WikiSidebarLoader) : WikiSidebar]
            │         └─ WikiContentShell (client, transition-aware)
            │              └─ {children}
```

**Empty State — No Discipline:** When `disciplineId` is null, `WikiSidebar` shows a "No Discipline" message with link to `/dashboard/settings`.

---

### Route 3: `/dashboard/wiki/[slug]` (Article Page)

| Property | Value |
|----------|-------|
| **File** | `src/app/dashboard/wiki/[slug]/page.tsx` |
| **Render Type** | Dynamic (async server component) |
| **Loading** | `loading.tsx` (article skeleton) + inner Suspense boundaries |
| **Error** | ❌ **No error.tsx** — article null → `notFound()`, MDX error → `WikiArticleError` |
| **Metadata** | ✅ `generateMetadata` — title, description, OG, Twitter, custom meta |
| **Query Params** | `minimal`, `from` (wrong-answer), `topic` |
| **Empty State** | Article null → notFound(); no headings → ToC hidden; no sources → hidden; no related → hidden |

#### Data Flow

```
WikiArticlePage(params: { slug })
  │
  ├─ getCachedArticleAndNode(slug) → { article, node }
  │    └─ Uses Supabase RPC 'get_article_with_node' or fallback chain
  │    └─ Cached: unstable_cache, revalidate=3600, tags=[wiki, taxonomy]
  │    └─ If null → notFound()
  │
  ├─ [demoMode ? empty : Promise.all([
  │     getEIPromptsForArticle(articleId),
  │     getUserEIResponsesForArticle(articleId),
  │     getArticleSources(articleId),
  │     getRelatedTopics(node),  // uses getCachedTaxonomyTreeByDiscipline
  │     getArticleSiblings(nodeId)
  │   ])]
  │
  ├─ WikiHeader (server)
  │    └─ getBreadcrumbTrail(nodeId, disciplineId)
  │    └─ getCachedTaxonomyTreeFull(disciplineId) → mobile sidebar
  │    └─ WikiHeaderClient (client)
  │
  ├─ Main Content
  │    ├─ WrongAnswerBanner (conditional)
  │    ├─ WikiArticleHero (subject, difficulty, readTime, updatedNote, leaTestsYou)
  │    ├─ WikiLearningJourney (learning path with checkpoints)
  │    ├─ <Suspense fallback={<WikiArticleSkeleton />}>
  │    │    └─ WikiArticle (async server — MDX compilation)
  │    │         ├─ compileMDX with 30+ block components + lazy widgets
  │    │         ├─ Catches errors → renders WikiArticleError
  │    │         └─ WikiNoteAnchor + WikiHighlighter + WikiTextSelection
  │    ├─ WikiLearningCompletion (end-of-article prompts)
  │    └─ WikiReadTracker (client, side-effect only, renders null)
  │
  ├─ Prev/Next Footer
  │    └─ From getArticleSiblings → taxonomy sibling navigation
  │
  └─ Right Sidebar (xl breakpoint)
       └─ <Suspense fallback={<WikiRightSidebarSkeleton />}>
            └─ WikiRightSidebar
                 ├─ WikiQuizButton (inline quiz modal)
                 ├─ WikiRelatedPopover (or null if empty)
                 ├─ Feedback (thumbs up/down + copy link)
                 ├─ WikiSourcesPopover (or null if empty)
                 └─ WikiTableOfContents (or null if empty headings)
```

#### Metadata (generateMetadata)

**Article found:**
- Title: `"{article.title} | SlateCamp Wiki"`
- Description: `truncateMetadataDescription(learningPurpose)` — truncated to 155 chars
- Robots: `{ index: false, follow: false }` (ALL wiki content not indexed)
- OpenGraph: `{ title, description, type: 'article' }`
- Twitter: `{ card: 'summary', title, description }`
- Custom: `slatecamp:wiki-subject`, `slatecamp:wiki-difficulty`

**Article not found:**
- Title: `"Wiki Article Not Found | SlateCamp"`
- Robots: `{ index: false, follow: false }`

---

## Navigation Components

| Component | Type | File | Role | Empty State |
|-----------|------|------|------|-------------|
| WikiLayoutContent | async server | `navigation/WikiLayoutContent.tsx` | Orchestrator | No user → null; No discipline → "No Discipline" |
| WikiSidebar | client | `navigation/WikiSidebar.tsx` | Taxonomy tree | No disciplineId → Settings link; Empty tree → nothing |
| WikiSidebarLoader | async server | `navigation/WikiSidebarLoader.tsx` | Data fetcher | Empty tree → client-side retry |
| WikiSidebarShell | client | `navigation/WikiSidebarShell.tsx` | Resize container | Returns null before first mount |
| WikiSidebarSkeleton | server | `navigation/WikiSidebarSkeleton.tsx` | Loading UI | N/A |
| WikiHeader | async server | `navigation/WikiHeader.tsx` | Breadcrumb fetcher | No nodeId → empty breadcrumbs |
| WikiHeaderClient | client | `navigation/WikiHeaderClient.tsx` | Breadcrumb bar | No disciplineId → hide mobile nav; No breadcrumbs → hide nav |
| WikiContentShell | client | `navigation/WikiContentShell.tsx` | Transition wrapper | Pending → ArticleSkeleton |
| WikiRightSidebar | client | `navigation/WikiRightSidebar.tsx` | Sidebar panel | No headings → hide ToC; No sources → hide; No related → hide |
| WikiRightSidebarSkeleton | server | `navigation/WikiRightSidebarSkeleton.tsx` | Loading UI | N/A |
| WikiTableOfContents | client | `navigation/WikiTableOfContents.tsx` | ToC with IO | Empty headings → return null |
| WikiReadingProgress | client | `navigation/WikiReadingProgress.tsx` | Progress bar | Zero scroll → opacity 0 |
| WikiBookmarks | client | `navigation/WikiBookmarks.tsx` | Bookmarks popover | Not loaded → return null; Empty → "No bookmarks yet" |
| WikiNavigationContext | client | `navigation/WikiNavigationContext.tsx` | Transition context | N/A |
| WikiDisciplineContext | client | `navigation/WikiDisciplineContext.tsx` | Discipline context | N/A |

---

## Article Components

| Component | Type | File | Role |
|-----------|------|------|------|
| WikiArticle | async server | `article/WikiArticle.tsx` | MDX compiler + renderer |
| WikiArticleSkeleton | server | `article/WikiArticle.tsx` | Article content skeleton |
| WikiArticleError | client | `article/WikiArticleError.tsx` | "Failed to render" fallback |
| WikiArticleHeader | server | `article/WikiArticleHeader.tsx` | Title + metadata |
| WikiArticleHero | server | `article/WikiArticleHero.tsx` | Subject/difficulty/read time hero |
| WikiLearningJourney | server | `article/WikiLearningJourney.tsx` | Learning path (null if minimal) |
| WikiLearningCompletion | server | `article/WikiLearningJourney.tsx` | End-of-article checkpoint |
| WikiItemRenderer | server | `article/WikiItemRenderer.tsx` | Typed wiki_items renderer |

---

## Shared Components

| Component | Type | File | Empty Behavior |
|-----------|------|------|----------------|
| WikiReadTracker | client | `shared/WikiReadTracker.tsx` | Renders null (pure side-effect) |
| WikiSourcesPopover | client | `shared/WikiSourcesPopover.tsx` | Returns null if sources empty |
| WikiRelatedPopover | client | `shared/WikiRelatedPopover.tsx` | Returns null if topics empty |
| WikiHighlighter | client | `shared/WikiHighlighter.tsx` | Text highlighter |
| WikiNoteAnchor | client | `shared/WikiNoteAnchor.tsx` | Note anchor |
| WikiReference | server | `shared/WikiReference.tsx` | MDX reference component |
| WikiTextSelection | client | `shared/WikiTextSelection.tsx` | Text selection tracking |

---

## Widget System

**Registry:** `src/components/wiki/widgets/registry.ts`  
**Groups:** `bp344/` (6 widgets), `dsgn013/` (12 widgets)  
**Total widgets:** 18  
**Resolution:** Lazy — `detectWidgets()` scans MDX for `<WidgetName` patterns, loads only those modules

---

## Block Components (MDX-Embedded)

All in `src/components/wiki/blocks/`:

Accordion, WikiAccordion, WikiTabs, WikiCalloutBox, WikiChangedPill, WikiExamTable, WikiMistakeCard, WikiMistakeList, WikiPartHeader, WikiPre, Callout (Note/Warn/Tip/Example/AlertBox/AuthorityContent), ComparisonTable, ExamTip, FormulaBlock, GenericBlock, InlineQuiz, KeyValues, LawCallout, Mermaid, PrequestionGate, ProcessFlow, RevealBlock, SubjectSnapshot, TeachBackPrompt, WrongAnswerBanner, ElaborativeInterrogation

---

## Data Sources Summary

| Data Source | File | Cached | Cache Config | Fallback |
|-------------|------|--------|-------------|----------|
| `getCachedArticleAndNode(slug)` | `cached-queries.ts` | ✅ 1h TTL | tags: [wiki, taxonomy] | Returns { null, null } |
| `getCachedTaxonomyTreeByDiscipline(id)` | `cached-queries.ts` | ✅ 2h TTL | tags: [taxonomy, disciplineId] | Returns [] |
| `getCachedTaxonomyTreeFull(id)` | `cached-queries.ts` | ✅ 2h TTL | tags: [taxonomy, wiki, disciplineId] | Returns [] |
| `getTaxonomyTree(id)` (uncached) | `wiki-actions.ts` | ❌ | N/A | Returns [] |
| `getEIPromptsForArticle(id)` | `ei-prompts` | ❌ | N/A | No fallback |
| `getUserEIResponsesForArticle(id)` | `ei-prompts` | ❌ | N/A | No fallback |
| `getArticleSources(id)` | `wiki-actions.ts` | ❌ | N/A | Returns [] |
| `getBreadcrumbTrail(nodeId, disciplineId)` | `wiki-actions.ts` | ✅ request-level (cache()) | N/A | Returns [] |
| `getArticleSiblings(nodeId)` | `wiki-actions.ts` | ❌ | N/A | Returns { null, null } |

---

## Loading States — Complete Hierarchy

1. **Route-level `loading.tsx`** (both `/dashboard/wiki` and `[slug]/`)
   - Initial page load before any component renders
   - Shows skeleton matching the actual route structure

2. **WikiLayoutContent Suspense** (layout.tsx)
   - Wraps entire async layout content (user fetch + discipline fetch)
   - Shows WikiLoading skeleton during user/stats DB query

3. **WikiSidebarLoader Suspense** (WikiLayoutContent.tsx)
   - Wraps async tree data fetch
   - Shows WikiSidebarSkeleton while taxonomy tree loads

4. **WikiContentShell transition** (client-side)
   - Uses `useTransition()` from WikiNavigationContext
   - Shows ArticleSkeleton during client-side route changes

5. **WikiArticle inner Suspense** ([slug]/page.tsx)
   - Wraps async MDX compilation
   - Shows WikiArticleSkeleton while MDX compiles

6. **WikiRightSidebar Suspense** ([slug]/page.tsx)
   - Wraps sidebar content
   - Shows WikiRightSidebarSkeleton

---

## Missing States & Issues

### Critical

1. **WikiSidebar.tsx — unhandled Promise rejection**  
   `getTaxonomyTree()` in effect has no `.catch()`. If the server action throws, `loading` stays `true` forever. The user sees an infinite loading skeleton.

### Medium

2. **No wiki-level `error.tsx`**  
   Neither `/dashboard/wiki` nor `[slug]` has an error boundary. Any unhandled exception during data fetching crashes the entire page to the dashboard/root boundary.

3. **Promise.all fan-out lacks per-call error handling**  
   `[slug]/page.tsx` lines 158-166: `Promise.all([...5 calls])` — any single rejection kills all five. In demo mode these are skipped, but live mode has no safety net.

4. **WikiHeader — no try/catch on breadcrumb/mobile tree fetch**  
   If `getBreadcrumbTrail` or `getCachedTaxonomyTreeFull` throws, the whole header crashes. No graceful degradation to an empty breadcrumb bar.

### Low

5. **No `not-found.tsx` for `[slug]`**  
   `notFound()` falls to the nearest parent. A wiki-specific 404 would provide better UX ("Article not found — browse the sidebar").

6. **WikiSidebarLoader — no cache-failure fallback**  
   If `getCachedTaxonomyTreeFull` throws (cold cache + DB down), the sidebar Suspense boundary shows the skeleton indefinitely.

7. **No test coverage for error states**  
   `page.test.tsx` only tests metadata generation and hero/journey rendering. No tests for error states, loading states, or empty states.

---

## Key Observations

- **3-layer loading:** Route loading.tsx → WikiContentShell transition → inner MDX Suspense
- **Demo mode optimization:** Skips EI, sources, siblings in demo mode for fast smoke testing
- **Full lazy widget loading:** Only loads widget JS referenced in article content (scan-based)
- **All content no-indexed:** Every article returns `robots: { index: false, follow: false }`
- **Graceful metadata fallbacks:** explicit article fields → node fields → computed defaults
- **Optimistic bookmarks:** Local state updates immediately, rolls back on server error
- **Proper client/server boundaries:** 21 components with correct `'use client'` / async server types
- **Reading progress scoped to container:** Uses `#wiki-center-pane` scroll, not window
- **Branching slug resolution:** Slug can be article slug or taxonomy slug — resolved via RPC or fallback chain
