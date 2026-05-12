# SlateCamp — Five Critical Unbuilt Features
**Product Architect · March 2026 · Internal**
**Source:** Global Codebase Audit Report (2026-03-25) cross-referenced against product architecture decisions

---

## Important Clarification on Feature 3

Before reading: **Architectural Design (ALE-DSGN) exists in the platform.** It has taxonomy nodes, wiki articles, quiz questions, and a Camp Trail path. The subject is there. What does not exist is the specific exam-format tooling that prepares students for *how the ALE actually tests it* — which is a 3-hour design problem, not a multiple-choice question. The subject and the tooling are different things. This document is about the tooling.

---

## Feature 1 — Campfire Community

**Audit status:** Collaborative Features scored 0%. No community infrastructure of any kind exists in the codebase.

---

### Why this exists

The ALE reviewer does not study in isolation. They are embedded in batchmate networks, school identities, family expectations, and firm affiliations. Every one of those social structures currently works against SlateCamp — they pull the student toward photocopied notes, JPT schedules, and physical review center classrooms. Campfire makes those same social structures work for SlateCamp instead.

The secondary commercial purpose is direct: every ALE passer who shares a structured story in Campfire becomes SlateCamp's most effective marketing asset. A screenshot traveling through architecture Facebook groups and family Viber chats that reads "I went from 38% to 79% in 11 weeks — SlateCamp" converts more new users than any paid ad at equivalent cost. Campfire is simultaneously a retention mechanic and a growth engine.

---

### Sub-feature 1a — Passer Story Template

When a student passes the ALE and their `profiles.ale_result` is set to `'passed'`, Campfire invites them to share their journey using a structured template. The format is guided, not freeform:

- Starting Readiness Score (auto-populated from `readiness_score_snapshots` — not manually entered)
- Final Readiness Score (same source)
- Trail used and total duration
- Three things that helped most (multi-select from a predefined list, plus free text option)
- One thing they would do differently (open text, optional)

The structure matters. Freeform testimonials produce "SlateCamp is great!" copy that travels nowhere. Structured stories produce "I started at 48%, the Blindspot Protocol on Building Laws was the thing that finally moved it, I passed January 2026" — copy that a current reviewer at 51% with a red Building Laws heatmap immediately recognizes as their own situation.

The structured format also makes the data extractable. Anonymized aggregate answers to "what helped most" and "what would you do differently" are a product research signal that no quiz data can produce.

**Schema needed:** A `passer_stories` table. Key fields: `user_id`, `starting_readiness_score` (numeric, auto-populated), `final_readiness_score` (numeric, auto-populated), `exam_cycle` (text — e.g. "January 2026"), `trail_used` (FK to `camp_trails`), `what_helped` (JSONB array), `what_to_change` (text), `is_published` (boolean), `published_at` (timestamptz). RLS: user can read own stories plus published stories from others.

---

### Sub-feature 1b — Private Retaker Support Channel

A Campfire space accessible only to users where `profiles.reviewer_type = 'returning_reviewer'`. Not visible to first-time users. Not publicly indexed. Anonymous usernames only — no real names required.

The hiya culture makes ALE failure a subject not discussed openly. Retakers will not share in a public feed. But they will share in a private space with others who have been through the same thing. The value is informational: "I failed January 2025. My breakdown was Building Laws 41%, Professional Practice 38%. Here is what I changed for the June cycle." That is actionable intelligence no other SlateCamp feature generates.

**Critical design constraints:**
- The words "failed," "failure," and "retaker" never appear in the UI copy for this channel
- No public-facing indicator that a user is in this channel
- No comparison of individual scores within the channel
- Channel membership is assigned automatically on account creation for returning reviewers — they do not have to find or apply

**Copy reference:** The channel is named something like "Returning Reviewers" or "Second Attempt." Never "Retakers." Never "Failed Attempts."

