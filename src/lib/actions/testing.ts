'use server'

import { createClient, getUser } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { recomputeAndSaveReadinessScore } from '@/lib/actions/readiness-score-update'
import { computeUserSignals } from '@/lib/signals/compute'
import { computeAccuracyByBlock } from '@/lib/endurance/compute'
import type { QuizSession } from '@/types/app'
import type {
  SessionConfig,
  ModeSource,
  SmartSuggestion,
  SimulationGateStatus,
  InProgressSessionInfo,
  CalibrationResult,
  CalibrationSubject,
  ErrorTag,
  ConfidenceTag,
} from '@/types/testing'
import { MODE_DEFINITIONS } from '@/lib/constants/testing-modes'

// ─── Constants ────────────────────────────────────────────────────────────────

const SIMULATION_READINESS_THRESHOLD = 65
const RECENT_ANSWER_WINDOW_HOURS = 48

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Maps UI ModeSource to the DB test_mode enum */
const SOURCE_TO_DB_MODE: Record<ModeSource, 'camp' | 'timed' | 'practice'> = {
  camp_mode: 'camp',
  subject_mode: 'camp',
  focus_review: 'camp',
  custom_session: 'camp',
  extended_practice: 'camp',
  assessment_quiz: 'camp',
  trail_quiz: 'camp',
  blindspot_queue: 'camp',
  chill_mode: 'practice',
  storm_mode: 'timed',
  proof_simulation: 'timed',
}

/** Shuffles an array in-place using Fisher-Yates */
const shuffleArray = <T>(arr: T[]): T[] => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

// ─── Session creation ──────────────────────────────────────────────────────────

/**
 * Creates a new quiz session from a setup config.
 * Selects question IDs based on mode-specific logic.
 * Returns the session_id string on success, throws on failure.
 */
