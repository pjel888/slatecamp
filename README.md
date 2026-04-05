# SlateCamp

SlateCamp is an ALE prep platform built for the Philippine Architecture Licensure Exam. The live product combines adaptive quiz flows, an expert-linked wiki, analytics, admin tooling, and interactive 3D learning modules under a shared Next.js codebase.

## Product Surface

- Dashboard: student-facing study experience under `/dashboard`
- Admin: content, taxonomy, review, and publishing workflows under `/admin`
- CEO: internal business reporting under `/ceo`
- Developer: internal engineering docs and tools under `/developer`

## Stack

- Next.js 16.1.6 App Router
- React 19.2.4
- TypeScript 5.9.3
- Tailwind CSS 4
- Supabase SSR and PostgreSQL
- Zustand for shared client state
- Storybook 8 with Vite
- React Three Fiber and Three.js for 3D modules

## Local Development

Install dependencies:

```bash
bun install
```

Create and maintain your own `.env.local`. This repository does not currently include a committed `.env.example`.

Start the app:

```bash
bun run dev
```

Notes:

- `bun run dev` executes `scripts/dev.js`
- On Windows, the dev launcher uses `next dev --webpack`
- On non-Windows platforms, the dev launcher uses `next dev --turbopack`

Other available scripts:

```bash
bun run dev:turbo
bun run dev:webpack
bun run storybook
bun run build-storybook
bun run db:seed
```

## Validation Commands

```bash
bun run lint
bun run type-check
bun test
bun run build
```

Current validation status from 2026-04-05:

- `bun run lint`: completes with warnings
- `bun run type-check`: passes
- `bun test`: runs but currently has a failing assertion in `src/lib/quiz/mode-presets.test.ts`
- `bun run build`: currently fails after compile/type-check with missing `.next/required-server-files.json`

## Repository Structure

```text
src/
  app/          Next.js routes, layouts, loading states, API routes
  components/   Shared UI, portal shells, stories, and feature-facing components
  features/     Larger vertical feature modules such as 3D Lab
  hooks/        Shared React hooks
  lib/          Server actions, queries, Supabase helpers, constants, domain logic
  stores/       Zustand stores
  types/        Shared TypeScript types
scripts/        Local tooling and data scripts
supabase/       Migrations and SQL assets
docs/           Planning and content-support docs
.ai/            Agent-only context, archives, generated audits, and workflow residue
.storybook/     Storybook configuration
```

## Architecture Notes

- `src/lib/actions` is the mutation layer and uses Server Actions
- `src/lib/queries` contains read-oriented async modules for server components
- `src/lib/supabase/server.ts` is the main server-side Supabase entry point
- Styling is driven from `src/app/globals.css` with Tailwind CSS 4 semantic tokens
- Shared client state is handled with Zustand in `src/stores`
- The codebase currently uses both arrow functions and `function` declarations
- TypeScript is not in strict mode in the current `tsconfig.json`

## Domain Highlights

- Readiness scoring lives in `src/lib/readiness-score.ts`
- SRS and IRT logic live in `src/lib/srs`
- Quiz engine logic lives in `src/lib/quiz` and `src/lib/actions/quiz-v2`
- 3D learning modules live across `src/features/3d-lab` and `src/app/dashboard/3d-lab`
- Calculators live under `src/app/calculators`
- Wiki rendering and interaction code lives under `src/components/wiki` and related actions

## Contributor Guidance

- Read `CLAUDE.md` for the current code-backed repo guidance
- Read `AGENTS.md` and the nearest nested `AGENTS.md` before making scoped changes
- Use `docs/` for canonical human-readable documentation and `.ai/` for agent/archive material
- Treat code and executable config as the source of truth when docs drift
