> Legacy rule document
> Preserved from the old `.ai/rules/` entrypoint.
> Active governance docs now live in `../`.

# Pedagogical Engine Rules

**Source:** `src/lib/srs/`, `src/lib/readiness-score.ts`, `src/lib/actions/testing.ts`, `.ai/docs/01-product/`
**Last Verified:** 2026-04-10
**Applies To:** All agents working on quiz, testing, mastery, or analytics features

---

## IRT 2-Parameter Logistic Model

All mastery and readiness calculations use the **IRT 2PL model**. Never implement alternative scoring without consulting the core SRS team.

### Formula

```
P(θ) = 1 / (1 + exp(-a * (θ - b)))
```

Where:
- `P(θ)` = probability of correct response given ability θ
- `a` = discrimination parameter (item quality)
- `b` = difficulty parameter (item difficulty)
- `θ` = student ability estimate

### Implementation

**Source:** `src/lib/srs/irt.ts`

```typescript
// ✅ CORRECT — use existing IRT implementation
import { calculateProbability } from '@/lib/srs/irt'

const p = calculateProbability({
  ability: studentAbility,
  difficulty: itemDifficulty,
  discrimination: itemDiscrimination,
})

// ❌ WRONG — implement IRT from scratch
const p = 1 / (1 + Math.exp(-a * (theta - b)))
```

---

## SM-2 Spaced Repetition System

The SM-2 algorithm manages review scheduling. All quiz interactions must update the SM-2 state.

### Key Parameters

| Parameter | Description | Bounds |
|-----------|-------------|--------|
| Ease Factor (EF) | Multiplier for interval | Floor: 1.3 |
| Interval | Days until next review | Grows with successful reviews |
| Quality | Response quality 0-5 | Maps to EF adjustment |

### Implementation

**Source:** `src/lib/srs/sm2.ts`, `src/lib/srs/update.ts`

```typescript
// ✅ CORRECT — use existing SM-2 implementation
import { updateSchedule } from '@/lib/srs/update'

const newSchedule = updateSchedule({
  quality: 4, // 0-5 response quality
  currentEaseFactor: currentEF,
  currentInterval: currentInterval,
})

// ❌ WRONG — calculate SM-2 manually
```

---

## Readiness Score

The **readiness score** is a composite metric (6-vector computation) that determines exam readiness. It lives in `src/lib/readiness-score.ts` and is ~330 lines. Do not modify without understanding all 6 vectors.

### Components

1. **Mastery level** — weighted by topic importance
2. **Time since last review** — decay factor
3. **Consistency score** — variance in performance
4. **Coverage** — % of taxonomy covered
5. **Strength of weak areas** — weighted blindspot score
6. **Trend** — trajectory over last 30 days

### Usage

```typescript
import { calculateReadiness } from '@/lib/readiness-score'

const readiness = await calculateReadiness(userId)
if (readiness < 0.7) {
  // Recommend more study
}
```

---

## Drills Modes (9 Modes, 3 Zones)

SlateCamp has **9 drill modes** organized into 3 progressive zones. Route: `/dashboard/drills` (migrated from `/dashboard/testing`).

### Zone 1: Foundations (Low-stakes Learning)

| Mode | UI Key | Purpose | SRS Update |
|------|--------|---------|-----------|
| Camp | `camp` | Adaptive practice with personalized question selection | Standard SM-2 |
| Chill | `chill` | Relaxed, untimed review | Standard SM-2 |
| Article Review | `article-review` | In-article quiz with lighter mastery (alpha 0.15) | Light SRS |

### Zone 2: Deliberate Practice (Targeted Mastery)

| Mode | UI Key | Purpose | SRS Update |
|------|--------|---------|-----------|
| Subject | `subject` | Focus on specific taxonomy subject | Standard SM-2 |
| Focus Review | `focus-review` | Target 3 weakest nodes + unexplored grey nodes | Priority queue |
| Custom | `custom` | User-defined: question count, timer, difficulty | Full control |

### Zone 3: Exam Readiness (Pressure + Stamina)

| Mode | UI Key | Purpose | SRS Update |
|------|--------|---------|-----------|
| Storm | `storm` | Rapid-fire timed with timer bar | Deferred feedback |
| Simulation | `simulation` | Full exam simulation (200Q, 4h, cold results) | Separate tracking |
| Endurance | `endurance` | Extended practice (100Q, breaks) | Light SRS |

**Source:** `.ai/docs/01-product/002-drill-feature-specification.md`, `src/lib/constants/testing-modes.ts`

**Intelligent Routing:** 60% unseen, 30% remediation (incorrect), 10% spaced repetition (mastered, 14+ days)

---

## Quiz Session Flow

### Session Creation

1. User selects mode → `createQuizSession()` in `src/lib/actions/testing.ts`
2. System creates `quiz_sessions` record with mode, started_at
3. Session ID returned to client

### Interaction Saving

1. User answers → interaction saved via `saveInteraction()` in `src/lib/actions/testing.ts`
2. Response quality (0-5) derived from correctness + time
3. SRS schedule updated after session completion
4. IRT ability estimate updated

### Session Completion

1. User finishes or time expires
2. Session marked `completed` in `quiz_sessions`
3. `updateSRSAfterSession()` called from `src/lib/srs/update.ts`
4. Readiness score recalculated

---

## Blindspot Queue

**Source:** `src/lib/srs/blindspot.ts`

The blindspot queue identifies:
1. **3 weakest mastered nodes** — low mastery but previously passed
2. **Unexplored grey nodes** — not yet studied

```
Weak → Grey → Medium → Strong
```

Cron job `blindspot-scan` runs daily at 4pm UTC to refresh queue.

---

## Analytics Data Sources

All analytics charts pull from verified data sources:

| Chart | Source | Query Module |
|-------|--------|-------------|
| Readiness over time | `readiness_scores` table | `src/lib/queries/readiness.ts` |
| Mastery by topic | `node_mastery` view | `src/lib/queries/mastery.ts` |
| Session history | `quiz_sessions` table | `src/lib/queries/sessions.ts` |
| Time distribution | `quiz_interactions` table | `src/lib/queries/interactions.ts` |

---

## Prohibited

- ❌ Implement IRT from scratch (use `src/lib/srs/irt.ts`)
- ❌ Calculate SM-2 manually (use `src/lib/srs/sm2.ts`)
- ❌ Hardcode mastery percentages (use IRT-weighted scores)
- ❌ Skip SRS updates after quiz sessions
- ❌ Implement gamification (badges, streaks, confetti)
- ❌ Use generic progress bars — use mastery indicators tied to IRT scores
- ❌ Add quiz modes without updating `src/lib/actions/quiz-v2/`
- ❌ Modify readiness-score.ts without full 6-vector review

---

## Key File Locations

| File | Purpose |
|------|---------|
| `src/lib/srs/irt.ts` | IRT 2PL probability calculation |
| `src/lib/srs/sm2.ts` | SM-2 interval/ease calculation |
| `src/lib/srs/update.ts` | Quality derivation + schedule updates |
| `src/lib/srs/blindspot.ts` | Blindspot queue logic |
| `src/lib/readiness-score.ts` | 6-vector readiness computation |
| `src/lib/actions/testing.ts` | Session creation, interaction saving |
| `src/lib/actions/quiz-v2/` | 7 quiz mode implementations |

---

*Every pedagogical claim must be traceable to a source file in `src/lib/srs/` or `src/lib/readiness-score.ts`.*
