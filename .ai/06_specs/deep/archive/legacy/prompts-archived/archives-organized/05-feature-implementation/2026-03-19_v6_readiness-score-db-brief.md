# SlateCamp — Readiness Score Anti-Inflation System
## Brief for the Database Architect

**Prepared by:** Product Architect  
**Date:** March 2026  
**Classification:** Internal · Architecture Decision  

---

## Why This Document Exists

The Readiness Score is SlateCamp's core product promise. The tagline is *"Know you'll win."* That promise is only honest if the score is genuinely hard to inflate. If a student can reach 85% by grinding easy questions, the score is lying — and a lying score is worse than no score at all, because it sends students into the exam room falsely confident.

This document explains what the score needs to protect against, why each protection matters, and exactly what needs to be built in the database to support it. It is not a SQL file. It is a decision brief that explains the *why* behind every *what.*

---

## What We Currently Have (Honest Audit)

The raw ingredients are all there in the existing schema:

| Column | Table | Status |
|---|---|---|
| `difficulty` (0–1 numeric per question) | `questions` | ✅ Exists |
| `discrimination_rating` | `questions` | ✅ Exists |
| `time_spent_ms` | `user_interactions` | ✅ Exists |
| `is_correct` | `user_interactions` | ✅ Exists |
| `is_suspected_lucky_guess` | `user_interactions` | ✅ Exists + trigger fires |
| `current_mastery_weight` | `user_node_mastery` | ✅ Exists |
| `avg_time_ms` | `user_node_mastery` | ✅ Exists |
| `last_encountered` | `user_node_mastery` | ✅ Exists |
| `sub_scores JSONB` | `readiness_score_snapshots` | ✅ Column exists |

The problem: **none of the anti-inflation computation logic is implemented.** The database stores the data but nothing acts on it. Specifically:

- `is_suspected_lucky_guess` is flagged correctly by the existing trigger — but the flag changes nothing about the score. It is set and then ignored.
- `sub_scores` in `readiness_score_snapshots` is always written as `'{}'::jsonb` — an empty object, hardcoded in the trigger. It has never contained real data.
- There is no concept of consecutive correct streaks. Grinding the same question 50 times counts fully every time.
- There is no difficulty ceiling. A student who only answers easy questions can score anything.
- Grey (unvisited) nodes are silently excluded from the calculation rather than penalising the score. A student can master 30 of 172 nodes and never touch the rest, and the other 142 nodes do not drag the score down.
- There is no recency decay. Performance from 10 weeks ago counts identically to yesterday's session.

---

## The Six Inflation Risks

### Risk 1 — Grinding Easy Questions

**What happens without a fix:** A student answers the same 20 Level-1 History questions 200 times and gets 90% right. Their mastery weight rises toward the maximum. Their overall score reads high. But they have never touched a Level-3 question in their life. The ALE will destroy them.

**Why it matters right now:** The question bank currently has 34 questions. A student can memorise all 34 in two sessions. After that, every subsequent answer is from memory, not from genuine mastery. This is the single most immediate inflation risk on the platform.

**The protection needed — Diminishing returns on repeated correct answers.** The contribution of a correct answer to the mastery weight must decrease each time the same student gets the same node right consecutively without an incorrect answer in between. The first correct answer counts fully. The third in a row counts approximately 40% as much. The fifth counts approximately 20%. The score still rises — but slowly, and it cannot be driven to the ceiling through repetition.

To implement this, the database must track how many times in a row a student has answered questions on a given node correctly. **This is not currently stored anywhere.**

---

### Risk 2 — Only Answering Easy Questions

**What happens without a fix:** A student avoids all Level-3 and Level-4 difficulty questions. They achieve 88% accuracy on easy content. Their score reads 75%. But the ALE's hardest items — the questions that distinguish passers from retakers — are Level 3 and 4. This student will fail those items.

**Why it matters for the product promise:** If a score of 80% means "I have mastered easy content very well," the score is not an honest readiness signal. An 80% score must mean "I have demonstrated competency at the difficulty level the ALE actually tests."

**The protection needed — Hard score band ceilings tied to difficulty coverage.** The score must be architecturally incapable of exceeding certain thresholds until the student has demonstrated performance at the required difficulty level. These are hard ceilings enforced in the computation, not soft guidelines.

The target bands:

| Score ceiling | Requirement to reach it |
|---|---|
| 70% | ≥55% accuracy on Level 2+ difficulty questions |
| 82% | ≥50% accuracy on Level 3 difficulty questions |
| 92% | ≥50% accuracy on Level 4 difficulty questions |

To implement these ceilings efficiently, the database must know the highest difficulty level at which the student has demonstrated genuine competency, at both the per-node level and the per-subject level. **This is not currently stored anywhere.**

