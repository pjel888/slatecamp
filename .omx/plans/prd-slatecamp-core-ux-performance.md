# PRD: SlateCamp Core UX, Performance, and Test Hardening

Date: 2026-04-26
Context snapshot: `.omx/context/slatecamp-core-ux-performance-20260426T012113Z.md`
Primary surfaces: drills/quiz/testing, wiki, 3D Lab/modules, shared async states

## Problem

SlateCamp already has broad route coverage and many loading boundaries, but the core learning flows still have meaningful gaps:

- no real browser coverage for launching and entering a live drill/quiz session
- quiz session boot can fall through to a blank render path if `currentQuestion` is absent during initialization
- wiki still carries redundant client/data-loading work on article/mobile navigation paths
- 3D Lab runtime cost is reduced but not fully isolated from viewport shell churn and module lifecycle overhead
- async button, loading, error, and retry patterns are inconsistent across the most important flows

## Desired Outcome

Make the highest-value learning flows feel fast, resilient, and intentional:

- users can reliably launch, resume, submit, and finish drills without ambiguous waits or blank states
- wiki routes load with fewer redundant fetches and clear loading/error states
- 3D Lab remains isolated, lazy, graceful under failure, and cheaper while idle
- Playwright proves the main route and state transitions rather than only route access

## Principles

1. Fix user-visible core flow failures before doing broad structural cleanup.
2. Prefer server-first data loading and narrow client islands.
3. Make async states explicit, accessible, and testable.
4. Isolate heavy 3D work from non-3D routes and from idle frames.
5. Keep `.ai` and validation docs aligned with real behavior after each cycle.

## Decision Drivers

1. Launch-facing student impact on drills/quiz/testing.
2. Verification leverage: changes that can be proven in Playwright and type/build checks.
3. Tight blast radius: fixes that improve UX/perf without broad speculative refactors.

## Viable Options

### Option A — Quiz-first hardening, then wiki, then 3D

Pros:
- aligns with the core product value path
- easiest to prove with incremental browser coverage
- surfaces real regressions before deeper optimization work

Cons:
- leaves some 3D-specific perf wins for a later cycle
- does not immediately reduce all app-wide loading inconsistency

### Option B — 3D-first performance push

Pros:
- attacks the largest known technical hotspot
- may reduce some device-level cost quickly

Cons:
- lower immediate student value than quiz reliability
- higher complexity, harder validation, more branch risk

### Option C — Shared async-state/UI sweep first

Pros:
- consistent polish across routes
- could unify pending/error affordances

Cons:
- too diffuse for the current branch
- risks broad churn before the most important learning flows are proven

## Chosen Direction

Choose **Option A**.

Sequence work by product leverage:

0. no-secret fixture/data-lane readiness for autonomous quiz/wiki proof
1. drill/quiz happy-path reliability
2. real browser coverage for the supported no-secret learning flow
3. wiki article/mobile navigation data-path tightening + browser coverage
4. 3D Lab shell/runtime reductions + module route/failure coverage
5. shared pending/error/empty-state polish only where touched by the first four cycles

## Scope

### In scope

- demo fixture/data readiness required to prove quiz/wiki flows without production secrets
- `/dashboard/drills`
- `/quiz/[mode]/setup`
- `/quiz/[mode]/session/[sessionId]`
- `/quiz/[mode]/session/[sessionId]/results`
- `/dashboard/wiki`
- `/dashboard/wiki/[slug]`
- `/dashboard/3d-lab`
- `/dashboard/3d-lab/[moduleId]`
- related shared shells/components/stores/actions/tests/docs

### Out of scope for this execution lane

- broad admin/editor refactors
- billing/payments completion
- large taxonomy/data-model redesign
- architectural rewrites that are not directly justified by current UX/perf pain

## Phase Plan

### Phase 0 — No-Secret Fixture and Runner Readiness

Targets:
- `src/lib/demo/*`
- any no-secret helpers used by quiz/wiki routes
- `scripts/playwright-run.ts`
- `e2e/support/*`

Deliverables:
- deterministic no-secret quiz data sufficient for at least one supported drill/quiz launch path
- deterministic no-secret wiki data sufficient for at least one article success path
- explicit runner path for the new core-flow specs via `bun run test:e2e:auth-demo:learning`
- one stable supported quiz mode and one stable supported wiki slug documented in the test spec:
  - quiz mode: `custom` launched from `/dashboard/drills`
  - wiki slug: `demo-ale-foundations`

Acceptance criteria:
- demo-auth mode exposes enough seeded data for one real quiz happy path and one real wiki article path
- the supported browser lane is named and runnable through `scripts/playwright-run.ts` as `auth-demo-learning`
- the plan does not rely on empty demo tables for quiz/wiki proof

### Phase 1 — Drill/Quiz Route and Session Hardening

