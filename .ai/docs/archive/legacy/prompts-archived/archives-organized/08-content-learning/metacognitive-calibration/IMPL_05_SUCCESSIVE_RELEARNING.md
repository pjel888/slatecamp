# IMPL_05: Successive Relearning Mode

**Priority:** P2  
**Effort:** ~3 days  
**Research basis:** Successive relearning (retrieval to criterion + spaced re-test) is the gold standard protocol for durable learning in cognitive psychology.

---

## How It Works

1. Student selects a topic (or system selects from weak nodes)
2. Questions on that topic are presented until **3 consecutive correct answers**
3. Topic enters a spaced schedule: re-test in 1 day → 3 days → 7 days → 14 days
4. If the student fails on any spaced re-test, the cycle resets to step 2
5. After 3 successful spaced re-tests, the topic is marked "durably learned"

This is distinct from SM-2: SM-2 adjusts intervals based on ease factor. Successive relearning requires reaching criterion (3 consecutive correct) before ANY spacing begins.

---

## Database Schema

### New table: `successive_relearning_cycles`

```sql
CREATE TABLE successive_relearning_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES taxonomy_tree(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'criterion_met', 'spacing', 'durable', 'reset')),
  consecutive_correct INTEGER NOT NULL DEFAULT 0,
  current_spacing_interval INTEGER, -- days until next re-test (null if still reaching criterion)
  spacing_level INTEGER NOT NULL DEFAULT 0, -- 0=not started, 1=1day, 2=3day, 3=7day, 4=14day
  next_retest_at TIMESTAMPTZ,
  total_resets INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, topic_id)
);

CREATE INDEX idx_sr_cycles_user_due ON successive_relearning_cycles(user_id, next_retest_at)
  WHERE status = 'spacing';

ALTER TABLE successive_relearning_cycles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own SR cycles" ON successive_relearning_cycles
  FOR ALL USING (auth.uid() = user_id);
```

---

## Implementation

### 1. State Machine

```
[ACTIVE] → 3 consecutive correct → [CRITERION_MET] → schedule 1-day retest → [SPACING]
  ↑                                                                                |
  |                     fail retest                                                |
  ←──────────────── [RESET] ←─────────────────────────────────────────────────────
                                                                                   |
                                     pass retest → advance spacing level ──────────→
                                                                                   |
                                     4 successful spaced retests → [DURABLE] ──────→
```

**Spacing intervals:** `[1, 3, 7, 14]` days (hardcoded, not SM-2 adaptive)

### 2. Session Logic

**File:** `src/lib/actions/quiz-v2/successive-relearning.ts`

```typescript
const SPACING_INTERVALS = [1, 3, 7, 14]; // days

export async function processSuccessiveRelearning(
  userId: string,
  topicId: string,
  isCorrect: boolean
) {
  const supabase = await createClient();

  let { data: cycle } = await supabase
    .from('successive_relearning_cycles')
    .select('*')
    .eq('user_id', userId)
    .eq('topic_id', topicId)
    .single();

  if (!cycle) {
    // Create new cycle
    const { data } = await supabase
      .from('successive_relearning_cycles')
      .insert({ user_id: userId, topic_id: topicId, status: 'active', consecutive_correct: 0 })
      .select()
      .single();
    cycle = data;
  }

  if (cycle.status === 'active' || cycle.status === 'reset') {
    if (isCorrect) {
      const newCount = cycle.consecutive_correct + 1;
      if (newCount >= 3) {
        // Criterion met — enter spacing
        const interval = SPACING_INTERVALS[0];
        await supabase.from('successive_relearning_cycles').update({
          status: 'spacing',
          consecutive_correct: newCount,
          spacing_level: 1,
          current_spacing_interval: interval,
          next_retest_at: new Date(Date.now() + interval * 86400000).toISOString(),
        }).eq('id', cycle.id);
      } else {
        await supabase.from('successive_relearning_cycles').update({
          consecutive_correct: newCount,
        }).eq('id', cycle.id);
      }
    } else {
      // Reset consecutive counter
      await supabase.from('successive_relearning_cycles').update({
        consecutive_correct: 0,
      }).eq('id', cycle.id);
    }
  } else if (cycle.status === 'spacing') {
    if (isCorrect) {
      const nextLevel = cycle.spacing_level + 1;
      if (nextLevel > SPACING_INTERVALS.length) {
        // Durable!
        await supabase.from('successive_relearning_cycles').update({
          status: 'durable',
          spacing_level: nextLevel,
        }).eq('id', cycle.id);
      } else {
        const interval = SPACING_INTERVALS[nextLevel - 1];
        await supabase.from('successive_relearning_cycles').update({
          spacing_level: nextLevel,
          current_spacing_interval: interval,
          next_retest_at: new Date(Date.now() + interval * 86400000).toISOString(),
        }).eq('id', cycle.id);
      }
    } else {
      // Failed retest — reset to active
      await supabase.from('successive_relearning_cycles').update({
        status: 'reset',
        consecutive_correct: 0,
        spacing_level: 0,
        current_spacing_interval: null,
        next_retest_at: null,
        total_resets: cycle.total_resets + 1,
      }).eq('id', cycle.id);
    }
  }
}
```

### 3. UI — Successive Relearning Session

**Accessible from:** Testing Hub as a new mode card ("Master a Topic"), or from the Taxonomy Heatmap by clicking a Red/Amber node → "Master This Topic"

**Session flow:**
1. System selects questions for the chosen topic
2. Student answers. Progress indicator shows: "Consecutive correct: 2/3"
3. If wrong answer: counter resets to 0. Message: "Almost — let's try again. You need 3 in a row."
4. On reaching criterion: celebration card "You've reached criterion! We'll re-test you tomorrow to make sure it sticks."
5. Due re-tests appear in the Adaptive Daily Dose (IMPL_13) and Review Calendar (IMPL_11)

---

## Campfire Design

- Progress ring showing consecutive correct count (0/3, 1/3, 2/3, 3/3)
- On criterion met: Emerald background transition, brief confetti-free animation (a clean checkmark fill)
- Spacing timeline visualization: show the 4 upcoming re-test dates as dots on a timeline
- "Durable" badge on the Taxonomy Heatmap node (subtle, not gamified — just a small indicator)

---

## Integration Points

- Successive Relearning results feed into EMA mastery (standard weight)
- Topics in SR cycles are excluded from random question selection in other modes (to preserve spacing)
- Due re-tests appear in the Focus Review queue alongside Blindspot items

