# Drill / Quiz Readiness Checklist

## 1. Feature Pre-Flight (Hardening Phase)
- [ ] `endSession` DB calls parallelized or moved to background.
- [ ] `CalculatingResultsOverlay` shows granular progress messages.
- [ ] `FeedbackPanel` shows visual "progress" on the Next button during gated delay.
- [ ] `SyncStatus` icon visible on mobile in `QuizHeader`.
- [ ] Zod schemas for CAGE behavioral data are strict (`GestureSignalEvent`).
- [ ] DB check constraints added for `accuracy`, `difficulty`, and `score`.

## 2. Structural Readiness (Unification Phase)
- [ ] All `MODE_KEYS` unified to a single format (underscored).
- [ ] Database `TEST_MODE` enum updated to match unified keys (`focus_review`, `full_exam`, etc.).
- [ ] `blindspot_queues` table renamed to `focus_review_queues`.
- [ ] `user_global_stats` and `quiz_sessions` columns normalized (e.g., `is_full_exam`).
- [ ] Next.js redirects mapped for legacy URLs (e.g., `/quiz/focus-review` → `/quiz/focus_review`).
- [ ] Mapping layer removed from `start-session.ts` (Absolute Unification complete).
- [ ] Zustand `migrate` function implemented in `useQuizStore`.

## 3. Deployment Safety
- [ ] **Data Safety**: Offline submissions in `localStorage` can still be submitted during migration.
- [ ] **Infrastructure**: Readiness Score recompute doesn't trigger a 504 timeout on the server (Timeout limit checked).
- [ ] **Monitoring**: Alert set up for "Invalid Mode" or "Schema Parse Error" in quiz actions.

## 4. Final Verdict Checklist (Post-Implementation)
- [ ] Can a student complete a session from start to finish?
- [ ] Is the "See Results" lag visually explained via progress messages?
- [ ] Does the "Saved" status appear reliably on mobile?
- [ ] Do analytics still show correct mode breakdowns?
- [ ] Does the readiness score update accurately?

**Current Readiness Status: AUDIT COMPLETE — AWAITING HARDENING RUN.**
