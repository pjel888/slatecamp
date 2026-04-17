# SlateCamp — Product Architect Database Audit v3
**Date:** March 2026  
**Schema:** Live production · 2026-03-19 · 33 tables · 9 enums · 7 functions · 26 triggers · 63 RLS policies · 94 indexes  
**Architecture ref:** Product Architecture v2.1  
**Audit lens:** Can the database actually *execute* every mechanic described in the architecture end-to-end — not just store data, but power every workflow, state machine, gating rule, and data signal?

---

## How to Read This Audit

Each feature is rated against **five dimensions**, not just "does the table exist":

| Dimension | Question |
|---|---|
| **Storage** | Can the data be stored? |
| **State machine** | Can the feature's full lifecycle (pending → active → completed etc.) be tracked? |
| **Gating** | Can the feature be locked/unlocked per the paywall rules? |
| **Queries** | Can the application compute what it needs — scores, recommendations, signals — without missing data? |
| **Automation** | Do triggers/functions enforce business logic that must not be left to application code? |

---

## Executive Verdict

The architecture document's Build Status Registry is **significantly out of date**. It lists Schema Ready = **No** for Blindspot Protocol, Proof Simulation, Assessment Quiz, Camp Trail, and all Phase 1–3 integrations. **Every single one of those is wrong.** The database is substantially ahead of the architecture document's own self-assessment.

The one real gap — the only feature with zero schema coverage — is the **Endurance Cycle**. Everything else is either fully implemented, partially implemented, or application-layer only (no schema needed).

There are also **four operational gaps** that will cause features to silently fail at runtime even though the tables exist: SRS scheduling, score reveal state tracking, free-tier daily cap enforcement, and the `feature_flags` table being completely empty.

---

## Part 1 — The Core Loop

### Verdict: ✅ Fully Executable — Trigger-Automated

The architecture's central data pipeline:

```
Student interaction → user_interactions → user_node_mastery → Readiness Score + Heatmap → Progression mechanics
```

**Every link is live and automated. No application code has to orchestrate this manually.**

| Link | Mechanism | Status |
|---|---|---|
| Answer submitted → `user_interactions` | Direct INSERT via Server Action | ✅ |
| Answer flagged for lucky guess | `trg_flag_lucky_guess` BEFORE INSERT trigger | ✅ |
| `user_node_mastery` updated | Application writes EMA after session | ✅ |
| Mastery change → `user_mastery_history` | `trg_log_mastery_history` AFTER UPDATE trigger | ✅ |
| Session completes → `readiness_score_snapshots` | `trg_snapshot_readiness` AFTER UPDATE trigger | ✅ |
| Day completion → enrollment state | `trg_day_completion_update_enrollment` AFTER INSERT trigger | ✅ |
| Step completion → `last_activity_at` | `trg_progress_update_enrollment` AFTER INSERT trigger | ✅ |

**The trigger chain is correct and complete.** One notable detail: `snapshot_readiness_on_session_complete()` reads from `user_global_stats.global_readiness_score` and only fires if it's `> 0` — meaning the first session never produces a snapshot until the application has written an initial Readiness Score to `user_global_stats`. This is fine by design but the application must write to `global_readiness_score` on first session completion.

---

## Part 2 — Feature-by-Feature Analysis

---

### 2.1 Wiki — Knowledge Base

**Architecture says:** SME-authored · taxonomy-mapped · bidirectional links · highlight-to-note · Elaborative Interrogation prompts

**Overall verdict: ✅ Fully executable**

| Mechanic | Schema element | Verdict |
|---|---|---|
| Store article content | `wiki_articles.content TEXT` | ✅ |
| Map article to taxonomy nodes | `wiki_article_taxonomy (article_id, node_id, is_primary)` | ✅ |
| Multiple node mappings per article | Junction table, many-to-many | ✅ |
| Primary node designation | `wiki_article_taxonomy.is_primary BOOLEAN` | ✅ |
| Bidirectional link → questions | `questions.topic_id → taxonomy_tree ← wiki_article_taxonomy.node_id` | ✅ |
| Bidirectional link → 3D models | `spatial_hotspots.node_id → taxonomy_tree` | ✅ |
| Bidirectional link → notes | `notes.article_id` FK + `notes.topic_id` FK | ✅ |
| Highlight-to-note (auto-tagged) | `notes.article_id` + `notes.topic_id` both writeable | ✅ |
| Content review workflow | `wiki_articles.status`, `reviewed_by`, `reviewed_at`, `reviewer_comments` | ✅ (beyond arch spec) |
| Elaborative Interrogation | `wiki_articles.content TEXT` stores `[EI_PROMPT]` tags | ✅ (authoring convention, no schema change needed) |

**Bonus:** The schema has a full SME review workflow (`status: draft/published/archived`, `reviewed_by`, `reviewed_at`, `reviewer_comments`) that the architecture doesn't even specify. This is correctly implemented and will be valuable when SMEs are authoring content.

**Nothing to fix.**

---

### 2.2 Quiz Engine — Camp Mode

**Architecture says:** Immediate feedback · algorithmic remediation · spaced repetition scheduling via SRS intervals · IRT weighting · up to 100 items

**Overall verdict: 🟡 Partially executable — SRS has no scheduling table**

**What works perfectly:**

| Mechanic | Schema element | Verdict |
|---|---|---|
| IRT fields | `questions.difficulty_rating`, `discrimination_rating` | ✅ |
| Lucky guess detection | `user_interactions.is_suspected_lucky_guess` via `trg_flag_lucky_guess` | ✅ |
| Rationale/explanation per question | `questions.rationale`, `questions.explanation` | ✅ |
| Code citation per question | `questions.code_citation` | ✅ |
| Wrong answer → Wiki link | `questions.topic_id → taxonomy_tree ← wiki_article_taxonomy` | ✅ |
| Session config/length | `quiz_sessions.config JSONB`, `question_ids UUID[]`, `subject_ids UUID[]` | ✅ |
| Syllabus Selector targeting | `quiz_sessions.subject_ids UUID[]` | ✅ |
| Time per question | `user_interactions.time_spent_ms INTEGER` | ✅ |
| Answer changes tracked | `user_interactions.answer_changes INTEGER` | ✅ |
| Options eliminated | `user_interactions.options_eliminated INTEGER` | ✅ |
| Per-question confidence | `user_interactions.confidence TEXT ('sure'/'unsure')` | ✅ |
| Rationale reading time | `user_interactions.rationale_view_ms INTEGER` | ✅ |
| Question ordering (for stamina charts) | `user_interactions.question_order INTEGER` | ✅ |
| Assessment item flagging | `questions.is_assessment BOOLEAN` | ✅ |

