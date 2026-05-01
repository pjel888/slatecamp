## Task Statement

Continuously improve SlateCamp's core UX, UI polish, frontend performance, data-loading reliability, accessibility, and Playwright coverage, with priority on drills/quiz/testing, wiki, 3D Lab, 3D modules, and global loading/error/empty/pending states.

## Desired Outcome

- Concrete, scoped implementation cycles that make the core learning flows feel faster, clearer, and more reliable.
- Stronger Playwright coverage for launch-critical authenticated and public flows.
- Clear route/loading/error/pending states across quiz, wiki, and 3D surfaces.
- `.ai` documentation stays aligned with current behavior and testing strategy.

## Known Facts / Evidence

- Repo is Bun + Next.js App Router (`package.json`, `src/app/**`).
- Explicit validation commands exist for typecheck, lint, build, and split Playwright lanes (`package.json`, `.ai/00_system/VALIDATION_MATRIX.md`).
- Current browser suites cover public smoke, demo-auth core, restricted-role, portals, and 3D route smoke (`e2e/*.spec.ts`).
- `/dashboard/drills` is server-rendered and already parallelizes several reads into `ReviewHub`, but still performs a serial `current_discipline_id` fetch before the taxonomy query (`src/app/dashboard/drills/page.tsx`).
- Quiz setup is client-driven after server taxonomy fetch; start flow has explicit phase states but still uses full-screen loader fallback for create/navigate (`src/app/quiz/[mode]/setup/page.tsx`, `src/app/quiz/[mode]/setup/client.tsx`).
- Quiz session page preloads the first question window server-side and background-fetches the remainder client-side (`src/app/quiz/[mode]/session/[sessionId]/page.tsx`, `src/components/quiz-v2/StandardQuizShell.tsx`).
- Wiki article page already removed the main secondary-data waterfall, but still performs a separate late `createClient()` query inside `getRelatedTopics()` and depends on layout/sidebar hydration complexity (`src/app/dashboard/wiki/[slug]/page.tsx`, `.ai/10_state/cleanup-candidate-index.md`).
- Wiki landing page is static content with no data fetch, but `.ai` still tracks it as an unnecessary client/server-boundary opportunity from an older pass (`src/app/dashboard/wiki/page.tsx`, `.ai/10_state/cleanup-candidate-index.md`).
- 3D Lab route has loading and error boundaries; module loading is client-side in `ModuleViewer`, and shell/runtime work remains concentrated in `ViewportShell`, overlay projection, and legacy store bridges (`src/app/dashboard/3d-lab/**`, `src/features/3d-lab/components/**`, `.ai/10_state/findings-register.md`).
- Current worktree already contains uncommitted improvements around restricted-role demo auth, 3D overlay churn, shared module path resolution, and lighter 3D route shell behavior (`git status --short`).

## Constraints

- Planning gate is active because `$ralplan` was explicitly invoked and preserved over simultaneous execution keywords.
- Do not implement until the consensus plan/test-shape handoff is complete.
- Do not use destructive git commands or revert unrelated local changes.
- Must keep `.ai` aligned when behavior, route/state handling, testing strategy, or architecture changes.
- Must use repo scripts and Bun command contract rather than inventing commands.
- Must run GitNexus impact analysis before editing symbols during implementation; MCP surface is not currently exposed, so CLI fallback may be required.

## Unknowns / Open Questions

- Which core flow yields the highest ROI first after planning: drill hub data-path tightening, quiz setup/pending-state polish, wiki sidebar/taxonomy path consolidation, or deeper 3D viewport/runtime cuts.
- Whether there are existing hidden auth/demo test fixtures for a true end-to-end quiz happy path beyond the current route/access smoke.
- Whether `preserveDrawingBuffer` can be selectively removed from more 3D paths without breaking current screenshot/export expectations.
- Whether the stale `.ai` readiness claim that drills/quiz are "READY FOR PRODUCTION DEPLOYMENT" should be narrowed once the current route/test gaps are reconciled.

## Likely Codebase Touchpoints

- `src/app/dashboard/drills/**`
- `src/app/quiz/**`
- `src/components/testing/hub/**`
- `src/components/quiz-v2/**`
- `src/stores/useQuizStore.ts`
- `src/app/dashboard/wiki/**`
- `src/components/wiki/**`
- `src/lib/actions/wiki-actions.ts`
- `src/lib/actions/cached-queries.ts`
- `src/app/dashboard/3d-lab/**`
- `src/features/3d-lab/**`
- `e2e/*.spec.ts`
- `.ai/00_system/VALIDATION_MATRIX.md`
- Relevant `.ai/00_performance`, `.ai/04_tasks`, and `.ai/10_state` docs
