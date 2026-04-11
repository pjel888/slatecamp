# SlateCamp Onboarding Executable Plan

## Problem Statement

SlateCamp onboarding is visually coherent but operationally weak. The current flow can appear stuck, lose user trust, and create redirect loops because completion depends on a client-side wizard, a synthetic calibration delay, and a server action that redirects without validating write success.

The product direction remains correct and constrained:

- `onboarding_completed_at` stays the only completion signal
- incomplete users may access `/dashboard/settings` only
- settings becomes the canonical resume-and-complete surface
- onboarding is reduced to the LEA-only path and kept low-branch

This plan turns the current UX memo into an implementation-ready spec with a precise persistence boundary, explicit route policy, and clear success criteria.

## Decision Clarifications

- `onboarding_completed_at` is the only completion gate.
- "Skipped" is a user journey, not a second persisted access state.
- The app does not need an onboarding status enum.
- The app also does not need a required persisted skip flag to ship this scope.
- Skip is implemented as:
  - a user action in onboarding
  - an immediate redirect to settings
  - a settings completion module
  - instrumentation for observability

This keeps routing simple: incomplete users are still incomplete. Settings is the canonical place to finish setup, but non-settings protected routes remain blocked until completion.

## Current-State Audit

### Severity 1: Silent write failure can cause redirect loops

- File: [page.tsx](/C:/Users/Philip Lewis/Desktop/slatecamp/src/app/(auth)/onboarding/page.tsx)
- Fact: onboarding writes `user_global_stats` and `profiles` but ignores returned `error` values before `redirect(ROUTES.dashboard.root)`.
- User impact: a user can finish the flow, get redirected, and then be sent straight back to onboarding because `onboarding_completed_at` never actually persisted.
- Required fix: onboarding completion must return typed success or failure and must not redirect unless both writes succeed.

### Severity 1: Calibration hides the real submit state

- Files: [OnboardingForm.tsx](/C:/Users/Philip Lewis/Desktop/slatecamp/src/app/(auth)/onboarding/_components/OnboardingForm.tsx), [CalibrationScreen.tsx](/C:/Users/Philip Lewis/Desktop/slatecamp/src/app/(auth)/onboarding/_components/CalibrationScreen.tsx)
- Fact: the form advances into a calibration phase before the real server submit resolves.
- User impact: users cannot distinguish between pending, hung, and failed states.
- Required fix: the real submit starts immediately when the user confirms the last required step, and any progress UI must reflect actual pending state.

### Severity 1: Study window uses a split write path

- File: [StudyWindowSelector.tsx](/C:/Users/Philip Lewis/Desktop/slatecamp/src/components/settings/StudyWindowSelector.tsx)
- Fact: the selector saves through `saveStudyWindow` immediately, outside the onboarding payload.
- User impact: onboarding data can be partially saved, stale, or inconsistent with the final completion write.
- Required fix: onboarding uses a controlled form-mode selector with no side effects; save-on-select remains settings-only.

### Severity 1: The dashboard guard is currently binary

- File: [DashboardLayoutContent.tsx](/C:/Users/Philip Lewis/Desktop/slatecamp/src/components/dashboard/DashboardLayoutContent.tsx)
- Fact: incomplete users are always redirected to `/onboarding`.
- User impact: skip cannot work, and settings cannot serve as a completion surface unless the guard becomes path-aware.
- Required fix: keep the guard in layout, use `x-pathname`, and explicitly allow `/dashboard/settings` and `/dashboard/settings/*` only.

### Severity 1: Completion is already mis-modeled in one downstream helper

- File: [get-admin-profile.ts](/C:/Users/Philip Lewis/Desktop/slatecamp/src/lib/admin/get-admin-profile.ts:88)
- Fact: `onboarding_completed` is derived from `!!stats?.current_discipline_id`.
- Fact: [bootstrap.ts](/C:/Users/Philip Lewis/Desktop/slatecamp/src/lib/supabase/bootstrap.ts:54) seeds `current_discipline_id` by default.
- User impact: any logic that uses discipline presence as a proxy for completion is incorrect.
- Required fix: `onboarding_completed_at` is the only completion signal everywhere.

### Severity 2: Skip exists as a requirement, not yet as a defined product contract

- Missing today:
  - exact placement of `Skip for now`
  - confirmation behavior
  - post-skip destination
  - reminder/completion module in settings
  - resume behavior on later visits
- Required fix: define skip as a first-class settings-only deferral path, not fake completion.

### Severity 2: Onboarding branches exceed current LEA-only scope