**The gap — SRS Scheduling:**

The architecture explicitly states:
> "Spaced repetition scheduling: items due for review are surfaced via SRS intervals"

SRS requires knowing *when* a specific item is due for review. The schema has:
- `user_node_mastery.last_encountered TIMESTAMPTZ` — when the node was last seen
- `user_node_mastery.current_mastery_weight FLOAT8` — a rolling EMA score

These can approximate SRS (low weight + long time since encounter = due for review) but this is a **heuristic, not a real SRS algorithm**. A proper SM-2 or similar SRS algorithm needs:

```sql
-- Missing — needed for true SRS
ALTER TABLE public.user_node_mastery
    ADD COLUMN srs_due_at         TIMESTAMPTZ,    -- when this node is scheduled for next review
    ADD COLUMN srs_interval_days  INTEGER DEFAULT 1,
    ADD COLUMN srs_ease_factor    FLOAT8  DEFAULT 2.5;
```

Or alternatively, an item-level SRS queue (more granular, for individual question scheduling):

```sql
CREATE TABLE public.srs_queue (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID NOT NULL REFERENCES auth.users(id),
    question_id   UUID NOT NULL REFERENCES public.questions(question_id),
    topic_id      UUID REFERENCES public.taxonomy_tree(node_id),
    due_at        TIMESTAMPTZ NOT NULL,
    interval_days INTEGER NOT NULL DEFAULT 1,
    ease_factor   FLOAT8  NOT NULL DEFAULT 2.5,
    repetition    INTEGER NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ DEFAULT now(),
    UNIQUE (user_id, question_id)
);
```

**Impact: High.** SRS is not a minor enhancement — it's stated as a built Camp Mode mechanic. Without it, the quiz engine surfaces questions by topic difficulty, not by learned interval. Students won't encounter correctly-spaced review, which is a core retention promise.

**Recommendation:** Node-level SRS columns on `user_node_mastery` (Option A) is the minimum viable path. Do it now alongside the Camp Trail sprint, not later.

---

### 2.3 Quiz Engine — Storm Mode

**Architecture says:** No feedback until submission · strict timer · no pausing · up to 200 items · `is_proof_simulation` flag

**Overall verdict: ✅ Fully executable**

| Mechanic | Schema element | Verdict |
|---|---|---|
| Storm Mode as a session type | `quiz_sessions.test_mode: 'timed'` | ✅ |
| Proof Simulation flag | `quiz_sessions.is_proof_simulation BOOLEAN` | ✅ |
| Cold score delivery | `readiness_score_snapshots.is_proof_simulation BOOLEAN` | ✅ |
| No feedback mid-session | Application UI layer — no schema needed | ✅ |
| Post-session item review | All answers in `user_interactions` queryable post-session | ✅ |
| 200 item capacity | `quiz_sessions.question_ids UUID[]` — no cap enforced | ✅ |
| Timer enforcement | `quiz_sessions.config JSONB` can store time limits | ✅ |

**Nothing to fix.**

---

### 2.4 Notes Workspace

**Architecture says:** Auto-tagging · temporal resurface · JSONB block editor · cloze deletion · cross-device sync

**Overall verdict: 🟡 Partially executable — temporal resurface is passive not proactive**

**What works:**

| Mechanic | Schema element | Verdict |
|---|---|---|
| JSONB block editor | `notes.content JSONB DEFAULT '[]'` | ✅ |
| Auto-tag to taxonomy | `notes.topic_id → taxonomy_tree` | ✅ |
| Auto-tag to source article | `notes.article_id → wiki_articles` | ✅ |
| Auto-tag to source question | `notes.question_id → questions` | ✅ |
| Auto-tag to source session | `notes.session_id → quiz_sessions` | ✅ |
| Folder organization | `notes.folder_id → note_folders` | ✅ |
| Pinning | `notes.is_pinned BOOLEAN` | ✅ |
| Tags | `notes.tags TEXT[]` | ✅ |
| Cloze deletion | Stored in `content JSONB` block format — no schema needed | ✅ |
| Cross-device sync | Supabase real-time — no schema needed | ✅ |
| Notes queryable by topic | `idx_notes_user_topic` partial index exists | ✅ |

**The gap — Temporal Resurface is passive:**

The architecture says:
> "A note written in second year of college resurfaces at exactly the right moment during board review, because the system knows the subject connection."

The schema can *support* surfacing notes by topic when a session starts — `SELECT * FROM notes WHERE topic_id = $node_id AND user_id = $uid` works and is indexed. But "resurfaces at exactly the right moment" implies proactive delivery, not just availability.

There is no:
- `next_resurface_at TIMESTAMPTZ` column on `notes`
- Any trigger or scheduled job that pushes notes to the dashboard based on current study context
- Any join between `blindspot_queues.node_ids` and `notes.topic_id` to surface relevant notes during a Blindspot session

**Minimum viable fix:** Application code that queries relevant notes at session start — no schema change needed, just disciplined application logic reading from the existing indexed `notes(topic_id)` index. The proactive automatic version requires either a scheduled Edge Function or a trigger on `blindspot_queues` INSERT that surfaces matching notes.

---

### 2.5 Analytics Dashboard

**Architecture says:** Readiness Trajectory · Pacing vs. Accuracy scatter · Cognitive Stamina chart · Subject Mastery Profile radar · Memory Health table · Pacing Leaks panel · Raw stat bar

**Overall verdict: ✅ Fully executable**

Every dashboard component maps directly to queryable data that exists:

