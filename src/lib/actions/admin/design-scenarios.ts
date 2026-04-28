'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { assertPermission } from '@/lib/admin/roles'
import { revalidatePath } from 'next/cache'
import { logServerError } from '@/lib/logging/server'

export interface AdminDesignScenarioSummary {
  scenario_id: string
  title: string
  building_type: string
  difficulty: string | null
  time_limit_minutes: number | null
  question_count: number
}

export interface AdminDesignScenarioQuestion {
  question_id: string
  scenario_id: string
  question_number: number
  question_type: string | null
  question_stem: string
  options: string[]
  correct_answer_index: number
  rationale: Record<string, unknown>
  solution_steps: string[]
  code_citation: string | null
}

export interface AdminDesignScenarioDetail {
  scenario_id: string
  title: string
  building_type: string
  difficulty: string | null
  time_limit_minutes: number | null
  brief: string
  questions: AdminDesignScenarioQuestion[]
}

export const getAdminDesignScenarios = async (): Promise<AdminDesignScenarioSummary[]> => {
  await assertPermission('admin.content.view')

  const supabase = createAdminClient()
  const { data: scenarios, error } = await supabase
    .from('design_scenarios')
    .select('scenario_id, title, building_type, difficulty, time_limit_minutes')
    .order('scenario_id', { ascending: true })

  if (error || !scenarios) {
    throw new Error(error?.message || 'Failed to load design scenarios')
  }

  const scenarioIds = scenarios.map((scenario) => scenario.scenario_id)
  const { data: questions } = await supabase
    .from('design_scenario_questions')
    .select('scenario_id')
    .in('scenario_id', scenarioIds)

  const questionCounts = new Map<string, number>()
  for (const row of questions || []) {
    questionCounts.set(row.scenario_id, (questionCounts.get(row.scenario_id) || 0) + 1)
  }

  return scenarios.map((scenario) => ({
    ...scenario,
    question_count: questionCounts.get(scenario.scenario_id) || 0,
  }))
}

export const getAdminDesignScenario = async (
  scenarioId: string,
): Promise<AdminDesignScenarioDetail | null> => {
  await assertPermission('admin.content.view')

  const supabase = createAdminClient()
  const { data: scenario, error: scenarioError } = await supabase
    .from('design_scenarios')
    .select('scenario_id, title, building_type, difficulty, time_limit_minutes, brief')
    .eq('scenario_id', scenarioId)
    .maybeSingle()

  if (scenarioError) {
    throw new Error(scenarioError.message)
  }

  if (!scenario) return null

  const { data: questions, error: questionError } = await supabase
    .from('design_scenario_questions')
    .select('question_id, scenario_id, question_number, question_type, question_stem, options, correct_answer_index, rationale, solution_steps, code_citation')
    .eq('scenario_id', scenarioId)
    .order('question_number', { ascending: true })

  if (questionError) {
    throw new Error(questionError.message)
  }

  return {
    ...scenario,
    questions: (questions || []).map((question) => ({
      ...question,
      options: Array.isArray(question.options)
        ? question.options.map((option) => (typeof option === 'string' ? option : String(option)))
        : [],
      rationale: (question.rationale ?? {}) as Record<string, unknown>,
      solution_steps: question.solution_steps ?? [],
    })),
  }
}

export const updateAdminDesignScenarioQuestion = async (
  questionId: string,
  data: Partial<AdminDesignScenarioQuestion>,
) => {
  await assertPermission('admin.content.edit')

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('design_scenario_questions')
    .update({
      question_number: data.question_number,
      question_type: data.question_type,
      question_stem: data.question_stem,
      options: data.options,
      correct_answer_index: data.correct_answer_index,
      rationale: data.rationale,
      solution_steps: data.solution_steps,
      code_citation: data.code_citation,
    })
    .eq('question_id', questionId)

  if (error) {
    await logServerError({
      family: 'admin',
      eventName: 'design_scenario_question_update_failed',
      message: 'Failed to update design scenario question.',
      context: {
        routeOrAction: 'admin:design-scenarios.updateQuestion',
        metadata: { questionId },
      },
      error,
    })
    throw new Error(error.message)
  }

  revalidatePath('/admin/knowledge/questions/scenarios')
  return { error: null }
}

export const createAdminDesignScenarioQuestion = async (scenarioId: string) => {
  await assertPermission('admin.content.create')

  const supabase = createAdminClient()
  const { data: lastQuestion } = await supabase
    .from('design_scenario_questions')
    .select('question_number')
    .eq('scenario_id', scenarioId)
    .order('question_number', { ascending: false })
    .limit(1)
    .maybeSingle()

  const nextNumber = (lastQuestion?.question_number || 0) + 1

  const { data, error } = await supabase
    .from('design_scenario_questions')
    .insert({
      scenario_id: scenarioId,
      question_number: nextNumber,
      question_type: 'DC',
      question_stem: 'New design scenario question',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correct_answer_index: 0,
      rationale: {},
      solution_steps: [],
      code_citation: null,
    })
    .select('question_id')
    .single()

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/admin/knowledge/questions/scenarios')
  return { questionId: data.question_id }
}
