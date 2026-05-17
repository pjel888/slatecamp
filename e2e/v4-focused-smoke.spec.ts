import { expect } from '@playwright/test'
import {
  authenticatedDemoTest as test,
  demoAuthEnabled,
  gotoAllowRedirectAbort,
} from './support/authenticated-demo'

test.describe('v4 focused app smoke', () => {
  test.describe.configure({ timeout: 180000 })

  test.skip(
    !demoAuthEnabled,
    'Set PLAYWRIGHT_DEMO_AUTH=true to run v4 focused smoke coverage.',
  )

  test('covers auth dashboard, wiki, quiz, SRS/flash, and global search surfaces', async ({
    page,
  }) => {
    await gotoAllowRedirectAbort(page, '/dashboard')
    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 60000 })
    await expect(page.getByRole('heading', { name: /Dashboard/i })).toBeVisible({
      timeout: 60000,
    })

    await gotoAllowRedirectAbort(page, '/dashboard/wiki')
    await expect(page.getByRole('heading', { name: /Knowledge Wiki/i })).toBeVisible({
      timeout: 60000,
    })
    await expect(page.getByRole('button', { name: /Search/i }).first()).toBeVisible({
      timeout: 60000,
    })

    await gotoAllowRedirectAbort(page, '/dashboard/quiz')
    await expect(page).toHaveURL(/\/dashboard\/quiz$/, { timeout: 60000 })
    await expect(page.locator('body')).toContainText(/Quiz|Practice/i, {
      timeout: 60000,
    })

    await gotoAllowRedirectAbort(page, '/dashboard/flash')
    await expect(page).toHaveURL(/\/dashboard\/flash$/, { timeout: 60000 })
    await expect(page.locator('body')).toContainText(/Flash|Cards|Review/i, {
      timeout: 60000,
    })
  })
})
