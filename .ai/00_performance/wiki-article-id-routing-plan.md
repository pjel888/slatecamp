# Wiki Article ID Routing — Migration Plan

> **Date:** 2026-05-04
> **Branch:** `codebase-modernization-batch1-2`
> **Scope:** Migrate Wiki article detail pages from slug-based URLs to article-ID-based URLs.
> **Status:** Phase 2 — Plan complete.

---

## 1. Selected Migration Strategy

**Strategy A — Hard migration to ID route**

Rationale:
- The Wiki article route is **private/authenticated** (`/dashboard/wiki/*`). SEO is not a concern.
- `article_id` is a **UUID** — easily distinguishable from slugs, so no ambiguous resolver is needed.
- The **admin knowledge editor already uses ID-based URLs** (`/admin/knowledge/[id]`). The pattern is established in the codebase.
- All foreign keys and related tables already reference `article_id`. No database migration is required.
- Old slug URLs will 404. This is acceptable for a private dashboard where users navigate via links, search, and sidebar — not bookmarks. If bookmark preservation is needed later, a thin catch-all redirect route can be added.

**Optional fallback (deferred):** If analytics or support shows significant old-slug traffic, implement a catch-all route at `/dashboard/wiki/[slug]` that attempts slug lookup once and redirects to `/dashboard/wiki/{articleId}`. This is **not in scope for the initial migration** to keep the patch small.

---

## 2. Route Contract Change

### Old contract
```
/dashboard/wiki/[slug]
params: { slug: string }
```

### New contract
```
/dashboard/wiki/[articleId]
params: { articleId: string }
```

### Files to rename / adjust
| Old Path | New Path | Notes |
|----------|----------|-------|
| `src/app/dashboard/wiki/[slug]/page.tsx` | `src/app/dashboard/wiki/[articleId]/page.tsx` | Folder rename. Update `params` type. |
| `src/app/dashboard/wiki/[slug]/page.test.tsx` | `src/app/dashboard/wiki/[articleId]/page.test.tsx` | Move with folder. Update mocks. |

