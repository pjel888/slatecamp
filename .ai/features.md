# Features

**Last Updated:** 2026-04-27

This document catalogues the current implemented features of SlateCamp. Every feature is grounded in code, routes, tests, or schema. Aspirational or planned features are not listed.

## Legend

| Status | Meaning |
|--------|---------|
| Complete | Implemented and functional in current code |
| Partial | Core functionality exists but has known gaps |
| Prototype | Implemented but may need polish or hardening |
| Stubbed | Surface exists but backend or logic is incomplete |
| Unknown | Inferred from code but not fully verified |

---

## 1. Authentication & Onboarding

### 1.1 Email/Password Auth
- **Purpose:** User registration, login, password reset
- **Routes:** `/login`, `/register`, `/forgot-password`, `/auth/reset-password`
- **Components:** `src/components/auth/`
- **Backend:** Supabase Auth, `src/lib/supabase/middleware.ts`
- **Data:** `auth.users`, `profiles`
- **Status:** Complete
- **Evidence:** `src/app/(auth)/login/page.tsx`, `src/app/(auth)/register/page.tsx`, `src/lib/supabase/middleware.ts`

### 1.2 OAuth Login
- **Purpose:** Social login via Google, etc.
- **Routes:** `/auth/callback`
- **Backend:** `src/app/auth/callback/route.ts`
- **Data:** `auth.users`, UTM attribution tracking
- **Status:** Complete
- **Evidence:** `src/app/auth/callback/route.ts`

### 1.3 Onboarding
- **Purpose:** New user discipline selection, target exam date, completion exam path
- **Routes:** `/onboarding`, `/onboarding/comp-exam`
- **Components:** `src/components/auth/`
- **Data:** `profiles` (onboarding fields)
- **Status:** Complete
- **Evidence:** `src/app/(auth)/onboarding/page.tsx`

---

## 2. Dashboard & Student Hub

### 2.1 Dashboard Home
- **Purpose:** Study overview, quick actions, progress cards
- **Routes:** `/dashboard`
- **Components:** `src/components/dashboard/`
- **Backend:** `src/lib/actions/dashboard/`
- **Status:** Complete
- **Evidence:** `src/app/dashboard/page.tsx`, `src/components/dashboard/`

### 2.2 Heatmap
- **Purpose:** Visual study activity calendar
- **Routes:** `/dashboard/heatmap`
- **Components:** `src/components/dashboard/`
- **Status:** Complete
- **Evidence:** `src/app/dashboard/heatmap/page.tsx`

### 2.3 Analytics
- **Purpose:** Performance metrics, readiness visualization
- **Routes:** `/dashboard/analytics`, `/dashboard/analytics/advanced`
- **Components:** `src/components/analytics/`
- **Backend:** `src/lib/actions/analytics/`, `src/lib/queries/ceo/analytics/`
- **Data:** `user_global_stats`, `readiness_score_snapshots`
- **Status:** Complete
- **Evidence:** `src/app/dashboard/analytics/page.tsx`

### 2.4 Settings & Billing
- **Purpose:** User preferences, subscription management
- **Routes:** `/dashboard/settings`, `/dashboard/settings/billing`
- **Components:** `src/components/settings/`
- **Backend:** `src/lib/actions/dashboard/`
- **Data:** `profiles`, `user_subscriptions`
- **Status:** Complete
- **Evidence:** `src/app/dashboard/settings/page.tsx`

---

## 3. Quiz Engine

### 3.1 Quiz Setup
- **Purpose:** Select test mode, subject, question count
- **Routes:** `/quiz`, `/quiz/setup`
- **Components:** `src/components/quiz-v2/`
- **Backend:** `src/lib/actions/quiz-v2/`
- **Data:** `questions`, `taxonomy_tree`
- **Status:** Complete
- **Evidence:** `src/app/quiz/page.tsx`, `src/app/quiz/setup/page.tsx`

