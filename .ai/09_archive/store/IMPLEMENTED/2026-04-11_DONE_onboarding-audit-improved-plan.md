# SlateCamp Onboarding UX Audit And Execution Plan

## Problem Statement

The current `/onboarding` flow is visually acceptable but operationally weak. It can appear stuck, lose user trust, and create redirect loops because the product contract is not enforced tightly enough.

The root problems are:

- the final write path is not authoritative or observable
- the UI hides the real submit behind calibration theater
- onboarding-critical data can be written through more than one path
- skip exists as a product requirement but not yet as a fully defined user flow
- incomplete users do not yet have a controlled resume path through settings

The plan should preserve the current direction:

- `onboarding_completed_at` remains the only true completion signal
- incomplete users may access `/dashboard/settings` only
- settings becomes the canonical resume-and-complete surface
- onboarding stays LEA-only, low-branch, and minimal

## Current-State Audit

### Severity 1: Silent write failure can masquerade as success

**Finding**
`src/app/(auth)/onboarding/page.tsx` writes to `user_global_stats` and `profiles` but does not stop or surface failure before redirecting.

**Impact**
Users can finish the UI flow, get redirected, and then be sent back to onboarding because persistence never actually completed.

**User-facing consequence**
The product feels dishonest: it looks complete, but the account is still incomplete.

### Severity 1: Calibration obscures the real submit state

**Finding**
`src/app/(auth)/onboarding/_components/OnboardingForm.tsx` and `CalibrationScreen.tsx` delay the real completion path behind a staged progress screen.

**Impact**
The user cannot distinguish between:

- preparing to submit
- currently submitting
- waiting on network latency
- a broken or failed request

**User-facing consequence**
The flow reads as frozen when it is merely slow, and reads as “processing” even when nothing real has started yet.

### Severity 1: `StudyWindowSelector` creates split persistence

**Finding**
`src/components/settings/StudyWindowSelector.tsx` saves immediately through its own action.

**Impact**
Onboarding-critical data can persist independently of the canonical onboarding completion path.

**User-facing consequence**
The account can end up partially configured even when the user thinks they completed one coherent setup flow.

### Severity 2: The dashboard guard is too coarse

**Finding**
`src/components/dashboard/DashboardLayoutContent.tsx` redirects any user missing `onboarding_completed_at` back to `/onboarding`.

**Impact**
There is no controlled settings-only recovery path for incomplete users.

**User-facing consequence**
Skip cannot work without either false completion or route loops.

### Severity 2: `current_discipline_id` is already pre-seeded and cannot imply completion

**Finding**
`src/lib/supabase/bootstrap.ts` seeds Architecture into `current_discipline_id` during bootstrap.

**Impact**
Any code that infers “onboarded” from discipline presence is wrong.

**User-facing consequence**
Users can appear configured to some parts of the product while still being legitimately incomplete.

### Severity 2: Settings is not yet a true completion surface

**Finding**
Settings already has profile, discipline, theme, notifications, and exam-date surfaces, but no structured “finish setup” workflow.

**Impact**
A skip path would currently route users into a generic settings page without a clear next step.

**User-facing consequence**
Users would be allowed to defer onboarding, but not actually guided to complete it later.

### Severity 3: The flow carries more branching than current scope needs

**Finding**
The current onboarding still includes `undergrad` and `dae` branches even though the current product direction is LEA-only.

**Impact**
More branches mean more copy, more conditions, more test cases, and more failure edges.

**User-facing consequence**
The flow is longer and harder to reason about than the current product requires.

## UX Contract

## Happy Path

1. User lands on `/onboarding`.
2. The page shows clear step count and current position.
3. Only the minimum required LEA setup fields are shown.
4. The primary CTA is disabled until required fields for the current step are valid.
5. A Back action is always present after the first step.
6. `Skip for now` is visible as a secondary action.
7. On the final step, the user triggers a real submit immediately.
8. Pending UI reflects actual submission state.
9. Redirect happens only after canonical persistence succeeds.

## Skip Path

1. User clicks `Skip for now`.
2. The product states that setup can be finished later in Settings.
3. The app does not set `onboarding_completed_at`.
4. The user is routed directly to `/dashboard/settings`.
5. Settings opens with a prominent completion module at the top.
6. Broader dashboard routes remain blocked until completion.

## Return-Later Path

1. An incomplete user revisits the product.
2. Protected dashboard routes route them to the settings completion surface, not broad dashboard access.
3. Any onboarding data already captured is prefilled.
4. The completion surface clearly shows what remains.
5. Finishing setup uses the same shared completion action as onboarding.
6. After success, normal dashboard access is unlocked.

## Failure Path

1. Final submit starts immediately.
2. A pending state appears immediately with truthful copy.
3. If the write fails, the user sees:
   - a top-level error summary
   - field-level guidance where relevant
   - a retry path in place
4. All entered values remain intact.
5. No redirect occurs until persistence succeeds.

