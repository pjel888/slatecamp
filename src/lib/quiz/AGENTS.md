<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-02 | Updated: 2026-04-02 -->

# quiz

## Purpose

The `quiz` directory contains the core quiz engine v2: algorithms for adaptive difficulty, question selection, session configuration, confidence calibration, stamina analysis, and offline synchronization. This is the centerpiece of the assessment system, implementing the 85% Rule (Wilson et al., 2019) for optimal learning and spaced repetition mastery calculations using the IRT 2-parameter logistic model.

## Key Files

| File | Description |
|------|-------------|
| `index.ts` | Barrel exports for quiz engine (mode presets, adaptive state, question selection, calibration) |
| `mode-presets.ts` | Default configs for Camp, Storm, Chill, Blindspot, and Endurance modes (13+ KB) |
| `adaptive-difficulty.ts` | Adaptive difficulty algorithm: 85% accuracy target, difficulty scaling (1-5 levels) |
| `question-selection.ts` | Question selection query builder: topic filtering, recency exclusion, difficulty distribution by mode |
| `stamina-analysis.ts` | Fatigue detection and endurance tracking from block-by-block accuracy decay |
| `confidence-calibration.ts` | Confidence calibration state: pre-post answer confidence adjustments (meta-cognitive refinement) |
| `pressure-config.ts` | Pressure mode configuration: time constraints, warning thresholds, timer visibility |
| `error-classifier.ts` | Error categorization: careless vs. conceptual vs. knowledge gaps |
| `median-time.ts` | Median response time computation for pacing estimation and time budgeting |
| `memory-strength.ts` | Memory strength signal from spaced repetition: recency decay, review intervals |
| `should-interleave.ts` | Decision logic for interleaved question sequencing (mixing topics vs. blocked) |
| `interleaved-selection.ts` | Interleaved question selection algorithm: weighted topic sampling, difficulty balancing |
| `answer-matching.ts` | Answer validation and response matching (MCQ, numeric, short text, formula) |
| `haptics.ts` | Haptic feedback triggers for correct/incorrect/submission events (client-side) |
| `temporal-bounds.ts` | Session time bounds: remaining time, per-question budgets, warning thresholds |
| `offline/db.ts` | Offline SQLite database: local session state, question cache |
| `offline/sync.ts` | Offline-to-online sync: reconciliation of local changes with server state |
| `mode-presets.test.ts` | Unit tests for mode preset merging and score banding |
| `adaptive-difficulty.test.ts` | Tests for adaptive difficulty state transitions |
| `stamina-analysis.test.ts` | Tests for fatigue detection thresholds |
| `confidence-calibration.test.ts` | Tests for confidence state updates |

## For AI Agents

### Working In This Directory

**Quiz Engine Rules (CRITICAL):**
- All mode configs (Camp, Storm, Chill, Blindspot, Endurance) derive from `MODE_PRESETS` and are merged with user overrides in `startSession` (Server Action in `actions/`).
- Adaptive difficulty uses the 85% Rule: optimal learning occurs at 85% accuracy (Wilson et al., 2019).
- Difficulty ranges 1–5; current difficulty adjusts after ≥3 answers in a rolling window.
- If accuracy ≥90% for 3+ recent answers → increase difficulty. If ≤60% → decrease difficulty. 60–90% = hold.
- Question selection uses distribution percentages (easy/medium/hard) that vary by mode (adaptive, static, user-selected).

**Confidence Calibration (Patent Claims 9, 10):**
- Pre-answer confidence is collected BEFORE displaying options.
- Post-answer confidence is collected AFTER the student sees the correct answer.
- Calibration state tracks both to compute meta-cognitive refinement (how well students know what they know).

**Stamina Analysis:**
- Sessions are divided into 10-item blocks. Accuracy per block is tracked.
- Endurance window = items answered before accuracy drops below 70% in a block.
- Used to trigger break suggestions and predict test-day stamina.

**Offline Mode (src/lib/quiz/offline/):**
- SQLite schema mirrors Supabase tables (questions, quiz_sessions, user_interactions).
- Sync reconciles local changes: submissions marked pending → awaiting server acknowledgment.
- Never delete offline data; mark as synced.

**Interleaving vs. Blocking:**
- `should-interleave.ts` decides whether to mix topics or block by topic.
- Interleaving improves retention (spacing effect) but increases cognitive load.
- Decision based on session mode, user mastery, and performance on recent items.

**Error Classification:**
- Careless: high confidence + incorrect (overconfidence).
- Conceptual: systematic pattern of errors on related topics.
- Knowledge gap: low confidence + incorrect (true gaps).
- Use to inform AI tutor feedback and next-item selection.

### Common Patterns

**Merging Mode Presets:**
```typescript
import { MODE_PRESETS, mergeWithPreset } from '@/lib/quiz'

const userOverrides = { questionCount: 15 }
const finalConfig = mergeWithPreset('camp', userOverrides)
```

**Adaptive Difficulty State:**
```typescript
import { createAdaptiveState, updateAdaptiveState } from '@/lib/quiz'

let adaptive = createAdaptiveState(3) // Start at level 3
adaptive = updateAdaptiveState(adaptive, true) // Answer correct
// adaptive.currentDifficulty may increase if accuracy threshold met
```

**Question Selection:**
```typescript
import { buildQuestionSelectionQuery } from '@/lib/quiz'

const query = buildQuestionSelectionQuery({
  userId: 'user-123',
  config: quizSessionConfig,
  userMasteryLevel: 3,
})
// Use query to fetch questions from Supabase in a Server Action
```

**Stamina Analysis:**
```typescript
import { analyzeStamina, detectFatigue } from '@/lib/quiz'

const blocks = [ /* accuracy by block */ ]
const fatigue = detectFatigue(blocks)
if (fatigue.isFatigued) {
  // Suggest break
}
```

## Dependencies

### Internal

- **Supabase:** Database queries for user mastery, question metadata (in Server Actions, not here).
- **IRT Model:** Mastery calculations via `srs/irt.ts` (2-parameter logistic).
- **Mode Config Types:** `QuizSessionConfig`, `QuizMode` from `@/types/quiz-config`.
- **Normalization Utilities:** `@/lib/utils/question` for option normalization.

### External

- **TypeScript:** Pure type definitions; no external npm dependencies.
- **Web APIs:** `prefers-reduced-motion` for haptics guard (browser feature detection).

---

**Last Updated:** 2026-04-02

**For questions or updates, consult `.claude/agents/quiz-engineer.md` in the repository root.**