### 3.2 Live Quiz Session
- **Purpose:** Active question answering, timer, confidence selection
- **Routes:** `/quiz/session/[sessionId]`
- **Components:** `src/components/quiz-v2/`
- **Backend:** `src/lib/actions/quiz-v2/`
- **Data:** `quiz_sessions`, `user_question_responses`, `user_interactions`
- **Status:** Complete
- **Evidence:** `src/app/quiz/session/[sessionId]/page.tsx`, `useQuizStore.ts`

### 3.3 Quiz Results & Review
- **Purpose:** Score summary, per-question rationale, error analysis
- **Routes:** `/quiz/results`, `/quiz/review`
- **Components:** `src/components/quiz-v2/`
- **Backend:** `src/lib/actions/quiz-v2/`
- **Data:** `quiz_sessions`, `user_question_responses`
- **Status:** Complete
- **Evidence:** `src/app/quiz/results/page.tsx`, `src/app/quiz/review/page.tsx`

### 3.4 Test Modes
- **Purpose:** Camp, Timed, Subject, Storm, Chill, Custom, Focus Review, Full Exam, Endurance, Article Review
- **Routes:** `/quiz/setup`, `/quiz/session/*`
- **Backend:** `src/lib/quiz/`
- **Data:** `quiz_sessions.test_mode`
- **Status:** Complete
- **Evidence:** `DATABASE_SCHEMA.sql` (enum `test_mode`), `src/lib/quiz/`

---

## 4. Wiki & Content

### 4.1 Article Reading
- **Purpose:** Read taxonomy-linked wiki articles
- **Routes:** `/dashboard/wiki/[slug]`
- **Components:** `src/components/wiki/`
- **Backend:** `src/lib/actions/wiki/`, `get_article_with_node()` SQL function
- **Data:** `wiki_articles`, `wiki_article_taxonomy`, `taxonomy_tree`
- **Status:** Complete
- **Evidence:** `src/app/dashboard/wiki/[slug]/page.tsx`, `DATABASE_SCHEMA.sql`

### 4.2 Article Search & Navigation
- **Purpose:** Browse and search wiki content
- **Routes:** `/dashboard/wiki`
- **Components:** `src/components/wiki/`
- **Backend:** `src/lib/actions/wiki/`
- **Data:** `wiki_articles`, `taxonomy_tree`
- **Status:** Complete
- **Evidence:** `src/app/dashboard/wiki/page.tsx`

### 4.3 Bookmarks & Highlights
- **Purpose:** Save articles and highlight text
- **Routes:** `/dashboard/wiki` (in-article actions)
- **Components:** `src/components/wiki/`
- **Backend:** `src/lib/actions/wiki/`
- **Data:** `wiki_bookmarks`, `wiki_highlights`
- **Status:** Complete
- **Evidence:** `DATABASE_SCHEMA.sql`

### 4.4 Article Feedback
- **Purpose:** Rate and comment on articles
- **Components:** `src/components/wiki/`
- **Data:** `wiki_article_feedback`
- **Status:** Complete
- **Evidence:** `DATABASE_SCHEMA.sql`

### 4.5 Embedded Quiz Widgets
- **Purpose:** In-article quiz questions
- **Components:** `src/components/wiki/`
- **Backend:** `src/lib/actions/wiki/`
- **Data:** `wiki_articles` (content JSONB), `questions`
- **Status:** Complete
- **Evidence:** `src/components/wiki/`

---

## 5. 3D Lab

### 5.1 3D Learning Modules
- **Purpose:** Interactive architectural visualization
- **Routes:** `/dashboard/3d-lab`, `/dashboard/3d-lab/[moduleId]`
- **Components:** `src/features/3d-lab/`, `src/components/r3f/`
- **Backend:** `src/lib/actions/3d-lab/` (if any), `models_3d` table
- **Data:** `models_3d`, `spatial_hotspots`
- **Status:** Complete
- **Evidence:** `src/app/dashboard/3d-lab/`, `src/features/3d-lab/`

### 5.2 Scene Types
- Classical Orders
- FAR Playground
- NBCP Envelope
- Stairway geometry
- And others in the scene registry
- **Evidence:** `src/features/3d-lab/scenes/`

