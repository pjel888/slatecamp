# 00 — Repository Performance Inventory

Generated: 2026-05-04T00:41:36.514Z

## App framework and runtime
- Framework: Next.js 16.2.3 App Router.
- React: ^19.2.5.
- Runtime/package runner: Bun (`bun.lock` present).
- Next config: `next.config.ts` defines security headers, redirects, image remote patterns, server action body limit, and `payrex-node` as a server external package.
- Middleware: `middleware.ts` calls Supabase session refresh via `updateSession(request)` on all non-static/image paths, then forwards an `x-pathname` request header.

## Package manager and scripts
| Script | Command |
| --- | --- |
| `dev` | `bun run scripts/dev.js` |
| `dev:turbo` | `next dev --turbopack` |
| `dev:webpack` | `next dev --webpack` |
| `build` | `bun scripts/next-build.ts` |
| `start` | `next start` |
| `check:storybook` | `bun scripts/check-storybook.ts` |
| `storybook` | `bun run check:storybook && storybook dev -p 6006` |
| `build-storybook` | `bun run check:storybook && storybook build` |
| `lint` | `bun run check:storybook && eslint .` |
| `lint:fix` | `eslint . --fix` |
| `test:e2e` | `bun scripts/playwright-run.ts all` |
| `test:e2e:smoke` | `bun scripts/playwright-run.ts smoke` |
| `test:e2e:prod` | `bun scripts/playwright-run.ts prod` |
| `test:e2e:auth-demo` | `bun scripts/playwright-run.ts auth-demo` |
| `test:e2e:auth-demo:learning` | `bun scripts/playwright-run.ts auth-demo-learning` |
| `test:e2e:auth-demo:sidebar` | `bun scripts/playwright-run.ts auth-demo-sidebar` |
| `test:e2e:quiz-real` | `bun scripts/playwright-run.ts quiz-real` |
| `test:e2e:drills-real` | `bun scripts/playwright-run.ts quiz-real` |
| `test:e2e:auth-demo:wiki` | `bun scripts/playwright-run.ts auth-demo-wiki` |
| `test:e2e:auth-demo:portals` | `bun scripts/playwright-run.ts auth-demo-portals` |
| `test:e2e:auth-demo:3d-lab` | `bun scripts/playwright-run.ts auth-demo-3d-lab` |
| `test:e2e:auth-demo:restricted` | `bun scripts/playwright-run.ts auth-demo-restricted` |
| `test:e2e:auth-demo:admin-content-admin` | `bun scripts/playwright-run.ts auth-demo-admin-content-admin` |
| `test:e2e:auth-demo:admin-sme-reviewer` | `bun scripts/playwright-run.ts auth-demo-admin-sme-reviewer` |
| `test:e2e:auth-demo:admin-developer` | `bun scripts/playwright-run.ts auth-demo-admin-developer` |
| `test:e2e:auth-demo:ceo-portal` | `bun scripts/playwright-run.ts auth-demo-ceo-portal` |
| `test:e2e:headed` | `bun scripts/playwright-run.ts headed` |
| `test:e2e:ui` | `bun scripts/playwright-run.ts ui` |
| `check:entitlements` | `bun run scripts/check-entitlement-legacy-usage.ts` |
| `check:auth-cleanup-readiness` | `bun --env-file=.env.local scripts/check-auth-cleanup-readiness.ts` |
| `design:lint` | `bunx --bun @google/design.md@0.1.0 lint DESIGN.md` |
| `type-check` | `bun scripts/type-check.ts` |
| `test` | `bun test src/` |
| `test:coverage` | `bun test --coverage src/` |
| `validate:release` | `bun run type-check && bun run lint && bun run check:entitlements && bun audit && bun run build && bun run test:e2e:prod && bun run test:e2e:auth-demo && bun run test:e2e:auth-demo:learning && bun run test:e2e:auth-demo:wiki && bun run test:e2e:auth-demo:restricted && bun run test:e2e:auth-demo:portals && bun run test:e2e:auth-demo:3d-lab && bun run test:e2e:auth-demo:admin-content-admin && bun run test:e2e:auth-demo:admin-sme-reviewer && bun run test:e2e:auth-demo:admin-developer && bun run test:e2e:auth-demo:ceo-portal` |
| `db:seed` | `bun scripts/seed.ts` |
| `bones:build` | `boneyard-js build http://localhost:3000/dashboard --out ./src/bones` |
| `perf:environment` | `bun .ai/00_performance/scripts/environment.mjs` |
| `perf:inventory` | `bun .ai/00_performance/scripts/inventory.mjs` |
| `perf:frontend` | `PLAYWRIGHT_DEMO_AUTH=true bunx playwright test --config=.ai/00_performance/playwright/playwright.perf.config.ts --project=chromium --workers=1` |
| `perf:e2e` | `bun run perf:frontend` |
| `perf:api` | `bun .ai/00_performance/scripts/api-benchmark.mjs` |
| `perf:supabase` | `bun .ai/00_performance/scripts/supabase-inventory.mjs` |
| `perf:build` | `bun .ai/00_performance/scripts/build-startup.mjs` |
| `perf:build:demo-auth` | `bun .ai/00_performance/scripts/build-demo-auth-app.mjs` |
| `perf:hotspots` | `bun .ai/00_performance/scripts/hotspot-audit.mjs` |
| `perf:summary` | `bun .ai/00_performance/scripts/summarize.mjs` |
| `perf:all` | `bun run perf:inventory && bun run perf:environment && bun run perf:supabase && bun run perf:hotspots && bun run perf:api && bun run perf:frontend && bun run perf:build && bun run perf:summary` |
| `perf:compare` | `bun .ai/00_performance/scripts/compare-performance.mjs` |
| `perf:snapshot` | `bun .ai/00_performance/scripts/snapshot-performance.mjs` |
| `perf:3d:built-auth-repeat` | `bun .ai/00_performance/scripts/3d-lab-built-auth-repeat.mjs` |
| `perf:3d:auth-timing` | `PLAYWRIGHT_DEMO_AUTH=true PLAYWRIGHT_USE_BUILT_APP=true THREED_MODE=auth-timing bunx playwright test --config=.ai/00_performance/playwright/playwright.3d.config.ts --project=chromium --workers=1` |
| `perf:3d:onboarding` | `PLAYWRIGHT_DEMO_AUTH=true PLAYWRIGHT_USE_BUILT_APP=true THREED_MODE=onboarding bunx playwright test --config=.ai/00_performance/playwright/playwright.3d.config.ts --project=chromium --workers=1` |
| `perf:3d:smoke` | `PLAYWRIGHT_DEMO_AUTH=true PLAYWRIGHT_USE_BUILT_APP=true THREED_MODE=module-smoke bunx playwright test --config=.ai/00_performance/playwright/playwright.3d.config.ts --project=chromium --workers=1` |
| `perf:3d:mobile` | `PLAYWRIGHT_DEMO_AUTH=true PLAYWRIGHT_USE_BUILT_APP=true THREED_MODE=mobile-webgl bunx playwright test --config=.ai/00_performance/playwright/playwright.3d.config.ts --project=chromium --workers=1` |
| `perf:3d:gates` | `bun .ai/00_performance/scripts/3d-lab-gate-check.mjs` |
| `perf:3d:fallbacks` | `PLAYWRIGHT_DEMO_AUTH=true PLAYWRIGHT_USE_BUILT_APP=true THREED_MODE=fallbacks bunx playwright test --config=.ai/00_performance/playwright/playwright.3d.config.ts --project=chromium --workers=1` |
| `perf:3d:layout-audit` | `bun .ai/00_performance/scripts/3d-lab-layout-controls-audit.mjs --mode=layout` |
| `perf:3d:controls-audit` | `bun .ai/00_performance/scripts/3d-lab-layout-controls-audit.mjs --mode=controls` |
| `perf:3d:layout-consistency` | `PLAYWRIGHT_DEMO_AUTH=true PLAYWRIGHT_USE_BUILT_APP=true THREED_FAIL_ON_CRITICAL=true THREED_MODE=layout-consistency bunx playwright test --config=.ai/00_performance/playwright/playwright.3d.config.ts --project=chromium --workers=1` |
| `perf:3d:interaction-consistency` | `PLAYWRIGHT_DEMO_AUTH=true PLAYWRIGHT_USE_BUILT_APP=true THREED_FAIL_ON_CRITICAL=true THREED_MODE=interaction-consistency bunx playwright test --config=.ai/00_performance/playwright/playwright.3d.config.ts --project=chromium --workers=1` |
| `content-audit:pull` | `bun scripts/content-audit/export-article-bundles.ts` |
| `content-audit:export` | `bun scripts/content-audit/export-article-bundles.ts` |
| `content-audit:normalize` | `bun scripts/content-audit/normalize-article-bundles.ts` |
| `content-audit:inventory` | `bun scripts/content-audit/scan-component-inventory.ts` |
| `content-audit:components` | `bun scripts/content-audit/scan-component-inventory.ts` |
| `content-audit:compose` | `bun scripts/content-audit/compose-candidates.ts` |
| `content-audit:diff` | `bun scripts/content-audit/diff-candidates.ts` |
| `content-audit:validate` | `bun scripts/content-audit/validate-bundles.ts` |
| `content-audit:push:dry-run` | `bun scripts/content-audit/push-candidates-to-supabase.ts --dry-run` |
| `content-audit:push:apply` | `bun scripts/content-audit/push-candidates-to-supabase.ts --apply` |
| `content-audit:push` | `bun scripts/content-audit/push-candidates-to-supabase.ts` |
| `content-audit:roundtrip` | `bun scripts/content-audit/run-content-roundtrip.ts` |
| `content-audit:push-question:dry-run` | `bun scripts/content-audit/push-question-to-supabase.ts --dry-run` |
| `content-audit:push-question:apply` | `bun scripts/content-audit/push-question-to-supabase.ts --apply` |
| `content-audit:admin-log` | `bun scripts/content-audit/sync-run-log-to-admin-audit.ts` |
| `content-audit:component-suggestions` | `bun scripts/content-audit/suggest-component-placements.ts` |
| `content-audit:ui-block-edits` | `bun scripts/content-audit/validate-ui-block-edits.ts` |
| `content-audit:fact-check` | `bun scripts/content-audit/ai-feature-guard.ts fact-check` |
| `content-audit:rewrite` | `bun scripts/content-audit/ai-feature-guard.ts rewrite` |

