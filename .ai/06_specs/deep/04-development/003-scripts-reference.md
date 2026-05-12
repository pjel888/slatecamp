# Scripts Reference

**Status:** Active
**Version:** 2.0
**Last Updated:** 2026-04-06
**Source-of-Truth:** `package.json`

---

## Development Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `dev` | `bun run scripts/dev.js` | Start the local Next.js dev server with the platform-appropriate bundler |
| `dev:turbo` | `next dev --turbopack` | Force Turbopack locally |
| `dev:webpack` | `next dev --webpack` | Force Webpack locally |
| `storybook` | `bun run check:storybook && storybook dev -p 6006` | Start Storybook after the repo Storybook guard passes |

## Build Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `build` | `next build` | Run the production Next.js build |
| `start` | `next start` | Start the production server |
| `build-storybook` | `bun run check:storybook && storybook build` | Build the static Storybook site after the repo Storybook guard passes |

## Validation Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `check:storybook` | `bun scripts/check-storybook.ts` | Reject placeholder scaffolds and story files without a real component import |
| `lint` | `bun run check:storybook && eslint .` | Run ESLint after the Storybook guard passes |
| `lint:fix` | `eslint . --fix` | Auto-fix ESLint issues where possible |
| `type-check` | `tsc --noEmit` | Run TypeScript in no-emit mode |

## Database Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `db:seed` | `bun scripts/seed.ts` | Seed the database with local development content |

## Other Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `bones:build` | `boneyard-js build http://localhost:3000/dashboard --out ./src/bones` | Generate Boneyard output from a running local app |

## Storybook Governance Notes

- The canonical Storybook docs surface is limited to `src/components/**/*.stories.*`, `src/features/**/*.stories.*`, and `src/storybook/scenes/**/*.stories.*`.
- Reusable component docs belong in Storybook.
- Operational and architecture docs belong under `/developer`.
- CI runs the same Storybook guard locally exposed as `bun run check:storybook`.

## Recommended Validation Flow

```bash
bun run check:storybook
bun run lint
bun run type-check
bun run build-storybook
bun run build
```

---

*Source: `package.json`, `.storybook/main.ts`, `src/storybook/docs/README.md`*
