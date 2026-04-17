# SlateCamp

SlateCamp is a large Next.js App Router codebase for the **Philippine Architecture Licensure Exam**.

It is not a thin landing page or quiz demo. The repository includes:
- student-facing dashboard study flows
- admin content, review, and publishing tooling
- internal developer and documentation surfaces
- protected business / CEO views
- wiki, notes, analytics, testing modes, calculators, and 3D learning modules
- Supabase-backed schema, migrations, and operational scripts

This README is the **repository entrypoint**. Keep it aligned with `CLAUDE.md` (policy-heavy repo contract), root `AGENTS.md` (repo-wide operating instructions), `.ai/` (operational intelligence), and `.ai/06_specs/deep/` (deep reference docs).

Current audit/planning entrypoints:
- `.ai/02_audits/master-audit.md`
- `.ai/00_system/repo-map.md`
- `.ai/00_system/ai-folder-canonical-map.md`
- `.ai/03_plans/executive-remediation-roadmap.md`

---

## 1. What SlateCamp contains

### Product surfaces
- **Dashboard** — student study experience under `src/app/dashboard`
- **Admin** — content, review, publishing, and management flows under `src/app/admin`
- **Developer** — internal documentation and tooling under `src/app/developer`
- **Protected / CEO-adjacent surfaces** — gated internal and business views under `src/app/(protected)` and related supporting code
- **Quiz / testing routes** — quiz sessions, review, and results under `src/app/quiz`
- **Calculators / tools** — construction calculators and utility tools under `src/app/calculators` and `src/app/tools`
- **3D / geometry-heavy learning features** — implemented across `src/features/3d-lab`, `src/features/wall-configurator`, and supporting app/component/lib code

### Core technical themes
- App Router with server-first rendering patterns
- Supabase/PostgreSQL-backed data model
- Item Response Theory + spaced repetition logic
- Documentation and agent-governance layer (`.ai` + `AGENTS.md` hierarchy)
- Large multi-surface repository with active operational hardening needs

---

## 2. Tech stack

### Application
- **Next.js** 16.1.6
- **React** 19.2.4
- **TypeScript** 5.9.3
- **Tailwind CSS** 4.x

### Data and services
- **Supabase** (`@supabase/supabase-js`, `@supabase/ssr`)
- **PostgreSQL** via Supabase
- **Anthropic SDK** present for AI features
- **LemonSqueezy** and **PayRex** integrations present in the repo

### UI / visualization
- **shadcn/ui**-style component structure
- **Framer Motion**
- **Recharts**
- **React Three Fiber / Three.js / drei**

### Tooling
- **Bun** package manager and script runner
- **ESLint**
- **TypeScript compiler (`tsc`)**
- **Storybook**

---

## 3. Repository structure

```text
.
├── README.md                     Repository entrypoint
├── AGENTS.md                     Repo-wide agent instructions
├── CLAUDE.md                     Core repo/system guidance and design constraints
├── DATABASE_SCHEMA.sql           Authoritative database schema snapshot
├── package.json                  Scripts and dependency truth source
├── next.config.ts                Next.js config, security headers, redirects, server actions limit
├── middleware.ts                 Supabase session update + pathname header propagation
├── src/                          Application source code
│   ├── app/                      App Router pages, layouts, route handlers, portal surfaces
│   ├── components/               Shared UI and feature-facing components
│   ├── features/                 Larger feature modules (notably 3D/geometry-heavy areas)
│   ├── lib/                      Actions, queries, services, domain logic, integrations
│   ├── hooks/                    Shared hooks
│   ├── stores/                   Shared client stores
│   ├── config/                   Runtime/site configuration
│   ├── data/                     Data files and fixtures
│   └── types/                    Shared types
├── supabase/                     SQL migrations, seed/reset utilities, DB helpers
├── scripts/                      Operational and maintenance scripts
├── public/                       Public static assets
├── docs/                         Root-level bridge/pointer docs surface
├── .ai/                          Operational intelligence layer
└── .omx/                         Runtime/session state for oh-my-codex workflows
```

### Key source areas

| Path | What it holds |
| --- | --- |
| `src/app/` | Route groups, portal routes, page/layout/loading/error files, route handlers |
| `src/components/` | UI systems for admin, dashboard, analytics, wiki, quiz-v2, dev, graphics, portal, shared UI, and more |
| `src/features/` | Larger feature modules including 3D Lab and wall configurator systems |
| `src/lib/` | Server actions, queries, entitlements, readiness, SRS, wiki, payments, logging, analytics, PD1096 helpers, geometry logic |
| `supabase/migrations/` | 89 migration files at the time of this audit |
| `scripts/` | Dev/database/content-maintenance scripts |
| `.ai/` | Audits, roadmap, plans, tasks, logs, state, agent docs, deep reference docs |

