<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-24 -->

# types

## Purpose

Centralized TypeScript type definitions shared across the entire application. Defines domain models (disciplines, taxonomy nodes, questions, sessions), UI types, Supabase database types, and module declarations.

## Key Files

| File | Description |
|------|-------------|
| `app.ts` | Core domain types — UserTier, QuestionType, DifficultyLevel, TestMode, SessionStatus, TaxonomyNode, Choice, and all major entity interfaces |
| `supabase.ts` | Auto-generated Supabase database types — maps to DATABASE_SCHEMA.sql |
| `dashboard.ts` | Dashboard-specific UI types and props |
| `wiki.ts` | Wiki content and article types |
| `3d-lab.ts` | 3D Lab scene, module, and configurator types |
| `tools.ts` | Calculator tool types (floor tiles, lot plotter, wall paint) |
| `bun-test.d.ts` | Bun test runner type declarations |
| `payrex-node.d.ts` | PayRex payment SDK type declarations |

## For AI Agents

### Working In This Directory

- **`app.ts` is the master type file** — check here first for any domain type
- **`supabase.ts` is auto-generated** — do not edit manually; regenerate from DATABASE_SCHEMA.sql
- When adding new types, place them in the most specific file (e.g., wiki types in `wiki.ts`)
- If a type is used across 3+ feature areas, put it in `app.ts`
- Always export types with `export type` or `export interface`

### Common Patterns

- Union types for enums: `type TestMode = "camp" | "storm" | "chill" | ...`
- Interfaces match database table structures (consult DATABASE_SCHEMA.sql)
- Optional fields use `?` suffix, nullable fields use `| null`
- `.d.ts` files for third-party module declarations only

## Dependencies

### Internal

- `DATABASE_SCHEMA.sql` (root) — authoritative schema for `supabase.ts`

<!-- MANUAL: -->
