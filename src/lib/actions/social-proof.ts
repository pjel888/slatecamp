'use server';

import { createClient } from '@/lib/supabase/server';

export async function getQuestionSocialProof(
  questionId: string
): Promise<{
  weeklyAttempts: number;
  weeklyAccuracy: number;
}> {
  const supabase = await createClient();
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data: attempts } = await supabase
    .from('session_questions')
    .select('is_correct')
    .eq('question_id', questionId)
    .not('is_correct', 'is', null)
    .gte('answered_at', weekAgo);

  const total = (attempts ?? []).length;
  const correct = (attempts ?? []).filter((a: { is_correct: boolean | null }) => a.is_correct === true).length;

  return {
    weeklyAttempts: total,
    weeklyAccuracy: total > 0 ? correct / total : 0,
  };
}

export async function getSubjectDailyStudiers(
  subjectId: string
): Promise<number> {
  const supabase = await createClient();
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data: sqRows } = await supabase
    .from('session_questions')
    .select('session_id')
    .eq('subject_id', subjectId)
    .gte('answered_at', oneDayAgo);

  const sessionIds = [...new Set((sqRows ?? []).map((r: { session_id: string }) => r.session_id))];
  if (sessionIds.length === 0) return 0;

  const { data: sessions } = await supabase
    .from('review_sessions')
    .select('user_id')
    .in('id', sessionIds);

  const uniqueUsers = new Set((sessions ?? []).map((s: { user_id: string }) => s.user_id));
  return uniqueUsers.size;
}

/** Batch version for dashboard subject cards. Returns subjectId -> count. */
export async function getSubjectDailyStudiersBatch(
  subjectIds: string[]
): Promise<Record<string, number>> {
  if (subjectIds.length === 0) return {};
  const results = await Promise.all(
    subjectIds.map(async (id) => {
      const count = await getSubjectDailyStudiers(id);
      return { id, count };
    })
  );
  return Object.fromEntries(results.map((r) => [r.id, r.count]));
}
