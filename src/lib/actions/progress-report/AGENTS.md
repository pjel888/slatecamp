<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-02 | Updated: 2026-04-02 -->

# progress-report

## Purpose

Server actions for generating weekly/monthly progress reports. Aggregates questions answered, sessions completed, study time, readiness score changes, node mastery improvements, and highlights weakest/strongest areas within a period.

## Key Files

| File | Description |
|------|-------------|
| **generate.ts** | Report generator: fetches interactions and sessions in period, calculates total study time, readiness score delta, node mastery improvements, weakest and strongest topics |
| **actions.ts** | Additional actions: schedule reports, fetch report history, email reports |

## For AI Agents

### Working In This Directory

1. **Use `'use server'`** on all action files.
2. **Period-scoped queries** — all data fetches use `gte(timestamp, periodStart)` and `lte(timestamp, periodEnd)`.
3. **Readiness score snapshots** — compare snapshots at period start and end (not per-interaction scores).
4. **Study time aggregation** — sum `time_spent_ms` from interactions, filter outliers (< 300s, > 300k ms), convert to minutes.
5. **Mastery delta calculation** — compute per-topic accuracy delta (period vs pre-period) to identify improvement.
6. **Sorting and ranking** — weakest nodes by lowest current mastery; strongest improvement by highest positive delta.
7. **Graceful nulls** — handle missing snapshots, zero-interaction periods, or no mastery data.

### Common Patterns

**Period-scoped count queries:**
```typescript
'use server'

import { createClient } from '@/lib/supabase/server'

export const generateProgressReport = async (
  userId: string,
  periodStart: string,
  periodEnd: string,
): Promise<ProgressReport> => {
  const supabase = await createClient()

  // Questions answered in period
  const { count: questionsAnswered } = await supabase
    .from('user_interactions')
    .select('interaction_id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('interaction_timestamp', periodStart)
    .lte('interaction_timestamp', periodEnd)

  // Sessions completed in period
  const { count: sessionsCompleted } = await supabase
    .from('quiz_sessions')
    .select('session_id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'completed')
    .gte('completed_at', periodStart)
    .lte('completed_at', periodEnd)
}
```

**Study time aggregation (sum, filter outliers):**
```typescript
const { data: timeData } = await supabase
  .from('user_interactions')
  .select('time_spent_ms')
  .eq('user_id', userId)
  .gte('interaction_timestamp', periodStart)
  .lte('interaction_timestamp', periodEnd)
  .gt('time_spent_ms', 0)
  .lt('time_spent_ms', 300_000) // Filter extreme outliers

const totalMs = (timeData || []).reduce(
  (acc, row) => acc + (row.time_spent_ms ?? 0),
  0,
)
const studyMinutes = Math.round(totalMs / 60_000)
```

**Readiness score snapshot comparison:**
```typescript
const [startSnapshot, endSnapshot] = await Promise.all([
  supabase
    .from('readiness_score_snapshots')
    .select('score')
    .eq('user_id', userId)
    .lte('computed_at', periodStart)
    .order('computed_at', { ascending: false })
    .limit(1)
    .maybeSingle(),
  supabase
    .from('readiness_score_snapshots')
    .select('score')
    .eq('user_id', userId)
    .lte('computed_at', periodEnd)
    .order('computed_at', { ascending: false })
    .limit(1)
    .maybeSingle(),
])

const scoreStart = startSnapshot.data?.score ?? 0
const scoreEnd = endSnapshot.data?.score ?? 0
const readinessScoreChange = Math.round(scoreEnd - scoreStart)
```

**Mastery delta calculation (pre-period vs in-period accuracy):**
```typescript
// In-period accuracy per topic
const accIn = new Map<string, { correct: number; total: number }>()
for (const row of periodAccuracy) {
  const entry = accIn.get(row.topic_id) ?? { correct: 0, total: 0 }
  entry.total++
  if (row.is_correct) entry.correct++
  accIn.set(row.topic_id, entry)
}

// Pre-period accuracy per topic (for comparison)
const accBefore = new Map<string, { correct: number; total: number }>()
for (const row of priorAccuracy) {
  const entry = accBefore.get(row.topic_id) ?? { correct: 0, total: 0 }
  entry.total++
  if (row.is_correct) entry.correct++
  accBefore.set(row.topic_id, entry)
}

// Calculate delta
const deltas = []
for (const topicId of topicIds) {
  const inPeriod = accIn.get(topicId)
  const before = accBefore.get(topicId)
  if (!inPeriod) continue

  const accNow = inPeriod.correct / inPeriod.total
  const accPrev = before ? before.correct / before.total : 0
  const delta = Math.round((accNow - accPrev) * 100)
  deltas.push({ topicId, delta })
}
```

## Dependencies

### Internal

- `@/lib/supabase/server` — createClient, getUser
- `@/types/progress-report` — ProgressReport interface

### External

- `@supabase/supabase-js` — Supabase client
- Built-in Node.js: `Date`, `Math` for time calculations and aggregation
