import { expect, type APIRequestContext } from '@playwright/test'
import {
  authenticatedDemoTest as test,
  demoAuthEnabled,
  gotoAllowRedirectAbort,
} from './support/authenticated-demo'

test.describe('sme-reviewer permission matrix', () => {
  test.skip(
    !demoAuthEnabled,
    'Set PLAYWRIGHT_DEMO_AUTH=true to run permission matrix coverage.',
  )

  test('can access admin dashboard and sees review-centric nav items', async ({
    page,
  }) => {
    test.setTimeout(45000)
    await gotoAllowRedirectAbort(page, '/admin')
    await expect(page).toHaveURL(/\/admin$/, { timeout: 15000 })

    // Overview visible
    await expect(page.locator('body')).toContainText('Dashboard', {
      timeout: 15000,
    })

    // Knowledge Base visible but creation options hidden
    await expect(page.locator('body')).toContainText('Browser', {
      timeout: 15000,
    })
    await expect(
      page.locator('body'),
    ).not.toContainText('Create Article', { timeout: 5000 })
    await expect(
      page.locator('body'),
    ).not.toContainText('Create New', { timeout: 5000 })

    // Quality visible
    await expect(page.locator('body')).toContainText('Review Queue', {
      timeout: 15000,
    })
    await expect(page.locator('body')).toContainText('Publishing Pipeline', {
      timeout: 15000,
    })

    // Structure and Settings hidden
    await expect(
      page.locator('body'),
    ).not.toContainText('Taxonomy', { timeout: 5000 })
    await expect(
      page.locator('body'),
    ).not.toContainText('Settings', { timeout: 5000 })
  })

  test('can access reviews queue', async ({ page }) => {
    test.setTimeout(45000)
    await gotoAllowRedirectAbort(page, '/admin/reviews')
    await expect(page).toHaveURL(/\/admin\/reviews$/, { timeout: 15000 })
    await expect(page.locator('body')).toContainText(/Review|Queue|Pending/i, {
      timeout: 15000,
    })
  })

  test('can access pipeline for review approvals', async ({ page }) => {
    test.setTimeout(45000)
    await gotoAllowRedirectAbort(page, '/admin/pipeline')
    await expect(page).toHaveURL(/\/admin\/pipeline$/, { timeout: 15000 })
    await expect(page.locator('body')).toContainText(/Pipeline|Publish|Status/i, {
      timeout: 15000,
    })
  })

  test('is denied content creation routes', async ({ request }) => {
    test.setTimeout(45000)
    await expectDashboardRedirect(request, '/admin/knowledge/questions/new')
    await expectDashboardRedirect(request, '/admin/knowledge/new')
    await expectDashboardRedirect(request, '/admin/knowledge/import')
  })

  test('is denied ceo and developer portals', async ({ request }) => {
    test.setTimeout(45000)
    await expectDashboardRedirect(request, '/ceo/financials')
    await expectDashboardRedirect(request, '/ceo/team/admin-roles')
    await expectDashboardRedirect(request, '/developer')
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
