# Launch Cutline

**Audit date:** 2026-04-29

## Recommended launch scope

Launch should center on the learner study loop and internal content operations. Anything outside that loop should be hidden, deferred, or deleted unless the founder explicitly chooses it for launch.

## Launch Cutline Table

| Area | Keep for Launch | Defer | Remove | Needs Decision | Notes |
| --- | --- | --- | --- | --- | --- |
| Public acquisition/auth | Homepage, about/contact/pricing/try, login/register/reset/callback/onboarding | Legacy public redirects and duplicate calculator SEO pages until URL decision | Old ALE starter redirects and redirect-only pages | Calculator namespace choice | Keep concise public funnel. |
| Student core learning | Dashboard, Wiki, Notes, Drills/Quiz v2, Camp Trails, Flash/SRS, Analytics, 3D Lab, Assessment | Pods, professional/results-day, DAE, Studio, code updates, notifications if not explicit launch promises | Redirect shims and old route aliases | Area C prominence | Launch should feel focused. |
| Internal operations | Admin CMS/content/question/taxonomy/assets/settings/reviews/audit; developer portal for internal status; CEO only if owner uses it | CEO analytics/financial cockpit polish | Public exposure of internal portals | Which internal portals block launch | Keep gated and out of public nav. |
| Integrations | Supabase; cron only with monitoring; OG image | PayRex, AI provider, LemonSqueezy, email/push/PostHog/Stripe/Google Cloud extras | LemonSqueezy runtime and unused envs | None for current payment-free/live-AI-free launch | Avoid half-enabled integrations. |
| Data/schema | Profiles, auth/roles, taxonomy, wiki, questions, quiz/mastery/readiness, trails, notes, admin content | Pods/CEO/design/social/notification/AI-generated extras unless selected | Low-usage tables after verification | Reset/squash decision | Pre-launch can reset if no prod data. |
| Tests/QA | Bun unit/integration, typecheck, lint, Storybook guard, build, launch smoke, access boundary e2e, selected 3D perf | Broad demo-auth variants that protect deferred features | Legacy redirect tests after route removal | Release-suite duration and env fixtures | Tests should protect launch behavior only. |

## Feature fate summary

