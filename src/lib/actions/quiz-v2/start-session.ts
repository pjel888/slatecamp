'use server'

import { randomBytes } from 'crypto'
import { MODE_DEFINITIONS } from '@/lib/constants/testing-modes'
import { startSessionInputSchema } from '@/lib/actions/quiz-v2/schemas'
import { selectQuestionsWithInterleaving } from '@/lib/quiz/interleaved-selection'
import { selectQuestionsWithRouting } from '@/lib/quiz/intelligent-routing'
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
      const isDevBypass = process.env.NODE_ENV === 'development'
      
      if (!isPro && !isDevBypass) {
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

      let parentIds = (selectedNodes ?? [])
        .filter((node: { is_leaf: boolean }) => !node.is_leaf)
        .map((node: { node_id: string }) => node.node_id)

      // Traverse down the tree to find all leaf nodes.
      // Since our taxonomy is typically max 3-4 levels, a loop is safe.
      let depth = 0
      while (parentIds.length > 0 && depth < 3) {
        const { data: children } = await supabase
          .from('taxonomy_tree')
          .select('node_id, is_leaf')
          .in('parent_id', parentIds)
          .eq('is_cross_ref_only', false)
          .is('deprecated_at', null)

        const childLeaves = (children ?? []).filter(c => c.is_leaf).map(c => c.node_id)
        const childParents = (children ?? []).filter(c => !c.is_leaf).map(c => c.node_id)

        leafIds.push(...childLeaves)
        parentIds = childParents
        depth++
      }

      // Handle Cross-References
      const crossRefSourceIds = (selectedNodes ?? [])
        .filter((node: { is_leaf: boolean }) => !node.is_leaf)
        .map((node: { node_id: string }) => node.node_id)

      if (crossRefSourceIds.length > 0) {
        const { data: crossRefs } = await supabase
          .from('taxonomy_cross_references')
          .select('target_node_id')
          .in('source_node_id', crossRefSourceIds)

        if (crossRefs && crossRefs.length > 0) {
          const targetIds = crossRefs.map(
            (crossRef: { target_node_id: string }) => crossRef.target_node_id,
          )
          
          let crParentIds = targetIds
          let crDepth = 0
          while (crParentIds.length > 0 && crDepth < 3) {
            const { data: crChildren } = await supabase
              .from('taxonomy_tree')
              .select('node_id, is_leaf')
              .in('parent_id', crParentIds)
              .eq('is_cross_ref_only', false)
              .is('deprecated_at', null)

            const crLeaves = (crChildren ?? []).filter(c => c.is_leaf).map(c => c.node_id)
            const crParents = (crChildren ?? []).filter(c => !c.is_leaf).map(c => c.node_id)

            const existingLeafIds = new Set(leafIds)
            crLeaves.forEach(id => {
              if (!existingLeafIds.has(id)) leafIds.push(id)
            })

            crParentIds = crParents
            crDepth++
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

    // Resolve discipline to leaf topics if no specific topics selected
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

    if (topicIds.length === 0) {
      throw new Error('No topics selected or found for the current discipline.')
    }

    // Question Selection (Intelligent Routing vs Interleaving)
    let selectedQuestions: any[] = []

    if (mergedConfig.interleave === true) {
      selectedQuestions = await selectQuestionsWithInterleaving({
        primaryTopicIds: topicIds,
        totalCount: questionCount,
        interleaveRatio: mergedConfig.interleave_ratio ?? 0.3,
        excludeQuestionIds: recentQuestionIds,
        difficultyRange,
      })
    } else {
      // DEFAULT: Intelligent Routing (60/30/10)
      selectedQuestions = await selectQuestionsWithRouting({
        supabase,
        userId: user.id,
        topicIds,
        questionCount,
        difficultyRange,
      })
    }

    if (selectedQuestions.length === 0) {
      throw new Error(
        'No questions found. Try widening your selection or changing difficulty.'
      )
    }

    const questionIds = selectedQuestions.map((q) => q.question_id)
    const uniqueTopicIds = [...new Set(selectedQuestions.map((q) => q.topic_id))] as string[]
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

    const clientQuestions: QuestionForClient[] = selectedQuestions.map((question, index) =>
      toClientQuestion(
        {
          ...question,
          breadcrumb: taxonomyMap.get(question.topic_id) ?? '',
          is_interleaved: (question as any).is_interleaved ?? false,
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
