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
 */
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

  // BATCH 4: Get weak nodes for ALL eligible users at once
  const { data: weakNodes } = await supabase
    .from('user_node_mastery')
    .select('user_id, topic_id, current_mastery_weight')
    .in('user_id', eligibleUserIds)
    .lt('current_mastery_weight', 0.4)
    .order('current_mastery_weight', { ascending: true })

  const weakNodesByUser = new Map<string, Array<{ topic_id: string; current_mastery_weight: number }>>()
  for (const node of (weakNodes ?? [])) {
    if (!weakNodesByUser.has(node.user_id)) weakNodesByUser.set(node.user_id, [])
    weakNodesByUser.get(node.user_id)!.push(node)
  }

  // BATCH 5: Get all leaf nodes (shared across all users)
  const { data: allLeafNodes } = await supabase
    .from('taxonomy_tree')
    .select('node_id')
    .eq('is_leaf', true)
    .eq('is_cross_ref_only', false)
    .is('deprecated_at', null)
    .not('ale_id', 'is', null)

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
    for (const node of userWeakNodes) {
      preQueueMastery[node.topic_id] = node.current_mastery_weight
    }

    newQueues.push({
      user_id: userId,
      node_ids: targetNodeIds,
      question_count: 12,
      pre_queue_mastery: preQueueMastery,
      status: 'pending',
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
