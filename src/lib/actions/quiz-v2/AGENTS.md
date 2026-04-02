<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-02 | Updated: 2026-04-02 -->

# quiz-v2

## Purpose

V2 quiz engine server actions for session lifecycle, answer submission, feedback, confidence tracking, post-interaction mastery updates, and SRS scheduling. This is the core mutation layer for all quiz interactions in Camp, Storm, Chill, and timed modes.

## Key Files

| File | Description |
|------|-------------|
| **start-session.ts** | Quiz session creation with question selection (standard, interleaved, or discipline-filtered), difficulty filtering, taxonomy breadcrumb enrichment, CAGE nonce issuance |
| **submit-answer.ts** | Answer submission (MCQ and generation types), correctness determination, confidence recording, lucky guess detection, SRS scheduling, error classification, behavioral signal storage |
| **end-session.ts** | Session completion: final stats, readiness score recomputation, post-session hooks (streak updates, debrief generation) |
| **skip-question.ts** | Skip a question in session without answering |
| **flag-question.ts** | Mark a question for later review within session |
| **pause-resume.ts** | Session pause/resume state management |
| **get-review-data.ts** | Fetch review session summary: answered/skipped/flagged questions, rationales, error diagnostics |
| **get-confidence-matrix.ts** | Confidence calibration matrix: correctness vs confidence level cross-tabulation |
| **save-prediction.ts** | Store user confidence prediction before answering (pre-commitment) |
| **save-postdiction.ts** | Store user confidence assessment after revealing answer |
| **get-prediction-history.ts** | Fetch prior predictions and postdictions for a user across sessions |
| **check-generation-answer.ts** | Validate numeric, formula, or short-text answers against correct values |
| **classify-and-store-error.ts** | ML-based error classification: misconception, careless, time-pressure, etc. |
| **successive-relearning.ts** | Successive relearning protocol: schedule questions for repeated retrieval practice |
| **sr-post-submit.ts** | Spaced repetition scheduling post-submit: update SRS queue based on correctness |
| **post-session-hooks.ts** | Fire-and-forget hooks after session completion: streak updates, goal progress, catalyst events |
| **generate-recommendations.ts** | Post-session recommendations: next study topics, modes, review priorities |
| **index.ts** | Barrel export of public actions |

## For AI Agents

### Working In This Directory

1. **Use `'use server'`** on all action files.
2. **Auth validation** — all actions validate user and session ownership with `getUser()` and `.eq('user_id', user.id)`.
3. **Try/catch for non-critical ops** — SRS updates, hooks, and signal storage are fire-and-forget and must not break the quiz flow.
4. **Question ordering** — always compute `questionOrder` as `sessionQuestionIds.indexOf(questionId) + 1` to track position.
5. **Confident heuristics** — lucky guess detection uses `timeSpentMs < speedThreshold` where `speedThreshold = 3000 + difficulty * 5000`.
6. **Feedback timing** — respect session config `feedback.timing` (immediate/deferred/none) to control rationale visibility.
7. **Revalidate on critical mutations** — call `revalidatePath()` on session completion only.
8. **Generation effect** — correct generation (non-MCQ) answers get 1.2x EMA weight multiplier for stronger memory trace.

### Common Patterns

**Answer submission with auth and session validation:**
```typescript
'use server'

import { createClient, getUser } from '@/lib/supabase/server'

export const submitAnswer = async (input: SubmitAnswerInput): Promise<SubmitAnswerResult> => {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) throw new Error('Unauthorized')

  // Validate session belongs to user and is in progress
  const { data: session } = await supabase
    .from('quiz_sessions')
    .select('session_id, user_id, status, question_ids')
    .eq('session_id', input.sessionId)
    .eq('user_id', user.id)
    .single()

  if (!session || session.status !== 'in_progress') throw new Error('Session not found')

  // Proceed with mutation
  return { ... }
}
```

**Lucky guess detection and correctness determination:**
```typescript
const difficulty = question.difficulty ?? 0.5
const speedThreshold = 3000 + difficulty * 5000
const isSuspectedLuckyGuess = isCorrect && timeSpentMs < speedThreshold

// Lucky guess overrides generation effect: 0.5x EMA weight
let generationMultiplier = isGeneration && isCorrect ? 1.2 : 1.0
if (isSuspectedLuckyGuess) {
  generationMultiplier = 0.5
}
```

**Confident calibration mapping (0–1 scale to legacy text):**
```typescript
const confidenceScore = confidenceLevel ?? null
const confidenceText =
  confidenceLevel != null
    ? confidenceLevel <= 0.33 ? 'unsure' : confidenceLevel >= 0.67 ? 'sure' : null
    : null
```

**SRS scheduling (non-blocking, fire-and-forget):**
```typescript
if (sessionConfig?.mode === 'camp' || sessionConfig?.mode === 'focused') {
  const quality = deriveQualityRating({
    isCorrect,
    timeSpentMs,
    avgTimeMs: 0,
    confidence: confidenceText,
    isSuspectedLuckyGuess,
  })
  updateSrsSchedule(user.id, question.topic_id!, quality).catch(() => {
    // Log but do not throw — SRS must not block quiz
  })
}
```

**Behavioral signal storage (fire-and-forget):**
```typescript
if (interactionId && (input.signalTrace?.length || input.cageToken)) {
  ;(async () => {
    try {
      const { createAdminClient: getAdmin } = await import('@/lib/supabase/admin')
      const admin = getAdmin()

      // Store signal trace, CAGE token, feature extraction, cognitive state
      // All non-blocking — wrapped in dynamic import + async IIFE
    } catch {
      // Swallow — entire block is optional
    }
  })()
}
```

## Dependencies

### Internal

- `@/lib/supabase/server` — createClient, getUser
- `@/lib/supabase/admin` — createAdminClient for signal/behavioral storage
- `@/lib/quiz/mode-presets` — mergeWithPreset
- `@/lib/quiz/interleaved-selection` — selectQuestionsWithInterleaving
- `@/lib/quiz/answer-matching` — matchGenerationAnswer
- `@/lib/quiz/memory-strength` — updateStorageStrength, currentRetrievalStrength
- `@/lib/srs/update` — deriveQualityRating, updateSrsSchedule
- `@/lib/signals/extractFeatures` — extractFeatures
- `@/lib/inference/classifyConfidence` — classifyBehavioralState
- `@/lib/cage/nonceService` — issueNonceBatch
- `@/lib/utils/question` — resolveRationaleText, normalizeOptions
- `@/lib/actions/mastery/post-interaction-hooks` — runPostInteractionHooks
- `@/lib/constants/analytics` — color mappings, thresholds
- `@/types/quiz-config` — StartSessionInput, SubmitAnswerInput, QuestionForClient, etc.

### External

- `@supabase/supabase-js` — Supabase client
- `crypto` — randomBytes for session key generation
- `next/cache` — revalidatePath
