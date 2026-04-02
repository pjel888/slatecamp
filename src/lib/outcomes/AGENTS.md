<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-02 | Updated: 2026-04-02 -->

# outcomes

## Purpose

The `outcomes` directory implements exam outcome prediction and pre-population: gathers peak readiness scores, usage statistics, and accuracy data for active users before a Professional Regulation Commission (PRC) exam batch, enabling students to confirm pass/fail with pre-populated analytics context.

## Key Files

| File | Description |
|------|-------------|
| `prepopulate.ts` | Server Action: `prepopulateExamOutcomes()` queries user activity, readiness history, and session stats → upserts `exam_outcomes` rows |

## For AI Agents

### Working In This Directory

**Prepopulation Logic (Server Action):**
1. Find all users active in 90 days before exam date.
2. For each user, gather:
   - Peak readiness score (max from snapshots).
   - Readiness score 7 days before exam.
   - Total sessions completed.
   - Total questions answered.
   - Average session accuracy.
   - Days active (distinct dates with completed sessions).
   - Signup source and customer archetype (from `user_global_stats`).
3. Insert/upsert `exam_outcomes` row: `{ user_id, discipline_id, exam_batch, result: 'did_not_take', ...metrics }`.
4. Return: {created: number, errors: string[]}.

**Result Status:**
- Pre-population: `result='did_not_take'` (placeholder).
- After PRC publishes: manual admin update to `passed` or `failed`.
- Pre-populated rows allow students to see "Your readiness was X% before the exam" without waiting for results.

**Error Handling:**
- Per-user errors collected; batch operation continues.
- Non-critical: failures don't block other users.
- Return error summaries for admin review.

**Timing:**
- Run 1 day before PRC results release (typically ~2 weeks after exam).
- Triggered manually or via cron job.

### Common Patterns

**Prepopulating Outcomes (Server Action):**
```typescript
'use server'

import { prepopulateExamOutcomes } from '@/lib/outcomes'

export const runExamOutcomePrepopulation = async () => {
  const examBatch = 'LE-2026-01' // Licensure Exam January 2026
  const disciplineId = 'architecture' // or 'civil-engineering', etc.
  const examDate = new Date('2026-04-15') // When exam occurred
  
  const result = await prepopulateExamOutcomes(examBatch, disciplineId, examDate)
  
  console.log(`Created ${result.created} exam outcome records`)
  if (result.errors.length > 0) {
    console.error('Errors:', result.errors)
  }
}
```

**Before and After Prepopulation:**
- Before: `exam_outcomes` table is empty.
- After: {user_id, discipline_id, exam_batch, result: 'did_not_take', peak_readiness_score, ...}.
- Admin updates: Change `result` to `'passed'` or `'failed'` when PRC publishes official results.

## Dependencies

### Internal

- **Supabase:** Queries `quiz_sessions`, `user_interactions`, `readiness_score_snapshots`, `user_global_stats`; upserts `exam_outcomes`.
- **Server context:** Must run in Server Action (requires `createClient()` for server-side Supabase).

### External

- **No external npm dependencies** (pure SQL queries and data aggregation).

---

**Last Updated:** 2026-04-02

**For exam outcome analytics, consult `.claude/docs/outcomes-prd.md` in the repository root.**