**Schema needed:** A `community_channels` table with `channel_type` enum including `'retaker_private'`. Access controlled via join against `profiles.reviewer_type`. Users with `reviewer_type = 'returning_reviewer'` are enrolled at account creation — no opt-in required for the channel to be visible to them, though posting is opt-in.

---

### Sub-feature 1c — School Cohort Heatmaps

Filipino architecture school identity is strong. UST, PUP, Mapua, UE, FEU, UP Diliman — school affiliation is a meaningful part of a Filipino architect's professional identity. The school cohort heatmap shows **aggregate, anonymous** mastery data per school per exam cycle.

Example display: "UST June 2026 cohort: strongest in History of Architecture (avg 74%), weakest in Structural Design (avg 41%). 24 enrolled students."

The data must never expose individual student performance. Only cohort averages. The minimum cohort size gate is 5 students — cohorts smaller than 5 do not appear, preventing identification-by-elimination.

This feature serves two purposes simultaneously. For students: cohort identity and benchmarking against their school group without personal exposure. For the B2B institutional play: the Dean's Dashboard (Phase 2) is a direct extension of this data. The school cohort heatmap is the free-tier preview of what the Dean gets in the paid institutional tier.

**Schema needed:** `profiles.school_name` (text, self-reported during onboarding). The cohort heatmap is a computed view, not a stored table: it groups `user_node_mastery` by `profiles.school_name`, averages `current_mastery_weight` per subject, and applies the `HAVING COUNT(DISTINCT user_id) >= 5` gate. No new tables required — only the `profiles.school_name` column and the query.

---

### Sub-feature 1d — Study Pod Accountability Loop

Groups of 3–6 students voluntarily link accounts into a study pod. The pod view shows **shared score deltas** — not absolute scores, not individual rankings. "This person's score moved +4 points this week." No one in the pod sees another person's exact Readiness Score — only the direction and approximate magnitude of movement.

The pod milestone: when all members reach ≥70% Readiness Score simultaneously, the pod unlocks Proof Simulation one week early. This is the only gamification mechanic in Campfire, and it passes the governing test — "does this make a student more likely to pass?" — because it creates a concrete social incentive to bring weaker pod members up to threshold, which benefits everyone's preparation.

**Design constraints:**
- No absolute scores visible to other pod members — only deltas and trend direction
- No naming of who is lowest in the pod (hiya culture protection)
- Pod is opt-in only, initiated by invite link shared outside the platform
- Maximum 6 members per pod
- Pod creation available to Pro subscribers only

**Schema needed:** `study_pods` table (`pod_id`, `created_by` FK to `profiles`, `pod_name` optional text, `created_at`). `pod_members` junction table (`pod_id`, `user_id`, `joined_at`, `readiness_score_at_join` — this is the baseline for computing deltas). The delta is computed as: current score from `user_global_stats.global_readiness_score` minus `readiness_score_at_join`. The raw score is never shared between users.

---

### Sub-feature 1e — Regional Architecture Channels

Philippine architecture practice is geographically organized. Cebu, Metro Manila, Davao, Iloilo — each region has distinct LGU permit requirements, FSEC processing times, and OBO quirks. A national platform cannot generate this intelligence centrally. It requires community contribution.

Regional channels let architects share locally relevant, time-sensitive knowledge: "QC OBO now requires an additional environmental clearance form starting this quarter." "Davao FSEC turnaround is currently 3 weeks, not the usual 5." This is information a practicing RLA cannot get from any other digital source.

These channels also serve a long-term retention purpose for licensed architects post-ALE. An RLA who relies on a regional Campfire channel for permit process updates has a reason to maintain a SlateCamp subscription permanently — not for exam prep, but for professional utility. This is the transition to Professional Mode made concrete.

**Schema needed:** `community_channels` table with `channel_type = 'regional'` and a `region` field from a standardized list of Philippine regions (NCR, Region III, Region VII, Region XI, etc.). Region is self-reported from a dropdown during onboarding or profile setup.

