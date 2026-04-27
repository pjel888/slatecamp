# 2026-04-26 Core Learning Lane Log

## Scope

- `src/lib/demo/*`
- `src/components/quiz-v2/*`
- `e2e/*`
- `scripts/playwright-run.ts`
- `.omx/context/*`
- `.omx/plans/*`
- `.ai/00_system/VALIDATION_MATRIX.md`

## What changed

1. Added planning artifacts for the autonomous core-learning lane:
   - `.omx/context/slatecamp-core-ux-performance-20260426T012113Z.md`
   - `.omx/plans/prd-slatecamp-core-ux-performance.md`
   - `.omx/plans/test-spec-slatecamp-core-ux-performance.md`
   - `.omx/plans/core-ux-performance-testing-improvements.md`
2. Rebuilt the demo fixture layer in `src/lib/demo/data.ts` so demo-auth has deterministic quiz/wiki seed data:
   - seeded discipline, taxonomy, wiki article slug `demo-ale-foundations`, quiz questions, mastery, and readiness rows
3. Rebuilt `src/lib/demo/mock-supabase.ts` so the no-secret mock store is durable across reads/writes:
   - persistent in-memory rows
   - table-specific primary-key generation
   - minimal RPC support for quiz interaction stats and wiki article resolution
4. Added a new Playwright lane:
   - `bun run test:e2e:auth-demo:learning`
   - wired through `scripts/playwright-run.ts`
5. Added first-pass browser coverage:
   - `e2e/learning-flow.spec.ts`
   - `e2e/wiki-learning.spec.ts`
6. Improved `SlideToSubmit` accessibility in `src/components/quiz-v2/SlideToSubmit.tsx`:
   - keyboard activation with `Enter` / `Space`
   - focusable slider root
   - `aria-disabled`
7. Removed the `StandardQuizShell` null fallthrough so `BaseQuizShell` can keep showing its built-in skeleton state.
8. Hardened additional Phase 1 quiz/results contract surfaces:
   - `src/components/quiz-v2/results/ConfidenceMatrix.tsx` no longer exposes the unsupported confidence follow-up deep link
   - `src/hooks/useQuizShellHandlers.ts` now guards the final submit path from repeated trigger attempts
   - `src/components/quiz-v2/SubmitConfirmModal.tsx` and `src/components/quiz-v2/BaseQuizShell.tsx` now reflect submit-finalizing state in the modal CTA
   - `src/app/quiz/[mode]/setup/page.tsx` and `src/app/quiz/[mode]/setup/client.tsx` now pass real readiness into setup flows
   - `src/lib/actions/quiz-v2/start-session.ts` now supports direct question-id launches for the missed-questions follow-up path
   - `src/components/testing/hub/HeroConfigurator.tsx` now abandons a ready-but-never-entered session when the user cancels
9. Tightened wiki and 3D route/runtime surfaces:
   - `src/app/dashboard/wiki/[slug]/page.tsx` now passes `disciplineId` into `WikiHeader`, which lets the mobile wiki drawer preload server-side sidebar nodes
   - `src/features/3d-lab/components/shell/LabViewportFrame.tsx` now shows a visible in-canvas fallback instead of a blank template handoff
   - `e2e/authenticated-demo-3d-lab.spec.ts` now covers the invalid-module not-found path in addition to the root lab route
10. Added targeted automated proof for the remaining quiz/drill contract items:
   - `e2e/learning-flow.spec.ts` now proves canceling a ready-but-unentered session does not create a resume CTA
   - `src/lib/actions/quiz-v2/start-session.test.ts` now proves direct question-id launches bypass taxonomy routing
11. Removed the extra wiki article related-topics DB query:
   - `src/app/dashboard/wiki/[slug]/page.tsx` now derives related topics from the cached discipline tree rather than a fresh `createClient()` taxonomy query
12. Added visible in-canvas 3D template fallback and browser proof:
   - `src/features/3d-lab/components/shell/LabViewportFrame.tsx`
   - `e2e/authenticated-demo-3d-lab.spec.ts`
13. Made the shared 3D screenshot/performance decision explicit:
   - shared `LabViewportFrame` no longer uses global `preserveDrawingBuffer: true`
   - shared screenshot affordances in `useViewportShortcuts`, `SceneToolbar`, and `ViewportContextMenu` now surface a toast instead of pretending capture still works on the shared frame
14. Added direct wiki fetch-gate proof:
   - `src/components/wiki/navigation/WikiSidebar.tsx` now exposes `shouldFetchClientTaxonomy`
   - `src/components/wiki/navigation/WikiSidebar.test.ts` proves that server-fed `initialNodes` skip the client taxonomy fetch path
15. Removed the demo-auth quiz-answer RPC fallback from the mock lane:
   - `src/lib/demo/mock-supabase.ts` now implements `submit_quiz_answer_v2` against the in-memory store
   - `e2e/wiki-learning.spec.ts` now asserts seeded article resolution through stable center-pane content instead of the more brittle exact paragraph node match
