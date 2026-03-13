'use server';

import { createClient, getUser } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ROUTES } from '@/lib/constants/routes';
import type { DailyMissionData, SessionConfig, UserTier } from '@/types/app';

function getDefaultMission(): DailyMissionData {
  return {
    type: 'quick_session',
    label: 'Answer 20 questions to maintain momentum',
    questionCount: 20,
    estimatedMinutes: 15,
    sessionConfig: {
      timer_mode: 'none',
      shuffle_questions: true,
      show_immediate_feedback: true,
    },
    completedToday: false,
  };
}

export async function getDailyMission(
  examProfileId: string
): Promise<DailyMissionData> {
  const supabase = await createClient();
  const { data: { user } } = await getUser();
  if (!user) return getDefaultMission();

  const { data: profile } = await supabase
    .from('profiles')
    .select('tier')
    .eq('id', user.id)
    .single();

  const tier = (profile?.tier ?? 'free') as UserTier;

  const { data: examProfile } = await supabase
    .from('exam_profiles')
    .select('board_exam_id')
    .eq('id', examProfileId)
    .single();

  if (!examProfile) return getDefaultMission();

  const boardExamId = examProfile.board_exam_id as string;

  // Check if mission completed today (UTC+8 for PH timezone)
  const now = new Date();
  const phTime = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  const todayPH = phTime.toISOString().split('T')[0];

  // Priority 1: SRS Review (Paid tiers only)
  if (tier !== 'free') {
    const { count: srsDueCount } = await supabase
      .from('srs_queue')
      .select('id', { count: 'exact', head: true })
      .eq('exam_profile_id', examProfileId)
      .lte('next_review_at', new Date().toISOString());

    if (srsDueCount && srsDueCount > 0) {
      const questionCount = Math.min(srsDueCount, 30);
      const completed = await checkMissionCompleted(supabase, examProfileId, user.id, todayPH);

      return {
        type: 'srs_review',
        label: `Review ${questionCount} items before they fade`,
        questionCount,
        estimatedMinutes: Math.ceil(questionCount * 0.75),
        sessionConfig: {
          timer_mode: 'none',
          shuffle_questions: false,
          show_immediate_feedback: true,
        },
        completedToday: completed,
      };
    }
  }

  // Get subject masteries
  const { data: masteries } = await supabase
    .from('subject_mastery')
    .select('subject_id, mastery_score, total_attempted')
    .eq('exam_profile_id', examProfileId);

  const masteryList = (masteries ?? []) as Array<{
    subject_id: string;
    mastery_score: number;
    total_attempted: number;
  }>;

  // Get subjects
  const { data: subjects } = await supabase
    .from('subjects')
    .select('id, name, short_name')
    .eq('board_exam_id', boardExamId)
    .order('sort_order');

  const subjectList = (subjects ?? []) as Array<{
    id: string;
    name: string;
    short_name: string | null;
  }>;

  // Sessions in last 7 days
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { count: recentSessionCount } = await supabase
    .from('review_sessions')
    .select('id', { count: 'exact', head: true })
    .eq('exam_profile_id', examProfileId)
    .gte('created_at', weekAgo);

  // Priority 2: Weak Area Drill (Paid tiers only per tier gating)
  const weakSubjects = masteryList
    .filter((m) => m.mastery_score < 55 && m.total_attempted > 10)
    .sort((a, b) => a.mastery_score - b.mastery_score);

  if (weakSubjects.length > 0 && (recentSessionCount ?? 0) > 2 && tier !== 'free') {
    const weakSubject = weakSubjects[0];
    const subjectInfo = subjectList.find((s) => s.id === weakSubject.subject_id);
    const subjectName = subjectInfo?.short_name ?? subjectInfo?.name ?? 'Unknown';
    const completed = await checkMissionCompleted(supabase, examProfileId, user.id, todayPH);

    return {
      type: 'weak_area_drill',
      label: `Strengthen ${subjectName} — your weakest subject`,
      subjectName,
      questionCount: 20,
      estimatedMinutes: 15,
      sessionConfig: {
        subjects: [{ subject_id: weakSubject.subject_id, question_count: 20, difficulty: 'mixed' }],
        timer_mode: 'none',
        shuffle_questions: true,
        show_immediate_feedback: true,
      },
      completedToday: completed,
    };
  }

  // Priority 3: Exploration
  const answeredSubjectIds = new Set(
    masteryList.filter((m) => m.total_attempted > 0).map((m) => m.subject_id)
  );
  const unexploredSubjects = subjectList.filter((s) => !answeredSubjectIds.has(s.id));

  const totalSubjects = subjectList.length;
  const coveredSubjects = answeredSubjectIds.size;
  const coverageRatio = totalSubjects > 0 ? coveredSubjects / totalSubjects : 1;

  if (unexploredSubjects.length > 0 && coverageRatio < 0.40) {
    const exploreSubject = unexploredSubjects[0];
    const subjectName = exploreSubject.short_name ?? exploreSubject.name;
    const completed = await checkMissionCompleted(supabase, examProfileId, user.id, todayPH);

    return {
      type: 'exploration',
      label: `Discover ${subjectName} — you haven't started here yet`,
      subjectName,
      questionCount: 15,
      estimatedMinutes: 11,
      sessionConfig: {
        subjects: [{ subject_id: exploreSubject.id, question_count: 15, difficulty: 'mixed' }],
        timer_mode: 'none',
        shuffle_questions: true,
        show_immediate_feedback: true,
      },
      completedToday: completed,
    };
  }

  // Priority 4: Quick Session
  const sortedByVolume = [...masteryList].sort((a, b) => b.total_attempted - a.total_attempted);
  const topSubjectId = sortedByVolume[0]?.subject_id ?? subjectList[0]?.id;
  const topSubjectInfo = subjectList.find((s) => s.id === topSubjectId);
  const subjectName = topSubjectInfo?.short_name ?? topSubjectInfo?.name ?? 'General';
  const completed = await checkMissionCompleted(supabase, examProfileId, user.id, todayPH);

  return {
    type: 'quick_session',
    label: 'Answer 20 questions to maintain momentum',
    subjectName,
    questionCount: 20,
    estimatedMinutes: 15,
    sessionConfig: {
      subjects: topSubjectId ? [{ subject_id: topSubjectId, question_count: 20, difficulty: 'mixed' }] : [],
      timer_mode: 'none',
      shuffle_questions: true,
      show_immediate_feedback: true,
    },
    completedToday: completed,
  };
}

