# Problems

The performance audit identified several systemic architectural and implementation problems that still need to be addressed:

## 1. Tightly Coupled Orchestrator Components
- **`SessionShell.tsx` (610 LOC):** Currently mixes Next.js router side-effects, analytics trackers, quiz timers, localStorage persistence, and mode-specific rendering into a single massive file. This prevents reusing the timer or auto-save logic in other parts of the application.
- **`ReviewHub.tsx` & `SessionsTable.tsx`:** Both components fetch and hydrate raw DB rows, compute analytics/stats, and render UI simultaneously. This causes every render to recompute analytics and pagination state instead of delegating to dedicated hooks.

## 2. Inefficient Rendering & Memory Allocations
- **`TimelineHeatmap.tsx`:** Recomputes `visibleWeeks`, clones every row, and rebuilds the `cells` array on *every render*. For data sets with 50+ weeks, this multiplies into thousands of new objects allocated per prop change, causing noticeable UI stutter.
- **`SessionsTable.tsx`:** Manually filters, sorts, paginates, and renders rows, bypassing the optimized, virtualized pagination already provided by `shared/data-table.tsx`. This results in duplicate query loops and non-virtualized DOM updates for users with large session histories.

## 3. Shared Primitive Bypass
- Several dashboard and testing surfaces duplicate styles and logic instead of reusing the established shared primitives (`SectionHeader`, `Eyebrow`, `ScoreDisplay`, `StatCard`, `ConfirmDialog`, `DataTable`). 
- **Example:** `ResultsActions` duplicates button typography (`tracking-widest` styles) manually, and `HeroCommandBar` implemented its own readiness ring rather than using `<ScoreDisplay>`.