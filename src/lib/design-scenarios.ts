import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'

export type DesignScenarioQuestion = {
  number: number
  type: string
  question_stem: string
  options: string[]
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
  site_data: {
    total_lot_area_sqm: number
    lot_shape: string
    frontage_m: number
    depth_m: number
    zone: string
    pso_percent: number
    building_height_limit_m: number
    flar_min?: number
    flar_max?: number
    right_of_way_m?: number
    right_of_way_direction?: string
    slope_percent?: number
    slope_direction?: string
    isa_percent?: number
    usa_percent?: number
    adjacent_zones?: Record<string, string>
    easements?: string
    utilities?: string
    [key: string]: unknown
  }
  program: {
    occupancy_type: string
    building_stories: number
    zones: { name: string; spaces: string[] }[]
    [key: string]: unknown
  }
  code_references: string[]
  computation_sheet: Record<string, { description: string; [key: string]: unknown }>
  hidden_traps: HiddenTrap[]
  questions: DesignScenarioQuestion[]
}

const DESIGN_DIR = join(process.cwd(), 'Design Questions')

export const getScenarios = (): DesignScenario[] => {
  const files = readdirSync(DESIGN_DIR).filter((f) => f.endsWith('.json'))
  return files.map((f) => JSON.parse(readFileSync(join(DESIGN_DIR, f), 'utf-8')) as DesignScenario)
}

export const getScenarioById = (id: string): DesignScenario | null => {
  const scenarios = getScenarios()
  return scenarios.find((s) => s.id === id) ?? null
}