export const createTestingSession = async (
  userId: string,
  config: SessionConfig,
): Promise<string> => {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) throw new Error('Unauthenticated')

  // Resolve discipline_id from user global stats
  const { data: stats } = await supabase
    .from('user_global_stats')
    .select('current_discipline_id')
    .eq('user_id', userId)
    .maybeSingle()

  const disciplineId = stats?.current_discipline_id ?? null
  const dbTestMode = SOURCE_TO_DB_MODE[config.source] ?? 'camp'
  const questionCount = config.questionCount ?? 20

  let questionIds: string[] = []

  // ── Question selection by mode ──────────────────────────────────────────────
  if (
    config.source === 'camp_mode' ||
    config.source === 'subject_mode' ||
    config.source === 'focus_review'
  ) {
    // Prioritize weak nodes (mastery ASC), exclude recently answered (last 48h)
    const recentCutoff = new Date(Date.now() - RECENT_ANSWER_WINDOW_HOURS * 60 * 60 * 1000).toISOString()

    let nodeQuery = supabase
      .from('taxonomy_tree')
      .select('node_id')
      .eq('discipline_id', disciplineId)
      .eq('is_leaf', true)
      .eq('is_cross_ref_only', false)
      .is('deprecated_at', null)
      .not('ale_id', 'is', null)

    if (config.subjectFilter?.length > 0) {
      nodeQuery = nodeQuery.in('subject_area', config.subjectFilter)
    }

    const { data: leafNodes } = await nodeQuery
    const leafIds = (leafNodes || []).map((n: { node_id: string }) => n.node_id)

    if (leafIds.length > 0) {
      const { data: recentInteractions } = await supabase
        .from('user_interactions')
        .select('question_id')
        .eq('user_id', userId)
        .gte('interaction_timestamp', recentCutoff)

      const recentIds = (recentInteractions || []).map((i: { question_id: string }) => i.question_id)

      const { data: masteryRows } = await supabase
        .from('user_node_mastery')
        .select('topic_id')
        .eq('user_id', userId)
        .in('topic_id', leafIds)
        .order('current_mastery_weight', { ascending: true })

      const seenNodeIds = new Set((masteryRows || []).map((m: { topic_id: string }) => m.topic_id))
      const unseenNodeIds = leafIds.filter((id) => !seenNodeIds.has(id))
      const orderedNodeIds = [
        ...(masteryRows || []).map((m: { topic_id: string }) => m.topic_id),
        ...unseenNodeIds,
      ]

      let qQuery = supabase
        .from('questions')
        .select('question_id')
        .in('topic_id', orderedNodeIds)

      if (recentIds.length > 0) {
        qQuery = qQuery.not('question_id', 'in', `(${recentIds.map((id) => `"${id}"`).join(',')})`)
      }

      const { data: candidateQuestions } = await qQuery.limit(questionCount * 3)
      questionIds = (candidateQuestions || [])
        .map((q: { question_id: string }) => q.question_id)
        .slice(0, questionCount)
    }
  } else if (config.source === 'storm_mode') {
    // Random selection from full pool
    const { data: nodes } = await supabase
      .from('taxonomy_tree')
      .select('node_id')
      .eq('discipline_id', disciplineId)
      .eq('is_leaf', true)
      .eq('is_cross_ref_only', false)
      .is('deprecated_at', null)
      .not('ale_id', 'is', null)

    const nodeIds = (nodes || []).map((n: { node_id: string }) => n.node_id)
    const { data: allQ } = await supabase
      .from('questions')
      .select('question_id')
      .in('topic_id', nodeIds)
      .limit(questionCount * 3)

    questionIds = shuffleArray<string>(
      (allQ || []).map((q: { question_id: string }) => q.question_id),
    ).slice(0, questionCount)
  } else if (config.source === 'custom_session') {
    // Filter by topics and difficulty bands
    let qQuery = supabase.from('questions').select('question_id')

    if (config.topicFilter?.length > 0) {
      qQuery = qQuery.in('topic_id', config.topicFilter)
    } else if (config.subjectFilter?.length > 0) {
      const { data: subjectNodes } = await supabase
        .from('taxonomy_tree')
        .select('node_id')
        .eq('discipline_id', disciplineId)
        .eq('is_leaf', true)
        .in('subject_area', config.subjectFilter)

      const subjectNodeIds = (subjectNodes || []).map((n: { node_id: string }) => n.node_id)
      if (subjectNodeIds.length > 0) {
        qQuery = qQuery.in('topic_id', subjectNodeIds)
      }
    }

    if (config.difficultyBands?.length > 0) {
      qQuery = qQuery.in('difficulty_rating', config.difficultyBands)
    }

    const { data: customQ } = await qQuery.limit(questionCount)
    questionIds = shuffleArray((customQ || []).map((q: { question_id: string }) => q.question_id))
  } else if (config.source === 'proof_simulation') {
    // 200 questions balanced across subjects
    const { data: subjectRows } = await supabase
      .from('taxonomy_tree')
      .select('subject_area')
      .eq('discipline_id', disciplineId)
      .eq('level', 1)
      .not('subject_area', 'is', null)

    const uniqueSubjects = [
      ...new Set((subjectRows || []).map((s: { subject_area: string }) => s.subject_area)),
    ]
    const perSubject = Math.ceil(200 / Math.max(uniqueSubjects.length, 1))

    for (const subject of uniqueSubjects) {
      const { data: subNodes } = await supabase
        .from('taxonomy_tree')
        .select('node_id')
        .eq('discipline_id', disciplineId)
        .eq('subject_area', subject)
        .eq('is_leaf', true)
        .eq('is_cross_ref_only', false)
        .is('deprecated_at', null)

      const subNodeIds = (subNodes || []).map((n: { node_id: string }) => n.node_id)
      if (subNodeIds.length === 0) continue

      const { data: subQ } = await supabase
        .from('questions')
        .select('question_id')
        .in('topic_id', subNodeIds)
        .limit(perSubject)

      questionIds.push(...(subQ || []).map((q: { question_id: string }) => q.question_id))
    }

    questionIds = shuffleArray(questionIds).slice(0, 200)
  } else if (config.source === 'extended_practice') {
    // 100+ questions; start from weakest nodes
    const { data: nodes } = await supabase
      .from('taxonomy_tree')
      .select('node_id')
      .eq('discipline_id', disciplineId)
      .eq('is_leaf', true)
      .eq('is_cross_ref_only', false)
      .is('deprecated_at', null)
      .not('ale_id', 'is', null)

    const nodeIds = (nodes || []).map((n: { node_id: string }) => n.node_id)

    const { data: masteryRows } = await supabase
      .from('user_node_mastery')
      .select('topic_id')
      .eq('user_id', userId)
      .in('topic_id', nodeIds)
      .order('current_mastery_weight', { ascending: true })

    const seenIds = new Set((masteryRows || []).map((m: { topic_id: string }) => m.topic_id))
    const orderedIds = [
      ...(masteryRows || []).map((m: { topic_id: string }) => m.topic_id),
      ...nodeIds.filter((id) => !seenIds.has(id)),
    ]

    const { data: enduranceQ } = await supabase
      .from('questions')
      .select('question_id')
      .in('topic_id', orderedIds)
      .limit(questionCount)

    questionIds = (enduranceQ || []).map((q: { question_id: string }) => q.question_id)
  } else if (config.source === 'chill_mode') {
    // ~50 from mixed pool, shuffled
    const { data: nodes } = await supabase
      .from('taxonomy_tree')
      .select('node_id')
      .eq('discipline_id', disciplineId)
      .eq('is_leaf', true)
      .eq('is_cross_ref_only', false)
      .is('deprecated_at', null)
      .not('ale_id', 'is', null)

    const nodeIds = (nodes || []).map((n: { node_id: string }) => n.node_id)
    const { data: chillQ } = await supabase
      .from('questions')
      .select('question_id')
      .in('topic_id', nodeIds)
      .limit(150)

    questionIds = shuffleArray<string>(
      (chillQ || []).map((q: { question_id: string }) => q.question_id),
    ).slice(0, 50)
  } else if (config.source === 'blindspot_queue' && config.blindspotQueueId) {
    // Use pre-selected node IDs from the blindspot queue
    const { data: queue } = await supabase
      .from('blindspot_queues')
      .select('node_ids, question_count')
      .eq('queue_id', config.blindspotQueueId)
      .eq('user_id', userId)
      .single()

    if (queue?.node_ids?.length) {
      const { data: blindQ } = await supabase
        .from('questions')
        .select('question_id')
        .in('topic_id', queue.node_ids)
        .limit(queue.question_count ?? 12)

      questionIds = (blindQ || []).map((q: { question_id: string }) => q.question_id)
    }
  }

  // Capture mastery snapshot at start for debrief delta computation
  let masterySnapshot: Record<string, number> | null = null
  if (questionIds.length > 0) {
    const { data: topicRows } = await supabase
      .from('questions')
      .select('topic_id')
      .in('question_id', questionIds)

    const uniqueTopics = [
      ...new Set(
        (topicRows || []).map((q: { topic_id: string }) => q.topic_id).filter(Boolean),
      ),
    ]

    if (uniqueTopics.length > 0) {
      const { data: masteryRows } = await supabase
        .from('user_node_mastery')
        .select('topic_id, current_mastery_weight')
        .eq('user_id', userId)
        .in('topic_id', uniqueTopics)

      masterySnapshot = Object.fromEntries(
        (masteryRows || []).map(
          (m: { topic_id: string; current_mastery_weight: number }) => [m.topic_id, m.current_mastery_weight],
        ),
      )
    }
  }

  const { data: session, error } = await supabase
    .from('quiz_sessions')
    .insert({
      user_id: userId,
      discipline_id: disciplineId,
      test_mode: dbTestMode,
      status: 'in_progress',
      config: config as unknown as Record<string, unknown>,
      question_ids: questionIds,
      subject_ids: config.subjectFilter ?? [],
      current_question_index: 0,
      pre_session_confidence_ratings: config.preSessionConfidence
        ? Object.fromEntries(config.preSessionConfidence.map((s) => [s.subjectId, s.rating]))
        : {},
      is_proof_simulation: config.isProofSimulation ?? false,
      is_endurance_session: config.isEnduranceSession ?? false,
      mastery_snapshot_at_start: masterySnapshot,
    })
    .select('session_id')
    .single()

  if (error || !session) {
    console.error('[createTestingSession] error:', error?.message)
    throw new Error(error?.message ?? 'Failed to create session')
  }

  return session.session_id as string
}

