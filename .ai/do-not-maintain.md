# Do Not Maintain List

**Audit date:** 2026-04-29

These are explicit pre-launch cleanup boundaries. Do not preserve or adjust for these paths unless a founder/product decision moves them into the launch cutline.

## Do-Not-Maintain List

| Do Not Maintain | Why | Evidence | Canonical Replacement | Files Affected | Safe Now? |
| --- | --- | --- | --- | --- | --- |
| Redirect-only legacy pages (`/settings`, `/test-3d`, `/dashboard/heatmap`, `/dashboard/trail(s)`, `/admin/wiki`) | Pre-launch has no user base requiring old paths. | Redirect pages in `src/app/**/page.tsx` and `next.config.ts` legacy redirects. | Canonical current routes: `/dashboard/settings`, `/dashboard/3d-lab`, `/dashboard/analytics`, `/dashboard/camptrails`, `/admin/knowledge`. | src/app redirect pages; next.config.ts; src/lib/routes.ts; e2e launch-smoke redirect block | Safe now after route tests unless founder wants SEO/backlink preservation. |
| Both `/tools` and `/calculators` as separate public utility families | Two namespaces split calculator/tool product surface. | `src/lib/routes.ts` maps calculator root to `/tools` while `suiteRoot` is `/calculators`; both app folders exist. | One canonical public tools namespace. | src/app/tools; src/app/calculators; calculator cards/tests/docs | Requires product decision on canonical URL. |
| LemonSqueezy as a half-enabled alternate payment provider | Runtime provider was removed and is not part of the payment-free launch. | `src/lib/lemonsqueezy/`, `src/app/api/webhooks/lemonsqueezy/route.ts`, and dependency are absent; only schema/type remnants remain. | No-payments launch now; explicit DB cleanup later. | env docs; schema/types; archived docs | Safe now; DB cleanup requires separate decision. |
| AI endpoints as base launch dependency | Provider behavior not verified and keys optional. | `src/app/api/ai/*`, `.ai/features.md` marks AI experimental. | Launch-critical app should work without AI keys; optionally keep Socratic behind feature/entitlement. | AI routes, quiz SocraticExplorer, teach-back actions, env docs | Requires decision if AI tutor is marketing promise. |
| Demo-auth UX as production behavior | Demo mode is test harness. | `NEXT_PUBLIC_ENABLE_DEMO_MODE`, `PLAYWRIGHT_DEMO_*`, `src/lib/demo/config.ts`, e2e demo specs. | Supabase real auth/session for launch; demo only in tests/dev. | middleware, demo config, e2e harness | Safe: keep tests, not product behavior. |
| Internal portals as public launch surface | Developer/CEO/admin tools are role-gated operations surfaces. | Routes under `/developer`, `/ceo`, `/admin`; middleware entitlements. | Hide from public nav/index; test access boundaries. | middleware, layouts, portal nav, e2e portal specs | Safe now. |
| Optional dashboard modes not in sidebar as launch obligations | They create polish/testing burden without primary user flow evidence. | `SIDEBAR_NAV_ITEMS` lacks DAE/studio/professional/results-day/pods/code-updates/notifications. | Canonical sidebar: Dashboard, Wiki, Notes, 3D Lab, Drills, Camp Trail, Flash, Analytics, Settings. | src/components/sidebar/sidebar-constants.ts; corresponding route folders/actions | Requires founder decision before deletion. |
| Old quiz mode aliases and legacy route helpers | No pre-launch need for old mode URL compatibility. | `next.config.ts` redirects `fullexam`, `extended`, `focused`; `ROUTES.quiz.legacy`. | Canonical `/quiz/[mode]/...` modes from `src/lib/quiz/mode-presets.ts`. | next.config.ts; src/lib/routes.ts; quiz route tests | Safe after route/mode tests. |
| Docs mirrors as independent truth | Mirrors cause drift. | `.ai/api-surface.md`, `.ai/data-model.md`, `.ai/testing-and-quality.md`, `.ai/known-gaps.md`. | Canonical docs: `.ai/api-and-server.md`, `.ai/data-models.md`, `.ai/testing.md`, `.ai/known-issues.md`. | docs links/README/.ai/README.md | Safe after link audit. |
| Tables for non-launch social/ops/CEO experiments | Schema can be reset pre-launch if no real prod data. | Low-usage table scan and optional routes/actions. | Schema should reflect chosen launch features only. | DATABASE_SCHEMA.sql; migrations; generated types; actions | Requires explicit DB reset/squash decision. |

## Additional do-not-maintain items from team evidence

| Do Not Maintain | Why | Evidence | Canonical Replacement | Files Affected | Safe Now? |
| --- | --- | --- | --- | --- | --- |
| Developer docs for nonexistent APIs | They mislead internal operators and future agents. | `src/lib/developer/api-reference-data.ts` references `/api/debug-taxonomy`; no route file exists. | Developer API reference should be generated/curated only from live route handlers. | src/lib/developer/api-reference-data.ts; .ai/api-and-server.md | Safe now after path check. |
| One-line compatibility re-export folders in 3D Lab | They preserve old import paths without launch evidence. | Worker scan found 3D Lab `_config/_stores/_types` and template Library shims are re-export-only and unimported. | Canonical `src/features/3d-lab` registry/components paths. | src/features/3d-lab/** compatibility folders | Safe after type-check/import audit. |
| Storybook-only design primitives as launch obligations | Unused primitives increase dependency and story maintenance. | Zero app imports for several `src/components/ui/*` primitives; some only support dependencies. | Only primitives used by launch routes or retained Storybook design-system scope. | src/components/ui/*; Storybook; package deps | Requires design-system decision. |
| Incomplete Supabase reset scripts | They are not representative of the launch schema. | `supabase/00_DROP_ALL_TABLES.sql` and `01_RESET_AND_SEED.sql` cover far fewer tables than current schema. | A regenerated launch baseline and complete seed script. | supabase/*.sql; migrations | Requires DB reset/squash decision. |


## Executed in Plan B cleanup

| Do Not Maintain | Why | Evidence | Canonical Replacement | Files Affected | Safe Now? |
|---|---|---|---|---|---|
| Quiz route legacy helpers and persisted-state migration for abandoned mode names | Pre-launch has no production localStorage compatibility requirement for old quiz mode names. | `ROUTES.quiz.legacy` and `useQuizStore` version-0 `oldModeMap` existed with no active source callers. | Canonical `/quiz/[mode]/...` routes and current mode names. | `src/lib/routes.ts`, `src/stores/useQuizStore.ts` | Done; type-check/test/lint/build passed. |

| Live AI helper UI during payment-free/live-AI-free launch | Live providers are deferred and not verified for launch. | `src/components/quiz-v2/FeedbackPanel.tsx` gates Socratic/mnemonic helpers; wiki article pages no longer render teach-back prompts. | Source-backed explanations from wiki/taxonomy/question rationales. | quiz feedback, wiki article pages, AI docs/env docs | Safe now; future AI launch requires provider QA. |
