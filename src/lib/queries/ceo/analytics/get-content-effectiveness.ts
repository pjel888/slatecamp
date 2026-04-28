'use server'

import { createClient } from '@/lib/supabase/server'
import { assertCeoAccess } from '@/lib/ceo/access'
import { wrapResult, wrapError } from '@/lib/actions/analytics/shared-helpers'
import type { AnalyticsResult } from '@/lib/actions/analytics/shared-helpers'

export type ContentEffectivenessItem = {
  topicName: string
  totalAnswered: number
  avgAccuracy: number
  effectivenessScore: number
}

export const getContentEffectivenessData = async (): Promise<
  AnalyticsResult<ContentEffectivenessItem[]>
> => {
  await assertCeoAccess()

  try {
    const supabase = await createClient()

    // Aggregate quiz_interactions by topic_node_id across all users
    const { data: interactions, error } = await supabase
      .from('quiz_interactions')
      .select('topic_node_id, is_correct')
      .not('topic_node_id', 'is', null)

    if (error) throw new Error(error.message)

    if (!interactions || interactions.length === 0) {
      return wrapResult([])
    }

    // Group by topic_node_id
    const grouped: Record<
      string,
      { total: number; correct: number }
    > = {}

    for (const row of interactions) {
      const id = row.topic_node_id as string
      if (!grouped[id]) grouped[id] = { total: 0, correct: 0 }
      grouped[id].total += 1
      if (row.is_correct) grouped[id].correct += 1
    }

    // Fetch topic names from taxonomy_tree
    const topicIds = Object.keys(grouped)
    const { data: taxNodes } = await supabase
      .from('taxonomy_tree')
      .select('node_id, name')
      .in('node_id', topicIds.slice(0, 200))

    const nameMap: Record<string, string> = {}
    for (const node of taxNodes ?? []) {
      nameMap[node.node_id] = node.name ?? node.node_id
    }

    const items: ContentEffectivenessItem[] = Object.entries(grouped)
      .filter(([, g]) => g.total >= 5)
      .map(([id, g]) => {
        const avgAccuracy = g.total > 0 ? g.correct / g.total : 0
        // effectiveness = accuracy weighted by engagement volume (log scale)
        const engagementWeight = Math.log10(Math.max(g.total, 1)) / Math.log10(1000)
        const effectivenessScore = Math.round(
          avgAccuracy * 0.7 * 100 + engagementWeight * 0.3 * 100,
        )
        return {
          topicName: nameMap[id] ?? id,
          totalAnswered: g.total,
          avgAccuracy: Math.round(avgAccuracy * 1000) / 10,
          effectivenessScore,
        }
      })
      .sort((a, b) => b.effectivenessScore - a.effectivenessScore)
      .slice(0, 15)

    return wrapResult(items)
  } catch (err) {
    return wrapError(
      err instanceof Error ? err.message : 'Failed to load content effectiveness',
      [],
    )
  }
}
