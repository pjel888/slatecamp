# Testing Feature Remediation Plan

**Date:** 2026-04-06
**Status:** Completed / Verified
**Supersedes:** `.ai/plans/testing-feature-audit.md`
**Primary Objective:** Convert the current testing-feature audit into an executable fix list that closes the real correctness, security, data-contract, and verification gaps in the quiz engine.

## Final Outcome

This remediation plan has been executed. The quiz-v2 flow now enforces server-owned question slices, uses a single ordered completion path, returns real immediate diagnostics, preserves a shared client question contract across start/resume/background loading, and includes follow-up counter backfill migration coverage.

Verification completed on 2026-04-06 with these results:

- `bun test`: passed
- `bun run lint`: passed with warnings only
- `bun run type-check`: passed
- `bun run build`: passed

## 1. Verified Baseline

The original baseline below captured the pre-remediation state. It is preserved for traceability; it is no longer the current repo state.

- `submit_quiz_answer_v2` exists in `supabase/migrations/20260406144507_optimize_quiz_interactions.sql`.
- `submitAnswer` calls that RPC from `src/lib/actions/quiz-v2/submit-answer.ts`.
- `useQuizStore` passes `topicId` and `difficulty` from the current question into `submitAnswer`.
- `submitAnswer` uses `after()` for non-blocking post-submit work.

The current repo state does **not** support the old audit's "production ready" conclusion:

- `bun test` on 2026-04-06: 372 pass, 2 fail, 1 error.
- Relevant quiz-suite failure: `src/lib/quiz/mode-presets.test.ts` expects `camp.navigation.backAllowed` to be `false`, but the current preset is `true`.
- Additional suite error: `src/features/3d-lab/utils/nbcpCalculator.test.ts` cannot resolve a module.
- `bun run lint` passes with warnings only.
- `bun run type-check` fails due to current 3D-lab import breakage.
- `bun run build` fails due to current 3D-lab module resolution errors.

This plan assumes the code is the source of truth and that the old audit is now an inaccurate snapshot, not a completion record.

## 2. Recommended Architectural Decisions

These decisions should be treated as the default implementation path unless a stronger alternative is explicitly chosen during execution:

1. **Server owns session finalization.**
   The final answer should cause exactly one server-side completion flow, and that completion flow must run after post-interaction hooks finish.

2. **The server derives question slices from the session.**
   The client should never send arbitrary `questionIds` to retrieve question payloads.

3. **Immediate diagnostics and persisted diagnostics are separate concerns.**
   The UI can receive a lightweight immediate diagnostic in the submit response, while durable classification can still be written in the background.

4. **One client-question mapper should shape all quiz question payloads.**
   `startSession`, resume loading, and background hydration must all return the same question contract.

5. **No "done" claim until verification is honest.**
   The testing feature cannot be marked complete while the audit says build/type-check/test are green when they are not.

## 3. Definition of Done

The testing feature should not be called complete until all of the following are true:

- No client-controlled path can fetch questions outside the current session.
- Final question submission finalizes the session exactly once.
- Results are derived after post-interaction mastery/SRS work has been accounted for, or the product explicitly shows a pending/finalizing state until they are.
- `answered_count` and `correct_count` are correct for both existing and newly created sessions.
- Immediate feedback diagnostics either work end-to-end or are explicitly removed from the client contract.
- Diagnostic category names are consistent across the classifier, types, feedback UI, and persistence layer.
- Client question payloads are consistent across start, resume, and background hydration.
- Automated coverage exists for RPC success, RPC fallback, final-question finalization, session-question loading security, and diagnostic mapping.
- The old audit is no longer the active status document.
- Verification notes reflect the real command results, including any unrelated repo-wide blockers.

## 4. Priority Order

### P0: Ship blockers

- Harden question loading security.
- Remove duplicate/fighting session finalization paths.
- Add end-session idempotency and ordering guarantees.

### P1: Data correctness and product behavior

- Backfill and safeguard denormalized session counters.
- Restore or redesign immediate diagnostics so the UI contract is real.
- Align diagnostic category contracts.
- Complete the client question payload contract.

