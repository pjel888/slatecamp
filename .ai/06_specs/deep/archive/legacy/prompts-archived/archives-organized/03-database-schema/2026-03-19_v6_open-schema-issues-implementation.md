# SlateCamp — Open Schema Issues: Implementation
## 4 Issues. 2 Migrations. 1 New Trigger. 1 New Table. 1 Server Action.

---

## SCOPE

This prompt implements the 4 open items from the database schema audit. The SQL is ALREADY WRITTEN in this prompt — your job is to verify preconditions, run the migrations, update one existing trigger function, build one Server Action, and wire it into the session completion flow.

**Total work:** ~30 minutes of engineering. No frontend changes. No UI. Pure backend.

---

## TOOLS

- **Supabase MCP** — Run all verification queries and migrations through this.
- **File System** — Read the existing trigger function body and session completion Server Action.
- **grep** — Find the session completion handler where the Server Action will be wired.

---

## PHASE 1: Pre-Flight (Read-Only)

```sql
-- 1. Verify user_mastery_history RLS policy names (exact names needed for drop)
SELECT policyname, cmd, qual, with_check
FROM pg_policies WHERE tablename = 'user_mastery_history';

-- 2. Verify user_mastery_history.topic_id has NO existing FK
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'user_mastery_history' AND constraint_type = 'FOREIGN KEY';

-- 3. Verify readiness_score_snapshots columns (confirm session_id and is_proof_simulation don't exist yet)
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'readiness_score_snapshots' ORDER BY ordinal_position;

-- 4. Verify user_computed_signals table doesn't exist yet
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'user_computed_signals';

-- 5. Verify trg_flag_lucky_guess trigger doesn't exist yet
SELECT trigger_name FROM information_schema.triggers
WHERE trigger_schema = 'public' AND trigger_name = 'trg_flag_lucky_guess';

-- 6. Read the CURRENT snapshot_readiness_on_session_complete function body
SELECT routine_name, routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name ILIKE '%snapshot_readiness%';

-- 7. Check is_flagged current state (how many are true vs false)
SELECT
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE is_flagged = true) as flagged,
  COUNT(*) FILTER (WHERE is_flagged = false) as not_flagged
FROM user_interactions;

-- 8. Check user_mastery_history row count (for FK safety)
SELECT COUNT(*) FROM user_mastery_history;

-- 9. Verify all topic_ids in user_mastery_history actually exist in taxonomy_tree
-- (if orphans exist, the FK will fail)
SELECT COUNT(*) as orphaned_rows
FROM user_mastery_history h
WHERE NOT EXISTS (
  SELECT 1 FROM taxonomy_tree t WHERE t.node_id = h.topic_id
);
```

Also read:
```bash
# Find the snapshot trigger function source (may be in a migration file)
grep -rn "snapshot_readiness_on_session_complete\|snapshot_readiness_on_complete" src/ supabase/ --include="*.sql" --include="*.ts" | head -10

# Find session completion Server Action
grep -rn "status.*completed\|completeSession\|submitQuiz\|finishSession" src/ --include="*.ts" --include="*.tsx" | head -15

# Find where readiness score is computed after session
grep -rn "computeReadiness\|readiness_score\|global_readiness_score" src/ --include="*.ts" --include="*.tsx" | head -15
```

**Decision points from Phase 1:**

- If query #9 returns orphaned rows > 0: you must either delete the orphaned rows first OR skip the FK constraint (use Issue 4 alternative: document the omission instead). **Do NOT add the FK if orphans exist — the migration will fail.**
- If query #1 returns policy names different from the ones in the migration SQL: ADAPT the DROP POLICY statements to use the ACTUAL names.
- If query #3 shows `session_id` or `is_proof_simulation` already exist: skip those ALTER TABLE statements.
- If query #4 shows `user_computed_signals` already exists: skip the CREATE TABLE.
- If query #5 shows `trg_flag_lucky_guess` already exists: skip that trigger creation.

**STOP.** "Phase 1 Complete. Here's the current state. [X] orphaned rows found. Reply 'Proceed.'"

---

## PHASE 2: Run Migration 1 (Low Risk)

### File: `supabase/migrations/YYYYMMDDHHMMSS_fix_rls_and_fk.sql`

**ADAPT the DROP POLICY names to match the ACTUAL names from Phase 1 query #1.**