| Component | Data source | Query | Verdict |
|---|---|---|---|
| Readiness Trajectory (line) | `readiness_score_snapshots` ordered by `computed_at` | `SELECT score, computed_at WHERE user_id = uid ORDER BY computed_at` | ✅ |
| Pacing vs. Accuracy (scatter) | `user_interactions.time_spent_ms` + `is_correct` grouped by `topic_id` subject area | Aggregation query | ✅ |
| Cognitive Stamina (accuracy by question number) | `user_interactions.question_order` + `is_correct` within a session | `SELECT question_order, is_correct WHERE session_id = sid ORDER BY question_order` | ✅ |
| Subject Mastery Profile (radar) | `user_node_mastery.current_mastery_weight` grouped by subject area | Aggregation via `taxonomy_tree.subject_area` | ✅ |
| Memory Health table | `user_node_mastery` all columns + `last_encountered` | Per-node query | ✅ |
| Pacing Leaks (slow subjects) | `user_interactions.time_spent_ms` aggregated by subject | Aggregation query | ✅ |
| Raw stat bar | `user_global_stats` + `user_interactions` aggregation | Count queries | ✅ |

**The `question_order` column** is what makes the Cognitive Stamina chart possible. Without it, you cannot reconstruct "accuracy at question 30 vs question 80" within a session. It exists. The chart is fully buildable.

**Nothing to fix.**

---

### 2.6 3D Lab

**Architecture says:** 186 WebGL modules · parametric sandbox · guided tour mode · in-canvas quizzing · hotspot annotations · Phase 2: Worked Example Progression (Guided → Faded → Independent)

**Overall verdict: 🟡 Infrastructure complete, content empty, Phase 2 needs schema addition**

| Mechanic | Schema element | Verdict |
|---|---|---|
| Model registry | `models_3d (model_id, name, slug, url, thumbnail)` — 0 rows | ✅ schema / ❌ content |
| Hotspot annotations | `spatial_hotspots (position_x, position_y, position_z, node_id, title, description)` — 0 rows | ✅ schema / ❌ content |
| Link hotspot to taxonomy | `spatial_hotspots.node_id → taxonomy_tree` | ✅ |
| Link hotspot to Wiki | Via `node_id → wiki_article_taxonomy` | ✅ |
| In-canvas quiz triggering | `spatial_hotspots.node_id → questions WHERE topic_id` | ✅ |
| Free tier preview mode | `feature_flags` + `user_subscriptions.tier` | 🟡 (flags empty — see below) |
| Content review workflow | `models_3d.status`, `reviewed_by`, `reviewed_at`, `metadata JSONB` | ✅ (beyond arch spec) |

**Phase 2 gap — Worked Example Progression:**

The architecture specifies three interaction phases for Phase 2: Guided → Faded → Independent. Neither `models_3d` nor `spatial_hotspots` has an `interaction_mode` column. When Phase 2 begins:

```sql
ALTER TABLE public.models_3d
    ADD COLUMN supported_modes TEXT[] DEFAULT '{guided}'
    -- Options: 'guided', 'faded', 'independent'
    -- A single model can support all three; UI gates based on user's current mode
```

Or if interaction mode is per-session (student progresses through modes):
```sql
ALTER TABLE public.user_trail_progress
    ADD COLUMN lab_interaction_mode TEXT
    CHECK (lab_interaction_mode IN ('guided', 'faded', 'independent'));
```

**Not urgent now. Add before Phase 2 build begins.**

---

### 2.7 AI Reference Assistant

**Architecture says:** Bounded RAG · Temperature 0.0 · 3 queries/day (free) · unlimited (Pro) · hallucination reporting · Socratic protocol

**Overall verdict: 🟡 RAG source exists, but free-tier rate limiting and hallucination reporting have no schema**

| Mechanic | Schema element | Verdict |
|---|---|---|
| RAG source — wiki content | `wiki_articles.content TEXT` | ✅ |
| RAG source — rationales | `questions.rationale`, `questions.explanation` | ✅ |
| RAG source — code citations | `questions.code_citation` | ✅ |
| Mandatory citations (clickable) | Application layer — wiki articles fetched by node_id | ✅ |
| Pro = unlimited queries | `user_subscriptions.tier = 'pro'` | ✅ |
| Free = 3 queries/day | **No tracking mechanism exists** | ❌ |
| Hallucination reporting | **No AI response log exists** | ❌ |

**Gap 1 — Free tier query limit (3/day):**

There is no counter, no timestamp, and no quota mechanism. The most lightweight solution uses the existing `analytics_events` table that already exists (0 rows):

```sql
-- Zero-migration solution: write AI query events to analytics_events
-- INSERT INTO analytics_events (user_id, event_name) VALUES (uid, 'ai_query')
-- Then enforce limit with: SELECT COUNT(*) WHERE user_id = uid AND event_name = 'ai_query' AND created_at > today()
```

This works with zero migration — `analytics_events` exists, is indexed on `(user_id, created_at DESC)`, and handles this cleanly.

**Gap 2 — Hallucination Reporting:**

The architecture says: "Students can flag a response as potentially incorrect. Flagged responses are reviewed by an SME."

This requires storing AI responses. Currently nothing is stored. When the AI assistant ships:

```sql
CREATE TABLE public.ai_interactions (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID NOT NULL REFERENCES auth.users(id),
    session_id       UUID REFERENCES public.quiz_sessions(session_id),
    question_id      UUID REFERENCES public.questions(question_id),
    entry_point      TEXT NOT NULL CHECK (entry_point IN ('wrong_answer', 'wiki_ask', 'teach_back')),
    wiki_node_ids    UUID[] DEFAULT '{}',
    prompt_text      TEXT NOT NULL,
    response_text    TEXT NOT NULL,
    citations        JSONB DEFAULT '[]',
    flagged          BOOLEAN DEFAULT false,
    flagged_at       TIMESTAMPTZ,
    sme_reviewed     BOOLEAN DEFAULT false,
    created_at       TIMESTAMPTZ DEFAULT now()
);
```

**Not urgent until the AI assistant ships. But must exist before launch.**

---

### 2.8 Blindspot Protocol

**Architecture Build Status says:** Schema Ready = **No**  
**Actual schema state:** `blindspot_queues` table fully exists in production with complete lifecycle support.

**Overall verdict: ✅ Fully executable — architecture document is wrong about its own status**

