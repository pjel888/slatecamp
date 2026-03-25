/**
 * Trail read queries — NOT server actions.
 * These are plain async functions safe to call from server components
 * without the 'use server' serialization boundary.
 *
 * Mutations (enroll, pause, abandon, complete) stay in @/lib/actions/trails.ts
 */

import { createClient, getUser } from '@/lib/supabase/server'
import { getSubjectName } from '@/types/testing'
import type {
  CampTrail,
  TrailDay,
  TrailStep,
  TrailEnrollment,
  TrailProgress,
  TrailDayCompletion,
  TrailRecommendation,
  TrailIntensity,
  ScorePoint,
  DayCompletionData,
  NodeMasteryState,
} from '@/types/app'

// ============================================================
// Trail Library
// ============================================================

export const getPublishedTrails = async (): Promise<CampTrail[]> => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('camp_trails')
    .select('*')
    .eq('is_published', true)
    .order('is_featured', { ascending: false })
    .order('duration_days', { ascending: true })

  if (error) {
    console.error('[getPublishedTrails]', error.message, error.code)
    return []
  }
  return (data || []) as CampTrail[]
}

export const getTrailBySlug = async (slug: string): Promise<CampTrail | null> => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('camp_trails')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) return null
  return data as CampTrail
}

export const getTrailDays = async (trailId: string): Promise<TrailDay[]> => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('trail_days')
    .select('*, trail_steps(*)')
    .eq('trail_id', trailId)
    .order('day_number', { ascending: true })

  if (error) {
    console.error('[getTrailDays]', error.message, error.code)
    return []
  }
  return (data || []).map((d: any) => ({
    ...d,
    steps: (d.trail_steps || []).sort((a: TrailStep, b: TrailStep) => a.step_order - b.step_order),
  })) as TrailDay[]
}

// ============================================================
// Enrollment Queries
// ============================================================

export const getUserEnrollments = async (): Promise<TrailEnrollment[]> => {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('user_trail_enrollments')
    .select('*, camp_trails(*)')
    .eq('user_id', user.id)
    .in('status', ['active', 'paused'])
    .order('started_at', { ascending: false })

  if (error) {
    console.error('[getUserEnrollments]', error.message, error.code)
    return []
  }
  return (data || []) as TrailEnrollment[]
}

export const getEnrollmentForTrail = async (trailId: string): Promise<TrailEnrollment | null> => {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('user_trail_enrollments')
    .select('*, camp_trails(*)')
    .eq('user_id', user.id)
    .eq('trail_id', trailId)
    .maybeSingle()

  if (error) return null
  return data as TrailEnrollment | null
}

export const getStepProgress = async (enrollmentId: string): Promise<TrailProgress[]> => {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('user_trail_progress')
    .select('*')
    .eq('enrollment_id', enrollmentId)
    .eq('user_id', user.id)

  if (error) return []
  return (data || []) as TrailProgress[]
}

export const getDayCompletions = async (enrollmentId: string): Promise<string[]> => {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('trail_day_completions')
    .select('day_id')
    .eq('enrollment_id', enrollmentId)

  if (error) return []
  return (data || []).map((d: any) => d.day_id)
}

export const getFullDayCompletions = async (enrollmentId: string): Promise<TrailDayCompletion[]> => {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('trail_day_completions')
    .select('*')
    .eq('enrollment_id', enrollmentId)
    .order('day_number', { ascending: true })

  if (error) return []
  return (data || []) as TrailDayCompletion[]
}

// ============================================================
// Day Completion Detail
// ============================================================

export const getDayCompletionDetail = async (
  enrollmentId: string,
  dayNumber: number,
): Promise<DayCompletionData | null> => {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) return null

  const { data: completion } = await supabase
    .from('trail_day_completions')
    .select('*, trail_days!inner(day_id, day_number, title, subject_focus, estimated_minutes, trail_id)')
    .eq('enrollment_id', enrollmentId)
    .eq('day_number', dayNumber)
    .single()

  if (!completion) return null

  const trailDay = (completion as any).trail_days
  const trailId = trailDay?.trail_id

  let nextDay: DayCompletionData['next_day'] = null
  if (trailId) {
    const { data: next } = await supabase
      .from('trail_days')
      .select('day_number, title, estimated_minutes, trail_steps(step_id)')
      .eq('trail_id', trailId)
      .eq('day_number', dayNumber + 1)
      .single()

    if (next) {
      nextDay = {
        day_number: next.day_number,
        title: next.title,
        estimated_minutes: next.estimated_minutes,
        step_count: (next.trail_steps as any[])?.length ?? 0,
      }
    }
  }

  return {
    day_number: dayNumber,
    subject_focus: trailDay?.subject_focus ?? null,
    mastery_before: (completion.mastery_before as Record<string, number>) ?? {},
    mastery_after: (completion.mastery_after as Record<string, number>) ?? {},
    nodes_updated: [],
    next_day: nextDay,
  }
}