---

### Sub-feature 1f — Topnotcher Effect Cascade

When a PRC Top 10 finisher used SlateCamp, a structured cascade activates:

1. Their passer story is pinned to the top of Campfire feed for 30 days
2. A score trajectory visualization is generated from their `readiness_score_snapshots` — a line chart from Day 1 to exam date
3. A shareable "SlateCamp ALE Topnotcher" social image is generated (Canvas API or Vercel OG): dark background, "Arch. [Name]" in Syne Bold, "January 2026 ALE Topnotcher · PRC Board Rank #[N]", SlateCamp logo
4. Their story surfaces in the Dashboard feed for all current reviewers in the same exam cycle

The ALE topnotcher carries outsized cultural weight in the Filipino architecture community. A single verified topnotcher story generates more word-of-mouth acquisition than ₱50,000 in Meta ads because it carries the highest social proof signal the ALE community recognizes.

**Schema needed:** `profiles.prc_ranking` (nullable integer, 1–10). Populated from PRC results data via user self-report, verified by admin before the cascade activates. The cascade is an application-level event: when an admin sets `prc_ranking` to a non-null value, a server action fires the cascade sequence. Not a database trigger.

---

### What Campfire is not

Campfire is not a gamification layer. There are no badges, no global leaderboards, no points for posting. The governing question — "does this make a student more likely to pass?" — rules out any feature that rewards visibility without improving readiness. Every Campfire sub-feature must pass this test independently.

---

## Feature 2 — Retaker-Specific Onboarding Flow

**Audit status:** Onboarding scored 85% complete. The 85% covers the try-before-signup funnel, the 4-step onboarding, and the score reveal. The retaker branch was not found. The current onboarding is a single path for all user types.

---

### Why this exists

The retaker segment is the most commercially valuable segment SlateCamp has. They have lived the pain of inadequate preparation. They have the highest urgency, the highest emotional motivation, and the highest willingness to pay for something that actually works — because they have already paid for something that didn't.

But the hiya culture of Filipino professional life means ALE failure is not discussed openly. Retakers carry this experience privately. An onboarding flow that treats them identically to a first-timer — using the same language, making the same assumptions, asking the same questions — fails to acknowledge what they already know. Worse, a single misplaced word ("retake," "failed," "try again") will cause an immediate emotional recoil in a segment that the entire platform depends on for word-of-mouth.

---

### The branching trigger

Step 1 of onboarding (after account creation) adds a single question:

**"Is this your first time preparing for the ALE?"**
- "Yes, first time" → existing onboarding flow, unchanged
- "I've reviewed before" → retaker branch

The phrase "I've reviewed before" is chosen deliberately. Not "I failed before." Not "I'm retaking." It acknowledges prior experience without referencing failure. This language constraint applies to every subsequent screen in the retaker branch and to any future copy written for returning reviewer contexts.

---

### The retaker branch — step by step

**Step 1 — Welcome screen**

Headline: *"Welcome back. More data, better strategy."*

No mention of the previous attempt. No condolences. No motivational platitude. A direct, factual statement: this cycle will be different because the platform will give them better information than they had before. Nothing more.

**Step 2 — Previous gaps (optional self-report)**

*"Which subjects felt hardest last time?"*

Multi-select from the 8 ALE subjects. This question is explicitly optional — a user who does not want to engage with it can skip without penalty. For users who do select subjects, the selections immediately seed `user_node_mastery` with Red state for all leaf nodes in those subjects. They do not need to complete the 35-item assessment to have a starting heatmap. Their subjective memory of what was hard becomes the first data point.

This is a soft signal — the heatmap will be overwritten by actual quiz performance within days. But it gives the returning reviewer a starting heatmap that reflects their self-knowledge rather than showing them a uniformly grey map on Day 1.

**Step 3 — Target exam date**

Identical to the existing onboarding step. No changes.

