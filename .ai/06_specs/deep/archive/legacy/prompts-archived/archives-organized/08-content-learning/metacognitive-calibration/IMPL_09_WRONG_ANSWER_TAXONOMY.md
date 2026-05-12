# IMPL_09: Wrong Answer Taxonomy & Concept Confusion Detector

**Priority:** P1
**Effort:** ~3 days
**Research basis:** Elaborative interrogation (addressing the specific misconception) is significantly more effective than simply revealing the correct answer. Concept confusion pairs represent the highest-leverage content to create.

---

## Error Classification Engine

Every wrong answer is classifiable into a diagnostic category based on observable signals: which wrong option was selected, how long the student took, the difficulty of the question, and whether this topic has been attempted before.

### Error Categories

| Category | Signal Pattern | Student Message |
|---|---|---|
| `concept_confusion` | Selected the option that corresponds to a related but different code/rule. Time is normal or high (they were thinking, but about the wrong concept). | "Looks like you might be mixing up [X] and [Y]. They're closely related but different." |
| `misremembered_fact` | Selected an option with a partially correct value (e.g., 1000mm instead of 1100mm). Time is medium. Has seen this topic before. | "You had the right idea but the specific value was off. The correct value is [X]." |
| `computation_error` | For numeric/formula questions: answer is close but not within tolerance. Time is high (they did work). | "Your calculation was close. Check [specific step] — that's usually where this goes wrong." |
| `misread_question` | Selected an option that would be correct for a different reading of the question (e.g., "minimum" vs "maximum"). Time is low. | "Double-check the question — it asked for [X], not [Y]." |
| `random_guess` | Time is extremely low (<25th percentile) AND answer is wrong. | "Looks like you moved quickly on this one. Take a moment with the rationale." |
| `knowledge_gap` | Time is high, no previous attempts on this topic, selected a distractor with no conceptual proximity to the correct answer. | "This topic is new territory. Start with the Wiki article to build a foundation." |

### Classification Logic

**File:** `src/lib/quiz/error-classifier.ts`

```typescript
interface ErrorClassification {
  category: 'concept_confusion' | 'misremembered_fact' | 'computation_error' |
    'misread_question' | 'random_guess' | 'knowledge_gap';
  confidence: number; // 0-1 confidence in the classification
  relatedTopicId?: string; // For concept_confusion: the confused topic
  message: string;
}

export function classifyError(
  interaction: UserInteraction,
  question: Question,
  userNodeMastery: UserNodeMastery | null,
  medianTimeMs: number
): ErrorClassification {
  const timeRatio = interaction.time_spent_ms / medianTimeMs;
  const hasHistory = userNodeMastery !== null && userNodeMastery.total_attempts > 0;
  const selectedOption = question.options.find(o => o.id === interaction.selected_option_id);

  // Random guess: very fast + wrong
  if (timeRatio < 0.4) {
    return { category: 'random_guess', confidence: 0.8, message: '...' };
  }

  // Concept confusion: selected option is tagged with a related_topic_id
  // (requires content team to tag distractors with the concept they represent)
  if (selectedOption?.related_topic_id && selectedOption.related_topic_id !== question.topic_id) {
    return {
      category: 'concept_confusion',
      confidence: 0.7,
      relatedTopicId: selectedOption.related_topic_id,
      message: '...',
    };
  }

  // Knowledge gap: no prior history + high time (tried but couldn't figure it out)
  if (!hasHistory && timeRatio > 1.2) {
    return { category: 'knowledge_gap', confidence: 0.6, message: '...' };
  }

  // Misremembered fact: has history + medium time + not a random guess
  if (hasHistory && timeRatio >= 0.4 && timeRatio <= 1.5) {
    return { category: 'misremembered_fact', confidence: 0.5, message: '...' };
  }

  // Default: knowledge gap
  return { category: 'knowledge_gap', confidence: 0.3, message: '...' };
}
```

### Schema Addition

```sql
ALTER TABLE user_interactions ADD COLUMN error_category TEXT;
ALTER TABLE user_interactions ADD COLUMN error_confidence NUMERIC(3,2);
```

Populated by the classifier in `submit-answer.ts` when `is_correct = false`.

---

## Concept Confusion Detector (Aggregate Analysis)

### Co-Failure Analysis

Run weekly (pg_cron) to identify topic pairs that students consistently confuse:

```sql
-- Find topic pairs where users who fail topic A also fail topic B
-- at a rate significantly above baseline
CREATE OR REPLACE FUNCTION detect_confusion_pairs()
RETURNS TABLE(topic_a UUID, topic_b UUID, co_failure_rate NUMERIC, sample_size INTEGER) AS $$
WITH failures AS (
  SELECT user_id, topic_id
  FROM user_node_mastery
  WHERE current_mastery_weight < 0.5
),
pairs AS (
  SELECT a.topic_id AS topic_a, b.topic_id AS topic_b, COUNT(DISTINCT a.user_id) AS co_fail_count
  FROM failures a
  JOIN failures b ON a.user_id = b.user_id AND a.topic_id < b.topic_id
  GROUP BY a.topic_id, b.topic_id
  HAVING COUNT(DISTINCT a.user_id) >= 10  -- minimum sample
)
SELECT
  topic_a, topic_b,
  co_fail_count::NUMERIC / GREATEST(
    (SELECT COUNT(DISTINCT user_id) FROM failures WHERE topic_id = pairs.topic_a), 1
  ) AS co_failure_rate,
  co_fail_count AS sample_size
FROM pairs
WHERE co_fail_count::NUMERIC / GREATEST(
  (SELECT COUNT(DISTINCT user_id) FROM failures WHERE topic_id = pairs.topic_a), 1
) > 0.5  -- More than 50% co-failure rate
ORDER BY co_failure_rate DESC;
$$ LANGUAGE SQL;
```

### New table: `confusion_pairs`

```sql
CREATE TABLE confusion_pairs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_a UUID NOT NULL REFERENCES taxonomy_tree(id),
  topic_b UUID NOT NULL REFERENCES taxonomy_tree(id),
  co_failure_rate NUMERIC(5,4) NOT NULL,
  sample_size INTEGER NOT NULL,
  disambiguation_article_id UUID REFERENCES wiki_articles(id),
  detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(topic_a, topic_b)
);
```

### Content Response

When a confusion pair is detected:
1. Flag it for the content team in the CMS → SME review queue
2. Content team writes a disambiguation Wiki section: "X vs. Y: How to Tell Them Apart"
3. System auto-generates a targeted quiz mixing questions from both topics (interleaving)
4. Students who have been classified as `concept_confusion` between these two topics get a notification: "We noticed you might be mixing up X and Y. We built a quick guide."

---

## FeedbackPanel Enhancement

**File:** Modify `src/components/testing/quiz-v2/FeedbackPanel.tsx`

When error_category is available, add a diagnostic line above the standard rationale:

```
┌─ Error Type: Concept Confusion ──────────────────┐
│ You may be mixing up Rule 7 (setbacks) with      │
│ Rule 8 (height limits). They govern different     │
│ aspects of the same building.                     │
│                                                    │
│ → Read: "Rule 7 vs. Rule 8" disambiguation guide  │
└───────────────────────────────────────────────────┘
```

Design: subtle top banner above the rationale, using the question's error classification. Only shown when classification confidence > 0.5.
