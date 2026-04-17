# RALPLAN-DR

## Principles
1. **Evidence over intuition.** Every finding must cite a verified `file:line`. No "feels slow" claims.
2. **Correctness before speed.** State-integrity bugs (mirror-prop races, fetch-churn loops) ship in Phase 1 before cache tuning.
3. **Minimum blast radius.** Prefer surgical edits inside existing components over rewrites. The 735-line `ContentEditorIndex` is untouchable wholesale in this pass.
4. **Wiki is the benchmark, not a modification target.** `/dashboard/wiki/[slug]` defines the parity bar; we inherit patterns, we do not reshape it.
5. **Identity-lock respected.** `SlideToSubmit.tsx` and anything in `.ai/rules/identity_preservation_lock.md` is out of scope.

## Decision Drivers
1. **User-visible latency on `/admin/knowledge` and `/admin/knowledge/questions` after any mutation.** Every save / delete currently causes a full-page server refetch plus a client-side `getQuestionsByTopicIds` re-run.
2. **Confirmed data-integrity risk.** The `localArticles` mirror pattern can clobber optimistic updates with stale server data; the `selectedArticleIds` Set can outlive the articles it references.
3. **Cost of future regressions.** Current fragile patterns (useCallback-inside-useEffect, prop-mirrored-state, uncached detail fetches) will cause new bugs as features are added. Fixing them once is cheaper than triaging them repeatedly.

## Viable Options

### Option A — Surgical bugfix only
**Scope:** Merge the double-fetch in `getContentEditorIndexData`; rewrite the `handleNodeSelect` effect in `QuestionsTableClient`; wrap `getArticleFull` in `unstable_cache`; flatten `[id]/page.tsx` batches.
- **Pros:** Smallest diff, lowest regression risk, shippable in one phase, easy to review.
- **Cons:** Leaves `localArticles` mirror in place (integrity race persists), leaves the 4-pass filter in `ContentEditorIndex`, does not fix the `selectedArticleIds` stale-ID risk.

### Option B — Surgical bugfix + targeted state refactor, **split across two PRs**  **(RECOMMENDED)**
**Scope:** All of A, plus (1) remove `localArticles` mirror and drive from `articles` prop with a separate `pendingArchiveIds: Set<string>` for optimistic state, (2) stabilise `handleNodeSelect` via shared helper, (3) collapse the four-pass `filteredArticles` memo into one traversal, (4) add `unstable_cache` tags for `admin-knowledge` on the index query — **only after** an RLS audit confirms the query is user-agnostic (see §5 critical security flag).

**PR 1 (pure refactors, zero UX behavior change):** 1.1, 1.2, 2.1, 2.2, 2.3, 2.4, 3.4. Shippable this week. No state-shape changes. No caching introductions beyond the wiki-benchmark pattern (static-client `getArticleFull`). Every change is byte-for-byte behavior-preserving at the interaction level. Gated on §9 Q4, Q6, and Q11a (RLS for `wiki_articles`).

**PR 2a (behavior change — ships after PR 1 bakes):** 1.3 (`localArticles` removal + `pendingArchiveIds`), 3.3 (per-row bulk failure reporting). Gated on §9 Q10 (un-archive scope).

**PR 2b (index caching — ships ONLY after PR 2a is deployed to production):** 2.5 (admin-knowledge cache), 2.6 (view-mode split), Phase 4. Gated on §9 Q11b (RLS for the full index loader).

**CRITICAL ORDERING:** PR 2b must not merge until PR 2a is in production. Rationale: L-2 (the optimistic-vs-server clobber race) becomes observable **only** when the server response becomes stale relative to the client — which happens *only* once caching is introduced. Shipping 2.5 before 1.3 would create a live clobber race in production. Enforcing "2a in prod first, then 2b merges" removes the footgun.

- **Pros:** Eliminates every confirmed Critical / High finding. Decorrelates three risk classes (refactor / behavior / caching) across three PRs. Failures in later PRs do not block earlier PRs' wins.
- **Cons:** Three review cycles instead of one. Longer calendar time to full rollout. PR 2a/2b requires RLS verification work not present in the original plan.

### Option C — Full rewrite: split `ContentEditorIndex` into `ArticlesView` + `QuestionsView` shells
**Scope:** Break the 735-line component into two siblings sharing a minimal `KnowledgeLayoutShell`. Lift URL-sync to the shell. Separate server data loaders per view.
- **Pros:** Cleanest long-term shape. Each shell is ~300 lines. Parallels wiki architecture more literally.
- **Cons:** High regression risk across 6+ call sites and the `defaultViewMode` prop pattern. Every feature in flight gets blocked. No evidence the split itself fixes any confirmed bug — all root causes can be addressed inside the current component.

**Selected:** Option B. Option A leaves known integrity risks on the table; Option C spends rewrite budget we do not have for wins we do not need.

---

# 1. Executive Summary

`/admin/knowledge` and `/admin/knowledge/questions` are the two slowest and most fragile routes in the admin portal. Three confirmed bugs explain the majority of the pain, and four performance cliffs explain the rest.

**The three stability-critical bugs.** First, `getContentEditorIndexData` fetches the entire `questions` table twice on every render of both admin knowledge routes — once at `src/lib/actions/admin/content.ts:201-204` (`question_id, topic_id, text`) and again at `src/lib/actions/admin/content.ts:226-229` (`article_id, question_type`). The second fetch is sequential, not parallel, so it adds a full network roundtrip on top of the duplicated payload. Second, `QuestionsTableClient` re-fetches the question bank every time the parent re-renders, because its effect at `src/components/admin/QuestionsTableClient.tsx:458-460` depends on `handleNodeSelect`, which is a `useCallback` whose deps include the `taxonomyTree` prop — and `taxonomyTree` gets a fresh reference on every `router.refresh()` from any mutation anywhere in the owning page. Third, `ContentEditorIndex` mirrors its `articles` prop into a `localArticles` state at `src/components/admin/unified-editor/ContentEditorIndex.tsx:144`, then writes it back from an effect at `src/components/admin/unified-editor/ContentEditorIndex.tsx:156-158`. The bulk-delete optimistic update at lines 259-284 mutates `localArticles`, then immediately calls `router.refresh()`; if the server revalidation returns stale data (or races ahead of the React commit), the optimistic update is silently clobbered. This also means `selectedArticleIds` can hold IDs for articles that no longer exist between the archive call and the next server fetch.

**The four performance cliffs.** `getArticleFull` (`src/lib/actions/admin/content.ts:336-348`) is not wrapped in `unstable_cache`, so every admin article detail view is a fresh database roundtrip — the wiki benchmark (`getCachedArticleAndNode` in `src/lib/actions/cached-queries.ts`) demonstrates the pattern we are missing. The admin detail page (`src/app/admin/knowledge/[id]/page.tsx:24-44`) runs four sequential database round trips (auth → `getArticleFull` → links+prompts → questions+nodes) when three of the four could run in parallel after auth. The `buildTree` function at `src/lib/actions/admin/content.ts:255-290` walks every descendant for every node, turning a simple taxonomy count into an O(N²) pass. `enrichedArticles` at `src/lib/actions/admin/content.ts:298-313` does an O(A × L) linear search over `wiki_article_taxonomy` links per article when a prebuilt map would make it O(A + L).

**Wiki parity.** The reference route `/dashboard/wiki/[slug]` already demonstrates the three patterns that admin lacks: cached article fetch with tag-based revalidation, a single parallel `Promise.all` after the cached primary query, and no mirror-prop-into-state anti-patterns. Admin inherits the wiki's generic `revalidateTag('wiki','max')` — in fact `bulkDeleteArticles` at `src/lib/actions/admin/bulk.ts:28-49` calls it — but admin itself has no caches to invalidate, so the tag fires into a vacuum.

**Recommendation.** Phase 1 fixes the three stability bugs. Phase 2 closes the four performance cliffs. Phase 3 sharpens UX responsiveness (Suspense boundaries, skeletons, bulk-action toasts). Phase 4 consolidates the patterns so the next admin feature inherits them for free. Nothing in this plan requires touching `ContentEditorIndex`'s component boundary or any identity-locked file.

---

# 2. Route and Component Map

## Target A: `/admin/knowledge` (articles view)

- **Route file:** `src/app/admin/knowledge/page.tsx` (implied; renders `ContentEditorIndex` with `defaultViewMode="articles"`).
- **Layout chain:** `src/app/admin/layout.tsx` → admin shell → knowledge page.
- **Primary client component:** `src/components/admin/unified-editor/ContentEditorIndex.tsx` (735 lines).
- **Data loader:** `getContentEditorIndexData` at `src/lib/actions/admin/content.ts:183-331`.
- **Mutation hooks:** `bulkDeleteArticles` (`src/lib/actions/admin/bulk.ts:28-49`), `DeleteArticleModal` on confirm (`src/components/admin/unified-editor/DeleteArticleModal.tsx:43`), `UnifiedContentEditor` on save.
- **Shared with wiki:** None directly. Reads the same underlying tables (`wiki_articles`, `wiki_article_taxonomy`, `taxonomy_tree`, `questions`).
- **Diverged:** The entire data loader is admin-only. Wiki does not batch articles + taxonomy + questions in one action.

## Target B: `/admin/knowledge/questions`

