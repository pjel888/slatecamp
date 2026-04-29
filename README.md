# SlateCamp

## Overview

SlateCamp is a **Next.js App Router application for Philippine Architecture Licensure Exam (ALE) preparation**. It serves architecture candidates who need one place for practice tests, taxonomy-linked reference material, 3D/visual learning, study trails, analytics, notes, and admin-managed content operations.

The current app is a **pre-launch MVP**: broad and operationally mature, but still being hardened. The current codebase, not older strategy docs, is the source of truth for this README.

## Current Product Status

## Final Launch Stance

This launch pass is explicitly **payment-free and live-AI-provider-free**. PayRex checkout/webhook verification, LemonSqueezy, and live OpenAI/Anthropic provider behavior are deferred post-launch work, not blockers for the current launch scope. Public copy now emphasizes source-backed learning rather than live AI. Payment UI remains disabled unless `NEXT_PUBLIC_PAYMENTS_ENABLED=true` is intentionally set for a future paid launch.

- **Status:** Pre-launch MVP.
- **Primary user:** ALE candidate/student.
- **Internal users:** content/admin operators, developers, and owner/CEO operators.
- **Current post-cleanup counts (2026-04-29):** 105 page routes, 12 App Router route handlers (11 under `/api`), 14 layouts, 92 loading states, 7 error boundaries, 157 server/action/query files, 76 schema tables, 92 migrations, 88 test/spec files, 100 Storybook stories.
- **Important working-tree note:** this audit started with pre-existing uncommitted source changes. Documentation reflects the files currently present on disk.

## Core Business Features


