import { beforeEach, describe, expect, mock, test } from 'bun:test'

const scenariosSelectMock = mock(() =>
  Promise.resolve({
    data: [
      {
        scenario_id: 'SC-001',
        title: 'Mixed-use building',
        building_type: 'Mixed Use',
        difficulty: 'ADVANCED',
        time_limit_minutes: 180,
      },
    ],
    error: null,
  }),
)
const scenarioQuestionsSelectMock = mock(() =>
  Promise.resolve({
    data: [
      {
        question_id: 'q-1',
        scenario_id: 'SC-001',
        question_number: 1,
        question_type: 'DC',
        question_stem: 'Question',
        options: ['A', 'B', 'C', 'D'],
        correct_answer_index: 0,
        rationale: {},
        solution_steps: [],
        code_citation: null,
      },
    ],
    error: null,
  }),
)
const updateEqMock = mock(() => Promise.resolve({ error: null }))
const insertSingleMock = mock(() =>
  Promise.resolve({
    data: { question_id: 'new-q-1' },
    error: null,
  }),
)
const questionNumberMaybeSingleMock = mock(() =>
  Promise.resolve({
    data: { question_number: 1 },
    error: null,
  }),
)

mock.module('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: (table: string) => {
      if (table === 'design_scenarios') {
        return {
          select: mock(() => ({
            order: scenariosSelectMock,
            eq: mock(() => ({
              maybeSingle: mock(() =>
                Promise.resolve({
                  data: {
                    scenario_id: 'SC-001',
                    title: 'Mixed-use building',
                    building_type: 'Mixed Use',
                    difficulty: 'ADVANCED',
                    time_limit_minutes: 180,
                    brief: 'Scenario brief',
                  },
                  error: null,
                }),
              ),
            })),
          })),
        }
      }

      if (table === 'design_scenario_questions') {
        return {
          select: mock((selection: string) => {
            if (selection === 'scenario_id') {
              return {
                in: mock(() => scenarioQuestionsSelectMock()),
              }
            }

            if (selection === 'question_number') {
              return {
                eq: mock(() => ({
                  order: mock(() => ({
                    limit: mock(() => ({
                      maybeSingle: questionNumberMaybeSingleMock,
                    })),
                  })),
                })),
              }
            }

            return {
              eq: mock(() => ({
                order: scenarioQuestionsSelectMock,
              })),
            }
          }),
          update: mock(() => ({
            eq: updateEqMock,
          })),
          insert: mock(() => ({
            select: () => ({
              single: insertSingleMock,
            }),
          })),
        }
      }

      return {} as never
    },
  }),
}))

const canManageContentMock = mock(() => Promise.resolve(true))
mock.module('@/lib/admin/roles', () => ({
  canManageContent: canManageContentMock,
}))

mock.module('next/cache', () => ({
  revalidatePath: mock(),
}))

const logServerErrorMock = mock(() => Promise.resolve())
mock.module('@/lib/logging/server', () => ({
  logServerError: logServerErrorMock,
}))

const {
  getAdminDesignScenarios,
  getAdminDesignScenario,
  updateAdminDesignScenarioQuestion,
  createAdminDesignScenarioQuestion,
} = await import('./design-scenarios')

describe('admin/design-scenarios', () => {
  beforeEach(() => {
    canManageContentMock.mockResolvedValue(true)
    scenariosSelectMock.mockClear()
    scenarioQuestionsSelectMock.mockClear()
    questionNumberMaybeSingleMock.mockClear()
    updateEqMock.mockClear()
    insertSingleMock.mockClear()
    logServerErrorMock.mockClear()
  })

  test('loads scenario summaries with question counts', async () => {
    const scenarios = await getAdminDesignScenarios()

    expect(scenarios).toHaveLength(1)
    expect(scenarios[0]?.question_count).toBe(1)
  })

  test('loads a scenario detail with scenario questions', async () => {
    const scenario = await getAdminDesignScenario('SC-001')

    expect(scenario?.scenario_id).toBe('SC-001')
    expect(scenario?.questions).toHaveLength(1)
  })

  test('updates a scenario question', async () => {
    const result = await updateAdminDesignScenarioQuestion('q-1', {
      question_stem: 'Updated question',
    })

    expect(result.error).toBeNull()
    expect(updateEqMock).toHaveBeenCalledTimes(1)
  })

  test('creates a new scenario question shell', async () => {
    const result = await createAdminDesignScenarioQuestion('SC-001')

    expect(result.questionId).toBe('new-q-1')
  })
})
