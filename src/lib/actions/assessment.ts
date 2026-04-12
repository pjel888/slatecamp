'use server'

import { createClient, getUser, createServiceClient } from '@/lib/supabase/server'
import { trackServerEvent } from '@/lib/analytics-server'
import { revalidateDashboardCacheTags } from './cache-tags'
import { updateMasteryStats } from './mastery/update-mastery-stats'
import type { AssessmentSubjectScore } from '@/types/app'
import { filterQuestionsReadableForStage } from '@/lib/admin/editor-integrity/standard-question'

import { getAssessmentClientQuestions as getQuestions } from './assessment/get-questions'

export const getAssessmentClientQuestions = async (questionIds: string[]) => {
  return getQuestions(questionIds)
}

/**
 * Check if the current user has already completed the assessment.
 */
export const hasCompletedAssessment = async (): Promise<boolean> => {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) return false

  const { data } = await supabase
    .from('user_global_stats')
    .select('assessment_completed_at')
    .eq('user_id', user.id)
    .single()

  return !!data?.assessment_completed_at
}

/**
 * Creates a new quiz session for the assessment diagnostic.
 */
export const createAssessmentSession = async (params: {
  disciplineId: string
  questionIds: string[]
}) => {
  const { data: { user } } = await getUser()
  if (!user) throw new Error('Unauthorized')

  const supabase = await createServiceClient()

  const { data: session, error } = await supabase
    .from('quiz_sessions')
    .insert({
      user_id: user.id,
      discipline_id: params.disciplineId,
      test_mode: 'camp',
      config: {
        isAssessment: true,
        showTimer: false,
        showFeedback: false,
      },
      question_ids: params.questionIds,
      subject_ids: [],
      status: 'in_progress',
      current_question_index: 0,
      started_at: new Date().toISOString(),
    })
    .select('session_id')
    .single()

  if (error) throw error
  return session
}

/**
 * Saves a single interaction during the assessment.
 * Updates both the interaction log and the mastery statistics.
 */
export const saveAssessmentInteraction = async (params: {
  sessionId: string
  questionId: string
  topicId: string
  selectedOptionId: string | null
  isCorrect: boolean
}) => {
  const { data: { user } } = await getUser()
  if (!user) throw new Error('Unauthorized')

  const supabase = await createServiceClient()

  // 1. Log interaction
  const { error } = await supabase.from('user_interactions').upsert(
    {
      session_id: params.sessionId,
      user_id: user.id,
      question_id: params.questionId,
      topic_id: params.topicId,
      selected_option_id: params.selectedOptionId,
      is_correct: params.isCorrect,
      time_spent_ms: 0,
      interaction_timestamp: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,session_id,question_id' }
  )

  if (error) throw error

  // 2. Update mastery stats (non-blocking)
  void updateMasteryStats({
    userId: user.id,
    topicId: params.topicId,
    questionId: params.questionId,
    isCorrect: params.isCorrect,
    timeSpentMs: 0,
    testMode: 'camp',
  })

  return { success: true }
}

/**
 * Get the user's assessment score and subject breakdown.
 */
export const getAssessmentResults = async (): Promise<{
  score: number
  subjectScores: AssessmentSubjectScore[]
} | null> => {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) return null

  const { data: stats } = await supabase
    .from('user_global_stats')
    .select('assessment_score, assessment_completed_at')
    .eq('user_id', user.id)
    .single()

  if (!stats?.assessment_completed_at) return null

  // Find the assessment session to get subject breakdown
  const { data: session } = await supabase
    .from('quiz_sessions')
    .select('session_id, config')
    .eq('user_id', user.id)
    .eq('test_mode', 'camp')
    .eq('status', 'completed')
    .not('config', 'is', null)
    .order('completed_at', { ascending: false })
    .limit(10)

  // Find the assessment session by config
  const assessmentSession = session?.find((s: any) => s.config?.isAssessment === true)

  if (!assessmentSession) {
    return { score: stats.assessment_score || 0, subjectScores: [] }
  }

  // Get interactions for this session with topic info
  const { data: interactions } = await supabase
    .from('user_interactions')
    .select('is_correct, topic_id')
    .eq('session_id', assessmentSession.session_id)
    .eq('user_id', user.id)

  if (!interactions?.length) {
    return { score: stats.assessment_score || 0, subjectScores: [] }
  }

  // Get subject areas for all topics
  const topicIds = [...new Set(interactions.map((i: any) => i.topic_id).filter(Boolean))]
  const { data: nodes } = await supabase
    .from('taxonomy_tree')
    .select('node_id, subject_area')
    .in('node_id', topicIds)

  const topicToSubject = new Map<string, string>((nodes || []).map((n: any) => [n.node_id, n.subject_area]))

  // Compute per-subject scores
  const subjectMap = new Map<string, { total: number; correct: number }>()
  for (const interaction of (interactions as Array<{ is_correct: boolean; topic_id: string }>)) {
    const subject = topicToSubject.get(interaction.topic_id) || 'Unknown'
    const entry = subjectMap.get(subject) || { total: 0, correct: 0 }
    entry.total += 1
    if (interaction.is_correct) entry.correct += 1
    subjectMap.set(subject, entry)
  }

  const subjectScores: AssessmentSubjectScore[] = Array.from(subjectMap.entries())
    .map(([subjectArea, { total, correct }]) => ({
      subjectArea,
      total,
      correct,
      accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
    }))
    .sort((a, b) => a.accuracy - b.accuracy)

  return { score: stats.assessment_score || 0, subjectScores }
}

