'use server'

import { createClient, getUser } from '@/lib/supabase/server'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ConfidenceMatrixItem {
  topic_id: string | null
  topic_name: string | null
  question_id: string
}

export interface ConfidenceMatrixResult {
  confidentCorrect: ConfidenceMatrixItem[]
  confidentWrong: ConfidenceMatrixItem[]
  guessingCorrect: ConfidenceMatrixItem[]
  guessingWrong: ConfidenceMatrixItem[]
  partlyCorrect: ConfidenceMatrixItem[]
  partlyWrong: ConfidenceMatrixItem[]
}

// ─── Server Action ────────────────────────────────────────────────────────────

export const getConfidenceMatrix = async (
  sessionId: string,
): Promise<ConfidenceMatrixResult> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await getUser()
  if (!user) throw new Error('Unauthorized')

  // Fetch all interactions for this session with topic info
  const { data: interactions, error } = await supabase
    .from('user_interactions')
    .select('question_id, topic_id, is_correct, confidence')
    .eq('session_id', sessionId)
    .eq('user_id', user.id)

  if (error) throw error

  const rows = interactions ?? []

  // Collect unique topic_ids to resolve names in a single query
  const topicIds = [...new Set(rows.map((r) => r.topic_id).filter(Boolean))] as string[]

  let topicNameMap = new Map<string, string>()
  if (topicIds.length > 0) {
    const { data: topics } = await supabase
      .from('taxonomy_nodes')
      .select('node_id, name')
      .in('node_id', topicIds)

    if (topics) {
      topicNameMap = new Map(
        topics.map((t: { node_id: string; name: string }) => [t.node_id, t.name]),
      )
    }
  }

  // Bucket each interaction into the 2x3 matrix
  // confidence mapping: 'sure' = confident(3), 'unsure' = guessing(1), null = partly(2)
  const result: ConfidenceMatrixResult = {
    confidentCorrect: [],
    confidentWrong: [],
    guessingCorrect: [],
    guessingWrong: [],
    partlyCorrect: [],
    partlyWrong: [],
  }

  for (const row of rows) {
    const item: ConfidenceMatrixItem = {
      topic_id: row.topic_id,
      topic_name: row.topic_id ? (topicNameMap.get(row.topic_id) ?? null) : null,
      question_id: row.question_id,
    }

    const confidence = row.confidence // 'sure' | 'unsure' | null
    const correct = row.is_correct === true

    if (confidence === 'sure') {
      if (correct) {
        result.confidentCorrect.push(item)
      } else {
        result.confidentWrong.push(item)
      }
    } else if (confidence === 'unsure') {
      if (correct) {
        result.guessingCorrect.push(item)
      } else {
        result.guessingWrong.push(item)
      }
    } else {
      // null = partly sure (level 2)
      if (correct) {
        result.partlyCorrect.push(item)
      } else {
        result.partlyWrong.push(item)
      }
    }
  }

  return result
}
