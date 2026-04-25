import { expect } from '@playwright/test'
import {
  authenticatedDemoTest as test,
  demoAuthEnabled,
  gotoAllowRedirectAbort,
} from './support/authenticated-demo'

test.describe('demo-authenticated first-run flows', () => {
  test.skip(
    !demoAuthEnabled,
    'Set PLAYWRIGHT_DEMO_AUTH=true to run authenticated demo flow coverage.',
  )

  test('dashboard renders the authenticated demo shell', async ({ page }) => {
    const response = await page.goto('/dashboard', {
      waitUntil: 'domcontentloaded',
    })

    expect(response?.ok(), '/dashboard should return 2xx').toBe(true)
    await expect(page).toHaveURL(/\/dashboard$/)
    await expect(page.locator('body')).toContainText(
      /SlateCamp|Dashboard/i,
    )
    await expect(page.locator('body')).toContainText(/Philip\./i)
    await expect(page.locator('body')).toContainText(/Readiness Score/i)
    await expect(page.locator('body')).toContainText(
      /Wiki|Drills|Camp Trail|Analytics|Settings/i,
    )
  })

  test('settings stays reachable as the first-run account recovery surface', async ({
    page,
  }) => {
    const response = await page.goto('/dashboard/settings', {
      waitUntil: 'domcontentloaded',
    })

    expect(response?.ok(), '/dashboard/settings should return 2xx').toBe(true)
    await expect(page).toHaveURL(/\/dashboard\/settings$/)
    await expect(page.locator('body')).toContainText(
      /Your setup is not complete yet/i,
    )
    await expect(page.locator('body')).toContainText(/Profile/i)
    await expect(page.locator('body')).toContainText(/Account Center/i)
    await expect(page.locator('#displayName')).toHaveValue('Philip Lewis')
    await expect(page.locator('body')).toContainText(/Tier:\s*INSTITUTIONAL/i)
    await expect(page.locator('body')).toContainText(/Notifications/i)
  })

  test('onboarding exposes the required setup decisions', async ({ page }) => {
    const response = await page.goto('/onboarding', {
      waitUntil: 'domcontentloaded',
    })

    expect(response?.ok(), '/onboarding should return 2xx').toBe(true)
    await expect(page.locator('body')).toContainText(
      /What brings you to SlateCamp|LEA path/i,
    )
    await expect(page.locator('body')).toContainText(
      /study|review center|discipline/i,
    )
  })

  for (const path of ['/login', '/register']) {
    test(`authenticated demo auth entry ${path} resolves into dashboard`, async ({
      page,
    }) => {
      await gotoAllowRedirectAbort(page, path)
      await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15000 })
    })
  }

  test('authenticated demo admin login emits a dashboard redirect response', async ({
    request,
  }) => {
    const response = await request.get('/admin/login')
    const body = await response.text()

    expect(response.ok()).toBe(true)
    expect(body).toMatch(/__next-page-redirect/)
    expect(body).toMatch(/\/dashboard/)
  })

  test('demo callback normalizes unsafe and legacy next paths', async ({
    request,
  }) => {
    const unsafe = await request.get('/auth/callback?next=//evil.example', {
      maxRedirects: 0,
    })
    const unsafeLocation = unsafe.headers().location

    expect([307, 308]).toContain(unsafe.status())
    expect(unsafeLocation).toBeTruthy()
    expect(new URL(unsafeLocation!, 'http://localhost').pathname).toBe(
      '/dashboard',
    )

    const legacy = await request.get(
      '/auth/callback?next=/dashboard/heatmap',
      { maxRedirects: 0 },
    )
    const legacyLocation = legacy.headers().location

    expect([307, 308]).toContain(legacy.status())
    expect(legacyLocation).toBeTruthy()
    expect(new URL(legacyLocation!, 'http://localhost').pathname).toBe(
      '/dashboard/analytics',
    )
  })
})
