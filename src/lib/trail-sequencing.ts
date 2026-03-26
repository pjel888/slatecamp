/**
 * Trail step sequencing utilities.
 *
 * Bloom's taxonomy ordering for trail step generation:
 *   remember → understand → apply → analyze
 *
 * Within each bloom level, easier difficulty comes first (difficulty ASC).
 *
 * This is applied at query time in getTrailDays and does NOT retroactively
 * update step_order in the database — enrolled users keep their persisted order
 * and any display-layer reordering is additive only.
 */

import type { TrailStep } from '@/types/app'

export type BloomLevel = 'remember' | 'understand' | 'apply' | 'analyze'

/** Canonical rank for each Bloom level (lower = earlier in sequence). */
const BLOOM_RANK: Record<BloomLevel, number> = {
  remember: 1,
  understand: 2,
  apply: 3,
  analyze: 4,
}

export interface NodeBloomData {
  node_id: string
  bloom_level: BloomLevel | null
  difficulty: number | null
}

/**
 * Given a list of TrailSteps and a map of node taxonomy data, return the steps
 * sorted by the dominant Bloom level of their target nodes, then by difficulty ASC.
 *
 * Steps with no taxonomy data preserve their original step_order position.
 *
 * @param steps - Raw trail steps (already loaded from DB)
 * @param nodeData - Map of node_id → { bloom_level, difficulty } from taxonomy_tree
 */
export const sortStepsByBloom = (
  steps: TrailStep[],
  nodeData: Map<string, NodeBloomData>,
): TrailStep[] => {
  if (steps.length === 0 || nodeData.size === 0) return steps

  const ranked = steps.map((step) => {
    const nodes = step.target_node_ids
      .map((id) => nodeData.get(id))
      .filter((n): n is NodeBloomData => n !== undefined && n.bloom_level !== null)

    if (nodes.length === 0) {
      // No taxonomy data: fall back to step_order (treated as a mid-range value)
      return { step, bloomRank: 2.5, difficulty: step.difficulty_min ?? 0.5 }
    }

    // Use the lowest bloom rank among all target nodes (most foundational first)
    const bloomRank = Math.min(...nodes.map((n) => BLOOM_RANK[n.bloom_level!]))

    // Use the average difficulty of target nodes
    const avgDifficulty =
      nodes.reduce((sum, n) => sum + (n.difficulty ?? 2), 0) / nodes.length

    return { step, bloomRank, difficulty: avgDifficulty }
  })

  return ranked
    .sort((a, b) => {
      if (a.bloomRank !== b.bloomRank) return a.bloomRank - b.bloomRank
      return a.difficulty - b.difficulty
    })
    .map(({ step }) => step)
}

/**
 * Build a NodeBloomData map from a raw Supabase query result.
 * Accepts the shape returned by taxonomy_tree selects.
 */
export const buildNodeBloomMap = (
  rows: Array<{ node_id: string; bloom_level?: string | null; difficulty?: number | null }>,
): Map<string, NodeBloomData> => {
  const map = new Map<string, NodeBloomData>()
  for (const row of rows) {
    map.set(row.node_id, {
      node_id: row.node_id,
      bloom_level: (row.bloom_level as BloomLevel | null) ?? null,
      difficulty: row.difficulty,
    })
  }
  return map
}
