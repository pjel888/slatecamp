<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-25 -->

# types

## Purpose

Centralized TypeScript type definitions shared across the entire application. Defines domain models (disciplines, taxonomy nodes, questions, sessions), UI types, Supabase database types, portal-specific contracts, and module declarations.

## Key Files

| File | Description |
|------|-------------|
| `app.ts` | Core domain types -- UserTier, QuestionType, DifficultyLevel, TestMode, SessionStatus, Profession, TaxonomyNode, Choice, Discipline, and all major entity interfaces |
| `supabase.ts` | Auto-generated Supabase database types -- maps to DATABASE_SCHEMA.sql (51 tables) |
| `testing.ts` | Testing session types -- ModeSource, UIMode, mode metadata, session config, and debrief result interfaces |
| `dashboard.ts` | Dashboard-specific UI types -- HeroMicroStat, HeatmapDay, RecommendedAction, and component props |
| `wiki.ts` | Wiki content types -- WikiCalloutType, WikiTableRow, article and section interfaces |
| `ceo.ts` | CEO Dashboard type contracts -- FinancialSummary, RevenueBreakdown, UnitEconomics, and all CEO panel interfaces |
| `developer.ts` | Developer Hub types -- PropsTableEntry, ComponentMeta, ComponentPageData for component documentation |
| `3d-lab.ts` | 3D Lab types -- HotspotType, PanelMode, ComplianceState, ExploreMode, scene and module interfaces |
| `tools.ts` | Calculator tool types -- FloorTilesInput/Result, LotPlotter, WallPaint interfaces |
| `bun-test.d.ts` | Bun test runner type declarations |
| `payrex-node.d.ts` | PayRex payment SDK type declarations |

## For AI Agents

### Working In This Directory

- **`app.ts` is the master type file** -- check here first for any domain type
- **`supabase.ts` is auto-generated** -- do not edit manually; regenerate from DATABASE_SCHEMA.sql
- **`testing.ts` owns all quiz/session mode types** -- ModeSource maps DB sources to UIMode for routing
- **`ceo.ts` owns all CEO Dashboard contracts** -- components and Server Actions must use these types, no `any`
- When adding new types, place them in the most specific file (e.g., wiki types in `wiki.ts`, developer hub types in `developer.ts`)
- If a type is used across 3+ feature areas, put it in `app.ts`
- Always export types with `export type` or `export interface`

### Common Patterns

- Union types for enums: `type TestMode = "camp" | "storm" | "chill" | ...`
- Interfaces match database table structures (consult DATABASE_SCHEMA.sql)
- Optional fields use `?` suffix, nullable fields use `| null`
- `.d.ts` files for third-party module declarations only
- `testing.ts` imports from `app.ts` -- never the reverse

## Dependencies

### Internal

- `DATABASE_SCHEMA.sql` (root) -- authoritative schema for `supabase.ts`
- `src/config/portals.ts` -- portal types reference PortalKey
- `src/components/quiz/` -- quiz components consume `testing.ts` types

<!-- MANUAL: -->
