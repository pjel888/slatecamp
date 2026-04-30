# Complete Route Map

**Last audit:** 2026-04-30
**Post-route-cleanup counts:** 109 `page.tsx` routes, 13 layouts, 92 loading states, 7 error boundaries.

This file is the canonical route inventory for the current codebase. It was refreshed after Quiz consolidation made `/quiz` the canonical hub and kept `/dashboard/drills` as redirect-only compatibility. Route groups in parentheses are omitted from URL paths. Dynamic params are shown with bracket syntax.

## Page routes

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
| /dashboard/drills | page | src/app/dashboard/drills/page.tsx | authenticated | Legacy redirect to `/quiz`. | Quiz compatibility | `next/navigation`, `@/lib/routes` | Redirect-only compatibility route. |
| /dashboard/drills/sessions | page | src/app/dashboard/drills/sessions/page.tsx | authenticated | Legacy redirect to `/quiz/sessions`. | Quiz compatibility | `next/navigation`, `@/lib/routes` | Redirect-only compatibility route. |
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
| /quiz/[mode]/session/[sessionId] | page dynamic | src/app/quiz/[mode]/session/[sessionId]/page.tsx | authenticated | Legacy modeful active-session compatibility wrapper. | Quiz session loop | `@/lib/quiz/mode-presets`, `@/lib/quiz/to-client-question`, `@/lib/supabase/server` (+1) | Dynamic params present. Has route loading state. |
| /quiz/[mode]/session/[sessionId]/results | page dynamic | src/app/quiz/[mode]/session/[sessionId]/results/page.tsx | authenticated | Legacy modeful results compatibility wrapper. | Quiz session loop | `@/lib/supabase/server`, `@/types/quiz-config`, `@/lib/quiz/mode-presets` (+5) | Dynamic params present. Has route loading state. |
| /quiz/[mode]/session/[sessionId]/review | page dynamic | src/app/quiz/[mode]/session/[sessionId]/review/page.tsx | authenticated | Legacy modeful review compatibility wrapper. | Quiz session loop | — | Dynamic params present. Has route loading state. |
| /quiz | page | src/app/quiz/page.tsx | authenticated | Canonical quiz hub. | Quiz builder | `./_components/QuizHubContent` | Has route loading state. |
| /quiz/sessions | page | src/app/quiz/sessions/page.tsx | authenticated | Canonical quiz session history. | Quiz session history | `@/components/testing/hub/SessionsTable`, `@/lib/supabase/server` | — |
| /quiz/session/[sessionId] | page dynamic | src/app/quiz/session/[sessionId]/page.tsx | authenticated | Canonical active quiz session. | Quiz session loop | `../_components/QuizSessionRoute` | Dynamic params present. |
| /quiz/session/[sessionId]/results | page dynamic | src/app/quiz/session/[sessionId]/results/page.tsx | authenticated | Canonical quiz results. | Quiz results | `../../_components/QuizResultsRoute` | Dynamic params present. |
| /quiz/session/[sessionId]/review | page dynamic | src/app/quiz/session/[sessionId]/review/page.tsx | authenticated | Canonical quiz review. | Quiz review | `@/components/quiz-v2/ReviewPage` | Dynamic params present. |
| /quiz/[mode]/setup | page dynamic | src/app/quiz/[mode]/setup/page.tsx | authenticated | Canonical quiz setup, active session, review, or results flow. | Quiz session loop | `@/lib/supabase/server`, `@/lib/actions/quiz-v2`, `@/types/quiz-config` (+1) | Dynamic params present. Has route loading state. |
| /register | page | src/app/(auth)/register/page.tsx | public/auth | Authentication, password reset, registration, or onboarding flow. | Auth/onboarding | `./register-form`, `@/lib/constants/site`, `@/lib/demo/config` (+1) | Has route loading state. |
| /tools | page | src/app/tools/page.tsx | public utility | Canonical public utility/calculator hub. | Tools/calculators | `@/components/marketing/MarketingNav`, `@/components/marketing/MarketingFooter`, `@/components/tools/ToolCard` (+2) | Has route loading state. |
| /tools/chb | page | src/app/tools/chb/page.tsx | public utility | Canonical 3D CHB estimating tool. | Tools/calculators | `@/components/calculators/CalculatorToolShell`, `@/components/calculators/calculator-tool-registry` | Legacy `/calculators/chb` redirects here. |
| /tools/drywall | page | src/app/tools/drywall/page.tsx | public utility | Canonical 3D drywall estimating tool. | Tools/calculators | `@/components/calculators/CalculatorToolShell`, `@/components/calculators/calculator-tool-registry` | Legacy `/calculators/drywall` redirects here. |
| /tools/floor-tiles-calculator | page | src/app/tools/floor-tiles-calculator/page.tsx | public utility | Public floor tile calculator. | Tools/calculators | `@/components/marketing/MarketingNav`, `@/components/marketing/MarketingFooter`, `@/lib/constants/site` (+2) | Has route loading state. |
| /tools/flooring | page | src/app/tools/flooring/page.tsx | public utility | Canonical 3D flooring estimating tool. | Tools/calculators | `@/components/calculators/CalculatorToolShell`, `@/components/calculators/calculator-tool-registry` | Legacy `/calculators/flooring` redirects here. |
| /tools/lot-plotter | page | src/app/tools/lot-plotter/page.tsx | public utility | Public lot plotting tool. | Tools/calculators | `@/components/marketing/MarketingNav`, `@/components/marketing/MarketingFooter`, `@/lib/constants/site` (+2) | Has route loading state. |
| /tools/paint | page | src/app/tools/paint/page.tsx | public utility | Canonical 3D paint estimating tool. | Tools/calculators | `@/components/calculators/CalculatorToolShell`, `@/components/calculators/calculator-tool-registry` | Legacy `/calculators/paint` redirects here. |
| /tools/wall-paint-calculator | page | src/app/tools/wall-paint-calculator/page.tsx | public utility | Public wall paint calculator. | Tools/calculators | `@/components/marketing/MarketingNav`, `@/components/marketing/MarketingFooter`, `@/lib/constants/site` (+2) | Has route loading state. |
| /try | page | src/app/try/page.tsx | public | Public marketing or conversion page. | Marketing/public | `@/components/assessment/PreAssessmentTeaser` | Has route loading state. |

