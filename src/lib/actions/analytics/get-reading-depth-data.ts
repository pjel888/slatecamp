'use server'

import { createClient, getUser } from '@/lib/supabase/server'
import { wrapResult, wrapError, type AnalyticsResult } from '@/lib/actions/analytics/shared-helpers'

// ── Types ────────────────────────────────────────────────────────────────────

export interface ReadingDepthRow {
  topic: string
  articlesRead: number
  avgScrollDepth: number
  avgReadDuration: number
}

// ── Action ───────────────────────────────────────────────────────────────────

export const getReadingDepthData = async (): Promise<AnalyticsResult<ReadingDepthRow[]>> => {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await getUser()
    if (!user) return wrapResult([])

    // Fetch wiki reads — graceful if table doesn't exist
    const { data: reads, error: readsError } = await supabase
      .from('wiki_article_reads')
      .select('article_id, read_pct, time_spent_ms')
      .eq('user_id', user.id)
      .limit(500)

    if (readsError || !reads?.length) return wrapResult([])

    // Fetch article metadata (topic_id)
    const articleIds = [...new Set((reads as any[]).map((r) => r.article_id))]

    const { data: articles } = await supabase
      .from('wiki_articles')
      .select('id, topic_id')
      .in('id', articleIds)

    if (!articles?.length) return wrapResult([])

    const articleTopicMap = new Map<string, string | null>(
      (articles as any[]).map((a) => [a.id as string, a.topic_id as string | null]),
    )

    // Collect topic_ids to look up names
    const topicIds = [...new Set((articles as any[]).map((a) => a.topic_id).filter(Boolean))]

    if (!topicIds.length) return wrapResult([])

    const { data: topics } = await supabase
      .from('taxonomy_tree')
      .select('node_id, name')
      .in('node_id', topicIds)

    const topicNameMap = new Map<string, string>((topics || []).map((t: any) => [t.node_id as string, t.name as string]))

    // Aggregate reads by topic
    const topicAgg = new Map<string, { scrollDepthSum: number; durationSum: number; count: number; topicId: string }>()

    for (const read of reads as any[]) {
      const topicId = articleTopicMap.get(read.article_id as string)
      if (!topicId || !topicNameMap.has(topicId)) continue

      const scrollDepth = typeof read.read_pct === 'number' ? read.read_pct : 0
      const durationMs = typeof read.time_spent_ms === 'number' ? read.time_spent_ms : 0

      const entry = topicAgg.get(topicId) ?? { scrollDepthSum: 0, durationSum: 0, count: 0, topicId }
      entry.scrollDepthSum += scrollDepth
      entry.durationSum += durationMs
      entry.count += 1
      topicAgg.set(topicId, entry)
    }

    const rows: ReadingDepthRow[] = Array.from(topicAgg.entries())
      .map(([topicId, agg]) => ({
        topic: topicNameMap.get(topicId) ?? 'Unknown',
        articlesRead: agg.count,
        avgScrollDepth: parseFloat((agg.scrollDepthSum / agg.count).toFixed(1)),
        avgReadDuration: parseFloat((agg.durationSum / agg.count / 60_000).toFixed(1)),
      }))
      .sort((a, b) => b.articlesRead - a.articlesRead)
      .slice(0, 12)

    return wrapResult(rows)
  } catch (err) {
    console.error('[ANALYTICS] getReadingDepthData failed:', err)
    return wrapError('Failed to load reading depth data', [])
  }
}
