// ─── Interleaved Topic Mixing (IMPL_06) ──────────────────────────────────────
// Selects a mix of primary-topic and sibling-topic questions to improve
// discrimination through contextual interleaving (Hwang 2025).

import { createServiceClient } from '@/lib/supabase/server'
import { normalizeOptions } from '@/lib/utils/question'

// ─── Types ───────────────────────────────────────────────────────────────────

interface RawQuestion {
  question_id: string
  topic_id: string
  text: string
  options: unknown
  difficulty: number
  prompt_image_url: string | null
  question_type?: string
}

interface InterleavedQuestion extends RawQuestion {
  is_interleaved: boolean
}

interface InterleaveSelectionParams {
  /** Leaf topic IDs the user selected (primary topics) */
  primaryTopicIds: string[]
  /** Total number of questions to return */
  totalCount: number
  /** Fraction of questions from sibling topics (0–1, default 0.3) */
  interleaveRatio: number
  /** Question IDs to exclude (recently seen) */
  excludeQuestionIds: string[]
  /** Optional difficulty range filter */
  difficultyRange?: { min: number; max: number } | null
}

// ─── Fisher-Yates shuffle ────────────────────────────────────────────────────

const shuffle = <T>(arr: T[]): T[] => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ─── Main Selection ──────────────────────────────────────────────────────────

/**
 * Selects questions with interleaving from sibling taxonomy nodes.
 *
 * 1. Calculates primary vs interleave counts from the ratio
 * 2. Fetches primary questions from the user's selected topics
 * 3. Finds sibling topics (same parent_id, different node_id)
 * 4. Fetches interleave questions from sibling topics
 * 5. Shuffles everything together for true interleaving
 * 6. Falls back to more primary questions if siblings are insufficient
 */
