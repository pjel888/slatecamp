# Wiki Route Performance Audit — V2 Deep-Dive

**Date:** 2026-04-07 (revised)
**Scope:** `/dashboard/wiki/*` routes + related components
**Scaling Target:** 500+ deep-dive articles
**Version:** V2.2 (Critic-approved — all review findings resolved)

---

## Phase 1: Audit Findings

### 1.1 Data Fetching Layer

| Issue | Severity | Location | Finding |
|-------|----------|----------|---------|
| **Sequential Article Resolution** | HIGH | `src/lib/actions/wiki-actions.ts:345-434` | `resolveArticleAndNode` performs 2-4 sequential DB roundtrips per article load (article → junction → node, with fallback paths). With 500+ articles, this compounds into significant latency. |
| **Chunked Taxonomy Fetch** | LOW | `src/lib/actions/wiki-actions.ts:229-265` | `getTaxonomyTree` chunks 80 IDs per batch with parallel `Promise.all` — good pattern, overhead is minimal. |
| **Missing Database Indexes** | HIGH | Schema-dependent | No explicit `wiki_articles(slug, status)` composite index or `wiki_article_taxonomy(node_id, is_primary)` index. These columns are queried on every article resolution — likely causing sequential scans at scale. |

### 1.2 Caching Strategy

| Issue | Severity | Location | Finding |
|-------|----------|----------|---------|
| **Infinite Cache TTL** | MEDIUM | `src/lib/actions/cached-queries.ts:56` | `getCachedTaxonomyTree` uses `revalidate: false` — static forever cache. Updates require manual `revalidateTag('taxonomy')` or redeployment. |
| **Per-Slug Cache Without TTL** | MEDIUM | `src/lib/actions/cached-queries.ts:116-123` | `getCachedArticleAndNode` has `revalidate: false` — article content cached permanently. Good for reads, but content editors need a clear invalidation path. |
| **Cache Invalidation Exists But Coverage Unverified** | LOW | `src/lib/actions/admin/wiki.ts:75,129,163` | Admin CRUD actions already call `revalidateTag(CACHE_TAGS.wiki, 'max')` on create, update, and delete. Taxonomy mutations in `admin/taxonomy.ts:47,105,124` invalidate `CACHE_TAGS.taxonomy`. Coverage of edge cases (bulk ops, taxonomy reassignment) is unverified. |

### 1.3 Rendering Architecture

| Issue | Severity | Location | Finding |
|-------|----------|----------|---------|
| **Wiki Landing Page is Client Component** | MEDIUM | `src/app/dashboard/wiki/page.tsx:1` | Entire landing hub uses `'use client'` — could be Server Component with client islands for search/interactivity. |
| **Uncached Taxonomy Fetch in Sidebar Chain** | HIGH | `WikiSidebarLoader.tsx:17` + `WikiSidebar.tsx:8` | Both server loader and client fallback call uncached `getTaxonomyTree` instead of `getCachedTaxonomyTreeByDiscipline` (`cached-queries.ts:87`). The loader passes `initialNodes` as props to WikiSidebar (client fallback only fires when `initialNodes` is empty), but the server-side fetch itself is uncached. |
| **Missing Suspense for WikiRightSidebar** | MEDIUM | `src/components/wiki/navigation/WikiRightSidebar.tsx` | Heavy interactive component (quiz button, related topics, sources, TOC) renders synchronously without its own Suspense boundary. |

### 1.4 Bundle Impact

| Issue | Severity | Location | Finding |
|-------|----------|----------|---------|
| **Widget Registry** | OK | `src/components/wiki/widgets/registry.ts:25-85` | Already uses dynamic `import()` for all 18 widgets. `resolveWidgets()` at line 102-116 only loads widgets detected in article content. No action needed. |
| **FormulaBlock** | OK | `src/components/wiki/blocks/FormulaBlock.tsx` | Lightweight React component rendering styled divs — no KaTeX or heavy math library. No action needed. |

### 1.5 Database Query Patterns

