<!-- Generated: 2026-03-24 | Updated: 2026-03-25 -->

# SlateCamp

## Purpose

SlateCamp is a high-performance, discipline-agnostic study engine for professional licensure exams. Built with Next.js 16.1.6 (App Router), React 19, Supabase (PostgreSQL), and Three.js for 3D spatial learning. The "Campfire" design system provides a warm, research-backed aesthetic. All mastery calculations use the IRT 2-parameter logistic model. The platform serves 4 portals: Dashboard (student-facing), Admin (content management), CEO (business analytics), and Developer (internal docs and tooling).

For a comprehensive architecture overview, see `GLOBAL-CODEBASE-AUDIT-REPORT.md`.

## Key Files

| File | Description |
|------|-------------|
| `CLAUDE.md` | Core system prompt -- design system tokens, voice guide, absolute constraints, tech stack |
| `GLOBAL-CODEBASE-AUDIT-REPORT.md` | Full codebase audit report with architecture, route map, component inventory |
| `DATABASE_SCHEMA.sql` | Authoritative relational schema -- consult before any DB work |
| `package.json` | Dependencies and scripts (bun as package manager) |
| `next.config.ts` | Next.js config -- Turbopack, server actions (4MB limit), image remotes |
| `middleware.ts` | Supabase auth session refresh + pathname header injection |
| `tailwind.config.ts` | Tailwind v4 CSS-first config with typography plugin |
| `vercel.json` | Cron jobs: blindspot-scan (daily 4pm UTC), compute-signals (daily 4:30pm UTC) |
| `components.json` | shadcn/ui configuration |
| `tsconfig.json` | TypeScript config with `@/` path alias to `src/` |
| `eslint.config.mjs` | ESLint flat config |
| `globals.css` | Tailwind v4 CSS-first theme with Campfire design tokens |
| `bun.lock` | Bun lockfile -- never edit manually |
| `UI-CONSOLIDATION-IMPLEMENTATION-PLAN.md` | Active UI consolidation plan |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `src/` | All application source code (see `src/AGENTS.md`) |
| `supabase/` | Database migrations and seed SQL scripts (see `supabase/AGENTS.md`) |
| `scripts/` | Dev tooling -- custom dev server, DB inspection, seeding (see `scripts/AGENTS.md`) |
| `public/` | Static assets -- icons, OG images, widget modules (see `public/AGENTS.md`) |
| `prompts/` | Archived PRDs, specs, and implementation guides (reference only) |
| `docs/` | Planning documents and specs |
| `.claude/` | Agent definitions, skills, and documentation for AI-assisted development |

## For AI Agents

### Working In This Directory

- **Read `CLAUDE.md` first** -- it defines the Campfire design system, voice guide, and absolute constraints
- **Read `DATABASE_SCHEMA.sql`** before any database-related work -- never hallucinate tables or foreign keys
- **Use `bun`** as the package manager (not npm/yarn/pnpm)
- **Arrow functions only** -- never use `function` declarations
- **Font:** Inter only (loaded via `next/font/google`) -- Syne for display headings, DM Mono for code/data values
- **Minimum text size:** 11px -- never use 8px, 9px, or 10px
- **No generic gamification** -- no confetti, badges, virtual currency, or empty streaks
- **4 portals:** Dashboard (`/dashboard`), Admin (`/admin`), CEO (`/ceo`), Developer (`/developer`)

### Campfire Design System (Quick Reference)

| Token | Hex | Usage |
|-------|-----|-------|
| Camp Cobalt | `#1B3FC4` | Primary actions, nav, links, active states |
| Camp Orange | `#E8853A` | Progress celebration, warm CTAs (sparingly) |
| Emerald | `#2D9F6F` | Success, mastery, correct answers |
| Warm Red | `#D64545` | Error, critical -- always with context |
| Amber | `#D4951A` | Warning, developing skill |
| Surface Light | `#F8F7F5` | Page background (warm white) |
| Ink Primary | `#1A2332` | Main text |

- **Border radius:** `rounded-sm` (buttons/inputs), `rounded-md` (cards), `rounded-lg` (modals) -- never `rounded-xl`+
- **Shadows:** `shadow-sm` on hover, `shadow-md` dropdowns, `shadow-lg` modals -- never `shadow-xl`+ on non-modal
- **Transitions:** max 300ms, default `duration-150 ease-out` -- never `bounce`/`spring` easing

### Testing Requirements

- `bun run lint` -- ESLint checks
- `bun run type-check` -- TypeScript strict mode
- `bun run build` -- Full production build

### Common Patterns

- Server Components by default; `'use client'` only when interactivity is needed
- Supabase auth via middleware session refresh
- Server Actions in `src/lib/actions/` for all mutations
- Zustand stores in `src/stores/` for client state
- shadcn/ui + Tailwind v4 CSS variables for theming
- IRT 2-parameter logistic model for all mastery/readiness calculations
- Portal shell pattern: each portal uses `PortalLayout` from `@/components/portal`

## Dependencies

### External (Key)

- `next` 16.1.6 -- App Router, Server Components, Server Actions
- `react` 19.2.4 -- Latest React with RSC support
- `typescript` 5.9.3 -- Strict mode
- `tailwindcss` 4.2.2 -- CSS-first config with Campfire design tokens
- `@supabase/supabase-js` + `@supabase/ssr` -- Database and auth
- `@react-three/fiber` + `three` -- 3D spatial learning (60 FPS target)
- `zustand` 5.0.12 -- Client state management
- `@base-ui/react` + `shadcn` -- UI primitives
- `@anthropic-ai/sdk` -- AI contextual tutor (Temperature 0.0, citation-required)
- `stripe` + `payrex-node` -- Payment processing
- `framer-motion` -- Structural animations (max 300ms transitions)
- `recharts` -- Analytics charts
- `@tiptap/*` -- Rich text editor for notes
- `zod` -- Schema validation
- `lucide-react` + `@phosphor-icons/react` -- Icon libraries

<!-- MANUAL: -->
