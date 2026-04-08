'use server'

import { createClient } from '@/lib/supabase/server'
import {
  computeReadinessScore,
  type NodeMasteryInput,
  type SubjectLeafCounts,
} from '@/lib/readiness-score'
import { computeScoreVelocity } from '@/lib/readiness/velocity'

/**
 * Recompute the anti-inflation readiness score and write it to user_global_stats.
 *
 * Call this BEFORE setting quiz_sessions.status = 'completed' so that when
 * the snapshot trigger fires, both global_readiness_score and readiness_sub_scores
 * contain accurate, freshly-computed values.
 */
export const recomputeAndSaveReadinessScore = async (userId: string): Promise<void> => {
  const supabase = await createClient()

  // 1. Get the discipline for this user
  const { data: statsData } = await supabase
    .from('user_global_stats')
    .select('current_discipline_id')
    .eq('user_id', userId)
    .single()

  if (!statsData?.current_discipline_id) return

  const disciplineId = statsData.current_discipline_id

  // 2, 3, 4. Fetch tree data in parallel
  const [totalLeafCountRes, subjectsRes, treeNodesRes] = await Promise.all([
    supabase
      .from('taxonomy_tree')
      .select('node_id', { count: 'exact', head: true })
      .eq('discipline_id', disciplineId)
      .eq('is_leaf', true)
      .eq('is_cross_ref_only', false)
      .is('deprecated_at', null)
      .not('lea_id', 'is', null),
    supabase
      .from('taxonomy_tree')
      .select('node_id, lea_id, name, prc_area, area_weight_pct, subject_weight_within_area_pct')
      .eq('discipline_id', disciplineId)
      .eq('level', 1)
      .eq('is_cross_ref_only', false)
      .is('deprecated_at', null)
      .not('lea_id', 'is', null),
    supabase
      .from('taxonomy_tree')
      .select('node_id, parent_id, level')
      .eq('discipline_id', disciplineId)
      .eq('is_cross_ref_only', false)
      .is('deprecated_at', null)
      .not('lea_id', 'is', null),
  ])

  const totalLeafCount = totalLeafCountRes.count
  const subjects = subjectsRes.data
  const allTreeNodes = (treeNodesRes.data ?? []) as Array<{
    node_id: string; parent_id: string | null; level: number
  }>

  if (!totalLeafCount || !subjects?.length) return

  // Build a map: node_id → Level 1 ancestor
  const nodeParentMap = new Map<string, string | null>()
  const nodeToSubject = new Map<string, string>()

  for (const n of allTreeNodes) {
    nodeParentMap.set(n.node_id, n.parent_id)
    if (n.level === 1) nodeToSubject.set(n.node_id, n.node_id)
  }

  const resolveSubjectAncestor = (nodeId: string): string | null => {
    let cur: string | undefined = nodeId
    let depth = 0
    while (cur && depth < 10) {
      if (nodeToSubject.has(cur)) return nodeToSubject.get(cur)!
      const parent = nodeParentMap.get(cur)
      if (!parent) return null
      cur = parent
      depth++
    }
    return null
  }

  for (const n of allTreeNodes) {
    if (!nodeToSubject.has(n.node_id)) {
      const ancestor = resolveSubjectAncestor(n.node_id)
      if (ancestor) nodeToSubject.set(n.node_id, ancestor)
    }
  }

  // Count leaf nodes per subject (using lea_id of the subject)
  const subjectNodeIdToAleId = new Map<string, string>()
  for (const s of subjects) {
    if (s.lea_id) subjectNodeIdToAleId.set(s.node_id, s.lea_id)
  }

  const subjectLeafCounts: SubjectLeafCounts = {}
  for (const s of subjects) {
    if (s.lea_id) subjectLeafCounts[s.lea_id] = 0
  }

  // Count leaves (is_leaf nodes) per subject
  const { data: leafNodes } = await supabase
    .from('taxonomy_tree')
    .select('node_id')
    .eq('discipline_id', disciplineId)
    .eq('is_leaf', true)
    .eq('is_cross_ref_only', false)
    .is('deprecated_at', null)
    .not('lea_id', 'is', null)

  for (const leaf of (leafNodes ?? [])) {
    const subjectId = nodeToSubject.get(leaf.node_id)
    if (subjectId) {
      const leaId = subjectNodeIdToAleId.get(subjectId)
      if (leaId && subjectLeafCounts[leaId] !== undefined) {
        subjectLeafCounts[leaId]++
      }
    }
  }

  // 5. Get all touched nodes with mastery data
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
      distinct_questions_seen
    `)
    .eq('user_id', userId)

  if (!masteryRows?.length) {
    // No mastery yet — score stays at 0
    await supabase
      .from('user_global_stats')
      .update({
        global_readiness_score: 0,
        readiness_sub_scores: {},
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
    return
  }

  // 6. Fetch taxonomy metadata for all touched nodes in one query
  const touchedTopicIds = masteryRows.map(r => r.topic_id)
  const { data: taxonomyMeta } = await supabase
    .from('taxonomy_tree')
    .select('node_id, lea_id, bloom_level, difficulty, node_type, exam_frequency, is_cross_ref_only, deprecated_at')
    .in('node_id', touchedTopicIds)

  const taxMap = new Map<string, {
    lea_id: string | null
    bloom_level: string | null
    difficulty: number | null
    node_type: string | null
    exam_frequency: string | null
    is_cross_ref_only: boolean
    deprecated_at: string | null
  }>()
  for (const t of (taxonomyMeta ?? [])) {
    taxMap.set(t.node_id, t)
  }

  // 7. Build NodeMasteryInput array
  const nodeInputs: NodeMasteryInput[] = masteryRows
    .filter(row => {
      const tt = taxMap.get(row.topic_id)
      return tt && !tt.is_cross_ref_only && !tt.deprecated_at
    })
    .map(row => {
      const tt = taxMap.get(row.topic_id)!
      const subjectId = nodeToSubject.get(row.topic_id)
      const subjectNode = subjects.find(s => s.node_id === subjectId)

      return {
        topic_id: row.topic_id,
        lea_id: tt.lea_id,
        subject_lea_id: subjectNode?.lea_id ?? 'UNKNOWN',
        subject_name: subjectNode?.name ?? 'Unknown',
        prc_area: (subjectNode?.prc_area ?? 'A') as 'A' | 'B' | 'C',
        area_weight_pct: subjectNode?.area_weight_pct ?? 30,
        subject_weight_within_area_pct: subjectNode?.subject_weight_within_area_pct ?? 25,
        node_type: tt.node_type,
        bloom_level: tt.bloom_level,
        taxonomy_difficulty: tt.difficulty,
        exam_frequency: tt.exam_frequency as NodeMasteryInput['exam_frequency'],
        current_mastery_weight: row.current_mastery_weight,
        total_attempts: row.total_attempts,
        total_correct: row.total_correct,
        last_encountered: row.last_encountered,
        consecutive_correct_streak: row.consecutive_correct_streak ?? 0,
        highest_difficulty_correct: row.highest_difficulty_correct ?? 0,
        has_bloom_apply_correct: row.has_bloom_apply_correct ?? false,
        has_bloom_analyze_correct: row.has_bloom_analyze_correct ?? false,
        distinct_questions_seen: row.distinct_questions_seen ?? 0,
      } satisfies NodeMasteryInput
    })

  // 8. Run the computation
  const result = computeReadinessScore(
    nodeInputs,
    totalLeafCount,
    subjects.map(s => ({
      lea_id: s.lea_id!,
      name: s.name,
      prc_area: s.prc_area as 'A' | 'B' | 'C',
      subject_weight_within_area_pct: s.subject_weight_within_area_pct ?? 25,
    })),
    subjectLeafCounts,
  )

  // 9. Build sub_scores JSONB for DB storage
  const subScoresForDB: Record<string, any> = {
    ...Object.fromEntries(result.subScores.map(s => [s.lea_id, {
      score: s.score,
      nodeCount: s.nodeCount,
      touchedCount: s.touchedCount,
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
    },
  }

  // 9b. Project Laws & Codes sub-score from cross-referenced nodes.
  // Laws has is_cross_ref_only=true so it's excluded from the global score,
  // but we include it in sub_scores for display purposes.
  const { data: crossRefs } = await supabase
    .from('taxonomy_cross_references')
    .select('target_node_id')
    .eq('relationship_type', 'law_applies_to')

  if (crossRefs && crossRefs.length > 0) {
    const targetSubtopicIds = [...new Set(crossRefs.map(cr => cr.target_node_id))]
    const { data: targetLeaves } = await supabase
      .from('taxonomy_tree')
      .select('node_id')
      .in('parent_id', targetSubtopicIds)
      .eq('is_leaf', true)
      .eq('is_cross_ref_only', false)
      .is('deprecated_at', null)

    if (targetLeaves && targetLeaves.length > 0) {
      const targetLeafIds = new Set(targetLeaves.map(l => l.node_id))
      // Filter mastery nodes that belong to cross-ref targets
      const lawsNodes = nodeInputs.filter(n => targetLeafIds.has(n.topic_id))
      const touchedCount = lawsNodes.length
      const nodeCount = targetLeafIds.size

      let projectedScore = 0
      if (touchedCount > 0) {
        const touchedSum = lawsNodes.reduce((sum, n) => sum + n.current_mastery_weight, 0)
        projectedScore = Math.round(((touchedSum / nodeCount) * 100) * 10) / 10
      }

      subScoresForDB['LEA-LAWS'] = {
        score: projectedScore,
        nodeCount,
        touchedCount,
        greyCount: nodeCount - touchedCount,
        thinCoverageCount: lawsNodes.filter(n => n.distinct_questions_seen < 5).length,
        belowFloor: projectedScore < 50,
        projected: true, // flag indicating this is a cross-ref projection
      }
    }
  }

  // 10. Write back to user_global_stats
  await supabase
    .from('user_global_stats')
    .update({
      global_readiness_score: result.overallScore,
      readiness_sub_scores: subScoresForDB,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)

  // 11. Score Velocity (non-critical — fire-and-forget)
  try {
    const { data: recentSnapshots } = await supabase
      .from('readiness_score_snapshots')
      .select('score, computed_at')
      .eq('user_id', userId)
      .order('computed_at', { ascending: false })
      .limit(30)

    if (recentSnapshots && recentSnapshots.length >= 2) {
      const { velocity } = computeScoreVelocity(
        recentSnapshots as Array<{ score: number; computed_at: string }>,
      )
      await supabase
        .from('user_global_stats')
        .update({
          score_velocity_7d: velocity,
          score_velocity_updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
    }
  } catch {
    // Velocity is non-critical — never block score computation
  }
}