## Installed test/performance tooling
| Tool | Installed | Version |
| --- | --- | --- |
| @playwright/test | yes | 1.59.1 |
| cypress | no |  |
| vitest | no |  |
| jest | no |  |
| lighthouse | no |  |
| web-vitals | no |  |
| k6 | no |  |
| autocannon | no |  |
| clinic | no |  |
| @next/bundle-analyzer | no |  |
| webpack-bundle-analyzer | no |  |
| react-scan | no |  |

## Existing test framework signals
- Playwright config exists at `playwright.config.ts` and E2E specs exist under `e2e/`.
- TypeScript validation is wrapped by `bun scripts/type-check.ts`.
- ESLint is available via `bun run lint`.
- Storybook validation is part of lint and storybook scripts.

## Frontend route/page inventory
- Page routes: 128
- Layout files: 15
- Loading states: 105
- Error boundaries: 8

### Route groups by user-facing surface
- Public route candidates (9): `/`, `/about`, `/auth/reset-password`, `/contact`, `/forgot-password`, `/login`, `/pricing`, `/register`, `/try`
- Dashboard route candidates (46): `/dashboard`, `/dashboard/3d-lab`, `/dashboard/3d-lab/:moduleId`, `/dashboard/analytics`, `/dashboard/analytics/advanced`, `/dashboard/area-c`, `/dashboard/area-c/calculator`, `/dashboard/area-c/design-problems`, `/dashboard/area-c/design-problems/:problemId`, `/dashboard/area-c/design-quiz`, `/dashboard/area-c/design-quiz/:scenarioId`, `/dashboard/assessment`, `/dashboard/camptrails`, `/dashboard/camptrails/:slug`, `/dashboard/camptrails/:slug/day/:dayNumber/complete`, `/dashboard/camptrails/:slug/today`, `/dashboard/code-updates`, `/dashboard/cram-card`, `/dashboard/dae-mode`, `/dashboard/drills`, `/dashboard/drills/sessions`, `/dashboard/exam-outcome`, `/dashboard/flash`, `/dashboard/flash/:category`, `/dashboard/notes`, `/dashboard/notifications`, `/dashboard/pods`, `/dashboard/pods/:podId`, `/dashboard/professional`, `/dashboard/quiz`, `/dashboard/quiz/:mode/session/:sessionId`, `/dashboard/quiz/:mode/session/:sessionId/results`, `/dashboard/quiz/:mode/session/:sessionId/review`, `/dashboard/quiz/:mode/setup`, `/dashboard/quiz/session/:sessionId`, `/dashboard/quiz/session/:sessionId/results`, `/dashboard/quiz/session/:sessionId/review`, `/dashboard/quiz/sessions`, `/dashboard/results-day`, `/dashboard/score-reveal`, `/dashboard/settings`, `/dashboard/studio`, `/dashboard/upgrade`, `/dashboard/welcome-pro`, `/dashboard/wiki`, `/dashboard/wiki/:slug`
- Admin route candidates (36): `/admin`, `/admin/3d-models`, `/admin/activity`, `/admin/ai-audit`, `/admin/ai-audit/articles`, `/admin/ai-audit/articles/:articleId`, `/admin/ai-audit/findings`, `/admin/ai-audit/findings/:findingId`, `/admin/ai-audit/proposals`, `/admin/ai-audit/questions`, `/admin/ai-audit/questions/:questionId`, `/admin/ai-audit/runs`, `/admin/ai-audit/runs/:runId`, `/admin/assets`, `/admin/assets/:id`, `/admin/audit`, `/admin/knowledge`, `/admin/knowledge/:id`, `/admin/knowledge/analytics`, `/admin/knowledge/import`, `/admin/knowledge/new`, `/admin/knowledge/questions`, `/admin/knowledge/questions/:id`, `/admin/knowledge/questions/design-problems`, `/admin/knowledge/questions/design-problems/:id`, `/admin/knowledge/questions/new`, `/admin/knowledge/questions/scenarios`, `/admin/knowledge/questions/scenarios/:id`, `/admin/login`, `/admin/pipeline`, `/admin/preview/:previewId`, `/admin/reviews`, `/admin/search`, `/admin/settings`, `/admin/taxonomy`, `/admin/taxonomy/coverage`
- Developer route candidates (11): `/developer`, `/developer/api-reference`, `/developer/architecture`, `/developer/status`, `/developer/status/database`, `/developer/status/infrastructure`, `/developer/tools`, `/developer/tools/console`, `/developer/tools/db`, `/developer/tools/logs`, `/developer/tools/test-data`
- Quiz route candidates (9): `/quiz`, `/quiz/:mode/session/:sessionId`, `/quiz/:mode/session/:sessionId/results`, `/quiz/:mode/session/:sessionId/review`, `/quiz/:mode/setup`, `/quiz/session/:sessionId`, `/quiz/session/:sessionId/results`, `/quiz/session/:sessionId/review`, `/quiz/sessions`