// ============================================================
// Score Trajectory
// ============================================================

export const getScoreTrajectory = async (enrollmentId: string): Promise<ScorePoint[]> => {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('trail_day_completions')
    .select('day_number, readiness_score_at_completion, completed_at')
    .eq('enrollment_id', enrollmentId)
    .not('readiness_score_at_completion', 'is', null)
    .order('day_number', { ascending: true })

  if (error) return []

  return (data || []).map((d: any) => ({
    day_number: d.day_number ?? 0,
    score: d.readiness_score_at_completion ?? 0,
    completed_at: d.completed_at,
  }))
}

// ============================================================
// Recommendation Engine
// ============================================================

export const recommendTrail = async (): Promise<TrailRecommendation | null> => {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) return null

  const { data: stats } = await supabase
    .from('user_global_stats')
    .select('global_readiness_score, target_exam_date, assessment_score')
    .eq('user_id', user.id)
    .single()

  if (!stats) return null

  const readinessScore = stats.assessment_score ?? stats.global_readiness_score ?? 0
  const targetExamDate = stats.target_exam_date ? new Date(stats.target_exam_date) : null

  const daysToExam = targetExamDate
    ? Math.ceil((targetExamDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null

  let recommendedIntensity: TrailIntensity

  if (!daysToExam || daysToExam > 180) {
    recommendedIntensity = 'undergraduate'
  } else if (daysToExam <= 14) {
    recommendedIntensity = 'intensive'
  } else if (daysToExam <= 28) {
    recommendedIntensity = readinessScore >= 65 ? 'intensive' : 'accelerated'
  } else if (daysToExam <= 56) {
    recommendedIntensity = readinessScore >= 65 ? 'accelerated' : 'standard'
  } else if (daysToExam <= 84) {
    recommendedIntensity = readinessScore >= 50 ? 'standard' : 'comprehensive'
  } else {
    recommendedIntensity = readinessScore >= 50 ? 'standard' : 'comprehensive'
  }

  const { data: trails } = await supabase
    .from('camp_trails')
    .select('*')
    .eq('is_published', true)
    .eq('intensity', recommendedIntensity)
    .limit(1)

  let matchedTrail: CampTrail | null = trails?.[0] as CampTrail ?? null
  if (!matchedTrail) {
    const { data: fallback } = await supabase
      .from('camp_trails')
      .select('*')
      .eq('is_published', true)
      .order('is_featured', { ascending: false })
      .limit(1)
    matchedTrail = fallback?.[0] as CampTrail ?? null
  }

  if (!matchedTrail) return null

  const { data: mastery } = await supabase
    .from('user_node_mastery')
    .select('topic_id, current_mastery_weight')
    .eq('user_id', user.id)
    .order('current_mastery_weight', { ascending: true })
    .limit(1)

  let weakestSubjectName = 'your weakest area'
  if (mastery?.[0]) {
    const { data: node } = await supabase
      .from('taxonomy_tree')
      .select('subject_area')
      .eq('node_id', mastery[0].topic_id)
      .single()
    if (node?.subject_area) weakestSubjectName = getSubjectName(node.subject_area)
  }

  const daysText = daysToExam ? `${daysToExam} days until your exam` : 'no exam date set'
  const scoreText = Math.round(readinessScore)

  return {
    trail: matchedTrail,
    reasoning: `Based on your score of ${scoreText}% and ${daysText}, the ${matchedTrail.name} is the right fit.`,
    weekOnePreview: `Week 1 focuses on ${weakestSubjectName} — your biggest gap.`,
  }
}

// ============================================================
// Node Mastery States
// ============================================================

export const getTodayNodeStates = async (nodeIds: string[]): Promise<NodeMasteryState[]> => {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user || nodeIds.length === 0) return []

  const { data, error } = await supabase
    .from('user_node_mastery')
    .select('topic_id, current_mastery_weight, last_encountered')
    .eq('user_id', user.id)
    .in('topic_id', nodeIds)

  if (error) return []

  return (data || []).map((d: any) => {
    const weight = d.current_mastery_weight ?? 0
    let level: NodeMasteryState['mastery_level'] = 'grey'
    if (weight >= 0.8) level = 'green'
    else if (weight >= 0.5) level = 'amber'
    else if (weight > 0) level = 'red'

    return {
      node_id: d.topic_id,
      mastery_level: level,
      current_mastery_weight: weight,
      last_encountered: d.last_encountered,
    }
  })
}
