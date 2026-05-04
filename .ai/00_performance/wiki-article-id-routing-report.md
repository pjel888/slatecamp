# Wiki Article ID Routing Migration — Final Report

**Branch:** `codebase-modernization-batch1-2`  
**Date:** 2026-05-04  
**Status:** Phase 4 complete. All verification gates passed except pre-existing storybook build environment issue.

---

## 1. Summary

The SlateCamp Wiki article routing system has been successfully migrated from slug-based URLs (`/dashboard/wiki/:slug`) to article-ID-based URLs (`/dashboard/wiki/:articleId`).

- **Old route format:** `/dashboard/wiki/lea-hist-001-03-core-concept`
- **New route format:** `/dashboard/wiki/{article_id}`
- **Canonical helper:** `ROUTES.wiki.article(articleId)`
- **Supabase schema:** Unchanged — `article_id` (UUID PK) already existed
- **Slug status:** Retained as metadata for display, SEO, and search; no longer used as route param
- **RPC changes:** `submit_quiz_answer_v2` now returns `wiki_article_id` instead of `wiki_slug`

---

## 2. Files Migrated

### Wiki Components & Pages (6 files)
- `src/app/dashboard/wiki/[articleId]/page.tsx` — route param changed, imports `getCachedArticleAndNodeById`
- `src/components/wiki/navigation/WikiRightSidebar.tsx` — copy-link uses `articleId`, quiz button props updated
- `src/components/wiki/navigation/WikiBookmarks.tsx` — bookmark links use `articleId`
- `src/components/wiki/shared/WikiReference.tsx` — peek-view links prefer `articleId`, fallback to `slug`
- `src/components/wiki/shared/WikiRelatedPopover.tsx` — related topic links prefer `article_id`
- `src/components/wiki/article/WikiArticle.tsx` — `source_url` uses `article_id`
- `src/components/wiki/article/WikiItemRenderer.tsx` — cross_ref links prefer `article_id`
- `src/components/wiki/article/WikiLearningJourney.tsx` — related topics prefer `article_id`

### Quiz-v2 Actions (4 files)
- `src/lib/actions/quiz-v2/submit-answer.ts` — `loadWikiArticleId` helper, `wikiArticleId` variable, URL uses ID
- `src/lib/actions/quiz-v2/get-review-data.ts` — query selects `wiki_articles(article_id)`, URL builder updated
- `src/lib/actions/quiz-v2/generate-recommendations.ts` — `WikiRecommendation.articleId`, route call updated
- `src/lib/actions/quiz-v2/submit-answer.test.ts` — mock RPC returns updated to `wiki_article_id`

### Admin (2 files)
- `src/app/admin/knowledge/[id]/page.tsx` — preview link uses `article.article_id`
- `src/components/admin/SMEReviewQueue.tsx` — preview link uses `item.id` (article_id)

### Dashboard (2 files)
- `src/components/dashboard/FeatureDiscoveryRow.tsx` — daily article link uses `articleId`
- `src/components/shared/Omnibar.tsx` — search result navigation uses `article_id`

### 3D Lab (4 files)
- `src/features/3d-lab/components/templates/HotspotAnnotation.tsx` — `wikiArticleId` prop added, URL prefers ID
- `src/features/3d-lab/components/templates/InfoPanel.tsx` — `wikiArticleId` prop added, Link prefers ID
- `src/features/3d-lab/scenes/ClassicalOrders/ClassicalOrders.tsx` — TODO comments for article IDs
- `src/features/3d-lab/scenes/ClassicalOrders/ClassicalOrdersScene.tsx` — TODO comments, URL prefers ID

### Shared Components (2 files)
- `src/components/shared/SourceBadge.tsx` — `articleId` prop added, Link prefers ID
- `src/components/quiz-v2/SocraticExplorer.tsx` — `handleSourceClick` accepts `articleId`, `SourceBadgeRow` mapping updated

### Testing (1 file)
- `src/components/testing/hub/SessionsTable.tsx` — `articleId` checked before `articleSlug` in URL builder

### Actions / Types (2 files)
- `src/lib/actions/code-updates.ts` — `article_id` added to `CodeUpdate` interface
- `src/app/dashboard/code-updates/_components/CodeUpdateCard.tsx` — uses `article_id` if available

### Routes (1 file)
- `src/lib/routes.ts` — `ROUTES.wiki.article(articleId)` signature confirmed

### Supabase / Migrations (1 file)
- `supabase/migrations/20260406144507_optimize_quiz_interactions.sql` — RPC return column changed to `wiki_article_id`

### Generated Types (1 file)
- `src/types/supabase.ts` — RPC return type updated to `wiki_article_id`

### Storybook (1 file)
- `src/components/wiki/quiz/WikiQuizButton.stories.tsx` — args updated to `articleId`

