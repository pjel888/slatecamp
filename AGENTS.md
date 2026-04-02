<!-- Generated: 2026-03-24 | Updated: 2026-04-02 -->

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
| `supabase/` | Database migrations (60) and seed SQL scripts (see `supabase/AGENTS.md`) |
| `scripts/` | Dev tooling -- custom dev server, DB inspection, seeding (see `scripts/AGENTS.md`) |
| `public/` | Static assets -- icons, OG images, widget modules (see `public/AGENTS.md`) |
| `prompts/` | Archived PRDs, specs, and implementation guides (reference only) |
| `docs/` | Planning documents and specs |
| `.claude/` | Agent definitions, skills, and documentation for AI-assisted development |

## Codebase Stats

| Metric | Value |
|--------|-------|
| Total .tsx files | ~1044 |
| Pages (App Router) | 137 across 4 portals |
| Server action files | 116 (in `src/lib/actions/`) |
| Zustand stores | 5 (in `src/stores/`) |
| React Contexts | 10 |
| Database tables | 51 (50 with RLS) |
| RLS policies | 89+ |
| Database migrations | 60 |
| Production dependencies | 56 |
| Dev dependencies | 8 |
| Env variables | 19 (6 `NEXT_PUBLIC_*`, 11 server-only, 2 config) |

## For AI Agents

### Working In This Directory

- **Read `CLAUDE.md` first** -- it defines the Campfire design system, voice guide, and absolute constraints
- **Read `DATABASE_SCHEMA.sql`** before any database-related work -- never hallucinate tables or foreign keys
- **Use `bun`** as the package manager (not npm/yarn/pnpm)
- **Arrow functions only** -- never use `function` declarations
- **Font:** Inter only (loaded via `next/font/google`) -- Syne for display headings, DM Mono for code/data values
- **Minimum text size:** 8px
- **No generic gamification** -- no confetti, badges, virtual currency, or empty streaks
- **4 portals:** Dashboard (`/dashboard`), Admin (`/admin`), CEO (`/ceo`), Developer (`/developer`)
- **Server Components by default** -- only add `'use client'` when interactivity is needed (target <40% client ratio)
- **Always use design tokens** -- never hardcode hex colors in Tailwind classes or inline styles
- **Use `Promise.all()`** for independent queries -- never sequential `await` chains in page.tsx files
- **Use explicit column selects** -- never `select('*')` in Supabase queries
- **All server action files must include `"use server"` directive** at the top
- **Wrap server actions in try/catch** -- never let raw Supabase errors propagate to client

### Campfire Design System (Quick Reference)

| Token | Hex | Tailwind Class | Usage |
|-------|-----|---------------|-------|
| Camp Cobalt | `#1B3FC4` | `text-primary` / `bg-primary` | Primary actions, nav, links, active states |
| Camp Orange | `#E8853A` | — | Progress celebration, warm CTAs (sparingly) |
| Emerald | `#2D9F6F` | `text-success` | Success, mastery, correct answers |
| Warm Red | `#D64545` | `text-destructive` | Error, critical -- always with context |
| Amber | `#D4951A` | `text-warning` | Warning, developing skill |
| Surface Light | `#F8F7F5` | `bg-background` | Page background (warm white) |
| Ink Primary | `#1A2332` | `text-foreground` | Main text |
| Border | `#D4DAE3` | `border-border` | Default borders |
| Ink Secondary | `#4A5568` | `text-text-secondary` | Secondary text |
| Ink Tertiary | `#8896A7` | `text-muted-foreground` | Muted text, placeholders |
| Cobalt Light | `#EEF2FC` | `bg-primary-50` | Light primary backgrounds |
| Cobalt Dark | `#1535A8` | `text-primary-700` | Dark primary text/accents |

