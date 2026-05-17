# Signup and Onboarding Redesign Plan — 2026-05-07

Audit time: 2026-05-07 19:42:14 PST
Branch: `feat/landing-3d-hero-best-representation`
Status: implementation-ready plan, not yet coded

## 1. Goal

Redesign SlateCamp signup and onboarding so the first post-click experience matches the new landing-page promise:

- SlateCamp is a supplementary architecture study companion, not a primary review center replacement.
- The user wants assurance, comfort, knowledge, reliability, and a clear next step — not SRS, active-recall, IRT, or algorithm jargon.
- The flow should feel like the dashboard visual system: illustrated, calm, structured, and premium.
- The UI must be componentized, not a monolithic onboarding form.
- Artwork/image slots must be first-class parts of the layout.

## 2. Current state inspected

Live files inspected for this plan:

- `src/app/(auth)/onboarding/page.tsx`
- `src/app/(auth)/onboarding/_components/OnboardingForm.tsx`
- `src/app/(auth)/onboarding/_components/ReviewCenterStep.tsx`
- `src/app/(auth)/onboarding/_components/CoexistenceScreen.tsx`
- `src/app/(auth)/onboarding/_components/CalibrationScreen.tsx`
- `src/components/dashboard/WelcomeGuide.tsx`
- `src/components/dashboard/DashboardLayoutContent.tsx`
- `src/components/marketing/HeroSection.tsx`
- `.ai/02_audits/2026-05-05-landing-page-audit.md`
- `.ai/03_plans/2026-05-07-landing-final-audit.md`

Current implementation notes:

- `/onboarding` is a server route that bootstraps the authenticated user, loads disciplines and level-1 taxonomy subjects, then renders `OnboardingForm` inside a narrow `max-w-md` card.
- `OnboardingForm` already has a multi-step state machine: `main`, `review_center`, `coexistence`, and `calibrating`.
- The flow already asks useful data: discipline, reviewer type, exam date, struggled subjects, study window, enrolled review center, and review-center coexistence.
- The current layout is functional but visually generic; it does not yet feel like the dashboard or the new landing page.
- The current form is mostly one large client component. It should be split into smaller presentation and flow components.

## 3. Positioning rule for onboarding copy

Do not sell the user on methods. Calmly orient them.

Avoid front-facing copy such as:

- `SRS`
- `spaced repetition`
- `active recall`
- `SM-2`
- `IRT`
- `EMA`
- `adaptive algorithm`
- `taxonomy graph`

Use student-centered copy:

- `Know where you stand.`
- `See what stuck after lecture.`
- `Find what to fix next.`
- `Use SlateCamp beside your review center.`
- `Turn confusing topics into a plan.`
- `You are not replacing JPT, CDEP, school, books, or mentors — you are checking what stayed with you.`

Fear-marketing boundary:

- Allowed: `The danger is not having weak spots. The danger is finding them too late.`
- Required follow-up: immediately offer control through a free diagnostic, source-backed explanations, weak-topic map, or next session.
- Not allowed: pass guarantees, shame toward retakers, claims that review centers are inadequate, or official-source framing.

## 4. Desired flow

### Step 0 — Account created / welcome bridge

Purpose: reduce anxiety and confirm the promise.

Screen copy:

- Heading: `Welcome to SlateCamp.`
- Subheading: `Let’s set up your study companion so your dashboard knows what to help with first.`
- Trust line: `This will not replace your review center, school, books, or mentors. It helps you check what stuck and what to fix next.`

Primary action:

- `Set up my dashboard`

Artwork slot:

- Square artwork beside the SlateCamp logo, matching dashboard style.
- Suggested visual: illustrated desk, code book, model/3D lot envelope, notebook, and warm light.

### Step 1 — Study context

Purpose: collect the user’s exam/study situation without sounding clinical.

Fields:

- Discipline / track
- Reviewer type: first taker or returning reviewer
- Target exam date
- Preferred study window

Copy:

- `Where are you in the journey?`
- `This helps SlateCamp choose the first dashboard cards and reminders.`

Artwork slot:

- Small side panel: `Your map starts here` with illustrated route pins from `Lecture → Practice → Repair → Dashboard`.

### Step 2 — Confidence and weak areas

Purpose: help users name uncertainty without shame.

Fields:

- Struggled subjects/topics, especially for returning reviewers.
- Optional confidence selector: `I feel lost`, `I know some topics`, `I need exam polish`, `I am retaking with a plan`.

Copy:

- `No weak topic is a failure. It is just the next repair target.`
- `Pick anything that feels shaky. You can change this later.`

Artwork slot:

- Illustrated cards: `Code`, `Design`, `Professional Practice`, `Building Tech`, etc.

### Step 3 — Review center relationship

Purpose: explicitly position SlateCamp as a supplementary buddy.

Fields:

- Enrolled review center: JPT, CDEP, other, none.
- Optional text for other.

Copy:

- `Review centers teach. SlateCamp helps you check what stuck.`
- `Use this after lectures, mock exams, and self-study to know what to repair next.`

Design:

