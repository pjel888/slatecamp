'use server';

import { createClient, getUser } from '@/lib/supabase/server';

export async function generateSessionInsight(
  sessionId: string
): Promise<string> {
  const supabase = await createClient();
  const { data: { user } } = await getUser();
  if (!user) return 'Every question makes you stronger.';

  // Get session data
  const { data: session } = await supabase
    .from('quiz_sessions')
    .select('status, test_mode')
    .eq('session_id', sessionId)
    .maybeSingle();

  if (!session) return 'Every question makes you stronger.';

  // Get streak from global stats
  const { data: stats } = await supabase
    .from('user_global_stats')
    .select('current_streak_days, global_readiness_score')
    .eq('user_id', user.id)
    .maybeSingle();

  const streak = stats?.current_streak_days ?? 0;

  // Check if first session
  const { count: sessionCount } = await supabase
    .from('quiz_sessions')
    .select('session_id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'completed');

  if ((sessionCount ?? 0) <= 1) {
    return 'Your first session sets the baseline. Every question from here makes you stronger.';
  }

  // Check streak
  if (streak >= 3) {
    return `Day ${streak} streak — consistency is your superpower.`;
  }

  // Coverage milestone heuristic
  const { count: interactionCount } = await supabase
    .from('user_interactions')
    .select('interaction_id', { count: 'exact', head: true })
    .eq('user_id', user.id);

  if (interactionCount && interactionCount > 0 && interactionCount % 50 === 0) {
    return `You've now answered ${interactionCount} questions. Keep going.`;
  }

  // Score based insight if session is completed
  const { data: interactionResults } = await supabase
    .from('user_interactions')
    .select('is_correct')
    .eq('session_id', sessionId);

  if (interactionResults && interactionResults.length > 0) {
    const correct = interactionResults.filter((i: any) => i.is_correct).length;
    const accuracy = (correct / interactionResults.length) * 100;

    if (accuracy >= 80) return 'Excellent performance. You\'re building real momentum.';
    if (accuracy >= 60) return 'Solid session. Focus on the questions you missed to level up.';
  }

  return 'Every session builds knowledge. Review the questions you missed.';
}