**Step 4 — Proof Simulation prompt (Day 1 unlock)**

First-time users cannot access Proof Simulation until they reach ≥70% of nodes at Amber or better. Returning reviewers bypass this gate entirely.

They are offered the Proof Simulation on Day 1 with this framing: *"You've sat the ALE before. Let's see exactly where you stand today — under exam conditions. A full simulation, your score delivered 24 hours later."*

The rationale: a returning reviewer has already experienced the ALE. They do not need a gentle orientation. They need a cold diagnostic score that tells them where they stand today compared to where they stood at their last exam. The 24-hour cold delivery applies. The pressure-performance gap analysis applies. This is more useful on Day 1 than the 35-item assessment quiz.

---

### Data implications

**`profiles.reviewer_type`** must be set to `'returning_reviewer'` on completion of the retaker branch. This single column flag propagates downstream to:

- Trail recommendation engine — front-loads subjects identified as gaps from the prior cycle
- Blindspot Protocol — prioritizes previously-red nodes if prior cycle data is available
- Slatecamp — grants access to the private retaker channel automatically, no opt-in
- Results Day flow — different messaging when a returning reviewer passes
- Marketing analytics — enables separate cohort analysis of retaker vs. first-timer conversion, retention, and pass rates

**`profiles.previous_exam_subjects_struggled`** — JSONB array of ALE subject codes self-reported in Step 2. Used to pre-seed `user_node_mastery`. Format: `["ALE-STRC", "ALE-PRAC"]`. This field is a soft signal — it is overwritten by quiz performance and does not persist as a permanent flag.

**`user_global_stats.exam_attempt_number`** — incremented to 2 (or higher) for returning reviewers. Required by the `exam_outcomes` table for post-cycle analysis: do retakers perform better the second time, and what preparation patterns correlated with improvement?

---

### Forbidden words — permanent list for retaker contexts

The following must never appear anywhere in the retaker onboarding branch, in any retaker-specific UI copy, or in any automated messaging to users with `reviewer_type = 'returning_reviewer'`:

- fail / failed / failure
- retry / retake / retaker
- try again
- what went wrong
- better luck this time
- don't give up

Any feature review or QA pass on retaker-facing copy must include a search for these strings as a gate condition before shipping.

---

## Feature 3 — Area C Preparation Tooling

**Audit status:** The 7 testing modes are 85–95% complete. Architectural Design (ALE-DSGN) is included as a subject with quiz questions, wiki content, and a Camp Trail path. The specific tooling for how the ALE actually tests Area C does not exist.

---

### The distinction that matters

Architectural Design exists as a subject in the platform. That is not what is missing.

What is missing is the set of tools that prepares students for the *format* of Area C — which is fundamentally unlike any other part of the ALE. Areas A and B are multiple-choice. Area C is a **3-hour design problem**: the student receives a building brief, designs a floor plan from scratch, computes development controls, verifies code compliance, and produces a set of drawings by hand under time pressure. MCQ questions about Architectural Design do not prepare a student for this. They need different tools entirely.

Area C is 40% of the exam. The current platform's tooling addresses 0% of this 40%.

---

### Sub-feature 3a — Development Controls Calculator

A real-time calculator for the site-level computations that appear in every ALE Area C problem brief. The student inputs lot data; the calculator outputs every required figure instantly with the governing code citation beside each result.

**Inputs:**
- Lot area (sqm)
- Lot coverage percentage (from local zoning — typically 60–70%)
- Floor Area Ratio (FAR)
- Building height limit (meters)
- Number of floors
- Occupancy type (PD 1096 occupancy classification)
- Building use (residential / commercial / institutional / industrial / mixed-use)
- Accessible spaces required (yes/no — triggers BP 344 outputs)
- Parking required (yes/no — triggers PD 1096 parking outputs)