async function checkMissionCompleted(
  supabase: Awaited<ReturnType<typeof createClient>>,
  examProfileId: string,
  userId: string,
  todayPH: string
): Promise<boolean> {
  const { count } = await supabase
    .from('review_sessions')
    .select('id', { count: 'exact', head: true })
    .eq('exam_profile_id', examProfileId)
    .eq('user_id', userId)
    .eq('status', 'completed')
    .gte('completed_at', `${todayPH}T00:00:00+08:00`)
    .lte('completed_at', `${todayPH}T23:59:59+08:00`);

  return (count ?? 0) > 0;
}

export async function startDailyMission(
  examProfileId: string,
  sessionConfig: SessionConfig
): Promise<{ sessionId: string }> {
  const supabase = await createClient();
  const { data: { user } } = await getUser();
  if (!user) redirect(ROUTES.LOGIN);

  // Gather question IDs
  const questionIds: string[] = [];

  if (sessionConfig.subjects && sessionConfig.subjects.length > 0) {
    for (const subjectConfig of sessionConfig.subjects) {
      const { data: questions } = await supabase
        .from('questions')
        .select('id')
        .eq('subject_id', subjectConfig.subject_id)
        .eq('status', 'published')
        .limit(subjectConfig.question_count);

      if (questions) {
        for (const q of questions as Array<{ id: string }>) {
          questionIds.push(q.id);
        }
      }
    }
  }

  if (questionIds.length === 0) {
    const { data: examProfile } = await supabase
      .from('exam_profiles')
      .select('board_exam_id')
      .eq('id', examProfileId)
      .single();

    if (examProfile) {
      const { data: subjectIds } = await supabase
        .from('subjects')
        .select('id')
        .eq('board_exam_id', examProfile.board_exam_id as string);

      const sIds = (subjectIds ?? []).map((s: { id: string }) => s.id);
      if (sIds.length > 0) {
        const { data: questions } = await supabase
          .from('questions')
          .select('id')
          .in('subject_id', sIds)
          .eq('status', 'published')
          .limit(20);

        for (const q of (questions ?? []) as Array<{ id: string }>) {
          questionIds.push(q.id);
        }
      }
    }
  }

  // Shuffle
  for (let i = questionIds.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [questionIds[i], questionIds[j]] = [questionIds[j], questionIds[i]];
  }

  // Create session
  const { data: session, error: sessionError } = await supabase
    .from('review_sessions')
    .insert({
      user_id: user.id,
      exam_profile_id: examProfileId,
      session_type: 'subject_quick' as const,
      config: sessionConfig,
      name: 'Daily Mission',
      total_questions: questionIds.length,
      status: 'in_progress' as const,
    })
    .select('id')
    .single();

  if (sessionError || !session) {
    throw new Error('Failed to create session');
  }

  // Insert session questions
  const sessionQuestions = questionIds.map((qId, index) => ({
    session_id: session.id as string,
    question_id: qId,
    question_number: index + 1,
  }));

  if (sessionQuestions.length > 0) {
    await supabase.from('session_questions').insert(sessionQuestions);
  }

  return { sessionId: session.id as string };
}
