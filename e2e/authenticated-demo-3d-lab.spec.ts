import { expect } from '@playwright/test'
import {
  authenticatedDemoTest as test,
  demoAuthEnabled,
  gotoAllowRedirectAbort,
} from './support/authenticated-demo'

test.describe('demo-authenticated 3D Lab', () => {
  test.skip(
    !demoAuthEnabled,
    'Set PLAYWRIGHT_DEMO_AUTH=true to run authenticated demo 3D Lab coverage.',
  )

  test('authenticated demo user can reach /dashboard/3d-lab', async ({
    page,
  }) => {
    test.setTimeout(45000)
    await gotoAllowRedirectAbort(page, '/dashboard/3d-lab')
    await expect(page).toHaveURL(/\/dashboard\/3d-lab$/, { timeout: 15000 })
    await expect(page.locator('body')).toContainText(
      /3D Interactive Lab|interactive modules available/i,
      { timeout: 30000 },
    )
  })
})
