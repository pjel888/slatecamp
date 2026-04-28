
import { unstable_cache } from 'next/cache'
import { getUser, createServiceClient } from '@/lib/supabase/server'
import { getCachedTaxonomyTreeByDiscipline } from './cached-queries'
import { getDashboardTag, getReadinessScoreTag, getUserMasteryTag } from './cache-tags'
import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  FocusAreaItem,
  SubjectMastery,
  SubjectFloorAlert,
  TopicRing,
} from '@/types/dashboard'
import { shortLabel, getMasteryLabel } from './dashboard-helpers'

// ── Subject mastery (radial heatmap + progress bars) ────────────────────────

export const buildSubjectMastery = (
  subjectAreasData: any[] | null,
  subjectMasteryData: any[] | null,
): SubjectMastery[] => {
  const taxonomyRows = (subjectAreasData ?? []) as Array<{
    node_id: string; parent_id: string | null; level: number; name: string; subject_area: string; lea_id: string | null
  }>
  const masteryRows = (subjectMasteryData ?? []) as Array<{
    topic_id: string; current_mastery_weight: number; total_attempts: number
  }>

  // Build mastery lookup: topic_id → { weight, attempts }
  const masteryMap = new Map<string, { weight: number; attempts: number }>()
  for (const m of masteryRows) {
    masteryMap.set(m.topic_id, { weight: m.current_mastery_weight, attempts: m.total_attempts })
  }

  // Group taxonomy: level 1 = subjects, level 2 = topics (rings), level 3 = leaves
  const level1 = taxonomyRows.filter(n => n.level === 1).sort((a, b) => a.name.localeCompare(b.name))
  const level2 = taxonomyRows.filter(n => n.level === 2)
  const level3 = taxonomyRows.filter(n => n.level === 3)

  // Map level 3 leaves to their level 2 parent for mastery aggregation
  const leavesByParent = new Map<string, typeof level3>()
  for (const leaf of level3) {
    const existing = leavesByParent.get(leaf.parent_id!) ?? []
    existing.push(leaf)
    leavesByParent.set(leaf.parent_id!, existing)
  }

  const subjectMastery: SubjectMastery[] = level1.map(subject => {
    const topics = level2.filter(t => t.parent_id === subject.node_id)

    const topicRings: TopicRing[] = topics.map(topic => {
      const leaves = leavesByParent.get(topic.node_id) ?? []
      let totalWeight = 0, totalAttempts = 0, count = 0
      for (const leaf of leaves) {
        const m = masteryMap.get(leaf.node_id)
        if (m) {
          totalWeight += m.weight
          totalAttempts += m.attempts
          count++
        }
      }
      return {
        topicName: topic.name,
        mastery: count > 0 ? Math.round((totalWeight / count) * 100) : 0,
        questionsAnswered: totalAttempts,
        nodesEncountered: count,
      }
    })

    const allAttempts = topicRings.reduce((sum, t) => sum + t.questionsAnswered, 0)
    const totalNodesEncountered = topicRings.reduce((sum, t) => sum + (t.nodesEncountered || 0), 0)
    const answeredTopics = topicRings.filter(t => t.questionsAnswered > 0)
    const avgMastery = answeredTopics.length > 0
      ? Math.round(answeredTopics.reduce((sum, t) => sum + t.mastery, 0) / answeredTopics.length)
      : 0

    return {
      subject: subject.name,
      shortLabel: shortLabel(subject.name),
      leaId: subject.lea_id,
      mastery: avgMastery,
      questionsAnswered: allAttempts,
      nodesEncountered: totalNodesEncountered,
      topics: topicRings,
    }
  })

  return subjectMastery
}

/**
 * Server action to fetch subject mastery data for the current user.
 */
export const getSubjectMasteryData = async () => {
  const { data: { user } } = await getUser()
  if (!user) return []

  return unstable_cache(
    async () => {
      const supabase = await createServiceClient()
      const [globalStatsResult, subjectMasteryResult, projectedLaws] = await Promise.all([
        supabase
          .from('user_global_stats')
          .select('current_discipline_id')
          .eq('user_id', user.id)
          .maybeSingle(),
        supabase
          .from('user_node_mastery')
          .select('topic_id, current_mastery_weight, total_attempts')
          .eq('user_id', user.id),
        buildProjectedLawsMastery(supabase, user.id),
      ])

      const subjectAreas =
        globalStatsResult.data?.current_discipline_id
          ? await getCachedTaxonomyTreeByDiscipline(globalStatsResult.data.current_discipline_id)
          : []

      const subjectMastery = buildSubjectMastery(subjectAreas, subjectMasteryResult.data)

      if (projectedLaws) subjectMastery.push(projectedLaws)

      return subjectMastery
    },
    ['subject-mastery', user.id],
    {
      revalidate: false,
      tags: [
        getDashboardTag(user.id),
        getUserMasteryTag(user.id),
        getReadinessScoreTag(user.id),
      ],
    },
  )()
}