// ─── Hub page data ─────────────────────────────────────────────────────────────

export interface ModeStats {
  sessionCount: number
  lastPlayedAt: string | null
}

export const getTestingPageData = async (params: { topicId?: string; subjectId?: string }) => {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) return null

  const { ensureUserGlobalStats } = await import('@/lib/actions/user-stats')
  const stats = await ensureUserGlobalStats()
  if (!stats) return null

  const existingSessionPromise = supabase
    .from('quiz_sessions')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'in_progress')
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const modeStatsPromise = supabase
    .from('quiz_sessions')
    .select('test_mode, started_at')
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .order('started_at', { ascending: false })

  let questionIdsPromise: Promise<string[]> = Promise.resolve([])
  if (!params.topicId && !params.subjectId) {
    questionIdsPromise = (async () => {
      const { data: allQuestions, error } = await supabase
        .from('questions')
        .select('question_id, taxonomy_tree!inner(discipline_id)')
        .eq('taxonomy_tree.discipline_id', stats.current_discipline_id)
        .eq('taxonomy_tree.is_leaf', true)
        .eq('taxonomy_tree.is_cross_ref_only', false)
        .is('taxonomy_tree.deprecated_at', null)
        .not('taxonomy_tree.ale_id', 'is', null)

      if (error) {
        console.error('[testing] Failed to fetch question IDs:', error.message)
        return []
      }

      return (allQuestions || []).map((q: { question_id: string }) => q.question_id)
    })()
  }

  const subjectsPromise = supabase
    .from('taxonomy_tree')
    .select('*')
    .eq('discipline_id', stats.current_discipline_id)
    .eq('level', 1)
    .eq('is_cross_ref_only', false)
    .is('deprecated_at', null)
    .not('ale_id', 'is', null)
    .order('name')

  const [
    { data: existingSession },
    { data: completedSessions },
    questionIds,
    { data: subjects },
  ] = await Promise.all([
    existingSessionPromise,
    modeStatsPromise,
    questionIdsPromise,
    subjectsPromise,
  ])

  const modeStatsMap: Record<string, ModeStats> = {}
  for (const s of completedSessions || []) {
    const mode = s.test_mode as string
    if (!modeStatsMap[mode]) {
      modeStatsMap[mode] = { sessionCount: 0, lastPlayedAt: s.started_at }
    }
    modeStatsMap[mode].sessionCount++
  }

  const totalCompletedSessions = (completedSessions || []).length
  const disciplineName = (stats as any).disciplines?.name || 'Architecture'

  return {
    existingSession,
    disciplineId: stats.current_discipline_id!,
    disciplineName,
    subjects: subjects || [],
    questionIds,
    modeStats: modeStatsMap,
    totalCompletedSessions,
  }
}

