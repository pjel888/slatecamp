import { expect, type APIRequestContext } from '@playwright/test'
import {
  authenticatedDemoTest as test,
  demoAuthEnabled,
} from './support/authenticated-demo'

const restrictedRoutes = [
  '/admin',
  '/admin/knowledge',
  '/developer',
  '/developer/tools',
  '/ceo',
  '/ceo/financials',
] as const

test.describe('demo-authenticated restricted role', () => {
  test.skip(
    !demoAuthEnabled,
    'Set PLAYWRIGHT_DEMO_AUTH=true to run restricted demo auth coverage.',
  )

  for (const path of restrictedRoutes) {
    test(`member demo user is denied ${path}`, async ({ request }) => {
      test.setTimeout(150000)
      await expectDashboardRedirect(request, path)
    })
  }
})

async function expectDashboardRedirect(
  request: APIRequestContext,
  path: string,
) {
  const response = await requestWithRetry(request, path)
  const location = response.headers().location

  if ([307, 308].includes(response.status())) {
    expect(location, `${path} should return a Location header`).toBeTruthy()
    expect(new URL(location!, 'http://localhost').pathname).toBe('/dashboard')
    return
  }

  expect(response.ok(), `${path} should resolve successfully`).toBe(true)
  const body = await response.text()
  expect(body).toMatch(/NEXT_REDIRECT|__next-page-redirect|Dashboard/)
  expect(body).toMatch(/\/dashboard|Dashboard/)
}


async function requestWithRetry(request: APIRequestContext, path: string) {
  let lastError: unknown

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      return await request.get(path, {
        maxRedirects: 0,
        timeout: 120000,
      })
    } catch (error) {
      lastError = error
      const message = String(error)
      if (!message.includes('ECONNRESET') && !message.includes('Timeout')) {
        throw error
      }
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }

  throw lastError
}
