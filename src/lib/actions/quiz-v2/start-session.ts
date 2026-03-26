'use server'

import { createClient, getUser } from '@/lib/supabase/server'
import { mergeWithPreset } from '@/lib/quiz/mode-presets'
import { normalizeOptions } from '@/lib/utils/question'
import { selectQuestionsWithInterleaving } from '@/lib/quiz/interleaved-selection'
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
    options: unknown
    prompt_image_url: string | null
    difficulty: number
    topic_id: string
    breadcrumb?: string
    is_interleaved?: boolean
    question_type?: string
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
  is_interleaved: q.is_interleaved ?? false,
  question_type: (q.question_type as QuestionForClient['question_type']) ?? 'mcq',
  unit: null,
  options: normalizeOptions(q.options),
})

// ─── Action ──────────────────────────────────────────────────────────────────

export const startSession = async (
  input: StartSessionInput,
): Promise<StartSessionResult> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await getUser()
  if (!user) {
    console.error('[startSession] No authenticated user')
    throw new Error('Unauthorized')
  }

  console.log('[startSession] Starting for user:', user.id, 'mode:', input.mode)

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
  // NOTE: Supabase .in() has a ~50-UUID practical limit before hitting header overflow.
  // For large sets (Camp/Storm/FullExam with no specific topics), skip the topic filter
  // and query all questions — the shuffle + cap will handle diversity.
  let topicIds: string[] = []
  let filterByDisciplineId: string | null = null

  if (topics.length > 0) {
    // User picked topics from the picker — these may be subject-level (level 1)
    // or subtopic-level (level 2+). Questions are tagged at leaf level,
    // so expand any non-leaf selections to their leaf children.
    const { data: selectedNodes } = await supabase
      .from('taxonomy_tree')
      .select('node_id, is_leaf')
      .in('node_id', topics)

    const leafIds = (selectedNodes ?? [])
      .filter((n: { is_leaf: boolean }) => n.is_leaf)
      .map((n: { node_id: string }) => n.node_id)

    const parentIds = (selectedNodes ?? [])
      .filter((n: { is_leaf: boolean }) => !n.is_leaf)
      .map((n: { node_id: string }) => n.node_id)

    if (parentIds.length > 0) {
      // Expand parent nodes to their leaf children
      const { data: childLeaves } = await supabase
        .from('taxonomy_tree')
        .select('node_id')
        .in('parent_id', parentIds)
        .eq('is_leaf', true)
        .eq('is_cross_ref_only', false)
        .is('deprecated_at', null)

      leafIds.push(...(childLeaves ?? []).map((n: { node_id: string }) => n.node_id))
    }

    // Resolve cross-references: for any selected parent that maps to content
    // in other subjects (e.g. Laws & Codes → PPJ, DSGN, MEPF), pull in those
    // target subtopics' leaf children too. This works for pure cross-ref
    // selections AND mixed selections (Laws + regular subtopics together).
    if (parentIds.length > 0) {
      const { data: crossRefs } = await supabase
        .from('taxonomy_cross_references')
        .select('target_node_id')
        .in('source_node_id', parentIds)

      if (crossRefs && crossRefs.length > 0) {
        const targetIds = crossRefs.map((cr: { target_node_id: string }) => cr.target_node_id)
        const { data: crossRefLeaves } = await supabase
          .from('taxonomy_tree')
          .select('node_id')
          .in('parent_id', targetIds)
          .eq('is_leaf', true)
          .eq('is_cross_ref_only', false)
          .is('deprecated_at', null)

        // Deduplicate — a leaf may already be in the set from direct expansion
        const existingSet = new Set(leafIds)
        for (const n of (crossRefLeaves ?? [])) {
          if (!existingSet.has(n.node_id)) leafIds.push(n.node_id)
        }
      }
    }

    topicIds = leafIds.length > 0 ? leafIds : topics
  } else if (disciplines.length > 0 && disciplines.length <= 3) {
    // Filter by discipline_id on questions table via taxonomy join
    // Don't expand to leaf nodes — use discipline filter instead
    filterByDisciplineId = disciplines[0]
  } else if (disciplineId) {
    // Fall back to user's active discipline — filter at discipline level, not leaf level
    filterByDisciplineId = disciplineId
  }
  // If none of the above: query ALL questions (Camp default behavior)

  // 4. Build difficulty filter
  let difficultyRange: { min: number; max: number } | null = null
  if (initialDifficulty === 'easy') difficultyRange = { min: 0, max: 0.4 }
  else if (initialDifficulty === 'medium') difficultyRange = { min: 0.4, max: 0.7 }
  else if (initialDifficulty === 'hard') difficultyRange = { min: 0.7, max: 1 }

  // ── 4b. Interleaved selection path ─────────────────────────────────────────
  // When interleave is enabled and we have resolved topic IDs, use the
  // interleaved selection algorithm instead of the standard question fetch.
  const useInterleaving = mergedConfig.interleave === true && topicIds.length > 0

  if (useInterleaving) {
    const interleaveRatio = mergedConfig.interleave_ratio ?? 0.3

    console.log('[startSession] Using interleaved selection, ratio:', interleaveRatio, 'topics:', topicIds.length)

    const interleavedQuestions = await selectQuestionsWithInterleaving({
      primaryTopicIds: topicIds,
      totalCount: questionCount,
      interleaveRatio,
      excludeQuestionIds: recentQuestionIds,
      difficultyRange,
    })

    const interleavedIds = interleavedQuestions.map((q) => q.question_id)

    // Fetch taxonomy breadcrumbs for interleaved questions
    const ilUniqueTids = [...new Set(interleavedQuestions.map((q) => q.topic_id))]
    const TAXONOMY_BATCH = 80
    const ilTaxMap = new Map<string, string>()

    for (let i = 0; i < ilUniqueTids.length; i += TAXONOMY_BATCH) {
      const batch = ilUniqueTids.slice(i, i + TAXONOMY_BATCH)
      const { data: taxonomyNodes } = await supabase
        .from('taxonomy_tree')
        .select('node_id, name, subject_area')
        .in('node_id', batch)

      for (const n of (taxonomyNodes ?? []) as Array<{ node_id: string; name: string; subject_area: string }>) {
        ilTaxMap.set(n.node_id, `${n.subject_area} > ${n.name}`)
      }
    }

    // Create session row
    const { data: ilSession, error: ilSessionError } = await supabase
      .from('quiz_sessions')
      .insert({
        user_id: user.id,
        discipline_id: disciplineId,
        test_mode: 'camp',
        status: 'in_progress',
        config: mergedConfig,
        question_ids: interleavedIds,
        subject_ids: ilUniqueTids,
        started_at: new Date().toISOString(),
      })
      .select('session_id')
      .single()

    if (ilSessionError) {
      console.error('[startSession] Failed to create interleaved session:', ilSessionError)
      throw ilSessionError
    }

    console.log('[startSession] Interleaved session created:', ilSession.session_id, 'with', interleavedQuestions.length, 'questions')

    const ilClientQuestions: QuestionForClient[] = interleavedQuestions.map(
      (q, idx) =>
        toClientQuestion(
          {
            ...q,
            breadcrumb: ilTaxMap.get(q.topic_id) ?? '',
            is_interleaved: q.is_interleaved,
          },
          idx + 1,
        ),
    )

    return {
      sessionId: ilSession.session_id,
      config: mergedConfig,
      questions: ilClientQuestions,
      totalQuestions: ilClientQuestions.length,
      readinessScoreBefore,
    }
  }

  // ── Standard (non-interleaved) question selection ──────────────────────────

  // 5. Fetch questions
  let questionQuery = supabase
    .from('questions')
    .select(
      'question_id, topic_id, text, options, difficulty, prompt_image_url, question_type',
    )
    .limit(questionCount * 3) // fetch extras to allow exclusion filtering

  if (topicIds.length > 0 && topicIds.length <= 100) {
    // Safe for .in() URL param (under ~16KB header limit)
    questionQuery = questionQuery.in('topic_id', topicIds)
  } else if (filterByDisciplineId) {
    // Large discipline-level filter — fetching all leaf node IDs then using .in()
    // overflows Supabase's 16KB header limit (~200+ UUIDs).
    // Instead: fetch leaf node IDs for JS-side filtering AFTER the query.
    // The question query runs without a topic filter (fetches extras), then we
    // filter to only questions belonging to this discipline's leaf nodes.
    const { data: leafNodes } = await supabase
      .from('taxonomy_tree')
      .select('node_id')
      .eq('discipline_id', filterByDisciplineId)
      .eq('is_leaf', true)
      .eq('is_cross_ref_only', false)
      .is('deprecated_at', null)

    // Store for post-query JS filtering instead of .in() URL param
    topicIds = (leafNodes ?? []).map((n: { node_id: string }) => n.node_id)
    // DON'T add .in() to the query — filter in step 6 below
  }
  // else: no filter — query all questions (Camp/mixed mode default)

  if (difficultyRange) {
    questionQuery = questionQuery
      .gte('difficulty', difficultyRange.min)
      .lt('difficulty', difficultyRange.max)
  }

  const { data: rawQuestions, error: qError } = await questionQuery

  if (qError) throw qError

  // 6. Exclude recently seen, shuffle, cap at questionCount
  // If topicIds were set but NOT passed to .in() (discipline-level filter to avoid
  // header overflow), filter in JS now.
  const topicIdSet = topicIds.length > 100 ? new Set(topicIds) : null
  const allQuestions = topicIdSet
    ? (rawQuestions ?? []).filter((q: { topic_id: string }) => topicIdSet.has(q.topic_id))
    : (rawQuestions ?? [])
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
  // Batch in chunks of 80 to avoid Supabase header overflow on fullexam (200 questions)
  const uniqueTopicIds = [...new Set(selectedQuestions.map((q: { topic_id: string }) => q.topic_id))]
  const TAXONOMY_BATCH = 80
  const taxonomyMap = new Map<string, string>()

  for (let i = 0; i < uniqueTopicIds.length; i += TAXONOMY_BATCH) {
    const batch = uniqueTopicIds.slice(i, i + TAXONOMY_BATCH)
    const { data: taxonomyNodes } = await supabase
      .from('taxonomy_tree')
      .select('node_id, name, subject_area')
      .in('node_id', batch)

    for (const n of (taxonomyNodes ?? []) as Array<{ node_id: string; name: string; subject_area: string }>) {
      taxonomyMap.set(n.node_id, `${n.subject_area} > ${n.name}`)
    }
  }

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

  if (sessionError) {
    console.error('[startSession] Failed to create session:', sessionError)
    throw sessionError
  }

  console.log('[startSession] Session created:', session.session_id, 'with', selectedQuestions.length, 'questions')

  // 9. Shape questions for client (strip correct_option_id, rationale, wrong_answer_rationales)
  const clientQuestions: QuestionForClient[] = selectedQuestions.map(
    (q: {
      question_id: string
      text: string
      options: Array<{ id: string; letter: string; text: string }>
      prompt_image_url: string | null
      difficulty: number
      topic_id: string
      question_type?: string
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