// ─── Active session actions ────────────────────────────────────────────────────

export interface SaveInteractionPayload {
  sessionId: string
  questionId: string
  selectedOptionId: string | null
  isCorrect: boolean | null
  timeSpentMs: number
  isFlagged: boolean
  confidenceTag: ConfidenceTag | null
  errorTags: ErrorTag[]
  eliminatedOptionIds: string[]
  answerChanges: number
}

/**
 * Upserts a single user_interaction row for an active session.
 * Called per-question after submit (Camp/Chill) or confirm (Storm).
 */
export const saveTestingInteraction = async (
  payload: SaveInteractionPayload,
): Promise<{ error: string | null }> => {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) return { error: 'Unauthenticated' }

  // Derive question_order from session question_ids array
  const { data: session } = await supabase
    .from('quiz_sessions')
    .select('question_ids')
    .eq('session_id', payload.sessionId)
    .eq('user_id', user.id)
    .single()

  const questionOrder = session
    ? (session.question_ids as string[]).indexOf(payload.questionId)
    : null

  const { error } = await supabase.from('user_interactions').upsert(
    {
      session_id: payload.sessionId,
      user_id: user.id,
      question_id: payload.questionId,
      selected_option_id: payload.selectedOptionId,
      is_correct: payload.isCorrect ?? false,
      time_spent_ms: payload.timeSpentMs,
      is_flagged: payload.isFlagged,
      confidence: payload.confidenceTag,
      error_type: payload.errorTags.length > 0 ? payload.errorTags[0] : null,
      options_eliminated: payload.eliminatedOptionIds.length,
      answer_changes: payload.answerChanges,
      question_order: questionOrder !== null && questionOrder >= 0 ? questionOrder : null,
    },
    {
      onConflict: 'user_id,session_id,question_id',
    },
  )

  if (error) {
    console.error('[saveTestingInteraction] error:', error.message)
    return { error: error.message }
  }

  return { error: null }
}

/**
 * Marks a quiz_session as completed, triggers readiness recomputation,
 * fires post-completion signals, and revalidates the hub.
 */
export const completeTestingSession = async (
  sessionId: string,
): Promise<{ error: string | null }> => {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) return { error: 'Unauthenticated' }

  // Recompute readiness BEFORE setting status so snapshot trigger sees fresh data
  try {
    await recomputeAndSaveReadinessScore(user.id)
  } catch (e) {
    console.warn('[completeTestingSession] readiness recompute failed:', e)
  }

  const { error } = await supabase
    .from('quiz_sessions')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('session_id', sessionId)
    .eq('user_id', user.id)

  if (error) {
    console.error('[completeTestingSession] error:', error.message)
    return { error: error.message }
  }

  // Fire-and-forget post-completion work
  void computeUserSignals(user.id)
  void writeAccuracyByBlock(supabase, sessionId, user.id)

  revalidatePath('/dashboard/testing')

  return { error: null }
}

/**
 * Marks a quiz_session as abandoned.
 */
export const abandonTestingSession = async (
  sessionId: string,
): Promise<{ error: string | null }> => {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) return { error: 'Unauthenticated' }

  const { error } = await supabase
    .from('quiz_sessions')
    .update({
      status: 'abandoned',
      updated_at: new Date().toISOString(),
    })
    .eq('session_id', sessionId)
    .eq('user_id', user.id)

  if (error) {
    console.error('[abandonTestingSession] error:', error.message)
    return { error: error.message }
  }

  revalidatePath('/dashboard/testing')

  return { error: null }
}