---

### Risk 3 — Only Studying a Narrow Slice of the Syllabus

**What happens without a fix:** A student masters 30 of the 172 leaf nodes deeply. Everything else is grey — never visited. The mastery engine currently averages across only the nodes the student has touched. The other 142 nodes contribute nothing — not even a zero — to the score. So a student who has deeply mastered 17% of the syllabus can produce a misleadingly high score.

**Why it matters for the ALE specifically:** The ALE covers all 8 subjects across 3 PRC exam areas. A student cannot skip Building Utilities and pass. A student cannot skip Structural and pass. The score must reflect both depth and coverage.

**The protection needed — Unvisited nodes must count against the score.** Grey nodes are not neutral. Each unvisited node represents a gap that the ALE will expose. The calculation must use the full 172 nodes as its denominator, not just the nodes that have been touched. An unvisited node contributes zero mastery — and that zero is weighted into the final score.

This protection does not require any new schema columns. It requires the computation logic to use the total node count rather than only averaging across visited nodes. The architect should note this so the application developer is briefed.

---

### Risk 4 — Only Practicing Recall-Level Questions

**What happens without a fix:** A student can recall every code provision perfectly. "The maximum riser height is 200mm." But the ALE's hardest questions ask them to *evaluate a scenario* — "This stairway has a 220mm riser. Which of the following is the consequence under PD 1096?" Recall and application are different cognitive skills. A student who has only practiced recall will fail the ALE's analytical questions.

**The evidence:** ALE topnotcher research is explicit: *"The trend of questions is more analytical and technical — you have to answer it as an architect and think like one."* A score built on recall accuracy alone is measuring the wrong cognitive skill for the exam's most discriminating items.

**The protection needed — Cognitive level ceilings mirroring the difficulty ceilings.** The taxonomy already classifies every node by Bloom's level: *remember*, *understand*, *apply*, or *analyze*. This metadata should gate the score the same way difficulty does:

| Score ceiling | Requirement to reach it |
|---|---|
| 60% | Demonstrated competency at *understand* level |
| 75% | Demonstrated competency at *apply* level |
| 87% | Demonstrated competency at *analyze* level |

To implement this, the database must track whether the student has ever correctly answered a question at each Bloom's level. **This is not currently stored anywhere at the node or global level.**

---

### Risk 5 — Lucky Guessing

**What happens without a fix:** MCQ gives students a 25% chance of guessing correctly with no knowledge. If a student guesses correctly three times in a row on a node, the mastery weight rises as if they knew the material. The flag `is_suspected_lucky_guess` is already set correctly by the existing trigger — but it does absolutely nothing to the score. The flag exists, fires, and is then ignored.

**The protection needed — Lucky guess flag must reduce contribution weight.** When `is_suspected_lucky_guess = true`, that correct answer's contribution to the mastery EMA should be multiplied by approximately 0.3 rather than 1.0. The flag is already being set by the database. The application code just needs to read it and use it. No new schema is required — this is a trigger correctness confirmation plus an application code fix.

---

### Risk 6 — Stale Mastery From Old Sessions

**What happens without a fix:** A student studied intensively 8 weeks ago and reached 80% mastery on Structural Design nodes. They went dormant for 6 weeks. They return and are now performing at 45% — they have forgotten material. But `current_mastery_weight` still reflects the historical peak. The score says they are ready. They are not.

**The protection needed — Recency decay on mastery weights.** `last_encountered` is already stored on `user_node_mastery`. The computation should apply a decay factor when that date is old:

| Time since last practice | Weight applied |
|---|---|
| 0–2 weeks | 100% (no decay) |
| 2–4 weeks | ~90% |
| 4–8 weeks | ~70% |
| 8+ weeks | ~50% |

This is handled entirely in application code using the existing `last_encountered` column. **No schema change is needed for this protection.** The architect only needs to confirm that `last_encountered` is reliably updated on every `user_node_mastery` write, which it currently appears to be.

---

## What the Database Architect Needs to Build

### Addition 1 — Consecutive Correct Streak on `user_node_mastery`

**New column:** `consecutive_correct_streak` — integer, default 0.

**What it stores:** How many times in a row a student has answered any question on this node correctly without an incorrect answer in between. Resets to zero when the student answers incorrectly on this node. Increments by 1 on each correct answer.

**Why it must be stored here rather than computed:** Computing this from `user_interactions` history requires reading potentially thousands of rows per node per student on every session completion. Storing it as a running counter on `user_node_mastery` makes the diminishing returns computation instantaneous.

