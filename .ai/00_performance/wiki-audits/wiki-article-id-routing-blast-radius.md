# Wiki Article ID Routing — Blast Radius Audit

> **Date:** 2026-05-04
> **Branch:** `codebase-modernization-batch1-2`
> **Scope:** Migrate Wiki article detail pages from slug-based URLs (`/dashboard/wiki/[slug]`) to article-ID-based URLs (`/dashboard/wiki/[articleId]`).
> **Status:** Phase 1 — Audit complete. Migration executed 2026-05-04.

---

## Executive Summary

The SlateCamp Wiki currently routes article detail pages by **slug** (`/dashboard/wiki/lea-hist-001-03-core-concept`). The goal is to switch to **article ID** (`/dashboard/wiki/{articleId}`). This is a private/authenticated dashboard route, so SEO is not a concern.

**Confirmed article identifier:** `article_id` (UUID) on `wiki_articles` table.

**Critical finding:** The **admin knowledge editor already uses ID-based URLs** (`/admin/knowledge/[id]`). The public Wiki is the only remaining slug-based consumer. This means the codebase already supports ID-based article resolution in admin flows — we are not introducing a new concept, only extending it to the learner-facing Wiki.

**No database migration is required.** The `article_id` UUID primary key already exists, all foreign keys already use `article_id`, and the `slug` column can remain as editable metadata.

---

## 1. Current Wiki Article Routes

| File | Role | Current Param | Notes |
|------|------|---------------|-------|
| `src/app/dashboard/wiki/[slug]/page.tsx` | Article detail page | `slug: string` | Main consumer. Calls `getCachedArticleAndNode(slug)`. |
| `src/app/dashboard/wiki/[slug]/page.test.tsx` | Unit tests for page | `slug: string` | Mocks `getCachedArticleAndNode`. Tests metadata generation. |
| `src/app/dashboard/wiki/layout.tsx` | Wiki layout | — | No slug dependency. |
| `src/app/dashboard/wiki/loading.tsx` | Loading state | — | No slug dependency. |
| `src/app/dashboard/wiki/error.tsx` | Error boundary | — | No slug dependency. |
| `src/app/dashboard/wiki/not-found.tsx` | Not found | — | No slug dependency. |
| `src/app/dashboard/wiki/page.tsx` | Wiki index/list | — | No slug dependency. |

**Observation:** The dynamic segment is literally named `[slug]`. Renaming to `[articleId]` is a folder rename plus param updates.

---

## 2. Current Data Loading

### 2.1 Server Components / Actions

| Function | File | Current Lookup | Supports ID? |
|----------|------|----------------|--------------|
| `getCachedArticleAndNode(slug)` | `src/lib/actions/cached-queries.ts` | Calls `resolveArticleAndNode(slug)` | **No** — slug-only. |
| `resolveArticleAndNode(slug)` | `src/lib/actions/wiki-actions.ts` | RPC `get_article_with_node(p_slug)` + fallback queries by `slug` | **No** — slug-only. |
| `getWikiArticleBySlug(slug)` | `src/lib/actions/wiki-actions.ts` | `.eq("slug", slug)` | **No** — slug-only. |
| `getWikiArticleByTaxonomySlug(taxonomySlug)` | `src/lib/actions/wiki-actions.ts` | Looks up node by `taxonomy_tree.slug`, then resolves article by `article_id` | Uses `article_id` internally after slug→node resolution. |
| `getArticleSources(articleId)` | `src/lib/actions/wiki-actions.ts` | `.eq("article_id", articleId)` | **Yes** — already ID-based. |
| `getArticleSiblings(nodeId)` | `src/lib/actions/wiki-actions.ts` | Uses `node_id` | **Yes** — node-based, returns `{prev, next}` with `.slug`. |
| `searchWikiArticles(query)` | `src/lib/actions/wiki-actions.ts` | RPC `search_wiki_articles_pure` or fallback `.ilike` on title/content; returns `article_id, title, slug` | Returns both `article_id` and `slug`. |

### 2.2 RPC Function

| Function | File | Behavior |
|----------|------|----------|
| `get_article_with_node(p_slug text)` | `supabase/migrations/20260407_rpc_get_article_with_node.sql` | Single-roundtrip resolution by `wiki_articles.slug` or `taxonomy_tree.slug`. Returns `{article, node}`. |

