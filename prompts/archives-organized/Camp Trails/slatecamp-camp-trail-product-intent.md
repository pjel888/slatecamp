# Camp Trail — Product Intent Document
**SlateCamp Internal · Product Architect**  
**Version:** 1.0 · March 2026  
**Classification:** Internal · Feature Specification

---

## The One Problem Camp Trail Solves

Every new SlateCamp user lands on the platform with high motivation and no idea what to do next. They have a Readiness Score. They have a Heatmap. They have a question bank. They can see their gaps. But the gap between "I see my gaps" and "I know exactly what to do today" is precisely where most reviewers abandon their review and go back to the PDF dumps and photocopied notes they started with.

This is the cold start problem. The adaptive engine needs data to be adaptive. On Day 1, there is no data. On Day 3, there is barely enough. The student is expected to self-direct their way through an 8-subject, 172-node syllabus based on a Readiness Score they received four days ago. Most cannot do this. Not because they lack discipline — but because no one has ever given them a real map.

Camp Trail is the map.

It is a structured, daily-prescription engine built into the core of SlateCamp. It tells the student exactly what to read, what to quiz, and what to explore in the 3D Lab — in the right sequence, on the right day, calibrated to their exam date and their specific gaps. It removes the cognitive load of "what should I study today" so the student can spend their energy on the studying itself.

---

## What Camp Trail Is — and What It Is Not

### What it is
A flagship retention feature that gives students a structured, prescriptive daily study program. It is a sequence of days, each with 2–4 prescribed activities (Wiki reads, quiz sessions, 3D Lab modules), ordered according to pedagogical principles, anchored to the student's target exam date, and adapted to their baseline Readiness Score.

### What it is not
- **Not a replacement for the quiz engine.** Camp Mode and Storm Mode exist independently. Trail steps that include quizzing call the existing quiz engine with specific node targets.
- **Not a gamification layer.** There are no badges for completing trails, no trophies for Day 7 streaks, no confetti on day completion. The only reward is a greener heatmap and a rising Readiness Score — which are real.
- **Not an onboarding flow.** It surfaces after the assessment quiz, once the student has a baseline score and an emotional reason to commit. It is a retention mechanic, not an acquisition mechanic.
- **Not a rigid linear program.** Students can complete steps in any order within a day. They can pause a trail and resume. They can abandon a trail without shame. The map remembers where they are.
- **Not a subscription gate unto itself.** Free users get one basic trail. Pro users get the full library. The gate is on the library, not on the concept.

---

## The Trail Library

### Time-Gated Programs
These are the primary trail type. A specific number of days, prescribed activities per day, sequenced from fundamentals to complexity.

| Trail | Duration | Daily Load | Target User |
|---|---|---|---|
| 2-Week Intensive | 14 days | ~3 hrs/day | Final sprint. Exam is imminent. Strong baseline needed. |
| 4-Week Accelerated | 28 days | ~2 hrs/day | Solid foundation, targeted gap closure. |
| 8-Week Standard | 56 days | ~1.5 hrs/day | **Default recommendation for most users.** Balanced coverage. |
| 12-Week Comprehensive | 84 days | ~1.5 hrs/day | Full syllabus rebuild. Score below 50% on assessment. |
| 6-Month Undergraduate | 180 days | ~45 min/day | Year 1–5 architecture students. Long horizon, low urgency. |

### Subject Mastery Paths
Vertical trails, 1–2 weeks each. One ALE subject, studied deeply. The sequence within a subject trail is: foundational Wiki reads → recall-level quizzing → application-level quizzing → 3D Lab module (if spatial) → mastery quiz. Designed for students who want to target a specific weakness identified by their heatmap.

Available paths (one per subject):
- History of Architecture (ALE-HIST)
- Theory of Architecture (ALE-THEO)
- Theory and Principles of Planning (ALE-PLAN)
- Architectural Practice and Jurisprudence (ALE-PRAC)
- Structural Design (ALE-STRC)
- Building Materials and Construction Methods (ALE-MATL)
- Building Utilities / MEPF (ALE-UTIL)
- Architectural Design and Site Planning (ALE-DSGN)

### Code Deep-Dives
Single Philippine building code or legal instrument, 1–2 weeks. For students who need to master the specifics of a code they keep failing.

