'use server'

import { createClient, getUser } from '@/lib/supabase/server'

/**
 * When a topic has no questions available for review, push its optimal_review_at
 * 30 days into the future so it stops showing in the Review Calendar.
 * It will naturally reappear if/when questions are added for that topic.
 */
export const dismissEmptyTopic = async (topicId: string): Promise<void> => {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) return

  const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

  await supabase
    .from('user_node_mastery')
    .update({
      optimal_review_at: futureDate,
      predicted_recall: 0.9, // Mark as "safe" so it doesn't show as overdue
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', user.id)
    .eq('topic_id', topicId)
}
