# SlateCamp Core UX / Performance / Testing Improvements

## Principles

1. Protect launch-critical user flows first: a user must be able to start, continue, and recover a drill/quiz session before secondary optimization work ships.
2. Remove avoidable waterfalls before adding new abstractions: prefer collapsing serial Supabase/action work inside existing route boundaries over introducing new data layers.
3. Keep server/client boundaries stable: preserve App Router server-rendered routes and move only the minimum client-side state needed for resilient interaction.
4. Standardize state semantics, not just visuals: loading, error, empty, pending, and disabled states should expose consistent behavior and copy across routes.
5. Add browser coverage for launch paths before deeper refactors: lock the quiz/drill happy path and targeted 3D/wiki regressions before broad cleanup.

## Decision Drivers

1. Session launch reliability: `src/app/quiz/[mode]/setup/client.tsx` and `src/components/quiz-v2/StandardQuizShell.tsx` sit directly on the highest-value flow and currently have state-transition fragility.
2. Data-fetch latency and shell cost: `src/app/dashboard/drills/page.tsx` and `src/app/dashboard/wiki/[slug]/page.tsx` already parallelize some work but still leave avoidable serial or duplicated fetch paths.
3. Coverage gap vs. existing risk: Playwright exists (`bun run test:e2e*`) but current repo guidance explicitly says it is not full authenticated-flow QA, and there is no drill/quiz launch happy-path protection yet.

## Viable Options

### Option A — Flow-first hardening, then shared-state cleanup

**Shape**
- Fix drill/quiz launch and hydration resilience first.
- Add Playwright happy-path coverage immediately after.
- Then optimize wiki and 3D runtime cost.
- Finish with shared loading/error/empty/pending/button-state normalization.

**Pros**
- Reduces launch-risk fastest.
- Establishes regression coverage before broader UI cleanup.
- Keeps the most user-visible failures from being masked by later refactors.

**Cons**
- Shared-state cleanup lands later, so some duplicated UX patterns remain during early phases.
- Wiki/3D wins arrive after quiz/drill stabilization.

### Option B — Shared-state foundation first, then route/runtime optimization

**Shape**
- Unify global state primitives first (`Button`, empty/loading/error patterns).
- Then refactor drills/wiki/3D and finally add end-to-end flow coverage.

**Pros**
- Creates a single UI vocabulary early.
- Could reduce repeated route-level state tweaks later.

**Cons**
- Delays protection for the most fragile drill/quiz flow.
- Risks a broad diff before high-risk behavior is locked with browser coverage.
- Shared-state work alone does not remove existing route waterfalls or hydration null states.

### Option C — Performance-first on all server/runtime surfaces, testing last

**Shape**
- Attack drills, wiki, and 3D runtime/data cost in one performance wave.
- Add testing after performance targets are met.

**Pros**
- Front-loads latency work.
- Useful if perf regressions are the only priority.

**Cons**
- Weakest choice for current repo risk because it leaves session-launch regressions unprotected.
- Larger simultaneous blast radius across App Router and 3D surfaces.

## Chosen Direction

Choose **Option A**.

It matches the repo’s current risk profile:
- `src/app/dashboard/drills/page.tsx` still blocks `taxonomy_tree` on a separate `user_global_stats` lookup.
- `src/app/quiz/[mode]/setup/client.tsx` has explicit `setup -> creating -> prediction -> navigating` phases that should be validated as one flow.
- `src/components/quiz-v2/StandardQuizShell.tsx` can render `null` after initialization if `currentQuestion` is absent, which is a bad failure mode for a live session.
- `src/app/dashboard/wiki/[slug]/page.tsx` already improved parallelism, so it is a good second-wave optimization rather than the first blocker.
- `src/features/3d-lab/components/ModuleViewer.tsx` and `src/features/3d-lab/components/shell/ViewportShell.tsx` are deeper runtime optimization surfaces and should be addressed after flow protection exists.
- However, autonomous proof is blocked until the no-secret fixture lane is real: current demo tables for taxonomy, global stats, and wiki articles are empty, so quiz/wiki happy paths need a Phase 0 enablement step first.

## Phased Implementation Order

### Phase 0 — No-secret fixture and runner enablement

**Targets**
- `src/lib/demo/*`
- `scripts/playwright-run.ts`
- `e2e/support/*`

**Work**
- Seed enough deterministic quiz data for the supported happy-path launch mode: `/dashboard/drills` -> `custom`.
- Seed enough deterministic wiki data for the supported article slug: `demo-ale-foundations`.
- Expose the runner path explicitly through the existing Playwright command surface as `bun run test:e2e:auth-demo:learning`.

### Phase 1 — Drill / Quiz launch hardening

**Targets**
- `src/app/dashboard/drills/page.tsx`
- `src/app/quiz/[mode]/setup/client.tsx`
- `src/components/quiz-v2/StandardQuizShell.tsx`
- supporting session route/store/action files discovered during implementation

