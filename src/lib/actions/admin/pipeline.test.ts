import { beforeEach, describe, expect, mock, test } from 'bun:test'

const updateEqMock = mock(() => Promise.resolve({ error: { message: 'status failed' } }))

mock.module('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: () => ({
      update: () => ({
        eq: updateEqMock,
      }),
    }),
  }),
}))

const canManageContentMock = mock(() => Promise.resolve(true))
mock.module('@/lib/admin/roles', () => ({
  canManageContent: canManageContentMock,
}))

mock.module('next/cache', () => ({
  revalidatePath: mock(),
  revalidateTag: mock(),
}))

mock.module('next/server', () => ({
  after: (fn: () => unknown) => fn(),
}))

const logServerErrorMock = mock(() => Promise.resolve())
mock.module('@/lib/logging/server', () => ({
  logServerError: logServerErrorMock,
}))

const { updateArticleStatus } = await import('./pipeline')

describe('admin/pipeline', () => {
  beforeEach(() => {
    updateEqMock.mockClear()
    logServerErrorMock.mockClear()
  })

  test('logs and throws when pipeline status update fails', async () => {
    await expect(updateArticleStatus('article-1', 'published')).rejects.toThrow('Failed to update status')
    expect(logServerErrorMock).toHaveBeenCalledTimes(1)
  })
})
