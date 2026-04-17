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
- `bun run type-check`
- `bun run storybook`
- `bun run build-storybook`
- `bun run check:storybook`
- `bun run check:entitlements`
- `bun run db:seed`
- `bun run bones:build`

There is **no root `test` script** today.

## Validation matrix

| Command | Use when | Primary surfaces | Notes |
| --- | --- | --- | --- |
| `bun run type-check` | source behavior, contracts, architecture claims | `src/`, `scripts/`, docs that assert live code behavior | current repo-wide TypeScript gate |
| `bun run lint` | workflow/style/tooling claims or code changes | repo-wide | runs `check:storybook` first |
| `bun run build` | route/runtime behavior changes, app readiness checks | `src/app`, `src/lib`, env-sensitive app runtime | env/dependency sensitive |
| `bun run check:storybook` | Storybook governance, reusable component ownership | component/story docs and Storybook workflows | safe precheck; no app runtime needed |
| `bun run storybook` | component/dev-doc UI review | shared UI, stories | interactive/manual |
| `bun run build-storybook` | Storybook release/build validation | stories and component surface | CI currently enforces this path |
| `bun run check:entitlements` | entitlement drift review | auth, admin, developer portal access assumptions | read-only validation script |
| `bun run db:seed` | only in explicit DB/dev workflows | seeded local DB flows | not casual; mutates data |
| `bun run bones:build` | special screenshot/scrape style workflow | dashboard snapshot/boneyard flow | non-routine |

## Area-specific validation guidance

### `/admin`

- always verify route docs against live route files and layout/auth guards
- use `bun run type-check`
- use `bun run lint`
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

## Explicit warnings

- Do not invent a root `test` command
- Do not treat `db:seed` or reset/seed SQL as casual validation
- Do not assume `build` is a clean repo-health signal until the broken Bun bootstrap path is repaired
