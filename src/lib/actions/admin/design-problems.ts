'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { canManageContent } from '@/lib/admin/roles'
import { revalidatePath } from 'next/cache'

export interface AdminDesignProblemSummary {
  problem_id: string
  title: string
  building_type: string
  difficulty: number | null
  time_limit_minutes: number | null
  question_count: number
}

export interface AdminDesignProblemQuestion {
  question_id: string
  problem_id: string
  number: number
  type: string | null
  question_stem: string
  options: string[]
  correct_answer_index: number
  rationale: Record<string, unknown>
  solution_steps: string[]
  code_citation: string | null
}

export interface AdminDesignProblemDetail {
  problem_id: string
  title: string
  building_type: string
  difficulty: number | null
  time_limit_minutes: number | null
  brief: string
  questions: AdminDesignProblemQuestion[]
}

export const getAdminDesignProblems = async (): Promise<AdminDesignProblemSummary[]> => {
  const authorized = await canManageContent()
  if (!authorized) throw new Error('Unauthorized')

  const supabase = createAdminClient()
  const { data: problems, error } = await supabase
    .from('design_problems')
    .select('problem_id, title, building_type, difficulty, time_limit_minutes')
    .order('problem_id', { ascending: true })

  if (error || !problems) {
    throw new Error(error?.message || 'Failed to load design problems')
  }

  const problemIds = problems.map((problem) => problem.problem_id)
  const { data: questions } = await supabase
    .from('design_questions')
    .select('scenario_id')
    .in('scenario_id', problemIds)

  const questionCounts = new Map<string, number>()
  for (const row of questions || []) {
    questionCounts.set(row.scenario_id, (questionCounts.get(row.scenario_id) || 0) + 1)
  }

  return problems.map((problem) => ({
    ...problem,
    question_count: questionCounts.get(problem.problem_id) || 0,
  }))
}

export const getAdminDesignProblem = async (
  problemId: string,
): Promise<AdminDesignProblemDetail | null> => {
  const authorized = await canManageContent()
  if (!authorized) throw new Error('Unauthorized')

  const supabase = createAdminClient()
  const { data: problem, error: problemError } = await supabase
    .from('design_problems')
    .select('problem_id, title, building_type, difficulty, time_limit_minutes, brief')
    .eq('problem_id', problemId)
    .maybeSingle()

  if (problemError) throw new Error(problemError.message)
  if (!problem) return null

  const { data: questions, error: questionError } = await supabase
    .from('design_questions')
    .select('question_id, scenario_id, number, type, question_stem, options, correct_answer_index, rationale, solution_steps, code_citation')
    .eq('scenario_id', problemId)
    .order('number', { ascending: true })

  if (questionError) throw new Error(questionError.message)

  return {
    ...problem,
    questions: (questions || []).map((question) => ({
      question_id: question.question_id,
      problem_id: question.scenario_id,
      number: question.number,
      type: question.type,
      question_stem: question.question_stem,
      options: Array.isArray(question.options)
        ? question.options.map((option) => (typeof option === 'string' ? option : String(option)))
        : [],
      correct_answer_index: question.correct_answer_index,
      rationale: (question.rationale ?? {}) as Record<string, unknown>,
      solution_steps: question.solution_steps ?? [],
      code_citation: question.code_citation,
    })),
  }
}

export const updateAdminDesignProblemQuestion = async (
  questionId: string,
  data: Partial<AdminDesignProblemQuestion>,
) => {
  const authorized = await canManageContent()
  if (!authorized) throw new Error('Unauthorized')

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('design_questions')
    .update({
      number: data.number,
      type: data.type,
      question_stem: data.question_stem,
      options: data.options,
      correct_answer_index: data.correct_answer_index,
      rationale: data.rationale,
      solution_steps: data.solution_steps,
      code_citation: data.code_citation,
    })
    .eq('question_id', questionId)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/knowledge/questions/design-problems')
  return { error: null }
}

export const createAdminDesignProblemQuestion = async (problemId: string) => {
  const authorized = await canManageContent()
  if (!authorized) throw new Error('Unauthorized')

  const supabase = createAdminClient()
  const { data: lastQuestion } = await supabase
    .from('design_questions')
    .select('number')
    .eq('scenario_id', problemId)
    .order('number', { ascending: false })
    .limit(1)
    .maybeSingle()

  const nextNumber = (lastQuestion?.number || 0) + 1

  const { data, error } = await supabase
    .from('design_questions')
    .insert({
      scenario_id: problemId,
      number: nextNumber,
      type: 'DC',
      question_stem: 'New design problem question',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correct_answer_index: 0,
      rationale: {},
      solution_steps: [],
      code_citation: null,
    })
    .select('question_id')
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/admin/knowledge/questions/design-problems')
  return { questionId: data.question_id }
}
