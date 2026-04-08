'use server'

import { createClient, getUser } from '@/lib/supabase/server'
import { wrapResult, wrapError, type AnalyticsResult } from '@/lib/actions/analytics/shared-helpers'

// ── Types ────────────────────────────────────────────────────────────────────

export interface ReadingCorrelationPoint {
  articleTitle: string
  readDurationMinutes: number
  masteryChange: number
  topicName: string
}

// ── Action ───────────────────────────────────────────────────────────────────

export const getReadingCorrelationData = async (): Promise<AnalyticsResult<ReadingCorrelationPoint[]>> => {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await getUser()
    if (!user) return wrapResult([])

    // Fetch wiki reads — graceful if table doesn't exist
    const { data: reads, error: readsError } = await supabase
      .from('wiki_article_reads')
      .select('article_id, time_spent_ms, read_pct, created_at')
      .eq('user_id', user.id)
      .not('time_spent_ms', 'is', null)
      .gt('time_spent_ms', 0)
      .order('created_at', { ascending: false })
      .limit(200)

    if (readsError || !reads?.length) return wrapResult([])

    // Fetch article metadata (title + topic_id)
    const articleIds = [...new Set((reads as any[]).map((r) => r.article_id))]

    const { data: articles } = await supabase
      .from('wiki_articles')
      .select('id, title, topic_id')
      .in('id', articleIds)

    if (!articles?.length) return wrapResult([])

    const articleMap = new Map(
      (articles as any[]).map((a) => [a.id, { title: a.title as string, topicId: a.topic_id as string | null }]),
    )

    // Fetch mastery data for topics referenced by those articles
    const topicIds = [...new Set((articles as any[]).map((a) => a.topic_id).filter(Boolean))]

    const { data: mastery } = await supabase
      .from('user_node_mastery')
      .select('topic_id, current_mastery_weight')
      .eq('user_id', user.id)
      .in('topic_id', topicIds)

    const masteryMap = new Map<string, number>(
      (mastery || []).map((m: any) => [m.topic_id as string, (m.current_mastery_weight as number) * 100]),
    )

    // Fetch topic names
    const { data: topics } = await supabase
      .from('taxonomy_tree')
      .select('node_id, name')
      .in('node_id', topicIds)

    const topicNameMap = new Map<string, string>((topics || []).map((t: any) => [t.node_id as string, t.name as string]))

    // Build correlation points — one point per unique article read
    const seen = new Set<string>()
    const points: ReadingCorrelationPoint[] = []

    for (const read of reads as any[]) {
      const articleId = read.article_id as string
      if (seen.has(articleId)) continue
      seen.add(articleId)

      const article = articleMap.get(articleId)
      if (!article) continue

      const readDurationMinutes = parseFloat(
        (((read.time_spent_ms as number) ?? 0) / 60_000).toFixed(1),
      )
      if (readDurationMinutes <= 0) continue

      const topicId = article.topicId
      const masteryChange = topicId ? parseFloat(((masteryMap.get(topicId) ?? 0)).toFixed(1)) : 0
      const topicName = topicId ? (topicNameMap.get(topicId) ?? 'Unknown') : 'Unknown'

      points.push({
        articleTitle: article.title,
        readDurationMinutes,
        masteryChange,
        topicName,
      })
    }

    return wrapResult(points)
  } catch (err) {
    console.error('[ANALYTICS] getReadingCorrelationData failed:', err)
    return wrapError('Failed to load reading correlation data', [])
  }
}
