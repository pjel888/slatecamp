# Drill / Quiz Pre-Launch Unification Audit

**Date:** 2026-04-18
**Status:** Strategic Recommendation (Pre-Launch)

## 1. Executive Summary
SlateCamp is currently in a pre-launch phase. The previous "Unification" pass aligned the application-layer keys, but a significant "mental mapping" debt remains between the Frontend and the Database. We recommend a final, absolute unification of all identifiers to a single canonical set of underscored keys.

## 2. The Debt: Mapping Layer
Currently, `start-session.ts` maintains a mapping object:

```typescript
const DB_TEST_MODE_BY_APP_MODE: Record<StartSessionInput['mode'], string> = {
  camp: 'camp',
  chill: 'chill',
  subject: 'practice',
  focus_review: 'blindspot',
  custom: 'custom',
  storm: 'storm',
  full_exam: 'proof_sim',
  endurance: 'endurance',
  article_review: 'practice',
};
```

This mapping creates friction in:
- **Query Writing**: Developers must remember to use `proof_sim` in SQL but `full_exam` in TS.
- **Analytics**: Data exports will use legacy names like `blindspot`.
- **Debugging**: Tracing a session from UI to DB requires a lookup table.

## 3. The Recommendation: Canonical Keys
Move all layers (Frontend, Actions, Database Enum, Table Names, Column Names) to use these keys:

- `camp`
- `chill`
- `subject`
- `focus_review`
- `custom`
- `storm`
- `full_exam`
- `endurance`
- `article_review`

## 4. Blast Radius of Full Unification

### A. Database Enums
- **Affected Type**: `TEST_MODE`.
- **Action**: Replace `blindspot` with `focus_review`, `proof_sim` with `full_exam`, `practice` with `subject`.
- **Impact**: Existing `quiz_sessions` rows will have invalid enum values until backfilled.

### B. Table Names
- **Affected Table**: `blindspot_queues`.
- **Recommended Rename**: `focus_review_queues`.
- **Impact**: All references in `src/lib/blindspot/` and migrations must be updated.

### C. Column Names
- **Affected Column**: `user_global_stats.proof_simulation_unlocked_at`.
- **Recommended Rename**: `full_exam_unlocked_at`.
- **Affected Column**: `quiz_sessions.is_proof_simulation`.
- **Recommended Rename**: `is_full_exam`.

### D. Code logic
- **Affected Files**: `src/lib/actions/quiz-v2/start-session.ts` (Remove mapping).
- **Affected Files**: `src/lib/blindspot/*` (Update table references).
- **Affected Files**: `src/lib/queries/*` (Update SQL queries).

## 5. Decision: Why do this now?
Since we are pre-launch, the cost of "breaking" existing study data is near zero. The cost of maintaining this desync *post-launch* is permanent and compounding. Absolute unification ensures the codebase is clean, searchable, and professional for the long term.

## 6. Implementation Strategy
1. **Reset & Seed**: The safest path is a fresh `bun run db:reset` once the migration script is ready.
2. **Global Replace**: Systematic replacement of legacy strings in the codebase.
3. **Redirects**: Maintain the Next.js redirects already implemented for URL stability.
