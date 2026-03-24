# SlateCamp — Review & Testing System
## Comprehensive Product & Data Document

**Prepared by:** Product Architect  
**Date:** March 2026  
**Classification:** Internal · Engineering + Product Reference  
**Scope:** All quiz modes, testing mechanics, data contracts, schema, and planned additions

---

## 0. Overview: The Review Page

The Review page (`/dashboard/testing`) is the primary study interface. It is organized into three zones of increasing cognitive demand and exam-readiness requirement:

| Zone | Name | Modes |
|---|---|---|
| 01 | Foundations | Camp Mode · Chill Mode |
| 02 | Deliberate Practice | Subject Mode · Focus Review · Custom Session |
| 03 | Exam Readiness | Storm Mode · Full Exam Simulation · Extended Practice |

Every mode routes through the same underlying architecture: a `quiz_session` is created, `user_interactions` are recorded per question, and on session completion a cascade of triggers fires that updates `user_node_mastery`, logs `user_mastery_history`, and snapshots the `global_readiness_score`. The mode controls the *conditions* of the session — the data pipeline is always the same.

---

## 1. The Data Architecture That Powers Everything

Before describing any individual mode, understand the data flow. Every quiz session — regardless of mode — follows this exact pipeline:

```
Student answers a question
        ↓
user_interactions INSERT
  → trg_flag_lucky_guess fires (BEFORE INSERT)
  → is_suspected_lucky_guess set if conditions met
        ↓
Session completes (status = 'completed')
        ↓
trg_snapshot_readiness fires (AFTER UPDATE on quiz_sessions)
  → reads user_global_stats.global_readiness_score
  → writes readiness_score_snapshots row
        ↓
Application-level: update user_node_mastery per topic_id
  → trg_log_mastery_history fires (AFTER UPDATE on user_node_mastery)
  → writes user_mastery_history row
        ↓
Heatmap refreshes from user_node_mastery
Readiness Score updates from user_global_stats
```

This pipeline is the same for Camp Mode, Storm Mode, and every other mode. What changes between modes is: (a) the `test_mode` value on `quiz_sessions`, (b) the `config` JSONB, (c) the UI feedback behavior during the session.

---

## 2. Core Schema Reference

### `quiz_sessions` — The Session Record

```sql
CREATE TABLE public.quiz_sessions (
  session_id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                        UUID NOT NULL REFERENCES auth.users(id),
  discipline_id                  UUID REFERENCES public.disciplines(discipline_id),
  test_mode                      test_mode NOT NULL DEFAULT 'camp',
  -- ENUM: 'camp' | 'timed' | 'practice'
  status                         session_status NOT NULL DEFAULT 'in_progress',
  -- ENUM: 'in_progress' | 'completed' | 'abandoned'
  config                         JSONB NOT NULL DEFAULT '{}',
  -- Stores session-specific settings (see config spec below)
  question_ids                   UUID[] NOT NULL DEFAULT '{}',
  -- Array of question UUIDs in presentation order
  subject_ids                    UUID[] NOT NULL DEFAULT '{}',
  -- Taxonomy node UUIDs targeted in this session
  current_question_index         INTEGER NOT NULL DEFAULT 0,
  started_at                     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                     TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at                   TIMESTAMPTZ,
  pre_session_confidence_ratings JSONB DEFAULT '{}',
  -- Metacognitive calibration: { "ALE-HIST": 2, "ALE-STRC": 1 } (1=not confident, 3=confident)
  is_proof_simulation            BOOLEAN DEFAULT false
  -- Flags this session as a Proof Simulation for separate tracking
);
```

**The `config` JSONB structure** — what each mode stores:
```json
{
  "question_count": 20,
  "difficulty_min": 0.0,
  "difficulty_max": 1.0,
  "subject_filter": ["ALE-STRC", "ALE-UTIL"],
  "feedback_mode": "immediate",
  "timer_enabled": false,
  "timer_seconds": null,
  "source": "camp_mode",
  "endurance_target_items": null,
  "is_blindspot_session": false,
  "trail_step_id": null
}
```

### `questions` — The Question Bank

```sql
CREATE TABLE public.questions (
  question_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id             UUID NOT NULL REFERENCES public.taxonomy_tree(node_id),
  text                 TEXT NOT NULL,
  options              JSONB NOT NULL DEFAULT '[]',
  -- Array of { id: string, text: string }
  correct_option_id    TEXT NOT NULL,
  rationale            TEXT,
  -- SME-authored explanation for the correct answer
  difficulty           NUMERIC DEFAULT 0.50,
  -- IRT difficulty: 0.0 (very easy) → 1.0 (very hard)
  difficulty_rating    NUMERIC,
  -- Calculated from user performance data
  discrimination_rating NUMERIC,
  -- IRT discrimination: how well this question separates high/low mastery students
  prompt_image_url     TEXT,
  explanation          TEXT,
  code_citation        TEXT,
  -- e.g., "PD 1096, Rule VII, Section 1204"
  model_id             TEXT,
  -- Links to a 3D Lab model if question references spatial content
  is_assessment        BOOLEAN DEFAULT false,
  -- TRUE for the 35-item assessment quiz only
  application_context  TEXT CHECK (application_context IN (
    'recall', 'calculation', 'design_application',
    'code_interpretation', 'client_scenario'
  ))
  -- The cognitive format of the question
);
```

