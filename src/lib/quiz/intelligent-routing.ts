// src/lib/quiz/intelligent-routing.ts
// ─────────────────────────────────────────────────────────────────────────────
// Intelligent Question Routing (Doc 03 Pivot)
// Implements the 60/30/10 Pedagogical Algorithm:
//   - 60% Unseen (Discovery)
//   - 30% Remediation (Incorrect previously)
//   - 10% Spaced Repetition (Mastered, but not seen in 14+ days)
// ─────────────────────────────────────────────────────────────────────────────

import { SupabaseClient } from '@supabase/supabase-js'
import { filterQuestionsReadableForStage } from '@/lib/admin/editor-integrity/standard-question'

interface QuestionPoolRow {
  question_id: string
  article_id?: string | null
  topic_id: string
  text: string
  options: unknown
  difficulty: number
  prompt_image_url: string | null
  question_type: string | null
  rationale: unknown
  explanation: string | null
}

interface RoutingOptions {
  supabase: SupabaseClient
  userId: string
  topicIds: string[]
  questionCount: number
  difficultyRange?: { min: number; max: number } | null
  excludeQuestionIds?: string[]
}

// PostgREST has URL length limits (~2000 chars). Chunk large .in() queries.
const CHUNK_SIZE = 100 

const queryQuestionsChunked = async (
  supabase: SupabaseClient,
  cols: string,
  topicIds: string[],
  limit: number,
  difficultyRange?: { min: number; max: number } | null,
  additionalFilter?: (query: any) => any,
): Promise<QuestionPoolRow[]> => {
  if (topicIds.length === 0) return []

  const chunks: string[][] = []
  for (let i = 0; i < topicIds.length; i += CHUNK_SIZE) {
    chunks.push(topicIds.slice(i, i + CHUNK_SIZE))
  }

  // Distribute limit across chunks to avoid over-fetching (2x safety margin)
  const perChunkLimit = Math.max(1, Math.ceil((limit * 2) / chunks.length))
  const chunkResults = await Promise.all(
    chunks.map(async (chunk) => {
      let query = supabase.from('questions').select(cols).in('topic_id', chunk).limit(perChunkLimit)
      
      if (difficultyRange) {
        query = query.gte('difficulty', difficultyRange.min).lt('difficulty', difficultyRange.max)
      }
      
      if (additionalFilter) {
        query = additionalFilter(query)
      }

      const { data, error } = await query
      if (error) {
        console.warn('[intelligent-routing] chunk query failed:', { 
          message: error.message, 
          chunkSize: chunk.length,
          limit 
        })
        return []
      }
      return (data ?? []) as unknown as QuestionPoolRow[]
    })
  )

  // No internal shuffle needed — perChunkLimit distributes fairly across chunks.
  // Final pool shuffle in selectQuestionsWithRouting handles randomization.
  const combinedResults = chunkResults.flat()
  const { questions: readableQuestions, error } = await filterQuestionsReadableForStage<QuestionPoolRow>(
    supabase,
    combinedResults,
    'delivery',
  )

  if (error) {
    console.warn('[intelligent-routing] delivery filter failed:', error)
    return []
  }

  return readableQuestions.slice(0, limit)
}

/**
 * selectQuestionsWithRouting
 * Implements the 60/30/10 Pedagogical Algorithm.
 */
