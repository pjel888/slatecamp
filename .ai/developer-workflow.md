# Developer Workflow

**Last audit:** 2026-04-29

## Package manager

Use Bun. Commands are defined in `package.json`.

## Setup

```bash
bun install
cp .env.example .env.local # not currently available; create .env.local manually from environment.md
bun run dev
```

## Core commands

| Command | Purpose |
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
| `bun run test:e2e:auth-demo:sidebar` | bun scripts/playwright-run.ts auth-demo-sidebar |
| `bun run test:e2e:quiz-real` | bun scripts/playwright-run.ts quiz-real |
| `bun run test:e2e:drills-real` | bun scripts/playwright-run.ts quiz-real |
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
| `bun run test:coverage` | bun test --coverage src/ |
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


## Verification guidance

- Documentation-only changes: `git diff --check` plus path/reference checks.
- Source behavior changes: `bun run type-check`, `bun run lint`, targeted `bun test ...`, relevant Playwright suite.
- Design-token changes: `bun run design:lint`.
- Release gate: `bun run validate:release`.

## Caveats

- No committed `.env.example` exists.
- TypeScript strict mode is off.
- Hooks lint rules are disabled.
- Current audit began with pre-existing uncommitted implementation changes.
