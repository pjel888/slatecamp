<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-24 -->

# srs

## Purpose

Spaced Repetition System (SRS) and Item Response Theory (IRT) algorithms. Implements adaptive question selection, mastery scoring, and review scheduling for exam preparation. Combines SM-2 (SuperMemo 2) intervals with IRT 2-parameter logistic model for theta-driven difficulty matching.

## Key Files

| File | Description |
|------|-------------|
| **sm2.ts** | SM-2 algorithm: interval calculation, ease factor, next review scheduling |
| **sm2.test.ts** | Unit tests for SM-2 calculation |
| **update.ts** | Server action: derives quality rating from user interaction, updates SRS schedule in DB |
| **update.test.ts** | Unit tests for update logic |
| **irt.ts** | 2-parameter logistic IRT model: theta estimation, question selection, discrimination/difficulty |
| **irt.test.ts** | Unit tests for IRT calculations |
| **retention.ts** | Ebbinghaus-style retention curve: estimates knowledge decay over time |

## For AI Agents

### Working In This Directory

1. **SM-2 is the interval engine** — calculates next review date based on quality (0–5) and repetition count.
2. **Quality rating** (0–5) is derived from: correctness, time spent, confidence, lucky guess detection.
3. **IRT theta** is the user's ability estimate; difficulty/discrimination come from question metadata.
4. **Next question selection** uses IRT to target questions at ~0.75 probability of correct (adaptive difficulty).
5. **Retention decay** uses exponential model: R(t) = e^(-t / S), where S = stability (interval).
6. **Silent failures** — SRS updates must catch errors and log without throwing.

### Common Patterns

**SM-2 interval calculation:**
```typescript
import { calculateNextReview, getNextReviewDate } from '@/lib/srs/sm2'

const quality = 4 // 0–5, derived from user answer
const currentInterval = mastery?.review_interval_days ?? 1
const currentEF = mastery?.ease_factor ?? 2.5
const reps = mastery?.repetitions ?? 0

const { interval, easeFactor, repetitions } = calculateNextReview(
  quality,
  reps,
  currentEF,
  currentInterval
)

const nextReviewDate = getNextReviewDate(interval) // Date object
```

**Quality rating derivation:**
```typescript
import { deriveQualityRating } from '@/lib/srs/update'

const quality = await deriveQualityRating({
  isCorrect: true,
  timeSpentMs: 12000,
  avgTimeMs: 15000,
  confidence: 'sure',
  isSuspectedLuckyGuess: false,
})
// Returns 0–5 based on correctness, speed, confidence
```

**IRT question selection (adaptive difficulty):**
```typescript
import { selectNextQuestion, probabilityCorrect } from '@/lib/srs/irt'

const userTheta = 0.5 // Estimated ability
const availableQuestions = [...] // Question[]
const answeredIds = new Set([...]) // Already answered

const nextQ = selectNextQuestion(userTheta, availableQuestions, answeredIds)
// Returns question closest to difficulty = theta - ln(3)/discrimination
// Targets ~75% success probability
```

**Retention estimation:**
```typescript
import { retentionAfterDays, formatRetentionPercent } from '@/lib/srs/retention'

const daysSince = 10
const stability = 21 // SM-2 interval
const retention = retentionAfterDays(daysSince, stability)
// retention ≈ 0.62 (62% remembered)

console.log(formatRetentionPercent(retention)) // "62%"
```

**Theta update (adaptive estimation):**
```typescript
import { updateTheta } from '@/lib/srs/irt'

const currentTheta = 0.3
const question = { difficulty_rating: 0.5, discrimination_rating: 1.2 }
const isCorrect = true

const newTheta = updateTheta(currentTheta, question, isCorrect)
// newTheta increases slightly (user proved ability on this difficulty)
```

## Dependencies

### Internal

- `@/lib/supabase/server` — createClient for DB updates
- `@/types/app` — Question interface

### External

- Built-in Math (no external libraries)