- **Route file:** `src/app/admin/knowledge/questions/page.tsx` (implied; renders `ContentEditorIndex` with `defaultViewMode="questions"`).
- **Layout chain:** Same as Target A.
- **Primary client component:** `ContentEditorIndex` re-used — the questions view is an internal `viewMode` branch, not a separate component.
- **Embedded component:** `QuestionsTableClient` at `src/components/admin/QuestionsTableClient.tsx`, mounted when `viewMode === 'questions'`.
- **Data loader:** Same `getContentEditorIndexData` — so this route pays the cost of fetching all articles, even though the user is looking at questions. Additional data for the questions table comes from `getQuestionsByTopicIds` called imperatively inside `handleNodeSelect` at `src/components/admin/QuestionsTableClient.tsx:448`.
- **Mutation hooks:** `bulkDeleteQuestions` at `src/lib/actions/admin/bulk.ts:9-26`, `QuestionEditor` on save.
- **Shared with wiki:** None.
- **Diverged:** The on-demand fetch-by-topic pattern is admin-specific. Wiki questions are loaded alongside the article in `getCachedArticleAndNode`.

## Reference: `/dashboard/wiki/[slug]`

- **Route file:** `src/app/dashboard/wiki/[slug]/page.tsx`.
- **Cached primary fetch:** `getCachedArticleAndNode` at `src/lib/actions/cached-queries.ts` — wrapped in `unstable_cache`, revalidate 3600, tags `['wiki','taxonomy']`.
- **Parallel data block:** Single `Promise.all` at `src/app/dashboard/wiki/[slug]/page.tsx:59-66` pulling six independent collections after the cached read completes.
- **Client component:** Wiki navigation shell (`src/components/wiki/navigation/**`) — **not a modification target, benchmark only**.
- **Patterns to inherit:** Cached primary read + tag-based revalidation; single post-auth parallel batch; no prop-mirror-into-state.

---

# 3. CRUD Flow Audit

## `/admin/knowledge` (articles)

- **Create:** Handled outside this surface (New Article action routes to the editor). Index page plays no part in create.
- **Read:** Single server render calls `getContentEditorIndexData`; result hydrates `ContentEditorIndex` with `articles`, `taxonomyTree`, `searchableQuestions`. **Failure point:** no cache wrapping, so every navigation back to `/admin/knowledge` is a full 5-query refetch. **Missing protection:** the server action has no error boundary — if any of the five queries fail, the whole action throws and the page renders the Next.js error shell.
- **Update (edit an article):** Handled in the detail route `/admin/knowledge/[id]`. On save, `UnifiedContentEditor` calls `router.refresh()`, which re-runs the detail page loader. The index list is not refreshed until the user navigates back, at which point the uncached `getContentEditorIndexData` fires again.
- **Delete (soft-archive):** `bulkDeleteArticles` updates `status='archived'` (`src/lib/actions/admin/bulk.ts:32-37`), then fires `revalidateTag('wiki','max')` and four `revalidatePath` calls. Client optimistically mutates `localArticles`, then calls `router.refresh()` (`src/components/admin/unified-editor/ContentEditorIndex.tsx:259-284`). **Failure points:** (1) no per-article rollback if only some archives succeed — the bulk action returns a single `error` string; (2) the optimistic update races the server refresh as documented in §5; (3) `selectedArticleIds` retains archived IDs until the next full re-render. **UX risk:** if the user rapidly archives two batches, the second batch's `router.refresh()` can land before the first's, producing visible "un-archive then re-archive" flicker.

## `/admin/knowledge/questions`

- **Create:** Handled in a separate question editor route.
- **Read:** Dual-layer. The outer page re-runs the same `getContentEditorIndexData` (including all articles, which the questions view does not display). The inner `QuestionsTableClient` imperatively calls `getQuestionsByTopicIds` whenever the selected node changes — or, per §5, whenever the parent re-renders for any reason. **Failure point:** no loading state between these two layers; users see stale questions until the imperative fetch resolves.
- **Update:** `QuestionEditor` saves and calls `router.refresh()`. Because this triggers a new `taxonomyTree` reference, `QuestionsTableClient`'s effect fires and re-fetches the active topic's questions — which is correct by coincidence, not by design.
- **Delete:** `bulkDeleteQuestions` hard-deletes from `questions` table and revalidates four paths but does NOT fire `revalidateTag('wiki','max')` (compare `src/lib/actions/admin/bulk.ts:20-25` vs `28-49`). The wiki questions cache is therefore stale until the tag is eventually invalidated by a different action. **Failure point:** hard delete with no transaction guarantees; partial failure leaves orphans. **Missing protection:** no confirmation of the deleted count vs. the requested count before the toast fires.

---

# 4. Performance Audit

## P-1. Duplicate `questions` table fetch in `getContentEditorIndexData`
- **Bottleneck:** Entire `questions` table fetched twice per page render.
- **Root cause:** `Promise.all` at `src/lib/actions/admin/content.ts:187` fetches `question_id, topic_id, text`; a sequential second call at `src/lib/actions/admin/content.ts:226-229` fetches `article_id, question_type` from the same table, filtered only by `article_id is not null`.
- **Affected files:** `src/lib/actions/admin/content.ts`.
- **Severity:** Critical.
- **Confidence:** High (verified by direct file read).
- **Why it impacts speed:** Doubles the network payload and adds a second sequential roundtrip after the parallel batch completes. On a 5,000-row question bank this is measurable in hundreds of milliseconds and grows linearly.
- **Kind of fix:** Merge into the existing `Promise.all` by selecting `question_id, topic_id, text, article_id, question_type` once, then compute both the `searchableQuestions` array and the per-article count map from the single result.

## P-2. `getArticleFull` is uncached
- **Bottleneck:** Every admin article detail load is a cold DB read.
- **Root cause:** `src/lib/actions/admin/content.ts:336-348` issues a single select but is not wrapped in `unstable_cache`.
- **Affected files:** `src/lib/actions/admin/content.ts`, `src/app/admin/knowledge/[id]/page.tsx`.
- **Severity:** High.
- **Confidence:** High.
- **Why it impacts speed:** The wiki benchmark caches the equivalent read for 1 hour with tag-based invalidation. Admin forgoes this entirely, so every navigation re-hits the database even when nothing has changed.
- **Kind of fix:** Wrap in `unstable_cache` with tags `['admin-knowledge', 'article:${id}']`; invalidate on mutations via `revalidateTag`.

## P-3. Admin detail page runs four sequential batches
- **Bottleneck:** `src/app/admin/knowledge/[id]/page.tsx:24-44` executes auth → `getArticleFull` → `[taxonomyLinks, eiPrompts]` → `[questions, taxonomyNodes]` sequentially.
- **Root cause:** Batch 3 genuinely depends on `taxonomyLinks` from batch 2, but `eiPrompts` does not depend on `taxonomyLinks` and `getArticleFull` does not depend on auth outcome beyond the boolean gate.
- **Affected files:** `src/app/admin/knowledge/[id]/page.tsx`.
- **Severity:** High.
- **Confidence:** High.
- **Why it impacts speed:** Four serial roundtrips where two would suffice. Every detail page pays this tax.
- **Kind of fix:** Single `Promise.all` after auth covering `getArticleFull`, `eiPrompts`, and anything else taxonomy-independent; then a second `Promise.all` for the taxonomy-dependent queries.

## P-4. `buildTree` is O(nodes²) for descendant counts
- **Bottleneck:** Taxonomy construction re-walks every descendant per node.
- **Root cause:** `src/lib/actions/admin/content.ts:255-290` — `descendantQCount` at lines 267-273 walks the whole subtree for every node during `buildTree`.
- **Affected files:** `src/lib/actions/admin/content.ts`.
- **Severity:** Medium.
- **Confidence:** High.
- **Why it impacts speed:** For a 200-node taxonomy this is ~40k redundant visits. Not catastrophic today but scales badly and is a hot path on every index render.
- **Kind of fix:** Compute counts bottom-up in a single DFS — each node's count is its own questions plus the sum of its children's already-computed counts.

## P-5. `enrichedArticles` linear-scans links per article
- **Bottleneck:** O(A × L) instead of O(A + L).
- **Root cause:** `src/lib/actions/admin/content.ts:298-313` calls `links.find((l) => l.article_id === a.article_id && l.is_primary)` per article.
- **Affected files:** `src/lib/actions/admin/content.ts`.
- **Severity:** Medium.
- **Confidence:** High.
- **Why it impacts speed:** For 500 articles × ~1500 links this is 750k comparisons per render. Small now, embarrassing later.
- **Kind of fix:** Prebuild a `Map<article_id, primary_node_id>` from links in a single pass, then lookup by key.

## P-6. `filteredArticles` is four sequential filter passes
- **Bottleneck:** Four array allocations per recompute.
- **Root cause:** `src/components/admin/unified-editor/ContentEditorIndex.tsx:195-225` runs four chained `.filter` calls over `localArticles`.
- **Affected files:** `src/components/admin/unified-editor/ContentEditorIndex.tsx`.
- **Severity:** Low.
- **Confidence:** High.
- **Why it impacts speed:** 4× allocations and 4× passes where one combined predicate would suffice. Matters once articles > ~2000 or on low-end hardware.
- **Kind of fix:** Single `.filter` whose predicate composes all four conditions; keep `useMemo` deps unchanged.

## P-7. `getContentEditorIndexData` result not cached
- **Bottleneck:** Every server render of `/admin/knowledge*` re-runs all five queries.
- **Root cause:** No `unstable_cache` wrapper; no `export const revalidate` on the page files.
- **Affected files:** `src/lib/actions/admin/content.ts`, `src/app/admin/knowledge/page.tsx`, `src/app/admin/knowledge/questions/page.tsx`.
- **Severity:** High.
- **Confidence:** High.
- **Why it impacts speed:** Combined with every mutation calling `router.refresh()`, this makes the route's effective read cost pay the full data cost per interaction.
- **Kind of fix:** Wrap in `unstable_cache` with tag `admin-knowledge`; mutations in `src/lib/actions/admin/bulk.ts` call `revalidateTag('admin-knowledge')`.

