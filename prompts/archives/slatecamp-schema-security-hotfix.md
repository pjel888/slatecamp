# SlateCamp — Schema Security Hotfix + Remaining Fixes
## 🔴 3 Tables With No RLS. 🔴 Lucky Guess Trigger Missing. Fix NOW.

---

## SEVERITY

Two items are **live security issues** on production:
- `user_computed_signals`, `teach_back_submissions`, `topic_teach_back_criteria` have NO RLS policies — either completely open or completely inaccessible
- The lucky guess trigger never deployed — `is_suspected_lucky_guess` is `false` on every row forever, inflating the Readiness Score

This is ONE migration. Run it immediately.

---

## TOOLS

- **Supabase MCP** — ALL queries and the migration execution
- **File System** — Only needed to find the `computeUserSignals` Server Action for verification

---

## PHASE 1: Pre-Flight (5 queries, one batch)

```sql
-- 1. Confirm RLS is enabled but policies are missing on the 3 tables
SELECT tablename, rowsecurity,
  (SELECT COUNT(*) FROM pg_policies p WHERE p.tablename = t.tablename) as policy_count
FROM pg_tables t
WHERE schemaname = 'public'
AND tablename IN ('user_computed_signals', 'teach_back_submissions', 'topic_teach_back_criteria');

-- 2. Confirm lucky guess trigger does NOT exist
SELECT trigger_name FROM information_schema.triggers
WHERE trigger_schema = 'public' AND trigger_name = 'trg_flag_lucky_guess';

-- 3. Confirm lucky guess function does NOT exist
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public' AND routine_name = 'flag_lucky_guess_on_insert';

-- 4. Confirm user_mastery_history RLS policy names + current USING/WITH CHECK
SELECT policyname, cmd, qual, with_check
FROM pg_policies WHERE tablename = 'user_mastery_history';

-- 5. Confirm idx_readiness_snapshots_user_proof does NOT exist
SELECT indexname FROM pg_indexes
WHERE schemaname = 'public' AND indexname = 'idx_readiness_snapshots_user_proof';

-- 6. Check if updated_at columns exist on teach-back tables
SELECT table_name, column_name FROM information_schema.columns
WHERE table_name IN ('teach_back_submissions', 'topic_teach_back_criteria')
AND column_name = 'updated_at';

-- 7. Check the is_suspected_lucky_guess column name (may be is_suspected_lucky_guess or is_flagged)
SELECT column_name FROM information_schema.columns
WHERE table_name = 'user_interactions'
AND column_name IN ('is_suspected_lucky_guess', 'is_flagged');

-- 8. Verify deprecated column comments don't already exist
SELECT col_description(c.oid, a.attnum) as comment
FROM pg_class c JOIN pg_attribute a ON a.attrelid = c.oid
WHERE c.relname = 'user_global_stats' AND a.attname = 'churn_risk_score';
```

**Decision points:**
- Query #1: If `rowsecurity = false` → need `ALTER TABLE ENABLE ROW LEVEL SECURITY` first. If `rowsecurity = true` and `policy_count = 0` → tables are locked to everyone, need policies.
- Query #4: Get the EXACT policy names for the DROP + recreate.
- Query #7: Confirm the column is `is_suspected_lucky_guess` (not `is_flagged`). The trigger must target the correct column name.

**STOP.** "Phase 1 Complete. Reply 'Proceed.'"

---

## PHASE 2: Run the Migration

### File: `supabase/migrations/YYYYMMDDHHMMSS_security_hotfix.sql`

