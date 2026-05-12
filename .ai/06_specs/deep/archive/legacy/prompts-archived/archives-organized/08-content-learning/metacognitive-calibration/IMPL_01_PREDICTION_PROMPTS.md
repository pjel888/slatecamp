# IMPL_01: Pre-Session Prediction & Post-Session Postdiction

**Priority:** P0 — Cheapest, highest-impact calibration feature
**Effort:** ~4 hours
**Research basis:** Effect size g = –0.75 for prediction + feedback interventions (Miller & Geraci, 2014; Callender et al.)

---

## Why This Matters

Low-performing students remain confidently overconfident across an entire semester without intervention. The Readiness Score tells students where they stand objectively — but it does not train them to *know what they know.* Prediction prompts force self-assessment before every high-stakes session, and the feedback loop between predicted and actual scores is the single fastest way to improve metacognitive calibration.

---

## Database Schema

### New table: `session_predictions`

```sql
CREATE TABLE session_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES quiz_sessions(id) ON DELETE CASCADE,
  prediction_score SMALLINT NOT NULL CHECK (prediction_score BETWEEN 0 AND 100),
  postdiction_score SMALLINT CHECK (postdiction_score BETWEEN 0 AND 100),
  actual_score SMALLINT CHECK (actual_score BETWEEN 0 AND 100),
  prediction_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  postdiction_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for user history queries
CREATE INDEX idx_session_predictions_user ON session_predictions(user_id, created_at DESC);

-- RLS
ALTER TABLE session_predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own predictions"
  ON session_predictions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own predictions"
  ON session_predictions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own predictions"
  ON session_predictions FOR UPDATE
  USING (auth.uid() = user_id);
```

No migration needed on existing tables. `quiz_sessions` already has the `id` this references.

---

## Implementation

### 1. Pre-Session Prediction (in SetupFlow)

**File:** `src/components/testing/setup/PredictionPrompt.tsx`

**When it appears:** After the user confirms session configuration (Step 4 Confirmation Screen in the Testing Spec) and before the session starts. Only for Storm Mode, Full Exam Simulation, and Extended Practice — NOT for Camp, Chill, or Focus Review (those are learning modes, not assessment modes).

**UI Spec:**
- Card component on the confirmation screen
- Heading: "Before you start — how do you think you'll do?"
- Slider input: 0–100%, labeled with markers at 25%, 50%, 75%, 100%
- Default position: last session's actual score for this mode (or 50% if first session)
- Subtext: "This isn't graded. It helps train your self-assessment accuracy."
- CTA: "Lock In & Start" — saves prediction, then triggers session start

**Logic:**
```typescript
// In the SetupFlow component, after config confirmation
const shouldShowPrediction = (mode: string): boolean => {
  return ['storm', 'proof_sim', 'endurance', 'extended'].includes(mode);
};
```

**Server Action:** `src/lib/actions/quiz-v2/save-prediction.ts`

```typescript
'use server';

import { createClient } from '@/lib/supabase/server';

export async function savePrediction(sessionId: string, predictionScore: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { error } = await supabase
    .from('session_predictions')
    .insert({
      user_id: user.id,
      session_id: sessionId,
      prediction_score: predictionScore,
    });

  if (error) throw error;
}
```

### 2. Post-Session Postdiction (in ResultsDashboard)

**File:** Modify `src/components/testing/results/ResultsDashboard.tsx`

**When it appears:** After session ends, BEFORE showing the actual score. Only if a prediction was made.

**UI Spec:**
- Interstitial screen between "Session Complete" and score reveal
- Heading: "Before you see your score — how do you think you did?"
- Same slider, same 0–100% scale
- Subtext: "Compare your feeling to reality."
- CTA: "Show My Score"
- On click: saves postdiction, then reveals actual score with comparison

**Score Reveal Enhancement:**
After the actual score is shown, add a comparison card:

```
┌──────────────────────────────────────────┐
│  Your Prediction:     72%                │
│  Your Postdiction:    65%                │
│  Actual Score:        58%                │
│                                          │
│  Calibration gap: +14 points (prediction)│
│  You were overconfident this session.    │
│  Trend: Your gap narrowed from +22 to   │
│  +14 over your last 5 sessions. ✓       │
└──────────────────────────────────────────┘
```

**Server Action:** `src/lib/actions/quiz-v2/save-postdiction.ts`

```typescript
'use server';

import { createClient } from '@/lib/supabase/server';

export async function savePostdiction(
  sessionId: string,
  postdictionScore: number,
  actualScore: number
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { error } = await supabase
    .from('session_predictions')
    .update({
      postdiction_score: postdictionScore,
      actual_score: actualScore,
      postdiction_at: new Date().toISOString(),
    })
    .eq('session_id', sessionId)
    .eq('user_id', user.id);

  if (error) throw error;
}
```

### 3. Prediction History Query (for trend display)

```typescript
export async function getPredictionHistory(userId: string, limit = 10) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('session_predictions')
    .select('prediction_score, postdiction_score, actual_score, created_at')
    .eq('user_id', userId)
    .not('actual_score', 'is', null)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}
```

---

## Campfire Design Notes

- Slider: Use shadcn/ui `Slider` component. Track color: Camp Cobalt `#1B3FC4`. Thumb: white with Camp Cobalt border.
- Comparison card: `rounded-md shadow-none` card on `Surface Light #F8F7F5` background.
- Overconfidence text: Amber `#D4951A` text. Underconfidence text: Camp Cobalt.
- Calibration improvement text: Emerald `#2D9F6F`.
- No shame language. "You were overconfident" not "You were wrong about yourself."
- Transitions: max 300ms between states.

---

## Edge Cases

- **Student skips prediction:** Allow skip with a "Skip for now" link. Don't block the session. Record null prediction.
- **Session abandoned:** If session is never completed, the prediction row stays with null actual_score. Excluded from calibration calculations.
- **First-ever session:** No trend data available. Show only the single comparison, no trend line.
- **Perfect prediction (gap = 0):** Celebrate subtly: "Your prediction was spot-on. Your self-assessment is well-calibrated."

---

## Metrics to Track

- Average prediction gap (predicted – actual) across all users
- Prediction gap trend per user over time (should decrease)
- % of sessions where prediction was made vs. skipped
- Correlation between calibration accuracy and Readiness Score

