<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-02 | Updated: 2026-04-02 -->

# daily-dose

## Purpose

Server actions for daily practice dose generation. Analyzes user signals (weak topics, overdue SRS, decaying nodes, exam countdown) and recommends a prioritized list of activities (quiz, SRS review, or timed practice) tailored to time budget.

## Key Files

| File | Description |
|------|-------------|
| **generate.ts** | Main dose generator: fetches weak nodes, overdue SRS, decaying mastery, exam date, recent topics, and avg session time, then builds prioritized activities list |
| **actions.ts** | Additional actions: adjust dose to time budget, persist dose preferences, fetch dose history |

## For AI Agents

### Working In This Directory

1. **Use `'use server'`** on all action files.
2. **Auth check** — generateDailyDose takes userId directly (not relying on getUser) to allow dashboard caching; validate user context at caller.
3. **Parallel signals** — use `Promise.all()` to fetch all signals (weak nodes, SRS, decay, exam date, recent topics, session history) concurrently.
4. **Priority ranking** — build activities in priority order: overdue SRS → decaying → weak nodes → exam countdown → fallback.
5. **Time clamping** — respect budget with `clampMinutes()` and stop adding activities once budget is exhausted.
6. **Rationale segments** — build human-readable explanation of why each activity was recommended.
7. **No mutations** — dose generation is read-only. Actions persist preferences separately if needed.

### Common Patterns

**Parallel signal fetching:**
```typescript
'use server'

import { createClient } from '@/lib/supabase/server'

const [weakNodesResult, overdueSrsResult, decayingNodesResult, examDateResult] = await Promise.all([
  supabase
    .from('user_node_mastery')
    .select('topic_id, current_mastery_weight, taxonomy_tree(name, subject_area)')
    .eq('user_id', userId)
    .gt('total_attempts', 0)
    .order('current_mastery_weight', { ascending: true })
    .limit(5),
  supabase
    .from('user_srs_cards')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .lt('next_review_at', new Date().toISOString()),
  // ... more queries
])
```

**Priority-based activity building:**
```typescript
const activities: DoseActivity[] = []
let totalMinutes = 0
const rationaleSegments: string[] = []

// Priority 1: Overdue SRS
if (overdueSrsCount > 0 && totalMinutes < budget) {
  const srsMinutes = clampMinutes(Math.ceil(cardCount * 0.5), budget - totalMinutes)
  activities.push({
    type: 'srs_review',
    config: { cardCount, source: 'overdue_srs' },
    minutes: srsMinutes,
    reason: `${cardCount} review ${cardCount === 1 ? 'card is' : 'cards are'} overdue`,
  })
  totalMinutes += srsMinutes
  rationaleSegments.push(`${cardCount} overdue review cards`)
}

// Priority 2: Decaying nodes (not recently studied)
// Priority 3: Weak nodes (not covered, not recent)
// Priority 4: Exam countdown (if <= 30 days)
// Fallback: General Camp session
```

**Avoiding double-counting topics:**
```typescript
const coveredTopicIds = new Set(
  activities
    .filter(a => a.type === 'quiz')
    .flatMap(a => (a.config.topicIds as string[]) ?? []),
)

const weakNotCovered = weakNodes.filter(
  n => !coveredTopicIds.has(n.topic_id) && !recentTopicIds.has(n.topic_id),
)
```

## Dependencies

### Internal

- `@/lib/supabase/server` — createClient
- `@/lib/constants/time` — time budget defaults, window sizes (3 days, 2 weeks)
- `@/types/daily-dose` — DoseActivity, DailyDose interfaces

### External

- `@supabase/supabase-js` — Supabase client
- Built-in Node.js: `Date`, `Math` for date calculations and time budget logic
