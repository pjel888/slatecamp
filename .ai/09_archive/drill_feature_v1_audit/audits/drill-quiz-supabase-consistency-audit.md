# Drill / Quiz Supabase Consistency Audit

## 1. Relevant Tables

| Table | Purpose | Integrity Risk |
|-------|---------|----------------|
| `quiz_sessions` | Parent session state | Manual enum drift |
| `user_interactions` | Individual answers | Duplicate records |
| `user_question_states` | Cache of mastery | Desync from interactions |
| `session_questions` | Pre-allocated session set | Orphaned questions |
| `issued_nonces` | CAGE replay protection | TTL expiry cleanup |

## 2. Relational Integrity
- **Foreign Keys**: `quiz_sessions` correctly references `auth.users(id)`.
- **Triggers**: `user_question_states` is updated via a trigger on `user_interactions`, which is a good pattern for eventual consistency.

## 3. Findings
- **Check Constraints**: Many numeric fields (e.g., `accuracy`, `difficulty`) lack DB-level `CHECK (val >= 0 AND val <= 1)` constraints, relying on application logic.
- **Nullability**: Several fields in `quiz_sessions` (like `config`) are `JSONB` without a strict schema at the DB level.

## 4. Verdict
The database schema is mature but relies heavily on **application-layer validation** rather than strict DB-level constraints.
