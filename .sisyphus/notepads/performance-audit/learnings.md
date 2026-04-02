# Learnings

## 2026-04-02 Context survey baseline
- Dashboard hot spots are dominated by four large client components (QuickReviewModal 360 LOC, SubjectMasteryCard 356 LOC, the twin SubjectDrill/SubjectPractice selectors 335 LOC each) that embed data fetching, dialog state, and bespoke SVG logic inside a single file.
- Testing area has two huge orchestrators: SessionShell at 610 LOC (auto-save, timer, mode delegation, analytics) and SessionsTable at 464 LOC (mode mapping + confirmation flow). ReviewHub (338 LOC) and DebriefLayout (324 LOC) act as composite routers for the hub/debrief experience.
- Analytics client charts (MemoryStrengthQuadrant 291 LOC, TimelineHeatmap 267 LOC, PacingAccuracy 205 LOC, DifficultyMasteryScatter 202 LOC) share nearly identical quadrant overlays and coaching logic but live as separate bespoke implementations.
- Shared primitives (SectionHeader, Eyebrow, ScoreDisplay, StatCard, ConfirmDialog, DataTable) already standardize typography, score coloring, and confirmation flows. Many dashboard/testing surfaces still duplicate these styles (e.g., `tracking-widest` buttons in ResultsActions, custom readiness rings in HeroCommandBar) instead of reusing the shared exports.
