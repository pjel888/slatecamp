<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-02 | Updated: 2026-04-02 -->

# wall-configurator

## Purpose

A 7-step interactive wall construction configurator for the 3D Lab. Users select a core wall type (CHB, drywall), define geometry (height, length, thickness), specify openings (doors, windows), configure sides (interior/exterior), choose treatments (plaster, paint, tile), pick finish materials, and view a Bill of Materials (BOM). All calculations are handled by pure engine functions with no side effects.

## Key Files

| File | Description |
|------|-------------|
| `components/WallConfigurator.tsx` | Root configurator component — orchestrates the 7-step wizard flow |
| `components/AreaSummaryBar.tsx` | Real-time area summary display during configuration |
| `engine/index.ts` | Barrel export for all calculation engines |
| `engine/constants.ts` | Material constants, pricing data, standard dimensions |
| `engine/geometry.engine.ts` | Wall geometry calculations — area, perimeter, net area after openings |
| `engine/chb.engine.ts` | Concrete Hollow Block engine — block count, mortar volume, rebar requirements |
| `engine/drywall.engine.ts` | Drywall engine — board count, framing, fasteners, joint compound |
| `engine/plaster.engine.ts` | Plaster engine — mix ratios, coverage, material quantities |
| `engine/paint.engine.ts` | Paint engine — coverage area, coats, liters needed |
| `engine/tile.engine.ts` | Tile engine — tile count, adhesive, grout, wastage factor |
| `engine/packaging.engine.ts` | Packaging engine — rounds up material quantities to purchasable units |
| `hooks/useWallComputation.ts` | React hook bridging store state to engine computations |
| `store/useWallConfigStore.ts` | Zustand store for wall configuration state (steps, selections, geometry) |
| `store/layer-defaults.ts` | Default layer configurations per wall type |
| `types/wall.types.ts` | TypeScript definitions for wall config, materials, BOM items |
| `__tests__/engine-validation.test.ts` | Unit tests for engine calculation accuracy |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `components/` | UI components for the configurator wizard |
| `components/steps/` | Step-specific components (Step1CoreSelect through Step7BOM) |
| `engine/` | Pure calculation engines — no side effects, easily testable |
| `hooks/` | React hooks for bridging store to engine |
| `store/` | Zustand state management for configurator |
| `types/` | TypeScript type definitions |
| `__tests__/` | Unit tests for engine validation |

## For AI Agents

### Working In This Directory
- **Engine functions are pure** — they take input parameters and return computed results with no side effects or database access
- **7-step wizard flow**: CoreSelect → Geometry → Openings → Sides → Treatment → Finish → BOM
- **All calculations use Philippine construction standards** — material sizes, pricing in PHP, local building practices
- **Zustand store** (`useWallConfigStore`) holds all wizard state — steps navigate by updating store
- **Hook pattern**: `useWallComputation` reads store state and calls engine functions reactively
- **Constants** in `engine/constants.ts` define material specs — update here for pricing/dimension changes

### Testing Requirements
- Run `bun test src/features/wall-configurator/__tests__/` for engine validation
- All engine functions must be testable without React — they're pure functions
- Test edge cases: zero-area walls, maximum openings, unusual dimensions

## Dependencies

### Internal
- `@/components/ui/*` — shadcn/ui primitives for wizard UI
- `@/stores/useLabStore` — Parent 3D Lab state (module context)
- `@/types/3d-lab` — Module configuration types

### External
- `zustand` — State management for wizard flow
- `react` — Component rendering
- `lucide-react` — Step icons

<!-- MANUAL: -->
