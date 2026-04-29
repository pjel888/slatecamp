# Testing and QA

**Last updated:** 2026-04-29 after Plan B cleanup.

## Testing stack

- Bun unit/integration tests: `bun run test` (`bun test src/`).
- TypeScript check: `bun run type-check`.
- ESLint + Storybook precheck: `bun run lint`.
- Storybook consistency check: `bun run check:storybook`.
- Design standard lint: `bun run design:lint`.
- Playwright E2E scripts: `bun run test:e2e:*` via `scripts/playwright-run.ts`.
- Performance scripts: `bun run perf:*` under `.ai/00_performance/`.

## Current inventory

| Asset | Count | Notes |
|---|---:|---|
| Test/spec files | 88 | Includes Bun tests and E2E/spec files outside generated/vendor folders. |
| Storybook stories | 100 | After deleting story-only obsolete UI primitive stories. |
| Page routes under test surface | 105 | Current post-cleanup route count. |
| Route handlers | 12 | Includes `/auth/callback` and `/api/og/score` route.tsx. |

## Plan B cleanup test changes

- Deleted `src/app/api/webhooks/lemonsqueezy/route.test.ts` with the removed LemonSqueezy webhook route.
- Removed E2E assertions that protected obsolete redirect shims in `e2e/launch-smoke.spec.ts`.
- Updated auth callback demo test so it only rejects unsafe `next` values instead of preserving legacy route normalization.
- Removed `TestHarnessPath` from `src/features/3d-lab/components/LabBrowser.stories.tsx` after deleting `/test-3d`.
- Deleted obsolete Storybook-only UI primitive stories for bottom navigation, list group, pagination, stepper, and table.

## Test file inventory

