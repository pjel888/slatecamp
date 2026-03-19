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

  // Get all active users who completed at least one session in the last 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const { data: activeUsers, error: usersError } = await supabase
    .from('quiz_sessions')
    .select('user_id')
    .eq('status', 'completed')
    .gte('started_at', thirtyDaysAgo)

  if (usersError || !activeUsers) {
    return NextResponse.json({ error: 'Failed to fetch active users' }, { status: 500 })
  }

  // Deduplicate user IDs
  const userIds = [...new Set(activeUsers.map(u => u.user_id))]

  let queuesCreated = 0
  let skipped = 0

  for (const userId of userIds) {
    // Check if user already has an active queue
    const { data: existing } = await supabase
      .from('blindspot_queues')
      .select('queue_id')
      .eq('user_id', userId)
      .in('status', ['pending', 'in_progress'])
      .limit(1)
      .maybeSingle()

    if (existing) {
      skipped++
      continue
    }

    // Check if user is on a paid tier (Blindspot is Pro-only)
    const { data: sub } = await supabase
      .from('user_subscriptions')
      .select('tier, status')
      .eq('user_id', userId)
      .maybeSingle()

    const isPaid =
      (sub?.status === 'active' || sub?.status === 'trialing') &&
      sub?.tier !== 'free'

    if (!isPaid) {
      skipped++
      continue
    }

    // Find the 3 weakest nodes
    const { data: weakNodes } = await supabase
      .from('user_node_mastery')
      .select('topic_id, current_mastery_weight')
      .eq('user_id', userId)
      .lt('current_mastery_weight', 0.4)
      .order('current_mastery_weight', { ascending: true })
      .limit(3)

    // Also find unexplored leaf nodes
    const { data: allLeafNodes } = await supabase
      .from('taxonomy_tree')
      .select('node_id')
      .eq('is_leaf', true)

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

    if (targetNodeIds.length === 0) {
      skipped++
      continue
    }

    // Snapshot pre-queue mastery
    const preQueueMastery: Record<string, number> = {}
    for (const node of (weakNodes || [])) {
      preQueueMastery[node.topic_id] = node.current_mastery_weight
    }

    // Create the queue
    const { error: insertError } = await supabase
      .from('blindspot_queues')
      .insert({
        user_id: userId,
        node_ids: targetNodeIds,
        question_count: 12,
        pre_queue_mastery: preQueueMastery,
        status: 'pending',
      })

    if (!insertError) {
      queuesCreated++
    }
  }

  // Also expire stale queues (pending for more than 7 days)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const { count: expired } = await supabase
    .from('blindspot_queues')
    .update({ status: 'expired' })
    .eq('status', 'pending')
    .lt('created_at', sevenDaysAgo)

  return NextResponse.json({
    processed: userIds.length,
    queuesCreated,
    skipped,
    expired: expired ?? 0,
  })
}