### P2: Coverage, contract cleanup, and documentation

- Add focused tests for the new quiz-v2 execution path.
- Resolve drift in quiz mode expectations.
- Clean duplicate/stale schemas and inaccurate documentation.

### P3: Honest release verification

- Either clear the repo-wide build/type-check blockers or stop claiming repo-wide green verification in testing docs until those blockers are gone.

## 5. Workstream-by-Workstream Fix List

## Workstream A: Harden Session Question Loading

**Problem**

`getSessionQuestions` currently verifies that the session belongs to the user, but it still trusts the client-supplied `questionIds` array. That means a caller with one valid `sessionId` can likely request arbitrary question payloads outside the session.

**Primary files**

- `src/lib/actions/quiz-v2/get-session-questions.ts`
- `src/components/quiz-v2/QuizShell.tsx`
- `src/app/quiz/[mode]/session/[sessionId]/page.tsx`
- Optional new helper: `src/lib/actions/quiz-v2/session-guards.ts`

**Required changes**

- Replace `getSessionQuestions(sessionId, questionIds, offset)` with a server-derived slice API.
- Recommended signature: `getSessionQuestions({ sessionId, offset, limit })`.
- Load `question_ids` from `quiz_sessions` server-side and slice them there.
- Reject invalid offsets and oversized limits; cap the server fetch size.
- Preserve session order based on the stored `question_ids`, not client order.
- Decide whether completed sessions should still allow safe read-only question retrieval for results/review; if yes, codify that explicitly instead of inheriting it accidentally.
- Centralize the "user owns session" guard so it is not reimplemented slightly differently across quiz-v2 actions.

**Acceptance criteria**

- A caller cannot obtain question payloads that are not listed in `quiz_sessions.question_ids`.
- Background hydration still works for large sessions.
- Resume behavior still restores the correct order.
- The action contract is narrower and easier to reason about.

**Tests to add**

- Reject or ignore out-of-session question requests.
- Return the correct slice for `offset=0`, `offset>0`, and final partial batches.
- Preserve original session order even if database ordering differs.

## Workstream B: Make Session Finalization Single-Owner and Ordered

**Problem**

The final-answer path is currently duplicated:

- `submitAnswer` calls `endSessionAction` from its `after()` block when `sessionComplete` is true.
- `useQuizStore.submitCurrentAnswer` also calls `endSessionAction` immediately on the same `sessionComplete` result.

This creates duplicate recompute/notification risk and makes final scoring race against unfinished background mastery hooks.

**Primary files**

- `src/lib/actions/quiz-v2/submit-answer.ts`
- `src/lib/actions/quiz-v2/end-session.ts`
- `src/stores/useQuizStore.ts`
- `src/components/quiz-v2/QuizShell.tsx`
- `src/app/quiz/[mode]/session/[sessionId]/results/page.tsx`

**Required changes**

- Remove the client-side `endSessionAction` call from `useQuizStore.submitCurrentAnswer`.
- Keep a single owner for finalization.
- Recommended implementation: `submitAnswer` remains responsible for triggering completion after background post-interaction work has settled.
- Add an explicit pending/finalizing state so the client can transition cleanly after the last answer without racing the server.
- Update the results route to handle "session exists but finalization is still in progress" instead of assuming that completion is already durable.
- Ensure the UI overlay/message reflects that the session is being finalized rather than immediately forcing a second completion call.

**Acceptance criteria**

- One final answer causes one completion path.
- Recomputed readiness and other post-session side effects happen once.
- Results do not reflect a partially updated session state.
- The last-answer user experience is still smooth.

**Tests to add**

- Final answer triggers one completion flow.
- Repeated completion attempts do not duplicate notifications or recompute readiness twice.
- Last-answer navigation handles the temporary finalizing state correctly.

## Workstream C: Make `endSession` Idempotent

**Problem**

Even after Workstream B, `endSession` itself should be safe to call twice. Right now it fetches the session, recomputes readiness, triggers notifications, and updates status without a strong idempotency guard.