**How it gets updated:** Extend the existing trigger on `user_interactions` after insert. If `is_correct = true`, increment `consecutive_correct_streak` on the matching `user_node_mastery` row. If `is_correct = false`, reset it to 0.

**What the application code uses it for:** The diminishing returns formula. The higher the streak, the less weight each subsequent correct answer carries in the mastery EMA update.

---

### Addition 2 — Highest Difficulty Correct on `user_node_mastery`

**New column:** `highest_difficulty_correct` — numeric 0–1, default 0.0.

**What it stores:** The highest `difficulty` value (from `questions.difficulty`, which runs 0–1) of any question this student has ever answered correctly on this node. Updated upward only — never decreases. If a student answers a question with difficulty 0.8 correctly, this column becomes 0.8 and stays at 0.8 even if they later answer an easier question wrong.

**Why it must be stored here:** The score ceiling system needs to check "has this student ever correctly answered a hard question on this node?" Aggregating this from `user_interactions` on every score computation is expensive. A single column per node per student makes the ceiling check a trivial lookup.

**How it gets updated:** Same trigger as above. On a correct insert, if `question.difficulty > current highest_difficulty_correct`, update the column.

---

### Addition 3 — Bloom's Level Competency Flags on `user_node_mastery`

**New columns (three):**
- `has_demonstrated_understand` — boolean, default false
- `has_demonstrated_apply` — boolean, default false
- `has_demonstrated_analyze` — boolean, default false

**What they store:** Whether the student has ever correctly answered a question at each cognitive level on this node. These are one-way flags — once set to true, they stay true permanently. Demonstrating a cognitive skill once is meaningful evidence even if performance later declines on easier questions.

**How they get updated:** On a correct insert, the trigger looks up the `bloom_level` of the question's node from `taxonomy_tree` (via `questions.topic_id → taxonomy_tree.bloom_level`). If bloom_level is *understand*, *apply*, or *analyze*, set the corresponding flag to true.

**Important note on where bloom_level lives:** `bloom_level` is on `taxonomy_tree`, not on `questions`. A question inherits the cognitive level of the node it belongs to. The trigger needs to follow `questions.topic_id → taxonomy_tree.bloom_level` to get this value.

---

### Addition 4 — Distinct Questions Answered on `user_node_mastery`

**New column:** `distinct_questions_answered` — integer, default 0.

**What it stores:** The count of unique question IDs the student has answered on this node — not total attempts, but unique questions encountered. A student who answers the same 3 questions 50 times has `distinct_questions_answered = 3`, not 150.

**Why it matters:** The question bank is small right now (34 questions total). Some nodes may have only 1 or 2 questions available. It is not possible to fully assess mastery from a single question. This column allows the computation to cap a node's contribution to the score when the available question coverage is thin — because there simply is not enough evidence to trust the mastery weight.

**How it gets updated:** On insert into `user_interactions`, check whether this `(user_id, topic_id, question_id)` combination has been seen before. If not seen, increment `distinct_questions_answered`. If previously seen, do not increment.

The architect should choose the most performant implementation — either a lookup on `user_interactions` for prior exposure, or a separate lightweight junction table tracking `(user_id, topic_id, question_id)` as seen combinations. The junction table approach avoids a potentially expensive scan on `user_interactions` as it grows.

---

### Addition 5 — Subject-Level Summary for Ceiling Checks

**The problem:** The score ceiling system needs to answer subject-level questions efficiently — for example: "Has this student answered any Level-3 question correctly across all of ALE-STRC?" This requires aggregating `highest_difficulty_correct` values across all nodes belonging to a subject.

Doing this aggregation on every score computation by scanning all `user_node_mastery` rows and joining to `taxonomy_tree` is expensive at scale. A pre-computed subject-level summary is needed.

**Two options — the architect should choose based on what is more maintainable:**

**Option A — New columns on `user_global_stats`:** Add one column per subject for `max_difficulty_correct` and one for `has_bloom_analyze`, e.g., `max_difficulty_correct_ale_strc`, `has_bloom_analyze_ale_strc`, etc. Updated by a trigger on `user_node_mastery` whenever the per-node values change. Simple to implement but adds many columns as the platform expands to new professions.

**Option B — New table `user_subject_summary`:** One row per (user, subject). Columns: `user_id`, `subject_ale_id`, `max_difficulty_correct`, `has_bloom_apply`, `has_bloom_analyze`, `last_updated`. Updated by a trigger on `user_node_mastery` when node-level flags change. Slightly more complex to set up but scales cleanly as new professions and subjects are added. This is the recommended approach.

---

### Addition 6 — Fix Sub-Scores in the Readiness Snapshot Trigger

