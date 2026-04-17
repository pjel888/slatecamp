<!-- Parent: ../../../AGENTS.md -->
<!-- Generated: 2026-04-16 | Reality Refresh: 2026-04-16 -->

# r3f

<!-- REALITY-REFRESH:START -->
## 2026-04-16 Reality Refresh

**Scope:** `src/components/r3f/` subtree

**Current snapshot:** 0 directories and 9 files beneath this scope (excluding this `AGENTS.md`).

**Top local directories:** none

**Top local files:** `CanvasLoadingOverlay.tsx`, `GeometrySwitch.tsx`, `index.ts`, `LoadingProgress.tsx`, `SceneInvalidator.tsx`, `useDisposeOnUnmount.ts`, `useRegisterInvalidate.ts`, `useWebGLMemoryMonitor.ts`, `WebGLErrorBoundary.tsx`

### What agents must do here
- Inspect the consuming routes/features before changing shared UI behavior in this subtree.
- Preserve SlateCamp design-token usage, client/server boundaries, and current composition patterns.
- When components are reused across portals, note any downstream impact in docs or higher-scope `AGENTS.md` updates.

### Validation expectations
- `bun run type-check` for repo-wide TypeScript sanity when changes touch source or instructions about source behavior.
- `bun run lint` when wording implies code style/workflow claims that should match current tooling.
- Targeted path/file existence checks for every doc or route reference you add.

### Anti-laziness rule
- Do not stop at this directory listing. Open the live files that implement the behavior you are describing or changing.
- If older notes, counts, or examples elsewhere in this file drift from the live tree, prefer current code and this reality-refresh block.
- When you change structure, ownership, workflow, or key file references in this scope, update this `AGENTS.md` in the same change.
<!-- REALITY-REFRESH:END -->
