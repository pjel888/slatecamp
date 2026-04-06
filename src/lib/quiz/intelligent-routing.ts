// src/lib/quiz/intelligent-routing.ts
// ─────────────────────────────────────────────────────────────────────────────
// Intelligent Question Routing (Doc 03 Pivot)
// Implements the 60/30/10 Pedagogical Algorithm:
//   - 60% Unseen (Discovery)
//   - 30% Remediation (Incorrect previously)
//   - 10% Spaced Repetition (Mastered, but not seen in 14+ days)
// ─────────────────────────────────────────────────────────────────────────────

import { SupabaseClient } from '@supabase/supabase-js'

interface RoutingOptions {
  supabase: SupabaseClient
  userId: string
  topicIds: string[]
  questionCount: number
  difficultyRange?: { min: number; max: number } | null
}

export async function selectQuestionsWithRouting({
  supabase,
  userId,
  topicIds,
  questionCount,
  difficultyRange,
}: RoutingOptions) {
  // 1. Calculate Quotas
  const unseenQuota = Math.floor(questionCount * 0.6)
  const remediationQuota = Math.floor(questionCount * 0.3)
  const srQuota = questionCount - unseenQuota - remediationQuota // Remaining 10%

  const srCutoff = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()

  // Pre-fetch state IDs to avoid passing query builders to .in()
  const [
    { data: interacted },
    { data: remediationStates },
    { data: srStates }
  ] = await Promise.all([
    supabase
      .from('user_interactions')
      .select('question_id')
      .eq('user_id', userId),
    supabase
      .from('user_question_states')
      .select('question_id')
      .eq('user_id', userId)
      .eq('last_is_correct', false),
    supabase
      .from('user_question_states')
      .select('question_id')
      .eq('user_id', userId)
      .eq('last_is_correct', true)
      .lt('last_seen_at', srCutoff)
  ])

  const interactedIds = interacted?.map(i => i.question_id) || []
  const remediationIds = remediationStates?.map(i => i.question_id) || []
  const srIds = srStates?.map(i => i.question_id) || []

  // 2. Fetch Unseen Questions (60%)
  let unseenQuery = supabase
    .from('questions')
    .select('question_id, topic_id, text, options, difficulty, prompt_image_url, question_type, metadata')
    .in('topic_id', topicIds)
    .limit(unseenQuota)

  if (interactedIds.length > 0) {
    unseenQuery = unseenQuery.not('question_id', 'in', `(${interactedIds.join(',')})`)
  }

  if (difficultyRange) {
    unseenQuery = unseenQuery
      .gte('difficulty', difficultyRange.min)
      .lt('difficulty', difficultyRange.max)
  }

  const { data: unseenQuestions } = await unseenQuery

  // 3. Fetch Remediation Questions (30%)
  let remediationQuestions: any[] = []
  if (remediationIds.length > 0) {
    let remediationQuery = supabase
      .from('questions')
      .select('question_id, topic_id, text, options, difficulty, prompt_image_url, question_type, metadata')
      .in('topic_id', topicIds)
      .in('question_id', remediationIds)
      .limit(remediationQuota)

    if (difficultyRange) {
      remediationQuery = remediationQuery
        .gte('difficulty', difficultyRange.min)
        .lt('difficulty', difficultyRange.max)
    }

    const { data: remData } = await remediationQuery
    remediationQuestions = remData || []
  }

  // 4. Fetch Spaced Repetition Questions (10%)
  let srQuestions: any[] = []
  if (srIds.length > 0) {
    let srQuery = supabase
      .from('questions')
      .select('question_id, topic_id, text, options, difficulty, prompt_image_url, question_type, metadata')
      .in('topic_id', topicIds)
      .in('question_id', srIds)
      .limit(srQuota)

    if (difficultyRange) {
      srQuery = srQuery
        .gte('difficulty', difficultyRange.min)
        .lt('difficulty', difficultyRange.max)
    }

    const { data: srData } = await srQuery
    srQuestions = srData || []
  }

  // 5. Consolidate Pool & Fill Gaps
  let pool = [
    ...(unseenQuestions ?? []),
    ...(remediationQuestions ?? []),
    ...(srQuestions ?? []),
  ]

  // If pool is short, fill with ANY unseen questions (no difficulty filter) or random from subjects
  if (pool.length < questionCount) {
    const existingIds = new Set(pool.map(q => q.question_id))
    const needed = questionCount - pool.length

    let fallbackQuery = supabase
      .from('questions')
      .select('question_id, topic_id, text, options, difficulty, prompt_image_url, question_type, metadata')
      .in('topic_id', topicIds)
      .limit(needed)

    if (existingIds.size > 0) {
      fallbackQuery = fallbackQuery.not('question_id', 'in', `(${Array.from(existingIds).join(',')})`)
    }

    const { data: fallbackQuestions } = await fallbackQuery

    if (fallbackQuestions) {
      pool.push(...fallbackQuestions)
    }
  }

  // Final Safety Shuffle (Fisher-Yates)
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }

  return pool.slice(0, questionCount)
}
