'use server'

import { createClient, createServiceClient, getUser } from '@/lib/supabase/server'
import { normalizeOptions, resolveRationaleText } from '@/lib/utils/question'
import type { QuestionHistoryStats, ReviewDataResult, ReviewQuestionData } from '@/types/quiz-config'
import { getViewerEntitlements } from '@/lib/entitlements/get-viewer-entitlements'
import { ENTITLEMENT_FEATURE_KEYS } from '@/lib/entitlements/feature-keys'
import {
  logEntitlementAuditEvent,
  serializeOverrideState,
} from '@/lib/entitlements/audit'

export const getReviewData = async (
  sessionId: string,
): Promise<ReviewDataResult> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await getUser()
  if (!user) throw new Error('Unauthorized')

  // 1. Fetch session metadata
  const { data: session, error: sessionError } = await supabase
    .from('quiz_sessions')
    .select('session_id, user_id, config, question_ids, status')
    .eq('session_id', sessionId)
    .eq('user_id', user.id)
    .single()

  if (sessionError || !session) throw new Error('Session not found')

  // 2. Fetch all interactions for the session
  const { data: interactions, error: interactionsError } = await supabase
    .from('user_interactions')
    .select(
      'question_id, selected_option_id, is_correct, is_flagged, confidence, question_order',
    )
    .eq('session_id', sessionId)
    .eq('user_id', user.id)

  if (interactionsError) throw interactionsError

  const allInteractions = interactions ?? []
  const interactionMap = new Map(
    allInteractions.map((i: { question_id: string }) => [i.question_id, i]),
  )

  // 3. Fetch all questions (full detail for review — includes correct_option_id and rationale)
  // Batch in chunks of 80 to avoid Supabase header overflow on full_exam (200 questions)
  const questionIds: string[] = session.question_ids ?? []
  const BATCH_SIZE = 80

  // questions table has admin-only RLS — must use service client
  const serviceClient = await createServiceClient()

  const allQuestions: Array<{
    question_id: string
    text: string
    options: Array<{ id: string; letter: string; text: string; is_correct?: boolean }>
    correct_option_id: string
    rationale: string | null
    prompt_image_url: string | null
    topic_id: string
  }> = []

  const questionBatches = []
  for (let i = 0; i < questionIds.length; i += BATCH_SIZE) {
    questionBatches.push(questionIds.slice(i, i + BATCH_SIZE))
  }

  const questionBatchResults = await Promise.all(
    questionBatches.map((batch) =>
      serviceClient
        .from('questions')
        .select(
          'question_id, text, options, correct_option_id, rationale, prompt_image_url, topic_id, difficulty',
        )
        .in('question_id', batch)
    ),
  )

  for (const { data, error: batchError } of questionBatchResults) {
    if (batchError) throw batchError
    if (data) allQuestions.push(...(data as any[]))
  }

  // 4. Fetch taxonomy breadcrumbs — batch to avoid header overflow on full_exam
  const topicIds = [...new Set(allQuestions.map((q: any) => q.topic_id))]

  const taxonomyMap = new Map<string, string>()
  const wikiMap = new Map<string, string | null>()

  const topicBatches = []
  for (let i = 0; i < topicIds.length; i += BATCH_SIZE) {
    topicBatches.push(topicIds.slice(i, i + BATCH_SIZE))
  }

  await Promise.all(
    topicBatches.map(async (batch) => {
      // Parallel: taxonomy + wiki are independent queries
      const [{ data: taxonomyNodes }, { data: wikiLinks }] = await Promise.all([
        supabase
          .from('taxonomy_tree')
          .select('node_id, name, subject_area')
          .in('node_id', batch),
        supabase
          .from('wiki_article_taxonomy')
          .select('node_id, article_id, wiki_articles(article_id)')
          .in('node_id', batch)
          .eq('is_primary', true),
      ])

      for (const n of (taxonomyNodes ?? []) as Array<{ node_id: string; name: string; subject_area: string }>) {
        taxonomyMap.set(n.node_id, `${n.subject_area} > ${n.name}`)
      }

      for (const w of (wikiLinks ?? []) as Array<{ node_id: string; wiki_articles?: { article_id?: string } }>) {
        wikiMap.set(w.node_id, w.wiki_articles?.article_id ? `/dashboard/wiki/${w.wiki_articles.article_id}?from=quiz` : null)
      }
    }),
  )

  type QuestionRow = {
    question_id: string
    text: string
    options: Array<{ id: string; letter: string; text: string; is_correct?: boolean }>
    correct_option_id: string
    rationale: string | null
    prompt_image_url: string | null
    topic_id: string
    difficulty: number
  }

  // 6. Build questionMap for ordered access
  const questionDataMap = new Map<string, QuestionRow>(
    (allQuestions as any[]).map((q) => [q.question_id, q as QuestionRow]),
  )

  // 7. Shape ReviewQuestionData in session order
  const reviewQuestions: ReviewQuestionData[] = questionIds
    .map((qid, idx) => {
      const q = questionDataMap.get(qid)
      if (!q) return null

      const interaction = interactionMap.get(qid) as
        | {
            selected_option_id: string | null
            is_correct: boolean
            is_flagged: boolean
            confidence: string | null
            question_order: number | null
          }
        | undefined

      const isSkipped = !interaction
      const isCorrect = interaction?.is_correct ?? false

      const confidenceLevel =
        interaction?.confidence === 'sure'
          ? 3
          : interaction?.confidence === 'unsure'
          ? 1
          : null

      const normalized = normalizeOptions(q.options)
      const options = normalized.map((o) => ({
        id: o.id,
        text: o.text,
        letter: o.letter,
        isCorrect: o.id === q.correct_option_id,
        isUserChoice: o.id === (interaction?.selected_option_id ?? null),
      }))

      return {
        position: interaction?.question_order ?? idx + 1,
        questionId: qid,
        topicId: q.topic_id,
        difficulty: q.difficulty ?? 0.5,
        stem: q.text,
        imageUrl: q.prompt_image_url,
        taxonomyBreadcrumb: taxonomyMap.get(q.topic_id) ?? '',
        options,
        isCorrect,
        isSkipped,
        isFlagged: interaction?.is_flagged ?? false,
        confidenceLevel,
        rationale: resolveRationaleText(q.rationale) || '',
        wikiArticleUrl: wikiMap.get(q.topic_id) ?? null,
        wrongAnswerExplanation: null, // populated from question options distractor data if available
      } satisfies ReviewQuestionData
    })
    .filter((q): q is ReviewQuestionData => q !== null)

  const correct = reviewQuestions.filter((q) => q.isCorrect).length
  const total = reviewQuestions.filter((q) => !q.isSkipped).length
  const percent = total > 0 ? Math.round((correct / total) * 100) : 0

  const config = session.config as { mode?: string } | null

  // 8. Check if user is Pro (Audit §13.4)
  const entitlements = await getViewerEntitlements([
    ENTITLEMENT_FEATURE_KEYS.questionsUnlimited,
  ])
  const isPro =
    entitlements.decisions[ENTITLEMENT_FEATURE_KEYS.questionsUnlimited]?.allowed ?? false

  logEntitlementAuditEvent({
    eventName: isPro ? 'entitlement.decision' : 'entitlement.denied',
    timestamp: new Date().toISOString(),
    traceId: entitlements.traceId,
    userId: entitlements.userId,
    routeOrAction: 'quiz-v2:get-review-data',
    featureKey: ENTITLEMENT_FEATURE_KEYS.questionsUnlimited,
    normalizedRole: entitlements.normalizedRole,
    roleSource: entitlements.roleResolution.resolvedFrom,
    rawTier: entitlements.rawTier,
    subscriptionStatus: entitlements.subscriptionStatus,
    effectiveTier: entitlements.effectiveTier,
    overrideState: serializeOverrideState(entitlements.overrides),
    decision: isPro,
    denialReason: isPro ? undefined : 'insufficient_tier',
    decisionSource: 'quiz-v2.get-review-data',
    trace: ['question-history'],
  })

  // 9. Fetch per-question history for Pro users
  // Batch in chunks of 80 to avoid Supabase header overflow on full_exam (200 questions)
  let questionHistory: Record<string, QuestionHistoryStats> | undefined

  if (isPro && questionIds.length > 0) {
    const historyMap: Record<string, QuestionHistoryStats> = {}

    const historyBatches = []
    for (let i = 0; i < questionIds.length; i += BATCH_SIZE) {
      historyBatches.push(questionIds.slice(i, i + BATCH_SIZE))
    }

    const historyResults = await Promise.all(
      historyBatches.map((batch) =>
        supabase
          .from('user_interactions')
          .select('question_id, is_correct, created_at')
          .eq('user_id', user.id)
          .in('question_id', batch)
      ),
    )

    for (const { data: batchHistory } of historyResults) {
      for (const row of batchHistory ?? []) {
        const stats = historyMap[row.question_id] ?? {
          timesSeen: 0,
          timesCorrect: 0,
          timesWrong: 0,
          lastSeenAt: null,
        }
        stats.timesSeen++
        if (row.is_correct) stats.timesCorrect++
        else stats.timesWrong++
        if (!stats.lastSeenAt || row.created_at > stats.lastSeenAt) {
          stats.lastSeenAt = row.created_at
        }
        historyMap[row.question_id] = stats
      }
    }
    questionHistory = historyMap
  }

  return {
    sessionId,
    mode: (config?.mode ?? 'camp') as ReviewDataResult['mode'],
    score: { correct, total, percent },
    questions: reviewQuestions,
    ...(questionHistory !== undefined && { questionHistory }),
  }
}
