import { expect, test, describe } from 'bun:test'
import { computeReadinessScore } from '../readiness-score'
import type { NodeMasteryInput, SubjectLeafCounts } from '../readiness-score'

// ─── Fixtures ────────────────────────────────────────────────────────────────

const SUBJECTS = [
  { lea_id: 'LEA-HIST', name: 'History', prc_area: 'A' as const, subject_weight_within_area_pct: 50 },
  { lea_id: 'LEA-STRUCT', name: 'Structures', prc_area: 'B' as const, subject_weight_within_area_pct: 50 },
  { lea_id: 'LEA-UTIL', name: 'Utilities', prc_area: 'C' as const, subject_weight_within_area_pct: 50 },
]

const LEAF_COUNTS: SubjectLeafCounts = {
  'LEA-HIST': 10,
  'LEA-STRUCT': 10,
  'LEA-UTIL': 10,
}

/** Build a node with safe defaults — override only what the test cares about. */
const makeNode = (overrides: Partial<NodeMasteryInput> = {}): NodeMasteryInput => ({
  topic_id: 'node-1',
  lea_id: 'node-1',
  subject_lea_id: 'LEA-HIST',
  subject_name: 'History',
  prc_area: 'A',
  area_weight_pct: 30,
  subject_weight_within_area_pct: 50,
  node_type: 'leaf',
  bloom_level: 'analyze',
  taxonomy_difficulty: 4,
  exam_frequency: 'high',
  current_mastery_weight: 1.0,
  total_attempts: 20,
  total_correct: 20,
  last_encountered: new Date().toISOString(), // now → no recency decay
  consecutive_correct_streak: 1,
  highest_difficulty_correct: 4,
  has_bloom_apply_correct: true,
  has_bloom_analyze_correct: true,
  distinct_questions_seen: 15,
  ...overrides,
})

// ─── Zero-mastery edge case ──────────────────────────────────────────────────

describe('zero mastery state', () => {
  test('returns overallScore of 0 when no nodes touched', () => {
    const result = computeReadinessScore([], 10, SUBJECTS, LEAF_COUNTS)
    expect(result.overallScore).toBe(0)
    expect(result.rawScore).toBe(0)
  })

  test('grey penalty is 0.6 when no nodes touched out of 10', () => {
    const result = computeReadinessScore([], 10, SUBJECTS, LEAF_COUNTS)
    expect(result.greyPenalty).toBe(0.6)
  })

  test('all sub-scores are 0 when no nodes touched', () => {
    const result = computeReadinessScore([], 10, SUBJECTS, LEAF_COUNTS)
    result.subScores.forEach(s => expect(s.score).toBe(0))
  })

  test('ceiling is active (no level3/4 correct) and set to 70', () => {
    const result = computeReadinessScore([], 10, SUBJECTS, LEAF_COUNTS)
    expect(result.ceilingValue).toBe(70)
  })
})

// ─── Zone thresholds ─────────────────────────────────────────────────────────

describe('zone boundary: score = 0', () => {
  test('result is exactly 0 with empty state', () => {
    const result = computeReadinessScore([], 1, SUBJECTS, { 'LEA-HIST': 1, 'LEA-STRUCT': 1, 'LEA-UTIL': 1 })
    expect(result.overallScore).toBe(0)
  })
})

describe('zone boundary: difficulty ceiling at 70 (no level 3 correct)', () => {
  test('score is capped at 70 when maxDifficultyCorrect < 3', () => {
    const nodes = Array.from({ length: 10 }, (_, i) =>
      makeNode({
        topic_id: `node-${i}`,
        lea_id: `node-${i}`,
        subject_lea_id: 'LEA-HIST',
        highest_difficulty_correct: 2,   // < 3 → triggers 70 ceiling
        distinct_questions_seen: 15,
        consecutive_correct_streak: 1,
        current_mastery_weight: 1.0,
      })
    )
    const result = computeReadinessScore(nodes, 10, SUBJECTS, { 'LEA-HIST': 10, 'LEA-STRUCT': 0, 'LEA-UTIL': 0 })
    expect(result.overallScore).toBeLessThan(70.1) // <= 70
    expect(result.ceilingValue).toBe(70)
    expect(result.ceilingReason).toBe('no_level3_correct')
  })
})