| Issue | Severity | Location | Finding |
|-------|----------|----------|---------|
| **Breadcrumb Trail** | LOW | `src/lib/actions/wiki-actions.ts:449-488` | `getBreadcrumbTrail` fetches discipline tree via `getCachedTaxonomyTreeByDiscipline` (cached), then builds trail in-memory. Already optimized — cache handles the heavy lift. |
| **Related Topics Query** | LOW | `src/app/dashboard/wiki/[slug]/page.tsx` | `getRelatedTopics` queries siblings per article — efficient, runs in parallel with other secondary fetches. |

---

## Phase 2: Component Architecture Map

### 2.1 Server vs Client Components

| File Path | Type | Role |
|-----------|------|------|
| `src/app/dashboard/wiki/page.tsx` | **Client** | Landing wiki hub — candidate for RSC conversion |
| `src/app/dashboard/wiki/[slug]/page.tsx` | **Server** | Article rendering — fetches via `getCachedArticleAndNode` |
| `src/app/dashboard/wiki/layout.tsx` | **Server** | Wraps wiki routes with `WikiLayoutContent` + Suspense |
| `src/app/dashboard/wiki/[slug]/loading.tsx` | Skeleton | Per-article loading state |
| `src/app/dashboard/wiki/loading.tsx` | Skeleton | Landing page loading state |

### 2.2 Navigation Components

| File Path | Type | Role |
|-----------|------|------|
| `src/components/wiki/navigation/WikiLayoutContent.tsx` | **Server** | Layout orchestrator — fetches user + discipline context |
| `src/components/wiki/navigation/WikiSidebarLoader.tsx` | **Server** | Async taxonomy loader inside Suspense boundary |
| `src/components/wiki/navigation/WikiHeader.tsx` | **Server** | Builds breadcrumbs via `getBreadcrumbTrail` |
| `src/components/wiki/navigation/WikiHeaderClient.tsx` | **Client** | Mobile nav, back link, bookmarks, reading progress |
| `src/components/wiki/navigation/WikiSidebar.tsx` | **Client** | Tree nav — calls `getTaxonomyTree` server action on mount |
| `src/components/wiki/navigation/WikiRightSidebar.tsx` | **Client** | Quiz button, related topics, sources, TOC |
| `src/components/wiki/navigation/WikiTableOfContents.tsx` | **Client** | Sticky scroll-synced table of contents |
| `src/components/wiki/navigation/WikiContentShell.tsx` | **Client** | Dynamic skeleton during loading |

### 2.3 Article Rendering

| File Path | Type | Role |
|-----------|------|------|
| `src/components/wiki/article/WikiArticle.tsx` | **Server** | MDX rendering with `next-mdx-remote`, sanitizes content |
| `src/components/wiki/mdx-components-shared.ts` | Shared | Base MDX components + wiki blocks (Note, Warn, Tip, FormulaBlock) |
| `src/components/wiki/widgets/registry.ts` | **Server** | Maps MDX tags to lazy-loaded components via dynamic `import()` |

### 2.4 Data Flow (Per-Article Page)

```
1. getCachedArticleAndNode(slug)                    [cached-queries.ts:116]
   └─> resolveArticleAndNode(slug)                  [wiki-actions.ts:345-434]
       ├─> Path 1: wiki_articles by slug (published)
       │   ├─> wiki_article_taxonomy (is_primary)
       │   ├─> Fallback: wiki_article_taxonomy (any)
       │   └─> taxonomy_tree by node_id
       └─> Path 2: taxonomy_tree by slug
           ├─> wiki_article_taxonomy (is_primary)
           ├─> Fallback: wiki_article_taxonomy (any)
           └─> wiki_articles by article_id

2. Promise.all (parallel secondary fetches)
   ├─> getEIPromptsForArticle(article_id)
   ├─> getUserEIResponsesForArticle(article_id)
   ├─> getArticleSources(article_id)
   ├─> getTeachBackCriteria(node_id)
   ├─> getRelatedTopics(node)
   └─> getArticleSiblings(node_id)

3. Widget Resolution (lazy)
   └─> detectWidgets(content) → resolveWidgets(content)  [registry.ts:95-116]
       └─> Dynamic import only for detected widgets
```

### 2.5 Caching TTLs

