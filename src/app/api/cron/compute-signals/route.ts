import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { headers } from 'next/headers'

/**
 * Daily Computed Signals Refresh
 *
 * DB Audit v3 identified: user_computed_signals has 0 rows.
 * This cron computes velocity, churn risk, and session stats for all active users.
 *
 * Configure in vercel.json:
 *   { "crons": [{ "path": "/api/cron/compute-signals", "schedule": "30 16 * * *" }] }
 *   (16:30 UTC = 00:30 PHT, after focus-review scan)
 */
export async function GET(request: Request) {
  const headersList = await headers()
  const authHeader = headersList.get('authorization')

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  // Get all users with at least one completed session
  const { data: activeUsers } = await supabase
    .from('quiz_sessions')
    .select('user_id')
    .eq('status', 'completed')
    .gte('started_at', thirtyDaysAgo.toISOString())

  if (!activeUsers) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }

  const userIds = [...new Set(activeUsers.map(u => u.user_id))]
  let updated = 0

  for (const userId of userIds) {
    try {
      // Score Velocity
      const { data: currentStats } = await supabase
        .from('user_global_stats')
        .select('global_readiness_score')
        .eq('user_id', userId)
        .single()

      const currentScore = currentStats?.global_readiness_score ?? 0

      const { data: baselineSnapshot } = await supabase
        .from('readiness_score_snapshots')
        .select('score, computed_at')
        .eq('user_id', userId)
        .lte('computed_at', sevenDaysAgo.toISOString())
        .order('computed_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      let velocity = 0
      if (baselineSnapshot) {
        const daysDelta =
          (now.getTime() - new Date(baselineSnapshot.computed_at).getTime()) /
          (1000 * 60 * 60 * 24)
        if (daysDelta > 0) velocity = (currentScore - baselineSnapshot.score) / daysDelta
      }

      // Sessions Last 7 Days
      const { count: sessionsLast7d } = await supabase
        .from('quiz_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'completed')
        .gte('started_at', sevenDaysAgo.toISOString())

      // Days Since Last Session
      const { data: lastSession } = await supabase
        .from('quiz_sessions')
        .select('started_at')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      const daysSinceLastSession = lastSession
        ? Math.floor((now.getTime() - new Date(lastSession.started_at).getTime()) / (1000 * 60 * 60 * 24))
        : 999

      // Churn Risk
      let churnRisk = 0
      if (daysSinceLastSession > 7) churnRisk += 0.3
      if (velocity < 0) churnRisk += 0.3
      if ((sessionsLast7d ?? 0) === 0) churnRisk += 0.4
      if ((sessionsLast7d ?? 0) >= 3) churnRisk -= 0.2
      churnRisk = Math.max(0, Math.min(1, churnRisk))

      // Upsert
      await supabase
        .from('user_computed_signals')
        .upsert({
          user_id: userId,
          score_velocity_7d: Math.round(velocity * 100) / 100,
          score_velocity_updated_at: now.toISOString(),
          churn_risk_score: Math.round(churnRisk * 100) / 100,
          churn_risk_updated_at: now.toISOString(),
          days_since_last_session: daysSinceLastSession,
          sessions_last_7d: sessionsLast7d ?? 0,
          computed_at: now.toISOString(),
        }, { onConflict: 'user_id' })

      updated++
    } catch {
      // Skip individual user failures
    }
  }

  return NextResponse.json({ processed: userIds.length, updated })
}