## P-8. Questions table fetched when viewing articles
- **Bottleneck:** `/admin/knowledge` (articles view) loads the entire questions table even though the UI only needs per-article counts.
- **Root cause:** Shared loader `getContentEditorIndexData` cannot distinguish caller's view mode.
- **Affected files:** `src/lib/actions/admin/content.ts`, page files.
- **Severity:** Medium.
- **Confidence:** High.
- **Why it impacts speed:** A view that renders zero questions still pays for fetching all of them. For the questions view this is necessary; for the articles view it is waste.
- **Kind of fix:** Split into `getContentEditorArticlesData` and `getContentEditorQuestionsData`, or accept a `viewMode` arg that conditionally skips the heavy question select while still computing per-article counts via a `count` aggregation.

---

# 5. Infinite Loop and Re-render Risk Audit

## L-1. `QuestionsTableClient` re-fetches on every parent re-render
- **Issue:** Effect at `src/components/admin/QuestionsTableClient.tsx:458-460` depends on `handleNodeSelect`, which is a `useCallback` with `[taxonomyTree, externalSelectedNodeId, debouncedSearchQuery]` deps (`src/components/admin/QuestionsTableClient.tsx:420-456`).
- **Why risky:** `taxonomyTree` is passed as a prop from `ContentEditorIndex`, which receives a new reference from the server on every `router.refresh()`. Any mutation anywhere in the owning page triggers a refresh → new `taxonomyTree` identity → new `handleNodeSelect` identity → effect fires → `getQuestionsByTopicIds` runs with the same arguments.
- **Trigger:** Saving a question. Saving an article. Bulk-deleting anything. Creating anything.
- **User-facing symptom:** Table flashes a loading state and re-renders. On a slow DB the flash is a multi-hundred-ms freeze. On any DB it wastes a roundtrip per mutation.
- **Additional double-trigger:** `debouncedSearchQuery` appears in both the `useCallback` deps AND the effect deps. On a search change the callback identity changes AND `debouncedSearchQuery` changes — the effect's dep check fires once (new function ref), then the new function has the new query bound, producing a single intended fetch but via a fragile path. If React batches identity comparison differently in a future version, this becomes two fetches.
- **Severity:** Critical.
- **Confidence:** High.
- **Remediation direction:** Remove `handleNodeSelect` from the effect's dep array by either (a) inlining the body into the effect, or (b) storing the latest function in a ref and invoking `ref.current(activeNodeId)`. The effect's true dependencies are `activeNodeId` and `debouncedSearchQuery` only — nothing else should re-run it.

## L-2. `localArticles` mirror-prop state race
- **Issue:** `src/components/admin/unified-editor/ContentEditorIndex.tsx:144` initialises `localArticles` from `articles`; `src/components/admin/unified-editor/ContentEditorIndex.tsx:156-158` writes `articles` back into `localArticles` on every prop change.
- **Why risky:** The optimistic bulk-delete at `src/components/admin/unified-editor/ContentEditorIndex.tsx:259-284` mutates `localArticles` and immediately triggers `router.refresh()`. When the server response lands, the effect at line 156 overwrites the optimistic state with the server version. If server revalidation is incomplete (cache staleness, race with a parallel mutation, partial bulk failure), the overwrite is wrong.
- **Trigger:** Any bulk-delete. Any save that triggers `router.refresh()` while an optimistic state exists.
- **User-facing symptom:** Articles reappear in the list after being archived. Selection state (`selectedArticleIds`) retains IDs for archived articles, producing undefined behaviour if the user triggers a second action on the stale selection.
- **Severity:** Critical.
- **Confidence:** High.
- **Remediation direction:** Delete `localArticles`. Render directly from the `articles` prop. Track optimistic archival in a separate `pendingArchiveIds: Set<string>` that is merged into filter predicates. Clear `pendingArchiveIds` on effect keyed by `articles` identity — safe because the set only holds IDs the server should have removed, and stale-ID clears are harmless.

## L-3. `selectedArticleIds` can reference archived articles
- **Issue:** `selectedArticleIds` at `src/components/admin/unified-editor/ContentEditorIndex.tsx:142` is never reconciled against the current `articles` list.
- **Why risky:** After a bulk-delete clears the archived rows from the list, the `Set` still holds those IDs. A subsequent bulk-action button reads from the stale set and operates on non-existent rows. Downstream actions (`bulkDeleteArticles`) silently no-op on unknown IDs or return partial success.
- **Trigger:** Any mutation that removes articles while a selection is active.
- **User-facing symptom:** Button labels showing "3 selected" when only 1 visible row is actually selectable; inconsistent bulk-action results.
- **Severity:** High.
- **Confidence:** High.
- **Remediation direction:** Derive selection via `useMemo` against the current article list: `selectedArticleIds.intersection(new Set(articles.map(a => a.article_id)))`. Or reset selection after any mutation.

## L-4. `updateUrl` callback identity churn (latent loop risk)
- **Issue:** `src/components/admin/unified-editor/ContentEditorIndex.tsx:161-167` — `updateUrl` useCallback depends on `[router, searchParams]`. `searchParams` is a fresh `ReadonlyURLSearchParams` on every render after `router.replace`. So `updateUrl` gets a new identity every time it's used.
- **Why risky today:** Not currently in any `useEffect` dep array, so no loop today.
- **Why risky tomorrow:** Any future effect that adds `updateUrl` to its deps would immediately produce an infinite loop on first interaction. The pattern is a footgun.
- **Trigger:** None today.
- **User-facing symptom:** None today.
- **Severity:** Low today / High if touched.
- **Confidence:** High.
- **Remediation direction:** Drop `searchParams` from deps by reading it via `useSearchParams()` ref at call time, or switch to URL manipulation via `window.location.search` inside the callback body.

## L-5. URL→state sync effects at `146-148` and `150-154`
- **Issue:** Two effects that write `searchParams.get(...)` into component state.
- **Why risky:** These run on every URL change, overwriting any local state changes the user may have made concurrently. The pattern is standard but easy to break — any future code that does `setSelectedNodeId(...)` followed by a route push would create a "user action → URL push → effect → overwrite" cycle if the effect's setter value happened to equal the new URL's value by coincidence only on the first pass.
- **Trigger:** URL change with stale searchParams.
- **User-facing symptom:** None observed today; risk activates with further state additions.
- **Severity:** Low.
- **Confidence:** Medium.
- **Remediation direction:** Treat `searchParams` as the single source of truth — derive view state directly via `useMemo` over `searchParams.get(...)` instead of `useState` + effect.

## L-6. `bulkDeleteArticles` revalidates `wiki` tag, not `admin-knowledge`
- **Issue:** `src/lib/actions/admin/bulk.ts:28-49` fires `revalidateTag('wiki','max')`. There is no `admin-knowledge` tag anywhere, and `getContentEditorIndexData` is uncached anyway.
- **Why risky (for loops specifically):** Not a direct loop, but contributes to the L-1 cascade: mutation → `router.refresh()` → new server data → new `taxonomyTree` reference → `QuestionsTableClient` re-fetch.
- **Trigger:** Every bulk delete.
- **Severity:** Medium.
- **Confidence:** High.
- **Remediation direction:** When P-7 introduces the `admin-knowledge` cache tag, mutations fire `revalidateTag('admin-knowledge')` and optionally skip `router.refresh()` entirely, relying on Next.js's automatic invalidation.

---

# 6. Dashboard Wiki Parity Analysis

## Shared (already aligned)
- Underlying tables: `wiki_articles`, `wiki_article_taxonomy`, `taxonomy_tree`, `questions`.
- Cache tag namespace: both use the `wiki` tag (though admin fires it without having a cache of its own to invalidate).
- Design tokens and surface hierarchy via `.ai/rules/design.md`.

## Divergent (different pattern, defensible)
- **Data loader shape.** Wiki does one cached primary read then a single parallel batch. Admin runs a monolithic five-query action per render.
- **Cache strategy.** Wiki wraps `getCachedArticleAndNode` in `unstable_cache`. Admin caches nothing.
- **Detail page.** Wiki is a cached primary read plus one `Promise.all`. Admin is four sequential batches.

## Missing (admin should have these)
- **Cached detail fetch.** `getArticleFull` needs an `unstable_cache` wrapper with per-article tag.
- **Cache tag for index.** `admin-knowledge` tag does not exist. Until it does, `revalidateTag` calls from admin mutations are no-ops for admin's own reads.
- **Parallel detail batch.** Admin detail page should mirror wiki's single post-auth `Promise.all`.
- **Loading boundaries.** Wiki has `loading.tsx`; admin knowledge does not ship visible Suspense-backed skeletons at the detail level.

## Architecture to unify
- Introduce a `cached-queries-admin.ts` module paralleling `src/lib/actions/cached-queries.ts`. Move `getArticleFull` there wrapped, and add a cached `getContentEditorIndexData` variant with the double-fetch fix applied.
- Standardise the mutation → `revalidateTag` pattern across `src/lib/actions/admin/bulk.ts` so every bulk action fires every relevant tag (admin-knowledge + wiki).

## Patterns to inherit verbatim
- `unstable_cache(..., { tags: [...], revalidate: 3600 })` from `src/lib/actions/cached-queries.ts`.
- Single post-auth `Promise.all` from `src/app/dashboard/wiki/[slug]/page.tsx:59-66`.
- Render directly from server props; no prop-mirror-into-state.

---

# 7. Prioritized Implementation Plan

## Phase 1 — Critical stability & correctness

