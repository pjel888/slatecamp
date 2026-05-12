# IMPLEMENTATION BLUEPRINT: DATABASE LAYER
**Generated:** Nightwatch Loop

## 1. Target File Matrix

### Server Actions / TypeScript Files (Modify)
| File Path | Action | Notes |
|-----------|--------|-------|
| `src/lib/quiz/intelligent-routing.ts` | REWRITE | Replace massive array exclusion with subquery |
| `src/lib/quiz/to-client-question.ts` | REWRITE | Replace N+1 breadcrumb with recursive CTE |
| `src/lib/actions/quiz-v2/start-session.ts` | REWRITE | Update to use new breadcrumb function |
| `src/lib/srs/update.ts` | REWRITE | Add atomic increment pattern |
| `src/lib/actions/quiz-v2/submit-answer.ts` | REWRITE | Add uniqueness conflict handling |

### Database / SQL Files (Modify)
| File Path | Action | Notes |
|-----------|--------|-------|
| `supabase/migrations/010_schema_hardening.sql` | EXPAND | Add missing RLS policies |
| `supabase/migrations/NEW_rls_completion.sql` | CREATE | Complete RLS for all remaining tables |
| `supabase/migrations/NEW_unique_constraints.sql` | CREATE | Add unique constraints for idempotency |
| `supabase/migrations/NEW_query_optimization.sql` | CREATE | Add partial indexes + computed view |

---

## 2. Dependency Prerequisites

1. **Database Migration Order:**
   - First: Run `NEW_unique_constraints.sql` (adds unique indexes)
   - Second: Run `NEW_query_optimization.sql` (adds partial indexes)
   - Third: Run `NEW_rls_completion.sql` (completes RLS policies)

2. **No external NPM packages required** - all optimization uses PostgreSQL native features.

3. **Testing prerequisite:** Ensure `bun test` passes before migration to validate existing functionality.

---

## 3. The Execution Steps (Micro-Granular)

### Step 1: Replace Massive Array Exclusion (intelligent-routing.ts)
- **File:** `src/lib/quiz/intelligent-routing.ts`
- **Action:** REPLACE lines 68-70 with subquery pattern
- **Logic Required:**
  ```typescript
  // BEFORE (lines 68-70):
  if (interactedIds.length > 0) {
    unseenQuery = unseenQuery.not('question_id', 'in', `(${interactedIds.join(',')})`)
  }

  // AFTER (new logic):
  // Use subquery to avoid passing large array to NOT IN
  // The subquery filters questions never interacted with by this user
  if (userId) {
    unseenQuery = unseenQuery.not('question_id', 'in',
      `(SELECT question_id FROM user_interactions WHERE user_id = '${userId}')`)
  }
  ```
- **Apply same pattern to:** Lines 138-140 (fallback query)

### Step 2: Replace N+1 Breadcrumb Query (to-client-question.ts)
- **File:** `src/lib/quiz/to-client-question.ts`
- **Action:** REWRITE `buildTaxonomyBreadcrumbMap` function
- **Logic Required:**
  - Create PostgreSQL function `get_taxonomy_breadcrumbs(topic_ids TEXT[])`
  - Function uses recursive CTE to fetch all ancestor paths in single query
  - Returns `Map<string, string>` mapping topic_id → breadcrumb string
  - Single database call instead of N sequential queries

### Step 3: Update start-session.ts to Use New Breadcrumb
- **File:** `src/lib/actions/quiz-v2/start-session.ts`
- **Action:** UPDATE line 250
- **Logic Required:**
  - Change from: `const taxonomyMap = await buildTaxonomyBreadcrumbMap(supabase, uniqueTopicIds)`
  - To: Use new function that accepts array and returns pre-computed breadcrumb map
  - Ensure single DB call replaces the N+1 loop

### Step 4: Add Unique Constraint for Idempotency
- **File:** `supabase/migrations/NEW_unique_constraints.sql`
- **Action:** CREATE new migration file
- **SQL Required:**
  ```sql
  -- Add unique constraint to question_interactions for idempotency
  CREATE UNIQUE INDEX IF NOT EXISTS idx_question_interactions_unique
  ON question_interactions (user_id, session_id, question_id);

  -- Add unique constraint to user_question_states
  CREATE UNIQUE INDEX IF NOT EXISTS idx_user_question_states_unique
  ON user_question_states (user_id, question_id);
  ```

### Step 5: Add Partial Indexes for Query Optimization
- **File:** `supabase/migrations/NEW_query_optimization.sql`
- **Action:** CREATE new migration file
- **SQL Required:**
  ```sql
  -- Partial index for non-deleted questions
  CREATE INDEX IF NOT EXISTS idx_questions_active ON questions (question_id)
  WHERE deleted_at IS NULL;

  -- Partial index for published articles
  CREATE INDEX IF NOT EXISTS idx_articles_published ON wiki_articles (article_id)
  WHERE status = 'published';

  -- Partial index for in-progress sessions
  CREATE INDEX IF NOT EXISTS idx_sessions_active ON quiz_sessions (session_id)
  WHERE status = 'in_progress';
  ```

