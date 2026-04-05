'use server'

import { unstable_cache } from 'next/cache'
import { createClient, getUser, createServiceClient } from '@/lib/supabase/server'
import { generateProgressReport, type ProgressReport } from './generate'
import { getDashboardCacheTags } from '../cache-tags'

// ── Types ────────────────────────────────────────────────────────────────────

export interface SimulationPoint {
  date: string
  score: number
  questionCount: number
  mode: string
}

export interface ExamOutcomeInput {
  examDate: string
  result: 'pass' | 'fail'
  selfReportedScore?: number | null
  examBatch: string
}

// ── Monthly Report ───────────────────────────────────────────────────────────

export const getMonthlyReport = async (): Promise<ProgressReport | null> => {
  const { data: { user } } = await getUser()
  if (!user) return null

  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

  return unstable_cache(
    async () => generateProgressReport(
      user.id,
      start.toISOString(),
      end.toISOString(),
    ),
    [`monthly-report-${user.id}-${start.toISOString()}`],
    {
      revalidate: 3600,
      tags: getDashboardCacheTags(user.id),
    }
  )()
}

// ── Simulation Trajectory ────────────────────────────────────────────────────

export const getSimulationTrajectory = async (): Promise<SimulationPoint[]> => {
  const { data: { user } } = await getUser()
  if (!user) return []

  return unstable_cache(
    async () => fetchSimulationTrajectory(user.id),
    [`simulation-trajectory-${user.id}`],
    {
      revalidate: 3600,
      tags: getDashboardCacheTags(user.id),
    }
  )()
}

const fetchSimulationTrajectory = async (userId: string): Promise<SimulationPoint[]> => {
  const supabase = await createServiceClient()

  // Fetch completed storm / proof_sim sessions with 50+ questions
  const { data: sessions } = await supabase
    .from('quiz_sessions')
    .select('session_id, completed_at, test_mode, question_ids')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .in('test_mode', ['storm', 'proof_sim'])
    .order('completed_at', { ascending: true })

  if (!sessions?.length) return []

  // Filter to sessions with 50+ questions (full simulations)
  const fullSessions = (sessions as Array<{
    session_id: string
    completed_at: string | null
    test_mode: string
    question_ids: string[]
  }>).filter((s) => s.question_ids?.length >= 50)

  if (!fullSessions.length) return []

  // Fetch interactions for these sessions
  const sessionIds = fullSessions.map((s) => s.session_id)
  const { data: interactions } = await supabase
    .from('user_interactions')
    .select('session_id, is_correct')
    .in('session_id', sessionIds)

  if (!interactions?.length) return []

  // Aggregate accuracy per session
  const sessionAccuracy = new Map<string, { correct: number; total: number }>()
  for (const row of interactions as { session_id: string; is_correct: boolean }[]) {
    const entry = sessionAccuracy.get(row.session_id) ?? { correct: 0, total: 0 }
    entry.total++
    if (row.is_correct) entry.correct++
    sessionAccuracy.set(row.session_id, entry)
  }

  return fullSessions
    .map((s) => {
      const acc = sessionAccuracy.get(s.session_id)
      if (!acc || acc.total === 0) return null
      return {
        date: new Date(s.completed_at!).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        score: Math.round((acc.correct / acc.total) * 100),
        questionCount: acc.total,
        mode: s.test_mode,
      }
    })
    .filter((p): p is SimulationPoint => p !== null)
}

// ── Exam Outcome Reporter ────────────────────────────────────────────────────

export const reportExamOutcome = async (
  input: ExamOutcomeInput,
): Promise<{ success: boolean; error?: string }> => {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  // Get current stats for snapshot
  const { data: stats } = await supabase
    .from('user_global_stats')
    .select('global_readiness_score, current_discipline_id')
    .eq('user_id', user.id)
    .single()

  // Count total sessions & questions
  const [sessionsRes, questionsRes] = await Promise.all([
    supabase
      .from('quiz_sessions')
      .select('session_id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'completed'),
    supabase
      .from('user_interactions')
      .select('interaction_id', { count: 'exact', head: true })
      .eq('user_id', user.id),
  ])

  const { error } = await supabase.from('exam_outcomes').insert({
    user_id: user.id,
    exam_batch: input.examBatch,
    result: input.result,
    self_reported_score: input.selfReportedScore ?? null,
    reported_at: new Date().toISOString(),
    peak_readiness_score: stats?.global_readiness_score ?? null,
    discipline_id: stats?.current_discipline_id ?? null,
    total_sessions_completed: sessionsRes.count ?? 0,
    total_questions_answered: questionsRes.count ?? 0,
    verified: false,
  })

  if (error) {
    console.error('[PROGRESS] reportExamOutcome insert failed:', {
      error: error.message,
      timestamp: new Date().toISOString(),
    })
    return { success: false, error: 'Failed to save exam outcome' }
  }

  return { success: true }
}