export const selectQuestionsWithRouting = async ({
  supabase,
  userId,
  topicIds,
  questionCount,
  difficultyRange,
  excludeQuestionIds = [],
}: RoutingOptions): Promise<QuestionPoolRow[]> => {
  const QUESTION_COLS =
    'question_id, article_id, topic_id, text, options, difficulty, prompt_image_url, question_type, rationale, explanation'

  // 1. Calculate Quotas
  const unseenQuota = Math.floor(questionCount * 0.6)
  const remediationQuota = Math.floor(questionCount * 0.3)
  const srQuota = Math.max(0, questionCount - unseenQuota - remediationQuota)

  const srCutoff = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()

  // 2. Single query to user_question_states (replaces 3 separate queries)
  // Trigger-maintained summary table — one row per (user_id, question_id)
  const { data: allStates, error: statesErr } = await supabase
    .from('user_question_states')
    .select('question_id, last_is_correct, last_seen_at')
    .eq('user_id', userId)
    .limit(2000)

  if (statesErr) console.warn('[intelligent-routing] question states query failed:', statesErr.message)

  const states = allStates ?? []
  const interactedIds = states.map(s => s.question_id)
  const remediationIds = states.filter(s => !s.last_is_correct).map(s => s.question_id)
  const srIds = states.filter(s => s.last_is_correct && s.last_seen_at < srCutoff).map(s => s.question_id)

  // Merge with caller-provided exclusions (avoids duplicate user_interactions fetch)
  const allExcludedIds = excludeQuestionIds.length > 0
    ? [...new Set([...interactedIds, ...excludeQuestionIds])]
    : interactedIds
  const interactedSet = new Set(allExcludedIds)

  // 3. Fetch Unseen Questions (60%)
  // We fetch a larger pool to filter out seen ones in JS.
  const discoveryPoolSize = unseenQuota * 5
  const allTopicQuestions = await queryQuestionsChunked(
    supabase, QUESTION_COLS, topicIds, discoveryPoolSize, difficultyRange,
    (q) => allExcludedIds.length > 0 && allExcludedIds.length < CHUNK_SIZE
      ? q.not('question_id', 'in', `(${allExcludedIds.join(',')})`)
      : q
  )

  const unseenQuestions = allTopicQuestions
    .filter(q => !interactedSet.has(q.question_id))
    .slice(0, unseenQuota)

  // 4. Fetch Remediation Questions (30%)
  let remediationQuestions: QuestionPoolRow[] = []
  if (remediationIds.length > 0) {
    // Remediation should ideally match difficulty, but we fallback to any difficulty if needed
    remediationQuestions = await queryQuestionsChunked(
      supabase, QUESTION_COLS, topicIds, remediationQuota, difficultyRange,
      (q) => q.in('question_id', remediationIds.slice(0, CHUNK_SIZE)),
    )
  }

  // 5. Fetch Spaced Repetition Questions (10%)
  let srQuestions: QuestionPoolRow[] = []
  if (srIds.length > 0) {
    srQuestions = await queryQuestionsChunked(
      supabase, QUESTION_COLS, topicIds, srQuota, difficultyRange,
      (q) => q.in('question_id', srIds.slice(0, CHUNK_SIZE)),
    )
  }

  // 6. Consolidate Pool & Fill Gaps
  let pool = [
    ...unseenQuestions,
    ...remediationQuestions,
    ...srQuestions,
  ]

  // If pool is short, fill with ANY questions from the topics
  if (pool.length < questionCount) {
    const existingIds = new Set(pool.map(q => q.question_id))
    const needed = questionCount - pool.length

    // Try again with the SAME difficulty first, but ignoring seen/unseen status
    const fillQuestions = await queryQuestionsChunked(
      supabase, QUESTION_COLS, topicIds, needed * 2, difficultyRange
    )

    for (const q of fillQuestions) {
      if (!existingIds.has(q.question_id) && pool.length < questionCount) {
        pool.push(q)
      }
    }
  }

  // If STILL short, drop difficulty filter entirely
  if (pool.length < questionCount) {
    const existingIds = new Set(pool.map(q => q.question_id))
    const needed = questionCount - pool.length

    const fallbackQuestions = await queryQuestionsChunked(
      supabase, QUESTION_COLS, topicIds, needed, null
    )

    for (const q of fallbackQuestions) {
      if (!existingIds.has(q.question_id) && pool.length < questionCount) {
        pool.push(q)
      }
    }
  }

  if (pool.length === 0) {
    console.error('[intelligent-routing] CRITICAL: Empty pool after all fallbacks.', {
      topicCount: topicIds.length,
      difficultyRange,
      interactedCount: interactedIds.length,
    })
  }

  // Final Safety Shuffle (Fisher-Yates)
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }

  return pool.slice(0, questionCount)
}
