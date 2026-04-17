# MASTER ARCHITECTURE BLUEPRINT: DATABASE LAYER
**Status:** UNIFIED (Panopticon V8)

## 1. Executive Vulnerability Summary
1. **CRITICAL: Incomplete RLS Coverage:** `supabase/migrations/010_schema_hardening.sql` explicitly notes "Missing RLS policies" for several tables. This creates unauthorized read/write risks across the 72-table schema.
2. **HIGH: Performance Death Spiral (Massive Array):** `intelligent-routing.ts` fetches ALL previous interaction IDs (potentially 5,000+) to pass to a `NOT IN` clause. This will eventually hit query string limits and cause session-creation timeouts as the user history grows.
3. **MEDIUM: N+1 Breadcrumb Query:** `buildTaxonomyBreadcrumbMap()` in `start-session.ts` performs a sequential query for every taxonomy node associated with a question. A 50-question session results in ~150-200 sequential DB hits, causing significant latency.

## 2. Exhaustive System Inventory

### 2.1 Core Schema Components (72 Tables Total)
- **Primary Entities:** `profiles`, `disciplines`, `organizations`, `organization_members`, `user_roles`, `user_subscriptions`.
- **Assessment Core:** `questions`, `quiz_sessions`, `question_interactions`, `taxonomy_tree`, `wiki_articles`.
- **Analytics & SRS:** `user_global_stats`, `blindspot_queues`, `user_computed_signals`.
- **Financial & Operations:** `financial_entries`, `transactions`, `payments`, `user_subscriptions`.

### 2.2 Key Table Schemas
- **`questions`:** `id`, `question_text`, `distractors` (array), `correct_answer` (index), `difficulty`, `status` (draft..published), `test_modes` (array), `ai_generated`.
- **`question_interactions`:** `user_id`, `question_id`, `session_id`, `selected_answer`, `correct`, `confidence`, `time_spent_ms`, `cage_token`, `signal_trace` (JSONB).
- **`user_global_stats`:** `user_id`, `theta` (IRT ability), `readiness_score`, `streak_days`, `last_session_at`.

## 3. Data Flow & Exact Payloads

### 3.1 Session Creation Data Flow
```typescript
// 1. Fetch user interactions
const excludedIds = await supabase.from('question_interactions').select('id');
// 2. Query questions with massive exclusion array
const questions = await supabase.from('questions').select().not('id', 'in', excludedIds);
// 3. Insert new session
const session = await supabase.from('quiz_sessions').insert({ user_id, config, status: 'active' });
```

### 3.2 Question Payload Shape
```json
{
  "id": "uuid", "question_text": "...", "distractors": ["A", "B", "C", "D", "E"],
  "correct_answer": 1, "difficulty": "hard", "taxonomy_node_id": "uuid"
}
```

## 4. Extreme Edge-Case & Concurrency Vulnerabilities
- **Concurrency: Global Stat Race:** `user_global_stats` (streaks, readiness) is updated at the end of every quiz session. If a user has two sessions completing simultaneously in separate tabs, the final `streak_days` or `theta` value will be determined by the last writer, potentially losing progress from the first-completing session.
- **Idempotency: Interaction Duplication:** `question_interactions` lacks a unique constraint on `(user_id, session_id, question_id)`. Rapid double-submitting of an answer can create multiple interaction records, inflating readiness scores and accuracy metrics.
- **Hydration: Materialized View Stale-State:** The CEO dashboard uses `mv_engagement_snapshot`. If the cron `compute-signals` fails to refresh the view, the CEO sees stale data while the actual user activity is significantly different.
- **RLS Bypass:** `taxonomy_tree` uses `USING (true)`, allowing unauthenticated public read. If sensitive internal metadata is added to nodes, it is exposed.

## 5. The Unified Resolution Blueprint

### 5.1 Query Optimization
1. **Server-Side Filtering:** Replace massive exclusion arrays with a subquery or PostgreSQL function:
   `WHERE id NOT IN (SELECT question_id FROM question_interactions WHERE user_id = $1)`.
2. **Recursive CTEs:** Replace N+1 taxonomy breadcrumb loops with a single recursive query for the entire breadcrumb trail.
3. **Partial Indexes:** Add indexes for `WHERE deleted_at IS NULL` on `questions`, `articles`, and `quiz_sessions`.

### 5.2 Schema & RLS Hardening
1. **Uniqueness Constraints:** Add unique index `(user_id, session_id, question_id)` to `question_interactions` for idempotency.
2. **Atomic Increments:** Use `UPDATE ... SET score = score + delta` instead of fetching/calculating/saving to prevent stat race conditions.
3. **RLS Audit:** Systematically complete policies for all 72 tables, ensuring `admin` roles have bypass permissions and `user` roles are restricted to `auth.uid() = user_id`.
4. **Computed Capability View:** Create `user_capabilities` view as a single source of truth for tier/role checking.