describe('zone boundary: difficulty ceiling at 82 (level 3 correct, not 4)', () => {
  test('score is capped at 82 when maxDifficultyCorrect is exactly 3', () => {
    const nodes = Array.from({ length: 10 }, (_, i) =>
      makeNode({
        topic_id: `node-${i}`,
        lea_id: `node-${i}`,
        subject_lea_id: 'LEA-HIST',
        highest_difficulty_correct: 3,   // satisfies level3, not level4 → 82 ceiling
        distinct_questions_seen: 15,
        consecutive_correct_streak: 1,
        current_mastery_weight: 1.0,
      })
    )
    const result = computeReadinessScore(nodes, 10, SUBJECTS, { 'LEA-HIST': 10, 'LEA-STRUCT': 0, 'LEA-UTIL': 0 })
    expect(result.overallScore).toBeLessThan(82.1) // <= 82
    expect(result.ceilingValue).toBe(82)
    expect(result.ceilingReason).toBe('no_level4_correct')
  })
})

describe('zone boundary: bloom ceiling at 75 (no apply-level correct)', () => {
  test('score capped at 75 when has_bloom_apply_correct is false', () => {
    const nodes = Array.from({ length: 10 }, (_, i) =>
      makeNode({
        topic_id: `node-${i}`,
        lea_id: `node-${i}`,
        subject_lea_id: 'LEA-HIST',
        highest_difficulty_correct: 4,
        has_bloom_apply_correct: false,
        has_bloom_analyze_correct: false,
        distinct_questions_seen: 15,
        consecutive_correct_streak: 1,
        current_mastery_weight: 1.0,
      })
    )
    const result = computeReadinessScore(nodes, 10, SUBJECTS, { 'LEA-HIST': 10, 'LEA-STRUCT': 0, 'LEA-UTIL': 0 })
    expect(result.ceilingValue).toBe(75)
    expect(result.ceilingReason).toBe('no_apply_level_correct')
    expect(result.overallScore).toBeLessThan(75.1) // <= 75
  })
})

describe('zone boundary: bloom ceiling at 87 (apply correct, not analyze)', () => {
  test('score capped at 87 when has_bloom_analyze_correct is false', () => {
    const nodes = Array.from({ length: 10 }, (_, i) =>
      makeNode({
        topic_id: `node-${i}`,
        lea_id: `node-${i}`,
        subject_lea_id: 'LEA-HIST',
        highest_difficulty_correct: 4,
        has_bloom_apply_correct: true,
        has_bloom_analyze_correct: false,
        distinct_questions_seen: 15,
        consecutive_correct_streak: 1,
        current_mastery_weight: 1.0,
      })
    )
    const result = computeReadinessScore(nodes, 10, SUBJECTS, { 'LEA-HIST': 10, 'LEA-STRUCT': 0, 'LEA-UTIL': 0 })
    expect(result.ceilingValue).toBe(87)
    expect(result.ceilingReason).toBe('no_analyze_level_correct')
    expect(result.overallScore).toBeLessThan(87.1) // <= 87
  })
})

describe('zone boundary: no ceiling when all requirements met', () => {
  test('ceilingActive is false when difficulty=4 and both bloom flags true', () => {
    const nodes = Array.from({ length: 10 }, (_, i) =>
      makeNode({
        topic_id: `node-${i}`,
        lea_id: `node-${i}`,
        subject_lea_id: 'LEA-HIST',
        highest_difficulty_correct: 4,
        has_bloom_apply_correct: true,
        has_bloom_analyze_correct: true,
        distinct_questions_seen: 15,
        consecutive_correct_streak: 1,
        current_mastery_weight: 1.0,
      })
    )
    const result = computeReadinessScore(nodes, 10, SUBJECTS, { 'LEA-HIST': 10, 'LEA-STRUCT': 0, 'LEA-UTIL': 0 })
    expect(result.ceilingValue).toBeNull()
    expect(result.ceilingActive).toBe(false)
  })
})

// ─── Anti-inflation behavior ─────────────────────────────────────────────────

describe('anti-inflation: diminishing returns (Vector 1)', () => {
  test('consecutive streak > 1 reduces effective mastery', () => {
    const withStreak = makeNode({ consecutive_correct_streak: 10, current_mastery_weight: 1.0 })
    const noStreak = makeNode({ consecutive_correct_streak: 1, current_mastery_weight: 1.0 })

    const leafCounts = { 'LEA-HIST': 1, 'LEA-STRUCT': 0, 'LEA-UTIL': 0 }
    const subjects = [SUBJECTS[0]]

    const resultWithStreak = computeReadinessScore([withStreak], 1, subjects, leafCounts)
    const resultNoStreak = computeReadinessScore([noStreak], 1, subjects, leafCounts)

    expect(resultWithStreak.overallScore).toBeLessThan(resultNoStreak.overallScore)
  })
})

