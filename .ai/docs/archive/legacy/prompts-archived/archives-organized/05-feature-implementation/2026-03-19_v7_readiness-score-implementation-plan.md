# SlateCamp — Readiness Score: Anti-Inflation Implementation Plan
**For:** Claude Code  
**Date:** 2026-03-19  
**Stack:** Next.js 15 App Router · Supabase · TypeScript  
**Files scope:** 1 migration · 3 modified files · 1 new file

---

## ROLE

You are implementing the SlateCamp Readiness Score anti-inflation system. The score currently calculates as a flat accuracy rate with no weighting, no ceilings, and no coverage requirements. This makes it trivially inflatable and dishonest. You will replace it with a system where a score of 80%+ is genuinely hard to reach — because the ALE is genuinely hard to pass.

**The governing principle:** A student who can score 80%+ under these constraints is probably actually ready. The score should feel hard to reach.

**Forbidden:** Never round up, inflate, or smooth the score. If a student's data yields 67.3%, show 67.3%.

---

## PRE-FLIGHT: Read the codebase before touching anything

```bash
# 1. Find the current mastery update logic
find src -name "mastery.ts" -o -name "readiness*.ts" -o -name "readiness-score.ts" | sort
grep -rn "current_mastery_weight\|global_readiness_score\|EMA\|ema" src/ --include="*.ts" | head -20

# 2. Find where mastery is written after a quiz answer
grep -rn "user_node_mastery\|updateMastery\|mastery.*update" src/ --include="*.ts" | head -20

# 3. Find the quiz answer submission Server Action
grep -rn "submitAnswer\|answer.*submit\|is_correct.*insert\|user_interactions.*insert" src/ --include="*.ts" | head -15

# 4. Find where global_readiness_score is written
grep -rn "global_readiness_score" src/ --include="*.ts" | head -15

# 5. Confirm is_suspected_lucky_guess is never read in app code (audit brief says it isn't)
grep -rn "is_suspected_lucky_guess" src/ --include="*.ts" | head -10

# 6. Find where readiness_score_snapshots is written from app code (separate from trigger)
grep -rn "readiness_score_snapshots\|snapshot" src/ --include="*.ts" | head -15
```

**Stop. Output the codebase map. Confirm the map before writing any code.**

---

## STEP 1 — Migration 038: Schema additions

Run in Supabase SQL editor. All changes are additive — zero existing data is affected.

