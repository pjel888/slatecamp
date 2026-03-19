'use server'

import { createClient } from '@/lib/supabase/server'

/**
 * Generate a Blindspot queue for a user.
 * Identifies the 3 weakest taxonomy nodes and creates a 12-item quiz queue.
 *
 * Architecture spec: Nightly scan → identify Red/Grey nodes → generate queue.
 * Can also be called on-demand from the dashboard.
 */
export const generateBlindspotQueue = async (
  userId: string,
): Promise<{ queueId: string; nodeIds: string[] } | null> => {
  const supabase = await createClient()

  // Check for existing pending/in_progress queue
  const { data: existing } = await supabase
    .from('blindspot_queues')
    .select('queue_id')
    .eq('user_id', userId)
    .in('status', ['pending', 'in_progress'])
    .limit(1)
    .maybeSingle()

  if (existing) return null // Already has an active queue

  // Find the 3 weakest nodes (Red zone: mastery < 0.4)
  const { data: weakNodes } = await supabase
    .from('user_node_mastery')
    .select('topic_id, current_mastery_weight')
    .eq('user_id', userId)
    .lt('current_mastery_weight', 0.4)
    .order('current_mastery_weight', { ascending: true })
    .limit(3)

  // Also find unexplored nodes (Grey: no mastery row at all)
  const { data: allLeafNodes } = await supabase
    .from('taxonomy_tree')
    .select('node_id')
    .eq('is_leaf', true)
    .eq('is_cross_ref_only', false)
    .is('deprecated_at', null)
    .not('ale_id', 'is', null)

  const { data: touchedNodes } = await supabase
    .from('user_node_mastery')
    .select('topic_id')
    .eq('user_id', userId)

  const touchedSet = new Set((touchedNodes || []).map(n => n.topic_id))
  const greyNodes = (allLeafNodes || [])
    .filter(n => !touchedSet.has(n.node_id))
    .slice(0, 3 - (weakNodes?.length || 0))

  const targetNodeIds = [
    ...(weakNodes || []).map(n => n.topic_id),
    ...greyNodes.map(n => n.node_id),
  ].slice(0, 3)

  if (targetNodeIds.length === 0) return null // No weak nodes

  // Snapshot pre-queue mastery
  const preQueueMastery: Record<string, number> = {}
  for (const node of (weakNodes || [])) {
    preQueueMastery[node.topic_id] = node.current_mastery_weight
  }

  // Create the queue
  const { data: queue, error } = await supabase
    .from('blindspot_queues')
    .insert({
      user_id: userId,
      node_ids: targetNodeIds,
      question_count: 12,
      pre_queue_mastery: preQueueMastery,
      status: 'pending',
    })
    .select('queue_id')
    .single()

  if (error || !queue) {
    if (error) console.error('[BLINDSPOT] generateBlindspotQueue insert failed:', { error: error.message, timestamp: new Date().toISOString() })
    return null
  }

  return { queueId: queue.queue_id, nodeIds: targetNodeIds }
}

/**
 * Complete a Blindspot queue: snapshot post-queue mastery and compute improvement.
 */
export const completeBlindspotQueue = async (
  queueId: string,
  userId: string,
): Promise<void> => {
  const supabase = await createClient()

  // Get the queue to find target nodes
  const { data: queue } = await supabase
    .from('blindspot_queues')
    .select('node_ids, pre_queue_mastery')
    .eq('queue_id', queueId)
    .eq('user_id', userId)
    .single()

  if (!queue) return

  const nodeIds = (queue.node_ids as string[]) || []
  const preMastery = (queue.pre_queue_mastery as Record<string, number>) || {}

  // Snapshot post-queue mastery
  const { data: currentMastery } = await supabase
    .from('user_node_mastery')
    .select('topic_id, current_mastery_weight')
    .eq('user_id', userId)
    .in('topic_id', nodeIds)

  const postQueueMastery: Record<string, number> = {}
  let nodesImproved = 0

  for (const node of (currentMastery || [])) {
    postQueueMastery[node.topic_id] = node.current_mastery_weight
    const pre = preMastery[node.topic_id] ?? 0
    if (node.current_mastery_weight > pre) nodesImproved++
  }

  await supabase
    .from('blindspot_queues')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      post_queue_mastery: postQueueMastery,
      nodes_improved: nodesImproved,
    })
    .eq('queue_id', queueId)
}

/**
 * Defer a Blindspot queue for 48 hours.
 */
export const deferBlindspotQueue = async (
  queueId: string,
  userId: string,
): Promise<void> => {
  const supabase = await createClient()
  const deferredUntil = new Date(Date.now() + 48 * 60 * 60 * 1000)

  await supabase
    .from('blindspot_queues')
    .update({
      status: 'deferred',
      deferred_until: deferredUntil.toISOString(),
    })
    .eq('queue_id', queueId)
    .eq('user_id', userId)
}

/**
 * Get the current active/pending Blindspot queue for a user (dashboard display).
 */
export const getActiveBlindspotQueue = async (userId: string) => {
  const supabase = await createClient()

  const { data } = await supabase
    .from('blindspot_queues')
    .select('*')
    .eq('user_id', userId)
    .in('status', ['pending', 'in_progress', 'deferred'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return data
}
