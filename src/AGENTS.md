<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-16 | Reality Refresh: 2026-04-16 -->

# src

## Scope
This file governs `src/` and all child directories unless a deeper `AGENTS.md` overrides it.

## Current subtree reality
`src/` is the main application surface and currently contains:
- `app/` — App Router routes, portals, layouts, and route handlers
- `components/` — large UI surface for admin, dashboard, analytics, wiki, quiz-v2, dev, graphics, portal, shared UI, and more
- `features/` — larger feature modules, especially 3D/geometry-heavy systems
- `lib/` — shared logic, actions, queries, services, entitlements, readiness, payments, analytics, wiki, and database helpers
- `hooks/`, `stores/`, `config/`, `data/`, and `types/`

Current snapshot: 394 directories and 2140+ files under `src/`.

## What agents must inspect before editing
- the local subtree's nearest `AGENTS.md`
- the calling route or consuming component
- the matching shared logic or action/query layer
- related tests when behavior is non-trivial

## Cross-cutting constraints
- Preserve server-first / App Router conventions unless there is a clear reason otherwise.
- Keep client/server boundaries explicit.
- Do not document or claim behavior without checking the live implementation files.
- When shared contracts change, update the relevant docs/AGENTS guidance in the same change.

## Validation expectations
- `bun run type-check`
- `bun run lint` when code or code-governing docs are touched
- targeted path/reference checks for every route, component, helper, or type mentioned in docs
- run targeted tests when changing behavior in logic-heavy areas

## Anti-laziness rule
Do not summarize `src/` from high-level folder names alone. Trace the actual route/component/lib/test relationships first.
