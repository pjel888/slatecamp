import { expect, type APIRequestContext } from '@playwright/test'
import {
  authenticatedDemoTest as test,
  demoAuthEnabled,
  gotoAllowRedirectAbort,
} from './support/authenticated-demo'

test.describe('content-admin permission matrix', () => {
  test.skip(
    !demoAuthEnabled,
    'Set PLAYWRIGHT_DEMO_AUTH=true to run permission matrix coverage.',
  )

  test('can access admin dashboard and sees permitted nav items', async ({
    page,
  }) => {
    test.setTimeout(45000)
    await gotoAllowRedirectAbort(page, '/admin')
    await expect(page).toHaveURL(/\/admin$/, { timeout: 15000 })

    // Overview nav group visible
    await expect(page.locator('body')).toContainText('Dashboard', {
      timeout: 15000,
    })

    // Knowledge Base nav group visible
    await expect(page.locator('body')).toContainText('Browser', {
      timeout: 15000,
    })
    await expect(page.locator('body')).toContainText('Create Article', {
      timeout: 15000,
    })

    // Quality nav group visible (content_admin has reviews.view)
    await expect(page.locator('body')).toContainText('Review Queue', {
      timeout: 15000,
    })
    await expect(page.locator('body')).toContainText('Publishing Pipeline', {
      timeout: 15000,
    })

    // Audit Log NOT visible (no admin.audit.view)
    await expect(
      page.locator('body'),
    ).not.toContainText('Audit Log', { timeout: 5000 })
  })

  test('can access pipeline and publishing surfaces', async ({ page }) => {
    test.setTimeout(90000)
    await gotoAllowRedirectAbort(page, '/admin/pipeline')
    await expect(page).toHaveURL(/\/admin\/pipeline$/, { timeout: 15000 })
    await expect(page.locator('body')).toContainText(/Pipeline|Publish|Status/i, {
      timeout: 15000,
    })
  })

  test('can access reviews queue', async ({ page }) => {
    test.setTimeout(90000)
    await gotoAllowRedirectAbort(page, '/admin/reviews')
    await expect(page).toHaveURL(/\/admin\/reviews$/, { timeout: 15000 })
    await expect(page.locator('body')).toContainText(/Review|Queue|Pending/i, {
      timeout: 15000,
    })
  })

  test('is denied ceo portal routes', async ({ request }) => {
    test.setTimeout(90000)
    await expectDashboardRedirect(request, '/ceo/financials')
  })

  test('is denied developer portal routes', async ({ request }) => {
    test.setTimeout(90000)
    await expectDashboardRedirect(request, '/developer')
  })

  test('is denied audit log page', async ({ request }) => {
    test.setTimeout(90000)
    await expectDashboardRedirect(request, '/admin/audit')
  })
})

async function expectDashboardRedirect(
  request: APIRequestContext,
  path: string,
) {
  const response = await request.get(path, { maxRedirects: 0, timeout: 60000 })
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
