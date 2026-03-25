'use server';

import { createClient, getUser } from '@/lib/supabase/server';
import type { Question, TestMode } from '@/types/app';
import { createQuizSession, saveInteraction } from './quiz';

/**
 * Ensures user stats and subscription exist.
 */
export async function ensureProfile(userId: string) {
  try {
    const supabase = await createClient();

    // Ensure global stats
    const { data: stats } = await supabase
      .from('user_global_stats')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (!stats) {
      const { data: disciplines } = await supabase.from('disciplines').select('discipline_id').limit(1);
      await supabase.from('user_global_stats').insert({
        user_id: userId,
        current_discipline_id: disciplines?.[0]?.discipline_id || null,
        global_readiness_score: 0,
      });
    }

    // Ensure subscription
    const { data: sub } = await supabase
      .from('user_subscriptions')
      .select('subscription_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (!sub) {
      await supabase.from('user_subscriptions').insert({
        user_id: userId,
        tier: 'free',
        status: 'active',
      });
    }
  } catch (err) {
    console.error('[ONBOARDING: ensureProfile]', err)
  }
}

export async function getDiagnosticQuestions(
  disciplineId: string,
  count: number = 10
): Promise<Question[]> {
  try {
    const supabase = await createClient();

    // Get top-level taxonomy nodes (subjects)
    const { data: nodes } = await supabase
      .from('taxonomy_tree')
      .select('node_id')
      .eq('discipline_id', disciplineId)
      .eq('level', 1)
      .eq('is_cross_ref_only', false)
      .is('deprecated_at', null)
      .not('ale_id', 'is', null)
      .limit(5);

    const nodeIds = (nodes ?? []).map((n: any) => n.node_id);
    if (nodeIds.length === 0) return [];

    // Fetch questions from these areas
    const { data: questions, error } = await supabase
      .from('questions')
      .select('*')
      .in('topic_id', nodeIds)
      .limit(count * 2);

    if (error || !questions) return [];

    // Shuffle and return count
    return questions.sort(() => 0.5 - Math.random()).slice(0, count) as Question[];
  } catch (err) {
    console.error('[ONBOARDING: getDiagnosticQuestions]', err)
    return []
  }
}

export async function submitDiagnostic(
  userId: string,
  disciplineId: string,
  answers: Array<{ questionId: string; selectedAnswer: string; isCorrect: boolean; topicId: string; timeSpentMs: number }>
): Promise<{ readinessScore: number } | { error: string }> {
  try {
    const supabase = await createClient();

    // 1. Calculate accuracy
    const totalCorrect = answers.filter(a => a.isCorrect).length;
    const diagnosticAccuracy = answers.length > 0 ? (totalCorrect / answers.length) * 100 : 0;

    // 2. Create a completed quiz session
    const newSession = await createQuizSession({
      discipline_id: disciplineId,
      test_mode: 'camp' as TestMode,
      question_ids: answers.map(a => a.questionId),
      config: { diagnostic: true },
    });

    // 3. Save interactions
    for (const ans of answers) {
      await saveInteraction({
        session_id: newSession.session_id,
        question_id: ans.questionId,
        topic_id: ans.topicId,
        selected_option_id: ans.selectedAnswer,
        is_correct: ans.isCorrect,
        time_spent_ms: ans.timeSpentMs,
      });
    }

    // 4. Update session status to completed
    await supabase
      .from('quiz_sessions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('session_id', newSession.session_id);

    // 5. Update global readiness score (simplified for now)
    const finalScore = Math.round(diagnosticAccuracy);
    await supabase
      .from('user_global_stats')
      .update({ global_readiness_score: finalScore })
      .eq('user_id', userId);

    return { readinessScore: finalScore };
  } catch (err) {
    console.error('[ONBOARDING: submitDiagnostic]', err)
    return { error: 'Something went wrong. Please try again.' }
  }
}
