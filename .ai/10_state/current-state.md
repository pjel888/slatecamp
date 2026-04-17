# Current State

**Last Updated:** 2026-04-17

## Current architecture snapshot
SlateCamp is a large Next.js App Router codebase with broad product and operational scope:
- dashboard study systems
- admin content/review/editor flows
- developer portal docs/tools
- protected business/CEO surfaces
- quiz, wiki, notes, analytics, 3D Lab, calculators, entitlements, payments, and data pipelines

## Verified current reality
- `src/app/`: 124 pages, 16 layouts, 95 loading files, 9 error boundaries, 12 route handlers
- `src/lib/actions/`: 156 files
- `src/components/`: 716 files
- `src/features/`: 551 files
- `supabase/migrations/`: 89 files
- tracked `AGENTS.md`: 114
- client components: 677 files with `use client` declarations across `src/`

## Current strengths
- broad feature surface already implemented
- strong route/component/lib separation at the directory level
- meaningful test presence in important logic areas
- extensive local-scope guidance coverage via `AGENTS.md`
- authoritative schema source in `DATABASE_SCHEMA.sql`

## Current weak points
- documentation topology drift risk remains high because the repo is large
- client/server boundary drift is measurable
- action-layer breadth makes backend conventions easy to lose
- many governance/docs changes are already in flight, so verification discipline matters

## Current recommended next steps
1. Use `.ai/02_audits/master-audit.md` as the active findings entrypoint.
2. Use `.ai/00_system/ai-folder-canonical-map.md` as the active `.ai` routing map.
3. Resolve install/CI/security blockers before broad refactors.
4. Treat `.ai/10_state/` as the human-readable state layer and `.omx/` as runtime-only.