| Feature | Status | Routes | Key Files | Description | Dependencies | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Public marketing landing | Implemented | /; /about; /contact; /pricing; /try | src/app/page.tsx; src/components/landing/; src/components/marketing/ | Public product narrative, pricing, contact, and demo/try entry points. | Marketing components, payment flag for pricing | Landing component files are currently being refactored in the working tree; docs reflect current files. |
| Authentication and onboarding | Implemented | /login; /register; /forgot-password; /auth/reset-password; /auth/callback; /onboarding; /onboarding/comp-exam | src/app/(auth)/; src/app/auth/callback/route.ts; src/lib/supabase/middleware.ts; src/lib/actions/profile.ts | Supabase auth flows, reset password, OAuth callback, onboarding profile setup, comp-exam score capture. | Supabase Auth, profiles, user_global_stats | Demo mode redirects auth pages to dashboard. |
| Student dashboard hub | Implemented | /dashboard | src/app/dashboard/page.tsx; src/components/dashboard/; src/lib/actions/dashboard-page.ts | Authenticated study home with progress, readiness, quick actions, and sync payload. | Dashboard actions/queries, Supabase | — |
| Quiz engine v2 | Implemented | /quiz; /quiz/[mode]/setup; /quiz/[mode]/session/[sessionId]; /results; /review | src/components/quiz-v2/; src/lib/actions/quiz-v2/; src/stores/useQuizStore.ts | Mode-based setup/session/results/review flow with answer submission, confidence, pause/resume, skip, review data, post-session hooks. | quiz_sessions, user_interactions, questions, user_node_mastery | Large client store remains a complexity risk. |
| Adaptive drills and sessions | Implemented | /dashboard/drills; /dashboard/drills/sessions | src/lib/actions/adaptive-session.ts; src/lib/queries/adaptive-quiz.ts; src/lib/actions/session-actions.ts | Adaptive question selection, session discovery, recent sessions, activity feeds. | questions, user_theta, user_interactions | — |
| Wiki learning system | Implemented | /dashboard/wiki; /dashboard/wiki/[slug] | src/components/wiki/; src/lib/actions/wiki-actions.ts; src/lib/actions/wiki-reads.ts; src/lib/actions/wiki-interactions.ts | Article search/rendering, taxonomy resolution, reads, bookmarks, highlights, feedback, embedded learning interactions. | wiki_articles, wiki_article_taxonomy, taxonomy_tree | — |
| Camp Trails | Implemented | /dashboard/camptrails; /dashboard/camptrails/[slug]; /today; /day/[dayNumber]/complete | src/lib/actions/trails.ts; src/lib/queries/trails.ts; src/components/trails/ | Published trails, enrollment, day/step progress, completions. | camp_trails, trail_days, trail_steps, user_trail_enrollments | Legacy `/dashboard/trail(s)` redirect shims were removed in Plan B cleanup. |
| 3D Lab | Implemented | /dashboard/3d-lab; /dashboard/3d-lab/[moduleId] | src/features/3d-lab/; src/components/r3f/; src/lib/actions/lab.ts | Interactive R3F/WebGL modules, camera/navigation controls, hotspots, onboarding, module registry, performance gates. | React Three Fiber, drei, three, models_3d, spatial_hotspots | Performance-sensitive; many dedicated tests and perf scripts. |
| Area C design practice | Implemented | /dashboard/area-c; /design-problems; /design-quiz; dynamic sessions; /calculator | src/lib/actions/design-problems.ts; src/components/assessment/; src/app/dashboard/area-c/ | Design problems, design scenarios, quizzes, and calculator entry. | design_problems, design_scenarios, design_* tables | — |
| Assessment diagnostic | Implemented | /dashboard/assessment | src/lib/actions/assessment.ts; src/components/assessment/ | Assessment questions, interaction saving, results, completion status. | anon_diagnostic_sessions, questions, user_interactions | — |
| Readiness and analytics | Implemented | /dashboard/analytics; /dashboard/analytics/advanced | src/lib/actions/analytics.ts; src/lib/actions/mastery-actions.ts; src/lib/__tests__/readiness-score.test.ts | Readiness trajectory, heatmaps, pacing, stamina, mastery, memory health. | readiness_score_snapshots, user_global_stats, analytics_events | Legacy `/dashboard/heatmap` redirect shim was removed. |
| SRS and focus review | Implemented | /dashboard/flash; /dashboard/flash/[category]; /dashboard/cram-card; /api/cron/focus-review-scan | src/lib/srs/; src/lib/actions/srs-review.ts; src/lib/focus-review/generate-queue.ts | Spaced repetition cards, review deck, flash categories, focus review queue generation. | user_srs_cards, focus_review_queues | — |
| Notes workspace | Implemented | /dashboard/notes | src/lib/actions/notes-actions.ts; src/hooks/useNoteEditor.ts; src/components/notes/ | Rich note list/editor/folders linked to topics/source URLs. | notes, note_folders, TipTap | — |
| Notifications and preferences | Implemented | /dashboard/notifications; /dashboard/settings | src/lib/actions/notifications.ts; src/lib/actions/notification-triggers.ts | Notification listing, mark read/all read, preferences, trigger helpers. | notifications, notification_preferences, notification_log | — |
| Settings and deferred billing | Partial | /dashboard/settings; /dashboard/upgrade | src/app/dashboard/settings/; src/app/dashboard/upgrade/page.tsx; src/app/api/payments/checkout/route.ts; src/lib/payments/ | User account/settings remain launch-supporting; checkout is hidden unless payments are intentionally re-enabled. | Payments feature flag, user_subscriptions | Payment-free launch: `/dashboard/upgrade` redirects to dashboard while `NEXT_PUBLIC_PAYMENTS_ENABLED` is false. |
| Admin portal | Implemented | /admin plus /admin/* | src/app/admin/; src/components/admin/; src/lib/actions/admin/ | Admin dashboard, knowledge/content editor, questions, taxonomy, pipeline, reviews, assets, search, audit, settings, 3D models. | Admin server actions, Supabase, entitlements | Middleware enforces route-specific admin permissions. |
| Developer portal | Implemented | /developer plus /developer/* | src/app/developer/; src/lib/developer/access.ts; src/lib/actions/dev/ | Internal API reference, architecture docs, status, console, logs, DB viewer, test data. | Developer entitlement, dev actions | ALLOW_DEV_PORTAL_BYPASS exists for local/dev. |
| CEO portal | Implemented | /ceo plus /ceo/* | src/app/(protected)/ceo/; src/lib/actions/ceo/; src/lib/queries/ceo/ | Owner/CEO analytics, financial entries, insights, team, admin role and permission audit. | ceo_* tables, user_roles | Protected by CEO/owner entitlement. |
| Deferred payments and webhooks | Deferred | /api/payments/checkout; /api/webhooks/payrex | src/lib/payments/provider.ts; src/lib/payrex/config.ts | PayRex checkout/webhook code is retained but not part of the current payment-free launch surface. | PayRex, user_subscriptions, processed_webhook_events | PayRex staging checkout/webhook QA is future-scope, not a current launch blocker. |
| Deferred AI tutor and generation | Experimental / deferred | /api/ai/embed; /generate-questions; /socratic; /study-agent; /tutor | src/lib/ai/provider.ts; src/app/api/ai/; src/lib/actions/teach-back.ts; src/components/quiz-v2/FeedbackPanel.tsx | AI endpoints and helpers remain in code, but launch-facing quiz AI helper UI is disabled for the live-AI-free launch. | OpenAI, Anthropic, rate limiter | Live provider verification is future-scope, not a current launch blocker. |
| Calculators and tools | Implemented | /calculators/*; /tools/* | src/app/calculators/_lib/; src/components/calculators/; src/lib/lot-geometry/ | CHB/drywall/flooring/paint/floor tiles/wall paint calculators and lot plotter. | Local calculation engines, lot geometry | Calculator engines have unit tests. |
| Professional/results-day/exam outcome flows | Implemented | /dashboard/professional; /dashboard/results-day; /dashboard/exam-outcome; /dashboard/score-reveal | src/lib/actions/professional-mode.ts; src/lib/actions/results-day.ts; src/app/dashboard/exam-outcome/actions.ts | Professional mode switching, results-day banner/profile, exam-outcome self-report, score reveal. | profiles, exam_outcomes, user_global_stats | — |
| Study pods/social proof | Implemented | /dashboard/pods; /dashboard/pods/[podId] | src/lib/actions/pods.ts; src/lib/actions/social-proof.ts | Pod create/join/leave/data and topic daily-studier social proof. | study_pods, pod_members | — |
| Daily dose / DAE / studio modes | Partial | /dashboard/dae-mode; /dashboard/studio | src/lib/actions/daily-dose/; src/lib/actions/dae-mode.ts; src/lib/actions/studio-mode.ts | Specialized study modes and daily generated activities. | daily_doses, AI/generation helpers | Some flows appear product-specific but not fully verified in UI from current audit. |
| Code updates | Implemented | /dashboard/code-updates | src/lib/actions/code-updates.ts | Lists LEA/code update records and counts. | code_updates | — |
| Admin feature flags/dev overrides | Implemented | /api/admin/flags; developer/admin tooling | src/app/api/admin/flags/route.ts; src/config/feature-flags.ts; src/lib/entitlements/dev-overrides.ts | Runtime feature/dev override cookie for authorized tooling roles. | feature flags config, entitlements audit | HTTP-only cookie with one-week max age. |


## Complete Route Map
The current App Router surface has **105 `page.tsx` routes** after Plan B cleanup. Redirect-only legacy pages removed in this pass: `/settings`, `/test-3d`, `/admin/wiki`, `/dashboard/heatmap`, `/dashboard/trail`, `/dashboard/trails`, `/dashboard/settings/billing`, `/dashboard/settings/developer`, and `/quiz`. See `.ai/routes.md` for layout/loading/error-boundary inventories.

| Route | Type | File | Access | Purpose | Key Features | Data/API Dependencies | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| / | page | src/app/page.tsx | public | Public marketing or conversion page. | Marketing/public | `@/components/landing/LandingPageContent`, `@/components/landing/LandingPageFallback`, `@/lib/constants` | Has route loading state. Has route error boundary. |
| /about | page | src/app/about/page.tsx | public | Public marketing or conversion page. | Marketing/public | `@/components/marketing/MarketingNav`, `@/components/marketing/MarketingFooter`, `@/lib/constants/site` (+1) | Has route loading state. |
| /admin | page | src/app/admin/page.tsx | admin | Admin operations surface. | Admin operations | `@/lib/routes`, `@/lib/actions/admin/dashboard`, `@/lib/admin/roles` (+11) | Has route loading state. Has route error boundary. |
| /admin/3d-models | page | src/app/admin/3d-models/page.tsx | admin | Admin 3D model registry surface. | Admin 3D model registry | `@/lib/admin/roles`, `./_components/ModelRegistryPage` | Has route loading state. |
| /admin/activity | page | src/app/admin/activity/page.tsx | admin | Admin operations surface. | Admin operations | `@/lib/supabase/server`, `@/lib/admin/roles`, `@/lib/utils/format-time` (+4) | Has route loading state. |
| /admin/assets | page | src/app/admin/assets/page.tsx | admin | Admin asset library surface. | Admin asset library | `@/lib/admin/roles`, `@/lib/actions/admin/assets`, `@/components/admin/AssetList` (+1) | Has route loading state. |
| /admin/assets/[id] | page dynamic | src/app/admin/assets/[id]/page.tsx | admin | Admin asset library surface. | Admin asset library | `@/lib/routes`, `@/lib/admin/roles`, `@/lib/actions/admin/assets` (+2) | Dynamic params present. Has route loading state. |
| /admin/audit | page | src/app/admin/audit/page.tsx | admin | Admin operations surface. | Admin operations | `@/lib/admin/roles`, `@/components/admin/AuditLogViewer` | Has route loading state. |
| /admin/knowledge | page | src/app/admin/knowledge/page.tsx | admin | Admin knowledge/content operations surface. | Admin knowledge/content operations | `@/lib/routes`, `@/lib/admin/roles`, `@/lib/actions/admin/content` (+1) | Has route loading state. |
| /admin/knowledge/[id] | page dynamic | src/app/admin/knowledge/[id]/page.tsx | admin | Admin knowledge/content operations surface. | Admin knowledge/content operations | `@/lib/routes`, `@/lib/admin/roles`, `@/components/ui/breadcrumb` (+3) | Dynamic params present. Has route loading state. |
| /admin/knowledge/analytics | page | src/app/admin/knowledge/analytics/page.tsx | admin | Admin knowledge/content operations surface. | Admin knowledge/content operations | `@/lib/routes`, `@/lib/admin/roles`, `@/lib/actions/admin/question-queries` (+5) | Has route loading state. |
| /admin/knowledge/import | page | src/app/admin/knowledge/import/page.tsx | admin | Admin knowledge/content operations surface. | Admin knowledge/content operations | `@/lib/admin/roles`, `@/components/admin/QuestionImporter`, `@/components/ui/breadcrumb` (+1) | Has route loading state. |
| /admin/knowledge/new | page | src/app/admin/knowledge/new/page.tsx | admin | Admin knowledge/content operations surface. | Admin knowledge/content operations | `@/lib/routes`, `@/lib/admin/roles`, `@/components/admin/unified-editor` (+2) | Has route loading state. |
| /admin/knowledge/questions | page | src/app/admin/knowledge/questions/page.tsx | admin | Admin knowledge/content operations surface. | Admin knowledge/content operations | `@/lib/routes`, `@/lib/admin/roles`, `@/lib/actions/admin/content` (+2) | Has route loading state. |
| /admin/knowledge/questions/[id] | page dynamic | src/app/admin/knowledge/questions/[id]/page.tsx | admin | Admin knowledge/content operations surface. | Admin knowledge/content operations | `@/lib/routes`, `@/lib/admin/roles`, `@/lib/supabase/server` (+10) | Dynamic params present. |
| /admin/knowledge/questions/design-problems | page | src/app/admin/knowledge/questions/design-problems/page.tsx | admin | Admin knowledge/content operations surface. | Admin knowledge/content operations | `@/lib/admin/roles`, `@/lib/routes`, `@/lib/actions/admin/design-problems` (+2) | — |
| /admin/knowledge/questions/design-problems/[id] | page dynamic | src/app/admin/knowledge/questions/design-problems/[id]/page.tsx | admin | Admin knowledge/content operations surface. | Admin knowledge/content operations | `@/lib/admin/roles`, `@/lib/routes`, `@/lib/actions/admin/design-problems` (+1) | Dynamic params present. |
| /admin/knowledge/questions/new | page | src/app/admin/knowledge/questions/new/page.tsx | admin | Admin knowledge/content operations surface. | Admin knowledge/content operations | `@/lib/admin/roles`, `@/lib/supabase/server`, `@/components/admin/QuestionEditor` (+6) | Has route loading state. |
| /admin/knowledge/questions/scenarios | page | src/app/admin/knowledge/questions/scenarios/page.tsx | admin | Admin knowledge/content operations surface. | Admin knowledge/content operations | `@/lib/admin/roles`, `@/lib/routes`, `@/lib/actions/admin/design-scenarios` (+2) | — |
| /admin/knowledge/questions/scenarios/[id] | page dynamic | src/app/admin/knowledge/questions/scenarios/[id]/page.tsx | admin | Admin knowledge/content operations surface. | Admin knowledge/content operations | `@/lib/admin/roles`, `@/lib/routes`, `@/lib/actions/admin/design-scenarios` (+1) | Dynamic params present. |
| /admin/login | page | src/app/(admin-public)/admin/login/page.tsx | public/admin-auth | Admin operations surface. | Admin operations | `@/lib/demo/config`, `@/lib/routes`, `./page-client` | — |
| /admin/pipeline | page | src/app/admin/pipeline/page.tsx | admin | Admin operations surface. | Admin operations | `@/lib/admin/roles`, `@/lib/actions/admin/pipeline`, `@/components/shared/section-header` (+1) | Has route loading state. |
| /admin/preview/[previewId] | page dynamic | src/app/admin/preview/[previewId]/page.tsx | admin | Admin operations surface. | Admin operations | `@/lib/actions/ei-prompts`, `@/components/wiki`, `@/types/testing` (+5) | Dynamic params present. |
| /admin/reviews | page | src/app/admin/reviews/page.tsx | admin | Admin operations surface. | Admin operations | `@/lib/admin/roles`, `@/components/admin/SMEReviewQueue` | Has route loading state. |
| /admin/search | page | src/app/admin/search/page.tsx | admin | Admin operations surface. | Admin operations | `@/lib/admin/roles`, `./_components/ContentSearchClient` | Has route loading state. |
| /admin/settings | page | src/app/admin/settings/page.tsx | admin | Admin operations surface. | Admin operations | `@/lib/admin/roles`, `@/lib/actions/admin/roles`, `@/components/shared/section-header` (+1) | Has route loading state. |
| /admin/taxonomy | page | src/app/admin/taxonomy/page.tsx | admin | Admin taxonomy/coverage surface. | Admin taxonomy/coverage | `@/lib/admin/roles`, `@/lib/actions/admin/taxonomy`, `@/components/admin/TaxonomyEditor` | Has route loading state. |
| /admin/taxonomy/coverage | page | src/app/admin/taxonomy/coverage/page.tsx | admin | Admin taxonomy/coverage surface. | Admin taxonomy/coverage | `@/lib/admin/roles`, `@/lib/actions/admin/coverage`, `@/components/shared/section-header` (+3) | Has route loading state. |
| /auth/reset-password | page | src/app/auth/reset-password/page.tsx | public/auth | Authentication, password reset, registration, or onboarding flow. | Auth/onboarding | `@/components/graphics/icons/Icon`, `@/components/ui/button`, `@/components/ui/input` (+4) | — |
| /calculators | page | src/app/calculators/page.tsx | public utility | Public utility/calculator surface. | Tools/calculators | `@/lib/routes` | — |
| /calculators/chb | page | src/app/calculators/chb/page.tsx | public utility | Public utility/calculator surface. | Tools/calculators | `./_components/CHBCalculator` | — |
| /calculators/drywall | page | src/app/calculators/drywall/page.tsx | public utility | Public utility/calculator surface. | Tools/calculators | `./_components/DrywallCalculator` | — |
| /calculators/flooring | page | src/app/calculators/flooring/page.tsx | public utility | Public utility/calculator surface. | Tools/calculators | `./_components/FlooringCalculator` | — |
| /calculators/paint | page | src/app/calculators/paint/page.tsx | public utility | Public utility/calculator surface. | Tools/calculators | `./_components/PaintCalculator` | — |
| /ceo | page | src/app/(protected)/ceo/page.tsx | owner/CEO | Owner/CEO internal business analytics and team operations. | CEO/internal ops | `@/components/shared/stat-card`, `@/components/ui/eyebrow`, `@/components/ceo/RunwayGauge` (+5) | Has route loading state. |
| /ceo/analytics | page | src/app/(protected)/ceo/analytics/page.tsx | owner/CEO | Owner/CEO internal business analytics and team operations. | CEO/internal ops | `@/components/ui/eyebrow`, `@/components/ceo/skeletons/ChartSkeleton`, `@/components/analytics/AnalyticsErrorBoundary` (+10) | — |
| /ceo/financials | page | src/app/(protected)/ceo/financials/page.tsx | owner/CEO | Owner/CEO internal business analytics and team operations. | CEO/internal ops | `@/lib/supabase/server`, `@/lib/queries/ceo/auth`, `@/components/shared/stat-card` (+7) | Has route loading state. |
| /ceo/insights | page | src/app/(protected)/ceo/insights/page.tsx | owner/CEO | Owner/CEO internal business analytics and team operations. | CEO/internal ops | `@/components/shared/stat-card`, `@/components/ui/eyebrow`, `@/components/ceo/CohortRetentionTable` (+5) | Has route loading state. |
| /ceo/team | page | src/app/(protected)/ceo/team/page.tsx | owner/CEO | Owner/CEO internal business analytics and team operations. | CEO/internal ops | `@/lib/queries/ceo/auth`, `@/lib/queries/ceo/team-queries`, `@/components/ceo/TeamTable` (+2) | Has route loading state. |
| /ceo/team/admin-roles | page | src/app/(protected)/ceo/team/admin-roles/page.tsx | owner/CEO | Owner/CEO internal business analytics and team operations. | CEO/internal ops | `@/lib/queries/ceo/auth`, `@/lib/actions/ceo/admin-role-actions`, `@/components/shared/section-header` (+1) | — |
| /ceo/team/permission-audit | page | src/app/(protected)/ceo/team/permission-audit/page.tsx | owner/CEO | Owner/CEO internal business analytics and team operations. | CEO/internal ops | `@/lib/queries/ceo/auth`, `@/lib/actions/ceo/admin-role-actions`, `@/components/shared/section-header` (+4) | — |
| /contact | page | src/app/contact/page.tsx | public | Public marketing or conversion page. | Marketing/public | `@/components/marketing/MarketingNav`, `@/components/marketing/MarketingFooter`, `@/components/marketing/ContactForm` (+2) | Has route loading state. |
| /dashboard | page | src/app/dashboard/page.tsx | authenticated | Learner dashboard page. | Learner dashboard | `@/components/dashboard/HeroCommandBar`, `@/components/dashboard/HeroCommandBarServer`, `@/components/dashboard/HeatmapSection` (+19) | Has route loading state. Has route error boundary. |
| /dashboard/3d-lab | page | src/app/dashboard/3d-lab/page.tsx | authenticated | 3D Lab page. | 3D Lab | `@/lib/routes`, `@/components/ui/button`, `@/features/3d-lab/components/LabBrowser` (+4) | Has route loading state. Has route error boundary. |
| /dashboard/3d-lab/[moduleId] | page dynamic | src/app/dashboard/3d-lab/[moduleId]/page.tsx | authenticated | 3D Lab page. | 3D Lab | `@/lib/routes`, `@/features/3d-lab/components/ModuleViewer`, `@/features/3d-lab/config/registry` (+2) | Dynamic params present. Has route loading state. |
| /dashboard/analytics | page | src/app/dashboard/analytics/page.tsx | authenticated | Readiness analytics page. | Readiness analytics | `@/components/shared/analytics-chart-container`, `@/components/analytics/ReadinessSection`, `@/components/analytics/ExamCountdownSection` (+22) | Has route loading state. Has route error boundary. |
| /dashboard/analytics/advanced | page | src/app/dashboard/analytics/advanced/page.tsx | authenticated | Readiness analytics page. | Readiness analytics | `@/components/analytics/ChartSkeleton`, `@/components/analytics/AnalyticsErrorBoundary`, `@/components/analytics/IRTTrajectorySection` (+8) | Has route loading state. |
| /dashboard/area-c | page | src/app/dashboard/area-c/page.tsx | authenticated | Area C design practice page. | Area C design practice | `@/components/layouts/SharedPageLayout` | Has route loading state. |
| /dashboard/area-c/calculator | page | src/app/dashboard/area-c/calculator/page.tsx | authenticated | Area C design practice page. | Area C design practice | `../_components/DevControlsCalculator` | Has route loading state. |
| /dashboard/area-c/design-problems | page | src/app/dashboard/area-c/design-problems/page.tsx | authenticated | Area C design practice page. | Area C design practice | `@/lib/actions/design-problems`, `../_components/DesignProblemCard`, `@/components/layouts/SharedPageLayout` (+1) | Has route loading state. |
| /dashboard/area-c/design-problems/[problemId] | page dynamic | src/app/dashboard/area-c/design-problems/[problemId]/page.tsx | authenticated | Area C design practice page. | Area C design practice | `@/lib/actions/design-problems`, `@/lib/supabase/server`, `../../_components/DesignProblemSession` (+3) | Dynamic params present. Has route loading state. |
| /dashboard/area-c/design-quiz | page | src/app/dashboard/area-c/design-quiz/page.tsx | authenticated | Area C design practice page. | Area C design practice | `@/lib/design-scenarios`, `@/components/layouts/SharedPageLayout`, `./_components/ScenarioList` | Has route loading state. |
| /dashboard/area-c/design-quiz/[scenarioId] | page dynamic | src/app/dashboard/area-c/design-quiz/[scenarioId]/page.tsx | authenticated | Area C design practice page. | Area C design practice | `@/lib/design-scenarios`, `@/components/layouts/SharedPageLayout`, `../_components/DesignQuizSession` | Dynamic params present. Has route loading state. |
| /dashboard/assessment | page | src/app/dashboard/assessment/page.tsx | authenticated | Learner dashboard page. | Learner dashboard | `@/lib/supabase/server`, `@/lib/actions/assessment`, `@/components/assessment/AssessmentQuiz` (+1) | Has route loading state. |
| /dashboard/camptrails | page | src/app/dashboard/camptrails/page.tsx | authenticated | Camp Trails page. | Camp Trails | `@/components/layouts/SharedPageLayout`, `@/lib/queries/trails`, `@/types/app` (+3) | Has route loading state. |
| /dashboard/camptrails/[slug] | page dynamic | src/app/dashboard/camptrails/[slug]/page.tsx | authenticated | Camp Trails page. | Camp Trails | `@/components/layouts/SharedPageLayout`, `@/lib/routes`, `@/lib/queries/trails` (+2) | Dynamic params present. Has route loading state. |
| /dashboard/camptrails/[slug]/day/[dayNumber]/complete | page dynamic | src/app/dashboard/camptrails/[slug]/day/[dayNumber]/complete/page.tsx | authenticated | Camp Trails page. | Camp Trails | `@/lib/routes`, `@/components/layouts/SharedPageLayout`, `@/components/ui/card` (+3) | Dynamic params present. Has route loading state. |
| /dashboard/camptrails/[slug]/today | page dynamic | src/app/dashboard/camptrails/[slug]/today/page.tsx | authenticated | Camp Trails page. | Camp Trails | `@/components/layouts/SharedPageLayout`, `@/lib/queries/trails`, `@/lib/actions/profile` (+4) | Dynamic params present. Has route loading state. |
| /dashboard/code-updates | page | src/app/dashboard/code-updates/page.tsx | authenticated | Learner dashboard page. | Learner dashboard | `@/lib/actions/code-updates`, `./_components/CodeUpdateFeed` | Has route loading state. |
| /dashboard/cram-card | page | src/app/dashboard/cram-card/page.tsx | authenticated | Flash/cram review page. | Flash/cram review | `@/components/layouts/SharedPageLayout`, `@/lib/actions/cram-card`, `./_components/CramCardPage` | Has route loading state. |
| /dashboard/dae-mode | page | src/app/dashboard/dae-mode/page.tsx | authenticated | Learner dashboard page. | Learner dashboard | `@/lib/supabase/server`, `@/lib/routes`, `@/lib/actions/dae-mode` (+2) | Has route loading state. |
| /dashboard/drills | page | src/app/dashboard/drills/page.tsx | authenticated | Drills page. | Drills | `@/lib/supabase/server`, `@/lib/routes`, `@/components/testing/hub/ReviewHub` (+3) | Has route loading state. |
| /dashboard/drills/sessions | page | src/app/dashboard/drills/sessions/page.tsx | authenticated | Drills page. | Drills | `@/lib/supabase/server`, `@/lib/routes`, `@/components/testing/hub/SessionsTable` | Has route loading state. |
| /dashboard/exam-outcome | page | src/app/dashboard/exam-outcome/page.tsx | authenticated | Learner dashboard page. | Learner dashboard | `@/lib/routes`, `@/lib/supabase/server`, `@/components/layouts/SharedPageLayout` (+1) | Has route loading state. |
| /dashboard/flash | page | src/app/dashboard/flash/page.tsx | authenticated | Flash/cram review page. | Flash/cram review | `@/components/layouts/SharedPageLayout`, `./_components/FlashHub`, `@/lib/actions/flash-cards` | Has route loading state. |
| /dashboard/flash/[category] | page dynamic | src/app/dashboard/flash/[category]/page.tsx | authenticated | Flash/cram review page. | Flash/cram review | `@/components/layouts/SharedPageLayout`, `../_components/FlashSession`, `@/lib/actions/flash-cards` (+1) | Dynamic params present. Has route loading state. |
| /dashboard/notes | page | src/app/dashboard/notes/page.tsx | authenticated | Notes page. | Notes | `@/lib/supabase/server`, `@/components/notes/NotesShell`, `@/lib/utils/text` (+1) | Has route loading state. |
| /dashboard/notifications | page | src/app/dashboard/notifications/page.tsx | authenticated | Learner dashboard page. | Learner dashboard | `@/lib/supabase/server`, `@/lib/queries/notifications`, `@/components/notifications/NotificationList` (+1) | Has route loading state. |
| /dashboard/pods | page | src/app/dashboard/pods/page.tsx | authenticated | Learner dashboard page. | Learner dashboard | `@/lib/supabase/server`, `@/lib/routes`, `@/lib/actions/pods` (+3) | Has route loading state. |
| /dashboard/pods/[podId] | page dynamic | src/app/dashboard/pods/[podId]/page.tsx | authenticated | Learner dashboard page. | Learner dashboard | `@/lib/supabase/server`, `@/lib/routes`, `@/lib/actions/pods` (+1) | Dynamic params present. Has route loading state. |
| /dashboard/professional | page | src/app/dashboard/professional/page.tsx | authenticated | Learner dashboard page. | Learner dashboard | `@/lib/routes`, `@/lib/actions/professional-mode`, `@/components/layouts/SharedPageLayout` (+1) | Has route loading state. |
| /dashboard/results-day | page | src/app/dashboard/results-day/page.tsx | authenticated | Learner dashboard page. | Learner dashboard | `@/lib/routes`, `@/lib/supabase/server`, `@/components/layouts/SharedPageLayout` (+2) | Has route loading state. |
| /dashboard/score-reveal | page | src/app/dashboard/score-reveal/page.tsx | authenticated | Learner dashboard page. | Learner dashboard | `@/lib/routes`, `@/lib/actions/assessment`, `@/lib/queries/trails` (+4) | Has route loading state. |
| /dashboard/settings | page | src/app/dashboard/settings/page.tsx | authenticated | Account settings page. | Account settings | `@/lib/routes`, `@/lib/actions/profile`, `@/lib/actions/email-preferences` (+11) | Has route loading state. |
| /dashboard/studio | page | src/app/dashboard/studio/page.tsx | authenticated | Learner dashboard page. | Learner dashboard | `@/lib/actions/studio-mode`, `./_components/StudioHub`, `@/components/layouts/SharedPageLayout` | Has route loading state. |
| /dashboard/upgrade | page | src/app/dashboard/upgrade/page.tsx | authenticated | Upgrade/payments page. | Upgrade/payments | `@/lib/supabase/server`, `@/lib/analytics-server`, `@/components/layouts/SharedPageLayout` (+3) | Has route loading state. |
| /dashboard/welcome-pro | page | src/app/dashboard/welcome-pro/page.tsx | authenticated | Learner dashboard page. | Learner dashboard | `@/lib/routes`, `@/lib/supabase/server`, `@/lib/analytics-server` (+3) | Has route loading state. |
| /dashboard/wiki | page | src/app/dashboard/wiki/page.tsx | authenticated | Knowledge wiki page. | Knowledge wiki | — | Has route loading state. |
| /dashboard/wiki/[slug] | page dynamic | src/app/dashboard/wiki/[slug]/page.tsx | authenticated | Knowledge wiki page. | Knowledge wiki | `@/components/wiki`, `@/lib/utils`, `@/types/testing` (+8) | Dynamic params present. Has route loading state. |
| /developer | page | src/app/developer/page.tsx | developer/internal | Internal developer/reference/status tooling. | Developer observability | `@/components/shared/action-card`, `@/components/shared/section-header`, `@/components/shared/stat-card` (+8) | Has route loading state. Has route error boundary. |
| /developer/api-reference | page | src/app/developer/api-reference/page.tsx | developer/internal | Internal developer/reference/status tooling. | Developer observability | `@/components/ui/tabs`, `@/components/shared/section-header`, `../_components/EndpointCard` (+1) | Has route loading state. |
| /developer/architecture | page | src/app/developer/architecture/page.tsx | developer/internal | Internal developer/reference/status tooling. | Developer observability | `@/components/ui/card`, `@/components/ui/badge`, `@/components/shared/section-header` (+4) | Has route loading state. |
| /developer/status | page | src/app/developer/status/page.tsx | developer/internal | Internal developer/reference/status tooling. | Developer observability | `@/components/developer/Breadcrumbs`, `@/components/developer/SurfaceTruthNotice`, `@/components/developer/StatusBanner` (+8) | Has route loading state. |
| /developer/status/database | page | src/app/developer/status/database/page.tsx | developer/internal | Internal developer/reference/status tooling. | Developer observability | `@/components/developer/Breadcrumbs`, `@/components/developer/SurfaceTruthNotice`, `@/components/developer/StatusBadge` (+5) | Has route loading state. |
| /developer/status/infrastructure | page | src/app/developer/status/infrastructure/page.tsx | developer/internal | Internal developer/reference/status tooling. | Developer observability | `@/components/developer/Breadcrumbs`, `@/components/developer/SurfaceTruthNotice`, `@/components/developer/StatusBadge` (+5) | Has route loading state. |
| /developer/tools | page | src/app/developer/tools/page.tsx | developer/internal | Internal developer/reference/status tooling. | Developer observability | `@/components/shared/action-card`, `@/components/shared/section-header`, `@/lib/developer/surface-registry` | Has route loading state. |
| /developer/tools/console | page | src/app/developer/tools/console/page.tsx | developer/internal | Internal developer/reference/status tooling. | Developer observability | `@/lib/supabase/server`, `@/lib/dev/dev-mode`, `@/lib/developer/tech-stack` (+2) | Has route loading state. |
| /developer/tools/db | page | src/app/developer/tools/db/page.tsx | developer/internal | Internal developer/reference/status tooling. | Developer observability | `@/components/shared/data-table`, `@/components/shared/empty-state`, `@/components/shared/section-header` (+2) | Has route loading state. |
| /developer/tools/logs | page | src/app/developer/tools/logs/page.tsx | developer/internal | Internal developer/reference/status tooling. | Developer observability | `@/components/developer/SurfaceTruthNotice`, `@/components/shared/data-table`, `@/components/shared/empty-state` (+5) | Has route loading state. |
| /developer/tools/test-data | page | src/app/developer/tools/test-data/page.tsx | developer/internal | Internal developer/reference/status tooling. | Developer observability | `@/lib/developer/access`, `./test-data-client` | Has route loading state. |
| /forgot-password | page | src/app/(auth)/forgot-password/page.tsx | public/auth | Authentication, password reset, registration, or onboarding flow. | Auth/onboarding | `@/components/graphics/icons/Icon`, `@/lib/supabase/client`, `@/lib/routes` (+4) | Has route loading state. |
| /login | page | src/app/(auth)/login/page.tsx | public/auth | Authentication, password reset, registration, or onboarding flow. | Auth/onboarding | `./login-form`, `@/components/graphics/logos/SlateCampLogo`, `@/lib/demo/config` (+1) | Has route loading state. |
| /onboarding | page | src/app/(auth)/onboarding/page.tsx | public/auth | Authentication, password reset, registration, or onboarding flow. | Auth/onboarding | `@/lib/supabase/server`, `@/lib/routes`, `@/lib/supabase/bootstrap` (+3) | Has route loading state. |
| /onboarding/comp-exam | page | src/app/(auth)/onboarding/comp-exam/page.tsx | public/auth | Authentication, password reset, registration, or onboarding flow. | Auth/onboarding | `@/lib/supabase/server`, `@/lib/routes`, `./_components/CompExamFlow` | — |
| /pricing | page | src/app/pricing/page.tsx | public | Public marketing or conversion page. | Marketing/public | `@/components/marketing/MarketingNav`, `@/components/marketing/MarketingFooter`, `@/components/marketing/FaqSection` (+5) | Has route loading state. |
| /quiz/[mode]/session/[sessionId] | page dynamic | src/app/quiz/[mode]/session/[sessionId]/page.tsx | authenticated | Canonical quiz setup, active session, review, or results flow. | Quiz session loop | `@/lib/quiz/mode-presets`, `@/lib/quiz/to-client-question`, `@/lib/supabase/server` (+1) | Dynamic params present. Has route loading state. |
| /quiz/[mode]/session/[sessionId]/results | page dynamic | src/app/quiz/[mode]/session/[sessionId]/results/page.tsx | authenticated | Canonical quiz setup, active session, review, or results flow. | Quiz session loop | `@/lib/supabase/server`, `@/types/quiz-config`, `@/lib/quiz/mode-presets` (+5) | Dynamic params present. Has route loading state. |
| /quiz/[mode]/session/[sessionId]/review | page dynamic | src/app/quiz/[mode]/session/[sessionId]/review/page.tsx | authenticated | Canonical quiz setup, active session, review, or results flow. | Quiz session loop | — | Dynamic params present. Has route loading state. |
| /quiz/[mode]/setup | page dynamic | src/app/quiz/[mode]/setup/page.tsx | authenticated | Canonical quiz setup, active session, review, or results flow. | Quiz session loop | `@/lib/supabase/server`, `@/lib/actions/quiz-v2`, `@/types/quiz-config` (+1) | Dynamic params present. Has route loading state. |
| /register | page | src/app/(auth)/register/page.tsx | public/auth | Authentication, password reset, registration, or onboarding flow. | Auth/onboarding | `./register-form`, `@/lib/constants/site`, `@/lib/demo/config` (+1) | Has route loading state. |
| /tools | page | src/app/tools/page.tsx | public utility | Public utility/calculator surface. | Tools/calculators | `@/components/marketing/MarketingNav`, `@/components/marketing/MarketingFooter`, `@/components/tools/ToolCard` (+2) | Has route loading state. |
| /tools/floor-tiles-calculator | page | src/app/tools/floor-tiles-calculator/page.tsx | public utility | Public utility/calculator surface. | Tools/calculators | `@/components/marketing/MarketingNav`, `@/components/marketing/MarketingFooter`, `@/lib/constants/site` (+2) | Has route loading state. |
| /tools/lot-plotter | page | src/app/tools/lot-plotter/page.tsx | public utility | Public utility/calculator surface. | Tools/calculators | `@/components/marketing/MarketingNav`, `@/components/marketing/MarketingFooter`, `@/lib/constants/site` (+2) | Has route loading state. |
| /tools/wall-paint-calculator | page | src/app/tools/wall-paint-calculator/page.tsx | public utility | Public utility/calculator surface. | Tools/calculators | `@/components/marketing/MarketingNav`, `@/components/marketing/MarketingFooter`, `@/lib/constants/site` (+2) | Has route loading state. |
| /try | page | src/app/try/page.tsx | public | Public marketing or conversion page. | Marketing/public | `@/components/assessment/PreAssessmentTeaser` | Has route loading state. |

## API and Server Functionality
The current App Router server surface has **12 route handlers** (11 under `/api`, plus `/auth/callback`). Plan B cleanup removed the stubbed LemonSqueezy webhook and runtime provider path; checkout is PayRex-only when payments are enabled.

| Endpoint | Methods | File | Purpose | Inputs/Params/Body | Outputs | Auth/Permission | Data/External Services | Env |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| /api/admin/flags | POST, DELETE | src/app/api/admin/flags/route.ts | POST writes dev entitlement override cookie; DELETE clears it. | POST JSON feature flag override; DELETE no body. | JSON success/error. | Demo mode bypasses auth; otherwise authenticated developer override permission. | Dev override cookie and entitlement audit log. | NODE_ENV |
| /api/ai/embed | POST | src/app/api/ai/embed/route.ts | Generate embeddings for text. | POST `{ text }`. | JSON `{ embedding }` or error. | Demo canned/random path; otherwise authenticated + rate-limited. | AI provider and Supabase auth. | AI provider env if live |
| /api/ai/generate-questions | POST | src/app/api/ai/generate-questions/route.ts | Generate quiz questions from content chunks. | POST `{ chunkContent, profession, examTarget, difficulty, count }`. | JSON `{ questions }` or error. | Demo canned path; otherwise authenticated + rate-limited. | AI provider question generation. | AI provider env if live |
| /api/ai/socratic | POST | src/app/api/ai/socratic/route.ts | Generate a Socratic tutor turn for quiz remediation. | POST question/answer/context/history payload. | JSON tutor message/turn metadata/sources. | Demo canned path; otherwise authenticated + rate-limited. | AI provider. | AI provider env if live |
| /api/ai/study-agent | POST | src/app/api/ai/study-agent/route.ts | Study-agent note tools: summarize, flashcards, code_check. | POST `{ action, content }`. | JSON `{ text }` or error. | Demo canned path; otherwise authenticated + rate-limited. | AI provider. | AI provider env if live |
| /api/ai/tutor | POST | src/app/api/ai/tutor/route.ts | Contextual AI tutor endpoint. | POST tutor/chat payload. | AI response JSON/stream depending handler. | Demo canned path; otherwise authenticated + rate-limited. | AI provider and Supabase auth. | AI provider env if live |
| /api/cron/compute-signals | GET | src/app/api/cron/compute-signals/route.ts | Cron job computing user signals such as velocity and churn risk. | GET with `Authorization: Bearer ${CRON_SECRET}`. | JSON job summary/errors. | CRON_SECRET bearer token. | Supabase service/admin writes. | CRON_SECRET |
| /api/cron/focus-review-scan | GET | src/app/api/cron/focus-review-scan/route.ts | Cron job generating focus-review queues. | GET with `Authorization: Bearer ${CRON_SECRET}`. | JSON job summary/errors. | CRON_SECRET bearer token. | Focus review generator and Supabase. | CRON_SECRET |
| /api/og/score | GET | src/app/api/og/score/route.tsx | Generate Open Graph readiness score image. | GET query params `score`, `zone`, optional `delta`; values sanitized/clamped. | `ImageResponse` graphic response. | Public; sanitizes query params. | Next `ImageResponse`; no database. | — |
| /api/payments/checkout | POST | src/app/api/payments/checkout/route.ts | Create PayRex checkout for pro/prime/institutional tiers when payments are enabled. | POST `{ tier }`. | JSON checkout `{ url, id, provider: "payrex" }` or error code. | Requires payments enabled and authenticated user; demo returns local success URL. | PayRex provider abstraction; user subscription tier metadata. | NEXT_PUBLIC_APP_URL, PAYMENT_PROVIDER=payrex, PayRex env for live |
| /api/webhooks/payrex | POST | src/app/api/webhooks/payrex/route.ts | PayRex billing webhook. | POST raw body with PayRex signature header. | JSON receipt/idempotency/error. | Signature verification; payments flag. | user_subscriptions and processed_webhook_events. | PAYREX_WEBHOOK_SECRET |
| /auth/callback | GET | src/app/auth/callback/route.ts | Supabase OAuth/email callback; exchanges code and validates safe relative `next`. | GET query `code`, `next`, optional UTM/source params. | Redirect to next/dashboard/login error. | Public callback; demo redirects without exchange. | Supabase auth, UTM attribution, analytics event. | — |

Server actions and query modules live primarily in `src/lib/actions/` and `src/lib/queries/`; the detailed generated inventory is maintained in `.ai/api-and-server.md`.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 16.2.3 App Router |
| UI | React 19.2.5, TypeScript 5.9.3 |
| Styling | Tailwind CSS 4.2.4, `DESIGN.md`, `src/app/globals.css` |
| Components | shadcn-style primitives, Radix UI, Base UI, Phosphor/Lucide icons, Framer Motion |
| Database/Auth | Supabase/PostgreSQL, `@supabase/ssr`, Supabase Auth, RLS |
| State | Zustand client stores plus Server Actions/queries |
| 3D | React Three Fiber, drei, Three.js |
| Charts/Editors | Recharts, TipTap, CodeMirror, Mermaid |
| Payments | Deferred for this launch; PayRex runtime code is retained behind `NEXT_PUBLIC_PAYMENTS_ENABLED=false` |
| AI | OpenAI and Anthropic provider abstraction |
| Testing | Bun test runner, Playwright, Storybook |
| Package manager | Bun |


## Architecture Summary

- `middleware.ts` adds `x-pathname`, calls `src/lib/supabase/middleware.ts`, refreshes sessions, applies legacy redirects, and gates admin/developer/CEO routes.
- App routes live in `src/app/`; route groups include `(auth)`, `(protected)`, `admin`, `developer`, `dashboard`, `quiz`, `calculators`, `tools`, `api`.
- Most mutations live in Server Actions under `src/lib/actions/`; reads are split between actions and `src/lib/queries/`.
- Supabase clients are split by execution context: browser (`src/lib/supabase/client.ts`), server (`server.ts`), service role/admin (`admin.ts`), middleware (`middleware.ts`).
- Client-heavy surfaces include 3D Lab, quiz sessions, admin editors, wiki interactions, and notes.
- `next.config.ts` sets security headers, image remote patterns, server action body limit, PayRex externalization, Turbopack root, and route redirects.

## Data Models and Domain Entities

The schema snapshot is `DATABASE_SCHEMA.sql`; migrations live under `supabase/migrations/` (92 SQL files). The audit found 76 schema tables. The README lists every table at a concise level; `.ai/data-models.md` includes field counts and representative fields for every table.

### Domain families

| Domain family | Table count | Tables |
| --- | --- | --- |
| Identity/access | 6 | `profiles`, `user_roles`, `user_subscriptions`, `organizations`, `organization_members`, `user_push_tokens` |
| Learning graph | 5 | `disciplines`, `taxonomy_tree`, `taxonomy_cross_references`, `taxonomy_prerequisites`, `taxonomy_sources` |
| Wiki/content | 9 | `wiki_articles`, `wiki_article_reads`, `wiki_article_sources`, `wiki_article_taxonomy`, `wiki_bookmarks`, `wiki_ei_prompts`, `wiki_ei_responses`, `wiki_highlights`, `wiki_article_feedback` |
| Quiz/mastery/readiness | 23 | `questions`, `quiz_sessions`, `user_interactions`, `user_question_responses`, `anon_diagnostic_sessions`, `user_node_mastery`, `user_mastery_history`, `user_srs_cards`, `user_theta`, `user_global_stats`, `user_endurance_profiles`, `focus_review_queues`, `teach_back_submissions`, `topic_teach_back_criteria`, `session_predictions`, `calibration_snapshots`, `successive_relearning_cycles`, `confusion_pairs`, `daily_doses`, `exam_outcomes`, `user_computed_signals`, `readiness_score_snapshots`, `user_question_states` |
| Trails | 7 | `camp_trails`, `trail_days`, `trail_steps`, `trail_day_completions`, `user_trail_enrollments`, `user_trail_progress`, `session_trail_credits` |
| 3D Lab | 2 | `models_3d`, `spatial_hotspots` |
| Design practice | 7 | `design_problems`, `design_questions`, `design_problem_sessions`, `design_scenarios`, `design_scenario_questions`, `design_scenario_interactions`, `design_scenario_sessions` |
| Operations/notifications | 13 | `analytics_events`, `notifications`, `notification_log`, `notification_preferences`, `feature_flags`, `code_updates`, `processed_webhook_events`, `oath_taking_schedules`, `study_pods`, `pod_members`, `notes`, `note_folders`, `campfire_testimonials` |
| CEO/business | 4 | `ceo_cash_balance_entries`, `ceo_financial_entries`, `ceo_gate_status`, `ceo_team_members` |

### Complete table inventory

| Table | Domain family | Purpose |
| --- | --- | --- |
| `profiles` | Identity/access | User profile, exam-prep preferences, discipline target, onboarding status, school/reviewer metadata. |
| `disciplines` | Learning graph | Exam discipline catalog and discipline-level passing/subject metadata. |
| `organizations` | Identity/access | Institution/team records for organization-based access and seat limits. |
| `organization_members` | Identity/access | Join table assigning users to organizations with an organization role. |
| `user_roles` | Identity/access | Canonical app role assignments and role audit creator for admin/developer/CEO access. |
| `user_subscriptions` | Identity/access | Entitlement/subscription state, notification preferences, and payment-provider identifiers. |
| `user_push_tokens` | Identity/access | Registered push-notification tokens by user/platform and active status. |
| `oath_taking_schedules` | Operations/notifications | Oath-taking schedule reference data by date, region, and venue. |
| `study_pods` | Operations/notifications | Study pod groups with creator, capacity, and invite code. |
| `pod_members` | Operations/notifications | Study pod membership join table. |
| `questions` | Quiz/mastery/readiness | Question bank items with options, correct answer, rationale, difficulty, and source metadata. |
| `taxonomy_tree` | Learning graph | Learning taxonomy nodes, hierarchy, subject areas, slugs, and node metadata. |
| `taxonomy_cross_references` | Learning graph | Non-hierarchical taxonomy relationships between source and target nodes. |
| `taxonomy_prerequisites` | Learning graph | Prerequisite relationships between subtopics. |
| `taxonomy_sources` | Learning graph | Reference/source citations attached to taxonomy nodes. |
| `wiki_articles` | Wiki/content | Wiki article content, publication/review status, and reviewer metadata. |
| `wiki_article_reads` | Wiki/content | Per-user wiki reading progress and time-spent tracking. |
| `wiki_article_sources` | Wiki/content | Article-level citations and source metadata. |
| `wiki_article_taxonomy` | Wiki/content | Join table mapping wiki articles to taxonomy nodes with primary/sort flags. |
| `wiki_bookmarks` | Wiki/content | User bookmarks for wiki articles. |
| `wiki_ei_prompts` | Wiki/content | Embedded interactive prompts attached to wiki articles or taxonomy nodes. |
| `wiki_ei_responses` | Wiki/content | User responses to embedded interactive wiki prompts. |
| `wiki_highlights` | Wiki/content | User-highlighted wiki article text and color metadata. |
| `wiki_article_feedback` | Wiki/content | Helpfulness feedback for wiki articles. |
| `quiz_sessions` | Quiz/mastery/readiness | Quiz/session runtime state, config, question ordering, status, and timing. |
| `user_interactions` | Quiz/mastery/readiness | Detailed per-question interaction telemetry during quiz sessions. |
| `user_question_responses` | Quiz/mastery/readiness | Normalized user answer records with correctness, time, and confidence. |
| `anon_diagnostic_sessions` | Quiz/mastery/readiness | Anonymous diagnostic quiz state prior to conversion into a user account. |
| `user_node_mastery` | Quiz/mastery/readiness | Per-user mastery metrics by taxonomy node/topic, including attempts and teach-back signals. |
| `user_mastery_history` | Quiz/mastery/readiness | Historical mastery snapshots and reasons for mastery changes. |
| `user_srs_cards` | Quiz/mastery/readiness | SM-2/SRS scheduling state for user-node review cards. |
| `user_theta` | Quiz/mastery/readiness | IRT theta estimate and uncertainty per user/discipline. |
| `user_global_stats` | Quiz/mastery/readiness | Aggregate readiness, usage, acquisition, streak, and subscription-facing user metrics. |
| `user_endurance_profiles` | Quiz/mastery/readiness | Endurance/pacing baseline and current target state for long quiz/exam practice. |
| `focus_review_queues` | Quiz/mastery/readiness | Generated focus-review queue records and before/after mastery context. |
| `teach_back_submissions` | Quiz/mastery/readiness | Teach-back prompt submissions, evaluation result, gaps, and revision state. |
| `topic_teach_back_criteria` | Quiz/mastery/readiness | Topic-specific criteria used to evaluate teach-back responses. |
| `session_predictions` | Quiz/mastery/readiness | Prediction/postdiction calibration scores for quiz sessions. |
| `calibration_snapshots` | Quiz/mastery/readiness | Confidence-calibration/Brier snapshots over a time window. |
| `successive_relearning_cycles` | Quiz/mastery/readiness | Successive relearning state and spaced retest scheduling per topic. |
| `confusion_pairs` | Quiz/mastery/readiness | Detected topic-pair confusion/co-failure relationships. |
| `daily_doses` | Quiz/mastery/readiness | Daily activity recommendation/dose plans, rationale, and completion timing. |
| `exam_outcomes` | Quiz/mastery/readiness | Self-reported exam outcomes and readiness/session metrics near exam time. |
| `analytics_events` | Operations/notifications | Application analytics events with user, path, session, and properties. |
| `user_computed_signals` | Quiz/mastery/readiness | Derived risk, velocity, endurance, and lifecycle metrics for a user. |
| `readiness_score_snapshots` | Quiz/mastery/readiness | Readiness score snapshots with sub-scores and related session context. |
| `models_3d` | 3D Lab | 3D model asset catalog, review status, metadata, and URLs. |
| `spatial_hotspots` | 3D Lab | 3D model hotspot positions and linked taxonomy/content metadata. |
| `camp_trails` | Trails | Camp/trail learning programs with discipline, type, intensity, duration, and publish state. |
| `trail_days` | Trails | Day-level trail curriculum units and subject focus metadata. |
| `trail_steps` | Trails | Ordered activities within trail days, including step type and targets. |
| `trail_day_completions` | Trails | Completion records for a trail day and readiness/mastery deltas. |
| `user_trail_enrollments` | Trails | Per-user trail enrollment state, current day, status, and progress counters. |
| `user_trail_progress` | Trails | Step-level trail progress and credited quiz session/time. |
| `session_trail_credits` | Trails | Join table crediting quiz sessions to trail enrollment steps. |
| `notifications` | Operations/notifications | User notification records, metadata, read state, and timestamps. |
| `notification_log` | Operations/notifications | Notification delivery attempts by trigger, channel, and delivery status. |
| `notification_preferences` | Operations/notifications | Per-user notification preference switches across product trigger types. |
| `design_problems` | Design practice | Area C design problem briefs, program/site/code references, and publish status. |
| `design_questions` | Design practice | Questions attached to design problem scenarios with options/rationale/code citations. |
| `design_problem_sessions` | Design practice | User sessions for design problems and self-assessment score/timing. |
| `design_scenarios` | Design practice | Design scenario briefs including traps, program, site data, and code references. |
| `design_scenario_questions` | Design practice | Questions for design scenarios including trap/difficulty metadata. |
| `design_scenario_interactions` | Design practice | Per-question user interactions for design scenarios and trap fall-through tracking. |
| `design_scenario_sessions` | Design practice | User design-scenario session answers, score, traps, and elapsed time. |
| `ceo_cash_balance_entries` | CEO/business | CEO cash balance records for business cockpit financial tracking. |
| `ceo_financial_entries` | CEO/business | CEO revenue/expense entries, recurrence flag, and category tracking. |
| `ceo_gate_status` | CEO/business | CEO gate progression/status records and exit-condition notes. |
| `ceo_team_members` | CEO/business | CEO/team cost roster and system-role metadata for operating model tracking. |
| `feature_flags` | Operations/notifications | Database-backed feature flags, target tiers, and target roles. |
| `code_updates` | Operations/notifications | LEA/code update reference records with effective/testable status. |
| `notes` | Operations/notifications | User notes linked to folders/topics/source URLs with pin/archive status. |
| `note_folders` | Operations/notifications | User note folder names and timestamps. |
| `campfire_testimonials` | Operations/notifications | Campfire/testimonial records with scores, pass status, quote, and featured flag. |
| `processed_webhook_events` | Operations/notifications | Webhook idempotency ledger by provider/event/type. |
| `user_question_states` | Quiz/mastery/readiness | Per-user/per-question rollup of last seen/correct and aggregate attempts/time. |

See `.ai/data-models.md` for representative fields, relationship notes, and implementation pointers.


## Authentication and Access Control

- Public routes include `/`, `/about`, `/contact`, `/pricing`, `/try`, auth pages, and `/admin/login`.
- Dashboard, quiz, wiki, notes, 3D Lab, and most student surfaces require authentication outside demo mode.
- Admin routes are gated by canonical roles and route-specific admin permissions in `src/lib/supabase/middleware.ts` and `src/lib/entitlements/policy.ts`.
- Developer routes require the `developerPortal` entitlement via `src/lib/developer/access.ts`.
- CEO routes require the `ceoPortal` entitlement via `src/lib/ceo/access.ts`.
- Role resolution priority: dev force user override, user_roles, profile role, app metadata, user metadata, owner/admin email fallbacks, member/anonymous fallback.
- Dev bypasses (`DEV_FORCE_USER_ID`, `ALLOW_DEV_PORTAL_BYPASS`, `DEV_FORCE_TIER`) are local/test-only risk surfaces and must not be enabled in production.

## Integrations
Active integrations are intentionally narrower after Plan B cleanup.

| Integration | Purpose | Relevant files | Environment/config | Launch status |
|---|---|---|---|---|
| Supabase | Auth, Postgres data, server/client access, service-role cron/admin paths. | `src/lib/supabase/`, `middleware.ts`, `DATABASE_SCHEMA.sql`, `supabase/migrations/` | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Launch-critical |
| PayRex | Deferred payment checkout/webhook provider; retained behind the disabled payment flag. | `src/lib/payrex/config.ts`, `src/lib/payments/provider.ts`, `src/app/api/payments/checkout/route.ts`, `src/app/api/webhooks/payrex/route.ts` | `PAYMENT_PROVIDER=payrex`, `PAYREX_SECRET_KEY`, `PAYREX_WEBHOOK_SECRET`, `NEXT_PUBLIC_PAYMENTS_ENABLED` | Deferred; not launch-blocking for the payment-free launch |
| AI provider abstraction | Tutor, Socratic, study-agent, embeddings, and question generation endpoints. | `src/lib/ai/`, `src/app/api/ai/*/route.ts`, `src/components/quiz-v2/FeedbackPanel.tsx` | `AI_PROVIDER`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, timeout vars | Deferred; launch UI does not depend on live providers |
| Next ImageResponse | Public readiness OG score image. | `src/app/api/og/score/route.tsx` | none | Launch-supporting |
| Playwright/Storybook/design lint | QA and component validation. | `playwright.config.ts`, `.storybook/`, `scripts/check-storybook.ts`, `DESIGN.md` | Playwright demo env vars | Launch-supporting |

Removed/deferred: LemonSqueezy runtime code, webhook route, test, dependency, and launch env requirements were removed in Plan B cleanup. Legacy `lemonsqueezy_*` columns still exist in generated schema/type files and require a later database cleanup decision.

## UI and Design System

- Design contract: `DESIGN.md`.
- Implemented CSS/Tailwind tokens: `src/app/globals.css`.
- Navigation/sidebar components: `src/components/sidebar/`, `src/components/layout/`, `src/components/portal/`, `src/components/marketing/`.
- UI primitives: `src/components/ui/` with shadcn/Radix-style patterns.
- Product-specific UI: quiz (`src/components/quiz-v2/`), wiki (`src/components/wiki/`), admin (`src/components/admin/`), analytics (`src/components/analytics/`), 3D/R3F (`src/features/3d-lab/`, `src/components/r3f/`).
- Visual principles from `DESIGN.md`: calm study-first UI, Atkinson Hyperlegible/Plus Jakarta/DM Mono typography, Camp Cobalt primary color, semantic success/warning/destructive colors, compact 4px rhythm, restrained elevation, accessible focus states.

## IP-Relevant / Proprietary Implementations

This is an implementation inventory only, not a legal conclusion. See `.ai/ip-inventory.md` for full details.


| IP-Relevant Item | Category | Status | Key Files | Why It Matters |
| --- | --- | --- | --- | --- |
| ALE taxonomy-linked learning graph | Content system / data model | Implemented | DATABASE_SCHEMA.sql; src/lib/actions/wiki-actions.ts; src/lib/actions/taxonomy.ts | Connects questions, wiki, trails, mastery and analytics around architecture exam taxonomy. |
| Quiz mode and session engine | Training/drill logic | Implemented | src/lib/actions/quiz-v2/; src/stores/useQuizStore.ts; src/lib/quiz/ | Custom exam-prep modes, session state, confidence/error handling, review/debrief. |
| Readiness score / mastery model | Scoring/evaluation logic | Implemented | src/lib/__tests__/readiness-score.test.ts; src/lib/actions/analytics.ts; src/lib/actions/mastery-actions.ts | Computes readiness, mastery, pacing, stamina, memory health and predictions. |
| SRS and focus-review queue | Training/drill logic | Implemented | src/lib/srs/; src/lib/focus-review/generate-queue.ts | Spaced repetition and weak-node queue generation for targeted review. |
| 3D Lab module system | 3D/interactive system | Implemented | src/features/3d-lab/ | Custom R3F module registry, camera controls, hotspots, onboarding, NBCP/stairway calculators. |
| Wall configurator engine | 3D/interactive system | Implemented | src/features/wall-configurator/ | Custom wall assembly/configuration validation engine. |
| Camp Trails progression | Custom business workflow | Implemented | src/lib/actions/trails.ts; src/lib/queries/trails.ts; DATABASE_SCHEMA.sql | Structured multi-day learning paths with step credits and day completions. |
| Area C design scenarios/problems | Domain-specific logic | Implemented | src/lib/actions/design-problems.ts; src/lib/actions/admin/design-scenarios.ts | Design-problem and scenario tables/actions tuned to architectural design exam prep. |
| Socratic tutor guardrails | Custom AI workflow | Experimental | src/app/api/ai/socratic/route.ts | Prompt rules restrict direct answer reveal and enforce guided learning turns/source tags. |
| Study-agent note atomicization | Custom AI workflow | Experimental | src/app/api/ai/study-agent/route.ts | AI summarizes notes, creates flashcard prompts, and checks code-related content. |
| Admin content editor/index routing | Custom workflow | Implemented | src/components/admin/unified-editor/; src/lib/actions/admin/content.ts | Unified content and question editing, import, taxonomy linking, preview/review workflows. |
| Entitlement/role policy model | Data model / access workflow | Implemented | src/lib/entitlements/; src/app/api/admin/flags/route.ts | Canonical roles, admin permissions, subscription tiers, feature flags, dev overrides. |
| CEO internal operating dashboard | Custom business workflow | Implemented | src/lib/actions/ceo/; src/lib/queries/ceo/ | Financial entries, cash balance, gate status, team metrics, investor export. |
| Lot geometry and construction calculators | Domain-specific logic | Implemented | src/app/calculators/_lib/; src/lib/lot-geometry/; src/lib/pd1096/ | Material quantity and lot-plotter calculations for architecture/construction study. |
| Exam outcome/results-day flows | Custom product workflow | Implemented | src/lib/actions/results-day.ts; src/app/dashboard/exam-outcome/actions.ts | Self-reported outcomes and readiness correlation/score reveal experiences. |
| Performance gate harness for 3D Lab | Automation/script | Implemented | .ai/00_performance/scripts/; .ai/00_performance/playwright/ | Custom Playwright/perf scripts for 3D Lab layout/controls/mobile/auth timing gates. |


## Testing and QA


| Area | Current setup |
| --- | --- |
| Unit/integration | Bun test runner; 74 `src/**/*.test.ts(x)` files across quiz, SRS, entitlements, admin, calculators, 3D Lab, middleware, logging. |
| E2E | 13 Playwright specs in `e2e/`, plus `e2e/support/authenticated-demo.ts`. |
| Performance browser tests | 2 Playwright specs under `.ai/00_performance/playwright/`. |
| Storybook | 106 story files; `bun run check:storybook` validates no placeholder story imports. |
| Coverage | No coverage reporter found. |
| Audit verification | This documentation audit ran inventory generation, `bun run test` (623 pass / 0 fail across 74 files), `bun run type-check` (pass), `bun run lint` (pass), `bun run check:storybook` (pass), `bun run design:lint` (0 errors / 10 warnings), and `git diff --check` (pass). `bun run build` was attempted but refused to start because an existing Next dev server process was alive. |


Key commands: `bun run type-check`, `bun run lint`, `bun run test`, `bun run test:e2e:smoke`, `bun run build`, `bun run design:lint`. See `.ai/testing.md` for full test inventory.


## Development Setup

1. Install dependencies with Bun:

```bash
bun install
```

2. Create `.env.local` with the variables documented below. Do not commit secrets.
3. Start development:

```bash
bun run dev
```

4. Open `http://localhost:3000`.