| Cache Function | Location | TTL | Tags |
|----------------|----------|-----|------|
| `getCachedDisciplines` | `cached-queries.ts:25` | 3600s (1 hour) | none |
| `getCachedTaxonomyTree` | `cached-queries.ts:39` | `revalidate: false` (infinite) | `taxonomy` |
| `getCachedTaxonomyTreeByDiscipline` | `cached-queries.ts:61` | `revalidate: false` (infinite) | `taxonomy`, per-discipline tag |
| `getCachedWikiArticles` | `cached-queries.ts:91` | `revalidate: false` (infinite) | `wiki` |
| `getCachedArticleAndNode` | `cached-queries.ts:116` | `revalidate: false` (infinite) | `wiki`, `taxonomy` |

### 2.6 Route Inventory

| Route | File | Exists |
|-------|------|--------|
| `/dashboard/wiki` | `src/app/dashboard/wiki/page.tsx` | Yes |
| `/dashboard/wiki/[slug]` | `src/app/dashboard/wiki/[slug]/page.tsx` | Yes |
| `/dashboard/wiki/test` | `src/app/dashboard/wiki/test/` | Yes (directory) |

### 2.7 SSR/ISR Pattern

| Aspect | Finding |
|--------|---------|
| **Rendering Mode** | SSR — no `generateStaticParams` observed |
| **Caching** | Per-slug via `unstable_cache` with `revalidate: false` and tag-based revalidation |
| **Streaming** | Suspense boundaries in layout (WikiLoading fallback) and sidebar (WikiSidebarLoader with skeleton) |

### 2.8 Bottlenecks at 500+ Articles

1. **Cold-start latency**: New slugs incur full `resolveArticleAndNode` (2-4 sequential queries) until cache warms
2. **WikiSidebar redundant fetch**: Client-side `getTaxonomyTree` call bypasses the cached server path
3. **No proactive cache warming**: All caches are lazy — first visitor to any slug pays full cost
4. **MDX compilation**: Per-article server-side MDX compilation adds CPU time on cold hits

---

## Phase 3: Implementation Plan

### Step 0: Baseline Measurements (Required First)

Before any optimization, establish measurable baselines:

- [ ] **Step 0.1**: Count current published articles
  - Run: `SELECT count(*) FROM wiki_articles WHERE status = 'published'`
  - This determines urgency of sequential query optimization
- [ ] **Step 0.2**: Measure article page load latency (p50/p95)
  - Use browser DevTools Network tab on 5 representative articles
  - Record: TTFB, LCP, total JS transferred
- [ ] **Step 0.3**: Measure `resolveArticleAndNode` query time
  - Add temporary `console.time` in `wiki-actions.ts:345` and `wiki-actions.ts:434`
  - Record p50/p95 across 10 article loads
- [ ] **Step 0.4**: Measure wiki route bundle size
  - `@next/bundle-analyzer` is not installed — use alternative methods:
  - Run `bun run build` and check `.next/server/app/dashboard/wiki/` for server chunk sizes
  - Check `.next/static/chunks/` for client-side JS sizes related to wiki routes
  - Alternatively: install `@next/bundle-analyzer` as devDependency for visual analysis (`bun add -d @next/bundle-analyzer`)
  - Record: total JS transferred for `/dashboard/wiki/[slug]` route (also measurable via browser DevTools Network tab)

**Acceptance criteria**: Baseline document exists with concrete numbers before any optimization begins.

---

### Step 1: Database Indexes (High Impact, Low Risk)

- [ ] **Step 1.1**: Add composite index on `wiki_articles(slug, status)`
  - Create migration: `supabase/migrations/YYYYMMDD_wiki_slug_status_index.sql`
  - SQL: `CREATE INDEX CONCURRENTLY idx_wiki_articles_slug_status ON wiki_articles(slug, status);`
  - Purpose: Accelerates the `resolveArticleAndNode` Path 1 lookup at `wiki-actions.ts:351-357`
  - Rollback: `DROP INDEX idx_wiki_articles_slug_status;`

- [ ] **Step 1.2**: Add composite index on `wiki_article_taxonomy(node_id, is_primary)`
  - Create migration: `supabase/migrations/YYYYMMDD_wiki_taxonomy_node_primary_index.sql`
  - SQL: `CREATE INDEX CONCURRENTLY idx_wiki_article_taxonomy_node_primary ON wiki_article_taxonomy(node_id, is_primary);`
  - Purpose: Accelerates junction table lookups at `wiki-actions.ts:361-366` and `wiki-actions.ts:402-407`
  - Rollback: `DROP INDEX idx_wiki_article_taxonomy_node_primary;`

