"use server"

import { revalidatePath } from "next/cache"
import { createClient, getUser } from "@/lib/supabase/server"
import { ROUTES } from "@/lib/routes"

export type DesignProblem = {
  problem_id: string
  title: string
  building_type: string
  difficulty: number
  time_limit_minutes: number
  brief: string
  program: Record<string, unknown>
  site_data: Record<string, unknown>
  code_references: string[]
  created_at: string
}

export type DesignProblemSession = {
  session_id: string
  user_id: string
  problem_id: string
  started_at: string
  completed_at: string | null
  time_elapsed_seconds: number | null
  self_assessment_score: number | null
  checklist_completion: Record<string, boolean>
}

export type GetDesignProblemsResult = {
  problems: DesignProblem[]
  completedProblemIds: string[]
  error?: string
}

export type StartDesignSessionResult = {
  session_id?: string
  error?: string
}

export type CompleteDesignSessionResult = {
  error?: string
}

export const getDesignProblems = async (): Promise<GetDesignProblemsResult> => {
  const supabase = await createClient()
  const { data: { user } } = await getUser()

  const { data: problems, error: problemsError } = await supabase
    .from("design_problems")
    .select("problem_id, title, building_type, difficulty, time_limit_minutes, brief, program, site_data, code_references, created_at")
    .order("difficulty", { ascending: true })

  if (problemsError) return { problems: [], completedProblemIds: [], error: problemsError.message }

  if (!user) return { problems: problems ?? [], completedProblemIds: [] }

  const { data: sessions } = await supabase
    .from("design_problem_sessions")
    .select("problem_id")
    .eq("user_id", user.id)
    .not("completed_at", "is", null)

  const completedProblemIds = (sessions ?? []).map((s: { problem_id: string }) => s.problem_id)

  return { problems: problems ?? [], completedProblemIds }
}

export const getDesignProblem = async (problemId: string): Promise<{
  problem: DesignProblem | null
  activeSession: DesignProblemSession | null
  isLocked: boolean
  error?: string
}> => {
  const supabase = await createClient()
  const { data: { user } } = await getUser()

  const { data: problem, error } = await supabase
    .from("design_problems")
    .select("problem_id, title, building_type, difficulty, time_limit_minutes, brief, program, site_data, code_references, created_at")
    .eq("problem_id", problemId)
    .single()

  if (error || !problem) return { problem: null, activeSession: null, isLocked: false, error: error?.message ?? "Not found" }

  // Check gating: difficulty 3+ requires L1 and L2 completion
  let isLocked = false
  if (problem.difficulty >= 3 && user) {
    const { data: completedSessions } = await supabase
      .from("design_problem_sessions")
      .select("problem_id, design_problems!inner(difficulty)")
      .eq("user_id", user.id)
      .not("completed_at", "is", null)

    const completedDifficulties = new Set(
      (completedSessions ?? []).map(
        (s: { design_problems: { difficulty: number } }) => s.design_problems.difficulty
      )
    )
    isLocked = !completedDifficulties.has(1) || !completedDifficulties.has(2)
  } else if (problem.difficulty >= 3 && !user) {
    isLocked = true
  }

  // Fetch active (in-progress) session
  let activeSession: DesignProblemSession | null = null
  if (user) {
    const { data: session } = await supabase
      .from("design_problem_sessions")
      .select("session_id, user_id, problem_id, started_at, completed_at, time_elapsed_seconds, self_assessment_score, checklist_completion")
      .eq("user_id", user.id)
      .eq("problem_id", problemId)
      .is("completed_at", null)
      .maybeSingle()
    activeSession = session ?? null
  }

  return { problem, activeSession, isLocked }
}

export const startDesignSession = async (problemId: string): Promise<StartDesignSessionResult> => {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) return { error: "Not authenticated" }

  // Check if there's already an active session
  const { data: existing } = await supabase
    .from("design_problem_sessions")
    .select("session_id")
    .eq("user_id", user.id)
    .eq("problem_id", problemId)
    .is("completed_at", null)
    .maybeSingle()

  if (existing) return { session_id: existing.session_id }

  const { data, error } = await supabase
    .from("design_problem_sessions")
    .insert({
      user_id: user.id,
      problem_id: problemId,
      checklist_completion: {},
    })
    .select("session_id")
    .single()

  if (error) return { error: error.message }
  revalidatePath(ROUTES.dashboard.designProblems)
  return { session_id: data.session_id }
}

export const completeDesignSession = async (
  sessionId: string,
  timeElapsedSeconds: number,
  selfAssessmentScore: number,
  checklistCompletion: Record<string, boolean>
): Promise<CompleteDesignSessionResult> => {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) return { error: "Not authenticated" }

  const { error } = await supabase
    .from("design_problem_sessions")
    .update({
      completed_at: new Date().toISOString(),
      time_elapsed_seconds: timeElapsedSeconds,
      self_assessment_score: selfAssessmentScore,
      checklist_completion: checklistCompletion,
    })
    .eq("session_id", sessionId)
    .eq("user_id", user.id)

  if (error) return { error: error.message }
  revalidatePath("/dashboard/area-c/design-problems")
  return {}
}

export const updateChecklistCompletion = async (
  sessionId: string,
  checklistCompletion: Record<string, boolean>
): Promise<{ error?: string }> => {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) return { error: "Not authenticated" }

  const { error } = await supabase
    .from("design_problem_sessions")
    .update({ checklist_completion: checklistCompletion })
    .eq("session_id", sessionId)
    .eq("user_id", user.id)

  if (error) return { error: error.message }
  return {}
}
