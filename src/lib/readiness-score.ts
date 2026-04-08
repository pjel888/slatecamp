/**
 * Readiness Score Anti-Inflation Computation
 *
 * Pure function: same inputs → same outputs. No database access.
 * All DB reads happen in the Server Action that calls this (readiness-score-update.ts).
 *
 * Implements 6 anti-inflation vectors:
 *   1. Diminishing returns on consecutive correct streaks
 *   2. Difficulty ceiling (score capped until Level 3/4 questions answered correctly)
 *   3. Grey node penalty (unvisited nodes drag score down)
 *   4. Bloom's cognitive level ceiling (recall-only practice capped)
 *   5. Question bank depth weight (thin coverage = reduced contribution)
 *   6. Recency decay (stale mastery counts less)
 */

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

export interface NodeMasteryInput {
  topic_id: string
  lea_id: string | null
  subject_lea_id: string             // e.g., 'LEA-HIST'
  subject_name: string
  prc_area: 'A' | 'B' | 'C'
  area_weight_pct: number            // 30 or 40
  subject_weight_within_area_pct: number
  node_type: string | null
  bloom_level: string | null
  taxonomy_difficulty: number | null  // 1-4 from taxonomy_tree.difficulty
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
  lea_id: string
  name: string
  prc_area: 'A' | 'B' | 'C'
  score: number                     // 0–100
  nodeCount: number                 // total leaf nodes in this subject
  touchedCount: number              // nodes with mastery data
  greyCount: number                 // unvisited nodes (no user_node_mastery row)
  thinCoverageCount: number         // nodes with < 5 distinct_questions_seen
  belowFloor: boolean               // score < 50 (LEA subject floor requirement)
}

export interface ReadinessResult {
  overallScore: number              // 0–100, the final displayed score
  rawScore: number                  // before ceiling and grey penalty (diagnostic)
  subScores: SubjectScore[]
  dayOneScore: number               // Area A subjects only
  dayTwoScore: number               // Areas B + C
  belowFloorSubjects: string[]      // subject names below 50%
  ceilingActive: boolean
  ceilingValue: number | null       // what the ceiling is (70, 75, 82, 87, 92, or null)
  ceilingReason: string | null      // why the ceiling is active
  greyPenalty: number               // 0.0–1.0 penalty from unvisited nodes
  activeCoverageGaps: string[]      // node lea_ids in 'thin_coverage' state
}

export interface SubjectLeafCounts {
  [lea_id: string]: number          // total leaf nodes per subject
}

// ─────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────

// PRC exam area weights — official
const PRC_AREA_WEIGHTS: Record<string, number> = {
  A: 0.30,
  B: 0.30,
  C: 0.40,
}

// Difficulty ceiling rules (Vector 2)
const DIFFICULTY_CEILINGS = [
  { maxDifficultyRequired: 3, ceiling: 70, reason: 'no_level3_correct' },
  { maxDifficultyRequired: 4, ceiling: 82, reason: 'no_level4_correct' },
] as const

// Bloom's level ceiling rules (Vector 4)
const BLOOM_CEILINGS = [
  { bloomRequired: 'apply', ceiling: 75, reason: 'no_apply_level_correct' },
  { bloomRequired: 'analyze', ceiling: 87, reason: 'no_analyze_level_correct' },
] as const

// Grey node penalty factor (Vector 3)
const GREY_WEIGHT_FACTOR = 0.6

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

/** Question bank depth weights (Vector 5) */
const getDepthWeight = (distinctQsSeen: number): number => {
  if (distinctQsSeen < 5) return 0.40
  if (distinctQsSeen < 10) return 0.85
  return 1.00
}

/** Recency decay (Vector 6) — half-life ~30 days */
const getRecencyDecay = (lastEncounteredISO: string): number => {
  const daysSince = (Date.now() - new Date(lastEncounteredISO).getTime()) / (1000 * 60 * 60 * 24)
  if (daysSince <= 0) return 1.0
  return Math.exp(-0.023 * daysSince) // e^(-0.023 × days) ≈ 0.5 at 30 days
}