### 5.3 Hotspot System
- **Purpose:** Clickable annotations and in-3D quizzes
- **Components:** `src/features/3d-lab/components/`
- **Data:** `spatial_hotspots`
- **Status:** Complete
- **Evidence:** `DATABASE_SCHEMA.sql`, `src/features/3d-lab/`

---

## 6. Camp Trails

### 6.1 Trail Enrollment & Progress
- **Purpose:** Structured multi-day study paths
- **Routes:** `/dashboard/trails`, `/dashboard/trails/[trailId]`
- **Components:** `src/components/trails/`
- **Backend:** `src/lib/actions/trails/` (inferred)
- **Data:** `camp_trails`, `trail_days`, `trail_steps`, `user_trail_enrollments`, `user_trail_progress`
- **Status:** Complete
- **Evidence:** `src/app/dashboard/trails/`, `DATABASE_SCHEMA.sql`

---

## 7. Drills & Flashcards

### 7.1 Drills
- **Purpose:** Rapid-fire question practice
- **Routes:** `/dashboard/drills`
- **Components:** `src/components/quiz-v2/`
- **Backend:** `src/lib/actions/quiz-v2/`
- **Status:** Complete
- **Evidence:** `src/app/dashboard/drills/page.tsx`

### 7.2 Flashcards / SRS
- **Purpose:** Spaced repetition card review
- **Routes:** `/dashboard/flashcards`
- **Components:** `src/components/`
- **Backend:** `src/lib/srs/`
- **Data:** `user_srs_cards`
- **Status:** Complete
- **Evidence:** `src/lib/srs/`, `DATABASE_SCHEMA.sql`

---

## 8. Notes

### 8.1 Note Taking
- **Purpose:** Rich-text notes linked to topics, questions, articles
- **Routes:** `/dashboard/notes`
- **Components:** `src/components/notes/`
- **Backend:** `src/lib/actions/notes/` (inferred)
- **Data:** `notes`, `note_folders`
- **Status:** Complete
- **Evidence:** `src/app/dashboard/notes/`, `DATABASE_SCHEMA.sql`

---

## 9. Calculators & Tools

### 9.1 Construction Calculators
- **Purpose:** Material quantity and cost estimators
- **Routes:** `/calculators/chb`, `/calculators/drywall`, `/calculators/flooring`, `/calculators/paint`
- **Components:** `src/components/calculators/`
- **Backend:** `src/app/calculators/_lib/`
- **Status:** Complete
- **Evidence:** `src/app/calculators/`, `src/app/calculators/_lib/__tests__/`

### 9.2 Utility Tools
- **Purpose:** Floor tiles, lot plotter, wall paint
- **Routes:** `/tools/floor-tiles`, `/tools/lot-plotter`, `/tools/wall-paint`
- **Components:** `src/components/tools/`
- **Status:** Complete
- **Evidence:** `src/app/tools/`

### 9.3 Wall Configurator
- **Purpose:** Stepped wall assembly designer
- **Routes:** `/dashboard/wall-configurator` (inferred)
- **Components:** `src/features/wall-configurator/`
- **Status:** Complete
- **Evidence:** `src/features/wall-configurator/`

---

## 10. Admin Portal

### 10.1 Content Editor
- **Purpose:** Create and edit wiki articles
- **Routes:** `/admin/articles`, `/admin/articles/[id]`
- **Components:** `src/components/admin/`
- **Backend:** `src/lib/actions/admin/`
- **Data:** `wiki_articles`
- **Status:** Complete
- **Evidence:** `src/app/admin/articles/`, `src/lib/actions/admin/`

### 10.2 Question Bank
- **Purpose:** Manage design problems and scenario questions
- **Routes:** `/admin/questions`, `/admin/questions/design-problems`, `/admin/questions/scenarios`
- **Components:** `src/components/admin/`
- **Backend:** `src/lib/actions/admin/`
- **Data:** `questions`, `design_problems`, `design_scenarios`
- **Status:** Complete
- **Evidence:** `src/app/admin/questions/`, `DATABASE_SCHEMA.sql`

