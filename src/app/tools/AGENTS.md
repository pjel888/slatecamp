<!-- Parent: ../../../AGENTS.md -->
<!-- Generated: 2026-04-16 | Reality Refresh: 2026-04-16 -->

# tools

<!-- REALITY-REFRESH:START -->
## 2026-04-16 Reality Refresh

**Scope:** `src/app/tools/` subtree

**Current snapshot:** 7 route directories and 15 files beneath this scope (excluding this `AGENTS.md`).

**Top local directories:** `chb/`, `drywall/`, `floor-tiles-calculator/`, `flooring/`, `lot-plotter/`, `paint/`, `wall-paint-calculator/`

**Top local files:** `loading.tsx`, `page.tsx`; material-estimating routes render shared calculator shells from `src/components/calculators/`.

### What agents must do here
- Inspect route groups, `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, and any `route.ts` handlers in this subtree before editing.
- Preserve server-component defaults, auth/portal boundaries, and route-level loading/error behavior.
- Cross-check UI/route changes against the matching components, server actions, and nearest portal docs in `.ai`.

### Validation expectations
- `bun run type-check` for repo-wide TypeScript sanity when changes touch source or instructions about source behavior.
- `bun run lint` when wording implies code style/workflow claims that should match current tooling.
- Targeted path/file existence checks for every doc or route reference you add.

### Anti-laziness rule
- Do not stop at this directory listing. Open the live files that implement the behavior you are describing or changing.
- If older notes, counts, or examples elsewhere in this file drift from the live tree, prefer current code and this reality-refresh block.
- When you change structure, ownership, workflow, or key file references in this scope, update this `AGENTS.md` in the same change.
<!-- REALITY-REFRESH:END -->
