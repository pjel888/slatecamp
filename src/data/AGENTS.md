<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-25 -->

# data

## Purpose

Static data files and seed scripts for populating the database during development. Contains reference data for taxonomy, questions, 3D models, and mock content.

## Key Files

| File | Description |
|------|-------------|
| `mock-questions.json` | Mock question data for development and testing -- used by demo mode and UI prototyping |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `seed/` | Database seed data files -- `taxonomy.json` (taxonomy tree nodes and hierarchies), `questions.json` (sample questions with IRT parameters), `models_3d.json` (3D model metadata for Lab modules) |

## For AI Agents

### Working In This Directory

- Seed data must match DATABASE_SCHEMA.sql column names and foreign key relationships
- Use `bun run db:seed` to execute seed scripts
- Keep seed data realistic -- use domain-appropriate content for architecture/engineering exams
- `mock-questions.json` is for client-side demo mode; seed JSON files are for database population
- IRT parameters in `questions.json` must include discrimination (a) and difficulty (b) values

### Common Patterns

- Seed files are plain JSON arrays matching table row structures
- `taxonomy.json` defines the full tree: discipline > subject > topic > subtopic
- `models_3d.json` entries reference asset URLs and module slugs used by the 3D Lab

## Dependencies

### Internal

- `DATABASE_SCHEMA.sql` (root) -- authoritative schema reference
- `src/types/supabase.ts` -- Database type definitions
- `supabase/02_RUN_ALL_SEEDS.sql` -- master seed script references this data

<!-- MANUAL: -->
