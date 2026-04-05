# IMPL_13: Adaptive Daily Dose & Study Session Micro-Planning

**Priority:** P0  
**Effort:** ~3 days  
**Research basis:** Decision fatigue is the #1 reason students open a study app and close it without studying. Removing the "what should I study?" question increases session initiation by 40%+ in EdTech benchmarks.

---

## The Daily Dose

A single, personalized, one-tap study session generated daily. The system decides what to study, for how long, and in what mode. The student just taps "Start."

### Algorithm

**File:** `src/lib/actions/daily-dose/generate.ts`

```typescript
interface DailyDose {
  activities: DoseActivity[];
  estimatedMinutes: number;
  rationale: string; // Why these activities, in plain language
}

interface DoseActivity {
  type: 'quiz' | 'wiki' | 'srs_review' | 'lab';
  config: Record<string, any>;
  minutes: number;
  reason: string;
}

export async function generateDailyDose(userId: string): Promise<DailyDose> {
  const [
    weakNodes,       // From user_node_mastery: lowest mastery nodes
    overdueSRS,      // SRS cards past their due date
    decayingNodes,   // Nodes with predicted_recall < 0.7
    examDate,        // Days until target exam
    recentSessions,  // What they studied recently (avoid repetition)
    studyCapacity,   // Estimated from their typical session lengths
  ] = await Promise.all([
    getWeakestNodes(userId, 5),
    getOverdueSRSCount(userId),
    getDecayingNodes(userId, 5),
    getExamDate(userId),
    getRecentTopics(userId, 3), // Last 3 days
    getAverageSessionLength(userId),
  ]);

  const activities: DoseActivity[] = [];
  const daysUntilExam = examDate ? Math.ceil((examDate.getTime() - Date.now()) / 86400000) : null;

  // Priority 1: Overdue SRS (memory maintenance)
  if (overdueSRS > 0) {
    activities.push({
      type: 'srs_review',
      config: { limit: Math.min(overdueSRS, 20) },
      minutes: Math.min(overdueSRS, 20) * 0.5, // ~30 sec per card
      reason: `${overdueSRS} cards overdue — quick review to prevent forgetting`,
    });
  }

  // Priority 2: Decaying nodes (topics slipping away)
  const freshDecaying = decayingNodes.filter(
    n => !recentSessions.some(r => r.topic_id === n.topic_id)
  );
  if (freshDecaying.length > 0) {
    activities.push({
      type: 'quiz',
      config: {
        mode: 'camp',
        topicIds: freshDecaying.slice(0, 3).map(n => n.topic_id),
        questionCount: 10,
        interleave: true,
      },
      minutes: 15,
      reason: `${freshDecaying.length} topics are fading — refresh them`,
    });
  }

  // Priority 3: Weak nodes (building new knowledge)
  const untouchedWeak = weakNodes.filter(
    n => !freshDecaying.some(d => d.topic_id === n.topic_id)
  );
  if (untouchedWeak.length > 0 && activities.reduce((s, a) => s + a.minutes, 0) < 30) {
    activities.push({
      type: 'quiz',
      config: {
        mode: 'camp',
        topicIds: untouchedWeak.slice(0, 2).map(n => n.topic_id),
        questionCount: 10,
      },
      minutes: 15,
      reason: 'Strengthen your weakest areas',
    });
  }

  // Priority 4: If exam is <30 days, add a mini Storm
  if (daysUntilExam && daysUntilExam <= 30 && activities.reduce((s, a) => s + a.minutes, 0) < 45) {
    activities.push({
      type: 'quiz',
      config: { mode: 'storm', questionCount: 20 },
      minutes: 25,
      reason: `${daysUntilExam} days to exam — practice under pressure`,
    });
  }

  const totalMinutes = activities.reduce((s, a) => s + a.minutes, 0);

  return {
    activities,
    estimatedMinutes: Math.round(totalMinutes),
    rationale: buildRationale(activities, daysUntilExam),
  };
}
```

### Storage & Scheduling

```sql
CREATE TABLE daily_doses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  dose_date DATE NOT NULL,
  activities JSONB NOT NULL,
  estimated_minutes INTEGER NOT NULL,
  rationale TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, dose_date)
);

ALTER TABLE daily_doses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own doses" ON daily_doses FOR ALL USING (auth.uid() = user_id);
```

Generated nightly by pg_cron alongside the Focus Review scan, or on-demand when user opens the app and no dose exists for today.

---

## Study Session Micro-Planning

### Time-Based Session Configuration

**File:** `src/components/dashboard/MicroPlan.tsx`

When the student opens the app, before the Daily Dose:

"How much time do you have?"

| Option | Activity Mix |
|---|---|
| **15 min** | SRS review (5 min) + Quick quiz on weakest topic (10 min) |
| **30 min** | Full Daily Dose as generated |
| **60 min** | Daily Dose + Wiki reading on a weak topic + extended quiz |
| **2+ hrs** | Daily Dose + Storm/Extended Practice simulation |

The system pre-configures everything. One tap per activity. Activities chain together automatically.

---

## "Today's Recommendation" Banner

**File:** Modify `src/components/testing/hub/ReviewHub.tsx`

The banner at the top of the Testing Hub:

```typescript
// Already referenced in the Testing Spec Section 1
// Now powered by the Daily Dose algorithm
const todayDose = await getDailyDose(userId);

// Banner text examples:
// "Your last session was 3 days ago. Start with 8 overdue review cards."
// "28 days to exam. Today's focus: Structural Design (your weakest area)."
// "You're on track. Maintain momentum with a quick 15-min session."
```

Banner includes a single CTA button that launches the first activity in the dose. After completing each activity, the next one auto-starts (with a brief transition card showing progress: "1 of 3 complete").

---

## Campfire Design

- Time picker: 4 large tap targets, warm styling, no input fields
- Daily Dose card: clean summary showing activity icons + estimated time
- Progress through dose: horizontal stepper showing completed/remaining activities
- Completion: "Today's dose complete. You studied [X] minutes." No over-celebration.
- If dose already completed today: "You've finished today's recommended study. Want to do more?" with optional activities
