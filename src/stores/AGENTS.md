<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-24 -->

# stores

## Purpose

Zustand state stores for client-side global state management. Used when state needs to be shared across multiple components without prop drilling.

## Key Files

| File | Description |
|------|-------------|
| `dev-store.ts` | Developer tools state — dev panel visibility, feature flag overrides, debug mode |
| `useLabStore.ts` | 3D Lab workspace state — active scene, camera position, module configurations, interaction state |

## For AI Agents

### Working In This Directory

- Use Zustand `create()` with arrow functions
- Keep stores focused — one store per major feature area
- Prefer Server Components + props over client stores when possible
- Only use stores for truly client-side interactive state (camera position, UI toggles, etc.)
- Never store server-fetched data in Zustand — use Server Components or React Context instead

### Common Patterns

- `create<StoreType>()((set, get) => ({ ... }))` pattern
- Selectors for performance: `useLabStore((s) => s.activeScene)`
- Actions defined inline in the store creator

## Dependencies

### External

- `zustand` — State management library

<!-- MANUAL: -->