### 10.3 Taxonomy Management
- **Purpose:** Edit the 6-level subject taxonomy tree
- **Routes:** `/admin/taxonomy`
- **Components:** `src/components/admin/`
- **Backend:** `src/lib/actions/admin/`
- **Data:** `taxonomy_tree`
- **Status:** Complete
- **Evidence:** `src/app/admin/taxonomy/page.tsx`

### 10.4 Pipeline & Reviews
- **Purpose:** Content workflow and quality review
- **Routes:** `/admin/pipeline`, `/admin/reviews`
- **Components:** `src/components/admin/`
- **Backend:** `src/lib/actions/admin/`
- **Status:** Complete
- **Evidence:** `src/app/admin/pipeline/page.tsx`, `src/app/admin/reviews/page.tsx`

### 10.5 Search
- **Purpose:** Cross-content search
- **Routes:** `/admin/search`
- **Components:** `src/components/admin/`
- **Backend:** `src/lib/actions/admin/`
- **Status:** Complete
- **Evidence:** `src/app/admin/search/page.tsx`

### 10.6 Assets & 3D Models
- **Purpose:** Manage media and 3D assets
- **Routes:** `/admin/assets`, `/admin/3d-models`
- **Components:** `src/components/admin/`
- **Backend:** `src/lib/actions/admin/`
- **Data:** `models_3d`
- **Status:** Complete
- **Evidence:** `src/app/admin/assets/page.tsx`, `src/app/admin/3d-models/page.tsx`

### 10.7 Audit Logs
- **Purpose:** Track admin and system actions
- **Routes:** `/admin/audit`
- **Data:** `audit_logs`
- **Status:** Complete
- **Evidence:** `src/app/admin/audit/page.tsx`, `DATABASE_SCHEMA.sql`

---

## 11. Developer Portal

### 11.1 Architecture Docs
- **Purpose:** Internal system documentation
- **Routes:** `/developer/architecture`
- **Status:** Complete
- **Evidence:** `src/app/developer/architecture/page.tsx`

### 11.2 API Reference
- **Purpose:** Browse API routes and Server Actions
- **Routes:** `/developer/api`
- **Status:** Complete
- **Evidence:** `src/app/developer/api/page.tsx`

### 11.3 Status & Console
- **Purpose:** DB health, environment status, structured log viewer
- **Routes:** `/developer/status`, `/developer/tools/console`
- **Components:** `src/components/developer/`
- **Backend:** `src/lib/developer/`
- **Status:** Complete
- **Evidence:** `src/app/developer/status/page.tsx`, `src/app/developer/tools/console/page.tsx`

### 11.4 Database Tools
- **Purpose:** Query and inspect DB
- **Routes:** `/developer/tools/db`
- **Status:** Complete
- **Evidence:** `src/app/developer/tools/db/page.tsx`

---

## 12. CEO Portal

### 12.1 Financials
- **Purpose:** Cash balance, revenue tracking
- **Routes:** `/ceo/financials`
- **Components:** `src/components/ceo/`
- **Data:** `ceo_cash_balance_entries`, `ceo_financial_entries`
- **Status:** Complete
- **Evidence:** `src/app/(protected)/ceo/financials/page.tsx`, `DATABASE_SCHEMA.sql`

### 12.2 Analytics & Insights
- **Purpose:** Business metrics and team insights
- **Routes:** `/ceo/analytics`, `/ceo/insights`
- **Components:** `src/components/ceo/`
- **Data:** `ceo_gate_status`, `ceo_team_members`
- **Status:** Complete
- **Evidence:** `src/app/(protected)/ceo/analytics/page.tsx`

---

## 13. Payments & Subscriptions

### 13.1 Checkout
- **Purpose:** Initiate payment for Pro/Prime/Institutional tiers
- **Routes:** `api/payments/checkout`
- **Backend:** `src/app/api/payments/checkout/route.ts`, `src/lib/payments/provider.ts`
- **Data:** `user_subscriptions`
- **Status:** Complete (PayRex); Partial (LemonSqueezy — SDK missing)
- **Evidence:** `src/app/api/payments/checkout/route.ts`, `src/lib/payments/`

