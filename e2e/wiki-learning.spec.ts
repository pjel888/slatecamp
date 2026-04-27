import { expect } from '@playwright/test'
import {
  authenticatedDemoTest as test,
  demoAuthEnabled,
  gotoAllowRedirectAbort,
} from './support/authenticated-demo'

test.describe('demo-auth wiki learning flow', () => {
  test.skip(
    !demoAuthEnabled,
    'Set PLAYWRIGHT_DEMO_AUTH=true to run demo-auth wiki coverage.',
  )

  test('wiki landing and seeded article resolve', async ({ page }) => {
    test.setTimeout(90000)
    const landing = await page.goto('/dashboard/wiki', {
      waitUntil: 'domcontentloaded',
    })

    expect(landing?.ok(), '/dashboard/wiki should return 2xx').toBe(true)
    await expect(
      page.getByRole('heading', { name: /Knowledge Wiki/i }),
    ).toBeVisible()

    await gotoAllowRedirectAbort(page, '/dashboard/wiki/demo-ale-foundations')
    await expect(page).toHaveURL(/\/dashboard\/wiki\/demo-ale-foundations$/, {
      timeout: 30000,
    })
    await expect(page.locator('#wiki-center-pane')).toContainText(
      /Demo ALE Foundations/i,
      { timeout: 30000 },
    )
    await expect(page.locator('#wiki-center-pane')).toContainText(
      /Core Rule/i,
      { timeout: 30000 },
    )
  })

  test('missing wiki slug resolves to dashboard not-found UI', async ({ page }) => {
    test.setTimeout(90000)
    const response = await page.goto('/dashboard/wiki/__missing__', {
      waitUntil: 'domcontentloaded',
      timeout: 90000,
    })
    expect(response?.ok(), 'missing wiki slug should resolve via not-found UI').toBe(
      true,
    )
    await expect(
      page.getByRole('heading', { name: /This page doesn't exist/i }),
    ).toBeVisible({ timeout: 30000 })
  })
})
