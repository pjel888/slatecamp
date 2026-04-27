# 00 — Repository Performance Inventory

Generated: 2026-04-26T17:37:27.868Z

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
| `build` | `next build` |
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
| `test:e2e:auth-demo:portals` | `bun scripts/playwright-run.ts auth-demo-portals` |
| `test:e2e:auth-demo:3d-lab` | `bun scripts/playwright-run.ts auth-demo-3d-lab` |
| `test:e2e:auth-demo:restricted` | `bun scripts/playwright-run.ts auth-demo-restricted` |
| `test:e2e:headed` | `bun scripts/playwright-run.ts headed` |
| `test:e2e:ui` | `bun scripts/playwright-run.ts ui` |
| `check:entitlements` | `bun run scripts/check-entitlement-legacy-usage.ts` |
| `design:lint` | `bunx --bun @google/design.md@0.1.0 lint DESIGN.md` |
| `type-check` | `bun scripts/type-check.ts` |
| `validate:release` | `bun run type-check && bun run lint && bun run check:entitlements && bun audit && bun run build && bun run test:e2e:prod && bun run test:e2e:auth-demo && bun run test:e2e:auth-demo:learning && bun run test:e2e:auth-demo:restricted && bun run test:e2e:auth-demo:portals && bun run test:e2e:auth-demo:3d-lab` |
| `db:seed` | `bun scripts/seed.ts` |
| `bones:build` | `boneyard-js build http://localhost:3000/dashboard --out ./src/bones` |
| `perf:environment` | `bun .ai/00_performance/scripts/environment.mjs` |
| `perf:inventory` | `bun .ai/00_performance/scripts/inventory.mjs` |
| `perf:frontend` | `PLAYWRIGHT_DEMO_AUTH=true bunx playwright test --config=.ai/00_performance/playwright/playwright.perf.config.ts --project=chromium --workers=1` |
| `perf:e2e` | `bun run perf:frontend` |
| `perf:api` | `bun .ai/00_performance/scripts/api-benchmark.mjs` |
| `perf:supabase` | `bun .ai/00_performance/scripts/supabase-inventory.mjs` |
| `perf:build` | `bun .ai/00_performance/scripts/build-startup.mjs` |
| `perf:hotspots` | `bun .ai/00_performance/scripts/hotspot-audit.mjs` |
| `perf:summary` | `bun .ai/00_performance/scripts/summarize.mjs` |
| `perf:all` | `bun run perf:inventory && bun run perf:environment && bun run perf:supabase && bun run perf:hotspots && bun run perf:api && bun run perf:frontend && bun run perf:build && bun run perf:summary` |

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
- Page routes: 112
- Layout files: 15
- Loading states: 92
- Error boundaries: 7

### Route groups by user-facing surface
- Public route candidates (9): `/`, `/about`, `/auth/reset-password`, `/contact`, `/forgot-password`, `/login`, `/pricing`, `/register`, `/try`
- Dashboard route candidates (42): `/dashboard`, `/dashboard/3d-lab`, `/dashboard/3d-lab/:moduleId`, `/dashboard/analytics`, `/dashboard/analytics/advanced`, `/dashboard/area-c`, `/dashboard/area-c/calculator`, `/dashboard/area-c/design-problems`, `/dashboard/area-c/design-problems/:problemId`, `/dashboard/area-c/design-quiz`, `/dashboard/area-c/design-quiz/:scenarioId`, `/dashboard/assessment`, `/dashboard/camptrails`, `/dashboard/camptrails/:slug`, `/dashboard/camptrails/:slug/day/:dayNumber/complete`, `/dashboard/camptrails/:slug/today`, `/dashboard/code-updates`, `/dashboard/cram-card`, `/dashboard/dae-mode`, `/dashboard/drills`, `/dashboard/drills/sessions`, `/dashboard/exam-outcome`, `/dashboard/flash`, `/dashboard/flash/:category`, `/dashboard/heatmap`, `/dashboard/notes`, `/dashboard/notifications`, `/dashboard/pods`, `/dashboard/pods/:podId`, `/dashboard/professional`, `/dashboard/results-day`, `/dashboard/score-reveal`, `/dashboard/settings`, `/dashboard/settings/billing`, `/dashboard/settings/developer`, `/dashboard/studio`, `/dashboard/trail`, `/dashboard/trails`, `/dashboard/upgrade`, `/dashboard/welcome-pro`, `/dashboard/wiki`, `/dashboard/wiki/:slug`
- Admin route candidates (27): `/admin`, `/admin/3d-models`, `/admin/activity`, `/admin/assets`, `/admin/assets/:id`, `/admin/audit`, `/admin/knowledge`, `/admin/knowledge/:id`, `/admin/knowledge/analytics`, `/admin/knowledge/import`, `/admin/knowledge/new`, `/admin/knowledge/questions`, `/admin/knowledge/questions/:id`, `/admin/knowledge/questions/design-problems`, `/admin/knowledge/questions/design-problems/:id`, `/admin/knowledge/questions/new`, `/admin/knowledge/questions/scenarios`, `/admin/knowledge/questions/scenarios/:id`, `/admin/login`, `/admin/pipeline`, `/admin/preview/:previewId`, `/admin/reviews`, `/admin/search`, `/admin/settings`, `/admin/taxonomy`, `/admin/taxonomy/coverage`, `/admin/wiki`
- Developer route candidates (11): `/developer`, `/developer/api-reference`, `/developer/architecture`, `/developer/status`, `/developer/status/database`, `/developer/status/infrastructure`, `/developer/tools`, `/developer/tools/console`, `/developer/tools/db`, `/developer/tools/logs`, `/developer/tools/test-data`
- Quiz route candidates (5): `/quiz`, `/quiz/:mode/session/:sessionId`, `/quiz/:mode/session/:sessionId/results`, `/quiz/:mode/session/:sessionId/review`, `/quiz/:mode/setup`

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
| `/api/webhooks/lemonsqueezy` | POST | `src/app/api/webhooks/lemonsqueezy/route.ts` | yes | no |
| `/api/webhooks/payrex` | POST | `src/app/api/webhooks/payrex/route.ts` | yes | no |
| `/auth/callback` | GET | `src/app/auth/callback/route.ts` | yes | yes |