**Note:** `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, and `page.tsx` (wiki index) remain in `src/app/dashboard/wiki/` and are unaffected.

---

## 3. Data Loading Changes

### 3.1 New loader function

Add `getCachedArticleAndNodeById(articleId: string)` in `src/lib/actions/cached-queries.ts`:

```ts
export const getCachedArticleAndNodeById = unstable_cache(
  async (articleId: string) => resolveArticleAndNodeById(articleId),
  ['wiki-article-by-id'],
  {
    revalidate: 3600,
    tags: [CACHE_TAGS.wiki, CACHE_TAGS.taxonomy],
  }
)
```

### 3.2 New resolver function

Add `resolveArticleAndNodeById(articleId: string)` in `src/lib/actions/wiki-actions.ts`:

```ts
export async function resolveArticleAndNodeById(
  articleId: string,
): Promise<{ article: WikiArticle | null; node: TaxonomyNode | null }> {
  const supabase = await createStaticClient()

  // 1. Fetch article by ID
  const { data: article } = await supabase
    .from('wiki_articles')
    .select('article_id, slug, title, content, created_at, updated_at, lea_tests_you, updated_note, subject_label, difficulty_label, read_time, status')
    .eq('article_id', articleId)
    .eq('status', 'published')
    .maybeSingle()

  if (!article) return { article: null, node: null }

  // 2. Resolve node via junction (same logic as slug path)
  const { data: junction } = await supabase
    .from('wiki_article_taxonomy')
    .select('node_id')
    .eq('article_id', articleId)
    .eq('is_primary', true)
    .maybeSingle()

  const nodeId =
    junction?.node_id ??
    (await (async () => {
      const { data: fallback } = await supabase
        .from('wiki_article_taxonomy')
        .select('node_id')
        .eq('article_id', articleId)
        .limit(1)
        .maybeSingle()
      return fallback?.node_id ?? null
    })())

  if (!nodeId) return { article: article as WikiArticle, node: null }

  const { data: node } = await supabase
    .from('taxonomy_tree')
    .select(TAXONOMY_NODE_COLUMNS)
    .eq('node_id', nodeId)
    .single()

  return { article: article as WikiArticle, node: node as TaxonomyNode | null }
}
```

**Why not modify the existing RPC?** The existing `get_article_with_node(p_slug)` is heavily used and optimized for slug-based resolution. Adding a new RPC or bypassing it for ID-based queries is cleaner and preserves the existing path as a fallback. For the initial migration, we bypass the RPC and query directly — the ID lookup is a single `.eq("article_id", id).maybeSingle()` which is already efficient.

### 3.3 Deprecate (but keep) slug-based functions

- `getCachedArticleAndNode(slug)` — keep for now, mark as `@deprecated`.
- `resolveArticleAndNode(slug)` — keep for now, mark as `@deprecated`.
- `getWikiArticleBySlug(slug)` — keep for now, mark as `@deprecated`.
- `getActiveTaxonomyNode(slug)` — keep for now, mark as `@deprecated`.

These may be needed for the optional fallback redirect or for admin features that still reference slug.

---

## 4. `ROUTES.wiki.article()` Signature Change

### Current
```ts
wiki: {
  root: '/dashboard/wiki',
  article: (slug: string) => `/dashboard/wiki/${slug}` as const,
}
```

### New
```ts
wiki: {
  root: '/dashboard/wiki',
  article: (articleId: string) => `/dashboard/wiki/${articleId}` as const,
}
```

**Blast radius:** 26 call sites (see blast-radius audit). Every caller must switch from passing `slug` to passing `article_id`.

---

## 5. Component Prop Changes

### 5.1 `WikiRightSidebar`

**Current:** `articleSlug: string`
**New:** `articleId: string` (already receives `articleId` prop — just remove `articleSlug` usage)

In `WikiRightSidebar.tsx` line 66:
```ts
const url = `${window.location.origin}${ROUTES.wiki.article(articleSlug)}`
```
Change to:
```ts
const url = `${window.location.origin}${ROUTES.wiki.article(articleId)}`
```

### 5.2 `WikiHeader` / `WikiHeaderClient`

**Current:** `articleSlug: string`
**New:** Remove `articleSlug` prop if only used for URL generation. If used for display, keep as metadata.

### 5.3 `WikiArticle`

**Current:** `source_url={\`/dashboard/wiki/${article.slug}\`}`
**New:** `source_url={ROUTES.wiki.article(article.article_id)}`

### 5.4 `WikiReference`

**Current:** Receives `slug` and calls `ROUTES.wiki.article(slug)`.
**New:** Must receive `articleId` and call `ROUTES.wiki.article(articleId)`.

**Investigation needed:** Does `WikiReference` currently have access to `articleId`? If not, prop drilling or context required.

### 5.5 `WikiItemRenderer`

**Current:** `href={\`/dashboard/wiki/${slug}\`}`
**New:** `href={ROUTES.wiki.article(articleId)}`

**Investigation needed:** `WikiItemRenderer` is used inside MDX content. Does the MDX pass `slug` or `articleId`? If MDX content contains hardcoded slug URLs, those are content-level issues outside this migration.

### 5.6 `WikiRelatedPopover` & `WikiLearningJourney`

**Current:** `relatedTopics` = `{ slug: string; title: string }[]`
**New:** `relatedTopics` = `{ articleId: string; title: string }[]` or `{ slug: string; articleId: string; title: string }[]`

The data fetcher `getRelatedTopics(node)` in `page.tsx` must return `article_id` alongside `slug`.

### 5.7 `WikiBookmarks`

**Current:** `ROUTES.wiki.article(b.slug)`
**New:** `ROUTES.wiki.article(b.article_id)`

Assumes bookmark object has `article_id`. Verify in `src/components/wiki/navigation/WikiBookmarks.tsx`.

---

## 6. Data Fetcher Updates

### 6.1 `getArticleSiblings(nodeId)`

**Current:** Returns `{ prev: { name, slug } | null, next: { name, slug } | null }`
**New:** Must return `{ prev: { name, articleId } | null, next: { name, articleId } | null }`

The siblings query currently fetches adjacent taxonomy nodes and their linked articles. It must join `wiki_articles.article_id`.

### 6.2 `getRelatedTopics(node)`

**Current:** Returns `{ title, slug }[]`
**New:** Must return `{ title, articleId }[]` (or include both)

The related topics query filters taxonomy nodes by `parent_id` and `discipline_id`. It currently returns `candidate.slug`. It must join `wiki_article_taxonomy` + `wiki_articles` to get `article_id`.

### 6.3 `searchWikiArticles(query)`

**Current:** Returns `{ article_id, title, slug, snippet, rank }[]`
**New:** Callers must use `article_id` instead of `slug` for URL generation.

No change to the search function itself. Only consumers change.

### 6.4 `getCachedWikiArticles()`

**Current:** Returns `{ article_id, title, slug, excerpt }[]`
**New:** Callers must use `article_id` for URL generation.

No change to the function. Only consumers change.

---

## 7. Admin Flow Updates

### 7.1 Admin preview link

**File:** `src/app/admin/knowledge/[id]/page.tsx` line 75
**Current:** `href={\`/dashboard/wiki/${article.slug}\`}`
**New:** `href={ROUTES.wiki.article(article.article_id)}`

### 7.2 Admin review queue

**File:** `src/components/admin/SMEReviewQueue.tsx` line 158
**Current:** `href={\`/dashboard/wiki/${item.slug}\`}`
**New:** `href={ROUTES.wiki.article(item.article_id)}`

### 7.3 Admin article list

Already uses `ROUTES.admin.article(id)` (ID-based). No change.

---

## 8. Quiz / SRS / Recommendation Updates

### 8.1 `submit-answer.ts`

**Current:** `loadWikiSlug(supabase, topicId)` returns `slug`. Builds `/dashboard/wiki/${wikiSlug}?from=quiz`.
**New:** Change `loadWikiSlug` to `loadWikiArticleId(supabase, topicId)` which returns `article_id`. Build `ROUTES.wiki.article(wikiArticleId)?from=quiz`.

**Implementation:**
```ts
const loadWikiArticleId = async (supabase: any, topicId: string | null) => {
  if (!topicId) return null
  const { data: articleTaxonomy } = await supabase
    .from('wiki_article_taxonomy')
    .select('article_id')
    .eq('node_id', topicId)
    .eq('is_primary', true)
    .maybeSingle()
  return articleTaxonomy?.article_id ?? null
}
```

This is actually simpler than the current `loadWikiSlug` because it skips the second query to `wiki_articles`.

### 8.2 `get-review-data.ts`

**Current:** `wikiMap.set(w.node_id, w.wiki_articles?.slug ? /dashboard/wiki/${w.wiki_articles.slug}?from=quiz : null)`
**New:** `wikiMap.set(w.node_id, w.wiki_articles?.article_id ? ROUTES.wiki.article(w.wiki_articles.article_id) + '?from=quiz' : null)`

### 8.3 `generate-recommendations.ts`

**Current:** `ROUTES.wiki.article(wikiRec.slug)`
**New:** `ROUTES.wiki.article(wikiRec.article_id)`

Verify that `wikiRec` object includes `article_id`.

### 8.4 `SocraticExplorer.tsx`

**Current:** `openWikiPanel(\`/dashboard/wiki/${slug}\`)`
**New:** `openWikiPanel(ROUTES.wiki.article(articleId))`

Verify `articleId` availability.

---

## 9. Dashboard / Search / Discovery Updates

### 9.1 `Omnibar.tsx`

**Current:** `router.push(\`/dashboard/wiki/${item.slug}${highlightParam}\`)`
**New:** `router.push(\`${ROUTES.wiki.article(item.article_id)}${highlightParam}\`)`

### 9.2 `FeatureDiscoveryRow.tsx`

**Current:** `article ? /dashboard/wiki/${article.slug} : '/dashboard/wiki'`
**New:** `article ? ROUTES.wiki.article(article.article_id) : ROUTES.dashboard.wiki`

### 9.3 `SessionsTable.tsx`

**Current:** `/dashboard/wiki/${articleSlug}`
**New:** `ROUTES.wiki.article(articleId)`

Verify `articleId` is available in the session data.

### 9.4 `SourceBadge.tsx`

**Current:** `href={\`/dashboard/wiki/${slug}\`}`
**New:** `ROUTES.wiki.article(articleId)`

Verify `articleId` is available.

---

## 10. 3D Lab Updates

### 10.1 `HotspotAnnotation.tsx` & `InfoPanel.tsx` & `ClassicalOrdersScene.tsx`

**Current:** `wikiSlug?: string` prop / field
**New:** `wikiArticleId?: string` prop / field

**Investigation result:** `wikiSlug` is **not a database column** in `DATABASE_SCHEMA.sql`. It appears to be a local prop in the 3D lab component data. The `ClassicalOrders.tsx` and `ClassicalOrdersScene.tsx` files hardcode `wikiSlug: 'classical-orders-stylobate'` etc.

**Action:** Replace `wikiSlug` with `wikiArticleId` in the 3D lab component interfaces and hardcoded data. Since these are local constants, no database change is needed. However, we need the actual `article_id` values for these articles. If they don't exist yet, we can either:
- Look them up from the database by slug (one-time mapping), or
- Keep `wikiSlug` as a secondary field and add `wikiArticleId` alongside it.

**Decision:** Add `wikiArticleId` alongside `wikiSlug` temporarily, then remove `wikiSlug` once all IDs are confirmed. Or, if the articles exist in the DB, do a one-time lookup.

---

## 11. Code Update Card

**File:** `src/app/dashboard/code-updates/_components/CodeUpdateCard.tsx`
**Current:** `ROUTES.wiki.article(lea_id.toLowerCase().replace(/\s+/g, '-'))`
**New:** Must resolve `lea_id` → `article_id`.

**Options:**
1. Add `article_id` to the code update data model so it's available directly.
2. Query `wiki_articles` by `lea_id` (if `lea_id` is stored) or by generated slug to get `article_id`.

**Decision:** Investigate whether `code_updates` table or related data already has `article_id`. If not, add it to the data fetcher. Avoid runtime slug generation.

---

## 12. Test Updates

### 12.1 `src/app/dashboard/wiki/[articleId]/page.test.tsx`

- Move file from `[slug]` to `[articleId]`.
- Update mock `params` from `{ slug: 'accessible-route-design' }` to `{ articleId: 'article-1' }`.
- Update mock `ROUTES.wiki.article` signature.
- Update `baseArticle` to use a realistic UUID for `article_id`.

### 12.2 `src/lib/__tests__/routes.test.ts`

- `getPageTitle('/dashboard/wiki/some-slug')` → `getPageTitle('/dashboard/wiki/some-uuid')` (still works because prefix-based).
- Add test: `ROUTES.wiki.article('article-123')` returns `/dashboard/wiki/article-123`.

### 12.3 Storybook fixtures

- `src/storybook/fixtures/wiki.ts`: Add `article_id` fields to `wikiHeaderFixture`, `wikiRelatedTopicsFixture`, `wikiBookmarksFixture`, `wikiReferenceArticleFixture`, `wikiSearchResultsFixture`, `wikiSidebarNodesFixture[].articles`.
- `src/storybook/scenes/wiki/WikiArticleScene.stories.tsx`: Update `WikiRightSidebar` prop from `articleSlug` to `articleId`.

---

## 13. Documentation Updates

| File | Update |
|------|--------|
| `src/app/dashboard/wiki/AGENTS.md` | Update `[slug]/` to `[articleId]/` |
| `.ai/00_system/ROUTE_SURFACE_MAP.md` | Update Wiki route entry |
| `.ai/00_performance/wiki-article-id-routing-blast-radius.md` | Already created |
| `.ai/00_performance/wiki-article-id-routing-plan.md` | This file |
| `.ai/00_performance/wiki-admin-id-routing-audit.md` | To be created in Phase 5 |
| `.ai/00_performance/wiki-article-id-routing-report.md` | To be created in Phase 8 |

---

## 14. Rollback Plan

If the migration needs to be reverted:

1. **Route folder:** Rename `[articleId]` back to `[slug]`.
2. **ROUTES.wiki.article:** Revert signature to `(slug: string)`.
3. **Data loaders:** Re-enable `getCachedArticleAndNode(slug)` (still present, just deprecated).
4. **Component props:** Revert `articleId` back to `slug` where applicable.
5. **Admin preview:** Revert to `\`/dashboard/wiki/${article.slug}\``.
6. **Tests:** Revert mocks and fixtures.
7. **No database rollback needed** — schema was not changed.

---

## 15. Implementation Order

To minimize risk and keep verification green at each step:

1. **Add new ID-based resolver** (`resolveArticleAndNodeById`, `getCachedArticleAndNodeById`) — no existing code affected.
2. **Update `ROUTES.wiki.article` signature** — breaks TypeScript at all call sites (intentional, forces updates).
3. **Fix call sites in priority order:**
   a. Wiki article page (`src/app/dashboard/wiki/[articleId]/page.tsx`) — rename folder, update page.
   b. `WikiRightSidebar` — remove `articleSlug` dependency.
   c. `Omnibar` — search results.
   d. `WikiArticle` — `source_url`.
   e. `WikiReference`, `WikiRelatedPopover`, `WikiLearningJourney`, `WikiBookmarks`.
   f. `WikiItemRenderer` — investigate MDX prop contract.
   g. Admin preview link (`admin/knowledge/[id]/page.tsx`).
   h. Admin review queue (`SMEReviewQueue.tsx`).
   i. Quiz flows (`submit-answer.ts`, `get-review-data.ts`, `generate-recommendations.ts`, `SocraticExplorer.tsx`).
   j. Dashboard widgets (`FeatureDiscoveryRow.tsx`, `SessionsTable.tsx`, `SourceBadge.tsx`).
   k. 3D lab (`HotspotAnnotation.tsx`, `InfoPanel.tsx`, `ClassicalOrdersScene.tsx`).
   l. Code update card (`CodeUpdateCard.tsx`).
4. **Update data fetchers** (`getArticleSiblings`, `getRelatedTopics`) to return `article_id`.
5. **Move and update tests** (`page.test.tsx`, `routes.test.ts`).
6. **Update Storybook fixtures**.
7. **Update docs** (`AGENTS.md`, `.ai` docs).
8. **Run verification:** `bun run type-check`, `bun run lint`, `bun test src/`, `bun run build`, `bun run check:storybook`, `bun run build-storybook`.

---

## 16. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| MDX content contains hardcoded slug URLs | Medium | High | Audit `WikiItemRenderer` and MDX content. If found, content is outside code migration scope — flag for content team. |
| `WikiReference` lacks `articleId` prop access | Medium | High | Trace prop drilling. If missing, add to parent component data fetch. |
| 3D lab `wikiSlug` has no matching `article_id` | Low | Medium | Query DB by slug to get IDs. If article doesn't exist, leave as TODO. |
| `CodeUpdateCard` `lea_id` → `article_id` resolution missing | Medium | High | Add `article_id` to code update data fetcher. |
| Quiz `loadWikiSlug` RPC result shape change | Low | High | The RPC currently returns `wiki_slug`. If we switch to `wiki_article_id`, we must update the RPC or bypass it. We will bypass it (use `loadWikiArticleId` instead). |
| Sibling / related topic data missing `article_id` | Medium | High | Update SQL queries in `getArticleSiblings` and `getRelatedTopics` to join `wiki_articles`. |
| Storybook fixtures break | Low | Medium | Update fixtures to include `article_id`. |
| Typecheck fails at `ROUTES.wiki.article` call sites | High | Low | **Intentional** — forces us to fix all callers. |

---

*End of Phase 2 Migration Plan.*