**Implication:** The RPC is slug-centric. For ID-based routing, we either:
- Add a new RPC `get_article_with_node_by_id(p_article_id uuid)`, or
- Bypass the RPC and query directly by `article_id` (simpler, since ID lookup is a single `.eq("article_id", id).single()`).

---

## 3. Current Admin Flows

| Route / File | Current Param | Behavior |
|--------------|---------------|----------|
| `src/app/admin/knowledge/page.tsx` | — | Article list. Links to `ROUTES.admin.article(id)` (ID-based). |
| `src/app/admin/knowledge/[id]/page.tsx` | `id: string` | **Already ID-based.** Loads article via `getArticleFull(id)`. |
| `src/app/admin/knowledge/_components/ArticleDetailClient.tsx` | — | Client editor. Receives `article` object with `article_id` and `slug`. |
| `src/lib/actions/admin/content.ts` | — | `getArticleFull(id)`, `getQuestionsByArticleId(articleId)`, etc. All ID-based. |

**Critical observation:** The admin editor has a hardcoded slug-based preview link:
```tsx
href={`/dashboard/wiki/${article.slug}`}
```
This is in `src/app/admin/knowledge/[id]/page.tsx` line 75. **This must change to use `article_id`.**

---

## 4. Current Link Generation — Full Inventory

### 4.1 `ROUTES.wiki.article(slug)` consumers (26 matches)

| File | Line | Usage | Risk |
|------|------|-------|------|
| `src/lib/routes.ts` | 140 | **Definition:** `article: (slug: string) => /dashboard/wiki/${slug}` | **Critical** — single source of truth. Must change signature to `article: (articleId: string)`. |
| `src/app/dashboard/wiki/[slug]/page.tsx` | 279 | `ROUTES.wiki.article(siblings.prev.slug \|\| '')` | High — prev/next navigation. |
| `src/app/dashboard/wiki/[slug]/page.tsx` | 288 | `ROUTES.wiki.article(siblings.next.slug \|\| '')` | High — prev/next navigation. |
| `src/components/wiki/shared/WikiReference.tsx` | 105 | `ROUTES.wiki.article(slug)` | High — article reference links. |
| `src/components/wiki/shared/WikiReference.tsx` | 121 | `${ROUTES.wiki.article(slug)}?minimal=true` | High — iframe embed source. |
| `src/components/wiki/navigation/WikiRightSidebar.tsx` | 66 | `${window.location.origin}${ROUTES.wiki.article(articleSlug)}` | High — share/copy URL. |
| `src/components/wiki/shared/WikiRelatedPopover.tsx` | 105 | `ROUTES.wiki.article(topic.slug)` | High — related topic links. |
| `src/components/wiki/navigation/WikiBookmarks.tsx` | 141 | `ROUTES.wiki.article(b.slug)` | High — bookmark links. |
| `src/components/wiki/article/WikiArticle.tsx` | 315 | `source_url={/dashboard/wiki/${article.slug}}` | High — article self-reference (likely for metadata/SEO). |
| `src/components/wiki/article/WikiItemRenderer.tsx` | 131 | `href={/dashboard/wiki/${slug}}` | High — inline article links from MDX content. |
| `src/components/wiki/article/WikiLearningJourney.tsx` | 171 | `href={/dashboard/wiki/${topic.slug}}` | High — learning journey related topics. |
| `src/components/shared/Omnibar.tsx` | 82 | `router.push(/dashboard/wiki/${item.slug}${highlightParam})` | **Critical** — search result navigation. |
| `src/components/dashboard/FeatureDiscoveryRow.tsx` | 68 | `article ? /dashboard/wiki/${article.slug} : '/dashboard/wiki'` | High — dashboard featured article. |
| `src/components/testing/hub/SessionsTable.tsx` | 139 | `/dashboard/wiki/${articleSlug}` | Medium — test session table links. |
| `src/components/shared/SourceBadge.tsx` | 48 | `href={/dashboard/wiki/${slug}}` | Medium — source badge links. |
| `src/components/admin/SMEReviewQueue.tsx` | 158 | `href={/dashboard/wiki/${item.slug}}` | High — admin review queue links to public article. |
| `src/app/admin/knowledge/[id]/page.tsx` | 75 | `href={/dashboard/wiki/${article.slug}}` | High — admin preview link. |
| `src/app/dashboard/code-updates/_components/CodeUpdateCard.tsx` | 67 | `ROUTES.wiki.article(lea_id.toLowerCase().replace(/\s+/g, '-'))` | **Critical** — constructs slug from `lea_id`. Must switch to `article_id`. |
| `src/lib/actions/quiz-v2/generate-recommendations.ts` | 214 | `ROUTES.wiki.article(wikiRec.slug)` | High — quiz recommendations. |
| `src/lib/actions/quiz-v2/submit-answer.ts` | 291 | `/dashboard/wiki/${wikiSlug}?from=quiz` | High — post-quiz wiki redirect. |
| `src/lib/actions/quiz-v2/get-review-data.ts` | 118 | `wikiMap.set(w.node_id, w.wiki_articles?.slug ? /dashboard/wiki/${w.wiki_articles.slug}?from=quiz : null)` | High — review data wiki links. |
| `src/components/quiz-v2/SocraticExplorer.tsx` | 64 | `openWikiPanel(/dashboard/wiki/${slug})` | High — quiz socratic explorer. |
| `src/features/3d-lab/components/templates/HotspotAnnotation.tsx` | 45 | `codeRef: hotspot.wikiSlug ? /dashboard/wiki/${hotspot.wikiSlug} : undefined` | Medium — 3D lab hotspot links. |
| `src/features/3d-lab/components/templates/InfoPanel.tsx` | 67 | `href={/dashboard/wiki/${content.wikiSlug}}` | Medium — 3D lab info panel links. |
| `src/features/3d-lab/scenes/ClassicalOrders/ClassicalOrdersScene.tsx` | 169 | `codeRef: hotspot.wikiSlug ? /dashboard/wiki/${hotspot.wikiSlug} : undefined` | Medium — 3D lab scene links. |
| `src/app/dashboard/wiki/[slug]/page.test.tsx` | 79 | Mock: `wiki: { article: (slug: string) => /dashboard/wiki/${slug} }` | High — test mock must update. |
| `src/lib/__tests__/routes.test.ts` | 69 | `getPageTitle('/dashboard/wiki/some-slug')` | Low — page title test. |

