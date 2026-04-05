# SlateCamp — Schema Hardening + Marketing Analytics Migration
## Close Every Data Gap Without Breaking the App

---

## ROLE

You are a Senior Database Engineer and Next.js Backend Architect. You write Supabase migrations that are idempotent (safe to run twice), preserve all existing data, and never break RLS policies or foreign key chains. You understand that SlateCamp is a LIVE product with real user data — every migration must be non-destructive.

---

## TASK

Execute two categories of schema changes:

**Category 1: Product Data Gaps** (from data science audit)
- Add `profiles` table (or extend existing user table)
- Add `user_mastery_history` table for progress-over-time tracking
- Add `updated_at` to `user_node_mastery`
- Add readiness score auto-snapshot trigger on session completion

**Category 2: Marketing Analytics Gaps** (from marketing audit)
- Add acquisition attribution columns (`signup_source`, `utm_campaign`, `utm_medium`, `referral_code`, `first_session_at`)
- Create `analytics_events` table for funnel tracking
- Document the 8 critical events the frontend must fire

After migrations: update `DATABASE_SCHEMA.sql` to reflect the full current schema.

---

## CONTEXT

### Current Schema Core Tables (verified)
```
disciplines, taxonomy_tree, questions, quiz_sessions, 
user_interactions, user_node_mastery, user_global_stats, 
readiness_score_snapshots, organizations, organization_members,
user_subscriptions
```

### Known Schema Details
- `quiz_sessions` has `config` JSONB, `test_mode`, `status` (with 'completed' value), `user_id`, `session_id`
- `user_interactions` has `time_spent_ms`, `answer_changes`, `options_eliminated`, `is_flagged`, `question_id`, `topic_id`
- `user_node_mastery` has `current_mastery_weight`, `total_correct`, `total_attempts`, `user_id`, `topic_id`
- `user_global_stats` has `global_readiness_score`, `target_exam_date`, `user_id`
- `questions` has IRT params: `difficulty`, `difficulty_rating`, `discrimination_rating`
- Auth uses Supabase Auth (`auth.users`)

### Tools You MUST Use
- **Supabase MCP** — Query schema before EVERY change. Never assume a table/column exists or doesn't exist.
- **File System** — Read `DATABASE_SCHEMA.sql` if it exists. Find the Supabase migrations directory.

---

## PHASE 1: Full Schema Audit (Read-Only)

Run ALL of these queries in a single Supabase MCP batch. Do not write any code until you have the results.

```sql
-- 1. All tables in public schema
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' ORDER BY table_name;

-- 2. Check if profiles table exists and its columns
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' ORDER BY ordinal_position;

-- 3. Check user_global_stats columns (where attribution might go)
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'user_global_stats' ORDER BY ordinal_position;

-- 4. Check user_node_mastery columns (need updated_at?)
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'user_node_mastery' ORDER BY ordinal_position;

-- 5. Check readiness_score_snapshots columns
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'readiness_score_snapshots' ORDER BY ordinal_position;

-- 6. Check existing triggers
SELECT trigger_name, event_object_table, action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public';

-- 7. Check existing functions
SELECT routine_name, routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' AND routine_type = 'FUNCTION';

-- 8. Check existing RLS policies on tables we'll touch
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('user_global_stats', 'user_node_mastery', 'readiness_score_snapshots');

-- 9. Check if analytics_events already exists
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'analytics_events' ORDER BY ordinal_position;

-- 10. Check if user_mastery_history already exists
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'user_mastery_history' ORDER BY ordinal_position;

-- 11. Sample quiz_sessions.config to document JSONB shape
SELECT session_id, test_mode, config, status FROM quiz_sessions LIMIT 5;
```

Also read:
```bash
# Find existing migration files
find supabase/migrations -type f -name "*.sql" 2>/dev/null | sort
# Or find any schema file
find . -name "DATABASE_SCHEMA*" -o -name "schema*" | grep -i sql | head -10
```

**Output:** A table showing what EXISTS vs what NEEDS TO BE CREATED. Map every column that's already there so we don't duplicate anything.

**STOP.** "Phase 1 Complete. Here's what exists and what's missing. Reply 'Proceed' to run the migration."

---

## PHASE 2: Write and Execute the Migration