**Primary files**

- `src/lib/actions/quiz-v2/end-session.ts`
- Optional new helper: `src/lib/actions/quiz-v2/build-end-session-result.ts`

**Required changes**

- Add a guard for sessions whose status is already terminal (`completed`, `abandoned`, `auto_submitted`, or equivalent finalized states).
- On repeat invocation, return a stable `EndSessionResult` without re-triggering readiness recompute or notifications.
- Separate "build result payload" from "mutate finalization state" so read-only reuse is safe.
- Make notification triggers and post-session hooks conditional on a first-time finalization path only.

**Acceptance criteria**

- Duplicate calls are safe and side-effect free.
- Completion and abandonment remain mutually exclusive and deterministic.
- Final result payloads remain stable across retries.

**Tests to add**

- Repeated `endSession` call on a completed session does not recompute or re-notify.
- Abandoned session does not trigger completed-session hooks.
- Completed session still returns a full result payload on re-read.

## Workstream D: Backfill and Safeguard Denormalized Counters

**Problem**

The migration that added `answered_count` and `correct_count` gave both columns default `0`, but it did not backfill existing sessions from `user_interactions`.

**Primary files**

- New migration under `supabase/migrations/`
- `supabase/migrations/20260406144507_optimize_quiz_interactions.sql`
- Optional operational query doc under `.ai/plans` or `docs/`

**Required changes**

- Add a follow-up migration that backfills `answered_count` and `correct_count` from `user_interactions`.
- Reconcile both in-progress and historical sessions.
- Consider adding constraints that keep `answered_count >= 0`, `correct_count >= 0`, and `correct_count <= answered_count`.
- Add a verification query that can be run after deploy to detect mismatches between session counters and interaction aggregates.

**Acceptance criteria**

- Existing sessions have correct counters after migration.
- New sessions remain correct under repeated upserts for the same question.
- `sessionComplete` based on counts is trustworthy.

**Tests / validation**

- Migration validation on representative seeded sessions.
- Spot-check sessions with repeated answer changes on the same question.
- Post-migration mismatch query returns zero rows.

## Workstream E: Align RPC Fallback With Primary Behavior

**Problem**

The fallback path in `submitAnswer` is still degraded:

- It does not return `wikiSlug`.
- It recomputes answered/correct counts from `user_interactions` instead of keeping `quiz_sessions` counters aligned.
- It silently diverges from the RPC contract even though the API surface implies near-equivalence.

**Primary files**

- `src/lib/actions/quiz-v2/submit-answer.ts`
- Optional new helper for fallback aggregation/lookups

**Required changes**

- Decide whether fallback should be a true semantic equivalent or an explicitly degraded emergency path.
- Recommended: make fallback return the same response fields as the RPC path, including wiki link resolution.
- Update `quiz_sessions` counters in fallback mode so the denormalized state stays coherent.
- Emit structured logs when fallback is used so that degraded mode is observable.

**Acceptance criteria**

- RPC success and fallback success return the same shape and meaning.
- Fallback use is observable in logs or analytics.
- Session progression does not depend on whether the RPC exists.

**Tests to add**

- RPC-success path.
- RPC-missing/fallback path.
- Fallback still completes the session correctly on the final question.

## Workstream F: Restore Immediate Diagnostics or Remove the Broken Contract

**Problem**

The current client/store/UI contract expects `result.errorDiagnostic`, but `submitAnswer` always returns `errorDiagnostic: null`. At the same time, wrong-answer classification is pushed into a background task, so the immediate feedback path cannot actually show the diagnostic it is coded to render.

There is also a second contract mismatch:

- `FeedbackPanel` maps `lack_knowledge`, `careless`, and `lack_time`.
- `classifyError` emits `knowledge_gap`, `misremembered_fact`, `computation_error`, `random_guess`, and other different category names.

**Primary files**

