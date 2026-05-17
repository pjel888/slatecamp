import { expect } from '@playwright/test'
import {
  authenticatedDemoTest as test,
  demoAuthEnabled,
  gotoAllowRedirectAbort,
} from './support/authenticated-demo'

test.describe('demo-auth wiki learning flow', () => {
  test.describe.configure({ timeout: 240000 })

  test.skip(
    !demoAuthEnabled,
    'Set PLAYWRIGHT_DEMO_AUTH=true to run demo-auth wiki coverage.',
  )

  test('wiki landing and seeded article resolve', async ({ page }) => {
    test.setTimeout(240000)
    const landing = await gotoAllowRedirectAbort(page, '/dashboard/wiki')

    if (landing) {
      expect(landing.ok(), '/dashboard/wiki should return 2xx').toBe(true)
    }
    await expect(
      page.getByRole('heading', { name: /Knowledge Wiki/i }),
    ).toBeVisible()

    const article = await page.goto(
      '/dashboard/wiki/00000000-0000-4000-8000-000000000106',
      { timeout: 180000, waitUntil: 'domcontentloaded' },
    )
    if (article) {
      expect(
        article.ok(),
        '/dashboard/wiki/00000000-0000-4000-8000-000000000106 should return 2xx',
      ).toBe(true)
    }
    await expect(page).toHaveURL(
      /\/dashboard\/wiki\/00000000-0000-4000-8000-000000000106$/,
      {
        timeout: 60000,
      },
    )
    await expect(
      page.getByRole('heading', { name: /^Demo LEA Foundations$/ }).first(),
    ).toBeVisible({ timeout: 60000 })
    await expect(
      page.getByRole('heading', { name: /Core Rule/i }),
    ).toBeVisible({ timeout: 60000 })
  })

  test('missing wiki slug resolves to dashboard not-found UI', async ({ page }) => {
    test.setTimeout(90000)
    const response = await gotoAllowRedirectAbort(
      page,
      '/dashboard/wiki/00000000-0000-4000-8000-00000000ffff',
    )
    expect(response?.ok(), 'missing wiki article id should resolve via not-found UI').toBe(
      true,
    )
    await expect(
      page.getByRole('heading', { name: /Article not found/i }),
    ).toBeVisible({ timeout: 30000 })
  })
})