Available deep-dives:
- PD 1096 — National Building Code
- RA 9514 — Revised Fire Code
- BP 344 — Accessibility Law (2024 IRR)
- NSCP 2015 — National Structural Code
- RA 9266 — Architecture Act
- PEC — Philippine Electrical Code
- National Plumbing Code
- PD 957 / BP 220 — Housing Standards

### Targeted Remediation
Short, sharp, 5–7 days. Auto-suggested by the Blindspot Protocol when a node stays Red for 3+ weeks despite quiz activity. This is the system's way of saying: "Quiz questions alone have not fixed this. Here is a structured intervention."

### Exam Simulation Trail
Activated automatically when `target_exam_date` is within 14 days. Heavy Storm Mode. Daily Proof Simulation checkpoints. Transitions directly into the Proof Simulation feature. This trail exists to simulate the conditions of the actual exam, not to introduce new content.

---

## The Recommendation Engine

The trail recommendation runs immediately after the Score Reveal screen. It takes two inputs: the student's Readiness Score and the number of days until their target exam date. It produces one recommendation with a clear rationale — not a menu of options, not a "choose your own adventure." One recommendation.

### Recommendation Matrix

| Days to Exam | Score < 50% | Score 50–64% | Score ≥ 65% |
|---|---|---|---|
| > 180 days | 6-Month Undergraduate | 6-Month Undergraduate | 6-Month Undergraduate |
| 84–180 days | 12-Week Comprehensive | 12-Week Comprehensive | 8-Week Standard |
| 57–84 days | 12-Week Comprehensive | 8-Week Standard | 8-Week Standard |
| 29–56 days | 8-Week Standard | 8-Week Standard | 4-Week Accelerated |
| 15–28 days | 4-Week Accelerated | 4-Week Accelerated | 2-Week Intensive |
| ≤ 14 days | Exam Simulation Trail | Exam Simulation Trail | Exam Simulation Trail |

### Recommendation Copy
The recommendation is never presented as a number or a label alone. It includes a reason and a Week 1 preview:

> *"Based on your score of 54% and 71 days until your exam, the 8-Week Standard Trail is the right fit. Week 1 focuses on Building Laws — your biggest gap."*

The "Week 1 focuses on X" is always the student's weakest subject by mastery weight — the system is answering their actual question before they ask it.

### Retaker Recommendation Handling
For users who have self-identified as returning reviewers (`profiles.reviewer_type = 'returning_reviewer'`), the recommendation engine has access to their previous attempt's heatmap data. The recommendation is modified accordingly:

> *"Your Readiness Score reached 71% before your last exam. The gap was concentrated in Building Laws and Professional Practice. This 8-Week Trail focuses there first. Your mastery data is still here. You don't start over."*

The word "fail" never appears. The previous attempt is framed entirely as data, not as failure.

---

## Trail Sequencing — The Pedagogical Logic

This is the part that separates Camp Trail from a study schedule someone writes on a notepad. The sequence of content within a trail is not arbitrary. Every decision is grounded in research.

### 1. Bloom's Level Progression Within a Subject
Within any subject covered by a trail, subtopics are introduced in cognitive order:
- **Remember** (recall facts, definitions, code numbers) — first
- **Understand** (explain concepts, describe relationships) — second
- **Apply** (use in scenarios, evaluate configurations) — third
- **Analyze** (multi-step reasoning, synthesize across codes) — last

A student cannot be asked to evaluate a fire exit configuration in a scenario question until they have first encountered the travel distance values at recall level. The `bloom_level` field from taxonomy v5.0 drives this sequencing automatically.

### 2. Difficulty Ramp Within Each Bloom Level
Within the same Bloom's level, easier questions (difficulty 1) come before harder questions (difficulty 4). The student is never thrown into expert-level content without foundational exposure.

### 3. Prerequisite Enforcement
The `taxonomy_prerequisites` junction table stores the prerequisite DAG — the directed graph of "X must be mastered before Y." When a trail includes a subtopic that has prerequisites, the trail sequencer ensures the prerequisite appears as an earlier step. If a prerequisite regresses to Red during the trail (the student forgets it), the trail surfaces a flag: "This topic depends on [X]. Your mastery of [X] has dropped. Consider reviewing it before continuing."

