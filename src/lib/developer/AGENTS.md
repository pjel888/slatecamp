<!-- Parent: ../../../AGENTS.md -->
<!-- Generated: 2026-04-16 | Reality Refresh: 2026-04-16 -->

# developer

<!-- REALITY-REFRESH:START -->
## 2026-04-16 Reality Refresh

**Scope:** `src/lib/developer/` subtree

**Current snapshot:** 0 directories and 6 files beneath this scope (excluding this `AGENTS.md`).

**Top local directories:** none

**Top local files:** `api-reference-data.ts`, `architecture-data.ts`, `changelog.ts`, `repo-metrics.ts`, `surface-registry.ts`, `tech-stack.ts`

### What agents must do here
- Inspect live call sites, tests, schema/config dependencies, and adjacent helpers before editing this logic layer.
- Preserve boundaries between pure logic, query helpers, server actions, provider integrations, and validation schemas.
- Avoid assumption-driven changes to IRT/SRS, entitlements, analytics, or payment logic without tracing actual usage.

### Validation expectations
- `bun run type-check` for repo-wide TypeScript sanity when changes touch source or instructions about source behavior.
- `bun run lint` when wording implies code style/workflow claims that should match current tooling.
- Targeted path/file existence checks for every doc or route reference you add.

### Anti-laziness rule
- Do not stop at this directory listing. Open the live files that implement the behavior you are describing or changing.
- If older notes, counts, or examples elsewhere in this file drift from the live tree, prefer current code and this reality-refresh block.
- When you change structure, ownership, workflow, or key file references in this scope, update this `AGENTS.md` in the same change.
<!-- REALITY-REFRESH:END -->