**Outputs (with governing code citation for each):**
- **AMBF** — Allowable Maximum Building Footprint = Lot Area × Lot Coverage % — PD 1096
- **PSO** — Percentage Site Occupancy = AMBF ÷ Lot Area × 100 — PD 1096
- **TGFA** — Total Gross Floor Area = AMBF × FAR — PD 1096
- **Occupant Load** — PD 1096 occupancy load factor table (sqm per person by use type)
- **Required Parking Slots** — PD 1096 parking requirements table
- **Required Accessible Parking Slots** — BP 344: 1 per 50 standard slots, minimum 1
- **Maximum Travel Distance** — RA 9514 by occupancy (sprinklered vs. unsprinklered)
- **Required Exit Width** — RA 9514: occupant load × 6.1mm per person minimum
- **Setbacks** — PD 1096 by zone classification (front/rear/side)

Non-compliant values turn Signal Red with the specific provision that governs them. A student who sets FAR too high and sees TGFA turn red with "Exceeds PD 1096 §708: Maximum FAR for this zone is 4.0" learns FAR viscerally, not from reading a definition.

**Why this matters for exam performance:** The first 10 minutes of every successful Area C solution is running these calculations before touching a pencil. Students who skip this step produce non-compliant designs and lose significant marks. Students who have never practiced this calculation sequence under time pressure run over the time limit.

**Schema implications:** None. This is a stateless computational tool. No user data is persisted. The calculator runs on the frontend using reference tables from PD 1096, BP 344, and RA 9514 maintained in a structured data file. The reference tables must be versioned — when BP 344 2024 IRR was released, certain accessible parking dimensions changed.

---

### Sub-feature 3b — Design Problem Library

A library of timed design problem prompts, organized by building type and complexity. Each problem contains a complete brief as a student would receive in the actual ALE: client requirements, program of spaces with minimum areas, site description, lot dimensions, orientation, access points, and adjacent context.

**How it works:**

1. Student selects a problem from the library
2. Taps "Begin" — the timer starts counting up (not down — counting down creates anxiety; counting up shows progress)
3. Works on the design independently, on paper (SlateCamp does not attempt to replace pencil-and-paper)
4. At the 90-minute mark, the BP 344 Compliance Checklist is automatically surfaced — not at the start, not at the end, but at the point where corrections are still possible
5. On completion, the student submits a self-assessment score (1–5 scale: "How complete was your solution?") and reviews the model development controls for the brief

**The BP 344 Compliance Checklist — surfaces automatically at 90 minutes:**
- [ ] Accessible path from parking to main entrance — continuous and unobstructed
- [ ] Ramp at all level changes — slope ≤ 1:12, maximum 9 meters per run, landing at top and bottom
- [ ] Accessible toilet — minimum 1.7m × 1.8m clear floor area
- [ ] Grab bars — positioned per BP 344 2024 Revised IRR
- [ ] Accessible parking — positioned closest to the accessible entrance
- [ ] Accessible parking count — 1 per 50 standard slots, minimum 1
- [ ] Elevator — provided if building is multi-floor and occupancy triggers requirement
- [ ] Accessible signage — Braille and raised characters at 1.52–1.65m AFF
- [ ] No pinch points — minimum 1.2m clear width maintained on all accessible paths

**Problem library — ordered by complexity:**

| Level | Building Type | Time Limit | Notes |
|---|---|---|---|
| 1 | Single-family residence on 300sqm lot | 60 min | Entry-level. Establishes calculation habits. |
| 2 | 3-storey commercial building, mixed retail + office | 120 min | Introduces parking computation and occupancy load. |
| 3 | Elementary school — 6 classrooms, admin, multi-purpose hall | 150 min | Institutional occupancy. BP 344 checklist critical. |
| 4 | 5-storey office building on urban corner lot with parking podium | 180 min | Full ALE difficulty. Setbacks + access + loading bay. |
| 5 | Mixed-use residential and commercial development | 180 min | Closest to actual ALE problem format. |

