# Scripts Reference

**Status:** Active  
**Version:** 1.0  
**Last Updated:** 2026-04-06  
**Source-of-Truth:** `package.json`

---

## Development Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `dev` | `bun run scripts/dev.js` | Start development server |
| `dev:turbo` | `next dev --turbopack` | Start with Turbopack (Unix/macOS) |
| `dev:webpack` | `next dev --webpack` | Start with Webpack (Windows) |

### dev.js Launcher

The `scripts/dev.js` script automatically selects the right bundler:

```javascript
// scripts/dev.js (simplified)
const isWindows = process.platform === 'win32'
const flag = isWindows ? '--webpack' : '--turbopack'
spawn(`next dev ${flag}`, { stdio: 'inherit', shell: true })
```

**On Windows:** Uses `--webpack` to avoid Turbopack compatibility issues.  
**On Unix/macOS:** Uses `--turbopack` for faster HMR.

---

## Build Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `build` | `next build` | Production build |
| `start` | `next start` | Start production server |
| `build-storybook` | `storybook build` | Build Storybook static site |

### Build Status

**Known issue (as of 2026-04-05):** `bun run build` fails with:
```
ENOENT: no such file or directory, open '.next/required-server-files.json'
```
This occurs after compile and type-check steps succeed.

---

## Storybook

| Script | Command | Purpose |
|--------|---------|---------|
| `storybook` | `storybook dev -p 6006` | Start Storybook on port 6006 |

Storybook 8 with Vite. Components live in `src/components/**/` with `.stories.tsx` files.

---

## Database Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `db:seed` | `bun scripts/seed.ts` | Seed database with initial data |

Seed scripts in `scripts/` use Supabase client to populate initial content.

---

## Linting & Type Checking

| Script | Command | Purpose |
|--------|---------|---------|
| `lint` | `eslint .` | Run ESLint on entire codebase |
| `lint:fix` | `eslint . --fix` | Auto-fix ESLint violations |
| `type-check` | `tsc --noEmit` | Run TypeScript type checking |

### Lint Status (as of 2026-04-05)

`bun run lint` — ✅ **Passes** (with warnings only)

Current warnings:
- Unused variables
- Hardcoded hex colors inside Tailwind utility strings

ESLint config: `eslint.config.mjs` extends:
- `eslint-config-next/core-web-vitals`
- `eslint-config-next/typescript`

### Type Check Status (as of 2026-04-05)

`bun run type-check` — ✅ **Passes**

---

## Testing

| Script | Command | Purpose |
|--------|---------|---------|
| `test` | `bun test` | Run test suite with Bun |

### Test Status (as of 2026-04-05)

`bun test` — ⚠️ **Has 1 failing test**

Failing test: `src/lib/quiz/mode-presets.test.ts`
```
Expected: MODE_PRESETS.camp.navigation.backAllowed = false
Received: MODE_PRESETS.camp.navigation.backAllowed = true
```

Test files live alongside source in `__tests__/` directories.

---

## Other Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `bones:build` | `boneyard-js build http://localhost:3000/dashboard --out ./src/bones` | Build Storybook stories from running app |

---

## Script Summary

```bash
# Development
bun run dev           # Start dev server (auto-selects webpack/turbopack)
bun run dev:turbo     # Force Turbopack
bun run dev:webpack    # Force Webpack
bun run storybook      # Storybook on port 6006

# Build & Deploy
bun run build         # Production build (⚠️ currently failing)
bun run start         # Start production server
bun run build-storybook # Build Storybook static site

# Database
bun run db:seed       # Seed database

# Validation
bun run lint          # ESLint (✅ passes)
bun run lint:fix      # Auto-fix lint
bun run type-check    # TypeScript (✅ passes)
bun test             # Bun test suite (⚠️ 1 failing)

# Other
bun run bones:build   # Generate Storybook from running app
```

---

*Source: `package.json` scripts section*