| Mechanic | Schema element | Verdict |
|---|---|---|
| Nightly scan — identify Red/Grey nodes | Query `user_node_mastery WHERE current_mastery_weight < 0.4 OR total_attempts < 5` | ✅ |
| Weakest 3 nodes | `ORDER BY current_mastery_weight ASC LIMIT 3` | ✅ |
| Generate 10–15 item queue | INSERT into `blindspot_queues` with `node_ids UUID[]` | ✅ |
| Draw questions from weak nodes | `questions WHERE topic_id = ANY(node_ids)` | ✅ |
| Persistent dashboard presence | `SELECT WHERE user_id = uid AND status IN ('pending', 'in_progress')` | ✅ |
| 48-hour deferral mechanic | `blindspot_queues.deferred_until TIMESTAMPTZ` | ✅ |
| 5-state lifecycle | `status: pending / deferred / in_progress / completed / expired` | ✅ |
| Pre-queue mastery snapshot | `blindspot_queues.pre_queue_mastery JSONB` | ✅ (beyond arch spec) |
| Post-queue mastery snapshot | `blindspot_queues.post_queue_mastery JSONB` | ✅ (beyond arch spec) |
| Nodes improved count | `blindspot_queues.nodes_improved INTEGER` | ✅ (beyond arch spec) |
| Node reclassification post-queue | Query `user_node_mastery` vs thresholds after completion | ✅ |

**The `pre_queue_mastery` and `post_queue_mastery` JSONB columns are not in the architecture spec.** They were added to the schema and are excellent additions — they allow measuring the before/after delta of every Blindspot session, which is the most direct evidence of the mechanic's effectiveness.

**What's still needed:** The Supabase **Edge Function** that runs the nightly scan. The data infrastructure is 100% ready — this is purely a cron-job/serverless build task.

---

### 2.9 Endurance Cycle

**Architecture Build Status says:** Schema Ready = **No**  
**Actual schema state:** Confirmed — **zero schema**. This is the only feature in the entire platform with no database infrastructure at all.

**Overall verdict: 🔴 Cannot be built — no schema exists**

The architecture describes five mechanics, none of which have schema support:

| Mechanic | What's needed | Schema | Verdict |
|---|---|---|---|
| Baseline calibration — observe session length and accuracy decay | Track per-session reliable accuracy window | ❌ | Missing |
| Store the Endurance Baseline | `endurance_baseline_items INTEGER` | ❌ | Missing |
| Track current endurance window | `endurance_window_items INTEGER` | ❌ | Missing |
| Mark sessions as Endurance Sessions | `quiz_sessions.is_endurance_session BOOLEAN` | ❌ | Missing |
| Accuracy-over-duration (10-item blocks) | Per-session block accuracy | ❌ | Missing |
| Plateau detection (2+ week stall) | Week-over-week window growth tracking | ❌ | Missing |
| Endurance window vs exam duration comparison | `endurance_target_items INTEGER` (exam duration in items) | ❌ | Missing |

**What currently exists that partially helps:**
- `user_interactions.question_order INTEGER` — can reconstruct block accuracy post-hoc via query
- `user_interactions.time_spent_ms` — provides pacing data
- `user_computed_signals` — the right home for derived endurance signals

**Required migrations before any Endurance Cycle work can begin:**

```sql
-- On user_computed_signals — store derived endurance state
ALTER TABLE public.user_computed_signals
    ADD COLUMN endurance_baseline_items  INTEGER,     -- established in calibration week
    ADD COLUMN endurance_window_items    INTEGER,     -- current reliable performance window
    ADD COLUMN endurance_target_items    INTEGER,     -- exam total items (e.g. 150 for ALE)
    ADD COLUMN endurance_last_updated    TIMESTAMPTZ;

-- On quiz_sessions — mark which sessions are endurance protocol sessions
ALTER TABLE public.quiz_sessions
    ADD COLUMN is_endurance_session BOOLEAN DEFAULT false;

-- Optional but recommended: store block accuracy per session (avoids expensive re-computation)
ALTER TABLE public.quiz_sessions
    ADD COLUMN accuracy_by_block JSONB DEFAULT '[]';
    -- [{block: 1, correct: 9, total: 10, accuracy: 0.90}, ...]
    -- Written by application on session completion
```

**This also blocks Proof Simulation.** The Proof Simulation competence gate requires:
> "≥70% of taxonomy nodes at Amber or above AND Endurance window covers ≥80% of exam duration"

The first condition (≥70% nodes Amber+) is queryable. The second condition (`endurance_window_items ≥ 0.8 × endurance_target_items`) **requires `endurance_window_items` to exist**. Proof Simulation cannot be fully activated until the Endurance Cycle schema is in place.

---

### 2.10 Proof Simulation

**Architecture Build Status says:** Schema Ready = **No**  
**Actual schema state:** The core flags exist. Partially blocked by Endurance gap.

**Overall verdict: 🟡 Mostly executable — blocked only by Endurance gate**

| Mechanic | Schema element | Verdict |
|---|---|---|
| Flag session as proof simulation | `quiz_sessions.is_proof_simulation BOOLEAN` | ✅ |
| Flag score as pressure-tested | `readiness_score_snapshots.is_proof_simulation BOOLEAN` | ✅ |
| Index for fast proof snapshot retrieval | `idx_readiness_snapshots_user_proof` on `(user_id, computed_at DESC, is_proof_simulation)` | ✅ |
| Competence gate — ≥70% nodes Amber+ | Query `user_node_mastery WHERE current_mastery_weight >= 0.4` — count vs total nodes | ✅ |
| Competence gate — Endurance ≥80% | Requires `endurance_window_items` — DOES NOT EXIST | ❌ |
| Exam-condition session | `test_mode: 'timed'` + `is_proof_simulation: true` | ✅ |
| 24-hour diagnostic delay | Application layer — enforce in UI, no schema needed | ✅ |
| Cold score delivery | `readiness_score_snapshots` filtered by `is_proof_simulation` | ✅ |
| Recalibrated pressure-tested score | `is_proof_simulation` differentiates pressure-tested vs daily scores | ✅ |

**One migration needed before activation (see Endurance section).**

---

### 2.11 Camp Trail — Flagship Feature

**Architecture Build Status says:** Schema Ready = **Partial**  
**Actual schema state:** Every table, enum, trigger, and index is in production.

**Overall verdict: ✅ Fully executable — architecture underestimates its own progress**