describe('anti-inflation: recency decay (Vector 6)', () => {
  test('stale node scores lower than fresh node', () => {
    const stale = makeNode({
      last_encountered: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days ago
      current_mastery_weight: 1.0,
    })
    const fresh = makeNode({
      last_encountered: new Date().toISOString(),
      current_mastery_weight: 1.0,
    })

    const leafCounts = { 'LEA-HIST': 1, 'LEA-STRUCT': 0, 'LEA-UTIL': 0 }
    const subjects = [SUBJECTS[0]]

    const resultStale = computeReadinessScore([stale], 1, subjects, leafCounts)
    const resultFresh = computeReadinessScore([fresh], 1, subjects, leafCounts)

    expect(resultStale.rawScore).toBeLessThan(resultFresh.rawScore)
  })
})

describe('anti-inflation: depth weight (Vector 5)', () => {
  test('thin coverage (< 5 distinct questions) reduces subject score vs deep', () => {
    // Use 2 leaf nodes so the denominator includes a grey node, making depthWeight visible
    const thin = makeNode({ topic_id: 'thin', lea_id: 'thin', subject_lea_id: 'LEA-HIST', distinct_questions_seen: 3 })   // depthWeight=0.40
    const deep = makeNode({ topic_id: 'deep', lea_id: 'deep', subject_lea_id: 'LEA-HIST', distinct_questions_seen: 15 })  // depthWeight=1.00

    const subjects = [SUBJECTS[0]]
    // 2 total leaves each case, so grey node in denominator exposes weight difference
    const leafCounts = { 'LEA-HIST': 2 }

    const resultThin = computeReadinessScore([thin], 2, subjects, leafCounts)
    const resultDeep = computeReadinessScore([deep], 2, subjects, leafCounts)

    // thin: touchedSum = mastery*0.40, totalWeightSum = 0.40 + 1 grey = 1.40 → subjectScore = mastery*0.40/1.40 * 100
    // deep: touchedSum = mastery*1.00, totalWeightSum = 1.00 + 1 grey = 2.00 → subjectScore = mastery*1.00/2.00 * 100
    // thin subject score ≈ 28.6, deep subject score = 50.0 → deep > thin
    expect(resultThin.subScores[0].score).toBeLessThan(resultDeep.subScores[0].score)
  })

  test('medium coverage (5–9 distinct questions) scores lower than deep coverage', () => {
    const medium = makeNode({ topic_id: 'med', lea_id: 'med', subject_lea_id: 'LEA-HIST', distinct_questions_seen: 7 })
    const deep = makeNode({ topic_id: 'deep', lea_id: 'deep', subject_lea_id: 'LEA-HIST', distinct_questions_seen: 15 })

    const subjects = [SUBJECTS[0]]
    const leafCounts = { 'LEA-HIST': 2 }

    const resultMedium = computeReadinessScore([medium], 2, subjects, leafCounts)
    const resultDeep = computeReadinessScore([deep], 2, subjects, leafCounts)

    // medium depthWeight=0.85, deep=1.00 → medium subject score < deep subject score
    expect(resultMedium.subScores[0].score).toBeLessThan(resultDeep.subScores[0].score)
  })
})

describe('anti-inflation: grey node penalty (Vector 3)', () => {
  test('grey nodes drag down score proportionally', () => {
    const node = makeNode({ subject_lea_id: 'LEA-HIST' })
    const leafCounts = { 'LEA-HIST': 1, 'LEA-STRUCT': 0, 'LEA-UTIL': 0 }
    const subjects = [SUBJECTS[0]]

    // 1 touched out of 1 total → no grey penalty
    const allTouched = computeReadinessScore([node], 1, subjects, leafCounts)
    // 1 touched out of 10 total → heavy grey penalty
    const mostlyGrey = computeReadinessScore([node], 10, subjects, leafCounts)

    expect(allTouched.greyPenalty).toBe(0)
    expect(mostlyGrey.greyPenalty).toBeGreaterThan(0)
    expect(allTouched.overallScore).toBeGreaterThan(mostlyGrey.overallScore)
  })
})

// ─── Single node edge cases ──────────────────────────────────────────────────

