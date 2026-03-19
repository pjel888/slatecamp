'use server'

import { createClient, getUser } from '@/lib/supabase/server'
import type {
  CampTrail,
  TrailDay,
  TrailStep,
  TrailEnrollment,
  TrailProgress,
  TrailRecommendation,
  TrailIntensity,
} from '@/types/app'
import { revalidatePath } from 'next/cache'

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

  if (error) throw error
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

  if (error) throw error
  return (data || []).map((d: any) => ({
    ...d,
    steps: (d.trail_steps || []).sort((a: TrailStep, b: TrailStep) => a.step_order - b.step_order),
  })) as TrailDay[]
}

// ============================================================
// Enrollment
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

  if (error) throw error
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

export const enrollInTrail = async (trailId: string): Promise<TrailEnrollment> => {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) throw new Error('Unauthorized')

  // Get trail for duration
  const { data: trail } = await supabase
    .from('camp_trails')
    .select('duration_days')
    .eq('trail_id', trailId)
    .single()

  // Get current readiness score
  const { data: stats } = await supabase
    .from('user_global_stats')
    .select('global_readiness_score')
    .eq('user_id', user.id)
    .single()

  const now = new Date()
  const targetDate = trail
    ? new Date(now.getTime() + trail.duration_days * 24 * 60 * 60 * 1000)
    : null

  const { data, error } = await supabase
    .from('user_trail_enrollments')
    .insert({
      user_id: user.id,
      trail_id: trailId,
      status: 'active',
      current_day: 1,
      days_completed: 0,
      started_at: now.toISOString(),
      target_completion_date: targetDate?.toISOString() || null,
      readiness_score_at_start: stats?.global_readiness_score || 0,
    })
    .select('*, camp_trails(*)')
    .single()

  if (error) throw error
  revalidatePath('/dashboard/trails')
  revalidatePath('/dashboard')
  return data as TrailEnrollment
}

// ============================================================
// Progress Tracking
// ============================================================

export const getStepProgress = async (enrollmentId: string): Promise<TrailProgress[]> => {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('user_trail_progress')
    .select('*')
    .eq('enrollment_id', enrollmentId)
    .eq('user_id', user.id)

  if (error) throw error
  return (data || []) as TrailProgress[]
}

export const completeStep = async (params: {
  enrollmentId: string
  stepId: string
  sessionId?: string
  timeSpentMs?: number
}): Promise<void> => {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) throw new Error('Unauthorized')

  // Insert progress
  await supabase.from('user_trail_progress').upsert({
    enrollment_id: params.enrollmentId,
    user_id: user.id,
    step_id: params.stepId,
    session_id: params.sessionId || null,
    time_spent_ms: params.timeSpentMs || null,
    completed_at: new Date().toISOString(),
  }, { onConflict: 'enrollment_id,step_id' })

  // Check if all non-optional steps for the current day are complete
  const { data: enrollment } = await supabase
    .from('user_trail_enrollments')
    .select('enrollment_id, trail_id, current_day')
    .eq('enrollment_id', params.enrollmentId)
    .single()

  if (!enrollment) return

  // Get current day's steps
  const { data: currentDay } = await supabase
    .from('trail_days')
    .select('day_id, trail_steps(step_id, is_optional)')
    .eq('trail_id', enrollment.trail_id)
    .eq('day_number', enrollment.current_day)
    .single()

  if (!currentDay) return

  const requiredSteps = (currentDay.trail_steps as any[])
    .filter((s: any) => !s.is_optional)
    .map((s: any) => s.step_id)

  // Get completed steps for this enrollment
  const { data: completedProgress } = await supabase
    .from('user_trail_progress')
    .select('step_id')
    .eq('enrollment_id', params.enrollmentId)
    .in('step_id', requiredSteps)

  const completedStepIds = new Set((completedProgress || []).map((p: any) => p.step_id))
  const allComplete = requiredSteps.every((id: string) => completedStepIds.has(id))

  if (allComplete) {
    // Get readiness score for snapshot
    const { data: stats } = await supabase
      .from('user_global_stats')
      .select('global_readiness_score')
      .eq('user_id', user.id)
      .single()

    // Insert day completion (triggers auto-update of enrollment)
    await supabase.from('trail_day_completions').upsert({
      enrollment_id: params.enrollmentId,
      day_id: currentDay.day_id,
      user_id: user.id,
      completed_at: new Date().toISOString(),
      readiness_score_at_completion: stats?.global_readiness_score || null,
    }, { onConflict: 'enrollment_id,day_id' })

    // Check if trail is fully complete
    const { data: trail } = await supabase
      .from('camp_trails')
      .select('duration_days')
      .eq('trail_id', enrollment.trail_id)
      .single()

    const { count } = await supabase
      .from('trail_day_completions')
      .select('*', { count: 'exact', head: true })
      .eq('enrollment_id', params.enrollmentId)

    if (trail && count && count >= trail.duration_days) {
      await supabase
        .from('user_trail_enrollments')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('enrollment_id', params.enrollmentId)
    }
  }

  revalidatePath('/dashboard/trails')
  revalidatePath('/dashboard')
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

// ============================================================
// Trail Recommendation Engine (Section 7.3)
// ============================================================

export const recommendTrail = async (): Promise<TrailRecommendation | null> => {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) return null

  // Get user stats
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

  // Recommendation logic from architecture doc Section 7.3
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

  // Find matching published trail
  const { data: trails } = await supabase
    .from('camp_trails')
    .select('*')
    .eq('is_published', true)
    .eq('intensity', recommendedIntensity)
    .limit(1)

  // Fallback: get any published trail
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

  // Find weakest subject
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
    if (node?.subject_area) weakestSubjectName = node.subject_area
  }

  const daysText = daysToExam ? `${daysToExam} days until your exam` : 'no exam date set'
  const scoreText = Math.round(readinessScore)

  return {
    trail: matchedTrail,
    reasoning: `Based on your score of ${scoreText}% and ${daysText}, the ${matchedTrail.name} is the right fit.`,
    weekOnePreview: `Week 1 focuses on ${weakestSubjectName} — your biggest gap.`,
  }
}