### 4.2 Dynamic Title Prefixes

In `src/lib/routes.ts` line 416:
```ts
{ prefix: '/dashboard/wiki/', title: 'Knowledge Wiki' }
```
This is prefix-based and does not care whether the suffix is slug or ID. **No change needed.**

---

## 5. Current Schema / Types

### 5.1 TypeScript Types

| Type | File | Fields |
|------|------|--------|
| `WikiArticle` | `src/types/app.ts` | `article_id: string; slug: string; title: string; content: string; ...` |
| `WikiArticle` (alias) | `src/types/app.ts` | Same as above. |
| `WikiArticleHeroProps` | `src/types/wiki.ts` | No ID/slug fields. |
| `WikiMistakeProps` | `src/types/wiki.ts` | No ID/slug fields. |

**Observation:** `WikiArticle` already carries `article_id`. No type change needed for the article object itself. Only consumers that currently pass `slug` to `ROUTES.wiki.article()` need to switch to passing `article_id`.

### 5.2 Supabase Schema (from `DATABASE_SCHEMA.sql`)

```sql
CREATE TABLE wiki_articles (
  article_id  UUID NOT NULL DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  slug        TEXT NOT NULL,
  content     TEXT NOT NULL,
  ...
);
```

**Primary key:** `article_id` (UUID) — confirmed by migration files and foreign key references.

**`slug` column:** `TEXT NOT NULL` — used for routing today. Will become metadata-only after migration.

**Foreign keys using `article_id`:**
- `wiki_article_sources.article_id`
- `wiki_article_taxonomy.article_id`
- `wiki_article_reads.article_id`
- `wiki_bookmarks.article_id`
- `wiki_highlights.article_id`
- `wiki_ei_prompts.article_id`
- `questions.article_id` (added in migration `20260331_add_article_id_to_questions.sql`)
- `admin_draft_previews.article_id`