export const selectQuestionsWithInterleaving = async (
  params: InterleaveSelectionParams,
): Promise<InterleavedQuestion[]> => {
  const {
    primaryTopicIds,
    totalCount,
    interleaveRatio,
    excludeQuestionIds,
    difficultyRange,
  } = params

  // questions table has admin-only RLS — must use service client
  const supabase = await createServiceClient()
  const excludeSet = new Set(excludeQuestionIds)

  // 1. Calculate split
  const primaryCount = Math.ceil(totalCount * (1 - interleaveRatio))
  const interleaveCount = totalCount - primaryCount

  // 2. Fetch primary questions
  const primaryQuestions = await fetchQuestions(
    supabase,
    primaryTopicIds,
    primaryCount * 3, // overfetch for exclusion filtering
    difficultyRange,
  )

  const freshPrimary = primaryQuestions.filter(
    (q) => !excludeSet.has(q.question_id),
  )

  // If not enough fresh primary, backfill from seen pool
  const primaryPool =
    freshPrimary.length >= primaryCount
      ? freshPrimary
      : [
          ...freshPrimary,
          ...primaryQuestions
            .filter((q) => excludeSet.has(q.question_id))
            .slice(0, primaryCount - freshPrimary.length),
        ]

  const selectedPrimary = shuffle(primaryPool)
    .slice(0, primaryCount)
    .map((q): InterleavedQuestion => ({ ...q, is_interleaved: false }))

  // 3. Find sibling topics (share parent_id with primary topics, excluding primaries)
  const siblingTopicIds = await findSiblingTopics(supabase, primaryTopicIds)

  let selectedInterleave: InterleavedQuestion[] = []

  if (interleaveCount > 0 && siblingTopicIds.length > 0) {
    // 4. Fetch interleave questions from siblings
    const interleaveQuestions = await fetchQuestions(
      supabase,
      siblingTopicIds,
      interleaveCount * 3,
      difficultyRange,
    )

    // Exclude recently seen and any already picked as primary
    const primaryIds = new Set(selectedPrimary.map((q) => q.question_id))
    const freshInterleave = interleaveQuestions.filter(
      (q) => !excludeSet.has(q.question_id) && !primaryIds.has(q.question_id),
    )

    const interleavePool =
      freshInterleave.length >= interleaveCount
        ? freshInterleave
        : [
            ...freshInterleave,
            ...interleaveQuestions
              .filter(
                (q) =>
                  excludeSet.has(q.question_id) &&
                  !primaryIds.has(q.question_id),
              )
              .slice(0, interleaveCount - freshInterleave.length),
          ]

    selectedInterleave = shuffle(interleavePool)
      .slice(0, interleaveCount)
      .map((q): InterleavedQuestion => ({ ...q, is_interleaved: true }))
  }

  // 5. If not enough interleave questions, fill with more primary
  const shortage = totalCount - selectedPrimary.length - selectedInterleave.length
  let extraPrimary: InterleavedQuestion[] = []

  if (shortage > 0) {
    const alreadyPicked = new Set([
      ...selectedPrimary.map((q) => q.question_id),
      ...selectedInterleave.map((q) => q.question_id),
    ])

    const remaining = primaryQuestions
      .filter((q) => !alreadyPicked.has(q.question_id))
      .slice(0, shortage)

    extraPrimary = remaining.map(
      (q): InterleavedQuestion => ({ ...q, is_interleaved: false }),
    )
  }

  // 6. Combine and shuffle for true interleaving
  return shuffle([...selectedPrimary, ...selectedInterleave, ...extraPrimary])
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Fetches questions for given topic IDs, with optional difficulty filter.
 * Handles Supabase .in() limit by batching if needed.
 */
const fetchQuestions = async (
  supabase: Awaited<ReturnType<typeof createServiceClient>>,
  topicIds: string[],
  limit: number,
  difficultyRange?: { min: number; max: number } | null,
): Promise<RawQuestion[]> => {
  if (topicIds.length === 0) return []

  // Batch topic IDs in chunks of 80 to avoid Supabase header overflow
  const BATCH_SIZE = 80
  const allQuestions: RawQuestion[] = []

  for (let i = 0; i < topicIds.length; i += BATCH_SIZE) {
    const batch = topicIds.slice(i, i + BATCH_SIZE)

    let query = supabase
      .from('questions')
      .select(
        'question_id, topic_id, text, options, difficulty, prompt_image_url, question_type',
      )
      .in('topic_id', batch)
      .limit(limit)

    if (difficultyRange) {
      query = query
        .gte('difficulty', difficultyRange.min)
        .lt('difficulty', difficultyRange.max)
    }

    const { data } = await query
    if (data) allQuestions.push(...(data as RawQuestion[]))
  }

  return allQuestions
}

/**
 * Finds sibling topic IDs: taxonomy nodes that share the same parent_id
 * as the primary topics but are not themselves in the primary set.
 */
const findSiblingTopics = async (
  supabase: Awaited<ReturnType<typeof createServiceClient>>,
  primaryTopicIds: string[],
): Promise<string[]> => {
  if (primaryTopicIds.length === 0) return []

  // First get the parent_ids of our primary topics
  const { data: primaryNodes } = await supabase
    .from('taxonomy_tree')
    .select('node_id, parent_id')
    .in('node_id', primaryTopicIds)

  if (!primaryNodes || primaryNodes.length === 0) return []

  const parentIds = [
    ...new Set(
      primaryNodes
        .map((n: { parent_id: string | null }) => n.parent_id)
        .filter((id): id is string => id !== null),
    ),
  ]

  if (parentIds.length === 0) return []

  // Find sibling nodes: same parent, leaf nodes, not in the primary set, not deprecated
  const primarySet = new Set(primaryTopicIds)

  const { data: siblings } = await supabase
    .from('taxonomy_tree')
    .select('node_id')
    .in('parent_id', parentIds)
    .eq('is_leaf', true)
    .eq('is_cross_ref_only', false)
    .is('deprecated_at', null)

  if (!siblings) return []

  return siblings
    .map((n: { node_id: string }) => n.node_id)
    .filter((id: string) => !primarySet.has(id))
}