// ── Subject floor alerts (Task 0.3) ───────────────────────────────────────
// LEA requires minimum 50% per subject. Alert when any subject is below.

export const buildSubjectFloorAlerts = (subjectMastery: SubjectMastery[]): SubjectFloorAlert[] => {
  const SUBJECT_FLOOR_PCT = 50 // from disciplines.subject_floor_pct default
  return subjectMastery
    .filter(s => s.questionsAnswered > 0 && s.mastery < SUBJECT_FLOOR_PCT)
    .map(s => ({
      subject: s.subject,
      leaId: s.leaId,
      mastery: s.mastery,
      floorPct: SUBJECT_FLOOR_PCT,
      gap: SUBJECT_FLOOR_PCT - s.mastery,
    }))
    .sort((a, b) => b.gap - a.gap)
}

// ── Focus areas ─────────────────────────────────────────────────────────────

export const buildFocusAreas = (focusTopicsData: any[] | null): FocusAreaItem[] => {
  const focusRaw = (focusTopicsData ?? []) as Array<{
    topic_id: string
    current_mastery_weight: number
    taxonomy_tree: { name: string; subject_area: string } | null
  }>

  return focusRaw
    .filter(r => r.current_mastery_weight < 0.76)
    .slice(0, 4)
    .map(row => ({
      topicId: row.topic_id,
      topicName: row.taxonomy_tree?.name ?? 'Unknown Topic',
      masteryWeight: row.current_mastery_weight,
      masteryLabel: getMasteryLabel(row.current_mastery_weight),
    }))
}

// ── Syllabus coverage ───────────────────────────────────────────────────────

/** Async wrapper for coverage (used by other server actions) */
export const buildSyllabusCoverage = async (
  supabase: SupabaseClient,
  disciplineId: string | null | undefined,
  masteryCountData: any[] | null,
): Promise<number> => {
  let totalLeaves = 0
  if (disciplineId) {
    const { count } = await supabase
      .from('taxonomy_tree')
      .select('node_id', { count: 'exact', head: true })
      .eq('discipline_id', disciplineId)
      .eq('is_leaf', true)
      .eq('is_cross_ref_only', false)
      .is('deprecated_at', null)
      .not('lea_id', 'is', null)
    totalLeaves = count ?? 0
  }
  return transformSyllabusCoverage(totalLeaves, masteryCountData)
}

export const transformSyllabusCoverage = (
  totalLeaves: number,
  masteryCountData: any[] | null,
): number => {
  const masteryEntries = (masteryCountData ?? []) as Array<{ current_mastery_weight: number }>
  const topicsWithAnyProgress = masteryEntries.filter(m => m.current_mastery_weight > 0).length
  return totalLeaves > 0 ? Math.round((topicsWithAnyProgress / totalLeaves) * 100) : 0
}

// ── Projected mastery for cross-referenced subjects (Laws & Codes) ────────

