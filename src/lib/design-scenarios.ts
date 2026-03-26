import { createClient } from '@/lib/supabase/server'

export type DesignScenarioQuestion = {
  question_id: string
  number: number
  type: string
  question_stem: string
  options: Array<{ index: number; text: string }> | string[]
  correct_answer_index: number
  rationale: {
    correct: string
    distractor_0: string
    distractor_1: string
    distractor_2: string
    distractor_3: string
    takeaway: string
  }
  solution_steps: string[]
  code_citation: string
}

export type HiddenTrap = {
  trap_id: number
  description: string
  trap_text: string
  affected_questions: number[]
}

export type DesignScenario = {
  id: string
  title: string
  building_type: string
  difficulty: 'FOUNDATIONAL' | 'INTERMEDIATE' | 'ADVANCED'
  trap_count: number
  time_limit_minutes: number
  brief: string
  site_data: Record<string, unknown>
  program: Record<string, unknown>
  code_references: string[]
  computation_sheet: Record<string, { description: string; [key: string]: unknown }>
  hidden_traps: HiddenTrap[]
  questions: DesignScenarioQuestion[]
}

/**
 * Fetch all design scenarios from Supabase (without questions — for list page).
 */
export const getScenarios = async (): Promise<DesignScenario[]> => {
  const supabase = await createClient()

  const { data: scenarios } = await supabase
    .from('design_scenarios')
    .select('*')
    .order('scenario_id', { ascending: true })

  if (!scenarios) return []

  return scenarios.map((s) => ({
    id: s.scenario_id,
    title: s.title,
    building_type: s.building_type,
    difficulty: s.difficulty as DesignScenario['difficulty'],
    trap_count: s.trap_count ?? 0,
    time_limit_minutes: s.time_limit_minutes ?? 180,
    brief: s.brief,
    site_data: (s.site_data ?? {}) as Record<string, unknown>,
    program: (s.program ?? {}) as Record<string, unknown>,
    code_references: s.code_references ?? [],
    computation_sheet: (s.computation_sheet ?? {}) as DesignScenario['computation_sheet'],
    hidden_traps: (s.hidden_traps ?? []) as HiddenTrap[],
    questions: [], // Not loaded for list page
  }))
}

/**
 * Fetch a single design scenario with all its questions from Supabase.
 */
export const getScenarioById = async (id: string): Promise<DesignScenario | null> => {
  const supabase = await createClient()

  const { data: scenario } = await supabase
    .from('design_scenarios')
    .select('*')
    .eq('scenario_id', id)
    .maybeSingle()

  if (!scenario) return null

  const { data: questions } = await supabase
    .from('design_scenario_questions')
    .select('*')
    .eq('scenario_id', id)
    .order('question_number', { ascending: true })

  return {
    id: scenario.scenario_id,
    title: scenario.title,
    building_type: scenario.building_type,
    difficulty: scenario.difficulty as DesignScenario['difficulty'],
    trap_count: scenario.trap_count ?? 0,
    time_limit_minutes: scenario.time_limit_minutes ?? 180,
    brief: scenario.brief,
    site_data: (scenario.site_data ?? {}) as Record<string, unknown>,
    program: (scenario.program ?? {}) as Record<string, unknown>,
    code_references: scenario.code_references ?? [],
    computation_sheet: (scenario.computation_sheet ?? {}) as DesignScenario['computation_sheet'],
    hidden_traps: (scenario.hidden_traps ?? []) as HiddenTrap[],
    questions: (questions ?? []).map((q) => ({
      question_id: q.question_id,
      number: q.question_number,
      type: q.question_type ?? 'DC',
      question_stem: q.question_stem,
      options: q.options as DesignScenarioQuestion['options'],
      correct_answer_index: q.correct_answer_index,
      rationale: (q.rationale ?? {}) as DesignScenarioQuestion['rationale'],
      solution_steps: q.solution_steps ?? [],
      code_citation: q.code_citation ?? '',
    })),
  }
}