/**
 * Updates current_question_index on quiz_sessions (checkpoint for resume).
 */
export const updateSessionProgress = async (
  sessionId: string,
  currentIndex: number,
): Promise<{ error: string | null }> => {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) return { error: 'Unauthenticated' }

  const { error } = await supabase
    .from('quiz_sessions')
    .update({ current_question_index: currentIndex, updated_at: new Date().toISOString() })
    .eq('session_id', sessionId)
    .eq('user_id', user.id)

  if (error) {
    console.error('[updateSessionProgress] error:', error.message)
    return { error: error.message }
  }

  return { error: null }
}

// ─── Hub query actions ────────────────────────────────────────────────────────

/**
 * Returns the highest-priority smart suggestion for the hub card.
 * Priority: blindspot > exam-countdown > weak-subject > return > null
 */
export const getSmartSuggestion = async (userId: string): Promise<SmartSuggestion | null> => {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user || user.id !== userId) return null

  // 1. Pending blindspot queue
  const { data: blindspotQueue } = await supabase
    .from('blindspot_queues')
    .select('queue_id, node_ids, question_count')
    .eq('user_id', userId)
    .eq('status', 'pending')
    .order('generated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (blindspotQueue?.node_ids?.length) {
    const { data: nodes } = await supabase
      .from('taxonomy_tree')
      .select('name')
      .in('node_id', (blindspotQueue.node_ids as string[]).slice(0, 3))

    const nodeNames = (nodes || []).map((n: { name: string }) => n.name)
    const count = (blindspotQueue.node_ids as string[]).length

    return {
      variant: 'blindspot',
      title: `${count} node${count !== 1 ? 's' : ''} need${count === 1 ? 's' : ''} attention`,
      description:
        nodeNames.length > 0
          ? `${nodeNames.join(', ')} and others haven't improved recently. A focused session here has the highest impact.`
          : "Some of your topics haven't improved recently. A focused session here has the highest impact.",
      ctaLabel: 'Start Focus Review',
      ctaHref: `/dashboard/testing/setup/focus-review?queueId=${blindspotQueue.queue_id}`,
      metadata: { nodeNames },
    }
  }

  // 2. Exam countdown within 30 days
  const { data: profile } = await supabase
    .from('profiles')
    .select('target_exam_date')
    .eq('id', userId)
    .maybeSingle()

  if (profile?.target_exam_date) {
    const daysUntilExam = Math.ceil(
      (new Date(profile.target_exam_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    )

    if (daysUntilExam > 0 && daysUntilExam <= 30) {
      const { data: globalStats } = await supabase
        .from('user_global_stats')
        .select('global_readiness_score')
        .eq('user_id', userId)
        .maybeSingle()

      const readiness = globalStats?.global_readiness_score ?? 0

      return {
        variant: 'exam-countdown',
        title: `${daysUntilExam} day${daysUntilExam !== 1 ? 's' : ''} until your exam`,
        description:
          readiness >= SIMULATION_READINESS_THRESHOLD
            ? `You're at ${readiness}% readiness — keep your momentum with a full session today.`
            : `You're at ${readiness}% readiness. Focused daily sessions now will move the needle most.`,
        ctaLabel: readiness >= SIMULATION_READINESS_THRESHOLD ? 'Start Simulation' : 'Start Camp Mode',
        ctaHref:
          readiness >= SIMULATION_READINESS_THRESHOLD
            ? '/dashboard/testing/setup/simulation'
            : '/dashboard/testing/setup/camp',
        metadata: { daysUntilExam, currentReadiness: readiness },
      }
    }
  }

  // 3. Weak subject (avg mastery < 0.4)
  const { data: weakNodes } = await supabase
    .from('user_node_mastery')
    .select('current_mastery_weight, taxonomy_tree!inner(subject_area)')
    .eq('user_id', userId)
    .lt('current_mastery_weight', 0.4)
    .limit(20)

  if (weakNodes && weakNodes.length > 0) {
    const subjectMap = new Map<string, { total: number; sum: number }>()
    for (const node of weakNodes as Array<{
      current_mastery_weight: number
      taxonomy_tree: { subject_area: string }
    }>) {
      const subject = node.taxonomy_tree?.subject_area
      if (!subject) continue
      const entry = subjectMap.get(subject) ?? { total: 0, sum: 0 }
      entry.total++
      entry.sum += node.current_mastery_weight
      subjectMap.set(subject, entry)
    }

    let weakestSubject: string | null = null
    let weakestAvg = 1
    for (const [subject, { total, sum }] of subjectMap) {
      const avg = sum / total
      if (avg < weakestAvg) {
        weakestAvg = avg
        weakestSubject = subject
      }
    }

    if (weakestSubject) {
      const accuracyPct = Math.round(weakestAvg * 100)
      return {
        variant: 'weak-subject',
        title: `${weakestSubject} could use attention`,
        description: `Your accuracy in ${weakestSubject} is ${accuracyPct}% — below your average. A Subject Mode session here would strengthen your weakest area.`,
        ctaLabel: `Practice ${weakestSubject}`,
        ctaHref: `/dashboard/testing/setup/subject?subject=${encodeURIComponent(weakestSubject)}`,
        metadata: { subjectName: weakestSubject },
      }
    }
  }

  // 4. Return variant: last study > 48h ago
  const { data: globalStats } = await supabase
    .from('user_global_stats')
    .select('last_study_date')
    .eq('user_id', userId)
    .maybeSingle()

  if (globalStats?.last_study_date) {
    const hoursSince = (Date.now() - new Date(globalStats.last_study_date).getTime()) / (1000 * 60 * 60)
    if (hoursSince >= RECENT_ANSWER_WINDOW_HOURS) {
      const daysSince = Math.floor(hoursSince / 24)
      const daysLabel = daysSince >= 1 ? `${daysSince} day${daysSince !== 1 ? 's' : ''}` : 'a while'

      return {
        variant: 'return',
        title: 'Pick up where you left off',
        description: `Your last session was ${daysLabel} ago. A quick Camp Mode session is the best way to get back in rhythm.`,
        ctaLabel: 'Start Camp Mode',
        ctaHref: '/dashboard/testing/setup/camp',
      }
    }
  }

  return null
}

/**
 * Aggregates completed session history into per-source mode stats for hub cards.
 */
export const getModeStats = async (userId: string): Promise<Record<string, ModeStats>> => {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user || user.id !== userId) return {}

  const { data: sessions } = await supabase
    .from('quiz_sessions')
    .select('session_id, config, question_ids, accuracy_by_block, completed_at')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(500)

  const result: Record<
    string,
    ModeStats & { lastSessionId?: string; lastAccuracy?: number | null; avgQuestionsPerSession?: number | null; fatigueThreshold?: number | null }
  > = {}

  for (const s of sessions || []) {
    const source = (s.config as SessionConfig)?.source as string
    if (!source) continue

    if (!result[source]) {
      result[source] = {
        sessionCount: 0,
        lastPlayedAt: s.completed_at ?? null,
        lastSessionId: s.session_id,
        lastAccuracy: null,
        avgQuestionsPerSession: null,
        fatigueThreshold: null,
      }
    }

    result[source].sessionCount++

    const qCount = (s.question_ids as string[])?.length ?? 0
    const prevAvg = result[source].avgQuestionsPerSession ?? 0
    const count = result[source].sessionCount
    result[source].avgQuestionsPerSession = Math.round(prevAvg + (qCount - prevAvg) / count)

    // Fatigue threshold for extended_practice sessions
    if (source === 'extended_practice' && s.accuracy_by_block) {
      const blocks = s.accuracy_by_block as Array<{
        block: number
        accuracy: number
        questionCount: number
      }>
      if (blocks.length > 1) {
        const baseAccuracy = blocks[0]?.accuracy ?? 1
        const fatiguedBlock = blocks.find((b) => b.accuracy < baseAccuracy - 0.1)
        if (fatiguedBlock) {
          result[source].fatigueThreshold = fatiguedBlock.block * (blocks[0]?.questionCount ?? 25)
        }
      }
    }
  }

  // Compute lastAccuracy from most recent session per source
  for (const source of Object.keys(result)) {
    const mostRecentId = result[source].lastSessionId
    if (!mostRecentId) continue

    const { data: interactions } = await supabase
      .from('user_interactions')
      .select('is_correct')
      .eq('session_id', mostRecentId)
      .eq('user_id', userId)

    if (interactions && interactions.length > 0) {
      const correct = (interactions as Array<{ is_correct: boolean }>).filter((i) => i.is_correct).length
      result[source].lastAccuracy = Math.round((correct / interactions.length) * 100)
    }
  }

  return result
}

