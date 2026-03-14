# UAT: Phase 1 Foundations

**Phase Goal:** Establish the "Core Loop" (Syllabus → Wiki → Quiz) with Apple HIG aesthetic and robust persistence.

---

## 🧪 Test Session: March 14, 2026

### 1. Onboarding & Discipline Selection
**Scenario:** A new user logs in and is forced to pick a discipline.
- [x] User is redirected to `/onboarding` upon first login.
- [x] Discipline list is loaded from `disciplines` table.
- [x] Selecting a discipline updates `user_global_stats`.
- [x] User is redirected to `/dashboard` after selection.
- [x] Dashboard shows the selected discipline name in the sidebar.

### 2. Wiki Navigation & Wayfinding
**Scenario:** User explores the syllabus and reads an article.
- [x] Sidebar renders a nested taxonomy tree (Internal Wiki Sidebar).
- [x] Clicking a leaf node navigates to `/dashboard/wiki/[slug]`.
- [x] Wiki article content is rendered correctly from MDX (upgraded from Markdown).
- [x] Secondary sidebar (ToC) shows H2/H3 headings and allows scrolling to sections.
- [x] Active taxonomy node is highlighted in the sidebar.
- [x] Auto-scroll and highlight feature for search results implemented.

### 3. Camp Mode Quizzing
**Scenario:** User takes a low-stakes diagnostic quiz.
- [x] Quiz is loaded from `quiz_sessions` or created fresh via Testing Hub.
- [x] Layout uses high-density professional renderer (16:9 image, 2-column options).
- [x] "Check Answer" button manually reveals the rationale.
- [x] Rationale is summary-style in a dedicated card.
- [x] Interaction is fluid (correct answer turns green, incorrect selection turns red).
- [x] Progress is auto-saved to `quiz_sessions` (10s interval or on check).
- [x] Refreshing the page persists the current question and selected answers.

### 4. Omnibar (Cmd+K)
**Scenario:** User searches for content across the platform.
- [x] Cmd+K opens the search palette.
- [x] Search performs full-text queries against `wiki_articles` (titles and content).
- [x] Sidebar peek shows a preview of the article.
- [x] Recently viewed articles are displayed in a horizontal footer.
- [x] Clicking a result navigates to the correct slug with highlight parameter.
- [x] UI features Apple-style red close button and click-outside-to-exit.

### 5. Aesthetic & HIG Audit
**Scenario:** Visual verification of the interface.
- [x] Zinc palette (Zinc-50 bg, Zinc-100/200 borders).
- [x] Semantic colors (Emerald-600 for correct, Red-600 for critical/wrong).
- [x] Clean typography (Inter/Geist) with consistent spacing.
- [x] Triple-column independent scrolling for Wiki articles.

### 6. Security (RLS) Audit
**Scenario:** Verification of data isolation.
- [x] Standard user cannot read other users' `user_global_stats`.
- [x] Standard user cannot read other users' `quiz_sessions`.
- [x] Standard user cannot read other users' `user_interactions`.
- [x] Authenticated user can read the public syllabus (`disciplines`, `taxonomy_tree`, `wiki_articles`).

---

## 🚩 Issues & Gaps
- **Fixed:** Redirect loop in onboarding middleware.
- **Fixed:** MDX rendering build errors and RSC compatibility.
- **Fixed:** Database schema desync (missing columns in `user_interactions`).
- **Fixed:** Omnibar "No results" flash and local filtering issues.

## 🛠️ Fix Plans
- All identified Phase 1 bugs have been fixed and verified.
