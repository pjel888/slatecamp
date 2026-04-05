# SlateCamp — Schema Gap Analysis vs. UX Strategy
**Prepared by:** Database Architect  
**Date:** 2026-03-19  
**Sources:** UX Research & Strategic Implementation Plan v1.0 · Implementation Prompt v1.0 · DATABASE_SCHEMA.sql (live, 2026-03-19)  
**Governing Question:** Does this make a student more likely to win their Licensure Exam?

---

## Executive Summary

The current schema is architecturally sound but materially incomplete relative to what the UX Strategy requires to ship. Six features that directly block monetization and retention have **zero schema support**. Twelve additional gaps will block specific UX flows if not addressed before implementation begins.

The UX Strategy identifies four operational blockers preventing any revenue today:

1. `feature_flags` table is empty — paywall cannot fire
2. `score_reveal_shown_at` is missing — shown-once mechanic cannot be enforced
3. `free_questions_today` is missing — daily cap has no enforcement column
4. `analytics_events` has 0 rows — zero funnel visibility

Items 2 and 3 require schema migrations. Items 1 and 4 require data population and application instrumentation respectively.

This report documents every schema gap, categorized by severity, with exact SQL for each fix.

---

## Gap Severity Legend

| Symbol | Meaning |
|---|---|
| 🔴 **Critical** | Blocks Sprint 1 monetization or core loop. Cannot ship without it. |
| 🟡 **Important** | Blocks a specific designed feature or UX flow in Sprint 2. |
| 🟠 **Planned** | Sprint 3 / Phase 2. Schema should be designed now, built later. |
| ✅ **Present** | Already in schema — documented here for completeness. |

---

## SECTION 1 — Sprint 1 Blockers (Monetization & Core Loop)

These six gaps directly block revenue. They must be resolved before any marketing spend or user acquisition.

---

### 1.1 🔴 `score_reveal_shown_at` — Missing

**What the UX Strategy requires:**  
The Score Reveal is described as "THE MOST IMPORTANT SCREEN." It must show exactly once for free users — the moment they see their score for the first time is the emotional peak that drives conversion. After they've seen it, the score locks and the Pro paywall pitch becomes: *"Your score has updated N times since your diagnostic. Upgrade to see it live."*

Without `score_reveal_shown_at`, the application cannot enforce the shown-once mechanic. A free user could refresh the page and re-trigger the reveal indefinitely, destroying the scarcity that drives the paywall conversion.

The implementation prompt explicitly references:
```typescript
const { canView, shownAt } = await checkScoreRevealAccess(userId)
if (!canView) redirect('/dashboard')  // enforced by this column
if (userTier === 'free') await markScoreRevealed(userId)
```

**Where it should live:** `user_global_stats`

**Fix:**
```sql
-- Migration: add_score_reveal_shown_at.sql
ALTER TABLE public.user_global_stats
  ADD COLUMN IF NOT EXISTS score_reveal_shown_at TIMESTAMPTZ;

COMMENT ON COLUMN public.user_global_stats.score_reveal_shown_at IS
  'Set when free user views their Score Reveal for the first time. NULL = not yet seen. Used to enforce shown-once mechanic and power the locked score widget copy.';
```

**Paywall copy this enables:**  
`"Your score has updated N times since your diagnostic."` — where N = count of `readiness_score_snapshots` rows after `score_reveal_shown_at`. This specific-loss framing is documented to outperform generic feature lists by 2–3× in A/B tests.

---

### 1.2 🔴 `free_questions_today` + `free_cap_reset_date` — Missing

**What the UX Strategy requires:**  
The paywall comparison table explicitly lists "20 Q/day" for free vs. "Unlimited" for Pro. The implementation prompt references this as: *"Free tier daily cap (20 questions/day) has no enforcement column."*

Without these columns, the daily cap is aspirational — any free user can answer unlimited questions. This removes the primary usage friction that drives Pro conversion and makes the paywall comparison table dishonest.

