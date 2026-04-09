'use server'

import { createClient, getUser } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { revalidateDashboardCacheTags } from '@/lib/actions/cache-tags'
import { ROUTES } from '@/lib/routes'

// ─── Record 3D Lab Interaction ──────────────────────────────────────────────
// When a student answers an in-canvas hotspot question, write to
// user_interactions with source_type = '3d_lab'. This makes the 3D Lab
// a first-class part of the mastery engine — Heatmap updates after sessions.

interface LabInteractionParams {
  sessionId: string
  questionId: string
  topicId?: string
  selectedOptionId: string
  isCorrect: boolean
  timeSpentMs: number
}

export const record3DLabInteraction = async (params: LabInteractionParams) => {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase.from('user_interactions').insert({
    user_id: user.id,
    session_id: params.sessionId,
    question_id: params.questionId,
    topic_id: params.topicId ?? null,
    selected_option_id: params.selectedOptionId,
    is_correct: params.isCorrect,
    time_spent_ms: params.timeSpentMs,
    source_type: '3d_lab',
  })

  if (error) throw error

  // Revalidate dashboard pages so Heatmap reflects the new interaction
  revalidateDashboardCacheTags(user.id)
  revalidatePath(ROUTES.dashboard.root)
}

// ─── Create 3D Lab Session ──────────────────────────────────────────────────
// Creates a quiz_session scoped to a 3D Lab module, so in-canvas questions
// can be tracked in user_interactions (which requires a session_id FK).

interface CreateLabSessionParams {
  moduleId: string
  moduleName: string
  topicIds?: string[]
}

export const create3DLabSession = async (params: CreateLabSessionParams) => {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: session, error } = await supabase
    .from('quiz_sessions')
    .insert({
      user_id: user.id,
      mode: 'camp' as const,
      status: 'in_progress' as const,
      question_ids: [],
      target_node_ids: params.topicIds ?? [],
      total_questions: 0,
      correct_answers: 0,
    })
    .select('session_id')
    .single()

  if (error) throw error
  return session.session_id as string
}

// ─── Fetch 3D Module with Hotspots ──────────────────────────────────────────
// Loads a models_3d row with its spatial_hotspots for client rendering.

export const get3DModuleBySlug = async (slug: string) => {
  const supabase = await createClient()

  const { data: model, error } = await supabase
    .from('models_3d')
    .select(`
      *,
      spatial_hotspots (
        hotspot_id,
        node_id,
        title,
        description,
        position_x,
        position_y,
        position_z,
        phase,
        question_id,
        reveal_order
      )
    `)
    .eq('slug', slug)
    .single()

  if (error) return null
  return model
}
