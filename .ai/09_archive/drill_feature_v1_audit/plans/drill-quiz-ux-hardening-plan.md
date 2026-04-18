# Drill / Quiz UX Hardening Plan

## 1. Objective
Improve user trust and reduce perceived lag by enhancing feedback mechanisms, clarifying transitions, and providing consistent state visibility across devices.

## 2. Linked Findings
- **Q-003**: Missing Invalid Session State
- **UX-001**: "See Results" perceived lag (Static overlay)
- **UX-002**: Hidden sync status on mobile

## 3. Implementation Sequence

### Phase 1: Clarifying Transitions (Progress Visualization)
- **Task 1.1**: Update `CalculatingResultsOverlay` to accept an array of progress messages.
- **Task 1.2**: Implement a message cycle (e.g., 2s intervals) in the overlay:
  - "Computing Readiness Score..."
  - "Analyzing Mastery by Subject..."
  - "Finalizing Recommendations..."
- **Task 1.3**: (Optimization) Parallelize `recomputeAndSaveReadinessScore` and `generateRecommendations` where possible.

### Phase 2: Ubiquitous State Feedback
- **Task 2.1**: Modify `QuizHeader.tsx` to show the `SyncStatus` icon on all screen sizes. Hide the text label on small screens.
- **Task 2.2**: Ensure `SyncStatus` transitions between `'saving'` and `'saved'` are smooth (e.g., brief opacity fade).

### Phase 3: Feedback & Error Handling
- **Task 3.1**: Add a visual "progress bar" or "pulsing state" to the Next button during the gated delay in `FeedbackPanel.tsx`.
- **Task 3.2**: Create a dedicated `src/app/quiz/[mode]/session/[sessionId]/not-found.tsx` with clear "Return to Dashboard" action.

## 4. Risks
- Adding more UI elements to the overlay might increase bundle size slightly.
- Complex error pages need to handle auth state correctly to avoid redirect loops.
