# IMPL_04: Pre-Questions Before Wiki Reading

**Priority:** P1  
**Effort:** ~2 days  
**Research basis:** Prequestions with feedback amplify learning g = 1.25 (meta-analysis 2026). Primes retrieval pathways before encoding.

---

## Mechanism

Before a student reads a Wiki article, surface 3–5 questions about that topic. The student answers from prior knowledge (or guesses). They get brief feedback. THEN they read the article with activated retrieval pathways. The brain is primed to attend to information it just failed to recall.

---

## Implementation

### 1. Question Selection

**File:** `src/lib/actions/wiki/get-prequestions.ts`

```typescript
'use server';

export async function getPrequestions(topicId: string, count = 3) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Select questions mapped to this topic, preferring ones the user
  // has NOT seen recently (>7 days or never attempted)
  const { data } = await supabase
    .rpc('select_prequestions', {
      p_topic_id: topicId,
      p_user_id: user?.id ?? null,
      p_count: count,
    });

  return data;
}
```

**SQL function:**

```sql
CREATE OR REPLACE FUNCTION select_prequestions(
  p_topic_id UUID,
  p_user_id UUID,
  p_count INTEGER DEFAULT 3
)
RETURNS SETOF questions AS $$
  SELECT q.*
  FROM questions q
  WHERE q.topic_id = p_topic_id
    AND q.status = 'published'
    AND q.difficulty_rating <= 0.6  -- Keep prequestions easy-to-medium
    AND (
      p_user_id IS NULL
      OR q.id NOT IN (
        SELECT ui.question_id FROM user_interactions ui
        WHERE ui.user_id = p_user_id
        AND ui.created_at > NOW() - INTERVAL '7 days'
      )
    )
  ORDER BY RANDOM()
  LIMIT p_count;
$$ LANGUAGE SQL STABLE;
```

### 2. Prequestion Modal Component

**File:** `src/components/wiki/PrequestionGate.tsx`

**Behavior:**
- When user navigates to a Wiki article, check if ≥3 questions exist for that topic_id
- If yes: show a modal/slide-over with the prequestions before rendering the article
- If no questions available: skip, show article directly
- User can always "Skip to Article" — this is not a hard gate

**UI flow:**
1. Header: "Quick check — what do you already know about [topic name]?"
2. Questions presented one at a time, simple tap-to-answer
3. After each answer: brief green/red flash + 1-sentence rationale (no full rationale block)
4. After all questions: summary card "You got 1/3. Keep an eye out for [missed concepts] as you read."
5. CTA: "Start Reading" → article renders with the missed concepts highlighted/annotated in the text if possible

### 3. Interaction Recording

Prequestion answers are recorded in `user_interactions` with a new test_mode value:

```sql
-- Add to test_mode enum if not present
ALTER TYPE test_mode ADD VALUE IF NOT EXISTS 'prequestion';
```

These interactions feed into the mastery system with reduced EMA weight (α = 0.1 instead of 0.2) since prequestions are deliberately asked before the student has studied.

### 4. Wiki Article Enhancement

After prequestions are answered, pass the missed topic_ids to the article renderer. Within the `WikiArticle` component, subtly highlight paragraphs that address the missed prequestion concepts:

```typescript
// In WikiArticle component
const missedConceptIds = prequestionResults
  .filter(r => !r.is_correct)
  .map(r => r.question.related_section_id); // Links to article section anchors

// Add a subtle left-border highlight to those sections
// Color: Amber #D4951A at 20% opacity
```

---

## Settings & Preferences

Add to user preferences (existing `notification_preferences` pattern):
- `show_prequestions`: boolean, default true
- Accessible from Wiki settings: "Show warm-up questions before reading" toggle

---

## Metrics

- Prequestion accuracy vs. post-reading quiz accuracy on same topic (proves the article taught something)
- % of users who complete prequestions vs. skip
- Correlation between prequestion engagement and Readiness Score growth