| Test File | Area | Keep/Rewrite/Delete | Reason | Follow-up |
|---|---|---|---|---|
| `.ai/00_performance/playwright/3d-lab-production.spec.ts` | 3D Lab | Keep | Current test file present after Plan B cleanup. | Reclassify during deeper feature-specific cleanup if its route is later removed. |
| `.ai/00_performance/playwright/perf.spec.ts` | Unit/integration | Keep | Current test file present after Plan B cleanup. | Reclassify during deeper feature-specific cleanup if its route is later removed. |
| `e2e/access-boundaries.spec.ts` | E2E | Keep | Current test file present after Plan B cleanup. | Reclassify during deeper feature-specific cleanup if its route is later removed. |
| `e2e/admin-permissions-content-admin.spec.ts` | E2E | Keep | Current test file present after Plan B cleanup. | Reclassify during deeper feature-specific cleanup if its route is later removed. |
| `e2e/admin-permissions-developer.spec.ts` | E2E | Keep | Current test file present after Plan B cleanup. | Reclassify during deeper feature-specific cleanup if its route is later removed. |
| `e2e/admin-permissions-sme-reviewer.spec.ts` | E2E | Keep | Current test file present after Plan B cleanup. | Reclassify during deeper feature-specific cleanup if its route is later removed. |
| `e2e/authenticated-demo-3d-lab.spec.ts` | E2E | Keep | Current test file present after Plan B cleanup. | Reclassify during deeper feature-specific cleanup if its route is later removed. |
| `e2e/authenticated-demo-portals.spec.ts` | E2E | Keep | Current test file present after Plan B cleanup. | Reclassify during deeper feature-specific cleanup if its route is later removed. |
| `e2e/authenticated-demo-restricted.spec.ts` | E2E | Keep | Current test file present after Plan B cleanup. | Reclassify during deeper feature-specific cleanup if its route is later removed. |
| `e2e/authenticated-demo.spec.ts` | E2E | Keep | Current test file present after Plan B cleanup. | Reclassify during deeper feature-specific cleanup if its route is later removed. |
| `e2e/ceo-portal.spec.ts` | E2E | Keep | Current test file present after Plan B cleanup. | Reclassify during deeper feature-specific cleanup if its route is later removed. |
| `e2e/launch-smoke.spec.ts` | E2E | Keep | Current test file present after Plan B cleanup. | Reclassify during deeper feature-specific cleanup if its route is later removed. |
| `e2e/learning-flow.spec.ts` | E2E | Keep | Current test file present after Plan B cleanup. | Reclassify during deeper feature-specific cleanup if its route is later removed. |
| `e2e/sidebar-navigation.spec.ts` | E2E | Keep | Current test file present after Plan B cleanup. | Reclassify during deeper feature-specific cleanup if its route is later removed. |
| `e2e/wiki-learning.spec.ts` | E2E | Keep | Current test file present after Plan B cleanup. | Reclassify during deeper feature-specific cleanup if its route is later removed. |
| `src/app/admin/_components/AdminShell.test.ts` | Admin | Keep | Current test file present after Plan B cleanup. | Reclassify during deeper feature-specific cleanup if its route is later removed. |
| `src/app/api/payments/checkout/route.test.ts` | API/webhook | Keep | Current test file present after Plan B cleanup. | Reclassify during deeper feature-specific cleanup if its route is later removed. |
| `src/app/api/webhooks/payrex/route.test.ts` | API/webhook | Keep | Current test file present after Plan B cleanup. | Reclassify during deeper feature-specific cleanup if its route is later removed. |
| `src/app/calculators/_lib/__tests__/chb-engine.test.ts` | Unit/integration | Keep | Current test file present after Plan B cleanup. | Reclassify during deeper feature-specific cleanup if its route is later removed. |
| `src/app/calculators/_lib/__tests__/drywall-engine.test.ts` | Unit/integration | Keep | Current test file present after Plan B cleanup. | Reclassify during deeper feature-specific cleanup if its route is later removed. |
| `src/app/calculators/_lib/__tests__/flooring-engine.test.ts` | Unit/integration | Keep | Current test file present after Plan B cleanup. | Reclassify during deeper feature-specific cleanup if its route is later removed. |
| `src/app/calculators/_lib/__tests__/paint-engine.test.ts` | Unit/integration | Keep | Current test file present after Plan B cleanup. | Reclassify during deeper feature-specific cleanup if its route is later removed. |
| `src/components/admin/unified-editor/content-editor-index-routing.test.ts` | Admin | Keep | Current test file present after Plan B cleanup. | Reclassify during deeper feature-specific cleanup if its route is later removed. |
| `src/components/wiki/navigation/WikiSidebar.test.ts` | Unit/integration | Keep | Current test file present after Plan B cleanup. | Reclassify during deeper feature-specific cleanup if its route is later removed. |
| `src/features/3d-lab/DevControlsModule/dashboard/splits/bhl-display.test.ts` | 3D Lab | Keep | Current test file present after Plan B cleanup. | Reclassify during deeper feature-specific cleanup if its route is later removed. |
| `src/features/3d-lab/DevControlsModule/stores/useDevControlsStore.test.ts` | 3D Lab | Keep | Current test file present after Plan B cleanup. | Reclassify during deeper feature-specific cleanup if its route is later removed. |
| `src/features/3d-lab/components/onboarding/state.test.ts` | 3D Lab | Keep | Current test file present after Plan B cleanup. | Reclassify during deeper feature-specific cleanup if its route is later removed. |
| `src/features/3d-lab/config/module-paths.test.ts` | 3D Lab | Keep | Current test file present after Plan B cleanup. | Reclassify during deeper feature-specific cleanup if its route is later removed. |
| `src/features/3d-lab/config/modules/08-vertical/stairway-click-targets.test.ts` | 3D Lab | Keep | Current test file present after Plan B cleanup. | Reclassify during deeper feature-specific cleanup if its route is later removed. |
| `src/features/3d-lab/config/modules/08-vertical/stairway-computation.test.ts` | 3D Lab | Keep | Current test file present after Plan B cleanup. | Reclassify during deeper feature-specific cleanup if its route is later removed. |
| `src/features/3d-lab/config/modules/08-vertical/stairway-geometry.test.ts` | 3D Lab | Keep | Current test file present after Plan B cleanup. | Reclassify during deeper feature-specific cleanup if its route is later removed. |
| `src/features/3d-lab/config/registry/index.test.ts` | 3D Lab | Keep | Current test file present after Plan B cleanup. | Reclassify during deeper feature-specific cleanup if its route is later removed. |
| `src/features/3d-lab/constants/nbcp.test.ts` | 3D Lab | Keep | Current test file present after Plan B cleanup. | Reclassify during deeper feature-specific cleanup if its route is later removed. |
| `src/features/3d-lab/gate-copy.test.ts` | 3D Lab | Keep | Current test file present after Plan B cleanup. | Reclassify during deeper feature-specific cleanup if its route is later removed. |
| `src/features/3d-lab/stores/useViewportShellStore.test.ts` | 3D Lab | Keep | Current test file present after Plan B cleanup. | Reclassify during deeper feature-specific cleanup if its route is later removed. |
| `src/features/3d-lab/utils/camera-presets.test.ts` | 3D Lab | Keep | Current test file present after Plan B cleanup. | Reclassify during deeper feature-specific cleanup if its route is later removed. |
| `src/features/3d-lab/utils/nbcpCalculator.test.ts` | 3D Lab | Keep | Current test file present after Plan B cleanup. | Reclassify during deeper feature-specific cleanup if its route is later removed. |
| `src/features/wall-configurator/__tests__/engine-validation.test.ts` | Unit/integration | Keep | Current test file present after Plan B cleanup. | Reclassify during deeper feature-specific cleanup if its route is later removed. |
| `src/lib/__tests__/readiness-score.test.ts` | Unit/integration | Keep | Current test file present after Plan B cleanup. | Reclassify during deeper feature-specific cleanup if its route is later removed. |
| `src/lib/__tests__/routes.test.ts` | Unit/integration | Keep | Current test file present after Plan B cleanup. | Reclassify during deeper feature-specific cleanup if its route is later removed. |
| `src/lib/__tests__/wiki-markdown.test.ts` | Unit/integration | Keep | Current test file present after Plan B cleanup. | Reclassify during deeper feature-specific cleanup if its route is later removed. |
| `src/lib/actions/admin/assets.test.ts` | Admin | Keep | Current test file present after Plan B cleanup. | Reclassify during deeper feature-specific cleanup if its route is later removed. |
| `src/lib/actions/admin/content.test.ts` | Admin | Keep | Current test file present after Plan B cleanup. | Reclassify during deeper feature-specific cleanup if its route is later removed. |
| `src/lib/actions/admin/design-problems.test.ts` | Admin | Keep | Current test file present after Plan B cleanup. | Reclassify during deeper feature-specific cleanup if its route is later removed. |
| `src/lib/actions/admin/design-scenarios.test.ts` | Admin | Keep | Current test file present after Plan B cleanup. | Reclassify during deeper feature-specific cleanup if its route is later removed. |
| `src/lib/actions/admin/pipeline.test.ts` | Admin | Keep | Current test file present after Plan B cleanup. | Reclassify during deeper feature-specific cleanup if its route is later removed. |
| `src/lib/actions/admin/questions.test.ts` | Admin | Keep | Current test file present after Plan B cleanup. | Reclassify during deeper feature-specific cleanup if its route is later removed. |
| `src/lib/actions/admin/roles.test.ts` | Admin | Keep | Current test file present after Plan B cleanup. | Reclassify during deeper feature-specific cleanup if its route is later removed. |
| `src/lib/actions/admin/wiki.test.ts` | Admin | Keep | Current test file present after Plan B cleanup. | Reclassify during deeper feature-specific cleanup if its route is later removed. |
| `src/lib/actions/analytics.test.ts` | Unit/integration | Keep | Current test file present after Plan B cleanup. | Reclassify during deeper feature-specific cleanup if its route is later removed. |
| `src/lib/actions/dashboard-page.test.ts` | Unit/integration | Keep | Current test file present after Plan B cleanup. | Reclassify during deeper feature-specific cleanup if its route is later removed. |
| `src/lib/actions/dev/db-viewer.test.ts` | Unit/integration | Keep | Current test file present after Plan B cleanup. | Reclassify during deeper feature-specific cleanup if its route is later removed. |
| `src/lib/actions/dev/test-data.test.ts` | Unit/integration | Keep | Current test file present after Plan B cleanup. | Reclassify during deeper feature-specific cleanup if its route is later removed. |
| `src/lib/actions/preview-actions.test.ts` | Unit/integration | Keep | Current test file present after Plan B cleanup. | Reclassify during deeper feature-specific cleanup if its route is later removed. |
| `src/lib/actions/quiz-v2/get-session-questions.test.ts` | Unit/integration | Keep | Current test file present after Plan B cleanup. | Reclassify during deeper feature-specific cleanup if its route is later removed. |
| `src/lib/actions/quiz-v2/start-session.test.ts` | Unit/integration | Keep | Current test file present after Plan B cleanup. | Reclassify during deeper feature-specific cleanup if its route is later removed. |
| `src/lib/actions/quiz-v2/submit-answer.test.ts` | Unit/integration | Keep | Current test file present after Plan B cleanup. | Reclassify during deeper feature-specific cleanup if its route is later removed. |
| `src/lib/actions/quiz.test.ts` | Unit/integration | Keep | Current test file present after Plan B cleanup. | Reclassify during deeper feature-specific cleanup if its route is later removed. |
| `src/lib/admin/access-policy.test.ts` | Admin | Keep | Current test file present after Plan B cleanup. | Reclassify during deeper feature-specific cleanup if its route is later removed. |
| `src/lib/admin/editor-integrity/standard-question.test.ts` | Admin | Keep | Current test file present after Plan B cleanup. | Reclassify during deeper feature-specific cleanup if its route is later removed. |
| `src/lib/admin/editor-workflow.test.ts` | Admin | Keep | Current test file present after Plan B cleanup. | Reclassify during deeper feature-specific cleanup if its route is later removed. |
| `src/lib/admin/roles.test.ts` | Admin | Keep | Current test file present after Plan B cleanup. | Reclassify during deeper feature-specific cleanup if its route is later removed. |
| `src/lib/admin/topic-article-resolution.test.ts` | Admin | Keep | Current test file present after Plan B cleanup. | Reclassify during deeper feature-specific cleanup if its route is later removed. |
| `src/lib/audit/audit-queries.test.ts` | Unit/integration | Keep | Current test file present after Plan B cleanup. | Reclassify during deeper feature-specific cleanup if its route is later removed. |
| `src/lib/ceo/access.test.ts` | Unit/integration | Keep | Current test file present after Plan B cleanup. | Reclassify during deeper feature-specific cleanup if its route is later removed. |
| `src/lib/developer/access.test.ts` | Unit/integration | Keep | Current test file present after Plan B cleanup. | Reclassify during deeper feature-specific cleanup if its route is later removed. |
| `src/lib/entitlements/dev-overrides.test.ts` | Unit/integration | Keep | Current test file present after Plan B cleanup. | Reclassify during deeper feature-specific cleanup if its route is later removed. |
| `src/lib/entitlements/final-stretch.test.ts` | Unit/integration | Keep | Current test file present after Plan B cleanup. | Reclassify during deeper feature-specific cleanup if its route is later removed. |
| `src/lib/entitlements/middleware-authorization.test.ts` | Unit/integration | Keep | Current test file present after Plan B cleanup. | Reclassify during deeper feature-specific cleanup if its route is later removed. |
| `src/lib/entitlements/normalize-feature-flag.test.ts` | Unit/integration | Keep | Current test file present after Plan B cleanup. | Reclassify during deeper feature-specific cleanup if its route is later removed. |
| `src/lib/entitlements/policy.test.ts` | Unit/integration | Keep | Current test file present after Plan B cleanup. | Reclassify during deeper feature-specific cleanup if its route is later removed. |
| `src/lib/entitlements/resolve-entitlements.test.ts` | Unit/integration | Keep | Current test file present after Plan B cleanup. | Reclassify during deeper feature-specific cleanup if its route is later removed. |
| `src/lib/entitlements/resolve-role.test.ts` | Unit/integration | Keep | Current test file present after Plan B cleanup. | Reclassify during deeper feature-specific cleanup if its route is later removed. |
| `src/lib/focus-review/generate-queue.test.ts` | Unit/integration | Keep | Current test file present after Plan B cleanup. | Reclassify during deeper feature-specific cleanup if its route is later removed. |
| `src/lib/import/import-actions.test.ts` | Unit/integration | Keep | Current test file present after Plan B cleanup. | Reclassify during deeper feature-specific cleanup if its route is later removed. |
| `src/lib/logging/server.test.ts` | Unit/integration | Keep | Current test file present after Plan B cleanup. | Reclassify during deeper feature-specific cleanup if its route is later removed. |
| `src/lib/lot-geometry/__tests__/lot-geometry.test.ts` | Unit/integration | Keep | Current test file present after Plan B cleanup. | Reclassify during deeper feature-specific cleanup if its route is later removed. |
| `src/lib/pd1096/__tests__/computationEngine.test.ts` | Unit/integration | Keep | Current test file present after Plan B cleanup. | Reclassify during deeper feature-specific cleanup if its route is later removed. |
| `src/lib/quiz/adaptive-difficulty.test.ts` | Unit/integration | Keep | Current test file present after Plan B cleanup. | Reclassify during deeper feature-specific cleanup if its route is later removed. |
| `src/lib/quiz/confidence-calibration.test.ts` | Unit/integration | Keep | Current test file present after Plan B cleanup. | Reclassify during deeper feature-specific cleanup if its route is later removed. |
| `src/lib/quiz/mode-presets.test.ts` | Unit/integration | Keep | Current test file present after Plan B cleanup. | Reclassify during deeper feature-specific cleanup if its route is later removed. |
| `src/lib/quiz/stamina-analysis.test.ts` | Unit/integration | Keep | Current test file present after Plan B cleanup. | Reclassify during deeper feature-specific cleanup if its route is later removed. |
| `src/lib/quiz/to-client-question.test.ts` | Unit/integration | Keep | Current test file present after Plan B cleanup. | Reclassify during deeper feature-specific cleanup if its route is later removed. |
| `src/lib/rate-limit.test.ts` | Unit/integration | Keep | Current test file present after Plan B cleanup. | Reclassify during deeper feature-specific cleanup if its route is later removed. |
| `src/lib/srs/irt.test.ts` | Unit/integration | Keep | Current test file present after Plan B cleanup. | Reclassify during deeper feature-specific cleanup if its route is later removed. |
| `src/lib/srs/sm2.test.ts` | Unit/integration | Keep | Current test file present after Plan B cleanup. | Reclassify during deeper feature-specific cleanup if its route is later removed. |
| `src/lib/srs/update.test.ts` | Unit/integration | Keep | Current test file present after Plan B cleanup. | Reclassify during deeper feature-specific cleanup if its route is later removed. |
| `src/lib/supabase/middleware.test.ts` | Unit/integration | Keep | Current test file present after Plan B cleanup. | Reclassify during deeper feature-specific cleanup if its route is later removed. |