**All related tables already use `article_id`.** No FK migration needed.

### 5.3 RLS Policies

No RLS policy in the schema file or migrations filters by `slug`. Policies filter by `user_id` or are public-read for published articles. Switching from `slug` to `article_id` in queries does **not** affect RLS.

---

## 6. Current Database Assumptions

| Assumption | Status | Impact |
|------------|--------|--------|
| `article_id` is UUID PK | **Confirmed** | Safe to use in URLs. |
| `slug` is `TEXT NOT NULL` | **Confirmed** | Remains editable metadata. |
| `slug` is unique? | **Unconfirmed in schema** | Need to verify. If not unique, ID routing is even more justified. |
| All FKs use `article_id` | **Confirmed** | No migration needed. |
| `get_article_with_node` RPC uses slug | **Confirmed** | Need new RPC or bypass it for ID lookup. |
| `search_wiki_articles_pure` RPC returns `article_id` + `slug` | **Confirmed** | Search results already have `article_id` available. |

---

## 7. Current Tests and Storybook

| File | Slug Dependency | Needs Update? |
|------|-----------------|---------------|
| `src/app/dashboard/wiki/[slug]/page.test.tsx` | Mocks `getCachedArticleAndNode` with `slug` param; mocks `ROUTES.wiki.article(slug)` | **Yes** — update param name and mock. |
| `src/lib/__tests__/routes.test.ts` | Tests `getPageTitle('/dashboard/wiki/some-slug')` | **No** — prefix-based, works with any suffix. |
| `src/storybook/scenes/wiki/WikiArticleScene.stories.tsx` | Uses `wikiHeaderFixture.articleSlug` | **Yes** — fixture still works but `WikiRightSidebar` receives `articleSlug` prop. |
| `src/storybook/fixtures/wiki.ts` | Fixtures use `slug` for URLs (`wikiHeaderFixture.articleSlug`, `wikiRelatedTopicsFixture[].slug`, etc.) | **Yes** — add `article_id` to fixtures where missing; update URL-building consumers. |
| `src/storybook/mocks/wiki.ts` | Unknown — need to inspect. | Likely yes. |

---

## 8. Current Docs

| Doc | Wiki Slug Mention? | Needs Update? |
|-----|--------------------|---------------|
| `src/app/dashboard/wiki/AGENTS.md` | Mentions `[slug]/` directory | **Yes** — update to `[articleId]/`. |
| `src/app/admin/AGENTS.md` | Mentions admin knowledge routes | No — already ID-based. |
| `.ai/00_system/ROUTE_SURFACE_MAP.md` | Unknown — need to inspect. | Likely yes. |
| `.ai/00_system/VALIDATION_MATRIX.md` | Unknown — need to inspect. | Likely yes. |
| `.ai/02_audits/ADMIN_SURFACE_AUDIT.md` | Admin audit | No — admin already uses IDs. |
| `.ai/03_plans/ADMIN_SURFACE_PLAN.md` | Admin plan | No — admin already uses IDs. |

---

## 9. Affected Files Summary Table

