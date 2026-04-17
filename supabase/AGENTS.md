<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-16 | Reality Refresh: 2026-04-16 -->

# supabase

## Scope
This file governs `supabase/` and its contents.

## Current subtree reality
`supabase/` currently contains:
- reset/seed SQL utilities (`00_DROP_ALL_TABLES.sql`, `01_RESET_AND_SEED.sql`, `02_RUN_ALL_SEEDS.sql`, `03_QUIZ SEED.sql`)
- multiple database inspection/check scripts
- `.temp/` scratch/runtime artifacts
- `migrations/` with 89 SQL migration files

## Canonical database truth
- `DATABASE_SCHEMA.sql` is the strongest schema snapshot in the repository.
- `supabase/migrations/` is the migration chronology that must be checked before claiming current DB behavior.

## What agents must inspect before editing
- `DATABASE_SCHEMA.sql`
- the relevant migration files
- any related application code that depends on the schema or policies

## Safety rules
- Do not run destructive reset/drop scripts unless explicitly required and documented.
- Do not assert table/column/policy counts from stale docs.
- Preserve migration chronology and traceability.
- Treat seed/reset scripts as high-risk operational tooling.

## Validation expectations
- validate schema claims against `DATABASE_SCHEMA.sql`
- validate migration references against actual filenames in `supabase/migrations/`
- use non-destructive checks for documentation tasks; do not perform reset/drop operations as routine validation

## Anti-laziness rule
Do not document the database from memory or from one migration. Use the schema snapshot plus the relevant migration slice together.