16. Tightened the next shared UX risks after the release lane went green:
   - `src/features/3d-lab/components/shell/LabBrowserShell.tsx` now exports a visible browser loading state
   - `src/app/dashboard/3d-lab/page.tsx` no longer uses a `fallback={null}` handoff
   - `src/features/3d-lab/components/LabBrowser.tsx` now uses local transition pending state for category/back navigation
   - `src/app/dashboard/3d-lab/[moduleId]/loading.tsx` adds a route-level module loading surface
   - `e2e/authenticated-demo-3d-lab.spec.ts` now covers a real visible module route (`stairway-configurator`)
   - `src/components/dashboard/DailyDoseCard.tsx` now awaits the start mutation before navigation, disables the branch while pending, restores a real time-budget picker, and removes the misleading fake progress stepper

## Validation run

- `bun run type-check` — passed after the fixture/mock/test changes
- `bun run validate:release` — passed on the corrected tree
- `bun run test:e2e:auth-demo:learning` — passed
- `bun run test:e2e:auth-demo:restricted` — passed
- `bun run test:e2e:auth-demo:portals` — passed after updating the stale `/admin/knowledge` assertion to the seeded populated-state copy
- `bun test src/lib/actions/quiz-v2/submit-answer.test.ts` — passed
- `bun test src/lib/actions/quiz-v2/start-session.test.ts` — passed
- `bun run test:e2e:auth-demo:3d-lab` — passed
- `bun test src/components/wiki/navigation/WikiSidebar.test.ts` — passed
- `bun run build` — passed after removing the Edge-runtime `crypto` import from the demo mock
- `bun run test:e2e:auth-demo` — passed after updating the stale onboarding/settings expectations
- `bun run lint` — still warning-only, now `344` warnings (down from the earlier `354`)
- `git diff --check` — passed
- final targeted rerun after the mock RPC change:
  - `bun run type-check` — passed
  - `bun run test:e2e:auth-demo:learning` — passed
  - `/tmp/slatecamp-auth-demo-learning.log` contains no `[submitAnswer] RPC failed` fallback warning
- final targeted reruns after the 3D Lab / Daily Dose follow-up fixes:
  - `bun run type-check` — passed
  - `bun run build` — passed
  - `bun run test:e2e:auth-demo` — passed when rerun cleanly outside the concurrent build/dev-server contention case
  - `bun run test:e2e:auth-demo:3d-lab` — passed with root route, visible module route, and invalid-slug route coverage
  - `git diff --check` — passed

## Current green evidence

1. `e2e/learning-flow.spec.ts`
   - drills hub launches a seeded `custom` session
   - keyboard-accessible `SlideToSubmit` path works for both launch and answer submission
   - one real answer submission succeeds through the demo-auth lane
2. `e2e/wiki-learning.spec.ts`
   - seeded wiki landing route resolves
   - seeded article slug `demo-ale-foundations` resolves
   - missing wiki slug resolves to the dashboard not-found UI
3. `e2e/authenticated-demo-portals.spec.ts`
   - authenticated demo admin, developer, and CEO routes resolve on seeded data
   - `/admin/knowledge` now validates against the real populated browser state rather than the superseded empty-state copy
4. demo-auth quiz submission now runs through the mock RPC contract cleanly
   - the seeded learning rerun produced no `submit_quiz_answer_v2` / fallback warning in the captured log
5. `e2e/authenticated-demo-3d-lab.spec.ts`
   - `/dashboard/3d-lab` resolves with a visible browser surface
   - `/dashboard/3d-lab/stairway-configurator` resolves as a real visible module route
   - invalid slugs still resolve to the dashboard not-found UI
6. `src/components/dashboard/DailyDoseCard.tsx`
   - the primary CTA is now one-shot from click through navigation
   - the adjust-time branch is a real quick-select control again instead of placeholder copy
   - the misleading always-zero progress stepper has been removed pending real per-activity completion data

## Known risks / follow-ups

- The next concrete app-side branch is:
  1. broaden into shared route-state normalization now that the release aggregate and the next UX-risk branches are green again
  2. clean up warning-only lint debt in touched/shared surfaces when that becomes the highest-value branch
  3. if durable `omx team` execution is still desired, commit or stash the current worktree first because `omx team` refuses to launch worktree-backed workers from a dirty leader workspace

## Discrepancies found

- Before this run, `.ai/00_system/VALIDATION_MATRIX.md` had no learning-lane entry because the lane did not exist.
- Before this run, the demo fixture layer was too thin for real quiz/wiki browser coverage and the mock store did not persist inserts, so route-only demo-auth smoke could pass while learning flows could not.
- Before the final rerun, `e2e/authenticated-demo-portals.spec.ts` still expected the old empty-state `/admin/knowledge` copy even though the seeded demo now serves a populated knowledge browser.
- Before the final Daily Dose follow-up, `DailyDoseCard` still had a placeholder time-picker branch and a misleading always-zero progress stepper despite shipping a study-plan CTA on the main dashboard.