```sql
-- ============================================================
-- SlateCamp Security Hotfix
-- Fixes: 2 critical (RLS, trigger), 4 important, 1 cleanup
-- All statements idempotent. Safe on live data.
-- ============================================================


-- ═══════════════════════════════════════════════════════════════
-- 🔴 CRITICAL FIX 1: RLS on 3 unprotected tables
-- ═══════════════════════════════════════════════════════════════

-- ── user_computed_signals ─────────────────────────────────────

ALTER TABLE public.user_computed_signals ENABLE ROW LEVEL SECURITY;

-- Users can read their own signals
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_computed_signals' AND policyname = 'cs_select_own') THEN
    CREATE POLICY cs_select_own ON public.user_computed_signals
      FOR SELECT TO authenticated
      USING ((select auth.uid()) = user_id);
  END IF;
END $$;

-- Server-side upsert only (service role). No client INSERT/UPDATE policy.
-- The computeUserSignals Server Action uses the service role client.


-- ── teach_back_submissions ────────────────────────────────────

ALTER TABLE public.teach_back_submissions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'teach_back_submissions' AND policyname = 'tbs_select_own') THEN
    CREATE POLICY tbs_select_own ON public.teach_back_submissions
      FOR SELECT TO authenticated
      USING ((select auth.uid()) = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'teach_back_submissions' AND policyname = 'tbs_insert_own') THEN
    CREATE POLICY tbs_insert_own ON public.teach_back_submissions
      FOR INSERT TO authenticated
      WITH CHECK ((select auth.uid()) = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'teach_back_submissions' AND policyname = 'tbs_update_own') THEN
    CREATE POLICY tbs_update_own ON public.teach_back_submissions
      FOR UPDATE TO authenticated
      USING ((select auth.uid()) = user_id);
  END IF;
END $$;


-- ── topic_teach_back_criteria ─────────────────────────────────
-- This is CONTENT (authored by SMEs), not user data.
-- All authenticated users can READ. Only service role writes.

ALTER TABLE public.topic_teach_back_criteria ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'topic_teach_back_criteria' AND policyname = 'ttbc_select_all') THEN
    CREATE POLICY ttbc_select_all ON public.topic_teach_back_criteria
      FOR SELECT TO authenticated
      USING (true);
  END IF;
END $$;


-- ═══════════════════════════════════════════════════════════════
-- 🔴 CRITICAL FIX 2: Lucky Guess Detection Trigger
-- ═══════════════════════════════════════════════════════════════

-- ADAPT: Phase 1 query #7 confirms the column name.
-- If the column is 'is_suspected_lucky_guess', use that.
-- If the column is 'is_flagged', use that instead.
-- The SQL below uses is_suspected_lucky_guess.

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
  -- Red zone = mastery < 0.4
  -- Fast = less than 40% of user's average time on this topic
  -- Falls back to 5000ms absolute floor if no prior history
  IF v_mastery_weight IS NOT NULL
    AND v_mastery_weight < 0.4
    AND NEW.time_spent_ms < COALESCE(v_avg_time_ms * 0.4, 5000)
    AND NEW.time_spent_ms > 0
  THEN
    NEW.is_suspected_lucky_guess := true;  -- ADAPT column name if different
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_flag_lucky_guess ON public.user_interactions;
CREATE TRIGGER trg_flag_lucky_guess
  BEFORE INSERT ON public.user_interactions
  FOR EACH ROW
  EXECUTE FUNCTION public.flag_lucky_guess_on_insert();


-- ═══════════════════════════════════════════════════════════════
-- 🟡 IMPORTANT FIX 3: user_mastery_history RLS → (select auth.uid())
-- ═══════════════════════════════════════════════════════════════

-- ADAPT: Use the EXACT policy names from Phase 1 query #4.
-- The names below are the most likely variants.

DROP POLICY IF EXISTS "Users can insert own mastery history" ON public.user_mastery_history;
DROP POLICY IF EXISTS "Users can view own mastery history" ON public.user_mastery_history;
DROP POLICY IF EXISTS "mh_insert_own" ON public.user_mastery_history;
DROP POLICY IF EXISTS "mh_select_own" ON public.user_mastery_history;

CREATE POLICY mh_select_own ON public.user_mastery_history
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY mh_insert_own ON public.user_mastery_history
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);


-- ═══════════════════════════════════════════════════════════════
-- 🟡 IMPORTANT FIX 4: Missing updated_at triggers + columns
-- ═══════════════════════════════════════════════════════════════

-- user_computed_signals: trigger missing
DROP TRIGGER IF EXISTS tr_computed_signals_updated_at ON public.user_computed_signals;
CREATE TRIGGER tr_computed_signals_updated_at
  BEFORE UPDATE ON public.user_computed_signals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- teach_back_submissions: add updated_at column + trigger
ALTER TABLE public.teach_back_submissions
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

DROP TRIGGER IF EXISTS tr_teach_back_submissions_updated_at ON public.teach_back_submissions;
CREATE TRIGGER tr_teach_back_submissions_updated_at
  BEFORE UPDATE ON public.teach_back_submissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- topic_teach_back_criteria: add updated_at column + trigger
ALTER TABLE public.topic_teach_back_criteria
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

DROP TRIGGER IF EXISTS tr_topic_teach_back_criteria_updated_at ON public.topic_teach_back_criteria;
CREATE TRIGGER tr_topic_teach_back_criteria_updated_at
  BEFORE UPDATE ON public.topic_teach_back_criteria
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ═══════════════════════════════════════════════════════════════
-- 🟡 IMPORTANT FIX 5: Missing proof simulation index
-- ═══════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_readiness_snapshots_user_proof
  ON public.readiness_score_snapshots(user_id, computed_at DESC, is_proof_simulation);


-- ═══════════════════════════════════════════════════════════════
-- 🟠 CLEANUP: Deprecation comments on user_global_stats
-- ═══════════════════════════════════════════════════════════════

COMMENT ON COLUMN public.user_global_stats.churn_risk_score IS
  'DEPRECATED — use user_computed_signals.churn_risk_score. Do not write to this column.';

COMMENT ON COLUMN public.user_global_stats.score_velocity_7d IS
  'DEPRECATED — use user_computed_signals.score_velocity_7d. Do not write to this column.';

COMMENT ON COLUMN public.user_global_stats.churn_risk_updated_at IS
  'DEPRECATED — use user_computed_signals.churn_risk_updated_at.';

COMMENT ON COLUMN public.user_global_stats.score_velocity_updated_at IS
  'DEPRECATED — use user_computed_signals.score_velocity_updated_at.';
```

