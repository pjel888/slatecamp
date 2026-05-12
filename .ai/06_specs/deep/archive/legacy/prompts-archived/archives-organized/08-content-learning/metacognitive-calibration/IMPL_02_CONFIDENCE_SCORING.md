# IMPL_02: Confidence-Weighted Scoring & 2×2 Diagnostic Matrix

**Priority:** P0
**Effort:** ~1 day
**Research basis:** Confidence judgments improve metacognitive monitoring accuracy (Barenberg & Dutke, 2019). The "confident but wrong" quadrant is the highest-risk zone for exam failure.

---

## Why This Matters

A student who answers a question wrong and knows they're guessing is in a recoverable position — they know they need to study. A student who answers wrong but was confident they were right is in the most dangerous position possible — they'll walk into the exam believing they're prepared. The 2×2 matrix makes invisible overconfidence visible.

---

## Database Changes

### Modify `user_interactions` table

The `user_interactions` table already includes `time_spent_ms` and `is_correct`. Add a confidence field:

```sql
ALTER TABLE user_interactions
  ADD COLUMN confidence SMALLINT CHECK (confidence IN (1, 2, 3));
-- 1 = Low, 2 = Medium, 3 = High
-- NULL = confidence not captured (Chill mode, legacy sessions)
```

No new table needed. This is a single column addition to an existing table.

---

## Implementation

### 1. Confidence Input Component

**File:** `src/components/testing/quiz-v2/ConfidenceInput.tsx`

```typescript
'use client';

import { cn } from '@/lib/utils';

interface ConfidenceInputProps {
  value: number | null;
  onChange: (confidence: number) => void;
  disabled?: boolean;
}

const levels = [
  { value: 1, label: 'Guessing', color: 'text-amber-600' },
  { value: 2, label: 'Partly sure', color: 'text-ink-secondary' },
  { value: 3, label: 'Confident', color: 'text-camp-cobalt' },
];

export function ConfidenceInput({ value, onChange, disabled }: ConfidenceInputProps) {
  return (
    <div className="flex items-center gap-3 py-2">
      <span className="text-sm text-ink-secondary">How sure are you?</span>
      <div className="flex gap-2">
        {levels.map((level) => (
          <button
            key={level.value}
            onClick={() => onChange(level.value)}
            disabled={disabled}
            className={cn(
              'px-3 py-1.5 text-sm rounded-sm border transition-all duration-200',
              value === level.value
                ? 'border-camp-cobalt bg-camp-cobalt/10 font-medium'
                : 'border-border-primary bg-transparent hover:border-camp-cobalt/40'
            )}
          >
            {level.label}
          </button>
        ))}
      </div>
    </div>
  );
}
```

### 2. Integration into OptionsColumn

**File:** Modify `src/components/testing/quiz-v2/OptionsColumn.tsx`

**Placement:** After the student selects an option but before they tap "Submit Answer." The confidence input appears between the option cards and the submit button.

