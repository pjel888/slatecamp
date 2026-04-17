<!-- Parent: ../../../../AGENTS.md -->
<!-- Generated: 2026-04-16 | Reality Refresh: 2026-04-16 -->

# quiz-v2

<!-- REALITY-REFRESH:START -->
## 2026-04-16 Reality Refresh

**Scope:** `src/lib/actions/quiz-v2/` subtree

**Current snapshot:** 0 directories and 26 files beneath this scope (excluding this `AGENTS.md`).

**Top local directories:** none

**Top local files:** `abandon-session.ts`, `check-generation-answer.ts`, `classify-and-store-error.ts`, `end-session.ts`, `flag-question.ts`, `generate-recommendations.ts`, `get-confidence-matrix.ts`, `get-prediction-history.ts`, `get-review-data.ts`, `get-session-questions.test.ts`

### What agents must do here
- Treat this subtree as mutation and orchestration code: verify callers, data contracts, and schema dependencies before editing.
- Keep `"use server"`, explicit error handling, and auth/permission checks intact.
- Check adjacent tests and related query/helpers before changing behavior or signatures.

### Validation expectations
- `bun run type-check` for repo-wide TypeScript sanity when changes touch source or instructions about source behavior.
- `bun run lint` when wording implies code style/workflow claims that should match current tooling.
- Targeted path/file existence checks for every doc or route reference you add.

### Anti-laziness rule
- Do not stop at this directory listing. Open the live files that implement the behavior you are describing or changing.
- If older notes, counts, or examples elsewhere in this file drift from the live tree, prefer current code and this reality-refresh block.
- When you change structure, ownership, workflow, or key file references in this scope, update this `AGENTS.md` in the same change.
<!-- REALITY-REFRESH:END -->
