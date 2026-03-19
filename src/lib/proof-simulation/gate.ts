'use server'

import { createClient } from '@/lib/supabase/server'

interface ProofSimulationGateResult {
  allowed: boolean
  nodesCovered: number
  nodesRequired: number
  enduranceWindow: number
  enduranceRequired: number
  reasons: string[]
}

/**
 * Check if a user meets the competence gate for Proof Simulation.
 * Architecture spec:
 *   - ≥70% of taxonomy nodes at Amber or above (mastery ≥ 0.4)
 *   - Endurance window ≥ 80% of exam duration
 */
export const checkProofSimulationGate = async (
  userId: string,
): Promise<ProofSimulationGateResult> => {
  const supabase = await createClient()
  const reasons: string[] = []

  // Count nodes at Amber or above
  const { count: amberPlus } = await supabase
    .from('user_node_mastery')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('current_mastery_weight', 0.4)

  // Count total leaf nodes
  const { count: totalNodes } = await supabase
    .from('taxonomy_tree')
    .select('*', { count: 'exact', head: true })
    .eq('is_leaf', true)

  const nodesRequired = Math.ceil((totalNodes ?? 0) * 0.7)
  const nodesCovered = amberPlus ?? 0
  const nodesMet = nodesCovered >= nodesRequired

  if (!nodesMet) {
    reasons.push(
      `${nodesCovered} of ${nodesRequired} topics at developing level or above (need 70%)`,
    )
  }

  // Get endurance data
  const { data: signals } = await supabase
    .from('user_computed_signals')
    .select('endurance_window_items, endurance_target_items')
    .eq('user_id', userId)
    .single()

  const enduranceWindow = signals?.endurance_window_items ?? 0
  const enduranceTarget = signals?.endurance_target_items ?? 150
  const enduranceRequired = Math.ceil(enduranceTarget * 0.8)
  const enduranceMet = enduranceWindow >= enduranceRequired

  if (!enduranceMet) {
    reasons.push(
      `Endurance window: ${enduranceWindow} of ${enduranceRequired} items (need 80% of exam length)`,
    )
  }

  return {
    allowed: nodesMet && enduranceMet,
    nodesCovered,
    nodesRequired,
    enduranceWindow,
    enduranceRequired,
    reasons,
  }
}