| # | File Path | Current Slug Dependency | Proposed Replacement | Risk | Behavior Change? | DB Change? | Tests? |
|---|-----------|------------------------|----------------------|------|-------------------|------------|--------|
| 1 | `src/app/dashboard/wiki/[slug]/page.tsx` | `params.slug`, `getCachedArticleAndNode(slug)`, `ROUTES.wiki.article(siblings.*.slug)` | `params.articleId`, `getCachedArticleAndNode(articleId)`, `ROUTES.wiki.article(siblings.*.article_id)` | High | Yes — param name | No | Yes |
| 2 | `src/app/dashboard/wiki/[slug]/page.test.tsx` | Mock `params.slug`, mock `ROUTES.wiki.article(slug)` | `params.articleId`, mock `ROUTES.wiki.article(articleId)` | High | Yes — test contract | No | Yes |
| 3 | `src/lib/routes.ts` | `ROUTES.wiki.article(slug: string)` | `ROUTES.wiki.article(articleId: string)` | **Critical** | Yes — all callers | No | Yes |
| 4 | `src/lib/actions/cached-queries.ts` | `getCachedArticleAndNode(slug: string)` | `getCachedArticleAndNode(articleId: string)` | High | Yes — signature | No | Yes |
| 5 | `src/lib/actions/wiki-actions.ts` | `resolveArticleAndNode(slug)`, `getWikiArticleBySlug(slug)`, `getActiveTaxonomyNode(slug)` | Add `resolveArticleAndNodeById(articleId)`, keep slug functions for fallback if needed | High | Yes — new function | No | Yes |
| 6 | `src/components/wiki/navigation/WikiRightSidebar.tsx` | `articleSlug` prop, `ROUTES.wiki.article(articleSlug)` | `articleId` prop, `ROUTES.wiki.article(articleId)` | High | Yes — prop contract | No | Yes |
| 7 | `src/components/wiki/article/WikiArticle.tsx` | `source_url={/dashboard/wiki/${article.slug}}` | `source_url={ROUTES.wiki.article(article.article_id)}` | High | Yes — URL | No | Yes |
| 8 | `src/components/wiki/shared/WikiReference.tsx` | `ROUTES.wiki.article(slug)` | `ROUTES.wiki.article(articleId)` | High | Yes — needs `articleId` passed in | No | Yes |
| 9 | `src/components/wiki/shared/WikiRelatedPopover.tsx` | `ROUTES.wiki.article(topic.slug)` | `ROUTES.wiki.article(topic.article_id)` — but `topic` may not have `article_id` | High | Yes — data contract | No | Yes |
| 10 | `src/components/wiki/navigation/WikiBookmarks.tsx` | `ROUTES.wiki.article(b.slug)` | `ROUTES.wiki.article(b.article_id)` | High | Yes — assumes bookmark has `article_id` | No | Yes |
| 11 | `src/components/wiki/article/WikiItemRenderer.tsx` | `href={/dashboard/wiki/${slug}}` | `href={ROUTES.wiki.article(articleId)}` — but renderer may not have `articleId` | High | Yes — prop drilling | No | Yes |
| 12 | `src/components/wiki/article/WikiLearningJourney.tsx` | `href={/dashboard/wiki/${topic.slug}}` | `href={ROUTES.wiki.article(topic.article_id)}` | High | Yes — data contract | No | Yes |
| 13 | `src/components/shared/Omnibar.tsx` | `router.push(/dashboard/wiki/${item.slug})` | `router.push(ROUTES.wiki.article(item.article_id))` | **Critical** | Yes — search UX | No | Yes |
| 14 | `src/components/dashboard/FeatureDiscoveryRow.tsx` | `/dashboard/wiki/${article.slug}` | `ROUTES.wiki.article(article.article_id)` | High | Yes — dashboard link | No | Yes |
| 15 | `src/components/testing/hub/SessionsTable.tsx` | `/dashboard/wiki/${articleSlug}` | `ROUTES.wiki.article(articleId)` | Medium | Yes — needs `articleId` available | No | Yes |
| 16 | `src/components/shared/SourceBadge.tsx` | `href={/dashboard/wiki/${slug}}` | `ROUTES.wiki.article(articleId)` | Medium | Yes — needs `articleId` | No | Yes |
| 17 | `src/components/admin/SMEReviewQueue.tsx` | `href={/dashboard/wiki/${item.slug}}` | `ROUTES.wiki.article(item.article_id)` | High | Yes — admin→public link | No | Yes |
| 18 | `src/app/admin/knowledge/[id]/page.tsx` | `href={/dashboard/wiki/${article.slug}}` | `ROUTES.wiki.article(article.article_id)` | High | Yes — admin preview | No | Yes |
| 19 | `src/app/dashboard/code-updates/_components/CodeUpdateCard.tsx` | `ROUTES.wiki.article(lea_id...slugified)` | Must resolve `lea_id` → `article_id` first | **Critical** | Yes — lookup logic | No | Yes |
| 20 | `src/lib/actions/quiz-v2/generate-recommendations.ts` | `ROUTES.wiki.article(wikiRec.slug)` | `ROUTES.wiki.article(wikiRec.article_id)` | High | Yes — needs `article_id` in rec | No | Yes |
| 21 | `src/lib/actions/quiz-v2/submit-answer.ts` | `/dashboard/wiki/${wikiSlug}?from=quiz` | `ROUTES.wiki.article(wikiArticleId)?from=quiz` | High | Yes — needs `articleId` | No | Yes |
| 22 | `src/lib/actions/quiz-v2/get-review-data.ts` | `/dashboard/wiki/${w.wiki_articles.slug}?from=quiz` | `ROUTES.wiki.article(w.wiki_articles.article_id)?from=quiz` | High | Yes — data shape | No | Yes |
| 23 | `src/components/quiz-v2/SocraticExplorer.tsx` | `openWikiPanel(/dashboard/wiki/${slug})` | `openWikiPanel(ROUTES.wiki.article(articleId))` | High | Yes — needs `articleId` | No | Yes |
| 24 | `src/features/3d-lab/components/templates/HotspotAnnotation.tsx` | `hotspot.wikiSlug` | `hotspot.wikiArticleId` — schema change? | Medium | Yes — data contract | **Maybe** — if `wikiSlug` is DB column |
| 25 | `src/features/3d-lab/components/templates/InfoPanel.tsx` | `content.wikiSlug` | `content.wikiArticleId` — schema change? | Medium | Yes — data contract | **Maybe** — if `wikiSlug` is DB column |
| 26 | `src/features/3d-lab/scenes/ClassicalOrders/ClassicalOrdersScene.tsx` | `hotspot.wikiSlug` | `hotspot.wikiArticleId` | Medium | Yes — data contract | **Maybe** |
| 27 | `src/storybook/fixtures/wiki.ts` | `articleSlug`, `slug` in fixtures | Add `article_id` fields, update URL builders | Medium | Yes — fixtures | No | Yes |
| 28 | `src/storybook/scenes/wiki/WikiArticleScene.stories.tsx` | `articleSlug={wikiHeaderFixture.articleSlug}` | `articleId={wikiHeaderFixture.articleId}` | Medium | Yes — story props | No | Yes |
| 29 | `src/app/dashboard/wiki/AGENTS.md` | `[slug]/` | `[articleId]/` | Low | No — docs only | No | No |
| 30 | `.ai/00_system/ROUTE_SURFACE_MAP.md` | May mention slug routes | Update to ID routes | Low | No — docs only | No | No |