Local demo mode is available with `NEXT_PUBLIC_ENABLE_DEMO_MODE=true`; real Supabase mode requires Supabase URL/anon/service-role variables.

## Environment Variables
No secret values are documented here. Use placeholders only.

| Variable | Purpose | Required? | Exposure | Referenced from | Example |
|---|---|---|---|---|---|
| NEXT_PUBLIC_SUPABASE_URL | Client/server Supabase project URL. | Required | Client-exposed | `src/lib/supabase/client.ts; server/middleware helpers` | NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Client Supabase anon key. | Required | Client-exposed | `src/lib/supabase/client.ts; server/middleware helpers` | NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key> |
| SUPABASE_SERVICE_ROLE_KEY | Server service-role key for privileged admin/cron/server operations. | Required for admin/cron paths | Server-only | `src/lib/supabase/admin.ts and cron/admin helpers` | SUPABASE_SERVICE_ROLE_KEY=<service-role-key> |
| NEXT_PUBLIC_APP_URL | Base app URL used for public links and deferred checkout return URLs. | Required for production URLs; payment use is deferred | Client-exposed | URL helpers; `src/app/api/payments/checkout/route.ts` if payments are re-enabled | NEXT_PUBLIC_APP_URL=https://slatecamp.example |
| NEXT_PUBLIC_DEMO_MODE / NEXT_PUBLIC_ENABLE_DEMO_MODE | Enable demo-mode behavior and bypass/demo fixtures. | Optional | Client-exposed | `src/lib/demo/config.ts; auth/admin/demo helpers` | NEXT_PUBLIC_DEMO_MODE=false |
| NEXT_PUBLIC_PAYMENTS_ENABLED | Enables deferred payment UI/API behavior. Keep false for current launch. | Deferred payment provider | Client-exposed | `src/lib/constants/feature-flags.ts`; `src/lib/payments/provider.ts`; pricing/upgrade UI | NEXT_PUBLIC_PAYMENTS_ENABLED=false |
| PAYMENT_PROVIDER | Payment provider selector. Only `payrex` is supported after Plan B cleanup. | Optional; defaults to payrex | Server-only | `src/lib/payments/provider.ts` | PAYMENT_PROVIDER=payrex |
| PAYREX_SECRET_KEY | PayRex API secret for future live checkout. | Deferred payment provider | Server-only | `src/lib/payrex/config.ts` | PAYREX_SECRET_KEY=<payrex-secret> |
| PAYREX_WEBHOOK_SECRET | PayRex webhook verification secret for future paid launch. | Deferred payment provider | Server-only | `src/app/api/webhooks/payrex/route.ts` | PAYREX_WEBHOOK_SECRET=<payrex-webhook-secret> |
| CRON_SECRET | Bearer token for cron endpoints. | Required for cron deployment | Server-only | `src/app/api/cron/*/route.ts` | CRON_SECRET=<random-token> |
| AI_PROVIDER | AI backend selector for deferred AI endpoints. | Deferred AI provider | Server-only | `src/lib/ai/provider.ts` | AI_PROVIDER=openai |
| OPENAI_API_KEY | OpenAI key for deferred live AI provider behavior. | Deferred AI provider | Server-only | `src/lib/ai/provider.ts` | OPENAI_API_KEY=<openai-key> |
| ANTHROPIC_API_KEY | Anthropic key for deferred teach-back / Anthropic-backed AI paths. | Deferred AI provider | Server-only | `src/lib/actions/teach-back.ts` | ANTHROPIC_API_KEY=<anthropic-key> |
| AI_COMPLETION_TIMEOUT_MS / AI_EMBEDDING_TIMEOUT_MS / AI_STREAM_TIMEOUT_MS | Timeout tuning for deferred AI calls. | Deferred/optional | Server-only | `src/lib/ai/provider.ts and API handlers` | AI_COMPLETION_TIMEOUT_MS=30000 |
| ADMIN_EMAILS / OWNER_EMAILS | Role/bootstrap access email allowlists. | Required for owner/admin bootstrap as configured | Server-only | `src/lib/admin/roles.ts; src/lib/queries/ceo/auth.ts` | ADMIN_EMAILS=admin@example.com |
| ALLOW_DEV_PORTAL_BYPASS | Allows developer portal bypass in development/demo contexts. | Optional development only | Server-only | `src/lib/developer/access.ts` | ALLOW_DEV_PORTAL_BYPASS=false |
| DEV_FORCE_TIER / DEV_FORCE_USER_ID / DISABLE_DEV_FORCE_USER_ID | Development entitlement/user override controls. | Development/test only | Server-only | `entitlement/dev helpers and tests` | DEV_FORCE_TIER=prime |
| PLAYWRIGHT_* | Playwright base URL, demo auth, role/tier/email, port, and built-app toggles. | Test-only | Test automation | `scripts/playwright-run.ts; e2e specs; perf scripts` | PLAYWRIGHT_DEMO_AUTH=true |
| PERF_* | Performance audit memory-profile labels/files. | Perf-only | Local/test automation | `.ai/00_performance/scripts/*` | PERF_MEMORY_PROFILE_LABEL=local |
| AUDIT_BASE_URL | Audit/performance base URL override. | Optional | Local/test automation | `.ai/00_performance scripts` | AUDIT_BASE_URL=http://localhost:3000 |
| NODE_ENV / CI | Runtime and CI mode switches. | Environment-provided | Server/build/test | `Next/Bun/tooling scripts` | NODE_ENV=production |

