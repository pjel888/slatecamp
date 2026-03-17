'use server';

import { createClient, getUser } from '@/lib/supabase/server';
import { getReadinessLabel, getReadinessColor } from '@/lib/constants/readiness';
import type { ReadinessScoreData } from '@/types/app';

const EMPTY_RESULT: ReadinessScoreData = {
  score: 0,
  previousScore: null,
  subScores: { accuracy: 0, coverage: 0, srsHealth: 50, recency: 0, weakArea: 100 },
  label: 'Keep Practicing',
  color: 'var(--danger)',
};

/**
 * Calculates Readiness Score using Phase 3 schema.
 * Replaces legacy tables with user_global_stats, user_node_mastery, and quiz_sessions.
 */
export async function getReadinessScore(): Promise<ReadinessScoreData> {
  const supabase = await createClient();
  const { data: { user } } = await getUser();
  if (!user) return EMPTY_RESULT;

  // 1. Get Global Stats
  const { data: stats } = await supabase
    .from('user_global_stats')
    .select('global_readiness_score, current_discipline_id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!stats?.current_discipline_id) return EMPTY_RESULT;

  // 2. Accuracy & Coverage (Last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data: interactions } = await supabase
    .from('user_interactions')
    .select('is_correct, question_id')
    .eq('user_id', user.id)
    .gte('interaction_timestamp', thirtyDaysAgo);

  const totalAnswered = interactions?.length || 0;
  const totalCorrect = interactions?.filter((i: any) => i.is_correct).length || 0;
  const accuracy = totalAnswered > 0 ? (totalCorrect / totalAnswered) * 100 : 0;

  // 3. Coverage (Total distinct questions in discipline)
  const { count: totalQuestions } = await supabase
    .from('questions')
    .select('question_id', { count: 'exact', head: true })
    .not('question_id', 'is', null); // Simple count for v1

  const distinctAnswered = new Set(interactions?.map((i: any) => i.question_id) || []).size;
  const coverage = totalQuestions ? (distinctAnswered / totalQuestions) * 100 : 0;

  // 4. Recency (Days since last session)
  const { data: lastSession } = await supabase
    .from('quiz_sessions')
    .select('completed_at')
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  let recency = 0;
  if (lastSession?.completed_at) {
    const daysSince = (Date.now() - new Date(lastSession.completed_at).getTime()) / (1000 * 60 * 60 * 24);
    recency = Math.max(0, 100 - (daysSince * 10)); // Lose 10% per day away
  }

  // 5. Weak Area (Analysis of user_node_mastery)
  const { data: nodes } = await supabase
    .from('user_node_mastery')
    .select('current_mastery_weight')
    .eq('user_id', user.id);

  let weakArea = 100;
  if (nodes && nodes.length > 0) {
    const criticalNodes = nodes.filter((n: any) => n.current_mastery_weight < 0.6).length;
    weakArea = 100 - (criticalNodes / nodes.length) * 100;
  }

  // Final Composite
  const finalScore = Math.round(
    accuracy * 0.40 +
    coverage * 0.30 +
    recency * 0.20 +
    weakArea * 0.10
  );

  const clampedScore = Math.max(0, Math.min(100, finalScore));

  // Previous Score (from snapshots)
  const { data: previous } = await supabase
    .from('readiness_score_snapshots')
    .select('score')
    .eq('user_id', user.id)
    .order('computed_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return {
    score: clampedScore,
    previousScore: previous?.score || null,
    subScores: {
      accuracy: Math.round(accuracy),
      coverage: Math.round(coverage),
      srsHealth: 50, // Static for now until SRS migration
      recency: Math.round(recency),
      weakArea: Math.round(weakArea),
    },
    label: getReadinessLabel(clampedScore),
    color: getReadinessColor(clampedScore),
  };
}