**Work**
- Fix contract-level flow bugs before smaller route optimizations:
  - reconcile `Practice Missed Questions` with the actual `startSession` topic/question contract
  - either implement or narrow the confidence-matrix review shortcut path for the current query-param shape
  - prevent or deliberately recover from orphan `in_progress` sessions created by the drills configurator before entry
  - add an explicit in-flight guard to the final-submit path
  - pass real readiness into pressure-level setup where it is currently defaulting to `0`
- Remove the avoidable serial discipline lookup in drills by collapsing the discipline-dependent subject fetch into a single server-side data path or one round-trip strategy.
- Harden setup-phase transitions so `creating`, `prediction`, and `navigating` cannot strand the user in an ambiguous state after `startSession`.
- Replace the `currentQuestion` null fallthrough in `StandardQuizShell` with a recoverable state: deterministic loader, guarded re-fetch/recovery, or explicit session failure UI.
- Audit the session page/store hydration path so “initialized but no current question” becomes observable and testable instead of silently blank.

### Phase 2 — Browser coverage for launch-critical flows

**Targets**
- `e2e/` authenticated demo coverage
- Playwright fixtures/helpers as needed

**Work**
- Add a drill/quiz happy-path spec that covers: enter drills/testing surface, start a session, land in session UI, answer at least one question, and verify session progression.
- Cover at least one prediction-capable mode so the `prediction` phase in setup is exercised.
- Add a regression assertion for the “blank shell after hydration” failure mode.
- Pin one seeded wiki article success path in the same no-secret lane or a sibling lane: `/dashboard/wiki/demo-ale-foundations`.

### Phase 3 — Wiki route/data-loading simplification

**Targets**
- `src/app/dashboard/wiki/[slug]/page.tsx`
- `src/app/dashboard/wiki/layout.tsx`
- sidebar/layout data helpers used by `WikiLayoutContent`

**Work**
- Fold `getRelatedTopics()` into the existing cached/query path so article detail data does not spin up a separate `createClient()` query for sibling-like taxonomy data.
- Review layout/sidebar loader boundaries to reduce duplicated suspense work between article content and layout shell.
- Preserve current secondary-data parallelism while simplifying the shell dependency chain.

### Phase 4 — 3D Lab runtime and shell-cost reduction

**Targets**
- `src/app/dashboard/3d-lab/[moduleId]/page.tsx`
- `src/features/3d-lab/components/ModuleViewer.tsx`
- `src/features/3d-lab/components/shell/ViewportShell.tsx`
- module-specific runtime surfaces discovered in `LabViewport`/template content

**Work**
- Reduce repeated shell work on module load: isolate what truly belongs in `ModuleViewer` versus what can be lazy/conditional lower in the tree.
- Profile and trim unnecessary store subscriptions or shell-wide rerenders inside `ViewportShell`.
- Keep existing loading/error boundaries, but reduce time-to-interaction and overlay churn inside the runtime path.
- Remove or visibly cover the current template-renderer blank gap where route/module loading hands off to `fallback={null}`.

### Phase 5 — Global state normalization

**Targets**
- `src/components/ui/button.tsx`
- `src/components/shared/empty-state.tsx`
- route-level `loading.tsx`, `error.tsx`, and pending/action surfaces touched in prior phases

**Work**
- Standardize pending semantics for async actions and route transitions so buttons, loaders, and errors communicate one state model.
- Establish a small, reusable contract for loading/error/empty/pending states that route surfaces can adopt without broad visual redesign.
- Normalize copy and fallback behavior across drills, wiki, quiz, and 3D entry points.

## Acceptance Criteria

### Phase 1
- No-secret fixtures exist for one real quiz happy path and one real wiki article path.
- Result-surface shortcut CTAs are truthful and supported by the session contract.
- Pre-entry cancel/close behavior from the drills configurator does not silently leak orphan sessions.
- Drills surfaces intentionally resume a single active session rather than allowing ambiguous active-session multiplication.
- Final submit cannot be retriggered while end-of-session work is pending.
- Drills page no longer requires a separate blocking discipline fetch before starting the core parallel workload.
- Quiz setup never leaves the user in a silent dead-end between `creating`, `prediction`, and `navigating`.
- Active quiz session never renders a blank shell because `currentQuestion` is absent; the user sees either recoverable loading, recoverable retry, or explicit failure UI.

### Phase 2
- `bun run test:e2e:auth-demo:learning` launches a `custom` drill/quiz session and reaches an interactive question state.
- The new spec fails on blank/absent question-shell regressions.
- The new flow is runnable with existing Bun/Playwright scripts and does not depend on ad hoc manual setup.

### Phase 3
- Wiki article page no longer performs a standalone `createClient()` fetch just for related topics when the same data can be served from the main article/taxonomy path.
- Wiki layout/article shell avoids duplicated or unnecessary suspense-induced loading complexity.
- Article render, sidebar render, and sibling navigation still work for a real slug path.

