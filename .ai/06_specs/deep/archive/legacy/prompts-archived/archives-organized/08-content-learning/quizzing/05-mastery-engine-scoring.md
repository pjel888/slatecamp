# SlateCamp Quiz Engine — Document 5: Mastery Engine & Scoring Algorithm Spec

> **Purpose:** Defines exactly how a quiz answer updates the mastery system — from the moment `user_interactions` receives a row to the moment the Readiness Score and Heatmap update. An AI reads this to understand the mathematical engine behind the quiz.
>
> **Companion docs:** Doc 3 (Schema — where data lives), Doc 4 (Content — what questions look like)

---

## 1. The Mastery Pipeline

Every answered question triggers this exact pipeline:

```
User answers Question Q on Topic T
  ↓
[1] INSERT into user_interactions (immutable event log)
  ↓
[2] Postgres trigger fires: update_user_node_mastery()
  ↓
[3] user_node_mastery row for (user_id, node_id=T) updated via EMA formula
  ↓
[4] Readiness Score recomputed (weighted aggregate of all node masteries)
  ↓
[5] Heatmap node color updated (Red / Amber / Green / Grey)
  ↓
[6] If session complete: readiness_score_snapshots row inserted (trajectory)
  ↓
[7] Blindspot queue updated (topics below threshold re-queued)
```

Steps 1–3 happen on EVERY answer submission (real-time).
Steps 4–5 happen on every answer but are READ on next page load (not blocking).
Steps 6–7 happen on session completion only.

---

## 2. The EMA (Exponential Moving Average) Mastery Formula

### 2.1 Why EMA

Simple percentage (correct/total) treats the first answer and the 100th answer equally. EMA weights recent performance more heavily, which means:
- A student who was bad but is now improving sees their score rise faster
- A student who was good but is now declining sees their score drop appropriately
- The score reflects *current* mastery, not historical average

### 2.2 The Formula

```
new_mastery = α × current_score + (1 - α) × previous_mastery
```

Where:
- `α` (alpha) = smoothing factor = **0.3** (chosen to balance responsiveness vs stability)
- `current_score` = 1.0 if correct, 0.0 if incorrect
- `previous_mastery` = the existing mastery weight for this node (0.0–1.0)
- If no previous mastery exists (first interaction): `new_mastery = current_score` (cold start)

### 2.3 The Trigger Implementation

```sql
-- Function: update_user_node_mastery()
-- Triggered: AFTER INSERT ON user_interactions

CREATE OR REPLACE FUNCTION update_user_node_mastery()
RETURNS TRIGGER AS $$
DECLARE
  v_node_id UUID;
  v_existing_mastery NUMERIC(5,4);
  v_alpha NUMERIC(3,2) := 0.30;
  v_score NUMERIC(5,4);
  v_new_mastery NUMERIC(5,4);
  v_interaction_count INTEGER;
BEGIN
  -- Get the topic (node) for this question
  SELECT topic_id INTO v_node_id
  FROM questions
  WHERE question_id = NEW.question_id;

  -- Score: 1.0 for correct, 0.0 for incorrect
  v_score := CASE WHEN NEW.is_correct THEN 1.0 ELSE 0.0 END;

  -- Get existing mastery
  SELECT mastery_weight, interaction_count
  INTO v_existing_mastery, v_interaction_count
  FROM user_node_mastery
  WHERE user_id = NEW.user_id AND node_id = v_node_id;

  IF v_existing_mastery IS NULL THEN
    -- Cold start: first interaction on this topic
    INSERT INTO user_node_mastery (user_id, node_id, mastery_weight, interaction_count, last_interaction_at)
    VALUES (NEW.user_id, v_node_id, v_score, 1, now());
  ELSE
    -- EMA update
    v_new_mastery := (v_alpha * v_score) + ((1 - v_alpha) * v_existing_mastery);

    UPDATE user_node_mastery
    SET mastery_weight = v_new_mastery,
        interaction_count = v_interaction_count + 1,
        last_interaction_at = now(),
        updated_at = now()
    WHERE user_id = NEW.user_id AND node_id = v_node_id;
  END IF;

  -- Also insert into mastery_history for trajectory tracking
  INSERT INTO user_mastery_history (user_id, node_id, mastery_weight, triggered_by_interaction_id)
  VALUES (NEW.user_id, v_node_id, COALESCE(v_new_mastery, v_score), NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_update_mastery_on_interaction
  AFTER INSERT ON user_interactions
  FOR EACH ROW EXECUTE FUNCTION update_user_node_mastery();
```