Levels 1–2: available on Free tier. Levels 3–5: Pro only. Gating between levels: Level 3 unlocks after completing Levels 1 and 2 and achieving a self-assessment score of ≥3 on both.

**Schema implications:**

New table `design_problems`: `problem_id`, `title`, `building_type` (text), `difficulty` (integer 1–4), `time_limit_minutes`, `brief` (text), `program` (JSONB — required spaces and minimum areas), `site_data` (JSONB — lot dimensions and zoning), `code_references` (text array), `created_at`.

New table `design_problem_sessions`: `session_id`, `user_id` (FK to profiles), `problem_id` (FK to design_problems), `started_at`, `completed_at`, `time_elapsed_seconds`, `self_assessment_score` (integer 1–5), `checklist_completion` (JSONB — which checklist items were marked), `notes` (text, optional).

---

### Sub-feature 3c — Area C Endurance Connection

The existing Extended Practice mode must be reframed as Area C preparation. This is primarily a copy and framing change, with one substantive addition.

The ALE's Day 2 is 3+ hours under exam conditions. Most first-time failures on Area C are caused by cognitive fatigue, not lack of knowledge. The student knows the codes. They run out of reliable performance window at 90 minutes.

**Changes required:**
- Rename "Extended Practice" → "Area C Endurance Training" in all user-facing copy
- Target endurance window: 180 minutes (the ALE Day 2 requirement)
- Dashboard copy: *"Day 2 of the ALE requires sustained focus for 3+ hours. Your current Area C Window: [X] minutes. Today's session extends it to [X + 10%] minutes."*
- Progress shown as percentage of 180-minute goal: *"You're at 64% of your Area C endurance target."*
- Tooltip on the (?) icon: *"The ALE's Architectural Design component lasts 3+ hours. Most first-time failures on Area C happen because students run out of time, not knowledge. This mechanic builds the cognitive stamina that Day 2 demands."*

---

## Feature 4 — Personal Cram Card Generator

**Audit status:** Not mentioned in the audit. The source data exists in `user_interactions` and is not being used for this purpose.

---

### What it is

An auto-generated, printable one-page document listing the top 15–25 numerical values the student most consistently gets wrong — specifically scoped to high-frequency code provisions and formulas. Updated weekly. Downloadable as a print-ready PDF. Shareable as a link.

---

### Why it matters

Every serious ALE reviewer manually compiles a personal "cram card" — a handwritten list of the critical numbers they keep getting wrong. BP 344 clearances. Fire code travel distances. PD 1096 stairway dimensions. SPP fee percentages. CPD units. DFU values. This is documented real reviewer behavior, across multiple cycles and multiple cohorts. It is arguably the most universal ALE study behavior that exists.

SlateCamp has the exact data needed to generate this list automatically. It is sitting in `user_interactions`. It is not being used for this purpose.

The cram card is also the feature most likely to be shared organically. A reviewer who receives their personalized "these are the 20 numbers you specifically keep missing" card and shares it to their Viber study group is marketing SlateCamp to that entire group. This is word-of-mouth acquisition embedded directly in a learning feature.

---

### The generation algorithm

**Signal 1 — Accuracy:** `user_interactions` rows where `is_correct = false`, filtered to questions where `application_context IN ('recall', 'calculation')`. Only numerical recall and calculation questions qualify. Scenario and interpretation questions are excluded — errors on those are not about memorizing a number.

**Signal 2 — Exam relevance:** Cross-referenced against `taxonomy_tree.exam_frequency`. Only `'high'` and `'medium'` frequency nodes qualify. A consistently-missed low-frequency node does not appear on the cram card.

**Signal 3 — Minimum sample gate:** A node must have at least 3 recorded attempts before it qualifies. One missed question is a first encounter, not a pattern.

**Ordering:** Results are ordered by `(1 - accuracy_rate) × frequency_weight` where frequency_weight is 3.0 for high, 1.5 for medium. Top 20 entries become the card.