- File: [OnboardingForm.tsx](/C:/Users/Philip Lewis/Desktop/slatecamp/src/app/(auth)/onboarding/_components/OnboardingForm.tsx)
- Fact: the form still exposes `undergrad` and `dae`.
- User impact: unnecessary branching increases test surface, failure paths, and user effort.
- Required fix: remove or hide `undergrad` and `dae` from the onboarding and settings-completion flow until product scope changes.

## UX Contract

### Happy Path

1. User lands on `/onboarding`.
2. The page shows current step, total steps, and the minimum fields needed for that step.
3. The primary CTA remains disabled until required inputs are valid.
4. The user may move back without losing entered values.
5. The final CTA makes it explicit that the next action saves setup.
6. The real submit starts immediately on final confirmation.
7. Pending UI reflects actual network state.
8. Success is confirmed only after canonical persistence succeeds.
9. The user is redirected to `/dashboard`.

### Skip Path

1. `Skip for now` is available as a secondary action from the first meaningful step onward.
2. The user is told they can finish setup later in settings.
3. Skip does not set `onboarding_completed_at`.
4. The user is redirected to `/dashboard/settings`.
5. Settings shows a top-of-page incomplete-setup module with required remaining items.
6. The main dashboard and other protected dashboard routes remain blocked until completion.

### Return-Later Path

1. An incomplete user revisits a protected route.
2. The layout guard checks `x-pathname`.
3. If the path is `/dashboard/settings` or a child settings route, allow it.
4. Otherwise redirect incomplete users to `/onboarding` as the default recovery surface.
5. Settings remains the canonical completion surface once the user reaches it, and prefilled values appear where available.
6. Completing setup in settings uses the same completion action as onboarding final submit.

### Failure Path

1. Final submit enters a real pending state immediately.
2. If persistence fails, the user stays on the same logical step.
3. All entered values remain intact.
4. A top-level failure summary appears plus field-level errors when relevant.
5. The user gets a direct retry action.
6. No redirect occurs until canonical persistence succeeds.

## Shared Completion Boundary

One shared completion action owns all onboarding-critical writes. It is called by:

- onboarding final submit
- settings `Finish setup`

It is not reimplemented in both places.

### Owned fields in `profiles`

- `discipline_id`
- `reviewer_type`
- `preferred_study_window`
- `target_exam_date`
- `enrolled_review_center`
- `previous_exam_subjects_struggled`
- `onboarding_completed_at`

### Owned fields in `user_global_stats`

- `current_discipline_id`
- `target_exam_date`
- `exam_attempt_number`
- `previous_exam_result`
- `onboarding_completed_at`

### Shared action rules

- It validates required inputs for the LEA-only path.
- It checks both write results explicitly.
- It returns structured `{ success, fieldErrors, formError }`.
- It sets `onboarding_completed_at` only on successful completion.
- It performs `revalidatePath` only after success.
- It never infers completion from `current_discipline_id`.

### Required vs optional fields in the LEA-only scope

Required to complete onboarding:

- `discipline_id`
- `reviewer_type`

Required only when `reviewer_type === 'returning_reviewer'`:

- `exam_attempt_number` derived from reviewer type
- `previous_exam_result` derived from reviewer type

Optional but owned by the shared action:

- `target_exam_date`
- `preferred_study_window`
- `enrolled_review_center`
- `previous_exam_subjects_struggled`

Not required for completion in this scope:

- `display_name`
- `avatar_url`
- notifications
- theme preferences
- any `undergrad` or `dae`-specific field

### Fields outside the shared completion boundary

- `display_name`
- `avatar_url`
- theme preferences
- notifications
- other non-onboarding settings

These remain normal settings concerns and must not gate onboarding completion.

## Route Guard Contract

### Enforcement point

The allowlist is enforced in [DashboardLayoutContent.tsx](/C:/Users/Philip Lewis/Desktop/slatecamp/src/components/dashboard/DashboardLayoutContent.tsx), not in auth middleware.

Reason:

- `middleware.ts` already injects `x-pathname`.
- the existing auth/session behavior should remain unchanged
- onboarding access policy is a product/layout concern, not a session refresh concern

### Allowlist rule

- If `onboarding_completed_at` is present, allow all normal dashboard routes.
- If `onboarding_completed_at` is missing and pathname starts with `/dashboard/settings`, allow.
- If `onboarding_completed_at` is missing and pathname is any other protected dashboard route, redirect to `/onboarding`.

### Route Guard Matrix

| User state | `/onboarding` | `/dashboard/settings` | `/dashboard` | other protected dashboard routes |
| --- | --- | --- | --- | --- |
| unauthenticated | redirect to login | redirect to login | redirect to login | redirect to login |
| authenticated, incomplete | allow | allow | redirect to `/onboarding` | redirect to `/onboarding` |
| authenticated, completed | redirect away from onboarding | allow | allow | allow |