### 4. Three_d_lab_linked Routing
Subtopics with `three_d_lab_linked = true` get a 3D Lab step inserted before their quiz step, not after. The spatial model is the orientation — the quiz is the consolidation. A student who sees a parametric stairway configurator before answering questions about riser heights retains the values spatially, not just lexically.

### 5. Sleep-Aware Scheduling
Trail steps have a `preferred_time` field: `morning`, `evening`, or `any`.
- `step_type: wiki` and `step_type: lab` → tagged `preferred_time: evening` (new conceptual content is best processed with overnight sleep consolidation)
- `step_type: quiz` on previously-learned content → tagged `preferred_time: morning` (retrieval after overnight consolidation)

The student's profile stores their preferred study window (`profiles.preferred_study_window`). When a step's preferred time doesn't match the student's window, the step shows a small label: *"Best studied in the evening"* — not a block, just a nudge.

This is based on Walker (2017) and Stickgold (2005): sleep actively consolidates declarative memory formed the preceding day. Morning retrieval capitalizes on that consolidation. This is the only time-aware scheduling mechanic in the platform that has a direct neurological basis.

### 6. Computation-Heavy Session Time Budgets
Subtopics with `is_computation_heavy = true` (primarily ALE-STRC structural calculations and ALE-UTIL plumbing fixture counts) get a longer time estimate on their trail step card. A quiz session targeting a computation-heavy node is not the same as one targeting a recall node — the student needs more time, and the UI should communicate that honestly. Telling a student "this will take 15 minutes" and having it actually take 35 minutes erodes trust immediately.

### 7. Subject Coverage Balance
Time-gated trails do not frontload one subject and abandon others. The 8-Week Standard Trail interleaves all 8 subjects across its 56 days. Earlier weeks emphasize Area A subjects (History, Theory, Planning, Practice) since these are the same subjects tested on ALE Day 1. Later weeks shift emphasis to Area B and Area C (Structural, Materials, Utilities, Design). The final 2 weeks of any time-gated trail shift to integration: mixed-subject sessions that simulate the ALE's non-clustered item distribution.

---

## The Daily Experience

### The Dashboard Card
The dominant element on the Dashboard is the Today's Trail Day card. It answers one question: *"What do I do today?"* It shows:
- Day number and subject name
- Total estimated time
- A progress indicator (0/3 steps complete)
- One primary CTA: "Start Day [N] →"

The Readiness Score is above the fold, always visible. The Trail card is the largest visual element after the score. Nothing else competes with these two for visual weight.

### The Day Detail Screen
When the student taps "Start Day [N]," they see all steps for the day. Each step shows:
- Step type icon (📖 Wiki / ⚡ Quiz / 🏛️ 3D Lab / 🔄 Review)
- Step title — specific, never generic. "RA 9514 Fire Code: Travel Distances" not "Wiki Reading."
- Estimated time
- Completion state: grey (pending) → green check (complete)
- Sleep-aware label if applicable ("Best studied in the evening")

Steps can be completed in any order within a day. There is no forced linear sequence within a single day. The student knows their schedule — the platform doesn't pretend to.

### Step Completion Flow
Each step type routes to the appropriate experience:
- **Wiki step** → Opens the article. On scroll completion (or "Mark as Read" button), the step is marked complete. Back navigation always shows "← Back to Day [N]" — the trail is never more than one tap away.
- **Quiz step** → Launches Camp Mode with the step's `target_node_ids` as the subject filter. Session length from the step's `question_count`. On session completion, step is marked complete and `user_interactions` are written with trail attribution.
- **Lab step** → Opens the 3D Lab module at the specified `lab_phase` (guided, faded, sandbox, or challenge). On module completion, step is marked complete.
- **Review step** → A lightweight Camp Mode session targeting nodes from the past 3 trail days. Spaced repetition within the trail structure itself.

### Day Completion
When all steps in a day are complete:
- `trail_day_completions` is written with the current Readiness Score
- The Heatmap updates to reflect any mastery changes from the day's sessions
- A factual acknowledgment appears (no confetti, no badge): *"Day 14 complete. Structural Systems — covered."* If the mastery on nodes covered today measurably improved, show: *"Your structural mastery moved from 48% to 61% today."* This is competency recognition, not gamification. It is satisfying because it is true.
- The next day's preview is shown immediately: *"Tomorrow: Structural Design — Seismic Design Fundamentals. ~45 minutes."*

