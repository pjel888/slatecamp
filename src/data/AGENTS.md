<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-24 -->

# data

## Purpose

Static data files and seed scripts for populating the database during development. Contains reference data for taxonomy, questions, and other domain entities.

## Key Files

| File | Description |
|------|-------------|
| (root file) | Static data constants or mappings |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `seed/` | Database seed data files (3 files) — taxonomy trees, sample questions, user profiles |

## For AI Agents

### Working In This Directory

- Seed data must match DATABASE_SCHEMA.sql column names and foreign key relationships
- Use `bun run db:seed` to execute seed scripts
- Keep seed data realistic — use domain-appropriate content for architecture/engineering exams

## Dependencies

### Internal

- `DATABASE_SCHEMA.sql` (root) — authoritative schema reference
- `src/types/supabase.ts` — Database type definitions

<!-- MANUAL: -->