```sql
-- ============================================================
-- Migration 038: Readiness Score Anti-Inflation Schema
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. user_node_mastery: new columns for all 6 inflation vectors
-- ─────────────────────────────────────────────────────────────

ALTER TABLE public.user_node_mastery
  -- Vector 1: diminishing returns on repeated grinding
  -- Increments on every consecutive correct answer. Resets to 0 on wrong.
  -- Used in EMA weight: contribution = 1 / (streak ^ 0.7)
  ADD COLUMN IF NOT EXISTS consecutive_correct_streak INTEGER NOT NULL DEFAULT 0,

  -- Vector 2: difficulty ceiling enforcement
  -- Stores the highest taxonomy_tree.difficulty (1-4 integer) that this user
  -- has answered correctly for questions on this node.
  -- Score cannot exceed 70% until highest_difficulty_correct >= 3 across all nodes.
  ADD COLUMN IF NOT EXISTS highest_difficulty_correct SMALLINT NOT NULL DEFAULT 0,

  -- Vector 4: Bloom's cognitive level ceiling
  -- Set to true the first time user correctly answers an 'apply'-level question on this node.
  ADD COLUMN IF NOT EXISTS has_bloom_apply_correct BOOLEAN NOT NULL DEFAULT false,
  -- Set to true the first time user correctly answers an 'analyze'-level question on this node.
  ADD COLUMN IF NOT EXISTS has_bloom_analyze_correct BOOLEAN NOT NULL DEFAULT false,

  -- Vector 5: question bank depth enforcement
  -- Count of DISTINCT question_ids answered for this node (not total attempts).
  -- A node with < 5 distinct questions contributes at only 40% weight to the score.
  -- Prevents early question bank memorization from inflating the score.
  ADD COLUMN IF NOT EXISTS distinct_questions_seen INTEGER NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.user_node_mastery.consecutive_correct_streak IS
  'Consecutive correct answers on this node without interruption.
   Resets to 0 on wrong answer. Used to apply diminishing returns:
   contribution_weight = 1 / (streak ^ 0.7). Prevents grinding easy questions.';

COMMENT ON COLUMN public.user_node_mastery.highest_difficulty_correct IS
  'Highest taxonomy_tree.difficulty (1-4) this user has correctly answered on this node.
   Score ceiling of 70% applies if no Level 3+ questions have been answered correctly
   across all nodes. Updated only on correct answers.';

COMMENT ON COLUMN public.user_node_mastery.distinct_questions_seen IS
  'Count of unique question_ids answered (any result) for this node.
   < 5 → node contributes at 40% weight (thin_coverage state in heatmap)
   5-9 → node contributes at 85% weight
   ≥ 10 → node contributes at 100% weight
   Prevents question bank memorization at low question counts.';

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_node_mastery_difficulty
  ON public.user_node_mastery (user_id, highest_difficulty_correct)
  WHERE highest_difficulty_correct > 0;

CREATE INDEX IF NOT EXISTS idx_node_mastery_bloom
  ON public.user_node_mastery (user_id, has_bloom_analyze_correct)
  WHERE has_bloom_analyze_correct = true;

-- ─────────────────────────────────────────────────────────────
-- 2. user_global_stats: sub_scores storage column
-- ─────────────────────────────────────────────────────────────

ALTER TABLE public.user_global_stats
  ADD COLUMN IF NOT EXISTS readiness_sub_scores JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Structure written by lib/readiness-score.ts:
-- {
--   "ALE-HIST": { score: 72.4, nodeCount: 30, greyCount: 8, belowFloor: false },
--   "ALE-THEO": { score: 65.1, nodeCount: 21, greyCount: 3, belowFloor: false },
--   "ALE-PLAN": { score: 44.2, nodeCount: 18, greyCount: 6, belowFloor: true },
--   ...
--   "_meta": {
--     ceilingActive: true,
--     ceilingValue: 70,
--     ceilingReason: "no_level3_correct",
--     greyPenalty: 0.18,
--     dayOneScore: 61.2,
--     dayTwoScore: 55.8
--   }
-- }

COMMENT ON COLUMN public.user_global_stats.readiness_sub_scores IS
  'Per-subject sub-scores written by lib/readiness-score.ts after each session.
   Read by snapshot_readiness_on_session_complete() trigger to populate
   readiness_score_snapshots.sub_scores (was always empty before).
   Also read by SubjectFloorAlert component (Task 0.3).';

-- ─────────────────────────────────────────────────────────────
-- 3. Replace snapshot trigger to use real sub_scores
-- The old trigger wrote '{}' for sub_scores every time. 
-- The new one reads from readiness_sub_scores which the app now populates.
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.snapshot_readiness_on_session_complete()
RETURNS trigger LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    INSERT INTO public.readiness_score_snapshots (
      user_id, score, sub_scores, session_id, is_proof_simulation, computed_at
    )
    SELECT
      NEW.user_id,
      ugs.global_readiness_score,
      ugs.readiness_sub_scores,    -- WAS: '{}'::jsonb — now reads real computed sub_scores
      NEW.session_id,
      COALESCE(NEW.is_proof_simulation, false),
      NOW()
    FROM public.user_global_stats ugs
    WHERE ugs.user_id = NEW.user_id
      AND ugs.global_readiness_score IS NOT NULL
      AND ugs.global_readiness_score > 0;
  END IF;
  RETURN NEW;
END;
$$;

-- ─────────────────────────────────────────────────────────────
-- 4. Verify migration
-- ─────────────────────────────────────────────────────────────

-- Run after applying. All must return expected values.
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'user_node_mastery'
  AND column_name IN (
    'consecutive_correct_streak', 'highest_difficulty_correct',
    'has_bloom_apply_correct', 'has_bloom_analyze_correct',
    'distinct_questions_seen'
  )
ORDER BY column_name;
-- Must return 5 rows.

SELECT column_name FROM information_schema.columns
WHERE table_name = 'user_global_stats' AND column_name = 'readiness_sub_scores';
-- Must return 1 row.
```

---

## STEP 2 — Create `lib/readiness-score.ts`

This is the core computation function. It takes all raw mastery data and produces an honest, inflation-resistant score. **This function never touches the database directly** — all DB reads happen in the Server Action that calls it (Step 4). The function is pure: same inputs → same outputs.

