import { expect, type APIRequestContext } from '@playwright/test'
import {
  authenticatedDemoTest as test,
  demoAuthEnabled,
  gotoAllowRedirectAbort,
} from './support/authenticated-demo'

test.describe('developer permission matrix', () => {
  test.skip(
    !demoAuthEnabled,
    'Set PLAYWRIGHT_DEMO_AUTH=true to run permission matrix coverage.',
  )

  test('can access developer portal', async ({ page }) => {
    test.setTimeout(45000)
    await gotoAllowRedirectAbort(page, '/developer')
    await expect(page).toHaveURL(/\/developer$/, { timeout: 15000 })
    await expect(page.locator('body')).toContainText(/Developer Portal|Internal Docs/i, {
      timeout: 15000,
    })
  })

  test('can access admin dashboard with limited nav scope', async ({
    page,
  }) => {
    test.setTimeout(45000)
    await gotoAllowRedirectAbort(page, '/admin')
    await expect(page).toHaveURL(/\/admin$/, { timeout: 15000 })

    // Overview visible
    await expect(page.locator('body')).toContainText('Dashboard', {
      timeout: 15000,
    })

    // Knowledge Base visible (content view only)
    await expect(page.locator('body')).toContainText('Browser', {
      timeout: 15000,
    })

    // Publishing and Reviews hidden
    await expect(
      page.locator('body'),
    ).not.toContainText('Publishing Pipeline', { timeout: 5000 })
    await expect(
      page.locator('body'),
    ).not.toContainText('Review Queue', { timeout: 5000 })

    // Structure and Audit hidden
    await expect(
      page.locator('body'),
    ).not.toContainText('Taxonomy', { timeout: 5000 })
    await expect(
      page.locator('body'),
    ).not.toContainText('Audit Log', { timeout: 5000 })
  })

  test('can access developer tools', async ({ page }) => {
    test.setTimeout(45000)
    await gotoAllowRedirectAbort(page, '/developer/tools')
    await expect(page).toHaveURL(/\/developer\/tools$/, { timeout: 15000 })
    await expect(page.locator('body')).toContainText(/Dev Tools|Internal tools/i, {
      timeout: 15000,
    })
  })

  test('is denied ceo portal routes', async ({ request }) => {
    test.setTimeout(45000)
    await expectDashboardRedirect(request, '/ceo/financials')
    await expectDashboardRedirect(request, '/ceo/team/admin-roles')
  })

  test('is denied admin pipeline and reviews', async ({ request }) => {
    test.setTimeout(45000)
    await expectDashboardRedirect(request, '/admin/pipeline')
    await expectDashboardRedirect(request, '/admin/reviews')
    await expectDashboardRedirect(request, '/admin/audit')
  })
})

async function expectDashboardRedirect(
  request: APIRequestContext,
  path: string,
) {
  const response = await request.get(path, { maxRedirects: 0 })
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
