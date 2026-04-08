import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { headers } from 'next/headers'

/**
 * Blindspot Protocol — Nightly Scan Cron Job
 *
 * Architecture spec: "At midnight, system scans the Taxonomy Heatmap.
 * Identifies red or grey nodes. Compiles a 10–15 item quiz queue."
 *
 * Configure in vercel.json:
 *   { "crons": [{ "path": "/api/cron/blindspot-scan", "schedule": "0 16 * * *" }] }
 *   (16:00 UTC = midnight PHT)
 *
 * Protected by CRON_SECRET header verification.
 *
 * WEIGHTING: Priority score = (1 - mastery_ema) × FREQUENCY_WEIGHTS × TYPE_WEIGHTS
 * Routes to '3d_lab' if three_d_lab_linked=true AND mastery<0.4 (red)
 */

// Frequency weighting (exam_frequency_level)
const FREQUENCY_WEIGHTS: Record<string, number> = {
  'high': 3.0,
  'medium': 1.5,
  'low': 0.5,
}

// Type weighting (taxonomy_node_type)
const TYPE_WEIGHTS: Record<string, number> = {
  'code_provision': 2.0,
  'formula': 1.8,
  'concept': 1.0,
  'person': 0.7,
  'building': 0.7,
  'case_study': 0.8,
}

const getPriorityScore = (
  mastery: number,
  examFrequency: string | null,
  nodeType: string | null,
): number => {
  const frequencyWeight = examFrequency && FREQUENCY_WEIGHTS[examFrequency]
    ? FREQUENCY_WEIGHTS[examFrequency]
    : 1.0
  const typeWeight = nodeType && TYPE_WEIGHTS[nodeType]
    ? TYPE_WEIGHTS[nodeType]
    : 1.0
  return (1 - mastery) * frequencyWeight * typeWeight
}