### Step 6: Add Atomic Increment Pattern (srs/update.ts)
- **File:** `src/lib/srs/update.ts`
- **Action:** REPLACE fetch-calculate-save pattern with atomic increment
- **Logic Required:**
  ```typescript
  // BEFORE (race condition prone):
  const current = await getStats(userId)
  const newScore = current.score + delta
  await updateStats(userId, { score: newScore })

  // AFTER (atomic):
  await supabase.rpc('increment_user_score', {
    user_id: userId,
    delta: delta
  })
  ```
- **Required:** Create PostgreSQL function `increment_user_score`

### Step 7: Handle Unique Constraint Conflicts (submit-answer.ts)
- **File:** `src/lib/actions/quiz-v2/submit-answer.ts`
- **Action:** ADD conflict handling for duplicate interactions
- **Logic Required:**
  ```typescript
  // Add ON CONFLICT DO NOTHING handling
  const { error } = await supabase
    .from('question_interactions')
    .upsert({
      user_id: userId,
      session_id: sessionId,
      question_id: questionId,
      selected_answer: input.selectedAnswer,
      correct: isCorrect,
      // ... other fields
    }, { onConflict: 'user_id,session_id,question_id' })

  if (error?.code === '23505') {
    // Unique constraint violation - interaction already exists
    // Return existing result, don't create duplicate
    return { existing: true, ... }
  }
  ```

### Step 8: Complete RLS Policies
- **File:** `supabase/migrations/NEW_rls_completion.sql`
- **Action:** CREATE migration to complete all missing RLS
- **Logic Required:**
  - Audit all 72 tables for missing RLS policies
  - Add policies for: `profiles`, `user_global_stats`, `user_question_states`
  - Add policies for: `taxonomy_tree` (fix USING (true) bypass)
  - Ensure admin role has bypass, user role restricted to own data

### Step 9: Create user_capabilities View
- **File:** `supabase/migrations/NEW_query_optimization.sql`
- **Action:** ADD to existing migration
- **SQL Required:**
  ```sql
  CREATE OR REPLACE VIEW user_capabilities AS
  SELECT
    p.user_id,
    p.email,
    CASE
      WHEN us.tier = 'pro' AND us.status = 'active' THEN 'pro'
      WHEN us.tier = 'enterprise' AND us.status = 'active' THEN 'enterprise'
      ELSE 'free'
    END as subscription_tier,
    ur.role as user_role
  FROM profiles p
  LEFT JOIN user_subscriptions us ON p.user_id = us.user_id
  LEFT JOIN user_roles ur ON p.user_id = ur.user_id;
  ```

---

## 4. Testing & Validation Protocol

### Manual Verification
1. **Massive Array Test:** Create user with 5000+ interactions, start new session - should complete in <2 seconds
2. **Breadcrumb Test:** Session with 50 questions - verify taxonomy breadcrumb loads in single query
3. **Concurrency Test:** Open two tabs, complete sessions simultaneously - verify no stat loss
4. **Idempotency Test:** Double-submit answer - verify only one interaction created
5. **RLS Test:** As anonymous user, attempt to read restricted tables - should fail with 403

### Automated Checks
```bash
# Run existing tests
bun test

# Run lint
bun run lint

# Run type-check
bun run type-check

# Run build
bun run build
```

### Database Verification
```sql
-- Verify unique constraint exists
SELECT indexname FROM pg_indexes WHERE indexname = 'idx_question_interactions_unique';

-- Verify partial indexes
SELECT indexname FROM pg_indexes WHERE indexname LIKE 'idx_%_active';

-- Check RLS policies count
SELECT count(*) FROM pg_policies;
```

---

## 5. Rollback Strategy

### If Migration Fails
- **Revert migration:** `supabase db reset` then re-run failed migration only
- **Rollback SQL:**
  ```sql
  DROP INDEX IF EXISTS idx_question_interactions_unique;
  DROP INDEX IF EXISTS idx_questions_active;
  DROP VIEW IF EXISTS user_capabilities;
  ```

### If Code Changes Break Session Creation
- **Git revert:** `git checkout HEAD~1 -- src/lib/quiz/intelligent-routing.ts`
- **Revert to backup:** Use last known working version of routing logic

### If RLS Breaks Access
- **Disable RLS temporarily:** `ALTER TABLE tablename DISABLE ROW LEVEL SECURITY;`
- **Debug policy:** Check `SELECT * FROM pg_policies WHERE tablename = 'tablename';`

---

## 6. Implementation Notes

### Key Files Referenced
- `src/lib/quiz/intelligent-routing.ts` (lines 68-70, 138-140) - massive array issue
- `src/lib/quiz/to-client-question.ts` - breadcrumb building
- `src/lib/actions/quiz-v2/start-session.ts` (line 250) - breadcrumb caller
- `src/lib/srs/update.ts` - stat updates
- `src/lib/actions/quiz-v2/submit-answer.ts` - interaction creation
- `supabase/migrations/010_schema_hardening.sql` - existing RLS

### Success Criteria
1. Session creation time <2s even with 5000+ prior interactions
2. Breadcrumb loading uses single query (verify with EXPLAIN ANALYZE)
3. Concurrent session completions don't lose stat updates
4. Duplicate answer submissions create single interaction record
5. All 72 tables have appropriate RLS policies
