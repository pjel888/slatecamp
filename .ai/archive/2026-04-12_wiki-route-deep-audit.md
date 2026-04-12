# Wiki Route Deep Audit Report (2026-04-12)

**Audit Scope:** Full Wiki feature architecture, rendering pipeline, data flow, schema integrity, and pedagogical integration.
**Status:** COMPLETE
**Lead Auditor:** Gemini CLI (Senior Platform Architect)

## 1. Executive Summary

The Slatecamp Wiki is a highly optimized, pedagogical knowledge base tightly coupled with the LEA taxonomy. While the rendering pipeline (`next-mdx-remote/rsc`) and data fetching layer (RPC + caching) are robust, the system suffers from significant action-layer duplication and a complete lack of automated test coverage for user-facing features. The schema is functionally correct in the live database but is inconsistently documented in the main `DATABASE_SCHEMA.sql`.

---

## 2. Severity-Ranked Findings

### [HIGH] Layer Duplication & Architectural Drift
*   **Issue:** Two primary action files (`wiki.ts` and `wiki-actions.ts`) provide overlapping, inconsistent implementations of core logic.
*   **Evidence:** `getWikiArticleBySlug` in `wiki.ts` uses a standard query with joins, while the version in `wiki-actions.ts` uses an optimized RPC (`get_article_with_node`) and handles fallback logic.
*   **Risk:** Features may inadvertently use older, slower, or less resilient paths, leading to maintenance debt and runtime bugs.

### [HIGH] Schema Documentation Gap
*   **Issue:** The `wiki_highlights` table, used by `WikiTextSelection` and `wiki-interactions.ts`, is missing entirely from `DATABASE_SCHEMA.sql`.
*   **Evidence:** Grep search on `DATABASE_SCHEMA.sql` returned 0 results for `wiki_highlights`, despite being present in `src/types/supabase.ts`.
*   **Risk:** Infrastructure-as-code drift; new environments or local setups using `DATABASE_SCHEMA.sql` will fail to support user highlights.

### [MEDIUM] Zero User-Facing Test Coverage
*   **Issue:** No unit or integration tests exist for the MDX rendering pipeline, widget resolution, or user interactions (bookmarks, feedback, reading progress).
*   **Evidence:** `find src -name "*.test.ts"` showed only `admin/wiki.test.ts`, which covers a single error case in article creation.
*   **Risk:** High regression risk during design system migrations or component refactors.

### [MEDIUM] Silent Failure UX
*   **Issue:** Interactive actions (bookmarking, highlighting, feedback) return boolean success flags but have no robust retry or error state UI beyond a generic toast.
*   **Evidence:** `WikiTextSelection.tsx` and `WikiBookmarks.tsx` catch server action failures but do not provide recovery paths for the user.
*   **Risk:** Data loss for users in poor connectivity scenarios (common in ALE prep contexts).

---

## 3. Rendering Pipeline Audit (Verified)

The 7-stage pipeline in `WikiArticle.tsx` is correctly implemented but contains several legacy cleanups:

1.  **Preprocessing:** Correctly handles newline normalization and HTML comment stripping.
2.  **EI Injection:** Successfully injects `<EIPrompt>` components by matching `insert_after_heading` against article content.
3.  **Sanitization:** Robust handling of backslash escaping and raw `<` characters in `sanitizeMDX`.
4.  **Widget Resolution:** Uses dynamic `import()` in `registry.ts`. *Correction:* Only 14 widgets are currently registered, despite the spec claiming 19.
5.  **Compile Step:** Uses `compileMDX` with `remark-gfm`.
6.  **Fallback:** MDX compile errors are caught and render raw text in an amber `<pre>` block. This is functional but provides a poor user experience.

---

## 4. Data Flow & Network Audit

### Route-Level Fetching
*   **[slug]/page.tsx:** Correctly uses `Promise.all` for parallel fetching of secondary data (EI, sources, siblings, related topics).
*   **Caching:** Extensive use of `unstable_cache` in `cached-queries.ts` with appropriate TTLs (1h-2h) and tag-based revalidation (`CACHE_TAGS.wiki`, `CACHE_TAGS.taxonomy`).

### Interaction Matrix
| Interaction | Trigger | Dependency | Table Touched |
|-------------|---------|------------|---------------|
| Read Track | On Mount | `recordArticleRead` | `wiki_article_reads` |
| Progress | On Unload | `updateReadProgress` | `wiki_article_reads` |
| Bookmark | Popover Click | `addWikiBookmark` | `wiki_bookmarks` |
| Highlight | Text Select | `addWikiHighlight` | `wiki_highlights` |
| Quiz | Button Click | `getWikiQuizQuestions` | `questions`, `quiz_sessions` |

---

## 5. Component Inventory (Audit Verified)

*   **Custom Tags:** 50+ registered in `WIKI_COMPONENTS`.
*   **Stubs:** `SPP206RefServices` and `SPP207RefServices` are confirmed no-op stubs.
*   **Aliases:** `GenericBlock` handles 15+ "AI-hallucinated" tag names, preventing render crashes.
*   **Identity Locks:** `RevealBlock` uses `@use-gesture/react` for identity-preserving interaction (confirmed).

---

## 6. Technical Debt & Cleanup Items

1.  **Consolidate Actions:** Delete `src/lib/actions/wiki.ts` and move unique logic to `wiki-actions.ts`.
2.  **Schema Sync:** Update `DATABASE_SCHEMA.sql` to include `wiki_highlights` and verify `wiki_article_feedback` foreign keys.
3.  **Refactor Buttons:** Convert raw `<button>` elements in `WikiSidebarShell` and `WikiBookmarks` to shadcn `Button` components.
4.  **Add Tests:** Prioritize testing the `sanitizeMDX` utility and the `getWikiQuizQuestions` selection logic.
5.  **Clean dead code:** Remove legacy `WikiCategory` and `WikiPage` types from `src/types/app.ts`.

---
*End of Audit Report*