---

## 4. Documentation surfaces and how to use them

### Use `README.md` for
- repo orientation
- setup and commands
- high-level architecture and structure
- the fastest path to the next relevant source of truth

### Use `.ai/` for
- audits
- roadmap state
- plans and tasks
- change logs
- agent/governance docs
- operational truth reconciliation

Recommended starting points:
- `.ai/10_state/current-state.md`
- `.ai/02_audits/master-audit.md`
- `.ai/00_system/repo-map.md`
- `.ai/00_system/ai-folder-canonical-map.md`
- `.ai/01_roadmap/current-phase.md`
- `.ai/12_agents/repo-agent-model.md`

### Use `.ai/06_specs/deep/` for
- deep reference and specification material
- architecture docs
- portal docs
- product and docs history

### Use current audit/planning artifacts for
- the 2026-04-17 repository audit trail
- prioritized findings and readiness assessment
- `.ai` rationalization decisions
- implementation sequencing for a later approved remediation run

Recommended starting points:
- `.ai/06_specs/deep/00-meta/001-index.md`
- `.ai/06_specs/deep/02-architecture/001-system-architecture.md`
- `.ai/06_specs/deep/portal/000-portal-guide.md`

### Use `AGENTS.md` files for
- scope-specific instructions when editing a subtree
- local validation expectations
- anti-laziness rules
- handoff and update expectations

Always use the nearest in-scope `AGENTS.md` plus the repo root `AGENTS.md`.

### Use `CLAUDE.md` for
- the policy-heavy repository contract
- canonical truth-source rules
- validation and documentation-maintenance policy
- repo-wide change-safety expectations

---

## 5. Local development

### Prerequisites
- **Bun** installed
- Node-compatible local environment for Next.js and TypeScript tooling
- A working `.env.local` with the credentials required by the surfaces you want to run

> There is currently **no committed `.env.example`** in the repo root. Treat environment setup as a manual step derived from the codebase, local practice, and deployment configuration.

### Install dependencies

```bash
bun install
```

### Start the app

```bash
bun run dev
```

`bun run dev` uses `scripts/dev.js`, which selects:
- **Webpack on Windows**
- **Turbopack on non-Windows platforms**

You can also force either mode:

```bash
bun run dev:turbo
bun run dev:webpack
```

### Start Storybook

```bash
bun run storybook
```

### Build Storybook

```bash
bun run build-storybook
```

### Start a production build locally

```bash
bun run build
bun run start
```

---

## 6. Important scripts

These commands are grounded in `package.json` as of **2026-04-16**.

| Command | Purpose |
| --- | --- |
| `bun run dev` | Start local development via `scripts/dev.js` |
| `bun run dev:turbo` | Force Next.js Turbopack dev mode |
| `bun run dev:webpack` | Force Next.js Webpack dev mode |
| `bun run build` | Production build |
| `bun run start` | Start built app |
| `bun run lint` | Run ESLint (includes storybook placeholder precheck) |
| `bun run lint:fix` | Auto-fix lint issues where possible |
| `bun run type-check` | Run `tsc --noEmit` |
| `bun run storybook` | Run Storybook locally |
| `bun run build-storybook` | Build Storybook static output |
| `bun run check:storybook` | Storybook placeholder validation |
| `bun run check:entitlements` | Entitlement legacy-usage check |
| `bun run db:seed` | Seed database via `scripts/seed.ts` |

### Important note on tests
There is **no top-level `test` script** in `package.json` right now.

The repository does contain many test files, but there is no single root `bun test` command in the current script surface. Any documentation or CI guidance should account for that explicitly instead of assuming a root test script exists.

---

## 7. Validation workflow

### Common repo-wide checks

```bash
bun run type-check
bun run lint
bun run build
```

### Additional targeted checks
Use targeted route/library tests or subsystem-specific validation when changing:
- route handlers in `src/app/api/`
- server actions in `src/lib/actions/`
- entitlements / access control logic in `src/lib/entitlements/`
- 3D / geometry-heavy code in `src/features/3d-lab/`, `src/features/wall-configurator/`, and related helpers
- schema/migration documentation in `supabase/` and `DATABASE_SCHEMA.sql`

### Documentation validation
When editing docs, README, or AGENTS:
- verify every referenced file/path exists
- verify every command exists in `package.json` or as a real script
- date time-sensitive status claims or omit them
- update the nearest `AGENTS.md` if subtree structure/workflows drift

---

## 8. Database and Supabase workflow

### Authoritative sources
- `DATABASE_SCHEMA.sql` is the strongest repository snapshot of schema truth
- `supabase/migrations/` shows the migration history that produced the current state