| Architecture element | Schema | Status |
|---|---|---|
| `camp_trails` with all fields | `trail_id, discipline_id, name, slug, trail_type, intensity, duration_days, total_steps, is_published, is_featured, recommended_min/max_score` | ✅ |
| `trail_days` | `day_id, trail_id, day_number, title, estimated_minutes`, UNIQUE(trail_id, day_number) | ✅ |
| `trail_steps` with all fields | `step_type enum, target_node_ids UUID[], question_count, difficulty_min/max, article_id FK, model_id FK, estimated_minutes, is_optional, preferred_time` | ✅ |
| `user_trail_enrollments` | `status enum, current_day, days_completed, last_activity_at, paused_at, completed_at, target_completion_date, readiness_score_at_start, pace_status`, UNIQUE(user_id, trail_id) | ✅ |
| `user_trail_progress` | `enrollment_id, step_id, session_id, time_spent_ms`, UNIQUE(enrollment_id, step_id) | ✅ |
| `trail_day_completions` | `enrollment_id, day_id, readiness_score_at_completion`, UNIQUE(enrollment_id, day_id) | ✅ |
| `session_trail_credits` | PK `(session_id, enrollment_id, step_id)` — simultaneous enrollment attribution | ✅ |
| All 4 enums | `trail_type, trail_intensity, trail_step_type, trail_enrollment_status` | ✅ |
| `target_node_ids UUID[]` (not `question_ids`) | Correct design decision — queries live pool at runtime | ✅ |
| Sleep-Aware Scheduling | `trail_steps.preferred_time TEXT` | ✅ |
| Auto-increment days_completed | `trg_day_completion_update_enrollment` trigger | ✅ |
| Auto-update last_activity_at | `trg_progress_update_enrollment` trigger | ✅ |
| Score delta (start vs. end) | `readiness_score_at_start` + `trail_day_completions.readiness_score_at_completion` | ✅ |
| Assessment → recommendation | `camp_trails.recommended_min_score` + `recommended_max_score` + `user_global_stats.target_exam_date` | ✅ |

**Live data as of 2026-03-19:** 1 trail · 56 days · 21 steps. The system is not just schema-ready — it has content.

**Nothing to fix for Camp Trail.**

---

### 2.12 Assessment Quiz & Onboarding

**Architecture Build Status says:** Schema Ready = **Partial**  
**Actual schema state:** All priority 2 columns exist. One operational gap.

**Overall verdict: 🟡 Nearly fully executable — missing "shown once" state tracking**

| Mechanic | Schema element | Verdict |
|---|---|---|
| Assessment item flagging | `questions.is_assessment BOOLEAN DEFAULT false` | ✅ |
| Index for fast assessment retrieval | `idx_questions_assessment WHERE is_assessment = true` | ✅ |
| Record assessment completion | `user_global_stats.assessment_completed_at TIMESTAMPTZ` | ✅ |
| Store initial score | `user_global_stats.assessment_score DOUBLE PRECISION` | ✅ |
| Trail recommendation inputs | `assessment_score` + `user_global_stats.target_exam_date` → `camp_trails.recommended_min/max_score` | ✅ |

**The gap — Score Reveal "shown once" state:**

The architecture specifies:
> "Free users see this screen once. After this, the score widget on the dashboard shows a locked state."

There is no column tracking whether the score reveal has been consumed for a free user. `assessment_completed_at` tells you the quiz was done, but not whether the reveal was shown and consumed.

```sql
-- Needed to enforce "shown once" for free users
ALTER TABLE public.user_global_stats
    ADD COLUMN score_reveal_shown_at TIMESTAMPTZ;  -- null = not yet shown; timestamp = already consumed
```

Without this, the application has no reliable way to determine whether to show the score reveal screen vs. the locked state, or it has to use `assessment_completed_at` as a proxy (which is imprecise — the user could have completed the assessment but never seen the reveal).

**Assessment question bank:** 34 questions total in the bank. The architecture requires exactly 35 (5 per ALE subject × 7 subjects) with `is_assessment = true` and high `discrimination_rating`. Confirm how many currently have `is_assessment = true` — if fewer than 35, content work is needed.

---

## Part 3 — Phase 1 Integration Audit

---

### 3.1 Metacognitive Calibration Training

**Architecture says:** Schema Ready = **No** | **Actual state: ✅ Column exists**

```sql
quiz_sessions.pre_session_confidence_ratings JSONB DEFAULT '{}'
-- e.g. {"LAWS": 2, "STRUCT": 3, "UTIL": 1, "HIST": 2, "SITE": 3, "DESIGN": 1, "PROF": 2}
```

**Can the full feature be executed?**

| Mechanic | Executable? |
|---|---|
| Store pre-session confidence ratings | ✅ Column exists |
| Query confidence vs actual accuracy per session | ✅ Join `pre_session_confidence_ratings` with `user_interactions` outcomes |
| Show calibration chart post-session | ✅ Computed from existing data |
| Track calibration accuracy trend over time | 🟡 No stored calibration score signal yet |

**Gap — No stored calibration score signal:**

The architecture notes this generates "a new data signal — calibration score, separate from mastery score." Currently there's nowhere to store this derived signal for longitudinal tracking.

```sql
ALTER TABLE public.user_computed_signals
    ADD COLUMN calibration_accuracy       FLOAT8,  -- 0.0–1.0; how well predictions match outcomes
    ADD COLUMN calibration_updated_at     TIMESTAMPTZ;
```

Schema work: column exists. UI work: pre-session slider + post-session chart still needed. Signal storage: 1 column addition needed.

---

### 3.2 Error Taxonomy

**Architecture says:** Schema Ready = **No** | **Actual state: ✅ Column exists**

```sql
user_interactions.error_type TEXT
-- 'knowledge_gap' | 'misread' | 'distractor' | 'code_version' | 'time_pressure' | null
```

**Can the full feature be executed?**

| Mechanic | Executable? |
|---|---|
| Store error type per wrong answer | ✅ Column exists |
| Query aggregate error patterns by user | ✅ `SELECT error_type, COUNT(*) WHERE user_id = uid GROUP BY error_type` |
| Route to different interventions | ✅ Application logic reads `error_type` and routes accordingly |
| Feed AI Reference Assistant context | ✅ `error_type` readable at wrong-answer trigger point |
| Surface systemic content issues | ✅ Admin aggregate query across all users |

