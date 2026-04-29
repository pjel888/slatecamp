# Codebase Map

**Last audit:** 2026-04-29

## Root-level and important directories

| Path | Files | Dirs | Purpose | Notable Children |
| --- | --- | --- | --- | --- |
| src/components | 706 | 61 | Shared and domain UI components (admin, dashboard, wiki, quiz-v2, sidebar, ui, r3f, etc.) | .chunkhound, 3d, admin, analytics, assessment, auth, calculators, ceo, dashboard, dev, developer, graphics |
| src/features | 556 | 64 | Large feature modules, primarily 3D Lab and wall configurator. | 3d-lab, wall-configurator |
| src/lib | 400 | 62 | Server actions, queries, auth/entitlements, payments, AI, SRS, analytics, wiki, utilities. | __tests__, actions, adaptive, admin, ai, analytics, api, audio, audit, cache, cage, ceo |
| src/hooks | 13 | 1 | Reusable React hooks for notes, online status, charts, permissions, gestures and lab telemetry. | notes |
| src/stores | 5 | 0 | Zustand stores for dev controls, notifications, quiz and timer state. | — |
| src/config | 3 | 0 | Feature flag and portal configuration. | — |
| src/data | 4 | 1 | Static/local product data and fixtures. | seed |
| scripts | 45 | 2 | Development, build, Playwright, audit, seed and operational scripts. | audits, backups |
| public | 9 | 0 | Static assets served by Next.js. | — |
| src/app | 244 | — | Next.js App Router pages, route handlers, layouts/loading/error boundaries. | admin, api, dashboard, developer, quiz, calculators, tools |
| supabase | 92 migrations | — | Database migrations and inspection/reset scripts. | migrations, check_db*.ts, seed/reset SQL |
| .ai | many | — | Operational intelligence, audits, plans, performance docs, current AI context. | 00_system, 00_performance, 02_audits, 06_specs, 10_state |
| docs | — | — | Root-level bridge/pointer docs. | README.md and docs subtree |
| e2e | 13 | — | Playwright e2e tests and support fixtures. | support/authenticated-demo.ts |


## Ignore/generated/vendor folders

Ignore `node_modules/`, `.next/`, `dist/`, `build/`, coverage output, cache folders, and generated runtime state unless a task explicitly targets tooling/runtime.

## Where future agents should look

| Task | Start Here |
| --- | --- |
| Route behavior | `src/app/<route>/page.tsx` plus local `AGENTS.md`, loading/error/layout files. |
| Auth/access | `middleware.ts`, `src/lib/supabase/middleware.ts`, `src/lib/entitlements/`. |
| Database claims | `DATABASE_SCHEMA.sql` then `supabase/migrations/`. |
| Server mutation | `src/lib/actions/<domain>/`. |
| Data reads | `src/lib/queries/` and route-level server components. |
| Design/UI | `DESIGN.md`, `src/app/globals.css`, `src/components/ui/`, nearest component subtree. |
| 3D Lab | `src/features/3d-lab/` plus 3D skills/docs. |
| Tests | `package.json`, `src/**/*.test.*`, `e2e/*.spec.ts`, `.ai/00_performance/`. |
