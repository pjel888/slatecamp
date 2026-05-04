'use server'

import { getUser } from '@/lib/supabase/server'
import { createCachedClient, wrapResult, wrapError, type AnalyticsResult } from '@/lib/actions/analytics/shared-helpers'

// ── Types ──────────────────────────────────────────────────────────────────────

interface WikiRead {
  article_id: string
  read_pct: number | null
  time_spent_ms: number | null
  created_at: string | null
}

interface UserThetaRow {
  theta: number
  theta_se: number
  responses_count: number
  updated_at: string
}

// ── Shared helpers for joining drill + wiki data across features ────────────
// Used by EX-Phase 1, 2, and 5 sections

export const getWikiReadsByUser = async (): Promise<AnalyticsResult<WikiRead[]>> => {
  try {
    const supabase = await createCachedClient()
    const {
      data: { user },
    } = await getUser()
    if (!user) return wrapResult([])

    const { data } = await supabase
      .from('wiki_article_reads')
      .select('article_id, read_pct, time_spent_ms, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(500)

    return wrapResult(data ?? [])
  } catch (err) {
    console.error('[ANALYTICS] getWikiReadsByUser failed:', err)
    return wrapError('Failed to load wiki reads', [])
  }
}

export const getUserTheta = async (): Promise<AnalyticsResult<UserThetaRow[]>> => {
  try {
    const supabase = await createCachedClient()
    const {
      data: { user },
    } = await getUser()
    if (!user) return wrapResult([])

    const { data } = await supabase
      .from('user_theta')
      .select('theta, theta_se, responses_count, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: true })
      .limit(50)

    return wrapResult(data ?? [])
  } catch (err) {
    console.error('[ANALYTICS] getUserTheta failed:', err)
    return wrapError('Failed to load user theta', [])
  }
}