/**
 * Returns info about the user's current in-progress session, or null.
 */
export const getInProgressSession = async (userId: string): Promise<InProgressSessionInfo | null> => {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user || user.id !== userId) return null

  const { data: session } = await supabase
    .from('quiz_sessions')
    .select('session_id, config, question_ids, current_question_index, started_at')
    .eq('user_id', userId)
    .eq('status', 'in_progress')
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!session) return null

  const config = session.config as SessionConfig
  const source = config?.source as ModeSource
  const modeDef = Object.values(MODE_DEFINITIONS).find((m) => m.source === source)

  return {
    sessionId: session.session_id,
    source: source ?? 'camp_mode',
    modeLabel: modeDef?.label ?? 'Session',
    currentIndex: session.current_question_index ?? 0,
    totalQuestions: (session.question_ids as string[])?.length ?? 0,
    startedAt: session.started_at,
  }
}

// ─── Debrief actions ──────────────────────────────────────────────────────────

/**
 * Reads pre-session confidence ratings and computes actual per-subject accuracy
 * to return calibration insight for the debrief screen.
 */
export const getCalibrationData = async (
  sessionId: string,
  userId: string,
): Promise<CalibrationResult | null> => {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user || user.id !== userId) return null

  const { data: session } = await supabase
    .from('quiz_sessions')
    .select('pre_session_confidence_ratings')
    .eq('session_id', sessionId)
    .eq('user_id', userId)
    .single()

  const ratings = session?.pre_session_confidence_ratings as Record<string, number> | null
  if (!ratings || Object.keys(ratings).length === 0) return null

  const { data: interactions } = await supabase
    .from('user_interactions')
    .select('is_correct, topic_id')
    .eq('session_id', sessionId)
    .eq('user_id', userId)

  if (!interactions?.length) return null

  const topicIds = [
    ...new Set((interactions as Array<{ topic_id: string }>).map((i) => i.topic_id).filter(Boolean)),
  ]

  const { data: nodes } = await supabase
    .from('taxonomy_tree')
    .select('node_id, subject_area')
    .in('node_id', topicIds)

  const topicToSubject = new Map<string, string>(
    (nodes || []).map((n: { node_id: string; subject_area: string }) => [n.node_id, n.subject_area]),
  )

  // Aggregate actual accuracy per subject
  const subjectAccuracy = new Map<string, { total: number; correct: number }>()
  for (const interaction of interactions as Array<{ is_correct: boolean; topic_id: string }>) {
    const subject = topicToSubject.get(interaction.topic_id)
    if (!subject) continue
    const entry = subjectAccuracy.get(subject) ?? { total: 0, correct: 0 }
    entry.total++
    if (interaction.is_correct) entry.correct++
    subjectAccuracy.set(subject, entry)
  }

  // Map predicted confidence level (1-5) to expected accuracy midpoints
  const predictedAccuracyMap: Record<number, number> = { 1: 30, 2: 45, 3: 60, 4: 75, 5: 90 }

  const subjects: CalibrationSubject[] = []
  let totalGap = 0

  for (const [subjectIdOrArea, confidence] of Object.entries(ratings)) {
    // Ratings keys may be subjectId UUIDs or subject_area strings
    const subjectName =
      (nodes || []).find(
        (n: { node_id: string; subject_area: string }) =>
          n.node_id === subjectIdOrArea || n.subject_area === subjectIdOrArea,
      )?.subject_area ?? subjectIdOrArea

    const accuracyEntry = subjectAccuracy.get(subjectName)
    if (!accuracyEntry) continue

    const actualAccuracy = accuracyEntry.total > 0 ? (accuracyEntry.correct / accuracyEntry.total) * 100 : 0
    const predictedLevel = confidence as 1 | 2 | 3 | 4 | 5
    const predictedAccuracy = predictedAccuracyMap[predictedLevel] ?? 60
    const gap = predictedAccuracy - actualAccuracy

    let gapDirection: CalibrationSubject['gapDirection']
    let gapText: string

    if (predictedLevel >= 4 && actualAccuracy < 50) {
      gapDirection = 'overconfident'
      gapText = 'You were overconfident here — that\'s useful to know.'
    } else if (predictedLevel <= 2 && actualAccuracy > 70) {
      gapDirection = 'underconfident'
      gapText = 'You knew this better than you thought — trust yourself.'
    } else if (Math.abs(gap) <= 15) {
      gapDirection = 'calibrated'
      gapText = 'well-calibrated'
    } else if (gap > 15) {
      gapDirection = 'overconfident'
      gapText = `overconfident by about ${Math.round(gap)}%`
    } else {
      gapDirection = 'underconfident'
      gapText = `underconfident — you outperformed your expectation by ${Math.round(Math.abs(gap))}%`
    }

    totalGap += Math.abs(gap)
    subjects.push({ subjectName, predictedLevel, actualAccuracy: Math.round(actualAccuracy), gapDirection, gapText })
  }

  if (subjects.length === 0) return null

  return {
    subjects,
    overallScore: Math.max(0, Math.round(100 - totalGap / subjects.length)),
  }
}

