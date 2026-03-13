# RESEARCH: Phase 1 Foundations

## 🔎 Analysis of Current Codebase

- **Schema Mismatch:** The current codebase (`src/lib/actions/*`, `src/app/dashboard/*`) uses an older schema (`profiles`, `exam_profiles`, `board_exams`, `subjects`, `wiki_pages`, `wiki_categories`) instead of the unified schema in `DATABASE_SCHEMA.sql` (`disciplines`, `taxonomy_tree`, `wiki_articles`, `questions`).
- **Dashboard Shell:** `src/app/dashboard/layout.tsx` is heavily coupled to the old `exam_profiles` and `board_exams` tables. It handles auth, profile bootstrapping, and tier gating.
- **Wiki Implementation:** Existing `src/lib/actions/wiki.ts` and `wiki-pages.ts` use `wiki_pages` and `wiki_categories`, while the new requirements call for a taxonomy-mapped `wiki_articles` structure.
- **Testing Page:** `src/app/dashboard/testing/page.tsx` is a placeholder, but `src/lib/actions/onboarding.ts` contains significant logic for `questions` and `review_sessions`.

## 🛠️ Infrastructure Requirements (Unified OS)

1.  **Syllabus Tree:** Migration or mapping from old `subjects` to new `taxonomy_tree`.
2.  **Wiki CMS:** Shift from category-based pages to taxonomy-mapped articles.
3.  **Auth Integration:** Reconcile `ensureProfileAndExamProfile` (old) with the new `user_subscriptions` and `user_global_stats`.

## 📍 Strategy for Phase 1

- **Incremental Migration:** Instead of a destructive rewrite, we will introduce the new tables from `DATABASE_SCHEMA.sql` alongside the old ones, or progressively update existing logic to the new schema.
- **Sidebar Update:** The Sidebar needs to map to the new `disciplines` and `taxonomy_tree` nodes.
- **Article Viewer:** Implement the new `WikiArticle` component based on Apple HIG, fetching from `wiki_articles`.