**`application_context` values explained:**
- `recall` — Direct fact recall. "What is the minimum riser height under PD 1096?"
- `calculation` — Multi-step numerical computation. "Given a 400sqm lot at 60% coverage, what is the AMBF?"
- `design_application` — Apply code to a design scenario. "Which of these floor plans complies with BP 344?"
- `code_interpretation` — Read and interpret a code provision. "Under RA 9514 Section X, which occupancy has a 30m travel distance limit?"
- `client_scenario` — Professional judgment. "Your client insists on a 190mm riser. What is your correct response as the RLA?"

### `user_interactions` — The Immutable Answer Log

```sql
CREATE TABLE public.user_interactions (
  interaction_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID NOT NULL REFERENCES auth.users(id),
  session_id              UUID NOT NULL REFERENCES public.quiz_sessions(session_id),
  question_id             UUID NOT NULL REFERENCES public.questions(question_id),
  topic_id                UUID REFERENCES public.taxonomy_tree(node_id),
  -- Denormalized from questions.topic_id for faster mastery queries
  selected_option_id      TEXT,
  is_correct              BOOLEAN NOT NULL,
  time_spent_ms           INTEGER DEFAULT 0,
  -- Milliseconds from question display to answer submission
  interaction_timestamp   TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_flagged              BOOLEAN NOT NULL DEFAULT false,
  -- Student manually flagged for review
  answer_changes          INTEGER NOT NULL DEFAULT 0,
  -- How many times student changed their answer before submitting
  options_eliminated      INTEGER NOT NULL DEFAULT 0,
  -- How many options student explicitly eliminated
  confidence              TEXT CHECK (confidence IN ('sure', 'unsure')),
  -- Student-reported confidence before submitting
  rationale_view_ms       INTEGER DEFAULT 0,
  -- How long student spent reading the rationale post-answer
  error_type              TEXT,
  -- Post-wrong-answer taxonomy: 'knowledge_gap'|'misread'|'distractor'|'code_version'|'time_pressure'
  question_order          INTEGER,
  -- Position in session (1-indexed) — critical for Endurance Cycle block analysis
  is_suspected_lucky_guess BOOLEAN NOT NULL DEFAULT false,
  -- Set by trigger: correct + mastery < 0.4 + time < 40% of avg
  UNIQUE (user_id, session_id, question_id)
);
```

**The Lucky Guess Detection Trigger:**
```sql
-- Fires BEFORE INSERT on user_interactions
-- Flags as lucky guess when ALL three conditions are true:
-- 1. Answer is correct (is_correct = true)
-- 2. Node mastery is low (current_mastery_weight < 0.4)
-- 3. Time spent is suspiciously fast (time_spent_ms < avg_time_ms * 0.4)
-- Effect: is_suspected_lucky_guess = true
-- Application code then applies 0.3× weight multiplier instead of 1.0×
-- when updating the mastery EMA for this interaction
```

### `user_node_mastery` — The Per-Node Mastery Record

```sql
CREATE TABLE public.user_node_mastery (
  user_id                UUID NOT NULL REFERENCES auth.users(id),
  topic_id               UUID NOT NULL REFERENCES public.taxonomy_tree(node_id),
  total_attempts         INTEGER NOT NULL DEFAULT 0,
  total_correct          INTEGER NOT NULL DEFAULT 0,
  current_mastery_weight DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  -- EMA-weighted mastery: 0.0 → 1.0
  avg_time_ms            INTEGER NOT NULL DEFAULT 0,
  -- Rolling average time per question on this node
  last_encountered       TIMESTAMPTZ NOT NULL DEFAULT now(),
  teach_back_attempted   BOOLEAN DEFAULT false,
  teach_back_gap_count   INTEGER DEFAULT 0,
  PRIMARY KEY (user_id, topic_id)
);
```

**Heatmap node state derivation** (computed at query time, never stored):
```sql
SELECT
  topic_id,
  current_mastery_weight,
  total_attempts,
  CASE
    WHEN total_attempts = 0 THEN 'grey'   -- never seen
    WHEN total_attempts < 5 OR current_mastery_weight < 0.4 THEN 'red'
    WHEN current_mastery_weight >= 0.4 AND current_mastery_weight < 0.75 THEN 'amber'
    WHEN current_mastery_weight >= 0.75 THEN 'green'
  END AS node_state
FROM public.user_node_mastery
WHERE user_id = $userId;
-- Nodes absent from this table = grey (no row = no attempt)
```

---

## 3. Zone 01 — Foundations

### 3.1 Camp Mode (`test_mode = 'camp'`)
**Subtitle:** Guided  
**Purpose:** The primary daily study mode. Immediate feedback after each answer. Expert rationale on every question. Algorithmic remediation. The mode that builds mastery incrementally.

**Session behavior:**
- Student answers a question and submits
- Correct/incorrect revealed immediately
- Rationale shown (SME-authored) — student can spend as long as they want reading it (`rationale_view_ms` captured)
- Question moves forward
- Wrong answers route to the relevant Wiki article via a "Review this topic →" link
- No time pressure