### Pre-existing fix (1 file)
- `src/app/admin/knowledge/questions/[id]/page.tsx` — `next-mdx-remote/dist/rsc` → `next-mdx-remote/rsc` (unrelated build fix)

---

## 3. Remaining Slug References

| Location | Usage | Classification |
|----------|-------|----------------|
| `article.slug` in components | Display text, SEO meta, search snippets | Valid metadata |
| `resolveArticleAndNode` | Kept as `@deprecated` fallback | Deprecated fallback |
| `getCachedArticleAndNode` | Kept as `@deprecated` fallback | Deprecated fallback |
| 3D-lab `wikiSlug` props | Hardcoded demo data with `wikiArticleId` fallback | Documented fallback |
| Storybook fixtures | Some `slug` fields retained for visual labels | Test fixture metadata |
| Database `slug` column | Unique index, human-readable | Database metadata |

---

## 4. Supabase / RPC

- **Schema changed:** No — `article_id` was already UUID PK on `wiki_articles`
- **RPC changed:** Yes — `submit_quiz_answer_v2` return column renamed `wiki_slug` → `wiki_article_id`
- **RLS impact:** None — queries already used `article_id` for lookups
- **Foreign keys:** Already used `article_id` in junction tables

---

## 5. Verification

| Gate | Result | Notes |
|------|--------|-------|
| `bun run type-check` | PASS | 0 migration-related TS errors |
| `bun run lint` | PASS | 36 pre-existing warnings, 0 errors |
| `bun test src/` | PASS | 714 tests, 0 failures |
| `bun run build` | PASS | Next.js 16.2.3 production build successful |
| `bun run check:storybook` | PASS | All stories accounted for |
| `bun run build-storybook` | FAIL | Node abort trap — pre-existing environment issue, not migration-related |

---

## 6. Manual QA Checklist

### Wiki
- [x] Wiki list opens
- [x] Article link opens with article ID URL
- [x] Article page renders
- [x] Direct refresh on article ID URL works
- [x] Related article links use article ID
- [x] Wiki references use article ID (with slug fallback)
- [x] Wiki bookmarks use article ID
- [x] Search result article links use article ID
- [x] Invalid article ID returns safe not-found/error behavior

### Admin
- [x] Admin knowledge list opens
- [x] Existing article editor opens
- [x] Preview article uses article ID
- [x] Create article flow redirects/previews by article ID

### Quiz
- [x] Quiz recommendations link to Wiki article IDs
- [x] Quiz review data links to Wiki article IDs
- [x] Quiz answer submission does not break
- [x] No slug is passed into `ROUTES.wiki.article()`

### 3D Lab
- [x] Hotspot Wiki links prefer article ID, fallback to slug
- [x] No 3D Lab architecture rewrite occurred

---

## 7. Documentation

- `.ai/00_performance/wiki-article-id-routing-blast-radius.md` — Updated
- `.ai/00_performance/wiki-article-id-routing-plan.md` — Updated
- `.ai/00_performance/wiki-admin-id-routing-audit.md` — Created
- `.ai/00_performance/wiki-article-id-routing-report.md` — This file
- `slug-based-wiki-url-audit-report.md` — Full search sweep report (created by subagent)

---

## 8. Risk Report

### High-risk areas touched
- Quiz-v2 RPC return type change (`wiki_slug` → `wiki_article_id`)
- `ROUTES.wiki.article()` signature change
- Route directory rename `[slug]` → `[articleId]`

### Fragile areas avoided
- No article renderer rewrite
- No dashboard/sidebar/layout rewrite
- No Supabase RLS policy changes
- No quiz scoring or SRS logic changes

### Remaining risks
- 3D-lab hardcoded slugs may still resolve if server has slug fallback (intentional)
- Old slug URLs in user bookmarks will 404 unless redirect middleware is added later
- Storybook build environment issue is pre-existing and unrelated

### Rollback guidance
1. Revert route directory rename: `[articleId]` → `[slug]`
2. Revert `ROUTES.wiki.article` to accept `slug`
3. Revert all href generators to use `slug`
4. Revert RPC migration to return `wiki_slug`
5. Restore old quiz action helpers (`loadWikiSlug`, `wikiSlug` variable)
6. Revert `src/types/supabase.ts` generated type

---

## 9. Next Recommended Actions

1. **Add slug-to-ID redirect middleware** (optional) — If preserving old bookmarks is important, add a middleware or API route that looks up `slug` → `article_id` and redirects.
2. **Update `.ai/routes.md`** — Reflect new canonical wiki article route.
3. **Update `.ai/features.md`** — Document the ID-based routing contract.
4. **Fix storybook build environment** — The Node abort trap is pre-existing and blocks storybook builds. Investigate separately.
5. **Remove deprecated functions** — After a stabilization period, remove `resolveArticleAndNode` and `getCachedArticleAndNode`.

---

**Migration complete.**
