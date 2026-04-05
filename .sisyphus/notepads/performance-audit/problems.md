# Problems

## Resolved During Reconciliation

- Historical selector findings were stale. The codebase no longer contains `SubjectDrillSelector.tsx` or `SubjectPracticeSelector.tsx`, so the old duplication issue is not an active problem in the current tree.
- The leftover [`useSubjectTree.ts`](C:/Users/Philip Lewis/Desktop/slatecamp/src/components/dashboard/useSubjectTree.ts) helper had zero consumers and was removed.
- Multiple planning documents still described `QuadrantOverlay` as "not integrated" even though it is now used by the live analytics charts.
- Multiple planning documents still described `HeroCommandBar` as using a custom ring even though it now uses [`ScoreDisplay`](C:/Users/Philip Lewis/Desktop/slatecamp/src/components/shared/score-display.tsx).

## Residual Opportunities Outside This Reconciliation Pass

- [`SessionsTable.tsx`](C:/Users/Philip Lewis/Desktop/slatecamp/src/components/testing/hub/SessionsTable.tsx) still owns its own filtering and pagination logic instead of using the shared data-table abstraction.
- [`TimelineHeatmap.tsx`](C:/Users/Philip Lewis/Desktop/slatecamp/src/components/analytics/TimelineHeatmap.tsx) remains a candidate for targeted render optimization if it becomes a measured hotspot.