---

## Integration With Every Other System

Camp Trail is not a standalone feature. It is the organizing structure that connects every other system in the platform.

### → Readiness Score
Every quiz step completion in a trail writes to `user_interactions`, which updates `user_node_mastery`, which updates the Readiness Score. The trail is not a separate scoring context — it feeds the same mastery engine as free-form Camp Mode. `trail_day_completions` stores `readiness_score_at_completion`, enabling a trajectory chart that shows score progression day-by-day through the trail.

### → Taxonomy Heatmap
Because trail steps write to `user_node_mastery`, the heatmap changes as the student progresses through the trail. On Day 1 the heatmap is grey or red across most nodes. By Day 30 it should be showing meaningful amber and green. The heatmap's progression is the visual evidence that the trail is working. This is the only motivation signal we need — we do not need badges.

### → Blindspot Protocol
The Blindspot Protocol runs nightly regardless of trail status. If the protocol identifies a Red node that is also targeted by the student's current trail day, the protocol surfaces a priority flag on that trail step: *"The Blindspot Protocol flagged this topic as a critical gap. This step matters more than usual today."* Conversely, if a node stays Red for 3+ consecutive weeks despite being covered by trail steps, the Blindspot Protocol triggers a Targeted Remediation trail suggestion: *"Your progress on Fire Code Travel Distances hasn't moved in 3 weeks. A 5-day focused trail on this topic has a higher chance of moving it than continued Camp Mode sessions."*

### → 3D Lab
Trail steps of `step_type: lab` route to a specific 3D Lab module with a specific `lab_phase`. This means the same model can be prescribed multiple times across a trail at increasing phases of complexity:
- Day 5: PD 1096 Stairway Configurator — Guided Tour
- Day 18: PD 1096 Stairway Configurator — Faded Example
- Day 35: PD 1096 Stairway Configurator — Full Sandbox

The student revisits the same model three times across three weeks, each time at higher cognitive demand. This is the Worked Example Progression from CLT applied to trail design.

### → Wiki
Wiki steps in the trail route to specific articles tagged to the day's target nodes. When the student is in a trail context, the Wiki article shows a subtle "Trail context" indicator: *"This article is part of Day 14 of your 8-Week Standard Trail."* The back navigation always returns to the trail. Articles read in trail context are attributed to the trail in analytics, so we can measure whether Wiki reads actually precede improved quiz performance on those nodes.

### → Proof Simulation
The Exam Simulation Trail leads directly into Proof Simulation. The final 3 days of any time-gated trail (when `target_exam_date` is within 7 days) automatically recommend switching to the Exam Simulation Trail, which terminates with a full Proof Simulation. The Proof Simulation is not a trail step — it is the trail's graduation condition.

### → Metacognitive Calibration
Pre-session confidence ratings (`quiz_sessions.pre_session_confidence_ratings`) are collected for all quiz steps in a trail. Over time, the trail generates a calibration chart: subject by subject, did the student accurately predict their performance? The trail becomes the longitudinal calibration study, not just a study schedule.

### → Error Taxonomy
Wrong answers in trail quiz sessions include the `error_type` field (`knowledge_gap`, `misread`, `distractor`, `code_version`, `time_pressure`). Aggregate patterns across trail days tell the student and the system something specific: a student who consistently marks `misread` during structural calculation sessions doesn't need more structural content — they need question-reading strategy training. The trail recommendation can be modified accordingly.

---

## Simultaneous Enrollment

A student can be enrolled in more than one trail at the same time. The canonical example: a student is on Day 23 of the 8-Week Standard Trail, but their upcoming exam is in 4 weeks, so they also enroll in the 4-Week Accelerated Trail.

The `session_trail_credits` table handles attribution. One quiz session generates `user_interactions` that may overlap with the target nodes of multiple active trails. The session credits both trails simultaneously — the student doesn't do double the work.

**Soft cap:** Two active trails simultaneously, surfaced as a data-driven UI warning rather than a hard block: *"You have 2 active trails. Most students find more than 2 difficult to balance — but if your schedule supports it, it's possible."* We surface the data. We don't enforce an artificial gate.

