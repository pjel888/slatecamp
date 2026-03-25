'use server';

import { createClient, getUser } from '@/lib/supabase/server';
import type { TestMode } from '@/types/app';
import { createQuizSession } from './quiz';

export interface DailyMission {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  rewardType: 'readiness' | 'tokens' | 'badge';
  rewardValue: number;
  actionLabel: string;
  actionHref: string;
}

/**
 * Generates daily missions based on Phase 3 schema.
 * Replaces legacy profiles/review_sessions with global_stats/quiz_sessions.
 */
export async function getDailyMissions(): Promise<DailyMission[]> {
  const supabase = await createClient();
  const { data: { user } } = await getUser();
  if (!user) return [];

  // Get global stats
  const { data: stats } = await supabase
    .from('user_global_stats')
    .select('current_discipline_id')
    .eq('user_id', user.id)
    .maybeSingle();

  const disciplineId = stats?.current_discipline_id;

  // Check if today's quiz is done
  const today = new Date().toISOString().split('T')[0];
  const { data: todaySessions } = await supabase
    .from('quiz_sessions')
    .select('session_id')
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .gte('completed_at', `${today}T00:00:00Z`);

  const quizCompleted = (todaySessions?.length ?? 0) > 0;

  const missions: DailyMission[] = [
    {
      id: 'daily-practice',
      title: 'Daily Practice',
      description: 'Complete one Camp Mode session to maintain your streak.',
      isCompleted: quizCompleted,
      rewardType: 'readiness',
      rewardValue: 2,
      actionLabel: 'Start Practice',
      actionHref: '/quiz/camp/setup',
    },
    {
      id: 'wiki-explorer',
      title: 'Knowledge Builder',
      description: 'Read a new article in the Wiki today.',
      isCompleted: false, // Simple toggle for now
      rewardType: 'tokens',
      rewardValue: 50,
      actionLabel: 'Go to Wiki',
      actionHref: '/dashboard/wiki',
    }
  ];

  return missions;
}

export async function claimMissionReward(missionId: string) {
  // logic to boost readiness or tokens
  return { success: true };
}