### Guard follow-up requirement

Audit and fix all helpers that still use `current_discipline_id` as a completion proxy, starting with [get-admin-profile.ts](/C:/Users/Philip Lewis/Desktop/slatecamp/src/lib/admin/get-admin-profile.ts:88).

### Skip routing note

`Skip for now` should redirect directly to `/dashboard/settings` in the current session. That immediate redirect is enough to make settings the resume surface without introducing a second persisted onboarding state.

## Chosen Study Window Fix

Use one component with two explicit modes:

- onboarding mode: controlled, no server write side effect, submits `studyWindow` in the parent form payload
- settings mode: save-on-select using `saveStudyWindow`

This is the only accepted shape for implementation. Do not keep the current “same component, same side effect everywhere” behavior.

## LEA-Only Branch Policy

For this implementation cycle:

- keep `first_taker`
- keep `returning_reviewer` because it materially changes derived stats fields
- remove or hide `undergrad`
- remove or hide `dae`
- move review-center and coexistence prompts out of onboarding if they are not required to unlock the dashboard

### Branch reduction rule

If a branch does not change completion requirements for current LEA users, it does not belong in onboarding. Move it to later profile enrichment or reintroduce it when scope returns.

## Implementation Phases

### Phase 0: Lock the contract

Deliverables:

- final LEA-only field list
- shared completion action contract
- route guard allowlist contract
- exact branch policy
- success and failure copy rules

Exit criteria:

- no unresolved ambiguity on required fields, route access, or completion ownership
- explicit confirmation that skip is not a second access state

### Phase 1: Fix reliability first

Touchpoints:

- [page.tsx](/C:/Users/Philip Lewis/Desktop/slatecamp/src/app/(auth)/onboarding/page.tsx)
- [OnboardingForm.tsx](/C:/Users/Philip Lewis/Desktop/slatecamp/src/app/(auth)/onboarding/_components/OnboardingForm.tsx)
- [CalibrationScreen.tsx](/C:/Users/Philip Lewis/Desktop/slatecamp/src/app/(auth)/onboarding/_components/CalibrationScreen.tsx)
- [StudyWindowSelector.tsx](/C:/Users/Philip Lewis/Desktop/slatecamp/src/components/settings/StudyWindowSelector.tsx)

Changes:

- validate Supabase write results
- replace blind redirect with typed result handling
- start real submit immediately on final confirmation
- preserve state on failure
- remove study-window side effects from onboarding mode
- remove non-LEA branches from the onboarding UI
- evaluate whether review-center/coexistence stays in onboarding or moves to later enrichment

Exit criteria:

- failed persistence never redirects
- final submit fires once
- failure leaves user input intact

### Phase 2: Build shared completion action

Touchpoints:

- [profile.ts](/C:/Users/Philip Lewis/Desktop/slatecamp/src/lib/actions/profile.ts)
- onboarding page/form files
- settings completion surface files

Changes:

- introduce one shared completion action
- move owned onboarding fields into that boundary
- keep non-onboarding settings actions separate

Exit criteria:

- onboarding and settings call the same completion action
- no onboarding-critical field depends on background incremental save

### Phase 3: Ship path-aware guard and skip

Touchpoints:

- [DashboardLayoutContent.tsx](/C:/Users/Philip Lewis/Desktop/slatecamp/src/components/dashboard/DashboardLayoutContent.tsx)
- [middleware.ts](/C:/Users/Philip Lewis/Desktop/slatecamp/middleware.ts)
- onboarding page/form files

Changes:

- enforce settings allowlist in layout using `x-pathname`
- add `Skip for now`
- route skip to settings
- keep incomplete users out of non-settings dashboard routes

Exit criteria:

- skip never causes an immediate loop
- incomplete users can reach settings and nowhere else in the protected dashboard

### Phase 4: Build the settings completion surface

Touchpoints:

- [settings/page.tsx](/C:/Users/Philip Lewis/Desktop/slatecamp/src/app/dashboard/settings/page.tsx)
- [profile-card.tsx](/C:/Users/Philip Lewis/Desktop/slatecamp/src/app/dashboard/settings/profile-card.tsx)
- [discipline-card.tsx](/C:/Users/Philip Lewis/Desktop/slatecamp/src/app/dashboard/settings/discipline-card.tsx)
- [StudyWindowSelector.tsx](/C:/Users/Philip Lewis/Desktop/slatecamp/src/components/settings/StudyWindowSelector.tsx)

Changes:

- add incomplete-setup banner/module at top of settings
- show required remaining items only
- prefill all known values
- add single `Finish setup` CTA
- if skip routed here, show immediate completion guidance without relying on a second persisted state

Exit criteria:

- incomplete users understand what remains immediately
- completion requires no duplicate entry of already-known values

