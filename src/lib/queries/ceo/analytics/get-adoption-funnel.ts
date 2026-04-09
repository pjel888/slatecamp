'use server'

import { createClient } from '@/lib/supabase/server'
import { wrapResult, wrapError } from '@/lib/actions/analytics/shared-helpers'
import type { AnalyticsResult } from '@/lib/actions/analytics/shared-helpers'

export type AdoptionFunnelStage = {
  stage: string
  count: number
  dropOffRate: number | null
}

export type AdoptionFunnelData = {
  stages: AdoptionFunnelStage[]
  totalRegistered: number
}

export const getAdoptionFunnelData = async (): Promise<AnalyticsResult<AdoptionFunnelData>> => {
  try {
    const supabase = await createClient()

    // Count total registered users
    const { count: totalRegistered } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })

    const registered = totalRegistered ?? 0

    // Users with any quiz session (first_drill) — distinct users
    const { data: drillUsers } = await supabase
      .from('quiz_sessions')
      .select('user_id')
    const firstDrill = new Set((drillUsers ?? []).map((r: any) => r.user_id)).size

    // Users with wiki reads (first_wiki) — distinct users
    const { data: wikiUsers, error: wikiErr } = await supabase
      .from('wiki_article_reads')
      .select('user_id')
    const firstWiki = wikiErr ? 0 : new Set((wikiUsers ?? []).map((r: any) => r.user_id)).size

    // Users in zone 2 — users with global_readiness_score >= 0.4 (already 1 row per user)
    const { count: zone2Count } = await supabase
      .from('user_global_stats')
      .select('user_id', { count: 'exact', head: true })
      .gte('global_readiness_score', 0.4)

    // First simulation — distinct users with timed/simulation/assessment sessions
    const { data: simUsers } = await supabase
      .from('quiz_sessions')
      .select('user_id')
      .in('mode', ['timed', 'simulation', 'assessment'])
    const firstSim = new Set((simUsers ?? []).map((r: any) => r.user_id)).size

    const counts = [
      registered,
      firstDrill,
      firstWiki,
      zone2Count ?? 0,
      firstSim,
    ]

    const labels = [
      'Registered',
      'First Drill',
      'First Wiki Read',
      'Zone 2 Readiness',
      'First Simulation',
    ]

    const stages: AdoptionFunnelStage[] = labels.map((stage, i) => ({
      stage,
      count: counts[i],
      dropOffRate:
        i === 0 || counts[i - 1] === 0
          ? null
          : Math.round((1 - counts[i] / counts[i - 1]) * 1000) / 10,
    }))

    return wrapResult({ stages, totalRegistered: registered })
  } catch (err) {
    return wrapError(
      err instanceof Error ? err.message : 'Failed to load adoption funnel',
      { stages: [], totalRegistered: 0 },
    )
  }
}
