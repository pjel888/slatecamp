'use server'

import { createClient } from '@/lib/supabase/server'
import { wrapResult, wrapError, type AnalyticsResult } from '@/lib/actions/analytics/shared-helpers'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LearningVelocityRow {
  topicArea: string
  avgDaysToMastery: number
  usersAchieved: number
  fastestDays: number
  slowestDays: number
}

// Mastery threshold — consistent with IRT-based mastery definition site-wide
const MASTERY_THRESHOLD = 0.75

// ─── Action ───────────────────────────────────────────────────────────────────

export const getLearningVelocityData = async (): Promise<
  AnalyticsResult<LearningVelocityRow[]>
> => {
  try {
    const supabase = await createClient()

    // Fetch mastered topics with timestamps
    const { data: masteryRows, error: masteryErr } = await supabase
      .from('user_node_mastery')
      .select('user_id, node_id, mastery_score, first_practiced_at, last_practiced_at')
      .gte('mastery_score', MASTERY_THRESHOLD)
      .not('first_practiced_at', 'is', null)
      .not('last_practiced_at', 'is', null)
      .limit(2000)

    if (masteryErr) {
      return wrapError(masteryErr.message, [])
    }

    if (!masteryRows?.length) return wrapResult([])

    const topicIds = [...new Set(masteryRows.map((r) => r.node_id))]

    // Resolve level-1 topic area names for each node
    const { data: taxRows } = await supabase
      .from('taxonomy_tree')
      .select('node_id, parent_id, level, name')
      .in('node_id', topicIds)

    // Build node map for ancestor walk
    const nodeMap = new Map<string, { parent_id: string | null; level: number; name: string }>()
    for (const t of taxRows ?? []) {
      nodeMap.set(t.node_id, { parent_id: t.parent_id, level: t.level, name: t.name })
    }

    // Fetch all level-1 ancestors in one shot for parent resolution
    const parentIds = [...new Set((taxRows ?? []).map((t) => t.parent_id).filter(Boolean))] as string[]
    const { data: parentRows } = parentIds.length
      ? await supabase
          .from('taxonomy_tree')
          .select('node_id, parent_id, level, name')
          .in('node_id', parentIds)
      : { data: [] }

    for (const p of parentRows ?? []) {
      if (!nodeMap.has(p.node_id)) {
        nodeMap.set(p.node_id, { parent_id: p.parent_id, level: p.level, name: p.name })
      }
    }

    const resolveArea = (nodeId: string): string => {
      let current = nodeMap.get(nodeId)
      let prev = current
      while (current && current.level > 1 && current.parent_id) {
        prev = current
        current = nodeMap.get(current.parent_id)
      }
      return current?.name ?? prev?.name ?? 'Other'
    }

    // Aggregate days-to-mastery per topic area
    const areaMap = new Map<string, { totalDays: number; count: number; min: number; max: number }>()

    for (const row of masteryRows) {
      const first = new Date(row.first_practiced_at!).getTime()
      const last = new Date(row.last_practiced_at!).getTime()
      const days = Math.max(1, Math.round((last - first) / 86400000))
      const area = resolveArea(row.node_id)

      if (!areaMap.has(area)) {
        areaMap.set(area, { totalDays: 0, count: 0, min: days, max: days })
      }
      const a = areaMap.get(area)!
      a.totalDays += days
      a.count += 1
      a.min = Math.min(a.min, days)
      a.max = Math.max(a.max, days)
    }

    const rows: LearningVelocityRow[] = Array.from(areaMap.entries())
      .map(([topicArea, stats]) => ({
        topicArea,
        avgDaysToMastery: Math.round(stats.totalDays / stats.count),
        usersAchieved: stats.count,
        fastestDays: stats.min,
        slowestDays: stats.max,
      }))
      .sort((a, b) => a.avgDaysToMastery - b.avgDaysToMastery)

    return wrapResult(rows)
  } catch (err) {
    console.error('[CEO ANALYTICS] getLearningVelocityData failed:', err)
    return wrapError('Failed to load learning velocity data', [])
  }
}
