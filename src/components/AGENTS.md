<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-16 | Reality Refresh: 2026-04-16 -->

# src/components

## Scope
This file governs `src/components/` and all child directories unless a deeper `AGENTS.md` overrides it.

## Current subtree reality
`src/components/` is a large shared UI surface with 63 directories and 716 files.

Prominent areas include:
- `admin/`
- `analytics/`
- `assessment/`
- `ceo/`
- `dashboard/`
- `dev/` and `developer/`
- `graphics/`
- `landing/`, `marketing/`
- `notes/`
- `portal/`
- `quiz-v2/`
- `r3f/`
- `shared/`, `ui/`, `sidebar/`
- `tools/`, `trail/`, `trails/`, `wiki/`

## What agents must inspect before editing
- the consuming route(s) in `src/app/`
- shared hooks/stores/types used by the component
- adjacent design-system or shared-ui building blocks
- relevant tests/stories if they exist

## Component rules
- Preserve current server/client boundaries.
- Reuse design-system primitives and current composition patterns where possible.
- Be especially careful with shared UI (`ui/`, `shared/`, `portal/`, `sidebar/`) because blast radius is broad.
- For R3F/3D-adjacent components, check feature modules and performance-sensitive code paths too.

## Validation expectations
- `bun run type-check`
- `bun run lint`
- targeted path/reference checks for any route/component/doc links you update
- targeted tests when changing logic-bearing components or shared abstractions

## Anti-laziness rule
Do not assume a component is isolated because it is small. Check where it is consumed before you change or document it.