---

### The card format

Each entry has three components:

- **The value** — the specific number the student keeps missing. Example: "180mm minimum, 200mm maximum"
- **The provision** — the exact code reference. Example: "PD 1096, Rule VII, Section 1202 — Stair Riser Heights"
- **The hook** — one sentence from the `wiki_items` entry of type `'exam_tip'` for that node, if it exists. Example: "The ALE often tests this as 'which of these stairways is non-compliant' — any riser outside 180–200mm fails."

**Print format:** A4 portrait, two columns, 10 entries per column. No color — printable in black-and-white. Header: "Your Personal Cram Card · [Week of generation]." Footer: "SlateCamp — Know you'll win."

The generation date on the card matters. A card from 4 weeks ago reflects a different gap profile than today's. The date signals to the student that the platform is tracking their current state, not a historical snapshot.

---

### Access gate and update frequency

- First available after ≥20 completed quiz sessions
- Before the threshold, the dashboard entry point shows: "Complete 20 study sessions to unlock your personalized Cram Card"
- After the threshold: regenerates once per week on the student's "anniversary day" (same day of week as their first session)
- The weekly regeneration is a passive retention mechanic — a new artifact on a predictable schedule

---

### Schema implications

No new tables required. The card is generated from existing tables:
- `user_interactions` — wrong answers (`is_correct = false`)
- `questions` — to filter by `application_context`
- `taxonomy_tree` — to get `exam_frequency` and `wiki_items` for the hook text
- `user_node_mastery` — to confirm ≥3 attempt minimum per node

Two new columns on `user_global_stats`:
- `cram_card_last_generated TIMESTAMPTZ` — tracks when the card was last computed
- `cram_card_data JSONB` — cached card content, recomputed weekly

PDF generation happens client-side using `@react-pdf/renderer`. The server provides the data payload; the browser assembles and downloads the PDF. No server-side PDF infrastructure needed.

---

## Feature 5 — Subject Floor Alert

**Audit status:** `sub_scores` in `readiness_score_snapshots` is always written as `'{}'::jsonb`. The data pipeline has been broken since the platform launched. The UI alert does not exist. Both the pipeline fix and the UI feature must be built together.

---

### What it is

A non-dismissible dashboard alert that fires when any ALE subject sub-score is at or approaching the ALE's mandatory minimum of 50% per subject. The ALE passing requirement is a general weighted average of 70%, **with no individual subject falling below 50%**. This floor requirement is what produces the most common surprise failure pattern: a student at 74% overall who fails because one subject is at 47%.

---

### Why this is urgent

The audit confirms that `readiness_score_snapshots.sub_scores` has been written as empty `{}` since the platform launched. This is not a UX gap — it is a broken data pipeline. Every readiness score snapshot in the database has empty sub-scores. The per-subject breakdown has never functioned for a single user.

This must be fixed before the Subject Floor Alert can exist, but the fix also unblocks several other features simultaneously:
- Analytics Dashboard per-subject breakdown chart
- Camp Trail front-loading logic for retakers (which subject to prioritize in Week 1)
- Trail recommendation rationale ("Week 1 focuses on Building Laws — your biggest gap")
- The Readiness Score card's per-subject breakdown view

The sub-scores pipeline is load-bearing for at least four features. It is the most impactful single fix in the platform's data layer.

---

### The two-part fix

**Part 1 — Data pipeline (DB architect work):**

The `snapshot_readiness_on_session_complete` trigger currently reads `user_global_stats.global_readiness_score` and writes it alongside hardcoded `'{}'::jsonb` for sub_scores. The trigger must be extended.

