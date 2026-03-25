'use server'

import { createClient, getUser } from '@/lib/supabase/server'
import { mergeWithPreset } from '@/lib/quiz/mode-presets'
import type {
  StartSessionInput,
  StartSessionResult,
  QuestionForClient,
} from '@/types/quiz-config'

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Maps difficulty numeric (0–1) to label */
const toDifficultyLabel = (d: number): 'Easy' | 'Medium' | 'Hard' => {
  if (d < 0.4) return 'Easy'
  if (d < 0.7) return 'Medium'
  return 'Hard'
}

/** Strips server-only fields and shapes a DB question for the client */
const toClientQuestion = (
  q: {
    question_id: string
    text: string
    options: Array<{ id: string; letter: string; text: string }>
    prompt_image_url: string | null
    difficulty: number
    topic_id: string
    breadcrumb?: string
  },
  position: number,
): QuestionForClient => ({
  question_id: q.question_id,
  position,
  stem: q.text,
  image_url: q.prompt_image_url,
  image_alt_text: null,
  taxonomy_breadcrumb: q.breadcrumb ?? '',
  difficulty_label: toDifficultyLabel(q.difficulty ?? 0.5),
  options: q.options.map((o) => ({
    id: o.id,
    letter: o.letter as 'A' | 'B' | 'C' | 'D',
    text: o.text,
  })),
})

// ─── Action ──────────────────────────────────────────────────────────────────

export const startSession = async (
  input: StartSessionInput,
): Promise<StartSessionResult> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await getUser()
  if (!user) throw new Error('Unauthorized')

  // 1. Merge user overrides with mode preset
  const mergedConfig = mergeWithPreset(input.mode, input.config)

  // Inject trailDayId if provided
  if (input.trailDayId) {
    mergedConfig.setup.trailDayId = input.trailDayId
    mergedConfig.setup.isTrailSession = true
  }

  const { questionCount, topics, disciplines, initialDifficulty } = mergedConfig.setup

  // 2. Read current readiness score before session
  const { data: globalStats } = await supabase
    .from('user_global_stats')
    .select('global_readiness_score, current_discipline_id')
    .eq('user_id', user.id)
    .single()

  const readinessScoreBefore = globalStats?.global_readiness_score ?? 0
  const disciplineId: string | null = globalStats?.current_discipline_id ?? null

  // 3. Build question query
  // 7-day recency exclusion: get recently-answered question IDs
  const recentCutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const { data: recentInteractions } = await supabase
    .from('user_interactions')
    .select('question_id')
    .eq('user_id', user.id)
    .gte('interaction_timestamp', recentCutoff)

  const recentQuestionIds = (recentInteractions ?? []).map(
    (r: { question_id: string }) => r.question_id,
  )

  // Determine topic_ids to filter by
  let topicIds: string[] = []

  if (topics.length > 0) {
    // Use provided topic IDs directly
    topicIds = topics
  } else if (disciplines.length > 0) {
    // Expand disciplines to leaf nodes
    const { data: leafNodes } = await supabase
      .from('taxonomy_tree')
      .select('node_id')
      .in('discipline_id', disciplines)
      .eq('is_leaf', true)
      .eq('is_cross_ref_only', false)
      .is('deprecated_at', null)

    topicIds = (leafNodes ?? []).map((n: { node_id: string }) => n.node_id)
  } else if (disciplineId) {
    // Fall back to user's active discipline
    const { data: leafNodes } = await supabase
      .from('taxonomy_tree')
      .select('node_id')
      .eq('discipline_id', disciplineId)
      .eq('is_leaf', true)
      .eq('is_cross_ref_only', false)
      .is('deprecated_at', null)

    topicIds = (leafNodes ?? []).map((n: { node_id: string }) => n.node_id)
  }

  // 4. Build difficulty filter
  let difficultyRange: { min: number; max: number } | null = null
  if (initialDifficulty === 'easy') difficultyRange = { min: 0, max: 0.4 }
  else if (initialDifficulty === 'medium') difficultyRange = { min: 0.4, max: 0.7 }
  else if (initialDifficulty === 'hard') difficultyRange = { min: 0.7, max: 1 }

  // 5. Fetch questions
  let questionQuery = supabase
    .from('questions')
    .select(
      'question_id, topic_id, text, options, difficulty, prompt_image_url',
    )
    .limit(questionCount * 3) // fetch extras to allow exclusion filtering

  if (topicIds.length > 0) {
    questionQuery = questionQuery.in('topic_id', topicIds)
  }

  if (difficultyRange) {
    questionQuery = questionQuery
      .gte('difficulty', difficultyRange.min)
      .lt('difficulty', difficultyRange.max)
  }

  const { data: rawQuestions, error: qError } = await questionQuery

  if (qError) throw qError

  // 6. Exclude recently seen, shuffle, cap at questionCount
  const allQuestions = rawQuestions ?? []
  const recentSet = new Set(recentQuestionIds)

  const fresh = allQuestions.filter(
    (q: { question_id: string }) => !recentSet.has(q.question_id),
  )
  // If not enough fresh questions, backfill from seen pool
  const pool =
    fresh.length >= questionCount
      ? fresh
      : [
          ...fresh,
          ...allQuestions
            .filter((q: { question_id: string }) => recentSet.has(q.question_id))
            .slice(0, questionCount - fresh.length),
        ]

  // Fisher-Yates shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }

  const selectedQuestions = pool.slice(0, questionCount)
  const questionIds = selectedQuestions.map(
    (q: { question_id: string }) => q.question_id,
  )

  // 7. Fetch taxonomy breadcrumbs for selected topics
  const uniqueTopicIds = [...new Set(selectedQuestions.map((q: { topic_id: string }) => q.topic_id))]
  const { data: taxonomyNodes } = await supabase
    .from('taxonomy_tree')
    .select('node_id, name, subject_area')
    .in('node_id', uniqueTopicIds)

  const taxonomyMap = new Map<string, string>(
    (taxonomyNodes ?? []).map((n: { node_id: string; name: string; subject_area: string }) => [
      n.node_id,
      `${n.subject_area} > ${n.name}`,
    ] as [string, string]),
  )

  // 8. Create quiz_sessions row
  const { data: session, error: sessionError } = await supabase
    .from('quiz_sessions')
    .insert({
      user_id: user.id,
      discipline_id: disciplineId,
      test_mode: 'camp', // DB enum — v2 mode stored in config JSONB
      status: 'in_progress',
      config: mergedConfig,
      question_ids: questionIds,
      subject_ids: uniqueTopicIds,
      started_at: new Date().toISOString(),
    })
    .select('session_id')
    .single()

  if (sessionError) throw sessionError

  // 9. Shape questions for client (strip correct_option_id, rationale, wrong_answer_rationales)
  const clientQuestions: QuestionForClient[] = selectedQuestions.map(
    (q: {
      question_id: string
      text: string
      options: Array<{ id: string; letter: string; text: string }>
      prompt_image_url: string | null
      difficulty: number
      topic_id: string
    }, idx: number) =>
      toClientQuestion(
        { ...q, breadcrumb: taxonomyMap.get(q.topic_id) ?? '' },
        idx + 1,
      ),
  )

  return {
    sessionId: session.session_id,
    config: mergedConfig,
    questions: clientQuestions,
    totalQuestions: clientQuestions.length,
    readinessScoreBefore,
  }
}
