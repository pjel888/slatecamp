<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-02 | Updated: 2026-04-02 -->

# endurance

## Purpose

The `endurance` directory implements extended practice session (Endurance / Stamina mode) utilities: accuracy-by-block computation, endurance window detection, and endurance signal updates. Tracks how long a student can maintain 70%+ accuracy under pressure, informing stamina-building practice recommendations.

## Key Files

| File | Description |
|------|-------------|
| `compute.ts` | Main exports: `computeAccuracyByBlock()` (10-item blocks), `computeEnduranceWindow()` (items before drop below 70%), `updateEnduranceSignals()` (Supabase upsert) |

## For AI Agents

### Working In This Directory

**Accuracy-by-Block Computation:**
- Divides session interactions into 10-item blocks.
- Per-block metrics: correct count, total count, accuracy percentage.
- Input: array of {question_order, is_correct}.
- Output: array of {block number, correct, total, accuracy (0.0–1.0)}.
- Block 1 = items 1–10, Block 2 = items 11–20, etc.

**Endurance Window:**
- The "reliable performance window" = items answered before accuracy drops <70%.
- First block with accuracy <0.70 signals endurance limit.
- Example: Block 1 (85%), Block 2 (80%), Block 3 (65%) → endurance window = 20 items.
- Used to gauge current stamina and suggest target improvements.

**Endurance Signals (Supabase `user_computed_signals`):**
- `endurance_baseline_items`: Baseline set during first calibration week (typically day 7 of onboarding).
- `endurance_window_items`: Current observed window from most recent endurance session.
- `endurance_target_items`: Target for the exam (e.g., 150 items for a 3-hour exam).
- `endurance_last_updated`: Timestamp of last update.
- Calibration week override: if `isCalibrationWeek=true`, reset baseline to current window.

**Silent Failure:**
- Endurance signals are non-critical; failures are logged silently (no user-facing errors).
- Session can complete even if signal update fails.

### Common Patterns

**Computing Accuracy by Block:**
```typescript
import { computeAccuracyByBlock } from '@/lib/endurance'

const interactions = [
  { question_order: 1, is_correct: true },
  { question_order: 2, is_correct: false },
  { question_order: 3, is_correct: true },
  // ... more interactions
]

const blocks = computeAccuracyByBlock(interactions)
// [
//   { block: 1, correct: 7, total: 10, accuracy: 0.70 },
//   { block: 2, correct: 6, total: 10, accuracy: 0.60 },
//   ...
// ]
```

**Computing Endurance Window:**
```typescript
import { computeEnduranceWindow } from '@/lib/endurance'

const blocks = [
  { block: 1, accuracy: 0.85, total: 10 },
  { block: 2, accuracy: 0.80, total: 10 },
  { block: 3, accuracy: 0.65, total: 10 }, // Dropped below 70%
]

const window = computeEnduranceWindow(blocks)
// 20 (items from blocks 1 and 2 only)
```

**Updating Endurance Signals (Server Action):**
```typescript
'use server'

import { updateEnduranceSignals } from '@/lib/endurance'

export const completeEnduranceSession = async (
  userId: string,
  sessionBlocks: { block: number; accuracy: number; total: number }[],
) => {
  const isCalibrationWeek = /* determine from user timeline */
  await updateEnduranceSignals(userId, sessionBlocks, isCalibrationWeek)
  // Silently updates Supabase; no error thrown if fails
}
```

## Dependencies

### Internal

- **Supabase:** Database upsert for `user_computed_signals` table (in `updateEnduranceSignals`).
- **Server:** Only `updateEnduranceSignals` is async and requires server context; others are pure functions.

### External

- **No external npm dependencies** (pure TypeScript).

---

**Last Updated:** 2026-04-02

**For stamina-building pedagogy, consult `.claude/docs/extended-practice-prd.md` in the repository root.**
