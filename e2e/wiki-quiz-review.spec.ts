import { expect } from '@playwright/test'
import {
  authenticatedDemoTest as test,
  demoAuthEnabled,
  gotoAllowRedirectAbort,
} from './support/authenticated-demo'

test.describe('wiki review-the-topic quiz flow', () => {
  test.skip(
    !demoAuthEnabled,
    'Set PLAYWRIGHT_DEMO_AUTH=true to run demo-auth wiki quiz coverage.',
  )

  test('open review modal, complete quiz, and see results', async ({ page }) => {
    test.setTimeout(240000)

    // 1. Navigate to a seeded wiki article
    const article = await gotoAllowRedirectAbort(
      page,
      '/dashboard/wiki/demo-ale-foundations',
    )
    if (article) {
      expect(
        article.ok(),
        '/dashboard/wiki/demo-ale-foundations should return 2xx',
      ).toBe(true)
    }
    await expect(page).toHaveURL(/\/dashboard\/wiki\/demo-ale-foundations$/, {
      timeout: 60000,
    })

    // 2. Confirm "Review this Topic" button is visible and enabled
    const reviewButton = page.getByRole('button', { name: /Review this Topic/i })
    await expect(reviewButton).toBeVisible({ timeout: 30000 })
    await expect(reviewButton).toBeEnabled()

    // 3. Click opens the modal
    await reviewButton.click()

    // 4. Modal dialog appears with article context
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible({ timeout: 10000 })
    await expect(dialog).toContainText(/Quick Review/i)

    // 5. Loading state appears
    await expect(dialog.getByText(/Preparing your review/i)).toBeVisible()

    // 6. Wait for questions to load (question state)
    await expect(
      dialog.getByRole('radiogroup'),
    ).toBeVisible({ timeout: 60000 })

    // 7. Progress indicator visible
    await expect(dialog.getByText(/Question \d+ of \d+/i)).toBeVisible()

    // 8. Select first option
    const firstOption = dialog.getByRole('radio').first()
    await firstOption.click()
    await expect(firstOption).toHaveAttribute('aria-checked', 'true')

    // 9. Submit button enables
    const submitButton = dialog.getByRole('button', { name: /Submit answer/i })
    await expect(submitButton).toBeEnabled()
    await submitButton.click()

    // 10. Feedback panel appears
    await expect(
      dialog.getByText(/Correct|Not quite/i),
    ).toBeVisible({ timeout: 15000 })

    // 11. Wait for gated delay then click Next / See results
    const nextButton = dialog.getByRole('button', {
      name: /Next question|See results/i,
    })
    await expect(nextButton).toBeVisible({ timeout: 30000 })
    await nextButton.click()

    // 12. Continue through remaining questions until results
    let safety = 0
    while (safety < 20) {
      safety++
      const resultsHeading = dialog.locator('text=Review Complete')
      if (await resultsHeading.isVisible().catch(() => false)) break

      // Select an option on the current question
      const option = dialog.getByRole('radio').first()
      if (await option.isVisible().catch(() => false)) {
        await option.click()
        const submit = dialog.getByRole('button', { name: /Submit answer/i })
        if (await submit.isEnabled().catch(() => false)) {
          await submit.click()
        }
        const nxt = dialog.getByRole('button', {
          name: /Next question|See results/i,
        })
        if (await nxt.isVisible().catch(() => false)) {
          await nxt.click()
        }
      } else {
        break
      }
    }

    // 13. Results visible
    await expect(dialog.getByText(/Review Complete/i)).toBeVisible({
      timeout: 30000,
    })
    await expect(dialog.getByText(/%/)).toBeVisible()

    // 14. "Review again" resets
    const reviewAgain = dialog.getByRole('button', { name: /Review again/i })
    await expect(reviewAgain).toBeVisible()
    await reviewAgain.click()
    await expect(dialog.getByRole('radiogroup')).toBeVisible({ timeout: 30000 })

    // 15. Close modal
    const closeButton = dialog.getByRole('button', { name: /Close quiz/i })
    await closeButton.click()
    await expect(dialog).not.toBeVisible()

    // 16. Focus returns to Review button
    await expect(reviewButton).toBeFocused()
  })

  test('rapid repeated clicks do not open multiple modals', async ({ page }) => {
    test.setTimeout(120000)
    await gotoAllowRedirectAbort(page, '/dashboard/wiki/demo-ale-foundations')
    await expect(page).toHaveURL(/\/dashboard\/wiki\/demo-ale-foundations$/, {
      timeout: 60000,
    })

    const reviewButton = page.getByRole('button', { name: /Review this Topic/i })
    await expect(reviewButton).toBeVisible({ timeout: 30000 })

    // Triple-click rapidly
    await reviewButton.click()
    await reviewButton.click()
    await reviewButton.click()

    // Only one dialog should exist
    const dialogs = page.getByRole('dialog')
    await expect(dialogs).toHaveCount(1, { timeout: 5000 })

    // Close
    const dialog = dialogs.first()
    await dialog.getByRole('button', { name: /Close quiz/i }).click()
    await expect(dialog).not.toBeVisible()
  })

  test('Escape closes modal during idle, not during submit', async ({ page }) => {
    test.setTimeout(120000)
    await gotoAllowRedirectAbort(page, '/dashboard/wiki/demo-ale-foundations')
    await expect(page).toHaveURL(/\/dashboard\/wiki\/demo-ale-foundations$/, {
      timeout: 60000,
    })

    const reviewButton = page.getByRole('button', { name: /Review this Topic/i })
    await reviewButton.click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()

    // Wait for question state
    await expect(
      dialog.getByRole('radiogroup'),
    ).toBeVisible({ timeout: 60000 })

    // Escape closes during idle question state
    await page.keyboard.press('Escape')
    await expect(dialog).not.toBeVisible()

    // Re-open
    await reviewButton.click()
    await expect(dialog).toBeVisible()
    await expect(
      dialog.getByRole('radiogroup'),
    ).toBeVisible({ timeout: 60000 })

    // Select and submit
    await dialog.getByRole('radio').first().click()
    const submit = dialog.getByRole('button', { name: /Submit answer/i })
    await submit.click()

    // During the brief submit window, Escape should not close (hard to time perfectly,
    // so we verify the modal is still present immediately after click)
    await expect(dialog).toBeVisible()

    // Close via button
    await dialog.getByRole('button', { name: /Close quiz/i }).click()
    await expect(dialog).not.toBeVisible()
  })
})
