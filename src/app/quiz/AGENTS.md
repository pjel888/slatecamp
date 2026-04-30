<!-- Parent: ../../../AGENTS.md -->
<!-- Generated: 2026-04-16 | Reality Refresh: 2026-04-30 -->

# quiz

<!-- REALITY-REFRESH:START -->
## 2026-04-30 Reality Refresh

**Scope:** `src/app/quiz/` subtree

**Current snapshot:** 12 directories and 20 files beneath this scope (excluding this `AGENTS.md`).

**Top local directories:** `[mode]/`, `_components/`, `session/`, `sessions/`

**Top local files:** `layout.tsx`, `loading.tsx`, `page.tsx`; canonical route helpers live in `_components/QuizSessionRoute.tsx` and `_components/QuizResultsRoute.tsx`

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

### 2026-04-30 route ownership note
- `/quiz` is the canonical quiz hub and owns the standard configurable quiz.
- `/quiz/session/[sessionId]`, `/quiz/session/[sessionId]/results`, and `/quiz/session/[sessionId]/review` are canonical session URLs.
- `/quiz/[mode]/setup` remains only for special/focused compatibility flows; general mode setup routes redirect to `/quiz`.