/**
 * Select assessment questions: up to 5 per subject from the question pool.
 * Uses all available questions per subject (since we have limited questions).
 */
export const getAssessmentQuestions = async (disciplineId: string): Promise<string[]> => {
  const supabase = await createClient()

  // Get all subject areas
  const { data: subjects } = await supabase
    .from('taxonomy_tree')
    .select('subject_area')
    .eq('discipline_id', disciplineId)
    .not('subject_area', 'is', null)
    .eq('is_cross_ref_only', false)
    .is('deprecated_at', null)
    .not('lea_id', 'is', null)

  const uniqueSubjects = [...new Set((subjects || []).map((s: any) => s.subject_area))]

  const allQuestionIds: string[] = []

  for (const subject of uniqueSubjects) {
    // Get leaf nodes for this subject
    const { data: nodes } = await supabase
      .from('taxonomy_tree')
      .select('node_id')
      .eq('discipline_id', disciplineId)
      .eq('subject_area', subject)
      .eq('is_leaf', true)
      .eq('is_cross_ref_only', false)
      .is('deprecated_at', null)
      .not('lea_id', 'is', null)

    const nodeIds = (nodes || []).map((n: any) => n.node_id)
    if (nodeIds.length === 0) continue

    // Get up to 5 questions for this subject, preferring is_assessment and high discrimination
    const { data: questions } = await supabase
      .from('questions')
      .select('question_id, article_id, topic_id, question_type, is_assessment, discrimination_rating')
      .in('topic_id', nodeIds)
      .order('is_assessment', { ascending: false })
      .order('discrimination_rating', { ascending: false, nullsFirst: false })
      .limit(5)

    if (questions) {
      const { questions: deliverableQuestions } = await filterQuestionsReadableForStage(
        supabase as any,
        questions,
        'delivery',
      )
      allQuestionIds.push(...deliverableQuestions.map((q: any) => q.question_id))
    }
  }

  // Shuffle
  for (let i = allQuestionIds.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[allQuestionIds[i], allQuestionIds[j]] = [allQuestionIds[j], allQuestionIds[i]]
  }

  // Funnel event: assessment started
  void trackServerEvent('assessment_started', { question_count: allQuestionIds.length })

  return allQuestionIds
}

/**
 * Complete the assessment: compute per-subject accuracy, write scores,
 * and mark assessment as completed.
 */
export const completeAssessment = async (sessionId: string): Promise<{
  score: number
  subjectScores: AssessmentSubjectScore[]
}> => {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) throw new Error('Unauthorized')

  // Get all interactions for this session
  const { data: interactions } = await supabase
    .from('user_interactions')
    .select('is_correct, topic_id')
    .eq('session_id', sessionId)
    .eq('user_id', user.id)

  if (!interactions?.length) throw new Error('No interactions found')

  // Get subject areas
  const topicIds = [...new Set(interactions.map((i: any) => i.topic_id).filter(Boolean))]
  const { data: nodes } = await supabase
    .from('taxonomy_tree')
    .select('node_id, subject_area')
    .in('node_id', topicIds)

  const topicToSubject = new Map<string, string>((nodes || []).map((n: any) => [n.node_id, n.subject_area]))

  // Compute per-subject scores
  const subjectMap = new Map<string, { total: number; correct: number }>()
  let totalCorrect = 0

  for (const interaction of (interactions as Array<{ is_correct: boolean; topic_id: string }>)) {
    if (interaction.is_correct) totalCorrect++
    const subject = topicToSubject.get(interaction.topic_id) || 'Unknown'
    const entry = subjectMap.get(subject) || { total: 0, correct: 0 }
    entry.total += 1
    if (interaction.is_correct) entry.correct += 1
    subjectMap.set(subject, entry)
  }

  const overallScore = Math.round((totalCorrect / interactions.length) * 100)

  const subjectScores: AssessmentSubjectScore[] = Array.from(subjectMap.entries())
    .map(([subjectArea, { total, correct }]) => ({
      subjectArea,
      total,
      correct,
      accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
    }))
    .sort((a, b) => a.accuracy - b.accuracy)

  // Write to user_global_stats
  await supabase
    .from('user_global_stats')
    .update({
      assessment_completed_at: new Date().toISOString(),
      assessment_score: overallScore,
      global_readiness_score: overallScore,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', user.id)

  // Write readiness snapshot
  await supabase.from('readiness_score_snapshots').insert({
    user_id: user.id,
    score: overallScore,
    sub_scores: Object.fromEntries(
      subjectScores.map(s => [s.subjectArea, s.accuracy])
    ),
    computed_at: new Date().toISOString(),
  })

  revalidateDashboardCacheTags(user.id)

  // Funnel event: assessment completed
  void trackServerEvent('assessment_completed', { score: overallScore })

  return { score: overallScore, subjectScores }
}