### 1.1 Merge the double-questions fetch in `getContentEditorIndexData`
- **Goal:** Fetch the `questions` table once per page render.
- **Files:** `src/lib/actions/admin/content.ts:187-230`.
- **Action:** Expand the first query's select list to `question_id, topic_id, text, article_id, question_type`. Remove the sequential second query at lines 226-229. Compute both `searchableQuestions` (filter by `topic_id` presence) and the per-article count map from the single result set.
- **Expected impact:** Roughly halves the page's data cost and removes one sequential roundtrip. Highest-ROI change in the plan.
- **Dependency:** None. Ships first.
- **Risk if not fixed:** Continued doubled network cost, which scales linearly with question bank growth.

### 1.2 Stop `QuestionsTableClient` re-fetching on every parent re-render
- **Goal:** The question-bank fetch runs only when `activeNodeId` or `debouncedSearchQuery` changes, never because of identity churn in props.
- **Files:** `src/components/admin/QuestionsTableClient.tsx:420-460` (effect + callback), `:497` (tree `onSelect` call site).
- **Action:** Extract the fetch body into a **shared module-level async function** in `QuestionsTableClient.tsx` (not a new file):
  ```ts
  async function fetchQuestionsForNode(
    nodeId: string | null,
    query: string,
    tree: TaxonomyNode[],
  ): Promise<{ data: QuestionGroup[] } | null>
  ```
  Returns the question-group data or `null` for no-op cases (null node + no query). Callers are responsible for dispatching their own loading/error state and calling `setNodeGroups`. The effect at lines 458-460 calls `fetchQuestionsForNode(activeNodeId, debouncedSearchQuery, taxonomyTree)` with effect deps `[activeNodeId, debouncedSearchQuery]` — NO callback in the dep array. The tree `onSelect` at line 497 also calls this function. Fetch logic stays in one place; dep-array churn is eliminated.
- **Alternative considered and rejected:** React 19 `cache()` from `react` was considered but does NOT stabilise prop reference identity across renders — it dedupes function-call results within a single request. Incorrect mechanism for this problem. Dropped.
- **Observability:** Add a dev-only `console.debug('[QuestionsTable] fetch', { nodeId, query })` inside the fetch path. Before/after verification of the fix is a one-line grep of that log during a save → expect exactly zero logs from mutations, exactly one log per deliberate node-selection or search.
- **Expected impact:** Eliminates the per-mutation ghost fetch. Saving any article or question no longer triggers a questions-table re-query.
- **Dependency:** None.
- **Risk if not fixed:** Every mutation continues to pay an unnecessary question-bank fetch; scales with usage intensity.

