import { beforeEach, describe, expect, mock, test } from 'bun:test'

const userRolesOrderMock = mock(() =>
  Promise.resolve({
    data: [{ id: 'role-1', user_id: 'user-1', role: 'admin', created_at: '2026-04-12T07:00:00Z' }],
    error: null,
  }),
)
const userRolesInsertMock = mock(() => Promise.resolve({ error: null }))
const userRolesDeleteEqMock = mock(() => Promise.resolve({ error: null }))
const profilesInMock = mock(() =>
  Promise.resolve({
    data: [{ id: 'user-1', role: 'ceo', created_at: '2026-04-12T07:00:00Z' }],
    error: null,
  }),
)
const profilesUpdateEqMock = mock(() => Promise.resolve({ error: null }))

const userRolesPermissionError = { message: 'permission denied for table user_roles' }

const createAdminClientMock = () => ({
  from: (table) => {
    if (table === 'user_roles') {
      return {
        select: mock(() => ({
          order: userRolesOrderMock,
        })),
        insert: userRolesInsertMock,
        delete: mock(() => ({
          eq: userRolesDeleteEqMock,
        })),
      }
    }

    if (table === 'profiles') {
      return {
        select: mock(() => ({
          in: mock(() => ({
            order: profilesInMock,
          })),
        })),
        update: mock(() => ({
          eq: profilesUpdateEqMock,
        })),
      }
    }

    return {} as never
  },
})

mock.module('@/lib/supabase/admin', () => ({
  createAdminClient: createAdminClientMock,
}))

mock.module('@/lib/admin/roles', () => ({
  canManageUsers: mock(() => Promise.resolve(true)),
}))

const logServerErrorMock = mock(() => Promise.resolve())
mock.module('@/lib/logging/server', () => ({
  logServerError: logServerErrorMock,
}))

const { assignRole, getAdminUsers, revokeRole } = await import('./roles')

describe('admin/roles actions', () => {
  beforeEach(() => {
    userRolesOrderMock.mockReset()
    userRolesInsertMock.mockReset()
    userRolesDeleteEqMock.mockReset()
    profilesInMock.mockReset()
    profilesUpdateEqMock.mockReset()
    logServerErrorMock.mockClear()

    userRolesOrderMock.mockResolvedValue({
      data: [{ id: 'role-1', user_id: 'user-1', role: 'admin', created_at: '2026-04-12T07:00:00Z' }],
      error: null,
    })
    userRolesInsertMock.mockResolvedValue({ error: null })
    userRolesDeleteEqMock.mockResolvedValue({ error: null })
    profilesInMock.mockResolvedValue({
      data: [{ id: 'user-1', role: 'ceo', created_at: '2026-04-12T07:00:00Z' }],
      error: null,
    })
    profilesUpdateEqMock.mockResolvedValue({ error: null })
  })

  test('returns canonical user_roles data when accessible', async () => {
    const result = await getAdminUsers()
    expect(result.storageMode).toBe('user_roles')
    expect(result.rows).toHaveLength(1)
  })

  test('falls back to profiles when user_roles is blocked', async () => {
    userRolesOrderMock.mockResolvedValueOnce({
      data: null,
      error: userRolesPermissionError,
    })

    const result = await getAdminUsers()
    expect(result.storageMode).toBe('profiles_fallback')
    expect(result.rows[0]?.role).toBe('ceo')
  })

  test('assignRole updates profiles when user_roles is blocked', async () => {
    userRolesInsertMock.mockResolvedValueOnce({ error: userRolesPermissionError })

    const formData = new FormData()
    formData.set('userId', '550e8400-e29b-41d4-a716-446655440000')
    formData.set('role', 'developer')

    const result = await assignRole(formData)
    expect(result.storageMode).toBe('profiles_fallback')
    expect(profilesUpdateEqMock).toHaveBeenCalledTimes(1)
  })

  test('revokeRole updates profiles when user_roles is blocked', async () => {
    userRolesDeleteEqMock.mockResolvedValueOnce({ error: userRolesPermissionError })

    const formData = new FormData()
    formData.set('roleId', '550e8400-e29b-41d4-a716-446655440000')

    const result = await revokeRole(formData)
    expect(result.storageMode).toBe('profiles_fallback')
    expect(profilesUpdateEqMock).toHaveBeenCalledTimes(1)
  })
})
