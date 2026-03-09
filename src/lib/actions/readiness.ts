'use server';

import { createClient } from '@/lib/supabase/server';
import { getReadinessLabel, getReadinessColor } from '@/lib/constants/readiness';
import type { ReadinessScoreData, UserTier } from '@/types/app';

const EMPTY_RESULT: ReadinessScoreData = {
  score: 0,
  previousScore: null,
  subScores: { accuracy: 0, coverage: 0, srsHealth: 50, recency: 0, weakArea: 100 },
  label: 'Needs Work',
  color: 'var(--color-signal-red)',
};

export async function getReadinessScore(
  examProfileId: string
): Promise<ReadinessScoreData> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return EMPTY_RESULT;

  // Get user tier
  const { data: profile } = await supabase
    .from('profiles')
    .select('tier')
    .eq('id', user.id)
    .single();

  const tier = (profile?.tier ?? 'free') as UserTier;

  // Get exam profile's board_exam_id
  const { data: examProfile } = await supabase
    .from('exam_profiles')
    .select('board_exam_id')
    .eq('id', examProfileId)
    .single();

  if (!examProfile) return EMPTY_RESULT;

  const boardExamId = examProfile.board_exam_id as string;

  // Get all session IDs for this exam profile
  const { data: profileSessions } = await supabase
    .from('review_sessions')
    .select('id')
    .eq('exam_profile_id', examProfileId);

  const sessionIds = (profileSessions ?? []).map((s: { id: string }) => s.id);

  // Accuracy: rolling 30-day
  let accuracy = 0;
  if (sessionIds.length > 0) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data: recentQuestions } = await supabase
      .from('session_questions')
      .select('is_correct')
      .in('session_id', sessionIds)
      .not('is_correct', 'is', null)
      .gte('answered_at', thirtyDaysAgo);

    const answered = recentQuestions ?? [];
    const totalAnswered = answered.length;
    const totalCorrect = answered.filter((q: { is_correct: boolean | null }) => q.is_correct === true).length;
    accuracy = totalAnswered > 0 ? (totalCorrect / totalAnswered) * 100 : 0;
  }

  // Coverage
  const { data: subjectIds } = await supabase
    .from('subjects')
    .select('id')
    .eq('board_exam_id', boardExamId);

  const subIds = (subjectIds ?? []).map((s: { id: string }) => s.id);

  let coverage = 0;
  if (subIds.length > 0) {
    const { count: totalQuestions } = await supabase
      .from('questions')
      .select('id', { count: 'exact', head: true })
      .in('subject_id', subIds)
      .eq('status', 'published');

    let uniqueAnsweredCount = 0;
    if (sessionIds.length > 0) {
      const { data: answeredQuestions } = await supabase
        .from('session_questions')
        .select('question_id')
        .in('session_id', sessionIds)
        .not('is_correct', 'is', null);

      const uniqueSet = new Set((answeredQuestions ?? []).map((q: { question_id: string }) => q.question_id));
      uniqueAnsweredCount = uniqueSet.size;
    }

    coverage = (totalQuestions ?? 0) > 0
      ? (uniqueAnsweredCount / (totalQuestions ?? 1)) * 100
      : 0;
  }

  // SRS Health (Free tier: defaults to 50)
  let srsHealth = 50;
  if (tier !== 'free') {
    const { count: srsTotal } = await supabase
      .from('srs_queue')
      .select('id', { count: 'exact', head: true })
      .eq('exam_profile_id', examProfileId);

    if (srsTotal && srsTotal > 0) {
      const { count: srsNotOverdue } = await supabase
        .from('srs_queue')
        .select('id', { count: 'exact', head: true })
        .eq('exam_profile_id', examProfileId)
        .gte('next_review_at', new Date().toISOString());

      srsHealth = ((srsNotOverdue ?? 0) / srsTotal) * 100;
    }
  }

  // Recency
  const { data: lastSession } = await supabase
    .from('review_sessions')
    .select('completed_at')
    .eq('exam_profile_id', examProfileId)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(1)
    .single();

  let recency = 0;
  if (lastSession?.completed_at) {
    const daysSince = (Date.now() - new Date(lastSession.completed_at as string).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince < 1) recency = 100;
    else if (daysSince < 2) recency = 80;
    else if (daysSince < 4) recency = 60;
    else if (daysSince < 8) recency = 40;
    else if (daysSince < 15) recency = 20;
    else recency = 0;
  }

  // Weak Area
  const { data: masteries } = await supabase
    .from('subject_mastery')
    .select('mastery_score, total_attempted')
    .eq('exam_profile_id', examProfileId)
    .gt('total_attempted', 0);

  let weakArea = 100;
  const masteryList = masteries ?? [];
  if (masteryList.length > 0) {
    const weakCount = masteryList.filter((m: { mastery_score: number }) => m.mastery_score < 60).length;
    weakArea = 100 - (weakCount / masteryList.length) * 100;
  }

  // Compute final score
  const finalScore = Math.round(
    accuracy * 0.30 +
    coverage * 0.25 +
    srsHealth * 0.20 +
    recency * 0.15 +
    weakArea * 0.10
  );

  const clampedScore = Math.max(0, Math.min(100, finalScore));

  // Get previous score (24h ago snapshot)
  const { data: previousSnapshot } = await supabase
    .from('readiness_score_snapshots')
    .select('score')
    .eq('exam_profile_id', examProfileId)
    .lt('computed_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .order('computed_at', { ascending: false })
    .limit(1)
    .single();

  // Save current snapshot
  await supabase
    .from('readiness_score_snapshots')
    .insert({
      exam_profile_id: examProfileId,
      score: clampedScore,
      sub_scores: {
        accuracy: Math.round(accuracy * 10) / 10,
        coverage: Math.round(coverage * 10) / 10,
        srsHealth: Math.round(srsHealth * 10) / 10,
        recency: Math.round(recency * 10) / 10,
        weakArea: Math.round(weakArea * 10) / 10,
      },
      source: 'session_complete',
    });

  return {
    score: clampedScore,
    previousScore: (previousSnapshot?.score as number) ?? null,
    subScores: {
      accuracy: Math.round(accuracy * 10) / 10,
      coverage: Math.round(coverage * 10) / 10,
      srsHealth: Math.round(srsHealth * 10) / 10,
      recency: Math.round(recency * 10) / 10,
      weakArea: Math.round(weakArea * 10) / 10,
    },
    label: getReadinessLabel(clampedScore),
    color: getReadinessColor(clampedScore),
  };
}
