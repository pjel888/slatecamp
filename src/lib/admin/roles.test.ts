import { beforeEach, describe, expect, mock, test } from 'bun:test'

// Mock Supabase client
const mockGetUser = mock(() => Promise.resolve({ data: { user: null }, error: null }))

let mockProfileRole: string | null = null
let mockDbRole: string | null = null

const makeQueryResult = (table: string) => {
  const role =
    table === 'profiles' ? mockProfileRole : table === 'user_roles' ? mockDbRole : null
  return {
    data: role ? { role } : null,
    error: null,
  }
}

const mockFrom = mock((table: string) => ({
  select: () => ({
    eq: () => ({
      order: () => Promise.resolve({ data: mockDbRole ? [{ role: mockDbRole }] : [] }),
      maybeSingle: () => Promise.resolve(makeQueryResult(table)),
    }),
  }),
}))

mock.module('@/lib/supabase/server', () => ({
  createStaticClient: () => Promise.resolve({}),
  createServiceClient: () => Promise.resolve({}),
  hasAuthCookie: () => Promise.resolve(false),
  getUserIfPresent: () => Promise.resolve({ data: { user: null } }),
  createClient: () =>
    Promise.resolve({
      auth: { getUser: mockGetUser },
      from: mockFrom,
    }),
  getUser: mockGetUser,
}))

const {
  getUserRole,
  isAdmin,
  isSuperAdmin,
  canManageContent,
  canReviewContent,
  canManageUsers,
  assertPermission,
} = await import('./roles')

describe('Admin Roles', () => {
  beforeEach(() => {
    mockGetUser.mockClear()
    mockFrom.mockClear()
    mockProfileRole = null
    mockDbRole = null
    process.env.ADMIN_EMAILS = ''
    delete process.env.DEV_FORCE_USER_ID
  })

  describe('getUserRole', () => {
    test('returns null when no user is authenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: null })
      const role = await getUserRole()
      expect(role).toBeNull()
    })

    test('returns role from database when present', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-1', email: 'test@example.com' } },
        error: null,
      })
      mockDbRole = 'content_admin'

      const role = await getUserRole()
      expect(role).toBe('content_admin')
    })

    test('returns role from auth metadata before database fallbacks', async () => {
      mockGetUser.mockResolvedValue({
        data: {
          user: {
            id: 'user-1',
            email: 'dev@example.com',
            app_metadata: { role: 'developer' },
          },
        },
        error: null,
      })

      const role = await getUserRole()
      expect(role).toBe('developer')
    })

    test('returns role from profile when auth metadata is empty', async () => {
      mockGetUser.mockResolvedValue({
        data: {
          user: {
            id: 'user-1',
            email: 'dev@example.com',
            app_metadata: {},
            user_metadata: {},
          },
        },
        error: null,
      })
      mockProfileRole = 'ceo'

      const role = await getUserRole()
      expect(role).toBe('ceo')
    })

    test('falls back to legacy ADMIN_EMAILS when no DB role exists', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-1', email: 'admin@slatecamp.com' } },
        error: null,
      })

      process.env.ADMIN_EMAILS = 'admin@slatecamp.com, other@test.com'
      const role = await getUserRole()
      expect(role).toBe('super_admin')
    })
  })

  describe('Permission Helpers', () => {
    const mockRole = (role: string | null) => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-1', email: 'test@example.com', app_metadata: {} } },
        error: null,
      })
      mockDbRole = role
      mockProfileRole = null
    }

    test('isAdmin returns true for super_admin and owner', async () => {
      mockRole('super_admin')
      expect(await isAdmin()).toBe(true)
      
      mockRole('owner')
      expect(await isAdmin()).toBe(true)
    })

    test('isAdmin returns true for content_admin', async () => {
      mockRole('content_admin')
      expect(await isAdmin()).toBe(true)
    })

    test('isSuperAdmin returns true for super_admin and owner', async () => {
      mockRole('super_admin')
      expect(await isSuperAdmin()).toBe(true)

      mockRole('owner')
      expect(await isSuperAdmin()).toBe(true)

      mockRole('content_admin')
      expect(await isSuperAdmin()).toBe(false)
    })

    test('canManageContent excludes reviewer-only roles', async () => {
      mockRole('sme_reviewer')
      expect(await canManageContent()).toBe(false)

      mockRole('super_admin')
      expect(await canManageContent()).toBe(true)

      mockRole('owner')
      expect(await canManageContent()).toBe(true)
    })

    test('canReviewContent matches multiple staff roles', async () => {
      mockRole('owner')
      expect(await canReviewContent()).toBe(true)

      mockRole('super_admin')
      expect(await canReviewContent()).toBe(true)

      mockRole('content_admin')
      expect(await canReviewContent()).toBe(true)

      mockRole('sme_reviewer')
      expect(await canReviewContent()).toBe(true)
      
      mockRole('developer')
      expect(await canReviewContent()).toBe(true)
    })

    test('canManageUsers returns true for super_admin and owner', async () => {
      mockRole('super_admin')
      expect(await canManageUsers()).toBe(true)

      mockRole('owner')
      expect(await canManageUsers()).toBe(true)

      mockRole('content_admin')
      expect(await canManageUsers()).toBe(false)
    })
  })

  describe('assertPermission', () => {
    const mockRole = (role: string | null) => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-1', email: 'test@example.com', app_metadata: {} } },
        error: null,
      })
      mockDbRole = role
      mockProfileRole = null
    }

    test('passes silently when user has permission', async () => {
      mockRole('super_admin')
      await expect(assertPermission('admin.content.create')).resolves.toBeUndefined()
    })

    test('throws when user lacks permission', async () => {
      mockRole('member')
      await expect(assertPermission('admin.content.create')).rejects.toThrow('Forbidden')
    })

    test('sme_reviewer can approve content but not create', async () => {
      mockRole('sme_reviewer')
      await expect(assertPermission('admin.content.approve')).resolves.toBeUndefined()
      await expect(assertPermission('admin.content.create')).rejects.toThrow('Forbidden')
    })

    test('developer can edit but not publish', async () => {
      mockRole('developer')
      await expect(assertPermission('admin.content.edit')).resolves.toBeUndefined()
      await expect(assertPermission('admin.content.publish')).rejects.toThrow('Forbidden')
    })
  })
})