```typescript
// src/lib/readiness-score.ts

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

export interface NodeMasteryInput {
  topic_id: string
  ale_id: string | null
  subject_ale_id: string             // e.g., 'ALE-HIST'
  subject_name: string
  prc_area: 'A' | 'B' | 'C'
  area_weight_pct: number            // 30 or 40
  subject_weight_within_area_pct: number  // e.g., 35 for History within Area A
  node_type: string | null
  bloom_level: string | null
  taxonomy_difficulty: number | null // 1-4 from taxonomy_tree.difficulty
  exam_frequency: 'low' | 'medium' | 'high' | null

  // From user_node_mastery
  current_mastery_weight: number     // 0.0–1.0
  total_attempts: number
  total_correct: number
  last_encountered: string           // ISO timestamp
  consecutive_correct_streak: number
  highest_difficulty_correct: number // 0–4
  has_bloom_apply_correct: boolean
  has_bloom_analyze_correct: boolean
  distinct_questions_seen: number
}

export interface SubjectScore {
  ale_id: string
  name: string
  prc_area: 'A' | 'B' | 'C'
  score: number                     // 0–100
  nodeCount: number                 // active leaf nodes in this subject
  greyCount: number                 // unvisited nodes (no user_node_mastery row)
  thinCoverageCount: number         // nodes with < 5 distinct_questions_seen
  belowFloor: boolean               // score < 50 (ALE subject floor requirement)
}

export interface ReadinessResult {
  overallScore: number              // 0–100, the final displayed score
  rawScore: number                  // before ceiling and grey penalty (diagnostic)
  subScores: SubjectScore[]
  dayOneScore: number               // Area A subjects only
  dayTwoScore: number               // Areas B + C
  belowFloorSubjects: string[]      // subject names below 50%
  ceilingActive: boolean
  ceilingValue: number | null       // what the ceiling is (70, 82, 92, or null)
  ceilingReason: string | null      // why the ceiling is active
  greyPenalty: number               // 0.0–1.0 penalty from unvisited nodes
  activeCoverageGaps: string[]      // nodes in 'thin_coverage' state
}

// ─────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────

// PRC exam area weights — official
const PRC_AREA_WEIGHTS = {
  A: 0.30,
  B: 0.30,
  C: 0.40,
} as const

// Difficulty ceiling rules (Vector 2)
// A student who has never correctly answered a Level X question
// cannot score above the corresponding ceiling.
const DIFFICULTY_CEILINGS = [
  { maxDifficultyRequired: 3, ceiling: 70,  reason: 'no_level3_correct' },
  { maxDifficultyRequired: 4, ceiling: 82,  reason: 'no_level4_correct' },
] as const

// Bloom's level ceiling rules (Vector 4)
const BLOOM_CEILINGS = [
  { bloomRequired: 'apply',   ceiling: 75,  reason: 'no_apply_level_correct' },
  { bloomRequired: 'analyze', ceiling: 87,  reason: 'no_analyze_level_correct' },
] as const

// Grey node penalty factor (Vector 3)
// Each grey node as a fraction of total nodes drags the score down
// grey_penalty = (grey_node_fraction) × GREY_WEIGHT_FACTOR
const GREY_WEIGHT_FACTOR = 0.6

// Question bank depth weights (Vector 5)
function getDepthWeight(distinctQsSeen: number): number {
  if (distinctQsSeen < 5)  return 0.40
  if (distinctQsSeen < 10) return 0.85
  return 1.00
}

// Recency decay (Vector 6 support)
// Mastery from 10 weeks ago should count less than mastery from yesterday.
// Half-life: approximately 30 days
function getRecencyDecay(lastEncounteredISO: string): number {
  const daysSince = (Date.now() - new Date(lastEncounteredISO).getTime()) / (1000 * 60 * 60 * 24)
  return Math.exp(-0.023 * daysSince)  // e^(-0.023 × days) ≈ 0.5 at 30 days
}

// ─────────────────────────────────────────────────────────────
// CORE COMPUTATION
// ─────────────────────────────────────────────────────────────

export function computeReadinessScore(
  touchedNodes: NodeMasteryInput[],   // nodes with user_node_mastery rows
  totalActiveLeafCount: number,       // all non-deprecated, non-cross-ref leaf nodes
  allSubjects: Array<{ ale_id: string; name: string; prc_area: 'A' | 'B' | 'C'; subject_weight_within_area_pct: number }>
): ReadinessResult {

  // ── Step 1: compute per-node effective mastery with all adjustments ──

  const effectiveNodeScores: Array<{
    nodeInput: NodeMasteryInput
    effectiveMastery: number   // after streak decay and recency
    depthWeight: number
    nodeWeight: number         // final contribution weight in global score
  }> = touchedNodes.map(node => {
    // Consecutive streak diminishing returns (Vector 1)
    const streakFactor = node.consecutive_correct_streak > 1
      ? 1 / Math.pow(node.consecutive_correct_streak, 0.7)
      : 1.0

    // Recency decay
    const recencyFactor = getRecencyDecay(node.last_encountered)

    // Effective mastery for this node
    const effectiveMastery = Math.min(
      node.current_mastery_weight * recencyFactor * streakFactor,
      1.0
    )

    // Depth weight (Vector 5)
    const depthWeight = getDepthWeight(node.distinct_questions_seen)

    // PRC area weight for this node
    // node contribution = (area_weight × subject_weight_within_area / 100)
    const areaWeight = PRC_AREA_WEIGHTS[node.prc_area]
    const subjectFraction = node.subject_weight_within_area_pct / 100
    // This gives the fraction of the TOTAL exam this subject contributes
    const subjectWeight = areaWeight * subjectFraction
    // Individual node weight = subjectWeight / count of leaf nodes in this subject
    // (this normalization happens in Step 2 via subject grouping)
    const nodeWeight = subjectWeight * depthWeight

    return { nodeInput: node, effectiveMastery, depthWeight, nodeWeight }
  })

  // ── Step 2: compute per-subject sub-scores ──

  // Group touched nodes by subject
  const subjectMap = new Map<string, typeof effectiveNodeScores>()
  for (const item of effectiveNodeScores) {
    const key = item.nodeInput.subject_ale_id
    if (!subjectMap.has(key)) subjectMap.set(key, [])
    subjectMap.get(key)!.push(item)
  }

  // Total leaf node count per subject (pre-computed from taxonomy, passed in via allSubjects)
  // For grey count: total_for_subject - touched_for_subject
  // We need this per subject — allSubjects includes all subjects, compute touched per subject
  const touchedCountBySubject = new Map<string, number>()
  for (const node of touchedNodes) {
    touchedCountBySubject.set(
      node.subject_ale_id,
      (touchedCountBySubject.get(node.subject_ale_id) ?? 0) + 1
    )
  }

  // Build sub-scores
  // Note: to get total_nodes_per_subject, call the DB query in the Server Action
  // and pass it in. For now, approximate from touchedNodes + the grey count
  // (totalActiveLeafCount - touchedNodes.length = total grey across all subjects)
  const subScores: SubjectScore[] = allSubjects.map(subject => {
    const subjectNodes = subjectMap.get(subject.ale_id) ?? []
    const touchedCount = touchedCountBySubject.get(subject.ale_id) ?? 0

    // Per-subject raw score: weighted average of effective mastery in this subject
    const rawSubjectScore = subjectNodes.length > 0
      ? (subjectNodes.reduce((sum, n) => sum + n.effectiveMastery * n.depthWeight, 0) /
         subjectNodes.reduce((sum, n) => sum + n.depthWeight, 0)) * 100
      : 0

    // Grey nodes in this subject: estimated from total touched vs expected
    // In production, pass per-subject leaf counts from DB
    const thinCoverageCount = subjectNodes.filter(n => n.nodeInput.distinct_questions_seen < 5).length

    return {
      ale_id: subject.ale_id,
      name: subject.name,
      prc_area: subject.prc_area,
      score: Math.round(rawSubjectScore * 10) / 10,
      nodeCount: touchedCount,      // touched nodes — server action passes total separately
      greyCount: 0,                 // populated by server action with per-subject counts
      thinCoverageCount,
      belowFloor: rawSubjectScore < 50,
    }
  })

  // ── Step 3: compute weighted global raw score ──

  // Total weight sum across all touched nodes
  const totalWeightSum = effectiveNodeScores.reduce((sum, n) => sum + n.nodeWeight, 0)
  const weightedScoreSum = effectiveNodeScores.reduce(
    (sum, n) => sum + n.effectiveMastery * n.nodeWeight,
    0
  )

  // Raw score before penalties (0–100)
  const rawScore = totalWeightSum > 0
    ? Math.min((weightedScoreSum / totalWeightSum) * 100, 100)
    : 0

  // ── Step 4: grey node penalty (Vector 3) ──

  const greyNodeCount = totalActiveLeafCount - touchedNodes.length
  const greyFraction = greyNodeCount / Math.max(totalActiveLeafCount, 1)
  const greyPenalty = greyFraction * GREY_WEIGHT_FACTOR  // 0.0–0.6

  const penalizedScore = rawScore * (1 - greyPenalty)

  // ── Step 5: difficulty ceiling (Vector 2) ──

  // Find the highest difficulty level the user has answered correctly, across ALL nodes
  const maxDifficultyCorrect = Math.max(
    0,
    ...touchedNodes.map(n => n.highest_difficulty_correct)
  )

  let ceilingValue: number | null = null
  let ceilingReason: string | null = null

  for (const rule of DIFFICULTY_CEILINGS) {
    if (maxDifficultyCorrect < rule.maxDifficultyRequired) {
      if (ceilingValue === null || rule.ceiling < ceilingValue) {
        ceilingValue = rule.ceiling
        ceilingReason = rule.reason
      }
    }
  }

  // ── Step 6: Bloom's cognitive level ceiling (Vector 4) ──

  const hasAnyApplyCorrect  = touchedNodes.some(n => n.has_bloom_apply_correct)
  const hasAnyAnalyzeCorrect = touchedNodes.some(n => n.has_bloom_analyze_correct)

  for (const rule of BLOOM_CEILINGS) {
    const requirement = rule.bloomRequired === 'apply'   ? hasAnyApplyCorrect
                      : rule.bloomRequired === 'analyze' ? hasAnyAnalyzeCorrect
                      : false
    if (!requirement) {
      if (ceilingValue === null || rule.ceiling < ceilingValue) {
        ceilingValue = rule.ceiling
        ceilingReason = rule.reason
      }
    }
  }

  // ── Step 7: apply ceiling ──

  const scoreBeforeCeiling = penalizedScore
  const finalScore = ceilingValue !== null
    ? Math.min(penalizedScore, ceilingValue)
    : penalizedScore

  const ceilingActive = ceilingValue !== null && penalizedScore > ceilingValue

  // Round to 1 decimal place (never round up — use floor at last digit)
  const overallScore = Math.floor(finalScore * 10) / 10

  // ── Step 8: Day 1 / Day 2 split ──

  const areaANodes = effectiveNodeScores.filter(n => n.nodeInput.prc_area === 'A')
  const areaBCNodes = effectiveNodeScores.filter(n => n.nodeInput.prc_area === 'B' || n.nodeInput.prc_area === 'C')

  const dayOneScore = computeAreaScore(areaANodes)
  const dayTwoScore = computeAreaScore(areaBCNodes)

  // ── Step 9: collect thin coverage nodes for heatmap ──

  const activeCoverageGaps = touchedNodes
    .filter(n => n.distinct_questions_seen < 5)
    .map(n => n.ale_id ?? n.topic_id)
    .filter(Boolean) as string[]

  // ── Step 10: below-floor subjects ──

  const belowFloorSubjects = subScores
    .filter(s => s.belowFloor)
    .map(s => s.name)

  return {
    overallScore,
    rawScore: Math.floor(rawScore * 10) / 10,
    subScores,
    dayOneScore: Math.floor(dayOneScore * 10) / 10,
    dayTwoScore: Math.floor(dayTwoScore * 10) / 10,
    belowFloorSubjects,
    ceilingActive,
    ceilingValue,
    ceilingReason,
    greyPenalty: Math.round(greyPenalty * 100) / 100,
    activeCoverageGaps,
  }
}

function computeAreaScore(
  nodes: Array<{ effectiveMastery: number; depthWeight: number }>
): number {
  if (nodes.length === 0) return 0
  const weightSum = nodes.reduce((sum, n) => sum + n.depthWeight, 0)
  const scoreSum  = nodes.reduce((sum, n) => sum + n.effectiveMastery * n.depthWeight, 0)
  return weightSum > 0 ? (scoreSum / weightSum) * 100 : 0
}
```

