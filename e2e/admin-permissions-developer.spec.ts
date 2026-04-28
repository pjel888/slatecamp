import { expect } from '@playwright/test'
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
    await expect(page.locator('body')).toContainText(
      /Developer Portal|Internal Docs/i,
      {
        timeout: 15000,
      },
    )
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
    await expect(page.locator('body')).not.toContainText(
      'Publishing Pipeline',
      { timeout: 5000 },
    )
    await expect(page.locator('body')).not.toContainText('Review Queue', {
      timeout: 5000,
    })

    // Structure and Audit hidden
    await expect(page.locator('body')).not.toContainText('Taxonomy', {
      timeout: 5000,
    })
    await expect(page.locator('body')).not.toContainText('Audit Log', {
      timeout: 5000,
    })
  })

  test('can access developer tools', async ({ page }) => {
    test.setTimeout(45000)
    await gotoAllowRedirectAbort(page, '/developer/tools')
    await expect(page).toHaveURL(/\/developer\/tools$/, { timeout: 15000 })
    await expect(page.locator('body')).toContainText(
      /Dev Tools|Internal tools/i,
      {
        timeout: 15000,
      },
    )
  })

  test('can access developer console', async ({ page }) => {
    test.setTimeout(45000)
    await gotoAllowRedirectAbort(page, '/developer/tools/console')
    await expect(page).toHaveURL(/\/developer\/tools\/console$/, { timeout: 15000 })
    await expect(page.locator('body')).toContainText(
      /Console|System|Feature Flags/i,
      {
        timeout: 15000,
      },
    )
  })

  test('can access database viewer', async ({ page }) => {
    test.setTimeout(45000)
    await gotoAllowRedirectAbort(page, '/developer/tools/db')
    await expect(page).toHaveURL(/\/developer\/tools\/db$/, { timeout: 15000 })
    await expect(page.locator('body')).toContainText(
      /Database|Table|Rows/i,
      {
        timeout: 15000,
      },
    )
  })

  test('can access logs viewer', async ({ page }) => {
    test.setTimeout(45000)
    await gotoAllowRedirectAbort(page, '/developer/tools/logs')
    await expect(page).toHaveURL(/\/developer\/tools\/logs$/, { timeout: 15000 })
    await expect(page.locator('body')).toContainText(
      /Logs|Audit|Application Errors/i,
      {
        timeout: 15000,
      },
    )
  })
})