## Product Decisions

### Completion Signal

Use `onboarding_completed_at` as the only completion signal.

### Skip Model

Skip is deferral, not completion.

### Resume Model

Settings is the canonical resume-and-complete surface.

### Access Model

Incomplete users are settings-only inside the dashboard route group.

### Scope Model

The onboarding path is LEA-only for now. `undergrad` and `dae` are removed from the onboarding and settings completion flows until the product intentionally reintroduces them.

## Shared Completion Boundary

One shared completion action owns all onboarding-critical writes. Both the final onboarding submit and the settings completion CTA must call the same server-side boundary.

### Boundary location

Preferred location:
- `src/lib/actions/profile.ts`

Allowed alternative:
- a new onboarding-specific action module imported by both onboarding and settings

### Required ownership

The shared completion action owns these fields and no other path is authoritative for completion:

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

### LEA-only payload contract

Required for completion:

- `discipline_id`
- `reviewer_type`
- `preferred_study_window`

Conditionally required:

- `target_exam_date` for LEA test-taker paths that actually need pacing logic
- `enrolled_review_center` only if the chosen LEA path needs it
- `previous_exam_subjects_struggled` only for retaker-type paths that remain in scope

Not in scope for completion right now:

- `undergrad`
- `dae`

### Rules

- The completion action returns structured success and failure results.
- Redirects happen after the action resolves successfully, not inside partially validated writes.
- Incremental settings edits may still exist, but they are drafts only for onboarding-critical fields until the shared completion action finalizes completion.

## Chosen `StudyWindowSelector` Shape

Use one explicit split:

- onboarding uses `StudyWindowSelector` in controlled/form mode with no immediate save
- settings uses `StudyWindowSelector` in save-on-select mode

### Why this is the right choice

- it preserves the existing settings behavior where immediate save makes sense
- it removes split persistence from onboarding
- it keeps the component reusable without letting it remain ambiguous

### Required change

`StudyWindowSelector` must accept a controlled value and change handler for onboarding mode, and must not call `saveStudyWindow` in that mode.

## Route Guard Design

### Enforcement location

The allowlist should be enforced in `src/components/dashboard/DashboardLayoutContent.tsx`, using the `x-pathname` header already set by `middleware.ts`.

### Why layout-level enforcement is preferred

- the completion decision depends on authenticated user data already fetched in the dashboard layout
- `middleware.ts` should remain focused on session continuity and pathname propagation
- a layout-level check is easier to reason about than duplicating auth and onboarding logic earlier

### Guard rules

- unauthenticated users: redirect to auth
- completed users: allow all normal dashboard routes
- incomplete users:
  - allow `/dashboard/settings`
  - allow `/dashboard/settings/*`
  - block `/dashboard`
  - block all other protected dashboard routes
- `/onboarding` remains available to incomplete users

### Route Guard Matrix

| User state | `/onboarding` | `/dashboard/settings` | `/dashboard` | Other protected dashboard routes |
| --- | --- | --- | --- | --- |
| Unauthenticated | redirect to auth | redirect to auth | redirect to auth | redirect to auth |
| Authenticated, incomplete | allow | allow | redirect to settings completion surface | redirect to settings completion surface |
| Authenticated, completed | redirect away from onboarding | allow | allow | allow |

### Explicit anti-drift rule

No helper, reader, guard, or admin utility may use `current_discipline_id` as proof of onboarding completion.

Known correction target:
- `src/lib/admin/get-admin-profile.ts`

## LEA-Only Branch Policy

### Included in current onboarding scope

- `first_taker`
- `returning_reviewer` only if the current product still needs the retaker distinction for LEA

### Removed from current onboarding and settings completion scope

- `undergrad`
- `dae`

### Handling rule

- remove from primary onboarding UI now
- do not mirror them into settings completion
- if needed later, reintroduce them through a separate product decision with separate acceptance criteria

## Implementation Phases

## Phase 0: Lock the contract before editing code

Deliverables:

- canonical list of required completion fields
- final route-access matrix
- final LEA-only branch list
- shared completion action contract
- exact pending, success, and failure copy

Exit gate:

- no implementation starts until these inputs are fixed in the plan

## Phase 1: Make the current flow truthful and reliable

Touchpoints:

- `src/app/(auth)/onboarding/page.tsx`
- `src/app/(auth)/onboarding/_components/OnboardingForm.tsx`
- `CalibrationScreen.tsx`
- `src/components/settings/StudyWindowSelector.tsx`

Changes:

- validate all write results
- stop redirecting on failed persistence
- start real submit immediately on final confirmation
- preserve field state on failure
- prevent duplicate final submits
- move study-window value into the canonical onboarding payload

Exit gate:

- failed writes never redirect
- users see visible retry state
- submit is fired exactly once
- values remain intact after failure

## Phase 2: Build the shared completion action

Touchpoints:

- `src/lib/actions/profile.ts`
- onboarding submit call site
- settings completion call site

