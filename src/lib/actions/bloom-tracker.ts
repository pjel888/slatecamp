'use server'

import { createClient, getUser } from '@/lib/supabase/server'

// ── Types ─────────────────────────────────────────────────────────────────────

export type BloomLevel = 'remember' | 'understand' | 'apply' | 'analyze'

export interface BloomLevelStat {
  bloom: BloomLevel
  accuracy: number  // 0-100
  attempts: number
}

export interface BloomBreakdown {
  subject: string
  subjectId: string
  levels: BloomLevelStat[]
}

// ── Server action ─────────────────────────────────────────────────────────────

export const getBloomBreakdown = async (userId?: string): Promise<BloomBreakdown[]> => {
  const supabase = await createClient()

  // Resolve userId — caller may pass it, or we read from session
  let uid = userId
  if (!uid) {
    const { data: { user } } = await getUser()
    if (!user) return []
    uid = user.id
  }

  // Step 1: fetch user_interactions joined with taxonomy_tree node (via topic_id)
  // topic_id on user_interactions points to a taxonomy_tree leaf/subtopic node.
  // We need: that node's bloom_level, its parent_id (topic level), and the
  // grandparent (subject level, level=1) name.
  // We fetch taxonomy nodes in a separate query and build lookups in JS —
  // matching the codebase's JS-aggregation pattern (see mastery-actions.ts).

  const [interactionsResult, taxonomyResult] = await Promise.all([
    supabase
      .from('user_interactions')
      .select('question_id, topic_id, is_correct')
      .eq('user_id', uid),

    supabase
      .from('taxonomy_tree')
      .select('node_id, parent_id, level, name, bloom_level, is_cross_ref_only, deprecated_at')
      .is('deprecated_at', null)
      .eq('is_cross_ref_only', false),
  ])

  if (interactionsResult.error || taxonomyResult.error) {
    if (interactionsResult.error) {
      console.error('[bloom-tracker] interactions query failed:', interactionsResult.error)
    }
    if (taxonomyResult.error) {
      console.error('[bloom-tracker] taxonomy query failed:', taxonomyResult.error)
    }
    return []
  }

  const interactions = (interactionsResult.data ?? []) as Array<{
    question_id: string
    topic_id: string | null
    is_correct: boolean
  }>

  const taxonomyNodes = (taxonomyResult.data ?? []) as Array<{
    node_id: string
    parent_id: string | null
    level: number
    name: string
    bloom_level: BloomLevel | null
    is_cross_ref_only: boolean
    deprecated_at: string | null
  }>

  // Build lookups
  const nodeMap = new Map<string, typeof taxonomyNodes[number]>()
  for (const node of taxonomyNodes) {
    nodeMap.set(node.node_id, node)
  }

  // Subject nodes (level 1)
  const subjects = taxonomyNodes.filter(n => n.level === 1)

  // For each interaction's topic_id, walk up to find the subject (level 1)
  // and use the bloom_level from the topic node itself.
  // Aggregation key: subjectId + bloom_level → { correct, total }
  const aggMap = new Map<string, { correct: number; total: number }>()

  for (const interaction of interactions) {
    if (!interaction.topic_id) continue

    const topicNode = nodeMap.get(interaction.topic_id)
    if (!topicNode) continue
    if (!topicNode.bloom_level) continue

    // Walk up to find level-1 subject
    let current = topicNode
    let subjectId: string | null = null

    while (current) {
      if (current.level === 1) {
        subjectId = current.node_id
        break
      }
      if (!current.parent_id) break
      const parent = nodeMap.get(current.parent_id)
      if (!parent) break
      current = parent
    }

    if (!subjectId) continue

    const key = `${subjectId}::${topicNode.bloom_level}`
    const existing = aggMap.get(key) ?? { correct: 0, total: 0 }
    existing.total += 1
    if (interaction.is_correct) existing.correct += 1
    aggMap.set(key, existing)
  }

  // Build result — only subjects that have at least one bloom-level entry
  const BLOOM_ORDER: BloomLevel[] = ['remember', 'understand', 'apply', 'analyze']

  const result: BloomBreakdown[] = []

  for (const subject of subjects) {
    const levels: BloomLevelStat[] = []

    for (const bloom of BLOOM_ORDER) {
      const key = `${subject.node_id}::${bloom}`
      const agg = aggMap.get(key)
      if (agg && agg.total > 0) {
        levels.push({
          bloom,
          accuracy: Math.round((agg.correct / agg.total) * 100),
          attempts: agg.total,
        })
      }
    }

    if (levels.length > 0) {
      result.push({
        subject: subject.name,
        subjectId: subject.node_id,
        levels,
      })
    }
  }

  // Sort alphabetically by subject name
  result.sort((a, b) => a.subject.localeCompare(b.subject))

  return result
}
