import { beforeEach, describe, expect, mock, test } from 'bun:test'

const previewInsertSingleMock = mock(() =>
  Promise.resolve({
    data: { id: 'preview-1' },
    error: null,
  }),
)
const previewUpdateEqMock = mock(() => Promise.resolve({ error: null }))

mock.module('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: (table: string) => {
      if (table !== 'admin_draft_previews') return {} as never

      return {
        insert: mock(() => ({
          select: () => ({
            single: previewInsertSingleMock,
          }),
        })),
        update: mock(() => ({
          eq: previewUpdateEqMock,
        })),
      }
    },
  }),
}))

const canManageContentMock = mock(() => Promise.resolve(true))
mock.module('@/lib/admin/roles', () => ({
  canManageContent: canManageContentMock,
  canReviewContent: mock(() => Promise.resolve(true)),
  assertPermission: mock(() => Promise.resolve()),
}))

const revalidatePathMock = mock(() => {})
mock.module('next/cache', () => ({
  revalidatePath: revalidatePathMock,
  revalidateTag: mock(() => {}),
  unstable_cache: (fn: (...args: any[]) => any) => fn,
}))

const {
  generateDraftPreview,
  updateDraftPreview,
} = await import('./preview-actions')

describe('preview-actions', () => {
  beforeEach(() => {
    canManageContentMock.mockResolvedValue(true)
    previewInsertSingleMock.mockClear()
    previewUpdateEqMock.mockClear()
    revalidatePathMock.mockClear()
  })

  test('allows content admins to generate draft previews through admin client access', async () => {
    const previewId = await generateDraftPreview('article-1', '# Draft content')

    expect(previewId).toBe('preview-1')
    expect(previewInsertSingleMock).toHaveBeenCalledTimes(1)
  })

  test('updates draft previews and revalidates the preview path', async () => {
    await updateDraftPreview('preview-1', '# Updated draft')

    expect(previewUpdateEqMock).toHaveBeenCalledWith('id', 'preview-1')
    expect(revalidatePathMock).toHaveBeenCalled()
  })
})