---

## 10. Blocking Issues Discovered

1. **3D Lab `wikiSlug` fields:** `HotspotAnnotation`, `InfoPanel`, and `ClassicalOrdersScene` reference `hotspot.wikiSlug` and `content.wikiSlug`. If these are database columns on `3d_lab_hotspots` or similar tables, switching to `wikiArticleId` requires a **database migration** for the 3D lab tables. If they are local/config data, only code changes are needed. **Investigation required.**

2. **`CodeUpdateCard` slug-from-`lea_id`:** The component constructs a slug by lowercasing/replacing `lea_id`. This implies `lea_id` maps 1:1 to slug. For ID routing, we need either:
   - A lookup from `lea_id` → `article_id`, or
   - The `article_id` to be available alongside `lea_id` in the code update data.

3. **`WikiItemRenderer` inline links:** The renderer builds `href={/dashboard/wiki/${slug}}` from MDX content. If the MDX content contains raw slug-based URLs, those will break. However, `WikiItemRenderer` appears to receive `slug` as a prop and build the URL dynamically — if we change the prop to `articleId`, all MDX instances that pass `slug` must be updated to pass `articleId`. This is a **content-level audit** question: how many MDX blocks pass `slug` to `WikiItemRenderer`?

4. **`WikiRelatedPopover` / `WikiLearningJourney` / siblings:** These receive `relatedTopics` or `siblings` objects that currently contain `{ slug, title }` or `{ slug, name }`. The data fetchers (`getRelatedTopics`, `getArticleSiblings`) must be updated to return `article_id` alongside (or instead of) `slug`.

---

## 11. Article ID Confirmation

