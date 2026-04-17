<!-- Parent: ../../AGENTS.md -->
<!-- Generated: 2026-04-16 | Reality Refresh: 2026-04-16 -->

# features

<!-- REALITY-REFRESH:START -->
## 2026-04-16 Reality Refresh

**Scope:** `src/features/` subtree

**Current snapshot:** 63 directories and 548 files beneath this scope (excluding this `AGENTS.md`).

**Top local directories:** `3d-lab/`, `wall-configurator/`

**Top local files:** none

### What agents must do here
- Inspect feature config, stores, components, and tests together; this subtree often spans multiple files per workflow.
- Preserve performance-sensitive patterns, especially for 3D and geometry-heavy code.
- Document feature-surface drift in `.ai` when major modules or capabilities change.

### Validation expectations
- `bun run type-check` for repo-wide TypeScript sanity when changes touch source or instructions about source behavior.
- `bun run lint` when wording implies code style/workflow claims that should match current tooling.
- Targeted path/file existence checks for every doc or route reference you add.

### Anti-laziness rule
- Do not stop at this directory listing. Open the live files that implement the behavior you are describing or changing.
- If older notes, counts, or examples elsewhere in this file drift from the live tree, prefer current code and this reality-refresh block.
- When you change structure, ownership, workflow, or key file references in this scope, update this `AGENTS.md` in the same change.
<!-- REALITY-REFRESH:END -->
