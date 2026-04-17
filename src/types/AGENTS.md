<!-- Parent: ../../AGENTS.md -->
<!-- Generated: 2026-04-16 | Reality Refresh: 2026-04-16 -->

# types

<!-- REALITY-REFRESH:START -->
## 2026-04-16 Reality Refresh

**Scope:** `src/types/` subtree

**Current snapshot:** 0 directories and 16 files beneath this scope (excluding this `AGENTS.md`).

**Top local directories:** none

**Top local files:** `3d-lab.ts`, `app.ts`, `bun-test.d.ts`, `ceo.ts`, `dashboard.ts`, `developer.ts`, `lot.ts`, `module-blueprint.ts`, `notifications.ts`, `patent.ts`

### What agents must do here
- Trace usages of shared hooks/stores/types/config/data before editing; blast radius is usually wider than the local file count suggests.
- Keep naming and data contracts synchronized with consuming app/components/lib code.
- Update docs or parent AGENTS guidance when shared primitives change meaning or scope.

### Validation expectations
- `bun run type-check` for repo-wide TypeScript sanity when changes touch source or instructions about source behavior.
- `bun run lint` when wording implies code style/workflow claims that should match current tooling.
- Targeted path/file existence checks for every doc or route reference you add.

### Anti-laziness rule
- Do not stop at this directory listing. Open the live files that implement the behavior you are describing or changing.
- If older notes, counts, or examples elsewhere in this file drift from the live tree, prefer current code and this reality-refresh block.
- When you change structure, ownership, workflow, or key file references in this scope, update this `AGENTS.md` in the same change.
<!-- REALITY-REFRESH:END -->
