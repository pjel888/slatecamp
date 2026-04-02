# Issues

## 2026-04-02 Inefficiency audit
- **Duplicated UI blocks:**
  - `dashboard/SubjectPracticeSelector.tsx` is a verbatim copy of `SubjectDrillSelector` and still exports `SubjectDrillSelector` (lines 31-78), so bug fixes never reach the “practice” dialog.
  - `dashboard/HeroCommandBar.tsx` reimplements a readiness ring (lines 60-170) instead of `<ScoreDisplay>`, duplicating stroke math and typography; only 5 `ScoreDisplay` imports exist vs 90 manual `tabular-nums` spans.
  - Analytics quadrants (MemoryStrength, PacingAccuracy, DifficultyMasteryScatter) each reproduce identical quadrant overlays and tooltips (e.g., MemoryStrength lines 135-179, PacingAccuracy lines 142-167), creating triple maintenance burden.
- **Tightly coupled state/business logic:**
  - `testing/session/SessionShell.tsx` (610 LOC) mixes router side effects, analytics trackers, timers, localStorage persistence, and mode-specific rendering, making it impossible to reuse timers or save logic elsewhere.
  - `testing/hub/ReviewHub.tsx` and `testing/hub/SessionsTable.tsx` both hydrate raw DB rows, compute stats, and render UI in one component, so every render recomputes analytics and pagination state instead of delegating to hooks/resuable tables.
- **Unnecessary allocations / perf hits:**
  - `analytics/TimelineHeatmap.tsx` recomputes `visibleWeeks`, clones every row, and rebuilds `cells` arrays on each render (lines 110-140); data with 50+ weeks multiplies into thousands of new objects per prop change.
  - `testing/hub/SessionsTable.tsx` manually filters, sorts, paginates, and renders rows even though `shared/data-table.tsx` already provides virtualized pagination—resulting in duplicate query loops and non-virtual DOM updates for large histories.
