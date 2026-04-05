# Analytics Dashboard

**Analysis Date:** 2026-04-06

## Overview

The Analytics Dashboard provides students with data-driven insights into their ALE preparation. All visualizations use Recharts, and data is sourced from Supabase via server components. The student-facing analytics portal lives under `/dashboard/analytics/`.

**Source:** `src/components/analytics/` (18 files), `src/app/dashboard/analytics/`

## Visualization Components

| Component | Chart Type | Purpose |
|----------|-----------|---------|
| `ReadinessTrajectory.tsx` | Line/Area chart | Readiness Score over time |
| `MemoryHealth.tsx` | Line chart | SRS retention curve |
| `PacingQuadrant.tsx` | Scatter/Quadrant | Coverage vs. Accuracy positioning |
| `StaminaCurves.tsx` | Line chart | Session timing patterns |
| `TimelineHeatmap.tsx` | Heatmap grid | Daily activity (GitHub-style) |
| `SubjectMasteryCard.tsx` | Card | Per-subject mastery display |
| `ActivityFeed.tsx` | List | Recent study activity |

**Source:** `src/components/analytics/`

## Readiness Trajectory

Shows the student's Readiness Score over time:
- X-axis: Time (daily/weekly/monthly)
- Y-axis: Readiness Score (0–100)
- Bands: Exam Ready, Strong, Getting There, Building Momentum, Needs Work
- Comparison: Previous period overlay

**Source:** `src/components/analytics/ReadinessTrajectory.tsx`

## Memory Health (SRS Curve)

Visualizes the spaced repetition schedule health:
- Ideal retention rate curve
- Actual retention based on review history
- Upcoming review load
- SRS health sub-score component of Readiness Score

**Source:** `src/components/analytics/MemoryHealth.tsx`

## Pacing Quadrant

Positions subjects on a 2×2 matrix:
- X-axis: Coverage (how much of the subject has been practiced)
- Y-axis: Accuracy (correct answer rate in that subject)
- Quadrants: Master (high coverage + high accuracy), Study (low coverage), Focus (high coverage + low accuracy), Review (low coverage + low accuracy)

**Source:** `src/components/analytics/PacingQuadrant.tsx`

## Stamina Curves

Tracks performance across different session lengths:
- Average score by session duration
- Time-of-day performance patterns
- Fatigue indicators
- Optimal session length recommendations

**Source:** `src/components/analytics/StaminaCurves.tsx`

## Timeline Heatmap

Daily activity visualization (GitHub contribution graph style):
- Color intensity = study activity volume
- Activity metrics: questions answered, study time, sessions completed
- Streak tracking (current + longest)
- Date range filtering

**Source:** `src/components/analytics/TimelineHeatmap.tsx`

## Dashboard Hero Integration

The main dashboard (`/dashboard/page.tsx`) embeds key analytics:
- **Readiness Score** in hero command bar
- **Taxonomy Heatmap** (color-coded node grid)
- **Subject Mastery Cards** (per-subject performance)
- **Activity Feed** (recent sessions and reviews)
- **Streak Ribbon** (study consistency tracking)
- **SRS Review Widget** (upcoming reviews)

**Source:** `src/app/dashboard/page.tsx`, `src/components/dashboard/`

## Data Sources

Analytics data is computed from:
- `quiz_sessions` — session records and timing
- `session_questions` — per-question performance
- `user_node_mastery` — taxonomy mastery per node
- `daily_user_stats` — aggregated daily activity
- `srs_queue` — upcoming review schedule

**Source:** `src/lib/analytics-server.ts` (server-side computation)

## CEO Analytics

Business-level analytics in the CEO portal use a separate data layer:

| View | Metrics |
|------|---------|
| Command Center | MRR, ARR, monthly revenue, cash on hand |
| Financials | Revenue vs. expenses, P&L by category |
| Behavioral Insights | DAU/WAU/MAU, cohort retention, churn risk |
| Team | Department costs, team size, resource allocation |

**Source:** `src/components/ceo/`, `src/lib/queries/ceo/`

### CEO Chart Colors

```typescript
const CEO_CHART_COLORS = {
  revenue: '#2D9F6F',     // Emerald
  expenses: '#D64545',    // Warm Red
  profit: '#1B3FC4',     // Camp Cobalt
  projection: '#E8853A', // Camp Orange
};
```

**Source:** `src/types/ceo.ts`

---

*Analytics dashboard analysis: 2026-04-06*