/**
 * Checks whether the user meets the prerequisites to unlock Full Exam Simulation.
 */
export const checkSimulationGate = async (userId: string): Promise<SimulationGateStatus> => {
  const supabase = await createClient()
  const { data: { user } } = await getUser()

  if (!user || user.id !== userId) {
    return {
      isUnlocked: false,
      currentReadiness: 0,
      requiredReadiness: SIMULATION_READINESS_THRESHOLD,
      hasEnduranceCalibration: false,
      pointsNeeded: SIMULATION_READINESS_THRESHOLD,
    }
  }

  const [{ data: globalStats }, { data: enduranceSessions }] = await Promise.all([
    supabase
      .from('user_global_stats')
      .select('global_readiness_score')
      .eq('user_id', userId)
      .maybeSingle(),
    supabase
      .from('quiz_sessions')
      .select('session_id')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .eq('is_endurance_session', true)
      .limit(1),
  ])

  const currentReadiness = globalStats?.global_readiness_score ?? 0
  const hasEnduranceCalibration = (enduranceSessions?.length ?? 0) > 0
  const meetsReadiness = currentReadiness >= SIMULATION_READINESS_THRESHOLD

  return {
    isUnlocked: meetsReadiness && hasEnduranceCalibration,
    currentReadiness,
    requiredReadiness: SIMULATION_READINESS_THRESHOLD,
    hasEnduranceCalibration,
    pointsNeeded: Math.max(0, SIMULATION_READINESS_THRESHOLD - currentReadiness),
  }
}

