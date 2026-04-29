import { expect, test } from '@playwright/test'

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
