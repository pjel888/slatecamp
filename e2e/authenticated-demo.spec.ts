import { expect } from '@playwright/test'
import {
  authenticatedDemoTest as test,
  demoAuthEnabled,
  gotoAllowRedirectAbort,
} from './support/authenticated-demo'

test.describe('demo-authenticated first-run flows', () => {
  test.describe.configure({ timeout: 120000 })

  test.skip(
    !demoAuthEnabled,
    'Set PLAYWRIGHT_DEMO_AUTH=true to run authenticated demo flow coverage.',
  )

  test('dashboard renders the authenticated demo shell', async ({ page }) => {
    test.setTimeout(90000)
    const response = await page.goto('/dashboard', {
      waitUntil: 'domcontentloaded',
    })

    expect(response?.ok(), '/dashboard should return 2xx').toBe(true)
    await expect(page).toHaveURL(/\/dashboard$/)
    await expect(page.locator('body')).toContainText(
      /SlateCamp|Dashboard/i,
      { timeout: 60000 },
    )
    await expect(page.locator('body')).toContainText(/Philip\./i, {
      timeout: 60000,
    })
    await expect(page.locator('body')).toContainText(/Readiness Score/i, {
      timeout: 60000,
    })
    await expect(page.locator('body')).toContainText(
      /Wiki|Quiz|Camp Trail|Analytics|Settings/i,
      { timeout: 60000 },
    )
  })

  test('settings stays reachable as the first-run account recovery surface', async ({
    page,
  }) => {
    test.setTimeout(120000)
    const response = await page.goto('/dashboard/settings', {
      waitUntil: 'domcontentloaded',
    })

    expect(response?.ok(), '/dashboard/settings should return 2xx').toBe(true)
    await expect(page).toHaveURL(/\/dashboard\/settings$/)
    await expect(page.locator('body')).not.toContainText(
      /Your setup is not complete yet/i,
    )
    await expect(page.locator('body')).toContainText(/Account Settings/i)
    await expect(page.locator('body')).toContainText(/Profile/i)
    await expect(page.locator('body')).toContainText(/Account Center/i)
    await expect(page.locator('#displayName')).toHaveValue('Philip Lewis')
    await expect(page.locator('body')).toContainText(/Tier:\s*INSTITUTIONAL/i)
    await expect(page.locator('body')).toContainText(/Notifications/i)
  })

  test('authenticated demo onboarding resolves into the post-onboarding dashboard path', async ({
    page,
  }) => {
    test.setTimeout(120000)
    await gotoAllowRedirectAbort(page, '/onboarding')
    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 60000 })
    await expect(page.locator('body')).toContainText(/Readiness Score/i, {
      timeout: 30000,
    })
  })

  for (const path of ['/login', '/register']) {
    test(`authenticated demo auth entry ${path} resolves into dashboard`, async ({
      page,
    }) => {
      test.setTimeout(120000)
      await gotoAllowRedirectAbort(page, path)
      await expect(page).toHaveURL(/\/dashboard$/, { timeout: 60000 })
    })
  }

  test('authenticated demo admin login emits a dashboard redirect response', async ({
    request,
  }) => {
    test.setTimeout(45000)
    const response = await request.get('/admin/login')
    const body = await response.text()

    expect(response.ok()).toBe(true)
    expect(body).toMatch(/__next-page-redirect/)
    expect(body).toMatch(/\/dashboard/)
  })

  test('demo callback rejects unsafe next paths', async ({
    request,
  }) => {
    test.setTimeout(90000)
    const unsafe = await request.get('/auth/callback?next=//evil.example', {
      maxRedirects: 0,
      timeout: 60000,
    })
    const unsafeLocation = unsafe.headers().location

    expect([307, 308]).toContain(unsafe.status())
    expect(unsafeLocation).toBeTruthy()
    expect(new URL(unsafeLocation!, 'http://localhost').pathname).toBe(
      '/dashboard',
    )  })
})
