# SlateCamp Onboarding Audit And Implementation Plan

## Problem Statement

The `/onboarding` flow looks polished, but it can still feel stuck or trap users in a loop because the state model and persistence path are not strict enough:

- The client flow hides the real server submit behind multi-step UI and a calibration delay.
- The final onboarding server action writes to Supabase but does not surface write errors before redirecting.
- The dashboard guard treats `onboarding_completed_at` as the only gate, so any silent failure can bounce users back to onboarding.
- Settings can edit some profile data later, but there is no shared completion path for finishing onboarding from settings.
- `StudyWindowSelector` saves immediately in settings/onboarding-adjacent UX, which splits the source of truth from the onboarding payload.

The product request is now narrower than a full onboarding-state redesign:

- Assume LEA-only users for now.
- Add a skip onboarding path.
- Let skipped users finish profile setup in settings.
- Keep the UI largely as-is and focus on correctness, guard behavior, and persistence.

## Current-State Audit Findings

### Flow map

1. New user signs up in `src/app/(auth)/register/register-form.tsx`.
2. OAuth callback returns the user to `/onboarding`.
3. `src/app/(auth)/onboarding/page.tsx` bootstraps the user and fetches disciplines plus level-1 taxonomy subjects.
4. `src/app/(auth)/onboarding/_components/OnboardingForm.tsx` runs:
   - main step
   - review center step
   - coexistence step when review center is not `none`
   - calibration screen
   - final server submit
5. Server action updates `user_global_stats` and `profiles`, revalidates dashboard layout, then redirects to `/dashboard`.
6. `src/components/dashboard/DashboardLayoutContent.tsx` checks `onboarding_completed_at`; if null, it redirects back to `/onboarding`.

### Reliability findings

- The final onboarding server action has no write validation.
  - File: `src/app/(auth)/onboarding/page.tsx`
  - Issue: both the `user_global_stats.update(...)` and `profiles.upsert(...)` results are awaited but their `error` values are ignored.
  - Impact: the UI can proceed as if onboarding succeeded even when a write fails. The next dashboard render can send the user back to onboarding, which reads as “stuck.”

- The client flow hides final-submit state behind a timed calibration screen.
  - Files: `src/app/(auth)/onboarding/_components/OnboardingForm.tsx`, `CalibrationScreen.tsx`
  - Issue: the user waits through synthetic progress before the real server action happens, and there is no dedicated error recovery UI if the server action fails or hangs.
  - Impact: a slow network or broken server write feels like the calibration never finishes.

- `StudyWindowSelector` is a split persistence path.
  - File: `src/components/settings/StudyWindowSelector.tsx`
  - Issue: it performs its own async save with `saveStudyWindow(value)` and does not serialize the value as part of the onboarding payload.
  - Impact: onboarding and settings can drift on `preferred_study_window`, and the onboarding submit is not a single coherent transaction.

- The dashboard guard is binary.
  - File: `src/components/dashboard/DashboardLayoutContent.tsx`
  - Issue: users without `onboarding_completed_at` are redirected to `/onboarding` unconditionally.
  - Impact: skip onboarding cannot work unless the guard becomes path-aware or the user is explicitly marked complete.

- The current data model already seeds a discipline before onboarding.
  - File: `src/lib/supabase/bootstrap.ts`
  - Issue: bootstrap defaults users to Architecture in `user_global_stats.current_discipline_id`.
  - Impact: `current_discipline_id` must not be treated as proof of onboarding completion.

- Settings is not yet a shared completion surface.
  - Files: `src/app/dashboard/settings/page.tsx`, `src/lib/actions/profile.ts`
  - Issue: settings covers display name, avatar, discipline, notifications, and exam date, but not a single completion action that writes the missing onboarding fields coherently.
  - Impact: a skip button would not have a canonical place to finish profile setup later.

### Button and network audit targets

- Main form submit button must only transition to the next step when required fields are valid.
- Review-center continue button must always advance, including `none` and `other`.
- Coexistence continue button must always reach calibration.
- Calibration completion must trigger exactly one final submit.
- Final submit must produce one coherent persistence action, not a split between background field saves and the form action.
- Redirect to `/dashboard` must only happen after persisted onboarding completion is confirmed.

## Skip-Onboarding Options

### Option A: Keep `onboarding_completed_at` as the only completion flag and add a path-scoped settings exception

Allow incomplete users to access `/dashboard/settings`, then finish onboarding there with one shared completion action.

Pros:

- Minimal schema churn.
- Preserves the meaning of `onboarding_completed_at`.
- Matches the actual product need: skip now, complete in settings later.

Cons:

- Requires a path-aware dashboard guard.
- Requires settings to become a real completion surface.
- Settings access is settings-only until completion; do not widen incomplete users to the full dashboard shell.

### Option B: Add a generalized onboarding status enum

Introduce `not_started`, `deferred`, and `completed` states across the app.