## API routes/server endpoints
| Path | Methods | File | Supabase | Auth/session signal |
| --- | --- | --- | --- | --- |
| `/api/admin/flags` | POST, DELETE | `src/app/api/admin/flags/route.ts` | no | no |
| `/api/ai/embed` | POST | `src/app/api/ai/embed/route.ts` | yes | yes |
| `/api/ai/generate-questions` | POST | `src/app/api/ai/generate-questions/route.ts` | yes | yes |
| `/api/ai/socratic` | none exported | `src/app/api/ai/socratic/route.ts` | yes | yes |
| `/api/ai/study-agent` | POST | `src/app/api/ai/study-agent/route.ts` | yes | yes |
| `/api/ai/tutor` | POST | `src/app/api/ai/tutor/route.ts` | yes | yes |
| `/api/cron/compute-signals` | GET | `src/app/api/cron/compute-signals/route.ts` | yes | no |
| `/api/cron/focus-review-scan` | GET | `src/app/api/cron/focus-review-scan/route.ts` | yes | no |
| `/api/payments/checkout` | POST | `src/app/api/payments/checkout/route.ts` | yes | yes |
| `/api/webhooks/payrex` | POST | `src/app/api/webhooks/payrex/route.ts` | yes | no |
| `/auth/callback` | GET | `src/app/auth/callback/route.ts` | yes | yes |

