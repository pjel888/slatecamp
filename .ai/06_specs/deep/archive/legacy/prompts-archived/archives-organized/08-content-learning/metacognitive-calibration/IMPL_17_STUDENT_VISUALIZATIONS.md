# IMPL_17: Student-Facing Data Visualizations

**Priority:** P1 (Calibration Curve), P2 (others)
**Effort:** ~1 week total
**Stack:** Recharts (existing), D3 for Knowledge Network Graph

All visualizations live in `src/components/analytics/` and render in the Analytics Dashboard.

---

## 1. Calibration Curve

**File:** `src/components/analytics/CalibrationCurve.tsx`

See IMPL_03 for full algorithm. This is the Recharts implementation.

```typescript
import { LineChart, Line, XAxis, YAxis, ReferenceLine, Area, Tooltip, ResponsiveContainer } from 'recharts';

// Data: from calibration_snapshots (latest)
const data = [
  { confidence: 33, actual: guessingAccuracy * 100, label: 'Guessing' },
  { confidence: 67, actual: partlyAccuracy * 100, label: 'Partly sure' },
  { confidence: 100, actual: confidentAccuracy * 100, label: 'Confident' },
];

// Perfect calibration reference line: y = x
<ReferenceLine segment={[{ x: 0, y: 0 }, { x: 100, y: 100 }]}
  stroke="var(--border-primary)" strokeDasharray="4 4" />

// Student's curve
<Line data={data} dataKey="actual" stroke="#1B3FC4" strokeWidth={2} dot={{ r: 5 }} />

// Overconfidence area: fill between student line and diagonal where student is above
// Underconfidence area: fill where student is below
```

**Coaching annotation (via ChartCoachingAnnotation):**
- If confident_accuracy < 0.7: "When you feel confident, you're right only X% of the time. Study your 'confident but wrong' topics."
- If guessing_accuracy > 0.5: "You're underestimating yourself on easy material. Trust your knowledge more."

---

## 2. Personal Forgetting Curves

**File:** `src/components/analytics/ForgettingCurves.tsx`

Per-topic estimated memory decay. Uses `decay_rate` from `user_node_mastery` (IMPL_11).

```typescript
// Generate curve data for each topic
function generateForgettingCurve(decayRate: number, daysForward = 30) {
  const points = [];
  for (let d = 0; d <= daysForward; d++) {
    const recall = Math.exp(-decayRate * d) * 100;
    points.push({ day: d, recall: Math.round(recall) });
  }
  return points;
}

// Show top 5 topics with most divergent decay rates
// Fast-decaying topics in Warm Red, slow-decaying in Emerald
```

**Chart:** Multi-line chart. X-axis = days since last review. Y-axis = estimated recall %. Horizontal line at 70% = "review threshold." Where each curve crosses 70% = optimal review date.

---

## 3. Stamina Heatmap

**File:** `src/components/analytics/StaminaHeatmap.tsx`

A time-series heatmap: rows = sessions (most recent on top), columns = question position (1st, 2nd, ... nth question), color = correct (Emerald) or incorrect (Warm Red).

```typescript
// Data: from user_interactions, grouped by session
// Each session is a row, each question position is a cell
const heatmapData = sessions.map(session => ({
  sessionId: session.id,
  date: session.completed_at,
  questions: session.interactions.map((i, index) => ({
    position: index + 1,
    correct: i.is_correct,
    timeMs: i.time_spent_ms,
  })),
}));
```

**Visual:** Grid of small colored cells. Patterns visible: "accuracy drops after question 40" (vertical line of red cells at position 40 across multiple sessions). Coaching annotation detects the fatigue point.

**Implementation:** Use SVG grid (not Recharts — this is a custom heatmap). Each cell is a small `<rect>` element.

---

## 4. Topic Difficulty vs. Mastery Scatter

**File:** `src/components/analytics/DifficultyMasteryScatter.tsx`

```typescript
// Each dot = one taxonomy node
const scatterData = nodes.map(n => ({
  difficulty: n.avg_difficulty, // Average IRT difficulty of questions in this node
  mastery: n.current_mastery_weight * 100,
  name: n.topic_name,
  topicId: n.topic_id,
}));
```

