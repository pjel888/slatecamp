<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-02 | Updated: 2026-04-02 -->

# mastery

## Purpose

Server actions for mastery and Item Response Theory (IRT) calculations. Updates memory strength (storage/retrieval), decay rates, detects cramming, computes mastery weights, and applies post-interaction hooks. All updates follow IRT 2-parameter logistic model (theta, discrimination, difficulty).

## Key Files

| File | Description |
|------|-------------|
| **update-memory-strength.ts** | Post-interaction memory updates: storage strength (SS) and retrieval strength (RS) with generation effect multiplier (1.2x for correct generation answers) and EMA weighting |
| **update-decay-rate.ts** | Compute and persist decay rate per topic based on mastery weight, accuracy ratio, and recency |
| **post-interaction-hooks.ts** | Fire-and-forget hooks after each interaction: mastery updates, decay rate recomputation, IRT theta calibration |
| **cramming-detector.ts** | Detect and flag cramming behavior: rapid repeated attempts within time window, reduced learning signal |
| **dismiss-empty-topic.ts** | Mark exhausted topics (all questions answered, mastery plateaued) to avoid redundant practice |

## For AI Agents

### Working In This Directory

1. **Use `'use server'`** on all action files.
2. **Non-blocking** — all mastery updates are fire-and-forget. Failures are logged but never propagate to the quiz flow.
3. **EMA weighting** — storage strength updates apply `emaWeightMultiplier` (1.2x for generation effect, 0.5x for lucky guess) to the SS increment.
4. **Decay calculation** — use half-life formula: `decayRate = Math.LN2 / halfLife` where `halfLife = 5 + accuracyRatio * 25` days.
5. **Context diversity** — track `practice_contexts` to detect learning variability (same material across different session modes).
6. **IRT 2-parameter** — theta (user ability) and difficulty calibration happen post-interaction; use Supabase RPC or async background process.
7. **Catch all errors** — wrap mastery updates in try/catch with console.error but no rethrow.

### Common Patterns

**Memory strength update with generation effect:**
```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { updateStorageStrength, currentRetrievalStrength } from '@/lib/quiz/memory-strength'

export const updateMemoryStrength = async (
  userId: string,
  topicId: string,
  isCorrect: boolean,
  difficulty: number,
  isInterleaved: boolean,
  sessionMode: string,
  emaWeightMultiplier = 1.0,
): Promise<void> => {
  try {
    const supabase = await createClient()

    // 1. Fetch current mastery
    const { data: mastery } = await supabase
      .from('user_node_mastery')
      .select('storage_strength, retrieval_strength, practice_count, practice_contexts, last_encountered')
      .eq('user_id', userId)
      .eq('topic_id', topicId)
      .single()

    if (!mastery) {
      // Initialize new row with base SS/RS values
      await supabase.from('user_node_mastery').upsert({
        user_id: userId,
        topic_id: topicId,
        storage_strength: 0.3,
        retrieval_strength: 0.5,
        practice_count: 1,
      }, { onConflict: 'user_id,topic_id' })
      return
    }

    // 2. Compute decayed RS before applying new interaction
    const daysSinceReview = (Date.now() - new Date(mastery.last_encountered).getTime()) / (1000 * 60 * 60 * 24)
    const decayedRS = currentRetrievalStrength(mastery.retrieval_strength, mastery.storage_strength, daysSinceReview)

    // 3. Update SS with generation effect multiplier
    const baseSS = updateStorageStrength(mastery.storage_strength, { isCorrect, difficulty, isInterleaved })
    const ssIncrement = baseSS - mastery.storage_strength
    const newSS = Math.min(mastery.storage_strength + ssIncrement * emaWeightMultiplier, 1.0)

    // 4. Update RS based on correctness
    const newRS = isCorrect ? Math.max(decayedRS, 0.8) : decayedRS

    // 5. Persist
    await supabase.from('user_node_mastery').update({
      storage_strength: Math.round(newSS * 1000) / 1000,
      retrieval_strength: Math.round(newRS * 1000) / 1000,
      practice_count: mastery.practice_count + 1,
      last_encountered: new Date().toISOString(),
    }).eq('user_id', userId).eq('topic_id', topicId)
  } catch (err) {
    console.error('[MEMORY-STRENGTH] Update failed:', err)
    // Do not rethrow — mastery must not break quiz
  }
}
```

**Decay rate calculation (exponential decay model):**
```typescript
const accuracyRatio = totalAttempts > 0 ? totalCorrect / totalAttempts : 0.5
const halfLife = 5 + accuracyRatio * 25 // 5-30 day range
const decayRate = Math.LN2 / halfLife

// Day where recall crosses 70% threshold
const optimalReviewDay = decayRate > 0
  ? Math.round(-Math.log(0.7) / decayRate)
  : 30
```

**Post-interaction hook (fire-and-forget):**
```typescript
runPostInteractionHooks({
  userId,
  topicId,
  isCorrect,
  timeSpentMs,
  avgTimeMs,
  difficulty,
  isInterleaved,
  sessionMode: 'camp',
  emaWeightMultiplier: 1.2, // generation effect
}).catch(() => {
  // Swallow — hooks are non-blocking
})
```

## Dependencies

### Internal

- `@/lib/supabase/server` — createClient
- `@/lib/supabase/admin` — createAdminClient
- `@/lib/quiz/memory-strength` — updateStorageStrength, currentRetrievalStrength
- `@/lib/constants/mastery` — IRT thresholds, time windows
- `@/types/mastery` — TypeScript interfaces

### External

- `@supabase/supabase-js` — Supabase client
- Built-in Node.js: `Date`, `Math` for decay calculations