## Supabase usage summary
Detailed Supabase usage is generated by `bun run perf:supabase` into `.ai/00_performance/results/supabase_query_inventory.json` and summarized in `07_supabase_database.md`.

## Data-fetching architecture signals
- Source files scanned: 1998
- Data-fetching/Supabase/fetch files: 363
- Caching/revalidation/browser-storage files: 68
- Client components: 655
- Server-action-like files: 174
- React Query installed: no
- SWR installed: no
- Zustand installed: yes

## Existing E2E coverage
- `e2e/access-boundaries.spec.ts`
- `e2e/admin-permissions-content-admin.spec.ts`
- `e2e/admin-permissions-developer.spec.ts`
- `e2e/admin-permissions-sme-reviewer.spec.ts`
- `e2e/authenticated-demo-3d-lab.spec.ts`
- `e2e/authenticated-demo-portals.spec.ts`
- `e2e/authenticated-demo-restricted.spec.ts`
- `e2e/authenticated-demo.spec.ts`
- `e2e/ceo-portal.spec.ts`
- `e2e/launch-smoke.spec.ts`
- `e2e/learning-flow.spec.ts`
- `e2e/quiz-real-user-flow.spec.ts`
- `e2e/sidebar-navigation.spec.ts`
- `e2e/wiki-learning.spec.ts`

