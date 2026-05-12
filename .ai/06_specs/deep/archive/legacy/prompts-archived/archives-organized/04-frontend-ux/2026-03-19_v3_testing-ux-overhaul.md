# SlateCamp Testing Feature — Complete UX Overhaul + Schema Hardening
## The Quizzing Experience Must Be the Best in Philippine EdTech

---

## HOW TO USE THIS PROMPT

This is a large-scope prompt. To avoid running out of tokens:
1. **Read everything in this prompt FIRST before writing any code.**
2. **Use the phased execution plan.** Complete each phase fully before moving to the next.
3. **Batch file reads.** Read all relevant files in one pass, not one at a time.
4. **Batch SQL operations.** Run all schema queries in one Supabase MCP call where possible.
5. **No exploratory coding.** Every line you write should be planned from the audit in Phase 1.
6. **Minimal diffs.** When modifying existing files, use surgical edits (change only what's needed), don't rewrite entire components.

---

## ROLE

You are simultaneously:

1. **Educational Psychologist & Behavioral Analyst** — You understand spaced repetition (Ebbinghaus, Leitner), desirable difficulty (Bjork), testing effect (Roediger & Karpicke), cognitive load theory (Sweller), and self-determination theory (Deci & Ryan). Every UX decision in the testing feature must be grounded in what ACTUALLY improves exam performance — not what looks cool or what other apps do.

2. **Senior React/Next.js Engineer** — You write production TypeScript, use App Router patterns, query Supabase efficiently, and never break existing functionality. You understand that the testing feature is the CORE REVENUE DRIVER — a bug here is a catastrophic failure.

3. **Elite UX/UI Designer** — You design for the "confident companion" voice (65% warm, 35% authoritative). The testing interface must reduce anxiety, build self-efficacy, and make the student feel like they're in the hands of a system that knows what it's doing. You follow the SlateCamp design system precisely.

---

## TASK

Comprehensively audit and improve the entire testing/quizzing experience:

**Part A — UX Audit & Improvements** (the testing menu, quiz-taking flow, results/debrief, session history)
**Part B — Schema Hardening** (add missing tables, fix gaps identified in the data science audit)

---

## CONTEXT

### The Current Testing Page Structure (Audited Live)

```
/dashboard/testing
├── "Suggested for Today" — single topic prompt + "Start 10-Question Review" button
├── Zone 01: Foundations
│   ├── Camp Mode — "Learn as you go" with immediate feedback
│   └── Chill Mode — "Browse and absorb at a relaxed pace"
├── Zone 02: Deliberate Practice
│   ├── Subject Mode — "Pick a topic and go deep"
│   ├── Blindspot Mode — "Revisit topics you've practiced least"
│   └── Custom Session — "Design your own session"
├── Zone 03: Exam Readiness
│   ├── Storm Mode — Timed, no feedback until end
│   ├── Full Exam Simulation — "Unlocks when Readiness Score reaches 65%"
│   └── Extended Practice — "Sessions grow longer each week"
```

### The Database Schema (from data science audit)

**Core tables:**
```
disciplines          → exam types (ALE, etc.)
taxonomy_tree        → hierarchical topic/subject tree with node_id, parent_id, subject_area
questions            → question bank with difficulty, difficulty_rating, discrimination_rating (IRT params)
quiz_sessions        → session records with test_mode, status, config (JSONB), score fields
user_interactions    → per-answer records with time_spent_ms, answer_changes, options_eliminated, is_flagged
user_node_mastery    → current mastery state per topic per user (current_mastery_weight, total_correct, total_attempts)
user_global_stats    → global readiness score, target_exam_date, total sessions
readiness_score_snapshots → periodic readiness score records
```

**IRT parameters exist on questions:** `difficulty`, `difficulty_rating`, `discrimination_rating`
**Rich behavioral signals exist on interactions:** `time_spent_ms`, `answer_changes`, `options_eliminated`, `is_flagged`

### Design System Tokens
```
Cobalt Blue:     #1B3FC4   (primary actions)
Signal Green:    #1B7A3C   (correct, mastered ≥70%)
Camp Orange:     #E8853A   (developing 40-69%)
Signal Red:      #E63329   (incorrect, at-risk <40%)
Cream:           #F2F0EB   (alt backgrounds)
Cool Surface:    #F5F7FA   (quiz-taking background — reduces cognitive load)
Ink:             #1A2332   (primary text)
Border:          #E8E4DC   (borders)

Fonts in quiz:
  ALL Inter (no Syne, no DM Mono during active quiz — maximum calm)
  Numbers: Inter tabular-nums
  Question text: Inter 16px/400, line-height 1.7, max-width 640px
```

### Tools You MUST Use

- **File System** — Read every testing-related file before changing anything
- **Supabase MCP** — Query the actual schema, sample data, verify table structures
- **grep/search** — Find all quiz-related components, hooks, utilities across the codebase

---

## PART A: UX AUDIT & IMPROVEMENTS

### A1. The Testing Menu Page (`/dashboard/testing`)

**Current UX issues to evaluate and fix:**

**Issue: Zone-based organization may confuse new users.**
The three zones (Foundations → Deliberate Practice → Exam Readiness) imply a linear progression, but a new user with 0 quiz history sees ALL zones unlocked (except Full Exam Simulation). This creates choice paralysis.

**Fix: Smart default + progressive disclosure.**
- For a user with 0 sessions: prominently feature "Suggested for Today" and Camp Mode. Gray out (but don't hide) Storm Mode and Extended Practice with a message like "Unlocks after 5 Camp sessions" or similar milestone.
- For a user with history: show "Suggested for Today" based on their weakest topic (from `user_node_mastery`), and surface the mode that matches their current readiness level.
- The "Suggested for Today" section should pull from `user_node_mastery` to find the topic with the LOWEST mastery that has at least 1 previous attempt (i.e., not unexplored — that's for Subject Mode). If no attempts exist at all, suggest the broadest foundational topic.

**Issue: Mode descriptions are long and similar-sounding.**
Camp Mode, Chill Mode, Subject Mode — the copy differences are subtle and require careful reading.

**Fix: One-line differentiators + visual cues.**
Each mode card should have:
- A clear **one-word subtitle** that instantly differentiates: Camp = "Guided", Chill = "Relaxed", Subject = "Focused", Blindspot = "Targeted", Custom = "Flexible", Storm = "Timed", Simulation = "Exam Day", Extended = "Endurance"
- A **small icon** that visually separates the modes (use Phosphor icons if available, otherwise emoji is fine temporarily)
- The **description trimmed to 1 line** on desktop, expandable on mobile

**Issue: No data shown on mode cards.**
A student can't see HOW MUCH they've done in each mode. How many Camp sessions? When was my last Storm Mode?

**Fix: Add micro-stats to each mode card.**
```
Camp Mode                          Guided
Learn as you go — immediate feedback on every answer.
──────────────────────────────────
12 sessions · Last: 2 days ago    [Start Camp →]
```
Query `quiz_sessions` grouped by `test_mode` per user to populate these.

---

### A2. The Active Quiz Interface (During a Quiz)

**This is the highest-stakes screen in the entire app.** The design must CREATE CALM.

**Evaluate the current quiz-taking screen for these research-backed principles:**

**Principle 1: Cognitive Load Reduction (Sweller, 1988)**
- Background: `#F5F7FA` (Cool Surface) — cool tones measurably reduce physiological stress during cognitive tasks
- Remove ALL navigation chrome during the quiz. No sidebar. No header links. Just the question, options, and minimal progress indicator.
- Question text: Inter 16px, max-width 640px, line-height 1.7. Center it vertically in the viewport if short.
- Answer options: Minimum 48px touch target, clear visual separation, NO hover effects that could be mistaken for selection feedback

**Principle 2: Progress Visibility Without Anxiety (Bandura, 1977)**
- Progress bar: thin (4px), Cobalt Blue fill on cream track. Shows "Question 7 of 10" — simple fraction, not percentage.
- Timer (Storm Mode only): subtle, top-right, Inter 14px `#555555`. NEVER red. NEVER pulsing. If <5 minutes remain, shift to `#E8853A` (orange) — NOT red. Red triggers fight-or-flight.
- NO "time per question" indicator visible during the quiz. That data is captured in `user_interactions.time_spent_ms` for post-session analysis, but showing it live creates monitoring anxiety (Carver & Scheier, 1981).

**Principle 3: Answer Selection Feedback (Testing Effect — Roediger & Karpicke, 2006)**
- Camp Mode: After selecting an answer, show correctness immediately. Correct = option highlights green `#1B7A3C` with subtle border. Incorrect = option highlights soft red `#E63329` with the correct answer revealed in green.
- Show the explanation/rationale card BELOW the question (not in a modal, not in a sidebar). The rationale must be readable WITHOUT scrolling past the question — both must be visible simultaneously. This is the Spatial Contiguity Principle (Mayer, 2001).
- Storm Mode: NO feedback during quiz. Options simply highlight with Cobalt Blue when selected. Rationales are shown in the debrief after submission.

**Principle 4: Flagging Without Stigma**
- The flag button should be a neutral icon (bookmark or flag), NOT a warning symbol. Label it "Review later" not "Flag this question."
- Flagging should feel like a TOOL the student uses strategically, not an admission of confusion.
- Flagged questions get a small indicator in the progress bar, and a dedicated review section in the debrief.

**Principle 5: Navigation Clarity**
- "Previous" and "Next" buttons always in the same position (bottom of screen, fixed).
- "Previous" = ghost button (secondary). "Next" = Cobalt filled (primary).
- On the last question: "Next" changes to "Submit" with a confirmation step in Storm Mode ("You answered 40 of 40. 3 flagged for review. Submit?").
- A question grid/navigator (small numbered squares) should be accessible via a "Question Map" button — shows which are answered, flagged, and skipped. Critical for Storm Mode where students need to manage their time across all items.

---

### A3. The Session Debrief (Post-Quiz Results)

**This screen determines whether the student comes back tomorrow.** If the debrief is demoralizing, they won't return. If it's honest + actionable, they will.

**Evaluate and fix the current debrief for:**

**Immediate score delivery:**
- Show the score number (e.g., "7 of 10 correct — 70%") in Inter 36px bold, color-coded (green/orange/red based on thresholds).
- Below the score: one line of contextual feedback in the SlateCamp "confident companion" voice:
  - ≥80%: "Strong session. You're locking this in."
  - 60-79%: "Solid ground. A few gaps to close — check the breakdown below."
  - 40-59%: "You found the edges of your knowledge. That's exactly the point."
  - <40%: "Tough round. The explanations below are where the real learning happens."
- NEVER: "Great job!", "Don't worry!", "You failed", or any language that is either falsely positive or catastrophizing.

**Per-question review:**
- List all questions with: your answer, correct answer, correctness indicator, time spent, topic tag
- Flagged questions highlighted with a subtle bookmark icon
- Each wrong answer has an expandable rationale card with the code citation (e.g., "PD 1096 § 808")
- A "Retry wrong answers" button that creates a new mini-session from ONLY the missed questions. This implements the Testing Effect — retrieval practice on failed items produces the strongest memory consolidation.

**Subject performance breakdown:**
- Mini bar chart or simple bars showing accuracy per subject/topic in this session
- Compare to the student's overall mastery in that topic (from `user_node_mastery`): "Building Tech: 80% this session (overall: 62%)" — this shows whether this session was above or below their average.

**Session-level behavioral insights (from `user_interactions`):**
- Average time per question (from `time_spent_ms`)
- Questions where answer was changed (`answer_changes > 0`) — "You changed your answer 3 times. 2 of those changes were correct." This builds metacognitive awareness.
- Pacing indicator: Were they faster or slower than their historical average?

**Readiness Score update:**
- Show the readiness score BEFORE and AFTER this session: "Readiness: 42% → 45% (+3)"
- This makes every session feel consequential — even a 1% gain is visible progress.

---

### A4. Session History (on Analytics page or testing page)

- List of past sessions with: date, mode, score, question count, duration, and a "Review" link to revisit the debrief
- Filter by test mode and date range
- This data exists in `quiz_sessions` — just needs a clean UI surface

---

## PART B: SCHEMA HARDENING

Run these as a SQL migration. Create a file `supabase/migrations/[timestamp]_schema_hardening.sql`.

### B1. Add `profiles` table

```sql
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  display_name TEXT,
  avatar_url TEXT,
  user_type TEXT CHECK (user_type IN ('undergrad', 'reviewee', 'professional', 'instructor')) DEFAULT 'reviewee',
  discipline_id UUID REFERENCES disciplines(discipline_id),
  target_exam_date DATE,
  school_or_institution TEXT,
  onboarding_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Auto-update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

**IMPORTANT:** Before creating this table, check if a `profiles` table already exists:
```sql
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles';
```
If it exists, ALTER it to add missing columns instead of creating from scratch.

### B2. Add mastery history tracking

```sql
CREATE TABLE IF NOT EXISTS user_mastery_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL,
  mastery_weight NUMERIC(5,4) NOT NULL,
  total_correct INTEGER NOT NULL DEFAULT 0,
  total_attempts INTEGER NOT NULL DEFAULT 0,
  session_id UUID REFERENCES quiz_sessions(session_id),
  snapshot_reason TEXT CHECK (snapshot_reason IN ('session_complete', 'daily_snapshot', 'manual')) DEFAULT 'session_complete',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast user+topic timeline queries
CREATE INDEX idx_mastery_history_user_topic
  ON user_mastery_history(user_id, topic_id, created_at DESC);

-- RLS
ALTER TABLE user_mastery_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own mastery history" ON user_mastery_history FOR SELECT USING (auth.uid() = user_id);
```

### B3. Add `updated_at` to `user_node_mastery` (if missing)

```sql
-- Check first:
SELECT column_name FROM information_schema.columns
WHERE table_name = 'user_node_mastery' AND column_name = 'updated_at';

-- If missing:
ALTER TABLE user_node_mastery ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE TRIGGER user_node_mastery_updated_at
  BEFORE UPDATE ON user_node_mastery
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### B4. Add readiness score snapshot trigger

```sql
-- Function to auto-snapshot readiness score after each completed session
CREATE OR REPLACE FUNCTION snapshot_readiness_on_session_complete()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    INSERT INTO readiness_score_snapshots (user_id, score, snapshot_type, session_id)
    SELECT
      NEW.user_id,
      ugs.global_readiness_score,
      'session_complete',
      NEW.session_id
    FROM user_global_stats ugs
    WHERE ugs.user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Check if trigger already exists before creating
DROP TRIGGER IF EXISTS trg_snapshot_readiness ON quiz_sessions;
CREATE TRIGGER trg_snapshot_readiness
  AFTER UPDATE ON quiz_sessions
  FOR EACH ROW EXECUTE FUNCTION snapshot_readiness_on_session_complete();
```

**NOTE:** Verify the exact column names of `readiness_score_snapshots` before running this. The INSERT columns (`user_id`, `score`, `snapshot_type`, `session_id`) are educated guesses — adapt to the actual schema.

### B5. Add product analytics events table

```sql
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_name TEXT NOT NULL,
  event_properties JSONB DEFAULT '{}',
  page_path TEXT,
  session_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for querying by event name and time
CREATE INDEX idx_analytics_events_name_time
  ON analytics_events(event_name, created_at DESC);
CREATE INDEX idx_analytics_events_user
  ON analytics_events(user_id, created_at DESC);

-- RLS (admins can read all, users can read own)
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert own events" ON analytics_events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own events" ON analytics_events FOR SELECT USING (auth.uid() = user_id);
```

---

## PHASED EXECUTION

### PHASE 1: Deep Audit (Read-Only — DO NOT write code)

**This phase is the most important. Skip nothing.**

**1a. Read all testing-related files:**
```bash
# Find every file related to testing/quiz
find src/ -type f -name "*.tsx" -o -name "*.ts" | xargs grep -l "quiz\|testing\|camp.mode\|storm.mode\|session" | head -40

# Read the main testing page
cat src/app/dashboard/testing/page.tsx

# Find quiz-taking components (the active quiz screen)
find src/ -path "*/quiz/*" -o -path "*/session/*" -o -path "*/testing/*" | head -30

# Find debrief/results components
grep -rn "debrief\|results\|score\|summary" src/ --include="*.tsx" -l
```

Read every file found. Map the complete component tree for the testing feature.

**1b. Query the actual database schema:**
```sql
-- Get exact column names for all quiz-related tables
SELECT table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name IN ('quiz_sessions', 'user_interactions', 'questions', 'taxonomy_tree', 'user_node_mastery', 'user_global_stats', 'readiness_score_snapshots', 'profiles')
ORDER BY table_name, ordinal_position;

-- Check existing RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('quiz_sessions', 'user_interactions', 'user_node_mastery', 'profiles');

-- Check what test_modes exist
SELECT DISTINCT test_mode FROM quiz_sessions;

-- Check config JSONB shape (sample 3 rows)
SELECT session_id, test_mode, config FROM quiz_sessions LIMIT 3;

-- Check if profiles table exists
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles';

-- Check readiness_score_snapshots columns
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'readiness_score_snapshots' ORDER BY ordinal_position;

-- Sample user_interactions to understand behavioral data shape
SELECT * FROM user_interactions LIMIT 3;

-- Check existing triggers
SELECT trigger_name, event_manipulation, event_object_table, action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public';
```

**1c. Read the design system / shared components:**
```bash
# Find shared UI components used in testing
grep -rn "Button\|Card\|Progress\|Badge" src/app/dashboard/testing/ --include="*.tsx" | head -20

# Find any existing chart/visualization components
find src/components -name "*chart*" -o -name "*bar*" -o -name "*progress*" | head -10
```

**Output:** A complete map of:
- Every testing-related file and its purpose
- The exact database schema columns for all quiz tables
- The config JSONB shape
- What test modes exist
- What triggers/RLS already exist
- What the debrief currently looks like (if it exists)
- What's missing vs what's already built

**STOP.** "Phase 1 Complete. Full testing audit done. Here's what exists, what's missing, and what needs fixing. Reply 'Proceed' to execute schema migration."

---

### PHASE 2: Schema Migration

Based on the audit from Phase 1, create and run the schema hardening migration:

1. Create `supabase/migrations/[timestamp]_schema_hardening.sql`
2. ADAPT the SQL from Part B based on what actually exists (don't create tables that already exist, don't add columns that are already there)
3. Run the migration via Supabase MCP or CLI
4. Verify all new tables/columns exist and RLS policies are active

Also update `DATABASE_SCHEMA.sql` (the documentation file) to reflect the complete current schema including new additions.

**STOP.** "Phase 2 Complete. Schema hardened. Reply 'Proceed' for testing menu UX improvements."

---

### PHASE 3: Testing Menu Page UX

Improve `/dashboard/testing`:

1. Add micro-stats to each mode card (session count, last played)
2. Improve "Suggested for Today" with real mastery-based topic selection
3. Add one-word mode subtitles for instant differentiation
4. Trim mode descriptions to 1 line
5. Progressive disclosure: new users see Camp Mode prominently, advanced modes are subtler
6. Ensure all card styling matches design system (DM Mono eyebrows, Inter body, Cobalt CTAs)

**STOP.** "Phase 3 Complete. Reply 'Proceed' for active quiz interface improvements."

---

### PHASE 4: Active Quiz Interface

Audit and improve the quiz-taking screen:

1. Verify background is `#F5F7FA` (Cool Surface)
2. Verify ALL text is Inter (no Syne during quiz)
3. Verify progress bar is thin (4px), Cobalt fill, shows fraction not percentage
4. Verify timer (Storm Mode) is subtle, never red
5. Verify answer options have 48px min touch targets
6. Add/verify flag button labeled "Review later" with neutral icon
7. Add question navigator grid (accessible via button)
8. Verify "Previous" / "Next" button placement is fixed at bottom
9. Verify last-question submit flow with confirmation in Storm Mode
10. Verify rationale card (Camp Mode) appears BELOW the question, both visible simultaneously

**STOP.** "Phase 4 Complete. Reply 'Proceed' for debrief improvements."

---

### PHASE 5: Session Debrief

Audit and improve the post-quiz results screen:

1. Score display: Inter 36px bold, color-coded, with contextual one-line message
2. Per-question review list with correctness, time, topic, flag indicator
3. Expandable rationale cards on wrong answers with code citations
4. "Retry wrong answers" button that creates a new session from missed questions
5. Subject performance breakdown (accuracy per topic this session vs overall mastery)
6. Behavioral insights from `user_interactions` (avg time, answer changes, pacing)
7. Readiness Score before/after delta display
8. Verify all debrief copy follows "confident companion" voice (no toxic positivity, no catastrophizing)

**STOP.** "Phase 5 Complete. Reply 'Proceed' for final verification."

---

### PHASE 6: Full Verification

- [ ] Schema: `profiles` table exists with correct columns and RLS
- [ ] Schema: `user_mastery_history` table exists with indexes and RLS
- [ ] Schema: `user_node_mastery` has `updated_at` column with trigger
- [ ] Schema: `readiness_score_snapshots` has auto-trigger on session complete
- [ ] Schema: `analytics_events` table exists
- [ ] Schema: `DATABASE_SCHEMA.sql` documentation file is updated
- [ ] Testing menu: mode cards show session count + last played date
- [ ] Testing menu: "Suggested for Today" queries actual weakest topic
- [ ] Testing menu: modes have one-word subtitles
- [ ] Active quiz: background is #F5F7FA
- [ ] Active quiz: all text is Inter (no Syne)
- [ ] Active quiz: progress bar is thin Cobalt
- [ ] Active quiz: timer never turns red
- [ ] Active quiz: flag button says "Review later"
- [ ] Active quiz: question navigator grid exists
- [ ] Active quiz: rationale (Camp Mode) appears below question, both visible
- [ ] Active quiz: submit confirmation in Storm Mode
- [ ] Debrief: score is color-coded with contextual message
- [ ] Debrief: per-question review with expandable rationales
- [ ] Debrief: "Retry wrong answers" creates new session
- [ ] Debrief: subject breakdown with session vs overall comparison
- [ ] Debrief: readiness score before/after delta
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] No broken quiz functionality (start session, answer questions, submit, see results ALL work)

**STOP.** "Phase 6 Complete. Testing feature overhauled."

---

## THE EDUCATIONAL PSYCHOLOGY CHEAT SHEET

Reference these during every UX decision:

| Principle | Source | Application in SlateCamp |
|---|---|---|
| Testing Effect | Roediger & Karpicke 2006 | Retrieval practice (quizzing) produces stronger memory than re-reading. The quiz IS the learning tool, not just the assessment. |
| Desirable Difficulty | Bjork 1994 | Hard questions that the student struggles with produce deeper encoding. Blindspot Mode and IRT-adaptive difficulty are implementations of this. |
| Spacing Effect | Ebbinghaus 1885 | Distributed practice over time beats massed practice. Spaced repetition scheduling (SM-2) for question resurfacing. |
| Cognitive Load Theory | Sweller 1988 | Working memory is limited. The quiz interface must minimize extraneous load (decorative elements, complex navigation) to maximize germane load (thinking about the question). |
| Self-Determination Theory | Deci & Ryan 2000 | Intrinsic motivation requires autonomy (choice of mode), competence (visible mastery growth), and relatedness (feeling supported, not judged). |
| Self-Efficacy Theory | Bandura 1977 | Belief in one's ability to succeed is the strongest predictor of persistence. The Readiness Score + mastery bars build calibrated self-efficacy — honest but empowering. |
| Monitoring Anxiety | Carver & Scheier 1981 | Watching your own performance in real-time degrades that performance. Don't show per-question time during the quiz. Show it in the debrief. |
| Spatial Contiguity | Mayer 2001 | Related information must be presented physically close together. Rationale must appear adjacent to the question, not in a separate panel. |
| Elaborative Interrogation | Pressley 1987 | Asking "why" after an answer deepens encoding. The rationale card that explains WHY an answer is correct leverages this. |
| Metacognitive Monitoring | Koriat 1997 | Students who can accurately judge their own knowledge perform better. The flag feature + debrief behavioral insights build this skill. |

---

## WHAT NOT TO DO

- **Don't break existing quiz functionality.** If a student is mid-session, the app must still let them finish. Test start → answer → submit → results flow after every change.
- **Don't add confetti, badges, streaks, or any gamification.** These violate the SlateCamp design philosophy. The mastery data IS the reward.
- **Don't show time-per-question during an active quiz.** Capture it silently. Show it in the debrief.
- **Don't make the timer red.** Orange at <5 minutes. Never red. Never pulsing.
- **Don't use Syne font anywhere in the active quiz.** All Inter. The quiz is about the QUESTION, not the branding.
- **Don't install heavy dependencies.** Use what's already in `package.json`. If you need charts for the debrief, check if recharts is installed first.
- **Don't rewrite components from scratch.** Modify surgically. The testing feature WORKS — you're improving it, not rebuilding it.
- **Don't run schema changes without checking what already exists.** Every CREATE TABLE must be preceded by a check. Every ALTER must verify the column doesn't exist.
- **Don't hardcode subject names.** Query them from `taxonomy_tree` or `disciplines`. The subjects must come from the database.

---

*Execute Phase 1 now. Read all testing files, query the full schema, map everything before touching anything.*