- `src/lib/actions/quiz-v2/submit-answer.ts`
- `src/lib/actions/quiz-v2/classify-and-store-error.ts`
- `src/lib/quiz/error-classifier.ts`
- `src/components/quiz-v2/FeedbackPanel.tsx`
- `src/stores/useQuizStore.ts`
- `src/types/quiz-config.ts`

**Required changes**

- Decide whether immediate coaching is a product requirement.
- Recommended implementation:
  - return a lightweight immediate diagnostic from `submitAnswer` for the feedback panel,
  - keep durable persistence in `classifyAndStoreError` as background work.
- Replace loose `category: string` typing with an explicit union.
- Make category names consistent across the classifier, feedback heading map, types, and any persisted `error_type` usage.
- Decide whether classification should still persist for deferred/none feedback modes; if it is a learning signal, it should not be limited to immediate-feedback sessions only.
- Fix any streak logic that assumes a non-null diagnostic for lucky-guess handling.

**Acceptance criteria**

- Wrong-answer feedback shows a real diagnostic when the product expects one.
- Category labels are consistent end-to-end.
- The background persistence path no longer disagrees with the UI contract.

**Tests to add**

- Immediate wrong answer returns a diagnostic payload.
- Category heading map covers all emitted categories.
- Deferred-feedback mode still behaves according to the chosen product rule.

## Workstream G: Complete the Client Question Payload Contract

**Problem**

The current `QuestionForClient` contract is only partially hydrated across paths:

- `startSession` builds one shape.
- `app/quiz/[mode]/session/[sessionId]/page.tsx` uses `stripQuestionForClient`.
- `getSessionQuestions` also uses `stripQuestionForClient`.

The result is drift in fields such as `taxonomy_breadcrumb`, `unit`, `hint_text`, and any future generation-question metadata.

**Primary files**

- `src/lib/actions/quiz-v2/start-session.ts`
- `src/app/quiz/[mode]/session/[sessionId]/page.tsx`
- `src/lib/actions/quiz-v2/get-session-questions.ts`
- `src/lib/quiz/question-selection.ts`
- Optional new shared mapper: `src/lib/quiz/to-client-question.ts`

**Required changes**

- Replace duplicate shaping logic with one shared mapper.
- Decide which `QuestionForClient` fields are truly supported and required.
- Ensure the mapper can populate:
  - `taxonomy_breadcrumb`
  - `question_type`
  - `unit`
  - `hint_text`
  - `is_interleaved`
  - any generation-only metadata that the UI depends on
- Update both the server-rendered resume page and the background-hydration action to use the same mapper and supporting data fetches.
- Remove dead fields from `QuestionForClient` if the product does not support them yet.

**Acceptance criteria**

- Initial, resumed, and background-loaded questions render the same metadata.
- Generation input fields receive the same context regardless of how the question was loaded.
- No part of the quiz shell depends on fields that are silently blank in one code path and present in another.

**Tests to add**

- Mapper unit tests for MCQ and generation questions.
- Resume-session payload parity test.
- Background-hydration payload parity test.

## Workstream H: Add Real Quiz-v2 Test Coverage

**Problem**

There is currently no meaningful automated coverage for the most important quiz-v2 execution paths. `src/lib/actions/quiz.test.ts` is only a lightweight math smoke test and does not exercise the live server actions.

**Primary files**

- New tests under `src/lib/actions/quiz-v2/`
- `src/lib/actions/quiz.test.ts` (either replace, narrow, or leave as a supplemental test)
- `src/lib/quiz/mode-presets.test.ts`

**Required changes**

- Add direct tests for `submitAnswer` covering:
  - RPC success
  - RPC fallback
  - immediate feedback
  - deferred/no feedback
  - final-question completion path
  - generation-question answers
  - lucky-guess behavior
- Add tests for `endSession` idempotency and first-time-only side effects.
- Add tests for the session question loading slice API.
- Resolve the `mode-presets` expectation mismatch by deciding whether `camp.navigation.backAllowed` should be `true` or `false`, then update code or test accordingly.
- Keep unrelated red tests from being described as evidence for quiz completion.