### Phase 5: Regression coverage and instrumentation

Tests:

- step transition tests
- submit success/failure tests
- route allowlist tests
- skip path tests
- settings completion tests
- browser-level tests if the repo already has Playwright or equivalent

Instrumentation:

- `onboarding_started`
- `onboarding_step_viewed`
- `onboarding_step_completed`
- `onboarding_skip_clicked`
- `onboarding_skipped`
- `onboarding_submit_started`
- `onboarding_submit_failed`
- `onboarding_completed`
- `settings_completion_started`
- `settings_completion_completed`
- `settings_completion_failed`

## UX Acceptance Criteria

### Navigation

- Every onboarding step has a visible `Back` action unless it is the first step.
- Browser back restores the previous step without clearing entered values.
- `Skip for now` is visible as a secondary action on the first meaningful onboarding step and later.

### Progress and clarity

- The user always sees current step and total steps.
- The final action clearly indicates it will save setup.
- Pending state begins immediately after final confirmation.

### Validation and errors

- Required fields block progression until valid.
- Optional fields are explicitly labeled optional.
- Field-level validation appears beside the relevant field.
- Submit failures also show a top-level summary.
- Failure copy tells the user what failed, what was preserved, and what to do next.

### State preservation

- Values persist across step changes.
- Values persist after failed submit.
- Previously entered values are prefilled for incomplete returning users where the app has them.

### Skip behavior

- Skip never sets `onboarding_completed_at`.
- Skip routes to `/dashboard/settings`.
- Settings explains what remains and exposes one primary completion CTA.
- Skip does not create a second completion model or broaden dashboard access.

### Completion behavior

- Redirect to `/dashboard` happens only after canonical persistence succeeds.
- Completed users do not get sent back to onboarding on refresh.
- No code path uses `current_discipline_id` as proof of completion.

## Verification Plan

### Code-level verification

- Unit test the shared completion action for:
  - success
  - `profiles` write failure
  - `user_global_stats` write failure
  - partial/invalid LEA payload

- Component-test onboarding for:
  - CTA enable/disable behavior
  - back navigation
  - skip action visibility
  - state preservation after simulated submit failure

- Guard-test layout for:
  - incomplete user on `/dashboard/settings`
  - incomplete user on `/dashboard`
  - completed user on `/dashboard`

### Browser/runtime verification

- Verify final submit produces one request path and one redirect.
- Verify skip routes directly to settings without bouncing back.
- Verify settings completion unlocks `/dashboard`.
- Verify reloading after completion does not re-open onboarding.
- Verify an incomplete user who manually visits `/dashboard/settings` can complete setup without first returning through onboarding.

### Data verification

- Confirm both tables receive the expected owned fields after completion.
- Confirm skip leaves `onboarding_completed_at` null.
- Confirm `preferred_study_window` is identical between UI state and persisted completion payload.

## Risks And Edge Cases

- Schema drift:
  generated types and live tables may differ; validate before implementation

- Split persistence regression:
  any onboarding-critical field left on an independent save path will reintroduce inconsistency

- Proxy regressions:
  other helpers may still treat `current_discipline_id` as completion; audit beyond the known admin helper

- Over-preserved branching:
  keeping review-center/coexistence logic without product need will keep the flow heavier than necessary

- Hidden journey state:
  if implementation accidentally relies on an implicit skipped flag in local state or query params for access control, routing behavior will drift from the single-gate model

- Guard inconsistency:
  layout and onboarding route behavior must stay aligned or loops will persist

- Data-loss perception:
  even if state is technically preserved, poor copy or delayed feedback will still read as failure

## RALPLAN-DR Summary

### Principles

- Truthful system status beats decorative progress.
- One authoritative completion path for onboarding-critical state.
- Route policy must be explicit and narrow.
- Skip is deferral, not completion.
- LEA-only scope should reduce branches, not preserve them.

### Decision Drivers

- The current flow can silently fail and loop.
- The product needs a genuine skip-and-resume path.
- Existing code already provides the minimum mechanism for a path-aware settings allowlist.

### Viable Options

- Option A: keep `onboarding_completed_at`, enforce a settings-only allowlist, and centralize completion in one shared action
- Option B: add a broader onboarding status model
- Option C: keep forced onboarding and only harden writes

### Rejection Rationale

- Reject Option B because it adds state-model complexity the product does not currently need.
- Reject Option C because it does not satisfy the skip/resume requirement.
- Choose Option A because it solves the user problem with the smallest defensible architectural change.

## Recommended Next Step

Start with Phase 1 and Phase 2 together. The flow must become trustworthy before skip is shipped, and the shared completion boundary must exist before settings can serve as a real completion surface.
