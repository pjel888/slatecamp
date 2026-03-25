'use server';

import { createClient, getUser } from '@/lib/supabase/server';

export async function getQuestionSocialProof(
  questionId: string
): Promise<{
  weeklyAttempts: number;
  weeklyAccuracy: number;
}> {
  const { data: { user } } = await getUser()
  if (!user) return { weeklyAttempts: 0, weeklyAccuracy: 0 }
  const supabase = await createClient();
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data: attempts } = await supabase
    .from('user_interactions')
    .select('is_correct')
    .eq('question_id', questionId)
    .gte('interaction_timestamp', weekAgo);

  const total = (attempts ?? []).length;
  const correct = (attempts ?? []).filter((a: { is_correct: boolean }) => a.is_correct === true).length;

  return {
    weeklyAttempts: total,
    weeklyAccuracy: total > 0 ? correct / total : 0,
  };
}

export async function getTopicDailyStudiers(
  topicId: string
): Promise<number> {
  const { data: { user } } = await getUser()
  if (!user) return 0
  const supabase = await createClient();
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data: users } = await supabase
    .from('user_interactions')
    .select('user_id')
    .eq('topic_id', topicId)
    .gte('interaction_timestamp', oneDayAgo);

  const uniqueUsers = new Set((users ?? []).map((u: { user_id: string }) => u.user_id));
  return uniqueUsers.size;
}

/** Batch version for dashboard subject cards. Returns topicId -> count. */
export async function getTopicDailyStudiersBatch(
  topicIds: string[]
): Promise<Record<string, number>> {
  const { data: { user } } = await getUser()
  if (!user) return {}
  if (topicIds.length === 0) return {};
  const results = await Promise.all(
    topicIds.map(async (id) => {
      const count = await getTopicDailyStudiers(id);
      return { id, count };
    })
  );
  return Object.fromEntries(results.map((r) => [r.id, r.count]));
}