Sub-score computation for each of the 8 ALE subjects (ALE-HIST, ALE-THEO, ALE-PLAN, ALE-PRAC, ALE-STRC, ALE-MATL, ALE-UTIL, ALE-DSGN):
1. Find all leaf nodes in `taxonomy_tree` where `subject_area = [subject]` AND `is_cross_ref_only = false` AND `deprecated_at IS NULL`
2. For each node: get `current_mastery_weight` from `user_node_mastery`. If no row exists, use 0.0 — grey nodes count as zero, they are not excluded from the average
3. Average the mastery weights for that subject
4. Write to sub_scores JSONB: `{ "ALE-HIST": 0.72, "ALE-THEO": 0.65, "ALE-STRC": 0.49, ... }`

Historical snapshots cannot be retroactively populated without re-running the computation against historical `user_node_mastery` state from `user_mastery_history`. The DB architect should advise on whether retroactive population is feasible or whether only new snapshots will contain real data going forward.

**Part 2 — UI feature (application work):**

A dashboard alert component that reads the most recent `readiness_score_snapshots.sub_scores` for the current user and fires when any subject value is below `disciplines.subject_floor_pct` (currently 50).

---

### The alert — behavior specification

**Position:** Above the Readiness Score card. Above the heatmap. The first visible element when the student opens the Dashboard. If the student has a subject below 50%, this alert is the first thing they see — not the score, not the heatmap.

**Visual treatment:**
- Background: Signal Red (#E63329)
- Text: White
- Icon: ⚠️
- No dismiss button — this alert cannot be closed
- No X icon — removing this alert from view is not an available action

**Copy template (per flagged subject):**
> ⚠️ **[Subject Name] is at [X%]**
> The ALE requires at least 50% in every subject to pass — regardless of your overall score. This subject will determine your result.
> **Study [Subject Name] Now →**

The CTA routes to a Subject Mode session filtered to the flagged subject, or to the filtered Camp Trail library showing subject mastery paths for that subject.

**Multiple subjects below floor:** Each subject gets its own alert row. They stack vertically. All are non-dismissible. The student sees one alert per subject that is below 50%.

**Why non-dismissible:** A dismissible alert is seen once and closed forever. This alert exists to change behavior, not to inform. The student must bring the sub-score above 50% to make the alert disappear. That is the only resolution path. The counterargument — "it's annoying" — is the product intent. A 47% subject score is an emergency and the interface must reflect that.

---

### Readiness Score card update

The main Readiness Score card must be updated simultaneously with the alert to show per-subject sub-scores. Currently it shows only the overall score. With populated sub-scores, it shows a per-subject breakdown — a small table or bar chart below the main number:

| Subject | Score | State |
|---|---|---|
| History of Architecture | 72% | Green |
| Theory of Architecture | 65% | Amber |
| Structural Design | **49%** | **Red** |
| ... | | |

The subject at 49% is highlighted in Signal Red in this table. The alert banner at the top and the red row in the score card together create two reinforcing signals — neither alone is sufficient, both together create the behavioral change the feature requires.

---

### Floor threshold source

The 50% threshold is read from `disciplines.subject_floor_pct`, not hardcoded in the UI. If PRC ever changes the subject minimum requirement, the alert threshold updates automatically without a code deployment.

---

### Schema implications

The `readiness_score_snapshots.sub_scores` column already exists. No new columns or tables are required anywhere in the schema. The only change is the trigger function behavior — specifically, replacing the hardcoded `'{}'::jsonb` with a computed JSONB object.

For the UI: the alert reads the most recent `readiness_score_snapshots` row for the current user, parses `sub_scores`, and compares each value against `disciplines.subject_floor_pct`. This is a read-only query. No new writes.

For the analytics dashboard and the Readiness Score card: same `sub_scores` JSONB is the data source. Once the pipeline is fixed, these features gain real data without any additional implementation work beyond UI rendering.

---

*SlateCamp — Five Critical Unbuilt Features · March 2026 · Internal · Product Architect*
*Based on: Global Codebase Audit (2026-03-25) · Product Architecture v2.1 · Session decisions*