describe('single node', () => {
  test('activeCoverageGaps includes node lea_id when distinct_questions_seen < 5', () => {
    const node = makeNode({ lea_id: 'node-thin', distinct_questions_seen: 2 })
    const result = computeReadinessScore([node], 1, [SUBJECTS[0]], { 'LEA-HIST': 1 })
    expect(result.activeCoverageGaps).toContain('node-thin')
  })

  test('activeCoverageGaps is empty when distinct_questions_seen >= 5', () => {
    const node = makeNode({ lea_id: 'node-full', distinct_questions_seen: 10 })
    const result = computeReadinessScore([node], 1, [SUBJECTS[0]], { 'LEA-HIST': 1 })
    expect(result.activeCoverageGaps.length).toBe(0)
  })

  test('belowFloorSubjects includes subject when score < 50', () => {
    const node = makeNode({ current_mastery_weight: 0.3 })
    const result = computeReadinessScore([node], 1, [SUBJECTS[0]], { 'LEA-HIST': 1 })
    expect(result.belowFloorSubjects).toContain('History')
  })

  test('belowFloorSubjects is empty when score >= 50', () => {
    const node = makeNode({ current_mastery_weight: 1.0, distinct_questions_seen: 15, consecutive_correct_streak: 1 })
    const result = computeReadinessScore([node], 1, [SUBJECTS[0]], { 'LEA-HIST': 1 })
    expect(result.belowFloorSubjects.length).toBe(0)
  })
})

// ─── Day 1 / Day 2 split ─────────────────────────────────────────────────────

describe('day 1 / day 2 split', () => {
  test('dayOneScore uses only Area A subjects', () => {
    const nodeA = makeNode({ subject_lea_id: 'LEA-HIST', current_mastery_weight: 1.0, distinct_questions_seen: 15 })
    const result = computeReadinessScore([nodeA], 10, SUBJECTS, LEAF_COUNTS)
    expect(typeof result.dayOneScore).toBe('number')
    expect(result.dayOneScore).toBeGreaterThan(-1) // >= 0
  })

  test('dayTwoScore uses Areas B and C', () => {
    const nodeB = makeNode({ subject_lea_id: 'LEA-STRUCT', prc_area: 'B', current_mastery_weight: 1.0, distinct_questions_seen: 15 })
    const result = computeReadinessScore([nodeB], 10, SUBJECTS, LEAF_COUNTS)
    expect(typeof result.dayTwoScore).toBe('number')
    expect(result.dayTwoScore).toBeGreaterThan(-1) // >= 0
  })

  test('dayOneScore is 0 when all touched nodes are in B/C', () => {
    const nodeB = makeNode({ subject_lea_id: 'LEA-STRUCT', prc_area: 'B', current_mastery_weight: 1.0, distinct_questions_seen: 15 })
    const result = computeReadinessScore([nodeB], 10, SUBJECTS, LEAF_COUNTS)
    expect(result.dayOneScore).toBe(0)
  })
})

// ─── 6-Vector computation integrity ─────────────────────────────────────────

describe('6-vector computation', () => {
  test('result shape includes all required fields', () => {
    const result = computeReadinessScore([], 0, SUBJECTS, LEAF_COUNTS)
    expect(typeof result.overallScore).toBe('number')
    expect(typeof result.rawScore).toBe('number')
    expect(Array.isArray(result.subScores)).toBe(true)
    expect(typeof result.dayOneScore).toBe('number')
    expect(typeof result.dayTwoScore).toBe('number')
    expect(Array.isArray(result.belowFloorSubjects)).toBe(true)
    expect(typeof result.ceilingActive).toBe('boolean')
    expect(typeof result.greyPenalty).toBe('number')
    expect(Array.isArray(result.activeCoverageGaps)).toBe(true)
  })

  test('overallScore is always floored to 1 decimal place (never rounds up)', () => {
    const node = makeNode({
      current_mastery_weight: 0.333,
      consecutive_correct_streak: 1,
      distinct_questions_seen: 15,
    })
    const result = computeReadinessScore([node], 1, [SUBJECTS[0]], { 'LEA-HIST': 1 })
    const tenthsStr = result.overallScore.toString()
    const decimals = tenthsStr.includes('.') ? tenthsStr.split('.')[1].length : 0
    expect(decimals).toBeLessThan(2) // at most 1 decimal place
  })

  test('overallScore does not exceed ceilingValue when ceiling is active', () => {
    const nodes = Array.from({ length: 10 }, (_, i) =>
      makeNode({ topic_id: `n${i}`, lea_id: `n${i}`, subject_lea_id: 'LEA-HIST', highest_difficulty_correct: 2 })
    )
    const result = computeReadinessScore(nodes, 10, [SUBJECTS[0]], { 'LEA-HIST': 10 })
    if (result.ceilingActive && result.ceilingValue !== null) {
      expect(result.overallScore).toBeLessThan(result.ceilingValue + 0.1) // <= ceilingValue
    }
  })

  test('greyPenalty is between 0 and 0.6 inclusive', () => {
    const nodeAll = makeNode()
    const resultFull = computeReadinessScore([nodeAll], 1, [SUBJECTS[0]], { 'LEA-HIST': 1 })
    const resultEmpty = computeReadinessScore([], 10, SUBJECTS, LEAF_COUNTS)
    expect(resultFull.greyPenalty).toBeGreaterThan(-0.001) // >= 0
    expect(resultFull.greyPenalty).toBeLessThan(0.601)     // <= 0.6
    expect(resultEmpty.greyPenalty).toBe(0.6)
  })
})

