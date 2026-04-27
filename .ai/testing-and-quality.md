# Testing & Quality

**Last Updated:** 2026-04-27

## Test Frameworks

### End-to-End: Playwright
- **Version:** 1.59.1
- **Config:** `playwright.config.ts`
- **Test directory:** `e2e/`
- **Projects:** Desktop Chromium + Mobile Chromium (Pixel 7)
- **Parallelism:** `fullyParallel: false` (serial execution)
- **Retries:** 2 in CI, 0 locally
- **Workers:** 1 in CI, default locally
- **Artifacts:** Trace on first retry, screenshots/videos on failure
- **Web server:** Custom Bun script `scripts/playwright-web-server.ts` with 120s timeout and memory profiling

### Unit / Integration: Bun Test Runner
- **Runner:** `bun:test` (native, no Jest/Vitest)
- **Files:** 69 `*.test.ts` files across `src/`
- **Run method:** Individual files or directories (no aggregated script)

### Component Testing: Storybook
- **Version:** 8.6.17 (Vite-based)
- **Stories:** 106+ story files
- **Coverage:** UI primitives, shared components, wiki blocks, quiz UI, 3D Lab, design-system reference scenes
- **Governance:** `check:storybook` blocks placeholder scaffolds

## E2E Test Inventory

| Spec File | Purpose | Auth Mode |
|-----------|---------|-----------|
| `e2e/launch-smoke.spec.ts` | Public route smoke (`/`, `/login`, `/pricing`, etc.) | Unauthenticated |
| `e2e/access-boundaries.spec.ts` | Protected route redirect checks | Unauthenticated |
| `e2e/authenticated-demo.spec.ts` | Demo auth first-run flows (dashboard, settings, onboarding) | Demo auth |
| `e2e/learning-flow.spec.ts` | Drill session flow (launch, cancel, answer submission) | Demo auth |
| `e2e/wiki-learning.spec.ts` | Wiki content verification | Demo auth |
| `e2e/authenticated-demo-portals.spec.ts` | Admin, developer, CEO portal checks | Demo auth |
| `e2e/authenticated-demo-3d-lab.spec.ts` | 3D Lab isolated browser checks | Demo auth |
| `e2e/authenticated-demo-restricted.spec.ts` | Restricted role denial coverage | Demo auth |

### E2E Test Runner Modes

| Script | Mode |
|--------|------|
| `test:e2e` | Full suite (desktop + mobile) |
| `test:e2e:smoke` | Fast Chromium-only smoke |
| `test:e2e:prod` | Smoke against built app |
| `test:e2e:auth-demo` | Demo auth first-run |
| `test:e2e:auth-demo:learning` | Drills + wiki learning |
| `test:e2e:auth-demo:portals` | Portal coverage |
| `test:e2e:auth-demo:3d-lab` | 3D Lab isolated |
| `test:e2e:auth-demo:restricted` | Role denial |
| `test:e2e:headed` | Headed browser |
| `test:e2e:ui` | Interactive UI mode |

## Unit Test Coverage Areas

| Domain | Files | Key Test Areas |
|--------|-------|----------------|
| SRS | `src/lib/srs/*.test.ts` | Spaced repetition algorithms, interval calculations |
| Entitlements | `src/lib/entitlements/*.test.ts` | Tier resolution, feature gating, role checks |
| Quiz | `src/lib/quiz/*.test.ts` | Scoring, state machines, question handling |
| Readiness | `src/lib/readiness/*.test.ts` | Readiness score calculations |
| Admin | `src/lib/actions/admin/*.test.ts` | CRUD operations, editor integrity |
| Wiki | `src/lib/wiki/*.test.ts` | Markdown parsing, article rendering |
| Calculators | `src/app/calculators/_lib/*.test.ts` | CHB, drywall, flooring, paint math |
| 3D Lab | `src/features/3d-lab/*.test.ts` | Store logic, config registry, geometry, camera presets |
| Payments | `src/app/api/payments/*.test.ts` | Checkout logic, webhook handlers |
| Components | `src/components/**/*.test.ts` | Wiki sidebar, content editor routing |