```sql
-- ============================================================
-- Migration 1: Fix RLS + Add FK
-- Risk: Low. Policy changes + constraint on existing table.
-- ============================================================

-- ── Issue 1: Fix user_mastery_history RLS ─────────────────────
-- Replace bare auth.uid() with cached (select auth.uid())

DROP POLICY IF EXISTS "Users can insert own mastery history" ON public.user_mastery_history;
DROP POLICY IF EXISTS "Users can view own mastery history" ON public.user_mastery_history;
-- ADAPT: If Phase 1 returned different policy names, use those instead:
-- DROP POLICY IF EXISTS "mh_select_own" ON public.user_mastery_history;
-- DROP POLICY IF EXISTS "mh_insert_own" ON public.user_mastery_history;

CREATE POLICY "mh_insert_own"
  ON public.user_mastery_history FOR INSERT
  TO public
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "mh_select_own"
  ON public.user_mastery_history FOR SELECT
  TO public
  USING ((select auth.uid()) = user_id);


-- ── Issue 4: Add topic_id FK to user_mastery_history ──────────
-- SKIP THIS BLOCK if Phase 1 query #9 returned orphaned_rows > 0.
-- In that case, clean orphans first:
--   DELETE FROM user_mastery_history WHERE topic_id NOT IN (SELECT node_id FROM taxonomy_tree);
-- Then re-run.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'user_mastery_history'
      AND constraint_name = 'fk_mastery_history_topic_id'
  ) THEN
    ALTER TABLE public.user_mastery_history
      ADD CONSTRAINT fk_mastery_history_topic_id
      FOREIGN KEY (topic_id) REFERENCES public.taxonomy_tree(node_id)
      ON DELETE RESTRICT;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_mastery_history_topic_id
  ON public.user_mastery_history(topic_id);
```

**Verify:**
```sql
-- RLS policies are correct
SELECT policyname, cmd, with_check, qual
FROM pg_policies WHERE tablename = 'user_mastery_history';
-- Should show 2 policies with (select auth.uid())

-- FK exists
SELECT constraint_name FROM information_schema.table_constraints
WHERE table_name = 'user_mastery_history' AND constraint_type = 'FOREIGN KEY';
-- Should show fk_mastery_history_topic_id

-- Index exists
SELECT indexname FROM pg_indexes
WHERE tablename = 'user_mastery_history' AND indexname = 'idx_mastery_history_topic_id';
```

**STOP.** "Migration 1 complete and verified. Reply 'Proceed' for Migration 2."

---

## PHASE 3: Run Migration 2 (Medium Risk)

### File: `supabase/migrations/YYYYMMDDHHMMSS_proof_simulation_and_signals.sql`

```sql
-- ============================================================
-- Migration 2: Proof Simulation context + Lucky Guess trigger
--              + Computed Signals table
-- Risk: Medium. New trigger on highest-write table.
-- ============================================================


-- ── Issue 2: Add proof simulation context to snapshots ────────

ALTER TABLE public.readiness_score_snapshots
  ADD COLUMN IF NOT EXISTS session_id UUID REFERENCES public.quiz_sessions(session_id),
  ADD COLUMN IF NOT EXISTS is_proof_simulation BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_readiness_snapshots_user_proof
  ON public.readiness_score_snapshots(user_id, computed_at DESC, is_proof_simulation);


-- ── Issue 3a: Lucky Guess Detection trigger ───────────────────

CREATE OR REPLACE FUNCTION public.flag_lucky_guess_on_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_mastery_weight DOUBLE PRECISION;
  v_avg_time_ms    INTEGER;
BEGIN
  -- Only evaluate correct answers
  IF NEW.is_correct = false THEN
    RETURN NEW;
  END IF;

  -- Get current mastery weight and avg time for this topic
  SELECT current_mastery_weight, avg_time_ms
  INTO v_mastery_weight, v_avg_time_ms
  FROM public.user_node_mastery
  WHERE user_id = NEW.user_id
    AND topic_id = NEW.topic_id;

  -- Flag if: topic is in Red zone AND answer was abnormally fast
  -- Threshold: less than 40% of user's average time for this topic
  -- Falls back to 5000ms absolute floor if no prior history
  IF v_mastery_weight IS NOT NULL
    AND v_mastery_weight < 0.4
    AND NEW.time_spent_ms < COALESCE(v_avg_time_ms * 0.4, 5000)
    AND NEW.time_spent_ms > 0
  THEN
    NEW.is_flagged := true;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_flag_lucky_guess ON public.user_interactions;
CREATE TRIGGER trg_flag_lucky_guess
  BEFORE INSERT ON public.user_interactions
  FOR EACH ROW
  EXECUTE FUNCTION public.flag_lucky_guess_on_insert();


-- ── Issue 3b: user_computed_signals table ─────────────────────

CREATE TABLE IF NOT EXISTS public.user_computed_signals (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  score_velocity_7d DOUBLE PRECISION NOT NULL DEFAULT 0,
  score_velocity_updated_at TIMESTAMPTZ,
  churn_risk_score DOUBLE PRECISION NOT NULL DEFAULT 0,
  churn_risk_updated_at TIMESTAMPTZ,
  days_since_last_session INTEGER,
  sessions_last_7d INTEGER NOT NULL DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_computed_signals ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_computed_signals' AND policyname = 'cs_select_own') THEN
    CREATE POLICY cs_select_own ON public.user_computed_signals
      FOR SELECT TO authenticated
      USING ((select auth.uid()) = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_computed_signals_churn
  ON public.user_computed_signals(churn_risk_score DESC)
  WHERE churn_risk_score > 0.6;

DROP TRIGGER IF EXISTS tr_computed_signals_updated_at ON public.user_computed_signals;
CREATE TRIGGER tr_computed_signals_updated_at
  BEFORE UPDATE ON public.user_computed_signals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ── Issue 3c: Deprecation comments ────────────────────────────

COMMENT ON COLUMN public.user_global_stats.churn_risk_score IS
  'DEPRECATED — use user_computed_signals.churn_risk_score instead';
COMMENT ON COLUMN public.user_global_stats.score_velocity_7d IS
  'DEPRECATED — use user_computed_signals.score_velocity_7d instead';
```