## Missing launch confidence checks

- PayRex live/staging checkout + webhook smoke before a future paid launch; not required for the current payment-free launch.
- Full Playwright `validate:release` run in a clean built-app environment.
- Broken-link crawl after final public navigation cutline.
- AI live-provider smoke if AI features are visible at launch.

## Deferred-provider test stance

Current launch is payment-free and live-AI-provider-free. Tests for `src/app/api/payments/checkout/route.test.ts` and `src/app/api/webhooks/payrex/route.test.ts` are useful regression coverage for deferred payment code, but they do not make PayRex launch-critical while `NEXT_PUBLIC_PAYMENTS_ENABLED=false`. LemonSqueezy webhook tests were deleted with the removed runtime route. No live OpenAI/Anthropic provider tests are required for this launch; add provider-backed smoke tests before future AI launch.

Launch-critical tests protect: core routes, access boundaries, quiz/session logic, wiki/content paths, entitlement checks, Storybook story integrity, design lint, build, and 3D performance gates.

## Final hardening verification update — 2026-04-29

Current launch stance is payment-free and live-AI-provider-free. The final local hardening pass verified the launch-critical suite without requiring PayRex, LemonSqueezy, OpenAI, or Anthropic live credentials.

| Command | Result | Notes |
|---|---|---|
| `bun run test` | Passed | 620 pass / 0 fail across 73 Bun files. |
| `bun run type-check` | Passed | TypeScript check clean. |
| `bun run lint` | Passed | Includes Storybook precheck. |
| `bun run check:storybook` | Passed | 100 story files scanned. |
| `bun run design:lint` | Passed with warnings | 0 errors, 10 existing token-reference warnings. |
| `bun run build` | Passed | Initial attempt blocked by existing local Next dev server; rerun passed after stopping local dev-server PIDs. |
| `bun run test:e2e:prod` | Passed on rerun | First attempt failed because the local Playwright Chromium/headless-shell cache was missing; `bunx playwright install chromium` restored the cache, then 36/36 passed. |
| `bun run check:entitlements` | Passed | Entitlement legacy usage check passed. |
| `bun run perf:3d:gates` | Passed | Warning/read-existing-artifact mode; no failures/warnings. |

Not run in this final pass: full `bun run test:e2e`, `bun run validate:release`, and `bun run perf:all`. These are broader CI/staging-sized suites and are recommended before a wider public release, but they are not blockers for founder/product review of the current payment-free/live-AI-free launch scope.