**Acceptance criteria**

- The testing feature has targeted coverage for its critical behavior, not just utility math.
- The suite clearly distinguishes quiz-engine regressions from unrelated repo breakage.

## Workstream I: Validate Inputs and Reduce Contract Drift

**Problem**

The repo currently carries multiple quiz submission schema shapes, including stale snake_case schemas in `src/lib/validations/index.ts`, while quiz-v2 actions mostly trust their inputs directly.

**Primary files**

- `src/lib/validations/index.ts`
- `src/lib/actions/quiz-v2/start-session.ts`
- `src/lib/actions/quiz-v2/submit-answer.ts`
- `src/lib/actions/quiz-v2/end-session.ts`
- Optional dedicated quiz-v2 schemas module

**Required changes**

- Define the active quiz-v2 input schemas explicitly.
- Validate `StartSessionInput`, `SubmitAnswerInput`, `EndSessionInput`, and the new session-question-slice input on the server boundary.
- Remove or clearly mark stale legacy schemas so future work does not import the wrong contract.
- Add specific validation for:
  - invalid or negative `timeSpentMs`
  - out-of-range `confidenceLevel`
  - unsupported `questionType` payload assumptions
  - MCQ submissions whose `selectedOptionId` is not one of the available options

**Acceptance criteria**

- Server actions no longer depend on the client store for input sanity.
- There is one active schema contract per quiz-v2 action.
- Legacy validation drift is reduced.

## Workstream J: Correct Documentation and Verification Discipline

**Problem**

The current audit is inaccurate in both status and verification claims. That creates the risk of future work starting from a false baseline.

**Primary files**

- `.ai/plans/testing-feature-audit.md`
- `.ai/plans/2026-04-06-testing-feature-remediation-plan.md`
- Any related docs that currently repeat the same false "done" claim

**Required changes**

- Mark `.ai/plans/testing-feature-audit.md` as superseded once execution starts, or archive it.
- Keep this remediation plan as the active execution document until the work is actually complete.
- Replace all claims of green build/type-check/test status with the real command outcomes and dates.
- Add a final verification section to the execution PR or follow-up doc that distinguishes:
  - testing-feature-specific fixes
  - unrelated repo-wide blockers still preventing full release verification

**Acceptance criteria**

- No active planning document claims the testing feature is complete when it is not.
- Verification notes are reproducible and date-stamped.

## 6. Execution Order

Recommended order of implementation:

1. Lock in the security boundary for session question loading.
2. Remove duplicate finalization ownership and add `endSession` idempotency.
3. Backfill and safeguard denormalized counters.
4. Align immediate diagnostics and category contracts.
5. Unify question payload shaping across all loaders.
6. Add focused quiz-v2 tests around the above changes.
7. Resolve the mode-preset expectation mismatch.
8. Update docs and verification notes.

## 7. Verification Matrix

These are the minimum checks to run after the remediation work:

- Targeted quiz-v2 tests:
  - `submitAnswer` success and fallback cases
  - session-question loading security
  - last-answer finalization
  - `endSession` idempotency
  - question payload mapper parity
- `bun test`
- `bun run lint`
- `bun run type-check`
- `bun run build`

If `type-check` or `build` still fail because of unrelated 3D-lab breakage, the execution notes must state that explicitly instead of marking the testing feature as fully verified.

## 8. External Blockers To Honest Completion Claims

These items are not owned by the testing feature itself, but they block a truthful repo-wide "green" status:

- Current 3D-lab import/module-resolution failures break `bun run type-check`.
- Current 3D-lab module-resolution failures break `bun run build`.
- Current 3D-lab test import failure keeps `bun test` from being fully green even if quiz-v2 is fixed.

Until those are resolved, any completion note for this feature must use one of these two phrasings:

- "Testing feature fixes are complete, but repo-wide verification is still blocked by unrelated 3D-lab failures."
- "Testing feature fixes are complete and repo-wide verification is pending external cleanup."

It must **not** say "production ready" or "build passed" unless those statements are actually true on the date they are written.