**Verify:**
```sql
-- Snapshot columns exist
SELECT column_name FROM information_schema.columns
WHERE table_name = 'readiness_score_snapshots'
AND column_name IN ('session_id', 'is_proof_simulation');

-- Lucky guess trigger exists
SELECT trigger_name FROM information_schema.triggers
WHERE trigger_name = 'trg_flag_lucky_guess';

-- user_computed_signals table exists
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'user_computed_signals' ORDER BY ordinal_position;

-- RLS enabled
SELECT tablename, rowsecurity FROM pg_tables
WHERE tablename = 'user_computed_signals';

-- Deprecation comments applied
SELECT col_description(
  (SELECT oid FROM pg_class WHERE relname = 'user_global_stats'),
  (SELECT attnum FROM pg_attribute WHERE attrelid = (SELECT oid FROM pg_class WHERE relname = 'user_global_stats') AND attname = 'churn_risk_score')
);
```

**STOP.** "Migration 2 complete and verified. Reply 'Proceed' to update the snapshot trigger and build the signals Server Action."

---

## PHASE 4: Update Snapshot Trigger Function

The existing `snapshot_readiness_on_session_complete()` (or `snapshot_readiness_on_complete()`) trigger needs to write the two new columns.

### Step 1: Read the current function body

From Phase 1 query #6, you have the current function definition. It likely looks like:

```sql
-- Current (approximate):
INSERT INTO public.readiness_score_snapshots (user_id, score)
SELECT NEW.user_id, g.global_readiness_score
FROM public.user_global_stats g
WHERE g.user_id = NEW.user_id ...
```

### Step 2: Update it to include session_id and is_proof_simulation

```sql
CREATE OR REPLACE FUNCTION public.snapshot_readiness_on_session_complete()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    INSERT INTO public.readiness_score_snapshots (
      user_id,
      score,
      session_id,           -- NEW
      is_proof_simulation   -- NEW
    )
    SELECT
      NEW.user_id,
      g.global_readiness_score,
      NEW.session_id,                -- from the completed session
      COALESCE(NEW.is_proof_simulation, false)  -- from the session flag
    FROM public.user_global_stats g
    WHERE g.user_id = NEW.user_id
      AND g.global_readiness_score IS NOT NULL
      AND g.global_readiness_score > 0;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**ADAPT:** If the function name in your database is different (e.g., `snapshot_readiness_on_complete` without `_session`), use the ACTUAL name from Phase 1 query #6.

**Verify:**
```sql
-- Check function was updated
SELECT routine_definition FROM information_schema.routines
WHERE routine_name ILIKE '%snapshot_readiness%';
-- Should contain 'session_id' and 'is_proof_simulation' in the function body
```

**STOP.** "Trigger updated. Reply 'Proceed' for the computed signals Server Action."

---

## PHASE 5: Build `computeUserSignals` Server Action

### Step 1: Find the right file

```bash
# Find where session completion logic lives
grep -rn "status.*completed\|completeSession\|finishSession" src/ --include="*.ts" --include="*.tsx" | head -10

