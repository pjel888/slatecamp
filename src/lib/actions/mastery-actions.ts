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
    node_id: string; parent_id: string | null; level: number; name: string; subject_area: string
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
      }
    })

    const allAttempts = topicRings.reduce((sum, t) => sum + t.questionsAnswered, 0)
    const answeredTopics = topicRings.filter(t => t.questionsAnswered > 0)
    const avgMastery = answeredTopics.length > 0
      ? Math.round(answeredTopics.reduce((sum, t) => sum + t.mastery, 0) / answeredTopics.length)
      : 0

    return {
      subject: subject.name,
      shortLabel: shortLabel(subject.name),
      mastery: avgMastery,
      questionsAnswered: allAttempts,
      topics: topicRings,
    }
  })

  return subjectMastery
}

// ── Subject floor alerts (Task 0.3) ───────────────────────────────────────
// ALE requires minimum 50% per subject. Alert when any subject is below.

export const buildSubjectFloorAlerts = (subjectMastery: SubjectMastery[]): SubjectFloorAlert[] => {
  const SUBJECT_FLOOR_PCT = 50 // from disciplines.subject_floor_pct default
  return subjectMastery
    .filter(s => s.questionsAnswered > 0 && s.mastery < SUBJECT_FLOOR_PCT)
    .map(s => ({
      subject: s.subject,
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
    last_encountered: string
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
      .not('ale_id', 'is', null)
    totalLeaves = count ?? 0
  }

  const masteryEntries = (masteryCountData ?? []) as Array<{ current_mastery_weight: number }>
  const topicsWithAnyProgress = masteryEntries.filter(m => m.current_mastery_weight > 0).length
  return totalLeaves > 0 ? Math.round((topicsWithAnyProgress / totalLeaves) * 100) : 0
}