### 13.2 Webhooks
- **Purpose:** Receive subscription lifecycle events
- **Routes:** `api/webhooks/payrex`, `api/webhooks/lemonsqueezy`
- **Backend:** `src/app/api/webhooks/payrex/route.ts`, `src/app/api/webhooks/lemonsqueezy/route.ts`
- **Data:** `user_subscriptions`, `processed_webhook_events`
- **Status:** Complete (PayRex); Unknown (LemonSqueezy — stubbed SDK)
- **Evidence:** Webhook route files

---

## 14. AI Features

### 14.1 AI Tutor
- **Purpose:** RAG-based study assistant
- **Routes:** `api/ai/tutor`
- **Backend:** `src/app/api/ai/tutor/route.ts`
- **Data:** `wiki_articles` (embeddings via `match_wiki_articles` RPC)
- **Status:** Complete
- **Evidence:** `src/app/api/ai/tutor/route.ts`

### 14.2 Question Generation
- **Purpose:** AI-generated quiz questions
- **Routes:** `api/ai/generate-questions`
- **Backend:** `src/app/api/ai/generate-questions/route.ts`
- **Status:** Complete
- **Evidence:** `src/app/api/ai/generate-questions/route.ts`

### 14.3 Socratic Tutor
- **Purpose:** Socratic dialogue for learning
- **Routes:** `api/ai/socratic`
- **Backend:** `src/app/api/ai/socratic/route.ts`
- **Status:** Complete
- **Evidence:** `src/app/api/ai/socratic/route.ts`

### 14.4 Study Agent
- **Purpose:** General study assistance
- **Routes:** `api/ai/study-agent`
- **Backend:** `src/app/api/ai/study-agent/route.ts`
- **Status:** Complete
- **Evidence:** `src/app/api/ai/study-agent/route.ts`

### 14.5 Teach-Back
- **Purpose:** Evaluate student explanations
- **Backend:** `src/lib/actions/teach-back.ts`
- **Data:** `teach_back_submissions`, `topic_teach_back_criteria`
- **Status:** Complete
- **Evidence:** `src/lib/actions/teach-back.ts`, `DATABASE_SCHEMA.sql`

### 14.6 Embeddings
- **Purpose:** Generate article embeddings for RAG
- **Routes:** `api/ai/embed`
- **Backend:** `src/app/api/ai/embed/route.ts`
- **Status:** Complete
- **Evidence:** `src/app/api/ai/embed/route.ts`

---

## 15. Automation

### 15.1 Focus Review Scan
- **Purpose:** Daily scan of weak mastery nodes and queue creation
- **Routes:** `api/cron/focus-review-scan`
- **Backend:** `src/app/api/cron/focus-review-scan/route.ts`
- **Data:** `user_node_mastery`, `focus_review_queues`
- **Status:** Complete
- **Evidence:** `src/app/api/cron/focus-review-scan/route.ts`, `vercel.json`

### 15.2 Signal Computation
- **Purpose:** Daily computation of user engagement signals
- **Routes:** `api/cron/compute-signals`
- **Backend:** `src/app/api/cron/compute-signals/route.ts`
- **Data:** `user_computed_signals`
- **Status:** Complete
- **Evidence:** `src/app/api/cron/compute-signals/route.ts`, `vercel.json`

---

## 16. Marketing & Public

### 16.1 Landing Pages
- **Purpose:** Public marketing surface
- **Routes:** `/`, `/about`, `/pricing`, `/contact`, `/try`
- **Components:** `src/components/marketing/`
- **Status:** Complete
- **Evidence:** `src/app/page.tsx`, `src/app/about/page.tsx`, etc.

### 16.2 OG Score Images
- **Purpose:** Shareable score cards
- **Routes:** `api/og/score`
- **Backend:** `src/app/api/og/score/route.tsx`
- **Status:** Complete
- **Evidence:** `src/app/api/og/score/route.tsx`
