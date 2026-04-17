<!-- Generated: 2026-04-17 | Reality Refresh: 2026-04-17 -->

# SlateCamp Repository

## Scope
This file governs the whole repository unless a deeper `AGENTS.md` overrides it.

## Current repository reality
SlateCamp is a large Next.js App Router codebase for ALE preparation. It is broad, mature, and operationally heavy.

Live evidence from the repo on 2026-04-17:
- `src/app/` contains 124 `page.tsx` routes, 16 layouts, 95 loading files, 9 error boundaries, and 12 route handlers
- `src/lib/actions/` contains 156 files across root and feature subdirectories
- `src/components/` contains 716 files
- `src/features/` contains 551 files
- `supabase/migrations/` contains 89 migration files
- `src/` contains 64 test files
- the repo tracks 114 `AGENTS.md` files

This is not a greenfield app or a toy demo. Treat it like a multi-surface product with significant documentation and governance needs.

## Canonical sources by topic
- Commands and tooling: `package.json`
- Database truth: `DATABASE_SCHEMA.sql` and `supabase/migrations/`
- Next.js/runtime truth: `next.config.ts`, `middleware.ts`, `src/app/`
- Operational truth: `.ai/`
- Deep reference/spec docs: `.ai/06_specs/deep/`
- Repo entrypoint: `README.md`
- Policy-heavy repo contract: `CLAUDE.md`
- `.ai` canonical map: `.ai/00_system/ai-folder-canonical-map.md`

## What agents must do before editing
1. Read the nearest in-scope `AGENTS.md` files from root down to the target subtree.
2. Inspect the live code, config, schema, and scripts in scope before making claims or edits.
3. Update documentation and agent guidance in the same change when structure, workflow, ownership, or key file references drift.
4. Keep `.ai`, `README.md`, and the `AGENTS.md` hierarchy aligned.

## Global rules
- Use Bun for package and script execution.
- Read `DATABASE_SCHEMA.sql` before any database-related work.
- Verify commands against `package.json`; do not assume a top-level `test` script exists.
- Prefer non-destructive documentation updates: annotate, supersede, or index rather than silently delete history.
- Avoid shallow scanning. Folder names are not enough in this repository.
- Generated audit, plan, and log artifacts do not recursively expand audit scope.
- When a run is explicitly audit/planning only, stop at documentation and planning artifacts; remediation belongs to a later implementation-approved run.

## Validation expectations
- Run `bun run type-check` when source-behavior or architectural claims change.
- Run `bun run lint` when workflow, tooling, or style claims change.
- Check every referenced route, script, schema file, and doc link by path.
- Run `git diff --check` before completion for documentation-heavy changes.

## Documentation topology
- `README.md` = comprehensive repository entrypoint
- `CLAUDE.md` = policy-heavy repository contract
- `docs/` = root-level bridge surface
- `.ai/` = operational intelligence layer
- `.ai/06_specs/deep/` = deep reference/specification corpus
- `.ai/00_system/ai-folder-canonical-map.md` = current `.ai` canonical routing map

Use these roles intentionally. Do not let them drift into contradictory copies.

## Anti-laziness rule
- Do not stop at the directory tree.
- Open the implementation files that define the behavior you are documenting or changing.
- If a deeper `AGENTS.md` or live code contradicts an older note, follow the narrower scope and current code reality.

## Audit and planning rule
- Audit outputs must tie findings to evidence paths and stable IDs.
- Plans must link back to findings and stop short of implementation details.
- Generated audit artifacts are deliverables, not new baseline scope.
