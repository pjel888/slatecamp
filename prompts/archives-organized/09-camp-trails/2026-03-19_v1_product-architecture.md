# SlateCamp — Product Architecture Document
**Version:** 2.0 — Comprehensive  
**Last Updated:** March 2026  
**Classification:** Internal · Product Architect Reference  
**Tagline:** Know you'll win.  
**Governing Question:** *Does this make a student more likely to win their Licensure Exam?*

---

## Table of Contents

1. [Platform Overview](#1-platform-overview)
2. [Target Users & Journey](#2-target-users--journey)
3. [Core Analytics Engine](#3-core-analytics-engine)
4. [Feature Modules](#4-feature-modules)
5. [Progression Mechanics](#5-progression-mechanics)
6. [Camp Trail — Flagship Feature](#6-camp-trail--flagship-feature)
7. [Onboarding Layer](#7-onboarding-layer)
8. [New Integrations Roadmap](#8-new-integrations-roadmap)
9. [Freemium & Pricing Architecture](#9-freemium--pricing-architecture)
10. [Database Schema](#10-database-schema)
11. [Tech Stack](#11-tech-stack)
12. [Design System](#12-design-system)
13. [Brand Voice Constraints](#13-brand-voice-constraints)
14. [Build Status Registry](#14-build-status-registry)

---

## 1. Platform Overview

SlateCamp is a unified, discipline-agnostic study engine for Philippine professional licensure exam preparation. When loaded with a profession's master syllabus, it becomes the definitive centralized hub for reading, spatial learning, adaptive testing, and real-time mastery tracking.

**It is not a quiz app. It is not a content library. It is not an LMS.**

It is the infrastructure the Licensure Exam process should have always had — a single, closed-loop ecosystem where every interaction feeds a global mastery engine, every wrong answer is an asset, and the Readiness Score is the most honest signal a student has ever had about where they actually stand.

### The Core Loop

```
Student interaction
      ↓
user_interactions (immutable log)
      ↓
user_node_mastery (per-topic EMA)
      ↓
Readiness Score + Taxonomy Heatmap (always current)
      ↓
Progression mechanics respond (Blindspot, Endurance, Proof, Camp Trail)
      ↓
Student returns tomorrow
```

Every feature — Wiki reads, quiz answers, 3D Lab explorations, Camp Trail completions, Notes — writes to this loop. Nothing is disconnected. Nothing is siloed.

### Beachhead → Expansion

- **Phase 1 (Now):** Architecture Licensure Exam (ALE), Philippines
- **Phase 2 (Year 2):** Institutional B2B — Dean's Dashboard
- **Phase 3 (Year 3–5):** Civil Engineering → Nursing → CPA → Law

The platform is profession-agnostic by design. Expanding to a new discipline = new taxonomy + new content database. The engine doesn't change.

---

## 2. Target Users & Journey

SlateCamp serves the full architecture education-to-licensure pipeline. There is no mode-switching — the platform adapts to where the student is in their journey.

### User Type A — The Architecture Undergraduate (Secondary Market)
- **Stage:** Year 1–5 of architecture school
- **Primary use:** Wiki reading, 3D Lab exploration, light quizzing, university mock board prep
- **Behavior:** 80% content consumption, 20% quizzing
- **Value:** Every interaction feeds the analytics engine invisibly. A student who uses SlateCamp from Year 1 arrives at ALE review with years of mastery data already in the system. Their heatmap isn't starting from zero.
- **Pricing target:** Student plan (lower price point or free with daily cap)

### User Type B — The ALE Reviewee (Primary Market)
- **Stage:** Post-graduation, actively reviewing for the Licensure Exam
- **Primary use:** Camp Trails, full mock exams, Proof Simulation, Blindspot Protocol remediation
- **Behavior:** 80% quizzing, 20% Wiki/3D Lab remediation
- **Value:** Paying customer, testimonial generator, word-of-mouth engine
- **Pricing target:** Pro tier (₱3,999/exam cycle)

### User Type C — The Retaker (High-Value Segment)
- **Stage:** Failed the ALE, preparing to sit again
- **Emotional state:** High motivation, high urgency, willing to pay
- **Primary use:** Assessment quiz to identify gaps from last attempt, targeted remediation Camp Trails, Proof Simulation
- **Special consideration:** The Readiness Score trajectory from previous attempt (if available) is the most powerful onboarding hook for this segment

### User Type D — The University Cohort (Phase 2 — B2B)
- **Stage:** Enrolled in a university architecture program
- **Primary use:** Faculty-assigned Camp Trails, cohort heatmap visible to Dean/faculty
- **Value:** Institutional revenue, student pipeline, Dean's Dashboard upsell
- **Pricing:** Per-seat institutional licensing

---

## 3. Core Analytics Engine

The analytics engine is the product. Everything else is an interface into it.

### 3.1 Readiness Score

**What it is:** A single number (0–100) representing the student's current, honest, statistically-derived exam readiness.

**Algorithm:**
- **Exponential Moving Average (EMA) weighting:** Recent performance counts far more than historical. A student who was at 30% in Month 1 and now scores 90% consistently will not be held back by early numbers.
- **Item Response Theory (IRT):** Hard questions correctly answered boost the score significantly more than easy ones. The `difficulty`, `difficulty_rating`, and `discrimination_rating` columns on `questions` power this.
- **Lucky Guess Detection:** A correct answer with an unusually short response time and a pattern of wrong answers on similar questions is flagged and weighted down.
- **Pressure-Tested Component (post-Proof Simulation):** After a student completes a Proof Simulation, the score recalibrates to include a "pressure-tested" component. If daily score was 74 but Proof Simulation returned 62, the system reconciles this honestly.

**Tiers:**
- 0–49: Red zone — significant gaps, immediate remediation needed
- 50–69: Amber zone — developing, targeted work required
- 70–84: Green zone — solid, refine and sustain
- 85–100: Strong zone — ready, simulate and confirm

**Free vs Pro access:**
- Free: Score shown once after assessment quiz only
- Pro: Always live, updated after every session, with trajectory chart and sub-scores by subject

### 3.2 Taxonomy Heatmap

**What it is:** A visual, real-time map of mastery across every node in the ALE taxonomy.

**Node states:**
- `grey` — unexplored. No interactions on this node yet.
- `red` — critical gap. Low accuracy and/or low attempt count.
- `amber` — developing. Improving but not yet stable.
- `green` — mastered. Consistent high accuracy across multiple review intervals.

**Thresholds (approximate, tuned over time):**
- Red: `current_mastery_weight < 0.4` OR `total_attempts < 5`
- Amber: `current_mastery_weight >= 0.4 AND < 0.75`
- Green: `current_mastery_weight >= 0.75` with demonstrated retention across spaced intervals

**Free vs Pro access:**
- Free: Heatmap locked/blurred after assessment
- Pro: Full heatmap, always current

### 3.3 user_node_mastery Table

The source of truth for all analytics. Updated after every quiz interaction.

```sql
CREATE TABLE public.user_node_mastery (
    user_id uuid NOT NULL,
    topic_id uuid NOT NULL,           -- FK to taxonomy_tree
    total_attempts integer DEFAULT 0,
    total_correct integer DEFAULT 0,
    current_mastery_weight double precision DEFAULT 0.0,  -- EMA
    avg_time_ms integer DEFAULT 0,
    last_encountered timestamptz DEFAULT now(),
    -- Planned additions:
    -- teach_back_attempted boolean DEFAULT false,
    -- teach_back_gap_count integer DEFAULT 0,
    PRIMARY KEY (user_id, topic_id)
);
```

### 3.4 Pacing Gauge

**What it measures:** The student's average time per question vs the exam's required pace.

- ALE is a timed examination. Students who consistently average 90 seconds/question will run out of time.
- The Pacing Gauge tracks avg time per question across all sessions (from `user_interactions.time_spent_ms`).
- Feeds directly into the Endurance Cycle — the Endurance window is tracked against the exam's expected duration.

### 3.5 Readiness Score Snapshots

Every time the Readiness Score is computed, a snapshot is written to `readiness_score_snapshots` (immutable, append-only). This powers the trajectory chart in the Analytics Dashboard — the student can see how their score has moved week over week since they started.

---

## 4. Feature Modules

### 4.1 Wiki — The SlateCamp Knowledge Base

**Status:** ✅ Built  
**Type:** Knowledge infrastructure  

**What it is:** The vetted, definitive repository for every ALE concept. Every article is authored by a Subject Matter Expert (SME), tied to a specific `topic_id` in the master taxonomy, and linked bidirectionally to the quiz questions, 3D models, and notes that reference the same concept.

**Key mechanics:**
- **Bidirectional links:** An article on "Concrete" links to the 3D wall section model, the relevant PD 1096 section, related quiz questions, and any student notes saved on that topic. Navigation between features is seamless.
- **Zen reading mode:** Full-screen, distraction-free reading. No sidebar, no notifications.
- **Highlight-to-action:** Students can highlight any text to save it as a note (auto-tagged to the article's `topic_id`) or add it to a custom cheat sheet.
- **Taxonomy mapping:** Every article has a primary `node_id` via `wiki_article_taxonomy`. Articles can map to multiple nodes if the content spans topics.

**Planned enhancements (Phase 1):**
- Elaborative interrogation prompts — embedded "Why?" questions mid-article that require the student to generate an explanation before the rationale reveals. Effect size: d=0.40–0.60.

**Schema:**
```sql
wiki_articles (article_id, title, slug, content, created_at, updated_at)
wiki_article_taxonomy (article_id, node_id, is_primary)
```

---

### 4.2 Quiz Engine — Camp Mode & Storm Mode

**Status:** ✅ Built  
**Type:** Diagnostic core  

**What it is:** The primary data-generating surface. Every question answered flows into `user_interactions` → `user_node_mastery` → Readiness Score.

**Camp Mode:**
- Immediate post-answer feedback: correct answer revealed, rationale shown, SME explanation displayed
- Algorithmic Remediation: wrong answers trigger a contextual explanation with a direct link back to the Wiki node that covers this concept
- Spaced repetition scheduling: items due for review are surfaced via SRS intervals
- Session length: 10–100 items, student-selected via Syllabus Selector

**Storm Mode:**
- Full mock exam simulation
- Strict timer, no feedback until submission
- No pausing, no review-as-you-go
- Interface strips down: question + options + progress indicator only
- Session length: up to 200 items (full ALE simulation)
- Post-session: full item review with rationales

**Syllabus Selector:**
- Student selects subject area(s), difficulty range, and session length before starting
- Can target specific taxonomy nodes for focused practice
- Camp Trail sessions bypass the Syllabus Selector — the trail prescribes the session configuration

**IRT difficulty levels:** Every question has `difficulty` (0.0–1.0), `difficulty_rating`, and `discrimination_rating`. The quiz engine uses these to weight questions appropriately for adaptive sessions.

**Schema additions planned:**
- `application_context` column on `questions` (Phase 2: contextual variation practice)
- `trail_step_id` foreign key removed in favor of `session_trail_credits` junction table

---

### 4.3 Notes Workspace — The Synthesis Ledger

**Status:** ✅ Built  
**Type:** Personal workspace  

**What it is:** Every captured note — highlighted from the Wiki, saved from a quiz rationale, or snapshotted from the 3D Lab — is automatically tagged to the master taxonomy.

**Key mechanics:**
- **Auto-tagging:** Notes inherit the `topic_id` of the surface they were created from. A note saved while reading a Wiki article on Fire Code travel distances is automatically tagged to that node.
- **Temporal resurface:** A note written in second year of college resurfaces at the right moment during board review because the system knows the subject connection.
- **Block editor:** Notes are stored as JSONB blocks. Custom cross-subject cheat sheets can be built by combining blocks across topics.
- **Cloze deletion:** Any text in a note can be converted into an active recall flashcard.
- **Cross-device sync:** Notes sync across sessions via Supabase.

**Current state:** 8 live notes in the system. All linked to `topic_id` and `article_id`/`question_id`/`session_id` as appropriate.

---

### 4.4 Analytics Dashboard

**Status:** ✅ Built  
**Type:** Analytics core  

**What it is:** A separate, dedicated analytics surface. Not the main dashboard — the main dashboard is the Daily Launchpad. The Analytics Dashboard is for deep performance review.

**Components (all live):**
- **Readiness Trajectory:** Line chart of score over time
- **Pacing vs. Accuracy scatter:** Speed vs. score per subject
- **Cognitive Stamina chart:** Accuracy by question number (reveals endurance decay)
- **Subject Mastery Profile:** Radar chart across all 7 ALE subjects
- **Memory Health table:** Topic-by-topic retention scores
- **Pacing Leaks panel:** Subjects where the student spends too long per question
- **Raw stat bar:** Questions answered, avg accuracy, avg pacing, study streak

**Design constraint:** The Analytics Dashboard never shows on the main dashboard. The main dashboard shows the current Readiness Score as a number and a study streak count — no charts, no detailed breakdowns. Detail lives in Analytics.

---

### 4.5 3D Lab — Interactive Building Codes

**Status:** ⚠️ Designed — 186 modules mapped, currently 404  
**Type:** Spatial learning  

**What it is:** WebGL-powered interactive 3D models with parametric feedback, slider-based cutaways, guided tour narratives, and code-cited hotspots. Every hotspot links directly back to the Wiki. Architecture is an inherently spatial discipline — reading a building code is insufficient. The 3D Lab makes the code visible.

**Key interactions:**
- **Parametric sandbox:** Drag a Floor Area Ratio slider and watch the building massing respond. Exceed the legal limit → the model turns red with the exact code citation.
- **Guided Tour mode:** A narrative walkthrough of complex MEPFS systems (fire suppression, electrical distribution, plumbing) as a step-by-step story.
- **In-canvas quizzing:** Hotspot-based questions that test spatial knowledge directly on the model.
- **Cutaway sections:** Expose hidden systems — wall assemblies, stair construction, accessible routes.

**Tech stack:** React Three Fiber, @react-three/drei, Zustand for 3D state. GLTF/GLB format. Blender Python scripting for parametric model generation.

**Top 10 priority modules:**
1. PD 1096 stairway configurator (riser/tread dimensions, handrail heights)
2. RA 9514 Fire Code travel distance floor plan
3. BP 344 ramp and accessible toilet model (2024 Revised IRR)
4. Classical Orders comparison (Doric, Ionic, Corinthian, Tuscan, Composite)
5. PD 1096 setback calculator (lot area, building footprint, TGFA)
6. Fire Code occupancy load calculator with exit width verification
7. Structural bay framing (NSCP 2015 beam/column relationships)
8. Water Code (PD 1067) riparian setback visualizer
9. PD 957 subdivision layout (roads, open space, lot ratios)
10. BP 344 parking lot accessible bay layout

**Planned Phase 2 enhancement:** Worked Example Progression — every 3D module follows a three-phase sequence:
1. Guided tour (expert demonstrates the complete solution)
2. Faded example (student fills in one missing parameter)
3. Full problem-solving (student configures from a building brief)

This applies Cognitive Load Theory's expertise reversal principle — novices learn from examples, experts learn from problems.

---

### 4.6 AI Reference Assistant — Bounded RAG

**Status:** ⚠️ Designed  
**Type:** AI tutor  

**What it is:** A Socratic AI assistant tethered strictly to the SlateCamp database. Not a general-purpose chatbot. Not a search engine. A precision instrument for architectural licensure exam preparation.

**Hard constraints:**
- **Bounded RAG only:** The assistant can only reference content in the SlateCamp database — verified Wiki articles, question rationales, code citations
- **No open internet:** No external searches, no hallucinated facts
- **Temperature 0.0:** As literal and exact as possible. No creative interpretation of code provisions.
- **Mandatory citations:** Every factual claim includes a clickable badge linking to the exact Wiki paragraph or code section it references
- **Hallucination reporting:** Students can flag a response as potentially incorrect. Flagged responses are reviewed by an SME.
- **Socratic protocol:** When triggered by a wrong answer, the assistant does not give the correct answer directly. It guides the student toward the correct reasoning via questions.

**Trigger points:**
- Wrong answer in Camp Mode → AI offers to walk through the reasoning
- Student asks a question in the Wiki via the "Ask" button
- Feynman Teach-Back evaluation (Phase 3)

**The constraint statement:** In high-stakes licensure education, one incorrect AI-generated fact could cost a student their exam. The AI's constraints are not a product limitation. They are a trust architecture.

---

## 5. Progression Mechanics

All three mechanics are designed, not yet built. All are Pro-only. All connect directly to the Readiness Score, Taxonomy Heatmap, and/or Pacing Gauge. None use badges, confetti, virtual currency, or leaderboards.

### 5.1 Blindspot Protocol

**Type:** Adaptive targeting  
**Psychological basis:** Zeigarnik Effect (unfinished tasks create persistent cognitive tension), Desirable Difficulty (Bjork, 1994)

**How it works:**
1. **Nightly scan:** At midnight, system scans the Taxonomy Heatmap. Identifies `red` or `grey` nodes.
2. **Queue generation:** Compiles a 10–15 item quiz drawn exclusively from the weakest 3 nodes. Items weighted toward conceptual questions that expose misunderstanding, not just recall gaps.
3. **Persistent presence:** Queue appears at the top of the student's dashboard as a quiet, factual element. Not an alert, not a notification.
4. **Student engages or defers:** If deferred 48+ hours, queue persists unchanged. The heatmap reflects untouched nodes honestly. No manufactured urgency.
5. **Post-queue reclassification:** After completion, nodes are re-evaluated against thresholds. A Red node with sufficient accuracy shifts to Amber. No fanfare — the map changes.
6. **Compounding recurrence:** Amber nodes enter spaced-repetition review schedule. If retention demonstrated across 3 intervals → Green. If not → returns to Blindspot queue.

**Ties to anchors:**
- Readiness Score: Directly lifts score by converting lowest-contributing nodes
- Taxonomy Heatmap: Primary mechanic for flipping Red → Amber → Green
- Pacing Gauge: Queues calibrated to 15-minute sessions

**Voice example:**
> "Blindspot Protocol · 12 items  
> Targeting: Building Technology — Structural Systems, Environmental Control Systems, Construction Methods"

---

### 5.2 Endurance Cycle

**Type:** Stamina training  
**Psychological basis:** Progressive overload, Cognitive Endurance (Baumeister et al., 1998), Delayed Feedback (Carver & Scheier, 1981)

**How it works:**
1. **Baseline calibration:** First week, system observes natural session length and accuracy decay curve. This becomes the Endurance Baseline — displayed on the Pacing Gauge as a reference line.
2. **Weekly threshold extension:** Each week, one "Endurance Session" that extends 10–15% beyond the student's current reliable performance window. Mixed nodes simulating exam breadth.
3. **Accuracy-over-duration tracking:** System tracks accuracy in 10-item blocks. Student sees accuracy-over-time line AFTER the session — not during. No in-session feedback to prevent monitoring anxiety.
4. **Pacing Gauge update:** Cumulative endurance window growth tracked week over week.
5. **Plateau detection:** If endurance stalls across 2+ weeks, factual note on dashboard. Feeds data back to Blindspot Protocol targeting (identifies which nodes degrade first under fatigue).

**Ties to anchors:**
- Readiness Score: Factors in sustained accuracy, not just peak accuracy
- Taxonomy Heatmap: Reveals nodes that degrade first under fatigue
- Pacing Gauge: Primary driver — tracks endurance window vs exam duration

**Voice example:**
> "Endurance Session available · 55 items, ~48 minutes  
> Last week: 45 items. Your reliable window was 38 items before accuracy dropped below 70%."

---

### 5.3 Proof Simulation

**Type:** Readiness validation  
**Psychological basis:** Testing Effect (Roediger & Karpicke, 2006), Self-Efficacy Calibration (Bandura, 1977), Consolidation-Before-Analysis

**How it works:**
1. **Competence-gated unlock:** Only available when ≥70% of taxonomy nodes at Amber or above AND Endurance window covers ≥80% of exam duration. Not artificial scarcity — prevents misleading data from premature exposure.
2. **Exam-condition session:** Mirrors ALE item count, time limits, and taxonomy distribution. No pause button, no review-as-you-go, no heatmap visibility. UI strips to question + options + progress indicator.
3. **Cold score delivery:** Single number. No comparison to peers. No historical context. Just the score and the passing threshold line.
4. **24-hour diagnostic delay:** Detailed breakdown available 24 hours after completion. Enforced pause prevents panic-driven review and allows emotional processing before analysis.
5. **Readiness Score recalibration:** Simulation data feeds recalibrated score with "pressure-tested" component. If daily score was 74 and Proof Score was 62, the gap is reconciled honestly.

**Ties to anchors:**
- Readiness Score: Most honest signal in the system — pressure-tested
- Taxonomy Heatmap: Reveals nodes stable in practice but degrading under pressure
- Pacing Gauge: Validates endurance training under full exam pressure

**Voice example:**
> "Simulation Score: 68  
> Passing threshold: 70. Detailed breakdown available tomorrow at 9:00 AM."

---

## 6. Camp Trail — Flagship Feature

**Status:** 🔄 In progress — highest build priority  
**Type:** Flagship retention feature  
**Positioning:** Product-level marketing, feature-level placement

### 6.1 What it is

Camp Trail is a structured, prescriptive study program. A daily-prescription engine that tells students exactly what to read, quiz, and explore in the 3D Lab — sequenced in the pedagogically correct order, anchored to their exam date.

**It is a retention mechanic, not an acquisition mechanic.** It surfaces after the assessment quiz, once the student has a baseline score and an emotional reason to commit.

**It solves the cold start problem.** New users land with no heatmap data, no Readiness Score baseline, no clear path. Camp Trail gives them a structured on-ramp before the adaptive system has enough signal to be truly adaptive.

**It does not replace the adaptive engine — it bootstraps it.** A Journey prescribes the sequence before there's data. Once the heatmap has signal, Blindspot Protocol takes over the targeting layer. Camp Trail and the progression mechanics coexist.

### 6.2 Trail Type Library

#### Time-Gated Programs (Exam-date anchored)

| Trail | Duration | Target User | Daily Load |
|---|---|---|---|
| 2-week Intensive | 14 days | Final review sprint, exam imminent. Student has baseline knowledge, needs concentrated retrieval practice and stamina. | ~3 hours/day |
| 4-week Accelerated | 28 days | Strong baseline, targeted gaps. Recent graduate or retaker close to passing. | ~2 hours/day |
| 8-week Standard | 56 days | **Default recommendation.** Most ALE candidates with 2–4 months until exam. | ~1.5 hours/day |
| 12-week Comprehensive | 84 days | Full syllabus rebuild. Student out of school for years or first-time candidate needing foundations. | ~1.5 hours/day |
| 6-month Undergraduate | 180 days | Year 1–3 architecture students. Low daily load, long horizon, foundation-building cadence. | ~45 min/day |

#### Subject Mastery Paths (Vertical, single subject)

1–2 weeks each. Sequence: foundational Wiki articles → concept check quizzes → 3D Lab module (if available) → progressively harder questions → mastery quiz.

- Building Laws & Codes
- Structural Systems
- Building Utilities (MEPFS)
- Architectural Design
- Site Planning & Development
- History of Architecture
- Professional Practice

#### Code Deep-Dives (Single Philippine building code)

1–2 weeks. Heavy on code-cited quiz questions and 3D Lab where modules exist.

- PD 1096 — National Building Code of the Philippines
- RA 9514 — Revised Fire Code
- BP 344 — Accessibility Law (2024 Revised IRR)
- NSCP 2015 — National Structural Code of the Philippines
- PEC — Philippine Electrical Code
- National Plumbing Code
- PD 957 / BP 220 — Housing laws
- PD 1067 — Water Code

#### Targeted Remediation Trails (Auto-suggested)

Automatically triggered by Blindspot Protocol when a node stays Red for 3+ consecutive weekly scans. Short, sharp, 5–7 days. Focused entirely on the failing node cluster.

- Student receives a notification: "Building Laws nodes have been Red for 3 weeks. A focused remediation trail is ready."
- Enrollment is opt-in, not forced
- Completes a subject mastery path on the specific failing area

#### Exam Simulation Trail (Final stretch)

- Auto-suggested when `user_global_stats.target_exam_date` is within 14 days
- Heavy Storm Mode, full Proof Simulations, pacing-focused sessions
- Bridges into the Proof Simulation mechanic
- Includes anxiety inoculation sessions (Phase 3)

### 6.3 Naming & Copy Patterns

| Context | Copy |
|---|---|
| Enrollment CTA | "Start a Camp Trail" |
| Active trail status | "You're on the 8-Week Camp Trail" |
| Subject trail | "Camp Trail: Building Laws" |
| Possessive | "Your Camp Trail" |
| Day prescription | "Today on your Camp Trail: 3 activities · ~45 minutes" |

### 6.4 Daily Structure

Every trail day has a prescribed set of steps. A standard 8-week trail day might look like:

**Day 14 — Building Technology: Structural Systems**
1. Wiki read: "Reinforced Concrete Fundamentals" (~15 min) → `step_type: wiki`
2. Camp Mode quiz: 15 items targeting TECH-002 nodes (~20 min) → `step_type: quiz`
3. 3D Lab: Structural Bay Framing module (~10 min) → `step_type: lab`

Day marked complete when all steps are completed. Day can be completed in any order.

### 6.5 Simultaneous Enrollment

Students can enroll in multiple trails simultaneously. The schema handles attribution via `session_trail_credits` — a single quiz session on Building Laws nodes credits every active trail that has a pending step targeting those nodes.

**Soft cap recommendation:** Surface a warning at 2 active trails.  
> "You have 2 active trails. Students with more than 2 active trails complete 40% fewer of them."  
Data-driven, not a hard gate.

### 6.6 Assessment → Trail Recommendation Flow

```
1. New user completes assessment quiz (35 items, 7 ALE subjects)
2. Initial Readiness Score computed
3. Score reveal screen — one-time for free users
4. System reads user_global_stats.target_exam_date
5. Algorithm: score + days_to_exam → recommended trail
6. One trail surfaced with reasoning:
   "Based on your score of 48% and 84 days until your exam, 
    the 12-Week Comprehensive Trail is the right fit. 
    Here's what Week 1 looks like."
7. User enrolls or browses trail library
8. Day 1 begins
```

### 6.7 Full Database Schema — New Tables

#### New Enums

```sql
CREATE TYPE public.trail_type AS ENUM (
    'time_gated',
    'subject_mastery',
    'code_deep_dive',
    'remediation',
    'exam_simulation'
);

CREATE TYPE public.trail_intensity AS ENUM (
    'intensive',        -- 2-week
    'accelerated',      -- 4-week
    'standard',         -- 8-week
    'comprehensive',    -- 12-week
    'undergraduate'     -- 6-month
);

CREATE TYPE public.trail_step_type AS ENUM (
    'quiz',
    'wiki',
    'lab',
    'review'
);

CREATE TYPE public.trail_enrollment_status AS ENUM (
    'active',
    'paused',
    'completed',
    'abandoned'
);
```

#### camp_trails (Platform-curated templates)

```sql
CREATE TABLE public.camp_trails (
    trail_id uuid DEFAULT gen_random_uuid() NOT NULL,
    discipline_id uuid NOT NULL REFERENCES public.disciplines(discipline_id),
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    trail_type public.trail_type NOT NULL,
    intensity public.trail_intensity,                    -- null for subject_mastery/code/remediation
    duration_days integer NOT NULL,
    total_steps integer NOT NULL DEFAULT 0,
    is_published boolean NOT NULL DEFAULT false,
    is_featured boolean NOT NULL DEFAULT false,
    recommended_min_score double precision,              -- minimum score to be recommended this trail
    recommended_max_score double precision,              -- maximum score to be recommended this trail
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    PRIMARY KEY (trail_id),
    UNIQUE (slug)
);
```

#### trail_days (Day N of a trail)

```sql
CREATE TABLE public.trail_days (
    day_id uuid DEFAULT gen_random_uuid() NOT NULL,
    trail_id uuid NOT NULL REFERENCES public.camp_trails(trail_id) ON DELETE CASCADE,
    day_number integer NOT NULL,
    title text NOT NULL,                                 -- e.g. "Day 1: Building Laws Foundations"
    description text,
    estimated_minutes integer DEFAULT 60,
    created_at timestamptz DEFAULT now() NOT NULL,
    PRIMARY KEY (day_id),
    UNIQUE (trail_id, day_number)
);
```

#### trail_steps (Activities within each day)

```sql
CREATE TABLE public.trail_steps (
    step_id uuid DEFAULT gen_random_uuid() NOT NULL,
    day_id uuid NOT NULL REFERENCES public.trail_days(day_id) ON DELETE CASCADE,
    step_order integer NOT NULL,
    step_type public.trail_step_type NOT NULL,
    title text NOT NULL,
    description text,
    -- Quiz step fields
    target_node_ids uuid[] DEFAULT '{}',                 -- taxonomy nodes to draw questions from at runtime
    question_count integer,                              -- how many questions to generate
    difficulty_min double precision DEFAULT 0.0,
    difficulty_max double precision DEFAULT 1.0,
    -- Wiki step fields
    article_id uuid REFERENCES public.wiki_articles(article_id) ON DELETE SET NULL,
    -- Lab step fields
    model_id uuid REFERENCES public.models_3d(model_id) ON DELETE SET NULL,
    -- Shared
    estimated_minutes integer DEFAULT 15,
    is_optional boolean DEFAULT false NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    PRIMARY KEY (step_id),
    UNIQUE (day_id, step_order)
);
```

**Design decision:** `target_node_ids` not `question_ids`. Quiz steps reference taxonomy nodes, and questions are generated at runtime from the live question pool. This means:
- Trail never goes stale as new questions are added
- Question pool improvements benefit all trails automatically
- No need to re-author trail content when question bank grows

#### user_trail_enrollments (One row per user per trail)

```sql
CREATE TABLE public.user_trail_enrollments (
    enrollment_id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL REFERENCES auth.users(id),
    trail_id uuid NOT NULL REFERENCES public.camp_trails(trail_id),
    status public.trail_enrollment_status DEFAULT 'active' NOT NULL,
    -- Progress tracking
    current_day integer DEFAULT 1 NOT NULL,
    days_completed integer DEFAULT 0 NOT NULL,           -- denormalized for fast dashboard queries
    last_activity_at timestamptz,
    -- Timing
    started_at timestamptz DEFAULT now() NOT NULL,
    paused_at timestamptz,
    completed_at timestamptz,
    target_completion_date timestamptz,                  -- computed from started_at + trail.duration_days
    -- Analytics
    readiness_score_at_start double precision,           -- snapshot when enrolled (for delta display)
    pace_status text DEFAULT 'on_track',                 -- 'on_track' | 'behind' | 'ahead' — computed
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    PRIMARY KEY (enrollment_id),
    UNIQUE (user_id, trail_id)                           -- one enrollment per trail per user
);
```

#### user_trail_progress (Step-level completion log)

```sql
CREATE TABLE public.user_trail_progress (
    progress_id uuid DEFAULT gen_random_uuid() NOT NULL,
    enrollment_id uuid NOT NULL REFERENCES public.user_trail_enrollments(enrollment_id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id),
    step_id uuid NOT NULL REFERENCES public.trail_steps(step_id),
    completed_at timestamptz DEFAULT now() NOT NULL,
    session_id uuid REFERENCES public.quiz_sessions(session_id) ON DELETE SET NULL,  -- populated for quiz steps
    time_spent_ms integer,
    PRIMARY KEY (progress_id),
    UNIQUE (enrollment_id, step_id)                      -- can't complete same step twice per enrollment
);
```

#### trail_day_completions (Materialized day-level records)

```sql
CREATE TABLE public.trail_day_completions (
    day_completion_id uuid DEFAULT gen_random_uuid() NOT NULL,
    enrollment_id uuid NOT NULL REFERENCES public.user_trail_enrollments(enrollment_id) ON DELETE CASCADE,
    day_id uuid NOT NULL REFERENCES public.trail_days(day_id),
    user_id uuid NOT NULL REFERENCES auth.users(id),
    completed_at timestamptz DEFAULT now() NOT NULL,
    readiness_score_at_completion double precision,       -- score snapshot when day closed
    PRIMARY KEY (day_completion_id),
    UNIQUE (enrollment_id, day_id)
);
```

#### session_trail_credits (Simultaneous enrollment attribution)

```sql
CREATE TABLE public.session_trail_credits (
    session_id uuid NOT NULL REFERENCES public.quiz_sessions(session_id) ON DELETE CASCADE,
    enrollment_id uuid NOT NULL REFERENCES public.user_trail_enrollments(enrollment_id) ON DELETE CASCADE,
    step_id uuid NOT NULL REFERENCES public.trail_steps(step_id),
    credited_at timestamptz DEFAULT now() NOT NULL,
    PRIMARY KEY (session_id, enrollment_id, step_id)
);
```

**Why this table exists:** When a student is enrolled in both the 12-Week Trail and the Building Laws Subject Mastery Path, and they complete a Camp Mode session on Building Laws nodes, that single `quiz_session` should credit both enrollments. `session_trail_credits` is the attribution bridge — it allows one session to satisfy multiple trail steps across multiple active enrollments.

### 6.8 Pricing Gate

| Tier | Camp Trail Access |
|---|---|
| Free | 1 basic trail only (ALE Starter — 4-week standard, highest-frequency nodes only) |
| Pro | Full library · all trail types · simultaneous enrollment (soft cap: 2) |
| Institutional | Assigned trails by instructor or Dean · cohort-level progress visible to faculty |

### 6.9 Science Foundation

| Principle | Research | Application |
|---|---|---|
| Implementation intentions | Gollwitzer (1997) — d=0.65 vs open-ended goals | Daily prescription ("complete these 3 activities today") |
| Fresh start effect | Dai, Milkman & Riis (2014) — +33–50% motivation at temporal landmarks | Launch enrollment prompts on Mondays, first of month, post-ALE results day |
| Spaced repetition + structure | French medical school (2025) — 2x exam success rate | SRS built into quiz step scheduling within trails |
| Completion rates | Cohort-based: 85–96% vs self-paced: 3–15% | Daily prescriptions + pace tracking + soft nudges |
| Progressive interleaving | Rohrer et al. (2014) — d=1.05 | Later trail weeks mix subjects; early weeks block by subject |
| BARBRI precedent | 9/10 structured program completers pass the bar | Full-program completion gates correlate with pass rates |
| Bloom's mastery learning | Guskey & Pigott (1988) — d=0.52–0.94 | Subject mastery paths gate progression on competence |

---

## 7. Onboarding Layer

### 7.1 Assessment Quiz

**Status:** 🔄 New — in progress  
**Purpose:** Cold start solver. Generates the student's initial Readiness Score and heatmap baseline. The emotional hook of the entire platform.

**Structure:**
- **35 items total:** 5 questions × 7 ALE subject areas
- **Question selection:** Drawn from the high-discrimination subset of the question bank (questions tagged `is_assessment: true` with high `discrimination_rating`)
- **Difficulty calibration:** Mixed — enough difficulty to discriminate real understanding from surface recall, not so hard it's demoralizing for a fresh student
- **Time:** No timer. This is diagnostic, not evaluative.
- **Duration:** ~20–25 minutes

**ALE subject coverage:**
1. Building Technology (5 items)
2. Structural Design & Construction (5 items)
3. Building Utilities — MEPFS (5 items)
4. History & Theory of Architecture (5 items)
5. Site Planning & Development (5 items)
6. Architectural Design (5 items)
7. Professional Practice & Building Laws (5 items)

**The experience:** The assessment should not feel like a diagnostic. It should feel like a reckoning. Students sit down, answer 35 real questions, and get back something they've never had before — a mathematical picture of exactly where they stand, organized by subject, with a clear recommended next step.

### 7.2 Score Reveal

**Status:** 🔄 New — in progress  
**This is the most important screen in the entire free user experience.**

**What the student sees:**
1. Their Readiness Score — large, clear, honest
2. A one-line interpretation in SlateCamp's voice (e.g., "38%. A lot of ground ahead — but this is exactly where the journey starts.")
3. A blurred/locked heatmap beneath — they can see the shape, not the detail
4. A clear "Unlock Full Analytics" prompt
5. One recommended Camp Trail, surfaced immediately

**Free vs Pro:**
- Free users see this screen once. After this, the score widget on the dashboard shows a locked state.
- Pro users see the full score at all times.

**Why this works:** The student saw the number once at the most emotionally charged moment. They know it exists. They know it's updating. The locked state creates specific, felt loss — not generic paywalled content, but *their own data* being withheld. The Pro pitch is: "Your score updated 14 times since you started. Upgrade to see it."

### 7.3 Trail Recommendation Engine

**Status:** 🔄 New — in progress

**Logic:**
```
days_to_exam = target_exam_date - today

if days_to_exam <= 14:
    recommend: Exam Simulation Trail
elif days_to_exam <= 28:
    recommend: 2-week Intensive or 4-week Accelerated (based on score)
elif days_to_exam <= 56:
    recommend: 4-week Accelerated or 8-week Standard
elif days_to_exam <= 84:
    recommend: 8-week Standard or 12-week Comprehensive (based on score)
elif days_to_exam <= 180:
    recommend: 12-week Comprehensive
else:
    recommend: 6-month Undergraduate
```

Score modifier: if score < 50, bias toward longer duration. If score >= 65, bias toward shorter duration.

**One recommendation, clearly reasoned:**
> "Based on your score of 48% and 84 days until your exam, the 12-Week Comprehensive Trail is the right fit. Week 1 focuses on Building Laws — your biggest gap."

---

## 8. New Integrations Roadmap

All integrations are research-validated, non-gamification mechanics. All pass the governing question test.

### 8.1 Phase 1 — Minimal Schema Changes · Build Alongside Camp Trail

#### Metacognitive Calibration Training

**What it is:** Before each quiz session, the student rates their confidence per subject (3-point scale: not confident / somewhat confident / confident). After the session, they see a calibration chart — "you predicted 80% on Building Laws, you scored 41%."

**Why it matters:** Students are systematically overconfident about what they know (Dunning-Kruger). Training calibration accuracy reduces wasted study time on topics the student thinks they've mastered but haven't. It also generates a new data signal — calibration score, separate from mastery score.

**New data signal:** A student with high mastery but poor calibration knows the material but can't predict when they know it. Different problem, different intervention. No other Philippine ALE platform tracks this.

**Schema change:** 1 new column on `quiz_sessions`:
```sql
ALTER TABLE public.quiz_sessions
ADD COLUMN pre_session_confidence_ratings jsonb DEFAULT '{}';
-- e.g. {"LAWS": 2, "STRUCT": 3, "UTIL": 1, ...}
```

**Effect size:** Medium. Most value comes from the longitudinal calibration trend, not individual sessions.

---

#### Error Taxonomy

**What it is:** After each wrong answer in Camp Mode, an optional single-tap follow-up prompt:
> "What happened there?" → [Knowledge gap] [Misread question] [Two options looked similar] [Code version confusion] [Ran out of time]

**Why it matters:** Wrong answers fall into predictable categories that require different interventions:
- Knowledge gap → more content exposure, Blindspot queue
- Misread question → question-reading strategy training, not content
- Distractor confusion → comparison table between similar codes/concepts
- Code version confusion → explicit version clarification in Wiki
- Time pressure → Endurance Cycle adjustment

**Feeds:** AI Reference Assistant gets richer context for Socratic remediation. Over time, aggregate error patterns reveal systemic issues in question wording or content coverage.

**Schema change:** 1 new column on `user_interactions`:
```sql
ALTER TABLE public.user_interactions
ADD COLUMN error_type text;  
-- 'knowledge_gap' | 'misread' | 'distractor' | 'code_version' | 'time_pressure' | null
```

---

#### Elaborative Interrogation in the Wiki

**What it is:** Strategically placed "Why?" prompts within Wiki articles that require the student to generate an explanation before reading the answer.

**Example:** A Wiki article on fire exit travel distances pauses mid-article and asks:
> "Why does the maximum travel distance decrease in a building without a sprinkler system?"

The student types or selects an explanation, then the article reveals the rationale.

**Why it matters:** Effect size d=0.40–0.60 for factual recall. More importantly, it builds reasoning behind codes — not just the numbers. Students who understand *why* PD 1096 sets stair riser height at 100–200mm don't need to memorize it.

**Schema change:** None for the application layer. Content authoring addition — SMEs add `[EI: question]...[/EI]` tags to Wiki content. The renderer intercepts these and presents the interactive prompt.

---

#### Sleep-Aware Scheduling

**What it is:** Camp Trail daily prescriptions account for sleep consolidation. New conceptual content (Wiki reads, 3D Lab exploration) is scheduled in the evening session. Retrieval practice (Camp Mode quizzes on previously-learned content) is scheduled in the morning.

**Why it matters:** Walker (2017) and Stickgold (2005) demonstrated that sleep actively consolidates memory formed during the preceding day. Morning retrieval practice capitalizes on overnight consolidation.

**Implementation:** During onboarding, the student inputs their typical study window (morning / evening / both). The trail step sequencing logic adjusts accordingly — `step_type: wiki` and `step_type: lab` are flagged `preferred_time: evening`, `step_type: quiz` is flagged `preferred_time: morning`.

**Schema change:** None for existing tables. New column on `trail_steps`:
```sql
ALTER TABLE public.trail_steps
ADD COLUMN preferred_time text;  -- 'morning' | 'evening' | 'any'
```

---

### 8.2 Phase 2 — New UI Surfaces · Post Camp Trail Launch

#### Successive Relearning

**What it is:** Distinct from standard spaced repetition. The protocol: a student studies a concept until they can recall it correctly once, then it enters the spaced queue. But if they fail it on review — it returns to active re-study (3–5 question intensive loop), not just rescheduled.

**How it differs from Blindspot Protocol:** Blindspot operates at the taxonomy node level (subjects and subtopics). Successive relearning operates at the individual question/concept level. It's more aggressive — failure triggers immediate re-engagement, not just a shifted interval.

**Effect:** Dramatically better retention than standard SRS for content that requires precise recall under pressure (code dimensions, formula thresholds).

---

#### Worked Example Progression in 3D Lab

**What it is:** Every 3D Lab module follows a three-phase sequence:
1. **Guided tour** — expert walks through the complete solution (watch)
2. **Faded example** — student adjusts one parameter, system handles the rest (do part)
3. **Full problem-solving** — student configures from a building brief (do all)

**Why it matters:** Cognitive Load Theory's worked example effect — novices learn better from studying worked examples than solving problems independently. As expertise develops, the balance shifts (expertise reversal effect). The three-phase progression applies this automatically.

---

#### Contextual Variation Practice

**What it is:** The same underlying principle tested in 5 radically different surface contexts:
1. Recall (direct code recall)
2. Calculation (apply the number)
3. Design application (which option complies?)
4. Code interpretation (what does this section mean?)
5. Client scenario (how do you explain this to a client?)

**Why it matters:** The ALE's hardest questions disguise familiar principles in unfamiliar formats. Contextual variation trains pattern recognition — the ability to see through surface presentation to the underlying code principle.

**Schema change:** New column on `questions`:
```sql
ALTER TABLE public.questions
ADD COLUMN application_context text;
-- 'recall' | 'calculation' | 'design_application' | 'code_interpretation' | 'client_scenario'
```

New quiz generation option: `contextual_variation: true` — when enabled, the session draws one question per context type from the same taxonomy nodes.

---

### 8.3 Phase 3 — Category-Defining Differentiators

#### Anxiety Inoculation / Pressure Protocol

**What it is:** A structured 2-week protocol within Storm Mode in the final stretch before the exam. Introduces deliberate environmental stressors to inoculate against cortisol response on exam day:
- Slightly shortened time per question (5% below the student's comfortable pace)
- Occasional simulated "processing delay" (a question takes 3 seconds to load — replicating real exam center conditions)
- Mandatory sequential answering with no flagging or return
- Random question order (no subject clustering)

**Psychological basis:** Stress inoculation from sports psychology and military training — prior exposure to controlled stressors reduces physiological stress response to the actual event. Jamieson et al. (2010) showed arousal reattribution ("this anxiety is excitement") measurably improved GRE scores.

**Voice:** "The exam room won't be comfortable. We're going to make sure that's familiar, not frightening."

---

#### Feynman Teach-Back

**What it is:** Post-study: the student explains a concept in plain language. The AI Reference Assistant evaluates conceptual completeness (not phrasing) against SME-authored criteria.

**Three entry points:**
1. Post-Wiki article: optional "Explain this in your own words" prompt at scroll completion
2. Post-Blindspot Protocol queue: offered for nodes that just shifted Red → Amber
3. Camp Trail day completion: final step before day is marked complete (skippable)

**The evaluation — 5 dimensions:**
1. **Conceptual completeness:** Did the student cover the core mechanism?
2. **Causal reasoning:** Did they explain *why*, not just *what*? Definitions disguised as explanations are detected.
3. **Accuracy:** Any factually incorrect claims? (checked against SlateCamp database, not general knowledge)
4. **Philippine code specificity:** Does the explanation reference Philippine codes where applicable?
5. **Missing critical exceptions:** Did they cover the exceptions the ALE loves to test?

**Output:** Not a score. A gap analysis:
> "What you got right: [list]  
> What was missing: [list]  
> One factual issue: [specific correction with citation]  
> Revision prompt: [one focused question]"

**Effect size:** d=0.55–1.0 for self-explanation. Among the highest in learning science literature.

**Schema additions:**
```sql
CREATE TABLE public.teach_back_submissions (
    submission_id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL REFERENCES auth.users(id),
    topic_id uuid REFERENCES public.taxonomy_tree(node_id),
    entry_point text NOT NULL,  -- 'wiki' | 'blindspot' | 'trail'
    trail_day_id uuid REFERENCES public.trail_days(day_id),
    prompt_text text NOT NULL,
    student_response text NOT NULL,
    evaluation_result jsonb DEFAULT '{}',
    gaps_identified text[] DEFAULT '{}',
    revised_response text,
    submitted_at timestamptz DEFAULT now() NOT NULL,
    revised_at timestamptz,
    PRIMARY KEY (submission_id)
);

CREATE TABLE public.topic_teach_back_criteria (
    criteria_id uuid DEFAULT gen_random_uuid() NOT NULL,
    topic_id uuid NOT NULL REFERENCES public.taxonomy_tree(node_id),
    required_concepts text[] NOT NULL DEFAULT '{}',
    required_exceptions text[] NOT NULL DEFAULT '{}',
    common_misconceptions text[] NOT NULL DEFAULT '{}',
    code_citations text[] NOT NULL DEFAULT '{}',
    authored_by uuid REFERENCES auth.users(id),
    created_at timestamptz DEFAULT now() NOT NULL,
    PRIMARY KEY (criteria_id)
);
```

**Marketing moment:** First Philippine Licensure Exam review platform that teaches you how to teach what you know. A 60-second screen recording — student types an explanation, AI surfaces a gap they didn't know they had, student revises — is a demo video that writes itself.

---

## 9. Freemium & Pricing Architecture

### 9.1 Tier Structure

| Feature | Free | Pro | Institutional |
|---|---|---|---|
| Wiki — full access | ✓ | ✓ | ✓ |
| Assessment quiz | Once, free | Repeatable | Cohort-assigned |
| Readiness Score | Assessment reveal only | Always live | Always live |
| Taxonomy heatmap | Locked / blurred | Full | Full + cohort view |
| Questions | Easy only · 20/day | All difficulties · unlimited | All difficulties · unlimited |
| Daily quiz cap | 20 questions | None | None |
| Camp Trails | 1 basic trail (ALE Starter) | Full library | Faculty-assigned trails |
| Blindspot Protocol | Locked | ✓ | ✓ |
| Endurance Cycle | Locked | ✓ | ✓ |
| Proof Simulation | Locked | ✓ | ✓ |
| 3D Lab | Preview (guided tour only) | Full (all modes) | Full |
| AI Reference Assistant | Limited (3 queries/day) | Unlimited | Unlimited |
| Analytics Dashboard | Locked | Full | Full + cohort analytics |
| Notes workspace | ✓ | ✓ | ✓ |
| Price | ₱0 | ₱3,999 / exam cycle | Per-seat contract |

### 9.2 Conversion Funnel Logic

```
New user arrives → Assessment quiz (free, full, no cap)
       ↓
Score reveal (one-time, free) → Blurred heatmap → Trail recommendation
       ↓
Free user: Quiz daily (easy only, 20/day cap) → Hits cap
       ↓
Blindspot Protocol surfaces gap: "3 Red nodes — unlock Blindspot Protocol to fix them" → Paywall
       ↓
Heatmap shows blurred data: "Unlock to see exactly where your gaps are" → Paywall
       ↓
"Your Readiness Score updated 14 times since you started. Upgrade to track it." → Paywall
       ↓
Pro conversion
```

**The principle:** The score is the hook. The locked features around it are the conversion. The student is looking at *their own data* creating the urgency — not manufactured scarcity.

### 9.3 The Free Tier Honest Framing

The tagline "Know you'll win." applies to the Pro experience. The free tier needs its own honest framing:

> "Find your gaps. Start your trail. Know what to fix first."

This promises exactly what it delivers — orientation, not certainty.

---

## 10. Database Schema

### 10.1 Existing Tables (Current Production Schema)

```
disciplines          — exam disciplines (ALE, etc.)
taxonomy_tree        — 6-level hierarchy, all ALE nodes, slugs, is_leaf
questions            — question bank with IRT fields, rationale, code_citation
quiz_sessions        — session state, test_mode (camp/timed/practice), config
user_interactions    — immutable per-answer log: correct, time_spent, flagged
user_node_mastery    — per-user per-node: attempts, correct, EMA weight, avg_time
readiness_score_snapshots — append-only score history
user_global_stats    — current_discipline_id, global_readiness_score, target_exam_date
user_subscriptions   — tier (free/pro/enterprise), status, Stripe/Payrex IDs
wiki_articles        — title, slug, content (text/MDX)
wiki_article_taxonomy — article ↔ node mapping (with is_primary flag)
models_3d            — 3D model registry: name, slug, url, thumbnail
spatial_hotspots     — hotspot positions on 3D models with node links
notes                — JSONB block content, auto-tagged to topic/article/question
note_folders         — folder organization for notes
organizations        — institutional accounts
organization_members — org ↔ user roles (owner/admin/instructor/member)
feature_flags        — platform-level feature toggles with tier/role targeting
```

### 10.2 Planned Schema Additions (in priority order)

**Priority 1 — Camp Trail (current sprint):**
- `camp_trails`
- `trail_days`
- `trail_steps`
- `user_trail_enrollments`
- `user_trail_progress`
- `trail_day_completions`
- `session_trail_credits`
- New enums: `trail_type`, `trail_intensity`, `trail_step_type`, `trail_enrollment_status`

**Priority 2 — Assessment & Onboarding:**
- Column: `questions.is_assessment boolean`
- Column: `user_global_stats.assessment_completed_at timestamptz`
- Column: `user_global_stats.assessment_score double precision`

**Priority 3 — Phase 1 Integrations:**
- Column: `quiz_sessions.pre_session_confidence_ratings jsonb`
- Column: `user_interactions.error_type text`
- Column: `trail_steps.preferred_time text`

**Priority 4 — Phase 2 Integrations:**
- Column: `questions.application_context text`
- Column: `user_node_mastery.teach_back_attempted boolean`
- Column: `user_node_mastery.teach_back_gap_count integer`

**Priority 5 — Phase 3 Integrations:**
- Table: `teach_back_submissions`
- Table: `topic_teach_back_criteria`

---

## 11. Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Framework | Next.js (App Router) | Server Components by default. No useEffect for data fetching. |
| Styling | Tailwind CSS 4 | Utility-first. Design tokens via CSS variables. |
| UI Components | shadcn/ui | Accessible primitives. Extended with custom SlateCamp components. |
| Database | Supabase (PostgreSQL) | RLS policies on every table. Service role for admin operations only. |
| Auth | Supabase Auth | JWT. All data scoped to `auth.uid()`. |
| State Management | Zustand | Client-side state for quiz engine and 3D Lab. |
| 3D Engine | React Three Fiber + @react-three/drei | GLTF/GLB format. Blender Python for model generation. |
| Payments | Stripe (international) + Payrex (Philippines) | Both `stripe_customer_id` and `payrex_customer_id` on `user_subscriptions`. |
| AI | Anthropic Claude API | Temperature 0.0. Bounded RAG. Mandatory citations. |
| IDE | Cursor IDE + Claude Code | Vibe coding. CLAUDE.md and .cursorrules as persistent context. |

**Hard constraints (non-negotiable in all code):**
- No `useEffect` for data fetching — use RSC async components
- No client-side Supabase writes — use Server Actions only
- No `any` types in TypeScript
- No pure black (#000000) or pure white (#FFFFFF) in styling
- No bouncy animations, gradients, or heavy drop shadows (max 150ms transitions)
- All DB writes go through Server Actions with proper RLS enforcement

---

## 12. Design System

### 12.1 Color Tokens

| Token | Value | Usage |
|---|---|---|
| Primary | Cobalt Blue `#1B3FC4` | CTAs, active states, links, brand |
| Accent Gold | Signal Gold `#F5A623` | Highlights, scores, key data points |
| Accent Red | Signal Red `#E63329` | Red heatmap nodes, errors, critical gaps |
| Accent Green | Signal Green `#1B7A3C` | Green heatmap nodes, correct answers, mastery |
| Accent Orange | Camp Orange `#E8853A` | Amber heatmap nodes, developing states |
| Neutral Cream | `#F2F0EB` | Primary background surface |
| Neutral Warm White | `#F8F7F5` | Secondary background, cards |

### 12.2 Typography

| Role | Font | Weight |
|---|---|---|
| Display / Headings | Syne | 800 |
| Hero H1 | GeistSans | variable |
| Body / UI | Inter | 400/500/600 |
| Labels / Eyebrows | DM Mono | 500, uppercase, tracked |
| Editorial quotes | Instrument Serif | italic (rare) |

### 12.3 UX Constraints (Rams Standard)

- Functional color only — color encodes meaning, never decoration
- No bouncy animations — max 150ms transition, ease-standard cubic-bezier
- No manufactured urgency in any UI string
- No confetti, badges, virtual currency, social leaderboards, or streaks-as-goals
- No exclamation marks in system-generated copy
- No emoji in system-generated copy
- Every empty state is informative, not apologetic
- Every error state has a clear next action

---

## 13. Brand Voice Constraints

All UI strings, error messages, onboarding copy, and system-generated feedback must pass this filter before shipping.

### The Voice Character

"Confident companion" — 65% warm, 35% authoritative. The best professor you ever had. The kind of person whose feedback you take seriously because you know it comes from genuine investment in your outcome.

### Forbidden Patterns

| Pattern | Example | Why |
|---|---|---|
| Toxic positivity | "You're doing amazing just by showing up!" | Dilutes honest feedback, disrespects the student |
| Catastrophizing | "CRITICAL DANGER: Exam failure risk is severe" | Creates anxiety, not action |
| Vague motivation | "Keep going! You've got this!" | Empty calories — no information content |
| Feature hype | "Explore your personalized adaptive learning journey!" | Platform-speak, no meaning |
| Manufactured urgency | "Only 3 days left — don't fall behind!" | Dark pattern |
| Inflated scores | Showing 72% when the honest number is 58% | Direct betrayal of the brand promise |
| Pity | "It must be so stressful for you right now" | Sympathy without action is theater |

### Required Patterns

| Context | Required Approach |
|---|---|
| Low score | State the number. Immediately follow with specific next action. |
| Wrong answer | Factual correction. Why it trips people. Direct link to the fix. |
| Node state change | Report what changed, what didn't, when the next checkpoint is. |
| Completion | Factual acknowledgment. What the data says now. What's next. |
| Paywall | State specifically what is unlocked and why it helps the student pass. |

---

## 14. Build Status Registry

| Feature | Status | Phase | Schema Ready | UI Designed | Built | Priority |
|---|---|---|---|---|---|---|
| Wiki | ✅ Complete | — | ✓ | ✓ | ✓ | — |
| Quiz Engine (Camp + Storm) | ✅ Complete | — | ✓ | ✓ | ✓ | — |
| Notes Workspace | ✅ Complete | — | ✓ | ✓ | ✓ | — |
| Analytics Dashboard | ✅ Complete | — | ✓ | ✓ | ✓ | — |
| Dashboard (Daily Launchpad) | 🔄 In progress | — | ✓ | ✓ | Partial | High |
| 3D Lab | ⚠️ Designed | — | ✓ | ✓ | No (404) | High |
| AI Reference Assistant | ⚠️ Designed | — | ✓ | ✓ | No | Medium |
| Blindspot Protocol | ⚠️ Designed | — | No | ✓ | No | Post-Trail |
| Endurance Cycle | ⚠️ Designed | — | No | ✓ | No | Post-Trail |
| Proof Simulation | ⚠️ Designed | — | No | ✓ | No | Post-Trail |
| **Assessment Quiz** | 🔄 **In progress** | Onboarding | Partial | Partial | No | **Highest** |
| **Camp Trail** | 🔄 **In progress** | Flagship | Partial | Partial | No | **Highest** |
| Score Reveal Screen | 🔄 New | Onboarding | No | No | No | High |
| Trail Recommendation Engine | 🔄 New | Onboarding | No | No | No | High |
| Metacognitive Calibration | 🆕 Planned | Phase 1 | No | No | No | Medium |
| Error Taxonomy | 🆕 Planned | Phase 1 | No | No | No | Medium |
| Elaborative Interrogation | 🆕 Planned | Phase 1 | No | No | No | Medium |
| Sleep-Aware Scheduling | 🆕 Planned | Phase 1 | No | No | No | Low |
| Successive Relearning | 🆕 Planned | Phase 2 | No | No | No | Medium |
| Worked Example Progression | 🆕 Planned | Phase 2 | No | No | No | Medium |
| Contextual Variation Practice | 🆕 Planned | Phase 2 | No | No | No | Medium |
| Anxiety Inoculation Protocol | 🆕 Planned | Phase 3 | No | No | No | Low |
| Feynman Teach-Back | 🆕 Planned | Phase 3 | No | No | No | Low |

---

*SlateCamp Product Architecture Document v2.0*  
*Internal · Product Architect Reference · © 2025 SlateCamp*  
*Maintained by: Claude (Product Architect) + Philip (Founder)*