Targets:
- `src/app/dashboard/drills/page.tsx`
- `src/components/testing/hub/ReviewHub.tsx`
- `src/components/testing/hub/HeroConfigurator.tsx`
- `src/app/quiz/[mode]/setup/*`
- `src/components/quiz-v2/StandardQuizShell.tsx`
- related quiz shell children and test helpers

Deliverables:
- fix the current session-contract breakpoints before micro-optimizing fetch order:
  - `source=missed&sessionId=...` launches a new session seeded only from the prior session’s missed or unanswered question ids
  - the current confidence-matrix shortcut UI is removed from user-facing results surfaces until its query shape is fully supported
  - pre-entry cancellation from the drills configurator must not silently strand an `in_progress` session without a deliberate resume path
  - final-submit path must have an in-flight guard equivalent to question-level submit protection
- use real readiness state where pressure-level gating depends on readiness
- real Playwright coverage for entering the drill hub, configuring/starting a session, and reaching a live question shell
- no blank session boot path; show a deterministic loading or recovery state instead of `null`
- pending state on launch/submit paths exposes visible pending copy/spinner plus disabled or `aria-disabled` controls
- the drills launch path removes the pre-`Promise.all` blocking stats read by resolving discipline/subject data inside one helper or async batch

Acceptance criteria:
- “Practice Missed Questions” launches a follow-up session containing only the prior missed or unanswered questions
- the current unsupported confidence-matrix follow-up shortcut is removed from the UI for this execution lane
- canceling a not-yet-entered drills launch abandons the provisional session and, after a reload, no new `Resume session` CTA appears from that canceled launch
- drills surfaces continue to resume at most one active session intentionally instead of multiplying ambiguous `in_progress` rows
- final submit cannot be triggered repeatedly while end-of-session work is already pending
- pressure-level setup does not default to an artificial readiness score of `0` when a real user readiness value exists
- the demo-auth learning lane can enter the drill/quiz flow and reach a question UI
- session boot does not render blank when store hydration/question availability is delayed
- launch CTA cannot start duplicate sessions while pending
- `src/app/dashboard/drills/page.tsx` no longer performs a pre-`Promise.all` blocking `user_global_stats` read before subject fetch resolution
- `bun run type-check` and `bun run test:e2e:auth-demo:learning` pass for the phase

### Phase 2 — Browser-Proofed Core Learning Flow

Targets:
- `e2e/*`
- `e2e/support/*`
- `scripts/playwright-run.ts`

Deliverables:
- `e2e/learning-flow.spec.ts` for the drill/quiz happy path
- `e2e/wiki-learning.spec.ts` for the seeded wiki landing/article/not-found path
- `e2e/3d-lab-routes.spec.ts` or an explicit extension of `e2e/authenticated-demo-3d-lab.spec.ts` for root + invalid-module coverage

Acceptance criteria:
- the chosen quiz mode, article slug, and test runner path are explicit:
  - `/dashboard/drills` -> `custom` -> `/quiz/custom/session/[sessionId]`
  - `/dashboard/wiki/demo-ale-foundations`
  - `bun run test:e2e:auth-demo:learning`
- `scripts/playwright-run.ts` wires `auth-demo-learning` to `e2e/learning-flow.spec.ts` and `e2e/wiki-learning.spec.ts`
- the new specs use stable user-facing selectors named in the test spec
- `bun run test:e2e:auth-demo:learning` is green on the current tree

### Phase 3 — Wiki Route Data Path and Mobile Navigation Tightening

Targets:
- `src/app/dashboard/wiki/*`
- `src/components/wiki/navigation/*`
- `src/lib/actions/wiki-actions.ts`
- `src/lib/actions/cached-queries.ts`

Deliverables:
- eliminate the known article/mobile duplication path by passing article discipline context into `WikiHeader` so mobile sidebar nodes can be preloaded from server data
- fold the current related-topics fetch into the main article/taxonomy path so the article route does not create a separate late `createClient()` query
- add Playwright coverage in `e2e/wiki-learning.spec.ts` for wiki landing, article load, and missing-slug not-found

Acceptance criteria:
- `WikiHeader` receives article discipline context needed to preload mobile sidebar nodes
- `WikiSidebar` on the article path is served `initialNodes` and does not require a client taxonomy fetch to render the mobile drawer
- article related topics come from the main article/taxonomy path rather than a separate `createClient()` call
- browser tests cover `/dashboard/wiki`, `/dashboard/wiki/demo-ale-foundations`, and `/dashboard/wiki/__missing__`
- the wiki browser spec asserts the `Knowledge Wiki` heading on the landing route, the seeded article title on the success route, and the dashboard not-found UI on the missing-slug route

### Phase 4 — 3D Lab Runtime and Module Surface Hardening

Targets:
- `src/app/dashboard/3d-lab/*`
- `src/features/3d-lab/components/ModuleViewer.tsx`
- `src/features/3d-lab/components/shell/ViewportShell.tsx`
- related overlay/store/runtime helpers