**STOP.** "Migration executed. Reply 'Proceed' for verification."

---

## PHASE 3: Verification

Run ALL in one batch:

```sql
-- ── RLS: 3 tables now have policies ──────────────────────────
SELECT tablename, policyname, cmd,
  CASE WHEN qual IS NOT NULL THEN 'has USING' ELSE 'no USING' END as using_clause,
  CASE WHEN with_check IS NOT NULL THEN 'has WITH CHECK' ELSE 'no WITH CHECK' END as check_clause
FROM pg_policies
WHERE tablename IN ('user_computed_signals', 'teach_back_submissions', 'topic_teach_back_criteria')
ORDER BY tablename, policyname;
-- Expected:
--   user_computed_signals:      1 SELECT policy
--   teach_back_submissions:     3 policies (SELECT, INSERT, UPDATE)
--   topic_teach_back_criteria:  1 SELECT policy (USING true)

-- ── RLS enabled on all 3 ─────────────────────────────────────
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('user_computed_signals', 'teach_back_submissions', 'topic_teach_back_criteria');
-- All should be true

-- ── Lucky guess trigger exists ────────────────────────────────
SELECT trigger_name, event_object_table, action_timing
FROM information_schema.triggers
WHERE trigger_name = 'trg_flag_lucky_guess';
-- Should return 1 row: trg_flag_lucky_guess | user_interactions | BEFORE

-- ── Lucky guess function exists ───────────────────────────────
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public' AND routine_name = 'flag_lucky_guess_on_insert';
-- Should return 1 row

-- ── user_mastery_history RLS uses (select auth.uid()) ─────────
SELECT policyname, qual, with_check FROM pg_policies
WHERE tablename = 'user_mastery_history';
-- Both should contain '(select auth.uid())'

-- ── updated_at triggers exist on all 3 tables ─────────────────
SELECT trigger_name, event_object_table FROM information_schema.triggers
WHERE trigger_name IN (
  'tr_computed_signals_updated_at',
  'tr_teach_back_submissions_updated_at',
  'tr_topic_teach_back_criteria_updated_at'
);
-- Should return 3 rows

-- ── updated_at columns exist on teach-back tables ─────────────
SELECT table_name, column_name FROM information_schema.columns
WHERE table_name IN ('teach_back_submissions', 'topic_teach_back_criteria')
AND column_name = 'updated_at';
-- Should return 2 rows

-- ── Proof simulation index exists ─────────────────────────────
SELECT indexname FROM pg_indexes
WHERE indexname = 'idx_readiness_snapshots_user_proof';
-- Should return 1 row

-- ── Deprecation comments applied ──────────────────────────────
SELECT a.attname, col_description(c.oid, a.attnum) as comment
FROM pg_class c JOIN pg_attribute a ON a.attrelid = c.oid
WHERE c.relname = 'user_global_stats'
AND a.attname IN ('churn_risk_score', 'score_velocity_7d');
-- Both should show 'DEPRECATED...'

-- ── Lucky guess trigger functional test ───────────────────────
-- Check: are there ANY user_interactions rows at all?
SELECT COUNT(*) as total,
  COUNT(*) FILTER (WHERE is_suspected_lucky_guess = true) as lucky_guesses
FROM user_interactions;
-- Note: existing rows will all be false (trigger only fires on NEW inserts)
-- The next quiz session completion will be the first real test
```