- Keep existing review-center coexistence concept, but make it visually reassuring rather than defensive.
- Do not imply SlateCamp competes with or replaces the center.

Artwork slot:

- Split illustration: review-center lecture board on one side, SlateCamp readiness map on the other.

### Step 4 — Calibration / readiness setup

Purpose: create anticipation and clarity before dashboard redirect.

Copy:

- `Building your first study map...`
- `Preparing your dashboard, weak-topic space, and first recommended action.`

After success:

- Redirect to dashboard or a dedicated `/dashboard/welcome-pro`/score setup page, depending on existing product decision.

Artwork slot:

- Animated/illustrated loading card using dashboard background image treatment.

## 5. Component architecture

Target directory:

- `src/app/(auth)/onboarding/_components/`

Recommended components:

- `OnboardingShell.tsx`
  - Owns two-column responsive layout.
  - Left/content column for form steps.
  - Right/art column for artwork slots, trust notes, and progress.

- `OnboardingBrandPanel.tsx`
  - Square artwork beside logo.
  - Uses dashboard-style illustrated background.
  - Displays `Study companion` trust line.

- `OnboardingProgressRail.tsx`
  - Steps: `Welcome`, `Context`, `Weak spots`, `Review center`, `Ready`.
  - Should be compact on mobile.

- `OnboardingArtworkSlot.tsx`
  - Reusable wrapper for image/artwork modules.
  - Props: `variant`, `title`, `description`, `children`, optional image path.

- `OnboardingStepCard.tsx`
  - Shared card primitive for each step.
  - Props: `eyebrow`, `title`, `description`, `actions`, `children`.

- `StudyContextStep.tsx`
  - Extract current discipline/reviewer/exam-date/study-window UI.

- `WeakSpotsStep.tsx`
  - Extract struggled-subject picker and optional confidence selector.

- `ReviewCenterCompanionStep.tsx`
  - Merge/refine `ReviewCenterStep` and relationship copy.

- `CompanionPositioningPanel.tsx`
  - Reusable block explaining `review centers teach; SlateCamp checks what stuck`.

- `CalibrationStep.tsx`
  - Refine current `CalibrationScreen` into dashboard-style visual.

Keep the existing data/server action contracts initially:

- `completeOnboardingSetup(formData)`
- `skipOnboarding()`
- analytics events already emitted by `OnboardingForm`

Refactor behavior after visual/component extraction is stable.

## 6. Visual language

Use the dashboard/landing visual language consistently:

- Full-screen illustrated background, not plain muted gray.
- Large rounded cards with `bg-card`, `border-border`, `shadow-sm`, and controlled accent color.
- Square art tile beside the SlateCamp logo at the top of the shell.
- Warm `camp-amber` accent for guidance and route/progress markers.
- `camp-cobalt` for primary CTA.
- Subtle blueprint/grid/dotted overlays for the architecture identity.
- Artwork slots should work even before final artwork is ready: use gradient placeholders with clear labels like `Artwork slot: readiness map`.

Responsive behavior:

- Desktop: two-column layout, form card left, visual companion panel right.
- Tablet: stacked but keep progress visible.
- Mobile: single-column, artwork becomes compact header tile, progress becomes horizontal step chips.

## 7. Acceptance criteria

Implementation is done when:

- `/onboarding` no longer renders as a narrow generic card on an empty muted page.
- The flow is visibly connected to the dashboard/landing design system.
- The first screen explicitly says SlateCamp supplements review centers, books, school, and mentors.
- The user can complete the same onboarding data as before.
- Existing analytics events are preserved or intentionally renamed with migration notes.
- Artwork/image slots exist as components even if final images are placeholders.
- No user-facing onboarding copy relies on SRS/active-recall/quizzing-method jargon.
- No pass guarantees or review-center replacement claims are introduced.
- Type-check and targeted onboarding/landing DOM tests pass.

## 8. Suggested implementation sequence

1. Create `OnboardingShell`, `OnboardingBrandPanel`, `OnboardingArtworkSlot`, `OnboardingStepCard`, and `OnboardingProgressRail` as pure UI components.
2. Wrap the existing `OnboardingForm` with the shell without changing behavior.
3. Extract the `main` step into `StudyContextStep` and `WeakSpotsStep` while keeping state in `OnboardingForm`.
4. Rename/refine review-center UI into `ReviewCenterCompanionStep` and preserve current form field names.
5. Replace `CalibrationScreen` visuals with dashboard-style `CalibrationStep`.
6. Add DOM tests for first-screen copy, review-center companion copy, required field validation, and successful submit redirect.
7. Run `bun run test:dom`, `bun run type-check`, `bun run lint`, and a manual route smoke check.

## 9. Open decisions

- Whether signup should land on `Step 0 — welcome bridge` or go straight to `Step 1 — study context` with the welcome bridge embedded in the shell.
- Whether to use existing `/dashboard/welcome-pro` after onboarding or redirect directly to `/dashboard`.
- Final artwork source: dashboard image derivatives, custom illustration, or generated placeholder assets committed under `public/images/onboarding/`.
- Whether confidence selector should be persisted immediately or initially used only to shape front-end recommendations.
