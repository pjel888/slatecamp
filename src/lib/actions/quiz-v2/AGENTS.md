<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-02 | Updated: 2026-04-06 -->

# quiz-v2

## Purpose

V2 quiz engine server actions for session lifecycle, answer submission, feedback, confidence tracking, post-interaction mastery updates, and SRS scheduling. This is the core mutation layer for all quiz interactions in Camp, Storm, Chill, and timed modes.

## Hardened Architecture (Remediation 2026-04-06)

The quiz-v2 actions follow a strict server-owned data contract to prevent client-side manipulation and ensure data integrity:

1.  **Server-Derived Question Slices**: `getSessionQuestions` takes only `sessionId`, `offset`, and `limit`. It fetches the `question_ids` from the database and slices them server-side. It **never** trusts client-supplied question IDs.
2.  **Single-Owner Finalization**: `submitAnswer` is the sole owner of the completion path. When the last question is answered, it awaits all background work and then triggers `endSession` internally. The client receives the `finalResult` in the `submitAnswer` response.
3.  **Unified Question Contract**: All paths (start, resume, background load) use `fetchQuestionsForClient` from `@/lib/quiz/to-client-question` to ensure a consistent payload contract.
4.  **Strict Input Validation**: All public server actions validate inputs against Zod schemas defined in `schemas.ts`.

## Key Files

| File | Description |
|------|-------------|
| **start-session.ts** | Quiz session creation with question selection (standard, interleaved, or discipline-filtered), difficulty filtering, taxonomy breadcrumb enrichment, CAGE nonce issuance |
| **submit-answer.ts** | Answer submission (MCQ and generation types), correctness determination, confidence recording, lucky guess detection, SRS scheduling, error classification, behavioral signal storage. Triggers finalization on completion. |
| **end-session.ts** | Session completion: final stats, readiness score recomputation, post-session hooks (streak updates, debrief generation). Idempotent guard for terminal sessions. |
| **get-session-questions.ts** | Hardened question loading: server-side slicing of session question IDs. |
| **session-helpers.ts** | Centralized session ownership and status helpers (`getOwnedSessionOrThrow`, `isTerminalSessionStatus`). |
| **schemas.ts** | Zod schemas for all quiz-v2 action inputs. |
| **skip-question.ts** | Skip a question in session without answering |
| **flag-question.ts** | Mark a question for later review within session |
| **pause-resume.ts** | Session pause/resume state management |
| **get-review-data.ts** | Fetch review session summary: answered/skipped/flagged questions, rationales, error diagnostics |
| **get-confidence-matrix.ts** | Confidence calibration matrix: correctness vs confidence level cross-tabulation |
| **save-prediction.ts** | Store user confidence prediction before answering (pre-commitment) |
| **save-postdiction.ts** | Store user confidence assessment after revealing answer |
| **get-prediction-history.ts** | Fetch prior predictions and postdictions for a user across sessions |
| **check-generation-answer.ts** | Validate numeric, formula, or short-text answers against correct values |
| **classify-and-store-error.ts** | ML-based error classification: misconception, careless, time-pressure, etc. Supports immediate diagnostic return. |
| **successive-relearning.ts** | Successive relearning protocol: schedule questions for repeated retrieval practice |
| **sr-post-submit.ts** | Spaced repetition scheduling post-submit: update SRS queue based on correctness |
| **post-session-hooks.ts** | Fire-and-forget hooks after session completion: streak updates, goal progress, catalyst events |
| **generate-recommendations.ts** | Post-session recommendations: next study topics, modes, review priorities |
| **index.ts** | Barrel export of public actions |

## For AI Agents

### Working In This Directory

1. **Use `'use server'`** on all action files.
2. **Auth validation** — all actions validate user and session ownership with `getOwnedSessionOrThrow(supabase, userId, sessionId, select)`.
3. **Input validation** — always parse `input` with the corresponding schema from `schemas.ts`.
4. **Try/catch for non-critical ops** — SRS updates, hooks, and signal storage are fire-and-forget and must not break the quiz flow.
5. **Question ordering** — always compute `questionOrder` as `sessionQuestionIds.indexOf(questionId) + 1` to track position.
6. **Consistent Payload** — Use `fetchQuestionsForClient` or `toClientQuestion` for all question payloads returned to the client.
7. **Finalization** — Do not call `endSession` from the client if `submitAnswer` can handle it. `submitAnswer` should trigger internal finalization on the last question.

### Common Patterns

**Hardened question fetching:**
```typescript
export const getSessionQuestions = async (input: SessionQuestionSliceInput) => {
  const parsedInput = sessionQuestionSliceInputSchema.parse(input)
  const session = await getOwnedSessionOrThrow(supabase, userId, parsedInput.sessionId, 'question_ids')
  const slice = session.question_ids.slice(parsedInput.offset, parsedInput.offset + parsedInput.limit)
  return await fetchQuestionsForClient({ supabase, questionIds: slice, offset: parsedInput.offset })
}
```

**Single-owner completion in `submitAnswer`:**
```typescript
if (sessionComplete) {
  await runPostSubmitWork() // Ensure ordering
  const finalResult = await endSessionAction({ sessionId, endReason: 'completed' })
  return { ...result, finalResult, sessionComplete: true }
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
