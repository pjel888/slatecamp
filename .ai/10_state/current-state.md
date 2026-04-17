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
- `src/app/`: 125 pages, 16 layouts, 96 loading files, 9 error boundaries, 12 route handlers
- `src/lib/actions/`: 156 files
- `src/components/`: 716 files
- `src/features/`: 551 files
- `supabase/migrations/`: 89 files
- tracked `AGENTS.md`: 122
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
1. Use `.ai/00_system/codex-enablement-guide.md` first for future Codex sessions.
2. Use `.ai/10_state/findings-register.md` for repo-wide findings and `CODEX_ENABLEMENT_FINDINGS.md` for Codex-friction findings.
3. Use `.ai/00_system/route-surface-map.md` and `.ai/00_system/data-boundary-map.md` before broad admin, developer, or backend changes.
4. Treat `.ai/10_state/` as the human-readable current state layer and `.omx/` as runtime-only state.
