import { beforeEach, describe, expect, mock, test } from 'bun:test'

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

mock.module('@/lib/demo/config', () => ({
  isDemoMode: () => false,
  DEMO_USER: { id: 'demo-user' },
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

mock.module('@/lib/entitlements/policy', () => ({
  canAccessAdminCmsForRole: () => false,
  canAccessCeoPortalForRole: () => false,
  canAccessDeveloperPortalForRole: () => false,
}))

mock.module('@/lib/entitlements/resolve-role', () => ({
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
})