### App smoke test:
- [ ] Start and complete a Camp Mode quiz — no errors
- [ ] After completion, verify new `user_interactions` rows have `is_suspected_lucky_guess` evaluated (may still be `false` if no guessing conditions were met — that's correct)
- [ ] Verify `teach_back_submissions` is accessible via the Supabase client (SELECT for authenticated user returns empty array, not an RLS error)
- [ ] Verify `user_computed_signals` is readable by the authenticated user
- [ ] Dashboard loads without errors
- [ ] No console errors mentioning RLS or permission denied

### Then:
Run the **DATABASE_SCHEMA.sql sync prompt** to regenerate documentation.

**STOP.** "All fixes verified. Schema is clean."

---

## CHANGES MADE

| # | Issue | Severity | Fix |
|---|---|---|---|
| 1 | No RLS on `user_computed_signals` | 🔴 Critical | Enabled RLS + SELECT policy (user-scoped) |
| 2 | No RLS on `teach_back_submissions` | 🔴 Critical | Enabled RLS + SELECT/INSERT/UPDATE policies (user-scoped) |
| 3 | No RLS on `topic_teach_back_criteria` | 🔴 Critical | Enabled RLS + SELECT policy (all authenticated — this is content) |
| 4 | Lucky guess trigger missing | 🔴 Critical | Created `flag_lucky_guess_on_insert()` + `trg_flag_lucky_guess` |
| 5 | `user_mastery_history` bare `auth.uid()` | 🟡 Important | Dropped + recreated policies with `(select auth.uid())` |
| 6 | `user_computed_signals` updated_at trigger missing | 🟡 Important | Created `tr_computed_signals_updated_at` |
| 7 | `teach_back_submissions` missing updated_at | 🟡 Important | Added column + trigger |
| 8 | `topic_teach_back_criteria` missing updated_at | 🟡 Important | Added column + trigger |
| 9 | Proof simulation index missing | 🟡 Important | Created `idx_readiness_snapshots_user_proof` |
| 10 | Deprecated columns not commented | 🟠 Cleanup | Added COMMENT on 4 columns |

---

## WHAT NOT TO DO

- **Don't drop the deprecated columns** on `user_global_stats`. Just comment them. Drop in a future migration after all reads are migrated.
- **Don't add INSERT/UPDATE policies to `user_computed_signals`.** Only the service role Server Action writes to this table. No client-side writes.
- **Don't add INSERT/UPDATE policies to `topic_teach_back_criteria`.** SMEs populate this via admin tools or seed scripts, not client-side.
- **Don't guess the lucky guess column name.** Phase 1 query #7 tells you whether it's `is_suspected_lucky_guess` or `is_flagged`. Use the real name.
- **Don't guess RLS policy names for the DROP.** Phase 1 query #4 gives you the exact names. The migration includes multiple DROP variants to be safe, but verify.
- **Don't tune the lucky guess 40% threshold yet.** Let it run for 1 week with real quiz completions. Check the flag rate. Adjust only if >15% of correct answers are flagged.

---

*Execute Phase 1 now. Run the pre-flight queries.*