## Lint & Type Checking

### ESLint
- **Config:** `eslint.config.mjs`
- **Extends:** `eslint-config-next/core-web-vitals`, `eslint-config-next/typescript`
- **Notable rules:**
  - `no-explicit-any`: off
  - `no-unused-vars`: warn (allows `_` prefix)
  - `react-hooks/exhaustive-deps`: off
  - `react-hooks/rules-of-hooks`: off
  - `no-restricted-syntax`: warns on hardcoded hex in Tailwind classes
  - `no-restricted-imports`: blocks imports from route-internal `_components/`, `_types/`, `_config/`
- **Ignores:** `.next/`, `out/`, `build/`, `storybook-static/`

### TypeScript
- **Config:** `tsconfig.json`
- **Target:** ES2017, module: esnext, moduleResolution: bundler
- **Strict mode:** OFF (`strict: false`, `noImplicitAny: false`, `strictNullChecks: false`)
- **JSX:** react-jsx
- **Paths:** `@/*` → `./src/*`, plus 3D Lab-specific aliases

### Design Lint
- **Command:** `bun run design:lint`
- **Tool:** `@google/design.md@0.1.0`
- **Target:** `DESIGN.md`

## CI / CD Quality Gates

### GitHub Actions
- **Workflow:** `.github/workflows/storybook.yml`
- **Triggers:** Pull requests + push to `main`/`master`

| Job | Steps |
|-----|-------|
| `app-validation` | Bun setup → Playwright install → `bun run validate:release` |
| `build` | Bun setup → `check:storybook` → `build-storybook` |

### Local Release Validation
```bash
bun run validate:release
```
Runs: `type-check` → `lint` → `check:entitlements` → `bun audit` → `build` → `test:e2e:prod` → all auth-demo suites

## Coverage Observations

- **Strong areas:** SRS algorithms, entitlement logic, quiz scoring, calculator math, 3D Lab store logic, wiki parsing
- **Moderate areas:** Admin actions, analytics queries, payment webhooks
- **Sparse areas:** Full E2E coverage of all dashboard sub-routes, error boundary behavior, cron job logic
- **No coverage:** CEO portal (internal tool, likely tested manually), developer portal tools

## Known Limitations

- **No aggregated unit-test script:** Unit tests must be run individually or by directory
- **TypeScript strict mode off:** Reduces compile-time safety
- **ESLint hooks rules disabled:** Increases risk of closure/effect bugs
- **E2E serial execution:** `fullyParallel: false` means slower suite runs
- **No coverage tool integrated:** No Istanbul, c8, or similar coverage reports

## Manual Verification Checklist

When making changes to the following areas, run the associated checks:

| Area | Checks |
|------|--------|
| Route handlers | `bun run type-check`, targeted Playwright smoke |
| Server actions | `bun run type-check`, `bun test src/lib/actions/<domain>/` |
| Entitlements | `bun run check:entitlements`, `bun test src/lib/entitlements/` |
| 3D Lab | `bun run test:e2e:auth-demo:3d-lab`, manual browser check |
| Design system | `bun run design:lint`, `bun run storybook` |
| Schema/migrations | `bun run db:seed` (if safe), verify against `DATABASE_SCHEMA.sql` |
| Payments | `bun test src/app/api/payments/`, webhook signature verification |

## Evidence

- Playwright config: `playwright.config.ts`
- E2E specs: `e2e/`
- Test fixture: `e2e/support/authenticated-demo.ts`
- Unit tests: `src/**/*.test.ts`
- Storybook config: `.storybook/main.ts`, `.storybook/preview.ts`
- ESLint config: `eslint.config.mjs`
- TypeScript config: `tsconfig.json`
- CI workflow: `.github/workflows/storybook.yml`
- Package scripts: `package.json`