### 1.3 Remove `localArticles` mirror; track optimistic archives separately
- **PR gate:** Ships in **PR 2a**, not PR 1 or PR 2b. This is a behavioral change, not a refactor. It must not share a PR with pure refactors (PR 1) or with caching (PR 2b).
- **Goal:** Eliminate the optimistic-vs-server race (which becomes *actually dangerous* only after Phase 2.5 caching lands — see §5 L-2 and Architect's steelman) and the stale selection bug.
- **Files:** `src/components/admin/unified-editor/ContentEditorIndex.tsx:142-158, 195-284`.
- **Action:** Delete `localArticles` state and the effect at lines 156-158. Render from the `articles` prop directly. Add `pendingArchiveIds: Set<string>`; include it in the `filteredArticles` predicate to hide optimistically-archived rows.
- **Critical clearing condition (REVISED):** Clear `pendingArchiveIds` **per-ID, only when that specific ID is absent from the incoming `articles` list**. Do NOT clear the whole set on `articles` identity change — that produces a new bug class (out-of-order Next.js revalidation can clear the set before the server state catches up, flashing archived rows back). Implementation: in a `useEffect([articles])`, compute `next = new Set([...pendingArchiveIds].filter(id => articles.some(a => a.article_id === id && a.status !== 'archived')))`; only set if `next.size !== pendingArchiveIds.size`.
- **Selection reconciliation:** Reconcile `selectedArticleIds` against the currently-rendered articles via a derived `useMemo`: `useMemo(() => new Set([...selectedArticleIds].filter(id => visibleArticleIdSet.has(id))), [selectedArticleIds, visibleArticleIdSet])`. Or reset selection after any bulk mutation.
- **Bundled dependency — Phase 3.3 ships with this item**, not later. Per-row failure reporting must land simultaneously with the mirror removal; otherwise a partial bulk failure under the new architecture produces a worse UX than the current (silent) failure mode.
- **Observability:** Add a dev-only `console.debug('[ContentEditorIndex] optimistic archive', { ids, pendingCount })` on archive trigger, and `console.debug('[ContentEditorIndex] pending cleared', { ids })` on the per-ID clear. Before/after verification: expect no "pending cleared" log until the server actually reflects the archive.
- **Rollback plan:** Guard the new path behind a module-local `const USE_PENDING_ARCHIVE_SET = true` constant flag. If shipped broken, flip to `false` in a hotfix PR to restore the old `localArticles` mirror path. Both code paths live side-by-side until **PR 2b has been in production for at least 7 days with no rollback triggered**, at which point a dedicated cleanup commit removes `USE_PENDING_ARCHIVE_SET`, the mirror state, and the legacy effect. Removal is the responsibility of whoever owns PR 2b's deploy and must be tracked as a follow-up task before 2b ships.
- **Un-archive scope (Q10):** Un-archive flows are OUT OF SCOPE for PR 2a. `pendingArchiveIds` is strictly one-way. If `UnifiedContentEditor` or any future admin surface introduces an un-archive path before PR 2a ships, file a follow-up to add a symmetric `pendingUnarchiveIds` set — do not retrofit into 1.3's initial diff.
- **Expected impact:** Fixes the confirmed optimistic-update clobber bug (once 2.5 introduces the staleness that makes it observable) and the stale selection bug (observable today).
- **Dependency:** Review alongside 1.2 conceptually, ship in PR 2a.
- **Risk if not fixed:** Stale selection bug today; archive-flicker / silent loss once caching lands.

## Phase 2 — Performance & speed

### 2.1 Wrap `getArticleFull` in `unstable_cache`
- **PR gate:** Ships in **PR 1** (pure refactor).
- **Goal:** Admin article detail loads become cache-hits after the first read.
- **Files:** `src/lib/actions/admin/content.ts:336-348`; new `src/lib/actions/admin/cached-queries.ts` if a dedicated module is preferred.
- **Client choice (CRITICAL):** Follow the wiki benchmark verbatim — the wrapped function must use `createStaticClient()` from `@/lib/supabase/server`, not `createClient()`. `cached-queries.ts:4` imports `createStaticClient`; `cached-queries.ts:27, 41, 64, 107, 150` uses it throughout. The comment at `cached-queries.ts:22` explicitly states "Global data caches (same for all users, revalidate hourly)". An authenticated client inside `unstable_cache` would cache one user's RLS-filtered result and serve it to every subsequent reader — a cross-user data leak. See §9 Q11 for the RLS verification prerequisite.
- **Action:** Create wrapped function that uses `createStaticClient()`, selects the same columns from `wiki_articles`, wrapped with `unstable_cache` using tags `['admin-knowledge', 'article:${id}']` and `revalidate: 3600`. Update `src/lib/actions/admin/bulk.ts` and the article update action to `revalidateTag('article:${id}')` on save.
- **Pre-flight check:** Verify that `wiki_articles` table has no RLS policy that would filter columns selected here (title, slug, content, status, etc.) by user — i.e., that every admin sees identical data for the same `article_id`. If RLS is per-author or per-tenant, this plan item is blocked and must be replaced with per-request React `cache()` dedup instead.
- **Expected impact:** Detail page goes from ~one DB roundtrip on every load to cache-hit on repeat views within the hour.
- **Dependency:** RLS pre-flight must pass.
- **Risk if not fixed:** Detail page stays slow and scales poorly.

### 2.2 Flatten `src/app/admin/knowledge/[id]/page.tsx` sequential batches
- **PR gate:** Ships in **PR 1**.
- **Goal:** Reduce four sequential DB roundtrips to two.
- **Files:** `src/app/admin/knowledge/[id]/page.tsx:24-44`.
- **Action:** Parallelise `getArticleFull`, `eiPrompts`, and `taxonomyLinks` in a single `Promise.all` after auth. Follow with a second `Promise.all` for the taxonomy-dependent `[questions, taxonomyNodes]` pair. Place the `notFound()` gate after the first `Promise.all` resolves.
- **Tradeoff acknowledged:** Running `eiPrompts` and `taxonomyLinks` in parallel with `getArticleFull` means both queries fire even when `getArticleFull` returns null (non-existent article → notFound). Their cost is trivial (one indexed lookup each) and the speedup for the common path is substantial. Accept this as a deliberate trade.
- **Expected impact:** ~2× detail-page server response speedup on a warm DB.
- **Dependency:** Ideally after 2.1 so `getArticleFull` is cached.
- **Risk if not fixed:** Detail pages stay sluggish even after caching lands.

### 2.3 `buildTree` single-pass descendant counts
- **Goal:** Replace O(N²) with O(N).
- **Files:** `src/lib/actions/admin/content.ts:255-290`.
- **Action:** Compute descendant question counts bottom-up: each node's count is its own plus the sum of already-computed child counts. Drop `descendantQCount`.
- **Expected impact:** Near-instant taxonomy build even for large trees; removes a future scaling cliff.
- **Dependency:** None.
- **Risk if not fixed:** Scales badly as taxonomy grows.

### 2.4 `enrichedArticles` O(A+L) map lookup
- **Goal:** Replace per-article linear scan with prebuilt map.
- **Files:** `src/lib/actions/admin/content.ts:298-313`.
- **Action:** Before the map, build `const primaryNodeByArticle = new Map<string, string>()` from `links` in one pass; use `.get(a.article_id)` inside the article map.
- **Expected impact:** Measurable at ≥500 articles, dramatic at ≥2000.
- **Dependency:** None.
- **Risk if not fixed:** Index render time scales with article × link product.

### 2.5 Cache `getContentEditorIndexData` with tag — **BLOCKED ON RLS AUDIT**
- **PR gate:** Ships in **PR 2b**, only after PR 2a is in production and §9 Q11b resolves.
- **Goal:** Introduce `admin-knowledge` cache tag so mutation invalidation actually does something.
- **CRITICAL SECURITY NOTE:** `getContentEditorIndexData` at `src/lib/actions/admin/content.ts:184` calls `createClient()` — the authenticated SSR client that applies Row-Level Security per user. Wrapping an authenticated-client query in `unstable_cache` caches the first reader's RLS-filtered result set and serves it to every subsequent reader. If admin RLS is uniform across all admins (every admin sees the same articles/questions/taxonomy), this is safe. If admin RLS is per-author, per-tenant, or per-role, it is a **cross-user data leak**. The wiki benchmark avoids this by using `createStaticClient()` at `cached-queries.ts:27, 41, 64, 107, 150` — a non-authenticated client reading only public data. See `cached-queries.ts:22` comment: "Global data caches (same for all users, revalidate hourly)".
- **Files:** `src/lib/actions/admin/content.ts:183-331`, `src/lib/actions/admin/bulk.ts:9-49`.
- **Decision tree (pick exactly one path based on §9 Q11 resolution):**
  - **Path A — RLS is uniform across admins.** Convert the loader to `createStaticClient()`, wrap with `unstable_cache` tagged `['admin-knowledge']` revalidate 300s. Mutations fire `revalidateTag('admin-knowledge')`.
  - **Path B — RLS is per-user/per-tenant.** Do NOT wrap in `unstable_cache`. Instead, wrap in React 19 `cache()` from `react` to dedupe within a single request pass only. Accept that navigation-level caching is not available; rely on `revalidatePath` + client-side stability fixes from Phase 1 for perceived-speed gains.
  - **Path C — Hybrid.** Wrap only the user-agnostic subqueries (taxonomy tree, article-taxonomy link map) in `unstable_cache` via `createStaticClient()`, keep the article/question selects in the authenticated client uncached. Requires refactoring `getContentEditorIndexData` into two composed functions.
- **Action (deferred until path chosen):** Implement the chosen path; update mutations accordingly.
- **Expected impact (Path A):** Navigation back to `/admin/knowledge` becomes a cache hit when nothing has changed. (Path B): per-request dedup only; no cross-navigation cache. (Path C): partial cache hit on tree/taxonomy, live reads on article list.
- **Dependency:** §9 Q11 resolved; PR 1 merged; Path A/B/C decision made with stakeholder sign-off.
- **Risk if not fixed:** Index route stays fully dynamic; every visit pays the full data cost. This is acceptable for now — the plan's Phase 1 bug fixes address the pain on the critical path without needing cross-navigation caching.
- **Risk if fixed incorrectly (Path A without RLS verification):** Cross-user data leak, potentially a security incident. This is why the plan gates 2.5 behind §9 Q11.

### 2.6 Split articles-view and questions-view data loading
- **Goal:** Stop fetching all articles when rendering the questions view and vice versa.
- **Files:** `src/lib/actions/admin/content.ts`, both page files.
- **Action:** Either (a) introduce a `viewMode` arg to `getContentEditorIndexData` that conditionally skips heavy selects, or (b) split into two separate loaders called from the two separate pages.
- **Expected impact:** Questions view no longer pays for articles; articles view no longer pays for the full question payload (just the count map).
- **Dependency:** After 1.1 so the merged single fetch is in place.
- **Risk if not fixed:** Both routes subsidise each other's cost.

## Phase 3 — UX responsiveness & polish

### 3.1 Suspense boundaries on `[id]/page.tsx`
- **Goal:** Independent sections stream as they resolve.
- **Files:** `src/app/admin/knowledge/[id]/page.tsx`.
- **Action:** Wrap the taxonomy panel, questions panel, and EI prompts panel in separate `<Suspense>` boundaries with skeletons.
- **Expected impact:** Perceived load time drops — fast queries render immediately while slow ones stream.
- **Dependency:** 2.2.

### 3.2 `filteredArticles` single-pass predicate
- **Goal:** Drop four filter chains to one.
- **Files:** `src/components/admin/unified-editor/ContentEditorIndex.tsx:195-225`.
- **Action:** Compose the four conditions into a single predicate inside one `.filter`. Preserve the memo deps.
- **Expected impact:** Lower JS allocation pressure on the client; visible only at large article counts.
- **Dependency:** 1.3 (because `localArticles` is removed; predicate now runs against `articles`).

### 3.3 Consistent bulk-action toasts with per-row failure reporting
- **Goal:** Users know which rows failed on partial bulk failures.
- **Files:** `src/lib/actions/admin/bulk.ts`, `ContentEditorIndex.tsx` delete handler.
- **Action:** Return `{ succeeded: string[]; failed: Array<{id: string; reason: string}> }` from bulk actions; toast summary; reselect failed IDs for retry.
- **Expected impact:** Removes silent-failure UX.
- **Dependency:** 1.3.

### 3.4 `updateUrl` callback stabilisation
- **Goal:** Remove the latent footgun in L-4.
- **Files:** `src/components/admin/unified-editor/ContentEditorIndex.tsx:161-167`.
- **Action:** Read `searchParams` via `usePathname()` + `new URLSearchParams(window.location.search)` at call time; drop `searchParams` from deps.
- **Expected impact:** Prevents a whole class of future loops.
- **Dependency:** None.

## Phase 4 — Cleanup & architectural unification

### 4.1 Extract admin cached-queries module
- **Goal:** Mirror `src/lib/actions/cached-queries.ts` shape for admin.
- **Files:** New `src/lib/actions/admin/cached-queries.ts`; move `getArticleFull` and cached `getContentEditorIndexData` variants in.
- **Expected impact:** Consistent caching conventions across the app.
- **Dependency:** 2.1, 2.5.

### 4.2 URL-as-state refactor
- **Goal:** Drop `useState` + effect sync for `viewMode` and `selectedNodeId`; derive from `searchParams`.
- **Files:** `src/components/admin/unified-editor/ContentEditorIndex.tsx:128-154`.
- **Action:** Replace `useState` with `useMemo` over `searchParams.get(...)`. Writes push to the URL via `router.replace`; reads are always from URL.
- **Expected impact:** Smaller state surface, fewer effects, easier to reason about.
- **Dependency:** 3.4.

### 4.3 Standardise mutation → revalidate pattern
- **Goal:** Every admin mutation fires a documented set of tags.
- **Files:** `src/lib/actions/admin/bulk.ts`, other admin mutation actions.
- **Action:** Shared helper `revalidateAdminKnowledge(articleIds?: string[])` that fires `admin-knowledge`, `wiki`, and per-article tags. Called from every relevant mutation.
- **Expected impact:** Predictable invalidation; no "which tag do I fire" drift as new features land.
- **Dependency:** 2.5.

---

# 8. Fastest Wins

These are the highest-value, lowest-risk changes — start here. All seven ship together as **PR 1** with low review burden.

1. **Merge the double-questions fetch (1.1).** One function, ~15 lines changed, halves the admin-knowledge data payload. No UI change, no state change, no risk. **Before/after verification:** open Chrome DevTools Network tab, reload `/admin/knowledge`, filter for `questions` — expect exactly one Supabase fetch to the `questions` table, not two.
2. **Stop `QuestionsTableClient` re-fetching on parent re-render (1.2).** Extract `fetchQuestionsForNode` shared helper; effect deps become `[activeNodeId, debouncedSearchQuery]`. Eliminates a ghost fetch on every mutation in the owning page. **Before/after verification:** add the dev-only `console.debug('[QuestionsTable] fetch', ...)` log; open `/admin/knowledge/questions`, save an article via the editor, confirm zero new log entries appear in the console.
3. **`enrichedArticles` map lookup (2.4).** Five-line change from `.find` to `Map.get` with a map prebuild. No behaviour change, immediate algorithmic win.
4. **`buildTree` single-pass (2.3).** Localised to one function; no external behaviour change.
5. **Cache `getArticleFull` (2.1) — gated on §9 Q11a RLS audit.** Wrap with `createStaticClient()` + `unstable_cache`. Immediate detail-page speedup once the RLS verification confirms the cache is safe. If Q11a blocks this item, ship the other six without it. **Before/after verification:** navigate to `/admin/knowledge/[sampleId]`, measure server-log timing; reload twice; second and third loads should show "cache hit" (no Supabase query log for `wiki_articles.select`).
6. **Flatten detail page batches (2.2).** No caching dependency; pure parallelization gain. **Before/after verification:** add timing logs around both `Promise.all` blocks in `[id]/page.tsx`; confirm total is ~`max(batch1) + max(batch2)`, not sum of all four queries.
7. **Fix latent `updateUrl` footgun (3.4).** Drop `searchParams` from the `useCallback` deps.

**Non-regression grep gate (required before any PR 1 merge):**
```bash
grep -rn "getArticleFull\|getContentEditorIndexData\|QuestionsTableClient" src/app/dashboard src/components/wiki
```
Expect **zero hits**. If any hit appears, wiki has a hidden dependency on admin code and PR 1's scope containment claim is false; stop and reassess.

**Phase 1.3 (`localArticles` removal) is NOT in Fastest Wins.** It ships in PR 2a alongside Phase 3.3. Phase 2.5 ships separately in PR 2b only after PR 2a is in production and Q11b resolves. Neither PR 2a nor PR 2b shares review with PR 1.

---

# 9. Open Questions That Must Be Verified Before Implementation

1. **Is there a production `admin-knowledge` cache story already in flight?** Nothing in the codebase suggests so, but before adding the `admin-knowledge` tag, verify no parallel work on the design-system-cleanup or payment-decoupling branches introduces one.
2. **Do the bulk actions need `revalidateTag('wiki','max')` preserved when the new `admin-knowledge` tag lands?** The wiki cache is a real consumer; removing the wiki tag would silently stale the dashboard. Assumption: keep both. Needs confirmation that `wiki` tag is still the correct wiki-side invalidation handle (the wiki benchmark uses `['wiki','taxonomy']` tags — both should fire).
3. **What is the actual question-table row count in production?** The plan assumes a scale where the double fetch is measurable. If the table is under a few hundred rows today, the fix is still correct but the observable win is smaller. Either way, fix first — the bug is the bug.
4. **Does `QuestionEditor` call `router.refresh()` or a more targeted revalidation?** The Explorer notes point at `router.refresh()` but the file was not read directly in the evidence pass. Verify before Phase 2.5 so the cache invalidation story is complete.
5. **Is there an existing `loading.tsx` under `src/app/admin/knowledge/`?** Phase 3.1 Suspense boundaries interact with it. If one exists, skeletons should match its surface hierarchy.
6. **Does `UnifiedContentEditor` also mirror props into state?** Explorer reported a `router.refresh()` at line 264 but the component was not read directly. If it has the same pattern as `ContentEditorIndex`, Phase 1.3 may need a twin fix.
7. **Are there any admin routes outside `/admin/knowledge*` that import `ContentEditorIndex`?** A grep will confirm. If so, the state-refactor in Phase 1.3 must be verified against every caller.
8. **Does `taxonomyTree` actually need to be a new reference on every server refresh, or could it be memoised via `cache()` from `react`?** This is the cheapest possible fix for L-1 if acceptable — the React 19 `cache()` primitive would stabilise identity across the same render pass, which may be sufficient even without touching the client effect.
9. **What is the target staleness window for `admin-knowledge`?** Phase 2.5 proposes 300s. If editors need to see another editor's changes immediately, the window shrinks to 0 and the cache becomes tag-only. Product decision required.
10. **Are soft-archived articles ever un-archived from the admin surface?** (RESOLVED — see §7 1.3: out of scope for PR 2a; `pendingArchiveIds` is strictly one-way. If un-archive is discovered during Q6 investigation, file a follow-up for a symmetric `pendingUnarchiveIds` set.)

11a. **[BLOCKING PR 1 Phase 2.1 — HIGHEST PRIORITY] Does RLS on `wiki_articles` permit uniform reads across all admin roles for the columns selected by `getArticleFull`?** Concretely: query the Supabase project for RLS policies on `wiki_articles`. If every admin role (`admin`, `editor`, `content_manager`, `owner`, etc.) receives identical row data for the same `article_id`, then Phase 2.1's `createStaticClient()` + `unstable_cache` wrap is safe. If the policy is per-author or conditional on a user attribute, Phase 2.1 is blocked — either cache with a user-scoped key (defeats much of the benefit) or switch to React 19 `cache()` for per-request dedup only. **This question gates Phase 2.1 and must be resolved before PR 1 begins.** If it is still unresolved when PR 1 is otherwise ready, ship items 1.1, 1.2, 2.2, 2.3, 2.4, 3.4 without 2.1.

11b. **[BLOCKING PR 2b Phase 2.5] Does admin RLS permit uniform reads across all admin users on all four tables read by `getContentEditorIndexData` (`wiki_articles`, `questions`, `taxonomy_tree`, `wiki_article_taxonomy`)?** Concretely: enumerate RLS policies on all four tables across all admin roles. If uniform, Path A (full cache) of Phase 2.5 is safe. If not, pick Path B (React `cache()` only) or Path C (hybrid — cache user-agnostic subqueries only). **This question must be resolved before any work on Phase 2.5 begins.** Strictly more demanding than Q11a because `questions` and `wiki_article_taxonomy` are more likely to have author/owner-scoped RLS than `wiki_articles`.

All twelve are genuine unknowns, not stand-ins for investigation laziness. **Q4 (`QuestionEditor` save path)** and **Q6 (`UnifiedContentEditor` state shape)** must be resolved **before PR 1 begins**, because both affect the correctness of Phase 1.2's and Phase 2.1's fixes (both depend on knowing what else calls `router.refresh` or mirrors props). **Q11a** is blocking for Phase 2.1 in PR 1. **Q11b** is blocking for Phase 2.5 in PR 2b only. **Q10 (un-archive flow)** is blocking for PR 2a (Phase 1.3) — resolved in §7 1.3 as "out of scope, one-way only."

---

# Appendix: Round 2 Follow-up Findings

A second investigative pass read ~11 files the first pass skipped: `UnifiedContentEditor.tsx`, `SaveAllBar.tsx`, `question-queries.ts` (full), `cache-tags.ts`, `supabase/server.ts` references, `BulkActionBar.tsx`, `TaxonomyTree.tsx`. This appendix records **new findings not covered above**. It does not modify the existing phases — each item carries its own PR gate and priority.

## A.1 — Resolved Open Questions

- **§9 Q6 (`UnifiedContentEditor` state shape): RESOLVED — NO mirror-prop anti-pattern.** Verified at `src/components/admin/unified-editor/UnifiedContentEditor.tsx:49-70`. The component uses nine independent `useState` hooks seeded from `initialArticle` fields, not a mirror of the whole `article` object. Updates are granular and flow through `dirty.markArticleDirty()`. **Phase 1.3's mirror-removal does NOT need a twin fix here — the pattern is admin-local to `ContentEditorIndex.tsx` only.** Remove §9 Q6 from PR 1 prerequisites.

- **§9 Q4 (`QuestionEditor` mutation path): PARTIALLY RESOLVED — save path flows through `SaveAllBar`, not a direct `router.refresh()`.** `UnifiedContentEditor.tsx:264` calls `router.refresh()` exactly once, in the `onSaveComplete` callback, and only if the save was an update (not a create — creates go through `router.replace` at line 260). `SaveAllBar.tsx` fires the actual server actions. Phase 1.2's fix in `QuestionsTableClient` does not depend on this path, so Q4 can be downgraded from "PR 1 blocker" to "informational". **Updated gate: Q4 is no longer blocking for PR 1.**

- **§9 Q5 (loading.tsx skeletons): OUT OF SCOPE for performance audit.** The loading files were read during the prior UX audit and contain the same hardcoded-viewport-math bug tracked there. No performance finding here.

## A.2 — NEW High Finding: `getQuestionsByTopicIds` runs 3 sequential DB batches on every tree selection

- **File:** `src/lib/actions/admin/question-queries.ts:170-278`
- **Evidence:**
  - Batch 1 (lines 178-192): fetches from `questions` with `select('question_id, text, topic_id, article_id, question_type, difficulty, rationale, options, code_citation, created_at, updated_at')` — **11 columns including JSONB `options`** — `.limit(500)`
  - Batch 2 (lines 207-219): fetches from `wiki_articles` for any `directArticleIds` extracted from batch 1 result
  - Batch 3 (lines 226-244): fetches from `wiki_article_taxonomy` with `wiki_articles!inner` join for any `uniqueTopics` from batch 1
  - All three batches run **sequentially** — each awaits before the next
- **Trigger:** Every taxonomy-node click in the questions view. Every debounced search in questions mode. Both are frequent, user-initiated interactions.
- **User-facing symptom:** Noticeable latency between clicking a tree node and seeing questions. Compounds with the L-1 churn fix (because L-1's fix means fewer ghost fetches, but the deliberate fetches still pay 3 roundtrips each).
- **Severity:** **High** (downgraded from Critical per Critic round 2: tree-click is a user-initiated, debounced path — ~300-450ms added latency is noticeable but not "blocking"; reserve "Critical" for render-path hot items like the L-1 churn loop from first pass)
- **Confidence:** **High**
- **Kind of fix:** Merge batch 1 with a Supabase foreign-key join so the `wiki_articles` direct-ownership data rides along with the questions query — `.select('question_id, ..., wiki_articles!left(article_id, title, status)')`. Batch 3 (topic → article via `wiki_article_taxonomy`) can run in parallel with a `Promise.all` against batch 1, because its inputs (`uniqueTopics`) are known from the `topicIds` arg before batch 1 runs — `uniqueTopics` is actually derived from batch 1's result today (line 223), but could be derived from the input `topicIds` parameter instead, freeing it to run in parallel. Verify: does `uniqueTopics` ever contain topic IDs not present in `topicIds`? If no, parallelize; if yes, merge differently.
- **Phase recommendation:** **PR 1, appendix item `A.2-PR1`** (renamed from `2.7` to avoid phase-number collision with §7's existing 2.x numbering) — pure refactor, no behavior change, measurable latency win on every tree click. Highest-value new finding in this appendix.
- **Observability:** Add dev-only timing logs around the three Supabase calls in `getQuestionsByTopicIds`; assert total duration after fix is `max(batch1, batch3) + max(batch2_if_dependent)` rather than sum of three.

## A.3 — NEW High Finding: 10-second autosave interval uses `window.dispatchEvent` custom-event pub/sub

- **File:** `src/components/admin/unified-editor/UnifiedContentEditor.tsx:193-200`
- **Evidence:**
  ```tsx
  useEffect(() => {
    const interval = setInterval(() => {
      if (dirty.isAnythingDirty && !isSaving) {
        window.dispatchEvent(new CustomEvent('unified-editor:save'))
      }
    }, 10000)
    return () => clearInterval(interval)
  }, [dirty.isAnythingDirty, isSaving])
  ```
- **Issue 1 — no debouncing vs typing activity (PENDING VERIFICATION):** The interval fires every 10 seconds regardless of whether the user is actively typing. A user editing for 60 seconds triggers 6 autosaves. Each autosave runs `SaveAllBar.doSave`. The magnitude claim "21 server actions every 10 seconds for 20 dirty questions" assumes every dirty-flagged question re-fires every cycle — **this is unverified** because `SaveAllBar.tsx` lines 200-500 were not read (see A.10). If `SaveAllBar` clears dirty flags on successful save, actual waste is bounded to actively-edited items. If it does not, the claim stands. Verify `SaveAllBar` lines 200-500 before sizing the fix.
- **Issue 2 — custom event pub/sub is fragile:** Using `window.dispatchEvent` as the save signal means (a) any other component could accidentally subscribe or dispatch it, (b) unmounting `SaveAllBar` mid-dispatch loses the save, (c) the save handler cannot be easily unit-tested because it's wired through a global event bus instead of a prop. A direct callback or a ref pattern would be equally effective and testable.
- **Issue 3 — interval cleanup races unmount:** If the component unmounts during a dispatched save, the in-flight save completes but its state writes may target a stale component tree.
- **Severity:** **High**
- **Confidence:** **High**
- **Kind of fix:** Replace `setInterval` + `dispatchEvent` with a debounced save trigger that resets on keystroke (e.g., `setTimeout(save, 3000)` reset on every dirty-state change), plus a direct ref or callback prop from `UnifiedContentEditor` to `SaveAllBar`. Drop the `window` event bus.
- **Phase recommendation:** **PR 2a** alongside Phase 1.3 — behavior change (autosave cadence visibly changes for users), so must not ship in PR 1.
- **Risk if not fixed:** Continued waste of server action calls proportional to edit session length. Fragile save-trigger pattern that is hard to reason about.

## A.4 — NEW High Finding: `admin-knowledge` cache tag does not exist in `cache-tags.ts`

- **File:** `src/lib/actions/cache-tags.ts:1-29`
- **Evidence:**
  ```ts
  export const CACHE_TAGS = {
    dashboard: 'dashboard',
    wiki: 'wiki',
    taxonomy: 'taxonomy',
  } as const
  ```
  Only three top-level tags. There are also per-user helpers (`getDashboardTag`, `getUserStatsTag`, etc.) but no admin-namespace tag.
- **Issue:** Phase 2.5 assumes an `admin-knowledge` tag can be introduced, but every mutation in `src/lib/actions/admin/bulk.ts` currently fires `revalidateTag(CACHE_TAGS.wiki, 'max')` — invalidating the **wiki** caches (which actually consume that tag via `cached-queries.ts:135`) but doing nothing for admin. The wiki tag's revalidation is effectively acting as a rough admin-invalidation channel because nothing admin-side is cached yet.
- **Implication for Phase 2.5:** When Phase 2.5 adds `admin-knowledge` caching, it MUST simultaneously:
  1. Add `admin_knowledge: 'admin-knowledge'` to `CACHE_TAGS` in `cache-tags.ts`.
  2. Update every mutation in `bulk.ts`, `content.ts` (save/update/delete paths), and `questions.ts` to call `revalidateTag(CACHE_TAGS.admin_knowledge, 'max')` — ADDITIVE, not replacing the existing `wiki` tag.
  3. Verify no new admin mutations (article publish, question approve, taxonomy reassign) exist without the new tag fire.
- **Severity:** **High** (blocks correctness of Phase 2.5)
- **Confidence:** **High**
- **Phase recommendation:** **Part of PR 2b Phase 2.5** — ships in the same commit that introduces the cache wrap.

## A.5 — NEW Medium Finding: `getQuestionsByTopicIds` selects JSONB `options` for every row, unbounded at 500

- **File:** `src/lib/actions/admin/question-queries.ts:180, 192`
- **Evidence:** The select includes `options` (a JSONB column containing answer choices, likely several KB per row). With `.limit(500)`, the worst-case payload is ~500 × ~2KB = 1MB per fetch over the wire.
- **Issue:** A tree-click fetch of 500 questions pulls ~1MB. The questions table list view does not need full `options` — that's only needed when a question is opened for detail view.
- **Severity:** **Medium**
- **Confidence:** **Medium** (payload size guess based on typical JSONB shape; needs production measurement)
- **Kind of fix:** Split the select into a lightweight list query (`question_id, text, topic_id, article_id, question_type, difficulty, created_at, updated_at` — drop `rationale`, `options`, `code_citation`) and a separate detail fetch when a question row is clicked. Or add an explicit `options: null` column masking if Supabase allows.
- **Phase recommendation:** **PR 1 appendix item `A.5-PR1`** (renamed from `2.8` to avoid phase-number collision with §7) — pure refactor, no UI change if current UI doesn't render `options` in the list. Verify first by grepping `QuestionsTableClient.tsx` and `QuestionsPanel.tsx` for `.options` usage on list rows.

## A.6 — NEW Low-Medium Finding (PENDING VERIFICATION): Article save blocks question save (sequential, not parallel) in `SaveAllBar.doSave`

- **File:** `src/components/admin/unified-editor/SaveAllBar.tsx:134-180`
- **Evidence:** `doSave` awaits `saveArticleFull(...)` before entering the loop that creates the per-question promises. Line 135 uses `await`, which blocks until the article server action resolves. The per-question promises at lines 187+ then fire concurrently (good), but they don't start until the article save completes.
- **Why it matters:** The common interaction is "edit article body + fix a few questions + save". A 300ms article save followed by a 400ms concurrent question-save batch runs 700ms total instead of `max(400, 300) = 400ms`.
- **Constraint:** The article save must complete first IF any of the dirty questions are *new* questions that need the new `article_id`. Line 131 checks for this: `needsArticlePersistence` is true when the article is new OR there are new questions/EI prompts attached to it.
- **Kind of fix:** Conditionally parallelize: if the article already exists AND no new questions/prompts depend on a fresh `article_id`, the article update can race with the question updates in a single `Promise.all`. Requires refactoring `needsArticlePersistence` decision and splitting the save into parallel vs serial branches.
- **Severity:** **Low-Medium** (downgraded from Medium per Critic round 2: a 300ms serial overhead is at the threshold of perception on a deliberate save action, and the conditional-parallelization refactor carries higher regression risk than the savings justify).
- **Confidence:** **High** on the sequential dependency; **Medium** on the UX impact being worth the refactor risk.
- **PENDING VERIFICATION:** Depends on `SaveAllBar.tsx` lines 200-500 (see A.10) to confirm the full save flow uses `Promise.all(promises)` after the loop and that no other hidden serialization exists.
- **Phase recommendation:** **PR 2a (nice-to-have)** — defer if the refactor budget is tight; the gain is marginal compared to A.2, A.3, A.4.

## A.7 — NEW Medium Finding (PENDING VERIFICATION): `setIsLocked(isSaving)` has no error-path cleanup

- **File:** `src/components/admin/unified-editor/UnifiedContentEditor.tsx:90-93`
- **Evidence:**
  ```tsx
  useEffect(() => {
    setIsLocked(isSaving)
    return () => setIsLocked(false)
  }, [isSaving, setIsLocked])
  ```
- **Issue:** The effect correctly unlocks on unmount and when `isSaving` transitions to false. But it does not protect against `isSaving` being stuck at `true` forever — which happens if `SaveAllBar.doSave` throws a non-caught error, calls `setIsSaving(false)` skipped, and the component stays mounted.
- **Verification needed:** Read `SaveAllBar.doSave` lines 200-400 (beyond current read window) to confirm whether every error path calls `setIsSaving(false)`.
- **Severity:** **Medium**
- **Confidence:** **Medium** (pending verification of SaveAllBar error paths)
- **Kind of fix:** Wrap the save in a try/finally that guarantees `setIsSaving(false)` fires, or add a "stuck save detector" that times out `isSaving` after e.g. 30 seconds.
- **Phase recommendation:** **PR 2a** bundled with A.3's autosave fix.

## A.8 — NEW Low Finding: `UnifiedContentEditor.tsx:229` contains a 4th hardcoded `h-[calc(100vh-4rem)]`

- **File:** `src/components/admin/unified-editor/UnifiedContentEditor.tsx:229`
- **Evidence:** `<div className="flex h-[calc(100vh-4rem)] flex-col overflow-hidden bg-surface-light">`
- **Issue:** The first-pass Phase 1 enumeration of hardcoded viewport math listed four files (`ContentEditorIndex.tsx:287`, `[id]/page.tsx:47`, `new/page.tsx:43`, `[id]/loading.tsx:3`). `UnifiedContentEditor.tsx:229` is a **fifth** instance inside a client component — and because `UnifiedContentEditor` is rendered by `[id]/page.tsx` and `new/page.tsx`, this class will clip when the parent also sets its own `h-[calc(...)]` with a different subtraction. The parent's `h-[calc(100vh-4rem)]` plus this child's `h-[calc(100vh-4rem)]` mean the child reads its own `100vh` not the constrained parent — a layout bug under certain admin shell configurations.
- **Severity:** **Low** (mostly UX, but listed here because it compounds with L-2-era layout fixes from the sibling UX audit)
- **Confidence:** **High**
- **Kind of fix:** Change `h-[calc(100vh-4rem)]` to `h-full` and rely on the parent's established height chain.
- **Phase recommendation:** **PR 1 item 1.1-bis** OR a cross-audit coordination note. This item bridges the UX audit and the performance audit — coordinate with whichever plan ships first. Cheap to land in either.

## A.9 — POSITIVE Finding (INFORMATIONAL ONLY): `TaxonomyTree` IS memoized

- **File:** `src/components/shared/taxonomy-tree/TaxonomyTree.tsx` (confirmed by follow-up read)
- **Evidence:** `React.memo` wraps `HighlightMatch`, `TreeRow`, and `TreeBranch` subcomponents. The outermost `TaxonomyTree` is a context provider wrapping these memoized children.
- **Implication:** IF the memoization is directly confirmed by line-cited reads of `TaxonomyTree.tsx`, the first-pass plan's P-4 / rendering-cost concerns about the tree would be overstated. Tree re-renders on parent state change would not cascade into every row — only the rows whose props genuinely changed (`activeNodeId`, expanded state) would re-render.
- **Caveat (Critic round 2):** The memoization claim is currently **second-hand** from the Round 2 Explorer agent and NOT yet line-cited. Do NOT let this finding retroactively invalidate first-pass tree render-cost concerns until someone opens `TaxonomyTree.tsx` and cites the specific `React.memo` lines. Keep first-pass findings active until confirmed.
- **Severity:** **Informational only**
- **Phase recommendation:** Resolve by direct read in a follow-up. Do not act on it in PR 1 or PR 2a.

## A.12 — NEW High Finding: `UnifiedContentEditor` fires unconditional `router.refresh()` on every article update

> **Numbering note:** A.12 appears between A.9 and A.10 because it was added in the Critic round 3 revision pass. It is numerically out-of-order but thematically belongs next to A.3 (autosave) which is why it's grouped with the save-path findings, not appended at the end.

- **File:** `src/components/admin/unified-editor/UnifiedContentEditor.tsx:258-265`
- **Evidence:**
  ```tsx
  onSaveComplete={({ articleId, created }) => {
    if (created) {
      router.replace(`/admin/knowledge/${articleId}`)
      return
    }
    router.refresh()  // ← fires on EVERY update save
  }}
  ```
- **Issue:** Every successful article update — whether triggered by the 10-second autosave (A.3) or a manual save — calls `router.refresh()`, which re-runs the server component tree of `/admin/knowledge/[id]`. That re-runs **`getArticleFull` (uncached, P-2)**, **both sequential batches at `[id]/page.tsx:24-44` (P-3)**, and re-hydrates `UnifiedContentEditor` with fresh server data. Combined with A.3 (10-second autosave), this fires the full detail-page re-fetch **every 10 seconds during active editing** — catastrophic throughput waste.
- **Interaction with existing findings:**
  - **Multiplies P-2 cost:** without Phase 2.1's cache, every autosave pays a full `wiki_articles` roundtrip.
  - **Multiplies P-3 cost:** every autosave pays 4 sequential DB roundtrips via the `[id]/page.tsx` batches.
  - **Interacts with L-1:** every autosave → `router.refresh` → new `taxonomyTree` reference → `QuestionsTableClient` re-fetches (until Phase 1.2 ships).
  - **Interacts with A.3:** the interval × the refresh storm is how admins actually experience admin "feeling slow" during editing sessions.
- **Why it matters:** This is the single most expensive compounding pattern in the admin knowledge surface. The first-pass plan identified each individual finding but did not connect them via this `router.refresh()` trigger.
- **Severity:** **High** (arguably **Critical** under its compounding behavior, but listed High to avoid re-triggering severity inflation)
- **Confidence:** **High** (directly verified at the cited lines)
- **Kind of fix (multiple valid options):**
  1. **Replace `router.refresh()` with scoped revalidation:** call `revalidateTag('article:${id}')` inside `updateArticleFull` (already done at `content.ts:734` for the wiki tag) and rely on Next.js to re-fetch only what's stale. No `router.refresh()` on the client path.
  2. **Gate on dirty state:** only refresh if the save actually changed something the client cares about (e.g., status transitions from draft → published); otherwise drop the refresh entirely. Client state already has the fresh content because the user typed it.
  3. **Debounce the refresh:** batch multiple autosaves into a single refresh at most every N seconds, so a user typing continuously sees at most one refresh per minute instead of six per minute.
- **Phase recommendation:** **PR 2a** alongside A.3 (autosave refactor), because both are behavioral changes to the save path. The fix for A.12 is arguably the single most impactful perf fix in the entire plan — bundle it carefully.
- **Cross-reference to first-pass plan:** First-pass §5 L-6 noted that `bulkDeleteArticles` fires `revalidateTag('wiki','max')` into a vacuum. A.12 is the same anti-pattern at the `UnifiedContentEditor` save path — `router.refresh()` doing expensive work where `revalidateTag` would suffice.

## A.10 — Items Still Unverified (explicitly open)

1. **`SaveAllBar.tsx` lines 200-500** — not read. Need to verify: does the save loop use `Promise.all(promises)` to await concurrently? Does every error path reset `isSaving`? Is the `conflictWarning` state at line 94 actually wired to UI? Is the `pendingSaveRef` at line 96 used anywhere?
2. **`DirtyStateProvider`** — not read. The `useDirtyState()` hook is consumed heavily but its implementation was not opened. Does `questionsDirty` live in a Map (mutable reference footgun) or a Set (safer for React state)?
3. **`content.ts` lines 350-end** — only partially read. The `updateArticleFull`, `saveArticleFull`, `deleteArticle` implementations matter for Phase 2.1's cache invalidation; A.4's cache-tag fix must enumerate every call site.
4. **`supabase/migrations/**`** — not read. §9 Q11a and Q11b (RLS audit) remain blocked.
5. **`next.config.*`** — not read. Cannot confirm whether `experimental.reactCompiler` is enabled (would change memoization recommendations) or whether `staleTimes` is tuned.
6. **`package.json` for version pinning** — not read directly. First-pass plan assumed React 19.2.4 and Next 16.1.6 per CLAUDE.md, but runtime package resolution was not verified.

Resolve these in a follow-up pass before PR 1 execution if Phase A items land in PR 1.

## A.11 — Updated Fastest Wins (consolidated across both passes)

These are the **net fastest wins** after Round 2, ordered by impact × confidence × low-risk:

1. **1.1** Merge the double-questions fetch in `getContentEditorIndexData`. (unchanged)
2. **1.2** Stop `QuestionsTableClient` ghost re-fetch via `fetchQuestionsForNode` helper. (unchanged)
3. **A.2-PR1 (NEW — High)** Merge `getQuestionsByTopicIds` 3-batch pattern via join + parallel dispatch. **Largest latency win in this appendix.** Every taxonomy-tree click benefits.
4. **2.3** `buildTree` single-pass. (unchanged)
5. **2.4** `enrichedArticles` map lookup. (unchanged)
6. **A.5-PR1 (NEW — Medium)** Slim `getQuestionsByTopicIds` select list to drop `options` / `rationale` / `code_citation` from the list view. Gated on a quick grep to confirm UI does not consume those fields on list rows.
7. **2.1** Cache `getArticleFull` with `createStaticClient` — gated on Q11a. (unchanged)
8. **2.2** Flatten `[id]/page.tsx` batches. (unchanged)
9. **3.4** `updateUrl` footgun fix. (unchanged)
10. **A.8 (NEW — Low)** `UnifiedContentEditor.tsx:229` `h-full` fix. (coordinate with UX audit — cheap bridge item)

**PR 1 Budget Statement (REVISED):** Round 1 PR 1 was sized at ~1.5 engineering days. Adding A.2-PR1 (~3-4 hours, non-trivial because of the `uniqueTopics` dependency check), A.5-PR1 (~1 hour + grep audit), and A.8 (~15 minutes) expands PR 1 to **~2 engineering days**. If that budget is unavailable, **defer A.2-PR1 to PR 1.5 or bundle it into PR 2a** — it is the only non-trivial new item; the rest are minor.

**Removed from PR 1 prerequisites** (were blocking, no longer blocking):
- §9 Q4 (`QuestionEditor` save path) — resolved: save path flows through `SaveAllBar` / `UnifiedContentEditor`, does not affect Phase 1.2.
- §9 Q6 (`UnifiedContentEditor` mirror-prop pattern) — resolved: no mirror pattern exists in `UnifiedContentEditor`; Phase 1.3 is admin-local to `ContentEditorIndex.tsx` only.

**New PR 1 prerequisites** (added by this appendix):
- Verify `QuestionsTableClient` and `QuestionsPanel` list-view row rendering does NOT consume `options` / `rationale` / `code_citation` fields from the `getQuestionsByTopicIds` response, so that A.5-PR1's slim-select is safe.
- Verify `uniqueTopics` in `getQuestionsByTopicIds` can be derived from the input `topicIds` parameter (not from batch 1's result), so that A.2-PR1's parallelization is sound.

**New PR 2a items added** (behavior-change PR):
- **A.12 (HIGHEST IMPACT — High)** Replace `router.refresh()` in `UnifiedContentEditor.tsx:264` with scoped `revalidateTag` or drop entirely. This is the single most important perf item in the entire plan because of its compounding interaction with A.3, P-2, P-3, and L-1. **Ship this FIRST in PR 2a, before the A.3 autosave refactor.**
- A.3 Autosave refactor (interval → debounced timeout + drop custom event pub/sub)
- A.6 Parallel article + question save when new-article dependency is absent (low-priority, defer if tight)
- A.7 `isSaving` stuck-state protection with try/finally

**New PR 2b items added** (caching PR):
- A.4 Add `admin_knowledge: 'admin-knowledge'` to `CACHE_TAGS` in `src/lib/actions/cache-tags.ts:3-7` and wire `revalidateTag(CACHE_TAGS.admin_knowledge, 'max')` into every admin mutation in `bulk.ts`, `content.ts` save/update paths, and `questions.ts` — bundled with Phase 2.5.

**Sequencing rule for PR 2a:** Ship A.12 → A.3 → A.7 → (optionally A.6). A.12 first because it is the highest-impact single change; A.3 second because it is what makes A.12 fire frequently; A.7 third because it protects the updated save flow; A.6 last and optional.
