# Developer Workflow

**Last Updated:** 2026-04-27

## Prerequisites

- [Bun](https://bun.sh) 1.3.11 or newer
- A modern Node.js-compatible environment (Next.js 16 requirement)
- Git

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   bun install
   ```
3. Create `.env.local` in the repository root with required variables (see [`.ai/environment.md`](environment.md))
4. Start the dev server:
   ```bash
   bun run dev
   ```

The app runs at `http://localhost:3000` by default.

> **Note:** `bun install` has reported manifest resolution failures in some clean environments. If you encounter this, try `bun install --no-cache` or verify your Bun version matches the CI pin (1.3.11).

## Development Server

The dev server is launched via `scripts/dev.js`:
- **Default:** Turbopack (`--turbopack`)
- **Force Webpack:** `bun run dev:webpack`
- **Force Turbopack:** `bun run dev:turbo`

An `allowedDevOrigins` entry in `next.config.ts` permits local network access at `192.168.0.129:3000`.

## Common Scripts

| Command | Purpose |
|---------|---------|
| `bun run dev` | Start dev server (Turbopack) |
| `bun run build` | Production build |
| `bun run start` | Start built app |
| `bun run lint` | ESLint + Storybook precheck |
| `bun run lint:fix` | Auto-fix ESLint |
| `bun run type-check` | Clear stale types, run `tsc --noEmit` |
| `bun run storybook` | Run Storybook at `localhost:6006` |
| `bun run build-storybook` | Build static Storybook |
| `bun run db:seed` | Seed database |
| `bun run validate:release` | Full CI gate (type-check → lint → entitlements → audit → build → all e2e) |

## Testing Workflow

### Quick Checks
```bash
bun run type-check
bun run lint
bun run test:e2e:smoke
```

### Before a Release
```bash
bun run validate:release
```
This runs the full pipeline including production build and all e2e suites. It takes several minutes.

### Running Individual E2E Suites
```bash
bun run test:e2e:auth-demo           # Demo auth first-run
bun run test:e2e:auth-demo:learning  # Drills + wiki learning
bun run test:e2e:auth-demo:portals   # Admin, dev, CEO portals
bun run test:e2e:auth-demo:3d-lab    # 3D Lab isolated
bun run test:e2e:auth-demo:restricted # Role denial coverage
```

### Running Unit Tests
There is no aggregated unit-test script. Run individual files or directories:
```bash
bun test src/lib/srs/srs-algorithm.test.ts
bun test src/lib/entitlements/
```

### Storybook Validation
```bash
bun run check:storybook   # Validate no placeholder stories
bun run storybook         # Start Storybook
```

## Database Workflow

### Authoritative Sources
- `DATABASE_SCHEMA.sql` — strongest schema snapshot
- `supabase/migrations/` — migration chronology (92 files)

### Seeding
```bash
bun run db:seed
```

### Safety
- Do not run destructive reset scripts (`00_DROP_ALL_TABLES.sql`) against production.
- Validate schema claims against both `DATABASE_SCHEMA.sql` and recent migrations.

## Debugging Notes

### Demo Mode
If `NEXT_PUBLIC_SUPABASE_URL` is empty and `NEXT_PUBLIC_ENABLE_DEMO_MODE` is set, the app runs with mock data. Useful for UI development without a live backend.

### Dev Impersonation
Set `DEV_FORCE_USER_ID` to a UUID to bypass auth and act as that user locally. **Never use in production.** Neutralize in CI with `DISABLE_DEV_FORCE_USER_ID=true`.

### Common Issues
- **Build fails with `ENOENT: .next/required-server-files.json`**: Historical issue; verify Next.js version and clean `.next/` before retrying.
- **Type errors after branch switch**: Run `bun run type-check` to clear stale generated types.
- **Playwright fails to start**: Ensure dependencies are installed and `bun run build` passes if running `test:e2e:prod`.

## Code Conventions

- **Bun-first:** All scripts and package execution use Bun.
- **Server Components by default:** Only mark `"use client"` when interactivity is required.
- **File organization:** Domain-grouped directories in `src/components/` and `src/lib/`.
- **AGENTS.md discipline:** Read the nearest in-scope `AGENTS.md` before editing any subtree.
- **Documentation alignment:** Update `README.md` and `.ai/` when structure or workflows change.

## Evidence

- Dev script: `scripts/dev.js`
- Type-check script: `scripts/type-check.ts`
- Playwright runner: `scripts/playwright-run.ts`
- Web server: `scripts/playwright-web-server.ts`
- Package scripts: `package.json`
- CI workflow: `.github/workflows/storybook.yml`