---

## Gamification Constraints

Camp Trail must pass the same test every feature passes: *Does this make a student more likely to pass their board exam?*

**Permitted:**
- Day completion acknowledgment with actual mastery change data ("Your structural mastery moved from 48% to 61%")
- Trail progress indicator (Day 14 of 56)
- Subject mastery milestone when a node group crosses a research-calibrated threshold ("Building Laws — Strong")
- Readiness Score trajectory chart showing progress across trail days

**Permanently prohibited:**
- Streak badges or "X-day streak" trophies
- Trail completion trophies
- XP or point systems tied to trail steps
- Confetti, animations, or celebratory sound effects on day/step completion
- Any comparison of one student's trail progress against another student's

The reason: badges reward activity volume. Trail completion is only valuable if the activity was the right activity. A student who completes all 56 days of the Standard Trail while grinding easy questions has earned a badge and failed the exam. The Readiness Score trajectory is the gamification — because it is the only signal that actually tracks readiness.

---

## The Retaker Experience

Retakers (`profiles.reviewer_type = 'returning_reviewer'`) interact with Camp Trail differently from first-time users in three specific ways:

**1. Recommendation is data-informed from the prior attempt.** Their previous heatmap state, Readiness Score trajectory, and node-level mastery history from the failed cycle are preserved. The recommendation cites this: *"Your mastery data is still here. You don't start over."*

**2. The trail front-loads the subjects that caused the failure.** Standard trail sequencing covers all subjects in a balanced order. For retakers, the sequencing algorithm identifies the subjects where mastery was lowest at exam time in the prior cycle and moves those subject blocks to Week 1 and Week 2. The same content, different order.

**3. The Proof Simulation unlocks on Day 1.** First-time users must reach a competency threshold (≥70% of nodes Amber+) before the Proof Simulation unlocks. Retakers bypass this gate. They have already sat a full exam. They need to simulate exam conditions immediately to diagnose the pressure-performance gap — the difference between their preparation score and their actual exam performance.

---

## The Fresh Start Effect — Enrollment Timing

The Fresh Start Effect (Dai et al., 2014) shows 33–50% motivation boost when goals are started on psychologically significant dates. Camp Trail enrollment should be surfaced and nudged on:
- Mondays (weekly fresh start)
- 1st of the month
- The day after PRC results release (both for passers referring friends and for retakers starting over)
- The day after a Proof Simulation score is received

The system does not block enrollment on other days — but push notifications and email nudges about trail enrollment are timed to these dates.

---

## Pricing Gate

| Tier | Camp Trail Access |
|---|---|
| Free | 1 basic trail only — the ALE Starter (4-week standard, highest-frequency nodes only) |
| Pro (₱6,999/cycle) | Full trail library — all types, all subjects, all code deep-dives |
| Annual Pro (₱9,999/year) | Full trail library + simultaneous enrollment feature unlocked |
| Student (₱1,999/semester) | Full trail library (same as Pro, different pricing context) |
| Institutional | Faculty-assigned trails. Instructor can assign specific trails to cohorts. Dean's Dashboard shows aggregate trail progress. |

The free trail (ALE Starter) is not a stripped-down version that frustrates. It is a complete, functional trail that covers the highest-frequency content across all 8 subjects in 28 days. It should produce genuine improvement on its own. The Pro gate is on the depth and personalization of the full library — not on the existence of the experience itself.

---

## The Science Foundation

Every structural decision in Camp Trail maps to a specific research finding. This is not decorative — it is the reason the feature is built the way it is.

| Principle | Research Basis | Application in Camp Trail |
|---|---|---|
| Implementation intentions | Gollwitzer, 1997 — d=0.65 vs open-ended goals | Daily prescriptions ("Study X today") vs "study more" advice |
| Fresh start effect | Dai et al., 2014 — +33–50% motivation boost | Enrollment timing nudges on psychologically significant dates |
| Spaced repetition + structure | French medical school study, 2025 — 2× pass rate | SRS within quiz steps, Review step type |
| Cohort completion advantage | 85–96% cohort vs 3–15% self-paced | Daily prescription model simulating cohort accountability |
| Mastery learning | Guskey, 1988 — d=0.52–0.94 | Mastery-gated subject paths, node-level threshold checks |
| Progressive interleaving | Rohrer et al., 2014 — d=1.05 | Later trail weeks mix subjects rather than blocking by subject |
| Worked example effect | Sweller, 1988 — d=0.57 | 3D Lab phases (Guided → Faded → Sandbox) across trail days |
| Expertise reversal effect | Kalyuga et al., 2003 | Bloom's level progression within subject |
| Sleep-based consolidation | Walker, 2017; Stickgold, 2005 | preferred_time field on trail steps |
| Testing effect | Roediger & Karpicke, 2006 — d=0.50 | Review step type, morning quiz sessions |