**Quadrants:**
- Top-right: Hard + Mastered → "Your strengths" (Emerald background)
- Top-left: Easy + Mastered → "Move on" (light gray)
- Bottom-right: Hard + Weak → "Priority targets" (Warm Red background)
- Bottom-left: Easy + Weak → "Quick fixes" (Amber background)

**Interactivity:** Click any dot → popover with topic details + "Start Session" CTA targeting that topic.

---

## 5. Study Velocity Tracker

**File:** `src/components/analytics/StudyVelocity.tsx`

Rate of new nodes mastered per week over time.

```typescript
// Query: count nodes where current_mastery_weight crossed 0.7 threshold per week
const velocityData = weeks.map(week => ({
  week: week.label,
  nodesMastered: week.newGreenNodes,
  nodesAttempted: week.newAttemptedNodes,
}));
```

**Chart:** Bar chart (Recharts). Each bar = nodes mastered that week. Trend line overlaid.

**Coaching:** "You're mastering 4 nodes/week. At this pace, you'll cover the full syllabus by [date]." Or: "Your pace dropped from 6 to 2 nodes/week. Consider increasing daily study time."

---

## 6. Pacing vs. Accuracy Trade-off

**File:** `src/components/analytics/PacingAccuracy.tsx`

```typescript
// Each dot = one session
const data = sessions.map(s => ({
  avgTimePerQuestion: s.total_time_ms / s.question_count / 1000, // seconds
  accuracy: s.score_percentage,
  mode: s.config.mode,
}));
```

**Chart:** Scatter plot. X-axis = avg seconds per question. Y-axis = accuracy %. Reference lines: vertical line at ALE target pace (120 seconds), horizontal line at passing threshold (75%).

**Optimal zone:** Top-left quadrant (fast + accurate). Students see where they cluster and what direction to move.

---

## 7. Knowledge Network Graph

**File:** `src/components/analytics/KnowledgeGraph.tsx`

Uses D3 force-directed layout. Nodes = taxonomy topics. Edges = co-failure relationships (from `confusion_pairs` table, IMPL_09).

```typescript
import * as d3 from 'd3';

// Nodes: all taxonomy nodes with mastery data
// Edges: confusion_pairs where co_failure_rate > 0.3
// Node color: mastery level (Red/Amber/Green)
// Node size: number of questions attempted
// Edge thickness: co_failure_rate strength
```

**Interactivity:** Hover node → show topic name + mastery. Click node → open detail panel with "Start Session" CTA. Clusters of connected red nodes = "concept gaps" that need systematic attention.

**Note:** This is computationally intensive. Only render for users with 50+ attempted nodes. Show a simpler list view for newer users.

---

## 8. Exam Countdown Dashboard

**File:** `src/components/analytics/ExamCountdown.tsx`

A focused summary widget:

```
┌──────────────────────────────────────────┐
│  📅 47 days until ALE                    │
│                                          │
│  Readiness Score: 71 → projected 78      │
│  (based on current +1.5 pts/week pace)   │
│                                          │
│  🔴 12 nodes still in Red                │
│  ⬜ 8 nodes unexplored                   │
│  📝 Daily dose needed: 30 min/day        │
│                                          │
│  At current pace: Likely Pass ✓          │
│  To be safe (RS ≥ 85): 45 min/day       │
└──────────────────────────────────────────┘
```

**Projection logic:** Linear extrapolation of Readiness Score trend over last 4 weeks. Show both "likely" and "safe" projections.

---

## Data Queries — Shared Utility

**File:** `src/lib/actions/analytics/chart-data.ts`

Centralize all chart data fetching. Use parallel queries (existing pattern from dashboard — 16 concurrent queries). Cache aggressively since analytics data updates at most once per session.

```typescript
export async function getAnalyticsDashboardData(userId: string) {
  const [
    calibrationData,
    forgettingData,
    staminaData,
    scatterData,
    velocityData,
    pacingData,
    countdownData,
  ] = await Promise.all([
    getCalibrationCurveData(userId),
    getForgettingCurveData(userId),
    getStaminaHeatmapData(userId),
    getDifficultyMasteryData(userId),
    getStudyVelocityData(userId),
    getPacingAccuracyData(userId),
    getExamCountdownData(userId),
  ]);

  return { calibrationData, forgettingData, staminaData, scatterData, velocityData, pacingData, countdownData };
}
```
