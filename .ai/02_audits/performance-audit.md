# Performance Audit

## Scope

- `src/`
- `next.config.ts`
- client/runtime surface breadth
- structural performance risk signals

## Linked findings

- `PERF-001`
- `PERF-002`
- `PERF-003`
- `ARC-001`
- `CQ-001`

## Observed

- the shared 3D viewport currently keeps screenshot-readback support on by default
- the admin content index fetches heavier payloads than its list use case requires
- 677 files under `src/` declare `use client`
- 441 `useEffect` matches were found across `src/`
- 98 `Promise.all` matches were found across `src/`

## Material finding

### `PERF-001` Permanent screenshot-readback cost in the shared 3D viewport

Observed in:
- `src/features/3d-lab/components/shell/LabViewportFrame.tsx`
- `src/features/3d-lab/hooks/useViewportShortcuts.ts`
- `src/features/3d-lab/components/shell/SceneToolbar.tsx`
- `src/features/3d-lab/components/shell/ViewportContextMenu.tsx`

Impact:
- every 3D module pays the rendering cost of screenshot support even when capture is unused

### `PERF-002` Admin content index overfetch

Observed in:
- `src/app/admin/knowledge/page.tsx`
- `src/lib/actions/admin/content.ts`
- `src/components/admin/unified-editor/ContentEditorIndex.tsx`

Impact:
- unnecessary query cost, serialization weight, and client memory pressure before record-level editing

### `PERF-003` Broad client-heavy surface for a server-first codebase

Root cause:
- interactive/admin/3D feature growth has outpaced server-first enforcement and decomposition

Impact:
- likely bundle and hydration pressure
- more rerender complexity in already-large UI surfaces
- harder performance debugging because hotspots are concentrated in monoliths

## Supporting evidence

- `src/components/admin/unified-editor/QuestionsPanel.tsx`
- `src/stores/useQuizStore.ts`
- `src/features/3d-lab/config/modules/08-vertical/stairway-configurator.ts`
- `src/features/3d-lab/config/modules/08-vertical/stairway-computation.ts`

## Unknown

- Exact bundle splits and runtime trace hotspots
- Which client-heavy surfaces are unavoidable versus legacy carryover
