# Drill / Quiz Data Migration Plan

## 1. Objective
Migrate existing browser and database states to the new unified `MODE_KEYS` without interrupting active student study sessions.

## 2. Browser Migration (Zustand)
- **Problem**: `localStorage` contains `slatecamp-quiz-session` with old mode strings (e.g., `focus-review`).
- **Solution**: Increment the `version` in `useQuizStore.ts` and use the `migrate` function.
- **Implementation**:
```typescript
migrate: (persistedState: any, version: number) => {
  if (version === 0) {
    const oldModeMap: Record<string, string> = {
      'focus-review': 'focused',
      'article-review': 'article_review',
    };
    if (persistedState.mode && oldModeMap[persistedState.mode]) {
      persistedState.mode = oldModeMap[persistedState.mode];
    }
  }
  return persistedState;
}
```

## 3. Database Migration (PostgreSQL)
- **Problem**: `quiz_sessions.status` and `config->'mode'` have old values.
- **Solution**: SQL update script with a backfill migration.
- **Implementation**:
```sql
BEGIN;
  UPDATE quiz_sessions 
  SET config = jsonb_set(config, '{mode}', '"focused"')
  WHERE config->>'mode' = 'focus-review';

  UPDATE quiz_sessions 
  SET config = jsonb_set(config, '{mode}', '"article_review"')
  WHERE config->>'mode' = 'article-review';
COMMIT;
```

## 4. Offline Queue Safety
- **Problem**: `pendingSubmissions` might have old mode keys in the payload.
- **Solution**: Add a "Compatibility Helper" in `submit-answer.ts` that maps incoming `mode` strings before Zod validation.
- **Verification**: Run `flushOfflineQueue` with old mock data to ensure it still succeeds.

## 5. Rollout Strategy
1. Deploy DB Migration (backwards-compatible: new check constraints allow both old and new for 24h).
2. Deploy App Code (Zustand migration + new Mode Keys).
3. Final Cleanup: Remove old check constraints from DB.
