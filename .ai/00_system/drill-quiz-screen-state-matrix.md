# Drill / Quiz Screen State Matrix

**Date:** 2026-04-18
**Status:** In-Progress Audit Matrix

## 1. UX State Inventory

| Screen/State ID | Route | Trigger Condition | Expected UI State | Implementation File(s) | Status |
|-----------------|-------|-------------------|-------------------|------------------------|--------|
| Hub / Landing | `/dashboard/drills` | Page Load | Mode selection hub | `ReviewHub.tsx` | Code-proven |
| Mode Setup | `/quiz/:mode/setup` | User selects mode | Configuration options | `setup/page.tsx` | Code-proven |
| Locked / Gated | `/dashboard/drills` | Free tier / Low readiness | Locked mode indicator | `ReviewHub.tsx` | Code-proven |
| Intro / Ready | `/quiz/:mode/session/:id` | Session initialized | Intro slide or "Ready" state | `BaseQuizShell.tsx` | Code-proven |
| Loading Session | `/quiz/:mode/session/:id` | Page Load / Init | Question skeleton | `QuestionSkeleton.tsx` | Code-proven |
| Active Question | `/quiz/:mode/session/:id` | Session Start / Next | Question stem + options | `QuizBody.tsx`, `QuizOption.tsx` | Code-proven |
| Answer Selected | `/quiz/:mode/session/:id` | User taps option | Highlighted option + SlideToSubmit | `QuizOption.tsx`, `SlideToSubmit.tsx` | Code-proven |
| Answer Submitting| `/quiz/:mode/session/:id` | Slide completed | Spinner / Disabled states | `SlideToSubmit.tsx`, `useQuizStore.ts` | Code-proven |
| Answer Feedback | `/quiz/:mode/session/:id` | Correctness returned | FeedbackPanel (immediate) | `FeedbackPanel.tsx` | Code-proven |
| Gated Delay | `/quiz/:mode/session/:id` | Feedback visible | Next button disabled for N ms | `FeedbackPanel.tsx` | Code-proven |
| Session Finalizing| `/quiz/:mode/session/:id` | End Session Trigger | CalculatingResultsOverlay | `CalculatingResultsOverlay.tsx`| Code-proven |
| Results Summary | `/quiz/.../results` | Session End | Score reveal + analytics | `ResultsDashboard.tsx` | Code-proven |
| Question Review | `/quiz/.../review` | Enter Review | Annotated question palette | `ReviewMode.tsx` | Code-proven |
| Network Failure | Any | Action fails (Fetch Error) | Offline banner / Error toast | `useQuizStore.ts` | Code-proven |
| Invalid Session | `/quiz/.../:id` | Session not found | Redirect to hub / 404 state | ⚠️ NEEDS VERIFICATION | Inferred |
| Timer Warning | `/quiz/.../session` | Time < 20% | Highlighted timer ticker | `TimerDisplay.tsx` | Code-proven |
| Micro Break | `/quiz/.../session` | N questions answered | MicroBreakOverlay | `MicroBreakOverlay.tsx` | Code-proven |

## 2. Transition Logic Verdicts

- **Session Start**: Verified in `start-session.ts` and `setup/page.tsx`.
- **Answer Submission**: Verified in `submit-answer.ts` and `useQuizStore.ts`.
- **Session End**: Verified in `end-session.ts`.
- **Navigation (Prev/Next)**: Handled via `useQuizStore.ts` and `QuizFooter.tsx`.
- **Feedback Dismissal**: Gated by timer in `FeedbackPanel.tsx`.