- [ ] **Step 1.3**: Add composite index on `wiki_article_taxonomy(article_id, is_primary)`
  - SQL: `CREATE INDEX CONCURRENTLY idx_wiki_article_taxonomy_article_primary ON wiki_article_taxonomy(article_id, is_primary);`
  - Purpose: Accelerates the reverse junction lookup in Path 1 at `wiki-actions.ts:362-366`
  - Rollback: `DROP INDEX idx_wiki_article_taxonomy_article_primary;`

**Acceptance criteria**: `EXPLAIN ANALYZE` on `resolveArticleAndNode` queries shows index scans instead of sequential scans. Query time reduced by measurable amount vs. Step 0.3 baseline.

---

### Step 2: RPC for Article Resolution (High Impact, Medium Risk)

- [ ] **Step 2.1**: Create Supabase RPC `get_article_with_node(p_slug text)`
  - Create migration: `supabase/migrations/YYYYMMDD_rpc_get_article_with_node.sql`
  - The RPC should replicate both paths from `resolveArticleAndNode` (`wiki-actions.ts:345-434`):
    - Path 1: Join `wiki_articles` → `wiki_article_taxonomy` → `taxonomy_tree` where `slug` matches article
    - Path 2: Join `taxonomy_tree` → `wiki_article_taxonomy` → `wiki_articles` where `slug` matches node
  - Return type: `jsonb` with `{ article, node }` matching current TypeScript types
  - Rollback: `DROP FUNCTION get_article_with_node;` and revert `wiki-actions.ts` changes

- [ ] **Step 2.2**: Update `resolveArticleAndNode` to use new RPC
  - File: `src/lib/actions/wiki-actions.ts:345-434`
  - Replace 2-4 sequential queries with single `supabase.rpc('get_article_with_node', { p_slug: slug })`
  - Keep current function signature unchanged — callers (`cached-queries.ts:117`) don't need changes
  - Add fallback: if RPC fails, fall through to existing sequential logic

**Acceptance criteria**: `resolveArticleAndNode` query time reduced to single round-trip. Measured vs. Step 0.3 baseline.

---

### Step 3: Cache Strategy Improvements (Medium Impact, Low Risk)

- [ ] **Step 3.1**: Add reasonable TTL to article cache
  - File: `src/lib/actions/cached-queries.ts:119-122`
  - Change `revalidate: false` to `revalidate: 3600` (1 hour) on `getCachedArticleAndNode`
  - This means content updates appear within 1 hour without manual invalidation
  - Tag-based revalidation (`revalidateTag('wiki')`) still works for immediate updates

- [ ] **Step 3.2**: Verify cache invalidation coverage for all mutation paths
  - Already implemented: `src/lib/actions/admin/wiki.ts` calls `revalidateTag(CACHE_TAGS.wiki, 'max')` on create (line 129), update (line 75), and delete (line 163)
  - Already implemented: `src/lib/actions/admin/taxonomy.ts` calls `revalidateTag(CACHE_TAGS.taxonomy, 'max')` on taxonomy mutations (lines 47, 105, 124)
  - Verify: Are bulk operations (if any) also covered? Is taxonomy node reassignment covered?
  - Verify: What does the `'max'` second argument to `revalidateTag` do? (Defined in `cache-tags.ts:26`)

- [ ] **Step 3.3**: Add TTL to taxonomy tree caches
  - File: `src/lib/actions/cached-queries.ts:56` — change `revalidate: false` to `revalidate: 7200` (2 hours)
  - File: `src/lib/actions/cached-queries.ts:81` — same change for per-discipline variant
  - Taxonomy changes are rare but the infinite TTL means they require deployment to propagate

**Acceptance criteria**: All wiki caches have finite TTLs. Content updates visible within 1 hour without manual intervention.

---

### Step 4: WikiSidebar Redundant Fetch Fix (High Impact, Medium Risk)