---

## STEP 3 — Update the Mastery Update Server Action

Find the Server Action that handles post-answer mastery updates (the action that writes to `user_node_mastery` after each question). **This is the most critical change** — it updates all 5 new columns correctly on every answer.

**File to find:** Look for the function that does `UPDATE user_node_mastery` after a quiz answer. Likely in `lib/actions/mastery.ts` or inside the quiz submission Server Action.

```typescript
// src/lib/actions/mastery.ts (or wherever the mastery update currently lives)
// MODIFY the existing updateNodeMastery function (or equivalent)

'use server'

import { createClient } from '@/lib/supabase/server'

interface MasteryUpdateInput {
  userId: string
  topicId: string
  questionId: string
  isCorrect: boolean
  isSuspectedLuckyGuess: boolean    // from user_interactions.is_suspected_lucky_guess
  timespentMs: number
  // From taxonomy_tree (fetched once per session, passed in)
  taxonomyDifficulty: number | null  // 1-4 from taxonomy_tree.difficulty
  bloomLevel: string | null          // from taxonomy_tree.bloom_level
}

export async function updateNodeMastery(input: MasteryUpdateInput): Promise<void> {
  const supabase = createClient()

  // 1. Fetch current mastery state for this node
  const { data: current } = await supabase
    .from('user_node_mastery')
    .select(`
      current_mastery_weight, total_attempts, total_correct,
      avg_time_ms, consecutive_correct_streak,
      highest_difficulty_correct, has_bloom_apply_correct,
      has_bloom_analyze_correct, distinct_questions_seen
    `)
    .eq('user_id', input.userId)
    .eq('topic_id', input.topicId)
    .maybeSingle()

  // 2. Check if this question_id has been seen before (for distinct_questions_seen)
  const { count: prevSeenCount } = await supabase
    .from('user_interactions')
    .select('interaction_id', { count: 'exact', head: true })
    .eq('user_id', input.userId)
    .eq('question_id', input.questionId)
    // The current answer hasn't been inserted yet — count existing rows
  const isNewQuestion = (prevSeenCount ?? 0) === 0

  // 3. Compute EMA weight for this answer
  // Lucky guess: apply 0.3× weight instead of 1.0×
  // Wrong answer: always full weight (wrong answers should fully penalize)
  const baseWeight = input.isSuspectedLuckyGuess ? 0.3 : 1.0

  // EMA alpha — how much new evidence weighs
  // Higher alpha = faster updates. Use 0.2 as the base.
  const EMA_ALPHA = 0.2
  const answerValue = input.isCorrect ? 1.0 : 0.0

  const prevMastery = current?.current_mastery_weight ?? 0.0
  const newMasteryWeight = prevMastery + EMA_ALPHA * baseWeight * (answerValue - prevMastery)

  // 4. Update streak
  const prevStreak = current?.consecutive_correct_streak ?? 0
  const newStreak = input.isCorrect ? prevStreak + 1 : 0

  // 5. Update highest difficulty correct
  const prevHighestDiff = current?.highest_difficulty_correct ?? 0
  const newHighestDiff = (input.isCorrect && input.taxonomyDifficulty !== null)
    ? Math.max(prevHighestDiff, input.taxonomyDifficulty)
    : prevHighestDiff

  // 6. Update bloom flags
  const newHasApply = current?.has_bloom_apply_correct
    || (input.isCorrect && input.bloomLevel === 'apply')
  const newHasAnalyze = current?.has_bloom_analyze_correct
    || (input.isCorrect && input.bloomLevel === 'analyze')

  // 7. Update distinct_questions_seen
  const prevDistinct = current?.distinct_questions_seen ?? 0
  const newDistinct = isNewQuestion ? prevDistinct + 1 : prevDistinct

  // 8. Update avg_time_ms (rolling average)
  const prevAvgTime = current?.avg_time_ms ?? 0
  const totalAttempts = (current?.total_attempts ?? 0) + 1
  const newAvgTime = Math.round(
    prevAvgTime + (input.timespentMs - prevAvgTime) / totalAttempts
  )

  // 9. Upsert user_node_mastery with all updates
  const { error } = await supabase
    .from('user_node_mastery')
    .upsert({
      user_id: input.userId,
      topic_id: input.topicId,
      current_mastery_weight:     Math.min(Math.max(newMasteryWeight, 0), 1),
      total_attempts:             totalAttempts,
      total_correct:              (current?.total_correct ?? 0) + (input.isCorrect ? 1 : 0),
      avg_time_ms:                newAvgTime,
      last_encountered:           new Date().toISOString(),
      consecutive_correct_streak: newStreak,
      highest_difficulty_correct: newHighestDiff,
      has_bloom_apply_correct:    newHasApply,
      has_bloom_analyze_correct:  newHasAnalyze,
      distinct_questions_seen:    newDistinct,
    }, {
      onConflict: 'user_id, topic_id',
    })

  if (error) {
    console.error('[mastery] updateNodeMastery failed:', error.message)
    throw error
  }
}
```

