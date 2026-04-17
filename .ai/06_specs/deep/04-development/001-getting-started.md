# Getting Started

**Status:** Active  
**Version:** 2.0  
**Last Updated:** 2026-04-06  
**Source-of-Truth:** `AGENTS.md`, `CLAUDE.md`, `package.json`

---

## Prerequisites

- Bun installed and available on the command line
- Git
- A populated `.env.local`
- Access to the shared Supabase project if you need live data paths

## Install

```bash
git clone <repo-url>
cd slatecamp
bun install
```

## Environment Setup

Create `.env.local` in the repository root with the required project secrets and URLs.

Core values used across local development:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
CRON_SECRET=your_cron_secret
```

Useful local-only toggles:

```bash
NEXT_PUBLIC_DEMO_MODE=true
ALLOW_DEV_PORTAL_BYPASS=true
```

## Start the App

```bash
bun run dev
```

`scripts/dev.js` chooses the local bundler automatically:

- Windows: `next dev --webpack`
- Non-Windows: `next dev --turbopack`

## Start Storybook

```bash
bun run storybook
```

The Storybook command runs `bun run check:storybook` first, so placeholder scaffolds and invalid story files are blocked before the preview starts.

## Core Validation Commands

```bash
bun run check:storybook
bun run lint
bun run type-check
bun run build-storybook
bun run build
```

## Documentation Ownership

- Reusable component docs live in Storybook.
- Operational docs, architecture guides, and API reference pages live under `/developer`.
- If a public reusable component changes, update its Storybook docs in the same change set.

## Project Structure

```text
slatecamp/
|-- src/
|   |-- app/          # App Router routes
|   |-- components/   # Shared and reusable component surface
|   |-- features/     # Feature-owned public modules
|   |-- lib/          # Queries, actions, business logic, utilities
|   |-- stores/       # Zustand stores
|   `-- storybook/    # Storybook-only fixtures, mocks, decorators, scenes
|-- supabase/         # Migrations and SQL assets
|-- scripts/          # Development tooling
|-- public/           # Static assets
|-- .ai/              # Agent state, plans, and internal docs
`-- .github/          # Workflow and pull-request governance
```

## First Reads

1. `CLAUDE.md`
2. `AGENTS.md`
3. `src/app/*/AGENTS.md` for the portal you are changing
4. `src/storybook/docs/README.md` when your change touches reusable components

---

*Source: `AGENTS.md`, `CLAUDE.md`, `package.json`, `src/storybook/docs/README.md`*
