'use server'

import { createClient, getUser } from '@/lib/supabase/server'

interface SrsReviewData {
  itemsDue: number
  subjects: string[]
  estimatedMinutes: number
}

/**
 * Get SRS review queue stats for the dashboard widget.
 * Counts items where next_review_at <= NOW().
 */
export const getSrsReviewData = async (): Promise<SrsReviewData> => {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) return { itemsDue: 0, subjects: [], estimatedMinutes: 0 }

  const now = new Date().toISOString()

  const { data: dueItems } = await supabase
    .from('user_node_mastery')
    .select('topic_id, taxonomy_tree(subject_area)')
    .eq('user_id', user.id)
    .lte('next_review_at', now)
    .gt('total_attempts', 0)

  if (!dueItems || dueItems.length === 0) {
    return { itemsDue: 0, subjects: [], estimatedMinutes: 0 }
  }

  const subjectSet = new Set<string>()
  for (const item of dueItems) {
    const subjectArea = (item.taxonomy_tree as any)?.subject_area
    if (subjectArea) subjectSet.add(subjectArea)
  }

  // Estimate ~1.5 min per item
  const estimatedMinutes = Math.max(5, Math.round(dueItems.length * 1.5))

  return {
    itemsDue: dueItems.length,
    subjects: Array.from(subjectSet),
    estimatedMinutes,
  }
}