Create ONE migration file. Every statement must be guarded with `IF NOT EXISTS` or preceded by an existence check. The migration must be safe to run multiple times.

### File: `supabase/migrations/YYYYMMDDHHMMSS_schema_hardening_and_marketing.sql`

Use the ACTUAL timestamp when creating the file.

**The migration script (ADAPT based on Phase 1 findings):**

```sql
-- ============================================================
-- SlateCamp Schema Hardening + Marketing Analytics
-- Safe to run multiple times (all statements are idempotent)
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 0. UTILITY: Reusable updated_at trigger function
-- ────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ────────────────────────────────────────────────────────────
-- 1. PROFILES TABLE (if it doesn't exist)
-- ────────────────────────────────────────────────────────────

-- ADAPT: If Phase 1 shows profiles already exists, skip CREATE
-- and only ALTER to add missing columns.

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  display_name TEXT,
  avatar_url TEXT,
  user_type TEXT DEFAULT 'reviewee'
    CHECK (user_type IN ('undergrad', 'reviewee', 'professional', 'instructor')),
  discipline_id UUID,  -- ADAPT: add FK if disciplines table has discipline_id
  target_exam_date DATE,
  school_or_institution TEXT,
  onboarding_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- updated_at trigger
DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_select_own') THEN
    CREATE POLICY profiles_select_own ON public.profiles FOR SELECT USING (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_update_own') THEN
    CREATE POLICY profiles_update_own ON public.profiles FOR UPDATE USING (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_insert_own') THEN
    CREATE POLICY profiles_insert_own ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
  END IF;
END $$;


-- ────────────────────────────────────────────────────────────
-- 2. MARKETING ATTRIBUTION on user_global_stats
-- ────────────────────────────────────────────────────────────

ALTER TABLE public.user_global_stats
  ADD COLUMN IF NOT EXISTS signup_source TEXT,
  ADD COLUMN IF NOT EXISTS utm_campaign TEXT,
  ADD COLUMN IF NOT EXISTS utm_medium TEXT,
  ADD COLUMN IF NOT EXISTS utm_content TEXT,
  ADD COLUMN IF NOT EXISTS referral_code TEXT,
  ADD COLUMN IF NOT EXISTS first_session_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;


-- ────────────────────────────────────────────────────────────
-- 3. ANALYTICS EVENTS TABLE
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_name TEXT NOT NULL,
  event_properties JSONB DEFAULT '{}',
  page_path TEXT,
  session_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_analytics_events_name_time
  ON public.analytics_events(event_name, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user
  ON public.analytics_events(user_id, created_at DESC);

-- RLS
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'analytics_events' AND policyname = 'analytics_events_insert_own') THEN
    CREATE POLICY analytics_events_insert_own ON public.analytics_events FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'analytics_events' AND policyname = 'analytics_events_select_own') THEN
    CREATE POLICY analytics_events_select_own ON public.analytics_events FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;


-- ────────────────────────────────────────────────────────────
-- 4. MASTERY HISTORY TABLE
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.user_mastery_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL,
  mastery_weight NUMERIC(5,4) NOT NULL,
  total_correct INTEGER NOT NULL DEFAULT 0,
  total_attempts INTEGER NOT NULL DEFAULT 0,
  session_id UUID,  -- ADAPT: add FK to quiz_sessions if column name matches
  snapshot_reason TEXT DEFAULT 'session_complete'
    CHECK (snapshot_reason IN ('session_complete', 'daily_snapshot', 'manual')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mastery_history_user_topic
  ON public.user_mastery_history(user_id, topic_id, created_at DESC);

-- RLS
ALTER TABLE public.user_mastery_history ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_mastery_history' AND policyname = 'mastery_history_select_own') THEN
    CREATE POLICY mastery_history_select_own ON public.user_mastery_history FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;


-- ────────────────────────────────────────────────────────────
-- 5. UPDATED_AT ON user_node_mastery
-- ────────────────────────────────────────────────────────────

ALTER TABLE public.user_node_mastery
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

DROP TRIGGER IF EXISTS user_node_mastery_updated_at ON public.user_node_mastery;
CREATE TRIGGER user_node_mastery_updated_at
  BEFORE UPDATE ON public.user_node_mastery
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ────────────────────────────────────────────────────────────
-- 6. READINESS SCORE AUTO-SNAPSHOT TRIGGER
-- ────────────────────────────────────────────────────────────

-- ADAPT: The INSERT column names MUST match the actual
-- readiness_score_snapshots schema found in Phase 1.
-- The below is a template — replace column names as needed.

CREATE OR REPLACE FUNCTION public.snapshot_readiness_on_session_complete()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    INSERT INTO public.readiness_score_snapshots (
      user_id,
      score,          -- ADAPT: actual column name for the score value
      created_at
      -- ADAPT: add session_id column if it exists in the table
    )
    SELECT
      NEW.user_id,
      ugs.global_readiness_score,
      NOW()
    FROM public.user_global_stats ugs
    WHERE ugs.user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_snapshot_readiness ON public.quiz_sessions;
CREATE TRIGGER trg_snapshot_readiness
  AFTER UPDATE ON public.quiz_sessions
  FOR EACH ROW EXECUTE FUNCTION public.snapshot_readiness_on_session_complete();


-- ────────────────────────────────────────────────────────────
-- 7. MASTERY HISTORY AUTO-LOG ON MASTERY UPDATE
-- ────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.log_mastery_history_on_update()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_mastery_history (
    user_id, topic_id, mastery_weight, total_correct, total_attempts, snapshot_reason
  ) VALUES (
    NEW.user_id,
    NEW.topic_id,
    NEW.current_mastery_weight,
    NEW.total_correct,
    NEW.total_attempts,
    'session_complete'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_log_mastery_history ON public.user_node_mastery;
CREATE TRIGGER trg_log_mastery_history
  AFTER UPDATE ON public.user_node_mastery
  FOR EACH ROW EXECUTE FUNCTION public.log_mastery_history_on_update();
```

