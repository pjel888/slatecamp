import { expect, test } from '@playwright/test'

/**
 * Visual regression test for the login page.
 *
 * IMPORTANT: Playwright screenshots are platform-specific (OS, browser version,
 * GPU, fonts). The baseline snapshot was generated on macOS (darwin).
 *
 * - Do NOT run this as part of default local test suites unless the environment
 *   is locked (e.g. Docker, consistent CI runner).
 * - To update the baseline after an intentional visual change:
 *     bunx playwright test e2e/visual-login.spec.ts --project=chromium --update-snapshots
 * - For CI, generate baselines on the same Linux container where tests run.
 */

test.describe('Visual regression — login page', () => {
  test('login page matches baseline', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'networkidle' })

    // Wait for the login form to be stable
    await expect(page.locator('text=Welcome back')).toBeVisible()

    await expect(page).toHaveScreenshot('login-page.png', {
      fullPage: true,
      threshold: 0.2,
      maxDiffPixelRatio: 0.02,
    })
  })
})
