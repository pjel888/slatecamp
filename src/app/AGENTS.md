<!-- Parent: ../../AGENTS.md -->
<!-- Generated: 2026-04-16 | Reality Refresh: 2026-04-16 -->

# src/app

## Scope
This file governs `src/app/` and its route subtrees unless a deeper `AGENTS.md` overrides it.

## Current subtree reality
`src/app/` is the live App Router surface.

Current audited counts:
- 125 `page.tsx` files
- 16 `layout.tsx` files
- 96 `loading.tsx` files
- 9 `error.tsx` files
- 12 `route.ts` handlers

Main route groups and surfaces include:
- `(auth)` and `auth`
- `(protected)`
- `dashboard`
- `admin`
- `developer`
- `api`
- `quiz`
- `calculators`
- `tools`
- `pricing`, `try`, `about`, `contact`

## What agents must inspect before editing
- the local route group's `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, and any `route.ts`
- `.ai/00_system/ROUTE_SURFACE_MAP.md`
- `.ai/00_system/VALIDATION_MATRIX.md`
- the matching components under `src/components/`
- the matching server actions/queries/helpers under `src/lib/`
- middleware or auth/role boundaries when access is relevant

## Route-level rules
- Preserve server-component defaults unless interactivity truly requires a client boundary.
- Keep loading/error behavior aligned with the surrounding route group.
- Treat route changes as cross-cutting when they affect portal docs, navigation, or AGENTS guidance.

## Validation expectations
- `bun run type-check`
- `bun run lint`
- targeted path/reference checks for every route or portal doc claim
- route or handler tests when touching API/webhook/auth logic

## Anti-laziness rule
Do not describe a route subtree after reading only folder names. Open the actual route files and supporting components/actions first.
