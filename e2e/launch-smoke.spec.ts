import { expect, test, type APIRequestContext } from '@playwright/test'

type PublicRouteSmoke = {
  path: string
  title: RegExp
  text: RegExp
}

const publicRouteSmokes: PublicRouteSmoke[] = [
  {
    path: '/',
    title: /SlateCamp/i,
    text: /readiness|LEA/i,
  },
  {
    path: '/login',
    title: /Log In/i,
    text: /Welcome back|Log in/i,
  },
  {
    path: '/forgot-password',
    title: /SlateCamp/i,
    text: /Reset your password/i,
  },
  {
    path: '/auth/reset-password',
    title: /SlateCamp/i,
    text: /Set a new password/i,
  },
  {
    path: '/pricing',
    title: /Pricing|SlateCamp/i,
    text: /free|pricing|available/i,
  },
  {
    path: '/about',
    title: /About|SlateCamp/i,
    text: /SlateCamp|LEA|architecture/i,
  },
  {
    path: '/contact',
    title: /Contact|SlateCamp/i,
    text: /contact|support|SlateCamp/i,
  },
  {
    path: '/register',
    title: /Register|SlateCamp/i,
    text: /Create|Sign up|Register/i,
  },
  {
    path: '/try',
    title: /SlateCamp/i,
    text: /try|demo|SlateCamp/i,
  },
]

test.describe('launch-critical public routes', () => {
  for (const route of publicRouteSmokes) {
    test(`${route.path} renders expected public content`, async ({ page }) => {
      const response = await page.goto(route.path, {
        waitUntil: 'domcontentloaded',
      })

      expect(response?.ok(), `${route.path} should return 2xx`).toBe(true)
      await expect(page).toHaveTitle(route.title)
      await expect(page.locator('body')).toContainText(route.text)
    })
  }
})

test.describe('launch-critical redirect shims', () => {
  const redirects = [
    { from: '/test-3d', to: '/dashboard/3d-lab' },
    { from: '/dashboard/trail', to: '/dashboard/camptrails' },
    { from: '/dashboard/trails', to: '/dashboard/camptrails' },
    { from: '/dashboard/heatmap', to: '/dashboard/analytics' },
    { from: '/dashboard/settings/billing', to: '/dashboard/settings' },
    { from: '/dashboard/settings/developer', to: '/developer' },
    { from: '/admin/wiki', to: '/admin/knowledge' },
  ]

  for (const route of redirects) {
    test(`${route.from} redirects to ${route.to}`, async ({ request }) => {
      await expectRedirect(request, route.from, route.to)
    })
  }
})

async function expectRedirect(
  request: APIRequestContext,
  from: string,
  expectedPathname: string,
) {
  const response = await request.get(from, { maxRedirects: 0 })
  const location = response.headers().location

  expect([307, 308]).toContain(response.status())
  expect(location, `${from} should return a Location header`).toBeTruthy()
  expect(new URL(location!, 'http://localhost').pathname).toBe(expectedPathname)
}