/** Async wrapper for laws mastery (used by other server actions) */
export const buildProjectedLawsMastery = async (
  supabase: SupabaseClient,
  userId: string,
): Promise<SubjectMastery | null> => {
  // 1. Get Laws & Codes subject node
  const { data: lawsSubject } = await supabase
    .from('taxonomy_tree')
    .select('node_id, name, lea_id')
    .eq('lea_id', 'LEA-LAWS')
    .single()

  if (!lawsSubject) return null

  // 2. Get Laws subtopics (level 2)
  const { data: lawsSubtopics } = await supabase
    .from('taxonomy_tree')
    .select('node_id, name')
    .eq('parent_id', lawsSubject.node_id)
    .eq('level', 2)
    .is('deprecated_at', null)
    .order('name')

  if (!lawsSubtopics?.length) return null

  // 3. Get all cross-references from Laws subtopics
  const lawsSubtopicIds = lawsSubtopics.map(s => s.node_id)
  const { data: crossRefs } = await supabase
    .from('taxonomy_cross_references')
    .select('source_node_id, target_node_id')
    .in('source_node_id', lawsSubtopicIds)

  if (!crossRefs?.length) return null

  // 4. Get all target subtopics' leaf children
  const allTargetIds = [...new Set(crossRefs.map(cr => cr.target_node_id))]
  const { data: targetLeaves } = await supabase
    .from('taxonomy_tree')
    .select('node_id, parent_id')
    .in('parent_id', allTargetIds)
    .eq('is_leaf', true)
    .eq('is_cross_ref_only', false)
    .is('deprecated_at', null)

  if (!targetLeaves?.length) return null

  // 5. Get mastery for those leaves
  const leafIds = targetLeaves.map(l => l.node_id)
  const { data: masteryRows } = await supabase
    .from('user_node_mastery')
    .select('topic_id, current_mastery_weight, total_attempts')
    .eq('user_id', userId)
    .in('topic_id', leafIds)

  return transformProjectedLawsMastery(lawsSubject, lawsSubtopics, crossRefs, targetLeaves, masteryRows)
}

export const transformProjectedLawsMastery = (
  lawsSubject: { node_id: string; name: string; lea_id: string | null } | null,
  lawsSubtopics: Array<{ node_id: string; name: string }> | null,
  crossRefs: Array<{ source_node_id: string; target_node_id: string }> | null,
  targetLeaves: Array<{ node_id: string; parent_id: string }> | null,
  masteryRows: Array<{ topic_id: string; current_mastery_weight: number; total_attempts: number }> | null,
): SubjectMastery | null => {
  if (!lawsSubject || !lawsSubtopics?.length || !crossRefs?.length || !targetLeaves?.length) return null

  // 1. Mastery lookup
  const masteryMap = new Map<string, { weight: number; attempts: number }>()
  for (const m of (masteryRows ?? [])) {
    masteryMap.set(m.topic_id, { weight: m.current_mastery_weight, attempts: m.total_attempts })
  }

  // 2. Map targets
  const targetsBySource = new Map<string, string[]>()
  for (const cr of crossRefs) {
    const existing = targetsBySource.get(cr.source_node_id) ?? []
    existing.push(cr.target_node_id)
    targetsBySource.set(cr.source_node_id, existing)
  }

  // 3. Map leaves
  const leavesByTargetSubtopic = new Map<string, typeof targetLeaves>()
  for (const leaf of targetLeaves) {
    const existing = leavesByTargetSubtopic.get(leaf.parent_id!) ?? []
    existing.push(leaf)
    leavesByTargetSubtopic.set(leaf.parent_id!, existing)
  }

  // 4. Build topic rings
  const topicRings: TopicRing[] = lawsSubtopics.map(lawsSubtopic => {
    const targets = targetsBySource.get(lawsSubtopic.node_id) ?? []
    let totalWeight = 0, totalAttempts = 0, count = 0

    for (const targetId of targets) {
      const leaves = leavesByTargetSubtopic.get(targetId) ?? []
      for (const leaf of leaves) {
        const m = masteryMap.get(leaf.node_id)
        if (m) {
          totalWeight += m.weight
          totalAttempts += m.attempts
          count++
        }
      }
    }

    return {
      topicName: lawsSubtopic.name,
      mastery: count > 0 ? Math.round((totalWeight / count) * 100) : 0,
      questionsAnswered: totalAttempts,
      nodesEncountered: count,
    }
  })

  const allAttempts = topicRings.reduce((sum, t) => sum + t.questionsAnswered, 0)
  const totalNodesEncountered = topicRings.reduce((sum, t) => sum + (t.nodesEncountered || 0), 0)
  const answeredTopics = topicRings.filter(t => t.questionsAnswered > 0)
  const avgMastery = answeredTopics.length > 0
    ? Math.round(answeredTopics.reduce((sum, t) => sum + t.mastery, 0) / answeredTopics.length)
    : 0

  return {
    subject: lawsSubject.name,
    shortLabel: shortLabel(lawsSubject.name),
    leaId: lawsSubject.lea_id ?? null,
    mastery: avgMastery,
    questionsAnswered: allAttempts,
    nodesEncountered: totalNodesEncountered,
    topics: topicRings,
  }
}