---

## STEP 4 — Update the Readiness Score Computation Server Action

After every quiz session completes, a Server Action must: (a) compute the new score using `lib/readiness-score.ts`, (b) write it to `user_global_stats`, then (c) update the session status to 'completed' — which fires the snapshot trigger with the real sub_scores now in place.

**File to find:** The Server Action that marks a quiz session as completed. Likely `lib/actions/quiz.ts` or `lib/actions/sessions.ts`. Find the function that sets `quiz_sessions.status = 'completed'`.

**Insert this logic BEFORE setting status = 'completed':**

```typescript
// src/lib/actions/readiness-score-update.ts (new file)
// Call this from wherever sessions are completed, BEFORE setting status = 'completed'

'use server'

import { createClient } from '@/lib/supabase/server'
import { computeReadinessScore, NodeMasteryInput } from '@/lib/readiness-score'

export async function recomputeAndSaveReadinessScore(userId: string): Promise<void> {
  const supabase = createClient()

  // 1. Get the discipline for this user
  const { data: statsData } = await supabase
    .from('user_global_stats')
    .select('current_discipline_id')
    .eq('user_id', userId)
    .single()

  if (!statsData?.current_discipline_id) return

  const disciplineId = statsData.current_discipline_id

  // 2. Get total active leaf node count for this discipline
  // (denominator for grey penalty — all non-deprecated, non-cross-ref leaf nodes)
  const { count: totalLeafCount } = await supabase
    .from('taxonomy_tree')
    .select('node_id', { count: 'exact', head: true })
    .eq('discipline_id', disciplineId)
    .eq('is_leaf', true)
    .eq('is_cross_ref_only', false)
    .is('deprecated_at', null)

  if (!totalLeafCount) return

  // 3. Get all subjects for this discipline (for sub-score breakdown)
  const { data: subjects } = await supabase
    .from('taxonomy_tree')
    .select('node_id, ale_id, name, prc_area, subject_weight_within_area_pct')
    .eq('discipline_id', disciplineId)
    .eq('level', 1)
    .eq('is_cross_ref_only', false)
    .is('deprecated_at', null)
    .not('ale_id', 'is', null)

  if (!subjects?.length) return

  // 4. Get all touched nodes with mastery data + taxonomy metadata in one JOIN query
  const { data: masteryRows } = await supabase
    .from('user_node_mastery')
    .select(`
      topic_id,
      current_mastery_weight,
      total_attempts,
      total_correct,
      last_encountered,
      consecutive_correct_streak,
      highest_difficulty_correct,
      has_bloom_apply_correct,
      has_bloom_analyze_correct,
      distinct_questions_seen,
      taxonomy_tree!inner (
        ale_id,
        bloom_level,
        difficulty,
        node_type,
        exam_frequency,
        is_cross_ref_only,
        deprecated_at,
        parent:parent_id (
          ale_id,
          parent:parent_id (
            ale_id,
            name,
            prc_area,
            area_weight_pct,
            subject_weight_within_area_pct
          )
        )
      )
    `)
    .eq('user_id', userId)

  if (!masteryRows?.length) {
    // No mastery yet — score stays at 0
    await supabase
      .from('user_global_stats')
      .update({ global_readiness_score: 0, readiness_sub_scores: '{}' })
      .eq('user_id', userId)
    return
  }

  // 5. Build NodeMasteryInput array
  // The JOIN above gives us: leaf node → parent topic → grandparent subject
  // We need the subject-level ale_id, prc_area, and subject_weight_within_area_pct
  const nodeInputs: NodeMasteryInput[] = masteryRows
    .filter(row => {
      const tt = row.taxonomy_tree as any
      // Only leaf nodes, not cross-ref, not deprecated
      return tt &&
        !tt.is_cross_ref_only &&
        !tt.deprecated_at
    })
    .map(row => {
      const tt = row.taxonomy_tree as any
      // Walk up the tree to find the subject node (level=1)
      // The structure: leaf → topic (level 2) → subject (level 1)
      // Accessing via the nested JOIN above
      const subjectNode = tt?.parent?.parent ?? tt?.parent ?? null

      return {
        topic_id: row.topic_id,
        ale_id: tt.ale_id,
        subject_ale_id: subjectNode?.ale_id ?? 'UNKNOWN',
        subject_name: subjectNode?.name ?? 'Unknown',
        prc_area: (subjectNode?.prc_area ?? 'A') as 'A' | 'B' | 'C',
        area_weight_pct: subjectNode?.area_weight_pct ?? 30,
        subject_weight_within_area_pct: subjectNode?.subject_weight_within_area_pct ?? 25,
        node_type: tt.node_type,
        bloom_level: tt.bloom_level,
        taxonomy_difficulty: tt.difficulty,
        exam_frequency: tt.exam_frequency,
        current_mastery_weight: row.current_mastery_weight,
        total_attempts: row.total_attempts,
        total_correct: row.total_correct,
        last_encountered: row.last_encountered,
        consecutive_correct_streak: row.consecutive_correct_streak,
        highest_difficulty_correct: row.highest_difficulty_correct,
        has_bloom_apply_correct: row.has_bloom_apply_correct,
        has_bloom_analyze_correct: row.has_bloom_analyze_correct,
        distinct_questions_seen: row.distinct_questions_seen,
      } satisfies NodeMasteryInput
    })

  // 6. Run the computation
  const result = computeReadinessScore(
    nodeInputs,
    totalLeafCount,
    subjects.map(s => ({
      ale_id: s.ale_id!,
      name: s.name,
      prc_area: s.prc_area as 'A' | 'B' | 'C',
      subject_weight_within_area_pct: s.subject_weight_within_area_pct ?? 25,
    }))
  )

  // 7. Write back to user_global_stats
  // sub_scores structure matches what readiness_score_snapshots.sub_scores expects
  const subScoresForDB = {
    ...Object.fromEntries(result.subScores.map(s => [s.ale_id, {
      score: s.score,
      nodeCount: s.nodeCount,
      greyCount: s.greyCount,
      thinCoverageCount: s.thinCoverageCount,
      belowFloor: s.belowFloor,
    }])),
    _meta: {
      ceilingActive: result.ceilingActive,
      ceilingValue: result.ceilingValue,
      ceilingReason: result.ceilingReason,
      greyPenalty: result.greyPenalty,
      rawScore: result.rawScore,
      dayOneScore: result.dayOneScore,
      dayTwoScore: result.dayTwoScore,
    }
  }

  await supabase
    .from('user_global_stats')
    .update({
      global_readiness_score: result.overallScore,
      readiness_sub_scores: subScoresForDB,
    })
    .eq('user_id', userId)

  // 8. After this returns, the calling Server Action sets quiz_sessions.status = 'completed'
  //    The snapshot trigger fires and reads global_readiness_score + readiness_sub_scores
  //    to create the snapshot — both are now accurate values, not stale/empty.
}
```