Pros:

- Explicit state modeling.

Cons:

- Broader than the current product need.
- Adds schema churn, backfills, and more global branching.
- Increases the chance of drift between onboarding, settings, and dashboard state checks.

### Option C: Force onboarding, no skip

Keep the current route guard and only harden the existing flow.

Pros:

- Lowest conceptual change.

Cons:

- Does not satisfy the requested product behavior.
- Leaves friction high for users who want to start using the app first.

## Preferred Option

Prefer **Option A: keep `onboarding_completed_at` as the completion signal and make settings the completion surface for skipped users**.

Reason:

- It satisfies the skip requirement with the least architectural change.
- It avoids a global onboarding-state enum that the current app does not need.
- It keeps the source of truth simple: incomplete users are incomplete until a shared completion action writes the real completion timestamp.

## Implementation Phases

## Phase 1: Stabilize The Existing Onboarding Flow

Goal: remove the most likely “stuck” conditions before adding skip behavior.

Touchpoints:

- `src/app/(auth)/onboarding/page.tsx`
- `src/app/(auth)/onboarding/_components/OnboardingForm.tsx`
- `src/components/settings/StudyWindowSelector.tsx`

Changes:

- Replace split persistence for study window.
  - Make onboarding submit a real `studyWindow` form field as part of the final payload.
  - Keep `StudyWindowSelector` immediate-save behavior only for settings, or add an onboarding mode that is form-controlled.

- Add explicit error handling to onboarding writes.
  - Validate `disciplineId`.
  - Check `error` from both `user_global_stats` and `profiles`.
  - Do not redirect if either write fails.
  - Return a typed failure result the client can render.

- Make final-submit state observable.
  - Show submitting/error state after calibration.
  - Prevent duplicate submit calls from the calibration completion edge.

- Reduce misleading fake progress.
  - Keep the calibration UI if desired, but treat it as a presentation layer around a real pending state.
  - If the submit is still pending, show that clearly.

## Phase 2: Define A Shared Completion Service

Goal: make onboarding and settings use the same persistence boundary.

Touchpoints:

- `src/lib/actions/profile.ts`
- `src/app/(auth)/onboarding/page.tsx`
- `src/app/dashboard/settings/page.tsx`
- `src/app/dashboard/settings/profile-card.tsx`
- `src/app/dashboard/settings/discipline-card.tsx`

Changes:

- Add one shared completion action or service that writes the onboarding payload once.
  - Own the canonical LEA onboarding fields in one code path:
    - `profiles.discipline_id`
    - `profiles.reviewer_type`
    - `profiles.preferred_study_window`
    - `profiles.target_exam_date`
    - `profiles.enrolled_review_center`
    - `profiles.previous_exam_subjects_struggled`
    - `profiles.onboarding_completed_at`
    - `user_global_stats.current_discipline_id`
    - `user_global_stats.target_exam_date`
    - `user_global_stats.exam_attempt_number`
    - `user_global_stats.previous_exam_result` when relevant
    - `user_global_stats.onboarding_completed_at`
  - Return structured success/failure instead of blind redirects.

- Ensure settings can call the same completion path.
  - Settings should not reimplement onboarding persistence in a second ad hoc mutation.
  - The completion action should be reusable by both the final onboarding submit and the settings completion CTA.

- Keep LEA-only assumptions tight.
  - Default to Architecture where a discipline is required.
  - Remove or hide `undergrad` and `dae` from the onboarding and settings completion path for now.
  - Avoid carrying non-LEA branching into the new completion surface unless the product explicitly reintroduces it.

## Phase 3: Add Skip-Onboarding Access And CTA

Goal: provide a safe exit from onboarding without falsifying completion.

Touchpoints:

- `src/components/dashboard/DashboardLayoutContent.tsx`
- `src/app/(auth)/onboarding/page.tsx`
- `src/app/(auth)/onboarding/_components/OnboardingForm.tsx`
- `middleware.ts`

Changes:

- Add a visible `Skip for now` action on onboarding.
- On skip:
  - set only the minimum baseline needed for the app to function
  - do not fake a fully completed state unless the shared completion action explicitly does so as part of finishing setup
  - route the user to `/dashboard/settings`

- Make the guard path-aware.
  - Enforce the `/dashboard/settings` allowlist in `DashboardLayoutContent.tsx` using the `x-pathname` header set by `middleware.ts`.
  - Keep incomplete users out of the main dashboard surface.
  - Allow `/dashboard/settings` and `/dashboard/settings/*` for incomplete users so they can finish setup.
  - Do not use `current_discipline_id` as a proxy for onboarding completion.

## Phase 4: Make Settings The Completion Surface

Goal: let skipped users finish onboarding later from settings.

Touchpoints:

