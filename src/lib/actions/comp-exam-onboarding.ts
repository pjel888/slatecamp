'use server'

import { createClient, getUser } from '@/lib/supabase/server'

// ── Types ─────────────────────────────────────────────────────────────────────

export type LeaSubjectKey =
  | 'LEA-HIST'
  | 'LEA-THEO'
  | 'LEA-PLAN'
  | 'LEA-PRAC'
  | 'LEA-STRU'
  | 'LEA-MATL'
  | 'LEA-UTIL'

export type CompExamScores = Record<LeaSubjectKey, number>

export interface SaveCompExamResult {
  success: boolean
  error?: string
  heatmapSeeds?: HeatmapSeed[]
}

export interface HeatmapSeed {
  subjectKey: LeaSubjectKey
  subjectName: string
  score: number
  tier: 'red' | 'amber' | 'green'
  masteryWeight: number
  leafNodeIds: string[]
}

// ── Constants ─────────────────────────────────────────────────────────────────

const SCORE_TO_TIER = (score: number): { tier: 'red' | 'amber' | 'green'; masteryWeight: number } => {
  if (score < 50) return { tier: 'red', masteryWeight: 0.1 }
  if (score < 70) return { tier: 'amber', masteryWeight: 0.5 }
  return { tier: 'green', masteryWeight: 0.8 }
}

// ── Action ────────────────────────────────────────────────────────────────────

export const saveCompExamScores = async (
  scores: CompExamScores,
  examDate: string | null,
): Promise<SaveCompExamResult> => {
  const supabase = await createClient()
  const { data: { user } } = await getUser()

  if (!user) return { success: false, error: 'Not authenticated' }

  // 1. Fetch LEA subject nodes for this discipline — match by lea_id
  const leaIds = Object.keys(scores) as LeaSubjectKey[]

  const { data: subjectNodes, error: subjectErr } = await supabase
    .from('taxonomy_tree')
    .select('node_id, name, lea_id')
    .in('lea_id', leaIds)
    .eq('level', 1)
    .is('deprecated_at', null)

  if (subjectErr || !subjectNodes?.length) {
    return { success: false, error: 'Could not load subject taxonomy' }
  }

  // 2. Fetch all leaf nodes for those subjects (level 3, is_leaf = true)
  //    We go through level 2 (topics) then get their children, OR we can filter
  //    by discipline + is_leaf + parent walking. Simplest: get all leaf nodes
  //    whose subject_area matches each subject's lea_id prefix.
  const subjectNodeIds = subjectNodes.map(n => n.node_id)

  // Get level-2 topic nodes under each subject
  const { data: topicNodes, error: topicErr } = await supabase
    .from('taxonomy_tree')
    .select('node_id, parent_id, lea_id')
    .in('parent_id', subjectNodeIds)
    .eq('level', 2)
    .is('deprecated_at', null)

  if (topicErr) {
    return { success: false, error: 'Could not load topic taxonomy' }
  }

  const topicNodeIds = (topicNodes ?? []).map(n => n.node_id)

  // Get leaf nodes (level 3) under those topics
  const { data: leafNodes, error: leafErr } = await supabase
    .from('taxonomy_tree')
    .select('node_id, parent_id')
    .in('parent_id', topicNodeIds)
    .eq('is_leaf', true)
    .eq('is_cross_ref_only', false)
    .is('deprecated_at', null)

  if (leafErr) {
    return { success: false, error: 'Could not load leaf taxonomy' }
  }

  // 3. Build subject → topic → leaf mapping
  const topicToSubject = new Map<string, string>()
  for (const topic of (topicNodes ?? [])) {
    if (topic.parent_id) topicToSubject.set(topic.node_id, topic.parent_id)
  }

  const leafsBySubject = new Map<string, string[]>()
  for (const leaf of (leafNodes ?? [])) {
    const subjectId = topicToSubject.get(leaf.parent_id ?? '')
    if (!subjectId) continue
    const existing = leafsBySubject.get(subjectId) ?? []
    existing.push(leaf.node_id)
    leafsBySubject.set(subjectId, existing)
  }

  // 4. Build heatmap seeds and collect mastery upsert rows
  const heatmapSeeds: HeatmapSeed[] = []
  const masteryRows: {
    user_id: string
    topic_id: string
    current_mastery_weight: number
    last_encountered: string
    updated_at: string
  }[] = []

  const now = new Date().toISOString()

  for (const subjectNode of subjectNodes) {
    const leaKey = subjectNode.lea_id as LeaSubjectKey
    const score = scores[leaKey]
    if (score === undefined) continue

    const { tier, masteryWeight } = SCORE_TO_TIER(score)
    const leafIds = leafsBySubject.get(subjectNode.node_id) ?? []

    heatmapSeeds.push({
      subjectKey: leaKey,
      subjectName: subjectNode.name,
      score,
      tier,
      masteryWeight,
      leafNodeIds: leafIds,
    })

    for (const leafId of leafIds) {
      masteryRows.push({
        user_id: user.id,
        topic_id: leafId,
        current_mastery_weight: masteryWeight,
        last_encountered: now,
        updated_at: now,
      })
    }
  }

  // 5. Persist: profile scores + mastery upserts (parallel)
  const profileUpdate: Record<string, unknown> = {
    comp_exam_scores: scores,
    updated_at: now,
  }
  if (examDate) profileUpdate.comp_exam_date = examDate

  const ops: Promise<{ error: unknown }>[] = [
    supabase
      .from('profiles')
      .update(profileUpdate)
      .eq('id', user.id)
      .then(r => ({ error: r.error })),
  ]

  // Batch mastery upserts in chunks of 500 to stay within Supabase limits
  const CHUNK = 500
  for (let i = 0; i < masteryRows.length; i += CHUNK) {
    const chunk = masteryRows.slice(i, i + CHUNK)
    ops.push(
      supabase
        .from('user_node_mastery')
        .upsert(chunk, { onConflict: 'user_id,topic_id', ignoreDuplicates: false })
        .then(r => ({ error: r.error })),
    )
  }

  const results = await Promise.all(ops)
  const failed = results.find(r => r.error)
  if (failed) {
    console.error('comp-exam-onboarding save error:', failed.error)
    return { success: false, error: 'Failed to save data. Please try again.' }
  }

  return { success: true, heatmapSeeds }
}