**Nothing missing.** Schema work is done. UI work (post-wrong-answer prompt) still needed.

---

### 3.3 Elaborative Interrogation

**Architecture says:** Schema change: None | **Actual state: ✅ Correctly no schema needed**

The `wiki_articles.content TEXT` column stores `[EI_PROMPT]` tags as part of article content. The Wiki renderer intercepts these at display time. Student responses are deliberately not stored. **This is correct architecture.**

Nothing to add.

---

### 3.4 Sleep-Aware Scheduling

**Architecture says:** Schema Ready = **No** | **Actual state: ✅ Both columns exist**

```sql
trail_steps.preferred_time TEXT DEFAULT 'any'  -- 'morning' | 'evening' | 'any'
profiles.preferred_study_window TEXT DEFAULT 'any'  
    CHECK (preferred_study_window IN ('morning', 'evening', 'both', 'any'))
```

The `profiles` table has `'both'` as an option, which is more nuanced than the architecture specifies. The trail sequencing logic just needs to be written — it reads `profiles.preferred_study_window` and filters/reorders `trail_steps` by `preferred_time`. **Schema is complete.**

---

## Part 4 — Phase 2 & 3 Integration Audit

---

### 4.1 Contextual Variation Practice (Phase 2)

**Architecture says:** Schema Ready = **No** | **Actual state: ✅ Column exists in production**

```sql
questions.application_context TEXT
CHECK (application_context IN (
    'recall', 'calculation', 'design_application', 'code_interpretation', 'client_scenario'))
```

The index `idx_questions_application_context ON questions (topic_id, application_context)` also exists, meaning contextual variation queries are index-optimized. **This Phase 2 feature has complete schema support today.** Only quiz generation logic needs to be written.

---

### 4.2 Successive Relearning (Phase 2)

**Architecture says:** No schema needed — application logic

The re-study loop (wrong answer → 3–5 question intensive loop) can be orchestrated via application code reading `user_node_mastery` (low weight = re-study needed) and `quiz_sessions.config JSONB` (store loop state per session). **No migration needed.**

---

### 4.3 Feynman Teach-Back (Phase 3)

**Architecture says:** Schema Ready = **No** | **Actual state: ✅ Full schema exists in production**

Both Phase 3 tables are live:

| Table | Columns | Status |
|---|---|---|
| `teach_back_submissions` | `submission_id, user_id, topic_id, entry_point, trail_day_id, prompt_text, student_response, evaluation_result JSONB, gaps_identified TEXT[], revised_response, submitted/revised_at` | ✅ |
| `topic_teach_back_criteria` | `criteria_id, topic_id, required_concepts TEXT[], required_exceptions TEXT[], common_misconceptions TEXT[], code_citations TEXT[], authored_by` | ✅ |

The mastery signals are also live:
- `user_node_mastery.teach_back_attempted BOOLEAN` ✅
- `user_node_mastery.teach_back_gap_count INTEGER` ✅

**All three Phase 5 schema items from the architecture are already in production.** Only application code and SME rubric content remain.

---

### 4.4 Anxiety Inoculation Protocol (Phase 3)

**Architecture says:** Application layer only — no schema needed

Graduated stressors (shortened timers, sequential answering, random order) are all UI/application layer within Storm Mode. `quiz_sessions.config JSONB` can hold pressure protocol parameters. **No migration needed.**

---

## Part 5 — Paywall & Feature Gating

**This is the most operationally critical gap.**

### 5.1 The `feature_flags` Table Is Empty

The architecture describes a detailed paywall:

| Feature | Free | Pro |
|---|---|---|
| Readiness Score | Assessment reveal only | Always live |
| Taxonomy heatmap | Locked/blurred | Full |
| Questions | Easy only · 20/day cap | All · unlimited |
| Camp Trails | 1 basic trail | Full library |
| Blindspot Protocol | Locked | ✓ |
| Proof Simulation | Locked | ✓ |
| 3D Lab | Preview (guided tour only) | Full |
| AI Reference Assistant | 3 queries/day | Unlimited |
| Analytics Dashboard | Locked | Full |

The `feature_flags` table exists with the correct structure (`key, enabled, target_tier[], target_roles[]`) but has **zero rows**. The paywall cannot function until flags are populated.

```sql
-- Example flag population needed:
INSERT INTO public.feature_flags (key, description, enabled, target_tier) VALUES
    ('readiness_score_live', 'Always-live Readiness Score', true, '{pro,enterprise}'),
    ('taxonomy_heatmap_full', 'Full heatmap access', true, '{pro,enterprise}'),
    ('questions_all_difficulty', 'Access to hard/medium questions', true, '{pro,enterprise}'),
    ('camp_trails_full_library', 'Full trail library access', true, '{pro,enterprise}'),
    ('blindspot_protocol', 'Blindspot Protocol mechanic', true, '{pro,enterprise}'),
    ('endurance_cycle', 'Endurance Cycle mechanic', true, '{pro,enterprise}'),
    ('proof_simulation', 'Proof Simulation access', true, '{pro,enterprise}'),
    ('3d_lab_full', '3D Lab full interaction mode', true, '{pro,enterprise}'),
    ('analytics_dashboard_full', 'Full analytics dashboard', true, '{pro,enterprise}'),
    ('ai_assistant_unlimited', 'Unlimited AI Reference queries', true, '{pro,enterprise}');
```

**The paywall cannot go live without this.** Population takes 30 minutes.

### 5.2 Free Tier Daily Cap (20 questions/day) Has No Tracker

The architecture states: "Questions: Easy only · 20/day cap" for free users.

There is no daily question counter anywhere in the schema. No `daily_question_count`, no reset timestamp, nothing.

**Options:**

```sql
-- Option A: Lightweight columns on user_global_stats
ALTER TABLE public.user_global_stats
    ADD COLUMN free_questions_today      INTEGER DEFAULT 0,
    ADD COLUMN free_questions_reset_date DATE DEFAULT CURRENT_DATE;

-- Option B: Use analytics_events (zero migration)
-- COUNT events WHERE event_name = 'question_answered' AND created_at > midnight
-- This uses existing infrastructure but is a heavier query
```

Option A (2 columns) is cleaner and more efficient. **Must be implemented before free tier goes live.**

