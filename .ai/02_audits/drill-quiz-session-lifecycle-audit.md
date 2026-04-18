# Drill / Quiz Session Lifecycle Audit

## 1. Lifecycle Path

| Stage | Action / Helper | File |
|-------|-----------------|------|
| **Start** | `startSession` | `src/lib/actions/quiz-v2/start-session.ts` |
| **Active** | `useQuizStore` | `src/stores/useQuizStore.ts` |
| **Answer** | `submitAnswer` | `src/lib/actions/quiz-v2/submit-answer.ts` |
| **End** | `endSession` | `src/lib/actions/quiz-v2/end-session.ts` |
| **Results** | `ResultsDashboard`| `src/components/quiz-v2/results/ResultsDashboard.tsx`|
| **Review** | `getReviewData` | `src/lib/actions/quiz-v2/get-review-data.ts` |

## 2. Validation Behavior
- **Input Validation**: All server actions use `zod` schemas defined in `src/lib/actions/quiz-v2/schemas.ts`.
- **Entitlement Checks**: `startSession` checks `questionsUnlimited` feature key before proceeding for Pro modes.

## 3. Risks & Integrity
- **Duplicate Submit**: Client-side `submitting` status prevents multiple clicks. Server-side uses a unique constraint on `(user_id, session_id, question_id)` in `user_interactions`.
- **Partial Failure**: If `submitAnswer` fails, the answer is queued in the store's `pendingSubmissions` (Offline Queue).
- **Stale State**: The store's `answersVersion` counter helps trigger re-renders only when necessary.

## 4. Lifecycle Verdict
The lifecycle is robustly implemented with a clear separation between optimistic client updates and authoritative server persistence.