- [ ] **Step 4.1**: Switch sidebar chain to use cached taxonomy fetch
  - **Primary fix** — File: `src/components/wiki/navigation/WikiSidebarLoader.tsx:1,17`
    - Line 1: Change import from `getTaxonomyTree` (uncached) to `getCachedTaxonomyTreeByDiscipline` from `@/lib/actions/cached-queries`
    - Line 17: Change `await getTaxonomyTree(disciplineId)` to `await getCachedTaxonomyTreeByDiscipline(disciplineId)`
    - This is the server-side fetch that runs on every wiki page load — caching it eliminates repeated DB hits
  - **Secondary fix** — File: `src/components/wiki/navigation/WikiSidebar.tsx:8`
    - WikiSidebar already receives `initialNodes` props from the loader (client fallback only fires when empty)
    - Either: remove the client-side fallback fetch entirely (since loader now uses cached data reliably)
    - Or: change the fallback import to `getCachedTaxonomyTreeByDiscipline` for consistency

**Acceptance criteria**: Network tab shows no redundant taxonomy fetch on wiki page load. WikiSidebar receives data from server parent or uses cached function.

---

### Step 5: Component Architecture Improvements (Medium Impact, Low Risk)

- [ ] **Step 5.1**: Add Suspense boundary around WikiRightSidebar interactive elements
  - File: `src/app/dashboard/wiki/[slug]/page.tsx`
  - Wrap `<WikiRightSidebar>` in `<Suspense fallback={<RightSidebarSkeleton />}>`
  - This allows the article content to render without waiting for right sidebar hydration

- [ ] **Step 5.2**: Evaluate converting wiki landing page to Server Component
  - File: `src/app/dashboard/wiki/page.tsx:1` (currently `'use client'`)
  - Audit which parts of the landing page require client interactivity
  - Extract interactive parts (search, animations) into client island components
  - Make the page itself a Server Component that renders client islands
  - Skip if the page is mostly interactive — cost/benefit may not justify the change

**Acceptance criteria**: WikiRightSidebar no longer blocks article content rendering (measurable via LCP improvement vs. Step 0.2 baseline).

---

### Step 6: Query Optimization (Low Impact)

- [ ] **Step 6.1**: Optimize `getBreadcrumbTrail` when discipline ID is known
  - File: `src/lib/actions/wiki-actions.ts:449-488`
  - Current: If `disciplineId` not passed, makes an extra query to fetch it (line 455-460)
  - Fix: Ensure all callers pass `disciplineId` when available (it's usually known from the article's node)
  - This eliminates one query on the breadcrumb hot path

- [ ] **Step 6.2**: Add server-side memoization for repeated queries within a single request
  - Use React 19 `cache()` to deduplicate calls within a single server render pass
  - File: `src/lib/actions/wiki-actions.ts`
  - Example — wrap `resolveArticleAndNode`:
    ```ts
    import { cache } from 'react'
    export const memoizedResolveArticleAndNode = cache(resolveArticleAndNode)
    ```
  - Also consider wrapping: `getTaxonomyTree`, `getBreadcrumbTrail`, `getArticleSiblings`
  - This prevents duplicate DB queries when multiple server components in the same render tree request the same data

**Acceptance criteria**: No duplicate database queries visible in server logs for a single page render.

---

### Step 7: Observability & Verification (Low Impact, High Value)

- [ ] **Step 7.1**: Add performance logging to `resolveArticleAndNode`
  - File: `src/lib/actions/wiki-actions.ts:345`
  - Log query duration to verify optimization impact in production

- [ ] **Step 7.2**: Re-measure baselines after all optimizations
  - Repeat all measurements from Step 0
  - Compare: article load p50/p95, bundle size, query times
  - Document results

- [ ] **Step 7.3**: Add regression tests for caching behavior
  - Test runner: Bun (`bun test`)
  - Test that `getCachedArticleAndNode` returns cached data on second call
  - Test that `revalidateTag('wiki')` invalidates article cache

**Acceptance criteria**: Post-optimization measurements show measurable improvement vs. Step 0 baselines. Regression tests pass.

---

## Estimated Impact (Requires Step 0 Baselines)