### 5.3 Pricing Tier — `student` Enum Value Missing

The architecture v2.1 pricing section specifies three paid tiers:
- Student Plan: ₱1,999/semester
- Pro per cycle: ₱6,999/cycle  
- Pro annual: ₱9,999/year

The `subscription_tier` enum only has: `free / pro / enterprise`

```sql
-- Missing:
ALTER TYPE public.subscription_tier ADD VALUE 'student';

-- Also needed — distinguish cycle vs annual billing:
ALTER TABLE public.user_subscriptions
    ADD COLUMN billing_cycle TEXT DEFAULT 'cycle'
    CHECK (billing_cycle IN ('cycle', 'semester', 'annual'));
```

Without `student`, the Student Plan tier cannot be implemented. Without `billing_cycle`, the annual vs. cycle distinction cannot be tracked.

---

## Part 6 — Tables Not in the Architecture Document

The database has several tables the architecture document doesn't mention at all. All are intentional and valuable.

### `profiles` — Enhanced User Profile

Beyond `auth.users`. Contains:
- `user_type TEXT` — `undergrad / reviewee / professional / instructor` (maps to User Types A–D)
- `preferred_study_window TEXT` — Sleep-Aware Scheduling input
- `school_or_institution TEXT` — Institutional B2B data point, campus targeting for marketing
- `target_exam_date DATE` — Note: `profiles` has this as `DATE`, `user_global_stats` has `target_exam_date TIMESTAMPTZ`. Both exist. Keep in sync.
- `onboarding_completed_at TIMESTAMPTZ` — Funnel tracking

### `user_mastery_history` — Immutable Mastery Audit Log

Written by `trg_log_mastery_history` on every `user_node_mastery` update. Powers the Readiness Trajectory chart — this is the data that shows "who you are today, not 3 months ago." Critical to the EMA narrative.

### `user_computed_signals` — Derived Risk/Velocity Signals

| Column | Purpose |
|---|---|
| `score_velocity_7d` | Score change per day over last 7 days |
| `churn_risk_score` | Triple-condition churn flag |
| `days_since_last_session` | Re-engagement trigger |
| `sessions_last_7d` | Activity signal |

Table exists, **0 rows**. The daily Edge Function that computes and writes these signals has not been deployed. Until it runs, all these signals read as 0 — the churn risk system is dark.

### `analytics_events` — First-Party Event Tracking

Table exists, **0 rows**. The 5 funnel micro-events the analytics architecture specifies (sign_up, assessment_start, assessment_complete, score_reveal_view, pro_upgrade) are not being tracked anywhere. **Funnel visibility is completely blind until events are instrumented.**

### `exam_outcomes` — Post-Exam Result Capture (θ Computation)

Table exists, **0 rows**. This is the most strategically critical table for June 2026. The post-exam survey email — deployed 2 days after PRC releases ALE results — must write to this table. Without it, the θ threshold (the Readiness Score level at which P(pass | ALE) > 0.70) can never be computed. The entire "Know you'll win" promise is validated by this data. **Hard deadline: survey pipeline must be built before June exam date.**

### `organizations` + `organization_members` — Phase 2 B2B Infrastructure

Tables exist, **0 rows**. Roles: `owner / admin / instructor / member`. This is the Dean's Dashboard skeleton. Phase 2 institutional analytics aggregation is not yet schema'd (no cohort views, no aggregate heatmap queries), but the membership layer is ready.

---

## Part 7 — Trigger & Function Analysis

All 7 functions and 26 triggers are production-grade. Some specific observations:

### `snapshot_readiness_on_session_complete()` — One Edge Case

```sql
-- The function reads from user_global_stats.global_readiness_score
-- and only fires if global_readiness_score > 0
SELECT NEW.user_id, ugs.global_readiness_score, ...
FROM public.user_global_stats ugs
WHERE ugs.user_id = NEW.user_id 
  AND ugs.global_readiness_score IS NOT NULL 
  AND ugs.global_readiness_score > 0;
```

**Implication:** A student's first session completion will **not** generate a readiness snapshot if `global_readiness_score` is still 0.0 (the default). The application must write an initial Readiness Score to `user_global_stats` before completing the first session, or after, for the trigger to fire on the second session.

**This is by design** (prevents snapshots of meaningless 0-scores), but the application needs to be aware that the first meaningful snapshot only appears after `global_readiness_score` has been computed and written.

### `flag_lucky_guess_on_insert()` — Correctly Implemented

```sql
-- Flags if: correct answer + mastery < 0.4 + answer faster than 40% of avg time
IF v_mastery_weight < 0.4
   AND NEW.time_spent_ms < COALESCE(v_avg_time_ms * 0.4, 5000)
   AND NEW.time_spent_ms > 0
```

