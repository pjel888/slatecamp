'use server'

import { createClient, getUser } from '@/lib/supabase/server'
import { normalizeOptions, resolveRationaleText } from '@/lib/utils/question'
import type { QuestionHistoryStats, ReviewDataResult, ReviewQuestionData } from '@/types/quiz-config'

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
  // Batch in chunks of 80 to avoid Supabase header overflow on fullexam (200 questions)
  const questionIds: string[] = session.question_ids ?? []
  const BATCH_SIZE = 80

  const allQuestions: Array<{
    question_id: string
    text: string
    options: Array<{ id: string; letter: string; text: string; is_correct?: boolean }>
    correct_option_id: string
    rationale: string | null
    prompt_image_url: string | null
    topic_id: string
  }> = []

  for (let i = 0; i < questionIds.length; i += BATCH_SIZE) {
    const batch = questionIds.slice(i, i + BATCH_SIZE)
    const { data, error: batchError } = await supabase
      .from('questions')
      .select(
        'question_id, text, options, correct_option_id, rationale, prompt_image_url, topic_id',
      )
      .in('question_id', batch)

    if (batchError) throw batchError
    if (data) allQuestions.push(...(data as typeof allQuestions))
  }

  // 4. Fetch taxonomy breadcrumbs — batch to avoid header overflow on fullexam
  const topicIds = [...new Set(allQuestions.map((q: { topic_id: string }) => q.topic_id))]

  const taxonomyMap = new Map<string, string>()
  const wikiMap = new Map<string, string | null>()

  for (let i = 0; i < topicIds.length; i += BATCH_SIZE) {
    const batch = topicIds.slice(i, i + BATCH_SIZE)

    const { data: taxonomyNodes } = await supabase
      .from('taxonomy_tree')
      .select('node_id, name, subject_area')
      .in('node_id', batch)

    for (const n of (taxonomyNodes ?? []) as Array<{ node_id: string; name: string; subject_area: string }>) {
      taxonomyMap.set(n.node_id, `${n.subject_area} > ${n.name}`)
    }

    // 5. Fetch wiki article URLs for topics
    const { data: wikiLinks } = await supabase
      .from('wiki_article_taxonomy')
      .select('node_id, article_id, wiki_articles(slug)')
      .in('node_id', batch)
      .eq('is_primary', true)

    for (const w of (wikiLinks ?? []) as Array<{ node_id: string; wiki_articles?: { slug?: string } }>) {
      wikiMap.set(w.node_id, w.wiki_articles?.slug ? `/dashboard/wiki/${w.wiki_articles.slug}?from=quiz` : null)
    }
  }

  type QuestionRow = {
    question_id: string
    text: string
    options: Array<{ id: string; letter: string; text: string; is_correct?: boolean }>
    correct_option_id: string
    rationale: string | null
    prompt_image_url: string | null
    topic_id: string
  }

  // 6. Build questionMap for ordered access
  const questionDataMap = new Map<string, QuestionRow>(
    (allQuestions as QuestionRow[]).map((q) => [q.question_id, q]),
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

  // 8. Check if user is Pro
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', user.id)
    .single()

  const isPro =
    profile?.subscription_tier === 'pro' || profile?.subscription_tier === 'premium'

  // 9. Fetch per-question history for Pro users
  // Batch in chunks of 80 to avoid Supabase header overflow on fullexam (200 questions)
  let questionHistory: Record<string, QuestionHistoryStats> | undefined

  if (isPro && questionIds.length > 0) {
    const historyMap: Record<string, QuestionHistoryStats> = {}

    for (let i = 0; i < questionIds.length; i += BATCH_SIZE) {
      const batch = questionIds.slice(i, i + BATCH_SIZE)
      const { data: batchHistory } = await supabase
        .from('user_interactions')
        .select('question_id, is_correct, created_at')
        .eq('user_id', user.id)
        .in('question_id', batch)

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
