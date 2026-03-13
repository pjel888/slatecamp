# UAT: Phase 1 Foundations

**Phase Goal:** Establish the "Core Loop" (Syllabus → Wiki → Quiz) with Apple HIG aesthetic and robust persistence.

---

## 🧪 Test Session: [Date]

### 1. Onboarding & Discipline Selection
**Scenario:** A new user logs in and is forced to pick a discipline.
- [ ] User is redirected to `/onboarding` upon first login.
- [ ] Discipline list is loaded from `disciplines` table.
- [ ] Selecting a discipline updates `user_global_stats`.
- [ ] User is redirected to `/dashboard` after selection.
- [ ] Dashboard shows the selected discipline name in the sidebar.

### 2. Wiki Navigation & Wayfinding
**Scenario:** User explores the syllabus and reads an article.
- [ ] Sidebar renders a nested taxonomy tree.
- [ ] Clicking a leaf node navigates to `/dashboard/wiki/[slug]`.
- [ ] Wiki article content is rendered correctly from Markdown.
- [ ] Secondary sidebar (ToC) shows H2/H3 headings and allows scrolling to sections.
- [ ] Active taxonomy node is highlighted in the sidebar.

### 3. Camp Mode Quizzing
**Scenario:** User takes a low-stakes diagnostic quiz.
- [ ] Quiz is loaded from `quiz_sessions` or created fresh.
- [ ] Layout uses horizontal slides (one question at a time).
- [ ] "Check Answer" button manually reveals the rationale.
- [ ] Rationale is summary-style.
- [ ] Interaction is fluid (can toggle options after checking).
- [ ] Progress is auto-saved to `quiz_sessions` (10s interval or on check).
- [ ] Refreshing the page persists the current question and selected answers.

### 4. Omnibar (Cmd+K)
**Scenario:** User searches for content across the platform.
- [ ] Cmd+K opens the search palette.
- [ ] Search performs full-text queries against `wiki_articles` (titles and content).
- [ ] Sidebar peek shows a preview of the article.
- [ ] Recently viewed articles are displayed in the palette.
- [ ] Clicking a result navigates to the correct slug.

### 5. Aesthetic & HIG Audit
**Scenario:** Visual verification of the interface.
- [ ] Zinc palette (Zinc-50 bg, Zinc-100/200 borders).
- [ ] Semantic Blue accents for active states and primary actions.
- [ ] Clean typography (Inter/Geist) with consistent spacing.
- [ ] Subtle radii and whitespace following Apple HIG.

### 6. Security (RLS) Audit
**Scenario:** Verification of data isolation.
- [ ] Standard user cannot read other users' `user_global_stats`.
- [ ] Standard user cannot read other users' `quiz_sessions`.
- [ ] Standard user cannot read other users' `user_interactions`.
- [ ] Authenticated user can read the public syllabus (`disciplines`, `taxonomy_tree`, `wiki_articles`).

---

## 🚩 Issues & Gaps
*None reported yet.*

## 🛠️ Fix Plans
*None needed yet.*
