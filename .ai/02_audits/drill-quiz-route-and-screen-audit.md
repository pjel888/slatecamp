# Drill / Quiz Route and Screen Audit

## 1. Verified Route Inventory

| Path | Component | Responsibility |
|------|-----------|----------------|
| `/dashboard/drills` | `DrillsPage` | Hub / Selection |
| `/quiz/[mode]/setup` | `QuizSetupPage` | Configuration |
| `/quiz/[mode]/session/[id]` | `QuizSessionPage` | Active Testing |
| `/quiz/.../results` | `QuizResultsPage` | Performance Reveal |
| `/quiz/.../review` | `ReviewPage` | Question Review (Note: Often redirects to results) |

## 2. Screen State Map

| State | UI Component | Trigger | Status |
|-------|--------------|---------|--------|
| Hub | `ReviewHub` | Initial Load | ✅ Verified |
| Setup | `SetupFlow` | Selection | ✅ Verified |
| Intro | `StandardQuizShell` | Session Init | ✅ Verified |
| Active | `QuizBody` | Begin | ✅ Verified |
| Feedback | `FeedbackPanel` | Submit | ✅ Verified |
| Finalizing| `CalculatingResultsOverlay` | Last Q | ✅ Verified |
| Results | `ResultsDashboard` | Finish Action | ✅ Verified |
| Review | `ReviewMode` | Enter Review | ✅ Verified |

## 3. Missing Screen States
- **Invalid Session ID**: No dedicated error page for a non-existent `sessionId`; currently triggers a generic 404.
- **Unauthorized Mode**: Attempting to access a Pro mode directly via URL doesn't show a custom "Upgrade" screen, it relies on the server action failure.

## 4. Wrong-Screen Risks
- **Mode Mismatch**: If the URL mode (`/quiz/focus-review/...`) doesn't match the DB `test_mode` (`blindspot`), the page might render the wrong shell or fail to fetch questions.

## 5. State-Machine Verdict
The state machine is primarily managed in `useQuizStore.ts` and is robust. The transitions between `active` -> `submitting` -> `feedback` -> `active` are clean.
