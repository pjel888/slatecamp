'use server';

import { createClient } from '@/lib/supabase/server';
import type { Question } from '@/types/app';

/**
 * Ensures a profile row exists for the given user.
 * Supabase has no handle_new_user trigger, so we upsert on first access.
 */
export async function ensureProfile(userId: string, email?: string, fullName?: string) {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .single();

  if (existing) return;

  await supabase.from('profiles').insert({
    id: userId,
    email: email ?? '',
    full_name: fullName ?? null,
  });
}

/**
 * Marks onboarding as complete (on exam_profiles; profiles table has no onboarding_completed).
 * Used when a user wants to skip the entire onboarding flow.
 */
export async function skipOnboardingEntirely(userId: string) {
  const supabase = await createClient();

  await supabase
    .from('exam_profiles')
    .update({
      onboarding_completed: true,
      onboarding_step: 'onboarding_completed',
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);
}

export async function getDiagnosticQuestions(
  boardExamId: string,
  count: number = 10
): Promise<Question[]> {
  const supabase = await createClient();

  // Get top 5 subjects by question count
  const { data: subjects } = await supabase
    .from('subjects')
    .select('id')
    .eq('board_exam_id', boardExamId)
    .order('sort_order')
    .limit(5);

  const subjectIds = (subjects ?? []).map((s: { id: string }) => s.id);
  if (subjectIds.length === 0) return [];

  const diagnosticQuestions: Question[] = [];
  const questionsPerSubject = Math.ceil(count / subjectIds.length);

  for (const subjectId of subjectIds) {
    // Get 1 medium question
    const { data: mediumQ } = await supabase
      .from('questions')
      .select('*')
      .eq('subject_id', subjectId)
      .eq('status', 'published')
      .eq('difficulty', 'medium')
      .limit(1);

    if (mediumQ && mediumQ.length > 0) {
      diagnosticQuestions.push(mediumQ[0] as Question);
    }

    // Get 1 hard question
    const { data: hardQ } = await supabase
      .from('questions')
      .select('*')
      .eq('subject_id', subjectId)
      .eq('status', 'published')
      .eq('difficulty', 'hard')
      .limit(1);

    if (hardQ && hardQ.length > 0) {
      diagnosticQuestions.push(hardQ[0] as Question);
    }

    if (diagnosticQuestions.length >= count) break;
  }

  // If we don't have enough, fill with any published questions
  if (diagnosticQuestions.length < count) {
    const existingIds = diagnosticQuestions.map(q => q.id);
    const { data: fillQuestions } = await supabase
      .from('questions')
      .select('*')
      .in('subject_id', subjectIds)
      .eq('status', 'published')
      .limit(count - diagnosticQuestions.length);

    if (fillQuestions) {
      for (const q of fillQuestions as Question[]) {
        if (!existingIds.includes(q.id)) {
          diagnosticQuestions.push(q);
          if (diagnosticQuestions.length >= count) break;
        }
      }
    }
  }

  // Shuffle
  for (let i = diagnosticQuestions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [diagnosticQuestions[i], diagnosticQuestions[j]] = [diagnosticQuestions[j], diagnosticQuestions[i]];
  }

  return diagnosticQuestions.slice(0, count);
}

export async function submitDiagnostic(
  userId: string,
  boardExamId: string,
  examDate: string | null,
  answers: Array<{ questionId: string; selectedAnswer: string; isCorrect: boolean }>
): Promise<{ examProfileId: string; readinessScore: number; strongSubject: string; weakSubject: string }> {
  const supabase = await createClient();

  // Deactivate existing profiles
  await supabase
    .from('exam_profiles')
    .update({ is_active: false })
    .eq('user_id', userId);

  // Create exam profile
  const { data: examProfile, error: profileError } = await supabase
    .from('exam_profiles')
    .insert({
      user_id: userId,
      board_exam_id: boardExamId,
      target_exam_date: examDate || null,
      is_active: true,
      onboarding_completed: true,
      onboarding_step: 'onboarding_completed',
    })
    .select('id')
    .single();

  if (profileError || !examProfile) {
    throw new Error('Failed to create exam profile');
  }

  const examProfileId = examProfile.id as string;

  // Calculate diagnostic accuracy
  const totalCorrect = answers.filter(a => a.isCorrect).length;
  const totalAnswered = answers.length;
  const diagnosticAccuracy = totalAnswered > 0 ? (totalCorrect / totalAnswered) * 100 : 0;

  // Calculate weak area from diagnostic
  // Group answers by subject
  const questionIds = answers.map(a => a.questionId);
  const { data: questionSubjects } = await supabase
    .from('questions')
    .select('id, subject_id')
    .in('id', questionIds);

  const subjectPerformance: Record<string, { correct: number; total: number }> = {};
  for (const answer of answers) {
    const question = (questionSubjects ?? []).find((q: { id: string }) => q.id === answer.questionId);
    if (question) {
      const subjectId = question.subject_id as string;
      if (!subjectPerformance[subjectId]) {
        subjectPerformance[subjectId] = { correct: 0, total: 0 };
      }
      subjectPerformance[subjectId].total++;
      if (answer.isCorrect) subjectPerformance[subjectId].correct++;
    }
  }

  const subjectEntries = Object.entries(subjectPerformance);
  let weakSubjectId = '';
  let strongSubjectId = '';
  let weakScore = Infinity;
  let strongScore = -1;

  for (const [subjectId, perf] of subjectEntries) {
    const score = perf.total > 0 ? perf.correct / perf.total : 0;
    if (score < weakScore) { weakScore = score; weakSubjectId = subjectId; }
    if (score > strongScore) { strongScore = score; strongSubjectId = subjectId; }
  }

  // Get subject names
  const subjectIdsToFetch = [weakSubjectId, strongSubjectId].filter(Boolean);
  const { data: subjectNames } = await supabase
    .from('subjects')
    .select('id, name, short_name')
    .in('id', subjectIdsToFetch);

  const getSubjectName = (id: string) => {
    const s = (subjectNames ?? []).find((s: { id: string }) => s.id === id);
    return (s?.short_name ?? s?.name ?? 'Unknown') as string;
  };

  // Calculate initial readiness score (PRD formula)
  const weakAreaSubjects = subjectEntries.filter(([, p]) => p.total > 0 && (p.correct / p.total) < 0.6);
  const weakAreaPercent = subjectEntries.length > 0
    ? 100 - (weakAreaSubjects.length / subjectEntries.length) * 100
    : 100;

  const initialReadinessScore = Math.round(
    diagnosticAccuracy * 0.60 +
    20 * 0.25 +    // coverage starts at 20%
    50 * 0.20 +    // srs_health neutral
    100 * 0.15 +   // recency perfect
    weakAreaPercent * 0.10
  );

  const clampedScore = Math.max(0, Math.min(100, initialReadinessScore));

  // Save initial readiness score
  await supabase
    .from('exam_profiles')
    .update({ initial_readiness_score: clampedScore })
    .eq('id', examProfileId);

  // Save readiness snapshot
  await supabase
    .from('readiness_score_snapshots')
    .insert({
      exam_profile_id: examProfileId,
      score: clampedScore,
      sub_scores: {
        accuracy: Math.round(diagnosticAccuracy * 10) / 10,
        coverage: 20,
        srsHealth: 50,
        recency: 100,
        weakArea: Math.round(weakAreaPercent * 10) / 10,
      },
      source: 'diagnostic',
    });

  // Mark profile onboarding complete
  await supabase
    .from('profiles')
    .update({
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  // Create a session from the diagnostic answers
  const { data: session } = await supabase
    .from('review_sessions')
    .insert({
      user_id: userId,
      exam_profile_id: examProfileId,
      session_type: 'subject_quick' as const,
      config: { diagnostic: true },
      name: 'Diagnostic Assessment',
      total_questions: totalAnswered,
      questions_answered: totalAnswered,
      questions_correct: totalCorrect,
      questions_incorrect: totalAnswered - totalCorrect,
      score_percentage: diagnosticAccuracy,
      status: 'completed' as const,
      completed_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (session) {
    const sessionQuestions = answers.map((a, index) => ({
      session_id: session.id as string,
      question_id: a.questionId,
      question_number: index + 1,
      selected_answer: a.selectedAnswer,
      is_correct: a.isCorrect,
      answered_at: new Date().toISOString(),
    }));

    await supabase.from('session_questions').insert(sessionQuestions);
  }

  return {
    examProfileId,
    readinessScore: clampedScore,
    strongSubject: getSubjectName(strongSubjectId),
    weakSubject: getSubjectName(weakSubjectId),
  };
}

export async function skipDiagnosticAndComplete(
  userId: string,
  boardExamId: string,
  examDate: string | null
): Promise<{ examProfileId: string }> {
  const supabase = await createClient();

  // Deactivate existing profiles
  await supabase
    .from('exam_profiles')
    .update({ is_active: false })
    .eq('user_id', userId);

  // Normalize target_exam_date: DATE column expects YYYY-MM-DD or null
  const targetDate =
    examDate && examDate.trim() ? examDate.trim().slice(0, 10) : null;

  const { data: examProfile, error: insertError } = await supabase
    .from('exam_profiles')
    .insert({
      user_id: userId,
      board_exam_id: boardExamId,
      target_exam_date: targetDate,
      is_active: true,
      onboarding_completed: true,
      onboarding_step: 'onboarding_completed',
    })
    .select('id')
    .single();

  if (insertError) {
    throw new Error(
      insertError.message ?? 'Failed to create exam profile'
    );
  }
  if (!examProfile) {
    throw new Error('Failed to create exam profile');
  }

  await supabase
    .from('profiles')
    .update({
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  return { examProfileId: examProfile.id as string };
}