**Current state:** `readiness_score_snapshots.sub_scores` exists as a JSONB column but is always written as `'{}'::jsonb` — an empty object. This is hardcoded in the `snapshot_readiness_on_session_complete` trigger function. The column has never contained real data since the platform launched.

**What it must contain:** Per-subject accuracy scores at the moment of each snapshot. The format should be a JSON object keyed by subject `ale_id`:

```
{
  "ALE-HIST": 0.72,
  "ALE-THEO": 0.65,
  "ALE-PLAN": 0.58,
  "ALE-PRAC": 0.81,
  "ALE-STRC": 0.49,
  "ALE-MATL": 0.74,
  "ALE-UTIL": 0.67,
  "ALE-DSGN": 0.71
}
```

**Why this matters:** Two features depend entirely on real sub-score data:

1. The Subject Floor Alert — a dashboard warning that fires when any subject sub-score drops below the ALE's 50% per-subject minimum. This is the most common surprise ALE failure pattern (a student can be at 74% overall but fail because one subject is at 47%). Neither the warning nor the feature can exist without per-subject scores.

2. The Analytics Dashboard per-subject breakdown. Students need to see which subjects are their strongest and weakest, not just an aggregate score.

**How to fix:** The trigger function `snapshot_readiness_on_session_complete` currently hardcodes `'{}'::jsonb`. It must instead compute the per-subject scores by aggregating `user_node_mastery.current_mastery_weight` grouped by subject — achieved by joining `user_node_mastery` to `taxonomy_tree` on `topic_id`, grouping by `taxonomy_tree.subject_area` (or `ale_id` at level 1), computing the average mastery weight per subject, and writing the result as a JSONB object into the `sub_scores` column.

---

## Summary — Everything in One Place

| # | What to build | Where | Type | Protects against |
|---|---|---|---|---|
| 1 | `consecutive_correct_streak` column + trigger | `user_node_mastery` | New column | Grinding easy questions |
| 2 | `highest_difficulty_correct` column + trigger | `user_node_mastery` | New column | Avoiding hard questions |
| 3 | `has_demonstrated_understand/apply/analyze` + trigger | `user_node_mastery` | 3 new columns | Recall-only practice |
| 4 | `distinct_questions_answered` column + trigger | `user_node_mastery` | New column | Thin question bank gaming |
| 5 | Subject-level summary (table or columns) | New table or `user_global_stats` | New schema | Ceiling checks at subject level |
| 6 | Fix `sub_scores` in snapshot trigger | `snapshot_readiness_on_session_complete` | Trigger fix | Subject floor goes undetected |

**Not in scope for the database — handled in application code:**

| Protection | Uses | Where |
|---|---|---|
| Recency decay | Existing `last_encountered` column | `lib/readiness-score.ts` |
| Lucky guess weighting | Existing `is_suspected_lucky_guess` flag | `lib/readiness-score.ts` |
| Grey node penalty | Full node count from `taxonomy_tree` as denominator | `lib/readiness-score.ts` |
| PRC area weighting | Existing `prc_area` + `area_weight_pct` on `taxonomy_tree` | `lib/readiness-score.ts` |
| Score band ceilings | New columns built in this brief | `lib/readiness-score.ts` |

---

## The Target Score Range

With all protections in place, here is what a realistic score ceiling looks like for different student behaviours. If a student can exceed these bands through the behaviour in the left column, a protection has failed and needs to be debugged.

| Student behaviour | Expected maximum score |
|---|---|
| Only answers easy questions, never sees Level 2+ | ≤ 55% |
| Covers all nodes but only practices recall level | ≤ 62% |
| Good coverage, demonstrates understand + apply | ≤ 78% |
| Deep Level 3 coverage, most nodes amber or green | ≤ 86% |
| Consistent Level 4 performance, analyze demonstrated | Up to 93% |

A student who genuinely passes the ALE should score in the **70–85% range** on SlateCamp. Scores above 90% should require demonstrably advanced, broad performance across the full syllabus. This range is calibrated deliberately — the score should feel hard to earn, because the ALE is hard to pass.

---

## One Final Note

All additions in this brief are **fully additive**. Nothing breaks existing data or existing schema. All new columns have safe defaults. The trigger changes extend existing logic, they do not replace it. Existing `current_mastery_weight` values, interaction records, and readiness score snapshots are fully preserved.

The only visible change to existing data is `sub_scores` in `readiness_score_snapshots`, which will begin containing real data instead of empty objects. Any frontend code currently handling `sub_scores` as always-empty should be reviewed by the application developer before this ships.

---

*SlateCamp · Readiness Score Anti-Inflation System Brief · March 2026*  
*Prepared by: Product Architect · For: Database Architect*