| Optimization | Expected Improvement | Baseline Needed |
|--------------|---------------------|-----------------|
| DB Indexes (Step 1) | Faster index scans vs. sequential scans | Step 0.3 query times |
| RPC Consolidation (Step 2) | 1 round-trip vs. 2-4 sequential | Step 0.3 query times |
| Cache TTLs (Step 3) | Content freshness without redeployment | Manual verification |
| Sidebar Fetch Fix (Step 4) | Eliminate redundant taxonomy fetch | Step 0.2 network tab |
| Suspense Boundaries (Step 5) | Faster LCP via streaming | Step 0.2 LCP measurement |
| Query Optimization (Step 6) | Marginal per-request savings | Step 0.3 query times |

**Note**: Concrete percentage estimates will be calculated after Step 0 baselines are established. Estimating "40-60% improvement" without knowing the starting point is not meaningful.

---

## Files Requiring Changes

### Database Migrations
- `supabase/migrations/` — 3 index migrations (Steps 1.1-1.3), 1 RPC migration (Step 2.1)

### Server Actions
- `src/lib/actions/wiki-actions.ts` — RPC integration (Step 2.2), breadcrumb optimization (Step 6.1)
- `src/lib/actions/cached-queries.ts` — Cache TTL adjustments (Steps 3.1, 3.3)

### Components
- `src/components/wiki/navigation/WikiSidebar.tsx` — Remove redundant fetch (Step 4.1)
- `src/app/dashboard/wiki/[slug]/page.tsx` — Add Suspense boundary (Step 5.1)
- `src/app/dashboard/wiki/page.tsx` — Evaluate RSC conversion (Step 5.2)

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| RPC function has bugs at edge cases | Keep existing sequential logic as fallback (Step 2.2). Test both resolution paths. |
| Index creation locks table | Use `CREATE INDEX CONCURRENTLY` (non-blocking). All migrations use this. |
| Cache TTL too aggressive causes stale content | Start with 1-hour TTL (Step 3.1). Tag-based invalidation provides escape hatch for immediate updates. |
| WikiSidebar refactor breaks mobile nav | Test on mobile viewport after Step 4.1. WikiSidebar is interactive on mobile — verify touch interactions preserved. |
| Baseline measurements are environment-dependent | Measure on same machine/connection consistently. Focus on relative improvement, not absolute numbers. |

---

## Revision Log

**V2.1 (2026-04-07 — Post-Critic Review)**
- Removed duplicate Phase 1 and Phase 2 sections (copy-paste error)
- Corrected widget registry finding: `registry.ts` already uses dynamic `import()` — removed false CRITICAL finding
- Corrected FormulaBlock finding: no KaTeX dependency exists — removed false finding
- Removed phantom routes (`/wiki/[slug]/edit`, `/wiki/search`) that don't exist
- Fixed `resolveArticleAndNode` file reference: lives in `wiki-actions.ts:345-434`, not `cached-queries.ts`
- Fixed `getCachedArticleAndNode` line reference: line 116, not 120
- Added Step 0: baseline measurements before any optimization
- Removed Steps 2.2, 2.4, 3.2, 3.3 from original plan (based on false findings)
- Removed Steps 4.2 (connection pooling) and 4.4 (prepared statements) — incompatible with `@supabase/supabase-js`
- Added rollback strategy for all database migrations
- Added file:line references to all implementation steps
- Added WikiSidebar redundant fetch as new finding (HIGH severity)
- Noted `getBreadcrumbTrail` already uses cached taxonomy — downgraded from MEDIUM to LOW
- Added cache invalidation path as explicit step
- Impact estimates now require baselines — no fabricated percentages

**V2.2 (2026-04-07 — Post-Critic Re-Review)**
- Corrected cache invalidation finding: admin actions already call `revalidateTag` — updated Section 1.2 and Step 3.2
- Refined WikiSidebar finding: root cause is `WikiSidebarLoader.tsx:17` using uncached `getTaxonomyTree`, not just the client fallback — updated Section 1.3 and Step 4.1 with specific line-level fix
- Fixed Step 0.4: `@next/bundle-analyzer` not installed — added alternative measurement methods
- Added concrete `React.cache()` example to Step 6.2 with specific functions to wrap

**Audit Status:** V2.2 APPROVED — READY FOR EXECUTION