**CRITICAL: Before running this migration, ADAPT every line marked with `-- ADAPT` based on Phase 1 findings.** If a table already exists, don't CREATE it — ALTER it. If column names differ from what's written here, use the REAL names.

**STOP.** "Phase 2 Complete. Migration executed. Reply 'Proceed' to build the frontend analytics helper."

---

## PHASE 3: Frontend Analytics Event Helper

Create a lightweight utility for firing analytics events from the frontend.

### File: `src/lib/analytics.ts`

```typescript
import { createClient } from '@/lib/supabase/client' // ADAPT: use your actual supabase client import

type AnalyticsEvent = {
  event_name: string
  event_properties?: Record<string, unknown>
  page_path?: string
  session_id?: string
}

export async function trackEvent({ event_name, event_properties = {}, page_path, session_id }: AnalyticsEvent) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('analytics_events').insert({
      user_id: user.id,
      event_name,
      event_properties,
      page_path: page_path || (typeof window !== 'undefined' ? window.location.pathname : null),
      session_id: session_id || null,
    })
  } catch (e) {
    // Silent fail — analytics should never break the app
    console.warn('[analytics]', e)
  }
}
```

**ADAPT:** Find the actual Supabase client import path by running:
```bash
grep -rn "createClient\|createBrowserClient\|supabaseBrowser" src/lib/ --include="*.ts" | head -5
```

### The 8 Events to Wire Up

| Event | Where to Fire | Properties |
|---|---|---|
| `signup_completed` | After auth signup callback | `{ source, utm_campaign, utm_medium }` |
| `onboarding_step_completed` | Each onboarding step (if exists) | `{ step_number, step_name }` |
| `first_quiz_started` | On first-ever quiz session start | `{ test_mode, topic }` |
| `quiz_session_started` | Every session start | `{ test_mode, question_count, topic }` |
| `quiz_session_completed` | Every session completion | `{ test_mode, score, duration_ms }` |
| `quiz_session_abandoned` | On session abandoned/exited early | `{ test_mode, questions_answered, total_questions }` |
| `readiness_score_viewed` | Analytics page load | `{ current_score }` |
| `upgrade_page_viewed` | Pricing/upgrade page load | `{}` |

