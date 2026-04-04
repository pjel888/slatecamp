# Problems

The performance audit identified several systemic architectural and implementation problems:

## 1. Tightly Coupled Orchestrator Components
- **`testing/session/SessionShell.tsx` (610 LOC):** Mixes Next.js router side effects, analytics trackers, quiz timers, localStorage persistence, and mode-specific rendering into a single massive file, making it impossible to reuse timers or save logic elsewhere.
- **`testing/hub/ReviewHub.tsx` & `testing/hub/SessionsTable.tsx`:** Both components fetch and hydrate raw DB rows, compute stats, and render UI simultaneously. Every render recomputes analytics and pagination state instead of delegating to dedicated hooks or reusable tables.

## 2. Inefficient Rendering & Memory Allocations
- **`analytics/TimelineHeatmap.tsx`:** Recomputes `visibleWeeks`, clones every row, and rebuilds the `cells` array on *every render* (lines 110-140). For data sets with 50+ weeks, this multiplies into thousands of new objects allocated per prop change, causing noticeable UI stutter.
- **`testing/hub/SessionsTable.tsx`:** Manually filters, sorts, paginates, and renders rows, bypassing the optimized, virtualized pagination already provided by `shared/data-table.tsx`. This results in duplicate query loops and non-virtualized DOM updates for users with large session histories.

## 3. Duplicated UI Blocks & Shared Primitive Bypass
- **Component Duplication:** `dashboard/SubjectPracticeSelector.tsx` is a verbatim copy of `SubjectDrillSelector` and still exports `SubjectDrillSelector` (lines 31-78), so bug fixes never reach the “practice” dialog.
- **Analytics Quadrants:** MemoryStrength, PacingAccuracy, and DifficultyMasteryScatter each reproduce identical quadrant overlays and tooltips (e.g., MemoryStrength lines 135-179, PacingAccuracy lines 142-167), creating triple maintenance burden.
- **Bypassing Design System:** Several dashboard and testing surfaces duplicate styles and logic instead of reusing the established shared primitives (`SectionHeader`, `Eyebrow`, `ScoreDisplay`, `StatCard`, `ConfirmDialog`, `DataTable`). For example, `ResultsActions` duplicates button typography (`tracking-widest` styles) manually, and `dashboard/HeroCommandBar.tsx` reimplements a readiness ring (lines 60-170) instead of using `<ScoreDisplay>`, duplicating stroke math and typography (only 5 `ScoreDisplay` imports exist vs 90 manual `tabular-nums` spans).