## Supabase usage summary
Detailed Supabase usage is generated by `bun run perf:supabase` into `.ai/00_performance/results/supabase_query_inventory.json` and summarized in `07_supabase_database.md`.

## Data-fetching architecture signals
- Source files scanned: 1971
- Data-fetching/Supabase/fetch files: 347
- Caching/revalidation/browser-storage files: 69
- Client components: 654
- Server-action-like files: 168
- React Query installed: no
- SWR installed: no
- Zustand installed: yes

## Existing E2E coverage
- `e2e/access-boundaries.spec.ts`
- `e2e/authenticated-demo-3d-lab.spec.ts`
- `e2e/authenticated-demo-portals.spec.ts`
- `e2e/authenticated-demo-restricted.spec.ts`
- `e2e/authenticated-demo.spec.ts`
- `e2e/launch-smoke.spec.ts`
- `e2e/learning-flow.spec.ts`
- `e2e/wiki-learning.spec.ts`

## Known user journeys to measure
| Journey | Candidate paths |
| --- | --- |
| landing/startup | `/`, `/try` |
| login/signup/recovery | `/login`, `/register`, `/forgot-password`, `/auth/reset-password` |
| dashboard/home | `/dashboard` |
| learning/wiki | `/dashboard/wiki`, `/dashboard/wiki/:slug` |
| quiz/session | `/quiz`, `/quiz/:mode/session/:sessionId`, `/quiz/:mode/session/:sessionId/results`, `/quiz/:mode/session/:sessionId/review`, `/quiz/:mode/setup` |
| 3d lab | `/dashboard/3d-lab`, `/dashboard/3d-lab/:moduleId` |
| admin/content | `/admin`, `/admin/3d-models`, `/admin/activity`, `/admin/assets`, `/admin/assets/:id`, `/admin/audit`, `/admin/knowledge`, `/admin/knowledge/:id`, `/admin/knowledge/analytics`, `/admin/knowledge/import`, `/admin/knowledge/new`, `/admin/knowledge/questions`, `/admin/knowledge/questions/:id`, `/admin/knowledge/questions/design-problems`, `/admin/knowledge/questions/design-problems/:id`, `/admin/knowledge/questions/new`, `/admin/knowledge/questions/scenarios`, `/admin/knowledge/questions/scenarios/:id`, `/admin/login`, `/admin/pipeline` |
| developer/internal | `/developer`, `/developer/api-reference`, `/developer/architecture`, `/developer/status`, `/developer/status/database`, `/developer/status/infrastructure`, `/developer/tools`, `/developer/tools/console`, `/developer/tools/db`, `/developer/tools/logs`, `/developer/tools/test-data` |

## Caching inventory
Evidence from source scan:
- Server cache/revalidation/fetch-cache directive files: 69
- Browser storage/cache-like state files are included in `.ai/00_performance/results/inventory.json`.
- Network/security headers are configured in `next.config.ts`.
- Supabase request caching is not globally evident from config; per-query evidence is in the Supabase inventory.

## Raw evidence
- Full inventory JSON: `.ai/00_performance/results/inventory.json`
- Route inventory JSON: `.ai/00_performance/results/route_inventory.json`
- Route target JSON: `.ai/00_performance/results/frontend_route_targets.json`