## Layout segments

| Route Segment | File | Access |
| --- | --- | --- |
| / | src/app/layout.tsx | public |
| /admin | src/app/admin/layout.tsx | admin |
| /admin/search | src/app/admin/search/layout.tsx | admin |
| /ceo | src/app/(protected)/ceo/layout.tsx | owner/CEO |
| /dashboard | src/app/dashboard/layout.tsx | authenticated |
| /dashboard/3d-lab | src/app/dashboard/3d-lab/layout.tsx | authenticated |
| /dashboard/analytics | src/app/dashboard/analytics/layout.tsx | authenticated |
| /dashboard/drills | src/app/dashboard/drills/layout.tsx | authenticated |
| /dashboard/notes | src/app/dashboard/notes/layout.tsx | authenticated |
| /dashboard/score-reveal | src/app/dashboard/score-reveal/layout.tsx | authenticated |
| /dashboard/wiki | src/app/dashboard/wiki/layout.tsx | authenticated |
| /developer | src/app/developer/layout.tsx | developer/internal |
| /quiz | src/app/quiz/layout.tsx | authenticated |

## Loading states

| Route Segment | File | Access |
| --- | --- | --- |
| / | src/app/loading.tsx | public |
| /about | src/app/about/loading.tsx | public |
| /admin | src/app/admin/loading.tsx | admin |
| /admin/3d-models | src/app/admin/3d-models/loading.tsx | admin |
| /admin/activity | src/app/admin/activity/loading.tsx | admin |
| /admin/articles/[id] | src/app/admin/articles/[id]/loading.tsx | admin |
| /admin/assets | src/app/admin/assets/loading.tsx | admin |
| /admin/assets/[id] | src/app/admin/assets/[id]/loading.tsx | admin |
| /admin/audit | src/app/admin/audit/loading.tsx | admin |
| /admin/dashboard | src/app/admin/dashboard/loading.tsx | admin |
| /admin/knowledge | src/app/admin/knowledge/loading.tsx | admin |
| /admin/knowledge/[id] | src/app/admin/knowledge/[id]/loading.tsx | admin |
| /admin/knowledge/analytics | src/app/admin/knowledge/analytics/loading.tsx | admin |
| /admin/knowledge/import | src/app/admin/knowledge/import/loading.tsx | admin |
| /admin/knowledge/new | src/app/admin/knowledge/new/loading.tsx | admin |
| /admin/knowledge/questions | src/app/admin/knowledge/questions/loading.tsx | admin |
| /admin/knowledge/questions/new | src/app/admin/knowledge/questions/new/loading.tsx | admin |
| /admin/login | src/app/admin/login/loading.tsx | public/admin-auth |
| /admin/pipeline | src/app/admin/pipeline/loading.tsx | admin |
| /admin/reviews | src/app/admin/reviews/loading.tsx | admin |
| /admin/search | src/app/admin/search/loading.tsx | admin |
| /admin/settings | src/app/admin/settings/loading.tsx | admin |
| /admin/taxonomy | src/app/admin/taxonomy/loading.tsx | admin |
| /admin/taxonomy/coverage | src/app/admin/taxonomy/coverage/loading.tsx | admin |
| /ceo | src/app/(protected)/ceo/loading.tsx | owner/CEO |
| /ceo/financials | src/app/(protected)/ceo/financials/loading.tsx | owner/CEO |
| /ceo/insights | src/app/(protected)/ceo/insights/loading.tsx | owner/CEO |
| /ceo/team | src/app/(protected)/ceo/team/loading.tsx | owner/CEO |
| /contact | src/app/contact/loading.tsx | public |
| /dashboard | src/app/dashboard/loading.tsx | authenticated |
| /dashboard/3d-lab | src/app/dashboard/3d-lab/loading.tsx | authenticated |
| /dashboard/3d-lab/[moduleId] | src/app/dashboard/3d-lab/[moduleId]/loading.tsx | authenticated |
| /dashboard/analytics | src/app/dashboard/analytics/loading.tsx | authenticated |
| /dashboard/analytics/advanced | src/app/dashboard/analytics/advanced/loading.tsx | authenticated |
| /dashboard/area-c | src/app/dashboard/area-c/loading.tsx | authenticated |
| /dashboard/area-c/calculator | src/app/dashboard/area-c/calculator/loading.tsx | authenticated |
| /dashboard/area-c/design-problems | src/app/dashboard/area-c/design-problems/loading.tsx | authenticated |
| /dashboard/area-c/design-problems/[problemId] | src/app/dashboard/area-c/design-problems/[problemId]/loading.tsx | authenticated |
| /dashboard/area-c/design-quiz | src/app/dashboard/area-c/design-quiz/loading.tsx | authenticated |
| /dashboard/area-c/design-quiz/[scenarioId] | src/app/dashboard/area-c/design-quiz/[scenarioId]/loading.tsx | authenticated |
| /dashboard/assessment | src/app/dashboard/assessment/loading.tsx | authenticated |
| /dashboard/camptrails | src/app/dashboard/camptrails/loading.tsx | authenticated |
| /dashboard/camptrails/[slug] | src/app/dashboard/camptrails/[slug]/loading.tsx | authenticated |
| /dashboard/camptrails/[slug]/day/[dayNumber]/complete | src/app/dashboard/camptrails/[slug]/day/[dayNumber]/complete/loading.tsx | authenticated |
| /dashboard/camptrails/[slug]/today | src/app/dashboard/camptrails/[slug]/today/loading.tsx | authenticated |
| /dashboard/code-updates | src/app/dashboard/code-updates/loading.tsx | authenticated |
| /dashboard/cram-card | src/app/dashboard/cram-card/loading.tsx | authenticated |
| /dashboard/dae-mode | src/app/dashboard/dae-mode/loading.tsx | authenticated |
| /dashboard/drills | src/app/dashboard/drills/loading.tsx | authenticated |
| /dashboard/drills/sessions | src/app/dashboard/drills/sessions/loading.tsx | authenticated |
| /dashboard/exam-outcome | src/app/dashboard/exam-outcome/loading.tsx | authenticated |
| /dashboard/flash | src/app/dashboard/flash/loading.tsx | authenticated |
| /dashboard/flash/[category] | src/app/dashboard/flash/[category]/loading.tsx | authenticated |
| /dashboard/notes | src/app/dashboard/notes/loading.tsx | authenticated |
| /dashboard/notifications | src/app/dashboard/notifications/loading.tsx | authenticated |
| /dashboard/pods | src/app/dashboard/pods/loading.tsx | authenticated |
| /dashboard/pods/[podId] | src/app/dashboard/pods/[podId]/loading.tsx | authenticated |
| /dashboard/professional | src/app/dashboard/professional/loading.tsx | authenticated |
| /dashboard/results-day | src/app/dashboard/results-day/loading.tsx | authenticated |
| /dashboard/score-reveal | src/app/dashboard/score-reveal/loading.tsx | authenticated |
| /dashboard/settings | src/app/dashboard/settings/loading.tsx | authenticated |
| /dashboard/studio | src/app/dashboard/studio/loading.tsx | authenticated |
| /dashboard/upgrade | src/app/dashboard/upgrade/loading.tsx | authenticated |
| /dashboard/welcome-pro | src/app/dashboard/welcome-pro/loading.tsx | authenticated |
| /dashboard/wiki | src/app/dashboard/wiki/loading.tsx | authenticated |
| /dashboard/wiki/[slug] | src/app/dashboard/wiki/[slug]/loading.tsx | authenticated |
| /developer | src/app/developer/loading.tsx | developer/internal |
| /developer/api-reference | src/app/developer/api-reference/loading.tsx | developer/internal |
| /developer/architecture | src/app/developer/architecture/loading.tsx | developer/internal |
| /developer/status | src/app/developer/status/loading.tsx | developer/internal |
| /developer/status/database | src/app/developer/status/database/loading.tsx | developer/internal |
| /developer/status/infrastructure | src/app/developer/status/infrastructure/loading.tsx | developer/internal |
| /developer/tools | src/app/developer/tools/loading.tsx | developer/internal |
| /developer/tools/console | src/app/developer/tools/console/loading.tsx | developer/internal |
| /developer/tools/db | src/app/developer/tools/db/loading.tsx | developer/internal |
| /developer/tools/logs | src/app/developer/tools/logs/loading.tsx | developer/internal |
| /developer/tools/test-data | src/app/developer/tools/test-data/loading.tsx | developer/internal |
| /forgot-password | src/app/(auth)/forgot-password/loading.tsx | public/auth |
| /login | src/app/(auth)/login/loading.tsx | public/auth |
| /onboarding | src/app/(auth)/onboarding/loading.tsx | public/auth |
| /pricing | src/app/pricing/loading.tsx | public |
| /quiz | src/app/quiz/loading.tsx | authenticated |
| /quiz/[mode]/session/[sessionId] | src/app/quiz/[mode]/session/[sessionId]/loading.tsx | authenticated |
| /quiz/[mode]/session/[sessionId]/results | src/app/quiz/[mode]/session/[sessionId]/results/loading.tsx | authenticated |
| /quiz/[mode]/session/[sessionId]/review | src/app/quiz/[mode]/session/[sessionId]/review/loading.tsx | authenticated |
| /quiz/[mode]/setup | src/app/quiz/[mode]/setup/loading.tsx | authenticated |
| /register | src/app/(auth)/register/loading.tsx | public/auth |
| /tools | src/app/tools/loading.tsx | public utility |
| /tools/floor-tiles-calculator | src/app/tools/floor-tiles-calculator/loading.tsx | public utility |
| /tools/lot-plotter | src/app/tools/lot-plotter/loading.tsx | public utility |
| /tools/wall-paint-calculator | src/app/tools/wall-paint-calculator/loading.tsx | public utility |
| /try | src/app/try/loading.tsx | public |

## Error boundaries

| Route Segment | File | Access |
| --- | --- | --- |
| / | src/app/error.tsx | public |
| / | src/app/(auth)/error.tsx | public |
| /admin | src/app/admin/error.tsx | admin |
| /dashboard | src/app/dashboard/error.tsx | authenticated |
| /dashboard/3d-lab | src/app/dashboard/3d-lab/error.tsx | authenticated |
| /dashboard/analytics | src/app/dashboard/analytics/error.tsx | authenticated |
| /developer | src/app/developer/error.tsx | developer/internal |


## 2026-04-30 Quiz consolidation note

`/quiz` is the canonical standard quiz surface. `/dashboard/drills` and `/dashboard/drills/sessions` are redirect-only compatibility routes. General setup routes (`camp`, `chill`, `subject`, `custom`, `storm`, `full_exam`) redirect to `/quiz`; focused and endurance flows remain exceptions.