| Feature | Current Status | Launch Classification | Key Files | Routes | Tests | Recommendation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Public marketing landing | Implemented | Launch-critical | src/app/page.tsx; src/components/landing/; src/components/marketing/ | /; /about; /contact; /pricing; /try | Bun/e2e coverage present in `.ai/testing.md` where applicable; verify after cleanup. | Keep and protect | Medium |
| Authentication and onboarding | Implemented | Launch-critical | src/app/(auth)/; src/app/auth/callback/route.ts; src/lib/supabase/middleware.ts; src/lib/actions/profile.ts | /login; /register; /forgot-password; /auth/reset-password; /auth/callback; /onboarding; /onboarding/comp-exam | Bun/e2e coverage present in `.ai/testing.md` where applicable; verify after cleanup. | Keep and protect | High |
| Student dashboard hub | Implemented | Launch-critical | src/app/dashboard/page.tsx; src/components/dashboard/; src/lib/actions/dashboard-page.ts | /dashboard | Bun/e2e coverage present in `.ai/testing.md` where applicable; verify after cleanup. | Keep and protect | High |
| Quiz engine v2 | Implemented | Launch-critical | src/components/quiz-v2/; src/lib/actions/quiz-v2/; src/stores/useQuizStore.ts | /quiz; /quiz/[mode]/setup; /quiz/[mode]/session/[sessionId]; /results; /review | Bun/e2e coverage present in `.ai/testing.md` where applicable; verify after cleanup. | Keep and protect | High |
| Adaptive drills and sessions | Implemented | Launch-critical | src/lib/actions/adaptive-session.ts; src/lib/queries/adaptive-quiz.ts; src/lib/actions/session-actions.ts | /dashboard/drills; /dashboard/drills/sessions | Bun/e2e coverage present in `.ai/testing.md` where applicable; verify after cleanup. | Keep and protect | High |
| Wiki learning system | Implemented | Launch-critical | src/components/wiki/; src/lib/actions/wiki-actions.ts; src/lib/actions/wiki-reads.ts; src/lib/actions/wiki-interactions.ts | /dashboard/wiki; /dashboard/wiki/[slug] | Bun/e2e coverage present in `.ai/testing.md` where applicable; verify after cleanup. | Keep and protect | High |
| Camp Trails | Implemented | Launch-critical | src/lib/actions/trails.ts; src/lib/queries/trails.ts; src/components/trails/ | /dashboard/camptrails; /dashboard/camptrails/[slug]; /today; /day/[dayNumber]/complete | Bun/e2e coverage present in `.ai/testing.md` where applicable; verify after cleanup. | Keep but simplify | Medium |
| 3D Lab | Implemented | Launch-critical | src/features/3d-lab/; src/components/r3f/; src/lib/actions/lab.ts | /dashboard/3d-lab; /dashboard/3d-lab/[moduleId] | Bun/e2e coverage present in `.ai/testing.md` where applicable; verify after cleanup. | Keep and protect | High |
| Area C design practice | Implemented | Launch-supporting | src/lib/actions/design-problems.ts; src/components/assessment/; src/app/dashboard/area-c/ | /dashboard/area-c; /design-problems; /design-quiz; dynamic sessions; /calculator | Bun/e2e coverage present in `.ai/testing.md` where applicable; verify after cleanup. | Hide from navigation but keep accessible | Medium |
| Assessment diagnostic | Implemented | Launch-critical | src/lib/actions/assessment.ts; src/components/assessment/ | /dashboard/assessment | Bun/e2e coverage present in `.ai/testing.md` where applicable; verify after cleanup. | Keep and protect | High |
| Readiness and analytics | Implemented | Launch-critical | src/lib/actions/analytics.ts; src/lib/actions/mastery-actions.ts; src/lib/__tests__/readiness-score.test.ts | /dashboard/analytics; /dashboard/analytics/advanced | Bun/e2e coverage present in `.ai/testing.md` where applicable; verify after cleanup. | Keep and protect | High |
| SRS and focus review | Implemented | Launch-supporting | src/lib/srs/; src/lib/actions/srs-review.ts; src/lib/focus-review/generate-queue.ts | /dashboard/flash; /dashboard/flash/[category]; /dashboard/cram-card; /api/cron/focus-review-scan | Bun/e2e coverage present in `.ai/testing.md` where applicable; verify after cleanup. | Keep but simplify | Medium |
| Notes workspace | Implemented | Launch-supporting | src/lib/actions/notes-actions.ts; src/hooks/useNoteEditor.ts; src/components/notes/ | /dashboard/notes | Bun/e2e coverage present in `.ai/testing.md` where applicable; verify after cleanup. | Keep and protect | Medium |
| Notifications and preferences | Implemented | Nice-to-have | src/lib/actions/notifications.ts; src/lib/actions/notification-triggers.ts | /dashboard/notifications; /dashboard/settings | Bun/e2e coverage present in `.ai/testing.md` where applicable; verify after cleanup. | Hide from navigation but keep accessible | Low |
| Settings and deferred billing | Partial | Launch-supporting + deferred | src/app/dashboard/settings/; src/app/dashboard/upgrade/page.tsx; src/app/api/payments/checkout/route.ts; src/lib/payments/ | /dashboard/settings; /dashboard/upgrade | Payment UI hidden while `NEXT_PUBLIC_PAYMENTS_ENABLED=false`. | Keep settings; defer billing | Low |
| Admin portal | Implemented | Launch-critical | src/app/admin/; src/components/admin/; src/lib/actions/admin/ | /admin plus /admin/* | Bun/e2e coverage present in `.ai/testing.md` where applicable; verify after cleanup. | Keep and protect | High |
| Developer portal | Implemented | Launch-supporting | src/app/developer/; src/lib/developer/access.ts; src/lib/actions/dev/ | /developer plus /developer/* | Bun/e2e coverage present in `.ai/testing.md` where applicable; verify after cleanup. | Hide behind internal-only access | Medium |
| CEO portal | Implemented | Nice-to-have | src/app/(protected)/ceo/; src/lib/actions/ceo/; src/lib/queries/ceo/ | /ceo plus /ceo/* | Bun/e2e coverage present in `.ai/testing.md` where applicable; verify after cleanup. | Hide behind internal-only access | Low |
| Deferred payments and webhooks | Deferred | Deferred post-launch | src/lib/payments/provider.ts; src/lib/payrex/config.ts | /api/payments/checkout; /api/webhooks/payrex | Targeted tests pass; live provider verification intentionally skipped. | Keep disabled for current launch | Low |
| Deferred AI tutor and generation | Experimental / deferred | Deferred post-launch | src/lib/ai/provider.ts; src/app/api/ai/; src/lib/actions/teach-back.ts; src/components/quiz-v2/FeedbackPanel.tsx | /api/ai/embed; /generate-questions; /socratic; /study-agent; /tutor | Live provider verification intentionally skipped; quiz AI helper UI disabled. | Keep code isolated; do not market as live | Low |
| Calculators and tools | Implemented | Nice-to-have | src/app/calculators/_lib/; src/components/calculators/; src/lib/lot-geometry/ | /calculators/*; /tools/* | Bun/e2e coverage present in `.ai/testing.md` where applicable; verify after cleanup. | Consolidate with another feature | Medium |
| Professional/results-day/exam outcome flows | Implemented | Nice-to-have | src/lib/actions/professional-mode.ts; src/lib/actions/results-day.ts; src/app/dashboard/exam-outcome/actions.ts | /dashboard/professional; /dashboard/results-day; /dashboard/exam-outcome; /dashboard/score-reveal | Bun/e2e coverage present in `.ai/testing.md` where applicable; verify after cleanup. | Defer and remove from launch surface | Medium |
| Study pods/social proof | Implemented | Nice-to-have | src/lib/actions/pods.ts; src/lib/actions/social-proof.ts | /dashboard/pods; /dashboard/pods/[podId] | Bun/e2e coverage present in `.ai/testing.md` where applicable; verify after cleanup. | Defer and remove from launch surface | Medium |
| Daily dose / DAE / studio modes | Partial | Experimental | src/lib/actions/daily-dose/; src/lib/actions/dae-mode.ts; src/lib/actions/studio-mode.ts | /dashboard/dae-mode; /dashboard/studio | Bun/e2e coverage present in `.ai/testing.md` where applicable; verify after cleanup. | Defer and remove from launch surface | Medium |
| Code updates | Implemented | Nice-to-have | src/lib/actions/code-updates.ts | /dashboard/code-updates | Bun/e2e coverage present in `.ai/testing.md` where applicable; verify after cleanup. | Hide from navigation but keep accessible | Low |
| Admin feature flags/dev overrides | Implemented | Launch-supporting | src/app/api/admin/flags/route.ts; src/config/feature-flags.ts; src/lib/entitlements/dev-overrides.ts | /api/admin/flags; developer/admin tooling | Bun/e2e coverage present in `.ai/testing.md` where applicable; verify after cleanup. | Hide behind internal-only access | Medium |
| Open Graph readiness score image | Implemented | Launch-supporting | src/app/api/og/score/route.tsx | /api/og/score | Bun/e2e coverage present in `.ai/testing.md` where applicable; verify after cleanup. | Keep and protect | Low |

## Route cutline summary

- Keep/protect: public funnel, auth/onboarding, dashboard, wiki, notes, drills/quiz, Camp Trails, 3D Lab, analytics, flash/SRS, assessment, admin internal operations.
- Hide/internal-only: developer, CEO, admin operational routes.
- Defer/hide: optional dashboard modes not in sidebar, pods/social, professional/results-day/score-reveal, DAE/studio, notifications/code updates unless product cutline says otherwise.
- Remove before launch: redirect-only legacy pages/routes and old route aliases unless SEO/backlink evidence exists.
- Consolidate: `/tools` and `/calculators` into one canonical public utility namespace.

## Decisions required

1. Resolved for this pass: free launch first; PayRex is deferred and not launch-blocking.
2. Resolved for this pass: LemonSqueezy remains removed/deferred; no alternate payment provider is active.
3. Resolved for this pass: live AI tutoring/generation is deferred; source-backed non-provider copy is allowed.
4. Is Area C design practice launch-prominent or hidden/beta?
5. Are pods/social and CEO cockpit launch scope or post-launch?
6. Is database reset/squash acceptable before first production data?