**Question selection logic:**
```
1. Pull taxonomy nodes from the student's heatmap, prioritized by:
   - Red nodes (mastery < 0.4) first
   - Amber nodes next
   - Filtered to the subject_ids in config (if Subject Mode variant)
2. For each node, select questions weighted by:
   - Questions not seen recently (spaced repetition — avoid recently-answered questions)
   - Questions at appropriate difficulty (difficulty range from config.difficulty_min/max)
   - Questions matching bloom_level progression (remember before apply)
3. question_ids[] in quiz_sessions stores the final ordered list
```

**Config JSONB for a standard Camp Mode session:**
```json
{
  "question_count": 20,
  "difficulty_min": 0.0,
  "difficulty_max": 1.0,
  "feedback_mode": "immediate",
  "timer_enabled": false,
  "source": "camp_mode",
  "show_rationale": true,
  "allow_wiki_jump": true
}
```

**Mastery update on completion:**
Every correct answer → updates `user_node_mastery.current_mastery_weight` using EMA.  
Every wrong answer → decrements EMA, routes Blindspot Protocol to flag the node.  
Lucky guess detected → correct answer contributes at 0.3× weight instead of 1.0×.

**What Camp Mode feeds:**
- `user_interactions` (immutable per-answer log)
- `user_node_mastery` (mastery EMA update per node)
- `user_mastery_history` (snapshot via trigger)
- `readiness_score_snapshots` (snapshot on session complete)
- Heatmap (derived from updated user_node_mastery)
- Blindspot Protocol (wrong answers feed the nightly scan)

---

### 3.2 Chill Mode (`test_mode = 'practice'`)
**Subtitle:** Relaxed  
**Purpose:** Browse and absorb at low cognitive load. No pressure. Ideal for low-energy review sessions, end-of-day reinforcement, or when the student wants to explore unfamiliar topics without the anxiety of being graded.

**Session behavior:**
- Questions shown one at a time
- No timer
- Answer is optional — student can skip
- Immediate soft feedback (correct/incorrect shown gently, no large red/green)
- Full rationale always visible
- Student can jump to related Wiki article freely
- Session can be ended at any point with no penalty

**Key difference from Camp Mode:** Chill Mode interactions may be tagged at reduced EMA weight (configurable) because the conditions for guessing are higher — no pressure means the mastery signal is noisier. The `confidence` field on `user_interactions` is particularly important here: a Chill Mode answer marked `confidence = 'unsure'` should contribute less to mastery than a confident correct answer.

**Config JSONB:**
```json
{
  "question_count": null,
  "feedback_mode": "immediate",
  "timer_enabled": false,
  "source": "chill_mode",
  "show_rationale": true,
  "allow_skip": true,
  "mastery_weight_multiplier": 0.7
}
```

**What Chill Mode feeds:**
Same pipeline as Camp Mode, but with reduced mastery weight multiplier in application code. The session still generates `user_interactions` — so the data is there for analytics, even if the mastery contribution is reduced.

---

## 4. Zone 02 — Deliberate Practice

### 4.1 Subject Mode (Camp Mode Variant, Subject-Filtered)
**Subtitle:** Focused  
**Purpose:** Target a single ALE subject and go deep. Questions are scoped entirely to one subject's taxonomy nodes. Uses Camp Mode feedback (immediate). Good for deliberate gap closure on a specific subject identified by the heatmap.

**Session behavior:**
- Student selects one of the 8 ALE subjects (ALE-HIST, ALE-THEO, ALE-PLAN, ALE-PRAC, ALE-STRC, ALE-MATL, ALE-UTIL, ALE-DSGN)
- All questions drawn from that subject's leaf nodes only
- Mastery-aware question selection within the subject (weaker nodes prioritized)
- Same Camp Mode feedback behavior

**How subject filter is applied:**
```sql
-- Question selection for Subject Mode
-- subject_ids[] in quiz_sessions stores the filtered taxonomy node IDs
SELECT q.question_id
FROM questions q
JOIN taxonomy_tree tt ON tt.node_id = q.topic_id
WHERE tt.subject_area = $selectedSubject  -- e.g. 'Structural Design'
  AND tt.is_leaf = true
  AND tt.is_cross_ref_only = false
  AND tt.deprecated_at IS NULL
ORDER BY (
  SELECT current_mastery_weight
  FROM user_node_mastery
  WHERE user_id = $userId AND topic_id = q.topic_id
) ASC NULLS FIRST  -- weakest nodes first
LIMIT $questionCount;
```

**Config JSONB:**
```json
{
  "question_count": 20,
  "subject_filter": ["ALE-STRC"],
  "feedback_mode": "immediate",
  "timer_enabled": false,
  "source": "subject_mode",
  "show_rationale": true
}
```

---

### 4.2 Focus Review (Blindspot Protocol — Active Mode)
**Subtitle:** Targeted  
**Purpose:** Resurface the student's weakest, most persistently Red nodes with a focused remediation queue. This is the active, student-triggered version of the Blindspot Protocol (as opposed to the nightly automated queue).

**The Blindspot Protocol — Full Specification:**

The Blindspot Protocol is one of SlateCamp's three core progression mechanics. It targets the nodes a student consistently gets wrong — their blind spots.

**Nightly automated trigger (application-level, not a Postgres trigger):**
1. Nightly scan of `user_node_mastery` for the user
2. Find nodes where `current_mastery_weight < 0.4` (Red state)
3. Cross-reference with `user_mastery_history` — has this node been Red for 3+ consecutive weekly snapshots?
4. If yes: generate a `blindspot_queues` row with `node_ids[]` = the cluster of failing nodes
5. Notify the student: "Building Laws nodes have been Red for 3 weeks. A focused session is ready."

