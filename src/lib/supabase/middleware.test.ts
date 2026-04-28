import { afterAll, beforeEach, describe, expect, mock, test } from 'bun:test'

const getUserMock = mock(() => {
  throw new Error('auth unavailable')
})

const cookieBag = () => {
  const store: { name: string; value: string }[] = []

  return {
    set: (name: string, value: string) => {
      store.push({ name, value })
    },
    getAll: () => store,
  }
}

mock.module('@supabase/ssr', () => ({
  createServerClient: () => ({
    auth: {
      getUser: getUserMock,
    },
  }),
}))

const originalDemoConfig = { ...(await import('@/lib/demo/config')) }

mock.module('@/lib/demo/config', () => ({
  ...originalDemoConfig,
  isDemoMode: () => false,
}))

mock.module('next/server', () => ({
  NextResponse: {
    next: ({ request }: { request?: unknown } = {}) => ({
      status: 200,
      request,
      cookies: cookieBag(),
    }),
    redirect: (url: URL) => ({
      status: 307,
      url: url.toString(),
      cookies: cookieBag(),
    }),
  },
  after: (fn: () => unknown) => fn(),
}))

const originalPolicy = { ...(await import('@/lib/entitlements/policy')) }
const originalResolveRole = { ...(await import('@/lib/entitlements/resolve-role')) }

mock.module('@/lib/entitlements/policy', () => ({
  ...originalPolicy,
  canAccessAdminCmsForRole: () => false,
  canAccessCeoPortalForRole: () => false,
  canAccessDeveloperPortalForRole: () => false,
}))

mock.module('@/lib/entitlements/resolve-role', () => ({
  ...originalResolveRole,
  resolveCurrentUserRole: () =>
    Promise.resolve({
      normalizedRole: 'member',
      resolvedFrom: 'none',
      precedenceTrace: [],
    }),
  resolveRoleFromInputs: () => ({
    normalizedRole: 'member',
    resolvedFrom: 'none',
    precedenceTrace: [],
  }),
}))

const { updateSession } = await import('./middleware')

describe('supabase/middleware', () => {
  beforeEach(() => {
    getUserMock.mockClear()
  })

  afterAll(() => {
    mock.module('@/lib/entitlements/policy', () => ({ ...originalPolicy }))
    mock.module('@/lib/entitlements/resolve-role', () => ({ ...originalResolveRole }))
    mock.module('@/lib/demo/config', () => ({ ...originalDemoConfig }))
  })



  test('logs getUser failures and still redirects unauthenticated protected routes', async () => {
    const errorSpy = mock(() => {})
    const originalError = console.error
    console.error = errorSpy
    const originalForceUser = process.env.DEV_FORCE_USER_ID
    delete process.env.DEV_FORCE_USER_ID

    const request = {
      method: 'GET',
      nextUrl: {
        pathname: '/dashboard',
        hostname: 'localhost',
      },
      url: 'http://localhost/dashboard',
      cookies: {
        getAll: () => [],
      },
    } as any

    const response = await updateSession(request)

    console.error = originalError
    if (originalForceUser) {
      process.env.DEV_FORCE_USER_ID = originalForceUser
    }

    expect(getUserMock).toHaveBeenCalledTimes(1)
    expect(errorSpy).toHaveBeenCalledTimes(1)
    expect(response.status).toBe(307)
    expect(response.url).toContain('/login')
  })

  test('redirects unauthenticated admin root to the admin login surface', async () => {
    const originalForceUser = process.env.DEV_FORCE_USER_ID
    delete process.env.DEV_FORCE_USER_ID

    const request = {
      method: 'GET',
      nextUrl: {
        pathname: '/admin',
        hostname: 'localhost',
      },
      url: 'http://localhost/admin',
      cookies: {
        getAll: () => [],
      },
    } as any

    const response = await updateSession(request)

    if (originalForceUser) {
      process.env.DEV_FORCE_USER_ID = originalForceUser
    }

    expect(response.status).toBe(307)
    expect(response.url).toContain('/admin/login')
    expect(response.url).toContain('next=%2Fadmin')
  })
})
