'use server'

import { randomBytes } from 'crypto'
import { MODE_DEFINITIONS } from '@/lib/constants/testing-modes'
import { startSessionInputSchema } from '@/lib/actions/quiz-v2/schemas'
import { selectQuestionsWithInterleaving } from '@/lib/quiz/interleaved-selection'
import { mergeWithPreset } from '@/lib/quiz/mode-presets'
import { buildTaxonomyBreadcrumbMap, toClientQuestion } from '@/lib/quiz/to-client-question'
import { createServiceClient, getUser } from '@/lib/supabase/server'
import type {
  QuestionForClient,
  QuizSessionConfig,
  StartSessionInput,
  StartSessionResult,
} from '@/types/quiz-config'

const DB_TEST_MODE_BY_APP_MODE: Record<StartSessionInput['mode'], string> = {
  camp: 'camp',
  chill: 'chill',
  subject: 'practice',
  focused: 'blindspot',
  custom: 'custom',
  storm: 'storm',
  fullexam: 'proof_sim',
  extended: 'endurance',
  article_review: 'practice',
}

const issueSessionSecurity = async (
  sessionId: string,
  questionIds: string[],
  userId: string,
) => {
  let nonces: Record<string, { nonce: string; expiresAt: string }> = {}
  let sessionKey: string | null = null

  try {
    const { issueNonceBatch } = await import('@/lib/cage/nonceService')
    const nonceMap = await issueNonceBatch(sessionId, questionIds, userId)
    nonces = Object.fromEntries(nonceMap)
    sessionKey = randomBytes(32).toString('hex')
  } catch {
    nonces = {}
    sessionKey = null
  }

  return { nonces, sessionKey }
}