### 2.4 EMA Behavior Examples

Starting from mastery = 0.50 (midpoint), alpha = 0.30:

| Answer | Score | Calculation | New Mastery |
|---|---|---|---|
| Correct | 1.0 | 0.30 × 1.0 + 0.70 × 0.50 | **0.650** |
| Correct | 1.0 | 0.30 × 1.0 + 0.70 × 0.650 | **0.755** |
| Correct | 1.0 | 0.30 × 1.0 + 0.70 × 0.755 | **0.829** |
| Wrong | 0.0 | 0.30 × 0.0 + 0.70 × 0.829 | **0.580** |
| Correct | 1.0 | 0.30 × 1.0 + 0.70 × 0.580 | **0.706** |

Key observations:
- 3 correct answers in a row: 0.50 → 0.83 (significant improvement)
- 1 wrong answer drops from 0.83 → 0.58 (meaningful penalty for recent mistakes)
- Recovery is possible: 1 correct after the wrong brings it to 0.71

This behavior matches learning reality: mastery is fragile and must be maintained.

---

## 3. Readiness Score Computation

The Readiness Score is a single number (0–100) that aggregates all topic masteries into one "are you ready for the ALE?" signal.

### 3.1 Formula

```
Readiness Score = Σ (node_mastery × node_weight × area_weight) / Σ (node_weight × area_weight) × 100
```

Where:
- `node_mastery` = user_node_mastery.mastery_weight for each topic (0.0–1.0)
- `node_weight` = relative importance within its area (normalized to sum to 1.0 per area)
- `area_weight` = ALE area weight:
  - Area A = 0.30
  - Area B = 0.30
  - Area C = 0.40

### 3.2 Node Weights

Each topic node has a weight reflecting its prominence on the ALE:

```typescript
// src/lib/mastery/node-weights.ts

// Weights within Area A (sum = 1.0)
const AREA_A_WEIGHTS: Record<string, number> = {
  'A1-history':     0.15,  // 15% of Area A
  'A1-philippines': 0.10,
  'A2-theory':      0.12,
  'A2-tropical':    0.05,
  'A2-masters':     0.08,
  'A3-practice':    0.15,
  'A3-codes':       0.15,
  'A3-aspects':     0.05,
  'A4-planning':    0.05,
  'A4-urban':       0.05,
  'A4-housing':     0.03,
  'A4-site':        0.02,
};
// ... similar for Area B and Area C
```

### 3.3 Handling Unexplored Nodes

Nodes with zero interactions are **excluded** from the denominator — they don't drag the score down. This means:
- A student who has only studied 5 topics can still have a high Readiness Score for those 5 topics
- As they explore more topics, the denominator grows, but their score reflects actual performance
- The Heatmap shows unexplored nodes as grey — the student sees what they haven't covered yet

Once a student has interacted with a topic even once, it's included in the score forever.

### 3.4 Server-Side Computation

```sql
-- Function to compute Readiness Score for a user
CREATE OR REPLACE FUNCTION compute_readiness_score(p_user_id UUID)
RETURNS NUMERIC(5,2) AS $$
DECLARE
  v_score NUMERIC(5,2);
BEGIN
  SELECT
    COALESCE(
      SUM(unm.mastery_weight * nw.node_weight * nw.area_weight)
      / NULLIF(SUM(nw.node_weight * nw.area_weight), 0)
      * 100,
      0
    ) INTO v_score
  FROM user_node_mastery unm
  JOIN node_weights nw ON nw.node_id = unm.node_id
  WHERE unm.user_id = p_user_id
    AND unm.interaction_count > 0;

  RETURN ROUND(v_score, 2);
END;
$$ LANGUAGE plpgsql STABLE;
```

---

## 4. Heatmap Node Color Logic

Each taxonomy node on the Heatmap displays a color representing the user's mastery state for that topic.

### 4.1 Color Thresholds