### What exists in the repo
- migration-heavy Supabase setup
- reset/seed SQL scripts in `supabase/`
- DB inspection/testing scripts in `scripts/`

### Safety rules
- do not assume table counts, policy counts, or migration counts from stale docs
- validate schema claims against `DATABASE_SCHEMA.sql` and actual migrations
- be careful with destructive reset/drop scripts in `supabase/`

---

## 9. Architecture overview

### App layer
`src/app/` holds route groups and portal surfaces. The repo currently contains:
- 125 `page.tsx` files
- 16 `layout.tsx` files
- 96 `loading.tsx` files
- 9 `error.tsx` files
- 12 `route.ts` handlers

### UI layer
`src/components/` is broad and portal-aware, with large areas for:
- admin
- analytics
- dashboard
- developer/dev
- graphics
- notes
- quiz-v2
- shared/ui
- wiki
- r3f / visualization support

### Feature layer
`src/features/` contains larger modules, especially:
- `3d-lab`
- `wall-configurator`
- other performance-sensitive, feature-grouped code

### Logic / services layer
`src/lib/` contains the most important cross-cutting logic:
- server actions
- queries
- entitlements
- readiness / SRS / quiz logic
- analytics and logging
- payments / paywall
- wiki logic
- admin helpers
- PD1096 and lot-geometry helpers
- Supabase clients/helpers

---

## 10. What is operationally true right now

### Strengths
- broad implementation coverage across many product surfaces
- strong subtree decomposition
- many scoped `AGENTS.md` files to guide local changes
- meaningful test presence across logic-heavy areas
- clear schema authority in `DATABASE_SCHEMA.sql`

### Risks
- documentation drift can reappear quickly because the surface area is large
- many AGENTS files means instruction maintenance is a real ongoing task
- root validation/testing guidance is easy to misstate if not tied directly to `package.json`
- doc ownership can become blurry without explicit governance

### Current phase
The repository is in a **post-foundation expansion + hardening** phase rather than a greenfield build. See `.ai/01_roadmap/current-phase.md` for the current repo-intelligence view.

---

## 11. Working with `AGENTS.md`

This repository uses a deep `AGENTS.md` hierarchy.

### Rules
1. Start with the root `AGENTS.md`
2. Then read the nearest in-scope subtree `AGENTS.md`
3. Prefer local scope instructions when they refine a narrower subtree
4. Update the local `AGENTS.md` when structure, workflow, or key responsibilities drift

### Practical examples
- editing `src/app/admin/...` → read `AGENTS.md`, `src/AGENTS.md`, `src/app/AGENTS.md`, `src/app/admin/AGENTS.md`
- editing `src/lib/actions/wiki/...` → read `AGENTS.md`, `src/AGENTS.md`, `src/lib/AGENTS.md`, `src/lib/actions/AGENTS.md`, `src/lib/actions/wiki/AGENTS.md`
- editing `supabase/...` → read `AGENTS.md` and `supabase/AGENTS.md`

---

## 12. Recommended entry points for auditors and contributors

### If you need the current repo state
- `.ai/10_state/current-state.md`
- `.ai/10_state/active-risks.md`
- `.ai/02_audits/master-audit.md`

### If you need deep architecture docs
- `.ai/06_specs/deep/02-architecture/001-system-architecture.md`
- `.ai/06_specs/deep/02-architecture/002-portal-breakdown.md`
- `.ai/06_specs/deep/02-architecture/003-database-schema.md`

### If you need portal docs
- `.ai/06_specs/deep/portal/000-portal-guide.md`
- `.ai/06_specs/deep/portal/dashboard/001-overview.md`
- `.ai/06_specs/deep/portal/admin/001-knowledge-hub.md`
- `.ai/06_specs/deep/portal/developer/001-design-system.md`

### If you need operational plans/tasks
- `.ai/03_plans/implementation-plan.md`
- `.ai/03_plans/readiness-plan.md`
- `.ai/02_audits/2026-04-17-ai-file-lifecycle-audit.md`

---

## 13. Known documentation boundaries

To avoid future drift:
- keep `README.md` comprehensive but not a full mirror of `.ai/06_specs/deep`
- keep `.ai` focused on operational truth, planning, logs, and audit outputs
- keep `.ai/06_specs/deep` as the deeper reference/spec surface
- keep historical material preserved unless explicitly superseded

---

## 14. If you are updating this repository

When you change the repo structure or a major subsystem, update the relevant surfaces in the same change:
- `README.md` if onboarding or structure changes
- `.ai/` state/roadmap/audits if operational truth changes
- nearest `AGENTS.md` files for subtree instructions
- `.ai/06_specs/deep/` only when deeper reference/spec content also needs to change

This repository is large enough that **stale instructions are an engineering risk**. Treat documentation maintenance as part of the implementation work, not cleanup for later.
