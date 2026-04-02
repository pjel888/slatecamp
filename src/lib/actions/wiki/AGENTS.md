<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-02 | Updated: 2026-04-02 -->

# wiki

## Purpose

Wiki interaction server actions. Handles pre-reading questions (prequestions), prequestion submissions with reduced mastery weight, and prequestion retrieval for wiki article navigation.

## Key Files

| File | Description |
|------|-------------|
| **submit-prequestion.ts** | Submit a prequestion answer: validate correctness, record interaction with `source_type: 'prequestion'`, update mastery with reduced alpha (0.1 vs standard 0.3), return rationale |
| **get-prequestions.ts** | Fetch prequestions for a wiki article or topic to populate pre-reading assessment flow |

## For AI Agents

### Working In This Directory

1. **Use `'use server'`** on all action files.
2. **Auth required** — all actions validate user with `getUser()`.
3. **Reduced EMA weight** — prequestions use alpha = 0.1 (vs. 0.3 standard) because they measure baseline knowledge, not post-study mastery.
4. **Source type marker** — all interactions record `source_type: 'prequestion'` to allow mastery system to apply different weighting.
5. **Rationale delivery** — extract a brief summary sentence (~200 chars) for prequestion feedback; store full rationale separately if needed.
6. **Non-blocking hooks** — post-interaction hooks run with reduced weight context; failures are logged but never thrown.

### Common Patterns

**Prequestion submission with reduced mastery weight:**
```typescript
'use server'

import { createClient, getUser } from '@/lib/supabase/server'
import { runPostInteractionHooks } from '@/lib/actions/mastery/post-interaction-hooks'

export const submitPrequestion = async (
  input: SubmitPrequestionInput,
): Promise<SubmitPrequestionResult> => {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) throw new Error('Unauthorized')

  // 1. Validate question and determine correctness
  const { data: question } = await supabase
    .from('questions')
    .select('question_id, topic_id, correct_option_id, rationale')
    .eq('question_id', input.questionId)
    .single()

  const isCorrect = question.correct_option_id === input.selectedOptionId

  // 2. Record interaction with source_type marker
  await supabase.from('user_interactions').upsert({
    session_id: input.sessionId,
    question_id: input.questionId,
    topic_id: question.topic_id,
    user_id: user.id,
    selected_option_id: input.selectedOptionId,
    is_correct: isCorrect,
    time_spent_ms: input.timeSpentMs,
    source_type: 'prequestion',  // Marker for reduced mastery weight
    interaction_timestamp: new Date().toISOString(),
  }, { onConflict: 'user_id,session_id,question_id' })

  // 3. Update mastery with reduced alpha (0.1)
  const prevMastery = currentMastery?.current_mastery_weight ?? 0.0
  const alpha = 0.1  // Reduced from standard 0.3
  const newMastery = Math.min(Math.max(alpha * (isCorrect ? 1.0 : 0.0) + (1 - alpha) * prevMastery, 0), 1)

  await supabase.from('user_node_mastery').upsert({
    user_id: user.id,
    topic_id: question.topic_id,
    current_mastery_weight: newMastery,
    total_attempts: totalAttempts,
    total_correct: totalCorrect,
    last_encountered: now,
  }, { onConflict: 'user_id,topic_id' })

  // 4. Fire hooks (reduced weight context)
  runPostInteractionHooks({
    userId: user.id,
    topicId: question.topic_id,
    isCorrect,
    timeSpentMs: input.timeSpentMs,
    avgTimeMs: 0,
    difficulty: 0.5,
    isInterleaved: false,
    sessionMode: 'prequestion',  // Mode marker
  }).catch(() => {
    // Non-fatal
  })

  // 5. Return brief rationale (first sentence, ~200 chars)
  const fullRationale = resolveRationaleText(question.rationale)
  const briefRationale = fullRationale
    ? fullRationale.split(/(?<=[.!?])\s+/)[0]?.slice(0, 200) ?? fullRationale.slice(0, 200)
    : null

  return {
    isCorrect,
    correctOptionId: question.correct_option_id,
    rationale: briefRationale,
    fullRationale: fullRationale ?? null,
  }
}
```

## Dependencies

### Internal

- `@/lib/supabase/server` — createClient, getUser
- `@/lib/actions/mastery/post-interaction-hooks` — runPostInteractionHooks
- `@/lib/utils/question` — resolveRationaleText
- `@/types/wiki` — SubmitPrequestionInput, SubmitPrequestionResult

### External

- `@supabase/supabase-js` — Supabase client