---

## Database Schema Reference

### Tables

**`camp_trails`** — platform-curated trail templates. Contains name, description, trail_type, trail_intensity, total_days, is_published, is_featured, feature_flag_key.

**`trail_days`** — one row per day in a trail. Contains trail_id, day_number, title, subject_focus, estimated_minutes.

**`trail_steps`** — activities within each day. Contains day_id, step_order, step_type, title, target_node_ids (uuid[]), question_count, wiki_article_id, model_id, lab_phase, preferred_time, is_optional, estimated_minutes.

**`user_trail_enrollments`** — one row per student per trail. Contains user_id, trail_id, status (active/paused/completed/abandoned), started_at, target_completion_date, current_day_number, days_completed_at_abandon.

**`user_trail_progress`** — step-level completion log. Immutable. Contains enrollment_id, step_id, completed_at, session_id (if quiz step), readiness_score_delta.

**`trail_day_completions`** — materialized day-level record. Contains enrollment_id, day_number, completed_at, readiness_score_at_completion, all_steps_completed.

**`session_trail_credits`** — attribution bridge for simultaneous enrollment. Unique on (session_id, enrollment_id, step_id). Allows one quiz session to credit multiple active trails.

### Key Design Decisions

**`trail_steps` uses `target_node_ids uuid[]`, not specific question IDs.** Questions are drawn from the live question bank at runtime using the node IDs as the pool. This means the trail never goes stale as new questions are added. A trail authored today against 34 questions works identically when the question bank has 3,400.

**`trail_day_completions` stores `readiness_score_at_completion`.** This produces the score trajectory chart — a line chart of Readiness Score progression across every day of the trail. This is the single most retention-driving visualization in the product: a student who can see their score move from 38% on Day 1 to 61% on Day 30 has visual proof that the trail is working.

**`user_trail_enrollments` stores `days_completed_at_abandon`.** When a student abandons a trail, this records how far they got. This is essential data for two purposes: (1) re-engagement can reference the exact position ("You were on Day 23 when you left. Day 24 is waiting."), and (2) the data science team can analyze at what day number abandonment clusters to identify structural weaknesses in specific trails.

### New Enums

```
trail_type:               time_gated | subject_mastery | code_deep_dive | remediation | exam_simulation
trail_intensity:          intensive | accelerated | standard | comprehensive | undergraduate
trail_step_type:          quiz | wiki | lab | review
trail_enrollment_status:  active | paused | completed | abandoned
```

---

## What Successful Camp Trail Looks Like

A student who completes the 8-Week Standard Trail should:
- Have touched every one of the 172 leaf nodes at least once
- Have demonstrated recall-level competency on all nodes
- Have demonstrated application-level competency on high-frequency code provisions
- Have seen every 3D Lab module linked to their studied nodes
- Have a Readiness Score that has measurably improved from their Day 1 baseline
- Have a heatmap that is predominantly amber and green, with isolated red nodes as targets for the next phase

They should not:
- Have a Readiness Score that says 85%+ if they have not genuinely demonstrated application-level competency (see: Readiness Score anti-inflation mechanics)
- Have completed the trail but still have large grey areas on their heatmap
- Feel that the trail was a checkbox exercise

The governing question is always: *does this make a student more likely to pass their board exam?* Camp Trail's answer is only yes if it drives genuine mastery, not just activity completion.

---

*Camp Trail Product Intent Document · v1.0 · March 2026*  
*SlateCamp Internal · Product Architect*  
*Source references: Product Architecture Map v2.1, Camp Trail Feature Spec, 3D Visual Learning Research, Taxonomy v5.0, Feature Research Report, UX Research Deep-Dive, DB Architect Conversations*
