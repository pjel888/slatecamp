<!-- Generated: 2026-03-24 | Updated: 2026-03-24 -->

# SlateCamp

## Purpose

SlateCamp is a high-performance, discipline-agnostic study engine for professional licensure exams. Built with Next.js 16 (App Router), React 19, Supabase (PostgreSQL), and Three.js for 3D spatial learning. The "Campfire" design system provides a warm, research-backed aesthetic. All mastery calculations use the IRT 2-parameter logistic model.

## Key Files

| File | Description |
|------|-------------|
| `CLAUDE.md` | Core system prompt — design system tokens, voice guide, absolute constraints, tech stack |
| `DATABASE_SCHEMA.sql` | Authoritative relational schema — consult before any DB work |
| `package.json` | Dependencies and scripts (bun as package manager) |
| `next.config.ts` | Next.js config — Turbopack, server actions (4MB limit), image remotes |
| `middleware.ts` | Supabase auth session refresh + pathname header injection |
| `tailwind.config.ts` | Tailwind v4 CSS-first config with typography plugin |
| `vercel.json` | Cron jobs: blindspot-scan (daily 4pm UTC), compute-signals (daily 4:30pm UTC) |
| `components.json` | shadcn/ui configuration |
| `tsconfig.json` | TypeScript config with `@/` path alias to `src/` |
| `eslint.config.mjs` | ESLint flat config |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `src/` | All application source code (see `src/AGENTS.md`) |
| `supabase/` | Database migrations and seed SQL scripts (see `supabase/AGENTS.md`) |
| `scripts/` | Dev tooling — custom dev server, DB inspection, seeding (see `scripts/AGENTS.md`) |
| `public/` | Static assets — icons, OG images, widget modules (see `public/AGENTS.md`) |
| `prompts/` | Archived PRDs, specs, and implementation guides (reference only) |
| `docs/` | Planning documents and specs |

## For AI Agents

### Working In This Directory

- **Read `CLAUDE.md` first** — it defines the Campfire design system, voice guide, and absolute constraints
- **Read `DATABASE_SCHEMA.sql`** before any database-related work — never hallucinate tables or foreign keys
- **Use `bun`** as the package manager (not npm/yarn/pnpm)
- **Arrow functions only** — never use `function` declarations
- **Minimum text size:** 11px — never use 8px, 9px, or 10px
- **No generic gamification** — no confetti, badges, virtual currency, or empty streaks

### Testing Requirements

- `bun run lint` — ESLint checks
- `bun run type-check` — TypeScript strict mode
- `bun run build` — Full production build

### Common Patterns

- Server Components by default; `'use client'` only when interactivity is needed
- Supabase auth via middleware session refresh
- Server Actions in `src/lib/actions/` for all mutations
- Zustand stores in `src/stores/` for client state
- shadcn/ui + Tailwind v4 CSS variables for theming
- IRT 2-parameter logistic model for all mastery/readiness calculations

## Dependencies

### External (Key)

- `next` 16.x — App Router, Server Components, Server Actions
- `react` 19.x — Latest React with RSC support
- `@supabase/supabase-js` + `@supabase/ssr` — Database and auth
- `@react-three/fiber` + `three` — 3D spatial learning (60 FPS target)
- `zustand` — Client state management
- `shadcn` + `@base-ui/react` — UI primitives
- `@anthropic-ai/sdk` — AI contextual tutor (Temperature 0.0, citation-required)
- `stripe` + `payrex-node` — Payment processing
- `framer-motion` — Structural animations (max 300ms transitions)
- `recharts` — Analytics charts
- `@tiptap/*` — Rich text editor for notes
- `zod` — Schema validation

<!-- MANUAL: -->