export async function GET(request: Request) {
  // Verify cron secret
  const headersList = await headers()
  const authHeader = headersList.get('authorization')

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  // BATCH 1: Get all active users (completed a session in last 30 days)
  const { data: sessionUsers, error: usersError } = await supabase
    .from('quiz_sessions')
    .select('user_id')
    .eq('status', 'completed')
    .gte('started_at', thirtyDaysAgo)

  if (usersError || !sessionUsers) {
    console.error('[CRON:BLINDSPOT] Failed to fetch active users:', usersError)
    return NextResponse.json({ error: 'Failed to fetch active users' }, { status: 500 })
  }

  const userIds = [...new Set(sessionUsers.map(u => u.user_id))]
  if (userIds.length === 0) {
    return NextResponse.json({ processed: 0, queuesCreated: 0, skipped: 0, expired: 0 })
  }

  // BATCH 2: Get existing active queues for ALL users at once
  const { data: existingQueues } = await supabase
    .from('blindspot_queues')
    .select('user_id')
    .in('user_id', userIds)
    .in('status', ['pending', 'in_progress'])

  const usersWithQueues = new Set((existingQueues ?? []).map(q => q.user_id))

  // BATCH 3: Get subscription status for ALL users at once
  const { data: subscriptions } = await supabase
    .from('user_subscriptions')
    .select('user_id, tier, status')
    .in('user_id', userIds)

  const paidUsers = new Set(
    (subscriptions ?? [])
      .filter(s => (s.status === 'active' || s.status === 'trialing') && s.tier !== 'free')
      .map(s => s.user_id)
  )

  // Filter to eligible users (paid + no existing queue)
  const eligibleUserIds = userIds.filter(uid => paidUsers.has(uid) && !usersWithQueues.has(uid))

  if (eligibleUserIds.length === 0) {
    // Still expire stale queues
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const { count: expired } = await supabase
      .from('blindspot_queues')
      .update({ status: 'expired' })
      .eq('status', 'pending')
      .lt('created_at', sevenDaysAgo)

    return NextResponse.json({
      processed: userIds.length,
      queuesCreated: 0,
      skipped: userIds.length - eligibleUserIds.length,
      expired: expired ?? 0,
    })
  }

  // BATCH 4: Get weak nodes with full metadata for priority weighting
  const { data: weakNodes } = await supabase
    .from('user_node_mastery')
    .select(
      `user_id, topic_id, current_mastery_weight,
       taxonomy_tree!topic_id(node_id, exam_frequency, node_type, three_d_lab_linked)`
    )
    .in('user_id', eligibleUserIds)
    .lt('current_mastery_weight', 0.4)

  const weakNodesByUser = new Map<string, Array<{
    topic_id: string
    current_mastery_weight: number
    exam_frequency: string | null
    node_type: string | null
    three_d_lab_linked: boolean
    priority_score: number
  }>>()

  for (const node of (weakNodes ?? [])) {
    const taxonomy = node.taxonomy_tree as any
    const priorityScore = getPriorityScore(
      node.current_mastery_weight,
      taxonomy?.exam_frequency,
      taxonomy?.node_type
    )

    if (!weakNodesByUser.has(node.user_id)) weakNodesByUser.set(node.user_id, [])
    weakNodesByUser.get(node.user_id)!.push({
      topic_id: node.topic_id,
      current_mastery_weight: node.current_mastery_weight,
      exam_frequency: taxonomy?.exam_frequency,
      node_type: taxonomy?.node_type,
      three_d_lab_linked: taxonomy?.three_d_lab_linked,
      priority_score: priorityScore,
    })
  }

  // Sort each user's weak nodes by priority score (highest first)
  for (const nodes of weakNodesByUser.values()) {
    nodes.sort((a, b) => b.priority_score - a.priority_score)
  }

  // BATCH 5: Get all leaf nodes (shared across all users)
  const { data: allLeafNodes } = await supabase
    .from('taxonomy_tree')
    .select('node_id')
    .eq('is_leaf', true)
    .eq('is_cross_ref_only', false)
    .is('deprecated_at', null)
    .not('lea_id', 'is', null)

  // BATCH 6: Get touched nodes for ALL eligible users at once
  const { data: allTouchedNodes } = await supabase
    .from('user_node_mastery')
    .select('user_id, topic_id')
    .in('user_id', eligibleUserIds)

  const touchedByUser = new Map<string, Set<string>>()
  for (const n of (allTouchedNodes ?? [])) {
    if (!touchedByUser.has(n.user_id)) touchedByUser.set(n.user_id, new Set())
    touchedByUser.get(n.user_id)!.add(n.topic_id)
  }

  // Process each eligible user with pre-fetched data (no more per-user DB calls)
  const newQueues: Array<{
    user_id: string
    node_ids: string[]
    question_count: number
    pre_queue_mastery: Record<string, number>
    status: string
    recommendation_type: string
  }> = []

  for (const userId of eligibleUserIds) {
    const userWeakNodes = (weakNodesByUser.get(userId) ?? []).slice(0, 3)
    const touchedSet = touchedByUser.get(userId) ?? new Set()

    const greyNodes = (allLeafNodes ?? [])
      .filter(n => !touchedSet.has(n.node_id))
      .slice(0, 3 - userWeakNodes.length)

    const targetNodeIds = [
      ...userWeakNodes.map(n => n.topic_id),
      ...greyNodes.map(n => n.node_id),
    ].slice(0, 3)

    if (targetNodeIds.length === 0) continue

    const preQueueMastery: Record<string, number> = {}
    let recommendationType = 'quiz'

    for (const node of userWeakNodes) {
      preQueueMastery[node.topic_id] = node.current_mastery_weight
      // If node is red (mastery < 0.4) AND has 3D Lab linked, recommend 3d_lab first
      if (node.current_mastery_weight < 0.4 && node.three_d_lab_linked) {
        recommendationType = '3d_lab'
      }
    }

    newQueues.push({
      user_id: userId,
      node_ids: targetNodeIds,
      question_count: 12,
      pre_queue_mastery: preQueueMastery,
      status: 'pending',
      recommendation_type: recommendationType,
    })
  }

  // BATCH INSERT: All new queues in one operation
  let queuesCreated = 0
  if (newQueues.length > 0) {
    const { error: insertError } = await supabase
      .from('blindspot_queues')
      .insert(newQueues)

    if (insertError) {
      console.error('[CRON:BLINDSPOT] Batch insert failed:', insertError)
    } else {
      queuesCreated = newQueues.length
    }
  }

  // CLEANUP: Expire stale queues (pending for more than 7 days)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const { count: expired } = await supabase
    .from('blindspot_queues')
    .update({ status: 'expired' })
    .eq('status', 'pending')
    .lt('created_at', sevenDaysAgo)

  return NextResponse.json({
    processed: userIds.length,
    queuesCreated,
    skipped: userIds.length - eligibleUserIds.length,
    expired: expired ?? 0,
  })
}
