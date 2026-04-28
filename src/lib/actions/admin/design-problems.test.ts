import { beforeEach, describe, expect, mock, test } from 'bun:test'

const problemsSelectMock = mock(() =>
  Promise.resolve({
    data: [
      {
        problem_id: 'DP-001',
        title: 'Community clinic',
        building_type: 'Clinic',
        difficulty: 3,
        time_limit_minutes: 180,
      },
    ],
    error: null,
  }),
)
const designQuestionsSelectMock = mock(() =>
  Promise.resolve({
    data: [
      {
        question_id: 'dq-1',
        scenario_id: 'DP-001',
        number: 1,
        type: 'DC',
        question_stem: 'Design problem question',
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
    data: { question_id: 'new-dq-1' },
    error: null,
  }),
)
const questionNumberMaybeSingleMock = mock(() =>
  Promise.resolve({
    data: { number: 1 },
    error: null,
  }),
)

mock.module('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: (table: string) => {
      if (table === 'design_problems') {
        return {
          select: mock(() => ({
            order: problemsSelectMock,
            eq: mock(() => ({
              maybeSingle: mock(() =>
                Promise.resolve({
                  data: {
                    problem_id: 'DP-001',
                    title: 'Community clinic',
                    building_type: 'Clinic',
                    difficulty: 3,
                    time_limit_minutes: 180,
                    brief: 'Design problem brief',
                  },
                  error: null,
                }),
              ),
            })),
          })),
        }
      }

      if (table === 'design_questions') {
        return {
          select: mock((selection: string) => {
            if (selection === 'scenario_id') {
              return {
                in: mock(() => designQuestionsSelectMock()),
              }
            }

            if (selection === 'number') {
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
                order: designQuestionsSelectMock,
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
  assertPermission: mock(() => Promise.resolve()),
}))

mock.module('next/cache', () => ({
  revalidatePath: mock(),
}))

const {
  getAdminDesignProblems,
  getAdminDesignProblem,
  updateAdminDesignProblemQuestion,
  createAdminDesignProblemQuestion,
} = await import('./design-problems')

describe('admin/design-problems', () => {
  beforeEach(() => {
    canManageContentMock.mockResolvedValue(true)
    problemsSelectMock.mockClear()
    designQuestionsSelectMock.mockClear()
    questionNumberMaybeSingleMock.mockClear()
    updateEqMock.mockClear()
    insertSingleMock.mockClear()
  })

  test('loads design problem summaries with question counts', async () => {
    const problems = await getAdminDesignProblems()

    expect(problems).toHaveLength(1)
    expect(problems[0]?.question_count).toBe(1)
  })

  test('loads a design problem detail with questions', async () => {
    const problem = await getAdminDesignProblem('DP-001')

    expect(problem?.problem_id).toBe('DP-001')
    expect(problem?.questions).toHaveLength(1)
  })

  test('updates a design problem question', async () => {
    const result = await updateAdminDesignProblemQuestion('dq-1', {
      question_stem: 'Updated design problem question',
    })

    expect(result.error).toBeNull()
    expect(updateEqMock).toHaveBeenCalledTimes(1)
  })

  test('creates a new design problem question shell', async () => {
    const result = await createAdminDesignProblemQuestion('DP-001')

    expect(result.questionId).toBe('new-dq-1')
  })
})