This is mathematically reasonable and defensible as a heuristic. The 40% threshold (faster than 40% of the user's own average for that node) is a good signal without being overly aggressive.

### `log_mastery_history_on_update()` — Creates High Row Count

Every `user_node_mastery` update triggers an INSERT into `user_mastery_history`. As the platform scales, this table will grow rapidly (every quiz answer → mastery update → history row). Make sure `user_mastery_history` is partitioned or pruned periodically. Currently 0 rows but will grow fast.

---

## Part 8 — Index Analysis

The 94 indexes are well-designed. Specific highlights:

| Index | Why it matters |
|---|---|
| `idx_questions_assessment WHERE is_assessment = true` | Partial index — fast assessment quiz item retrieval |
| `idx_questions_application_context ON (topic_id, application_context)` | Contextual variation queries ready |
| `idx_readiness_snapshots_user_proof ON (user_id, computed_at DESC, is_proof_simulation)` | Fast separation of pressure-tested vs. daily scores |
| `idx_bq_user_status ON (user_id, status)` | Fast Blindspot queue dashboard query |
| `idx_computed_signals_churn WHERE churn_risk_score > 0.6` | Partial index for high-risk users only — efficient |
| `idx_notes_topic WHERE topic_id IS NOT NULL` | Partial index — fast note retrieval by topic |

**One missing index worth adding:**

```sql
-- For Endurance Cycle accuracy-by-block computation
CREATE INDEX idx_interactions_session_order 
    ON public.user_interactions (session_id, question_order);
-- Enables fast per-session accuracy-by-block reconstruction
```

---

## Part 9 — Deprecated Column Cleanup

`user_global_stats` still carries 4 deprecated columns:
- `churn_risk_score DOUBLE PRECISION DEFAULT 0` — DEPRECATED
- `churn_risk_updated_at TIMESTAMPTZ` — DEPRECATED
- `score_velocity_7d DOUBLE PRECISION DEFAULT 0` — DEPRECATED
- `score_velocity_updated_at TIMESTAMPTZ` — DEPRECATED

Both are correctly commented and COMMENTed in the schema. These can be dropped in a future migration once confirmed that no application code reads them. Not urgent — no functional impact.

---

## Part 10 — Complete Action Items, Prioritized

### 🔴 Critical — Blocks feature launch

| # | Action | What it unblocks |
|---|---|---|
| 1 | Add `endurance_baseline_items`, `endurance_window_items`, `endurance_target_items`, `endurance_last_updated` to `user_computed_signals` | Endurance Cycle build, Proof Simulation full activation |
| 2 | Add `is_endurance_session BOOLEAN` to `quiz_sessions` | Endurance Cycle |
| 3 | Populate `feature_flags` table with all paywall rules | Paywall cannot function |
| 4 | Add `free_questions_today INTEGER` + `free_questions_reset_date DATE` to `user_global_stats` | Free tier daily cap enforcement |
| 5 | Add `score_reveal_shown_at TIMESTAMPTZ` to `user_global_stats` | Score reveal "shown once" mechanic |

### 🟠 High — Blocks monetization or data integrity

| # | Action | What it unblocks |
|---|---|---|
| 6 | `ALTER TYPE subscription_tier ADD VALUE 'student'` | Student pricing tier |
| 7 | Add `billing_cycle TEXT` to `user_subscriptions` | Annual vs. cycle plan distinction |
| 8 | Add SRS scheduling columns to `user_node_mastery` (`srs_due_at`, `srs_interval_days`, `srs_ease_factor`) | True spaced repetition in Camp Mode |
| 9 | Deploy `user_computed_signals` Edge Function (daily) | Churn risk, score velocity signals go live |
| 10 | Instrument 5 funnel events into `analytics_events` | Any funnel visibility at all |

### 🟡 Medium — Needed before specific features ship

| # | Action | What it unblocks |
|---|---|---|
| 11 | Add `calibration_accuracy FLOAT8` + `calibration_updated_at` to `user_computed_signals` | Metacognitive calibration signal storage |
| 12 | Build `exam_outcomes` survey pipeline (before June ALE) | θ computation, pass-rate marketing data |
| 13 | Add `accuracy_by_block JSONB` to `quiz_sessions` | Efficient Endurance Cycle block analysis |
| 14 | Add `interaction_mode` column to `models_3d` | Worked Example Progression (Phase 2) |
| 15 | Add `idx_interactions_session_order` index | Efficient accuracy-by-block reconstruction |

### 🟢 Low — Cleanup, future-proofing

| # | Action | What it unblocks |
|---|---|---|
| 16 | Create `ai_interactions` table when AI assistant ships | Hallucination reporting |
| 17 | Drop deprecated columns from `user_global_stats` | Schema hygiene |
| 18 | Standardize admin role check in `topic_teach_back_criteria` (TODO comment in schema) | Code consistency |
| 19 | Add `UNIQUE` constraint on `taxonomy_tree.slug` per-discipline | Data integrity |

---

## Part 11 — Updated Build Status Registry

This corrects the architecture document's self-reported status against actual schema state:

| Feature | Arch says | Actual schema | Schema gap? | Build blocker? |
|---|---|---|---|---|
| Wiki | Schema: ✓ | ✅ Complete | None | None |
| Quiz Engine — Camp Mode | Schema: ✓ | 🟡 SRS missing | `srs_due_at` + interval cols | SRS not implemented |
| Quiz Engine — Storm Mode | Schema: ✓ | ✅ Complete | None | None |
| Notes Workspace | Schema: ✓ | ✅ Complete | None | None |
| Analytics Dashboard | Schema: ✓ | ✅ Complete | None | None |
| 3D Lab | Schema: ✓ | ✅ Complete (0 rows) | None | Content needed |
| AI Reference Assistant | Schema: ✓ | 🟡 Rate limiting missing | `analytics_events` event | No migration needed |
| **Blindspot Protocol** | **Schema: No** | **✅ Fully complete** | **None** | **Just needs Edge Function** |
| **Endurance Cycle** | **Schema: No** | **🔴 Zero schema** | **4+ columns + table** | **Cannot build at all** |
| **Proof Simulation** | **Schema: No** | **🟡 Mostly complete** | **Blocked by Endurance** | **Endurance first** |
| **Assessment Quiz** | **Schema: Partial** | **✅ All columns exist** | **score_reveal_shown_at** | **Minor** |
| **Camp Trail** | **Schema: Partial** | **✅ Fully complete** | **None** | **Content + app code** |
| Score Reveal Screen | Schema: No | 🟡 Missing shown-once flag | `score_reveal_shown_at` | Minor |
| Trail Recommendation | Schema: No | ✅ All data exists | None | Application logic only |
| **Metacognitive Calibration** | **Schema: No** | **✅ Column exists** | **Calibration signal col** | **Minor** |
| **Error Taxonomy** | **Schema: No** | **✅ Column exists** | **None** | **UI only** |
| Elaborative Interrogation | Schema: No | ✅ Not applicable | None | Content only |
| **Sleep-Aware Scheduling** | **Schema: No** | **✅ Both cols exist** | **None** | **App logic only** |
| Successive Relearning | Schema: No | ✅ Not applicable | None | App logic only |
| **Contextual Variation** | **Schema: No** | **✅ Column exists (Phase 2)** | **None** | **App logic only** |
| Worked Example Progression | Schema: No | 🟡 Mode col missing | `models_3d.interaction_mode` | Add at Phase 2 start |
| Anxiety Inoculation | Schema: No | ✅ Not applicable | None | App logic only |
| **Feynman Teach-Back** | **Schema: No** | **✅ Both tables exist (Phase 3)** | **None** | **App + content** |

---

*SlateCamp Product Architect Database Audit v3 · March 2026 · Internal*  
*This document supersedes the Schema Audit v1.0 (March 2026).*
