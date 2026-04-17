# Full Codebase Intelligence Audit

**Date:** 2026-04-16
**Scope:** Whole repository
**Mode:** Documentation / operational intelligence audit

## Executive summary
SlateCamp is not an early-stage skeleton. It is a large, multi-surface production-oriented codebase with:
- a broad App Router surface
- substantial shared business logic
- extensive server-action usage
- a large migration history
- meaningful test coverage
- a newly improved but still maturing `.ai` operational layer
- widespread `AGENTS.md` coverage that had drifted from current reality

The primary risk is **not lack of capability**. The primary risk is **operational drift**: stale docs, stale repo instructions, unclear documentation ownership, and inconsistent statements about counts, tooling, and current subsystem boundaries.

## Codebase reality snapshot
- `src/`: 394 dirs / 2141 files
- `src/app/`: 125 pages, 16 layouts, 96 loading states, 9 error boundaries, 12 route handlers
- `src/components/`: 63 dirs / 716 files
- `src/features/`: 63 dirs / 551 files
- `src/lib/`: 60 dirs / 396 files
- `src/lib/actions/`: 11 subdirs / 146 files
- `supabase/migrations/`: 89 files
- test files under `src/`: 64
- tracked `AGENTS.md` files: 113

## Major active subsystems
1. **App/portal surface** — dashboard, admin, developer, CEO, quiz, calculators, tools, marketing/public routes
2. **Component system** — large shared component surface including admin, wiki, analytics, quiz-v2, dev, graphics, portal, r3f, and more
3. **Shared logic** — actions, queries, entitlements, readiness, srs, quiz, wiki, payments, paywall, logging, analytics, PD1096, lot geometry
4. **3D / geometry** — `src/features/3d-lab`, wall configurator, calculators, geometry and compliance helpers
5. **Data layer** — authoritative `DATABASE_SCHEMA.sql`, 89 migrations, Supabase helpers, admin/data import utilities
6. **Documentation/ops layer** — `.ai`, `.ai/docs`, root README, root docs placeholder, repo-wide AGENTS hierarchy

## Documentation truth reconciliation

### Accurate or broadly useful
- `.ai/README.md` — strong explanation of the new `.ai` overlay
- `.ai/10_state/current-state.md` — useful for `.ai` organizational state after the recent upgrade
- many `.ai/docs/*` reference files remain useful as deep docs
- `DATABASE_SCHEMA.sql` is the strongest database truth source
- `package.json` is the command/source-of-truth for scripts

### Partially stale or materially drifted
- `README.md` — useful foundation, but incomplete and stale on validation status and repo guidance
- `.ai/docs/00-meta/001-index.md` — filename and ownership drift versus actual `.ai/docs` contents
- `.ai/docs/00-meta/000-implementation-plan.md` — historical planning value, but no longer the sole current truth
- many `AGENTS.md` files — had outdated counts, old terminology, or inaccurate subtree summaries
- `docs/README.md` — too thin to explain current doc topology safely

### Missing or underdeveloped before this pass
- current-phase and milestone-tracker docs in `.ai/01_roadmap/`
- repo-wide audit and reconciliation artifacts for the refreshed `.ai` overlay
- explicit doc-governance and audit-standards docs under `.ai/00_system/`
- consistent current-reality refresh across all tracked `AGENTS.md` files

## Major risks and weak points
1. **Documentation topology ambiguity** between `README.md`, `docs/`, `.ai/`, and `.ai/docs/`
2. **Instruction drift risk** because the repo has 100+ scoped `AGENTS.md` files
3. **Validation clarity gap** because package scripts do not expose a single canonical `test` command even though tests exist
4. **Surface-area risk**: the app is large enough that shallow scanning creates false confidence quickly
5. **Feature maturity mismatch**: strong implementation breadth, weaker operational guidance consistency

## Current strengths
- broad implementation coverage across product surfaces
- meaningful test presence in critical logic areas
- extensive subtree scoping via `AGENTS.md`
- clear authoritative schema file
- strong evidence of domain-specific architecture rather than demo-level code

## Documentation-only recommendations
1. Make `README.md` the comprehensive repo entrypoint.
2. Keep `.ai` as the operational brain.
3. Treat `.ai/docs` as the deep reference/spec corpus, but update indexes and ownership notes.
4. Keep all `AGENTS.md` files aligned to current subtree reality with explicit anti-laziness guidance.
5. Avoid destructive cleanup; prefer supersession notes, logs, and bridge docs.
