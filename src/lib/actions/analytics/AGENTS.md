<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-02 | Updated: 2026-04-02 -->

# analytics

## Purpose

Server actions for analytics dashboard data retrieval. Computes and fetches learning metrics including forgetting curves, stamina heatmaps, difficulty-mastery relationships, study velocity, pacing-accuracy correlations, and exam countdown signals.

## Key Files

| File | Description |
|------|-------------|
| **chart-data.ts** | Main analytics aggregation: forgetting curves, stamina heatmap, difficulty-mastery scatter, study velocity, pacing-accuracy, exam countdown data |
| **get-calibration-data.ts** | Confidence calibration metrics: calibration score, Brier score, confidence accuracy breakdown (confident/guessing/partly), overconfidence/underconfidence indices |
| **get-error-patterns.ts** | Error classification trends and aggregation by category, topic, and session mode |
| **get-review-calendar.ts** | Spaced repetition review schedule visualization: due cards by date, review distribution |
| **get-memory-strength-data.ts** | Storage strength and retrieval strength trends per topic over time |

## For AI Agents

### Working In This Directory

1. **Use `'use server'`** at the top of all action files.
2. **Auth required** — all actions check `getUser()` and return empty/null data if unauthenticated.
3. **Parallel queries** — fetch independent signals concurrently with `Promise.all()` to minimize round trips.
4. **Type exports** — each action exports its own interface (e.g., `ForgettingCurveData`, `CalibrationData`).
5. **Aggregation pattern** — `getAnalyticsDashboardData()` in chart-data.ts fetches all metrics in parallel and returns a combined object.
6. **No mutations** — analytics actions are read-only. No revalidatePath calls.
7. **Graceful empty states** — return empty arrays/objects with sensible defaults if no data exists for the user.

### Common Patterns

**Fetching user-specific metrics with auth:**
```typescript
'use server'

import { createClient, getUser } from '@/lib/supabase/server'

export const getMetricData = async (): Promise<MetricType | null> => {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) return null

  const { data } = await supabase
    .from('table_name')
    .select('...')
    .eq('user_id', user.id)

  return transformData(data)
}
```

**Parallel aggregation of multiple signals:**
```typescript
const [signal1, signal2, signal3] = await Promise.all([
  fetchSignal1(supabase, user.id),
  fetchSignal2(supabase, user.id),
  fetchSignal3(supabase, user.id),
])

return {
  signal1,
  signal2,
  signal3,
}
```

**Computing derived metrics (e.g., decay rate from mastery):**
```typescript
const withDecay = masteryData.map(m => ({
  ...m,
  decayRate: Math.LN2 / halfLife,
  optimalReviewDay: -Math.log(threshold / 100) / decayRate,
}))
```

## Dependencies

### Internal

- `@/lib/supabase/server` — createClient, getUser
- `@/lib/constants/analytics` — PACING_TARGET_MS, PASSING_ACCURACY, color helpers
- `@/lib/quiz/answer-matching` — matchGenerationAnswer
- `@/lib/utils/question` — resolveRationaleText, normalizeOptions
- `@/types/quiz-config` — TypeScript types for quiz sessions, questions, test modes

### External

- `@supabase/supabase-js` — Supabase client
- Built-in Node.js: `Date`, `Math` for calculations
