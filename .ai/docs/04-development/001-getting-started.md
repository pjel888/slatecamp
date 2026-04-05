# Getting Started

**Status:** Active  
**Version:** 1.0  
**Last Updated:** 2026-04-06  
**Source-of-Truth:** `README.md`, `CLAUDE.md`

---

## Prerequisites

- **Bun** installed (`bun --version` should return a version)
- **Node.js** 18+ (Bun includes Node.js compatibility)
- **Git**
- Supabase project (for full functionality)
- Environment variables in `.env.local`

---

## Installation

```bash
# Clone the repository
git clone <repo-url>
cd slatecamp

# Install dependencies
bun install
```

This installs all 56 production dependencies and 8 dev dependencies from `package.json`.

---

## Environment Setup

Create `.env.local` in the project root with required variables:

```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
CRON_SECRET=your_cron_secret

# Optional
NEXT_PUBLIC_DEMO_MODE=true
ALLOW_DEV_PORTAL_BYPASS=true
OPENAI_API_KEY=your_openai_key
STRIPE_SECRET_KEY=your_stripe_key
PAYREX_API_KEY=your_payrex_key
```

**Note:** This repository does not include a committed `.env.example`. Copy from a teammate or Supabase dashboard.

---

## Start Development Server

```bash
bun run dev
```

This runs `scripts/dev.js`:
- **Windows:** Starts Next.js with `--webpack`
- **Non-Windows:** Starts Next.js with `--turbopack`

The app runs at `http://localhost:3000`.

---

## Dev Scripts

```bash
bun run dev           # Development server (default)
bun run dev:turbo    # Next.js with Turbopack
bun run dev:webpack  # Next.js with Webpack
bun run storybook     # Storybook on port 6006
bun run build-storybook
```

---

## Validation Commands

```bash
bun run lint          # ESLint checks
bun run type-check    # TypeScript type checking
bun test             # Run test suite
bun run build        # Production build
```

### Validation Status (as of 2026-04-05)

| Command | Status | Notes |
|---------|--------|-------|
| `bun run lint` | ✅ Passes with warnings | ESLint warns on unused vars and hardcoded hex in Tailwind |
| `bun run type-check` | ✅ Passes | `tsc --noEmit` |
| `bun test` | ⚠️ Has failing tests | `src/lib/quiz/mode-presets.test.ts` fails |
| `bun run build` | ❌ Fails | `ENOENT: .next/required-server-files.json` missing |

---

## Database

```bash
bun run db:seed   # Seed database with initial data
```

Seeding scripts live in `scripts/` and use Supabase client.

---

## Project Structure

```
slatecamp/
├── src/
│   ├── app/          # Next.js App Router (137 pages)
│   ├── components/   # React components (shared + feature)
│   ├── lib/          # Business logic, actions, queries
│   ├── stores/       # Zustand stores (5 stores)
│   ├── types/        # TypeScript definitions
│   └── hooks/        # React hooks
├── supabase/         # Migrations (60) and SQL assets
├── scripts/          # Dev tooling
├── public/            # Static assets
├── docs/             # Documentation
└── .ai/              # Agent-only context and archives
```

---

## Key Files for Developers

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Absolute constraints and tech rules — **read this first** |
| `AGENTS.md` | Codebase overview, patterns, key locations |
| `DATABASE_SCHEMA.sql` | Authoritative relational schema |
| `package.json` | All dependencies and scripts |
| `src/app/globals.css` | Design tokens (Campfire system) |
| `src/app/*/AGENTS.md` | Portal-specific structure |

---

## Next Steps

1. Read `CLAUDE.md` — it defines the Campfire design system, voice guide, and absolute constraints
2. Read `AGENTS.md` — for codebase overview
3. Run `bun run dev` to start the dev server
4. Visit `/dashboard` (requires Supabase connection) or `/try` (demo mode)
5. Explore the portal structure via `src/app/*/`

---

*Source: `README.md`, `CLAUDE.md`, `package.json`*