---

## STEP 5 — Wire the session completion flow

Find the Server Action that sets `quiz_sessions.status = 'completed'` and add the readiness score recomputation call before it.

```typescript
// In the session completion Server Action (wherever status = 'completed' is set):
// BEFORE: await supabase.from('quiz_sessions').update({ status: 'completed' })...
// AFTER:

import { recomputeAndSaveReadinessScore } from '@/lib/actions/readiness-score-update'

// ... existing mastery update logic ...

// Compute and save new readiness score FIRST
await recomputeAndSaveReadinessScore(userId)

// THEN complete the session — this fires the snapshot trigger with correct values
await supabase
  .from('quiz_sessions')
  .update({ status: 'completed', completed_at: new Date().toISOString() })
  .eq('session_id', sessionId)
  .eq('user_id', userId)
```

---

## STEP 6 — Update ReadinessScoreCard to show ceiling state

**File:** `app/dashboard/_components/ReadinessScoreCard.tsx` (find the exact path from the codebase)

```typescript
// Add these props/reads from user_global_stats.readiness_sub_scores._meta:

// If ceilingActive = true, show a factual explanation below the score:
// "Your score is capped at [ceilingValue]%"
// + reason mapping:
const CEILING_COPY = {
  'no_level3_correct':    'Answer some Advanced (Level 3) questions to unlock higher scores.',
  'no_level4_correct':    'Expert (Level 4) questions are now your ceiling. Answer some to raise it.',
  'no_apply_level_correct':  'Your questions have been recall-only. The ALE tests application — try Apply-level questions.',
  'no_analyze_level_correct': 'Analysis-level questions unlock the top score band. Your Trail will route you there.',
}

// If greyPenalty > 0.3 (significant), show:
// "X% of your heatmap is unvisited. Grey nodes lower your score."
// This motivates coverage without shaming the student.
```

