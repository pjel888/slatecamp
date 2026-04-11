import { beforeEach, describe, expect, mock, test } from 'bun:test'

// Mock Supabase client
const mockGetUser = mock(() => Promise.resolve({ data: { user: null }, error: null }))

let mockProfileRole: string | null = null
let mockDbRole: string | null = null

const makeQueryResult = (table: string) => {
  const role = table === 'profiles' ? mockProfileRole : table === 'user_roles' ? mockDbRole : null
  return {
    data: role ? { role } : null,
    error: null,
  }
}

const mockFrom = mock((table: string) => ({
  select: () => ({
    eq: () => ({
      order: () => ({
        limit: () => ({
          maybeSingle: () => Promise.resolve(makeQueryResult(table)),
        }),
      }),
      maybeSingle: () => Promise.resolve(makeQueryResult(table)),
    }),
  }),
}))

mock.module('@/lib/supabase/server', () => ({
  createClient: () => Promise.resolve({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  }),
}))

// Re-import to use mocked module
const { 
  getUserRole, 
  isAdmin, 
  isSuperAdmin, 
  canManageContent, 
  canReviewContent, 
  canManageUsers,
} = await import('./roles')

describe('Admin Roles', () => {
  beforeEach(() => {
    mockGetUser.mockClear()
    mockFrom.mockClear()
    mockProfileRole = null
    mockDbRole = null
    // Reset env vars
    process.env.ADMIN_EMAILS = ''
    // process.env.NODE_ENV = 'test' (Read-only)
    delete process.env.DEV_FORCE_USER_ID
  })

  describe('getUserRole', () => {
    test('returns null when no user is authenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: null })
      const role = await getUserRole()
      expect(role).toBeNull()
    })

    test('returns role from database when present', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1', email: 'test@example.com' } }, error: null })
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
      mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1', email: 'admin@slatecamp.com' } }, error: null })

      process.env.ADMIN_EMAILS = 'admin@slatecamp.com, other@test.com'
      const role = await getUserRole()
      expect(role).toBe('super_admin')
    })

    test('returns null when neither DB role nor legacy email matches', async () => {
      mockGetUser.mockResolvedValue({
        data: {
          user: {
            id: 'user-1',
            email: 'user@example.com',
            app_metadata: {},
            user_metadata: {},
          },
        },
        error: null,
      })

      process.env.ADMIN_EMAILS = 'admin@slatecamp.com'
      const role = await getUserRole()
      expect(role).toBeNull()
    })

    test('applies dev mode bypass when configured', async () => {
      ;(process.env as Record<string, string | undefined>).NODE_ENV = 'development'
      process.env.DEV_FORCE_USER_ID = 'dev-user'
      mockGetUser.mockResolvedValue({ data: { user: { id: 'dev-user' } }, error: null })
      
      const role = await getUserRole()
      expect(role).toBe('super_admin')
    })
  })

  describe('Permission Helpers', () => {
    const mockRole = (role: string | null) => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null })
      mockDbRole = role
    }

    test('isAdmin returns true for super_admin and content_admin', async () => {
      mockRole('super_admin')
      expect(await isAdmin()).toBe(true)
      
      mockRole('content_admin')
      expect(await isAdmin()).toBe(true)
      
      mockRole('sme_reviewer')
      expect(await isAdmin()).toBe(false)
      
      mockRole(null)
      expect(await isAdmin()).toBe(false)
    })

    test('isSuperAdmin returns true only for super_admin', async () => {
      mockRole('super_admin')
      expect(await isSuperAdmin()).toBe(true)
      
      mockRole('content_admin')
      expect(await isSuperAdmin()).toBe(false)
    })

    test('canManageContent matches super_admin and content_admin', async () => {
      mockRole('super_admin')
      expect(await canManageContent()).toBe(true)
      
      mockRole('content_admin')
      expect(await canManageContent()).toBe(true)
      
      mockRole('sme_reviewer')
      expect(await canManageContent()).toBe(false)
    })

    test('canReviewContent matches all 3 roles', async () => {
      mockRole('super_admin')
      expect(await canReviewContent()).toBe(true)
      
      mockRole('content_admin')
      expect(await canReviewContent()).toBe(true)
      
      mockRole('sme_reviewer')
      expect(await canReviewContent()).toBe(true)
      
      mockRole(null)
      expect(await canReviewContent()).toBe(false)
    })

    test('canManageUsers returns true only for super_admin', async () => {
      mockRole('super_admin')
      expect(await canManageUsers()).toBe(true)
      
      mockRole('content_admin')
      expect(await canManageUsers()).toBe(false)
    })
  })
})
