'use server'

import { createClient } from '@/lib/supabase/server'
import { assertCeoAccess } from '@/lib/ceo/access'
import { wrapResult, wrapError } from '@/lib/actions/analytics/shared-helpers'
import type { AnalyticsResult } from '@/lib/actions/analytics/shared-helpers'

export type CoverageGapItem = {
  topicName: string
  topicId: string
  totalAttempts: number
  avgMastery: number
  usersCovered: number
}

export const getCoverageGapData = async (): Promise<
  AnalyticsResult<CoverageGapItem[]>
> => {
  await assertCeoAccess()

  try {
    const supabase = await createClient()

    // Get all taxonomy leaf nodes
    const { data: taxNodes, error: taxErr } = await supabase
      .from('taxonomy_tree')
      .select('node_id, name')
      .is('deprecated_at', null)
      .not('lea_id', 'is', null)

    if (taxErr) throw new Error(taxErr.message)

    if (!taxNodes || taxNodes.length === 0) {
      return wrapResult([])
    }

    const nodeIds = taxNodes.map((n) => n.node_id)
    const nameMap: Record<string, string> = {}
    for (const n of taxNodes) {
      nameMap[n.node_id] = n.name ?? n.node_id
    }

    // Get mastery data aggregated across all users per topic
    const { data: masteryRows, error: masteryErr } = await supabase
      .from('user_node_mastery')
      .select('node_id, mastery_score, attempt_count')
      .in('node_id', nodeIds.slice(0, 500))

    if (masteryErr) throw new Error(masteryErr.message)

    // Aggregate per node_id
    const nodeStats: Record<
      string,
      { totalAttempts: number; masterySum: number; usersCovered: number }
    > = {}

    for (const row of masteryRows ?? []) {
      const id = row.node_id as string
      if (!nodeStats[id]) {
        nodeStats[id] = { totalAttempts: 0, masterySum: 0, usersCovered: 0 }
      }
      nodeStats[id].totalAttempts += row.attempt_count ?? 0
      nodeStats[id].masterySum += row.mastery_score ?? 0
      nodeStats[id].usersCovered += 1
    }

    // Build items — include topics with zero or low coverage
    const items: CoverageGapItem[] = nodeIds.map((id) => {
      const stats = nodeStats[id]
      return {
        topicId: id,
        topicName: nameMap[id] ?? id,
        totalAttempts: stats?.totalAttempts ?? 0,
        avgMastery:
          stats && stats.usersCovered > 0
            ? Math.round((stats.masterySum / stats.usersCovered) * 1000) / 10
            : 0,
        usersCovered: stats?.usersCovered ?? 0,
      }
    })

    // Sort by totalAttempts ascending (least covered first)
    const sorted = items
      .sort((a, b) => a.totalAttempts - b.totalAttempts)
      .slice(0, 15)

    return wrapResult(sorted)
  } catch (err) {
    return wrapError(
      err instanceof Error ? err.message : 'Failed to load coverage gap',
      [],
    )
  }
}
