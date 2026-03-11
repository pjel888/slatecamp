'use server';

import { createClient, getUser } from '@/lib/supabase/server';

export async function generateSessionInsight(
  sessionId: string,
  examProfileId: string
): Promise<string> {
  const supabase = await createClient();
  const { data: { user } } = await getUser();
  if (!user) return 'Every question makes you stronger.';

  // Get session data
  const { data: session } = await supabase
    .from('review_sessions')
    .select('score_percentage, questions_correct, total_questions, session_type, source_subject_id')
    .eq('id', sessionId)
    .single();

  if (!session) return 'Every question makes you stronger.';

  // Get streak
  const { data: profile } = await supabase
    .from('exam_profiles')
    .select('daily_streak')
    .eq('id', examProfileId)
    .single();

  const streak = (profile?.daily_streak as number) ?? 0;

  // Check if first session
  const { count: sessionCount } = await supabase
    .from('review_sessions')
    .select('id', { count: 'exact', head: true })
    .eq('exam_profile_id', examProfileId)
    .eq('status', 'completed');

  if ((sessionCount ?? 0) <= 1) {
    return 'Your first session sets the baseline. Every question from here makes you stronger.';
  }

  // Check streak
  if (streak >= 3) {
    return `Day ${streak} streak — consistency is your superpower.`;
  }

  // Coverage milestone
  const { data: subjectIds } = await supabase
    .from('subjects')
    .select('id')
    .eq('board_exam_id', (await supabase
      .from('exam_profiles')
      .select('board_exam_id')
      .eq('id', examProfileId)
      .single()).data?.board_exam_id as string);

  const sIds = (subjectIds ?? []).map((s: { id: string }) => s.id);

  if (sIds.length > 0) {
    const { data: answered } = await supabase
      .from('session_questions')
      .select('question_id, session_id')
      .not('is_correct', 'is', null);

    // Get sessions for this profile
    const { data: profileSessions } = await supabase
      .from('review_sessions')
      .select('id')
      .eq('exam_profile_id', examProfileId);

    const profileSessionIds = new Set((profileSessions ?? []).map((s: { id: string }) => s.id));
    const uniqueQs = new Set(
      (answered ?? [])
        .filter((a: { session_id: string }) => profileSessionIds.has(a.session_id))
        .map((a: { question_id: string }) => a.question_id)
    );

    const count = uniqueQs.size;
    if (count > 0 && count % 50 === 0) {
      return `You've now answered ${count} unique questions. Keep going.`;
    }
  }

  // Subject improvement
  if (session.source_subject_id) {
    const { data: subjectInfo } = await supabase
      .from('subjects')
      .select('name, short_name')
      .eq('id', session.source_subject_id)
      .single();

    const subjectName = (subjectInfo?.short_name ?? subjectInfo?.name ?? 'this subject') as string;
    const score = (session.score_percentage as number) ?? 0;

    if (score >= 80) {
      return `Your accuracy in ${subjectName} is looking strong. Keep it up!`;
    }
  }

  // Default based on score
  const score = (session.score_percentage as number) ?? 0;
  if (score >= 80) return 'Excellent performance. You\'re building real momentum.';
  if (score >= 60) return 'Solid session. Focus on the questions you missed to level up.';
  return 'Every session builds knowledge. Review the questions you missed.';
}
