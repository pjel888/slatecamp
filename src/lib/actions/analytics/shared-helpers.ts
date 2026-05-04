import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'

// ── Shared types ────────────────────────────────────────────────────────────

export type TaxNode = {
  node_id: string
  parent_id: string | null
  level: number
  name: string
}

// ── Result wrapper ──────────────────────────────────────────────────────────

export type AnalyticsResult<T> = {
  data: T
  error: string | null
}

export const wrapResult = <T>(data: T): AnalyticsResult<T> => ({
  data,
  error: null,
})

export const wrapError = <T>(error: string, fallback: T): AnalyticsResult<T> => ({
  data: fallback,
  error,
})

// ── Cached Supabase client (request-level dedup via React.cache) ────────────
//
// Without this, every analytics section creates its own SSR Supabase client
// via createClient(), which calls cookies() and creates a new client object.
// With React.cache, the first call within a request creates the client and all
// subsequent calls return the same instance — reducing 27+ client creations
// to 1 per analytics page load.

export const createCachedClient = cache(() => createClient())

// ── User global stats helper (request-level dedup via React.cache) ──────────

export const fetchUserGlobalStats = cache(
  async (
    supabase: Awaited<ReturnType<typeof createClient>>,
    userId: string,
  ): Promise<{ current_discipline_id: string | null; global_readiness_score: number | null } | null> => {
    const { data } = await supabase
      .from('user_global_stats')
      .select('current_discipline_id, global_readiness_score')
      .eq('user_id', userId)
      .single()
    return data ?? null
  },
)

// ── Taxonomy helpers (request-level dedup via React.cache) ──────────────────

export const fetchTaxonomyNodeMap = cache(
  async (
    supabase: Awaited<ReturnType<typeof createClient>>,
    disciplineId: string,
  ): Promise<Map<string, TaxNode>> => {
    const { data } = await supabase
      .from('taxonomy_tree')
      .select('node_id, parent_id, level, name')
      .eq('discipline_id', disciplineId)
      .eq('is_cross_ref_only', false)
      .is('deprecated_at', null)
      .not('lea_id', 'is', null)
    return new Map((data || []).map((n: TaxNode) => [n.node_id, n]))
  },
)

export const buildLevel1Resolver = (nodeMap: Map<string, TaxNode>) =>
  (topicId: string): { id: string; name: string } | null => {
    let current = nodeMap.get(topicId)
    if (!current) return null
    while (current && current.level > 1 && current.parent_id) {
      current = nodeMap.get(current.parent_id)
    }
    if (current?.level === 1) return { id: current.node_id, name: current.name }
    return null
  }