### Variables observed locally but not active launch requirements

Prior audits observed names in local env files that are not referenced by current source/config/test automation or are deferred after Plan B cleanup: `GOOGLE_CLOUD_LOCATION`, `GOOGLE_CLOUD_PROJECT`, `LEMONSQUEEZY_API_KEY`, `NEXT_PUBLIC_PAYREX_PUBLIC_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`, `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `RESEND_API_KEY`, `STRIPE_MAX_PRICE_ID`, `STRIPE_PRO_PRICE_ID`. Do not copy values into docs.

## Available Scripts


| Script | Command |
| --- | --- |
| `bun run dev` | bun run scripts/dev.js |
| `bun run dev:turbo` | next dev --turbopack |
| `bun run dev:webpack` | next dev --webpack |
| `bun run build` | bun scripts/next-build.ts |
| `bun run start` | next start |
| `bun run check:storybook` | bun scripts/check-storybook.ts |
| `bun run storybook` | bun run check:storybook && storybook dev -p 6006 |
| `bun run build-storybook` | bun run check:storybook && storybook build |
| `bun run lint` | bun run check:storybook && eslint . |
| `bun run lint:fix` | eslint . --fix |
| `bun run test:e2e` | bun scripts/playwright-run.ts all |
| `bun run test:e2e:smoke` | bun scripts/playwright-run.ts smoke |
| `bun run test:e2e:prod` | bun scripts/playwright-run.ts prod |
| `bun run test:e2e:auth-demo` | bun scripts/playwright-run.ts auth-demo |
| `bun run test:e2e:auth-demo:learning` | bun scripts/playwright-run.ts auth-demo-learning |
| `bun run test:e2e:auth-demo:wiki` | bun scripts/playwright-run.ts auth-demo-wiki |
| `bun run test:e2e:auth-demo:portals` | bun scripts/playwright-run.ts auth-demo-portals |
| `bun run test:e2e:auth-demo:3d-lab` | bun scripts/playwright-run.ts auth-demo-3d-lab |
| `bun run test:e2e:auth-demo:restricted` | bun scripts/playwright-run.ts auth-demo-restricted |
| `bun run test:e2e:auth-demo:admin-content-admin` | bun scripts/playwright-run.ts auth-demo-admin-content-admin |
| `bun run test:e2e:auth-demo:admin-sme-reviewer` | bun scripts/playwright-run.ts auth-demo-admin-sme-reviewer |
| `bun run test:e2e:auth-demo:admin-developer` | bun scripts/playwright-run.ts auth-demo-admin-developer |
| `bun run test:e2e:auth-demo:ceo-portal` | bun scripts/playwright-run.ts auth-demo-ceo-portal |
| `bun run test:e2e:headed` | bun scripts/playwright-run.ts headed |
| `bun run test:e2e:ui` | bun scripts/playwright-run.ts ui |
| `bun run check:entitlements` | bun run scripts/check-entitlement-legacy-usage.ts |
| `bun run design:lint` | bunx --bun @google/design.md@0.1.0 lint DESIGN.md |
| `bun run type-check` | bun scripts/type-check.ts |
| `bun run test` / `bun test src/` | bun test src/ |
| `bun run validate:release` | bun run type-check && bun run lint && bun run check:entitlements && bun audit && bun run build && bun run test:e2e:prod && bun run test:e2e:auth-demo && bun run test:e2e:auth-demo:learning && bun run test:e2e:auth-demo:wiki && bun run test:e2e:auth-demo:restricted && bun run test:e2e:auth-demo:portals && bun run test:e2e:auth-demo:3d-lab && bun run test:e2e:auth-demo:admin-content-admin && bun run test:e2e:auth-demo:admin-sme-reviewer && bun run test:e2e:auth-demo:admin-developer && bun run test:e2e:auth-demo:ceo-portal |
| `bun run db:seed` | bun scripts/seed.ts |
| `bun run bones:build` | boneyard-js build http://localhost:3000/dashboard --out ./src/bones |
| `bun run perf:environment` | bun .ai/00_performance/scripts/environment.mjs |
| `bun run perf:inventory` | bun .ai/00_performance/scripts/inventory.mjs |
| `bun run perf:frontend` | PLAYWRIGHT_DEMO_AUTH=true bunx playwright test --config=.ai/00_performance/playwright/playwright.perf.config.ts --project=chromium --workers=1 |
| `bun run perf:e2e` | bun run perf:frontend |
| `bun run perf:api` | bun .ai/00_performance/scripts/api-benchmark.mjs |
| `bun run perf:supabase` | bun .ai/00_performance/scripts/supabase-inventory.mjs |
| `bun run perf:build` | bun .ai/00_performance/scripts/build-startup.mjs |
| `bun run perf:build:demo-auth` | bun .ai/00_performance/scripts/build-demo-auth-app.mjs |
| `bun run perf:hotspots` | bun .ai/00_performance/scripts/hotspot-audit.mjs |
| `bun run perf:summary` | bun .ai/00_performance/scripts/summarize.mjs |
| `bun run perf:all` | bun run perf:inventory && bun run perf:environment && bun run perf:supabase && bun run perf:hotspots && bun run perf:api && bun run perf:frontend && bun run perf:build && bun run perf:summary |
| `bun run perf:compare` | bun .ai/00_performance/scripts/compare-performance.mjs |
| `bun run perf:snapshot` | bun .ai/00_performance/scripts/snapshot-performance.mjs |
| `bun run perf:3d:built-auth-repeat` | bun .ai/00_performance/scripts/3d-lab-built-auth-repeat.mjs |
| `bun run perf:3d:auth-timing` | PLAYWRIGHT_DEMO_AUTH=true PLAYWRIGHT_USE_BUILT_APP=true THREED_MODE=auth-timing bunx playwright test --config=.ai/00_performance/playwright/playwright.3d.config.ts --project=chromium --workers=1 |
| `bun run perf:3d:onboarding` | PLAYWRIGHT_DEMO_AUTH=true PLAYWRIGHT_USE_BUILT_APP=true THREED_MODE=onboarding bunx playwright test --config=.ai/00_performance/playwright/playwright.3d.config.ts --project=chromium --workers=1 |
| `bun run perf:3d:smoke` | PLAYWRIGHT_DEMO_AUTH=true PLAYWRIGHT_USE_BUILT_APP=true THREED_MODE=module-smoke bunx playwright test --config=.ai/00_performance/playwright/playwright.3d.config.ts --project=chromium --workers=1 |
| `bun run perf:3d:mobile` | PLAYWRIGHT_DEMO_AUTH=true PLAYWRIGHT_USE_BUILT_APP=true THREED_MODE=mobile-webgl bunx playwright test --config=.ai/00_performance/playwright/playwright.3d.config.ts --project=chromium --workers=1 |
| `bun run perf:3d:gates` | bun .ai/00_performance/scripts/3d-lab-gate-check.mjs |
| `bun run perf:3d:fallbacks` | PLAYWRIGHT_DEMO_AUTH=true PLAYWRIGHT_USE_BUILT_APP=true THREED_MODE=fallbacks bunx playwright test --config=.ai/00_performance/playwright/playwright.3d.config.ts --project=chromium --workers=1 |
| `bun run perf:3d:layout-audit` | bun .ai/00_performance/scripts/3d-lab-layout-controls-audit.mjs --mode=layout |
| `bun run perf:3d:controls-audit` | bun .ai/00_performance/scripts/3d-lab-layout-controls-audit.mjs --mode=controls |
| `bun run perf:3d:layout-consistency` | PLAYWRIGHT_DEMO_AUTH=true PLAYWRIGHT_USE_BUILT_APP=true THREED_FAIL_ON_CRITICAL=true THREED_MODE=layout-consistency bunx playwright test --config=.ai/00_performance/playwright/playwright.3d.config.ts --project=chromium --workers=1 |
| `bun run perf:3d:interaction-consistency` | PLAYWRIGHT_DEMO_AUTH=true PLAYWRIGHT_USE_BUILT_APP=true THREED_FAIL_ON_CRITICAL=true THREED_MODE=interaction-consistency bunx playwright test --config=.ai/00_performance/playwright/playwright.3d.config.ts --project=chromium --workers=1 |


## Build and Deployment

- Production build: `bun run build` (`bun scripts/next-build.ts`).
- Start built app: `bun run start`.
- Playwright built-app flows use `PLAYWRIGHT_USE_BUILT_APP=true` through scripts.
- Security headers and redirects are configured in `next.config.ts`.
- Vercel-compatible cron behavior is implemented through `/api/cron/*`, but hosting/deployment configuration was not fully verified from current codebase during this audit.


## Pre-launch Readiness / Cleanup Status

A pre-launch cleanup analysis was added on 2026-04-29. The recommended default is **Plan B — Recommended pre-launch cleanup**: protect the core learner loop and admin content operations, remove pre-launch legacy compatibility paths, consolidate duplicate route families, hide/defer optional experiments, and choose a single payment/AI stance before launch. Detailed plans live in `.ai/prelaunch-readiness.md`, `.ai/cleanup-plan.md`, `.ai/legacy-retirement-plan.md`, `.ai/do-not-maintain.md`, `.ai/launch-cutline.md`, and `.ai/risk-register.md`.

## Known Issues and Gaps
| Issue/GAP | Evidence | Severity | Recommended action |
|---|---|---|---|
| Payment provider launch deferred | Runtime payment path is PayRex-only and disabled by default (`src/lib/constants/feature-flags.ts`, `src/lib/payments/provider.ts`, `src/app/api/webhooks/payrex/route.ts`). | Deferred post-launch | Keep `NEXT_PUBLIC_PAYMENTS_ENABLED=false`; run PayRex staging checkout/webhook QA only before a future paid launch. |
| Legacy LemonSqueezy schema columns remain | `src/types/supabase.ts` and `src/types/app.ts` still include `lemonsqueezy_customer_id` / `lemonsqueezy_subscription_id`; runtime provider/webhook/dependency were removed. | Medium | Decide whether to keep as dormant columns until DB reset/squash, or remove in an explicit DB cleanup PR. |
| Route surface is still broad | Current route count is 105 after shim removal; CEO/developer/studio/professional/pods/result-day/DAE surfaces remain gated/internal/optional rather than deleted. | Medium | Product/founder cutline decision before final public launch nav polish. |
| Live AI provider behavior deferred | `/api/ai/*` routes support demo/canned paths; launch-facing quiz AI helper UI is disabled in `src/components/quiz-v2/FeedbackPanel.tsx`. | Deferred post-launch | Do not require OpenAI/Anthropic keys for current launch; provider smoke tests belong to future AI launch work. |
| Full release/performance matrix not fully run | Core commands passed (`test`, `type-check`, `lint`, `check:storybook`, `design:lint`, `build`, `test:e2e:prod`, `check:entitlements`, `perf:3d:gates`), but full `test:e2e`, `validate:release`, and `perf:all` were intentionally not run in this cleanup pass. | Medium | Run the full matrix before release if time/CI capacity allows. |
| Pre-existing dirty source changes remain outside this cleanup | Dirty provenance logged in `.ai/cleanup-execution-log.md` before source edits. | Medium | Review landing/sidebar/3D Lab pre-existing diffs separately before commit. |

## Important Files and Directories


| Path | Files | Dirs | Purpose | Notable Children |
| --- | --- | --- | --- | --- |
| src/components | 706 | 61 | Shared and domain UI components (admin, dashboard, wiki, quiz-v2, sidebar, ui, r3f, etc.) | .chunkhound, 3d, admin, analytics, assessment, auth, calculators, ceo, dashboard, dev, developer, graphics |
| src/features | 556 | 64 | Large feature modules, primarily 3D Lab and wall configurator. | 3d-lab, wall-configurator |
| src/lib | 400 | 62 | Server actions, queries, auth/entitlements, payments, AI, SRS, analytics, wiki, utilities. | __tests__, actions, adaptive, admin, ai, analytics, api, audio, audit, cache, cage, ceo |
| src/hooks | 13 | 1 | Reusable React hooks for notes, online status, charts, permissions, gestures and lab telemetry. | notes |
| src/stores | 5 | 0 | Zustand stores for dev controls, notifications, quiz and timer state. | — |
| src/config | 3 | 0 | Feature flag and portal configuration. | — |
| src/data | 4 | 1 | Static/local product data and fixtures. | seed |
| scripts | 45 | 2 | Development, build, Playwright, audit, seed and operational scripts. | audits, backups |
| public | 9 | 0 | Static assets served by Next.js. | — |


## Documentation / AI Context

Current root `.ai` docs generated/updated by this audit:

- `.ai/project-overview.md`
- `.ai/features.md`
- `.ai/routes.md`
- `.ai/architecture.md`
- `.ai/api-and-server.md`
- `.ai/data-models.md`
- `.ai/ip-inventory.md`
- `.ai/testing.md`
- `.ai/environment.md`
- `.ai/integrations.md`
- `.ai/ui-design-system.md`
- `.ai/security.md`
- `.ai/known-issues.md`
- `.ai/codebase-map.md`
- `.ai/audit-log.md`

## Last Audit

- **Date:** 2026-04-29
- **Scope:** repository-wide documentation audit from current files on disk.
- **Inventories generated:** routes, route handlers, server action/query files, env references, tests, schema tables, migrations, scripts, major folders.
- **Second-pass rule:** documentation was re-scanned against generated inventories before final response.
- **Secrets:** no real secret values were copied; `.env.local` was used only for variable names.
