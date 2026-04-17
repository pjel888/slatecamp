# Dashboard Analytics

**Analysis Date:** 2026-04-06

## Overview

Student-facing analytics at `/dashboard/analytics/` provides performance tracking through 6 visualization components, all using Recharts for charting.

**Source:** `src/app/dashboard/analytics/`, `src/components/analytics/` (18 files)

## Components

| Component | Description |
|-----------|-------------|
| `ReadinessTrajectory.tsx` | Line chart — Readiness Score over time |
| `MemoryHealth.tsx` | Line chart — SRS retention curve |
| `PacingQuadrant.tsx` | Scatter/quadrant — Coverage vs. accuracy |
| `StaminaCurves.tsx` | Line chart — Performance by session duration |
| `TimelineHeatmap.tsx` | Grid heatmap — Daily activity |
| `SubjectMasteryCard.tsx` | Card — Per-subject mastery summary |

**Source:** `src/components/analytics/`

## Readiness Trajectory

Shows Readiness Score over time with:
- Period comparison overlay
- Exam readiness threshold line
- 6-sub-score breakdown on hover

**Source:** `src/components/analytics/ReadinessTrajectory.tsx`

## Pacing Quadrant

2×2 matrix positioning subjects:
- Upper-right: Master (high coverage, high accuracy)
- Upper-left: Study (low coverage, high accuracy)
- Lower-right: Focus (high coverage, low accuracy)
- Lower-left: Review (low coverage, low accuracy)

**Source:** `src/components/analytics/PacingQuadrant.tsx`

## Timeline Heatmap

GitHub-style contribution grid:
- Color intensity = activity volume
- Metrics: questions answered, study time, sessions
- Streak indicators (current + longest)
- Date range filter

**Source:** `src/components/analytics/TimelineHeatmap.tsx`

## Data Source

Analytics data computed from:
```typescript
// Server-side aggregation
quiz_sessions        // session records
session_questions    // per-question data
user_node_mastery    // taxonomy mastery
daily_user_stats     // daily aggregates
srs_queue            // review schedule
```

**Source:** `src/lib/analytics-server.ts`

---

*Dashboard analytics: 2026-04-06*
