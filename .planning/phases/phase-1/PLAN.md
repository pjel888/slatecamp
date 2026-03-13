# PLAN: Phase 1 Foundations (The Core Loop)

## 📋 Objectives

1.  **Syllabus Infrastructure:** Implement `disciplines` and `taxonomy_tree` as the source of truth for all licensure verticals.
2.  **The Wiki CMS:** Create a high-legibility, taxonomy-mapped article viewer (`WikiArticle`) following Apple HIG.
3.  **Camp Mode Quizzing:** Develop the basic `QuizRenderer` for active recall with instant feedback.
4.  **Auth & Onboarding:** Integrate `user_subscriptions` and `user_global_stats` into the existing auth flow.

---

## 🛠️ Step 1: Database Initialization

- **Action:** Apply the core engine tables from `DATABASE_SCHEMA.sql` to the Supabase project.
- **Verification:** Ensure all tables, enums (test_mode, subscription_tier), and RLS policies are active.
- **Seeding:** Insert 'Architecture Licensure Exam' (ALE) into `disciplines` and build the Level 1 taxonomy tree nodes.

## 📄 Step 2: The Auth & Shell Refactor

- **Action:** Rewrite `src/lib/supabase/bootstrap.ts` and `src/app/dashboard/layout.tsx`.
- **Logic:** 
  - `bootstrap.ts`: Ensure `user_subscriptions` (tier: free) and `user_global_stats` exist for new users.
  - `layout.tsx`: Fetch from `user_global_stats` and `disciplines`.
- **Aesthetic:** Apply the first layer of **Apple HIG** (clean sidebar, SF Pro typography via Inter, subtle borders).

## 🧠 Step 3: Camp Mode Quizzing

- **Action:** Develop `QuizRenderer` in `src/components/dashboard/`.
- **Features:**
  - `test_mode = 'camp'` for instant rationale feedback.
  - Basic question/option layout using Apple HIG aesthetics (zinc palette, semantic blue accents).
  - 10-second auto-save to `quiz_sessions`.
- **Route:** Update `src/app/dashboard/testing/page.tsx` as a functional entry point.

## 👤 Step 4: Dashboard Integration

- **Action:** Update `src/app/dashboard/layout.tsx` to use the new `disciplines` table.
- **Sidebar:** Dynamic navigation based on the `taxonomy_tree`.
- **State:** Inject `user_subscriptions` tier info into the `TierProvider`.

---

## ✅ Verification Strategy

- **Manual Audit:** Verify the Apple HIG aesthetic (typography, radii, and whitespace).
- **Functionality Test:** 
  - [ ] Search a Wiki article via Omnibar.
  - [ ] Complete a 5-question Camp Mode quiz with rationales.
  - [ ] Verify 10s auto-save persists quiz state after a page refresh.
- **SQL Audit:** Confirm that all new tables are under strict RLS policies.
