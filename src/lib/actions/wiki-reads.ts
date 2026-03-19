'use server'

import { createClient } from '@/lib/supabase/server'

/**
 * Record that the current user opened a wiki article.
 * Returns the read_id for subsequent progress updates.
 */
export const recordArticleRead = async (params: {
  articleId: string
  trailStepId?: string
}): Promise<{ readId: string | null }> => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { readId: null }

  const { data, error } = await supabase
    .from('wiki_article_reads')
    .insert({
      user_id: user.id,
      article_id: params.articleId,
      trail_step_id: params.trailStepId ?? null,
    })
    .select('read_id')
    .single()

  if (error) {
    console.error('[Wiki] recordArticleRead failed:', error.message)
    return { readId: null }
  }

  return { readId: data.read_id }
}

/**
 * Update read progress (scroll depth and time spent).
 * Called on page unload / visibility change.
 */
export const updateReadProgress = async (params: {
  readId: string
  readPct: number
  timeSpentMs: number
}): Promise<void> => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { error } = await supabase
    .from('wiki_article_reads')
    .update({
      read_pct: Math.min(100, Math.max(0, Math.round(params.readPct))),
      time_spent_ms: Math.max(0, Math.round(params.timeSpentMs)),
    })
    .eq('read_id', params.readId)
    .eq('user_id', user.id)

  if (error) {
    console.error('[Wiki] updateReadProgress failed:', error.message)
  }
}