| Property | Value | Evidence |
|----------|-------|----------|
| Table name | `wiki_articles` | `DATABASE_SCHEMA.sql` line 240 |
| Primary key column | `article_id` | `DATABASE_SCHEMA.sql` line 241; used as FK in 8+ tables |
| Column type | `UUID` | `DATABASE_SCHEMA.sql` line 241 |
| Slug column | `slug` | `DATABASE_SCHEMA.sql` line 243 |
| Slug unique? | Unknown | Not declared in schema snapshot; likely unique in practice but not enforced at schema level in the snapshot |
| Human-readable code | `slug` | The `slug` is human-readable (e.g., `lea-hist-001-03-core-concept`) |
| Admin uses | `article_id` | `src/app/admin/knowledge/[id]/page.tsx` |
| Public Wiki uses | `slug` | `src/app/dashboard/wiki/[slug]/page.tsx` |

---

## 12. No-Migration Rationale

A database migration is **not required** because:
1. `wiki_articles.article_id` already exists as the UUID primary key.
2. All foreign key relationships (`wiki_article_sources`, `wiki_article_taxonomy`, `wiki_article_reads`, `wiki_bookmarks`, `wiki_highlights`, `wiki_ei_prompts`, `questions`, `admin_draft_previews`) already reference `article_id`.
3. The `slug` column can remain in the database as editable metadata.
4. No RLS policy depends on `slug` for filtering.
5. The admin editor already queries by `article_id` successfully.

The only potential migration is for **3D lab tables** if they store `wikiSlug` as a column and we want to add `wikiArticleId`. This is optional and can be deferred.

---

## 13. Recommended Migration Strategy

Based on the audit, **Strategy A (Hard migration to ID route)** is preferred because:
- This is a **private/authenticated** route — no SEO concern.
- `article_id` is a **UUID** — easily distinguishable from slugs, so no ambiguous resolver needed.
- The **admin already uses ID-based URLs** — the pattern is established.
- Old slug URLs will 404, but since this is a private dashboard, users rely on navigation (links, search) rather than bookmarks. If bookmarks are a concern, a temporary **Strategy B fallback** (slug→ID redirect) can be added as a thin middleware or catch-all route.

**Proposed route:**
```
/dashboard/wiki/[articleId]
```

**Proposed param name:** `articleId` (consistent with admin `[id]` but more explicit).

---

## 14. Next Steps (Phase 2 — Plan)

1. Write `wiki-article-id-routing-plan.md` documenting:
   - Selected strategy (A with optional B fallback)
   - Route rename: `[slug]` → `[articleId]`
   - `ROUTES.wiki.article(slug)` → `ROUTES.wiki.article(articleId)`
   - New data loader: `getCachedArticleAndNodeById(articleId)`
   - Component prop updates (WikiRightSidebar, WikiArticle, WikiReference, etc.)
   - Data fetcher updates (siblings, related topics, search results)
   - Admin preview link fix
   - 3D lab `wikiSlug` investigation
   - `CodeUpdateCard` `lea_id` → `article_id` resolution
   - Test and Storybook updates
   - Rollback plan

2. Investigate 3D lab database columns for `wikiSlug`.

3. Investigate `WikiItemRenderer` MDX content for slug usage.

4. Verify `slug` uniqueness in production (optional but recommended).

---

*End of Phase 1 Blast Radius Audit.*

---

## Post-Migration Final State (added 2026-05-04)

### Canonical route contract

| Element | Value |
|---------|-------|
| Route directory | `src/app/dashboard/wiki/[articleId]/` |
| Route helper | `ROUTES.wiki.article(articleId: string)` |
| Article lookup | `resolveArticleAndNodeById(articleId)` and `getCachedArticleAndNodeById(articleId)` |
| Database ID column | `wiki_articles.article_id` (UUID PK) |
| Slug status | Retained as metadata only; not used for routing |
| RPC change | `submit_quiz_answer_v2` returns `wiki_article_id` instead of `wiki_slug` |
| Deprecated fallbacks | `resolveArticleAndNode` and `getCachedArticleAndNode` kept for compatibility |

### Files modified: 44 files, +1209 / -5117 lines

### Verification: type-check PASS, lint PASS, 714 tests PASS, build PASS, storybook-check PASS, storybook-build FAIL (pre-existing Node abort trap)

### Remaining slug usages (acceptable): display/search metadata, deprecated fallback resolvers, database column, 3D-lab fallback with TODOs, storybook visual labels
