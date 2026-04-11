import { beforeEach, describe, expect, mock, test } from 'bun:test'

const insertMock = mock(() => ({
  select: () => ({
    single: () => Promise.resolve({ data: null, error: { message: 'insert failed' } }),
  }),
}))

const uploadMock = mock(() => Promise.resolve({ error: { message: 'upload failed' } }))

mock.module('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: (table: string) => {
      if (table === 'models_3d') {
        return {
          insert: insertMock,
        }
      }

      return {} as never
    },
    storage: {
      from: () => ({
        upload: uploadMock,
        getPublicUrl: () => ({ data: { publicUrl: 'https://example.com/model.glb' } }),
      }),
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

const { createAsset, uploadAssetFile } = await import('./assets')

describe('admin/assets', () => {
  beforeEach(() => {
    insertMock.mockClear()
    uploadMock.mockClear()
    logServerErrorMock.mockClear()
  })

  test('returns db errors while logging asset creation failures', async () => {
    const result = await createAsset({
      name: 'Asset',
      slug: 'asset',
      url: 'https://example.com/model.glb',
      metadata: {},
    })

    expect((result.error as any)?.message).toBe('insert failed')
    expect(logServerErrorMock).toHaveBeenCalledTimes(1)
  })

  test('returns upload errors while logging file upload failures', async () => {
    const formData = new FormData()
    formData.set('file', new File(['abc'], 'model.glb', { type: 'model/gltf-binary' }))

    const result = await uploadAssetFile(formData)

    expect(result.error).toBe('upload failed')
    expect(logServerErrorMock).toHaveBeenCalledTimes(1)
  })
})
