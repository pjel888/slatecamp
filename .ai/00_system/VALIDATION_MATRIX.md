# VALIDATION_MATRIX

## Current command contract

These are the real repo-level commands from `package.json`:

- `bun run dev`
- `bun run dev:turbo`
- `bun run dev:webpack`
- `bun run build`
- `bun run start`
- `bun run lint`
- `bun run lint:fix`
- `bun run test:e2e`
- `bun run test:e2e:smoke`
- `bun run test:e2e:prod`
- `bun run test:e2e:auth-demo`
- `bun run test:e2e:auth-demo:portals`
- `bun run test:e2e:auth-demo:3d-lab`
- `bun run test:e2e:headed`
- `bun run test:e2e:ui`
- `bun run type-check`
- `bun run validate:release`
- `bun run design:lint`
- `bun run storybook`
- `bun run build-storybook`
- `bun run check:storybook`
- `bun run check:entitlements`
- `bun run db:seed`
- `bun run bones:build`
- `bun audit`

There is **no root `test` script** today. Browser coverage is exposed through the explicit Playwright `test:e2e*` scripts.

## Validation matrix

| Command | Use when | Primary surfaces | Notes |
| --- | --- | --- | --- |
| `bun run type-check` | source behavior, contracts, architecture claims | `src/`, `scripts/`, docs that assert live code behavior | clears stale `.next/dev/types` before the repo-wide TypeScript gate |
| `bun run lint` | workflow/style/tooling claims or code changes | repo-wide | runs `check:storybook` first |
| `bun run build` | route/runtime behavior changes, app readiness checks | `src/app`, `src/lib`, env-sensitive app runtime | env/dependency sensitive |
| `bun run test:e2e` | launch-critical browser route and access-boundary checks | `e2e/`, `src/app`, middleware/auth redirects | starts Next via Playwright `webServer`; desktop Chromium and mobile Chromium projects |
| `bun run test:e2e:smoke` | fast local browser smoke pass | `e2e/launch-smoke.spec.ts` | Chromium-only subset of the E2E gate |
| `bun run test:e2e:prod` | built-app launch smoke | `e2e/launch-smoke.spec.ts`, redirects, public auth-adjacent routes | starts the already-built app with `next start`; run after `bun run build` |
| `bun run test:e2e:auth-demo` | authenticated first-run smoke without production secrets | `e2e/authenticated-demo.spec.ts`, onboarding, auth-entry redirects, settings, dashboard guard | starts demo-auth mode and asserts demo user state plus browser-error absence; not live Supabase auth |
| `bun run test:e2e:auth-demo:portals` | authenticated portal coverage without production secrets | `e2e/authenticated-demo-portals.spec.ts`, `/admin`, `/developer`, `/ceo` | runs on a fresh demo-auth server to keep the privileged-surface browser checks stable |
| `bun run test:e2e:auth-demo:3d-lab` | authenticated 3D Lab browser coverage without production secrets | `e2e/authenticated-demo-3d-lab.spec.ts`, `/dashboard/3d-lab` | isolated because the 3D Lab browser route is materially slower than the other demo-auth surfaces |
| `bun run validate:release` | pre-beta/release readiness aggregate | app build, lint/type gates, entitlements, dependency audit, production Playwright smoke, demo-auth core, demo-auth portals, demo-auth 3D Lab | intentionally heavy; run before release readiness claims |
| `bun run design:lint` | design-system contract changes | `DESIGN.md` | validates the Google Labs DESIGN.md structure; `src/app/globals.css` remains the implementation token source |
| `bun run check:storybook` | Storybook governance, reusable component ownership | component/story docs and Storybook workflows | safe precheck; no app runtime needed |
| `bun run storybook` | component/dev-doc UI review | shared UI, stories | interactive/manual |
| `bun run build-storybook` | Storybook release/build validation | stories and component surface | CI currently enforces this path |
| `bun run check:entitlements` | entitlement drift review | auth, admin, developer portal access assumptions | read-only validation script |
| `bun audit` | dependency/security readiness | package graph | required before beta/release readiness claims |
| `bun run db:seed` | only in explicit DB/dev workflows | seeded local DB flows | not casual; mutates data |
| `bun run bones:build` | special screenshot/scrape style workflow | dashboard snapshot/boneyard flow | non-routine |

## Area-specific validation guidance

### `/admin`

- always verify route docs against live route files and layout/auth guards
- use `bun run type-check`
- use `bun run lint`
- use `bun run test:e2e:smoke` when changing public/protected route gates or legacy redirects
- manual validation is still necessary for:
  - admin layout access
  - content/knowledge/question workflow pages
  - review and pipeline surfaces

### `/developer`

- verify whether a page is mock-backed or truly runtime-backed before claiming observability value
- use `bun run type-check`
- use `bun run lint`
- manual review is necessary for:
  - status pages
  - DB browser
  - logs surfaces
  - architecture/API reference pages

### Supabase / data boundaries

- verify schema claims against `DATABASE_SCHEMA.sql` plus relevant recent migrations
- use non-destructive inspection first
- do not run reset/drop scripts casually

### Design system

- use `DESIGN.md` as the agent-readable visual identity and design-token contract
- verify implemented token values against `src/app/globals.css`
- use `bun run design:lint` when `DESIGN.md` changes
- use Storybook or `/developer/design-system` for visual review when component behavior or examples change

## Explicit warnings

- Do not invent a root `test` command
- Do not treat Playwright presence as full product QA; the current suite is launch-smoke coverage, not complete authenticated flow coverage
- Do not treat `db:seed` or reset/seed SQL as casual validation
- Do not assume `build` is a clean repo-health signal until the broken Bun bootstrap path is repaired