// ─────────────────────────────────────────────────────────────
// CORE COMPUTATION
// ─────────────────────────────────────────────────────────────

export const computeReadinessScore = (
  touchedNodes: NodeMasteryInput[],
  totalActiveLeafCount: number,
  allSubjects: Array<{
    lea_id: string
    name: string
    prc_area: 'A' | 'B' | 'C'
    subject_weight_within_area_pct: number
  }>,
  subjectLeafCounts: SubjectLeafCounts,
): ReadinessResult => {

  // ── Step 1: compute per-node effective mastery with all adjustments ──

  const effectiveNodeScores = touchedNodes.map(node => {
    // Consecutive streak diminishing returns (Vector 1)
    const streakFactor = node.consecutive_correct_streak > 1
      ? 1 / Math.pow(node.consecutive_correct_streak, 0.7)
      : 1.0

    // Recency decay (Vector 6)
    const recencyFactor = getRecencyDecay(node.last_encountered)

    // Effective mastery for this node
    const effectiveMastery = Math.min(
      node.current_mastery_weight * recencyFactor * streakFactor,
      1.0,
    )

    // Depth weight (Vector 5)
    const depthWeight = getDepthWeight(node.distinct_questions_seen)

    return { nodeInput: node, effectiveMastery, depthWeight }
  })

  // ── Step 2: compute per-subject sub-scores ──

  // Group touched nodes by subject
  const subjectMap = new Map<string, typeof effectiveNodeScores>()
  for (const item of effectiveNodeScores) {
    const key = item.nodeInput.subject_lea_id
    if (!subjectMap.has(key)) subjectMap.set(key, [])
    subjectMap.get(key)!.push(item)
  }

  // Build sub-scores
  const subScores: SubjectScore[] = allSubjects.map(subject => {
    const subjectNodes = subjectMap.get(subject.lea_id) ?? []
    const totalLeafsForSubject = subjectLeafCounts[subject.lea_id] ?? 0
    const touchedCount = subjectNodes.length
    const greyCount = Math.max(0, totalLeafsForSubject - touchedCount)

    // Per-subject raw score: weighted average of effective mastery in this subject
    // Include grey nodes as zero in the denominator
    let rawSubjectScore = 0
    if (subjectNodes.length > 0 && totalLeafsForSubject > 0) {
      const touchedSum = subjectNodes.reduce(
        (sum, n) => sum + n.effectiveMastery * n.depthWeight, 0,
      )
      // Denominator: touched nodes weighted + grey nodes at weight 1.0 (they contribute 0 mastery)
      const touchedWeightSum = subjectNodes.reduce((sum, n) => sum + n.depthWeight, 0)
      const totalWeightSum = touchedWeightSum + greyCount // grey nodes have depthWeight=1 but mastery=0
      rawSubjectScore = totalWeightSum > 0
        ? (touchedSum / totalWeightSum) * 100
        : 0
    }

    const thinCoverageCount = subjectNodes.filter(
      n => n.nodeInput.distinct_questions_seen < 5,
    ).length

    return {
      lea_id: subject.lea_id,
      name: subject.name,
      prc_area: subject.prc_area,
      score: Math.round(rawSubjectScore * 10) / 10,
      nodeCount: totalLeafsForSubject,
      touchedCount,
      greyCount,
      thinCoverageCount,
      belowFloor: rawSubjectScore < 50,
    }
  })

  // ── Step 3: compute PRC area-weighted global raw score ──

  // Normalize within-area weights
  const areaWeightSumByArea = new Map<string, number>()
  for (const s of allSubjects) {
    const sw = s.subject_weight_within_area_pct ?? 1
    areaWeightSumByArea.set(s.prc_area, (areaWeightSumByArea.get(s.prc_area) ?? 0) + sw)
  }

  let weightedSum = 0
  let totalWeight = 0

  for (const sub of subScores) {
    const areaWeight = PRC_AREA_WEIGHTS[sub.prc_area] ?? 0.30
    const matchingSubject = allSubjects.find(s => s.lea_id === sub.lea_id)
    const subjectWeight = matchingSubject?.subject_weight_within_area_pct ?? 1
    const areaTotal = areaWeightSumByArea.get(sub.prc_area) ?? subjectWeight
    const finalWeight = areaWeight * (subjectWeight / areaTotal)

    weightedSum += (sub.score / 100) * finalWeight
    totalWeight += finalWeight
  }

  const rawScore = totalWeight > 0
    ? Math.min((weightedSum / totalWeight) * 100, 100)
    : 0

  // ── Step 4: grey node penalty (Vector 3) ──

  const greyNodeCount = totalActiveLeafCount - touchedNodes.length
  const greyFraction = greyNodeCount / Math.max(totalActiveLeafCount, 1)
  const greyPenalty = greyFraction * GREY_WEIGHT_FACTOR // 0.0–0.6

  const penalizedScore = rawScore * (1 - greyPenalty)

  // ── Step 5: difficulty ceiling (Vector 2) ──

  const maxDifficultyCorrect = touchedNodes.length > 0
    ? Math.max(0, ...touchedNodes.map(n => n.highest_difficulty_correct))
    : 0

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

  const hasAnyApplyCorrect = touchedNodes.some(n => n.has_bloom_apply_correct)
  const hasAnyAnalyzeCorrect = touchedNodes.some(n => n.has_bloom_analyze_correct)

  for (const rule of BLOOM_CEILINGS) {
    const requirement = rule.bloomRequired === 'apply'
      ? hasAnyApplyCorrect
      : rule.bloomRequired === 'analyze'
        ? hasAnyAnalyzeCorrect
        : false
    if (!requirement) {
      if (ceilingValue === null || rule.ceiling < ceilingValue) {
        ceilingValue = rule.ceiling
        ceilingReason = rule.reason
      }
    }
  }

  // ── Step 7: apply ceiling ──

  const finalScore = ceilingValue !== null
    ? Math.min(penalizedScore, ceilingValue)
    : penalizedScore

  const ceilingActive = ceilingValue !== null && penalizedScore > ceilingValue

  // Floor at 1 decimal place (never round up)
  const overallScore = Math.floor(finalScore * 10) / 10

  // ── Step 8: Day 1 / Day 2 split ──

  const dayOneSubScores = subScores.filter(s => s.prc_area === 'A')
  const dayTwoSubScores = subScores.filter(s => s.prc_area === 'B' || s.prc_area === 'C')

  const computeAreaAvg = (subs: SubjectScore[]): number => {
    if (subs.length === 0) return 0
    const avg = subs.reduce((sum, s) => sum + s.score, 0) / subs.length
    return avg
  }

  const dayOneScore = Math.floor(computeAreaAvg(dayOneSubScores) * 10) / 10
  const dayTwoScore = Math.floor(computeAreaAvg(dayTwoSubScores) * 10) / 10

  // ── Step 9: collect thin coverage nodes for heatmap ──

  const activeCoverageGaps = touchedNodes
    .filter(n => n.distinct_questions_seen < 5)
    .map(n => n.lea_id ?? n.topic_id)
    .filter(Boolean) as string[]

  // ── Step 10: below-floor subjects ──

  const belowFloorSubjects = subScores
    .filter(s => s.belowFloor)
    .map(s => s.name)

  return {
    overallScore,
    rawScore: Math.floor(rawScore * 10) / 10,
    subScores,
    dayOneScore,
    dayTwoScore,
    belowFloorSubjects,
    ceilingActive,
    ceilingValue,
    ceilingReason,
    greyPenalty: Math.round(greyPenalty * 100) / 100,
    activeCoverageGaps,
  }
}