---

## STEP 7 — Update the heatmap to show thin_coverage state

The heatmap currently shows 3 states: grey (unvisited), red, amber, green. Add a 4th state.

**File:** Find the heatmap component and the function that assigns node colors/states.

```typescript
// In the heatmap state computation:

type NodeState = 'grey' | 'red' | 'amber' | 'green' | 'thin_coverage'

function getNodeState(mastery: UserNodeMastery | null, distinctQsSeen: number): NodeState {
  // No mastery row at all = completely unvisited
  if (!mastery) return 'grey'

  // thin_coverage: has been visited but question bank is too shallow for reliable assessment
  // This is NOT a bad state — it's an honest signal
  if (distinctQsSeen < 5) return 'thin_coverage'

  // Standard mastery thresholds
  if (mastery.current_mastery_weight < 0.4)  return 'red'
  if (mastery.current_mastery_weight < 0.75) return 'amber'
  return 'green'
}

// thin_coverage UI: show as grey with a small lock/thin-bar icon
// Tooltip: "Score contribution limited — fewer than 5 questions answered on this topic.
//           The question bank grows over time. Accuracy will improve."
```

---

## ACCEPTANCE CRITERIA

Run these checks before marking this task complete:

### Schema verification
```sql
-- 1. New columns exist on user_node_mastery
SELECT column_name FROM information_schema.columns
WHERE table_name = 'user_node_mastery'
  AND column_name IN ('consecutive_correct_streak', 'highest_difficulty_correct',
                       'has_bloom_apply_correct', 'has_bloom_analyze_correct',
                       'distinct_questions_seen');
-- Must return 5 rows.

-- 2. readiness_sub_scores exists on user_global_stats
SELECT column_name FROM information_schema.columns
WHERE table_name = 'user_global_stats' AND column_name = 'readiness_sub_scores';
-- Must return 1 row.

-- 3. Snapshot trigger now reads readiness_sub_scores (verify function body changed)
SELECT prosrc FROM pg_proc WHERE proname = 'snapshot_readiness_on_session_complete';
-- Output should contain 'readiness_sub_scores' — NOT '{}'::jsonb.
```