- `src/app/dashboard/settings/page.tsx`
- `src/app/dashboard/settings/profile-card.tsx`
- `src/app/dashboard/settings/discipline-card.tsx`
- `src/components/settings/StudyWindowSelector.tsx`
- `src/lib/actions/profile.ts`

Changes:

- Add a dedicated onboarding completion section in settings.
- Expose the minimum profile fields required to finish onboarding:
  - target exam date when applicable
  - preferred study window
  - discipline confirmation
  - review center when needed
  - any remaining onboarding fields the app truly needs for LEA-only users

- Add a single completion action.
  - Persist the missing fields.
  - Set `onboarding_completed_at`.
  - Revalidate dashboard layout and settings.

- Keep the flow LEA-first and low-branch.
  - If a field is not needed for the current product boundary, do not keep it alive just because the old onboarding flow exposed it.
  - `StudyWindowSelector` should support a controlled/form mode for onboarding and keep save-on-select behavior only in settings.

## Phase 5: Add Regression Coverage

Goal: lock the flow so future onboarding edits do not reintroduce invisible failures.

Touchpoints:

- onboarding component tests
- server action tests
- route-guard tests
- optional Playwright or browser-level flow tests if available in repo

Changes:

- Add tests for client step transitions.
- Add tests for success and failure results from the onboarding server action.
- Add tests for route behavior across:
  - unauthenticated
  - incomplete
  - skipped / settings-only access
  - completed
- Add settings completion tests for skipped users.

## Verification Plan

### Button behavior

- Verify the main `Continue` button:
  - blocks when no discipline is selected
  - advances when required fields are present
- Verify the review-center continue button for:
  - `none`
  - `jpt`
  - `atlas_cdc`
  - `other`
- Verify coexistence continue always advances.
- Verify calibration triggers final submit once only.
- Verify skip routes to settings and does not re-open onboarding immediately.

### Network and persistence behavior

- Inspect the onboarding submit path and confirm:
  - one final coherent server action submission
  - no hidden dependency on a separate background study-window save
  - failed writes return visible client errors

- Verify persistence after submit:
  - `profiles` fields are written correctly
  - `user_global_stats` fields are written correctly
  - redirect happens only after success

- Verify persistence after skip:
  - the user can reach settings without an onboarding loop
  - settings completion writes the same canonical data path as onboarding

### Route guards

- Unauthenticated users are redirected to login.
- Incomplete users are redirected to onboarding from protected routes.
- Incomplete users can access `/dashboard/settings` and `/dashboard/settings/*`.
- Incomplete users do not get broad dashboard access.
- Completed users reach `/dashboard` and do not get sent back to onboarding on refresh.
- No code path treats `current_discipline_id` as proof of onboarding completion.

### Settings completion flow

- Skipped users update missing profile fields in settings.
- Completion action writes the final state.
- Next dashboard navigation succeeds without prompts or loops.

## Risks And Edge Cases

- Silent schema drift:
  - onboarding currently writes fields based on code assumptions; verify the live migration state matches generated types before implementation.

- Split-source truth:
  - if study window remains both immediate-save and form-save, race conditions and stale values will persist.

- Fake completion:
  - setting `onboarding_completed_at` during skip without a real settings completion surface would simplify routing but damage analytics and downstream logic.

- Current discipline is not completion:
  - bootstrap already seeds Architecture, so the app must not infer onboarding success from `current_discipline_id`.

- Redirect loops:
  - route guard and settings completion logic must be tested together, not separately.

- Legacy branches:
  - the current onboarding UI still exposes branches that are not needed for the LEA-only scope; reduce them if they create unnecessary failure paths.

- Completion proxy drift:
  - bootstrap seeds `current_discipline_id`, so any helper or guard that equates discipline presence with onboarding completion must be corrected.

## RALPLAN-DR Summary

### Principles

- Reliability over visual change.
- One authoritative persistence path per onboarding field.
- Route guards must reflect real user state, not inferred success.
- Skip must be explicit and reversible, not disguised as completion.
- Reuse existing settings surfaces where possible.

### Decision Drivers

- Users are currently vulnerable to invisible failure and redirect loops.
- The product needs a skip path without losing profile-completion capability.
- LEA-only scope justifies reducing branches and simplifying the flow.

### Viable Options

- Option A: keep `onboarding_completed_at` as the completion signal, allow `/dashboard/settings`, and reuse one shared completion action.
- Option B: add a generalized onboarding status enum.
- Option C: no skip, only harden current onboarding.

### Rejection Rationale

- Reject Option B because it is wider than needed, adds schema churn, and creates more global branching than the current architecture warrants.
- Reject Option C because it does not satisfy the requested user experience.
- Choose Option A because it preserves a single completion signal while enabling skip-now-finish-later with manageable implementation cost.

## Recommended Next Step

Execute Phase 1 first, then Phase 2. The current onboarding flow must be made trustworthy before the skip path is added, otherwise the new branch will inherit the same silent-failure behavior.