Deliverables:
- replace the current post-route blank handoff with a visible module-renderer fallback while lazy template content resolves
- tighten module loading/error fallback quality
- set shared `LabViewportFrame` rendering to avoid global `preserveDrawingBuffer` cost by default; if screenshot capture is still required, ship a non-global replacement in the same phase, otherwise remove/disable the shared screenshot shortcut
- expand Playwright coverage in `e2e/3d-lab-routes.spec.ts` or `e2e/authenticated-demo-3d-lab.spec.ts` to the lab root and `/dashboard/3d-lab/not-a-real-module`

Acceptance criteria:
- no new imports from `src/features/3d-lab/**` are introduced into non-lab routes/components during this phase
- 3D root/module path does not drop from the route loader into a blank `null` canvas/renderer gap during template load
- 3D module path has explicit loading/error affordances
- shared `LabViewportFrame` no longer runs with global `preserveDrawingBuffer: true` unless the same phase lands a non-global screenshot replacement and documents it
- targeted browser coverage exists for lab root and at least one module/failure path:
  - `/dashboard/3d-lab`
  - `/dashboard/3d-lab/not-a-real-module`
- the 3D browser spec asserts visible fallback content during template lazy load and not-found content on the invalid-module route
- `bun run test:e2e:auth-demo` remains green after the 3D phase, proving non-3D route behavior did not regress

### Phase 5 — Shared Async-State Polish in Touched Flows

Targets:
- button/loading/retry/error affordances in the routes touched above

Deliverables:
- touched async actions expose consistent `disabled` or `aria-disabled`, pending-visible, and error-visible semantics
- accessible labels/status text where the UI already has explicit async controls
- `.ai` docs reflect the actual validation surface and any behavior changes

Acceptance criteria:
- the start-session control exposes `disabled` or `aria-disabled="true"` plus visible pending copy/spinner and cannot trigger duplicate launch/navigation while pending
- the final-submit control exposes `disabled` or `aria-disabled="true"` plus visible pending copy/spinner and cannot trigger duplicate completion while pending
- touched retry/error surfaces keep their error message visible until the user retries or leaves the surface
- the learning-lane Playwright coverage asserts these pending/error semantics using concrete control state (`disabled` or `aria-disabled="true"`) plus visible pending text or spinner

## Risks

- demo-auth fixtures may not be rich enough for a full drill/quiz session launch without minor mock expansion
- empty demo tables currently block true no-secret quiz/wiki happy-path proof until Phase 0 is done
- quiz shell fixes can touch shared stateful code paths; regression coverage is required
- wiki navigation changes can regress mobile drawer behavior if initial-node assumptions are wrong
- 3D runtime tuning can accidentally break bespoke modules if shared shell assumptions are tightened too aggressively

## ADR

### Decision

Prioritize quiz/drills hardening and browser-proofed happy-path coverage first, then wiki data-path cleanup, then 3D runtime reductions.

### Drivers

- core student value sits in repeated practice
- browser-verifiable changes reduce false confidence
- wiki and 3D improvements are still important, but lower than quiz reliability

### Alternatives considered

- 3D-first optimization
- shared-component async-state sweep before feature-path hardening

### Why chosen

This order maximizes product value and keeps each cycle small enough to verify.

### Consequences

- 3D improvements continue, but after the core study path is better protected
- some shared-polish opportunities will be intentionally deferred unless encountered directly

### Follow-ups

- revisit broader shared-button/pending abstractions only if the first cycles prove repeated duplication
- revisit larger 3D store consolidation after the current runtime hotspots are trimmed and measured

## Available Agent Types Roster

- `explorer` / `explore` — repo-local fact gathering
- `planner` — sequencing and scope refinement
- `architect` — tradeoff review and plan critique
- `critic` — quality gate on plan completeness
- `executor` — implementation
- `test-engineer` — Playwright coverage and validation strategy
- `verifier` — final evidence pass
- `researcher` — official-doc confirmation for framework/testing/perf specifics

## Staffing Guidance

### Ralph execution

- leader: direct main-line ownership
- sidecar evidence lane: `test-engineer`
- sidecar repo lookup lane: `explorer`
- final sign-off lane: `verifier` or `architect` depending on blast radius

Reasoning:
- quiz/wiki implementation: medium to high
- 3D runtime edits: high
- Playwright additions: medium

### Team execution

- lane 1: `executor` on quiz/drill path
- lane 2: `executor` on wiki route/data path
- lane 3: `executor` or `test-engineer` on Playwright additions
- lane 4: `verifier` for aggregate validation

Team verification path:
- targeted tests per lane
- repo typecheck
- affected Playwright suites
- aggregate release gate when the touched surfaces justify it

## Launch Hints

- `$ralph` is the right handoff if one owner should keep iterating through fix/verify loops.
- `$team` is appropriate if quiz/wiki/test work can proceed in parallel with disjoint write scopes.
- `ultraqa` should wrap the validation-heavy passes after the first implementation cycle lands.