### Phase 4
- 3D Lab module route keeps current access/loading/error behavior while reducing shell/runtime overhead in `ModuleViewer`/`ViewportShell`.
- Touched template/module routes do not fall through from the outer loading shell into a blank renderer gap.
- The branch makes and implements an explicit decision on the shared `preserveDrawingBuffer` cost instead of leaving it implicit.
- At least one real authenticated 3D Lab path remains covered by existing or extended demo-auth Playwright coverage, including `/dashboard/3d-lab/not-a-real-module`.
- No regression to onboarding/context-card display or module access gating.

### Phase 5
- Buttons expose consistent pending/disabled/busy behavior on async actions.
- Empty/loading/error states across the four priority surfaces use a consistent contract and no longer rely on silent `null` fallthroughs.
- Shared-state normalization does not widen the blast radius beyond the touched UX surfaces.

## Validation Commands

Run these in sequence as phases land:

1. `bun run type-check`
2. `bun run lint`
3. `bun run test:e2e:auth-demo:learning`
4. `bun run test:e2e:auth-demo:3d-lab`
5. `bun run test:e2e:smoke`

Targeted additions during implementation:

- Run the new drill/quiz Playwright spec directly during development, then through `bun run test:e2e:auth-demo` once integrated.
- If route/runtime changes materially affect shipped behavior, add `bun run build` after the type/lint pass, but treat build output carefully because the repo validation matrix warns the Bun bootstrap path is not a perfect health signal.

## Available Agent Types Roster

- `planner` — sequencing, handoff control, acceptance criteria
- `explore` — repo lookup, symbol/file mapping, impact surface discovery
- `architect` — route/data/runtime tradeoffs before refactors
- `executor` — primary implementation lane
- `debugger` — hydration, race, and state-transition failures
- `test-engineer` — Playwright and regression-test strategy
- `verifier` — completion evidence, acceptance-gate review
- `code-reviewer` — post-implementation risk review
- `security-reviewer` — auth/access-boundary review if session or entitlement flows widen
- `designer` — state-pattern consistency if shared UX contracts expand
- `critic` — challenge broad refactor proposals before they spread beyond scope
- `team-executor` — conservative shared-lane delivery when multiple workers need tighter control

## Staffing Guidance

### Ralph execution path

**Recommended shape**
- Single owner: `executor`
- Embedded support at checkpoints: `explore`, `debugger`, `test-engineer`, `verifier`

**Lane order**
1. `explore` maps exact drill/quiz/wiki/3D supporting files.
2. `executor` completes Phase 1 and Phase 2 together.
3. `debugger` engages only if hydration/session state remains nondeterministic.
4. `executor` completes Phase 3 and Phase 4.
5. `executor` finishes Phase 5 with the smallest possible shared-UI diff.
6. `verifier` checks acceptance criteria and validation evidence.

**Suggested reasoning levels**
- `executor`: high
- `explore`: low
- `debugger`: high
- `test-engineer`: medium
- `verifier`: high

**Launch hints**
- Keep Ralph on a narrow branch: Phase 1 + 2 first, then re-evaluate blast radius before Phase 5.
- Do not start global state normalization until drill/quiz launch coverage is green.

### Team execution path

**Recommended staffing**
- Lead: `planner` or `team-executor`
- Lane 1: `executor` for drills/quiz flow hardening
- Lane 2: `test-engineer` for Playwright happy-path coverage
- Lane 3: `executor` or `architect` for wiki data/shell simplification
- Lane 4: `executor` with 3D focus for `ModuleViewer` / `ViewportShell`
- Lane 5: `verifier` for cross-lane acceptance and regression review

**Ownership split**
- Lane 1 owns `src/app/dashboard/drills/*`, `src/app/quiz/*`, `src/components/quiz-v2/*`, and directly related store/action files.
- Lane 2 owns `e2e/*`, Playwright helpers, and test runner wiring.
- Lane 3 owns `src/app/dashboard/wiki/*` plus directly related wiki loaders/helpers.
- Lane 4 owns `src/app/dashboard/3d-lab/*` and `src/features/3d-lab/*`.
- Lane 5 stays read-only until verification and integration review.

**Suggested reasoning levels**
- Lead: medium
- Drill/quiz executor: high
- Test engineer: medium
- Wiki lane: medium
- 3D lane: high
- Verifier: high

**Launch hints**
- Start Lane 1 and Lane 2 together.
- Start Lane 3 in parallel once Lane 1 confirms no shared session-store edits are needed there.
- Start Lane 4 in parallel only after the team agrees the first release slice is not blocked on deeper 3D runtime work.
- Hold Phase 5 for the lead/integration lane after the behavior-heavy lanes stabilize.

**Team verification path**
- Lane 2 proves the session-launch path.
- Lane 5 validates acceptance criteria against live diffs and command output.
- Lead rejects broad shared-UI cleanup if it is not justified by concrete inconsistencies found in Phases 1-4.

## Scope Summary

- 5 implementation phases across roughly 12-16 likely files, plus Playwright specs/helpers
- Estimated complexity: HIGH
- Highest-risk surfaces: quiz session hydration/recovery, authenticated flow coverage, shared-state blast radius
