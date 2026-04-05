# Learnings

## 2026-04-05 Current-State Learnings

- The original performance audit contained real findings, but later repo changes removed part of the audited surface area. Reconciliation was needed more than new refactoring.
- [`QuadrantOverlay.tsx`](C:/Users/Philip Lewis/Desktop/slatecamp/src/components/analytics/QuadrantOverlay.tsx) is no longer just a planned extraction. It is already wired into the active analytics scatter charts.
- [`HeroCommandBar.tsx`](C:/Users/Philip Lewis/Desktop/slatecamp/src/components/dashboard/HeroCommandBar.tsx) no longer carries a custom readiness ring implementation. It now delegates to [`ScoreDisplay`](C:/Users/Philip Lewis/Desktop/slatecamp/src/components/shared/score-display.tsx).
- The subject-selector work described in the original audit is historical only. The current repo does not contain `SubjectDrillSelector.tsx` or `SubjectPracticeSelector.tsx`, so the leftover `useSubjectTree.ts` helper had become dead code.
- For this audit, the main risk was stale documentation claiming work was pending or implemented in ways that no longer matched the source tree.
