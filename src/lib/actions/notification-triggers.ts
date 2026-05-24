'use server'

import { createServiceClient, getUser } from '@/lib/supabase/server'

const ensureCurrentUser = async (userId: string) => {
  const { data: { user } } = await getUser()
  if (!user || user.id !== userId) {
    throw new Error('Unauthorized notification target')
  }
}

/**
 * Create a score_change notification when readiness score moves.
 * Called after session completion when score is recalculated.
 */
export const triggerScoreChangeNotification = async (
  userId: string,
  previousScore: number,
  newScore: number,
  topicName: string,
) => {
  if (previousScore === newScore) return
  await ensureCurrentUser(userId)

  const supabase = await createServiceClient()
  await supabase.rpc('create_notification', {
    p_user_id: userId,
    p_type: 'score_change',
    p_title: 'Your Readiness Score moved',
    p_body: `${previousScore} → ${newScore} after today's session on ${topicName}`,
    p_metadata: {
      deep_link: '/dashboard',
      old_score: previousScore,
      new_score: newScore,
      topic_name: topicName,
    },
  })
}

/**
 * Zone thresholds for readiness score.
 * Crossing a threshold triggers a zone_transition notification.
 */
const ZONE_THRESHOLDS = [
  { min: 0, max: 39, zone: 'Red', color: '#D64545' },
  { min: 40, max: 59, zone: 'Amber', color: '#D4951A' },
  { min: 60, max: 79, zone: 'Green', color: '#2D9F6F' },
  { min: 80, max: 100, zone: 'Blue', color: '#1B3FC4' },
]

const getZone = (score: number) =>
  ZONE_THRESHOLDS.find((z) => score >= z.min && score <= z.max)

export const triggerZoneTransitionNotification = async (
  userId: string,
  previousScore: number,
  newScore: number,
) => {
  await ensureCurrentUser(userId)

  const prevZone = getZone(previousScore)
  const newZone = getZone(newScore)
  if (!prevZone || !newZone || prevZone.zone === newZone.zone) return

  const direction = newScore > previousScore ? 'up' : 'down'
  const encouragement =
    direction === 'up'
      ? 'Great progress — keep building momentum.'
      : 'A dip is normal. Focus on your weakest areas.'

  const supabase = await createServiceClient()
  await supabase.rpc('create_notification', {
    p_user_id: userId,
    p_type: 'zone_transition',
    p_title: `You entered the ${newZone.zone} Zone`,
    p_body: `Your Readiness Score crossed ${newZone.min}. ${encouragement}`,
    p_metadata: {
      deep_link: '/dashboard',
      zone_name: newZone.zone,
      threshold: newZone.min,
      old_score: previousScore,
      new_score: newScore,
    },
  })
}