**Student-triggered (Focus Review mode):**
The student can trigger a Blindspot session manually from the Review page at any time. The system immediately identifies the 3–5 weakest Red nodes and generates a focused queue.

**The `blindspot_queues` table:**
```sql
CREATE TABLE public.blindspot_queues (
  queue_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id        UUID,
  -- Populated when the student starts the queue session
  node_ids          UUID[] NOT NULL,
  -- The taxonomy node IDs targeted by this queue
  question_count    INTEGER DEFAULT 12,
  generated_at      TIMESTAMPTZ DEFAULT now(),
  deferred_until    TIMESTAMPTZ,
  -- If student defers ("Remind me tomorrow")
  completed_at      TIMESTAMPTZ,
  status            TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'deferred', 'in_progress', 'completed', 'expired')),
  pre_queue_mastery  JSONB DEFAULT '{}',
  -- Snapshot of mastery weights for queued nodes before the session
  -- { "node_uuid": 0.24, "node_uuid": 0.31 }
  post_queue_mastery JSONB DEFAULT '{}',
  -- Snapshot after completion — measures protocol effectiveness
  nodes_improved    INTEGER DEFAULT 0
  -- Count of nodes that moved from Red to Amber or better
);
```

**Node prioritization within a Blindspot queue** (v5.0 taxonomy data):
```
Priority score = (1 - mastery_ema) × FREQUENCY_WEIGHT × TYPE_WEIGHT

FREQUENCY_WEIGHTS:  high = 3.0, medium = 1.5, low = 0.5
TYPE_WEIGHTS:       code_provision = 2.0, formula = 1.8, concept = 1.0, person/building = 0.7

Special routing: if three_d_lab_linked = true AND node is Red
→ Surface "Study in 3D Lab first" recommendation before the quiz session
→ Dashboard shows: "Your weakest node on [Topic] has a 3D Lab module.
   See it spatially before answering more questions."
```

**Effectiveness measurement:**
The `pre_queue_mastery` and `post_queue_mastery` JSONB snapshots enable post-session measurement: did the protocol actually move the needle? `nodes_improved` stores the count. Over time this data trains the node prioritization algorithm.

**Config JSONB for a Blindspot session:**
```json
{
  "question_count": 12,
  "source": "focus_review",
  "is_blindspot_session": true,
  "feedback_mode": "immediate",
  "timer_enabled": false,
  "blindspot_queue_id": "uuid-of-blindspot-queue"
}
```

---

### 4.3 Custom Session
**Subtitle:** Flexible  
**Purpose:** Full student control. Choose topics, question count, difficulty range, and feedback style. Good for targeted practice on specific code sections or specific difficulty levels.

**Student controls:**
- Topics: multi-select from the 172 leaf nodes (or subject-level selection)
- Question count: 5 to 100
- Difficulty range: slider from Foundational (1) to Expert (4) — maps to `difficulty` 0.0–1.0 bands
- Feedback style: Immediate (Camp Mode style) or Deferred (Storm Mode style)
- Timer: optional, set custom duration

**Config JSONB:**
```json
{
  "question_count": 30,
  "subject_filter": ["ALE-STRC", "ALE-LAWS"],
  "difficulty_min": 0.5,
  "difficulty_max": 1.0,
  "feedback_mode": "deferred",
  "timer_enabled": true,
  "timer_seconds": 2700,
  "source": "custom_session"
}
```

---

## 5. Zone 03 — Exam Readiness

### 5.1 Storm Mode (`test_mode = 'timed'`)
**Subtitle:** Timed  
**Purpose:** Simulate real exam conditions. No feedback until the session ends. Timer visible as a progress bar (never a countdown). No ability to review answers mid-session. Stripped UI — no navigation chrome, no subject labels. This is the mode that builds exam-day psychological readiness.

**Session behavior:**
- Pre-session briefing screen: states the rules calmly, no fear language. "Storm Mode mirrors the real exam. No feedback until you're done. The timer is a progress bar, not a countdown."
- During session: question + options + thin progress bar + question counter. Nothing else.
- Answer confirmed in one tap — no confirmation step (exam pace).
- Timer visible as a thin progress bar at top — changes color from Cobalt to Camp Orange (never red) when < 10% remains.
- On completion: full item-by-item review with all rationales. Student can read every explanation they were denied during the session.