# Find existing Server Actions directory pattern
find src/ -name "actions.ts" | sort
```

### Step 2: Create the function

Create in the same directory as the session completion action (or in `src/lib/signals/`):

```typescript
// src/lib/signals/compute.ts (or wherever Server Actions live)

import { createClient } from '@/lib/supabase/server'  // ADAPT

/**
 * Compute and upsert derived signals for a user.
 * Called after session completion. Silent on failure.
 *
 * Computes:
 *   - score_velocity_7d: change in readiness score over last 7 days (pts/day)
 *   - churn_risk_score: 0.0–1.0 composite risk
 *   - days_since_last_session
 *   - sessions_last_7d
 */
export async function computeUserSignals(userId: string): Promise<void> {
  try {
    const supabase = await createClient()  // ADAPT: may not be async

    // ── Score Velocity ──────────────────────────────────────
    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const { data: currentStats } = await supabase
      .from('user_global_stats')
      .select('global_readiness_score, target_exam_date')
      .eq('user_id', userId)
      .single()

    const currentScore = currentStats?.global_readiness_score ?? 0

    // Find the oldest snapshot within the last 7 days for baseline
    const { data: baselineSnapshot } = await supabase
      .from('readiness_score_snapshots')
      .select('score, computed_at')
      .eq('user_id', userId)
      .lte('computed_at', sevenDaysAgo.toISOString())
      .order('computed_at', { ascending: false })
      .limit(1)
      .single()

    let velocity = 0
    if (baselineSnapshot) {
      const daysDelta = (now.getTime() - new Date(baselineSnapshot.computed_at).getTime()) / (1000 * 60 * 60 * 24)
      if (daysDelta > 0) {
        velocity = (currentScore - baselineSnapshot.score) / daysDelta
      }
    }

    // ── Sessions Last 7 Days ────────────────────────────────
    const { count: sessionsLast7d } = await supabase
      .from('quiz_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'completed')
      .gte('started_at', sevenDaysAgo.toISOString())

    // ── Days Since Last Session ─────────────────────────────
    const { data: lastSession } = await supabase
      .from('quiz_sessions')
      .select('started_at')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('started_at', { ascending: false })
      .limit(1)
      .single()

    const daysSinceLastSession = lastSession
      ? Math.floor((now.getTime() - new Date(lastSession.started_at).getTime()) / (1000 * 60 * 60 * 24))
      : 999

    // ── Churn Risk Score ────────────────────────────────────
    // Simple heuristic (refine with real data):
    //   days_since_last_session > 7    → +0.3
    //   score_velocity_7d < 0          → +0.3
    //   sessions_last_7d = 0           → +0.4
    //   sessions_last_7d >= 3          → -0.2
    //   exam > 45 days away            → +0.0 (neutral, not additive for now)

    let churnRisk = 0
    if (daysSinceLastSession > 7) churnRisk += 0.3
    if (velocity < 0) churnRisk += 0.3
    if ((sessionsLast7d ?? 0) === 0) churnRisk += 0.4
    if ((sessionsLast7d ?? 0) >= 3) churnRisk -= 0.2

    churnRisk = Math.max(0, Math.min(1, churnRisk))

    // ── Upsert ──────────────────────────────────────────────
    await supabase
      .from('user_computed_signals')
      .upsert({
        user_id: userId,
        score_velocity_7d: Math.round(velocity * 100) / 100,
        score_velocity_updated_at: now.toISOString(),
        churn_risk_score: Math.round(churnRisk * 100) / 100,
        churn_risk_updated_at: now.toISOString(),
        days_since_last_session: daysSinceLastSession,
        sessions_last_7d: sessionsLast7d ?? 0,
        computed_at: now.toISOString(),
      }, { onConflict: 'user_id' })

  } catch {
    // Silent failure. Signals are non-critical. Never break the quiz flow.
  }
}
```

### Step 3: Wire into session completion

Find the session completion handler (from grep in Step 1). Add ONE LINE after the readiness score computation:

```typescript
// After existing score computation + snapshot trigger...
await computeUserSignals(userId)
```

Import at the top of the file:
```typescript
import { computeUserSignals } from '@/lib/signals/compute'  // ADAPT path
```

**The call must be AFTER the readiness score is updated** (so velocity reads the fresh score) and must NOT be awaited in a way that blocks the user response. Use `void computeUserSignals(userId)` if you want fire-and-forget, or `await` if the Server Action already handles errors gracefully.

**STOP.** "Server Action built and wired. Reply 'Proceed' for final verification."

---

## PHASE 6: Verification

### Schema:
```sql
-- All 4 issues resolved:

-- Issue 1: RLS uses (select auth.uid())
SELECT policyname, with_check, qual FROM pg_policies
WHERE tablename = 'user_mastery_history';

-- Issue 2: Snapshots have session_id + is_proof_simulation
SELECT column_name FROM information_schema.columns
WHERE table_name = 'readiness_score_snapshots'
AND column_name IN ('session_id', 'is_proof_simulation');

-- Issue 3a: Lucky guess trigger exists
SELECT trigger_name FROM information_schema.triggers
WHERE trigger_name = 'trg_flag_lucky_guess';

-- Issue 3b: user_computed_signals exists with data
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'user_computed_signals' ORDER BY ordinal_position;

-- Issue 4: FK constraint exists
SELECT constraint_name FROM information_schema.table_constraints
WHERE table_name = 'user_mastery_history' AND constraint_type = 'FOREIGN KEY';

-- Deprecation comments applied
SELECT col_description(c.oid, a.attnum)
FROM pg_class c JOIN pg_attribute a ON a.attrelid = c.oid
WHERE c.relname = 'user_global_stats' AND a.attname = 'churn_risk_score';
```

### Functional test:
```sql
-- Test lucky guess trigger: insert a fast correct answer on a low-mastery topic
-- (Use a test user, not production data)
-- After insert, check: SELECT is_flagged FROM user_interactions WHERE interaction_id = '[new_id]';
-- Should be true if mastery < 0.4 and time was fast
```

### Code:
```bash
# TypeScript compiles
npx tsc --noEmit

# Server Action file exists
find src/ -name "compute.ts" -path "*signal*" | head -3

# Import is wired into session completion
grep -n "computeUserSignals" src/ --include="*.ts" --include="*.tsx" -r
```

### App smoke test:
- [ ] Start and complete a Camp Mode quiz → no errors
- [ ] After completion, check `user_computed_signals` for the user → row exists with fresh data
- [ ] Check `readiness_score_snapshots` → latest row has `session_id` and `is_proof_simulation = false`
- [ ] Check `user_interactions` for the session → `is_flagged` is set appropriately on fast correct answers
- [ ] Dashboard loads without errors
- [ ] Analytics page loads without errors

### Then:
Run the **DATABASE_SCHEMA.sql sync prompt** to regenerate schema documentation with all new tables, columns, triggers, indexes, and policies.

**STOP.** "All 4 open schema issues resolved. DATABASE_SCHEMA.sql updated."

---

## SUMMARY OF CHANGES

| Issue | What Changed | Type |
|---|---|---|
| 1 | `user_mastery_history` RLS → `(select auth.uid())` | Policy fix |
| 2 | `readiness_score_snapshots` + `session_id`, `is_proof_simulation` columns | ALTER TABLE |
| 2 | `snapshot_readiness_on_session_complete()` writes new columns | Function update |
| 2 | `idx_readiness_snapshots_user_proof` composite index | New index |
| 3a | `flag_lucky_guess_on_insert()` trigger on `user_interactions` | New trigger |
| 3b | `user_computed_signals` table with RLS + index | New table |
| 3b | `computeUserSignals()` Server Action | New function |
| 3c | Deprecation comments on `user_global_stats` columns | Documentation |
| 4 | `fk_mastery_history_topic_id` FK constraint | New constraint |
| 4 | `idx_mastery_history_topic_id` index | New index |

---

## WHAT NOT TO DO

- **Don't drop the deprecated columns on `user_global_stats`.** Leave them. They may still be read by existing code. Mark deprecated, migrate reads to `user_computed_signals`, drop columns in a FUTURE migration.
- **Don't make `computeUserSignals` blocking.** If it fails, the quiz completion must still succeed. Silent failure only.
- **Don't skip the orphan check (Phase 1 query #9).** Adding a FK to a table with orphaned rows will crash the migration.
- **Don't guess RLS policy names.** Use the EXACT names from Phase 1 query #1.
- **Don't tune the lucky guess threshold without data.** The 40% time threshold is a starting point. Monitor `is_flagged` hit rate for 1 week. If >15% of correct answers are flagged, the threshold is too aggressive — raise it to 30% or 25%.

---

*Execute Phase 1 now. Run the pre-flight queries.*
