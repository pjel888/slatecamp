<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-25 -->

# stores

## Purpose

Zustand state stores for client-side global state management. Used when state needs to be shared across multiple components without prop drilling.

## Key Files

| File | Description |
|------|-------------|
| `dev-store.ts` | Developer tools state -- dev panel visibility, feature flag overrides, debug mode, impersonation presets (architecture student, pro subscriber, org admin, etc.), persisted to localStorage via zustand/persist |
| `useLabStore.ts` | 3D Lab workspace state -- active hotspot, panel mode, visited/answered/correct tracking sets, explore mode (guided/free), parametric values, compliance state, camera position, quiz results |

## For AI Agents

### Working In This Directory

- Use Zustand `create()` with arrow functions
- Keep stores focused -- one store per major feature area
- Prefer Server Components + props over client stores when possible
- Only use stores for truly client-side interactive state (camera position, UI toggles, etc.)
- Never store server-fetched data in Zustand -- use Server Components or React Context instead
- `dev-store.ts` uses `zustand/persist` with `createJSONStorage` for localStorage persistence

### Common Patterns

- `create<StoreType>()((set, get) => ({ ... }))` pattern
- Selectors for performance: `useLabStore((s) => s.activeScene)`
- Actions defined inline in the store creator
- `Set<string>` for tracking collections (visited, answered, correct IDs)
- Impersonation presets in dev-store define role/tier/userType combos for testing

## Dependencies

### Internal

- `src/types/3d-lab.ts` -- PanelMode, ExploreMode, ComplianceState, QuizResult types
- `src/types/app.ts` -- UserTier, UserType, OrgMemberRole types
- `src/config/feature-flags.ts` -- FeatureFlagKey type for dev overrides

### External

- `zustand` -- State management library
- `zustand/middleware` -- persist, createJSONStorage

<!-- MANUAL: -->