**Key UX constraints:**
- Timer color NEVER goes red. Red triggers physiological stress response. Camp Orange (#E8853A) at the threshold communicates urgency without panic.
- No time-per-question display during the session — `time_spent_ms` is captured but shown only in post-session debrief.
- No "you got X wrong" notification during the session. The student learns only after full completion.

**Storm Mode contributes to mastery the same as Camp Mode.** The `test_mode = 'timed'` flag does not reduce the mastery weight. Every `user_interactions` row feeds the same EMA. The difference is purely the *experience* — not the data outcome.

**Config JSONB:**
```json
{
  "question_count": 50,
  "feedback_mode": "deferred",
  "timer_enabled": true,
  "timer_seconds": 4800,
  "source": "storm_mode",
  "show_rationale": false,
  "stripped_ui": true
}
```

**What Storm Mode feeds (same pipeline, different timing):**
- `user_interactions` rows written throughout the session
- Mastery updates and readiness snapshot fire on `session.status = 'completed'`
- Post-session debrief generates `error_type` prompt for every wrong answer

---

### 5.2 Full Exam Simulation — Proof Simulation (`is_proof_simulation = true`)
**Subtitle:** Exam Day  
**Purpose:** The closest simulation to sitting the actual ALE. Full item count, real exam conditions, 24-hour cold score delivery, and a Readiness Score recalibration that incorporates a "pressure-tested component." Gated behind a competency threshold (Readiness Score ≥ 65% by default, stored in `camp_trails.recommended_min_score`).

**Why gated:** Students below 65% readiness who take a full Proof Simulation and score 28% will not benefit from the experience. The gap is too large to be instructive. The gate exists to protect the student's psychological state from a premature cold failure.

**Session behavior:**
1. Pre-simulation briefing: exam conditions stated, 24-hour cold delivery explained
2. Full 200-item exam session under timed conditions (no feedback)
3. Session completes → status = 'completed', is_proof_simulation = true
4. Cold score delivery: the score is computed but not shown for 24 hours (configurable, stored in config)
5. After 24 hours: score is revealed with full diagnostic breakdown

**The cold delivery rationale (Roediger & Karpicke, 2006 — Testing Effect):** Immediate score feedback after a high-stakes simulation creates score-anchoring anxiety. A 24-hour gap lets the student's emotional state stabilize. The score they receive the next day is more actionable because they approach it calmly, not defensively.

**Database distinction from Storm Mode:**
`is_proof_simulation = true` on `quiz_sessions` is what separates Proof Simulation from regular Storm Mode in the database. This flag propagates to `readiness_score_snapshots.is_proof_simulation`, enabling:
```sql
-- Query that correctly separates proof simulation scores from regular scores
SELECT score, computed_at, is_proof_simulation
FROM readiness_score_snapshots
WHERE user_id = $userId
ORDER BY computed_at DESC;
-- The trajectory chart shows proof simulation scores as distinct markers
-- (e.g., diamond icons on the chart vs. regular dots for normal sessions)
```

**The Pressure-Tested Component:** After Proof Simulation completion, the Readiness Score is recalibrated with a pressure-adjusted component. Students who score significantly lower on the simulation than their regular Readiness Score have a pressure-performance gap — they know the material but underperform under exam conditions. This gap is surfaced explicitly: "Your Readiness Score is 74%. Under exam conditions, you scored 61%. This 13-point pressure gap is the next thing to close."

**What the Proof Simulation feeds beyond the normal pipeline:**
- `readiness_score_snapshots` with `is_proof_simulation = true`
- A post-simulation diagnostic report (per-subject scores)
- Recommendation for next trail based on simulation results
- `user_global_stats.assessment_score` — simulation result treated as the most recent honest readiness estimate

**Config JSONB:**
```json
{
  "question_count": 200,
  "feedback_mode": "deferred",
  "timer_enabled": true,
  "timer_seconds": 19200,
  "source": "proof_simulation",
  "cold_delivery_hours": 24,
  "stripped_ui": true,
  "is_proof_simulation": true
}
```

---

### 5.3 Extended Practice — Area C Endurance Training (`test_mode = 'camp'` with endurance config)
**Subtitle:** Endurance  
**Purpose:** Build cognitive stamina for the sustained performance ALE Day 2 demands. The ALE's Area C (Architectural Design) is 3+ hours under exam conditions. Most first-time failures on Area C are caused by cognitive fatigue, not lack of knowledge. Extended Practice builds the reliable performance window week by week.

**Previously named:** "Endurance Cycle"  
**New positioning (as decided this session):** "Area C Endurance Training" — explicitly framed as preparation for the 3+ hour Day 2 requirement.

**How it works:**

**Week 1 — Baseline calibration:**
Extended Practice monitors accuracy in 10-item blocks using `question_order` from `user_interactions`. The session continues until accuracy drops below 70% for a sustained block. The question number where this happens is the student's **reliable performance window** — their current sustainable study duration.

```sql
-- Accuracy by 10-item block — detects where performance degrades
SELECT
  ((question_order - 1) / 10) AS block_index,
  COUNT(*) FILTER (WHERE is_correct)::float / COUNT(*) AS block_accuracy,
  AVG(time_spent_ms) AS avg_ms_per_question
FROM user_interactions
WHERE session_id = $sessionId
  AND question_order IS NOT NULL
GROUP BY block_index
ORDER BY block_index;
```

**Weeks 2+ — Progressive extension:**
Each week, the Extended Practice session target extends by 10–15% beyond the student's established window. If the student's reliable window is 72 questions, the next session targets ~80.

**What Extended Practice data requirements need (currently missing, flagged in DB Audit):**
```sql
-- NEEDED: user_endurance_profiles table
-- Currently flagged as MISSING in the schema — blocks the Proof Simulation gate
CREATE TABLE public.user_endurance_profiles (
  user_id                     UUID PRIMARY KEY REFERENCES auth.users(id),
  baseline_reliable_items     INTEGER,
  baseline_calibrated_at      TIMESTAMPTZ,
  current_endurance_target    INTEGER,
  endurance_window_minutes    DOUBLE PRECISION,
  endurance_sessions_completed INTEGER NOT NULL DEFAULT 0,
  avg_seconds_per_question    DOUBLE PRECISION,
  pacing_target_seconds       DOUBLE PRECISION DEFAULT 96,
  -- ALE standard: 96 seconds per question (8 hours / 300 questions across both days)
  consecutive_plateau_weeks   INTEGER NOT NULL DEFAULT 0,
  last_endurance_session_at   TIMESTAMPTZ,
  updated_at                  TIMESTAMPTZ DEFAULT now()
);

-- NEEDED: is_endurance_session flag on quiz_sessions
ALTER TABLE public.quiz_sessions
  ADD COLUMN IF NOT EXISTS is_endurance_session BOOLEAN NOT NULL DEFAULT false;

-- NEEDED: accuracy_by_block on quiz_sessions or as a derived table
-- For the post-session chart showing accuracy degradation across blocks
ALTER TABLE public.quiz_sessions
  ADD COLUMN IF NOT EXISTS accuracy_by_block JSONB DEFAULT '[]';
-- Format: [{ block: 1, accuracy: 0.9 }, { block: 2, accuracy: 0.85 }, ...]
```

**Pacing Gauge:** Extended Practice also tracks average seconds per question. The ALE standard is approximately 96 seconds per question across the exam. Students who average 140+ seconds are at risk of running out of time on Day 2. The Pacing Gauge in the Analytics Dashboard surfaces this: "Your average: 142 seconds/question. ALE target: 96 seconds. You're currently over by 48%."

**The Proof Simulation gate dependency:**
The Proof Simulation's competency gate checks two conditions:
1. Readiness Score ≥ 65% (configurable)
2. Endurance window covers ≥ 80% of exam duration

Condition 2 cannot be computed without `user_endurance_profiles`. Until that table exists, the gate shows: "Mostly Ready — Complete the Area C Endurance calibration to unlock Full Simulation."

**Config JSONB:**
```json
{
  "feedback_mode": "immediate",
  "timer_enabled": false,
  "source": "extended_practice",
  "is_endurance_session": true,
  "endurance_target_items": 88,
  "track_block_accuracy": true
}
```

---

## 6. The Assessment Quiz — Onboarding Diagnostic

**Not a mode in the Review page.** The Assessment Quiz appears once during onboarding and produces the initial Readiness Score that seeds all subsequent features.

**Specification:**
- 35 items total
- 5 questions per ALE subject × 7 subjects (ALE-HIST, ALE-THEO, ALE-PLAN, ALE-PRAC, ALE-STRC, ALE-MATL, ALE-UTIL)
  - Note: ALE-DSGN questions are not included in the assessment — design questions require spatial judgment incompatible with flat MCQ diagnostic
- Questions selected by `is_assessment = true` flag and high `discrimination_rating`
- No timer
- No feedback during the session (Camp Mode feedback would anchor bias before the diagnostic is complete)
- Results produce the initial heatmap seed and the Score Reveal screen

**Schema flag:**
```sql
-- Questions marked for assessment use only
SELECT question_id FROM questions
WHERE is_assessment = true
ORDER BY discrimination_rating DESC;

-- Track completion in user_global_stats
-- assessment_completed_at TIMESTAMPTZ
-- assessment_score DOUBLE PRECISION
```

**Score Reveal screen:** The single most important conversion screen in the platform. Shows the initial score, a blurred heatmap, and a single recommended Camp Trail. Free users see this once — then the score locks behind Pro. Pro users see it always updated.

---

## 7. Metacognitive Calibration — Pre-Session Confidence

Before every quiz session, students can rate their confidence per subject on a 3-point scale (1 = not confident, 2 = somewhat, 3 = confident). This is stored in `quiz_sessions.pre_session_confidence_ratings`:

```json
{
  "ALE-STRC": 1,
  "ALE-DSGN": 3,
  "ALE-HIST": 2
}
```

After the session, the system computes the calibration gap: predicted accuracy vs. actual accuracy per subject. This produces the **calibration score** — a separate signal from mastery weight.

**Calibration failure pattern (most common in ALE candidates):** Students are systematically overconfident about Building Laws and Professional Practice. They read the codes and assume familiarity means mastery. The calibration chart exposes this: "You predicted 80% confidence on Building Laws. You scored 41%."

**Over time:** A student whose calibration improves (predictions get more accurate) is gaining genuine metacognitive awareness — they know what they know. This is independently valuable from raw accuracy improvement.

**Future Bloom-level calibration (planned):** With `bloom_level` from taxonomy v5.0, calibration can be tracked per cognitive type: "You're well-calibrated on recall questions but overconfident on application questions." This requires grouping `user_interactions` by `taxonomy_tree.bloom_level` per session.

---

## 8. Error Taxonomy — Post-Wrong-Answer Categorization

After every wrong answer in Camp Mode, a micro-prompt appears: "What happened there?" with 5 options:

| Tag | Meaning | Automated Intervention |
|---|---|---|
| `knowledge_gap` | Genuinely didn't know | Blindspot Protocol flags the node; Wiki remediation surfaced |
| `misread` | Knew it but misread the question | "Slow down on question reading" strategy tip surfaced |
| `distractor` | Two options looked similar | Comparison table between similar codes shown |
| `code_version` | Confused old vs. new IRR/code version | Version clarification article linked |
| `time_pressure` | Correct under calm, wrong under pressure | Endurance Cycle adjustment recommended |

Stored in `user_interactions.error_type`. Aggregate patterns surface in the Analytics Dashboard: a student who consistently tags `distractor` on Building Laws questions doesn't need more content — they need discriminating drills between similar provisions.

**The dominant pattern diagnostic:**
```sql
SELECT error_type, COUNT(*) as frequency
FROM user_interactions
WHERE user_id = $userId
  AND error_type IS NOT NULL
  AND is_correct = false
GROUP BY error_type
ORDER BY frequency DESC;
-- If misread dominates → reading strategy intervention
-- If knowledge_gap dominates → content remediation (Blindspot)
-- If distractor dominates → comparison table recommendation
```

---

## 9. Feynman Teach-Back (Phase 3)

After deep engagement with a topic (post-Wiki article, post-Blindspot queue, or end-of-Camp-Trail-day), the student is prompted: "Can you explain this in your own words?"

**The `teach_back_submissions` table:**
```sql
CREATE TABLE public.teach_back_submissions (
  submission_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL REFERENCES auth.users(id),
  topic_id           UUID REFERENCES public.taxonomy_tree(node_id),
  entry_point        TEXT NOT NULL CHECK (entry_point IN ('wiki', 'blindspot', 'trail')),
  trail_day_id       UUID REFERENCES public.trail_days(day_id),
  prompt_text        TEXT NOT NULL,
  student_response   TEXT NOT NULL,
  evaluation_result  JSONB DEFAULT '{}',
  -- AI evaluation: { completeness: 0.7, missing: ["seismic zone"], misconceptions: [] }
  gaps_identified    TEXT[] DEFAULT '{}',
  revised_response   TEXT,
  submitted_at       TIMESTAMPTZ DEFAULT now(),
  revised_at         TIMESTAMPTZ
);
```

**The `topic_teach_back_criteria` table (SME-authored):**
```sql
CREATE TABLE public.topic_teach_back_criteria (
  criteria_id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id              UUID NOT NULL REFERENCES public.taxonomy_tree(node_id),
  required_concepts     TEXT[] NOT NULL DEFAULT '{}',
  required_exceptions   TEXT[] NOT NULL DEFAULT '{}',
  common_misconceptions TEXT[] NOT NULL DEFAULT '{}',
  code_citations        TEXT[] NOT NULL DEFAULT '{}',
  authored_by           UUID
);
```

**What the AI evaluates (5 dimensions, d=0.55–1.0 research basis):**
1. Presence of required concepts (from criteria.required_concepts)
2. Acknowledgment of exceptions and edge cases
3. Absence of documented misconceptions
4. Correct code citations where relevant
5. Causal reasoning (does the student explain *why*, not just *what*)

**Mastery signal from Teach-Back:**
```sql
-- On successful teach-back evaluation (score ≥ 0.7)
UPDATE user_node_mastery
SET teach_back_attempted = true,
    teach_back_gap_count = (
      SELECT array_length(gaps_identified, 1)
      FROM teach_back_submissions
      WHERE topic_id = $topicId
        AND user_id = $userId
      ORDER BY submitted_at DESC LIMIT 1
    )
WHERE user_id = $userId AND topic_id = $topicId;
```

---

## 10. Anxiety Inoculation Protocol (Phase 3 — Spec Only, Do Not Build Now)

A 2-week Storm Mode variant triggered when `target_exam_date` is within 14 days. Graduated stressors to simulate exam pressure:
- Time per question reduced by 5% below the student's comfortable pace
- Mandatory sequential answering (no flagging, no returning)
- Random question order (no subject clustering — mirrors actual ALE)

**Schema need when built:** A `pressure_protocol` column on `quiz_sessions` or a new `test_mode` enum value (`'pressure'`).

Research basis: Jamieson et al. (2010) — arousal reattribution improved GRE scores. Sports psychology stress inoculation applied to licensure exam prep.

---

## 11. The Post-Session Debrief

Every mode produces a post-session debrief screen. The data shown depends on the mode:

| Data Point | Camp Mode | Storm Mode | Proof Simulation | Extended Practice |
|---|---|---|---|---|
| Score (correct/total) | ✓ | ✓ | ✓ (after 24hr delay) | ✓ |
| Per-question review | ✓ | ✓ | ✓ | ✓ |
| Rationales | ✓ (during) | ✓ (post) | ✓ (post) | ✓ |
| Mastery delta per node | ✓ | ✓ | ✓ | ✓ |
| Readiness Score change | ✓ | ✓ | ✓ | ✓ |
| Error type prompt | ✓ (per wrong answer) | ✓ (post) | ✓ (post) | ✓ |
| Accuracy by block chart | — | — | — | ✓ |
| Pressure gap analysis | — | — | ✓ | — |
| Pacing analysis | — | — | ✓ | ✓ |
| Time per question | Post only | Post only | Post only | Post only |

**Important UX constraint:** Time per question is never shown during a live session. `time_spent_ms` is captured silently in `user_interactions`. Showing it live creates monitoring anxiety (Carver & Scheier, 1981) — students start watching their own timing instead of thinking about the question.

---

## 12. The Session Config JSONB — Full Reference

`quiz_sessions.config` stores everything needed to reconstruct how a session was configured. This is the canonical source of truth for session type in absence of the `source` field.

**All supported `source` values:**
```
camp_mode
chill_mode  
subject_mode
focus_review
custom_session
storm_mode
proof_simulation
extended_practice
assessment_quiz
trail_quiz         (quiz step within a Camp Trail)
blindspot_queue    (linked to a blindspot_queues row)
```

**The `source` field is critical for analytics.** Without it, `test_mode = 'camp'` could be Camp Mode, Subject Mode, Chill Mode, or a Trail quiz. The `source` field distinguishes them for per-mode usage analytics.

---

## 13. Schema Gaps — What Needs to Be Added

Based on the DB audit and this document, the following additions are needed before certain features can function correctly:

### Gap 1 — `user_endurance_profiles` table (BLOCKS Proof Simulation gate)
Extended Practice cannot compute the endurance gate for Proof Simulation without this table. Flagged as critical in the DB audit v3.

### Gap 2 — `is_endurance_session` on `quiz_sessions`
```sql
ALTER TABLE public.quiz_sessions
  ADD COLUMN IF NOT EXISTS is_endurance_session BOOLEAN NOT NULL DEFAULT false;
```

### Gap 3 — `accuracy_by_block` on `quiz_sessions`
```sql
ALTER TABLE public.quiz_sessions
  ADD COLUMN IF NOT EXISTS accuracy_by_block JSONB DEFAULT '[]';
```

### Gap 4 — `source_type` on `user_interactions` (for EMA weight differentiation)
```sql
ALTER TABLE public.user_interactions
  ADD COLUMN IF NOT EXISTS source_type TEXT DEFAULT 'quiz'
  CHECK (source_type IN ('quiz', '3d_lab', 'assessment', 'ei_prompt'));
-- Allows 3D Lab interactions to carry a bonus weight multiplier
-- Allows assessment answers to be tracked separately from regular quiz performance
```

### Gap 5 — `sub_scores` in `readiness_score_snapshots` never populated
The `snapshot_readiness_on_session_complete` trigger writes `'{}'::jsonb` every time. Must be updated to compute per-subject sub-scores (ALE-HIST: 0.72, ALE-STRC: 0.49, etc.) from the session's `user_node_mastery` rows, grouped by subject.

### Gap 6 — `feature_flags` table is empty
The paywall cannot function. Must seed the 10 feature flags before launch:
```
readiness_score_live, taxonomy_heatmap_full, questions_all_difficulty,
camp_trails_full_library, blindspot_protocol, endurance_cycle,
proof_simulation, 3d_lab_full, analytics_dashboard_full, ai_assistant_unlimited
```

### Gap 7 — `free_questions_today` counter on `user_global_stats`
Free tier 20 questions/day cap has no enforcement mechanism in the schema:
```sql
ALTER TABLE public.user_global_stats
  ADD COLUMN IF NOT EXISTS free_questions_today INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS free_questions_reset_date DATE DEFAULT CURRENT_DATE;
```

---

## 14. Pricing Gate Summary

| Feature | Free | Pro | Institutional |
|---|---|---|---|
| Camp Mode | ✓ Easy questions · 20/day cap | ✓ All difficulties · unlimited | ✓ Unlimited |
| Chill Mode | ✓ Limited | ✓ Full | ✓ Full |
| Subject Mode | ✗ Locked | ✓ | ✓ |
| Focus Review (Blindspot) | ✗ Locked | ✓ | ✓ |
| Custom Session | ✗ Locked | ✓ | ✓ |
| Storm Mode | ✗ Locked | ✓ | ✓ |
| Full Exam Simulation | ✗ Locked | ✓ (gated at 65%) | ✓ |
| Extended Practice | ✗ Locked | ✓ | ✓ |
| Assessment Quiz | ✓ Once, free | ✓ Repeatable | ✓ Cohort-assigned |
| Readiness Score | Assessment reveal only | Always live | Always live + cohort view |
| Metacognitive Calibration | ✗ Locked | ✓ | ✓ |
| Error Taxonomy | Partial | ✓ Full + Analytics | ✓ Full |
| Feynman Teach-Back (Phase 3) | ✗ | ✓ | ✓ |

---

## 15. The Governing Test for Every Testing Feature

Every decision about the testing system — what to show, what to hide, when to give feedback, how to structure a session — is evaluated by one question:

**"Does this make a student more likely to pass their board exam?"**

Applied to specific decisions:
- Why no time-per-question display during sessions: Monitoring anxiety reduces performance. Not showing it → more likely to pass.
- Why Storm Mode timer color never goes red: Red triggers physiological stress. Orange instead → more likely to pass.
- Why Proof Simulation has a 24-hour cold delivery: Score anchoring anxiety in the immediate aftermath reduces the instructional value. Delayed delivery → more likely to pass.
- Why Extended Practice sessions push 10–15% past the comfortable window: Progressive overload builds sustainable stamina. Comfort zone training produces plateau. Extending it → more likely to pass.
- Why there are no badges for completing sessions: Badges reward activity, not mastery. Students optimize for badge collection, not learning. Removing badges → more likely to pass.

---

*SlateCamp — Review & Testing System · Comprehensive Product & Data Document*  
*Version 1.0 · March 2026 · Internal · Engineering + Product Reference*  
*Based on: DATABASE_SCHEMA.sql (production) · Product Architecture v2.1 · DB Audit v3 · UX Research sessions*