**Wire these into the EXISTING code.** Find the exact locations:
```bash
# Find where sessions are created
grep -rn "quiz_sessions.*insert\|createSession\|startSession\|startQuiz" src/ --include="*.ts" --include="*.tsx" | head -10

# Find where sessions complete
grep -rn "status.*completed\|completeSession\|finishQuiz\|submitSession" src/ --include="*.ts" --include="*.tsx" | head -10

# Find signup/auth callback
grep -rn "signUp\|sign_up\|auth.*callback\|onAuthStateChange" src/ --include="*.ts" --include="*.tsx" | head -10

# Find pricing/upgrade page
find src/ -path "*pricing*" -o -path "*upgrade*" -o -path "*subscription*" | head -5
```

Add `trackEvent()` calls at each location. These are ONE-LINE additions — do not restructure any existing code.

**For `first_session_at` on `user_global_stats`:** When `quiz_session_started` fires, check if `first_session_at` is null. If so, update it:
```typescript
// Inside the session start handler (after the session is created)
const { data: stats } = await supabase
  .from('user_global_stats')
  .select('first_session_at')
  .eq('user_id', user.id)
  .single()

if (stats && !stats.first_session_at) {
  await supabase
    .from('user_global_stats')
    .update({ first_session_at: new Date().toISOString() })
    .eq('user_id', user.id)
}
```

**For UTM capture on signup:** Find the signup page/handler and capture UTM params from the URL:
```typescript
// On the signup page or auth callback
const params = new URLSearchParams(window.location.search)
const attribution = {
  signup_source: params.get('source') || params.get('utm_source') || 'direct',
  utm_campaign: params.get('utm_campaign') || null,
  utm_medium: params.get('utm_medium') || null,
  utm_content: params.get('utm_content') || null,
}
// Store in user_global_stats after account creation
```

**STOP.** "Phase 3 Complete. Analytics helper created, events wired. Reply 'Proceed' to update documentation."

---

## PHASE 4: Update DATABASE_SCHEMA.sql

Find and update the schema documentation file:
```bash
find . -name "DATABASE_SCHEMA*" -o -name "schema*" | grep -vi node_modules | head -10
```

Add complete documentation for every new table and column. Include:
- Table name, purpose, all columns with types
- RLS policies
- Triggers
- The `analytics_events` event dictionary (the 8 events with their properties)
- The `config` JSONB shape documentation (from the sample you queried in Phase 1)

**STOP.** "Phase 4 Complete. Schema documented."

---

## PHASE 5: Verification

Run these verification queries:

```sql
-- Verify all new tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'analytics_events', 'user_mastery_history')
ORDER BY table_name;

-- Verify new columns on user_global_stats
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'user_global_stats' 
AND column_name IN ('signup_source', 'utm_campaign', 'utm_medium', 'first_session_at', 'onboarding_completed_at');

-- Verify updated_at on user_node_mastery
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'user_node_mastery' AND column_name = 'updated_at';

-- Verify triggers
SELECT trigger_name, event_object_table FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
AND trigger_name IN ('trg_snapshot_readiness', 'trg_log_mastery_history', 'profiles_updated_at', 'user_node_mastery_updated_at');

-- Verify RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'analytics_events', 'user_mastery_history');

-- Verify analytics helper works (insert a test event, then delete it)
-- ONLY do this if you can authenticate as a test user
```

Also verify the app still works:
- [ ] Dashboard loads without errors
- [ ] Testing page loads without errors  
- [ ] Starting a quiz session works
- [ ] Completing a quiz session works
- [ ] No TypeScript errors (`npm run build` or `npx tsc --noEmit`)
- [ ] No console errors on any page

**STOP.** "Phase 5 Complete. Schema hardened, analytics wired, app verified."

---

## WHAT NOT TO DO

- **Don't DROP any existing tables or columns.** This is additive only.
- **Don't modify existing RLS policies.** Only add new ones for new tables.
- **Don't change existing trigger behavior.** Only add new triggers.
- **Don't restructure any existing components.** The `trackEvent()` calls are ONE-LINE additions.
- **Don't make analytics blocking.** The `trackEvent()` function uses `try/catch` and fails silently. A broken analytics call must NEVER break the user's quiz experience.
- **Don't commit test data.** If you insert test analytics events for verification, delete them.
- **Don't forget to ADAPT.** Every column name, FK reference, and table structure must match what Phase 1 actually found in the database. The SQL in this prompt is a TEMPLATE, not copy-paste.

---

*Execute Phase 1 now. Query the full schema before writing a single line of SQL.*
