import { expect } from '@playwright/test'
import {
  authenticatedDemoTest as test,
  demoAuthEnabled,
  gotoAllowRedirectAbort,
} from './support/authenticated-demo'

test.describe('demo-authenticated privileged portals', () => {
  test.skip(
    !demoAuthEnabled,
    'Set PLAYWRIGHT_DEMO_AUTH=true to run authenticated demo portal coverage.',
  )

  const privilegedRoutes = [
    {
      path: '/admin',
      text: /Content Management|Dashboard|Quick Actions/i,
    },
    {
      path: '/admin/knowledge',
      text: /All Content|New Article|Demo LEA Foundations/i,
    },
    {
      path: '/developer',
      text: /Developer Portal|Internal Docs & Tools/i,
    },
    {
      path: '/developer/tools',
      text: /Dev Tools|Internal tools/i,
    },
    {
      path: '/ceo/financials',
      text: /Financials|Cash on Hand|Monthly P&L/i,
    },
  ] as const

  for (const route of privilegedRoutes) {
    test(`authenticated demo user can reach ${route.path}`, async ({
      page,
    }) => {
      test.setTimeout(150000)
      await gotoAllowRedirectAbort(page, route.path)
      await expect(page).toHaveURL(
        new RegExp(`${route.path.replace(/\//g, '\\/')}$`),
        { timeout: 30000 },
      )
      await expect(page.locator('body')).toContainText(route.text, {
        timeout: 30000,
      })
    })
  }
})