## Known user journeys to measure
| Journey | Candidate paths |
| --- | --- |
| landing/startup | `/`, `/try` |
| login/signup/recovery | `/login`, `/register`, `/forgot-password`, `/auth/reset-password` |
| dashboard/home | `/dashboard` |
| learning/wiki | `/dashboard/wiki`, `/dashboard/wiki/:slug` |
| quiz/session | `/quiz`, `/quiz/:mode/session/:sessionId`, `/quiz/:mode/session/:sessionId/results`, `/quiz/:mode/session/:sessionId/review`, `/quiz/:mode/setup`, `/quiz/session/:sessionId`, `/quiz/session/:sessionId/results`, `/quiz/session/:sessionId/review`, `/quiz/sessions` |
| 3d lab | `/dashboard/3d-lab`, `/dashboard/3d-lab/:moduleId` |
| admin/content | `/admin`, `/admin/3d-models`, `/admin/activity`, `/admin/ai-audit`, `/admin/ai-audit/articles`, `/admin/ai-audit/articles/:articleId`, `/admin/ai-audit/findings`, `/admin/ai-audit/findings/:findingId`, `/admin/ai-audit/proposals`, `/admin/ai-audit/questions`, `/admin/ai-audit/questions/:questionId`, `/admin/ai-audit/runs`, `/admin/ai-audit/runs/:runId`, `/admin/assets`, `/admin/assets/:id`, `/admin/audit`, `/admin/knowledge`, `/admin/knowledge/:id`, `/admin/knowledge/analytics`, `/admin/knowledge/import` |
| developer/internal | `/developer`, `/developer/api-reference`, `/developer/architecture`, `/developer/status`, `/developer/status/database`, `/developer/status/infrastructure`, `/developer/tools`, `/developer/tools/console`, `/developer/tools/db`, `/developer/tools/logs`, `/developer/tools/test-data` |

## Caching inventory
Evidence from source scan:
- Server cache/revalidation/fetch-cache directive files: 68
- Browser storage/cache-like state files are included in `.ai/00_performance/results/inventory.json`.
- Network/security headers are configured in `next.config.ts`.
- Supabase request caching is not globally evident from config; per-query evidence is in the Supabase inventory.

## Raw evidence
- Full inventory JSON: `.ai/00_performance/results/inventory.json`
- Route inventory JSON: `.ai/00_performance/results/route_inventory.json`
- Route target JSON: `.ai/00_performance/results/frontend_route_targets.json`
