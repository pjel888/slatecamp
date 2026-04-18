# Drill / Quiz Network Contract Matrix

**Date:** 2026-04-18
**Status:** In-Progress Audit Matrix

## 1. Action / API Contracts

| Flow | UI Caller | Action / API Path | Request Schema | Response Schema | DB Touchpoints |
|------|-----------|-------------------|----------------|-----------------|----------------|
| Session Start | `HeroConfigurator.tsx` | `startSession` | `startSessionInputSchema` | `StartSessionResult` | `quiz_sessions` (INSERT), `user_subscriptions` (READ) |
| Answer Submit | `SlideToSubmit.tsx` | `submitAnswer` | `submitAnswerInputSchema` | `SubmitAnswerResult` | `user_interactions` (UPSERT), `user_question_states` (UPDATE) |
| Session End | `BaseQuizShell.tsx` | `endSession` | `endSessionInputSchema` | `EndSessionResult` | `quiz_sessions` (UPDATE), `user_global_stats` (UPDATE) |
| Review Load | `ReviewMode.tsx` | `getReviewData` | `{ sessionId: string }` | `ReviewDataResult` | `quiz_sessions` (READ), `user_interactions` (READ) |
| Pause / Resume| `QuizHeader.tsx` | `pauseSession` / `resumeSession` | `{ sessionId: string }` | `{ success: boolean }` | `quiz_sessions` (UPDATE config) |

## 2. Schema Mismatch Risks

- **Mode Keys**: Difference between UI keys (`focus-review`) and DB/engine keys (`focused`). Handled by mapping in `start-session.ts` and `ReviewHub.tsx`.
- **CAGE Tokens**: `cageToken` and `signalTrace` in `submitAnswerInputSchema` are marked as `optional()` and `z.unknown()`. This is a loose contract for highly sensitive data.
- **Results Payload**: `EndSessionResult` carries a large nested object including `subjectBreakdown` and `recommendations`. Risk of payload size issues for 200Q sessions.

## 3. Error Shapes

- **Standard Error**: `{ success: false, error: string, message: string }`
- **Tier Gating**: `errorCode: 'PRO_MODE_REQUIRED'` returns `upgradeUrl` and tier info.
- **No Questions**: `errorCode: 'NO_QUESTIONS'` triggered if intelligent routing finds no matches.
