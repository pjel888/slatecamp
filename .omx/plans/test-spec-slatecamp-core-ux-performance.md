# Test Spec: SlateCamp Core UX, Performance, and Test Hardening

Date: 2026-04-26
Related PRD: `.omx/plans/prd-slatecamp-core-ux-performance.md`

## Objective

Define the proof needed for the next implementation lane across drills/quiz, wiki, and 3D Lab.

## Fixture Gate

Before any happy-path browser claim:

- seed one deterministic no-secret quiz path with enough taxonomy, stats, and question data to launch a session
- seed one deterministic no-secret wiki article slug that resolves successfully: `demo-ale-foundations`
- register the runner path in `scripts/playwright-run.ts` as `auth-demo-learning`
- use `/dashboard/drills` -> `custom` as the supported no-secret learning-flow path
- run `e2e/learning-flow.spec.ts` and `e2e/wiki-learning.spec.ts` from that lane

Until this gate is complete, route-access smoke is not sufficient proof for quiz/wiki success behavior.

### 1. Drill / Quiz Flow

Required browser coverage:
- authenticated user reaches `/dashboard/drills`
- launch surface is visible and actionable
- starting the supported no-secret mode reaches `/quiz/custom/session/[sessionId]`
- live session shell shows question content rather than a blank render
- pending launch/submit states block duplicate interaction through asserted control state
- final-submit path does not allow repeated triggering while session finalization is pending

Candidate selectors:
- `getByRole('heading', { name: /Build Mastery\\. Earn your Score\\./i })`
- `getByRole('heading', { name: /Intelligent Configurator/i })`
- `getByLabel(/Slide to start session/i)`
- session route assertions on `getByLabel(/Slide to submit/i)` plus visible question content
- final-submit assertion on the confirm control becoming disabled or pending-busy after first activation

Likely commands:
- `bun run test:e2e:auth-demo:learning`
- `bun run type-check`

Additional targeted proof:
- unit or targeted integration coverage for `startSession`-adjacent shortcut behavior when the route passes `source=missed&sessionId=...` and the current confidence-review query shape
- targeted coverage for pre-entry cancel/resume behavior from the drills configurator if that contract changes
- the confidence-matrix follow-up shortcut is absent from the UI for this lane unless explicit implementation work reintroduces it with matching tests
- the canceled pre-entry launch path proves no new `Resume session` CTA appears after reload in the seeded no-active-session fixture

### 2. Wiki Flow

Required browser coverage:
- `/dashboard/wiki` loads and shows the landing shell
- one seeded, deterministic wiki article slug loads successfully
- missing slug or not-found path resolves into the expected not-found behavior using `/dashboard/wiki/__missing__`
- mobile/article navigation does not regress if sidebar data-path changes

Likely commands:
- `bun run test:e2e:auth-demo:learning`
- `bun run type-check`

Concrete assertions:
- landing route shows the `Knowledge Wiki` heading
- article route shows the seeded article title for `demo-ale-foundations`
- missing slug resolves to the dashboard not-found UI rather than a hanging skeleton

### 3. 3D Lab Flow

Required browser coverage:
- `/dashboard/3d-lab` still loads
- at least one module route loads
- fallback or error behavior is explicit when a module cannot initialize or access is denied
- touched template/module routes do not drop into a blank post-loader gap
- explicit failure path: `/dashboard/3d-lab/not-a-real-module` resolves to the dashboard not-found UI without hanging on a spinner

Likely commands:
- `bun run test:e2e:auth-demo:3d-lab`
- targeted unit tests for shared module-path/runtime helpers
- `bun run type-check`

Concrete assertions:
- visible loading or fallback content persists until the module renderer mounts
- unknown module route resolves into not-found content, not a blank canvas
- the shared lab path no longer depends on global `preserveDrawingBuffer: true` unless the same change ships a replacement capture path

### 4. Shared Async-State / Accessibility Proof

When touched:
- async controls expose disabled/pending state
- pending state remains visible long enough to assert
- errors remain visible after failure
- accessible text/roles stay intact for Playwright role locators

Concrete assertions:
- start-session control becomes non-interactive via `disabled` or `aria-disabled="true"` after activation
- pending UI remains visible until navigation or recovery
- final-submit confirm control becomes non-interactive via `disabled` or `aria-disabled="true"` after activation
- retry-capable error surfaces keep visible error copy until the retry action is taken

## Validation Ladder

### Phase 0 / Phase 1 required commands

1. `bun test src/lib/actions/quiz-v2/start-session.test.ts`
2. `bun test src/lib/actions/quiz-v2/start-session.test.ts src/lib/actions/quiz-v2/submit-answer.test.ts`
3. `bun run type-check`
4. `bun run test:e2e:auth-demo:learning`

### Phase 3 required commands

1. `bun run type-check`
2. `bun run test:e2e:auth-demo:learning`

### Phase 4 required commands

1. `bun test src/features/3d-lab/config/module-paths.test.ts`
2. `bun run type-check`
3. `bun run test:e2e:auth-demo:3d-lab`
4. `bun run test:e2e:auth-demo`

### Phase 5 required commands

1. `bun run type-check`
2. `bun run lint`
3. `bun run test:e2e:auth-demo:learning`
4. `bun run test:e2e:auth-demo:3d-lab`

### Aggregate release proof

1. `bun run validate:release`

## Known Gaps Before Implementation

- no current Playwright proof of a real drill/quiz happy-path session launch
- no direct Playwright coverage of wiki routes
- 3D Playwright coverage is still route-smoke oriented, not module/failure oriented

## Pass / Fail Criteria

Pass only when:

- touched routes render deterministically under browser automation
- no new type errors are introduced
- the new test coverage fails before the fix and passes after the fix, where feasible
- `.ai` validation documentation matches any new script or suite shape
- the chosen quiz mode and article slug are documented and reproducible in the no-secret lane
- the exact required spec files are present and wired to their named runner modes

Fail when:

- route success depends on brittle implementation selectors
- async states are visually present but not testable
- a touched flow still has an unhandled blank/error state with no documented reason
- user-facing CTAs promise shortcut/review behavior that the underlying session contract does not actually support