- **Border radius:** `rounded-sm` (buttons/inputs), `rounded-md` (cards), `rounded-lg` (modals) -- never `rounded-xl`+
- **Shadows:** `shadow-sm` on hover, `shadow-md` dropdowns, `shadow-lg` modals -- never `shadow-xl`+ on non-modal
- **Transitions:** max 300ms, default `duration-150 ease-out` -- never `bounce`/`spring` easing
- **Use `<Card>` component** from `@/components/ui/card` -- never ad-hoc card divs
- **Sanitize HTML** -- always use `DOMPurify.sanitize()` before `dangerouslySetInnerHTML`

### Portal Architecture

| Portal | Pages | Key Features |
|--------|-------|-------------|
| Dashboard | 33 | Wiki, Testing Hub (7 modes), Analytics (8 visualizations), Notes, 3D Lab, Camp Trails, Assessment |
| Admin | 27 | Articles CRUD, Questions CRUD + Import, Taxonomy Editor, Coverage Map, Publishing Pipeline, SME Review |
| CEO | 4 | Command Center (MRR/ARR), Financials (P&L), Behavioral Insights, Team Management |
| Developer | 21 | Design System Catalog, API Reference, Architecture Docs, Dev Tools, Status Dashboard |

### Data Fetching Patterns

- **Server Components** fetch data directly via server actions or Supabase queries
- **Query modules** live in `src/lib/queries/` -- prefer these over inline queries in page.tsx
- **Server Actions** in `src/lib/actions/` handle all mutations (create, update, delete)
- Use **Suspense boundaries** for independent data sections (see analytics page for gold standard)
- **Loading skeletons** via `loading.tsx` -- 87/105 pages have loading states

### Pedagogical Engine

| Component | Location | Notes |
|-----------|----------|-------|
| IRT 2PL Model | `src/lib/srs/irt.ts` | `P(θ) = 1 / (1 + exp(-a * (θ - b)))` |
| SM-2 SRS | `src/lib/srs/sm2.ts` | Standard SM-2 with ease floor at 1.3 |
| SRS Updates | `src/lib/srs/update.ts` | Quality derivation + schedule updates |
| Readiness Score | `src/lib/readiness-score.ts` | 330-line anti-inflation 6-vector computation |
| Blindspot Queue | `src/lib/srs/blindspot.ts` | 3 weakest nodes + unexplored grey nodes |
| Testing Actions | `src/lib/actions/testing.ts` | Session creation, interaction saving, 7 modes |
| Quiz Actions | `src/lib/actions/quiz.ts` | Legacy quiz flow with SRS integration |

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
- 3D scenes use `frameloop="demand"` and `dpr={[1,1.5]}` for performance
- Wiki widgets lazy-loaded via content-aware widget registry
- Quiz sessions auto-save every 10 seconds with localStorage + server sync

## Dependencies

### External (Key)

- `next` 16.1.6 -- App Router, Server Components, Server Actions
- `react` 19.2.4 -- Latest React with RSC support
- `typescript` 5.9.3 -- Strict mode
- `tailwindcss` 4.2.2 -- CSS-first config with Campfire design tokens
- `@supabase/supabase-js` 2.100.0 + `@supabase/ssr` 0.9.0 -- Database and auth
- `@react-three/fiber` 9.5.0 + `three` 0.183.2 -- 3D spatial learning (60 FPS target)
- `zustand` 5.0.12 -- Client state management
- `@base-ui/react` 0.9.5 + `shadcn` 4.1.0 -- UI primitives
- `@anthropic-ai/sdk` 0.78.0 -- AI contextual tutor (Temperature 0.0, citation-required)
- `stripe` 20.4.1 + `payrex-node` 1.7.3 -- Payment processing
- `framer-motion` 12.38.0 -- Structural animations (max 300ms transitions)
- `recharts` 3.8.0 -- Analytics charts
- `@tiptap/*` 3.20.4 (13 extensions) -- Rich text editor for notes
- `zod` -- Schema validation
- `lucide-react` 0.577.0 + `@phosphor-icons/react` 2.1.10 -- Icon libraries

<!-- MANUAL: -->