**Mode behavior:**
- Camp Mode: Show confidence input. Required before submit.
- Storm Mode: Show confidence input. Optional (don't block the timer).
- Chill Mode: Do NOT show. Breaks the low-friction feed.
- Custom: Show if feedback is set to Immediate or End of Session.
- Focus Review: Show. This data is critical for priority recalculation.
- Full Exam Simulation: Show. Optional.

```typescript
const shouldShowConfidence = (mode: string): boolean => {
  return !['chill'].includes(mode);
};
```

### 3. Modify submit-answer Action

**File:** Modify `src/lib/actions/quiz-v2/submit-answer.ts`

Add `confidence` to the function signature and insert it into `user_interactions`:

```typescript
export async function submitAnswer(
  sessionId: string,
  questionId: string,
  selectedOptionId: string,
  timeSpentMs: number,
  confidence: number | null, // NEW
) {
  // ... existing logic ...

  const { error } = await supabase
    .from('user_interactions')
    .insert({
      user_id: user.id,
      session_id: sessionId,
      question_id: questionId,
      selected_option_id: selectedOptionId,
      is_correct: isCorrect,
      time_spent_ms: timeSpentMs,
      confidence, // NEW — nullable for modes that don't capture it
      topic_id: question.topic_id,
      test_mode: session.config.mode,
    });

  // ... existing EMA, Lucky Guess, etc. ...
}
```

### 4. The 2×2 Diagnostic Matrix Component

**File:** `src/components/testing/results/ConfidenceMatrix.tsx`

This renders in the `ResultsDashboard` after every session that captured confidence data.

**The four quadrants:**

| | Correct | Wrong |
|---|---|---|
| **Confident (3)** | ✅ Solid Knowledge — "You knew it and you knew you knew it." | 🔴 Dangerous Overconfidence — "You were sure, but wrong. These are your highest-risk topics." |
| **Guessing (1)** | ⚠️ Lucky / Underconfident — "You got it right but didn't trust yourself. Build confidence here." | ℹ️ Known Gap — "You knew you didn't know. That's honest self-assessment." |

**Data query:**

```typescript
export async function getSessionConfidenceMatrix(sessionId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from('user_interactions')
    .select('is_correct, confidence, topic_id, question_id')
    .eq('session_id', sessionId)
    .not('confidence', 'is', null);

  const matrix = {
    confidentCorrect: data?.filter(d => d.confidence === 3 && d.is_correct) ?? [],
    confidentWrong: data?.filter(d => d.confidence === 3 && !d.is_correct) ?? [],
    guessingCorrect: data?.filter(d => d.confidence === 1 && d.is_correct) ?? [],
    guessingWrong: data?.filter(d => d.confidence === 1 && !d.is_correct) ?? [],
    partlyCorrect: data?.filter(d => d.confidence === 2 && d.is_correct) ?? [],
    partlyWrong: data?.filter(d => d.confidence === 2 && !d.is_correct) ?? [],
  };

  return matrix;
}
```

**UI rendering:**
- 2×2 grid with counts and topic names in each quadrant
- Confident+Wrong quadrant: Warm Red `#D64545` border, items listed with topic names
- Confident+Correct: Emerald `#2D9F6F` border
- Guessing+Correct: Amber `#D4951A` border
- Guessing+Wrong: neutral border
- Each item in Confident+Wrong is clickable → launches a Focus Review session on that topic

### 5. Focus Review Priority Weighting

**File:** Modify the Focus Review nightly scan logic (see IMPL_19 for pg_cron)

Add confidence data to priority scoring:

```sql
-- Priority score for Focus Review queue generation
-- Topics where user was confident AND wrong get 2× weight
SELECT
  topic_id,
  current_mastery_weight,
  -- Count of confident-wrong interactions in last 14 days
  (
    SELECT COUNT(*) FROM user_interactions ui
    WHERE ui.user_id = unm.user_id
    AND ui.topic_id = unm.topic_id
    AND ui.confidence = 3
    AND ui.is_correct = false
    AND ui.created_at > NOW() - INTERVAL '14 days'
  ) AS confident_wrong_count,
  -- Priority: low mastery + high confident-wrong = highest priority
  (1 - current_mastery_weight) + (confident_wrong_count * 0.3) AS priority_score
FROM user_node_mastery unm
WHERE user_id = $1
ORDER BY priority_score DESC
LIMIT 5;
```

---

## Campfire Design Notes

- Confidence input: Compact, inline, not a modal. Three buttons in a row.
- Don't use color for the confidence buttons themselves — just border states. Color is reserved for feedback.
- 2×2 matrix: Cards with subtle backgrounds. Red quadrant uses `bg-warm-red/5` not solid red.
- No shame language for the Confident+Wrong quadrant. Use: "These topics need attention — you thought you knew them but the data says otherwise."
- Matrix appears collapsed by default on mobile, expandable.

---

## Edge Cases

- **All answers had same confidence:** Matrix still renders but the empty quadrants show "None this session."
- **Student never selects confidence (skips):** In Camp Mode, require it (submit button disabled until confidence selected). In Storm, allow null.
- **Legacy sessions:** Sessions without confidence data don't render the matrix. No backfill needed.

