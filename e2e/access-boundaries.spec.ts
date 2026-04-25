import { expect, test, type APIRequestContext } from '@playwright/test'

type RedirectCase = {
  from: string
  loginPath: string
  nextPath: string
}

const protectedRedirects: RedirectCase[] = [
  { from: '/dashboard', loginPath: '/login', nextPath: '/dashboard' },
  {
    from: '/dashboard/settings',
    loginPath: '/login',
    nextPath: '/dashboard/settings',
  },
  {
    from: '/dashboard/assessment',
    loginPath: '/login',
    nextPath: '/dashboard/assessment',
  },
  {
    from: '/dashboard/welcome-pro',
    loginPath: '/login',
    nextPath: '/dashboard/welcome-pro',
  },
  { from: '/developer', loginPath: '/login', nextPath: '/developer' },
  { from: '/ceo', loginPath: '/login', nextPath: '/ceo' },
  { from: '/admin', loginPath: '/admin/login', nextPath: '/admin' },
  {
    from: '/admin/knowledge',
    loginPath: '/admin/login',
    nextPath: '/admin/knowledge',
  },
]

test.describe('unauthenticated access boundaries', () => {
  for (const route of protectedRedirects) {
    test(`${route.from} redirects to ${route.loginPath}`, async ({
      request,
    }) => {
      await expectLoginRedirect(request, route)
    })
  }

  test('/auth/callback without code returns a deterministic auth error', async ({
    request,
  }) => {
    const response = await request.get('/auth/callback', { maxRedirects: 0 })
    const location = response.headers().location

    expect([307, 308]).toContain(response.status())
    expect(location, 'callback should return a Location header').toBeTruthy()

    const redirect = new URL(location!, 'http://localhost')
    expect(redirect.pathname).toBe('/login')
    expect(redirect.searchParams.get('error')).toBe('auth_callback_failed')
  })
})

async function expectLoginRedirect(
  request: APIRequestContext,
  route: RedirectCase,
) {
  const response = await request.get(route.from, { maxRedirects: 0 })
  const location = response.headers().location

  expect([307, 308]).toContain(response.status())
  expect(location, `${route.from} should return a Location header`).toBeTruthy()

  const redirect = new URL(location!, 'http://localhost')
  expect(redirect.pathname).toBe(route.loginPath)
  expect(redirect.searchParams.get('next')).toBe(route.nextPath)
}
