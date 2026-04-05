# Decisions

## 2026-04-05 Reconciliation Decisions

- Keep [`QuadrantOverlay.tsx`](C:/Users/Philip Lewis/Desktop/slatecamp/src/components/analytics/QuadrantOverlay.tsx) as the shared quadrant-label primitive for the active analytics scatter charts.
- Treat the `HeroCommandBar` readiness ring migration as resolved because [`HeroCommandBar.tsx`](C:/Users/Philip Lewis/Desktop/slatecamp/src/components/dashboard/HeroCommandBar.tsx) already renders [`ScoreDisplay`](C:/Users/Philip Lewis/Desktop/slatecamp/src/components/shared/score-display.tsx).
- Remove `useSubjectTree.ts` instead of relocating it. The selector components that motivated that hook are no longer present, so keeping the helper would preserve dead code rather than shared infrastructure.
- Refactor [`SessionsTable.tsx`](C:/Users/Philip Lewis/Desktop/slatecamp/src/components/testing/hub/SessionsTable.tsx) to use the shared [`data-table.tsx`](C:/Users/Philip Lewis/Desktop/slatecamp/src/components/shared/data-table.tsx) on desktop, while preserving the existing mobile card presentation.
- Preserve the original audit as history, but treat the refreshed plan and notepads as the current truth for this audit scope.