Changes:

- implement one shared action for completion
- write both `profiles` and `user_global_stats` through that path
- set `onboarding_completed_at` only on successful completion
- return typed success/failure payloads

Exit gate:

- onboarding and settings call the same completion action
- no onboarding-critical field depends on side-channel persistence

## Phase 3: Add skip and settings-only guard behavior

Touchpoints:

- `src/components/dashboard/DashboardLayoutContent.tsx`
- `middleware.ts`
- onboarding component files

Changes:

- add visible `Skip for now`
- route skip directly to `/dashboard/settings`
- enforce the settings-only allowlist in the dashboard layout via `x-pathname`
- block broader dashboard access until completion

Exit gate:

- skipped users never loop back immediately after skip
- skipped users cannot access protected dashboard surfaces outside settings

## Phase 4: Build the settings completion surface

Touchpoints:

- `src/app/dashboard/settings/page.tsx`
- settings card components
- `src/components/settings/StudyWindowSelector.tsx`

Changes:

- add a top-of-page incomplete setup module
- show only required remaining fields
- prefill known values
- add a single `Finish setup` CTA
- remove the incomplete module after successful completion

Exit gate:

- incomplete users understand what remains within one screen
- completion requires no duplicate re-entry of already captured values

## Phase 5: Add regression coverage and instrumentation

Tests:

- client step transition tests
- structured submit success/failure tests
- route guard tests
- skip path tests
- settings completion tests
- browser-level tests if Playwright exists

Instrumentation:

- `onboarding_started`
- `onboarding_step_viewed`
- `onboarding_step_completed`
- `onboarding_skipped`
- `onboarding_submit_started`
- `onboarding_submit_failed`
- `onboarding_completed`
- `settings_completion_started`
- `settings_completion_completed`

Exit gate:

- all critical paths are covered by tests or explicitly documented as not yet covered

## UX Acceptance Criteria

### Navigation

- every step after the first exposes a Back action
- browser back returns the prior step without discarding values
- `Skip for now` is visible as a secondary action, not hidden in tertiary copy

### Progress and clarity

- current step and total steps are always visible
- the final step clearly indicates that the next action saves setup
- pending UI begins only when the real submit begins

### Validation

- required fields block progression until valid
- optional fields are explicitly marked
- field-level validation appears near the field

### Failure handling

- submit failures show a top-level summary
- error copy states what failed and what to do next
- all answers remain intact after failure
- retry is available in place

### Skip behavior

- skip never sets `onboarding_completed_at`
- skip routes directly to settings
- settings clearly explains what remains
- broader dashboard routes remain blocked until completion

### Completion

- redirect to `/dashboard` happens only after successful canonical persistence
- completed users do not return to onboarding in normal use
- no code path uses `current_discipline_id` as completion proof

## Verification Plan

### Code verification

- confirm the shared completion action owns the required fields listed above
- confirm `StudyWindowSelector` does not save immediately in onboarding mode
- confirm dashboard layout checks both completion state and pathname
- confirm admin/profile helpers no longer infer completion from discipline

### UX verification

- manually step through happy path
- manually step through skip path
- manually step through return-later path
- manually simulate submit failure and retry behavior

### Route verification

- incomplete user can open `/dashboard/settings`
- incomplete user cannot open `/dashboard`
- incomplete user cannot open other protected dashboard routes
- completed user can open all normal routes

### Persistence verification

- failed writes do not redirect
- successful completion writes both tables coherently
- settings completion and onboarding completion produce equivalent persisted state

## Risks And Edge Cases

- schema drift between generated types and live database
- side-channel writes surviving after completion refactor
- stale helpers still inferring completion from discipline
- retaker logic becoming inconsistent if partially kept and partially removed
- route loops if settings allowlist is not enforced in exactly one place
- incomplete users reaching dashboard shells that assume fully configured state

## RALPLAN-DR Summary

### Principles

- truth over theater
- one authoritative completion path
- settings-only recovery for incomplete users
- preserve user effort on failure
- reduce branch surface to current product scope

### Decision Drivers

- the current flow can fail silently and loop users
- skip must be real without becoming fake completion
- the app already has enough infrastructure to support a path-aware recovery route

### Viable Options

- Option A: keep `onboarding_completed_at`, enforce settings-only access for incomplete users, and use one shared completion action
- Option B: add a generalized onboarding-state enum
- Option C: keep forced onboarding and only harden submit reliability

### Rejection Rationale

- reject Option B because it broadens schema and state branching beyond the actual product need
- reject Option C because it does not satisfy the skip-and-resume requirement
- choose Option A because it preserves a single completion signal while solving reliability, recovery, and deferred setup cleanly

## Final Recommendation

Implement this in order:

1. truthfulness and failure handling
2. shared completion boundary
3. settings-only skip access
4. settings completion surface
5. regression coverage and instrumentation

The core standard is simple: onboarding must become a truthful, resumable workflow with one completion path and one recovery route.