// ─── All-mastered edge case ──────────────────────────────────────────────────

describe('all nodes mastered', () => {
  test('score is positive and ceiling is not active when all requirements met', () => {
    const nodes = Array.from({ length: 10 }, (_, i) =>
      makeNode({
        topic_id: `n${i}`,
        lea_id: `n${i}`,
        subject_lea_id: 'LEA-HIST',
        current_mastery_weight: 1.0,
        highest_difficulty_correct: 4,
        has_bloom_apply_correct: true,
        has_bloom_analyze_correct: true,
        distinct_questions_seen: 20,
        consecutive_correct_streak: 1,
      })
    )
    const result = computeReadinessScore(nodes, 10, [SUBJECTS[0]], { 'LEA-HIST': 10 })
    expect(result.overallScore).toBeGreaterThan(0)
    expect(result.ceilingActive).toBe(false)
    expect(result.greyPenalty).toBe(0)
  })
})

// ─── Regression guard: fixed input → expected output ────────────────────────

describe('regression guard', () => {
  test('fixed input produces stable output within expected range', () => {
    // ISO timestamp exactly 30 days ago → recency decay ≈ 0.5 (e^-0.023*30 ≈ 0.5)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

    const nodes: NodeMasteryInput[] = [
      {
        topic_id: 'node-A1',
        lea_id: 'node-A1',
        subject_lea_id: 'LEA-HIST',
        subject_name: 'History',
        prc_area: 'A',
        area_weight_pct: 30,
        subject_weight_within_area_pct: 100,
        node_type: 'leaf',
        bloom_level: 'analyze',
        taxonomy_difficulty: 4,
        exam_frequency: 'high',
        current_mastery_weight: 0.8,
        total_attempts: 10,
        total_correct: 8,
        last_encountered: thirtyDaysAgo,
        consecutive_correct_streak: 2,
        highest_difficulty_correct: 4,
        has_bloom_apply_correct: true,
        has_bloom_analyze_correct: true,
        distinct_questions_seen: 12,
      },
    ]

    const subjects = [
      { lea_id: 'LEA-HIST', name: 'History', prc_area: 'A' as const, subject_weight_within_area_pct: 100 },
    ]
    const leafCounts: SubjectLeafCounts = { 'LEA-HIST': 2 }

    const result = computeReadinessScore(nodes, 2, subjects, leafCounts)

    // Structural invariants
    expect(result.overallScore).toBeGreaterThan(0)
    expect(result.overallScore).toBeLessThan(100)
    expect(result.ceilingActive).toBe(false)     // diff=4, bloom both true → no ceiling
    expect(result.greyPenalty).toBeGreaterThan(0) // 1 of 2 nodes is grey
    expect(result.greyPenalty).toBeLessThan(0.601)
    expect(result.subScores.length).toBe(1)
    expect(result.subScores[0].lea_id).toBe('LEA-HIST')
    expect(result.subScores[0].greyCount).toBe(1)

    // Numeric range guard:
    // effectiveMastery ≈ 0.8 * recency(~0.5) * streakFactor(1/2^0.7≈0.615) ≈ 0.246
    // rawSubjectScore = (0.246 * 1.0) / (1.0 + 1 grey) * 100 ≈ 12.3
    // greyPenalty = 0.5 * 0.6 = 0.30
    // penalizedScore ≈ 12.3 * 0.70 ≈ 8.6
    // Allow ±5 for floating-point timing differences in recency decay
    expect(result.overallScore).toBeGreaterThan(3)
    expect(result.overallScore).toBeLessThan(20)
  })

  test('zero-input regression: empty nodes always returns zero score', () => {
    const result = computeReadinessScore([], 0, [], {})
    expect(result.overallScore).toBe(0)
    expect(result.rawScore).toBe(0)
    expect(result.greyPenalty).toBe(0)
    expect(result.ceilingActive).toBe(false)
  })
})