```typescript
// src/lib/mastery/heatmap-colors.ts

export function getNodeColor(mastery: number | null, interactionCount: number): HeatmapColor {
  if (interactionCount === 0 || mastery === null) {
    return 'grey';          // Unexplored — no data
  }
  if (mastery >= 0.70) {
    return 'green';         // Passing zone — mastered
  }
  if (mastery >= 0.40) {
    return 'amber';         // In progress — building
  }
  return 'red';             // Needs work — below threshold
}

// Display values:
// Grey:  #9CA3AF  label: "Unexplored"
// Red:   Neutral label only — "Needs review" (NEVER red color in UI — use amber-toned indicator)
// Amber: #F5A623  label: "Building"
// Green: #1B7A3C  label: "Mastered"
```

> **CRITICAL:** The "Red" mastery zone does NOT use red color (#E63329) in the UI. Per the No-Red design principle, topics needing review use a neutral text label "Needs review" with a muted indicator. The word "red" is used internally for data classification only.

### 4.2 Node State Transitions

```
Grey (unexplored) → any color on first interaction
Red (<0.40) → Amber on reaching 0.40 mastery
Amber (0.40–0.69) → Green on reaching 0.70 mastery
Green (≥0.70) → Amber if mastery drops below 0.70 (skill decay without practice)
Amber → Red if mastery drops below 0.40
```

---

## 5. Blindspot Protocol

The Blindspot Protocol identifies topics the student is weakest on and hasn't practiced recently, then surfaces them for Focused Review.

### 5.1 Blindspot Score Formula

```
Blindspot Score = (1 - mastery_weight) × recency_decay × area_weight
```

Where:
- `mastery_weight` = current EMA mastery (0–1)
- `recency_decay` = how long since the student last practiced this topic
  - `1.0` if last_interaction_at > 14 days ago
  - `0.7` if 7–14 days ago
  - `0.4` if 3–7 days ago
  - `0.1` if < 3 days ago (recently practiced — lower priority)
- `area_weight` = ALE area weight (0.30 or 0.40) — higher-weighted ALE areas get more attention

### 5.2 Blindspot Queue

```sql
-- Refreshed after each session completion
-- Selects top N topics with highest blindspot scores

INSERT INTO blindspot_queues (user_id, node_id, blindspot_score, queued_at)
SELECT
  $userId,
  unm.node_id,
  (1 - unm.mastery_weight) *
    CASE
      WHEN unm.last_interaction_at < now() - interval '14 days' THEN 1.0
      WHEN unm.last_interaction_at < now() - interval '7 days' THEN 0.7
      WHEN unm.last_interaction_at < now() - interval '3 days' THEN 0.4
      ELSE 0.1
    END *
    nw.area_weight AS blindspot_score,
  now()
FROM user_node_mastery unm
JOIN node_weights nw ON nw.node_id = unm.node_id
WHERE unm.user_id = $userId
  AND unm.mastery_weight < 0.70       -- Only topics not yet mastered
ORDER BY blindspot_score DESC
LIMIT 10                               -- Top 10 blindspots
ON CONFLICT (user_id, node_id) DO UPDATE
  SET blindspot_score = EXCLUDED.blindspot_score,
      queued_at = now();
```

### 5.3 How Focused Review Uses Blindspots

When a user enters Focused Review:
1. Query `blindspot_queues` for top 5 topics (sorted by blindspot_score DESC)
2. Pre-select these topics in the Topic Picker (Intro Slide 2)
3. User can adjust selection but defaults nudge toward their weakest areas
4. Questions selected from these topics with adaptive difficulty starting at Level 2 (easier than Subject Mode — the student is struggling here)

---

## 6. Session Score Calculation

### 6.1 During Session (Running Accuracy)

```typescript
// Simple running accuracy for progress display
const runningAccuracy = correctCount / answeredCount;
// Displayed as: "12/15 correct (80%)"
```

### 6.2 End-of-Session Score

```typescript
interface SessionScore {
  correct: number;           // Count of correct answers
  total: number;             // Total questions answered (skipped excluded)
  skipped: number;           // Count of skipped questions
  percent: number;           // correct / total × 100
  subjectBreakdown: Array<{
    disciplineId: string;
    disciplineName: string;
    correct: number;
    total: number;
    percent: number;
  }>;
  readinessScoreBefore: number;
  readinessScoreAfter: number;
  readinessScoreDelta: number;
  growthVsPreviousSession: number | null;  // Delta vs last session on same topics
}
```

### 6.3 Score Framing Rules (for UI)

| Score Range | Label | Color | Growth Framing |
|---|---|---|---|
| ≥ 70% | "Passing" | Signal Green text | "You'd pass this section of the ALE." |
| 50–69% | "Building" | Neutral charcoal text | "You're getting there. Focus on [weakest topic]." |
| < 50% | "Needs review" | Neutral charcoal text | "This topic needs more practice. Let's target it." |

**NEVER display:**
- ❌ "You failed" / "Failing"
- ❌ Red-colored scores
- ❌ Frowning faces / negative emoji
- ❌ Comparative language ("You're below average")

**ALWAYS display:**
- ✓ Growth delta when available ("▲ +8% from last time")
- ✓ Concrete next action ("Practice these 3 missed questions")
- ✓ Subject breakdown sorted weakest-first (directs attention to what matters)

---

## 7. Readiness Score Snapshot & Trajectory

After every session that affects mastery (all modes except Chill):

```sql
INSERT INTO readiness_score_snapshots (user_id, score, session_id, snapshot_type)
VALUES (
  $userId,
  compute_readiness_score($userId),
  $sessionId,
  'post_session'
);
```

The trajectory chart on the Readiness Score screen queries:

```sql
SELECT score, created_at
FROM readiness_score_snapshots
WHERE user_id = $userId
ORDER BY created_at ASC;
```

This produces the "score over time" line chart that Pro users see. Each point is a post-session snapshot. The line should trend upward if the student is improving. Flat = stagnation. Declining = skill decay (not practicing enough).

---

## 8. Confidence Calibration

When confidence ratings are enabled (Camp, Subject, Focused modes), the system tracks calibration:

```
If user says "Very sure" and is correct → Well-calibrated
If user says "Very sure" and is wrong → Overconfident (important signal)
If user says "Guessing" and is correct → Lucky guess (not mastered)
If user says "Guessing" and is wrong → Expected
```

### 8.1 Storage

Confidence is stored per-question in `session_questions.confidence_level` (1/2/3) and per-interaction in `user_interactions`.

### 8.2 Analytics Use

- **Overconfidence rate:** % of "Very sure" answers that are wrong. High overconfidence → student thinks they know more than they do → dangerous for exam.
- **Lucky guess rate:** % of "Guessing" answers that are correct. These topics need reinforcement — the student got it right by chance.
- **Calibration score:** Correlation between confidence and accuracy. Perfect calibration = 1.0. Used in the Readiness Score model as a secondary signal.

---

## 9. Stamina Analysis (Extended/Exam Sessions)

For sessions ≥50 questions, the system computes accuracy in blocks to detect fatigue:

```typescript
// src/lib/mastery/stamina-analysis.ts

interface StaminaBlock {
  blockNumber: number;         // 1, 2, 3, 4...
  questionRange: [number, number]; // [1, 25], [26, 50], etc.
  accuracy: number;            // 0.0–1.0
  avgTimePerQuestion: number;  // milliseconds
}

function analyzeStamina(answers: SessionQuestion[], blockSize: number = 25): StaminaBlock[] {
  const blocks: StaminaBlock[] = [];
  for (let i = 0; i < answers.length; i += blockSize) {
    const block = answers.slice(i, i + blockSize);
    const correct = block.filter(a => a.is_correct).length;
    const avgTime = block.reduce((sum, a) => sum + (a.time_spent_ms || 0), 0) / block.length;
    blocks.push({
      blockNumber: Math.floor(i / blockSize) + 1,
      questionRange: [i + 1, Math.min(i + blockSize, answers.length)],
      accuracy: correct / block.length,
      avgTimePerQuestion: avgTime,
    });
  }
  return blocks;
}
```

**Stamina signals:**
- Accuracy drops >15% from first block to last block → fatigue pattern
- Average time per question increases >30% in later blocks → slowing down
- Both together → strong stamina deficit signal → recommend more Extended Practice sessions

Displayed in the Results Dashboard as a line chart: "Accuracy over time" with blocks on the x-axis and % on the y-axis.
