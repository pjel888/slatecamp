<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-25 | Updated: 2026-03-25 -->

# signals

## Purpose

User learning signal computation. Derives engagement and mastery metrics from raw session data and upserts them into `user_learning_signals`. Called after session completion to maintain up-to-date signal values for dashboard display and churn detection.

## Key Files

| File | Description |
|------|-------------|
| **compute.ts** | `computeUserSignals(userId)` -- server action that computes and upserts: `score_velocity_7d` (readiness score change in pts/day over 7 days), `churn_risk_score` (0.0-1.0 composite risk), `days_since_last_session`, `sessions_last_7d`. Silent on failure (catches and logs errors). |

## For AI Agents

### Working In This Directory

1. **Server action.** Uses `'use server'` directive. Called from quiz completion flow.
2. **Silent failures.** `computeUserSignals()` wraps all logic in try/catch. Must never throw or block the quiz session.
3. **Reads multiple tables.** Queries `user_global_stats`, `readiness_score_snapshots`, `quiz_sessions` to derive signals.
4. **Upserts to `user_learning_signals`.** Uses `.upsert()` with `user_id` as conflict key.
5. **Velocity formula.** `(currentScore - baselineScore) / daysDelta` where baseline is the oldest snapshot within the last 7 days.

## Dependencies

### Internal

- `@/lib/supabase/server` -- `createClient()` for DB access

### External

- None (pure DB reads and upserts)