**Where it should live:** `user_subscriptions` (it's billing-tier behavior, scoped to the subscription record)

**Fix:**
```sql
-- Migration: add_free_tier_cap_columns.sql
ALTER TABLE public.user_subscriptions
  ADD COLUMN IF NOT EXISTS free_questions_today INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS free_cap_reset_date  DATE;

COMMENT ON COLUMN public.user_subscriptions.free_questions_today IS
  'Counter of questions answered today. Reset daily. Only enforced when tier = free.';
COMMENT ON COLUMN public.user_subscriptions.free_cap_reset_date IS
  'Date of last reset. If today > free_cap_reset_date, reset free_questions_today = 0 on next request.';
```

**Application logic (Server Action):**
```typescript
// checkDailyCap(userId): called before every question load for free users
// if free_cap_reset_date < today → reset free_questions_today = 0, update reset_date
// if free_questions_today >= 20 → return { blocked: true, softwall: true }
// otherwise → increment free_questions_today
```

---

### 1.3 🔴 SRS Columns on `user_node_mastery` — Missing

**What the UX Strategy requires:**  
The product state table explicitly flags: *"SRS algorithm not implemented — surfacing by difficulty, not interval."* Spaced Repetition is listed with effect size d=0.46–0.80, and the SM-2 algorithm is named as the target implementation. Sprint 2 roadmap item: *"SRS scheduling columns + SM-2 algorithm."*

The SRS dashboard widget ("12 items due for review today · ~15 min") requires knowing which nodes are *due* for review. Without `next_review_at`, the system cannot schedule items — it can only surface items by mastery weight, which is a fundamentally different (and less effective) approach.

**Where it should live:** `user_node_mastery` (one row per user×topic — exactly where SRS state belongs)

**Fix:**
```sql
-- Migration: add_srs_columns_to_node_mastery.sql
ALTER TABLE public.user_node_mastery
  ADD COLUMN IF NOT EXISTS next_review_at       TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS review_interval_days  INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS ease_factor           NUMERIC NOT NULL DEFAULT 2.50,
  ADD COLUMN IF NOT EXISTS review_count          INTEGER NOT NULL DEFAULT 0;

-- Index for SRS dashboard widget query:
-- "Give me this user's nodes where next_review_at <= now()"
CREATE INDEX IF NOT EXISTS idx_node_mastery_user_review
  ON public.user_node_mastery (user_id, next_review_at)
  WHERE next_review_at IS NOT NULL;

COMMENT ON COLUMN public.user_node_mastery.next_review_at IS
  'SM-2: When this node is next due for spaced review. NULL = not yet scheduled.';
COMMENT ON COLUMN public.user_node_mastery.review_interval_days IS
  'SM-2: Current inter-review interval in days. Starts at 1, grows per algorithm.';
COMMENT ON COLUMN public.user_node_mastery.ease_factor IS
  'SM-2: Ease factor (EF). Default 2.50. Decreases when answer is incorrect. Min 1.30.';
COMMENT ON COLUMN public.user_node_mastery.review_count IS
  'SM-2: Total number of successful reviews. Used to determine interval growth.';
```

**SM-2 update logic (called after each interaction):**
```
if is_correct AND time_spent < lucky_guess_threshold:
  EF = EF + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
  interval = interval * EF
  next_review_at = now() + interval days
else:
  interval = 1
  next_review_at = now() + 1 day
```

---

### 1.4 🔴 Endurance Cycle — Zero Schema

**What the UX Strategy requires:**  
The Endurance Cycle is explicitly flagged as *"🔴 No Schema — Cannot Build."* It is also the gate that blocks Proof Simulation (*"Mostly Ready — Blocked by Endurance Schema"*). The Proof Simulation gate requires: *"Endurance window must cover ≥80% of exam duration."*

The Endurance Cycle tracks cognitive stamina — how many questions a student can answer before accuracy degrades. It requires:
1. A baseline calibration (week 1: observe natural session length and decay curve)
2. Progressive weekly extension (endurance sessions push 10–15% beyond reliable window)
3. Accuracy-by-block tracking (accuracy in 10-item blocks — requires `question_order` which now exists ✅)
4. Pacing Gauge integration (avg seconds/question vs. ALE required 96 sec/question)

**New table recommended over columns on `user_global_stats` to avoid further God Table growth:**

```sql
-- Migration: create_user_endurance_profile.sql
CREATE TABLE public.user_endurance_profiles (
  user_id                     UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Baseline calibration (established in first 7 days)
  baseline_reliable_items     INTEGER,        -- items before accuracy drops below 70%
  baseline_accuracy_decay_at  INTEGER,        -- question number where decay starts
  baseline_avg_accuracy       DOUBLE PRECISION,
  baseline_calibrated_at      TIMESTAMPTZ,

  -- Current endurance state
  current_endurance_target    INTEGER,        -- target item count for next endurance session
  endurance_window_minutes    DOUBLE PRECISION, -- current reliable duration in minutes
  endurance_sessions_completed INTEGER NOT NULL DEFAULT 0,

  -- Pacing Gauge
  avg_seconds_per_question    DOUBLE PRECISION, -- rolling average across all sessions
  pacing_target_seconds       DOUBLE PRECISION NOT NULL DEFAULT 96, -- ALE standard: 96 sec/Q
  pacing_updated_at           TIMESTAMPTZ,

  -- Plateau detection
  consecutive_plateau_weeks   INTEGER NOT NULL DEFAULT 0,
  last_endurance_session_at   TIMESTAMPTZ,

  -- Proof Simulation gate (computed by trigger or Server Action)
  endurance_gate_pct          DOUBLE PRECISION GENERATED ALWAYS AS
    (CASE WHEN pacing_target_seconds > 0
          THEN LEAST(endurance_window_minutes / (pacing_target_seconds * baseline_reliable_items / 60.0), 1.0)
          ELSE 0 END) STORED,  -- endurance window / exam duration

  computed_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_endurance_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own endurance profile"
  ON public.user_endurance_profiles FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

-- Server-side writes only (no INSERT policy — written via service role / trigger)

CREATE TRIGGER tr_endurance_profiles_updated_at
  BEFORE UPDATE ON public.user_endurance_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_endurance_profiles_pacing
  ON public.user_endurance_profiles (user_id, avg_seconds_per_question);
```

**Additionally, tag endurance sessions on `quiz_sessions`:**
```sql
ALTER TABLE public.quiz_sessions
  ADD COLUMN IF NOT EXISTS is_endurance_session BOOLEAN NOT NULL DEFAULT false;
```

**Why a generated column for `endurance_gate_pct`:** The Proof Simulation locked state must show two live progress bars. Computing this inline in every dashboard render requires a join + division. Storing it as a generated column means the dashboard query is a simple read.

---

### 1.5 🔴 Study Streak Columns — Missing

**What the UX Strategy requires:**  
Study Streak ("Trail Streak") is Priority 1 in the gamification strategy, described as the most powerful retention driver. The retention stack shows streaks driving 3.6× retention at 7-day milestone (Duolingo benchmark). The implementation prompt explicitly provides the SQL:

> `ALTER TABLE user_trail_enrollments ADD COLUMN current_streak INTEGER DEFAULT 0, longest_streak INTEGER DEFAULT 0, grace_days_used_this_week INTEGER DEFAULT 0;`

The Grace Day mechanic (one free day per week, additional grace days are a Pro benefit) requires tracking how many grace days have been used in the current week.

**Where it should live:** `user_trail_enrollments` for enrollment-level streak; `user_global_stats` for cross-enrollment global streak.

**Fix:**
```sql
-- Migration: add_streak_columns.sql

-- Enrollment-level streak (per active trail)
ALTER TABLE public.user_trail_enrollments
  ADD COLUMN IF NOT EXISTS current_streak            INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS longest_streak            INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS grace_days_used_this_week INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS streak_grace_week_start   DATE;
  -- streak_grace_week_start: Monday of current week for grace day counter reset

-- Global streak across all activity (for dashboard widget)
ALTER TABLE public.user_global_stats
  ADD COLUMN IF NOT EXISTS global_current_streak     INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS global_longest_streak     INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_active_date          DATE;
  -- last_active_date: used to detect missed days and increment/reset streak

COMMENT ON COLUMN public.user_trail_enrollments.grace_days_used_this_week IS
  'Resets every Monday. Free tier: max 1 grace day/week. Pro: max 2 grace days/week.';
```

---

### 1.6 🔴 Pre-Assessment Anonymous Session — Architectural Gap

**What the UX Strategy requires:**  
*"Let users answer 5–10 diagnostic questions before account gate."* The research note: *"Duolingo A/B tested delayed sign-up vs. front-loaded — delayed always wins."*

**The problem:** `quiz_sessions.user_id` is `NOT NULL REFERENCES auth.users(id)`. An unauthenticated user cannot have a quiz session in the current schema.

**Options:**

Option A — Make `user_id` nullable on `quiz_sessions` for pre-auth sessions:
```sql
-- Risky: requires updating all RLS policies that assume user_id NOT NULL
```

Option B — Dedicated lightweight table for pre-auth diagnostic state (recommended):
```sql
-- Migration: create_anon_diagnostic_sessions.sql
CREATE TABLE public.anon_diagnostic_sessions (
  anon_session_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  browser_session_id TEXT NOT NULL,             -- stored in client cookie/localStorage
  question_ids      UUID[] NOT NULL DEFAULT '{}',
  answers           JSONB NOT NULL DEFAULT '{}', -- { question_id: selected_option_id }
  questions_answered INTEGER NOT NULL DEFAULT 0,
  started_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at        TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '2 hours'),
  converted_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
  -- converted_user_id: set when user creates account, links session to real user
);

-- No RLS needed — this table is server-read only via service role
-- Browser session cookie matches anon_session_id, not accessible to other users

CREATE INDEX idx_anon_diagnostic_browser ON public.anon_diagnostic_sessions(browser_session_id);
CREATE INDEX idx_anon_diagnostic_expires ON public.anon_diagnostic_sessions(expires_at);
-- Schedule nightly cleanup: DELETE WHERE expires_at < now() AND converted_user_id IS NULL
```

On account creation: migrate answers from `anon_diagnostic_sessions` into a real `quiz_sessions` row and mark `converted_user_id`. The 5-question investment carries over — the student's "progress" is preserved.

---

## SECTION 2 — Sprint 2 Schema Gaps (Engagement & Retention)

These gaps block specific features in the second sprint. Schema can be designed now, applied before Sprint 2 build begins.

---

### 2.1 🟡 `is_retaker` — Missing from Onboarding State

**What the UX Strategy requires:**  
The onboarding flow asks: *"Have you taken the ALE before?"* This single answer dramatically changes the entire onboarding tone. Retaker path has different copy, different trail recommendation, different score reveal framing. *"Never reference the failure directly in any UI copy."*

The current schema has `exam_attempt_number INTEGER DEFAULT 1` on `user_global_stats` — this is close but semantically different. `exam_attempt_number = 1` is ambiguous: is this their first attempt or are they about to take it for the first time?

**Fix:**
```sql
ALTER TABLE public.user_global_stats
  ADD COLUMN IF NOT EXISTS is_retaker BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS onboarding_retaker_framing_shown BOOLEAN NOT NULL DEFAULT false;
  -- onboarding_retaker_framing_shown: ensures retaker path fires once

COMMENT ON COLUMN public.user_global_stats.is_retaker IS
  'Set during onboarding: "Have you taken the ALE before?" = true. Activates retaker framing throughout the product.';
```

---

### 2.2 🟡 Onboarding Dropout Recovery State — Incomplete

**What the UX Strategy requires:**  
The error/dropout paths table defines multiple recovery states, each requiring a different dashboard CTA:

| Dropout Point | Signal Needed |
|---|---|
| Left mid-assessment (q5–25) | `assessment_completed_at IS NULL AND quiz_sessions WHERE is_assessment=true AND status='in_progress'` |
| Completed assessment, didn't see Score Reveal | `assessment_completed_at IS NOT NULL AND score_reveal_shown_at IS NULL` |
| Saw Score Reveal, didn't enroll in trail | `score_reveal_shown_at IS NOT NULL AND user_trail_enrollments = 0 rows` |
| Enrolled in trail, not started Day 1 | `enrollment exists AND user_trail_progress = 0 rows` |

Most of these states can be derived from existing data — except one:

**What's missing:**
```sql
-- The "assessment started but not completed" state requires knowing when the
-- assessment quiz was started, not just when it completed.
ALTER TABLE public.user_global_stats
  ADD COLUMN IF NOT EXISTS assessment_started_at TIMESTAMPTZ;
  -- Set when assessment quiz_session is created with is_assessment questions
  -- Used for: "Your score is 60% complete. Pick up where you left off."
```

---

### 2.3 🟡 Metacognitive Calibration Score — Missing Storage

**What the UX Strategy requires:**  
*"A separate Calibration Score alongside the Readiness Score. Shows how accurately the student predicts their own performance."* This is listed as P2 gamification with effect size d=0.35–0.55.

The `pre_session_confidence_ratings JSONB` already exists on `quiz_sessions` ✅ — this captures the raw input. What's missing is the computed calibration score and its storage.

**Fix — add to `user_computed_signals`:**
```sql
ALTER TABLE public.user_computed_signals
  ADD COLUMN IF NOT EXISTS calibration_score        DOUBLE PRECISION,  -- 0–1, 1 = perfectly calibrated
  ADD COLUMN IF NOT EXISTS calibration_updated_at   TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS calibration_sessions_count INTEGER NOT NULL DEFAULT 0;
  -- calibration_sessions_count: need ≥5 sessions before showing calibration chart

COMMENT ON COLUMN public.user_computed_signals.calibration_score IS
  'Metacognitive calibration: how accurately user predicts their own per-subject accuracy.
   Computed from pre_session_confidence_ratings vs actual accuracy per session.
   NULL until 5+ sessions with confidence ratings completed.';
```

---

### 2.4 🟡 Push Notification System — No Schema

**What the UX Strategy requires:**  
A comprehensive, channel-protected push notification system with strict rules: max 1 push/day, only during `preferred_study_window`, 7 defined trigger types. The strategy explicitly cites Duolingo's insight: *"over-sending permanently damages opt-in health."*

Currently there is no schema to store:
- Device push tokens (FCM/APNs)
- Notification send log (to enforce 1/day limit)
- Opt-in status per channel

**Fix:**
```sql
-- Migration: create_notification_schema.sql

-- Push tokens (one row per device per user)
CREATE TABLE public.user_push_tokens (
  token_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token       TEXT NOT NULL UNIQUE,
  platform    TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_push_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own push tokens"
  ON public.user_push_tokens FOR ALL TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE INDEX idx_push_tokens_user ON public.user_push_tokens(user_id) WHERE is_active = true;

-- Notification send log (enforces 1/day rule, prevents repeat sends)
CREATE TABLE public.notification_log (
  log_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN (
    'trail_day_available', 'assessment_score_ready', 'streak_at_risk',
    'srs_review_due', 'blindspot_triggered', 'proof_simulation_unlocked',
    'milestone_reached'
  )),
  channel      TEXT NOT NULL CHECK (channel IN ('push', 'email', 'in_app')),
  sent_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  delivery_status TEXT DEFAULT 'sent'
);

ALTER TABLE public.notification_log ENABLE ROW LEVEL SECURITY;
-- No user-facing read policy — server-side only
-- Admin read for delivery analytics:
CREATE POLICY "Admins can read notification log"
  ON public.notification_log FOR SELECT TO authenticated
  USING ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE INDEX idx_notif_log_user_day ON public.notification_log(user_id, sent_at DESC);
-- Used for: "has this user received any push today?"
CREATE INDEX idx_notif_log_trigger ON public.notification_log(trigger_type, sent_at DESC);

CREATE TRIGGER tr_push_tokens_updated_at
  BEFORE UPDATE ON public.user_push_tokens
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

### 2.5 🟡 Wiki Article Read Tracking — Missing

**What the UX Strategy requires:**  
Camp Trail steps of type `wiki` are marked complete when the user reaches the end of the article (*"or via explicit 'Mark as Read' button for those who skim"*). Step completion writes to `user_trail_progress` — but that table only records that a step was completed, not that a specific wiki article was read.

The deeper issue: the note temporal resurface feature (*"A note written in second year resurfaces at the right moment during board review"*) and the end-of-article CTA (*"Test what you just read: 5 questions on this topic"*) both require knowing when a user last read each article.

**Fix:**
```sql
-- Migration: create_wiki_read_log.sql
CREATE TABLE public.wiki_article_reads (
  read_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  article_id  UUID NOT NULL REFERENCES public.wiki_articles(article_id),
  read_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_pct    SMALLINT NOT NULL DEFAULT 0 CHECK (read_pct BETWEEN 0 AND 100),
  -- read_pct: scroll depth at session end. 100 = fully read.
  time_spent_ms INTEGER,
  trail_step_id UUID REFERENCES public.trail_steps(step_id) ON DELETE SET NULL
  -- trail_step_id: if read as part of a trail step, link it
);

ALTER TABLE public.wiki_article_reads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own reads"
  ON public.wiki_article_reads FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can select own reads"
  ON public.wiki_article_reads FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE INDEX idx_wiki_reads_user_article ON public.wiki_article_reads(user_id, article_id, read_at DESC);
CREATE INDEX idx_wiki_reads_user_recent ON public.wiki_article_reads(user_id, read_at DESC);
```

---

### 2.6 🟡 Trail Milestone Tracking — Missing

**What the UX Strategy requires:**  
Fresh Start Effect milestones at Day 7, Day 14, Day 28 (*"+33–50% motivation at temporal landmarks"*). The Day Complete screen at milestone days shows a special acknowledgment: *"Week 2 complete. 14 sessions. Score: 48% → 57%."*

The data for this exists across tables, but there's no flag to track whether a milestone acknowledgment has already been shown (preventing repeat milestone triggers).

**Fix:**
```sql
ALTER TABLE public.user_trail_enrollments
  ADD COLUMN IF NOT EXISTS milestones_shown JSONB NOT NULL DEFAULT '[]'::jsonb;
  -- Array of day numbers for which milestone screen has been shown.
  -- e.g. [7, 14] means weeks 1 and 2 milestones have fired.

COMMENT ON COLUMN public.user_trail_enrollments.milestones_shown IS
  'Tracks which trail day milestones have been surfaced to the user.
   Prevents repeat milestone screens. Milestone days: 7, 14, 28, 56.';
```

---

## SECTION 3 — Sprint 3 / Phase 2 Schema (Design Now, Build Later)

These items should be designed into the schema now to avoid future migration pain, even if the application code ships later.

---

### 3.1 🟠 Elaborative Interrogation Prompts — No Schema

**What the UX Strategy requires:**  
*"At a strategically placed point, the article pauses. A 'Why?' prompt appears before the article reveals the rationale and continues."* The implementation prompt specifies parsing `[EI_PROMPT]...[/EI_PROMPT]` tags from wiki content — but storing EI prompts in the article body text is a maintenance nightmare and makes them untrackable.

A dedicated table is cleaner and enables analytics on which EI prompts drive the most engagement.

```sql
-- Migration: create_elaborative_interrogation_schema.sql
CREATE TABLE public.wiki_ei_prompts (
  prompt_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id   UUID NOT NULL REFERENCES public.wiki_articles(article_id) ON DELETE CASCADE,
  node_id      UUID REFERENCES public.taxonomy_tree(node_id),
  insert_after_heading TEXT NOT NULL,  -- heading text after which prompt appears
  prompt_text  TEXT NOT NULL,          -- the "Why?" question
  reveal_text  TEXT NOT NULL,          -- the answer revealed after student responds
  options      JSONB DEFAULT '[]',     -- optional: 3 MC options instead of free text
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.wiki_ei_prompts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read EI prompts"
  ON public.wiki_ei_prompts FOR SELECT TO authenticated USING (true);

-- Track student responses to EI prompts
CREATE TABLE public.wiki_ei_responses (
  response_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt_id    UUID NOT NULL REFERENCES public.wiki_ei_prompts(prompt_id),
  response_text TEXT,
  selected_option_index SMALLINT,
  responded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.wiki_ei_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert own EI responses"
  ON public.wiki_ei_responses FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE INDEX idx_ei_responses_user ON public.wiki_ei_responses(user_id, responded_at DESC);
CREATE INDEX idx_ei_prompts_article ON public.wiki_ei_prompts(article_id);
```

---

### 3.2 🟠 Campfire / Community — No Schema

**What the UX Strategy requires:**  
Campfire is the social proof layer — not a leaderboard, but passive context: *"8 students with your score passed the ALE in June 2025."* The strategy correctly distinguishes this from social competition. Phase 3.

```sql
-- Minimal schema for social proof (not leaderboard)
-- Only aggregate, anonymized data visible to users
CREATE TABLE public.campfire_testimonials (
  testimonial_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- nullable: anonymized
  display_name   TEXT NOT NULL,             -- can be first name only, e.g. "Maria C."
  school_name    TEXT,
  starting_score DOUBLE PRECISION,
  final_score    DOUBLE PRECISION,
  passed         BOOLEAN NOT NULL,
  exam_batch     TEXT NOT NULL,
  quote          TEXT,
  is_featured    BOOLEAN NOT NULL DEFAULT false,
  is_verified    BOOLEAN NOT NULL DEFAULT false,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.campfire_testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read featured testimonials"
  ON public.campfire_testimonials FOR SELECT TO public
  USING (is_featured = true AND is_verified = true);
```

---

### 3.3 🟠 Proof Simulation Gate Progress — Computed Column Gap

**What the UX Strategy requires:**  
Two visible progress bars on the locked Proof Simulation card:
1. Node coverage: `≥70% of taxonomy nodes at Amber or above`
2. Endurance window: `≥80% of exam duration`

Bar 1 can be computed on the fly from `user_node_mastery` — count where `current_mastery_weight >= 0.4` / total nodes for discipline. This is a fast query against an indexed table. ✅ No new schema needed.

Bar 2 requires `user_endurance_profiles.endurance_gate_pct` — which is resolved by the Endurance schema in Section 1.4 above. ✅ Covered.

**What remains:** A `proof_simulation_unlocked_at` timestamp to track when the gate was passed (for notification trigger and analytics):
```sql
ALTER TABLE public.user_global_stats
  ADD COLUMN IF NOT EXISTS proof_simulation_unlocked_at TIMESTAMPTZ;

COMMENT ON COLUMN public.user_global_stats.proof_simulation_unlocked_at IS
  'Set when both Proof Simulation gates pass (node coverage + endurance).
   Triggers unlock notification. NULL = not yet unlocked.';
```

---

### 3.4 🟠 Proof Simulation 24-Hour Diagnostic Delay — Missing State

**What the UX Strategy requires:**  
*"Detailed breakdown available tomorrow at [time]. Let that sit tonight."* The 24-hour delay must be enforced at the data layer, not just the UI. Without a column tracking when the analysis becomes available, the UI could show the full breakdown early (if cached), or a browser refresh could bypass the UI gate.

```sql
ALTER TABLE public.readiness_score_snapshots
  ADD COLUMN IF NOT EXISTS analysis_available_at TIMESTAMPTZ
    GENERATED ALWAYS AS (
      CASE WHEN is_proof_simulation THEN computed_at + INTERVAL '24 hours'
           ELSE computed_at
      END
    ) STORED;

COMMENT ON COLUMN public.readiness_score_snapshots.analysis_available_at IS
  'For proof simulations: 24 hours after score computed, per Consolidation-Before-Analysis principle.
   For regular sessions: same as computed_at (immediate access).';
```

---

## SECTION 4 — Existing Schema Assessment Against UX Requirements

For completeness, confirmed what the UX Strategy requires that is **already present** ✅:

| UX Requirement | Schema State |
|---|---|
| Assessment quiz tagging (`is_assessment` on questions) | ✅ Present |
| Score reveal copy driven by `assessment_score` | ✅ `user_global_stats.assessment_score` present |
| Trail recommendation using `target_exam_date` + score | ✅ Both present on `user_global_stats` / `profiles` |
| `recommended_min_score` / `recommended_max_score` on `camp_trails` | ✅ Present |
| `is_proof_simulation` on `quiz_sessions` and `readiness_score_snapshots` | ✅ Present |
| Pre-session confidence ratings | ✅ `quiz_sessions.pre_session_confidence_ratings JSONB` |
| `error_type` on `user_interactions` | ✅ Present |
| `question_order` on `user_interactions` | ✅ Present (for Endurance block analysis) |
| `is_suspected_lucky_guess` with trigger | ✅ Present + `trg_flag_lucky_guess` |
| Proof Simulation snapshot context | ✅ `session_id` + `is_proof_simulation` on `readiness_score_snapshots` |
| Blindspot Protocol tables | ✅ `blindspot_queues` fully present |
| Teach-back schema | ✅ `teach_back_submissions`, `topic_teach_back_criteria` fully present |
| `preferred_study_window` on `profiles` | ✅ Present (used for notification timing) |
| `churn_risk_score` + `score_velocity_7d` in `user_computed_signals` | ✅ Present (deprecated columns on `user_global_stats` correctly marked) |
| `user_roles` table with `has_admin_role()` | ✅ Present (from migration 004) |
| `audit_logs` table | ✅ Present (from migration 007) |
| SME review workflow on `wiki_articles` | ✅ `status`, `reviewed_by`, `reviewed_at` present |
| Content status on `models_3d` | ✅ `status`, `metadata`, `reviewed_by`, `reviewed_at` present |

---

## SECTION 5 — Critical Data Population Gaps (Not Schema, But Blocking)

The following are not missing schema — the tables exist but have no data, making features non-functional:

| Table | Current Rows | Blocking |
|---|---|---|
| `feature_flags` | 0 | **Entire paywall non-functional.** No gating can fire. Free users access all Pro features. |
| `analytics_events` | 0 | **Zero funnel visibility.** Cannot measure conversion, drop-off, or iterate on onboarding. |
| `exam_outcomes` | 0 | **Cannot validate "Know you'll win."** June 2026 ALE deadline for survey pipeline. |
| `profiles` | 0 | **Onboarding state tracking absent.** Cannot detect retaker flag, study window, exam date. |
| `user_computed_signals` | 0 | **Churn dashboard empty.** Cannot identify at-risk users. |

**`feature_flags` minimum population required before any user acquisition:**
```sql
INSERT INTO public.feature_flags (key, description, enabled, target_tier) VALUES
  ('live_readiness_score',    'Live score updating after every session',    true,  ARRAY['pro', 'enterprise']),
  ('full_heatmap',            'Full unblurred taxonomy heatmap',            true,  ARRAY['pro', 'enterprise']),
  ('trail_library',           'Access to full trail library beyond starter', true,  ARRAY['pro', 'enterprise']),
  ('blindspot_protocol',      'Blindspot Protocol remediation feature',     true,  ARRAY['pro', 'enterprise']),
  ('proof_simulation',        'Proof Simulation (gated by endurance)',      true,  ARRAY['pro', 'enterprise']),
  ('unlimited_questions',     'No daily question cap',                      true,  ARRAY['pro', 'enterprise']),
  ('additional_grace_days',   'Extra grace days per week (Pro: 2 vs 1)',    true,  ARRAY['pro', 'enterprise']);
```

---

## SECTION 6 — Consolidated Migration Plan

Recommended sequencing in dependency order:

### Migration 019 — Sprint 1 Revenue Unblocking
**File:** `019_sprint1_monetization_schema.sql`
```
Contents:
- ADD score_reveal_shown_at to user_global_stats
- ADD free_questions_today + free_cap_reset_date to user_subscriptions
- ADD is_retaker + onboarding_retaker_framing_shown to user_global_stats
- ADD assessment_started_at to user_global_stats
- ADD proof_simulation_unlocked_at to user_global_stats
- ADD is_endurance_session BOOLEAN to quiz_sessions
- INSERT feature_flags seed data (all 7 flags above)
```

### Migration 020 — SRS & Streaks
**File:** `020_srs_and_streaks.sql`
```
Contents:
- ADD SRS columns to user_node_mastery (next_review_at, review_interval_days, ease_factor, review_count)
- ADD SRS index on (user_id, next_review_at)
- ADD streak columns to user_trail_enrollments (current_streak, longest_streak, grace_days_used_this_week, streak_grace_week_start)
- ADD global streak columns to user_global_stats (global_current_streak, global_longest_streak, last_active_date)
- ADD milestones_shown JSONB to user_trail_enrollments
```

### Migration 021 — Endurance Cycle
**File:** `021_endurance_cycle.sql`
```
Contents:
- CREATE user_endurance_profiles table (full schema from Section 1.4)
- RLS policies on user_endurance_profiles
- updated_at trigger
```

### Migration 022 — Notification Infrastructure
**File:** `022_notification_schema.sql`
```
Contents:
- CREATE user_push_tokens table
- CREATE notification_log table
- RLS policies on both
- Indexes on notification_log(user_id, sent_at DESC) for 1/day enforcement
```

### Migration 023 — Wiki Read Tracking & EI Prompts
**File:** `023_wiki_engagement_schema.sql`
```
Contents:
- CREATE wiki_article_reads table
- CREATE wiki_ei_prompts table
- CREATE wiki_ei_responses table
- RLS policies on all three
- Calibration score columns on user_computed_signals
```

### Migration 024 — Anonymous Diagnostic Sessions
**File:** `024_anon_diagnostic_sessions.sql`
```
Contents:
- CREATE anon_diagnostic_sessions table (no RLS, server-only access)
- Expiry index for nightly cleanup job
```

### Migration 025 — Proof Simulation Enhancement
**File:** `025_proof_simulation_enhancements.sql`
```
Contents:
- ADD analysis_available_at GENERATED column to readiness_score_snapshots
- ADD Campfire testimonials table (Phase 3, but safe to create now)
```

---

## Summary: Full Gap Register

| # | Gap | Severity | Migration |
|---|---|---|---|
| 1.1 | `score_reveal_shown_at` missing | 🔴 Critical | 019 |
| 1.2 | Free tier daily cap columns missing | 🔴 Critical | 019 |
| 1.3 | SRS columns on `user_node_mastery` | 🔴 Critical | 020 |
| 1.4 | Endurance Cycle — zero schema | 🔴 Critical | 021 |
| 1.5 | Study streak columns missing | 🔴 Critical | 020 |
| 1.6 | Pre-auth anonymous diagnostic sessions | 🔴 Critical | 024 |
| 2.1 | `is_retaker` on `user_global_stats` | 🟡 Important | 019 |
| 2.2 | `assessment_started_at` for dropout recovery | 🟡 Important | 019 |
| 2.3 | Calibration score in `user_computed_signals` | 🟡 Important | 023 |
| 2.4 | Push notification schema — zero tables | 🟡 Important | 022 |
| 2.5 | Wiki article read tracking | 🟡 Important | 023 |
| 2.6 | Trail milestone tracking (`milestones_shown`) | 🟡 Important | 020 |
| 3.1 | Elaborative Interrogation prompts + responses | 🟠 Planned | 023 |
| 3.2 | Campfire testimonials table | 🟠 Planned | 025 |
| 3.3 | `proof_simulation_unlocked_at` timestamp | 🟠 Planned | 019 |
| 3.4 | Proof Simulation 24hr delay (`analysis_available_at`) | 🟠 Planned | 025 |
| D1 | `feature_flags` empty — paywall non-functional | 🔴 Data gap | Seed SQL in 019 |
| D2 | `analytics_events` empty — zero funnel visibility | 🔴 Data gap | App instrumentation |
| D3 | `exam_outcomes` empty — hard June 2026 deadline | 🟡 Data gap | Survey pipeline |
| D4 | `profiles` empty — onboarding state blind | 🔴 Data gap | App instrumentation |

---

*SlateCamp Database Architecture — Internal Reference*  
*Maintained by: DB Architect + Philip (Founder)*  
*Based on: UX Research & Strategic Implementation Plan v1.0 · DB Audit v3 · DATABASE_SCHEMA.sql 2026-03-19*

