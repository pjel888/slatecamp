import { expect } from '@playwright/test'
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
    test.setTimeout(90000)
    await gotoAllowRedirectAbort(page, '/admin/reviews')
    await expect(page).toHaveURL(/\/admin\/reviews$/, { timeout: 15000 })
    await expect(page.locator('body')).toContainText(/Review|Queue|Pending/i, {
      timeout: 15000,
    })
  })
})
