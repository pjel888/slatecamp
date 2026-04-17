# Current State

**Last Updated:** 2026-04-16

## Current architecture snapshot
SlateCamp is a large Next.js App Router codebase with broad product and operational scope:
- dashboard study systems
- admin content/review/editor flows
- developer portal docs/tools
- protected business/CEO surfaces
- quiz, wiki, notes, analytics, 3D Lab, calculators, entitlements, payments, and data pipelines

## Verified current reality
- `src/app/`: 125 pages, 16 layouts, 96 loading files, 9 error boundaries, 12 route handlers
- `src/lib/actions/`: 146 files
- `src/components/`: 716 files
- `src/features/`: 551 files
- `supabase/migrations/`: 89 files
- tracked `AGENTS.md`: 113
- client components: 621 / 1201 `.tsx` files (51.7%)

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
1. Validate the widespread AGENTS refresh currently in the working tree.
2. Add doc-integrity automation for stable `.ai` entrypoints.
3. Audit the highest-value client-heavy routes and stores.
4. Add environment/setup contract documentation.