/**
 * Creates a new camp_mode session targeting only the questions answered
 * incorrectly in a previous session.
 */
export const retryWrongAnswers = async (
  sessionId: string,
  userId: string,
): Promise<string> => {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user || user.id !== userId) throw new Error('Unauthorized')

  const { data: interactions } = await supabase
    .from('user_interactions')
    .select('question_id')
    .eq('session_id', sessionId)
    .eq('user_id', userId)
    .eq('is_correct', false)

  if (!interactions?.length) throw new Error('No wrong answers found in this session')

  const wrongQuestionIds = shuffleArray(
    (interactions as Array<{ question_id: string }>).map((i) => i.question_id),
  )

  const { data: statsRow } = await supabase
    .from('user_global_stats')
    .select('current_discipline_id')
    .eq('user_id', userId)
    .maybeSingle()

  if (!statsRow?.current_discipline_id) throw new Error('No active discipline')

  const retryConfig: SessionConfig = {
    source: 'camp_mode',
    questionCount: wrongQuestionIds.length,
    subjectFilter: [],
    topicFilter: [],
    difficultyBands: [],
    feedbackMode: 'immediate',
    timerEnabled: false,
    timerSeconds: null,
    focusOption: 'mixed',
    preSessionConfidence: [],
    isBlindsplotSession: false,
    blindspotQueueId: null,
    isProofSimulation: false,
    isEnduranceSession: false,
    strippedUi: false,
    masteryWeightMultiplier: 1,
  }

  const { data: newSession, error } = await supabase
    .from('quiz_sessions')
    .insert({
      user_id: userId,
      discipline_id: statsRow.current_discipline_id,
      test_mode: 'camp',
      status: 'in_progress',
      config: retryConfig as unknown as Record<string, unknown>,
      question_ids: wrongQuestionIds,
      subject_ids: [],
      current_question_index: 0,
      pre_session_confidence_ratings: {},
      is_proof_simulation: false,
      is_endurance_session: false,
    })
    .select('session_id')
    .single()

  if (error || !newSession) {
    console.error('[retryWrongAnswers] error:', error?.message)
    throw new Error(error?.message ?? 'Failed to create retry session')
  }

  revalidatePath('/dashboard/testing')

  return newSession.session_id as string
}

// ─── Internal helper ──────────────────────────────────────────────────────────

/**
 * Write accuracy-by-block data to quiz_sessions on completion.
 * Enables Extended Practice analysis and Cognitive Stamina chart.
 * Silent on failure — non-critical path.
 */
const writeAccuracyByBlock = async (
  supabase: Awaited<ReturnType<typeof createClient>>,
  sessionId: string,
  userId: string,
): Promise<void> => {
  try {
    const { data: interactions } = await supabase
      .from('user_interactions')
      .select('question_order, is_correct')
      .eq('session_id', sessionId)
      .eq('user_id', userId)
      .order('question_order', { ascending: true })

    if (interactions && interactions.length > 0) {
      const blocks = computeAccuracyByBlock(
        interactions as { question_order: number; is_correct: boolean }[],
      )
      await supabase
        .from('quiz_sessions')
        .update({ accuracy_by_block: blocks })
        .eq('session_id', sessionId)
    }
  } catch {
    // Silent — block accuracy is non-critical
  }
}
