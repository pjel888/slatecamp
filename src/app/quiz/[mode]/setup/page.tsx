import { notFound, redirect } from 'next/navigation'
import { createClient, getUser } from '@/lib/supabase/server'
import { startSession } from '@/lib/actions/quiz-v2'
import type { QuizMode, TaxonomySubject, TaxonomySubtopic } from '@/types/quiz-config'
import { SetupPageClient } from './client'

const VALID_MODES: QuizMode[] = [
  'camp', 'chill', 'subject', 'focus_review', 'custom', 'storm', 'full_exam', 'endurance', 'article_review'
]

// Modes that need the topic picker (slide 2)
const TOPIC_PICKER_MODES: QuizMode[] = ['camp', 'chill', 'subject', 'focus_review', 'custom', 'storm', 'endurance']

interface SetupPageProps {
  params: Promise<{ mode: string }>
  searchParams: Promise<{ source?: string; sessionId?: string }>
}

const QuizSetupPage = async ({ params, searchParams }: SetupPageProps) => {
  const { mode } = await params
  const { source, sessionId: prevSessionId } = await searchParams

  if (!VALID_MODES.includes(mode as QuizMode)) {
    notFound()
  }

  const quizMode = mode as QuizMode

  // ── "Practice Missed Questions" shortcut — skip setup entirely ──────────
  if (source === 'missed' && prevSessionId) {
    const supabase = await createClient()
    const { data: { user } } = await getUser()

    if (user) {
      // Get missed question IDs from the previous session
      const { data: prevSession } = await supabase
        .from('quiz_sessions')
        .select('question_ids')
        .eq('session_id', prevSessionId)
        .eq('user_id', user.id)
        .single()

      if (prevSession) {
        const allQuestionIds: string[] = prevSession.question_ids ?? []

        // Get which ones the user got wrong
        const { data: interactions } = await supabase
          .from('user_interactions')
          .select('question_id, is_correct')
          .eq('session_id', prevSessionId)
          .eq('user_id', user.id)

        const correctIds = new Set(
          (interactions ?? [])
            .filter((i: { is_correct: boolean }) => i.is_correct)
            .map((i: { question_id: string }) => i.question_id),
        )
        // Missed = wrong + unanswered
        const missedIds = allQuestionIds.filter((id) => !correctIds.has(id))

        if (missedIds.length > 0) {
          try {
            const result = await startSession({
              mode: 'focus_review',
              config: {
                setup: {
                  questionCount: missedIds.length,
                  topics: missedIds, // Pass the question IDs — startSession will handle them
                  disciplines: [],
                  difficultyMode: 'adaptive',
                  initialDifficulty: 'medium',
                  isTrailSession: false,
                  trailDayId: null,
                },
              },
            })

            if (!('error' in result)) {
              redirect(`/quiz/focus_review/session/${result.sessionId}`)
            }
          } catch (e) {
            // If redirect throws (expected in Next.js), let it propagate
            if (e instanceof Error && e.message === 'NEXT_REDIRECT') throw e
            // Otherwise fall through to normal setup
          }
        }
      }
    }
  }

  const supabase = await createClient()
  const { data: { user } } = await getUser()
  const { data: readinessStats } = user
    ? await supabase
        .from('user_global_stats')
        .select('global_readiness_score')
        .eq('user_id', user.id)
        .maybeSingle()
    : { data: null }
  const readinessScore = readinessStats?.global_readiness_score ?? 0

  // Only fetch taxonomy for modes that show the topic picker
  if (!TOPIC_PICKER_MODES.includes(quizMode)) {
    return <SetupPageClient mode={quizMode} readinessScore={readinessScore} />
  }

  // Fetch all level=1 subject nodes (children of discipline root)
  const { data: subjectNodes } = await supabase
    .from('taxonomy_tree')
    .select('node_id, name, lea_id, parent_id')
    .eq('level', 1)
    .order('name', { ascending: true })

  if (!subjectNodes || subjectNodes.length === 0) {
    return (
      <SetupPageClient
        mode={quizMode}
        subjects={[]}
        readinessScore={readinessScore}
      />
    )
  }

  const subjectIds = subjectNodes.map((n) => n.node_id)

  // Fetch subtopics (level=2) for all subjects in one query
  const { data: subtopicNodes } = await supabase
    .from('taxonomy_tree')
    .select('node_id, name, lea_id, parent_id, is_leaf')
    .eq('level', 2)
    .in('parent_id', subjectIds)
    .order('name', { ascending: true })

  // Fetch mastery for the authenticated user (subjects + subtopics)
  const allNodeIds = [
    ...subjectIds,
    ...(subtopicNodes ?? []).map((n) => n.node_id),
  ]

  let masteryByNodeId: Record<string, { mastery_weight: number; interaction_count: number }> = {}

  if (user && allNodeIds.length > 0) {
    const { data: masteryRows } = await supabase
      .from('user_node_mastery')
      .select('node_id, mastery_weight, interaction_count')
      .eq('user_id', user.id)
      .in('node_id', allNodeIds)

    if (masteryRows) {
      for (const row of masteryRows) {
        masteryByNodeId[row.node_id] = {
          mastery_weight: row.mastery_weight,
          interaction_count: row.interaction_count,
        }
      }
    }
  }

  // Group subtopics by parent subject id
  const subtopicsByParent: Record<string, TaxonomySubtopic[]> = {}
  for (const sub of (subtopicNodes ?? [])) {
    const mastery = masteryByNodeId[sub.node_id] ?? null
    const subtopic: TaxonomySubtopic = {
      nodeId: sub.node_id,
      name: sub.name,
      leaId: sub.lea_id ?? null,
      isLeaf: sub.is_leaf ?? true,
      masteryWeight: mastery?.mastery_weight ?? null,
      interactionCount: mastery?.interaction_count ?? 0,
    }
    if (!subtopicsByParent[sub.parent_id]) {
      subtopicsByParent[sub.parent_id] = []
    }
    subtopicsByParent[sub.parent_id].push(subtopic)
  }

  // Assemble subjects array
  const subjects: TaxonomySubject[] = subjectNodes.map((node) => {
    const mastery = masteryByNodeId[node.node_id] ?? null
    return {
      nodeId: node.node_id,
      name: node.name,
      leaId: node.lea_id ?? null,
      masteryWeight: mastery?.mastery_weight ?? null,
      interactionCount: mastery?.interaction_count ?? 0,
      subtopics: subtopicsByParent[node.node_id] ?? [],
    }
  })

  return (
    <SetupPageClient
      mode={quizMode}
      subjects={subjects}
      readinessScore={readinessScore}
    />
  )
}

export default QuizSetupPage