### Behavior verification
- [ ] A user who answers 200 easy questions (Level 1 only) cannot score above 70%
- [ ] A user with 50% of nodes unvisited (grey) cannot score above ~55%
- [ ] A user who has never answered an 'apply' bloom question cannot score above 75%
- [ ] After completing a quiz session, `readiness_score_snapshots.sub_scores` contains populated JSON (not `{}`)
- [ ] The heatmap shows a 'thin_coverage' state for nodes with < 5 distinct questions answered
- [ ] `ReadinessScoreCard` displays the ceiling explanation when `ceilingActive = true`
- [ ] TypeScript: `npx tsc --noEmit` passes with zero errors
- [ ] `bun run build` succeeds

---

## WHAT NOT TO BUILD IN THIS PR

- Do not add any UI that implies the score is "wrong" — it's honest, not broken
- Do not show the `rawScore` or `greyPenalty` numbers to students — internal diagnostics only
- Do not add confetti, celebration states, or "score improved" animations
- Do not build the `SubjectFloorAlert` component — that is Task 0.3 in the feature plan (separate PR)
- Do not modify the lucky guess trigger — it correctly flags guesses; this PR only wires the flag into the EMA weight (Step 3 above covers this)

---

*SlateCamp Readiness Score Anti-Inflation Implementation Plan*  
*DB Architect + Philip (Founder) · 2026-03-19*
