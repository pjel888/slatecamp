# Architecture Map

**Last Updated:** 2026-04-17

## Top-level runtime layers

| Layer | Primary paths | Current reality |
| --- | --- | --- |
| App and route orchestration | `src/app/` | App Router surface with `125` pages, `16` layouts, `96` loading files, and `12` route handlers |
| Shared UI | `src/components/` | `716` component files spanning dashboard, admin, wiki, analytics, and shared primitives |
| Feature modules | `src/features/` | `551` feature files, with 3D Lab and wall configurator as the most specialized clusters |
| Domain and service logic | `src/lib/` | Action-centric service layer with `156` action files and `19` query files |
| Client workflow state | `src/stores/`, `src/hooks/` | Small store count, but broad interactive hook and client-component usage |
| Data and auth boundary | `DATABASE_SCHEMA.sql`, `supabase/migrations/`, `src/lib/supabase/` | Supabase-backed runtime with schema snapshot plus `89` migration files |
| Operational intelligence | `.ai/`, `.agents/skills/`, `AGENTS.md` | Governance, audits, enablement docs, and Codex workflow surface |

## Major route surfaces

| Surface | Current shape | Notes |
| --- | --- | --- |
| `dashboard/` | `46` pages | Primary learner experience: drills, notes, wiki, analytics, 3D Lab, testing, camp trails |
| `admin/` | `38` pages | Broadest internal workflow surface: content, questions, taxonomy, assets, audit, reviews, pipeline |
| `developer/` | `11` pages | Internal tooling and inspection surface; currently mixes runtime-backed and mock-backed views |
| `(protected)/ceo/` | `5` pages | Smaller but business-critical analytics and finance surface |
| Public/auth/product routes | remainder of `src/app/` | Login, pricing, calculators, tools, onboarding, and public entry flows |

## Key system boundaries

- Routes and layouts should orchestrate composition, auth gating, and surface assembly.
- Domain logic, server actions, and queries should live under `src/lib/`.
- Shared reusable UI belongs in `src/components/`; behavior-heavy domains should stay in `src/features/`.
- Supabase helpers, auth resolution, entitlements, and payments form the main privileged data edges.
- `.ai/` and `AGENTS.md` define understanding, execution, and documentation discipline; they are not runtime behavior.

## Current architectural hotspots

1. `src/lib/actions/` is large enough that mutation conventions are easy to lose without strong docs.
2. Admin authoring spans route shells, large client editors, server actions, and preview/render helpers.
3. 3D Lab loading and registry logic remain one of the highest-complexity client-heavy areas.
4. Dashboard shell and onboarding/bootstrap logic still carry a broad shared render-path blast radius.

## Companion docs

- `repo-map.md`
- `route-surface-map.md`
- `data-boundary-map.md`
- `system-boundaries.md`
