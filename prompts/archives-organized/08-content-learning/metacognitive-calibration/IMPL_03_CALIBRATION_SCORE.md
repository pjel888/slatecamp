# IMPL_03: Calibration Score Algorithm & Visualization

**Priority:** P1  
**Effort:** ~2 days  
**Research basis:** Brier Score decomposition; calibration curve methodology from psychometric literature

---

## Why This Matters

The Readiness Score measures competence. The Calibration Score measures *self-awareness of* competence. A student with RS 80 + CS 90 is truly ready. A student with RS 80 + CS 40 might be 80 in areas they think are weak while missing danger zones they think are strong. This is SlateCamp's unique story — no competitor measures calibration.

---

## The Algorithm

### Brier-Based Calibration Score

For each interaction where confidence was captured:

```
confidence_probability = confidence_level / 3
// 1 → 0.33, 2 → 0.67, 3 → 1.0

brier_component = (confidence_probability - is_correct)²
```

Aggregate Brier Score over a rolling 30-day window:

```
BS = (1/N) × Σ (confidence_probability_i - outcome_i)²
```

Convert to a 0–100 Calibration Score:

```
calibration_score = (1 - BS) × 100
```

- 100 = perfect calibration (confidence always matches outcome)
- 0 = maximally miscalibrated

### Anti-Gaming Note

Students could game calibration by always selecting "Guessing" (confidence=1). This would give perfect calibration on wrong answers but terrible calibration on correct answers. The Brier Score naturally handles this — it penalizes both overconfidence AND underconfidence.

---

## Database Schema

### New table: `calibration_snapshots`

```sql
CREATE TABLE calibration_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  calibration_score NUMERIC(5,2) NOT NULL,
  brier_score NUMERIC(5,4) NOT NULL,
  sample_size INTEGER NOT NULL,
  -- Breakdown by confidence level
  confident_accuracy NUMERIC(5,4), -- accuracy when confidence=3
  guessing_accuracy NUMERIC(5,4),  -- accuracy when confidence=1
  overconfidence_index NUMERIC(5,4), -- avg(confidence_prob - accuracy) when positive
  underconfidence_index NUMERIC(5,4), -- avg(accuracy - confidence_prob) when positive
  window_start TIMESTAMPTZ NOT NULL,
  window_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_calibration_user ON calibration_snapshots(user_id, created_at DESC);

ALTER TABLE calibration_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own calibration" ON calibration_snapshots
  FOR SELECT USING (auth.uid() = user_id);
```

---

## Implementation

### 1. Calibration Recalculation (Server Action)

**File:** `src/lib/actions/calibration-score-update.ts`

Runs after every session that captured confidence data (triggered from `end-session.ts`).

```typescript
'use server';

import { createClient } from '@/lib/supabase/server';

export async function updateCalibrationScore(userId: string) {
  const supabase = await createClient();

  // Get last 30 days of confidence-tagged interactions
  const { data: interactions } = await supabase
    .from('user_interactions')
    .select('is_correct, confidence')
    .eq('user_id', userId)
    .not('confidence', 'is', null)
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

  if (!interactions || interactions.length < 10) return; // Need minimum sample

  const confMap: Record<number, number> = { 1: 0.33, 2: 0.67, 3: 1.0 };

  let brierSum = 0;
  let overconfSum = 0;
  let overconfCount = 0;
  let underconfSum = 0;
  let underconfCount = 0;
  const byConfidence: Record<number, { correct: number; total: number }> = {
    1: { correct: 0, total: 0 },
    2: { correct: 0, total: 0 },
    3: { correct: 0, total: 0 },
  };

  for (const i of interactions) {
    const confProb = confMap[i.confidence];
    const outcome = i.is_correct ? 1 : 0;
    brierSum += Math.pow(confProb - outcome, 2);

    byConfidence[i.confidence].total++;
    if (i.is_correct) byConfidence[i.confidence].correct++;

    const gap = confProb - outcome;
    if (gap > 0) { overconfSum += gap; overconfCount++; }
    if (gap < 0) { underconfSum += Math.abs(gap); underconfCount++; }
  }

  const brierScore = brierSum / interactions.length;
  const calibrationScore = Math.round((1 - brierScore) * 100);

  await supabase.from('calibration_snapshots').insert({
    user_id: userId,
    calibration_score: calibrationScore,
    brier_score: brierScore,
    sample_size: interactions.length,
    confident_accuracy: byConfidence[3].total > 0
      ? byConfidence[3].correct / byConfidence[3].total : null,
    guessing_accuracy: byConfidence[1].total > 0
      ? byConfidence[1].correct / byConfidence[1].total : null,
    overconfidence_index: overconfCount > 0 ? overconfSum / overconfCount : null,
    underconfidence_index: underconfCount > 0 ? underconfSum / underconfCount : null,
    window_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    window_end: new Date().toISOString(),
  });
}
```

### 2. Calibration Curve Visualization

**File:** `src/components/analytics/CalibrationCurve.tsx`

Uses Recharts. X-axis = confidence level (0.33, 0.67, 1.0), Y-axis = actual accuracy at that level. Perfect calibration = diagonal line.

**Data shape:**
```typescript
const chartData = [
  { confidence: 0.33, actual: guessingAccuracy, label: 'Guessing' },
  { confidence: 0.67, actual: partlyAccuracy, label: 'Partly sure' },
  { confidence: 1.0, actual: confidentAccuracy, label: 'Confident' },
];
```

**Visual:**
- Diagonal reference line (gray dashed) = perfect calibration
- Student's data points connected with Camp Cobalt line
- Points above diagonal = underconfident (good problem to have)
- Points below diagonal = overconfident (dangerous)
- Shaded area between diagonal and student line = calibration gap
- Coaching annotation: "Your confidence at the 'Confident' level predicts X% accuracy, but your actual accuracy is Y%. You're overconfident by Z points."

### 3. Analytics Dashboard Integration

**File:** Modify `src/components/analytics/` to add CalibrationCurve alongside existing PacingQuadrant, ReadinessTrajectory, etc.

**Placement:** New card in the Analytics Dashboard grid, same priority level as ReadinessTrajectory.

**Card layout:**
- Top: "Calibration Score: 72/100" (large number)
- Subtitle: "How well your confidence matches your actual performance"
- Chart: CalibrationCurve
- Bottom coaching annotation via `ChartCoachingAnnotation` component

---

## Campfire Design

- Calibration Score display: same typographic treatment as Readiness Score
- Overconfidence gap: filled with `warm-red/10` between diagonal and data line
- Underconfidence gap: filled with `camp-cobalt/10`
- No alarm language for poor calibration: "Your self-assessment is improving" not "You're dangerously overconfident"

---

## Commercial Value

This visualization is a triple-threat asset:
1. **Student tool:** Directly improves study decisions
2. **Marketing:** "The only platform that measures self-awareness, not just knowledge"
3. **Institutional:** Show deans aggregate calibration curves — overconfident cohorts are at-risk cohorts