export const startSession = async (
  input: StartSessionInput,
): Promise<StartSessionResult> => {
  try {
    const parsedInput = startSessionInputSchema.parse(input)
    const dbTestMode = DB_TEST_MODE_BY_APP_MODE[parsedInput.mode]
    const {
      data: { user },
    } = await getUser()

    if (!user) {
      throw new Error('Unauthorized')
    }

    const supabase = await createServiceClient()
    const modeDef = MODE_DEFINITIONS[parsedInput.mode]

    if (modeDef?.isPro) {
      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select('tier, status')
        .eq('user_id', user.id)
        .maybeSingle()

      const isPro = subscription?.tier !== 'free' && subscription?.status === 'active'
      if (!isPro) {
        throw new Error(`The ${modeDef.label} mode requires a Pro subscription.`)
      }
    }

    const mergedConfig = mergeWithPreset(
      parsedInput.mode,
      parsedInput.config as Partial<QuizSessionConfig>,
    )

    if (parsedInput.trailDayId) {
      mergedConfig.setup.trailDayId = parsedInput.trailDayId
      mergedConfig.setup.isTrailSession = true
    }

    const { questionCount, topics, disciplines, initialDifficulty } = mergedConfig.setup

    const { data: globalStats } = await supabase
      .from('user_global_stats')
      .select('global_readiness_score, current_discipline_id')
      .eq('user_id', user.id)
      .single()

    const readinessScoreBefore = globalStats?.global_readiness_score ?? 0
    const disciplineId: string | null = globalStats?.current_discipline_id ?? null

    const recentCutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const { data: recentInteractions } = await supabase
      .from('user_interactions')
      .select('question_id')
      .eq('user_id', user.id)
      .gte('interaction_timestamp', recentCutoff)

    const recentQuestionIds = (recentInteractions ?? []).map(
      (interaction: { question_id: string }) => interaction.question_id,
    )

    let topicIds: string[] = []
    let filterByDisciplineId: string | null = null

    if (topics.length > 0) {
      const { data: selectedNodes } = await supabase
        .from('taxonomy_tree')
        .select('node_id, is_leaf')
        .in('node_id', topics)

      const leafIds = (selectedNodes ?? [])
        .filter((node: { is_leaf: boolean }) => node.is_leaf)
        .map((node: { node_id: string }) => node.node_id)

      const parentIds = (selectedNodes ?? [])
        .filter((node: { is_leaf: boolean }) => !node.is_leaf)
        .map((node: { node_id: string }) => node.node_id)

      if (parentIds.length > 0) {
        const { data: childLeaves } = await supabase
          .from('taxonomy_tree')
          .select('node_id')
          .in('parent_id', parentIds)
          .eq('is_leaf', true)
          .eq('is_cross_ref_only', false)
          .is('deprecated_at', null)

        leafIds.push(...(childLeaves ?? []).map((node: { node_id: string }) => node.node_id))
      }

      if (parentIds.length > 0) {
        const { data: crossRefs } = await supabase
          .from('taxonomy_cross_references')
          .select('target_node_id')
          .in('source_node_id', parentIds)

        if (crossRefs && crossRefs.length > 0) {
          const targetIds = crossRefs.map(
            (crossRef: { target_node_id: string }) => crossRef.target_node_id,
          )
          const { data: crossRefLeaves } = await supabase
            .from('taxonomy_tree')
            .select('node_id')
            .in('parent_id', targetIds)
            .eq('is_leaf', true)
            .eq('is_cross_ref_only', false)
            .is('deprecated_at', null)

          const existingLeafIds = new Set(leafIds)
          for (const node of crossRefLeaves ?? []) {
            if (!existingLeafIds.has(node.node_id)) {
              leafIds.push(node.node_id)
            }
          }
        }
      }

      topicIds = leafIds.length > 0 ? leafIds : topics
    } else if (disciplines.length > 0 && disciplines.length <= 3) {
      filterByDisciplineId = disciplines[0]
    } else if (disciplineId) {
      filterByDisciplineId = disciplineId
    }

    let difficultyRange: { min: number; max: number } | null = null
    if (initialDifficulty === 'easy') difficultyRange = { min: 0, max: 0.4 }
    else if (initialDifficulty === 'medium') difficultyRange = { min: 0.4, max: 0.7 }
    else if (initialDifficulty === 'hard') difficultyRange = { min: 0.7, max: 1 }

    if (mergedConfig.interleave === true && topicIds.length > 0) {
      const interleavedQuestions = await selectQuestionsWithInterleaving({
        primaryTopicIds: topicIds,
        totalCount: questionCount,
        interleaveRatio: mergedConfig.interleave_ratio ?? 0.3,
        excludeQuestionIds: recentQuestionIds,
        difficultyRange,
      })

      if (interleavedQuestions.length === 0) {
        throw new Error(
          'No interleaved questions found for the selected topics. Try widening your selection.',
        )
      }

      const questionIds = interleavedQuestions.map((question) => question.question_id)
      const uniqueTopicIds = [
        ...new Set(interleavedQuestions.map((question) => question.topic_id)),
      ] as string[]
      const taxonomyMap = await buildTaxonomyBreadcrumbMap(supabase, uniqueTopicIds)

      const { data: session, error: sessionError } = await supabase
        .from('quiz_sessions')
        .insert({
          user_id: user.id,
          discipline_id: disciplineId,
          test_mode: dbTestMode,
          status: 'in_progress',
          config: mergedConfig,
          question_ids: questionIds,
          subject_ids: uniqueTopicIds,
          current_question_index: 0,
          started_at: new Date().toISOString(),
        })
        .select('session_id')
        .single()

      if (sessionError || !session) {
        throw sessionError ?? new Error('Failed to create session')
      }

      const clientQuestions: QuestionForClient[] = interleavedQuestions.map((question, index) =>
        toClientQuestion(
          {
            ...question,
            breadcrumb: taxonomyMap.get(question.topic_id) ?? '',
            is_interleaved: question.is_interleaved,
          },
          index + 1,
        ),
      )

      const { nonces, sessionKey } = await issueSessionSecurity(
        session.session_id,
        clientQuestions.map((question) => question.question_id),
        user.id,
      )

      return {
        sessionId: session.session_id,
        config: mergedConfig,
        questions: clientQuestions,
        totalQuestions: clientQuestions.length,
        readinessScoreBefore,
        nonces,
        sessionKey,
      }
    }

    if (filterByDisciplineId && topicIds.length === 0) {
      const { data: leafNodes } = await supabase
        .from('taxonomy_tree')
        .select('node_id')
        .eq('discipline_id', filterByDisciplineId)
        .eq('is_leaf', true)
        .eq('is_cross_ref_only', false)
        .is('deprecated_at', null)

      topicIds = (leafNodes ?? []).map((node: { node_id: string }) => node.node_id)
    }

    const performQuery = async (withDifficulty: boolean) => {
      let query = supabase
        .from('questions')
        .select(
          'question_id, topic_id, text, options, difficulty, prompt_image_url, question_type, metadata',
        )
        .limit(questionCount * 10)

      if (topicIds.length > 0) {
        query = query.in('topic_id', topicIds)
      }

      if (withDifficulty && difficultyRange) {
        query = query
          .gte('difficulty', difficultyRange.min)
          .lt('difficulty', difficultyRange.max)
      }

      return await query
    }

    let { data: rawQuestions, error: rawQuestionsError } = await performQuery(true)
    if (rawQuestionsError) throw rawQuestionsError

    if ((!rawQuestions || rawQuestions.length === 0) && difficultyRange) {
      const fallback = await performQuery(false)
      if (fallback.error) throw fallback.error
      rawQuestions = fallback.data
    }

    const allQuestions = rawQuestions ?? []
    const recentSet = new Set(recentQuestionIds)
    const freshQuestions = allQuestions.filter(
      (question: { question_id: string }) => !recentSet.has(question.question_id),
    )

    const pool =
      freshQuestions.length >= questionCount
        ? freshQuestions
        : [
            ...freshQuestions,
            ...allQuestions
              .filter((question: { question_id: string }) => recentSet.has(question.question_id))
              .slice(0, Math.max(0, questionCount - freshQuestions.length)),
          ]

    for (let index = pool.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1))
      ;[pool[index], pool[swapIndex]] = [pool[swapIndex], pool[index]]
    }

    const selectedQuestions = pool.slice(0, questionCount)
    if (selectedQuestions.length === 0) {
      throw new Error(
        difficultyRange
          ? 'No questions found for the selected topics or discipline. Try choosing a different difficulty level.'
          : 'No questions found for the selected topics or discipline. Try selecting more topics.',
      )
    }

    const questionIds = selectedQuestions.map(
      (question: { question_id: string }) => question.question_id,
    )
    const uniqueTopicIds = [
      ...new Set(selectedQuestions.map((question: { topic_id: string }) => question.topic_id)),
    ] as string[]
    const taxonomyMap = await buildTaxonomyBreadcrumbMap(supabase, uniqueTopicIds)

    const { data: session, error: sessionError } = await supabase
      .from('quiz_sessions')
      .insert({
        user_id: user.id,
        discipline_id: disciplineId,
        test_mode: dbTestMode,
        status: 'in_progress',
        config: mergedConfig,
        question_ids: questionIds,
        subject_ids: uniqueTopicIds,
        current_question_index: 0,
        started_at: new Date().toISOString(),
      })
      .select('session_id')
      .single()

    if (sessionError || !session) {
      throw sessionError ?? new Error('Failed to create session')
    }

    const clientQuestions: QuestionForClient[] = selectedQuestions.map((question: any, index) =>
      toClientQuestion(
        {
          ...question,
          breadcrumb: taxonomyMap.get(question.topic_id) ?? '',
        },
        index + 1,
      ),
    )

    const { nonces, sessionKey } = await issueSessionSecurity(
      session.session_id,
      clientQuestions.map((question) => question.question_id),
      user.id,
    )

    return {
      sessionId: session.session_id,
      config: mergedConfig,
      questions: clientQuestions,
      totalQuestions: clientQuestions.length,
      readinessScoreBefore,
      nonces,
      sessionKey,
    }
  } catch (error) {
    console.error('[quiz-v2/start-session] Failed:', error)
    throw error
  }
}
