# Wiki Performance Execution Plan

**Created:** 2026-04-07
**Source:** `.ai/plans/wiki_route_audit_plan.md` (V2.2 Approved)
**Status:** COMPLETE

## Baselines (Step 0)

| Metric | Value |
|--------|-------|
| Published articles | 562 |
| Junction rows (wiki_article_taxonomy) | 562 |
| Taxonomy nodes | 556 |
| Existing slug index | `wiki_articles_slug_key` UNIQUE btree(slug) |
| Existing status index | `idx_wiki_articles_status` btree(status) |
| Existing junction PK | `wiki_article_taxonomy_pkey` btree(article_id, node_id) |
| Existing node_id index | `idx_wiki_article_taxonomy_node_id` btree(node_id) |

**Decision**: Skipped Step 1.1 (slug,status composite) — unique `slug` index already covers Path 1.

## Execution Log

- [x] Step 0: Baselines — 562 articles, indexes audited
- [x] Step 1: Deployed 2 junction indexes (`node_id,is_primary` + `article_id,is_primary`)
- [x] Step 2: Created `get_article_with_node` RPC + updated `resolveArticleAndNode` with RPC-first + fallback
- [x] Step 3: Cache TTLs updated — article: 3600s, taxonomy: 7200s, wiki rotation: unchanged
- [x] Step 4: WikiSidebarLoader switched to `getCachedTaxonomyTreeFull` (new cached wrapper with 2h TTL)
- [x] Step 5: Suspense boundary added around WikiRightSidebar in `[slug]/page.tsx`
- [x] Step 6: `React.cache()` memoization exported for `resolveArticleAndNode`, `getTaxonomyTree`, `getBreadcrumbTrail`
- [x] Step 7: Performance logging added to `resolveArticleAndNode` (RPC + fallback timing)

## Changes Made

### Database (via Supabase MCP)
- Migration: `wiki_junction_indexes` — 2 composite indexes on `wiki_article_taxonomy`
- Migration: `rpc_get_article_with_node` — PL/pgSQL function replacing 2-4 sequential queries

### Files Modified
| File | Changes |
|------|---------|
| `src/lib/actions/wiki-actions.ts` | RPC-first resolution with fallback, `performance.now()` timing, `React.cache()` memoized exports |
| `src/lib/actions/cached-queries.ts` | Import `getTaxonomyTree`, added `getCachedTaxonomyTreeFull` wrapper, TTLs: article→3600, taxonomy→7200 |
| `src/components/wiki/navigation/WikiSidebarLoader.tsx` | Switched from uncached `getTaxonomyTree` to `getCachedTaxonomyTreeFull` |
| `src/app/dashboard/wiki/[slug]/page.tsx` | Suspense boundary around right sidebar |

### Type-check
All pre-existing errors only (lemonsqueezy, test mocks, dev-mode tier). No new errors introduced.
