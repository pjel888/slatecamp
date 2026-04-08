'use server'

import { createClient, getUser } from '@/lib/supabase/server'

export type CramCardEntry = {
  leaId: string
  subtopicName: string
  examFrequency: 'high' | 'medium'
  theValue: string
  codeReference: string | null
  memoryHook: string | null
  totalAttempts: number
  correctCount: number
  accuracyPct: number
}

export type CramCardData =
  | { gated: true; totalSessions: number }
  | { gated: false; entries: CramCardEntry[] }

type WikiItem = {
  type: string
  the_value?: string
  source_ref?: string
  text?: string
}

const extractWikiFields = (
  wikiItems: WikiItem[],
): { theValue: string; codeReference: string | null; memoryHook: string | null } => {
  const valuableItem = wikiItems.find(
    (item) => item.type === 'formula' || item.type === 'code_provision',
  )
  const examTipItem = wikiItems.find((item) => item.type === 'exam_tip')

  return {
    theValue: valuableItem?.the_value ?? '',
    codeReference:
      valuableItem?.type === 'code_provision' ? (valuableItem?.source_ref ?? null) : null,
    memoryHook: examTipItem?.text ?? null,
  }
}

export const getCramCardData = async (): Promise<CramCardData> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await getUser()

  if (!user) throw new Error('Unauthorized')

  // Count total completed sessions for gate check
  const { count: sessionCount } = await supabase
    .from('quiz_sessions')
    .select('session_id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'completed')

  const totalSessions = sessionCount ?? 0

  if (totalSessions < 20) {
    return { gated: true, totalSessions }
  }

  // Fetch all interactions with topic data joined.
  // PostgREST does not support filter chaining on nested columns via the JS client,
  // so we fetch the join and filter in JS below.
  const { data: rawRows, error } = await supabase
    .from('user_interactions')
    .select(
      `
      is_correct,
      question_id,
      questions!inner(
        topic_id,
        taxonomy_tree!inner(
          node_id,
          lea_id,
          name,
          exam_frequency,
          wiki_items,
          node_type,
          is_cross_ref_only,
          deprecated_at
        )
      )
    `,
    )
    .eq('user_id', user.id)

  if (error) {
    console.error('[getCramCardData] Query error:', error)
    throw new Error('Failed to load Cram Card data')
  }

  // Aggregate by topic node_id in JS
  type NodeAccum = {
    leaId: string
    subtopicName: string
    examFrequency: 'high' | 'medium'
    wikiItems: WikiItem[]
    totalAttempts: number
    correctCount: number
  }

  const nodeMap = new Map<string, NodeAccum>()

  for (const row of rawRows ?? []) {
    const questions = row.questions as unknown as {
      topic_id: string
      taxonomy_tree: {
        node_id: string
        lea_id: string | null
        name: string
        exam_frequency: string
        wiki_items: WikiItem[]
        node_type: string
        is_cross_ref_only: boolean
        deprecated_at: string | null
      }
    } | null

    if (!questions?.taxonomy_tree) continue
    const tt = questions.taxonomy_tree

    // Apply filters that mirror the SQL WHERE clause
    const validNodeType = tt.node_type === 'code_provision' || tt.node_type === 'formula'
    const validFrequency = tt.exam_frequency === 'high' || tt.exam_frequency === 'medium'
    if (!validNodeType || !validFrequency || tt.is_cross_ref_only || tt.deprecated_at) continue

    const existing = nodeMap.get(tt.node_id)
    if (existing) {
      existing.totalAttempts++
      if (row.is_correct) existing.correctCount++
    } else {
      nodeMap.set(tt.node_id, {
        leaId: tt.lea_id ?? '',
        subtopicName: tt.name,
        examFrequency: (tt.exam_frequency as 'high' | 'medium') ?? 'medium',
        wikiItems: Array.isArray(tt.wiki_items) ? tt.wiki_items : [],
        totalAttempts: 1,
        correctCount: row.is_correct ? 1 : 0,
      })
    }
  }

  // Filter: minimum 3 attempts, sort by accuracy ascending, take top 20
  const entries: CramCardEntry[] = Array.from(nodeMap.values())
    .filter((n) => n.totalAttempts >= 3)
    .map((n) => {
      const accuracyPct = Math.round((n.correctCount / n.totalAttempts) * 100)
      const { theValue, codeReference, memoryHook } = extractWikiFields(n.wikiItems)
      return {
        leaId: n.leaId,
        subtopicName: n.subtopicName,
        examFrequency: n.examFrequency,
        theValue,
        codeReference,
        memoryHook,
        totalAttempts: n.totalAttempts,
        correctCount: n.correctCount,
        accuracyPct,
      }
    })
    .sort((a, b) => a.accuracyPct - b.accuracyPct)
    .slice(0, 20)

  return { gated: false, entries }
}
