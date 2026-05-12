# IMPL_14: Progress Proof System & Outcome Correlation

**Priority:** P1
**Effort:** ~3 days
**Research basis:** Progress visibility is a core retention driver. Passer outcome correlation is the ultimate product validation metric.

---

## Monthly Progress Report

### Auto-Generated Monthly Summary

**File:** `src/lib/actions/progress-report/generate.ts`

Generated on the 1st of each month (pg_cron) for all active users.

```typescript
interface ProgressReport {
  period: { start: Date; end: Date };
  questionsAnswered: number;
  sessionsCompleted: number;
  studyMinutes: number;
  nodesMovedRedToGreen: number;
  nodesMovedRedToAmber: number;
  readinessScoreChange: number; // delta from start to end of period
  calibrationScoreChange: number;
  weakestNodes: { topicId: string; topicName: string; mastery: number }[];
  strongestImprovement: { topicId: string; topicName: string; delta: number }[];
  streakDays: number;
}
```

### Sharable Progress Card

**File:** `src/components/analytics/ProgressCard.tsx`

A visually clean, branded card designed for sharing on social media:

```
┌─────────────────────────────────────────┐
│  ⛺ SlateCamp · March 2026 Progress     │
│                                          │
│  📊 312 questions answered               │
│  📈 Readiness Score: 58 → 71 (+13)      │
│  🟢 9 topics moved to Mastered           │
│  🎯 Calibration accuracy: improved 18%   │
│                                          │
│  "Every question moves the needle."      │
│  ─────────────────────────────────────── │
│  slatecamp.com                           │
└─────────────────────────────────────────┘
```

**Export options:**
- Download as PNG (for Instagram/Facebook)
- Copy link to shareable web page
- Share directly to social (Web Share API on mobile)

### Notification Delivery

Push notification on the 1st: "Your March progress report is ready. You mastered 9 new topics."

---

## Simulation Improvement Tracking

**File:** `src/components/analytics/SimulationTrajectory.tsx`

Track performance across Full Exam Simulations. Show as a trajectory chart:

```
Score
100% ┤
 80% ┤                          ●  Sim 4: 78%
 70% ┤              ●  Sim 3: 72%
 60% ┤    ●  Sim 2: 64%
 50% ┤  ●  Sim 1: 52%
     └──────────────────────────── Time
```

**Data query:**
```sql
SELECT
  qs.id,
  qs.completed_at,
  qs.score_percentage,
  qs.config->>'mode' as mode
FROM quiz_sessions qs
WHERE qs.user_id = $1
  AND qs.config->>'mode' IN ('proof_sim', 'storm')
  AND qs.status = 'completed'
  AND (qs.config->>'questionCount')::int >= 50
ORDER BY qs.completed_at ASC;
```

Coaching annotation: "You've improved from 52% to 78% across 4 simulations. At this trajectory, you'll likely pass."

---

## Passer Outcome Correlation

### The Ultimate Validation

After the first ALE exam cycle where SlateCamp users sit the exam:

1. **Post-exam survey:** After ALE results day, prompt users: "Did you pass? What was your score?" (Voluntary, incentivized with 1 month free)
2. **Correlation analysis:** Plot Readiness Score at exam day vs. actual ALE result
3. **Publication:** If Pearson r ≥ 0.7, this becomes the hero chart for all marketing

### Schema

```sql
CREATE TABLE exam_outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  exam_date DATE NOT NULL,
  passed BOOLEAN NOT NULL,
  overall_score NUMERIC(5,2),
  area_scores JSONB, -- { "area_a": 78, "area_b": 65, ... }
  readiness_score_at_exam NUMERIC(5,2),
  calibration_score_at_exam NUMERIC(5,2),
  study_hours_total NUMERIC(7,1),
  sessions_completed INTEGER,
  reported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  verified BOOLEAN DEFAULT FALSE
);
```

### Display Logic

Only show correlation data when sample size ≥ 50 verified outcomes. Before that: "We're collecting data from the first exam cycle. Your Readiness Score will be validated against real results."

After sufficient data:
- Landing page: "Students with Readiness Score ≥ 80 had a X% pass rate"
- Analytics Dashboard: Personal projection based on the correlation model
- Institutional: Cohort pass probability distribution

---

## Campfire Design

- Progress report: warm, celebratory but factual. Numbers speak louder than superlatives.
- No fake metrics. If the student didn't improve, say: "You maintained your score this month. Consistency matters."
- Sharable card: branded but not obnoxious. SlateCamp logo small, student data prominent.
- Outcome correlation: present with appropriate epistemic humility until data is robust.

