import { beforeEach, describe, expect, mock, test } from 'bun:test'

const insertMock = mock(() => Promise.resolve({ error: null }))
const updateMock = mock(() => ({ eq: () => Promise.resolve({ error: null }) }))
const deleteMock = mock(() => ({ eq: () => Promise.resolve({ error: null }), in: () => Promise.resolve({ error: null }) }))

mock.module('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: (table: string) => {
      if (table === 'questions') {
        return {
          insert: insertMock,
          update: updateMock,
          delete: deleteMock,
        }
      }

      return {} as never
    },
  }),
}))

mock.module('@/lib/supabase/server', () => ({
  createClient: () =>
    Promise.resolve({
      auth: {
        getUser: () =>
          Promise.resolve({
            data: {
              user: { id: 'user-1' },
            },
          }),
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

const { createQuestion } = await import('./questions')

describe('admin/questions', () => {
  beforeEach(() => {
    canManageContentMock.mockResolvedValue(true)
    insertMock.mockClear()
    logServerErrorMock.mockClear()
  })

  test('preserves validation throws while logging once', async () => {
    await expect(
      createQuestion({
        text: '',
        options: [],
        topic_id: '',
      } as any),
    ).rejects.toThrow('Validation error')

    expect(logServerErrorMock).toHaveBeenCalledTimes(1)
  })

  test('preserves { error } returns while logging db failures', async () => {
    insertMock.mockResolvedValue({
      error: { message: 'insert failed' },
    })

    const result = await createQuestion({
      text: 'Question',
      options: [
        { text: 'A' },
        { text: 'B' },
        { text: 'C' },
        { text: 'D' },
      ],
      topic_id: 'topic-1',
    } as any)

    expect((result.error as any)?.message).toBe('insert failed')
    expect(logServerErrorMock).toHaveBeenCalledTimes(1)
  })
})
