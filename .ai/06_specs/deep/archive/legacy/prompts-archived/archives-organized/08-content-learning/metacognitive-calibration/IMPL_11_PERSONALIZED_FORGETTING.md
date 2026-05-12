# IMPL_11: Personalized Forgetting Rates & Review Calendar

**Priority:** P2
**Effort:** ~2 weeks (algorithm + UI)
**Research basis:** ACT-R / Slimstampen approach — individual forgetting rates predicted exam grades in university settings. Response time + accuracy calibrates per-student per-topic decay.

---

## Personalized Forgetting Rate

### Why SM-2 Isn't Enough

SM-2 uses a fixed ease factor per card. It doesn't know that Student A forgets Structural Design in 7 days but retains History of Architecture for 30 days. A personalized model estimates the forgetting rate α_i for each topic per student.

### Algorithm: Simplified ACT-R Decay

Memory activation at time t:
```
A(t) = ln(Σ t_j^(-d_i))
```
Where:
- t_j = time since the j-th practice event
- d_i = decay rate for this user-topic pair (the personalized parameter)

Recall probability:
```
P(recall) = 1 / (1 + e^(-(A(t) - τ)/s))
```

### Estimating Individual Decay Rates

After each interaction, update d_i using response time and accuracy:

```typescript
function updateDecayRate(
  currentDecay: number,
  expectedRT: number,
  actualRT: number,
  isCorrect: boolean
): number {
  // Correct but slow → higher decay (knowledge is fading)
  // Correct and fast → lower decay (solid retention)
  // Incorrect → higher decay
  const rtRatio = actualRT / expectedRT;

  if (!isCorrect) {
    return Math.min(currentDecay * 1.1, 0.8); // Increase decay, cap at 0.8
  }

  if (rtRatio > 1.5) {
    return Math.min(currentDecay * 1.05, 0.8); // Slow correct = slightly more decay
  }

  return Math.max(currentDecay * 0.95, 0.1); // Fast correct = less decay
}
```

### Schema

```sql
ALTER TABLE user_node_mastery ADD COLUMN decay_rate NUMERIC(4,3) DEFAULT 0.3;
ALTER TABLE user_node_mastery ADD COLUMN predicted_recall NUMERIC(4,3);
ALTER TABLE user_node_mastery ADD COLUMN optimal_review_at TIMESTAMPTZ;
```

---

## Review Calendar

### UI Component

**File:** `src/components/dashboard/ReviewCalendar.tsx`

A 7-day forward-looking calendar showing:
- **Due today:** Topics where predicted_recall has dropped below 0.7 (needs review)
- **Overdue:** Topics where predicted_recall < 0.5 (urgent, shown in Warm Red)
- **Safe:** Topics reviewed recently with predicted_recall > 0.85 (shown in Emerald)
- **Upcoming:** Topics that will need review in 2-7 days (shown in Amber)

Each topic entry shows: topic name, current predicted recall %, days since last review.

Click any topic → launches a targeted Camp session on that topic.

### Daily Recall Recalculation

Run as part of the Focus Review nightly scan (pg_cron):

```sql
-- Update predicted_recall for all active user-topic pairs
UPDATE user_node_mastery SET
  predicted_recall = 1.0 / (1.0 + EXP(-(
    LN(EXTRACT(EPOCH FROM (NOW() - last_reviewed_at)) ^ (-decay_rate)) - 0.5
  ) / 0.2)),
  optimal_review_at = last_reviewed_at + (
    INTERVAL '1 day' * (1.0 / GREATEST(decay_rate, 0.1)) * 2
  )
WHERE last_reviewed_at IS NOT NULL;
```

---

## Cramming Detector

**File:** `src/lib/actions/study-pattern-monitor.ts`

If the system detects a student doing 4+ hours on the same topic in one sitting:

```typescript
export async function checkCrammingPattern(userId: string, topicId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from('user_interactions')
    .select('created_at')
    .eq('user_id', userId)
    .eq('topic_id', topicId)
    .gte('created_at', new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString())
    .order('created_at');

  if (data && data.length > 40) { // 40+ questions in 4 hours on one topic
    return {
      isCramming: true,
      message: 'Distributed practice is 2× more effective than cramming. Switch topics and return to this one tomorrow.',
      evidence: `You've answered ${data.length} questions on this topic in the last 4 hours.`,
    };
  }
  return { isCramming: false };
}
```

Surface as a coaching annotation in the quiz session (non-blocking — informational only).
